'use client'
import { useState, useEffect } from 'react'

function getAdminToken() { return typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : '' }
const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', text: '#1C1C1C' }
const inp = { width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: 'white', fontFamily: 'Georgia, serif', color: s.text, boxSizing: 'border-box' }

export default function MaterialeUtilizate({ programareId, produse = [], onChange }) {
  const isDraft = !programareId
  const [materiale, setMateriale] = useState([])
  const [search, setSearch] = useState('')
  const [showNou, setShowNou] = useState(false)
  const [nou, setNou] = useState({ nume: '', marca: '', categorie: '' })
  const [savingNou, setSavingNou] = useState(false)

  useEffect(() => {
    if (!isDraft) {
      fetch(`/api/admin/materiale?programare_id=${programareId}`, { headers: { 'x-admin-token': getAdminToken() } })
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setMateriale(d) })
    }
  }, [programareId])

  useEffect(() => {
    if (isDraft && onChange) onChange(materiale)
  }, [materiale])

  const results = search.length >= 2
    ? produse.filter(p => {
        const q = search.toLowerCase()
        return p.nume?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q)
      }).slice(0, 6)
    : []

  async function addDinStoc(produs) {
    const item = { produs_id: produs.id, produs_nume: produs.nume, marca: produs.marca || '', cantitate: 1 }
    if (isDraft) {
      setMateriale(prev => [...prev, { ...item, id: Date.now() + Math.random() }])
    } else {
      const res = await fetch('/api/admin/materiale', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
        body: JSON.stringify({ programare_id: programareId, ...item })
      })
      const data = await res.json()
      setMateriale(prev => [...prev, { ...item, id: data.id }])
    }
    setSearch('')
  }

  async function remove(id) {
    if (!isDraft) {
      await fetch('/api/admin/materiale', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
        body: JSON.stringify({ id })
      })
    }
    setMateriale(prev => prev.filter(m => m.id !== id))
  }

  async function salveazaProdusNou() {
    if (!nou.nume.trim()) return
    setSavingNou(true)
    const res = await fetch('/api/admin/produse', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify({ nume: nou.nume, marca: nou.marca, categorie: nou.categorie, stoc_bucati: 0, stoc_minim: 3 })
    })
    const data = await res.json()
    const item = { produs_id: data.id, produs_nume: nou.nume, marca: nou.marca || '', cantitate: 1 }
    if (isDraft) {
      setMateriale(prev => [...prev, { ...item, id: Date.now() + Math.random() }])
    } else {
      const res2 = await fetch('/api/admin/materiale', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
        body: JSON.stringify({ programare_id: programareId, ...item })
      })
      const d2 = await res2.json()
      setMateriale(prev => [...prev, { ...item, id: d2.id }])
    }
    setNou({ nume: '', marca: '', categorie: '' })
    setShowNou(false)
    setSavingNou(false)
  }

  return (
    <div style={{ marginTop: '4px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#777' }}>
        Materiale utilizate
      </label>

      {/* CÄƒutare din stoc */}
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="CautÄƒ produs din stoc..."
          style={{ ...inp }}
        />
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.13)', zIndex: 300, border: '1px solid #EDE4DC', marginTop: '4px', overflow: 'hidden' }}>
            {results.map(p => (
              <button key={p.id} type="button" onMouseDown={() => addDinStoc(p)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #F5EEE8' }}
                onMouseEnter={e => e.currentTarget.style.background = s.nude}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <span style={{ fontSize: '13px', color: s.text }}>{p.nume}</span>
                  {p.marca && <span style={{ fontSize: '11px', color: '#AAA', marginLeft: '6px' }}>{p.marca}</span>}
                </div>
                <span style={{ fontSize: '11px', color: '#BBB' }}>stoc: {p.stoc_bucati ?? 'â€”'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista materiale adÄƒugate */}
      {materiale.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          {materiale.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: s.nude, borderRadius: '10px', padding: '8px 12px' }}>
              <div>
                <span style={{ fontSize: '13px', color: s.text }}>{m.produs_nume}</span>
                {m.marca && <span style={{ fontSize: '11px', color: '#AAA', marginLeft: '6px' }}>{m.marca}</span>}
              </div>
              <button type="button" onClick={() => remove(m.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCC', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}>âœ•</button>
            </div>
          ))}
        </div>
      )}

      {/* AdaugÄƒ produs nou */}
      {!showNou ? (
        <button type="button" onClick={() => setShowNou(true)}
          style={{ background: 'none', border: `1.5px dashed #D0C0B0`, borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px', color: '#AAA', width: '100%', fontFamily: 'Georgia, serif' }}>
          + AdaugÄƒ produs nou Ã®n baza de date
        </button>
      ) : (
        <div style={{ background: '#FDF8F4', border: '1.5px solid #E8DDD0', borderRadius: '12px', padding: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '10px' }}>PRODUS NOU</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input value={nou.nume} onChange={e => setNou({ ...nou, nume: e.target.value })} placeholder="Denumire produs *" style={{ ...inp, borderColor: nou.nume ? '#E8DDD0' : s.ruby }} autoFocus />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input value={nou.marca} onChange={e => setNou({ ...nou, marca: e.target.value })} placeholder="MarcÄƒ" style={inp} />
              <input value={nou.categorie} onChange={e => setNou({ ...nou, categorie: e.target.value })} placeholder="Categorie" style={inp} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={salveazaProdusNou} disabled={savingNou || !nou.nume.trim()}
                style={{ flex: 2, background: savingNou ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '10px', padding: '9px', cursor: savingNou ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                {savingNou ? 'Se salveazÄƒ...' : 'SalveazÄƒ È™i adaugÄƒ'}
              </button>
              <button type="button" onClick={() => { setShowNou(false); setNou({ nume: '', marca: '', categorie: '' }) }}
                style={{ flex: 1, background: 'white', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px', cursor: 'pointer', fontSize: '13px', color: '#888' }}>
                RenunÈ›Äƒ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
