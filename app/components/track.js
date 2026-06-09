export function trackEvent(eveniment, meta) {
  try {
    const sid = sessionStorage.getItem('evolis_sid') || ''
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eveniment, meta, session_id: sid, pagina: window.location.pathname }),
    }).catch(() => {})
  } catch {}
}
