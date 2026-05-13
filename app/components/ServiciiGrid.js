'use client'
import { useState } from 'react'

const ruby = '#9B1B30'
const gold = '#C9A84C'
const nude = '#F7EFE5'

function Lightbox({ serviciu, photos, onClose }) {
  const [idx, setIdx] = useState(0)
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length)
  const next = () => setIdx(i => (i + 1) % photos.length)

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

        {/* Header */}
        <div style={{ width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', margin: '0 0 3px' }}>SERVICIU</p>
            <p style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '18px', margin: 0 }}>{serviciu.nume}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{idx + 1} / {photos.length}</span>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        {/* Imagine principală */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
          <img src={photos[idx].url} alt={photos[idx].titlu || serviciu.nume}
            style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '16px', display: 'block' }} />
          {photos.length > 1 && (
            <>
              <button onClick={prev} style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', color: 'white', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <button onClick={next} style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', color: 'white', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', maxWidth: '700px', padding: '4px' }}>
            {photos.map((ph, i) => (
              <img key={ph.id} src={ph.url} onClick={() => setIdx(i)}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', opacity: i === idx ? 1 : 0.45, border: i === idx ? `2px solid ${gold}` : '2px solid transparent', transition: 'opacity 0.2s', flexShrink: 0 }} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default function ServiciiGrid({ servicii, galerie }) {
  const [lightbox, setLightbox] = useState(null)

  const photoMap = {}
  galerie.forEach(g => {
    if (!photoMap[g.serviciu_id]) photoMap[g.serviciu_id] = []
    photoMap[g.serviciu_id].push(g)
  })

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
        {servicii.map(serv => {
          const photos = photoMap[serv.id] || []
          const cover = photos[0]

          return (
            <div key={serv.id} style={{ borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: 'white', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}>

              {/* Foto / placeholder */}
              <div onClick={() => cover && setLightbox(serv.id)}
                style={{ width: '100%', height: '200px', background: cover ? 'transparent' : `linear-gradient(135deg, ${nude} 0%, #E8D8CC 100%)`, cursor: cover ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>

                {cover ? (
                  <>
                    <img src={cover.url} alt={serv.nume} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {photos.length > 1 && (
                      <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.55)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📷 {photos.length}
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'} />
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px', opacity: 0.3 }}>💅</span>
                    <span style={{ fontSize: '11px', color: '#BBB', letterSpacing: '1px' }}>FOTO ÎN CURÂND</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '18px 20px', borderTop: `3px solid ${ruby}` }}>
                <h4 style={{ fontSize: '15px', fontFamily: 'Georgia, serif', color: '#1C1C1C', margin: 0, lineHeight: 1.4 }}>{serv.nume}</h4>
                {cover && (
                  <button onClick={() => setLightbox(serv.id)}
                    style={{ marginTop: '10px', background: 'none', border: `1px solid ${ruby}33`, borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', fontSize: '12px', color: ruby, fontFamily: 'Georgia, serif' }}>
                    Vezi exemple →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {lightbox && (() => {
        const serv = servicii.find(s => s.id === lightbox)
        const photos = photoMap[lightbox] || []
        if (!serv || photos.length === 0) return null
        return <Lightbox serviciu={serv} photos={photos} onClose={() => setLightbox(null)} />
      })()}
    </>
  )
}
