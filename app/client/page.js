'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

const STATUS_LABEL = {
  pending: { label: 'În așteptare', color: '#F59E0B', bg: '#FFFBEB' },
  confirmed: { label: 'Confirmată', color: '#10B981', bg: '#ECFDF5' },
  cancelled: { label: 'Anulată', color: '#EF4444', bg: '#FEF2F2' },
  noshow: { label: 'Neprezentată', color: '#6B7280', bg: '#F9FAFB' },
}

function parseDateRO(str) {
  if (!str) return null
  const LUNI_LIST = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']
  const parts = str.trim().split(' ')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const month = LUNI_LIST.indexOf(parts[1])
  const year = parseInt(parts[2])
  if (month === -1) return null
  return new Date(year, month, day)
}

export default function ClientDashboard() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [programari, setProgramari] = useState([])
  const [loading, setLoading] = useState(true)
  const [showChangePass, setShowChangePass] = useState(false)
  const [passForm, setPassForm] = useState({ noua: '', confirma: '' })
  const [passMsg, setPassMsg] = useState(null)
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

  async function changePassword(e) {
    e.preventDefault()
    if (passForm.noua !== passForm.confirma) { setPassMsg('Parolele nu coincid.'); return }
    if (passForm.noua.length < 4) { setPassMsg('Parola trebuie să aibă minim 4 caractere.'); return }
    const token = localStorage.getItem('client_token')
    const res = await fetch('/api/client/auth', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, parola_noua: passForm.noua })
    })
    const data = await res.json()
    if (data.success) {
      setPassMsg('✅ Parolă schimbată cu succes!')
      setPassForm({ noua: '', confirma: '' })
      setTimeout(() => { setShowChangePass(false); setPassMsg(null) }, 2000)
    }
  }

  function logout() {
    localStorage.removeItem('client_token')
    localStorage.removeItem('client_info')
    router.push('/client/login')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const viitoare = programari.filter(p => {
    const d = parseDateRO(p.data)
    return d && d >= today && p.status !== 'cancelled'
  }).sort((a, b) => parseDateRO(a.data) - parseDateRO(b.data))

  const trecute = programari.filter(p => {
    const d = parseDateRO(p.data)
    return !d || d < today || p.status === 'cancelled'
  }).sort((a, b) => parseDateRO(b.data) - parseDateRO(a.data))

  const totalCheltuit = programari
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + (Number(p.pret) || 0), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F4F0' }}>
      <p style={{ color: '#9B1B30', fontFamily: 'Georgia, serif', fontSize: '18px' }}>Se încarcă...</p>
    </div>
  )

  const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F4F0', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${s.ruby} 0%, #6A1020 100%)`, color: 'white', padding: '0 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '4px', opacity: 0.7, marginBottom: '4px' }}>✦ EVOLIS ✦</p>
              <h1 style={{ fontSize: '24px', fontWeight: 'normal', margin: 0 }}>Bună, {client?.nume?.split(' ')[0]}!</h1>
              <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>{client?.telefon}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => setShowChangePass(v => !v)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '20px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px' }}>
                🔑 Parolă
              </button>
              <button onClick={logout}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '20px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px' }}>
                Ieșire
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div><p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{viitoare.length}</p><p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>viitoare</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{programari.filter(p => p.status === 'confirmed').length}</p><p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>confirmate</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{totalCheltuit} lei</p><p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>total servicii</p></div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Schimbare parolă */}
        {showChangePass && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '14px', color: s.ruby }}>Schimbă parola</p>
            <form onSubmit={changePassword}>
              <input type="password" placeholder="Parolă nouă" required value={passForm.noua}
                onChange={e => setPassForm({ ...passForm, noua: e.target.value })}
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box' }} />
              <input type="password" placeholder="Confirmă parola nouă" required value={passForm.confirma}
                onChange={e => setPassForm({ ...passForm, confirma: e.target.value })}
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }} />
              {passMsg && <p style={{ color: passMsg.startsWith('✅') ? '#10B981' : '#EF4444', fontSize: '13px', marginBottom: '10px' }}>{passMsg}</p>}
              <button type="submit" style={{ background: s.ruby, color: 'white', border: 'none', borderRadius: '20px', padding: '10px 24px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                SALVEAZĂ PAROLA
              </button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[['viitoare', `Viitoare (${viitoare.length})`], ['trecute', `Istoric (${trecute.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', background: tab === id ? s.ruby : 'white', color: tab === id ? 'white' : '#555', boxShadow: tab === id ? 'none' : '0 1px 4px rgba(0,0,0,0.08)' }}>
              {label}
            </button>
          ))}
          <a href="/" style={{ marginLeft: 'auto', background: s.gold, color: 'white', borderRadius: '20px', padding: '10px 20px', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            + Programare nouă
          </a>
        </div>

        {/* Lista programări */}
        {(tab === 'viitoare' ? viitoare : trecute).length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#AAA', fontSize: '15px' }}>
              {tab === 'viitoare' ? 'Nu ai programări viitoare.' : 'Nu ai programări în istoric.'}
            </p>
            {tab === 'viitoare' && (
              <a href="/" style={{ display: 'inline-block', marginTop: '16px', background: s.ruby, color: 'white', borderRadius: '20px', padding: '10px 24px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                Fă o programare
              </a>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(tab === 'viitoare' ? viitoare : trecute).map(p => {
              const st = STATUS_LABEL[p.status] || STATUS_LABEL.pending
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${st.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{p.serviciu}</p>
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                        📅 {p.data} · {p.ora && `🕐 ${p.ora}`}
                      </p>
                      <p style={{ color: '#888', fontSize: '13px' }}>
                        💰 {p.pret} lei · {p.plata === 'numerar' ? 'Numerar' : 'Transfer bancar'}
                      </p>
                      {p.observatii && <p style={{ color: '#AAA', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>{p.observatii}</p>}
                    </div>
                    <span style={{ fontSize: '12px', background: st.bg, color: st.color, padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#CCC', fontSize: '12px', marginTop: '32px' }}>
          EVOLIS · B-dul Dacia nr. 6, Piatra Neamț
        </p>
      </div>
    </div>
  )
}
