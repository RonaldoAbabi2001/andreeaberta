'use client'
import { useState } from 'react'

const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', text: '#1C1C1C' }

export default function ExtraServicii({
  servicii = [],
  mainServiciu = '',
  extras = [],
  onExtrasChange,
  pretBase = 0,
  pretManual = '',
  onPretManualChange,
  showPret = true,
}) {
  const [selectat, setSelectat] = useState('')

  const pretExtras = extras.reduce((sum, e) => sum + Number(e.pret || 0), 0)
  const pretAuto = pretBase + pretExtras
  const disponibile = servicii.filter(sv => sv.nume !== mainServiciu && !extras.find(e => e.id === sv.id))

  function addExtra() {
    if (!selectat) return
    const sv = servicii.find(sv => String(sv.id) === String(selectat))
    if (!sv) return
    onExtrasChange([...extras, { id: sv.id, nume: sv.nume, pret: sv.pret, durata: sv.durata }])
    setSelectat('')
  }

  function removeExtra(id) {
    onExtrasChange(extras.filter(e => e.id !== id))
  }

  const lbl = { display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }
  const inpStyle = { width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', background: 'white', fontFamily: 'Georgia, serif', color: s.text, boxSizing: 'border-box', outline: 'none' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Preț editabil */}
      {showPret && (
        <div>
          <label style={lbl}>PREȚ TOTAL (RON)</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="number" min="0"
              value={pretManual !== '' ? pretManual : pretAuto}
              onChange={e => onPretManualChange(e.target.value)}
              style={{ ...inpStyle, flex: 1 }}
            />
            {pretManual !== '' && (
              <button type="button" onClick={() => onPretManualChange('')}
                style={{ background: '#F0EAE0', border: 'none', borderRadius: '10px', padding: '9px 12px', cursor: 'pointer', fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>
                ↺ Auto
              </button>
            )}
          </div>
          <p style={{ fontSize: '11px', marginTop: '4px', color: pretManual !== '' ? s.ruby : '#AAA' }}>
            {pretManual !== '' ? `Modificat manual · calculat automat: ${pretAuto} RON` : 'Auto-calculat · editează câmpul pentru a modifica'}
          </p>
        </div>
      )}

      {/* Servicii extra */}
      <div>
        <label style={lbl}>SERVICII EXTRA</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: extras.length ? '8px' : '0' }}>
          <select value={selectat} onChange={e => setSelectat(e.target.value)}
            style={{ ...inpStyle, flex: 1, padding: '9px 10px' }}>
            <option value="">Alege serviciu extra...</option>
            {disponibile.map(sv => (
              <option key={sv.id} value={sv.id}>{sv.nume} — {sv.pret} lei ({sv.durata} min)</option>
            ))}
          </select>
          <button type="button" onClick={addExtra} disabled={!selectat}
            style={{ background: selectat ? `linear-gradient(135deg, ${s.ruby}, #7A1525)` : '#EEE', color: selectat ? 'white' : '#AAA', border: 'none', borderRadius: '10px', padding: '9px 14px', cursor: selectat ? 'pointer' : 'default', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            + Adaugă
          </button>
        </div>

        {extras.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {extras.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: s.nude, borderRadius: '10px', padding: '8px 12px' }}>
                <span style={{ fontSize: '13px', color: s.text }}>{e.nume}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: s.ruby, fontWeight: 'bold' }}>+{e.pret} RON</span>
                  <button type="button" onClick={() => removeExtra(e.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCC', fontSize: '16px', lineHeight: 1, padding: 0 }}>✕</button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px 2px', borderTop: '1px solid #E8DDD0' }}>
              <span style={{ fontSize: '11px', color: '#AAA' }}>Extra total</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: s.ruby }}>+{pretExtras} RON</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
