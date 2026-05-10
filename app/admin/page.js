'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const ZILE = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

const SERVICII = [
  { name: 'Manichiură Clasică', pret: 70, durata: 30 },
  { name: 'Rubber Base cu Apex + 1 Design', pret: 145, durata: 80 },
  { name: 'Ojă Semi + Culoare', pret: 140, durata: 60 },
  { name: 'Gel pe Unghia Naturală', pret: 150, durata: 60 },
  { name: 'Construcție Gel/Polygel 1-2', pret: 165, durata: 90 },
  { name: 'Construcție Gel/Polygel 3-4', pret: 175, durata: 90 },
  { name: 'Construcție Gel/Polygel 4+', pret: 185, durata: 90 },
  { name: 'Întreținere Gel/Polygel 1-2', pret: 145, durata: 90 },
  { name: 'Întreținere Gel/Polygel 3-4', pret: 155, durata: 90 },
  { name: 'Întreținere Gel/Polygel 4+', pret: 165, durata: 90 },
  { name: 'Întreținere din altă parte', pret: 20, durata: 10 },
  { name: 'Construcție SLIM', pret: 210, durata: 100 },
  { name: 'Îndepărtare material tehnic', pret: 25, durata: 15 },
  { name: 'French / Babyboomer / Culoare', pret: 15, durata: 15 },
  { name: 'Taxă întreținere după 4 săptămâni', pret: 20, durata: 5 },
]

const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  cancelled: '#EF4444',
  noshow: '#6B7280',
}

const PX_PER_MIN = 1.2
const GRID_START_HOUR = 7
const GRID_END_HOUR = 26 // 01:00 next day = 25th hour, show until 26
const GRID_HOURS = GRID_END_HOUR - GRID_START_HOUR

function timeToMin(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatDateRO(d) {
  return `${d.getDate()} ${LUNI[d.getMonth()]} ${d.getFullYear()}`
}

function parseDateRO(str) {
  if (!str) return null
  const parts = str.trim().split(' ')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const month = LUNI.indexOf(parts[1])
  const year = parseInt(parts[2])
  if (month === -1 || isNaN(day) || isNaN(year)) return null
  return new Date(year, month, day)
}

function DatePickerPopup({ value, onChange, onClose }) {
  const parsed = parseDateRO(value)
  const today = new Date()
  const [month, setMonth] = useState(parsed ? parsed.getMonth() : today.getMonth())
  const [year, setYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectedDay = parsed && parsed.getMonth() === month && parsed.getFullYear() === year ? parsed.getDate() : null
  const todayDay = today.getMonth() === month && today.getFullYear() === year ? today.getDate() : null

  return (
    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 300, background: 'white', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', padding: '16px', minWidth: '290px', marginTop: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9B1B30', padding: '4px 10px' }}>‹</button>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 'bold' }}>{LUNI[month]} {year}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9B1B30', padding: '4px 10px' }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px' }}>
        {ZILE.map(z => (
          <div key={z} style={{ textAlign: 'center', fontSize: '10px', color: '#999', padding: '4px 0', fontWeight: 'bold', letterSpacing: '1px' }}>{z}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {cells.map((d, i) => d ? (
          <button key={i} onClick={() => { onChange(formatDateRO(new Date(year, month, d))); onClose() }}
            style={{
              padding: '8px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px',
              background: selectedDay === d ? '#9B1B30' : todayDay === d ? '#F7EFE5' : 'transparent',
              color: selectedDay === d ? 'white' : todayDay === d ? '#9B1B30' : '#1C1C1C',
              fontWeight: selectedDay === d || todayDay === d ? 'bold' : 'normal',
            }}>
            {d}
          </button>
        ) : <div key={i} />)}
      </div>

      <div style={{ marginTop: '12px', textAlign: 'center', borderTop: '1px solid #F0EAE0', paddingTop: '12px' }}>
        <button onClick={() => { onChange(formatDateRO(today)); onClose() }}
          style={{ background: '#F7EFE5', border: '1px solid #C9A84C', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px', color: '#9B1B30' }}>
          Azi
        </button>
      </div>
    </div>
  )
}

function ClientDrawer({ client, programari, token, onClose, onSaved }) {
  const [form, setForm] = useState({ ...client })
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [editProg, setEditProg] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showNewProg, setShowNewProg] = useState(false)
  const [newProg, setNewProg] = useState({ serviciu: '', data: formatDateRO(new Date()), ora: '', plata: 'numerar', observatii: '' })
  const [showNewDatePicker, setShowNewDatePicker] = useState(false)
  const newDateRef = useRef(null)

  const clientProg = programari
    .filter(p => p.telefon === client.telefon)
    .sort((a, b) => {
      const da = parseDateRO(a.data), db = parseDateRO(b.data)
      if (!da || !db) return 0
      return db - da
    })

  const authH = { 'Content-Type': 'application/json', 'x-admin-token': token }

  async function saveClient() {
    setSaving(true)
    await fetch('/api/admin/clienti', { method: 'PATCH', headers: authH, body: JSON.stringify(form) })
    setSaving(false)
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 2000)
    onSaved()
  }

  async function deleteClient() {
    await fetch('/api/admin/clienti', { method: 'DELETE', headers: authH, body: JSON.stringify({ id: client.id }) })
    onClose()
    onSaved()
  }

  async function updateProgStatus(id, status) {
    await fetch('/api/admin/programari', { method: 'PATCH', headers: authH, body: JSON.stringify({ id, status }) })
    onSaved()
  }

  async function saveProg(p) {
    await fetch('/api/admin/programari', { method: 'PATCH', headers: authH, body: JSON.stringify(p) })
    setEditProg(null)
    onSaved()
  }

  async function deleteProg(id) {
    await fetch('/api/admin/programari', { method: 'DELETE', headers: authH, body: JSON.stringify({ id }) })
    setConfirmDelete(null)
    onSaved()
  }

  async function addNewProg(e) {
    e.preventDefault()
    const serv = SERVICII.find(s => s.name === newProg.serviciu)
    const id = Date.now()
    await fetch('/api/admin/programari', {
      method: 'POST', headers: authH,
      body: JSON.stringify({
        ...newProg, id,
        nume: client.nume, telefon: client.telefon,
        pret: serv?.pret || 0, durata: serv?.durata || 0,
        status: 'confirmed'
      })
    })
    setShowNewProg(false)
    setNewProg({ serviciu: '', data: formatDateRO(new Date()), ora: '', plata: 'numerar', observatii: '' })
    onSaved()
  }

  const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5' }
  const SC = { pending: '#F59E0B', confirmed: '#10B981', cancelled: '#EF4444', noshow: '#6B7280' }
  const totalPret = clientProg.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (Number(p.pret) || 0), 0)

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />

      {/* Drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '100vw', background: '#F8F4F0', zIndex: 201, overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${s.ruby} 0%, #6A1020 100%)`, color: 'white', padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '3px', opacity: 0.7, marginBottom: '4px' }}>FIȘA CLIENTULUI</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 'normal', margin: 0 }}>{form.nume || '—'}</h2>
              <p style={{ fontSize: '14px', opacity: 0.85, marginTop: '4px' }}>{form.telefon}</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          {/* Stats bar */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
            <div><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{clientProg.length}</p><p style={{ fontSize: '11px', opacity: 0.7 }}>programări</p></div>
            <div><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{clientProg.filter(p => p.status === 'confirmed').length}</p><p style={{ fontSize: '11px', opacity: 0.7 }}>confirmate</p></div>
            <div><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalPret} lei</p><p style={{ fontSize: '11px', opacity: 0.7 }}>total încasat</p></div>
          </div>
        </div>

        <div style={{ padding: '24px 28px', flex: 1 }}>

          {/* ── DATE PERSONALE ── */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 'bold', color: s.ruby, marginBottom: '16px', letterSpacing: '1px' }}>Date personale</p>

            {[
              { label: 'Nume complet', key: 'nume', type: 'text' },
              { label: 'Telefon', key: 'telefon', type: 'tel' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Data nașterii', key: 'data_nastere', type: 'text', placeholder: 'ex: 15 Martie 1995' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>{f.label}</label>
                <input type={f.type} value={form[f.key] || ''} placeholder={f.placeholder || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Observații</label>
              <textarea rows={3} value={form.observatii || ''} onChange={e => setForm({ ...form, observatii: e.target.value })}
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', fontFamily: 'Georgia, serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={saveClient} disabled={saving}
                style={{ background: s.ruby, color: 'white', border: 'none', borderRadius: '50px', padding: '10px 24px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                {saving ? 'Se salvează...' : savedOk ? '✓ Salvat!' : 'SALVEAZĂ DATELE'}
              </button>
              <a href={`https://wa.me/${form.telefon?.replace(/[^0-9]/g, '')}`} target="_blank"
                style={{ background: '#25D366', color: 'white', borderRadius: '50px', padding: '10px 18px', fontSize: '13px', textDecoration: 'none', fontWeight: 'bold' }}>
                WhatsApp
              </a>
            </div>
          </div>

          {/* ── PROGRAMĂRI ── */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 'bold', color: s.ruby, letterSpacing: '1px', margin: 0 }}>Programări ({clientProg.length})</p>
              <button onClick={() => setShowNewProg(v => !v)}
                style={{ background: showNewProg ? '#EEE' : s.ruby, color: showNewProg ? '#555' : 'white', border: 'none', borderRadius: '20px', padding: '7px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                {showNewProg ? 'Anulează' : '+ Programare nouă'}
              </button>
            </div>

            {/* Form programare nouă */}
            {showNewProg && (
              <form onSubmit={addNewProg} style={{ background: '#F7EFE5', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #C9A84C33' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Programare pentru <strong>{client.nume}</strong></p>

                {/* Data cu picker */}
                <div style={{ marginBottom: '10px', position: 'relative' }} ref={newDateRef}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '3px' }}>Data *</label>
                  <input readOnly required value={newProg.data} onClick={() => setShowNewDatePicker(v => !v)}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', boxSizing: 'border-box', background: 'white' }} />
                  {showNewDatePicker && (
                    <DatePickerPopup value={newProg.data}
                      onChange={val => { setNewProg({ ...newProg, data: val }); setShowNewDatePicker(false) }}
                      onClose={() => setShowNewDatePicker(false)} />
                  )}
                </div>

                {/* Ora */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '3px' }}>Ora *</label>
                  <input type="time" required value={newProg.ora} onChange={e => setNewProg({ ...newProg, ora: e.target.value })}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>

                {/* Serviciu */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '3px' }}>Serviciu *</label>
                  <select required value={newProg.serviciu} onChange={e => setNewProg({ ...newProg, serviciu: e.target.value })}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="">Alege serviciul</option>
                    {SERVICII.map(sv => <option key={sv.name} value={sv.name}>{sv.name} — {sv.pret} lei ({sv.durata} min)</option>)}
                  </select>
                </div>

                {/* Plată */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '3px' }}>Plată</label>
                  <select value={newProg.plata} onChange={e => setNewProg({ ...newProg, plata: e.target.value })}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="numerar">Numerar</option>
                    <option value="transfer">Transfer bancar</option>
                  </select>
                </div>

                <button type="submit" style={{ background: s.ruby, color: 'white', border: 'none', borderRadius: '20px', padding: '10px 24px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', width: '100%' }}>
                  SALVEAZĂ PROGRAMAREA
                </button>
              </form>
            )}

            {clientProg.length === 0 && !showNewProg && <p style={{ color: '#AAA', fontSize: '14px' }}>Nicio programare înregistrată.</p>}

            {clientProg.map(p => (
              <div key={p.id} style={{ border: `1px solid ${SC[p.status] || '#E5E7EB'}33`, borderLeft: `4px solid ${SC[p.status] || '#E5E7EB'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', background: '#FAFAFA' }}>
                {editProg?.id === p.id ? (
                  /* ── Edit programare form ── */
                  <div>
                    {[
                      { label: 'Data', key: 'data', type: 'text' },
                      { label: 'Ora', key: 'ora', type: 'time' },
                      { label: 'Serviciu', key: 'serviciu', type: 'text' },
                      { label: 'Preț (lei)', key: 'pret', type: 'number' },
                      { label: 'Observații', key: 'observatii', type: 'text' },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '3px' }}>{f.label}</label>
                        <input type={f.type} value={editProg[f.key] || ''}
                          onChange={e => setEditProg({ ...editProg, [f.key]: e.target.value })}
                          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '3px' }}>Status</label>
                      <select value={editProg.status} onChange={e => setEditProg({ ...editProg, status: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}>
                        {['confirmed', 'pending', 'cancelled', 'noshow'].map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => saveProg(editProg)} style={{ background: s.ruby, color: 'white', border: 'none', borderRadius: '20px', padding: '8px 18px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Salvează</button>
                      <button onClick={() => setEditProg(null)} style={{ background: '#EEE', border: 'none', borderRadius: '20px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px' }}>Anulează</button>
                    </div>
                  </div>
                ) : (
                  /* ── View programare ── */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>{p.serviciu}</p>
                        <p style={{ fontSize: '13px', color: '#666' }}>{p.data} · {p.ora} · {p.pret} lei</p>
                        {p.observatii && <p style={{ fontSize: '12px', color: '#999', marginTop: '3px', fontStyle: 'italic' }}>{p.observatii}</p>}
                      </div>
                      <span style={{ fontSize: '11px', background: (SC[p.status] || '#ccc') + '22', color: SC[p.status] || '#ccc', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{p.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {['confirmed', 'pending', 'cancelled', 'noshow'].map(st => (
                        <button key={st} onClick={() => updateProgStatus(p.id, st)}
                          style={{ padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', background: p.status === st ? SC[st] : '#F0EAE0', color: p.status === st ? 'white' : '#555', fontWeight: p.status === st ? 'bold' : 'normal' }}>
                          {st === 'confirmed' ? '✓ confirmată' : st === 'pending' ? '⏳ așteptare' : st === 'cancelled' ? '✗ anulată' : '— neprezentare'}
                        </button>
                      ))}
                      <button onClick={() => setEditProg({ ...p })}
                        style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid #E5E7EB', cursor: 'pointer', fontSize: '11px', background: 'white', color: '#555', marginLeft: 'auto' }}>
                        ✏️ Editează
                      </button>
                      {confirmDelete === p.id ? (
                        <>
                          <button onClick={() => deleteProg(p.id)} style={{ padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', background: '#EF4444', color: 'white', fontWeight: 'bold' }}>Confirm șterge</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', background: '#EEE', color: '#555' }}>Nu</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDelete(p.id)} style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid #EF444444', cursor: 'pointer', fontSize: '11px', background: 'white', color: '#EF4444' }}>🗑 Șterge</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── ZONA PERICULOASĂ ── */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: '3px solid #EF4444' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#EF4444', marginBottom: '8px' }}>Șterge client</p>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Se șterg datele clientului. Programările rămân în baza de date.</p>
            {confirmDelete === 'client' ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={deleteClient} style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '20px', padding: '8px 18px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Confirm ștergere</button>
                <button onClick={() => setConfirmDelete(null)} style={{ background: '#EEE', border: 'none', borderRadius: '20px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px' }}>Anulează</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete('client')} style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '20px', padding: '8px 18px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Șterge clientul
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function MonthOverview({ programari, viewDate, onSelectDay, onClose }) {
  const today = new Date()
  const [month, setMonth] = useState(viewDate.getMonth())
  const [year, setYear] = useState(viewDate.getFullYear())

  const countPerDay = {}
  programari.forEach(p => {
    if (p.status === 'cancelled' || p.status === 'noshow') return
    const key = p.data?.trim()
    if (key) countPerDay[key] = (countPerDay[key] || 0) + 1
  })

  function circleStyle(count) {
    if (count === 0) return { border: '2px solid #E5E7EB', background: 'transparent' }
    const color = count <= 2 ? '#10B981' : count <= 4 ? '#F59E0B' : '#EF4444'
    const fills = [0, 0.2, 0.4, 0.6, 0.75, 0.88, 1]
    const opacity = fills[Math.min(count, 6)]
    return { border: `2px solid ${color}`, background: color, opacity }
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isViewDay = d => viewDate.getDate() === d && viewDate.getMonth() === month && viewDate.getFullYear() === year
  const isToday = d => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year

  return (
    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', zIndex: 300, background: 'white', borderRadius: '20px', boxShadow: '0 16px 56px rgba(0,0,0,0.18)', padding: '20px 24px', minWidth: '360px', marginTop: '10px' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9B1B30', padding: '4px 10px', borderRadius: '8px' }}>‹</button>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C' }}>{LUNI[month]} {year}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9B1B30', padding: '4px 10px', borderRadius: '8px' }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {ZILE.map(z => (
          <div key={z} style={{ textAlign: 'center', fontSize: '10px', color: '#AAA', fontWeight: 'bold', letterSpacing: '1px', padding: '4px 0' }}>{z}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const key = formatDateRO(new Date(year, month, d))
          const count = countPerDay[key] || 0
          const cs = circleStyle(count)
          const selected = isViewDay(d)
          const todayMark = isToday(d)

          return (
            <button key={i} onClick={() => { onSelectDay(new Date(year, month, d)); onClose() }}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 2px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '10px', outline: selected ? '2px solid #9B1B30' : todayMark ? '2px solid #C9A84C' : 'none' }}>
              {/* Circle */}
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: cs.border, background: cs.background }}>
                <span style={{ fontSize: '13px', fontWeight: selected || todayMark ? 'bold' : 'normal', color: count > 0 && cs.opacity > 0.5 ? 'white' : '#1C1C1C', position: 'relative', zIndex: 1 }}>{d}</span>
              </div>
              {/* Count badge */}
              {count > 0 && (
                <span style={{ fontSize: '9px', color: count <= 2 ? '#10B981' : count <= 4 ? '#F59E0B' : '#EF4444', marginTop: '2px', fontWeight: 'bold' }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F0EAE0' }}>
        {[['#10B981', '1-2 prog.'], ['#F59E0B', '3-4 prog.'], ['#EF4444', '5+ prog.']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            <span style={{ fontSize: '11px', color: '#888' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState('calendar')
  const [programari, setProgramari] = useState([])
  const [clienti, setClienti] = useState([])
  const [viewDate, setViewDate] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)
  const [showMonthOverview, setShowMonthOverview] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [csvText, setCsvText] = useState('')
  const [importStatus, setImportStatus] = useState(null)
  const [token, setToken] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [confirmDeleteProg, setConfirmDeleteProg] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const datePickerRef = useRef(null)
  const monthOverviewRef = useRef(null)

  const [newProg, setNewProg] = useState({
    nume: '', telefon: '', serviciu: '', data: '', ora: '', plata: 'numerar', observatii: ''
  })

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    if (!t) { router.push('/admin/login'); return }
    setToken(t)
  }, [])

  useEffect(() => {
    if (!token) return
    fetchProgramari()
    fetchClienti()
  }, [token])

  useEffect(() => {
    function handleClick(e) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) setShowDatePicker(false)
      if (monthOverviewRef.current && !monthOverviewRef.current.contains(e.target)) setShowMonthOverview(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const authHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-token': token })

  async function fetchProgramari() {
    const res = await fetch('/api/admin/programari', { headers: { 'x-admin-token': token } })
    const data = await res.json()
    setProgramari(Array.isArray(data) ? data : [])
  }

  async function fetchClienti() {
    const res = await fetch('/api/admin/clienti', { headers: { 'x-admin-token': token } })
    const data = await res.json()
    setClienti(Array.isArray(data) ? data : [])
  }

  function openAddForm() {
    setNewProg({
      nume: '', telefon: '', serviciu: '',
      data: formatDateRO(viewDate),
      ora: '', plata: 'numerar', observatii: ''
    })
    setShowAddForm(true)
  }

  async function addProgramare(e) {
    e.preventDefault()
    const serv = SERVICII.find(s => s.name === newProg.serviciu)
    await fetch('/api/admin/programari', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...newProg, pret: serv?.pret || 0, durata: serv?.durata || 0 })
    })
    await fetch('/api/admin/clienti', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nume: newProg.nume, telefon: newProg.telefon, sursa: 'admin' })
    })
    setShowAddForm(false)
    await fetchProgramari()
    await fetchClienti()
  }

  async function updateStatus(id, status) {
    await fetch('/api/admin/programari', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ id, status })
    })
    fetchProgramari()
  }

  async function deleteProgramare(id) {
    await fetch('/api/admin/programari', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id })
    })
    setConfirmDeleteProg(null)
    await fetchProgramari()
  }

  async function importCSV() {
    setImportStatus('loading')
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    const clientiList = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/['"]/g, ''))
      const obj = {}
      headers.forEach((h, i) => { obj[h] = vals[i] || '' })
      return {
        nume: obj.nume || obj.name || obj['nume complet'] || '',
        telefon: obj.telefon || obj.phone || obj['nr telefon'] || '',
        email: obj.email || '',
        data_nastere: obj['data nastere'] || obj.birthday || '',
        observatii: obj.observatii || obj.notes || '',
      }
    }).filter(c => c.telefon)

    const res = await fetch('/api/admin/clienti', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ bulk: true, clienti: clientiList })
    })
    const data = await res.json()
    setImportStatus(`✅ ${data.inserted} clienți importați`)
    fetchClienti()
    setCsvText('')
  }

  const dateStr = formatDateRO
  const progAzi = programari.filter(p => p.data?.trim() === dateStr(viewDate).trim())
  const filteredClienti = clienti.filter(c =>
    c.nume?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.telefon?.includes(clientSearch)
  )
  const clientProgramari = (telefon) => programari.filter(p => p.telefon === telefon)

  const gridHeight = GRID_HOURS * 60 * PX_PER_MIN

  if (!token) return null

  const s = { ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', white: '#fff', text: '#1C1C1C' }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Georgia, serif' }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? '68px' : '224px',
        height: '100vh',
        background: 'linear-gradient(160deg, #9B1B30 0%, #7A1525 55%, #5C0F1A 100%)',
        color: 'white', flexShrink: 0, display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden', position: 'relative',
        boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
      }}>

        {/* Header */}
        <div style={{ padding: sidebarCollapsed ? '22px 0 18px' : '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '76px' }}>
          {sidebarCollapsed ? (
            /* "E" auriu cu reflexie */
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(145deg, #7A1525 0%, #5C0F1A 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'bold', lineHeight: 1,
                  background: 'linear-gradient(180deg, #F9E4A0 0%, #C9A84C 45%, #F5D07A 75%, #C9A84C 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 1px 2px rgba(201,168,76,0.5))',
                }}>E</span>
              </div>
              {/* Shimmer overlay */}
              <div style={{ position: 'absolute', top: '4px', left: '8px', width: '12px', height: '4px', background: 'rgba(255,255,255,0.18)', borderRadius: '4px', transform: 'rotate(-20deg)' }} />
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <p style={{ fontSize: '15px', letterSpacing: '4px', fontWeight: 'bold', margin: 0, fontFamily: 'Georgia, serif' }}>EVOLIS</p>
              <p style={{ fontSize: '10px', opacity: 0.5, marginTop: '3px', margin: '3px 0 0', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div style={{ padding: '10px 0', flex: 1 }}>
          {[
            { id: 'calendar', icon: '📅', label: 'Calendar' },
            { id: 'clienti', icon: '👤', label: 'Clienți' },
            { id: 'rapoarte', icon: '📊', label: 'Rapoarte' },
            { id: 'import', icon: '📥', label: 'Import CSV' },
          ].map(item => {
            const active = tab === item.id
            return (
              <button key={item.id} onClick={() => setTab(item.id)} title={sidebarCollapsed ? item.label : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', textAlign: 'left',
                  padding: sidebarCollapsed ? '13px 0' : '12px 16px',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.65)',
                  fontSize: '13.5px', cursor: 'pointer', whiteSpace: 'nowrap',
                  borderRadius: sidebarCollapsed ? '0' : '0 24px 24px 0',
                  marginRight: sidebarCollapsed ? '0' : '10px',
                  transition: 'background 0.18s, color 0.18s',
                  position: 'relative',
                }}>
                {/* Active gold bar */}
                {active && !sidebarCollapsed && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '0 3px 3px 0', background: 'linear-gradient(180deg, #F9E4A0, #C9A84C)' }} />
                )}
                {/* Icon bubble when collapsed + active */}
                <div style={{
                  width: sidebarCollapsed ? '36px' : '28px',
                  height: sidebarCollapsed ? '36px' : '28px',
                  borderRadius: sidebarCollapsed ? '10px' : '8px',
                  background: active
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))'
                    : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: active && sidebarCollapsed ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.18s',
                }}>
                  <span style={{ fontSize: sidebarCollapsed ? '18px' : '16px' }}>{item.icon}</span>
                </div>
                {!sidebarCollapsed && <span style={{ fontWeight: active ? '600' : '400' }}>{item.label}</span>}
              </button>
            )
          })}
        </div>

        {/* Footer: toggle + logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px 0 8px' }}>
          {/* Toggle button */}
          <button onClick={() => setSidebarCollapsed(v => !v)}
            title={sidebarCollapsed ? 'Extinde' : 'Restrânge'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '10px', width: '100%',
              padding: sidebarCollapsed ? '10px 0' : '10px 18px',
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer', fontSize: '13px', transition: 'color 0.15s',
            }}>
            {/* Chevron pill */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s',
            }}>
              <span style={{ fontSize: '13px', display: 'inline-block', transform: sidebarCollapsed ? 'scaleX(-1)' : 'none', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', opacity: 0.7 }}>‹</span>
            </div>
            {!sidebarCollapsed && <span style={{ letterSpacing: '0.5px' }}>Restrânge</span>}
          </button>

          {/* Logout */}
          <button onClick={() => { localStorage.removeItem('admin_token'); router.push('/admin/login') }}
            title={sidebarCollapsed ? 'Deconectare' : ''}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '10px', width: '100%',
              padding: sidebarCollapsed ? '10px 0' : '10px 18px',
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer', fontSize: '13px',
            }}>
            <span style={{ fontSize: '15px', opacity: 0.6 }}>⎋</span>
            {!sidebarCollapsed && <span>Deconectare</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, background: '#F8F4F0', overflow: 'auto' }}>

        {/* CALENDAR TAB */}
        {tab === 'calendar' && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d) }}
                  style={{ background: 'white', border: '1px solid #DDD', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '16px' }}>‹</button>

                {/* Data clickabilă — deschide MonthOverview */}
                <div style={{ position: 'relative' }} ref={monthOverviewRef}>
                  <button onClick={() => setShowMonthOverview(v => !v)}
                    style={{ background: 'white', border: `1px solid ${showMonthOverview ? s.ruby : '#DDD'}`, borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 'normal', color: '#1C1C1C' }}>
                    {ZILE[viewDate.getDay()]}, {dateStr(viewDate)} <span style={{ fontSize: '12px', color: s.ruby, marginLeft: '4px' }}>▾</span>
                  </button>
                  {showMonthOverview && (
                    <MonthOverview
                      programari={programari}
                      viewDate={viewDate}
                      onSelectDay={d => setViewDate(d)}
                      onClose={() => setShowMonthOverview(false)}
                    />
                  )}
                </div>

                <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d) }}
                  style={{ background: 'white', border: '1px solid #DDD', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '16px' }}>›</button>
                <button onClick={() => setViewDate(new Date())}
                  style={{ background: s.nude, border: `1px solid ${s.gold}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: s.ruby }}>Azi</button>
              </div>
              <button onClick={openAddForm}
                style={{ background: s.ruby, color: 'white', border: 'none', borderRadius: '50px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                + Adaugă programare
              </button>
            </div>

            {/* Calendar grid — absolute positioning */}
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex' }}>
              {/* Hour labels column */}
              <div style={{ width: '70px', flexShrink: 0, borderRight: '1px solid #F0EAE0', position: 'relative', height: `${gridHeight}px` }}>
                {Array.from({ length: GRID_HOURS }, (_, i) => i + GRID_START_HOUR).map(h => (
                  <div key={h} style={{
                    position: 'absolute', top: `${(h - GRID_START_HOUR) * 60 * PX_PER_MIN}px`,
                    width: '100%', padding: '0 10px',
                    color: '#999', fontSize: '12px', lineHeight: `${60 * PX_PER_MIN}px`,
                    borderBottom: '1px solid #F0EAE0',
                  }}>
                    {String(h % 24).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Bookings area */}
              <div style={{ flex: 1, position: 'relative', height: `${gridHeight}px` }}>
                {/* Hour grid lines */}
                {Array.from({ length: GRID_HOURS }, (_, i) => i).map(i => (
                  <div key={i} style={{
                    position: 'absolute', top: `${i * 60 * PX_PER_MIN}px`,
                    left: 0, right: 0, height: `${60 * PX_PER_MIN}px`,
                    borderBottom: '1px solid #F0EAE0',
                    background: (i + GRID_START_HOUR) === 12 ? '#FFF8F0' : 'transparent',
                  }}>
                    {(i + GRID_START_HOUR) === 12 && (
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '12px', opacity: 0.7 }}>Pauză prânz</span>
                    )}
                  </div>
                ))}

                {/* Booking blocks */}
                {progAzi.map((p, idx) => {
                  const startMin = timeToMin(p.ora)
                  const dur = Number(p.durata) || 60
                  const topPx = (startMin - GRID_START_HOUR * 60) * PX_PER_MIN
                  const heightPx = Math.max(dur * PX_PER_MIN, 40)
                  const color = STATUS_COLORS[p.status] || STATUS_COLORS.confirmed

                  if (topPx < 0 || topPx > gridHeight) return null

                  const isConfirmingDelete = confirmDeleteProg === p.id

                  function openClientFromProg(e) {
                    e.stopPropagation()
                    const found = clienti.find(c => c.telefon === p.telefon)
                    if (found) { setSelectedClient(found); return }
                    // client nu e în tabela clienti — creăm un obiect temporar
                    setSelectedClient({ id: `temp_${p.id}`, nume: p.nume, telefon: p.telefon, email: '', data_nastere: '', observatii: '', sursa: 'site' })
                  }

                  return (
                    <div key={p.id} style={{
                      position: 'absolute',
                      top: `${topPx}px`,
                      left: `${8 + (idx % 2) * 8}px`,
                      right: '8px',
                      height: `${heightPx}px`,
                      background: isConfirmingDelete ? '#FEF2F2' : color + '22',
                      border: `2px solid ${isConfirmingDelete ? '#EF4444' : color}`,
                      borderRadius: '10px',
                      padding: '6px 10px',
                      overflow: 'hidden',
                      zIndex: isConfirmingDelete ? 20 : 10,
                      transition: 'background 0.15s, border-color 0.15s',
                      cursor: isConfirmingDelete ? 'default' : 'pointer',
                    }}
                    onClick={isConfirmingDelete ? undefined : openClientFromProg}
                    >
                      {isConfirmingDelete ? (
                        /* Confirmare ștergere */
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '6px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#EF4444', margin: 0 }}>Ștergi programarea lui {p.nume}?</p>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => deleteProgramare(p.id)}
                              style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                              Da, șterge
                            </button>
                            <button onClick={() => setConfirmDeleteProg(null)}
                              style={{ background: '#EEE', border: 'none', borderRadius: '20px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px' }}>
                              Nu
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View normal */
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '100%' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.ora} · {p.nume}</p>
                            <p style={{ fontSize: '11px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.serviciu} · {dur}min</p>
                            {heightPx > 55 && <p style={{ fontSize: '11px', color: '#888' }}>{p.telefon}</p>}
                            {heightPx > 75 && (
                              <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                                {['confirmed', 'cancelled', 'noshow'].map(st => (
                                  <button key={st} onClick={e => { e.stopPropagation(); updateStatus(p.id, st) }}
                                    style={{ padding: '2px 6px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: p.status === st ? color : '#EEE', color: p.status === st ? 'white' : '#666', fontSize: '10px' }}>
                                    {st === 'confirmed' ? '✓' : st === 'cancelled' ? '✗' : '—'}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '6px', flexShrink: 0 }}>
                            {heightPx <= 75 && ['confirmed', 'cancelled', 'noshow'].map(st => (
                              <button key={st} onClick={e => { e.stopPropagation(); updateStatus(p.id, st) }}
                                style={{ padding: '2px 6px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: p.status === st ? color : '#EEE', color: p.status === st ? 'white' : '#666', fontSize: '10px' }}>
                                {st === 'confirmed' ? '✓' : st === 'cancelled' ? '✗' : '—'}
                              </button>
                            ))}
                            <button onClick={e => { e.stopPropagation(); setConfirmDeleteProg(p.id) }}
                              title="Șterge programarea"
                              style={{ padding: '2px 7px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: '#FEE2E2', color: '#EF4444', fontSize: '12px', fontWeight: 'bold', lineHeight: 1.4 }}>
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {progAzi.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#AAA', fontSize: '15px' }}>
                Nicio programare pentru această zi.
              </div>
            )}
          </div>
        )}

        {/* CLIENTI TAB */}
        {tab === 'clienti' && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'normal', margin: 0 }}>Clienți ({clienti.length})</h2>
            </div>
            <input type="text" placeholder="Caută după nume sau telefon..."
              value={clientSearch} onChange={e => setClientSearch(e.target.value)}
              className="input-field" style={{ maxWidth: '400px', marginBottom: '20px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredClienti.map(c => {
                const nrProg = programari.filter(p => p.telefon === c.telefon).length
                const nrConf = programari.filter(p => p.telefon === c.telefon && p.status === 'confirmed').length
                return (
                  <div key={c.id}
                    onClick={() => setSelectedClient(c)}
                    style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{c.nume}</p>
                      <p style={{ color: '#666', fontSize: '13px' }}>{c.telefon}{c.email ? ` · ${c.email}` : ''}</p>
                      <p style={{ color: '#AAA', fontSize: '12px', marginTop: '3px' }}>{nrProg} programări · {nrConf} confirmate</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <a href={`https://wa.me/${c.telefon?.replace(/[^0-9]/g, '')}`} target="_blank"
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#25D366', color: 'white', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>
                        WhatsApp
                      </a>
                      <span style={{ color: '#9B1B30', fontSize: '13px', fontWeight: 'bold' }}>Deschide →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Client drawer */}
        {selectedClient && (
          <ClientDrawer
            client={selectedClient}
            programari={programari}
            token={token}
            onClose={() => setSelectedClient(null)}
            onSaved={async () => { await fetchProgramari(); await fetchClienti() }}
          />
        )}

        {/* RAPOARTE TAB */}
        {tab === 'rapoarte' && (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'normal', marginBottom: '24px' }}>Rapoarte</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Total programări', value: programari.length, color: s.ruby },
                { label: 'Confirmate', value: programari.filter(p => p.status === 'confirmed').length, color: '#10B981' },
                { label: 'În așteptare', value: programari.filter(p => p.status === 'pending').length, color: '#F59E0B' },
                { label: 'Anulate', value: programari.filter(p => p.status === 'cancelled').length, color: '#EF4444' },
                { label: 'Neprezentări', value: programari.filter(p => p.status === 'noshow').length, color: '#6B7280' },
                { label: 'Total clienți', value: clienti.length, color: s.gold },
                { label: 'Venituri totale', value: programari.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.pret || 0), 0) + ' lei', color: s.ruby },
              ].map(r => (
                <div key={r.label} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: `3px solid ${r.color}` }}>
                  <p style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>{r.label}</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: r.color }}>{r.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IMPORT CSV TAB */}
        {tab === 'import' && (
          <div style={{ padding: '24px', maxWidth: '700px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'normal', marginBottom: '8px' }}>Import clienți CSV</h2>
            <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px', lineHeight: 1.7 }}>
              Exportați clienții din Mero ca CSV și lipiți conținutul mai jos.<br />
              Coloane acceptate: <strong>nume, telefon, email, data_nastere, observatii</strong>
            </p>
            <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
              rows={12} className="input-field"
              placeholder={'nume,telefon,email\nMaria Ionescu,0712345678,maria@email.com\nAna Pop,0723456789,'}
              style={{ marginBottom: '16px', fontFamily: 'monospace', fontSize: '13px' }}
            />
            <button onClick={importCSV} disabled={!csvText.trim() || importStatus === 'loading'}
              className="btn-primary" style={{ padding: '14px 32px', fontSize: '14px' }}>
              {importStatus === 'loading' ? 'Se importă...' : 'IMPORTĂ CLIENȚII'}
            </button>
            {importStatus && importStatus !== 'loading' && (
              <p style={{ marginTop: '16px', color: '#10B981', fontSize: '15px' }}>{importStatus}</p>
            )}
          </div>
        )}
      </div>

      {/* Modal adaugă programare */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', margin: 0 }}>Adaugă programare</h3>
              <button type="button" onClick={() => setShowAddForm(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#F0EAE0', color: '#888', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ✕
              </button>
            </div>
            <form onSubmit={addProgramare}>

              {/* Nume */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Nume client *</label>
                <input type="text" required value={newProg.nume} onChange={e => setNewProg({ ...newProg, nume: e.target.value })} className="input-field" />
              </div>

              {/* Telefon */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Telefon *</label>
                <input type="tel" required value={newProg.telefon} onChange={e => setNewProg({ ...newProg, telefon: e.target.value })} className="input-field" />
              </div>

              {/* Data — cu date picker popup */}
              <div style={{ marginBottom: '14px', position: 'relative' }} ref={datePickerRef}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Data *</label>
                <input type="text" required readOnly value={newProg.data}
                  onClick={() => setShowDatePicker(v => !v)}
                  placeholder="Alege data..."
                  className="input-field"
                  style={{ cursor: 'pointer', caretColor: 'transparent' }}
                />
                {showDatePicker && (
                  <DatePickerPopup
                    value={newProg.data}
                    onChange={val => setNewProg({ ...newProg, data: val })}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </div>

              {/* Ora */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Ora *</label>
                <input type="time" required value={newProg.ora} onChange={e => setNewProg({ ...newProg, ora: e.target.value })} className="input-field" />
              </div>

              {/* Serviciu */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Serviciu *</label>
                <select required value={newProg.serviciu} onChange={e => setNewProg({ ...newProg, serviciu: e.target.value })} className="input-field">
                  <option value="">Alege serviciul</option>
                  {SERVICII.map(sv => <option key={sv.name} value={sv.name}>{sv.name} — {sv.pret} lei ({sv.durata} min)</option>)}
                </select>
              </div>

              {/* Plată */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Plată</label>
                <select value={newProg.plata} onChange={e => setNewProg({ ...newProg, plata: e.target.value })} className="input-field">
                  <option value="numerar">Numerar</option>
                  <option value="transfer">Transfer bancar</option>
                </select>
              </div>

              {/* Observații */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Observații</label>
                <textarea rows={2} value={newProg.observatii} onChange={e => setNewProg({ ...newProg, observatii: e.target.value })} className="input-field" />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '14px' }}>SALVEAZĂ</button>
                <button type="button" onClick={() => setShowAddForm(false)}
                  style={{ flex: 1, background: '#EEE', border: 'none', borderRadius: '50px', padding: '14px', cursor: 'pointer', fontSize: '14px' }}>Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
