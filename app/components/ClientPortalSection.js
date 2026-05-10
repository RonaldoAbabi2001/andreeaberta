'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

const STATUS = {
  pending:   { label: 'În așteptare', color: '#F59E0B', bg: '#FFFBEB' },
  confirmed: { label: 'Confirmată',   color: '#10B981', bg: '#ECFDF5' },
  cancelled: { label: 'Anulată',      color: '#EF4444', bg: '#FEF2F2' },
  noshow:    { label: 'Neprezentată', color: '#6B7280', bg: '#F9FAFB' },
}

function parseDateRO(str) {
  if (!str) return null
  const parts = str.trim().split(' ')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const month = LUNI.indexOf(parts[1])
  const year = parseInt(parts[2])
  if (month === -1 || isNaN(day) || isNaN(year)) return null
  return new Date(year, month, day)
}

export default function ClientPortalSection() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [programari, setProgramari] = useState([])
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('viitoare')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('client_token')
    if (!token) { setLoading(false); return }

    fetch('/api/client/programari', { headers: { 'x-client-token': token } })
      .then(r => r.json())
      .then(data => {
        if (data.error) { localStorage.removeItem('client_token'); setLoading(false); return }
        setClient(data.client)
        setProgramari(data.programari || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !client) return null

  const today = new Date(); today.setHours(0,0,0,0)

  const viitoare = programari
    .filter(p => { const d = parseDateRO(p.data); return d && d >= today && p.status !== 'cancelled' })
    .sort((a,b) => parseDateRO(a.data) - parseDateRO(b.data))

  const trecute = programari
    .filter(p => { const d = parseDateRO(p.data); return !d || d < today || p.status === 'cancelled' })
    .sort((a,b) => parseDateRO(b.data) - parseDateRO(a.data))

  const urmatoarea = viitoare[0]

  function logout() {
    localStorage.removeItem('client_token')
    localStorage.removeItem('client_info')
    setClient(null)
    setProgramari([])
  }

  const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5' }

  return (
    <section style={{ padding: '0 20px 60px', maxWidth: '680px', margin: '0 auto' }}>

      {/* Card principal */}
      <div style={{
        background: open
          ? 'white'
          : `linear-gradient(135deg, ${s.ruby} 0%, #6A1020 100%)`,
        borderRadius: '24px',
        boxShadow: open
          ? '0 8px 40px rgba(155,27,48,0.12)'
          : '0 12px 40px rgba(155,27,48,0.35)',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s',
      }}>

        {/* Header card — mereu vizibil */}
        <div
          onClick={() => setOpen(v => !v)}
          style={{
            cursor: 'pointer',
            padding: '28px 32px',
            background: `linear-gradient(135deg, ${s.ruby} 0%, #6A1020 100%)`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
              ✦ Contul tău EVOLIS
            </p>
            <h3 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', margin: '0 0 6px' }}>
              Bună, {client.nume?.split(' ')[0]}!
            </h3>
            {urmatoarea ? (
              <p style={{ color: '#E2C97E', fontSize: '13px', margin: 0 }}>
                Urmează: <strong>{urmatoarea.serviciu}</strong> · {urmatoarea.data} · {urmatoarea.ora}
              </p>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                Nu ai programări viitoare
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Stats pills */}
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '8px 14px' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{viitoare.length}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '1px', margin: 0 }}>viitoare</p>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '8px 14px' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{trecute.length}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '1px', margin: 0 }}>efectuate</p>
            </div>
            {/* Chevron */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: 'white',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}>▾</div>
          </div>
        </div>

        {/* Conținut expandabil */}
        {open && (
          <div style={{ padding: '24px 32px 28px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[['viitoare', `Viitoare (${viitoare.length})`], ['trecute', `Istoric (${trecute.length})`]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  style={{
                    padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: tab === id ? '600' : '400',
                    background: tab === id ? s.ruby : '#F0EAE0',
                    color: tab === id ? 'white' : '#666',
                    transition: 'background 0.15s',
                  }}>{label}</button>
              ))}
              <a href="/programare"
                style={{
                  marginLeft: 'auto', padding: '8px 18px', borderRadius: '20px',
                  background: s.gold, color: 'white',
                  fontSize: '13px', fontWeight: '600', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                + Programare nouă
              </a>
            </div>

            {/* Lista */}
            {(tab === 'viitoare' ? viitoare : trecute).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#AAA' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {tab === 'viitoare' ? '📅' : '📋'}
                </p>
                <p style={{ fontSize: '14px' }}>
                  {tab === 'viitoare' ? 'Nu ai programări viitoare.' : 'Istoricul este gol.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(tab === 'viitoare' ? viitoare : trecute).map(p => {
                  const st = STATUS[p.status] || STATUS.pending
                  return (
                    <div key={p.id} style={{
                      background: '#FAFAF8', borderRadius: '14px', padding: '16px 18px',
                      borderLeft: `4px solid ${st.color}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    }}>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>{p.serviciu}</p>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                          📅 {p.data}{p.ora ? ` · 🕐 ${p.ora}` : ''} · 💰 {p.pret} lei
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', background: st.bg, color: st.color, padding: '4px 12px', borderRadius: '20px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Footer card */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F0EAE0' }}>
              <button onClick={logout}
                style={{ background: 'none', border: 'none', color: '#AAA', fontSize: '12px', cursor: 'pointer', letterSpacing: '1px' }}>
                Ieșire din cont
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
