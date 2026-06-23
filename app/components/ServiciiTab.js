'use client'
import { useState, useEffect } from 'react'

function getAdminToken() { return typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : '' }
const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', text: '#1C1C1C' }

function GaleriePanel({ serviciu, onClose }) {
  const [photos, setPhotos] = useState([])
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/servicii-galerie?serviciu_id=${serviciu.id}`, { headers: { 'x-admin-token': getAdminToken() } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setPhotos(d); setLoading(false) })
  }, [serviciu.id])

  async function addPhoto() {
    if (!url.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/servicii-galerie', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify({ serviciu_id: serviciu.id, url: url.trim() })
    })
    const data = await res.json()
    setPhotos(prev => [...prev, { id: data.id, serviciu_id: serviciu.id, url: url.trim(), titlu: '' }])
    setUrl('')
    setAdding(false)
  }

  async function deletePhoto(id) {
    await fetch('/api/admin/servicii-galerie', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify({ id })
    })
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const inp = { width: '100%', border: '1.5px solid #E0D0C0', borderRadius: '10px', padding: '10px 13px', fontSize: '13px', outline: 'none', background: 'white', fontFamily: 'Georgia, serif', color: s.text, boxSizing: 'border-box' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '560px', maxWidth: '95vw', maxHeight: '85vh', background: '#F8F4F0', zIndex: 401, borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, padding: '18px 22px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.7, letterSpacing: '1.5px', marginBottom: '2px' }}>GALERIE EXEMPLE</div>
            <div style={{ fontSize: '16px', fontFamily: 'Georgia, serif' }}>{serviciu.nume}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', color: 'white', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          {/* Add URL */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', color: '#AAA', display: 'block', marginBottom: '6px' }}>ADAUGĂ IMAGINE (URL)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPhoto()}
                placeholder="https://... (link imagine publică)" style={{ ...inp, flex: 1 }} />
              <button onClick={addPhoto} disabled={adding || !url.trim()}
                style={{ background: adding ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', cursor: adding ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {adding ? '...' : '+ Adaugă'}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#BBB', marginTop: '5px' }}>Poți folosi link-uri de pe Google Drive, Instagram, orice URL public.</p>
          </div>

          {/* Preview URL în timp real */}
          {url.trim() && (
            <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', maxHeight: '200px' }}>
              <img src={url.trim()} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none' }} />
            </div>
          )}

          {/* Grid poze existente */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#AAA' }}>Se încarcă...</div>
          ) : photos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#CCC' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📷</div>
              <div style={{ fontSize: '13px' }}>Nicio imagine adăugată încă.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {photos.map(ph => (
                <div key={ph.id} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={ph.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button onClick={() => deletePhoto(ph.id)}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', color: 'white', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const EMPTY = { nume: '', pret: '', durata: 60, tip: 'principal' }

function ServiciuModal({ serviciu, onClose, onSaved, tipDefault = 'principal' }) {
  const isNew = !serviciu?.id
  const [form, setForm] = useState(serviciu ? { nume: serviciu.nume, pret: serviciu.pret, durata: serviciu.durata, tip: serviciu.tip || 'principal' } : { ...EMPTY, tip: tipDefault })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.nume.trim()) return alert('Numele serviciului este obligatoriu.')
    setSaving(true)
    const res = await fetch('/api/admin/servicii', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify(isNew ? form : { ...form, id: serviciu.id }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) onSaved()
  }

  const inp = { width: '100%', border: '1.5px solid #E0D0C0', borderRadius: '10px', padding: '10px 13px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Georgia, serif', color: s.text }
  const lbl = { fontSize: '11px', color: '#999', letterSpacing: '0.8px', fontWeight: 'bold', marginBottom: '4px', display: 'block' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '460px', maxWidth: '95vw', background: '#F8F4F0', zIndex: 401, borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, padding: '18px 22px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '1px' }}>{isNew ? 'SERVICIU NOU' : 'EDITARE SERVICIU'}</div>
            <div style={{ fontSize: '17px', marginTop: '2px' }}>{form.nume || 'Fără nume'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', color: 'white', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>DENUMIRE SERVICIU *</label>
            <input value={form.nume} onChange={e => set('nume', e.target.value)} placeholder="ex: Construcție Gel/Polygel 1-2" style={{ ...inp, borderColor: form.nume ? '#E0D0C0' : s.ruby }} autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>PREȚ (RON)</label>
              <input value={form.pret} onChange={e => set('pret', e.target.value)} placeholder="ex: 165" type="number" min="0" style={inp} />
            </div>
            <div>
              <label style={lbl}>DURATĂ (minute)</label>
              <input value={form.durata} onChange={e => set('durata', e.target.value)} placeholder="ex: 90" type="number" min="5" style={inp} />
            </div>
          </div>

          <div>
            <label style={lbl}>TIP SERVICIU</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{v:'principal',l:'Principal (baza)'},{v:'extra',l:'Extra / Design'}].map(opt => (
                <div key={opt.v} onClick={() => set('tip', opt.v)}
                  style={{ flex:1, padding:'10px', borderRadius:'10px', textAlign:'center', cursor:'pointer', fontSize:'12px', fontWeight:'bold',
                    background: form.tip === opt.v ? (opt.v === 'principal' ? s.ruby : '#7C3AED') : 'white',
                    color: form.tip === opt.v ? 'white' : '#888',
                    border: `1.5px solid ${form.tip === opt.v ? (opt.v === 'principal' ? s.ruby : '#7C3AED') : '#E0D0C0'}` }}>
                  {opt.l}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {form.nume && (
            <div style={{ background: s.nude, borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: s.text }}>{form.nume}</span>
              <div style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                {form.pret && <span style={{ color: s.ruby, fontWeight: 'bold' }}>{form.pret} RON</span>}
                {form.durata && <span style={{ color: '#888' }}>{form.durata} min</span>}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #E0D0C0', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#888' }}>Anulează</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: saving ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            {saving ? 'Se salvează...' : isNew ? 'Adaugă serviciu' : 'Salvează'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function ServiciiTab() {
  const [servicii, setServicii] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editServiciu, setEditServiciu] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [galerieServiciu, setGalerieServiciu] = useState(null)
  const [showModalTip, setShowModalTip] = useState('principal')

  async function load() {
    const res = await fetch('/api/admin/servicii', { headers: { 'x-admin-token': getAdminToken() } })
    const data = await res.json()
    setServicii(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteServiciu(id) {
    await fetch('/api/admin/servicii', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() }, body: JSON.stringify({ id }) })
    setConfirmDelete(null)
    load()
  }

  const totalVenit = servicii.reduce((sum, s) => sum + Number(s.pret || 0), 0)
  const durataMedie = servicii.length ? Math.round(servicii.reduce((sum, s) => sum + Number(s.durata || 0), 0) / servicii.length) : 0

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: '36px', height: '36px', border: `3px solid #F7EFE5`, borderTopColor: s.ruby, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>

  const principale = servicii.filter(s => (s.tip || 'principal') === 'principal')
  const extraList  = servicii.filter(s => s.tip === 'extra')

  function renderTabel(list, accentColor = s.ruby) {
    return (
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px', padding: '8px 20px', background: '#FAFAF8', borderBottom: '1px solid #F0EAE0' }}>
          {['DENUMIRE SERVICIU', 'PREȚ', 'DURATĂ', ''].map(h => (
            <div key={h} style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '0.8px', padding: '4px 0' }}>{h}</div>
          ))}
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#AAA' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💅</div>
            <div>Niciun serviciu în această categorie.</div>
          </div>
        ) : list.map((serv, i) => (
          <div key={serv.id}
            style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px', padding: '0 20px', borderBottom: i < list.length - 1 ? '1px solid #F7F2EC' : 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FDF8F3'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

            <div style={{ padding: '14px 0', fontSize: '14px', color: s.text }}>{serv.nume}</div>

            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: accentColor }}>{serv.pret}</span>
              <span style={{ fontSize: '12px', color: '#AAA', marginLeft: '4px' }}>RON</span>
            </div>

            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#555' }}>{serv.durata}</span>
              <span style={{ fontSize: '12px', color: '#AAA', marginLeft: '4px' }}>min</span>
            </div>

            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => setGalerieServiciu(serv)}
                style={{ background: '#F0F4FF', border: '1px solid #C7D2FE', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: '#4F46E5' }} title="Galerie exemple">📷</button>
              <button onClick={() => { setEditServiciu(serv); setShowModal(true) }}
                style={{ background: s.nude, border: `1px solid ${s.gold}`, borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: s.ruby }}>✏️</button>
              {confirmDelete === serv.id ? (
                <>
                  <button onClick={() => deleteServiciu(serv.id)} style={{ background: '#EF4444', border: 'none', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', fontSize: '11px', color: 'white', fontWeight: 'bold' }}>Da</button>
                  <button onClick={() => setConfirmDelete(null)} style={{ background: '#EEE', border: 'none', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', fontSize: '11px', color: '#666' }}>Nu</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(serv.id)} style={{ background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: '#EF4444' }}>🗑️</button>
              )}
            </div>
          </div>
        ))}

        {list.length > 0 && (
          <div style={{ padding: '10px 20px', background: '#FAFAF8', borderTop: '1px solid #F0EAE0', fontSize: '12px', color: '#AAA' }}>
            {list.length} servicii active · Prețurile se aplică automat la adăugarea programărilor
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'normal', margin: 0, color: s.text }}>Servicii</h2>
        <p style={{ fontSize: '12px', color: '#999', margin: '3px 0 0' }}>Listă servicii salon EVOLIS · {servicii.length} servicii active</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Servicii active', value: servicii.length, color: s.ruby },
          { label: 'Preț mediu', value: servicii.length ? `${Math.round(totalVenit / servicii.length)} RON` : '—', color: '#065F46' },
          { label: 'Durată medie', value: `${durataMedie} min`, color: '#0369A1' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: `3px solid ${stat.color}` }}>
            <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 'bold' }}>{stat.label.toUpperCase()}</div>
            <div style={{ fontSize: '24px', fontWeight: '500', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Secțiunea Principale */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <div>
            <h3 style={{ fontSize:'16px', fontWeight:'bold', color:s.ruby, margin:0 }}>Servicii Principale</h3>
            <p style={{ fontSize:'11px', color:'#AAA', margin:'2px 0 0' }}>Apar la pasul 2 în rezervare</p>
          </div>
          <button onClick={() => { setShowModalTip('principal'); setEditServiciu(null); setShowModal(true) }}
            style={{ background:`linear-gradient(135deg,${s.ruby},#7A1525)`, color:'white', border:'none', borderRadius:'10px', padding:'8px 16px', cursor:'pointer', fontSize:'12px', fontWeight:'bold' }}>
            + Adaugă
          </button>
        </div>
        {renderTabel(principale)}
      </div>

      {/* Secțiunea Extra/Design */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <div>
            <h3 style={{ fontSize:'16px', fontWeight:'bold', color:'#7C3AED', margin:0 }}>Servicii Extra / Design</h3>
            <p style={{ fontSize:'11px', color:'#AAA', margin:'2px 0 0' }}>Apar la pasul 3 în rezervare (opțional)</p>
          </div>
          <button onClick={() => { setShowModalTip('extra'); setEditServiciu(null); setShowModal(true) }}
            style={{ background:'linear-gradient(135deg,#7C3AED,#5B21B6)', color:'white', border:'none', borderRadius:'10px', padding:'8px 16px', cursor:'pointer', fontSize:'12px', fontWeight:'bold' }}>
            + Adaugă Extra
          </button>
        </div>
        {renderTabel(extraList, '#7C3AED')}
      </div>

      {showModal && (
        <ServiciuModal
          serviciu={editServiciu}
          onClose={() => { setShowModal(false); setEditServiciu(null) }}
          onSaved={() => { setShowModal(false); setEditServiciu(null); load() }}
          tipDefault={showModalTip}
        />
      )}

      {galerieServiciu && (
        <GaleriePanel serviciu={galerieServiciu} onClose={() => setGalerieServiciu(null)} />
      )}
    </div>
  )
}
