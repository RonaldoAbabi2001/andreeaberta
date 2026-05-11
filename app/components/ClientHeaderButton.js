'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientHeaderButton() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('client_token')
    if (!token) return
    const raw = localStorage.getItem('client_info')
    if (raw) {
      try { setInfo(JSON.parse(raw)) } catch {}
    }
  }, [])

  const goldStyle = {
    fontSize: 'clamp(10px, 2.5vw, 13px)',
    color: '#1C1C1C',
    textDecoration: 'none',
    padding: 'clamp(8px, 1.5vw, 11px) clamp(14px, 3vw, 26px)',
    borderRadius: '50px',
    background: 'linear-gradient(135deg, #C9A84C 0%, #F0DC8A 40%, #C9A84C 70%, #A07830 100%)',
    boxShadow: '0 2px 12px rgba(201,168,76,0.55), inset 0 1px 0 rgba(255,255,255,0.45)',
    letterSpacing: '1.5px',
    whiteSpace: 'nowrap',
    fontWeight: 'bold',
    fontFamily: 'Georgia, serif',
    display: 'flex', alignItems: 'center', gap: '6px',
  }

  if (info) {
    const prenume = info.nume?.split(' ')[0] || 'Contul meu'
    return (
      <Link href="/client" style={goldStyle}>
        <span style={{ fontSize: '10px' }}>✦</span> {prenume}
      </Link>
    )
  }

  return (
    <Link href="/client/login" style={goldStyle}>
      ✦ Contul meu
    </Link>
  )
}
