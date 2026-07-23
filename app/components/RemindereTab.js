'use client'

import { useState, useEffect } from 'react'

const RUBIN = '#9B1B30'
const AURIU = '#C9A84C'
const TEXT = '#3A2E2E'

const TIPURI = [
  { id: 'confirmare', label: 'Confirmare', desc: 'Trimis imediat la crearea programării', emoji: '✅' },
  { id: 'reminder_24h', label: 'Reminder', desc: 'Reamintire înainte de programare', emoji: '⏰' },
  { id: 'feedback', label: 'Feedback', desc: 'Mesaj după vizită', emoji: '🌟' },
  { id: 'recontact', label: 'Recontact', desc: 'Invitație la o nouă programare', emoji: '💌' },
]

const PLACEHOLDERS = ['{nume}', '{data}', '{ora}', '{serviciu}']

const TIP_LABEL = {
  confirmare: 'Confirmare', reminder_24h: 'Reminder', feedback: 'Feedback', recontact: 'Recontact',
}

function formatData(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function RemindereTab({ token }) {
  const [settings, setSettings] = useState(null)
  const [sms, setSms] = useState([])
  const [stats, setStats] = useState({ pending: 0, trimise: 0, erori: 0 })
  const [filtru, setFiltru] = useState('toate')
  const [loading, setLoading] = useState(true)
  const [salvez, setSalvez] = useState(false)
  const [mesajSalvare, setMesajSalvare] = useState('')

  async function incarca(status = filtru) {
    setLoading(true)
    try {
      const qs = status && status !== 'toate' ? `?status=${status}` : ''
      const res = await fetch(`/api/admin/remindere${qs}`, { headers: { 'x-admin-token': token } })
      const data = await res.json()
      if (res.ok) {
        setSms(data.sms || [])
        setStats(data.stats || { pending: 0, trimise: 0, erori: 0 })
        if (data.settings) setSettings(data.settings)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { incarca('toate') /* eslint-disable-next-line */ }, [])

  function updateTip(tip, camp, val) {
    setSettings(prev => ({ ...prev, [tip]: { ...prev[tip], [camp]: val } }))
  }

  async function salveaza() {
    setSalvez(true); setMesajSalvare('')
    try {
      const res = await fetch('/api/admin/remindere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        setMesajSalvare('✓ Setările au fost salvate. Se aplică programărilor noi.')
        setTimeout(() => setMesajSalvare(''), 4000)
      } else {
        setMesajSalvare('✗ Eroare la salvare.')
      }
    } catch { setMesajSalvare('✗ Eroare de conexiune.') }
    setSalvez(false)
  }

  async function retrimite(id) {
    try {
      await fetch('/api/admin/remindere', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id }),
      })
      incarca()
    } catch {}
  }

  function insereazaPlaceholder(tip, ph) {
    updateTip(tip, 'text', (settings[tip].text || '') + ' ' + ph)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'normal', margin: '0 0 6px', color: TEXT, fontFamily: 'Georgia, serif' }}>Remindere SMS</h2>
        <p style={{ fontSize: '13px', color: '#AAA', margin: 0 }}>Configurează mesajele automate și vezi ce s-a trimis · prin routerul salonului</p>
      </div>

      {/* Statistici */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { label: 'În așteptare', val: stats.pending, color: AURIU },
          { label: 'Trimise', val: stats.trimise, color: '#3E9E5E' },
          { label: 'Erori', val: stats.erori, color: RUBIN },
        ].map(k => (
          <div key={k.label} style={{ background: 'white', borderRadius: '14px', padding: '14px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `3px solid ${k.color}`, minWidth: '110px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: k.color, fontFamily: 'Georgia, serif' }}>{k.val}</div>
            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* CONFIGURARE */}
      <h3 style={{ fontSize: '18px', color: RUBIN, fontFamily: 'Georgia, serif', fontWeight: 'normal', margin: '0 0 14px', borderBottom: `1px solid #EEE`, paddingBottom: '8px' }}>Configurare mesaje</h3>

      {!settings ? (
        <p style={{ color: '#AAA', textAlign: 'center', padding: '20px' }}>Se încarcă…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '18px' }}>
          {TIPURI.map(t => {
            const cfg = settings[t.id] || {}
            return (
              <div key={t.id} style={{ background: 'white', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${cfg.activ ? AURIU : '#DDD'}`, opacity: cfg.activ ? 1 : 0.7 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: TEXT, fontFamily: 'Georgia, serif' }}>{t.label}</div>
                      <div style={{ fontSize: '11px', color: '#AAA' }}>{t.desc}</div>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button onClick={() => updateTip(t.id, 'activ', !cfg.activ)}
                    style={{ width: '46px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: cfg.activ ? AURIU : '#DDD', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: '3px', left: cfg.activ ? '23px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                  </button>
                </div>

                {/* Timing */}
                {t.id !== 'confirmare' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '13px', color: '#666' }}>
                    <input type="number" min="0" max="365" value={cfg.offset ?? 0}
                      onChange={e => updateTip(t.id, 'offset', Number(e.target.value))}
                      style={{ width: '58px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #E2D9CC', fontSize: '13px', textAlign: 'center' }} />
                    <select value={cfg.unit || 'ore_inainte'} onChange={e => updateTip(t.id, 'unit', e.target.value)}
                      style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #E2D9CC', fontSize: '13px', background: 'white', color: '#666' }}>
                      <option value="ore_inainte">ore înainte</option>
                      <option value="zile_dupa">zile după</option>
                    </select>
                  </div>
                )}
                {t.id === 'confirmare' && (
                  <div style={{ fontSize: '12px', color: '#AAA', marginBottom: '10px', fontStyle: 'italic' }}>Se trimite imediat</div>
                )}

                {/* Text */}
                <textarea value={cfg.text || ''} onChange={e => updateTip(t.id, 'text', e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2D9CC', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', color: TEXT, lineHeight: '1.5' }} />

                {/* Placeholdere */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {PLACEHOLDERS.map(ph => (
                    <button key={ph} onClick={() => insereazaPlaceholder(t.id, ph)}
                      style={{ background: '#F5EFE6', border: '1px solid #E8DDCB', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', color: '#8A7A5C', cursor: 'pointer', fontFamily: 'monospace' }}>
                      {ph}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Salvare */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px' }}>
        <button onClick={salveaza} disabled={salvez || !settings}
          style={{ background: RUBIN, color: 'white', border: 'none', borderRadius: '12px', padding: '12px 28px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: salvez ? 'default' : 'pointer', opacity: salvez ? 0.6 : 1, letterSpacing: '0.5px' }}>
          {salvez ? 'Se salvează…' : 'Salvează setările'}
        </button>
        {mesajSalvare && <span style={{ fontSize: '13px', color: mesajSalvare.startsWith('✓') ? '#3E9E5E' : RUBIN }}>{mesajSalvare}</span>}
      </div>

      {/* LISTĂ SMS */}
      <h3 style={{ fontSize: '18px', color: RUBIN, fontFamily: 'Georgia, serif', fontWeight: 'normal', margin: '0 0 14px', borderBottom: `1px solid #EEE`, paddingBottom: '8px' }}>Mesaje în coadă</h3>

      {/* Filtre */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { id: 'toate', label: 'Toate' },
          { id: 'pending', label: 'În așteptare' },
          { id: 'trimis', label: 'Trimise' },
          { id: 'eroare', label: 'Erori' },
        ].map(f => (
          <button key={f.id} onClick={() => { setFiltru(f.id); incarca(f.id) }}
            style={{ background: filtru === f.id ? RUBIN : 'white', color: filtru === f.id ? 'white' : '#888', border: `1px solid ${filtru === f.id ? RUBIN : '#E2D9CC'}`, borderRadius: '10px', padding: '7px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#AAA', textAlign: 'center', padding: '20px' }}>Se încarcă…</p>
      ) : sms.length === 0 ? (
        <p style={{ color: '#AAA', textAlign: 'center', padding: '30px', background: 'white', borderRadius: '14px' }}>Niciun mesaj în această categorie.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sms.map(m => {
            const eroare = m.eroare && m.eroare.trim()
            const stare = eroare ? { txt: 'Eroare', col: RUBIN } : m.trimis ? { txt: 'Trimis', col: '#3E9E5E' } : { txt: 'În așteptare', col: AURIU }
            return (
              <div key={m.id} style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${stare.col}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: TEXT }}>{m.telefon}</span>
                      <span style={{ fontSize: '10px', background: '#F0EAE0', color: '#8A7A5C', borderRadius: '10px', padding: '2px 8px', letterSpacing: '0.3px' }}>{TIP_LABEL[m.tip] || m.tip}</span>
                      <span style={{ fontSize: '11px', color: stare.col, fontWeight: 'bold' }}>{stare.txt}</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#777', lineHeight: '1.5' }}>{m.mesaj}</div>
                    {eroare && <div style={{ fontSize: '11px', color: RUBIN, marginTop: '4px' }}>⚠ {m.eroare}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', color: '#AAA' }}>{m.trimis ? 'Trimis:' : 'Programat:'}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>{formatData(m.trimis ? m.trimis_la : m.de_trimis_la)}</div>
                    {eroare && (
                      <button onClick={() => retrimite(m.id)}
                        style={{ background: RUBIN, color: 'white', border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                        Retrimite
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
