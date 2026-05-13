'use client'
import { useState, useEffect } from 'react'

const TOKEN = 'evolis2026secret'
const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', text: '#1C1C1C' }

const CATEGORII = [
  { id: 'baza',        label: 'Bază',          color: '#9B1B30', bg: '#FDF2F4' },
  { id: 'top',         label: 'Top',            color: '#B8860B', bg: '#FFFBEA' },
  { id: 'rubber_base', label: 'Rubber Base',    color: '#6D28D9', bg: '#F5F3FF' },
  { id: 'gel',         label: 'Gel',            color: '#0369A1', bg: '#EFF6FF' },
  { id: 'polygel',     label: 'Polygel',        color: '#BE185D', bg: '#FDF2F8' },
  { id: 'primer',      label: 'Primer',         color: '#C2410C', bg: '#FFF7ED' },
  { id: 'degresant',   label: 'Degresant/IPA',  color: '#065F46', bg: '#ECFDF5' },
  { id: 'accesoriu',   label: 'Accesoriu',      color: '#374151', bg: '#F9FAFB' },
  { id: 'altele',      label: 'Altele',         color: '#6B7280', bg: '#F3F4F6' },
]

const CAT_MAP = Object.fromEntries(CATEGORII.map(c => [c.id, c]))

const EMPTY_FORM = {
  marca: '', nume: '', categorie: 'baza', volum_ml: '', pret_achizitie: '',
  furnizor_link: '', inci: '', observatii: '', stoc_bucati: 1,
}

function CatBadge({ id, small }) {
  const cat = CAT_MAP[id] || { label: id || '—', color: '#6B7280', bg: '#F3F4F6' }
  return (
    <span style={{
      background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33`,
      borderRadius: '20px', padding: small ? '2px 8px' : '3px 10px',
      fontSize: small ? '10px' : '11px', fontWeight: 'bold', letterSpacing: '0.5px',
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {cat.label}
    </span>
  )
}

function StocBadge({ n }) {
  const color = n === 0 ? '#EF4444' : n === 1 ? '#F59E0B' : '#10B981'
  return (
    <span style={{ background: color + '18', color, border: `1px solid ${color}40`, borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}>
      {n === 0 ? 'Epuizat' : `${n} buc`}
    </span>
  )
}

function ProdusDraer({ produs, onClose, onSaved }) {
  const isNew = !produs?.id
  const [form, setForm] = useState(produs ? {
    marca: produs.marca || '', nume: produs.nume || '', categorie: produs.categorie || 'baza',
    volum_ml: produs.volum_ml || '', pret_achizitie: produs.pret_achizitie || '',
    furnizor_link: produs.furnizor_link || '', inci: produs.inci || '',
    observatii: produs.observatii || '', stoc_bucati: produs.stoc_bucati ?? 1,
  } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('general')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.nume.trim()) return alert('Numele produsului este obligatoriu.')
    setSaving(true)
    const method = isNew ? 'POST' : 'PATCH'
    const body = isNew ? form : { ...form, id: produs.id }
    const res = await fetch('/api/admin/produse', {
      method, headers: { 'Content-Type': 'application/json', 'x-admin-token': TOKEN },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) onSaved(data)
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid #E0D0C0', borderRadius: '10px',
    padding: '10px 13px', fontSize: '14px', outline: 'none',
    background: 'white', fontFamily: 'Georgia, serif', color: s.text,
    transition: 'border-color 0.2s',
  }
  const labelStyle = { fontSize: '11px', color: '#999', letterSpacing: '0.8px', fontWeight: 'bold', marginBottom: '4px', display: 'block' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', maxWidth: '100vw',
        background: '#F8F4F0', zIndex: 301, overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, padding: '20px 24px', color: 'white', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '1px', marginBottom: '3px' }}>
                {isNew ? 'PRODUS NOU' : 'EDITARE PRODUS'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'normal' }}>
                {form.marca ? `${form.marca} — ` : ''}{form.nume || 'Fără nume'}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '16px' }}>
            {[['general', 'General'], ['inci', 'INCI & Chimie'], ['stoc', 'Stoc']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background: tab === id ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: tab === id ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                color: 'white', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'Georgia, serif',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {tab === 'general' && (
            <>
              {/* Categorie */}
              <div>
                <label style={labelStyle}>CATEGORIE</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CATEGORII.map(cat => (
                    <button key={cat.id} onClick={() => set('categorie', cat.id)} style={{
                      background: form.categorie === cat.id ? cat.color : 'white',
                      color: form.categorie === cat.id ? 'white' : cat.color,
                      border: `1.5px solid ${cat.color}`,
                      borderRadius: '20px', padding: '5px 12px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 'bold', transition: 'all 0.15s',
                    }}>{cat.label}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>MARCĂ</label>
                  <input value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="ex: AMMA" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>VOLUM (ml)</label>
                  <input value={form.volum_ml} onChange={e => set('volum_ml', e.target.value)} placeholder="ex: 15" type="number" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>NUME PRODUS *</label>
                <input value={form.nume} onChange={e => set('nume', e.target.value)} placeholder="ex: Aqua The Base Coat" style={{ ...inputStyle, borderColor: form.nume ? '#E0D0C0' : s.ruby }} />
              </div>

              <div>
                <label style={labelStyle}>PREȚ ACHIZIȚIE (RON)</label>
                <input value={form.pret_achizitie} onChange={e => set('pret_achizitie', e.target.value)} placeholder="ex: 50" type="number" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>LINK FURNIZOR</label>
                <input value={form.furnizor_link} onChange={e => set('furnizor_link', e.target.value)} placeholder="https://anko.ro/..." style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>OBSERVAȚII</label>
                <textarea value={form.observatii} onChange={e => set('observatii', e.target.value)} placeholder="Note despre produs..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </>
          )}

          {tab === 'inci' && (
            <div>
              <label style={labelStyle}>INCI COMPLET</label>
              <textarea
                value={form.inci} onChange={e => set('inci', e.target.value)}
                placeholder="Acrylates Copolymer, Isopropyl Titanium Triisostearate, ..."
                rows={16} style={{ ...inputStyle, resize: 'vertical', fontSize: '12px', lineHeight: '1.6' }}
              />
              <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                Copiază ingredientele de pe etichetă exact cum apar. Claude le va analiza automat.
              </p>
            </div>
          )}

          {tab === 'stoc' && (
            <div>
              <label style={labelStyle}>BUCĂȚI ÎN STOC</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => set('stoc_bucati', Math.max(0, (form.stoc_bucati || 0) - 1))}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${s.ruby}`, background: 'white', color: s.ruby, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>−</button>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: s.text, minWidth: '50px', textAlign: 'center' }}>{form.stoc_bucati}</span>
                <button onClick={() => set('stoc_bucati', (form.stoc_bucati || 0) + 1)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${s.gold}`, background: 'white', color: s.gold, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
              </div>
              {!isNew && produs?.barcode && (
                <div style={{ marginTop: '24px', background: 'white', borderRadius: '14px', padding: '16px', border: '1.5px solid #E0D0C0' }}>
                  <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.8px', marginBottom: '10px' }}>COD PRODUS</div>
                  <div style={{ fontFamily: 'Courier New, monospace', fontSize: '18px', letterSpacing: '3px', color: s.text, marginBottom: '8px' }}>{produs.barcode}</div>
                  <button onClick={() => navigator.clipboard.writeText(produs.barcode)}
                    style={{ background: s.nude, border: `1px solid ${s.gold}`, borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', color: s.ruby }}>
                    📋 Copiază cod
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', background: 'white', borderTop: '1px solid #F0EAE0', display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #E0D0C0', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#888' }}>Anulează</button>
          <button onClick={save} disabled={saving} style={{
            flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
            background: saving ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`,
            color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold',
          }}>{saving ? 'Se salvează...' : isNew ? 'Adaugă produs' : 'Salvează modificările'}</button>
        </div>
      </div>
    </>
  )
}

export default function ProdusTab() {
  const [produse, setProduse] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('toate')
  const [search, setSearch] = useState('')
  const [showDraer, setShowDraer] = useState(false)
  const [editProdus, setEditProdus] = useState(null)

  async function load() {
    const res = await fetch('/api/admin/produse', { headers: { 'x-admin-token': TOKEN } })
    const data = await res.json()
    setProduse(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteProdus(id) {
    if (!confirm('Ștergi produsul din stoc?')) return
    await fetch('/api/admin/produse', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-token': TOKEN },
      body: JSON.stringify({ id }),
    })
    load()
  }

  async function updateStoc(id, delta) {
    const produs = produse.find(p => p.id === id)
    if (!produs) return
    const stoc_bucati = Math.max(0, (produs.stoc_bucati || 0) + delta)
    await fetch('/api/admin/produse', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': TOKEN },
      body: JSON.stringify({ id, stoc_bucati, stoc_only: true }),
    })
    setProduse(prev => prev.map(p => p.id === id ? { ...p, stoc_bucati } : p))
  }

  const filtered = produse.filter(p => {
    const matchCat = filter === 'toate' || p.categorie === filter
    const matchSearch = !search || p.nume?.toLowerCase().includes(search.toLowerCase()) || p.marca?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const totalValoare = produse.reduce((sum, p) => sum + ((p.pret_achizitie || 0) * (p.stoc_bucati || 0)), 0)
  const epuizate = produse.filter(p => (p.stoc_bucati || 0) === 0).length
  const categoriiActive = [...new Set(produse.map(p => p.categorie).filter(Boolean))].length

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
      <div style={{ width: '36px', height: '36px', border: `3px solid ${s.nude}`, borderTopColor: s.ruby, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 'normal', margin: 0, color: s.text }}>Stoc & Produse</h2>
          <p style={{ fontSize: '13px', color: '#999', margin: '4px 0 0' }}>Inventar salon EVOLIS</p>
        </div>
        <button onClick={() => { setEditProdus(null); setShowDraer(true) }}
          className="admin-add-desktop"
          style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '50px', padding: '10px 22px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 16px rgba(155,27,48,0.3)' }}>
          + Adaugă produs
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Produse active', value: produse.length, icon: '🧴', color: s.ruby },
          { label: 'Valoare stoc', value: `${totalValoare.toFixed(0)} RON`, icon: '💰', color: '#065F46' },
          { label: 'Epuizate', value: epuizate, icon: '⚠️', color: epuizate > 0 ? '#C2410C' : '#6B7280' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `3px solid ${stat.color}` }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.5px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '18px' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Caută produs sau marcă..."
          style={{ width: '100%', border: '1.5px solid #E0D0C0', borderRadius: '10px', padding: '9px 13px', fontSize: '14px', outline: 'none', fontFamily: 'Georgia, serif', marginBottom: '12px', background: '#FAFAFA' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('toate')} style={{
            background: filter === 'toate' ? s.ruby : 'transparent',
            color: filter === 'toate' ? 'white' : '#555',
            border: `1.5px solid ${filter === 'toate' ? s.ruby : '#E0D0C0'}`,
            borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
          }}>Toate ({produse.length})</button>
          {CATEGORII.filter(cat => produse.some(p => p.categorie === cat.id)).map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
              background: filter === cat.id ? cat.color : 'transparent',
              color: filter === cat.id ? 'white' : cat.color,
              border: `1.5px solid ${cat.color}`,
              borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
            }}>{cat.label} ({produse.filter(p => p.categorie === cat.id).length})</button>
          ))}
        </div>
      </div>

      {/* Grid produse */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧴</div>
          <div style={{ fontSize: '16px', marginBottom: '6px' }}>Niciun produs</div>
          <div style={{ fontSize: '13px' }}>{produse.length === 0 ? 'Adaugă primul produs în stoc.' : 'Niciun produs pentru filtrul selectat.'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filtered.map(p => {
            const cat = CAT_MAP[p.categorie] || { color: '#6B7280', bg: '#F3F4F6', label: p.categorie || '—' }
            const stocColor = (p.stoc_bucati || 0) === 0 ? '#EF4444' : (p.stoc_bucati || 0) === 1 ? '#F59E0B' : '#10B981'
            return (
              <div key={p.id} style={{ background: 'white', borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)' }}>

                {/* Color accent top bar */}
                <div style={{ height: '4px', background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)` }} />

                <div style={{ padding: '16px' }}>
                  {/* Top row: categorie + stoc */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <CatBadge id={p.categorie} small />
                    <StocBadge n={p.stoc_bucati || 0} />
                  </div>

                  {/* Marca + Nume */}
                  {p.marca && <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.8px', fontWeight: 'bold', marginBottom: '2px' }}>{p.marca.toUpperCase()}</div>}
                  <div style={{ fontSize: '16px', color: s.text, fontWeight: 'normal', lineHeight: '1.3', marginBottom: '12px' }}>{p.nume}</div>

                  {/* Detalii */}
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#777', marginBottom: '14px' }}>
                    {p.volum_ml && <span>🧪 {p.volum_ml}ml</span>}
                    {p.pret_achizitie && <span>💰 {p.pret_achizitie} RON</span>}
                  </div>

                  {/* Barcode */}
                  {p.barcode && (
                    <div style={{ background: '#F8F8F8', borderRadius: '8px', padding: '7px 10px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', letterSpacing: '1px', color: '#555' }}>{p.barcode}</span>
                      <button onClick={() => navigator.clipboard.writeText(p.barcode)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '0 0 0 6px' }} title="Copiază">📋</button>
                    </div>
                  )}

                  {/* Stoc controls + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => updateStoc(p.id, -1)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1.5px solid ${s.ruby}`, background: 'white', color: s.ruby, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', color: stocColor, minWidth: '20px', textAlign: 'center' }}>{p.stoc_bucati || 0}</span>
                      <button onClick={() => updateStoc(p.id, +1)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1.5px solid ${s.gold}`, background: 'white', color: '#B8860B', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditProdus(p); setShowDraer(true) }}
                        style={{ background: s.nude, border: `1px solid ${s.gold}`, borderRadius: '8px', padding: '5px 11px', cursor: 'pointer', fontSize: '12px', color: s.ruby }}>✏️</button>
                      <button onClick={() => deleteProdus(p.id)}
                        style={{ background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '5px 11px', cursor: 'pointer', fontSize: '12px', color: '#EF4444' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Drawer */}
      {showDraer && (
        <ProdusDraer
          produs={editProdus}
          onClose={() => { setShowDraer(false); setEditProdus(null) }}
          onSaved={() => { setShowDraer(false); setEditProdus(null); load() }}
        />
      )}

      {/* FAB mobil */}
      <button onClick={() => { setEditProdus(null); setShowDraer(true) }}
        className="admin-fab-desktop"
        style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: `linear-gradient(135deg, ${s.gold}, #F0DC8A, ${s.gold})`, border: 'none', cursor: 'pointer', fontSize: '28px', color: '#1C1C1C', boxShadow: '0 6px 24px rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        +
      </button>
    </div>
  )
}
