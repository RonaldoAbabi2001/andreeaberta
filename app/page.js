import Link from 'next/link'
import SpinWheel from './components/SpinWheel'
import ClientPortalSection from './components/ClientPortalSection'

const SERVICII = [
  { name: 'Manichiură Clasică', pret: '70 lei', durata: '30 min' },
  { name: 'Rubber Base cu Apex + 1 Design', pret: '145 lei', durata: '1h 20min' },
  { name: 'Ojă Semi + Culoare', pret: '140 lei', durata: '1h' },
  { name: 'Gel pe Unghia Naturală', pret: '150 lei', durata: '1h' },
  { name: 'Construcție Gel/Polygel', pret: 'de la 165 lei', durata: '1h 30min' },
  { name: 'Întreținere Gel/Polygel', pret: 'de la 145 lei', durata: '1h 30min' },
  { name: 'Construcție SLIM', pret: '210 lei', durata: '1h 40min' },
]

export default function Home() {
  return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #9B1B30 0%, #7A1525 100%)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(155,27,48,0.3)'
      }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', letterSpacing: '4px', margin: 0, fontFamily: 'Georgia, serif' }}>
            ANDREEA BERTA
          </h1>
          <p style={{ color: '#E2C97E', fontSize: '11px', letterSpacing: '3px', margin: '4px 0 0', textTransform: 'uppercase' }}>
            Salon EVOLIS · Piatra Neamț
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/client/login" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '10px 16px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.25)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
            Contul meu
          </Link>
          <Link href="/programare" className="btn-gold" style={{ fontSize: '13px', padding: '12px 28px' }}>
            REZERVAȚI
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #F7EFE5 0%, #EDE0D0 100%)',
        padding: '80px 40px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9B1B30', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px' }}>
          ✦ Salon de unghii premium ✦
        </p>
        <h2 style={{
          fontSize: '48px',
          fontFamily: 'Georgia, serif',
          color: '#1C1C1C',
          lineHeight: 1.2,
          marginBottom: '24px',
          fontWeight: 'normal'
        }}>
          Frumusețe cu <span style={{ color: '#9B1B30' }}>știință</span><br />
          și <span style={{ color: '#C9A84C' }}>pasiune</span>
        </h2>
        <p style={{ color: '#666', fontSize: '18px', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          Fiecare ședință este un moment dedicat în întregime dumneavoastră. Produse premium, tehnică certificată, atenție la fiecare detaliu.
        </p>
        <Link href="/programare" className="btn-primary" style={{ fontSize: '14px' }}>
          REZERVAȚI O ȘEDINȚĂ
        </Link>
      </section>

      {/* Portal client — apare doar daca e logat */}
      <ClientPortalSection />

      {/* Servicii */}
      <section style={{ padding: '80px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{ color: '#9B1B30', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '12px' }}>
          ✦ Ce vă oferim ✦
        </p>
        <h3 style={{ textAlign: 'center', fontSize: '36px', fontFamily: 'Georgia, serif', fontWeight: 'normal', marginBottom: '50px', color: '#1C1C1C' }}>
          Servicii & Tarife
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {SERVICII.map((s) => (
            <div key={s.name} className="card-3d" style={{ padding: '28px', borderTop: '3px solid #9B1B30' }}>
              <h4 style={{ fontSize: '16px', fontFamily: 'Georgia, serif', marginBottom: '12px', color: '#1C1C1C' }}>{s.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9B1B30', fontWeight: 'bold', fontSize: '18px' }}>{s.pret}</span>
                <span style={{ color: '#999', fontSize: '13px', background: '#F7EFE5', padding: '4px 12px', borderRadius: '20px' }}>{s.durata}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/programare" className="btn-primary">
            REZERVAȚI O ȘEDINȚĂ
          </Link>
        </div>
      </section>

      {/* Roata Norocului */}
      <section style={{ background: '#fff', padding: '20px 0' }}>
        <SpinWheel />
      </section>

      {/* Despre */}
      <section style={{ background: 'linear-gradient(135deg, #9B1B30 0%, #7A1525 100%)', padding: '80px 40px', textAlign: 'center' }}>
        <p style={{ color: '#E2C97E', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px' }}>✦ Povestea noastră ✦</p>
        <h3 style={{ color: 'white', fontSize: '36px', fontFamily: 'Georgia, serif', fontWeight: 'normal', marginBottom: '24px' }}>
          De ce EVOLIS?
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '17px', maxWidth: '600px', margin: '0 auto 16px', lineHeight: 1.8 }}>
          EVOLIS înseamnă <em>Evoluție + Vis</em>. Nu închiem o ședință — continuăm o relație.
          Fiecare clientă este tratată cu atenție, știință și căldură autentică.
        </p>
        <p style={{ color: '#E2C97E', fontSize: '14px', fontStyle: 'italic', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          „Consultarea nu începe cu pensula. Începe cu atenția."
        </p>
        <Link href="/programare" className="btn-gold">
          REZERVAȚI O ȘEDINȚĂ
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '14px', borderTop: '1px solid #F0E8DF' }}>
        <p style={{ color: '#9B1B30', fontFamily: 'Georgia, serif', fontSize: '18px', marginBottom: '8px' }}>ANDREEA BERTA</p>
        <p>Salon EVOLIS · Piatra Neamț · Instagram: @andreeaberta.ro</p>
        <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#bbb' }}>„Clienta nu își amintește cât a costat, ci cum s-a simțit."</p>
        <p style={{ marginTop: '8px' }}>© 2026 Toate drepturile rezervate</p>
      </footer>
    </main>
  )
}
