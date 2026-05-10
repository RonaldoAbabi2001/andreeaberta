import BookingFlow from '../components/BookingFlow'
import Link from 'next/link'
import ClientHeaderButton from '../components/ClientHeaderButton'

export default function Programare() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F7EFE5 0%, #EDE0D0 100%)' }}>
      <header style={{
        background: 'linear-gradient(135deg, #9B1B30 0%, #7A1525 100%)',
        padding: '20px 40px',
        boxShadow: '0 4px 20px rgba(155,27,48,0.3)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Link href="/" style={{ color: 'white', fontSize: '20px', letterSpacing: '4px', fontFamily: 'Georgia, serif', textDecoration: 'none' }}>
          ANDREEA BERTA
        </Link>
        <ClientHeaderButton />
      </header>

      <section style={{ padding: '40px 20px 80px', maxWidth: '600px', margin: '0 auto' }}>
        <BookingFlow />
      </section>
    </main>
  )
}
