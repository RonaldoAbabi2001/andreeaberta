'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Tracker() {
  const pathname = usePathname()

  useEffect(() => {
    let sid = sessionStorage.getItem('evolis_sid')
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('evolis_sid', sid)
    }
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pagina: pathname,
        referrer: document.referrer || '',
        session_id: sid,
      }),
    }).catch(() => {})
  }, [pathname])

  return null
}
