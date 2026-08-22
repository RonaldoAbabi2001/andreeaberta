import Link from 'next/link'
import SpinWheel from './components/SpinWheel'
import ClientHeaderButton from './components/ClientHeaderButton'
import SocialIcons from './components/SocialIcons'
import GalerieGrid from './components/GalerieGrid'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NailSalon',
  name: 'EVOLIS MANI — Andreea Berta',
  image: 'https://www.andreeaberta.com/icon-512.png',
  url: 'https://www.andreeaberta.com',
  telephone: '+40793234142',
  priceRange: '$$',
  currenciesAccepted: 'RON',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'B-dul Dacia nr. 6, Bloc E1',
    addressLocality: 'Piatra Neamț',
    addressRegion: 'Neamț',
    postalCode: '610019',
    addressCountry: 'RO',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 46.9294, longitude: 26.3706 },
  areaServed: { '@type': 'City', name: 'Piatra Neamț' },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00', closes: '19:00',
  }],
  sameAs: [
    'https://www.instagram.com/andreeaberta.ro',
    'https://www.tiktok.com/@andreeaberta.ro',
  ],
  description: 'Salon de unghii premium în Piatra Neamț — manichiură, unghii cu gel, semipermanent și nail art. Andreea Berta, tehnician onicolog certificat. Programează online.',
}

export default function Home() {
  return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #9B1B30 0%, #7A1525 100%)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(155,27,48,0.3)',
        gap: '12px',
      }}>
        <div style={{ minWidth: 0, flexShrink: 1 }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(14px, 4vw, 22px)', letterSpacing: 'clamp(1px, 1vw, 4px)', margin: 0, fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}>
            ANDREEA BERTA
          </h1>
          <p style={{ color: '#E2C97E', fontSize: 'clamp(9px, 2vw, 11px)', letterSpacing: '2px', margin: '4px 0 0', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Salon EVOLIS · Piatra Neamț
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <ClientHeaderButton />
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #F7EFE5 0%, #EDE0D0 100%)',
        padding: '80px 40px 40px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9B1B30', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px' }}>
          ✦ Salon de unghii premium în Piatra Neamț ✦
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
        <SocialIcons marginTop="24px" />
      </section>

      {/* Ce oferim */}
      <section style={{ padding: '80px 40px', maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#9B1B30', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px' }}>
          ✦ Pentru dumneavoastră ✦
        </p>
        <h3 style={{ fontSize: '36px', fontFamily: 'Georgia, serif', fontWeight: 'normal', marginBottom: '40px', color: '#1C1C1C', lineHeight: 1.3 }}>
          Nu vindem un serviciu.<br />
          <span style={{ color: '#9B1B30' }}>Creăm o experiență.</span>
        </h3>

        <p style={{ color: '#555', fontSize: '17px', lineHeight: 1.9, marginBottom: '32px' }}>
          Fiecare clientă care intră la EVOLIS este ascultată înainte de a fi servită.
          Consultarea nu începe cu pensula — începe cu atenția. Înțelegem stilul dumneavoastră,
          starea unghiilor, ritmul vieții. Abia apoi începem.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', margin: '48px 0', textAlign: 'left' }}>
          {[
            { titlu: 'Manichiură & Unghii', desc: 'Gel, acryl, semipermanent — aplicat cu precizie certificată și produse de calitate europeană.' },
            { titlu: 'Nail Art & Design', desc: 'De la linii curate la cristale Swarovski — fiecare design este adaptat personalității dumneavoastră.' },
            { titlu: 'Consultație inclusă', desc: 'Fiecare ședință include o consultație a plăcii unghiale. Sănătatea vine înainte de estetică.' },
            { titlu: 'Relație pe termen lung', desc: 'Nu închidem o ședință — continuăm o relație. Clientele noastre revin pentru că se simt acasă.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '24px', background: '#F7EFE5', borderRadius: '16px', borderLeft: '3px solid #9B1B30' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#1C1C1C', marginBottom: '8px', fontWeight: 'bold' }}>{item.titlu}</p>
              <p style={{ color: '#777', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <blockquote style={{ borderLeft: 'none', margin: '0 0 40px', padding: 0 }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#9B1B30', fontStyle: 'italic', lineHeight: 1.6 }}>
            „Perfecțiunea tehnică impresionează.<br />Perfecțiunea comportamentului fidelizează."
          </p>
        </blockquote>

        <Link href="/programare" className="btn-primary">
          REZERVAȚI O ȘEDINȚĂ
        </Link>
      </section>

      {/* Galerie */}
      <section style={{ background: 'linear-gradient(160deg, #F7EFE5 0%, #EDE0D0 100%)', padding: '48px 0 56px' }}>
        <GalerieGrid />
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
        <p style={{ color: '#9B1B30', fontFamily: 'Georgia, serif', fontSize: '18px', marginBottom: '8px' }}>ANDREEA BERTA — Salon de unghii Piatra Neamț</p>
        <p>Salon EVOLIS MANI · B-dul Dacia nr. 6, Bloc E1, Piatra Neamț, jud. Neamț</p>
        <p style={{ marginTop: '4px' }}>Telefon: <a href="tel:+40793234142" style={{ color: '#9B1B30' }}>0793 234 142</a> · Instagram: @andreeaberta.ro</p>

        <SocialIcons marginTop="16px" />
        <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#bbb' }}>„Clienta nu își amintește cât a costat, ci cum s-a simțit."</p>
        <p style={{ marginTop: '8px' }}>© 2026 Toate drepturile rezervate</p>
      </footer>
    </main>
  )
}
