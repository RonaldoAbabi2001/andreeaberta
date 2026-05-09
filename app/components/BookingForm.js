'use client'
import { useState } from 'react'

const SERVICII = [
  'Manichiură Gel',
  'Reconstrucție Amprentă',
  'Reconstrucție Tips',
  'Nail Art',
  'Retuș',
]

export default function BookingForm() {
  const [form, setForm] = useState({
    nume: '', telefon: '', email: '', serviciu: '', data: '', ora: '', observatii: ''
  })
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/programare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center p-10 bg-white border" style={{ borderColor: '#D4AF37' }}>
        <p className="text-2xl font-serif mb-4" style={{ color: '#C41E3A' }}>Cerere trimisă!</p>
        <p className="text-gray-600">Te contactăm în scurt timp pentru confirmare.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 space-y-5" style={{ border: '1px solid #D4AF37' }}>
      {[
        { label: 'Nume și prenume *', key: 'nume', type: 'text', required: true },
        { label: 'Telefon *', key: 'telefon', type: 'tel', required: true },
        { label: 'Email', key: 'email', type: 'email', required: false },
      ].map(({ label, key, type, required }) => (
        <div key={key}>
          <label className="block text-sm font-bold mb-1 tracking-wider">{label}</label>
          <input
            type={type}
            required={required}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            className="w-full border p-3 focus:outline-none"
            style={{ borderColor: '#D4AF37' }}
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-bold mb-1 tracking-wider">Serviciu *</label>
        <select
          required
          value={form.serviciu}
          onChange={e => setForm({ ...form, serviciu: e.target.value })}
          className="w-full border p-3 focus:outline-none"
          style={{ borderColor: '#D4AF37' }}
        >
          <option value="">Alege serviciul</option>
          {SERVICII.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1 tracking-wider">Data *</label>
          <input
            type="date"
            required
            value={form.data}
            onChange={e => setForm({ ...form, data: e.target.value })}
            className="w-full border p-3 focus:outline-none"
            style={{ borderColor: '#D4AF37' }}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 tracking-wider">Ora preferată</label>
          <input
            type="time"
            value={form.ora}
            onChange={e => setForm({ ...form, ora: e.target.value })}
            className="w-full border p-3 focus:outline-none"
            style={{ borderColor: '#D4AF37' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1 tracking-wider">Observații</label>
        <textarea
          value={form.observatii}
          onChange={e => setForm({ ...form, observatii: e.target.value })}
          rows={3}
          className="w-full border p-3 focus:outline-none"
          style={{ borderColor: '#D4AF37' }}
        />
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm">A apărut o eroare. Încearcă din nou.</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{ background: '#C41E3A', color: '#fff' }}
        className="w-full py-4 font-bold tracking-wider hover:opacity-90 transition"
      >
        {status === 'loading' ? 'Se trimite...' : 'TRIMITE CEREREA'}
      </button>
    </form>
  )
}
