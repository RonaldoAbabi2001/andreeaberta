'use client'
import { useRef, useState, useEffect } from 'react'

const PREMII = [
  { label: '10% Reducere', color: '#9B1B30', text: '#fff' },
  { label: 'Design Gratuit', color: '#C9A84C', text: '#1C1C1C' },
  { label: '15% Reducere', color: '#7A1525', text: '#fff' },
  { label: 'Design Swarovski', color: '#D4AF6A', text: '#1C1C1C' },
  { label: '20% Reducere', color: '#B5223C', text: '#fff' },
  { label: 'Îndepărtare Gratuită', color: '#E2C97E', text: '#1C1C1C' },
  { label: '25% Reducere', color: '#6A1020', text: '#fff' },
  { label: '30% Reducere', color: '#C9A84C', text: '#1C1C1C' },
]

const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5' }

// ─── Pasul 1: Formular înregistrare ───────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const [nume, setNume] = useState('')
  const [telefon, setTelefon] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setErr(null)
    const tel = telefon.trim().replace(/\s/g, '')
    if (!tel || tel.length < 10) { setErr('Introdu un număr de telefon valid.'); return }
    if (!nume.trim()) { setErr('Introdu numele tău.'); return }

    setLoading(true)
    const res = await fetch(`/api/roata?telefon=${encodeURIComponent(tel)}`)
    const data = await res.json()
    setLoading(false)

    if (data.exists) {
      // a mai jucat
      onSuccess({ alreadyPlayed: true, premiu: data.premiu, cod: data.cod, folosit: data.folosit, nume: nume.trim(), telefon: tel })
    } else {
      onSuccess({ alreadyPlayed: false, nume: nume.trim(), telefon: tel })
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '440px', margin: '0 auto' }}>
      <p style={{ color: s.ruby, fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Încearcă norocul ✦</p>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 'normal', marginBottom: '8px' }}>Roata Norocului</h3>
      <p style={{ color: '#888', fontSize: '15px', marginBottom: '36px', lineHeight: 1.6 }}>
        Înregistrează-te și învârte roata pentru a câștiga un premiu la prima ta programare!
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input
          type="text"
          placeholder="Numele tău"
          value={nume}
          onChange={e => setNume(e.target.value)}
          style={{ padding: '14px 18px', border: '1.5px solid #E8DDD0', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', outline: 'none', textAlign: 'center' }}
        />
        <input
          type="tel"
          placeholder="Numărul de telefon (ex: 0712345678)"
          value={telefon}
          onChange={e => setTelefon(e.target.value)}
          style={{ padding: '14px 18px', border: '1.5px solid #E8DDD0', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', outline: 'none', textAlign: 'center' }}
        />
        {err && <p style={{ color: '#E53E3E', fontSize: '13px', margin: 0 }}>{err}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ background: loading ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '50px', padding: '15px 40px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 24px rgba(155,27,48,0.3)', transition: 'all 0.3s', marginTop: '4px' }}
        >
          {loading ? 'SE VERIFICĂ...' : '✦ CONTINUĂ ✦'}
        </button>
      </form>

      <p style={{ color: '#bbb', fontSize: '12px', marginTop: '20px', lineHeight: 1.5 }}>
        Numărul tău de telefon este folosit doar pentru a-ți rezerva premiul.<br />Nu trimitem spam.
      </p>
    </div>
  )
}

// ─── Pasul 2: Roata ───────────────────────────────────────────────────────
function Wheel({ user, onResult }) {
  const canvasRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [saving, setSaving] = useState(false)
  const animRef = useRef(null)
  const segmentAngle = (2 * Math.PI) / PREMII.length

  function drawWheel(rot) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r = cx - 8
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.shadowColor = 'rgba(155,27,48,0.3)'
    ctx.shadowBlur = 30
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.restore()

    PREMII.forEach(({ label, color, text }, i) => {
      const startAngle = rot + i * segmentAngle
      const endAngle = startAngle + segmentAngle
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = text
      ctx.font = 'bold 11px Georgia, serif'
      ctx.fillText(label, r - 12, 4)
      ctx.restore()
    })

    // Cerc central
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28)
    grad.addColorStop(0, '#E2C97E')
    grad.addColorStop(1, '#C9A84C')
    ctx.beginPath()
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = '#7A1525'
    ctx.font = 'bold 9px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('EVOLIS', cx, cy + 3)
  }

  useEffect(() => { drawWheel(rotation) }, [])

  function playTick() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.value = 600
      g.gain.setValueAtTime(0.15, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.05)
    } catch {}
  }

  function playWin() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ;[523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = freq; o.type = 'sine'
        const t = ctx.currentTime + i * 0.15
        g.gain.setValueAtTime(0.2, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
        o.start(t); o.stop(t + 0.3)
      })
    } catch {}
  }

  function spin() {
    if (spinning || saving) return
    setSpinning(true)
    const extraSpins = 5 + Math.random() * 5
    const randomStop = Math.random() * 2 * Math.PI
    const totalRotation = rotation + extraSpins * 2 * Math.PI + randomStop
    const duration = 4000
    const start = performance.now()
    const startRot = rotation
    let lastSegment = -1

    function animate(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentRot = startRot + (totalRotation - startRot) * eased
      drawWheel(currentRot)

      const norm = ((currentRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const seg = Math.floor(norm / segmentAngle) % PREMII.length
      if (seg !== lastSegment) { playTick(); lastSegment = seg }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setRotation(totalRotation)
        const normFinal = ((totalRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const pointerAngle = (2 * Math.PI - normFinal + 3 * Math.PI / 2) % (2 * Math.PI)
        const winnerIndex = Math.floor(pointerAngle / segmentAngle) % PREMII.length
        const premiu = PREMII[winnerIndex].label
        playWin()
        setSpinning(false)
        setSaving(true)
        // Salvează în DB
        fetch('/api/roata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefon: user.telefon, nume: user.nume, premiu })
        })
          .then(r => r.json())
          .then(data => {
            setSaving(false)
            if (data.success) onResult({ premiu, cod: data.cod })
            else if (data.exists) onResult({ premiu: data.premiu, cod: data.cod, alreadyPlayed: true })
          })
          .catch(() => { setSaving(false); onResult({ premiu, cod: '—' }) })
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ color: '#888', fontSize: '15px', marginBottom: '8px' }}>
        Bună, <strong style={{ color: s.ruby }}>{user.nume}</strong>! Apasă roata pentru a o învârti.
      </p>
      <p style={{ color: '#bbb', fontSize: '13px', marginBottom: '28px' }}>O singură șansă — fă-o să conteze! 🎯</p>

      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: `24px solid ${s.ruby}`, zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        <canvas ref={canvasRef} width={300} height={300}
          style={{ borderRadius: '50%', boxShadow: '0 16px 48px rgba(155,27,48,0.25)', cursor: spinning || saving ? 'not-allowed' : 'pointer' }}
          onClick={spin} />
      </div>
      <br />
      <button onClick={spin} disabled={spinning || saving}
        style={{ background: (spinning || saving) ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '50px', padding: '14px 40px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px', cursor: (spinning || saving) ? 'not-allowed' : 'pointer', boxShadow: '0 6px 24px rgba(155,27,48,0.35)', transition: 'all 0.3s' }}>
        {saving ? 'SE SALVEAZĂ...' : spinning ? 'SE ÎNVÂRTE...' : '✦ ÎNVÂRTIȚI ✦'}
      </button>
    </div>
  )
}

// ─── Pasul 3: Rezultat ────────────────────────────────────────────────────
function Result({ premiu, cod, folosit, nume, alreadyPlayed }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '440px', margin: '0 auto' }}>
      {alreadyPlayed ? (
        <>
          <p style={{ color: s.ruby, fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Premiul tău ✦</p>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '8px' }}>Ai mai jucat înainte!</h3>
          <p style={{ color: '#888', fontSize: '15px', marginBottom: '28px' }}>Iată premiul câștigat de tine:</p>
        </>
      ) : (
        <>
          <p style={{ color: s.ruby, fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>🎉 Felicitări!</p>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 'normal', marginBottom: '8px' }}>Ai câștigat!</h3>
          <p style={{ color: '#888', fontSize: '15px', marginBottom: '28px' }}>Premiul tău pentru prima programare:</p>
        </>
      )}

      <div style={{ background: 'linear-gradient(135deg, #F7EFE5, #EDE0D0)', borderRadius: '20px', padding: '32px', border: '1.5px solid #C9A84C', boxShadow: '0 8px 32px rgba(201,168,76,0.2)', marginBottom: '24px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: s.ruby, marginBottom: '20px', fontWeight: 'bold' }}>{premiu}</p>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px dashed #C9A84C' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#aaa', marginBottom: '6px', textTransform: 'uppercase' }}>Codul tău unic</p>
          <p style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 'bold', color: s.ruby, letterSpacing: '4px', margin: 0 }}>{cod}</p>
        </div>

        {folosit && (
          <p style={{ color: '#aaa', fontSize: '12px', marginTop: '12px' }}>✓ Acest cod a fost deja folosit.</p>
        )}
      </div>

      <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.7 }}>
        {folosit
          ? 'Codul a fost validat. Mulțumim că ai ales EVOLIS! 💅'
          : <>Menționează codul <strong>{cod}</strong> când faci programarea sau arată-l la salon.<br />Valabil la prima ta programare la EVOLIS.</>
        }
      </p>
    </div>
  )
}

// ─── Componenta principală ────────────────────────────────────────────────
export default function SpinWheel() {
  const [step, setStep] = useState('register') // register | spin | result
  const [user, setUser] = useState(null)
  const [result, setResult] = useState(null)

  function handleRegister(data) {
    setUser(data)
    if (data.alreadyPlayed) {
      setResult({ premiu: data.premiu, cod: data.cod, folosit: data.folosit, alreadyPlayed: true })
      setStep('result')
    } else {
      setStep('spin')
    }
  }

  if (step === 'register') return <RegisterForm onSuccess={handleRegister} />
  if (step === 'spin') return <Wheel user={user} onResult={r => { setResult(r); setStep('result') }} />
  if (step === 'result') return <Result {...result} nume={user?.nume} />
  return null
}
