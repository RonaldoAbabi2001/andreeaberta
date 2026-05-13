'use client'
import { useState, useEffect, useRef } from 'react'

const TOKEN = 'evolis2026secret'

// Code128B minimal encoder — pure JS, no dependencies
const C128B_PATTERNS = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
  [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
  [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
  [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
  [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
  [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
  [2,1,1,2,3,2],
]
const START_B = 104, STOP = 106
const STOP_BARS = [2,3,3,1,1,1,2]

function generateCode128B(text) {
  const chars = []
  let checksum = START_B
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32
    chars.push(code)
    checksum += code * (i + 1)
  }
  const check = checksum % 103
  const all = [START_B, ...chars, check]
  const widths = []
  for (const c of all) widths.push(...C128B_PATTERNS[c])
  widths.push(...STOP_BARS)
  return widths
}

function BarcodeSVG({ code, label, width = 260, height = 80 }) {
  const widths = generateCode128B(code)
  const total = widths.reduce((a, b) => a + b, 0)
  const scale = (width - 20) / total
  const barH = height - 20
  let x = 10
  const bars = widths.map((w, i) => {
    const barW = w * scale
    const el = i % 2 === 0
      ? <rect key={i} x={x} y={0} width={barW} height={barH} fill="black" />
      : null
    x += barW
    return el
  })
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {bars}
      <text x={width / 2} y={height - 2} textAnchor="middle" fontSize="9" fontFamily="Courier New, monospace" letterSpacing="2">{label || code}</text>
    </svg>
  )
}

function BarcodeCard({ produs }) {
  const ref = useRef(null)

  function downloadPNG() {
    const svg = ref.current?.querySelector('svg')
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = svg.width.baseVal.value * 2
      canvas.height = svg.height.baseVal.value * 2
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = `barcode-${produs.barcode}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)))
  }

  function printBarcode() {
    const svg = ref.current?.querySelector('svg')
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Barcode ${produs.barcode}</title>
      <style>body{margin:20px;font-family:Georgia,serif;text-align:center}h3{font-weight:normal;font-size:14px;color:#555}</style>
      </head><body>
      <h3>${produs.marca ? produs.marca + ' — ' : ''}${produs.nume}</h3>
      ${xml}
      <script>window.onload=()=>{window.print();window.close()}<\/script>
      </body></html>`)
    win.document.close()
  }

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '14px' }}>COD DE BARE</div>
      <div ref={ref} style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #EEE', display: 'inline-block', marginBottom: '14px' }}>
        <BarcodeSVG code={produs.barcode} width={260} height={70} />
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => navigator.clipboard.writeText(produs.barcode)}
          style={{ background: s.nude, border: `1.5px solid ${s.gold}`, borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px', color: s.ruby, fontFamily: 'Georgia, serif' }}>
          📋 Copiază cod
        </button>
        <button onClick={downloadPNG}
          style={{ background: s.nude, border: `1.5px solid ${s.gold}`, borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px', color: s.ruby, fontFamily: 'Georgia, serif' }}>
          ⬇️ Descarcă PNG
        </button>
        <button onClick={printBarcode}
          style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, border: 'none', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '12px', color: 'white', fontFamily: 'Georgia, serif' }}>
          🖨️ Printează
        </button>
      </div>
    </div>
  )
}
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
    }}>{cat.label}</span>
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

// Modal centrat pentru adaugare / editare
function ProdusModal({ produs, onClose, onSaved }) {
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

  const inp = {
    width: '100%', border: '1.5px solid #E0D0C0', borderRadius: '10px',
    padding: '10px 13px', fontSize: '14px', outline: 'none',
    background: 'white', fontFamily: 'Georgia, serif', color: s.text,
  }
  const lbl = { fontSize: '11px', color: '#999', letterSpacing: '0.8px', fontWeight: 'bold', marginBottom: '4px', display: 'block' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '560px', maxWidth: '95vw', maxHeight: '90vh',
        background: '#F8F4F0', zIndex: 401, borderRadius: '24px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, padding: '20px 24px', color: 'white', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '1px', marginBottom: '3px' }}>
                {isNew ? 'PRODUS NOU' : 'EDITARE PRODUS'}
              </div>
              <div style={{ fontSize: '18px' }}>{form.marca ? `${form.marca} — ` : ''}{form.nume || 'Fără nume'}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '14px' }}>
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

        {/* Body scrollabil */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'general' && (
            <>
              <div>
                <label style={lbl}>CATEGORIE</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CATEGORII.map(cat => (
                    <button key={cat.id} onClick={() => set('categorie', cat.id)} style={{
                      background: form.categorie === cat.id ? cat.color : 'white',
                      color: form.categorie === cat.id ? 'white' : cat.color,
                      border: `1.5px solid ${cat.color}`,
                      borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
                    }}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={lbl}>MARCĂ</label><input value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="ex: AMMA" style={inp} /></div>
                <div><label style={lbl}>VOLUM (ml)</label><input value={form.volum_ml} onChange={e => set('volum_ml', e.target.value)} placeholder="ex: 15" type="number" style={inp} /></div>
              </div>
              <div><label style={lbl}>NUME PRODUS *</label><input value={form.nume} onChange={e => set('nume', e.target.value)} placeholder="ex: Aqua The Base Coat" style={{ ...inp, borderColor: form.nume ? '#E0D0C0' : s.ruby }} /></div>
              <div><label style={lbl}>PREȚ ACHIZIȚIE (RON)</label><input value={form.pret_achizitie} onChange={e => set('pret_achizitie', e.target.value)} placeholder="ex: 50" type="number" style={inp} /></div>
              <div><label style={lbl}>LINK FURNIZOR</label><input value={form.furnizor_link} onChange={e => set('furnizor_link', e.target.value)} placeholder="https://anko.ro/..." style={inp} /></div>
              <div><label style={lbl}>OBSERVAȚII</label><textarea value={form.observatii} onChange={e => set('observatii', e.target.value)} placeholder="Note despre produs..." rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
            </>
          )}
          {tab === 'inci' && (
            <div>
              <label style={lbl}>INCI COMPLET</label>
              <textarea value={form.inci} onChange={e => set('inci', e.target.value)}
                placeholder="Acrylates Copolymer, Isopropyl Titanium Triisostearate, ..."
                rows={14} style={{ ...inp, resize: 'vertical', fontSize: '12px', lineHeight: '1.6' }} />
              <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>Copiază ingredientele exact de pe etichetă.</p>
            </div>
          )}
          {tab === 'stoc' && (
            <div>
              <label style={lbl}>BUCĂȚI ÎN STOC</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0 20px' }}>
                <button onClick={() => set('stoc_bucati', Math.max(0, (form.stoc_bucati || 0) - 1))}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${s.ruby}`, background: 'white', color: s.ruby, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>−</button>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: s.text, minWidth: '50px', textAlign: 'center' }}>{form.stoc_bucati}</span>
                <button onClick={() => set('stoc_bucati', (form.stoc_bucati || 0) + 1)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${s.gold}`, background: 'white', color: '#B8860B', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
              </div>
              {!isNew && produs?.barcode && (
                <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1.5px solid #E0D0C0' }}>
                  <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.8px', marginBottom: '10px' }}>COD PRODUS</div>
                  <div style={{ fontFamily: 'Courier New, monospace', fontSize: '18px', letterSpacing: '3px', color: s.text, marginBottom: '10px' }}>{produs.barcode}</div>
                  <button onClick={() => navigator.clipboard.writeText(produs.barcode)}
                    style={{ background: s.nude, border: `1px solid ${s.gold}`, borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', color: s.ruby }}>📋 Copiază cod</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', background: 'white', borderTop: '1px solid #F0EAE0', display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #E0D0C0', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#888' }}>Anulează</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: saving ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            {saving ? 'Se salvează...' : isNew ? 'Adaugă produs' : 'Salvează'}
          </button>
        </div>
      </div>
    </>
  )
}

// Fișa tehnică completă a unui produs
function FisaTehnica({ produs, onBack, onEdit, onDelete, onStocChange }) {
  const cat = CAT_MAP[produs.categorie] || { color: '#6B7280', bg: '#F3F4F6', label: produs.categorie || '—' }

  return (
    <div style={{ padding: '24px', maxWidth: '760px' }}>
      {/* Back */}
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.ruby, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
        ← Înapoi la produse
      </button>

      {/* Hero card */}
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
        <div style={{ height: '6px', background: `linear-gradient(90deg, ${cat.color}, ${cat.color}55)` }} />
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <CatBadge id={produs.categorie} />
              {produs.marca && <div style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', fontWeight: 'bold', marginTop: '10px' }}>{produs.marca.toUpperCase()}</div>}
              <h2 style={{ fontSize: '26px', fontWeight: 'normal', margin: '4px 0 0', color: s.text }}>{produs.nume}</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onEdit} style={{ background: s.nude, border: `1.5px solid ${s.gold}`, borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', color: s.ruby, fontFamily: 'Georgia, serif' }}>✏️ Editează</button>
              <button onClick={onDelete} style={{ background: '#FFF2F2', border: '1.5px solid #FFCDD2', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: '#EF4444' }}>🗑️</button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
            {produs.volum_ml && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: s.text }}>{produs.volum_ml}ml</div>
                <div style={{ fontSize: '11px', color: '#999' }}>Volum</div>
              </div>
            )}
            {produs.pret_achizitie && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#065F46' }}>{produs.pret_achizitie} RON</div>
                <div style={{ fontSize: '11px', color: '#999' }}>Preț achiziție</div>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: (produs.stoc_bucati || 0) === 0 ? '#EF4444' : (produs.stoc_bucati || 0) === 1 ? '#F59E0B' : '#10B981' }}>{produs.stoc_bucati || 0}</div>
              <div style={{ fontSize: '11px', color: '#999' }}>Bucăți stoc</div>
            </div>
          </div>

          {/* Stoc controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#999' }}>Ajustează stoc:</span>
            <button onClick={() => onStocChange(produs.id, -1)}
              style={{ width: '30px', height: '30px', borderRadius: '50%', border: `1.5px solid ${s.ruby}`, background: 'white', color: s.ruby, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <button onClick={() => onStocChange(produs.id, +1)}
              style={{ width: '30px', height: '30px', borderRadius: '50%', border: `1.5px solid ${s.gold}`, background: 'white', color: '#B8860B', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>
      </div>

      {/* INCI */}
      {produs.inci && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '12px' }}>INCI — INGREDIENTE COMPLETE</div>
          <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#444', fontFamily: 'Georgia, serif', margin: 0 }}>{produs.inci}</p>
        </div>
      )}

      {/* Observatii + Furnizor */}
      {(produs.observatii || produs.furnizor_link) && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {produs.observatii && (
            <div>
              <div style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '8px' }}>OBSERVAȚII</div>
              <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#444', margin: 0 }}>{produs.observatii}</p>
            </div>
          )}
          {produs.furnizor_link && (
            <div>
              <div style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '8px' }}>FURNIZOR</div>
              <a href={produs.furnizor_link} target="_blank" rel="noreferrer"
                style={{ fontSize: '13px', color: s.ruby, textDecoration: 'none', wordBreak: 'break-all' }}>
                🔗 {produs.furnizor_link}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Barcode */}
      {produs.barcode && <BarcodeCard produs={produs} />}
    </div>
  )
}

export default function ProdusTab() {
  const [produse, setProduse] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('toate')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProdus, setEditProdus] = useState(null)
  const [selectedProdus, setSelectedProdus] = useState(null)

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
    setSelectedProdus(null)
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
    setSelectedProdus(prev => prev?.id === id ? { ...prev, stoc_bucati } : prev)
  }

  const filtered = produse.filter(p => {
    const matchCat = filter === 'toate' || p.categorie === filter
    const matchSearch = !search || p.nume?.toLowerCase().includes(search.toLowerCase()) || p.marca?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const totalValoare = produse.reduce((sum, p) => sum + ((p.pret_achizitie || 0) * (p.stoc_bucati || 0)), 0)
  const epuizate = produse.filter(p => (p.stoc_bucati || 0) === 0).length

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
      <div style={{ width: '36px', height: '36px', border: `3px solid ${s.nude}`, borderTopColor: s.ruby, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  // Fișă tehnică — view separat
  if (selectedProdus) {
    const live = produse.find(p => p.id === selectedProdus.id) || selectedProdus
    return (
      <>
        <FisaTehnica
          produs={live}
          onBack={() => setSelectedProdus(null)}
          onEdit={() => { setEditProdus(live); setShowModal(true) }}
          onDelete={() => deleteProdus(live.id)}
          onStocChange={updateStoc}
        />
        {showModal && (
          <ProdusModal
            produs={editProdus}
            onClose={() => { setShowModal(false); setEditProdus(null) }}
            onSaved={() => { setShowModal(false); setEditProdus(null); load() }}
          />
        )}
      </>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 'normal', margin: 0, color: s.text }}>Stoc & Produse</h2>
          <p style={{ fontSize: '13px', color: '#999', margin: '4px 0 0' }}>Inventar salon EVOLIS</p>
        </div>
      </div>

      {/* Stats */}
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Caută produs sau marcă..."
          style={{ width: '100%', border: '1.5px solid #E0D0C0', borderRadius: '10px', padding: '9px 13px', fontSize: '14px', outline: 'none', fontFamily: 'Georgia, serif', marginBottom: '12px', background: '#FAFAFA' }} />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('toate')} style={{ background: filter === 'toate' ? s.ruby : 'transparent', color: filter === 'toate' ? 'white' : '#555', border: `1.5px solid ${filter === 'toate' ? s.ruby : '#E0D0C0'}`, borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            Toate ({produse.length})
          </button>
          {CATEGORII.filter(cat => produse.some(p => p.categorie === cat.id)).map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)} style={{ background: filter === cat.id ? cat.color : 'transparent', color: filter === cat.id ? 'white' : cat.color, border: `1.5px solid ${cat.color}`, borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              {cat.label} ({produse.filter(p => p.categorie === cat.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Grid produse */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>

        {/* Caseta Adaugă — mereu prima */}
        <div onClick={() => { setEditProdus(null); setShowModal(true) }}
          style={{ borderRadius: '18px', border: `2px dashed ${s.gold}`, background: 'linear-gradient(135deg, #FFFDF5, #FFF8E7)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', gap: '10px', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${s.nude}, #F5EDD0)`; e.currentTarget.style.borderColor = s.ruby }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #FFFDF5, #FFF8E7)'; e.currentTarget.style.borderColor = s.gold }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${s.gold}, #F0DC8A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#1C1C1C', boxShadow: '0 4px 14px rgba(201,168,76,0.4)', fontWeight: 'bold' }}>+</div>
          <div style={{ fontSize: '14px', color: s.ruby, fontWeight: 'bold', letterSpacing: '0.5px' }}>Adaugă produs</div>
          <div style={{ fontSize: '11px', color: '#AAA' }}>Scanează sau completează manual</div>
        </div>

        {filtered.map(p => {
            const cat = CAT_MAP[p.categorie] || { color: '#6B7280', bg: '#F3F4F6' }
            const stocColor = (p.stoc_bucati || 0) === 0 ? '#EF4444' : (p.stoc_bucati || 0) === 1 ? '#F59E0B' : '#10B981'
            return (
              <div key={p.id}
                onClick={() => setSelectedProdus(p)}
                style={{ background: 'white', borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.13)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)' }}>
                <div style={{ height: '4px', background: `linear-gradient(90deg, ${cat.color}, ${cat.color}66)` }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <CatBadge id={p.categorie} small />
                    <StocBadge n={p.stoc_bucati || 0} />
                  </div>
                  {p.marca && <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.8px', fontWeight: 'bold', marginBottom: '2px' }}>{p.marca.toUpperCase()}</div>}
                  <div style={{ fontSize: '15px', color: s.text, lineHeight: '1.3', marginBottom: '12px' }}>{p.nume}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888', marginBottom: '14px' }}>
                    {p.volum_ml && <span>🧪 {p.volum_ml}ml</span>}
                    {p.pret_achizitie && <span>💰 {p.pret_achizitie} RON</span>}
                  </div>
                  {p.barcode && (
                    <div style={{ background: '#F8F8F8', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Courier New, monospace', fontSize: '11px', letterSpacing: '1px', color: '#777' }}>{p.barcode}</span>
                      <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(p.barcode) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 0 }} title="Copiază">📋</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
      </div>

      {/* Modal adaugare */}
      {showModal && (
        <ProdusModal
          produs={editProdus}
          onClose={() => { setShowModal(false); setEditProdus(null) }}
          onSaved={() => { setShowModal(false); setEditProdus(null); load() }}
        />
      )}
    </div>
  )
}
