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

  if (info) {
    const prenume = info.nume?.split(' ')[0] || 'Contul meu'
    return (
      <Link href="/client" style={{
        fontSize: '12px', color: 'rgba(255,255,255,0.9)', textDecoration: 'none',
        padding: '9px 18px', borderRadius: '50px',
        background: 'rgba(201,168,76,0.2)',
        border: '1px solid rgba(201,168,76,0.5)',
        letterSpacing: '1px', whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ fontSize: '10px' }}>✦</span> {prenume}
      </Link>
    )
  }

  return (
    <Link href="/client/login" style={{
      fontSize: '12px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
      padding: '9px 18px', borderRadius: '50px',
      border: '1px solid rgba(255,255,255,0.25)',
      letterSpacing: '1px', whiteSpace: 'nowrap',
    }}>
      Contul meu
    </Link>
  )
}
