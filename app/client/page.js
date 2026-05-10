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

export default function ClientPage() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [programari, setProgramari] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('viitoare')

  useEffect(() => {
    const token = localStorage.getItem('client_token')
    if (!token) { router.push('/client/login'); return }
    fetch('/api/client/programari', { headers: { 'x-client-token': token } })
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push('/client/login'); return }
        setClient(data.client)
        setProgramari(data.programari || [])
        setLoading(false)
      })
  }, [])

  const today = new Date(); today.setHours(0,0,0,0)
  const viitoare = programari
    .filter(p => { const d = parseDateRO(p.data); return d && d >= today && p.status !== 'cancelled' })
    .sort((a,b) => parseDateRO(a.data) - parseDateRO(b.data))
  const trecute = programari
    .filter(p => { const d = parseDateRO(p.data); return !d || d < today || p.status === 'cancelled' })
    .sort((a,b) => parseDateRO(b.data) - parseDateRO(a.data))

  const urmatoarea = viitoare[0]
  const totalCheltuit = programari.filter(p => p.status === 'confirmed').reduce((s,p) => s + (Number(p.pret)||0), 0)
  const prenume = client?.nume?.split(' ')[0] || ''

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

      {/* Header transparent cu logo */}
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', fontSize: '16px', letterSpacing: '4px', textDecoration: 'none', opacity: 0.9 }}>ANDREEA BERTA</Link>
        <button onClick={() => { localStorage.removeItem('client_token'); router.push('/') }}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '50px', padding: '8px 18px', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', backdropFilter: 'blur(8px)' }}>
          Deconectează
        </button>
      </header>

      {/* Hero — bun venit */}
      <div style={{ background: 'linear-gradient(160deg, #9B1B30 0%, #6A1020 60%, #4A0D16 100%)', padding: '100px 40px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(201,168,76,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '16px' }}>✦ Bine ai revenit ✦</p>
        <h1 style={{ color: 'white', fontSize: '42px', fontWeight: 'normal', margin: '0 0 12px', letterSpacing: '1px' }}>
          {prenume}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', letterSpacing: '1px', margin: '0 0 40px' }}>
          {client?.telefon}
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { val: viitoare.length, label: 'Programări viitoare' },
            { val: programari.filter(p => p.status === 'confirmed').length, label: 'Vizite confirmate' },
            { val: trecute.length, label: 'Vizite efectuate' },
          ].map((st, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '18px 28px', minWidth: '130px' }}>
              <p style={{ color: 'white', fontSize: '26px', fontWeight: 'bold', margin: '0 0 4px' }}>{st.val}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', margin: 0 }}>{st.label}</p>
            </div>
          ))}
        </div>

        {/* Buton pagina principala */}
        <div style={{ marginTop: '28px' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '12px 30px', borderRadius: '50px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
            fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
            fontFamily: 'Georgia, serif',
          }}>
            <span style={{ color: '#C9A84C', fontSize: '9px' }}>✦</span>
            Pagina principală
            <span style={{ color: '#C9A84C', fontSize: '9px' }}>✦</span>
          </Link>
        </div>
      </div>

      {/* Urmatoarea programare */}
      {urmatoarea && (
        <div style={{ maxWidth: '640px', margin: '-32px auto 0', padding: '0 20px', position: 'relative', zIndex: 5 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 8px 40px rgba(155,27,48,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Urmează</p>
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
          </div>
        </div>
      )}

      {/* Conținut principal */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Tabs + buton programare */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[['viitoare', `Viitoare (${viitoare.length})`], ['trecute', `Istoric (${trecute.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                padding: '10px 22px', borderRadius: '50px', border: 'none', cursor: 'pointer',
                fontSize: '13px', letterSpacing: '0.5px',
                background: tab === id ? '#9B1B30' : 'white',
                color: tab === id ? 'white' : '#888',
                boxShadow: tab === id ? '0 4px 14px rgba(155,27,48,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                fontFamily: 'Georgia, serif',
                transition: 'all 0.2s',
              }}>{label}</button>
          ))}
          <Link href="/programare"
            style={{
              marginLeft: 'auto', padding: '10px 22px', borderRadius: '50px',
              background: 'linear-gradient(135deg, #C9A84C, #A8883A)',
              color: 'white', fontSize: '13px', fontWeight: '600',
              textDecoration: 'none', letterSpacing: '0.5px',
              boxShadow: '0 4px 14px rgba(201,168,76,0.35)',
              whiteSpace: 'nowrap',
            }}>
            + Rezervă
          </Link>
        </div>

        {/* Lista programări */}
        {(tab === 'viitoare' ? viitoare : trecute).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>{tab === 'viitoare' ? '🌸' : '📋'}</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1C1C1C', marginBottom: '8px', fontWeight: 'normal' }}>
              {tab === 'viitoare' ? 'Nicio programare viitoare' : 'Istoricul este gol'}
            </p>
            <p style={{ color: '#AAA', fontSize: '14px', marginBottom: '28px' }}>
              {tab === 'viitoare' ? 'Programează-te oricând, cu plăcere.' : 'Prima ta programare va apărea aici.'}
            </p>
            {tab === 'viitoare' && (
              <Link href="/programare" style={{ background: '#9B1B30', color: 'white', borderRadius: '50px', padding: '12px 28px', textDecoration: 'none', fontSize: '13px', letterSpacing: '1px' }}>
                REZERVĂ O ȘEDINȚĂ
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(tab === 'viitoare' ? viitoare : trecute).map((p, i) => {
              const st = STATUS[p.status] || STATUS.pending
              return (
                <div key={p.id} style={{
                  background: 'white', borderRadius: '18px', padding: '20px 24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  borderLeft: `3px solid ${st.dot}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '16px', color: '#1C1C1C', marginBottom: '6px', fontWeight: 'normal' }}>{p.serviciu}</p>
                    <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
                      {p.data}{p.ora ? ` · ${p.ora}` : ''} · {p.pret} lei
                    </p>
                    {p.observatii && <p style={{ color: '#CCC', fontSize: '12px', marginTop: '4px', fontStyle: 'italic', margin: '4px 0 0' }}>{p.observatii}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ color: st.dot, fontSize: '8px' }}>●</span>
                    <span style={{ color: st.color, fontSize: '12px', letterSpacing: '0.5px' }}>{st.label}</span>
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
