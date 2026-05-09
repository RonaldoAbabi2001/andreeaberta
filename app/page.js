import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#fff' }}>
      {/* Header */}
      <header style={{ background: '#C41E3A' }} className="py-6 px-8 flex justify-between items-center">
        <div>
          <h1 className="text-white text-2xl font-serif tracking-widest">ANDREEA BERTA</h1>
          <p style={{ color: '#D4AF37' }} className="text-sm tracking-widest uppercase">Salon EVOLIS — Piatra Neamț</p>
        </div>
        <Link href="/programare"
          style={{ background: '#D4AF37', color: '#1a1a1a' }}
          className="px-6 py-3 font-bold tracking-wider hover:opacity-90 transition">
          PROGRAMEAZĂ-TE
        </Link>
      </header>

      {/* Hero */}
      <section style={{ background: '#F5EDE3' }} className="py-20 px-8 text-center">
        <p style={{ color: '#C41E3A' }} className="text-sm tracking-widest uppercase mb-4">Salon de unghii premium</p>
        <h2 className="text-5xl font-serif mb-6" style={{ color: '#1a1a1a' }}>
          Frumusețe cu<br />
          <span style={{ color: '#C41E3A' }}>știință</span> și <span style={{ color: '#D4AF37' }}>pasiune</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-10">
          Salon EVOLIS — unde fiecare detaliu contează. Unghii perfecte, produse premium, tehnică certificată.
        </p>
        <Link href="/programare"
          style={{ background: '#C41E3A', color: '#fff' }}
          className="px-10 py-4 text-lg tracking-wider hover:opacity-90 transition inline-block">
          REZERVĂ O PROGRAMARE
        </Link>
      </section>

      {/* Servicii */}
      <section className="py-16 px-8 max-w-4xl mx-auto">
        <h3 className="text-center text-3xl font-serif mb-12" style={{ color: '#C41E3A' }}>Servicii</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Manichiură Gel', price: 'de la 120 lei', desc: 'Baze, culori, nail art — rezultate de durată' },
            { name: 'Reconstrucție', price: 'de la 180 lei', desc: 'Extensii, amprentă, modelare profesională' },
            { name: 'Nail Art', price: 'de la 150 lei', desc: 'Desene, pietre, folii — creativitate fără limite' },
          ].map((s) => (
            <div key={s.name} className="text-center p-8 border" style={{ borderColor: '#D4AF37' }}>
              <h4 className="text-xl font-serif mb-2">{s.name}</h4>
              <p style={{ color: '#C41E3A' }} className="font-bold mb-3">{s.price}</p>
              <p className="text-gray-600 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#C41E3A' }} className="py-16 text-center">
        <h3 className="text-white text-3xl font-serif mb-6">Gata să îți transformi unghiile?</h3>
        <Link href="/programare"
          style={{ background: '#D4AF37', color: '#1a1a1a' }}
          className="px-10 py-4 text-lg font-bold tracking-wider hover:opacity-90 transition inline-block">
          PROGRAMEAZĂ-TE ACUM
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Andreea Berta — Salon EVOLIS, Piatra Neamț</p>
        <p className="mt-1">Instagram: <span style={{ color: '#C41E3A' }}>@andreeaberta.ro</span></p>
      </footer>
    </main>
  )
}
