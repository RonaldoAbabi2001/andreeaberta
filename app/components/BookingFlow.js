'use client'
import { useState } from 'react'

const SPECIALIST = {
  name: 'Andreea Berta',
  titlu: 'Tehnician Onicolog Certificat',
  adresa: 'B-dul Dacia nr. 6, Bl. E1, Sc. A, Ap. 11, Piatra Neamț',
}

const SERVICII = [
  { name: 'Manichiură Clasică', pret: 70, durata: 30 },
  { name: 'Rubber Base cu Apex + 1 Design', pret: 145, durata: 80 },
  { name: 'Ojă Semi + Culoare', pret: 140, durata: 60 },
  { name: 'Gel pe Unghia Naturală (fără design)', pret: 150, durata: 60 },
  { name: 'Construcție Gel/Polygel 1-2', pret: 165, durata: 90 },
  { name: 'Construcție Gel/Polygel 3-4', pret: 175, durata: 90 },
  { name: 'Construcție Gel/Polygel 4+', pret: 185, durata: 90 },
  { name: 'Întreținere Gel/Polygel 1-2', pret: 145, durata: 90 },
  { name: 'Întreținere Gel/Polygel 3-4', pret: 155, durata: 90 },
  { name: 'Întreținere Gel/Polygel 4+', pret: 165, durata: 90 },
  { name: 'Întreținere din altă parte', pret: 20, durata: 10 },
  { name: 'Construcție SLIM', pret: 210, durata: 100 },
  { name: 'Îndepărtare material tehnic', pret: 25, durata: 15 },
  { name: 'Design per unghie', pret: 5, durata: 5 },
  { name: 'French / Babyboomer / Culoare', pret: 15, durata: 15 },
  { name: 'Taxă întreținere după 4 săptămâni', pret: 20, durata: 5 },
]

function generateSlots(durata) {
  const slots = []
  const ranges = [[9*60, 12*60], [13*60, 19*60]]
  for (const [start, end] of ranges) {
    let t = start
    while (t + durata <= end) {
      const h = String(Math.floor(t/60)).padStart(2,'0')
      const m = String(t%60).padStart(2,'0')
      slots.push(`${h}:${m}`)
      t += durata
    }
  }
  return slots
}

function getNext14Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

const ZILE = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

function formatData(d) {
  return `${d.getDate()} ${LUNI[d.getMonth()]} ${d.getFullYear()}`
}

const style = {
  ruby: '#9B1B30',
  rubyDark: '#7A1525',
  gold: '#C9A84C',
  nude: '#F7EFE5',
  white: '#FFFFFF',
  text: '#1C1C1C',
}

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [serviciu, setServiciu] = useState(null)
  const [data, setData] = useState(null)
  const [ora, setOra] = useState(null)
  const [plata, setPlata] = useState(null)
  const [form, setForm] = useState({ nume: '', telefon: '' })
  const [status, setStatus] = useState(null)

  const days = getNext14Days()
  const slots = serviciu ? generateSlots(serviciu.durata) : []

  const handleConfirm = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/programare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nume: form.nume,
          telefon: form.telefon,
          serviciu: serviciu.name,
          pret: serviciu.pret,
          durata: serviciu.durata,
          data: formatData(data),
          ora,
          plata,
        })
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✓</div>
        <h3 style={{ fontFamily: 'Georgia, serif', color: style.ruby, fontSize: '28px', fontWeight: 'normal', marginBottom: '12px' }}>
          Vă mulțumim, {form.nume}!
        </h3>
        <p style={{ color: '#666', lineHeight: 1.8, fontSize: '16px' }}>
          Programarea dumneavoastră a fost înregistrată.<br />
          Vă contactăm la <strong>{form.telefon}</strong> pentru confirmare.
        </p>
        <div style={{ marginTop: '32px', background: style.nude, borderRadius: '16px', padding: '24px', maxWidth: '360px', margin: '32px auto 0' }}>
          <p style={{ color: style.ruby, fontWeight: 'bold', marginBottom: '8px' }}>{serviciu.name}</p>
          <p style={{ color: '#555' }}>{formatData(data)} · {ora}</p>
          <p style={{ color: '#555' }}>Andreea Berta · EVOLIS, Piatra Neamț</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>

      {/* Progress bar */}
      <div style={{ display: 'flex', marginBottom: '32px', gap: '4px' }}>
        {[1,2,3,4].map(s => (
          <div key={s} style={{
            flex: 1, height: '4px', borderRadius: '4px',
            background: s <= step ? style.ruby : '#E0D0C0',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      {/* STEP 1 — Specialist */}
      {step === 1 && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 1</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '24px' }}>Alegeți specialistul</h2>
          <div
            onClick={() => setStep(2)}
            style={{
              background: style.white, borderRadius: '20px', padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', cursor: 'pointer',
              border: '2px solid transparent', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '20px'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = style.ruby}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${style.ruby}, ${style.rubyDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '24px', fontFamily: 'Georgia, serif', flexShrink: 0
            }}>A</div>
            <div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', marginBottom: '4px' }}>{SPECIALIST.name}</p>
              <p style={{ color: '#888', fontSize: '13px' }}>{SPECIALIST.titlu}</p>
              <p style={{ color: style.gold, fontSize: '13px', marginTop: '2px' }}>✦ Salon EVOLIS, Piatra Neamț</p>
            </div>
            <div style={{ marginLeft: 'auto', color: style.ruby, fontSize: '20px' }}>›</div>
          </div>
        </div>
      )}

      {/* STEP 2 — Serviciu */}
      {step === 2 && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 2</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '24px' }}>Alegeți serviciul</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SERVICII.map(s => (
              <div key={s.name}
                onClick={() => { setServiciu(s); setStep(3) }}
                style={{
                  background: style.white, borderRadius: '14px', padding: '16px 20px',
                  cursor: 'pointer', border: '1.5px solid #EEE',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
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
          <button onClick={() => setStep(1)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>
            ← Înapoi
          </button>
        </div>
      )}

      {/* STEP 3 — Data & Ora */}
      {step === 3 && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 3</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '8px' }}>Alegeți data și ora</h2>
          <p style={{ color: style.ruby, fontSize: '14px', marginBottom: '20px' }}>{serviciu.name} · {serviciu.durata} min</p>

          {/* Date bar */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '12px', marginBottom: '24px' }}>
            {days.map((d, i) => {
              const selected = data && data.toDateString() === d.toDateString()
              return (
                <div key={i}
                  onClick={() => { setData(d); setOra(null) }}
                  style={{
                    minWidth: '60px', borderRadius: '14px', padding: '10px 8px',
                    textAlign: 'center', cursor: 'pointer', flexShrink: 0,
                    background: selected ? style.ruby : style.white,
                    color: selected ? 'white' : style.text,
                    border: `1.5px solid ${selected ? style.ruby : '#EEE'}`,
                    boxShadow: selected ? '0 4px 16px rgba(155,27,48,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s'
                  }}
                >
                  <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>{ZILE[d.getDay()]}</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{d.getDate()}</p>
                  <p style={{ fontSize: '10px', opacity: 0.7 }}>{LUNI[d.getMonth()].slice(0,3)}</p>
                </div>
              )
            })}
          </div>

          {/* Ore disponibile */}
          {data && (
            <div>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Ore disponibile</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {slots.map(slot => {
                  const selected = ora === slot
                  return (
                    <div key={slot}
                      onClick={() => setOra(slot)}
                      style={{
                        padding: '10px 18px', borderRadius: '50px', cursor: 'pointer',
                        background: selected ? style.ruby : style.white,
                        color: selected ? 'white' : style.text,
                        border: `1.5px solid ${selected ? style.ruby : '#DDD'}`,
                        fontWeight: selected ? 'bold' : 'normal',
                        fontSize: '14px', transition: 'all 0.2s',
                        boxShadow: selected ? '0 4px 16px rgba(155,27,48,0.3)' : 'none'
                      }}
                    >{slot}</div>
                  )
                })}
              </div>

              {ora && (
                <button onClick={() => setStep(4)} className="btn-primary" style={{ width: '100%', textAlign: 'center', padding: '16px', fontSize: '14px' }}>
                  CONTINUAȚI →
                </button>
              )}
            </div>
          )}

          <button onClick={() => setStep(2)} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>
            ← Înapoi
          </button>
        </div>
      )}

      {/* STEP 4 — Recap + Confirmare */}
      {step === 4 && (
        <div>
          <p style={{ color: style.ruby, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Pasul 4</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', marginBottom: '24px' }}>Verificați și confirmați</h2>

          {/* Recap card */}
          <div style={{ background: style.nude, borderRadius: '20px', padding: '24px', marginBottom: '24px', border: `1px solid ${style.gold}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '13px' }}>Specialist</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Andreea Berta</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '13px' }}>Serviciu</span>
              <span style={{ fontSize: '14px', textAlign: 'right', maxWidth: '200px' }}>{serviciu.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '13px' }}>Data</span>
              <span style={{ fontSize: '14px' }}>{formatData(data)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '13px' }}>Ora</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: style.ruby }}>{ora}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '13px' }}>Durată</span>
              <span style={{ fontSize: '14px' }}>{serviciu.durata} min</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '13px' }}>Adresă</span>
              <span style={{ fontSize: '14px' }}>Salon EVOLIS, Piatra Neamț</span>
            </div>
            <div style={{ borderTop: `1px solid ${style.gold}`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: style.ruby, fontSize: '18px' }}>{serviciu.pret} lei</span>
            </div>
          </div>

          {/* Metoda de plata */}
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Metoda de plată</p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {[{ id: 'numerar', label: '💵 Numerar în salon' }, { id: 'transfer', label: '🏦 Transfer bancar' }].map(p => (
              <div key={p.id}
                onClick={() => setPlata(p.id)}
                style={{
                  flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center',
                  background: plata === p.id ? style.ruby : style.white,
                  color: plata === p.id ? 'white' : style.text,
                  border: `1.5px solid ${plata === p.id ? style.ruby : '#DDD'}`,
                  fontSize: '14px', transition: 'all 0.2s'
                }}
              >{p.label}</div>
            ))}
          </div>

          {/* Date contact */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
              Nume și prenume *
            </label>
            <input
              type="text" required
              value={form.nume}
              onChange={e => setForm({ ...form, nume: e.target.value })}
              className="input-field"
              placeholder="Ex: Maria Ionescu"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>
              Telefon *
            </label>
            <input
              type="tel" required
              value={form.telefon}
              onChange={e => setForm({ ...form, telefon: e.target.value })}
              className="input-field"
              placeholder="07XX XXX XXX"
            />
          </div>

          {status === 'error' && (
            <p style={{ color: style.ruby, fontSize: '14px', marginBottom: '16px' }}>A apărut o eroare. Încercați din nou.</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={!form.nume || !form.telefon || !plata || status === 'loading'}
            className="btn-primary"
            style={{ width: '100%', textAlign: 'center', padding: '16px', fontSize: '14px', opacity: (!form.nume || !form.telefon || !plata) ? 0.5 : 1 }}
          >
            {status === 'loading' ? 'Se procesează...' : 'CONFIRMAȚI PROGRAMAREA'}
          </button>

          <button onClick={() => setStep(3)} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px', width: '100%', textAlign: 'center' }}>
            ← Înapoi
          </button>
        </div>
      )}
    </div>
  )
}
