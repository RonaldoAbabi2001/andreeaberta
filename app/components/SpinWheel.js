'use client'
import { useRef, useState, useEffect } from 'react'

const PREMII = [
  { label: '5% Reducere', color: '#9B1B30', text: '#fff' },
  { label: 'French / Babyboomer', color: '#C9A84C', text: '#1C1C1C' },
  { label: '10% Reducere', color: '#7A1525', text: '#fff' },
  { label: 'Swarovski pe Inelar', color: '#D4AF6A', text: '#1C1C1C' },
  { label: '15% Reducere', color: '#B5223C', text: '#fff' },
  { label: 'Culoare Omagiu', color: '#E2C97E', text: '#1C1C1C' },
  { label: 'Design pe 2 Degete', color: '#6A1020', text: '#fff' },
  { label: 'Top pe Dedesubt', color: '#C9A84C', text: '#1C1C1C' },
]

const PREMII_VIZ = [
  ...PREMII,
  { label: '★ 30% Reducere', color: '#1C1C1C', text: '#FFD700' },
]
const N_VIZ = PREMII_VIZ.length
const SEG_VIZ = (2 * Math.PI) / N_VIZ

const s = { ruby: '#9B1B30', gold: '#C9A84C' }
const SIZE = 320

function drawWheelHD(canvas, rot) {
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  if (canvas.width !== SIZE * dpr) {
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    canvas.style.width = SIZE + 'px'
    canvas.style.height = SIZE + 'px'
  }
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, SIZE, SIZE)
  const cx = SIZE / 2
  const cy = SIZE / 2
  const r = cx - 8

  ctx.save()
  ctx.shadowColor = 'rgba(155,27,48,0.25)'
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.restore()

  PREMII_VIZ.forEach(({ label, color, text }, i) => {
    const startAngle = rot + i * SEG_VIZ
    const endAngle = startAngle + SEG_VIZ
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(startAngle + SEG_VIZ / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = text
    const isSpecial = i === 8
    ctx.font = isSpecial ? 'bold 12px Georgia, serif' : 'bold 10px Georgia, serif'
    if (isSpecial) {
      ctx.fillText('30% Reducere', r - 10, -5)
      ctx.font = '10px Georgia, serif'
      ctx.fillText('★ ★ ★', r - 10, 8)
    } else {
      ctx.fillText(label, r - 12, 4)
    }
    ctx.restore()
  })

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30)
  grad.addColorStop(0, '#E2C97E')
  grad.addColorStop(1, '#C9A84C')
  ctx.beginPath()
  ctx.arc(cx, cy, 30, 0, 2 * Math.PI)
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

// ─── Timer blocat ─────────────────────────────────────────────────────────
function Blocat({ dataExpirare, numeUser }) {
  const [ramas, setRamas] = useState('')
  useEffect(() => {
    function update() {
      const diff = new Date(dataExpirare) - new Date()
      if (diff <= 0) { setRamas('Poți învârti acum!'); return }
      const zile = Math.floor(diff / 86400000)
      const ore = Math.floor((diff % 86400000) / 3600000)
      const min = Math.floor((diff % 3600000) / 60000)
      if (zile > 0) setRamas(`${zile} zile și ${ore} ore`)
      else if (ore > 0) setRamas(`${ore} ore și ${min} minute`)
      else setRamas(`${min} minute`)
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [dataExpirare])
  const dataFormatata = new Date(dataExpirare).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '440px', margin: '0 auto' }}>
      <p style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</p>
      <p style={{ color: s.ruby, fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>Roata Norocului</p>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 'normal', marginBottom: '16px' }}>
        {numeUser ? `Bună, ${numeUser}!` : 'Ai mai jucat recent!'}
      </h3>
      <p style={{ color: '#888', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
        Poți reveni și învârti din nou pe <strong style={{ color: '#1C1C1C' }}>{dataFormatata}</strong>.
      </p>
      <div style={{ background: 'linear-gradient(135deg, #F7EFE5, #EDE0D0)', borderRadius: '16px', padding: '24px', border: '1.5px solid #C9A84C', display: 'inline-block', minWidth: '200px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' }}>Timp rămas</p>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: s.ruby, fontWeight: 'bold', margin: 0 }}>{ramas}</p>
      </div>
      <p style={{ color: '#bbb', fontSize: '13px', marginTop: '24px', lineHeight: 1.6 }}>
        Roata se resetează automat după 2 săptămâni.<br />Revino pentru o nouă șansă!
      </p>
    </div>
  )
}

// ─── Rezultat ────────────────────────────────────────────────────────────
function Result({ premiu, cod, folosit, alreadyPlayed }) {
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
        {folosit && <p style={{ color: '#aaa', fontSize: '12px', marginTop: '12px' }}>✓ Acest cod a fost deja folosit.</p>}
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

// ─── Componenta principală — un singur canvas, mereu vizibil ──────────────
export default function SpinWheel() {
  const [step, setStep] = useState('preview') // preview | register | spin | spinning | result | blocat
  const [user, setUser] = useState(null)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [nume, setNume] = useState('')
  const [telefon, setTelefon] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formErr, setFormErr] = useState(null)

  // Canvas & animație
  const canvasRef = useRef(null)
  const rotRef = useRef(0)
  const animRef = useRef(null)

  // Pornește rotația lentă (preview/register)
  function startSlowSpin() {
    cancelAnimationFrame(animRef.current)
    function loop() {
      rotRef.current += 0.003
      drawWheelHD(canvasRef.current, rotRef.current)
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
  }

  // La mount: desenează imediat și pornește rotația lentă
  useEffect(() => {
    drawWheelHD(canvasRef.current, 0)
    startSlowSpin()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // ── Sunet ──
  function playTick() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)()
      const o = ac.createOscillator(); const g = ac.createGain()
      o.connect(g); g.connect(ac.destination)
      o.frequency.value = 600
      g.gain.setValueAtTime(0.15, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05)
      o.start(ac.currentTime); o.stop(ac.currentTime + 0.05)
    } catch {}
  }
  function playWin() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)()
      ;[523, 659, 784, 1047].forEach((freq, i) => {
        const o = ac.createOscillator(); const g = ac.createGain()
        o.connect(g); g.connect(ac.destination)
        o.frequency.value = freq; o.type = 'sine'
        const t = ac.currentTime + i * 0.15
        g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
        o.start(t); o.stop(t + 0.3)
      })
    } catch {}
  }

  // ── Submit formular ──
  async function handleSubmit(e) {
    e.preventDefault()
    setFormErr(null)
    const tel = telefon.trim().replace(/\s/g, '')
    if (!tel || tel.length < 10) { setFormErr('Introdu un număr de telefon valid.'); return }
    if (!nume.trim()) { setFormErr('Introdu numele tău.'); return }
    setFormLoading(true)
    try {
      const res = await fetch(`/api/roata?telefon=${encodeURIComponent(tel)}`)
      const data = await res.json()
      setFormLoading(false)
      const userData = { nume: nume.trim(), telefon: tel }
      setUser(userData)
      if (data.exists && data.blocat) {
        setUser({ ...userData, data_expirare: data.data_expirare })
        cancelAnimationFrame(animRef.current)
        setStep('blocat')
      } else {
        // Oprește rotația lentă, trece la spin interactiv
        cancelAnimationFrame(animRef.current)
        setStep('spin')
      }
    } catch {
      setFormLoading(false)
      setFormErr('Eroare de conexiune. Încearcă din nou.')
    }
  }

  // ── Spin interactiv ──
  function doSpin() {
    if (step === 'spinning' || saving) return
    setStep('spinning')

    const extraSpins = 5 + Math.random() * 5
    const winnerIdx = Math.floor(Math.random() * 8)
    const jitter = (Math.random() - 0.5) * SEG_VIZ * 0.6
    const targetPointerAngle = (winnerIdx + 0.5) * SEG_VIZ + jitter
    const targetNorm = ((7 * Math.PI / 2 - targetPointerAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
    const currentNorm = ((rotRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    const delta = (targetNorm - currentNorm + 2 * Math.PI) % (2 * Math.PI)
    const totalRotation = rotRef.current + extraSpins * 2 * Math.PI + delta

    const duration = 4500
    const start = performance.now()
    const startRot = rotRef.current
    let lastSegment = -1

    function animate(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentRot = startRot + (totalRotation - startRot) * eased
      rotRef.current = currentRot
      drawWheelHD(canvasRef.current, currentRot)

      const norm = ((currentRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const seg = Math.floor(norm / SEG_VIZ) % N_VIZ
      if (seg !== lastSegment) { playTick(); lastSegment = seg }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        rotRef.current = totalRotation
        const normFinal = ((totalRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const pAngle = (7 * Math.PI / 2 - normFinal + 2 * Math.PI) % (2 * Math.PI)
        const vizIdx = Math.floor(pAngle / SEG_VIZ) % N_VIZ
        const finalIdx = vizIdx < 8 ? vizIdx : winnerIdx
        const premiu = PREMII[finalIdx].label
        playWin()
        setSaving(true)
        fetch('/api/roata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefon: user.telefon, nume: user.nume, premiu })
        })
          .then(r => r.json())
          .then(data => {
            setSaving(false)
            setResult({ premiu, cod: data.cod || '—' })
            setStep('result')
          })
          .catch(() => { setSaving(false); setResult({ premiu, cod: '—' }); setStep('result') })
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }

  // ── Ecranele fără roată (blocat, result) ──
  if (step === 'blocat') return <Blocat dataExpirare={user?.data_expirare} numeUser={user?.nume} />
  if (step === 'result') return <Result {...result} />

  // ── Layout principal — roata MEREU vizibilă ──
  const isSpinning = step === 'spinning'
  const canSpin = step === 'spin' && !saving

  return (
    <div style={{ textAlign: 'center', padding: '48px 20px 40px' }}>
      {/* Titlu */}
      {(step === 'preview' || step === 'register') && (
        <>
          <p style={{ color: s.ruby, fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}>✦ Încearcă norocul ✦</p>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: 'normal', marginBottom: '8px', color: '#1C1C1C' }}>Roata Norocului</h3>
          <p style={{ color: '#888', fontSize: '15px', marginBottom: '36px', maxWidth: '420px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Înregistrează-te și câștigă un premiu la prima ta programare!
          </p>
        </>
      )}
      {step === 'spin' && (
        <>
          <p style={{ color: s.ruby, fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}>✦ Momentul tău ✦</p>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: 'normal', marginBottom: '8px', color: '#1C1C1C' }}>
            Bună, <span style={{ color: s.ruby, fontStyle: 'italic' }}>{user?.nume}</span>!
          </h3>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '36px', letterSpacing: '0.5px' }}>
            Apasă roata sau butonul pentru a o învârti
          </p>
        </>
      )}
      {isSpinning && (
        <div style={{ height: '62px' }} />
      )}

      {/* Roata — un singur canvas, mereu pe pagină */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '36px' }}>
        <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `28px solid ${s.ruby}`, zIndex: 10, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }} />
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{
            borderRadius: '50%',
            boxShadow: '0 20px 60px rgba(155,27,48,0.3), 0 0 0 6px rgba(201,168,76,0.2)',
            cursor: canSpin ? 'pointer' : 'default',
            display: 'block',
          }}
          onClick={canSpin ? doSpin : undefined}
        />
      </div>

      {/* Secțiunea de jos — se schimbă în funcție de step */}
      {step === 'preview' && (
        <div>
          <button
            onClick={() => setStep('register')}
            style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '50px', padding: '16px 48px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 8px 28px rgba(155,27,48,0.35)', transition: 'all 0.3s' }}>
            ✦ ÎNCEARCĂ NOROCUL ✦
          </button>
          <p style={{ color: '#ccc', fontSize: '12px', marginTop: '14px' }}>Poți reveni la fiecare 2 săptămâni</p>
        </div>
      )}

      {step === 'register' && (
        <div style={{ maxWidth: '380px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
            {formErr && <p style={{ color: '#E53E3E', fontSize: '13px', margin: 0 }}>{formErr}</p>}
            <button
              type="submit"
              disabled={formLoading}
              style={{ background: formLoading ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '50px', padding: '15px 40px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px', cursor: formLoading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 24px rgba(155,27,48,0.3)', transition: 'all 0.3s' }}>
              {formLoading ? 'SE VERIFICĂ...' : '✦ CONTINUĂ ✦'}
            </button>
          </form>
          <p style={{ color: '#bbb', fontSize: '12px', marginTop: '16px', lineHeight: 1.5 }}>
            Numărul tău este folosit doar pentru a-ți rezerva premiul.<br />Nu trimitem spam.
          </p>
        </div>
      )}

      {step === 'spin' && (
        <div>
          <button
            onClick={doSpin}
            style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '50px', padding: '16px 52px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 8px 28px rgba(155,27,48,0.35)', transition: 'all 0.3s' }}>
            ✦ ÎNVÂRTE ROATA ✦
          </button>
          <p style={{ color: '#ccc', fontSize: '12px', marginTop: '14px', letterSpacing: '0.5px' }}>O singură șansă — fă-o să conteze</p>
        </div>
      )}

      {isSpinning && (
        <p style={{ color: s.ruby, fontSize: '14px', letterSpacing: '3px', fontFamily: 'Georgia, serif' }}>✦ SE ÎNVÂRTE... ✦</p>
      )}
    </div>
  )
}
