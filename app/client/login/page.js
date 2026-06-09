'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientLogin() {
  const [form, setForm] = useState({ telefon: '', parola: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/client/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('client_token', data.token)
      localStorage.setItem('client_info', JSON.stringify({ nume: data.nume, telefon: data.telefon, email: data.email }))
      router.push('/client')
    } else {
      setError(data.error || 'Eroare la autentificare.')
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #9B1B30 0%, #7A1525 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <p style={{ color: '#9B1B30', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>✦ Contul meu ✦</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', textAlign: 'center', marginBottom: '8px' }}>Bine ai venit</h1>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '32px' }}>Intră în contul tău pentru a-ți vedea programările</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>Număr de telefon</label>
            <input
              type="tel"
              required
              value={form.telefon}
              onChange={e => setForm({ ...form, telefon: e.target.value })}
              className="input-field"
              placeholder="07xxxxxxxx"
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>Parolă</label>
            <input type="password" required value={form.parola}
              onChange={e => setForm({ ...form, parola: e.target.value })}
              className="input-field" />
          </div>

          <p style={{ fontSize: '12px', color: '#AAA', marginBottom: '24px' }}>
            La prima autentificare, parola este <strong>numărul tău de telefon</strong>.
          </p>

          {error && <p style={{ color: '#9B1B30', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', textAlign: 'center', padding: '14px', fontSize: '13px' }}>
            {loading ? 'Se verifică...' : 'INTRĂ ÎN CONT'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #F0EAE0', paddingTop: '20px' }}>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>Nu ai un cont încă?</p>
          <a href="/" style={{ color: '#9B1B30', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none' }}>
            Fă o programare → contul se creează automat
          </a>
        </div>
      </div>
    </main>
  )
}
