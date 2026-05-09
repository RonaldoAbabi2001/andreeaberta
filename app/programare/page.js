import BookingForm from '../components/BookingForm'
import Link from 'next/link'

export default function Programare() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F7EFE5 0%, #EDE0D0 100%)' }}>
      <header style={{
        background: 'linear-gradient(135deg, #9B1B30 0%, #7A1525 100%)',
        padding: '20px 40px',
        boxShadow: '0 4px 20px rgba(155,27,48,0.3)'
      }}>
        <Link href="/" style={{ color: 'white', fontSize: '20px', letterSpacing: '4px', fontFamily: 'Georgia, serif', textDecoration: 'none' }}>
          ANDREEA BERTA
        </Link>
      </header>

      <section style={{ padding: '60px 20px', maxWidth: '560px', margin: '0 auto' }}>
        <p style={{ color: '#9B1B30', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '12px' }}>
          ✦ Rezervare ✦
        </p>
        <h2 style={{ fontSize: '32px', fontFamily: 'Georgia, serif', fontWeight: 'normal', textAlign: 'center', marginBottom: '8px', color: '#1C1C1C' }}>
          Programare online
        </h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '40px', fontSize: '15px' }}>
          Completează formularul și te contactăm pentru confirmare.
        </p>
        <BookingForm />
      </section>
    </main>
  )
}
