'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

const STATUS = {
  pending:   { label: 'În așteptare', color: '#C9A84C', dot: '#F59E0B' },
  confirmed: { label: 'Confirmată',   color: '#10B981', dot: '#10B981' },
  cancelled: { label: 'Anulată',      color: '#EF4444', dot: '#EF4444' },
  noshow:    { label: 'Neprezentată', color: '#9CA3AF', dot: '#9CA3AF' },
}

function parseDateRO(str) {
  if (!str) return null
  const parts = str.trim().split(' ')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const month = LUNI.indexOf(parts[1])
  const year = parseInt(parts[2])
  if (month === -1) return null
  return new Date(year, month, day)
}

function canCancel(p) {
  const d = parseDateRO(p.data)
  if (!d) return false
  if (p.ora) {
    const [h, m] = p.ora.split(':').map(Number)
    d.setHours(h, m, 0, 0)
  } else {
    d.setHours(23, 59, 0, 0)
  }
  return d.getTime() - Date.now() >= 24 * 60 * 60 * 1000
}

export default function ClientPage() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [programari, setProgramari] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelError, setCancelError] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [token, setToken] = useState(null)

  function loadData(tok) {
    fetch('/api/client/programari', { headers: { 'x-client-token': tok } })
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push('/client/login'); return }
        setClient(data.client)
        setProgramari(data.programari || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    const tok = localStorage.getItem('client_token')
    if (!tok) { router.push('/client/login'); return }
    setToken(tok)
    loadData(tok)
  }, [])

  async function cancelBooking(id) {
    setCancellingId(id)
    setCancelError(null)
    const res = await fetch('/api/client/programari', {
      method: 'PATCH',
      headers: { 'x-client-token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.error) {
      setCancelError(data.error)
      setCancellingId(null)
    } else {
      setConfirmCancel(false)
      setCancellingId(null)
      loadData(token)
    }
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)

  const urmatoarea = programari
    .filter(p => { const d = parseDateRO(p.data); return d && d >= today && p.status !== 'cancelled' })
    .sort((a, b) => parseDateRO(a.data) - parseDateRO(b.data))[0]

  const istoric = programari
    .filter(p => { const d = parseDateRO(p.data); return !d || d < today || p.status === 'cancelled' })
    .sort((a, b) => parseDateRO(b.data) - parseDateRO(a.data))

  const prenume = client?.nume?.split(' ')[0] || ''
  const nrConfirmate = programari.filter(p => p.status === 'confirmed').length
  const nrViitoare = programari.filter(p => { const d = parseDateRO(p.data); return d && d >= today && p.status !== 'cancelled' }).length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FDF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #F0EAE0', borderTop: '3px solid #9B1B30', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#9B1B30', fontFamily: 'Georgia, serif', fontSize: '16px', letterSpacing: '2px' }}>Se încarcă...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F3', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', fontSize: '16px', letterSpacing: '4px', textDecoration: 'none', opacity: 0.9 }}>ANDREEA BERTA</Link>
        <button onClick={() => { localStorage.removeItem('client_token'); localStorage.removeItem('client_info'); router.push('/') }}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '50px', padding: '8px 18px', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', backdropFilter: 'blur(8px)' }}>
          Deconectează
        </button>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #9B1B30 0%, #6A1020 60%, #4A0D16 100%)', padding: '100px 40px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(201,168,76,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '16px' }}>✦ Bine ai revenit ✦</p>
        <h1 style={{ color: '#F0DFC0', fontSize: '42px', fontWeight: 'normal', margin: '0 0 12px', letterSpacing: '1px' }}>{prenume}</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', letterSpacing: '1px', margin: '0 0 40px' }}>{client?.telefon}</p>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { val: nrViitoare, label: 'Programări viitoare' },
            { val: nrConfirmate, label: 'Vizite confirmate' },
            { val: istoric.filter(p => p.status !== 'cancelled').length, label: 'Vizite efectuate' },
          ].map((st, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '18px 28px', minWidth: '130px' }}>
              <p style={{ color: 'white', fontSize: '26px', fontWeight: 'bold', margin: '0 0 4px' }}>{st.val}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', margin: 0 }}>{st.label}</p>
            </div>
          ))}
        </div>

        {/* Buton pagina principala */}
        <div style={{ marginTop: '32px' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            padding: '14px 36px', borderRadius: '50px',
            background: 'linear-gradient(135deg, #F9E4A0 0%, #C9A84C 40%, #A8883A 65%, #F5D07A 100%)',
            boxShadow: '0 4px 24px rgba(201,168,76,0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
            color: '#5C3D00', textDecoration: 'none',
            fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
            fontFamily: 'Georgia, serif', fontWeight: 'bold',
            position: 'relative', overflow: 'hidden',
          }}>
            <span style={{ position: 'absolute', top: '3px', left: '18px', width: '32px', height: '5px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', transform: 'rotate(-20deg)', pointerEvents: 'none' }} />
            <span style={{ fontSize: '10px', opacity: 0.8 }}>✦</span>
            Pagina principală
            <span style={{ fontSize: '10px', opacity: 0.8 }}>✦</span>
          </Link>
        </div>
      </div>

      {/* Loyalty Widget */}
      {client && (
        (() => {
          const puncte = Number(client.puncte) || 0
          const vizite = Number(client.vizite_total) || 0
          const GOAL = 500
          const pct = Math.min(100, Math.round((puncte / GOAL) * 100))
          const badge = vizite >= 50 ? { icon: '🌟', label: 'Legendă' }
            : vizite >= 20 ? { icon: '👑', label: 'Client VIP' }
            : vizite >= 10 ? { icon: '💎', label: 'Client de Top' }
            : vizite >= 5  ? { icon: '⭐', label: 'Client Fidel' }
            : null
          return (
            <div style={{ maxWidth: '640px', margin: '24px auto 0', padding: '0 20px', position: 'relative', zIndex: 4 }}>
              <div style={{ background: 'white', borderRadius: '20px', padding: '20px 24px', boxShadow: '0 4px 20px rgba(155,27,48,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 2px' }}>Puncte EVOLIS</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#9B1B30', margin: 0 }}>{puncte} <span style={{ fontSize: '13px', color: '#AAA', fontWeight: 'normal' }}>/ {GOAL} pt</span></p>
                  </div>
                  {badge && (
                    <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #FDF8F3, #F5E8C8)', border: '1px solid #C9A84C', borderRadius: '12px', padding: '8px 14px' }}>
                      <p style={{ fontSize: '20px', margin: '0 0 2px' }}>{badge.icon}</p>
                      <p style={{ fontSize: '10px', color: '#9B1B30', letterSpacing: '1px', margin: 0, fontWeight: 'bold' }}>{badge.label}</p>
                    </div>
                  )}
                </div>
                <div style={{ background: '#F0EAE0', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #C9A84C, #9B1B30)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <p style={{ color: '#AAA', fontSize: '11px', marginTop: '8px', marginBottom: 0 }}>
                  {puncte >= GOAL ? '🎁 Ai atins 500 puncte — contactează-ne pentru recompensă!' : `Mai ai ${GOAL - puncte} puncte până la recompensă`}
                </p>
              </div>
            </div>
          )
        })()
      )}

      {/* Urmează + buton rezervă */}
      <div style={{ maxWidth: '640px', margin: '16px auto 0', padding: '0 20px', position: 'relative', zIndex: 5 }}>

        {urmatoarea ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 8px 40px rgba(155,27,48,0.12)', border: '1px solid rgba(201,168,76,0.2)', marginBottom: '16px' }}>
            <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Manichiura care urmează</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '20px', color: '#1C1C1C', marginBottom: '6px', fontWeight: 'normal' }}>{urmatoarea.serviciu}</p>
                <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                  📅 {urmatoarea.data}
                  {urmatoarea.ora && <span> &nbsp;·&nbsp; 🕐 {urmatoarea.ora}</span>}
                  <span> &nbsp;·&nbsp; 💰 {urmatoarea.pret} lei</span>
                </p>
              </div>
              <span style={{ background: '#ECFDF5', color: '#10B981', fontSize: '12px', fontWeight: '600', padding: '6px 14px', borderRadius: '20px', letterSpacing: '0.5px', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
                ✓ Confirmată
              </span>
            </div>

            {/* Buton anulare */}
            {canCancel(urmatoarea) && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #F5F0EB', paddingTop: '16px' }}>
                {!confirmCancel ? (
                  <button onClick={() => { setConfirmCancel(true); setCancelError(null) }}
                    style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '50px', padding: '8px 20px', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.5px' }}>
                    Anulează programarea
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>Ești sigură că vrei să anulezi programarea din <strong>{urmatoarea.data}</strong>?</p>
                    {cancelError && <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>{cancelError}</p>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => cancelBooking(urmatoarea.id)} disabled={cancellingId === urmatoarea.id}
                        style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '50px', padding: '9px 20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        {cancellingId === urmatoarea.id ? 'Se anulează...' : 'Da, anulează'}
                      </button>
                      <button onClick={() => { setConfirmCancel(false); setCancelError(null) }}
                        style={{ background: '#F0EAE0', color: '#888', border: 'none', borderRadius: '50px', padding: '9px 20px', cursor: 'pointer', fontSize: '12px' }}>
                        Nu, păstrează
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!canCancel(urmatoarea) && urmatoarea.status !== 'cancelled' && (
              <p style={{ marginTop: '12px', fontSize: '11px', color: '#CCC', borderTop: '1px solid #F5F0EB', paddingTop: '12px' }}>
                Anularea nu mai este posibilă — mai puțin de 24h până la programare.
              </p>
            )}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 8px 40px rgba(155,27,48,0.08)', border: '1px solid #F0EAE0', marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🌸</p>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px' }}>Nicio programare viitoare</p>
            <p style={{ color: '#CCC', fontSize: '12px', margin: 0 }}>Programează-te oricând, cu plăcere.</p>
          </div>
        )}

        <Link href="/programare" style={{
          display: 'block', textAlign: 'center',
          padding: '13px', borderRadius: '50px',
          background: 'linear-gradient(135deg, #C9A84C, #A8883A)',
          color: 'white', fontSize: '13px', fontWeight: '600',
          textDecoration: 'none', letterSpacing: '0.5px',
          boxShadow: '0 4px 14px rgba(201,168,76,0.35)',
          marginBottom: '40px',
        }}>
          + Rezervă o nouă ședință
        </Link>
      </div>

      {/* Istoric */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px 80px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'normal', color: '#1C1C1C', marginBottom: '16px' }}>
          Istoricul tău <span style={{ fontSize: '14px', color: '#AAA', fontWeight: 'normal' }}>({istoric.length})</span>
        </p>

        {istoric.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px' }}>📋</p>
            <p style={{ color: '#888', fontSize: '14px' }}>Prima ta programare va apărea aici.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {istoric.map(p => {
              const st = STATUS[p.status] || STATUS.pending
              return (
                <div key={p.id} style={{
                  background: 'white', borderRadius: '16px', padding: '18px 22px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  borderLeft: `3px solid ${st.dot}`,
                  opacity: p.status === 'cancelled' ? 0.65 : 1,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', color: '#1C1C1C', marginBottom: '5px', fontWeight: 'normal' }}>{p.serviciu}</p>
                    <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
                      {p.data}{p.ora ? ` · ${p.ora}` : ''} · {p.pret} lei
                    </p>
                    {p.observatii && <p style={{ color: '#CCC', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>{p.observatii}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ color: st.dot, fontSize: '8px' }}>●</span>
                    <span style={{ color: st.color, fontSize: '12px' }}>{st.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingBottom: '48px' }}>
        <p style={{ color: '#CCC', fontSize: '11px', letterSpacing: '2px' }}>EVOLIS · B-dul Dacia nr. 6, Piatra Neamț</p>
      </div>
    </div>
  )
}
