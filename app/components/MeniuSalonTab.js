'use client'
import { useState } from 'react'
import ServiciiTab from './ServiciiTab'

const SECRET = 'evolis2026secret'
const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', text: '#1C1C1C' }

const SECTIUNI = [
  {
    id: 'servicii',
    icon: '💅',
    label: 'Servicii',
    desc: 'Gestionează lista de servicii și prețuri',
    color: s.ruby,
    ready: true,
  },
  {
    id: 'roata',
    icon: '🎡',
    label: 'Roata Norocului',
    desc: 'Vezi codurile câștigate, validează-le la salon',
    color: '#7C3AED',
    ready: true,
  },
  {
    id: 'sms',
    icon: '📨',
    label: 'SMS în masă',
    desc: 'Trimite un mesaj la toți clienții prin router',
    color: '#BE185D',
    ready: true,
  },
  {
    id: 'produse',
    icon: '📦',
    label: 'Produse & Stoc',
    desc: 'Gestionează produsele și stocul salonului',
    color: '#2F80ED',
    ready: true,
    external: true,
  },
  {
    id: 'import',
    icon: '📥',
    label: 'Import CSV',
    desc: 'Importă clienți din fișier CSV sau Google Sheets',
    color: '#00B4D8',
    ready: true,
    external: true,
  },
  {
    id: 'rapoarte',
    icon: '📊',
    label: 'Rapoarte',
    desc: 'Vizualizează rapoarte și statistici salon',
    color: '#6A3093',
    ready: true,
    external: true,
  },
  {
    id: 'setari',
    icon: '⚙️',
    label: 'Setări Admin',
    desc: 'Parolă, date salon, configurații',
    color: '#F5576C',
    ready: true,
    external: true,
  },
  {
    id: 'pachete',
    icon: '🎁',
    label: 'Pachete',
    desc: 'Combină servicii în pachete cu preț special',
    color: '#065F46',
    ready: false,
  },
  {
    id: 'promotii',
    icon: '🏷️',
    label: 'Promoții',
    desc: 'Reduceri, coduri, oferte sezoniere',
    color: '#0369A1',
    ready: false,
  },
  {
    id: 'categorii',
    icon: '📂',
    label: 'Categorii',
    desc: 'Organizează serviciile pe categorii',
    color: '#7C3AED',
    ready: false,
  },
]

function RoataAdmin({ token, onBack }) {
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/roata', { headers: { 'x-admin-token': token } })
    setRows(await res.json())
    setLoading(false)
  }

  async function marcheazaFolosit(cod) {
    await fetch('/api/roata', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ cod })
    })
    setRows(r => r.map(x => x.cod === cod ? { ...x, folosit: true } : x))
  }

  useState(() => { load() }, [])

  const filtered = (rows || []).filter(r =>
    r.telefon?.includes(search) || r.nume?.toLowerCase().includes(search.toLowerCase()) || r.cod?.includes(search.toUpperCase())
  )
  const total = (rows || []).length
  const folosite = (rows || []).filter(r => r.folosit).length
  const nefolosite = total - folosite

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onBack} style={{ background: 'white', border: '1px solid #E8DDD0', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#888', fontFamily: 'Georgia, serif' }}>← Meniu Salon</button>
        <span style={{ color: '#CCC' }}>/</span>
        <span style={{ fontSize: '14px', color: '#1C1C1C', fontFamily: 'Georgia, serif' }}>🎡 Roata Norocului</span>
      </div>

      <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total jocuri', val: total, color: '#7C3AED' },
            { label: 'Coduri active', val: nefolosite, color: '#10B981' },
            { label: 'Coduri folosite', val: folosite, color: '#888' },
          ].map(st => (
            <div key={st.label} style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', minWidth: '120px', borderTop: `3px solid ${st.color}` }}>
              <p style={{ fontSize: '26px', fontWeight: 'bold', color: st.color, margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>{rows ? st.val : '—'}</p>
              <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>{st.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          placeholder="Caută după nume, telefon sau cod..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', border: '1px solid #E8DDD0', borderRadius: '10px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
        />

        {loading && <p style={{ color: '#aaa', fontSize: '14px' }}>Se încarcă...</p>}

        {!loading && rows && filtered.length === 0 && (
          <p style={{ color: '#aaa', fontSize: '14px' }}>Niciun rezultat{search ? ' pentru această căutare' : ' — nimeni nu a jucat încă'}.</p>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', borderLeft: `4px solid ${r.folosit ? '#ddd' : '#7C3AED'}`, opacity: r.folosit ? 0.6 : 1 }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '0 0 2px', fontFamily: 'Georgia, serif' }}>{r.nume || '—'}</p>
                  <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{r.telefon}</p>
                </div>
                <div style={{ minWidth: '140px' }}>
                  <p style={{ color: '#9B1B30', fontWeight: 'bold', fontSize: '14px', margin: '0 0 2px' }}>{r.premiu}</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '16px', letterSpacing: '3px', color: '#444', margin: 0 }}>{r.cod}</p>
                </div>
                <div style={{ minWidth: '100px', textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: '#bbb', margin: '0 0 6px' }}>{new Date(r.creat).toLocaleDateString('ro-RO')}</p>
                  {r.folosit ? (
                    <span style={{ background: '#F3F4F6', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#aaa' }}>✓ Folosit</span>
                  ) : (
                    <button onClick={() => marcheazaFolosit(r.cod)}
                      style={{ background: '#7C3AED', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Validează
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SmsBulkSection({ token, clientiCount, onBack }) {
  const [mesaj, setMesaj] = useState('')
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState(null)
  const [campanii, setCampanii] = useState(null)
  const [loadingCampanii, setLoadingCampanii] = useState(false)

  async function loadCampanii() {
    setLoadingCampanii(true)
    try {
      const res = await fetch('/api/admin/sms-bulk', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setCampanii(Array.isArray(data) ? data : [])
    } catch { setCampanii([]) }
    setLoadingCampanii(false)
  }

  function handlePreview() {
    if (!mesaj.trim()) return
    setPreview({ nrClienti: clientiCount, mesaj: mesaj.trim() })
    setStatus(null)
  }

  async function handleTrimite() {
    setStatus('loading')
    setPreview(null)
    const res = await fetch('/api/admin/sms-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ mesaj: mesaj.trim() })
    })
    const data = await res.json()
    if (data.success) {
      setStatus({ ok: true, text: `✅ ${data.adaugate} SMS-uri adăugate în coadă. Beelink le trimite în ~${Math.ceil(data.adaugate / 20)} minute.` })
      setMesaj('')
      loadCampanii()
    } else if (data.duplicate) {
      setStatus({ ok: false, text: `⚠️ ${data.error}` })
    } else {
      setStatus({ ok: false, text: `❌ Eroare: ${data.error}` })
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onBack}
          style={{ background: 'white', border: '1px solid #E8DDD0', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#888', fontFamily: 'Georgia, serif' }}>
          ← Meniu Salon
        </button>
        <span style={{ color: '#CCC', fontSize: '14px' }}>/</span>
        <span style={{ fontSize: '14px', color: s.text, fontFamily: 'Georgia, serif' }}>📨 SMS în masă</span>
      </div>

      <div style={{ padding: '24px', maxWidth: '680px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'normal', marginBottom: '6px', fontFamily: 'Georgia, serif' }}>SMS în masă</h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
          Trimite prin routerul TP-Link (SIM propriu) — fără costuri externe.<br />
          <strong>{clientiCount} clienți</strong> cu număr de telefon salvat.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Template rapid:</p>
          <button
            onClick={() => { setMesaj('Bună! Programările la EVOLIS se fac acum pe andreeaberta.com — mai simplu, mai rapid. La prima programare online primești acces la Roata Norocului cu reduceri speciale! Te așteptăm!'); setStatus(null); setPreview(null) }}
            style={{ padding: '8px 16px', background: '#F7EFE5', border: '1px solid #C9A84C', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: s.ruby }}>
            📋 Folosește template-ul
          </button>
        </div>

        <textarea
          value={mesaj}
          onChange={e => { setMesaj(e.target.value); setStatus(null); setPreview(null) }}
          rows={5}
          placeholder="Scrie mesajul SMS aici..."
          style={{ width: '100%', padding: '12px', border: '1px solid #E8DDD0', borderRadius: '10px', fontSize: '14px', fontFamily: 'Georgia, serif', resize: 'vertical', marginBottom: '8px', boxSizing: 'border-box' }}
        />
        <p style={{ fontSize: '12px', color: mesaj.length > 160 ? '#E53E3E' : '#aaa', marginBottom: '16px' }}>
          {mesaj.length}/160 caractere {mesaj.length > 160 ? `— ${Math.ceil(mesaj.length / 160)} SMS-uri per număr` : '— 1 SMS per număr'}
        </p>

        <button
          onClick={handlePreview}
          disabled={!mesaj.trim() || status === 'loading'}
          style={{ padding: '14px 32px', fontSize: '14px', background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '12px', cursor: mesaj.trim() ? 'pointer' : 'not-allowed', opacity: mesaj.trim() ? 1 : 0.5, fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}>
          VERIFICĂ ȘI TRIMITE
        </button>

        {preview && (
          <div style={{ marginTop: '16px', padding: '20px', background: '#FFF8E7', borderRadius: '12px', border: '1px solid #C9A84C' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '15px' }}>⚠️ Confirmare trimitere masivă</p>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '12px' }}>
              Se vor trimite <strong>{preview.nrClienti} SMS-uri</strong> la toți clienții cu telefon.
            </p>
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#444', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
              {preview.mesaj}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleTrimite}
                style={{ padding: '10px 24px', fontSize: '14px', background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                DA, TRIMITE LA TOȚI ({preview.nrClienti})
              </button>
              <button onClick={() => setPreview(null)}
                style={{ padding: '10px 20px', background: 'none', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: '#888' }}>
                Anulează
              </button>
            </div>
          </div>
        )}

        {status && status !== 'loading' && (
          <p style={{ marginTop: '16px', fontSize: '14px', color: status.ok ? '#10B981' : '#E07000' }}>{status.text}</p>
        )}
        {status === 'loading' && (
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#888' }}>Se adaugă în coadă...</p>
        )}

        {/* Raport campanii */}
        <div style={{ marginTop: '40px', borderTop: '1px solid #F0E8DF', paddingTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', margin: 0 }}>Campanii anterioare</p>
            <button onClick={loadCampanii} disabled={loadingCampanii}
              style={{ padding: '6px 14px', background: '#F7EFE5', border: '1px solid #C9A84C', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: s.ruby }}>
              {loadingCampanii ? 'Se încarcă...' : '↻ Actualizează'}
            </button>
          </div>

          {campanii === null && (
            <p style={{ color: '#bbb', fontSize: '13px' }}>Apasă „Actualizează" pentru a vedea istoricul.</p>
          )}
          {campanii !== null && campanii.length === 0 && (
            <p style={{ color: '#bbb', fontSize: '13px' }}>Nicio campanie trimisă încă.</p>
          )}
          {campanii !== null && campanii.length > 0 && campanii.map(c => {
            const data = new Date(c.creat).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            const pct = c.total > 0 ? Math.round((c.trimise / c.total) * 100) : 0
            return (
              <div key={c.id} style={{ background: '#FAFAFA', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #F0E8DF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>{data}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: pct === 100 ? '#10B981' : pct > 0 ? '#F59E0B' : '#888' }}>
                    {pct}% trimis
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#444', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.mesaj}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                  <span style={{ color: '#10B981' }}>✓ {c.trimise} trimise</span>
                  <span style={{ color: '#F59E0B' }}>⏳ {c.pending} în așteptare</span>
                  {c.erori > 0 && <span style={{ color: '#EF4444' }}>✗ {c.erori} erori</span>}
                  <span style={{ color: '#aaa' }}>Total: {c.total}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function MeniuSalonTab({ token, clientiCount = 0, onNavigate }) {
  const [sectiune, setSectiune] = useState(null)

  function handleClick(sec) {
    if (!sec.ready) return
    if (sec.external) { onNavigate?.(sec.id) } else { setSectiune(sec.id) }
  }

  if (sectiune === 'servicii') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setSectiune(null)}
            style={{ background: 'white', border: '1px solid #E8DDD0', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Georgia, serif' }}>
            ← Meniu Salon
          </button>
          <span style={{ color: '#CCC', fontSize: '14px' }}>/</span>
          <span style={{ fontSize: '14px', color: s.text, fontFamily: 'Georgia, serif' }}>💅 Servicii</span>
        </div>
        <ServiciiTab />
      </div>
    )
  }

  if (sectiune === 'roata') {
    return <RoataAdmin token={token} onBack={() => setSectiune(null)} />
  }

  if (sectiune === 'sms') {
    return <SmsBulkSection token={token} clientiCount={clientiCount} onBack={() => setSectiune(null)} />
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'normal', margin: '0 0 6px', color: s.text, fontFamily: 'Georgia, serif' }}>Meniu Salon</h2>
        <p style={{ fontSize: '13px', color: '#AAA', margin: 0 }}>Gestionează tot ce ține de oferta salonului EVOLIS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
        {SECTIUNI.map(sec => (
          <div key={sec.id}
            onClick={() => handleClick(sec)}
            style={{
              background: 'white',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              borderTop: `4px solid ${sec.ready ? sec.color : '#DDD'}`,
              cursor: sec.ready ? 'pointer' : 'default',
              opacity: sec.ready ? 1 : 0.5,
              transition: 'transform 0.15s, box-shadow 0.15s',
              position: 'relative',
            }}
            onMouseEnter={e => { if (sec.ready) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.11)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)' }}>

            {!sec.ready && (
              <div style={{ position: 'absolute', top: '14px', right: '14px', background: '#F0EAE0', borderRadius: '20px', padding: '2px 10px', fontSize: '10px', color: '#AAA', letterSpacing: '0.5px', fontWeight: 'bold' }}>ÎN CURÂND</div>
            )}

            <div style={{ fontSize: '32px', marginBottom: '14px' }}>{sec.icon}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: s.text, marginBottom: '6px', fontFamily: 'Georgia, serif' }}>{sec.label}</div>
            <div style={{ fontSize: '13px', color: '#999', lineHeight: '1.5' }}>{sec.desc}</div>

            {sec.ready && (
              <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '4px', color: sec.color, fontSize: '13px', fontWeight: 'bold' }}>
                Deschide <span style={{ fontSize: '16px' }}>→</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
