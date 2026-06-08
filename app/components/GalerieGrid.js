'use client'
import Image from 'next/image'
import { useRef } from 'react'

const ALBUM_SALON = [
  { src: '/galerie/salon-interior.jpg', label: 'Salonul EVOLIS' },
  { src: '/galerie/receptie.jpg', label: 'Primire & Consultație' },
  { src: '/galerie/clienta-fericita.jpg', label: 'Clientele Noastre' },
  { src: '/galerie/ambiance.jpg', label: 'Atmosfera EVOLIS' },
]

const ALBUM_LUCRARI = [
  { src: '/galerie/swarovski-detail.jpg', label: 'Design Swarovski' },
  { src: '/galerie/nail-art-aplicare.jpg', label: 'Nail Art Premium' },
  { src: '/galerie/freza-nail-art.jpg', label: 'Finishing Touch' },
  { src: '/galerie/andreea-lucreaza.jpg', label: 'Tehnică & Precizie' },
  { src: '/galerie/uv-lamp.jpg', label: 'Echipament Profesional' },
]

function Album({ titlu, subtitlu, poze }) {
  const ref = useRef(null)

  function scroll(dir) {
    if (ref.current) ref.current.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', maxWidth: '900px', margin: '0 auto 16px' }}>
        <div>
          <p style={{ color: '#9B1B30', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 4px' }}>{subtitlu}</p>
          <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', color: '#1C1C1C', margin: 0 }}>{titlu}</h4>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => scroll(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #C9A84C', background: 'white', cursor: 'pointer', fontSize: '16px', color: '#9B1B30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={() => scroll(1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #C9A84C', background: 'white', cursor: 'pointer', fontSize: '16px', color: '#9B1B30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      </div>

      <div ref={ref} style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '8px', maxWidth: '900px', margin: '0 auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {poze.map((foto, i) => (
          <div key={i} style={{ position: 'relative', flexShrink: 0, width: '260px', height: '260px', borderRadius: '16px', overflow: 'hidden', scrollSnapAlign: 'start', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <Image src={foto.src} alt={foto.label} fill style={{ objectFit: 'cover' }} sizes="260px" />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.55))', padding: '20px 12px 10px' }}>
              <p style={{ color: 'white', fontSize: '11px', letterSpacing: '1px', margin: 0, textAlign: 'center', fontFamily: 'Georgia, serif' }}>{foto.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GalerieGrid() {
  return (
    <div>
      <Album titlu="Salonul EVOLIS" subtitlu="✦ Spațiul nostru ✦" poze={ALBUM_SALON} />
      <Album titlu="Lucrările Noastre" subtitlu="✦ Portofoliu ✦" poze={ALBUM_LUCRARI} />
    </div>
  )
}
