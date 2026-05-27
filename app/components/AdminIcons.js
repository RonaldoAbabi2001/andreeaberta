// Admin icon components — rounded square with gradient background + white SVG

function IconBox({ active, children, size = 28, radius = 8 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: active
        ? 'linear-gradient(145deg, #B82035 0%, #9B1B30 45%, #C9A84C 100%)'
        : 'linear-gradient(145deg, #E8E2DA, #D8D0C8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: active
        ? '0 3px 10px rgba(155,27,48,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
        : '0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
      transition: 'all 0.2s',
    }}>
      {children}
    </div>
  )
}

const W = ({ active, size = 28 }) => {
  const s = Math.round(size * 0.55)
  const col = 'white'
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    </IconBox>
  )
}

export function IcoCalendar({ active, size }) { return <W active={active} size={size} /> }

export function IcoClienti({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </IconBox>
  )
}

export function IcoProduse({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6l1 4H8L9 3z"/><path d="M8 7v13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7"/><path d="M10 12h4"/>
      </svg>
    </IconBox>
  )
}

export function IcoMeniu({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </IconBox>
  )
}

export function IcoAnalitica({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    </IconBox>
  )
}

export function IcoRapoarte({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    </IconBox>
  )
}

export function IcoImport({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </IconBox>
  )
}

export function IcoServicii({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </IconBox>
  )
}

export function IcoRepetitiv({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    </IconBox>
  )
}

export function IcoAzi({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
      </svg>
    </IconBox>
  )
}

export function IcoInchide({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size} radius={8}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </IconBox>
  )
}

export function IcoConcediu({ active, size = 28 }) {
  const s = Math.round(size * 0.55)
  return (
    <IconBox active={active} size={size}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    </IconBox>
  )
}
