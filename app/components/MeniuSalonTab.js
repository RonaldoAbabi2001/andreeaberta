'use client'
import { useState } from 'react'
import ServiciiTab from './ServiciiTab'

const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', text: '#1C1C1C' }

const SECTIUNI = [
  {
    id: 'servicii',
    icon: '💅',
    label: 'Servicii',
    desc: 'Gestionează lista de servicii și prețuri',
    color: s.ruby,
    ready: true,
  },
  {
    id: 'pachete',
    icon: '🎁',
    label: 'Pachete',
    desc: 'Combină servicii în pachete cu preț special',
    color: '#065F46',
    ready: false,
  },
  {
    id: 'promotii',
    icon: '🏷️',
    label: 'Promoții',
    desc: 'Reduceri, coduri, oferte sezoniere',
    color: '#0369A1',
    ready: false,
  },
  {
    id: 'categorii',
    icon: '📂',
    label: 'Categorii',
    desc: 'Organizează serviciile pe categorii',
    color: '#7C3AED',
    ready: false,
  },
]

export default function MeniuSalonTab() {
  const [sectiune, setSectiune] = useState(null)

  if (sectiune === 'servicii') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setSectiune(null)}
            style={{ background: 'white', border: '1px solid #E8DDD0', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Georgia, serif' }}>
            ← Meniu Salon
          </button>
          <span style={{ color: '#CCC', fontSize: '14px' }}>/</span>
          <span style={{ fontSize: '14px', color: s.text, fontFamily: 'Georgia, serif' }}>💅 Servicii</span>
        </div>
        <ServiciiTab />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'normal', margin: '0 0 6px', color: s.text, fontFamily: 'Georgia, serif' }}>Meniu Salon</h2>
        <p style={{ fontSize: '13px', color: '#AAA', margin: 0 }}>Gestionează tot ce ține de oferta salonului EVOLIS</p>
      </div>

      {/* Grid secțiuni */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
        {SECTIUNI.map(sec => (
          <div key={sec.id}
            onClick={() => sec.ready && setSectiune(sec.id)}
            style={{
              background: 'white',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              borderTop: `4px solid ${sec.ready ? sec.color : '#DDD'}`,
              cursor: sec.ready ? 'pointer' : 'default',
              opacity: sec.ready ? 1 : 0.5,
              transition: 'transform 0.15s, box-shadow 0.15s',
              position: 'relative',
            }}
            onMouseEnter={e => { if (sec.ready) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.11)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)' }}>

            {!sec.ready && (
              <div style={{ position: 'absolute', top: '14px', right: '14px', background: '#F0EAE0', borderRadius: '20px', padding: '2px 10px', fontSize: '10px', color: '#AAA', letterSpacing: '0.5px', fontWeight: 'bold' }}>ÎN CURÂND</div>
            )}

            <div style={{ fontSize: '32px', marginBottom: '14px' }}>{sec.icon}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: s.text, marginBottom: '6px', fontFamily: 'Georgia, serif' }}>{sec.label}</div>
            <div style={{ fontSize: '13px', color: '#999', lineHeight: '1.5' }}>{sec.desc}</div>

            {sec.ready && (
              <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '4px', color: sec.color, fontSize: '13px', fontWeight: 'bold' }}>
                Deschide <span style={{ fontSize: '16px' }}>→</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
