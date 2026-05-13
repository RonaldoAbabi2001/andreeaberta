'use client'
import { useState, useEffect } from 'react'

const TOKEN = 'evolis2026secret'
const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', text: '#1C1C1C' }

const EMPTY = { nume: '', pret: '', durata: 60 }

function ServiciuModal({ serviciu, onClose, onSaved }) {
  const isNew = !serviciu?.id
  const [form, setForm] = useState(serviciu ? { nume: serviciu.nume, pret: serviciu.pret, durata: serviciu.durata } : { ...EMPTY })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.nume.trim()) return alert('Numele serviciului este obligatoriu.')
    setSaving(true)
    const res = await fetch('/api/admin/servicii', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': TOKEN },
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

  async function load() {
    const res = await fetch('/api/admin/servicii', { headers: { 'x-admin-token': TOKEN } })
    const data = await res.json()
    setServicii(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteServiciu(id) {
    await fetch('/api/admin/servicii', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-token': TOKEN }, body: JSON.stringify({ id }) })
    setConfirmDelete(null)
    load()
  }

  const totalVenit = servicii.reduce((sum, s) => sum + Number(s.pret || 0), 0)
  const durataMedie = servicii.length ? Math.round(servicii.reduce((sum, s) => sum + Number(s.durata || 0), 0) / servicii.length) : 0

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: '36px', height: '36px', border: `3px solid #F7EFE5`, borderTopColor: s.ruby, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'normal', margin: 0, color: s.text }}>Servicii</h2>
          <p style={{ fontSize: '12px', color: '#999', margin: '3px 0 0' }}>Listă servicii salon EVOLIS · {servicii.length} servicii active</p>
        </div>
        <button onClick={() => { setEditServiciu(null); setShowModal(true) }}
          style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(155,27,48,0.3)', fontFamily: 'Georgia, serif' }}>
          + Serviciu nou
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
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

      {/* Tabel */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Header tabel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px', padding: '8px 20px', background: '#FAFAF8', borderBottom: '1px solid #F0EAE0' }}>
          {['DENUMIRE SERVICIU', 'PREȚ', 'DURATĂ', ''].map(h => (
            <div key={h} style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '0.8px', padding: '4px 0' }}>{h}</div>
          ))}
        </div>

        {servicii.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#AAA' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💅</div>
            <div>Niciun serviciu. Apasă "+ Serviciu nou" pentru a adăuga.</div>
          </div>
        ) : servicii.map((serv, i) => (
          <div key={serv.id}
            style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px', padding: '0 20px', borderBottom: i < servicii.length - 1 ? '1px solid #F7F2EC' : 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FDF8F3'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

            <div style={{ padding: '14px 0', fontSize: '14px', color: s.text }}>{serv.nume}</div>

            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: s.ruby }}>{serv.pret}</span>
              <span style={{ fontSize: '12px', color: '#AAA', marginLeft: '4px' }}>RON</span>
            </div>

            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#555' }}>{serv.durata}</span>
              <span style={{ fontSize: '12px', color: '#AAA', marginLeft: '4px' }}>min</span>
            </div>

            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

        {servicii.length > 0 && (
          <div style={{ padding: '10px 20px', background: '#FAFAF8', borderTop: '1px solid #F0EAE0', fontSize: '12px', color: '#AAA' }}>
            {servicii.length} servicii active · Prețurile se aplică automat la adăugarea programărilor
          </div>
        )}
      </div>

      {showModal && (
        <ServiciuModal
          serviciu={editServiciu}
          onClose={() => { setShowModal(false); setEditServiciu(null) }}
          onSaved={() => { setShowModal(false); setEditServiciu(null); load() }}
        />
      )}
    </div>
  )
}
