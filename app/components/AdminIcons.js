'use client'
import {
  CalendarDays, Users, Package, Sparkles, TrendingUp,
  FileText, Upload, Scissors, RefreshCw, CalendarPlus,
  Lock, Umbrella, Settings2
} from 'lucide-react'

// Gradiente unice per icon — look premium iOS
const GRADIENTS = {
  calendar:  ['#FF6B6B', '#C0392B'],
  clienti:   ['#667EEA', '#764BA2'],
  produse:   ['#56CCF2', '#2F80ED'],
  meniu:     ['#F7971E', '#FFD200'],
  analitica: ['#11998E', '#38EF7D'],
  rapoarte:  ['#FC5C7D', '#6A3093'],
  import:    ['#4FACFE', '#00F2FE'],
  servicii:  ['#FA709A', '#FEE140'],
  repetitiv: ['#A18CD1', '#FBC2EB'],
  azi:       ['#FDB99B', '#CF6EA9'],
  inchide:   ['#374151', '#6B7280'],
  concediu:  ['#43E97B', '#38F9D7'],
  setari:    ['#F093FB', '#F5576C'],
}

const ACTIVE = ['#9B1B30', '#C9A84C']

function IconBox({ id, active, size = 32, children }) {
  const [c1, c2] = active ? ACTIVE : GRADIENTS[id] || ['#AAA', '#888']
  const boxSize = size
  const iconSize = Math.round(size * 0.52)

  return (
    <div style={{
      width: boxSize,
      height: boxSize,
      borderRadius: Math.round(boxSize * 0.28),
      background: `linear-gradient(145deg, ${c1}, ${c2})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: active
        ? `0 4px 14px rgba(155,27,48,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`
        : `0 3px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)`,
      transition: 'all 0.25s',
      transform: active ? 'scale(1.05)' : 'scale(1)',
    }}>
      {children(iconSize)}
    </div>
  )
}

export function IcoCalendar({ active, size = 32 }) {
  return <IconBox id="calendar" active={active} size={size}>{s => <CalendarDays size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoClienti({ active, size = 32 }) {
  return <IconBox id="clienti" active={active} size={size}>{s => <Users size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoProduse({ active, size = 32 }) {
  return <IconBox id="produse" active={active} size={size}>{s => <Package size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoMeniu({ active, size = 32 }) {
  return <IconBox id="meniu" active={active} size={size}>{s => <Sparkles size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoAnalitica({ active, size = 32 }) {
  return <IconBox id="analitica" active={active} size={size}>{s => <TrendingUp size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoRapoarte({ active, size = 32 }) {
  return <IconBox id="rapoarte" active={active} size={size}>{s => <FileText size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoImport({ active, size = 32 }) {
  return <IconBox id="import" active={active} size={size}>{s => <Upload size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoServicii({ active, size = 32 }) {
  return <IconBox id="servicii" active={active} size={size}>{s => <Scissors size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoRepetitiv({ active, size = 32 }) {
  return <IconBox id="repetitiv" active={active} size={size}>{s => <RefreshCw size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoAzi({ active, size = 32 }) {
  return <IconBox id="azi" active={active} size={size}>{s => <CalendarPlus size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoInchide({ active, size = 32 }) {
  return <IconBox id="inchide" active={active} size={size}>{s => <Lock size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoConcediu({ active, size = 32 }) {
  return <IconBox id="concediu" active={active} size={size}>{s => <Umbrella size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
export function IcoSetari({ active, size = 32 }) {
  return <IconBox id="setari" active={active} size={size}>{s => <Settings2 size={s} color="white" strokeWidth={1.8} />}</IconBox>
}
