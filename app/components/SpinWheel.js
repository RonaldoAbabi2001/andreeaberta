'use client'
import { useRef, useState, useEffect } from 'react'

const PREMII = [
  'Manichiură Clasică',
  'Design Gratuit',
  'Rubber Base cu Apex',
  '10% Reducere',
  'Ojă Semi + Culoare',
  'Gel pe Unghia Naturală',
  'Îngrijire Cuticule',
  '15% Reducere',
]

const CULORI = [
  '#9B1B30', '#C9A84C', '#7A1525', '#D4AF6A',
  '#B5223C', '#E2C97E', '#6A1020', '#C9A84C',
]

export default function SpinWheel() {
  const canvasRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rotation, setRotation] = useState(0)
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

    // Shadow
    ctx.save()
    ctx.shadowColor = 'rgba(155,27,48,0.3)'
    ctx.shadowBlur = 30
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.restore()

    PREMII.forEach((premiu, i) => {
      const startAngle = rot + i * segmentAngle
      const endAngle = startAngle + segmentAngle

      // Segment
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = CULORI[i]
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Text
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = i % 2 === 0 ? '#fff' : '#1C1C1C'
      ctx.font = 'bold 11px Georgia, serif'
      ctx.fillText(premiu, r - 14, 4)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI)
    ctx.fillStyle = 'linear-gradient'
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28)
    grad.addColorStop(0, '#E2C97E')
    grad.addColorStop(1, '#C9A84C')
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()

    // EVOLIS text in center
    ctx.fillStyle = '#7A1525'
    ctx.font = 'bold 9px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('EVOLIS', cx, cy + 3)
  }

  useEffect(() => {
    drawWheel(rotation)
  }, [])

  function spin() {
    if (spinning) return
    setSpinning(true)
    setResult(null)

    const extraSpins = 5 + Math.random() * 5
    const randomStop = Math.random() * 2 * Math.PI
    const totalRotation = rotation + extraSpins * 2 * Math.PI + randomStop
    const duration = 4000
    const start = performance.now()
    const startRot = rotation

    function animate(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentRot = startRot + (totalRotation - startRot) * eased

      drawWheel(currentRot)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setRotation(totalRotation)
        // Calculate winner — pointer is at top (angle = -PI/2)
        const normalizedRot = ((totalRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const pointerAngle = (2 * Math.PI - normalizedRot + 3 * Math.PI / 2) % (2 * Math.PI)
        const winnerIndex = Math.floor(pointerAngle / segmentAngle) % PREMII.length
        setResult(PREMII[winnerIndex])
        setSpinning(false)
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ color: '#9B1B30', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Încearcă norocul ✦</p>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 'normal', marginBottom: '8px' }}>Roata Norocului</h3>
      <p style={{ color: '#888', marginBottom: '32px', fontSize: '15px' }}>Învârtiți roata și câștigați un premiu la prima programare!</p>

      {/* Wheel container */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
        {/* Pointer */}
        <div style={{
          position: 'absolute', top: '-12px', left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '24px solid #9B1B30',
          zIndex: 10,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }} />
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          style={{ borderRadius: '50%', boxShadow: '0 16px 48px rgba(155,27,48,0.25)', cursor: spinning ? 'not-allowed' : 'pointer' }}
          onClick={spin}
        />
      </div>

      <br />

      <button
        onClick={spin}
        disabled={spinning}
        style={{
          background: spinning ? '#ccc' : 'linear-gradient(135deg, #9B1B30, #7A1525)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '14px 40px',
          fontSize: '15px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          cursor: spinning ? 'not-allowed' : 'pointer',
          boxShadow: spinning ? 'none' : '0 6px 24px rgba(155,27,48,0.35)',
          transition: 'all 0.3s'
        }}
      >
        {spinning ? 'SE ÎNVÂRTE...' : '✦ ÎNVÂRTIȚI ✦'}
      </button>

      {result && (
        <div style={{
          marginTop: '28px',
          background: 'linear-gradient(135deg, #F7EFE5, #EDE0D0)',
          borderRadius: '20px',
          padding: '28px',
          border: '1.5px solid #C9A84C',
          maxWidth: '360px',
          margin: '28px auto 0',
          boxShadow: '0 8px 32px rgba(201,168,76,0.2)'
        }}>
          <p style={{ color: '#9B1B30', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>🎉 Felicitări!</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginBottom: '8px' }}>{result}</p>
          <p style={{ color: '#888', fontSize: '13px', lineHeight: 1.6 }}>Menționați premiul la programare pentru a beneficia de el.</p>
        </div>
      )}
    </div>
  )
}
