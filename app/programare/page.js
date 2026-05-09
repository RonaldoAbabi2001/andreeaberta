import BookingForm from '../components/BookingForm'
import Link from 'next/link'

export default function Programare() {
  return (
    <main className="min-h-screen" style={{ background: '#F5EDE3' }}>
      <header style={{ background: '#C41E3A' }} className="py-6 px-8">
        <Link href="/" className="text-white text-2xl font-serif tracking-widest">ANDREEA BERTA</Link>
      </header>

      <section className="py-16 px-8 max-w-xl mx-auto">
        <h2 className="text-3xl font-serif text-center mb-2" style={{ color: '#C41E3A' }}>Programare online</h2>
        <p className="text-center text-gray-600 mb-10">Completează formularul și te contactăm pentru confirmare.</p>
        <BookingForm />
      </section>
    </main>
  )
}
