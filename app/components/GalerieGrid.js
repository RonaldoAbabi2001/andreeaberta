'use client'

const POZE = [
  { src: '/galerie/salon-interior.jpg', label: 'Salonul EVOLIS' },
  { src: '/galerie/receptie.jpg', label: 'Primire & Consultație' },
  { src: '/galerie/andreea-lucreaza.jpg', label: 'Tehnică & Precizie' },
  { src: '/galerie/swarovski-detail.jpg', label: 'Design Swarovski' },
  { src: '/galerie/nail-art-aplicare.jpg', label: 'Nail Art Premium' },
  { src: '/galerie/freza-nail-art.jpg', label: 'Finishing Touch' },
  { src: '/galerie/clienta-fericita.jpg', label: 'Clientele Noastre' },
  { src: '/galerie/uv-lamp.jpg', label: 'Echipament Profesional' },
  { src: '/galerie/ambiance.jpg', label: 'Atmosfera EVOLIS' },
]

export default function GalerieGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '900px', margin: '0 auto' }}>
      {POZE.map((foto, i) => (
        <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          <img
            src={foto.src}
            alt={foto.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.55))', padding: '24px 12px 10px', borderRadius: '0 0 16px 16px' }}>
            <p style={{ color: 'white', fontSize: '12px', letterSpacing: '1px', margin: 0, textAlign: 'center', fontFamily: 'Georgia, serif' }}>{foto.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
