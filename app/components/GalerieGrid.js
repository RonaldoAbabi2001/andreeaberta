'use client'
import Image from 'next/image'

const POZE = [
  { src: '/galerie/salon-interior.jpg', label: 'Salonul EVOLIS' },
  { src: '/galerie/receptie.jpg', label: 'Primire & Consultație' },
  { src: '/galerie/clienta-fericita.jpg', label: 'Clientele Noastre' },
  { src: '/galerie/ambiance.jpg', label: 'Atmosfera EVOLIS' },
  { src: '/galerie/swarovski-detail.jpg', label: 'Design Swarovski' },
  { src: '/galerie/nail-art-aplicare.jpg', label: 'Nail Art Premium' },
  { src: '/galerie/freza-nail-art.jpg', label: 'Finishing Touch' },
  { src: '/galerie/andreea-lucreaza.jpg', label: 'Tehnică & Precizie' },
  { src: '/galerie/uv-lamp.jpg', label: 'Echipament Profesional' },
]

export default function GalerieGrid() {
  return (
    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '8px', maxWidth: '900px', margin: '0 auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {POZE.map((foto, i) => (
        <div key={i} style={{ position: 'relative', flexShrink: 0, width: '260px', height: '260px', borderRadius: '16px', overflow: 'hidden', scrollSnapAlign: 'start', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          <Image src={foto.src} alt={foto.label} fill style={{ objectFit: 'cover' }} sizes="260px" />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.55))', padding: '20px 12px 10px' }}>
            <p style={{ color: 'white', fontSize: '11px', letterSpacing: '1px', margin: 0, textAlign: 'center', fontFamily: 'Georgia, serif' }}>{foto.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
