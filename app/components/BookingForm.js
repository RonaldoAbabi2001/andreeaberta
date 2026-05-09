'use client'
import { useState } from 'react'

const SERVICII = [
  { name: 'Manichiură Clasică', pret: '70 lei', durata: 30 },
  { name: 'Rubber Base cu Apex + 1 Design', pret: '145 lei', durata: 80 },
  { name: 'Ojă Semi + Culoare', pret: '140 lei', durata: 60 },
  { name: 'Gel pe Unghia Naturală (fără design)', pret: '150 lei', durata: 60 },
  { name: 'Construcție Gel/Polygel 1-2 (fără design)', pret: '165 lei', durata: 90 },
  { name: 'Construcție Gel/Polygel 3-4 (fără design)', pret: '175 lei', durata: 90 },
  { name: 'Construcție Gel/Polygel 4+ (fără design)', pret: '185 lei', durata: 90 },
  { name: 'Întreținere Gel/Polygel 1-2', pret: '145 lei', durata: 90 },
  { name: 'Întreținere Gel/Polygel 3-4', pret: '155 lei', durata: 90 },
  { name: 'Întreținere Gel/Polygel 4+', pret: '165 lei', durata: 90 },
  { name: 'Întreținere din altă parte', pret: '20 lei', durata: 10 },
  { name: 'Construcție SLIM', pret: '210 lei', durata: 100 },
  { name: 'Îndepărtare material tehnic', pret: '25 lei', durata: 15 },
  { name: 'Design per unghie', pret: '5 lei/unghie', durata: 5 },
  { name: 'French / Babyboomer / Culoare', pret: '15 lei', durata: 15 },
  { name: 'Taxă întreținere după 4 săptămâni', pret: '20 lei', durata: 5 },
]

function generateSlots(durata) {
  const slots = []
  const start = 9 * 60  // 09:00
  const breakStart = 12 * 60  // 12:00
  const breakEnd = 13 * 60    // 13:00
  const end = 19 * 60         // 19:00

  let current = start
  while (current + durata <= end) {
    if (current < breakStart || current >= breakEnd) {
      const h = Math.floor(current / 60).toString().padStart(2, '0')
      const m = (current % 60).toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
    }
    current += durata
  }
  return slots
}

export default function BookingForm() {
  const [form, setForm] = useState({
    nume: '', telefon: '', email: '', serviciu: '', data: '', ora: '', observatii: ''
  })
  const [status, setStatus] = useState(null)

  const serviciiSelectat = SERVICII.find(s => s.name === form.serviciu)
  const slots = serviciiSelectat ? generateSlots(serviciiSelectat.durata) : []

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/programare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <p style={{ fontSize: '24px', fontFamily: 'Georgia, serif', color: '#9B1B30', marginBottom: '12px' }}>
          Cerere trimisă!
        </p>
        <p style={{ color: '#666', lineHeight: 1.7 }}>
          Îți mulțumim! Te contactăm în scurt timp pe <strong>{form.telefon}</strong> pentru confirmare.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'white',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
          Nume și prenume *
        </label>
        <input
          type="text" required
          value={form.nume}
          onChange={e => setForm({ ...form, nume: e.target.value })}
          className="input-field"
          placeholder="Ex: Maria Ionescu"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
          Telefon *
        </label>
        <input
          type="tel" required
          value={form.telefon}
          onChange={e => setForm({ ...form, telefon: e.target.value })}
          className="input-field"
          placeholder="07XX XXX XXX"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="input-field"
          placeholder="optional"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
          Serviciu *
        </label>
        <select
          required
          value={form.serviciu}
          onChange={e => setForm({ ...form, serviciu: e.target.value, ora: '' })}
          className="input-field"
        >
          <option value="">Alege serviciul</option>
          {SERVICII.map(s => (
            <option key={s.name} value={s.name}>{s.name} — {s.pret}</option>
          ))}
        </select>
      </div>

      {form.serviciu && (
        <div style={{ background: '#F7EFE5', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#9B1B30' }}>
          ⏱ Durată estimată: {serviciiSelectat?.durata} minute
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
            Data *
          </label>
          <input
            type="date" required
            min={today}
            value={form.data}
            onChange={e => setForm({ ...form, data: e.target.value, ora: '' })}
            className="input-field"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
            Ora *
          </label>
          <select
            required
            value={form.ora}
            onChange={e => setForm({ ...form, ora: e.target.value })}
            className="input-field"
            disabled={!form.serviciu || !form.data}
          >
            <option value="">Alege ora</option>
            {slots.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
          Observații
        </label>
        <textarea
          value={form.observatii}
          onChange={e => setForm({ ...form, observatii: e.target.value })}
          rows={3}
          className="input-field"
          placeholder="Alergii, preferințe, întrebări..."
        />
      </div>

      {status === 'error' && (
        <p style={{ color: '#9B1B30', fontSize: '14px', marginBottom: '16px' }}>
          A apărut o eroare. Încearcă din nou.
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={status === 'loading'}
        style={{ width: '100%', textAlign: 'center', fontSize: '14px', padding: '16px' }}>
        {status === 'loading' ? 'Se trimite...' : 'TRIMITE CEREREA'}
      </button>
    </form>
  )
}
