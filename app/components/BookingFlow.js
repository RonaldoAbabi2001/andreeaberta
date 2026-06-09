'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { trackEvent } from './track'

const SPECIALIST = {
  name: 'Andreea Berta',
  titlu: 'Tehnician Onicolog Certificat',
  adresa: 'EVOLIS MANI B-dul Dacia n.6 PIATRA NEAMT',
}

function generateSlots(durata, orar) {
  const slots = []
  if (!orar || orar.inchis) return slots
  const start = orar.ora_start || '09:00'
  const end = orar.ora_sfarsit || '19:00'
  const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m }
  const startMin = toMin(start)
  const endMin = toMin(end)
  const pauzaStart = orar.pauza_start ? toMin(orar.pauza_start) : null
  const pauzaEnd = orar.pauza_sfarsit ? toMin(orar.pauza_sfarsit) : null
  let t = startMin
  while (t + durata <= endMin) {
    if (pauzaStart !== null && pauzaEnd !== null) {
      const slotEnd = t + durata
      if (t < pauzaEnd && slotEnd > pauzaStart) { t += durata; continue }
    }
    const h = String(Math.floor(t/60)).padStart(2,'0')
    const m = String(t%60).padStart(2,'0')
    slots.push(`${h}:${m}`)
    t += durata
  }
  return slots
}

function generateFutureDates(monthsAhead = 12) {
  const today = new Date(); today.setHours(0,0,0,0)
  const end = new Date(today.getFullYear(), today.getMonth() + monthsAhead + 1, 0)
  const dates = []
  const d = new Date(today)
  while (d <= end) {
    dates.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

const ZILE = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

function formatData(d) {
  return `${d.getDate()} ${LUNI[d.getMonth()]} ${d.getFullYear()}`
}

const style = {
  ruby: '#9B1B30', rubyDark: '#7A1525', gold: '#C9A84C',
  nude: '#F7EFE5', white: '#FFFFFF', text: '#1C1C1C',
}

const lockedStyle = {
  background: '#F5F5F5', color: '#AAA', cursor: 'not-allowed',
  borderColor: '#E5E5E5',
}

const STORAGE_KEY = 'booking_flow_state'

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [servicii, setServicii] = useState([])
  const [extrasDB, setExtrasDB] = useState([])
  const [intervalMinim, setIntervalMinim] = useState(90)
  const [serviciu, setServiciu] = useState(null)
  const [extrasSelectate, setExtrasSelectate] = useState([])
  const [data, setData] = useState(null)
  const [ora, setOra] = useState(null)
  const [plata, setPlata] = useState(null)
  const [form, setForm] = useState({ prenume: '', nume: '', telefon: '', email: '' })
  const [status, setStatus] = useState(null)
  const [clientExistent, setClientExistent] = useState(null)
  const [loggedInClient, setLoggedInClient] = useState(null)
  const [visibleMonth, setVisibleMonth] = useState(() => new Date().getMonth())
  const [visibleYear, setVisibleYear] = useState(() => new Date().getFullYear())
  const [ocupate, setOcupate] = useState([])
  const [orarZi, setOrarZi] = useState(null)
  const scrollRef = useRef(null)
  const dayRefs = useRef({})

  useEffect(() => {
    fetch('/api/servicii')
      .then(r => r.json())
      .then(d => {
        const principale = Array.isArray(d) ? d : (d.servicii || [])
        const extrasDB   = Array.isArray(d) ? [] : (d.extras || [])
        setServicii(principale.map(s => ({ name: s.nume, pret: Number(s.pret), durata: Number(s.durata) })))
        setExtrasDB(extrasDB.map(s => ({ name: s.nume, pret: Number(s.pret), durata: Number(s.durata) })))
        if (d.interval_minim) setIntervalMinim(Number(d.interval_minim))
      })
      .catch(() => {})
  }, [])

  // Restore state from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const s = JSON.parse(saved)
        if (s.step) setStep(s.step)
        if (s.serviciu) setServiciu(s.serviciu)
        if (s.extrasSelectate) setExtrasSelectate(s.extrasSelectate)
        if (s.data) setData(new Date(s.data))
        if (s.ora) setOra(s.ora)
        if (s.plata) setPlata(s.plata)
        if (s.form) setForm(s.form)
        if (s.clientExistent !== undefined) setClientExistent(s.clientExistent)
      }
    } catch {}

    // Pre-fill from logged-in client
    try {
      const raw = localStorage.getItem('client_info')
      if (raw) {
        const c = JSON.parse(raw)
        setLoggedInClient(c)
        const parts = (c.nume || '').trim().split(' ')
        const prenume = parts[0] || ''
        const nume = parts.slice(1).join(' ') || ''
        setForm(prev => ({
          prenume: prev.prenume || prenume,
          nume: prev.nume || nume,
          telefon: prev.telefon || c.telefon || '',
          email: prev.email || c.email || '',
        }))
        setClientExistent(true)
      }
    } catch {}
  }, [])

  // Save state to sessionStorage on every change
  useEffect(() => {
    if (status === 'success') { sessionStorage.removeItem(STORAGE_KEY); return }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        step, serviciu, extrasSelectate, data: data ? data.toISOString() : null,
        ora, plata, form, clientExistent,
      }))
    } catch {}
  }, [step, serviciu, data, ora, plata, form, clientExistent, status])

  useEffect(() => { fetchOcupate(data) }, [data])

  const todayDate = new Date(); todayDate.setHours(0,0,0,0)
  const allDates = generateFutureDates(12)
  const pretTotal = serviciu ? serviciu.pret + extrasSelectate.reduce((s, e) => s + e.pret, 0) : 0
  const durataTotal = serviciu ? serviciu.durata + extrasSelectate.reduce((s, e) => s + e.durata, 0) : 0
  const durataEfectiva = Math.max(durataTotal, intervalMinim)
  const slots = (serviciu && orarZi && !orarZi.inchis) ? generateSlots(durataEfectiva, orarZi) : []

  const isFirstMonth = visibleMonth === todayDate.getMonth() && visibleYear === todayDate.getFullYear()

  function timeToMin(t) {
    if (!t) return 0
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  function isBlocked(slot) {
    if (!serviciu) return false
    const slotStart = timeToMin(slot)
    const slotEnd = slotStart + durataEfectiva
    return ocupate.some(p => {
      if (!p.ora) return false
      const pStart = timeToMin(p.ora)
      const pEnd = p.ora_sfarsit
        ? timeToMin(p.ora_sfarsit)
        : pStart + (Number(p.durata) || 60)
      return slotStart < pEnd && slotEnd > pStart
    })
  }

  async function fetchOcupate(d) {
    if (!d) return
    try {
      const dataStr = formatData(d)
      const [resOcupate, resOrar] = await Promise.all([
        fetch(`/api/programare/ocupate?data=${encodeURIComponent(dataStr)}`),
        fetch(`/api/orar?data=${encodeURIComponent(dataStr)}`)
      ])
      const rows = await resOcupate.json()
      const orar = await resOrar.json()
      setOcupate(Array.isArray(rows) ? rows : [])
      setOrarZi(orar && typeof orar === 'object' ? orar : null)
    } catch { setOcupate([]); setOrarZi(null) }
  }

  function isPast(slot) {
    if (!data) return false
    const now = new Date()
    const today = new Date(); today.setHours(0,0,0,0)
    if (data > today) return false
    const [h, m] = slot.split(':').map(Number)
    return h * 60 + m <= now.getHours() * 60 + now.getMinutes()
  }

  function scrollToMonth(month, year) {
    const key = `${year}-${month}`
    const el = dayRefs.current[key]
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ left: el.offsetLeft - 8, behavior: 'smooth' })
    }
  }

  function prevMonth() {
    if (isFirstMonth) return
    let m = visibleMonth - 1, y = visibleYear
    if (m < 0) { m = 11; y-- }
    setVisibleMonth(m); setVisibleYear(y)
    scrollToMonth(m, y)
  }

  function nextMonth() {
    let m = visibleMonth + 1, y = visibleYear
    if (m > 11) { m = 0; y++ }
    setVisibleMonth(m); setVisibleYear(y)
    scrollToMonth(m, y)
  }

  const handleDateScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const containerLeft = container.scrollLeft + container.clientWidth / 2
    let closest = null, closestDiff = Infinity
    for (const [key, el] of Object.entries(dayRefs.current)) {
      const diff = Math.abs(el.offsetLeft - containerLeft)
      if (diff < closestDiff) { closestDiff = diff; closest = key }
    }
    if (closest) {
      const [y, m] = closest.split('-').map(Number)
      setVisibleMonth(m); setVisibleYear(y)
    }
  }, [])

  async function checkTelefon(telefon) {
    if (loggedInClient) return
    const digits = telefon.replace(/\D/g, '')
    if (digits.length < 10) { setClientExistent(null); return }
    const res = await fetch(`/api/client/check?telefon=${encodeURIComponent(telefon.trim())}`)
    const d = await res.json()
    setClientExistent(d.exists)
  }

  const telefonSchimbat = loggedInClient && form.telefon.trim() !== loggedInClient.telefon.trim()
    && form.telefon.replace(/\D/g, '').length >= 10

  const numeComplet = `${form.prenume.trim()} ${form.nume.trim()}`.trim()
  const emailOk = !!loggedInClient || clientExistent === true || !!form.email
  const canSubmit = !!form.prenume && !!form.nume && !!form.telefon && emailOk && !!plata && status !== 'loading'

  const handleConfirm = async () => {
    setStatus('loading')
    try {
      const clientToken = localStorage.getItem('client_token')
      const res = await fetch('/api/programare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nume: numeComplet,
          telefon: form.telefon,
          email: form.email,
          serviciu: serviciu.name,
          pret: pretTotal,
          durata: durataTotal,
          extra_servicii: extrasSelectate.map(e => e.name),
          data: formatData(data),
          ora, plata,
          clientToken: clientToken || null,
          telefonOriginal: loggedInClient?.telefon || null,
        })
      })
      if (res.ok) {
        setStatus('success')
        trackEvent('booking_complet', { serviciu: serviciu?.name, pret: pretTotal })
      } else if (res.status === 409) {
        setStatus('conflict')
        await fetchOcupate(data)
        setOra(null)
        setStep(4)
      } else {
        setStatus('error')
      }
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✓</div>
        <h3 style={{ fontFamily: 'Georgia, serif', color: style.ruby, fontSize: '28px', fontWeight: 'normal', marginBottom: '12px' }}>
          Vă mulțumim, {form.prenume}!
        </h3>
        <p style={{ color: '#666', lineHeight: 1.8, fontSize: '16px' }}>
          Programarea dumneavoastră a fost confirmată.<br />
          Vă contactăm la <strong>{form.telefon}</strong> pentru orice detalii.
        </p>
        <div style={{ marginTop: '32px', background: style.nude, borderRadius: '16px', padding: '24px', maxWidth: '360px', margin: '32px auto 0' }}>
          <p style={{ color: style.ruby, fontWeight: 'bold', marginBottom: '8px' }}>{serviciu.name}</p>
          <p style={{ color: '#555' }}>{formatData(data)} · {ora}</p>
          <p style={{ color: '#555' }}>Andreea Berta · EVOLIS MANI B-dul Dacia n.6 PIATRA NEAMT</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>

      {/* Progress bar */}
      <div style={{ display: 'flex', marginBottom: '32px', gap: '4px' }}>
        {[1,2,3,4,5].map(s => (
          <div key={s} style={{ flex: 1, height: '4px', borderRadius: '4px', background: s <= step ? style.ruby : '#E0D0C0', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* STEP 1 — Specialist */}
      {step === 1 && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 1</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '24px' }}>Alegeți specialistul</h2>
          <div onClick={() => { setStep(2); trackEvent('booking_start') }}
            style={{ background: style.white, borderRadius: '20px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = style.ruby}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `linear-gradient(135deg, ${style.ruby}, ${style.rubyDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontFamily: 'Georgia, serif', flexShrink: 0 }}>A</div>
            <div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', marginBottom: '4px' }}>{SPECIALIST.name}</p>
              <p style={{ color: '#888', fontSize: '13px' }}>{SPECIALIST.titlu}</p>
              <p style={{ color: style.gold, fontSize: '13px', marginTop: '2px' }}>✦ Salon EVOLIS, Piatra Neamț</p>
            </div>
            <div style={{ marginLeft: 'auto', color: style.ruby, fontSize: '20px' }}>›</div>
          </div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#999', fontSize: '14px', textDecoration: 'none', marginTop: '16px' }}>
            ← Înapoi la pagina principală
          </Link>
        </div>
      )}

      {/* STEP 2 — Serviciu */}
      {step === 2 && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 2</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '24px' }}>Alegeți serviciul</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {servicii.map(s => (
              <div key={s.name} onClick={() => { setServiciu(s); setExtrasSelectate([]); setStep(3); trackEvent('booking_serviciu', { serviciu: s.name, pret: s.pret }) }}
                style={{ background: style.white, borderRadius: '14px', padding: '16px 20px', cursor: 'pointer', border: '1.5px solid #EEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = style.ruby; e.currentTarget.style.background = style.nude }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EEE'; e.currentTarget.style.background = style.white }}
              >
                <div>
                  <p style={{ fontSize: '15px', marginBottom: '4px' }}>{s.name}</p>
                  <p style={{ color: '#999', fontSize: '12px' }}>⏱ {s.durata} min</p>
                </div>
                <p style={{ color: style.ruby, fontWeight: 'bold', fontSize: '16px', whiteSpace: 'nowrap', marginLeft: '16px' }}>{s.pret} lei</p>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(1)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>← Înapoi</button>
        </div>
      )}

      {/* STEP 3 — Extras */}
      {step === 3 && serviciu && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 3</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '6px' }}>Design / Serviciu suplimentar</h2>
          <p style={{ color: '#999', fontSize: '13px', marginBottom: '24px' }}>Opțional — poți alege mai multe sau niciuna.</p>

          {extrasDB.length === 0 && (
            <div style={{ background: '#F9F9F9', border: '1.5px dashed #DDD', borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#AAA', margin: 0 }}>Momentan nu sunt servicii extra disponibile.<br/>Poți continua direct la pasul următor.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {extrasDB.map(s => {
              const sel = extrasSelectate.some(e => e.name === s.name)
              return (
                <div key={s.name}
                  onClick={() => setExtrasSelectate(sel ? extrasSelectate.filter(e => e.name !== s.name) : [...extrasSelectate, s])}
                  style={{ background: sel ? '#FFF5F6' : style.white, borderRadius: '14px', padding: '14px 18px', cursor: 'pointer', border: `1.5px solid ${sel ? style.ruby : '#EEE'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: sel ? '0 2px 12px rgba(155,27,48,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${sel ? style.ruby : '#DDD'}`, background: sel ? style.ruby : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sel && <span style={{ color: 'white', fontSize: '12px', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', margin: 0, color: sel ? style.ruby : style.text }}>{s.name}</p>
                      <p style={{ color: '#AAA', fontSize: '11px', margin: 0 }}>+{s.durata} min</p>
                    </div>
                  </div>
                  <p style={{ color: style.ruby, fontWeight: 'bold', fontSize: '15px', margin: 0, marginLeft: '12px', whiteSpace: 'nowrap' }}>+{s.pret} lei</p>
                </div>
              )
            })}
          </div>

          {extrasSelectate.length > 0 && (
            <div style={{ background: style.nude, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', border: `1px solid ${style.gold}` }}>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>Total suplimentar</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: style.ruby, margin: 0 }}>+{extrasSelectate.reduce((s, e) => s + e.pret, 0)} lei · +{extrasSelectate.reduce((s, e) => s + e.durata, 0)} min</p>
            </div>
          )}

          <button onClick={() => { setStep(4); trackEvent('booking_extras', { extras: extrasSelectate.map(e => e.name) }) }}
            style={{ width: '100%', padding: '14px', borderRadius: '50px', background: 'linear-gradient(135deg, #F9E4A0 0%, #C9A84C 40%, #A8883A 65%, #F5D07A 100%)', color: '#3A2500', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', boxShadow: '0 4px 20px rgba(201,168,76,0.5), 0 1px 0 rgba(255,255,255,0.6) inset, 0 -1px 0 rgba(0,0,0,0.15) inset', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: '3px', left: '18px', width: '40px', height: '6px', background: 'rgba(255,255,255,0.45)', borderRadius: '4px', transform: 'rotate(-20deg)', pointerEvents: 'none' }} />
            <span style={{ position: 'absolute', top: '5px', left: '60px', width: '20px', height: '4px', background: 'rgba(255,255,255,0.25)', borderRadius: '4px', transform: 'rotate(-20deg)', pointerEvents: 'none' }} />
            {extrasSelectate.length > 0 ? `Continuați cu ${extrasSelectate.length} extra${extrasSelectate.length > 1 ? 's' : ''} →` : 'Nu doresc niciunul →'}
          </button>

          <button onClick={() => setStep(2)} style={{ marginTop: '6px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>← Înapoi</button>
        </div>
      )}

      {/* STEP 4 — Data & Ora */}
      {step === 4 && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 4</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '8px' }}>Alegeți data și ora</h2>
          <p style={{ color: style.ruby, fontSize: '14px', marginBottom: '20px' }}>{serviciu.name} · {durataTotal} min</p>

          {/* Month navigator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={prevMonth} disabled={isFirstMonth}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: isFirstMonth ? 'not-allowed' : 'pointer', color: isFirstMonth ? '#CCC' : style.ruby, padding: '4px 14px', lineHeight: 1 }}>‹</button>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'bold', color: style.ruby, margin: 0 }}>
              {LUNI[visibleMonth]} {visibleYear}
            </p>
            <button onClick={nextMonth}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: style.ruby, padding: '4px 14px', lineHeight: 1 }}>›</button>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Săgeată stânga */}
            <button onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
              style={{ position: 'absolute', left: '-14px', top: '50%', transform: 'translateY(-60%)', zIndex: 10, background: 'white', border: `1.5px solid #EEE`, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', color: style.ruby, fontSize: '18px', lineHeight: 1 }}>‹</button>

            <div ref={scrollRef} onScroll={handleDateScroll} className="date-carousel"
              style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '12px', marginBottom: '24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {allDates.map((d, i) => {
                const selected = data && data.toDateString() === d.toDateString()
                const isFirstOfMonth = d.getDate() === 1 || i === 0
                const monthKey = `${d.getFullYear()}-${d.getMonth()}`
                return (
                  <div key={i}
                    ref={isFirstOfMonth ? el => { if (el) dayRefs.current[monthKey] = el } : undefined}
                    onClick={() => { setData(d); setOra(null); fetchOcupate(d) }}
                    style={{ minWidth: '60px', borderRadius: '14px', padding: '10px 8px', textAlign: 'center', cursor: 'pointer', flexShrink: 0, background: selected ? style.ruby : style.white, color: selected ? 'white' : style.text, border: `1.5px solid ${selected ? style.ruby : '#EEE'}`, boxShadow: selected ? '0 4px 16px rgba(155,27,48,0.3)' : '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
                  >
                    <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>{ZILE[d.getDay()]}</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{d.getDate()}</p>
                    <p style={{ fontSize: '10px', opacity: 0.7 }}>{LUNI[d.getMonth()].slice(0,3)}</p>
                  </div>
                )
              })}
            </div>

            {/* Săgeată dreapta */}
            <button onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
              style={{ position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-60%)', zIndex: 10, background: 'white', border: `1.5px solid #EEE`, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', color: style.ruby, fontSize: '18px', lineHeight: 1 }}>›</button>
          </div>

          {data && (
            <div>
              {orarZi?.inchis ? (
                <p style={{ color: style.ruby, fontSize: '14px', textAlign: 'center', padding: '20px', background: '#FFF0F2', borderRadius: '12px', marginBottom: '16px', border: `1px solid ${style.ruby}` }}>
                  Zi indisponibilă — alegeți o altă dată
                </p>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Ore disponibile</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                    {slots.filter(slot => !isBlocked(slot) && !isPast(slot)).map(slot => {
                      const selected = ora === slot
                      return (
                        <div key={slot} onClick={() => { setOra(slot); trackEvent('booking_data', { data: data?.toISOString().slice(0,10), ora: slot }) }}
                          style={{ padding: '10px 18px', borderRadius: '50px', cursor: 'pointer', background: selected ? style.ruby : style.white, color: selected ? 'white' : style.text, border: `1.5px solid ${selected ? style.ruby : '#DDD'}`, fontWeight: selected ? 'bold' : 'normal', fontSize: '14px', transition: 'all 0.2s', boxShadow: selected ? '0 4px 16px rgba(155,27,48,0.3)' : 'none' }}
                        >{slot}</div>
                      )
                    })}
                  </div>
                  {data && orarZi && !orarZi.inchis && slots.filter(s => !isBlocked(s) && !isPast(s)).length === 0 && (
                    <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '16px', background: '#F9F9F9', borderRadius: '12px', marginBottom: '16px' }}>
                      Nu mai sunt ore disponibile în această zi
                    </p>
                  )}
                </>
              )}
              {ora && (
                <button onClick={() => setStep(5)} className="btn-primary" style={{ width: '100%', textAlign: 'center', padding: '16px', fontSize: '14px' }}>
                  CONTINUAȚI →
                </button>
              )}
            </div>
          )}
          <button onClick={() => setStep(3)} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>← Înapoi</button>
        </div>
      )}

      {/* STEP 5 — Recap + Confirmare */}
      {step === 5 && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 5</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '24px' }}>Verificați și confirmați</h2>

          {/* Recap card */}
          <div style={{ background: style.nude, borderRadius: '20px', padding: '24px', marginBottom: '24px', border: `1px solid ${style.gold}` }}>
            {[
              ['Specialist', 'Andreea Berta'],
              ['Serviciu', serviciu.name],
              ...(extrasSelectate.length > 0 ? [['Extras', extrasSelectate.map(e => e.name).join(', ')]] : []),
              ['Data', formatData(data)],
              ['Ora', ora],
              ['Durată', `${durataTotal} min`],
              ['Adresă', 'EVOLIS MANI B-dul Dacia n.6 PIATRA NEAMT'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>{k}</span>
                <span style={{ fontSize: '14px', textAlign: 'right', maxWidth: '220px', fontWeight: k === 'Ora' ? 'bold' : 'normal', color: k === 'Ora' ? style.ruby : 'inherit' }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${style.gold}`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: style.ruby, fontSize: '18px' }}>{pretTotal} lei</span>
            </div>
          </div>

          {/* Metoda de plata */}
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Metoda de plată</p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {[{ id: 'numerar', label: '💵 Numerar în salon' }, { id: 'transfer', label: '🏦 Transfer bancar' }].map(p => (
              <div key={p.id} onClick={() => setPlata(p.id)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center', background: plata === p.id ? style.ruby : style.white, color: plata === p.id ? 'white' : style.text, border: `1.5px solid ${plata === p.id ? style.ruby : '#DDD'}`, fontSize: '14px', transition: 'all 0.2s' }}
              >{p.label}</div>
            ))}
          </div>

          {/* Date contact */}
          {/* Prenume + Nume — blocate dacă e logată */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
                Prenume *
                {loggedInClient && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#CCC' }}>🔒</span>}
              </label>
              <input type="text" required value={form.prenume} readOnly={!!loggedInClient}
                onChange={e => !loggedInClient && setForm({ ...form, prenume: e.target.value })}
                className="input-field" placeholder="Ex: Maria"
                style={loggedInClient ? lockedStyle : {}}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
                Nume *
                {loggedInClient && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#CCC' }}>🔒</span>}
              </label>
              <input type="text" required value={form.nume} readOnly={!!loggedInClient}
                onChange={e => !loggedInClient && setForm({ ...form, nume: e.target.value })}
                className="input-field" placeholder="Ex: Ionescu"
                style={loggedInClient ? lockedStyle : {}}
              />
            </div>
          </div>

          {/* Telefon — editabil */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
              Telefon *
            </label>
            <input type="tel" required value={form.telefon}
              onChange={e => {
                setForm({ ...form, telefon: e.target.value })
                checkTelefon(e.target.value)
              }}
              className="input-field" placeholder="07XX XXX XXX"
            />
            {telefonSchimbat && (
              <p style={{ fontSize: '11px', color: style.gold, marginTop: '6px' }}>
                📱 Numărul nou va fi salvat ca număr secundar în fișa ta.
              </p>
            )}
            {!loggedInClient && clientExistent === true && (
              <p style={{ fontSize: '12px', color: '#10B981', marginTop: '6px' }}>✓ Client existent — cont activ</p>
            )}
          </div>

          {/* Email — blocat dacă e logată, ascuns dacă e client existent fără cont */}
          {loggedInClient ? (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
                Email
                <span style={{ marginLeft: '8px', fontSize: '10px', color: '#CCC', letterSpacing: '1px' }}>🔒 blocat</span>
              </label>
              <input type="email" value={form.email} readOnly className="input-field" style={lockedStyle} />
            </div>
          ) : clientExistent !== true ? (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
                Email * <span style={{ fontSize: '10px', color: '#AAA', letterSpacing: '1px' }}>(pentru accesul la contul tău)</span>
              </label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="adresa@email.com"
              />
            </div>
          ) : <div style={{ marginBottom: '24px' }} />}

          {status === 'error' && (
            <p style={{ color: style.ruby, fontSize: '14px', marginBottom: '16px' }}>A apărut o eroare. Încercați din nou.</p>
          )}
          {status === 'conflict' && (
            <p style={{ color: style.ruby, fontSize: '14px', marginBottom: '16px', background: '#FFF0F0', padding: '12px', borderRadius: '10px', border: '1px solid #FFCDD2' }}>
              Ora selectată a fost rezervată între timp. Vă rugăm alegeți altă oră.
            </p>
          )}

          <button onClick={handleConfirm} disabled={!canSubmit} className="btn-primary"
            style={{ width: '100%', textAlign: 'center', padding: '16px', fontSize: '14px', opacity: canSubmit ? 1 : 0.5 }}>
            {status === 'loading' ? 'Se procesează...' : 'CONFIRMAȚI PROGRAMAREA'}
          </button>

          <button onClick={() => setStep(4)} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px', width: '100%', textAlign: 'center' }}>
            ← Înapoi
          </button>
        </div>
      )}
    </div>
  )
}
