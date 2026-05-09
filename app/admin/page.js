'use client'
import { useEffect, useState } from 'react'

export default function Admin() {
  const [programari, setProgramari] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/programare')
      .then(r => r.json())
      .then(data => { setProgramari(data.reverse()); setLoading(false) })
  }, [])

  return (
    <main className="min-h-screen p-8" style={{ background: '#F5EDE3' }}>
      <h1 className="text-3xl font-serif mb-8" style={{ color: '#C41E3A' }}>Programări — Admin</h1>

      {loading ? <p>Se încarcă...</p> : (
        <div className="space-y-4">
          {programari.length === 0 && <p className="text-gray-500">Nicio programare încă.</p>}
          {programari.map(p => (
            <div key={p.id} className="bg-white p-6" style={{ border: '1px solid #D4AF37' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-bold">{p.nume}</p>
                  <p className="text-gray-600">{p.telefon} {p.email && `· ${p.email}`}</p>
                  <p className="mt-2" style={{ color: '#C41E3A' }}>{p.serviciu}</p>
                  <p className="font-bold">{p.data} {p.ora && `· ${p.ora}`}</p>
                  {p.observatii && <p className="text-gray-500 text-sm mt-1">{p.observatii}</p>}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(p.creat).toLocaleDateString('ro-RO')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
