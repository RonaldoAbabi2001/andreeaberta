'use client'
import { useState, useEffect, useRef } from 'react'

function getAdminToken() { return typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : '' }
const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', nudeD: '#EDE0D0', text: '#1C1C1C' }

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
  furnizor_link: '', inci: '', observatii: '', stoc_bucati: 1, stoc_minim: 3,
}

function getStatus(stoc, minim) {
  if (stoc === 0) return { label: 'Epuizat', color: '#E24B4A', pct: 3 }
  if (stoc <= minim) return { label: 'Scăzut', color: '#EF9F27', pct: Math.max(15, Math.round(stoc / minim * 100)) }
  return { label: 'Ok', color: '#1D9E75', pct: Math.min(100, Math.round(stoc / (minim * 2) * 100)) }
}

function CatBadge({ id }) {
  const cat = CAT_MAP[id] || { label: id || '—', color: '#6B7280', bg: '#F3F4F6' }
  return (
    <span style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33`, borderRadius: '20px', padding: '2px 9px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
      {cat.label}
    </span>
  )
}

// Code128B generator
const C128B_PATTERNS = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],[1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],[1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],[3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],[1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],[1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],[3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],[1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],[2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],[1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],[1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],[2,1,1,2,3,2],
]
const STOP_BARS = [2,3,3,1,1,1,2]

function generateCode128B(text) {
  const chars = []
  let checksum = 104
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32
    chars.push(code)
    checksum += code * (i + 1)
  }
  const all = [104, ...chars, checksum % 103]
  const widths = []
  for (const c of all) widths.push(...C128B_PATTERNS[c])
  widths.push(...STOP_BARS)
  return widths
}

function BarcodeSVG({ code, width = 240, height = 64 }) {
  const widths = generateCode128B(code)
  const total = widths.reduce((a, b) => a + b, 0)
  const scale = (width - 16) / total
  const barH = height - 16
  let x = 8
  const bars = widths.map((w, i) => {
    const bw = w * scale
    const el = i % 2 === 0 ? <rect key={i} x={x} y={0} width={bw} height={barH} fill="#1C1C1C" /> : null
    x += bw
    return el
  })
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {bars}
      <text x={width / 2} y={height - 2} textAnchor="middle" fontSize="8" fontFamily="Courier New, monospace" letterSpacing="1.5" fill="#555">{code}</text>
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
      canvas.width = svg.width.baseVal.value * 2; canvas.height = svg.height.baseVal.value * 2
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(2, 2); ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = `barcode-${produs.barcode}.png`; a.href = canvas.toDataURL('image/png'); a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)))
  }
  function printBarcode() {
    const svg = ref.current?.querySelector('svg')
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Barcode</title><style>body{margin:24px;font-family:Georgia,serif;text-align:center}p{font-size:13px;color:#555;margin-bottom:12px}</style></head><body><p>${produs.marca ? produs.marca + ' — ' : ''}${produs.nume}</p>${xml}<script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`)
    win.document.close()
  }
  return (
    <div style={{ background: '#F8F4F0', borderRadius: '12px', padding: '16px', border: '1px solid #E8DDD0' }}>
      <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.8px', fontWeight: 'bold', marginBottom: '10px' }}>COD DE BARE</div>
      <div ref={ref} style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #EEE', display: 'inline-block', marginBottom: '12px' }}>
        <BarcodeSVG code={produs.barcode} />
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button onClick={() => navigator.clipboard.writeText(produs.barcode)} style={{ background: 'white', border: `1px solid ${s.nudeD}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: s.ruby }}>📋 Copiază</button>
        <button onClick={downloadPNG} style={{ background: 'white', border: `1px solid ${s.nudeD}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: s.ruby }}>⬇️ PNG</button>
        <button onClick={printBarcode} style={{ background: s.ruby, border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: 'white' }}>🖨️ Print</button>
      </div>
    </div>
  )
}

function ProdusModal({ produs, onClose, onSaved }) {
  const isNew = !produs?.id
  const [form, setForm] = useState(produs ? {
    marca: produs.marca || '', nume: produs.nume || '', categorie: produs.categorie || 'baza',
    volum_ml: produs.volum_ml || '', pret_achizitie: produs.pret_achizitie || '',
    furnizor_link: produs.furnizor_link || '', inci: produs.inci || '',
    observatii: produs.observatii || '', stoc_bucati: produs.stoc_bucati ?? 1,
    stoc_minim: produs.stoc_minim ?? 3,
  } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('general')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.nume.trim()) return alert('Numele produsului este obligatoriu.')
    setSaving(true)
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch('/api/admin/produse', {
      method, headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify(isNew ? form : { ...form, id: produs.id }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) onSaved(data)
  }

  const inp = { width: '100%', border: '1.5px solid #E0D0C0', borderRadius: '10px', padding: '10px 13px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Georgia, serif', color: s.text }
  const lbl = { fontSize: '11px', color: '#999', letterSpacing: '0.8px', fontWeight: 'bold', marginBottom: '4px', display: 'block' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '560px', maxWidth: '95vw', maxHeight: '90vh', background: '#F8F4F0', zIndex: 401, borderRadius: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, padding: '20px 24px', color: 'white', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '1px', marginBottom: '3px' }}>{isNew ? 'PRODUS NOU' : 'EDITARE PRODUS'}</div>
              <div style={{ fontSize: '18px' }}>{form.marca ? `${form.marca} — ` : ''}{form.nume || 'Fără nume'}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '14px' }}>
            {[['general', 'General'], ['inci', 'INCI'], ['stoc', 'Stoc']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? 'rgba(255,255,255,0.2)' : 'transparent', border: tab === id ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent', color: 'white', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia, serif' }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'general' && (
            <>
              <div>
                <label style={lbl}>CATEGORIE</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CATEGORII.map(cat => (
                    <button key={cat.id} onClick={() => set('categorie', cat.id)} style={{ background: form.categorie === cat.id ? cat.color : 'white', color: form.categorie === cat.id ? 'white' : cat.color, border: `1.5px solid ${cat.color}`, borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{cat.label}</button>
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
              <div><label style={lbl}>OBSERVAȚII</label><textarea value={form.observatii} onChange={e => set('observatii', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
            </>
          )}
          {tab === 'inci' && (
            <div>
              <label style={lbl}>INCI COMPLET</label>
              <textarea value={form.inci} onChange={e => set('inci', e.target.value)} placeholder="Acrylates Copolymer, Isopropyl Titanium Triisostearate, ..." rows={14} style={{ ...inp, resize: 'vertical', fontSize: '12px', lineHeight: '1.6' }} />
              <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>Copiază ingredientele exact de pe etichetă.</p>
            </div>
          )}
          {tab === 'stoc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={lbl}>BUCĂȚI ÎN STOC</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                  <button onClick={() => set('stoc_bucati', Math.max(0, (form.stoc_bucati || 0) - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${s.ruby}`, background: 'white', color: s.ruby, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>−</button>
                  <span style={{ fontSize: '32px', fontWeight: 'bold', color: s.text, minWidth: '50px', textAlign: 'center' }}>{form.stoc_bucati}</span>
                  <button onClick={() => set('stoc_bucati', (form.stoc_bucati || 0) + 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${s.gold}`, background: 'white', color: '#B8860B', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
                </div>
              </div>
              <div>
                <label style={lbl}>STOC MINIM (alertă sub această valoare)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                  <button onClick={() => set('stoc_minim', Math.max(1, (form.stoc_minim || 3) - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #E0D0C0', background: 'white', color: '#888', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#C2410C', minWidth: '40px', textAlign: 'center' }}>{form.stoc_minim}</span>
                  <button onClick={() => set('stoc_minim', (form.stoc_minim || 3) + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #E0D0C0', background: 'white', color: '#888', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <p style={{ fontSize: '11px', color: '#AAA', marginTop: '8px' }}>Când stocul scade sub {form.stoc_minim} bucăți → apare alertă "Scăzut"</p>
              </div>
            </div>
          )}
        </div>

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

function FisaTehnica({ produs, onBack, onEdit, onDelete, onStocChange }) {
  const cat = CAT_MAP[produs.categorie] || { color: '#6B7280', bg: '#F3F4F6', label: produs.categorie || '—' }
  const st = getStatus(produs.stoc_bucati || 0, produs.stoc_minim || 3)
  return (
    <div style={{ padding: '24px', maxWidth: '760px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.ruby, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, marginBottom: '20px', fontFamily: 'Georgia, serif' }}>← Înapoi la produse</button>
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
        <div style={{ height: '5px', background: `linear-gradient(90deg, ${cat.color}, ${cat.color}55)` }} />
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
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {produs.volum_ml && <div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{produs.volum_ml}ml</div><div style={{ fontSize: '11px', color: '#999' }}>Volum</div></div>}
            {produs.pret_achizitie && <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#065F46' }}>{produs.pret_achizitie} RON</div><div style={{ fontSize: '11px', color: '#999' }}>Preț achiziție</div></div>}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: st.color }}>{produs.stoc_bucati || 0}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>/ minim {produs.stoc_minim || 3} buc</span>
              </div>
              <div style={{ width: '120px', height: '6px', background: '#EEE', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${st.pct}%`, height: '100%', background: st.color, borderRadius: '3px', transition: 'width 0.4s' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Stoc curent</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#999' }}>Ajustează:</span>
            <button onClick={() => onStocChange(produs.id, -1)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: `1.5px solid ${s.ruby}`, background: 'white', color: s.ruby, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <button onClick={() => onStocChange(produs.id, +1)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: `1.5px solid ${s.gold}`, background: 'white', color: '#B8860B', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>
      </div>
      {produs.inci && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '10px' }}>INCI — INGREDIENTE COMPLETE</div>
          <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#444', fontFamily: 'Georgia, serif', margin: 0 }}>{produs.inci}</p>
        </div>
      )}
      {(produs.observatii || produs.furnizor_link) && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {produs.observatii && <div><div style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '6px' }}>OBSERVAȚII</div><p style={{ fontSize: '13px', lineHeight: '1.7', color: '#444', margin: 0 }}>{produs.observatii}</p></div>}
          {produs.furnizor_link && <div><div style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '6px' }}>FURNIZOR</div><a href={produs.furnizor_link} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: s.ruby, wordBreak: 'break-all' }}>🔗 {produs.furnizor_link}</a></div>}
        </div>
      )}
      {produs.barcode && <BarcodeCard produs={produs} />}
    </div>
  )
}

export default function ProdusTab() {
  const [produse, setProduse] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('toate')
  const [filterStoc, setFilterStoc] = useState('toate')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProdus, setEditProdus] = useState(null)
  const [selectedProdus, setSelectedProdus] = useState(null)

  async function load() {
    const res = await fetch('/api/admin/produse', { headers: { 'x-admin-token': getAdminToken() } })
    const data = await res.json()
    setProduse(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteProdus(id) {
    if (!confirm('Ștergi produsul din stoc?')) return
    await fetch('/api/admin/produse', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() }, body: JSON.stringify({ id }) })
    setSelectedProdus(null); load()
  }

  async function updateStoc(id, delta) {
    const p = produse.find(x => x.id === id)
    if (!p) return
    const stoc_bucati = Math.max(0, (p.stoc_bucati || 0) + delta)
    await fetch('/api/admin/produse', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() }, body: JSON.stringify({ id, stoc_bucati, stoc_only: true }) })
    setProduse(prev => prev.map(x => x.id === id ? { ...x, stoc_bucati } : x))
    setSelectedProdus(prev => prev?.id === id ? { ...prev, stoc_bucati } : prev)
  }

  const filtered = produse.filter(p => {
    if (filter !== 'toate' && p.categorie !== filter) return false
    if (filterStoc === 'in_stoc' && (p.stoc_bucati || 0) === 0) return false
    if (filterStoc === 'epuizat' && (p.stoc_bucati || 0) > 0) return false
    if (search && !p.nume?.toLowerCase().includes(search.toLowerCase()) && !p.marca?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const nOk = produse.filter(p => (p.stoc_bucati || 0) > (p.stoc_minim || 3)).length
  const nScazut = produse.filter(p => { const s = p.stoc_bucati || 0; return s > 0 && s <= (p.stoc_minim || 3) }).length
  const nEpuizat = produse.filter(p => (p.stoc_bucati || 0) === 0).length

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}><div style={{ width: '36px', height: '36px', border: `3px solid ${s.nude}`, borderTopColor: s.ruby, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>

  if (selectedProdus) {
    const live = produse.find(p => p.id === selectedProdus.id) || selectedProdus
    return (
      <>
        <FisaTehnica produs={live} onBack={() => setSelectedProdus(null)} onEdit={() => { setEditProdus(live); setShowModal(true) }} onDelete={() => deleteProdus(live.id)} onStocChange={updateStoc} />
        {showModal && <ProdusModal produs={editProdus} onClose={() => { setShowModal(false); setEditProdus(null) }} onSaved={() => { setShowModal(false); setEditProdus(null); load() }} />}
      </>
    )
  }

  return (
    <div style={{ padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'normal', margin: 0, color: s.text }}>Stoc & Produse</h2>
          <p style={{ fontSize: '12px', color: '#999', margin: '3px 0 0' }}>Actualizat în timp real · Inventar EVOLIS</p>
        </div>
        <button onClick={() => { setEditProdus(null); setShowModal(true) }}
          style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(155,27,48,0.3)', fontFamily: 'Georgia, serif' }}>
          + Produs nou
        </button>
      </div>

      {/* 4 Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total produse', value: produse.length, sub: `${[...new Set(produse.map(p => p.categorie).filter(Boolean))].length} categorii`, color: s.ruby, dot: null },
          { label: 'Stoc ok', value: nOk, sub: produse.length ? `${Math.round(nOk/produse.length*100)}% din produse` : '—', color: '#1D9E75', dot: '#1D9E75' },
          { label: 'Stoc scăzut', value: nScazut, sub: 'Comandă curând', color: '#EF9F27', dot: '#EF9F27' },
          { label: 'Epuizat', value: nEpuizat, sub: nEpuizat > 0 ? 'Comandă urgent !' : 'Totul în stoc', color: nEpuizat > 0 ? '#E24B4A' : '#6B7280', dot: '#E24B4A' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: `3px solid ${stat.color}` }}>
            <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 'bold' }}>{stat.label.toUpperCase()}</div>
            <div style={{ fontSize: '26px', fontWeight: '500', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#AAA', marginTop: '4px' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Search + Filtre */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0EAE0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Caută produs sau marcă..."
              style={{ flex: '1', minWidth: '160px', padding: '7px 12px', border: '1px solid #E0D0C0', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'Georgia, serif', background: '#FAFAFA' }} />
            {[
              { id: 'toate', label: 'Toate', color: '#6B7280' },
              { id: 'in_stoc', label: '✓ În stoc', color: '#1D9E75' },
              { id: 'epuizat', label: '✕ Epuizat', color: '#E24B4A' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilterStoc(f.id)} style={{
                padding: '5px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                background: filterStoc === f.id ? f.color : '#F3EDE5',
                color: filterStoc === f.id ? 'white' : '#666',
              }}>{f.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[{ id: 'toate', label: 'Toate' }, ...CATEGORII.filter(c => produse.some(p => p.categorie === c.id))].map(cat => (
              <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                padding: '4px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                background: filter === cat.id ? (cat.id === 'toate' ? s.ruby : CAT_MAP[cat.id]?.color || s.ruby) : '#F3EDE5',
                color: filter === cat.id ? 'white' : '#666',
              }}>{cat.label}{cat.id !== 'toate' && ` (${produse.filter(p => p.categorie === cat.id).length})`}</button>
            ))}
          </div>
        </div>

        {/* Header tabel */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 100px 100px 80px', gap: '0', padding: '8px 18px', background: '#FAFAF8', borderBottom: '1px solid #F0EAE0' }}>
          {['PRODUS', 'CATEGORIE', 'STOC', 'NIVEL', 'STATUS', ''].map(h => (
            <div key={h} style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '0.8px', padding: '4px 8px' }}>{h}</div>
          ))}
        </div>

        {/* Rânduri */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#AAA' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🧴</div>
            <div style={{ fontSize: '15px' }}>{produse.length === 0 ? 'Niciun produs adăugat încă.' : 'Niciun produs pentru filtrul selectat.'}</div>
          </div>
        ) : filtered.map((p, i) => {
          const st = getStatus(p.stoc_bucati || 0, p.stoc_minim || 3)
          return (
            <div key={p.id}
              onClick={() => setSelectedProdus(p)}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 100px 100px 80px', gap: '0', padding: '0 10px', borderBottom: i < filtered.length - 1 ? '1px solid #F7F2EC' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FDF8F3'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

              {/* Produs */}
              <div style={{ padding: '13px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: s.text }}>{p.nume}</div>
                {p.marca && <div style={{ fontSize: '11px', color: '#AAA', marginTop: '2px' }}>{p.marca}{p.volum_ml ? ` · ${p.volum_ml}ml` : ''}</div>}
              </div>

              {/* Categorie */}
              <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center' }}>
                <CatBadge id={p.categorie} />
              </div>

              {/* Stoc */}
              <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: st.color }}>{p.stoc_bucati || 0}</span>
                <span style={{ fontSize: '11px', color: '#AAA', marginLeft: '3px' }}>buc</span>
              </div>

              {/* Nivel bar */}
              <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '72px', height: '6px', background: '#EEE', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${st.pct}%`, height: '100%', background: st.color, borderRadius: '3px', transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* Status */}
              <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: st.color, fontWeight: '500' }}>{st.label}</span>
              </div>

              {/* Acțiuni */}
              <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => updateStoc(p.id, -1)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1px solid #E0D0C0`, background: 'white', color: '#888', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                <button onClick={() => updateStoc(p.id, +1)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1px solid ${s.gold}`, background: 'white', color: '#B8860B', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
              </div>
            </div>
          )
        })}

        {/* Footer tabel */}
        {filtered.length > 0 && (
          <div style={{ padding: '10px 18px', background: '#FAFAF8', borderTop: '1px solid #F0EAE0', fontSize: '12px', color: '#AAA' }}>
            {filtered.length} produse afișate · Click pe rând pentru fișa tehnică completă
          </div>
        )}
      </div>

      {showModal && <ProdusModal produs={editProdus} onClose={() => { setShowModal(false); setEditProdus(null) }} onSaved={() => { setShowModal(false); setEditProdus(null); load() }} />}
    </div>
  )
}
