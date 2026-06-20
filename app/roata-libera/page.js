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

// Roată liberă — fără înregistrare, fără cod, fără limită de o singură rotire.
// Folosită pentru clienți fizici în salon (link trimis direct pe WhatsApp).
export default function RoataLibera() {
  const [step, setStep] = useState('idle') // idle | spinning | result
  const [premiu, setPremiu] = useState(null)
  const canvasRef = useRef(null)
  const rotRef = useRef(0)
  const animRef = useRef(null)

  function startSlowSpin() {
    cancelAnimationFrame(animRef.current)
    function loop() {
      rotRef.current += 0.003
      drawWheelHD(canvasRef.current, rotRef.current)
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    drawWheelHD(canvasRef.current, 0)
    startSlowSpin()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

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

  function doSpin() {
    if (step === 'spinning') return
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
        playWin()
        setPremiu(PREMII[finalIdx].label)
        setStep('result')
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }

  function spinAgain() {
    setPremiu(null)
    setStep('idle')
    startSlowSpin()
  }

  const canSpin = step === 'idle'
  const isSpinning = step === 'spinning'

  return (
    <main style={{ minHeight: '100vh', background: '#F8F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center', padding: '48px 20px 40px', maxWidth: '460px' }}>
        <p style={{ color: s.ruby, fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'Georgia, serif' }}>✦ Salon EVOLIS ✦</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 'normal', marginBottom: '8px', color: '#1C1C1C' }}>Roata Norocului</h1>
        {step !== 'result' && (
          <p style={{ color: '#888', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
            {isSpinning ? <span style={{ color: s.ruby, letterSpacing: '3px' }}>✦ SE ÎNVÂRTE... ✦</span> : 'Apasă roata pentru a încerca norocul!'}
          </p>
        )}

        {step !== 'result' && (
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '32px' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `28px solid ${s.ruby}`, zIndex: 10, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }} />
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              style={{ borderRadius: '50%', boxShadow: '0 20px 60px rgba(155,27,48,0.3), 0 0 0 6px rgba(201,168,76,0.2)', cursor: canSpin ? 'pointer' : 'default', display: 'block' }}
              onClick={canSpin ? doSpin : undefined}
            />
          </div>
        )}

        {step === 'idle' && (
          <div>
            <button onClick={doSpin}
              style={{ background: `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '50px', padding: '16px 52px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 8px 28px rgba(155,27,48,0.35)' }}>
              ✦ ÎNVÂRTE ROATA ✦
            </button>
          </div>
        )}

        {step === 'result' && (
          <div>
            <p style={{ color: s.ruby, fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>🎉 Felicitări!</p>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 'normal', marginBottom: '8px', color: '#1C1C1C' }}>Ai câștigat!</h3>
            <div style={{ background: 'linear-gradient(135deg, #F7EFE5, #EDE0D0)', borderRadius: '20px', padding: '32px', border: '1.5px solid #C9A84C', boxShadow: '0 8px 32px rgba(201,168,76,0.2)', margin: '24px 0' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: s.ruby, fontWeight: 'bold', margin: 0 }}>{premiu}</p>
            </div>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
              Arată acest ecran unei colege din salon pentru a-ți revendica premiul. ✦
            </p>
            <button onClick={spinAgain}
              style={{ background: 'white', color: s.ruby, border: `1.5px solid ${s.ruby}`, borderRadius: '50px', padding: '12px 32px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer' }}>
              Învârte din nou
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
