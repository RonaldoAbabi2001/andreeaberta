'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ProdusTab from '../components/ProdusTab'
import ServiciiTab from '../components/ServiciiTab'
import MeniuSalonTab from '../components/MeniuSalonTab'
import MaterialeUtilizate from '../components/MaterialeUtilizate'
import ExtraServicii from '../components/ExtraServicii'
import { IcoCalendar, IcoClienti, IcoProduse, IcoMeniu, IcoAnalitica, IcoRapoarte, IcoImport, IcoServicii, IcoRepetitiv, IcoAzi, IcoInchide, IcoConcediu, IcoSetari, IcoSms, IcoLimita } from '../components/AdminIcons'

const ZILE = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const ZILE_FULL = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă']
const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

function getWeekDays(date) {
  const d = new Date(date)
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon)
    dd.setDate(mon.getDate() + i)
    return dd
  })
}

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
const FINALIZAT_COLOR = '#0E7C66'

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

function ClientDrawer({ client, programari, token, onClose, onSaved, produseDB = [], serviciiDBProp = [] }) {
  const [form, setForm] = useState({ ...client })
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [editProg, setEditProg] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showNewProg, setShowNewProg] = useState(false)
  const [newProg, setNewProg] = useState({ serviciu: '', data: formatDateRO(new Date()), ora: '', plata: 'numerar', observatii: '' })
  const [showNewDatePicker, setShowNewDatePicker] = useState(false)
  const [drawerOverlapWarning, setDrawerOverlapWarning] = useState(null)
  const [materialeNouProg, setMaterialeNouProg] = useState([])
  const [extraServiciiProg, setExtraServiciiProg] = useState([])
  const [pretManualProg, setPretManualProg] = useState('')
  const [detailProg, setDetailProg] = useState(null)
  const [detailMateriale, setDetailMateriale] = useState([])
  const [detailFotos, setDetailFotos] = useState({ before: '', after: '' })
  const [detailOre, setDetailOre] = useState({ start: '', sfarsit: '' })
  const [savingFotos, setSavingFotos] = useState(false)
  const [savingOre, setSavingOre] = useState(false)
  const [detailMatSearch, setDetailMatSearch] = useState('')
  const [detailMatShowNou, setDetailMatShowNou] = useState(false)
  const [detailMatNou, setDetailMatNou] = useState({ nume: '', marca: '', categorie: '' })
  const [detailMatSavingNou, setDetailMatSavingNou] = useState(false)
  const [detailEdit, setDetailEdit] = useState({ serviciu: '', pret: '', tips: '', detalii_tehnice: '', despre_client: '' })
  const [savingDetailEdit, setSavingDetailEdit] = useState(false)
  const [smsProgramare, setSmsProgramare] = useState([])
  const newDateRef = useRef(null)

  useEffect(() => {
    if (!detailProg) return
    setDetailFotos({ before: detailProg.before_foto || '', after: detailProg.after_foto || '' })
    setDetailOre({ start: detailProg.ora || '', sfarsit: detailProg.ora_sfarsit || '' })
    fetch(`/api/admin/materiale?programare_id=${detailProg.id}`, { headers: { 'x-admin-token': token } })
      .then(r => r.json()).then(d => setDetailMateriale(Array.isArray(d) ? d : [])).catch(() => setDetailMateriale([]))
    fetch(`/api/sms-queue?programare_id=${detailProg.id}`, { headers: { 'x-admin-token': token } })
      .then(r => r.json()).then(d => setSmsProgramare(Array.isArray(d) ? d : [])).catch(() => setSmsProgramare([]))
    setDetailMatSearch('')
    setDetailMatShowNou(false)
    setDetailMatNou({ nume: '', marca: '', categorie: '' })
    setDetailEdit({ serviciu: detailProg.serviciu || '', pret: detailProg.pret ?? '', tips: detailProg.tips ?? '', detalii_tehnice: detailProg.detalii_tehnice || '', despre_client: detailProg.despre_client || '' })
  }, [detailProg?.id])

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

  async function saveFotos() {
    if (!detailProg) return
    setSavingFotos(true)
    await fetch('/api/admin/programari', { method: 'PATCH', headers: authH, body: JSON.stringify({ id: detailProg.id, _fotosOnly: true, before_foto: detailFotos.before, after_foto: detailFotos.after }) })
    setDetailProg(p => ({ ...p, before_foto: detailFotos.before, after_foto: detailFotos.after }))
    setSavingFotos(false)
  }

  async function savePlata(plata) {
    if (!detailProg) return
    await fetch('/api/admin/programari', { method: 'PATCH', headers: authH, body: JSON.stringify({ id: detailProg.id, _plataOnly: true, plata }) })
    setDetailProg(p => ({ ...p, plata }))
  }

  async function saveDetailMain() {
    if (!detailProg) return
    setSavingDetailEdit(true)
    const pret = Number(detailEdit.pret) || 0
    const tips = Number(detailEdit.tips) || 0
    await fetch('/api/admin/programari', { method: 'PATCH', headers: authH, body: JSON.stringify({ id: detailProg.id, _mainOnly: true, serviciu: detailEdit.serviciu, pret, tips, detalii_tehnice: detailEdit.detalii_tehnice, despre_client: detailEdit.despre_client }) })
    setDetailProg(p => ({ ...p, serviciu: detailEdit.serviciu, pret, tips, detalii_tehnice: detailEdit.detalii_tehnice, despre_client: detailEdit.despre_client }))
    setSavingDetailEdit(false)
    onSaved()
  }

  async function saveOre() {
    if (!detailProg) return
    setSavingOre(true)
    await fetch('/api/admin/programari', { method: 'PATCH', headers: authH, body: JSON.stringify({ id: detailProg.id, _oreOnly: true, ora: detailOre.start, ora_sfarsit: detailOre.sfarsit }) })
    setDetailProg(p => ({ ...p, ora: detailOre.start, ora_sfarsit: detailOre.sfarsit }))
    setSavingOre(false)
  }

  async function updateMaterial(id, cantitate_inainte, cantitate_dupa) {
    await fetch('/api/admin/materiale', { method: 'PATCH', headers: authH, body: JSON.stringify({ id, cantitate_inainte, cantitate_dupa }) })
    setDetailMateriale(prev => prev.map(m => m.id === id ? { ...m, cantitate_inainte, cantitate_dupa } : m))
  }

  async function addMaterialToDetail(produs) {
    const item = { produs_id: produs.id, produs_nume: produs.nume, marca: produs.marca || '', cantitate: 1 }
    const res = await fetch('/api/admin/materiale', {
      method: 'POST', headers: authH,
      body: JSON.stringify({ programare_id: detailProg.id, ...item })
    })
    const data = await res.json()
    setDetailMateriale(prev => [...prev, { ...item, id: data.id, cantitate_inainte: null, cantitate_dupa: null }])
    setDetailMatSearch('')
  }

  async function salveazaMatNouToDetail() {
    if (!detailMatNou.nume.trim()) return
    setDetailMatSavingNou(true)
    const res = await fetch('/api/admin/produse', {
      method: 'POST', headers: authH,
      body: JSON.stringify({ nume: detailMatNou.nume, marca: detailMatNou.marca, categorie: detailMatNou.categorie, stoc_bucati: 0, stoc_minim: 3 })
    })
    const data = await res.json()
    const item = { produs_id: data.id, produs_nume: detailMatNou.nume, marca: detailMatNou.marca || '', cantitate: 1 }
    const res2 = await fetch('/api/admin/materiale', {
      method: 'POST', headers: authH,
      body: JSON.stringify({ programare_id: detailProg.id, ...item })
    })
    const d2 = await res2.json()
    setDetailMateriale(prev => [...prev, { ...item, id: d2.id, cantitate_inainte: null, cantitate_dupa: null }])
    setDetailMatNou({ nume: '', marca: '', categorie: '' })
    setDetailMatShowNou(false)
    setDetailMatSavingNou(false)
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

  async function addNewProg(e, forceOverlap = false) {
    if (e && e.preventDefault) e.preventDefault()
    const serv = serviciiDBProp.find(s => s.nume === newProg.serviciu)
    const durataNoua = serv?.durata || 0

    if (!forceOverlap && newProg.ora && durataNoua) {
      const minNoua = timeToMin(newProg.ora)
      const conflicte = programari.filter(p => {
        if (p.data?.trim() !== newProg.data?.trim()) return false
        if (p.status === 'cancelled') return false
        if (!p.ora) return false
        const pMin = timeToMin(p.ora)
        const pDur = Number(p.durata) || 0
        return minNoua < pMin + pDur && minNoua + durataNoua > pMin
      })
      if (conflicte.length > 0) {
        const c = conflicte[0]
        setDrawerOverlapWarning({
          msg: `Suprapunere cu ${c.nume} — ${c.ora} (${c.durata} min).\nConfirmi programarea?`,
          onConfirm: () => { setDrawerOverlapWarning(null); addNewProg(null, true) }
        })
        return
      }
    }

    const id = Date.now()
    const pretExtrasD = extraServiciiProg.reduce((sum, e) => sum + Number(e.pret || 0), 0)
    const pretFinalD = pretManualProg !== '' ? Number(pretManualProg) : (Number(serv?.pret || 0) + pretExtrasD)
    const durataExtrasD = extraServiciiProg.reduce((sum, e) => sum + Number(e.durata || 0), 0)
    await fetch('/api/admin/programari', {
      method: 'POST', headers: authH,
      body: JSON.stringify({
        ...newProg, id,
        nume: client.nume, telefon: client.telefon,
        pret: pretFinalD, durata: (serv?.durata || 0) + durataExtrasD,
        extra_servicii: extraServiciiProg,
        status: 'confirmed'
      })
    })
    for (const mat of materialeNouProg) {
      await fetch('/api/admin/materiale', {
        method: 'POST', headers: authH,
        body: JSON.stringify({ programare_id: id, produs_id: mat.produs_id || null, produs_nume: mat.produs_nume, marca: mat.marca || '', cantitate: mat.cantitate || 1 })
      })
    }
    setMaterialeNouProg([])
    setExtraServiciiProg([])
    setPretManualProg('')
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
              { label: 'Telefon principal', key: 'telefon', type: 'tel' },
              { label: 'Telefon secundar', key: 'telefon_secundar', type: 'tel', placeholder: 'adăugat automat la schimbare' },
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

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>De unde vine</label>
                <select value={form.provenienta || ''} onChange={e => setForm({ ...form, provenienta: e.target.value })}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', fontFamily: 'Georgia, serif', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                  <option value="">— selectează —</option>
                  <option value="Piatra Neamț">Piatra Neamț</option>
                  <option value="Alt oraș">Alt oraș</option>
                  <option value="București">București</option>
                  <option value="Altă țară">Altă țară</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Cum ne-a găsit</label>
                <select value={form.sursa || ''} onChange={e => setForm({ ...form, sursa: e.target.value })}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', fontFamily: 'Georgia, serif', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                  <option value="">— selectează —</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Recomandare">Recomandare</option>
                </select>
              </div>
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
                    {serviciiDBProp.map(sv => <option key={sv.id} value={sv.nume}>{sv.nume} — {sv.pret} lei ({sv.durata} min)</option>)}
                  </select>
                </div>

                {/* Preț + Extra */}
                <div style={{ borderTop: '1px solid #E8DDD0', paddingTop: '12px', marginBottom: '10px' }}>
                  <ExtraServicii
                    servicii={serviciiDBProp}
                    mainServiciu={newProg.serviciu}
                    extras={extraServiciiProg}
                    onExtrasChange={setExtraServiciiProg}
                    pretBase={Number(serviciiDBProp.find(s => s.nume === newProg.serviciu)?.pret || 0)}
                    pretManual={pretManualProg}
                    onPretManualChange={setPretManualProg}
                  />
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

                {/* Materiale utilizate */}
                <div style={{ borderTop: '1px solid #E8DDD0', paddingTop: '12px', marginBottom: '14px' }}>
                  <MaterialeUtilizate programareId={null} produse={produseDB} onChange={setMaterialeNouProg} />
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
                    {/* Servicii extra la editare */}
                    <div style={{ borderTop: '1px solid #F0EAE0', paddingTop: '10px', marginBottom: '10px' }}>
                      <ExtraServicii
                        servicii={serviciiDBProp}
                        mainServiciu={editProg.serviciu}
                        extras={(() => { try { const v = JSON.parse(editProg.extra_servicii || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } })()}
                        onExtrasChange={extras => setEditProg({ ...editProg, extra_servicii: JSON.stringify(extras) })}
                        showPret={false}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '3px' }}>Status</label>
                      <select value={editProg.status} onChange={e => setEditProg({ ...editProg, status: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}>
                        {['confirmed', 'pending', 'cancelled', 'noshow'].map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => saveProg({ ...editProg, extra_servicii: editProg.extra_servicii || '[]' })} style={{ background: s.ruby, color: 'white', border: 'none', borderRadius: '20px', padding: '8px 18px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Salvează</button>
                      <button onClick={() => setEditProg(null)} style={{ background: '#EEE', border: 'none', borderRadius: '20px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px' }}>Anulează</button>
                    </div>
                  </div>
                ) : (
                  /* ── View compact ── */
                  <div onClick={() => setDetailProg(p)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1C1C1C' }}>{p.serviciu}</div>
                        {(() => { try { const ex = JSON.parse(p.extra_servicii || '[]'); const arr = Array.isArray(ex) ? ex : []; return arr.length > 0 ? <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>+ {arr.map(e => e.nume).join(' · ')}</div> : null } catch { return null } })()}
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>{p.data} · {p.ora} · <span style={{ fontWeight: 'bold', color: '#1C1C1C' }}>{p.pret} lei</span></div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', background: (SC[p.status] || '#ccc') + '22', color: SC[p.status] || '#ccc', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{p.status}</span>
                        <button type="button" onClick={e => { e.stopPropagation(); setEditProg({ ...p }) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#BBB', padding: 0 }}>✏️ editează</button>
                      </div>
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

      {/* ── MODAL DETALII PROGRAMARE ── */}
      {detailProg && (() => {
        const p = detailProg
        const extras = (() => { try { const v = JSON.parse(p.extra_servicii || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } })()
        const STATUS_LABEL = { confirmed: '✓ confirmată', pending: '⏳ așteptare', cancelled: '✗ anulată', noshow: '— neprezentare' }
        return (
          <>
            <div onClick={() => setDetailProg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300 }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '580px', maxWidth: '95vw', maxHeight: '88vh', background: '#F8F4F0', zIndex: 301, borderRadius: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Header */}
              <div style={{ background: `linear-gradient(135deg, ${s.ruby} 0%, #6A1020 100%)`, color: 'white', padding: '22px 26px', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '2px', marginBottom: '4px' }}>DETALII PROGRAMARE</div>
                    <div style={{ fontSize: '20px', fontFamily: 'Georgia, serif' }}>{p.serviciu}</div>
                    {extras.length > 0 && <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>+ {extras.map(e => e.nume).join(' · ')}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{p.status}</span>
                    <button onClick={() => setDetailProg(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Serviciu + Pret + Tips + Plata */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '4px' }}>DATA</div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>{p.data}</div>

                  {/* Serviciu */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '6px' }}>SERVICIU</div>
                    <select value={detailEdit.serviciu} onChange={e => setDetailEdit(d => ({ ...d, serviciu: e.target.value }))}
                      style={{ width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: 'white', fontFamily: 'Georgia, serif', color: '#1C1C1C', boxSizing: 'border-box' }}>
                      {serviciiDBProp.map(sv => <option key={sv.id} value={sv.nume}>{sv.nume}</option>)}
                      {!serviciiDBProp.find(sv => sv.nume === detailEdit.serviciu) && detailEdit.serviciu && (
                        <option value={detailEdit.serviciu}>{detailEdit.serviciu}</option>
                      )}
                    </select>
                  </div>

                  {/* Pret + Tips */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '6px' }}>PREȚ (lei)</div>
                      <input type="number" min="0" value={detailEdit.pret} onChange={e => setDetailEdit(d => ({ ...d, pret: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '15px', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif', color: '#1C1C1C' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '6px' }}>TIPS (lei)</div>
                      <input type="number" min="0" value={detailEdit.tips} onChange={e => setDetailEdit(d => ({ ...d, tips: e.target.value }))}
                        placeholder="0"
                        style={{ width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '15px', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif', color: '#1D9E75' }} />
                    </div>
                  </div>

                  {/* Detalii tehnice */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '6px' }}>DETALII TEHNICE</div>
                    <textarea value={detailEdit.detalii_tehnice} onChange={e => setDetailEdit(d => ({ ...d, detalii_tehnice: e.target.value }))}
                      placeholder="Produse folosite, tehnica, culori, structura..."
                      rows={3}
                      style={{ width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif', color: '#1C1C1C', resize: 'vertical' }} />
                  </div>

                  {/* Despre client */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '6px' }}>DESPRE CLIENT</div>
                    <textarea value={detailEdit.despre_client} onChange={e => setDetailEdit(d => ({ ...d, despre_client: e.target.value }))}
                      placeholder="Preferinte, alergii, comportament, ce îi place..."
                      rows={3}
                      style={{ width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif', color: '#1C1C1C', resize: 'vertical' }} />
                  </div>

                  <button onClick={saveDetailMain} disabled={savingDetailEdit}
                    style={{ width: '100%', background: savingDetailEdit ? '#CCC' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '10px', padding: '10px', cursor: savingDetailEdit ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold', marginBottom: '14px' }}>
                    {savingDetailEdit ? 'Se salvează...' : 'Salvează modificările'}
                  </button>

                  {/* Plată toggle */}
                  <div style={{ borderTop: '1px solid #F0EAE0', paddingTop: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '8px' }}>METODĂ PLATĂ</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['numerar', 'card'].map(met => (
                        <button key={met} onClick={() => savePlata(met)}
                          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', fontFamily: 'Georgia, serif',
                            background: (detailProg.plata || 'numerar') === met ? (met === 'numerar' ? '#1C1C1C' : '#1D9E75') : '#F3EDE5',
                            color: (detailProg.plata || 'numerar') === met ? 'white' : '#888' }}>
                          {met === 'numerar' ? '💵 Numerar' : '💳 Card'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SMS Status */}
                {smsProgramare.length > 0 && (
                  <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '12px' }}>SMS-URI</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {smsProgramare.map(sms => {
                        const trimisLa = sms.trimis_la ? new Date(sms.trimis_la) : null
                        const deTrimisLa = sms.de_trimis_la ? new Date(sms.de_trimis_la) : null
                        const formatData = d => d ? `${d.getDate()} ${['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` : ''
                        const tipLabel = { confirmare: 'Confirmare', reminder_24h: 'Reminder 24h', feedback: 'Feedback', recontact: 'Recontact' }[sms.tip] || sms.tip
                        let icon, statusText, statusColor
                        if (sms.trimis) { icon = '✅'; statusText = `trimis ${formatData(trimisLa)}`; statusColor = '#1D9E75' }
                        else if (sms.eroare) { icon = '❌'; statusText = `eroare: ${sms.eroare}`; statusColor = '#9B1B30' }
                        else { icon = '⏳'; statusText = `programat ${formatData(deTrimisLa)}`; statusColor = '#AAA' }
                        return (
                          <div key={sms.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px', background: '#FDFAF7', borderRadius: '10px' }}>
                            <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{icon}</span>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1C1C1C' }}>{tipLabel}</div>
                              <div style={{ fontSize: '11px', color: statusColor, marginTop: '2px' }}>{statusText}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Ore: start + sfarsit */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '12px' }}>ORE PROGRAMARE</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '6px' }}>ÎNCEPUT</div>
                      <input type="time" value={detailOre.start} onChange={e => setDetailOre(o => ({ ...o, start: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '10px', padding: '9px 12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif', fontWeight: 'bold' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '6px' }}>SFÂRȘIT</div>
                      <input type="time" value={detailOre.sfarsit} onChange={e => setDetailOre(o => ({ ...o, sfarsit: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '10px', padding: '9px 12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif', fontWeight: 'bold' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '6px' }}>DURATĂ</div>
                      <div style={{ padding: '9px 12px', background: '#F7F2EC', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', color: s.ruby, textAlign: 'center' }}>
                        {(() => {
                          const [h1, m1] = (detailOre.start || '').split(':').map(Number)
                          const [h2, m2] = (detailOre.sfarsit || '').split(':').map(Number)
                          if (isNaN(h1) || isNaN(h2)) return p.durata ? `${p.durata} min` : '—'
                          const diff = (h2 * 60 + m2) - (h1 * 60 + m1)
                          return diff > 0 ? `${diff} min` : '—'
                        })()}
                      </div>
                    </div>
                  </div>
                  <button onClick={saveOre} disabled={savingOre}
                    style={{ marginTop: '12px', width: '100%', background: savingOre ? '#CCC' : '#1C1C1C', color: 'white', border: 'none', borderRadius: '10px', padding: '9px', cursor: savingOre ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    {savingOre ? 'Se salvează...' : 'Salvează orele'}
                  </button>
                </div>

                {/* Servicii extra */}
                {extras.length > 0 && (
                  <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '10px' }}>SERVICII EXTRA</div>
                    {extras.map((e, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < extras.length - 1 ? '1px solid #F7F2EC' : 'none' }}>
                        <span style={{ fontSize: '13px', color: '#1C1C1C' }}>{e.nume}</span>
                        <span style={{ fontSize: '13px', color: s.ruby, fontWeight: 'bold' }}>+{e.pret} lei</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Materiale utilizate cu cantități before/after */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '12px' }}>MATERIALE UTILIZATE</div>
                  {detailMateriale.length === 0 && (
                    <div style={{ fontSize: '13px', color: '#CCC', marginBottom: '12px' }}>Niciun material înregistrat.</div>
                  )}
                  {detailMateriale.length > 0 && detailMateriale.map((m, i) => {
                    const inainte = m.cantitate_inainte != null ? Number(m.cantitate_inainte) : ''
                    const dupa = m.cantitate_dupa != null ? Number(m.cantitate_dupa) : ''
                    const consumat = (inainte !== '' && dupa !== '') ? Math.max(0, inainte - dupa).toFixed(2) : null
                    return (
                      <div key={m.id} style={{ marginBottom: i < detailMateriale.length - 1 ? '14px' : 0, paddingBottom: i < detailMateriale.length - 1 ? '14px' : 0, borderBottom: i < detailMateriale.length - 1 ? '1px solid #F7F2EC' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1C1C1C' }}>{m.produs_nume}</span>
                            {m.marca && <span style={{ fontSize: '11px', color: '#AAA', marginLeft: '8px' }}>{m.marca}</span>}
                          </div>
                          {consumat !== null && (
                            <span style={{ fontSize: '12px', color: s.ruby, fontWeight: 'bold', background: '#FDF2F4', padding: '2px 10px', borderRadius: '12px' }}>−{consumat} g</span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '4px' }}>ÎNAINTE (g)</div>
                            <input type="number" min="0" step="0.01" placeholder="ex: 12.5"
                              defaultValue={inainte}
                              onBlur={e => updateMaterial(m.id, Number(e.target.value) || null, m.cantitate_dupa)}
                              style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '4px' }}>DUPĂ (g)</div>
                            <input type="number" min="0" step="0.01" placeholder="ex: 10.2"
                              defaultValue={dupa}
                              onBlur={e => updateMaterial(m.id, m.cantitate_inainte, Number(e.target.value) || null)}
                              style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '4px' }}>CONSUMAT</div>
                            <div style={{ padding: '7px', background: consumat !== null ? '#FDF2F4' : '#F7F2EC', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', color: consumat !== null ? s.ruby : '#CCC' }}>
                              {consumat !== null ? `${consumat} g` : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {/* Adaugă material în detalii programare */}
                  <div style={{ marginTop: detailMateriale.length > 0 ? '16px' : '0', borderTop: detailMateriale.length > 0 ? '1px solid #F7F2EC' : 'none', paddingTop: detailMateriale.length > 0 ? '14px' : '0' }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <input
                        value={detailMatSearch}
                        onChange={e => setDetailMatSearch(e.target.value)}
                        placeholder="Caută și adaugă produs din stoc..."
                        style={{ width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: '#FDFAF7', fontFamily: 'Georgia, serif', color: '#1C1C1C', boxSizing: 'border-box' }}
                      />
                      {detailMatSearch.length >= 2 && (() => {
                        const q = detailMatSearch.toLowerCase()
                        const hits = produseDB.filter(p => p.nume?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q)).slice(0, 6)
                        return hits.length > 0 ? (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.13)', zIndex: 300, border: '1px solid #EDE4DC', marginTop: '4px', overflow: 'hidden' }}>
                            {hits.map(p => (
                              <button key={p.id} type="button" onMouseDown={() => addMaterialToDetail(p)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #F5EEE8', fontFamily: 'Georgia, serif' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F7EFE5'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div>
                                  <span style={{ fontSize: '13px', color: '#1C1C1C' }}>{p.nume}</span>
                                  {p.marca && <span style={{ fontSize: '11px', color: '#AAA', marginLeft: '6px' }}>{p.marca}</span>}
                                </div>
                                <span style={{ fontSize: '11px', color: '#BBB' }}>stoc: {p.stoc_bucati ?? '—'}</span>
                              </button>
                            ))}
                          </div>
                        ) : null
                      })()}
                    </div>
                    {!detailMatShowNou ? (
                      <button type="button" onClick={() => setDetailMatShowNou(true)}
                        style={{ background: 'none', border: '1.5px dashed #D0C0B0', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px', color: '#AAA', width: '100%', fontFamily: 'Georgia, serif' }}>
                        + Adaugă produs nou în baza de date
                      </button>
                    ) : (
                      <div style={{ background: '#FDF8F4', border: '1.5px solid #E8DDD0', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '10px' }}>PRODUS NOU</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input value={detailMatNou.nume} onChange={e => setDetailMatNou({ ...detailMatNou, nume: e.target.value })} placeholder="Denumire produs *"
                            style={{ width: '100%', border: `1.5px solid ${detailMatNou.nume ? '#E8DDD0' : s.ruby}`, borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: 'white', fontFamily: 'Georgia, serif', color: '#1C1C1C', boxSizing: 'border-box' }} autoFocus />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <input value={detailMatNou.marca} onChange={e => setDetailMatNou({ ...detailMatNou, marca: e.target.value })} placeholder="Marcă"
                              style={{ width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: 'white', fontFamily: 'Georgia, serif', color: '#1C1C1C', boxSizing: 'border-box' }} />
                            <input value={detailMatNou.categorie} onChange={e => setDetailMatNou({ ...detailMatNou, categorie: e.target.value })} placeholder="Categorie"
                              style={{ width: '100%', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: 'white', fontFamily: 'Georgia, serif', color: '#1C1C1C', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={salveazaMatNouToDetail} disabled={detailMatSavingNou || !detailMatNou.nume.trim()}
                              style={{ flex: 2, background: detailMatSavingNou ? '#ccc' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '10px', padding: '9px', cursor: detailMatSavingNou ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                              {detailMatSavingNou ? 'Se salvează...' : 'Salvează și adaugă'}
                            </button>
                            <button type="button" onClick={() => { setDetailMatShowNou(false); setDetailMatNou({ nume: '', marca: '', categorie: '' }) }}
                              style={{ flex: 1, background: 'white', border: '1.5px solid #E8DDD0', borderRadius: '10px', padding: '9px', cursor: 'pointer', fontSize: '13px', color: '#888', fontFamily: 'Georgia, serif' }}>
                              Renunță
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Before / After foto */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#AAA', letterSpacing: '1px', marginBottom: '12px' }}>FOTO BEFORE / AFTER</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[{ key: 'before', label: 'BEFORE' }, { key: 'after', label: 'AFTER' }].map(({ key, label }) => (
                      <div key={key}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: key === 'before' ? '#888' : s.ruby, letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
                        {detailFotos[key] ? (
                          <img src={detailFotos[key]} alt={label} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px', display: 'block', marginBottom: '6px' }}
                            onError={e => { e.target.style.display = 'none' }} />
                        ) : (
                          <div style={{ width: '100%', aspectRatio: '1', background: '#F7F2EC', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '28px', opacity: 0.3 }}>📷</span>
                          </div>
                        )}
                        <input value={detailFotos[key]} onChange={e => setDetailFotos(f => ({ ...f, [key]: e.target.value }))}
                          placeholder="URL fotografie..."
                          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }} />
                      </div>
                    ))}
                  </div>
                  <button onClick={saveFotos} disabled={savingFotos}
                    style={{ marginTop: '12px', background: savingFotos ? '#CCC' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', border: 'none', borderRadius: '10px', padding: '9px 20px', cursor: savingFotos ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold', width: '100%' }}>
                    {savingFotos ? 'Se salvează...' : 'Salvează fotografiile'}
                  </button>
                </div>

              </div>

              {/* Footer acțiuni */}
              <div style={{ padding: '14px 26px', background: 'white', borderTop: '1px solid #F0EAE0', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                {['confirmed', 'pending', 'cancelled', 'noshow'].map(st => (
                  <button key={st} onClick={() => { updateProgStatus(p.id, st); setDetailProg(prev => ({ ...prev, status: st })) }}
                    style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', background: p.status === st ? SC[st] : '#F0EAE0', color: p.status === st ? 'white' : '#555', fontWeight: p.status === st ? 'bold' : 'normal' }}>
                    {STATUS_LABEL[st]}
                  </button>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                  {confirmDelete === p.id ? (
                    <>
                      <button onClick={() => { deleteProg(p.id); setDetailProg(null) }} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', background: '#EF4444', color: 'white', fontWeight: 'bold' }}>Confirm</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ padding: '6px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', background: '#EEE', color: '#555' }}>Nu</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(p.id)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #EF4444', cursor: 'pointer', fontSize: '12px', background: 'white', color: '#EF4444' }}>🗑</button>
                  )}
                </div>
              </div>

            </div>
          </>
        )
      })()}

      {/* Dialog confirmare suprapunere în drawer */}
      {drawerOverlapWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontFamily: 'Georgia, serif', color: '#9B1B30', fontSize: '18px', fontWeight: 'normal', marginBottom: '12px' }}>Suprapunere programare</h3>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px', whiteSpace: 'pre-line' }}>{drawerOverlapWarning.msg}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDrawerOverlapWarning(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #DDD', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#555' }}>
                Anulează
              </button>
              <button onClick={drawerOverlapWarning.onConfirm}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #9B1B30, #7A1525)', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}
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

function SyncSheetsButton({ token, onDone }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function sync() {
    setLoading(true)
    setStatus(null)
    const res = await fetch('/api/admin/sync-sheets', {
      method: 'POST',
      headers: { 'x-admin-token': token },
    })
    const data = await res.json()
    if (data.error) setStatus('❌ Eroare: ' + data.error)
    else setStatus(
      `✅ Clienți: ${data.clienti.inserted} adăugați, ${data.clienti.updated} actualizați\n` +
      `📅 Programări istorice: ${data.programari.inserted} importate, ${data.programari.skipped} deja existente\n` +
      `📊 Total rânduri procesate: ${data.total_rows}`
    )
    setLoading(false)
    if (onDone) onDone()
  }

  return (
    <div>
      <button onClick={sync} disabled={loading}
        style={{ background: loading ? '#DDD' : 'linear-gradient(135deg, #C9A84C, #A8883A)', color: 'white', border: 'none', borderRadius: '50px', padding: '12px 28px', cursor: loading ? 'default' : 'pointer', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', boxShadow: loading ? 'none' : '0 4px 14px rgba(201,168,76,0.4)' }}>
        {loading ? 'Se sincronizează...' : '↻ Sincronizează acum'}
      </button>
      {status && <pre style={{ marginTop: '12px', fontSize: '12px', color: status.startsWith('✅') ? '#10B981' : '#EF4444', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif', background: 'none', border: 'none', padding: 0 }}>{status}</pre>}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('adminTab') || 'calendar'
    return 'calendar'
  })
  const [programari, setProgramari] = useState([])
  const [clienti, setClienti] = useState([])
  const [viewDate, setViewDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('day')
  const [nowMin, setNowMin] = useState(() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() })

  useEffect(() => {
    const id = setInterval(() => { const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes()) }, 30000)
    return () => clearInterval(id)
  }, [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFabMenu, setShowFabMenu] = useState(false)
  const [showMonthOverview, setShowMonthOverview] = useState(false)
  const [scheduleModal, setScheduleModal] = useState(null)
  const [setariData, setSetariData] = useState({})
  const [setariParola, setSetariParola] = useState('')
  const [setariParolaVeche, setSetariParolaVeche] = useState('')
  const [setariMsg, setSetariMsg] = useState(null)
  const [scheduleData, setScheduleData] = useState(null)
  const [scheduleWorker, setScheduleWorker] = useState(null)
  const [scheduleWeek, setScheduleWeek] = useState(null)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleTimeOff, setScheduleTimeOff] = useState([])
  const [newTimeOff, setNewTimeOff] = useState({ data: '', tip: 'zi_libera', ora_start: '', ora_sfarsit: '', nota: '' })
  const [dailyLimits, setDailyLimits] = useState([])
  const [newLimit, setNewLimit] = useState({ max_pe_zi: '', data_start: '', data_end: '' })
  const [showSpecialistPicker, setShowSpecialistPicker] = useState(false)
  const [showScheduleOptions, setShowScheduleOptions] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientiSubTab, setClientiSubTab] = useState('toti')
  const [selectedClient, setSelectedClient] = useState(null)
  const [csvText, setCsvText] = useState('')
  const [importStatus, setImportStatus] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [pendingClienti, setPendingClienti] = useState(null)
  const [smsMesaj, setSmsMesaj] = useState('')
  const [smsStatus, setSmsStatus] = useState(null)
  const [smsPreview, setSmsPreview] = useState(null)
  const [token, setToken] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [confirmDeleteProg, setConfirmDeleteProg] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [analitica, setAnalitica] = useState(null)
  const [loadingAnalitica, setLoadingAnalitica] = useState(false)
  const [analiticaKey, setAnaliticaKey] = useState(0)
  const [vizitatori, setVizitatori] = useState(null)
  const datePickerRef = useRef(null)
  const monthOverviewRef = useRef(null)
  const [slotPopup, setSlotPopup] = useState(null)
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [showDesktopFab, setShowDesktopFab] = useState(false)
  const [acSuggestions, setAcSuggestions] = useState([])
  const [acField, setAcField] = useState(null)
  const [serviciiDB, setServiciiDB] = useState([])
  const [produseDB, setProduseDB] = useState([])
  const [materialeNou, setMaterialeNou] = useState([])
  const [extraServiciiNou, setExtraServiciiNou] = useState([])
  const [pretManualNou, setPretManualNou] = useState('')

  const [newProg, setNewProg] = useState({
    nume: '', telefon: '', serviciu: '', data: '', ora: '', plata: 'numerar', observatii: '', tip_vizita: 'client'
  })
  const [overlapWarning, setOverlapWarning] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    if (!t) { router.push('/admin/login'); return }
    setToken(t)

    // Daca token-ul salvat e invalid/expirat, orice fetch admin/roata/sms primeste 401 —
    // redirectioneaza automat la login in loc sa lase paginile sa arate goale sau sa crape.
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const res = await originalFetch(...args)
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''
      if (res.status === 401 && (url.includes('/api/admin') || url.includes('/api/roata') || url.includes('/api/sms-queue'))) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
      }
      return res
    }
    return () => { window.fetch = originalFetch }
  }, [])

  function fetchServicii() {
    fetch('/api/admin/servicii', { headers: { 'x-admin-token': token } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setServiciiDB(d) })
  }

  useEffect(() => {
    if (!token) return
    fetchProgramari()
    fetchClienti()
    fetchServicii()
    fetchSchedule()
    fetch('/api/admin/produse', { headers: { 'x-admin-token': token } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setProduseDB(d) })
  }, [token])

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/produse', { headers: { 'x-admin-token': token } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setProduseDB(d) })
  }, [tab])

  // Sincronizare programari cat timp adminul sta pe calendar. Reimprospatare
  // instanta cand revii la fereastra (visibilitychange) + fallback la 10 min.
  // Interval mare intentionat: baza Neon adoarme intre verificari (menajam cota).
  // Anularile clientelor vin oricum instant pe Telegram, deci nu e nevoie de polling des.
  useEffect(() => {
    if (!token || tab !== 'calendar') return
    const refresh = () => { if (document.visibilityState === 'visible') fetchProgramari() }
    const id = setInterval(refresh, 600000)
    document.addEventListener('visibilitychange', refresh)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', refresh) }
  }, [token, tab])

  useEffect(() => {
    if (tab !== 'analitica' || !token) return
    setAnalitica(null)
    setLoadingAnalitica(true)
    fetch('/api/admin/analitica', { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(d => { setAnalitica(d); setLoadingAnalitica(false) })
      .catch(() => setLoadingAnalitica(false))
    fetch('/api/track', { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(d => setVizitatori(d))
      .catch(() => {})
  }, [tab, token, analiticaKey])

  useEffect(() => {
    function handleClick(e) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) setShowDatePicker(false)
      if (monthOverviewRef.current && !monthOverviewRef.current.contains(e.target)) setShowMonthOverview(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (tab === 'setari' && token) {
      fetch('/api/admin/setari', { headers: { 'x-admin-token': token } })
        .then(r => r.json())
        .then(d => { if (d.settings) setSetariData(d.settings) })
        .catch(() => {})
    }
  }, [tab])

  useEffect(() => {
    if (!scheduleModal || !token) return
    fetch('/api/admin/schedule', { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(d => {
        if (d.workers?.length) {
          const w = d.workers[0]
          setScheduleWorker(w.id)
          setScheduleWeek(w.schedule)
          setScheduleTimeOff(w.time_off || [])
          setDailyLimits(w.daily_limits || [])
        }
      })
      .catch(() => {})
  }, [scheduleModal])

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

  async function fetchSchedule() {
    try {
      const res = await fetch('/api/admin/schedule', { headers: { 'x-admin-token': token } })
      const d = await res.json()
      if (d.workers?.length) {
        const w = d.workers[0]
        setScheduleWorker(w.id)
        setScheduleWeek(w.schedule)
        setScheduleTimeOff(w.time_off || [])
        setDailyLimits(w.daily_limits || [])
      }
    } catch {}
  }

  function openAddForm() {
    fetchServicii()
    setNewProg({
      nume: '', telefon: '', serviciu: '',
      data: formatDateRO(viewDate),
      ora: '', plata: 'numerar', observatii: ''
    })
    setShowAddForm(true)
  }

  async function addProgramare(e, forceOverlap = false) {
    if (e && e.preventDefault) e.preventDefault()
    const serv = serviciiDB.find(s => s.nume === newProg.serviciu)
    const durataNoua = serv?.durata || 0

    if (!forceOverlap && newProg.ora && durataNoua) {
      const minNoua = timeToMin(newProg.ora)
      const conflicte = programari.filter(p => {
        if (p.data?.trim() !== newProg.data?.trim()) return false
        if (p.status === 'cancelled') return false
        if (!p.ora) return false
        const pMin = timeToMin(p.ora)
        const pDur = Number(p.durata) || 0
        return minNoua < pMin + pDur && minNoua + durataNoua > pMin
      })
      if (conflicte.length > 0) {
        const c = conflicte[0]
        setOverlapWarning({
          msg: `Suprapunere cu ${c.nume} — ${c.ora} (${c.durata} min).\nConfirmi programarea?`,
          onConfirm: () => { setOverlapWarning(null); addProgramare(null, true) }
        })
        return
      }
    }

    const pretExtras = extraServiciiNou.reduce((sum, e) => sum + Number(e.pret || 0), 0)
    const pretFinal = pretManualNou !== '' ? Number(pretManualNou) : (Number(serv?.pret || 0) + pretExtras)
    const durataExtras = extraServiciiNou.reduce((sum, e) => sum + Number(e.durata || 0), 0)
    const progRes = await fetch('/api/admin/programari', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...newProg, pret: pretFinal, durata: (serv?.durata || 0) + durataExtras, extra_servicii: extraServiciiNou })
    })
    const progData = await progRes.json()
    for (const mat of materialeNou) {
      await fetch('/api/admin/materiale', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ programare_id: progData.id, produs_id: mat.produs_id || null, produs_nume: mat.produs_nume, marca: mat.marca || '', cantitate: mat.cantitate || 1 })
      })
    }
    setMaterialeNou([])
    setExtraServiciiNou([])
    setPretManualNou('')
    // Creare/actualizare client — dacă e modelă, setează tip_client
    await fetch('/api/admin/clienti', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nume: newProg.nume, telefon: newProg.telefon, sursa: 'admin', tip_client: newProg.tip_vizita === 'modela' ? 'modela' : undefined })
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

  function parseCSVClients(text) {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    return lines.slice(1).map(line => {
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
  }

  async function importCSV() {
    setImportStatus('loading')
    setImportPreview(null)
    const clientiList = parseCSVClients(csvText)
    const res = await fetch('/api/admin/clienti', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ bulk: true, preview: true, clienti: clientiList })
    })
    const data = await res.json()
    setImportStatus(null)
    setImportPreview(data)
    setPendingClienti(clientiList)
  }

  async function smsBulkPreview() {
    if (!smsMesaj.trim()) return
    const nrClienti = clienti.filter(c => c.telefon).length
    setSmsPreview({ nrClienti, mesaj: smsMesaj.trim() })
  }

  async function smsBulkTrimite() {
    if (!smsPreview) return
    setSmsStatus('loading')
    setSmsPreview(null)
    const res = await fetch('/api/admin/sms-bulk', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ mesaj: smsMesaj.trim() })
    })
    const data = await res.json()
    if (data.success) {
      setSmsStatus(`✅ ${data.adaugate} SMS-uri adăugate în coadă. Beelink le trimite în ~${Math.ceil(data.adaugate / 20)} minute.`)
      setSmsMesaj('')
    } else {
      setSmsStatus(`❌ Eroare: ${data.error}`)
    }
  }

  async function confirmImport() {
    setImportStatus('loading')
    setImportPreview(null)
    const res = await fetch('/api/admin/clienti', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ bulk: true, clienti: pendingClienti })
    })
    const data = await res.json()
    setImportStatus(`✅ ${data.inserted} clienți importați, ${data.skipped} ignorați (deja existenți)`)
    setPendingClienti(null)
    fetchClienti()
    setCsvText('')
  }

  const dateStr = formatDateRO
  const weekDays = getWeekDays(viewDate)
  const progAzi = programari.filter(p => p.data?.trim() === dateStr(viewDate).trim() && p.status !== 'cancelled')
  // Zi inchisa complet (din "Inchide ziua" = zi_libera, sau concediu) — fara interval orar
  const esteZiInchisa = (d) => scheduleTimeOff.some(t => t.data?.trim() === dateStr(d).trim() && (t.tip === 'zi_libera' || t.tip === 'concediu') && !t.ora_start)
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

      {/* Sidebar — desktop only */}
      <div className="admin-sidebar" style={{
        width: sidebarCollapsed ? '68px' : '224px',
        height: '100vh',
        background: 'linear-gradient(160deg, #9B1B30 0%, #7A1525 55%, #5C0F1A 100%)',
        color: 'white', flexShrink: 0, flexDirection: 'column',
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
            { id: 'calendar', icon: (a) => <IcoCalendar active={a} size={32} />, label: 'Calendar' },
            { id: 'clienti', icon: (a) => <IcoClienti active={a} size={32} />, label: 'Clienți' },
            { id: 'meniu', icon: (a) => <IcoMeniu active={a} size={32} />, label: 'Meniu Salon' },
            { id: 'analitica', icon: (a) => <IcoAnalitica active={a} size={32} />, label: 'Analitica' },
          ].map(item => {
            const active = tab === item.id
            return (
              <button key={item.id} onClick={() => { setTab(item.id); localStorage.setItem('adminTab', item.id) }} title={sidebarCollapsed ? item.label : ''}
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
                {active && !sidebarCollapsed && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '0 3px 3px 0', background: 'linear-gradient(180deg, #F9E4A0, #C9A84C)' }} />
                )}
                <div style={{ flexShrink: 0 }}>
                  {item.icon(active, sidebarCollapsed ? 34 : 28)}
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
      <div className="admin-content" style={{ flex: 1, background: '#F8F4F0', overflow: 'auto' }}>

        {/* CALENDAR TAB */}
        {tab === 'calendar' && (
          <div style={{ padding: '24px' }}>
            {/* Header calendar */}
            <div className="calendar-header-row" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginBottom: '20px', minHeight: '80px' }}>

              {/* Stânga — Specialist + Orar (desktop: carduri complete) */}
              <div className="admin-tech-left-desktop" style={{ position: 'absolute', left: 0, top: 0, flexDirection: 'column', gap: '8px', width: '160px' }}>

                {/* Card 1: selector specialist */}
                <div style={{ position: 'relative' }}>
                  <div onClick={() => { setShowSpecialistPicker(v => !v); setShowScheduleOptions(false) }}
                    style={{ background: 'white', borderRadius: '12px', padding: '7px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: `1px solid ${showSpecialistPicker ? s.ruby : 'transparent'}`, transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAF5F0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg, ${s.ruby}, #6A1020)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontFamily: 'Georgia, serif', flexShrink: 0 }}>A</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Andreea Berta</p>
                      <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>Tehnician</p>
                    </div>
                    <span style={{ fontSize: '11px', color: s.ruby, flexShrink: 0, transform: showSpecialistPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                  </div>
                  {showSpecialistPicker && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden', border: '1px solid #F0EAE0' }}>
                      <div style={{ padding: '8px 6px 4px', fontSize: '10px', color: '#AAA', letterSpacing: '1.5px', textTransform: 'uppercase', paddingLeft: '14px' }}>Selectează tehnicianul</div>
                      {[{ initials: 'A', name: 'Andreea Berta', role: 'Tehnician' }].map(t => (
                        <button key={t.name} onClick={() => setShowSpecialistPicker(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', background: '#F7EFE5', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg, ${s.ruby}, #6A1020)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', flexShrink: 0 }}>{t.initials}</div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>{t.name}</p>
                            <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{t.role}</p>
                          </div>
                          <span style={{ marginLeft: 'auto', color: s.ruby, fontSize: '14px' }}>✓</span>
                        </button>
                      ))}
                      <div style={{ padding: '8px 12px 10px', borderTop: '1px solid #F0EAE0' }}>
                        <button style={{ fontSize: '12px', color: '#AAA', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Adaugă tehnician</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card 2: orar lucru */}
                <div style={{ position: 'relative' }}>
                  <div onClick={() => { setShowScheduleOptions(v => !v); setShowSpecialistPicker(false) }}
                    style={{ background: 'white', borderRadius: '10px', padding: '5px 10px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', border: `1px solid ${showScheduleOptions ? s.gold : 'transparent'}`, transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAF5F0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `linear-gradient(135deg, ${s.ruby}, #6A1020)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontFamily: 'Georgia, serif', flexShrink: 0 }}>A</div>
                    <p style={{ fontSize: '11px', color: '#777', margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Andreea Berta</p>
                    <span style={{ fontSize: '10px', color: s.gold, flexShrink: 0, transform: showScheduleOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                  </div>
                  {showScheduleOptions && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden', border: '1px solid #F0EAE0', padding: '6px' }}>
                      {[
                        { id: 'repetitiv', ico: <IcoRepetitiv active={false} size={26} />, label: 'Orar repetitiv' },
                        { id: 'azi',       ico: <IcoAzi active={false} size={26} />, label: 'Orar azi' },
                        { id: 'inchide',   ico: <IcoInchide active={false} size={26} />, label: 'Închide ziua', red: true },
                        { id: 'concediu',  ico: <IcoConcediu active={false} size={26} />, label: 'Concediu / Zile libere' },
                        { id: 'limita',    ico: <IcoLimita active={false} size={26} />, label: 'Programări acceptate' },
                      ].map(opt => (
                        <button key={opt.id} onClick={() => { setScheduleModal(opt.id); setShowScheduleOptions(false) }}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'transparent', border: 'none', borderRadius: '8px', padding: '9px 10px', cursor: 'pointer', fontSize: '13px', color: opt.red ? '#EF4444' : '#333', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = s.nude}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {opt.ico} {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Stânga — Specialist + Orar (mobil: 2 cerculețe) */}
              <div className="admin-tech-left-mobile" style={{ position: 'absolute', left: 0, top: 0, flexDirection: 'row', gap: '8px' }}>

                {/* Cerculeț 1: selector specialist */}
                <div style={{ position: 'relative' }}>
                  <div onClick={() => { setShowSpecialistPicker(v => !v); setShowScheduleOptions(false) }}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${s.ruby}, #6A1020)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: `2px solid ${showSpecialistPicker ? s.ruby : 'white'}` }}>A</div>
                  {showSpecialistPicker && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden', border: '1px solid #F0EAE0' }}>
                      <div style={{ padding: '8px 6px 4px', fontSize: '10px', color: '#AAA', letterSpacing: '1.5px', textTransform: 'uppercase', paddingLeft: '14px' }}>Selectează tehnicianul</div>
                      {[{ initials: 'A', name: 'Andreea Berta', role: 'Tehnician' }].map(t => (
                        <button key={t.name} onClick={() => setShowSpecialistPicker(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', background: '#F7EFE5', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg, ${s.ruby}, #6A1020)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', flexShrink: 0 }}>{t.initials}</div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>{t.name}</p>
                            <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{t.role}</p>
                          </div>
                          <span style={{ marginLeft: 'auto', color: s.ruby, fontSize: '14px' }}>✓</span>
                        </button>
                      ))}
                      <div style={{ padding: '8px 12px 10px', borderTop: '1px solid #F0EAE0' }}>
                        <button style={{ fontSize: '12px', color: '#AAA', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Adaugă tehnician</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cerculeț 2: orar lucru */}
                <div style={{ position: 'relative' }}>
                  <div onClick={() => { setShowScheduleOptions(v => !v); setShowSpecialistPicker(false) }}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: `2px solid ${showScheduleOptions ? s.gold : '#F0EAE0'}` }}>
                    <IcoAzi active={showScheduleOptions} size={18} />
                  </div>
                  {showScheduleOptions && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden', border: '1px solid #F0EAE0', padding: '6px' }}>
                      {[
                        { id: 'repetitiv', ico: <IcoRepetitiv active={false} size={26} />, label: 'Orar repetitiv' },
                        { id: 'azi',       ico: <IcoAzi active={false} size={26} />, label: 'Orar azi' },
                        { id: 'inchide',   ico: <IcoInchide active={false} size={26} />, label: 'Închide ziua', red: true },
                        { id: 'concediu',  ico: <IcoConcediu active={false} size={26} />, label: 'Concediu / Zile libere' },
                        { id: 'limita',    ico: <IcoLimita active={false} size={26} />, label: 'Programări acceptate' },
                      ].map(opt => (
                        <button key={opt.id} onClick={() => { setScheduleModal(opt.id); setShowScheduleOptions(false) }}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'transparent', border: 'none', borderRadius: '8px', padding: '9px 10px', cursor: 'pointer', fontSize: '13px', color: opt.red ? '#EF4444' : '#333', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = s.nude}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {opt.ico} {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Centru — ‹ dată/săptămână › */}
              <div className="calendar-header-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1)); setViewDate(d) }}
                    style={{ background: 'white', border: '1px solid #DDD', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
                  <div style={{ position: 'relative' }} ref={monthOverviewRef}>
                    <button onClick={() => setShowMonthOverview(v => !v)}
                      style={{ background: 'white', border: `1px solid ${showMonthOverview ? s.ruby : '#DDD'}`, borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', fontSize: viewMode === 'week' ? '14px' : '18px', fontFamily: 'Georgia, serif', fontWeight: 'normal', color: '#1C1C1C', whiteSpace: 'nowrap' }}>
                      {viewMode === 'week'
                        ? `${weekDays[0].getDate()} ${LUNI[weekDays[0].getMonth()].slice(0,3)} — ${weekDays[6].getDate()} ${LUNI[weekDays[6].getMonth()].slice(0,3)} ${weekDays[6].getFullYear()}`
                        : <>{ZILE[viewDate.getDay()]}, {dateStr(viewDate)} <span style={{ fontSize: '12px', color: s.ruby, marginLeft: '4px' }}>▾</span></>
                      }
                      {viewMode === 'week' && <span style={{ fontSize: '12px', color: s.ruby, marginLeft: '4px' }}>▾</span>}
                    </button>
                    {showMonthOverview && (
                      <MonthOverview programari={programari} viewDate={viewDate} onSelectDay={d => setViewDate(d)} onClose={() => setShowMonthOverview(false)} />
                    )}
                  </div>
                  <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1)); setViewDate(d) }}
                    style={{ background: 'white', border: '1px solid #DDD', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '16px' }}>›</button>
                </div>
                {viewDate.toDateString() === new Date().toDateString() && viewMode === 'day' && (
                  <span style={{ background: s.nude, border: `1px solid ${s.gold}`, borderRadius: '8px', padding: '6px 20px', fontSize: '12px', color: s.ruby }}>Azi</span>
                )}
              </div>

              {/* Dreapta — toggle Zilnic / Săptămânal */}
              <div className="calendar-header-right" style={{ position: 'absolute', right: 0, top: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '4px', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {[{ id: 'day', label: 'Zilnic' }, { id: 'week', label: 'Săptămânal' }].map(v => (
                    <button key={v.id} onClick={() => setViewMode(v.id)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia, serif', background: viewMode === v.id ? s.ruby : 'transparent', color: viewMode === v.id ? 'white' : '#888', fontWeight: viewMode === v.id ? 'bold' : 'normal', transition: 'all 0.2s' }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* VIEW SĂPTĂMÂNAL */}
            {viewMode === 'week' && (
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                {/* Header zile */}
                <div style={{ display: 'flex', borderBottom: '1px solid #F0EAE0', position: 'sticky', top: 0, background: 'white', zIndex: 20 }}>
                  <div style={{ width: '70px', flexShrink: 0, borderRight: '1px solid #F0EAE0' }} />
                  {weekDays.map((d, i) => {
                    const isToday = d.toDateString() === new Date().toDateString()
                    const isSelected = d.toDateString() === viewDate.toDateString()
                    const progZi = programari.filter(p => p.data?.trim() === dateStr(d).trim() && p.status !== 'cancelled')
                    return (
                      <div key={i} onClick={() => { setViewDate(d); setViewMode('day') }}
                        style={{ flex: 1, padding: '10px 4px', textAlign: 'center', cursor: 'pointer', borderRight: i < 6 ? '1px solid #F0EAE0' : 'none', background: isSelected ? s.nude : 'transparent', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#FAF5F0' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
                        <p style={{ fontSize: '10px', color: isToday ? s.ruby : '#999', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>{ZILE[d.getDay()]}</p>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isToday ? s.ruby : 'transparent', color: isToday ? 'white' : '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2px', fontSize: '14px', fontWeight: isToday ? 'bold' : 'normal' }}>{d.getDate()}</div>
                        {progZi.length > 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.gold, margin: '0 auto' }} />}
                      </div>
                    )
                  })}
                </div>
                {/* Grid ore + coloane zile */}
                <div style={{ display: 'flex', height: `${gridHeight}px`, position: 'relative' }}>
                  {/* Ore */}
                  <div style={{ width: '70px', flexShrink: 0, borderRight: '1px solid #F0EAE0', position: 'relative', height: `${gridHeight}px` }}>
                    {Array.from({ length: GRID_HOURS }, (_, i) => i + GRID_START_HOUR).map(h => (
                      <div key={h} style={{ position: 'absolute', top: `${(h - GRID_START_HOUR) * 60 * PX_PER_MIN}px`, width: '100%', padding: '0 8px', color: '#BBB', fontSize: '11px', lineHeight: `${60 * PX_PER_MIN}px`, borderBottom: '1px solid #F0EAE0' }}>
                        {String(h % 24).padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>
                  {/* Coloane zile */}
                  {weekDays.map((d, di) => {
                    const progZi = programari.filter(p => p.data?.trim() === dateStr(d).trim() && p.status !== 'cancelled')
                    const isToday = d.toDateString() === new Date().toDateString()
                    return (
                      <div key={di} style={{ flex: 1, position: 'relative', height: `${gridHeight}px`, borderRight: di < 6 ? '1px solid #F0EAE0' : 'none', background: isToday ? 'rgba(155,27,48,0.015)' : 'transparent' }}>
                        {/* Overlay zi inchisa (rosu semitransparent) */}
                        {esteZiInchisa(d) && (
                          <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none', background: 'rgba(239,68,68,0.16)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                            <div style={{ marginTop: '10px', background: 'rgba(239,68,68,0.92)', color: 'white', padding: '3px 10px', borderRadius: '14px', fontSize: '10px', fontWeight: 'bold' }}>🔒 Închis</div>
                          </div>
                        )}
                        {/* Linii ore */}
                        {Array.from({ length: GRID_HOURS }, (_, i) => i).map(i => (
                          <div key={i} style={{ position: 'absolute', top: `${i * 60 * PX_PER_MIN}px`, left: 0, right: 0, height: `${60 * PX_PER_MIN}px`, borderBottom: '1px solid #F0EAE0' }} />
                        ))}
                        {/* Linii 30 min */}
                        {Array.from({ length: GRID_HOURS }, (_, i) => i).map(i => (
                          <div key={`h${i}`} style={{ position: 'absolute', top: `${(i * 60 + 30) * PX_PER_MIN}px`, left: 0, right: 0, borderBottom: '1px solid #F5EEE8' }} />
                        ))}
                        {/* Slot click săptămânal */}
                        {Array.from({ length: GRID_HOURS * 4 }, (_, i) => {
                          const totalMin = GRID_START_HOUR * 60 + i * 15
                          const h = Math.floor(totalMin / 60)
                          const m = totalMin % 60
                          const timeStr = `${String(h % 24).padStart(2,'0')}:${String(m).padStart(2,'0')}`
                          const topPx = i * 15 * PX_PER_MIN
                          return (
                            <div key={i} onClick={e => { e.stopPropagation(); setViewDate(d); setSlotPopup({ top: topPx, time: timeStr }) }}
                              style={{ position: 'absolute', top: `${topPx}px`, left: 0, right: 0, height: `${15 * PX_PER_MIN}px`, zIndex: 1, cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,27,48,0.05)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'} />
                          )
                        })}
                        {/* Linia orei curente */}
                        {isToday && nowMin >= GRID_START_HOUR * 60 && nowMin <= GRID_END_HOUR * 60 && (
                          <div style={{ position: 'absolute', top: `${(nowMin - GRID_START_HOUR * 60) * PX_PER_MIN}px`, left: 0, right: 0, height: '2px', background: s.ruby, opacity: 0.75, zIndex: 15, pointerEvents: 'none' }} />
                        )}

                        {/* Programări */}
                        {progZi.map(p => {
                          const startMin = p.ora ? timeToMin(p.ora) : 9 * 60
                          const dur = Number(p.durata) || 60
                          const topPx = (startMin - GRID_START_HOUR * 60) * PX_PER_MIN
                          const heightPx = Math.max(dur * PX_PER_MIN, 20)
                          const autoFinalizat = isToday && nowMin >= startMin + dur && p.status === 'confirmed'
                          const color = autoFinalizat ? FINALIZAT_COLOR : (STATUS_COLORS[p.status] || STATUS_COLORS.confirmed)
                          return (
                            <div key={p.id} onClick={() => {
                              const found = clienti.find(c => c.telefon === p.telefon)
                              setSelectedClient(found || { id: `temp_${p.id}`, nume: p.nume, telefon: p.telefon, email: '', data_nastere: '', observatii: '', sursa: 'site' })
                            }} style={{ position: 'absolute', top: `${topPx}px`, left: '2px', right: '2px', height: `${heightPx}px`, background: color + '22', border: `1.5px solid ${color}`, borderRadius: '6px', padding: '2px 4px', overflow: 'hidden', zIndex: 10, cursor: 'pointer' }}>
                              <p style={{ fontSize: '10px', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1C1C1C' }}>{p.ora} {p.nume}</p>
                              {heightPx > 28 && <p style={{ fontSize: '9px', color: '#666', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.serviciu}</p>}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* VIEW ZILNIC */}
            {viewMode === 'day' && <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex' }}>
              {/* Hour labels column */}
              <div style={{ width: '70px', flexShrink: 0, borderRight: '1px solid #F0EAE0', position: 'relative', height: `${gridHeight}px`, overflow: 'visible' }}>
                {Array.from({ length: GRID_HOURS }, (_, i) => i + GRID_START_HOUR).map(h => (
                  <div key={h} style={{ position: 'absolute', top: `${(h - GRID_START_HOUR) * 60 * PX_PER_MIN}px`, width: '100%' }}>
                    <div style={{ padding: '0 10px', color: '#999', fontSize: '12px', lineHeight: `${15 * PX_PER_MIN}px`, borderBottom: '1px solid #F0EAE0' }}>
                      {String(h % 24).padStart(2, '0')}:00
                    </div>
                    <div style={{ height: `${15 * PX_PER_MIN}px`, borderBottom: '1px dashed #F5EEE8' }} />
                    <div style={{ height: `${15 * PX_PER_MIN}px`, borderBottom: '1px solid #EDE4DC' }} />
                    <div style={{ height: `${15 * PX_PER_MIN}px`, borderBottom: '1px dashed #F5EEE8' }} />
                  </div>
                ))}
                {/* Label hover dinamic */}
                {hoveredSlot && (
                  <div style={{
                    position: 'absolute', top: `${hoveredSlot.top}px`, left: 0, right: 0,
                    height: `${15 * PX_PER_MIN}px`, display: 'flex', alignItems: 'center',
                    paddingLeft: '8px', pointerEvents: 'none', zIndex: 5,
                  }}>
                    <span style={{ fontSize: '11px', color: s.ruby, fontWeight: 'bold', background: 'white', padding: '1px 4px', borderRadius: '4px' }}>
                      {hoveredSlot.time}
                    </span>
                  </div>
                )}
              </div>

              {/* Bookings area */}
              <div style={{ flex: 1, position: 'relative', height: `${gridHeight}px` }} onClick={() => setSlotPopup(null)}>
                {/* 15-minute clickable slots */}
                {Array.from({ length: GRID_HOURS * 4 }, (_, i) => {
                  const totalMin = GRID_START_HOUR * 60 + i * 15
                  const h = Math.floor(totalMin / 60)
                  const m = totalMin % 60
                  const timeStr = `${String(h % 24).padStart(2,'0')}:${String(m).padStart(2,'0')}`
                  const topPx = i * 15 * PX_PER_MIN
                  const isHalfHour = m === 0 || m === 30
                  return (
                    <div key={i}
                      onClick={e => { e.stopPropagation(); setSlotPopup({ top: topPx, time: timeStr }) }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155,27,48,0.04)'; setHoveredSlot({ top: topPx, time: timeStr }) }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; setHoveredSlot(null) }}
                      style={{
                        position: 'absolute', top: `${topPx}px`, left: 0, right: 0,
                        height: `${15 * PX_PER_MIN}px`,
                        borderBottom: isHalfHour ? '1px solid #EDE4DC' : '1px dashed #F5EEE8',
                        zIndex: 1, cursor: 'pointer', transition: 'background 0.12s',
                      }}
                    />
                  )
                })}

                {/* Pauza pranz label */}
                {Array.from({ length: GRID_HOURS }, (_, i) => i).map(i => (
                  (i + GRID_START_HOUR) === 12 && (
                    <div key={i} style={{
                      position: 'absolute', top: `${i * 60 * PX_PER_MIN}px`,
                      left: 0, right: 0, height: `${60 * PX_PER_MIN}px`,
                      background: '#FFF8F0', zIndex: 0, pointerEvents: 'none',
                    }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '12px', opacity: 0.7 }}>Pauză prânz</span>
                    </div>
                  )
                ))}

                {/* Slot popup menu */}
                {slotPopup && (
                  <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute', top: `${slotPopup.top}px`, left: '50%', transform: 'translateX(-50%)',
                    background: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    zIndex: 50, minWidth: '200px', overflow: 'hidden', border: '1px solid #EDE4DC',
                  }}>
                    <div style={{ background: s.nude, padding: '8px 14px', fontSize: '12px', color: s.ruby, fontWeight: 'bold', letterSpacing: '1px', borderBottom: '1px solid #EDE4DC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{slotPopup.time}</span>
                      <button onClick={() => setSlotPopup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AAA', fontSize: '16px', lineHeight: 1, padding: '0 0 0 8px' }}>✕</button>
                    </div>
                    <button onClick={() => {
                      fetchServicii()
                      setNewProg({ nume: '', telefon: '', data: formatDateRO(viewDate), ora: slotPopup.time, serviciu: '', plata: 'numerar', observatii: '', tip_vizita: 'client' })
                      setSlotPopup(null)
                      setShowAddForm(true)
                    }} style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#1C1C1C' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F7EFE5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      📅 Programare nouă
                    </button>
                    <button onClick={() => {
                      setNewProg({ ...newProg, data: formatDateRO(viewDate), ora: slotPopup.time, serviciu: 'Timp blocat', plata: 'numerar', observatii: '', nume: 'Blocat', telefon: '—' })
                      setSlotPopup(null)
                      setShowAddForm(true)
                    }} style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#1C1C1C', borderTop: '1px solid #F0EAE0' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F7EFE5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      🔒 Blochează timp
                    </button>
                  </div>
                )}

                {/* Overlay zi inchisa — rosu semitransparent peste toata ziua */}
                {esteZiInchisa(viewDate) && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 18, pointerEvents: 'none',
                    background: 'rgba(239,68,68,0.16)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  }}>
                    <div style={{ marginTop: '18px', background: 'rgba(239,68,68,0.92)', color: 'white', padding: '6px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', boxShadow: '0 3px 10px rgba(239,68,68,0.35)' }}>
                      🔒 Zi închisă
                    </div>
                  </div>
                )}

                {/* Linia orei curente — ca un ac de ceas, trece prin programări */}
                {viewDate.toDateString() === new Date().toDateString() && nowMin >= GRID_START_HOUR * 60 && nowMin <= GRID_END_HOUR * 60 && (
                  <div style={{
                    position: 'absolute', top: `${(nowMin - GRID_START_HOUR * 60) * PX_PER_MIN}px`,
                    left: 0, right: 0, zIndex: 15, pointerEvents: 'none',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.ruby, flexShrink: 0, marginLeft: '-4px', boxShadow: '0 0 0 3px rgba(155,27,48,0.15)' }} />
                    <div style={{ flex: 1, height: '2px', background: s.ruby, opacity: 0.75 }} />
                  </div>
                )}

                {/* Booking blocks */}
                {progAzi.map((p, idx) => {
                  const startMin = p.ora ? timeToMin(p.ora) : 9 * 60
                  const dur = Number(p.durata) || 60
                  const topPx = (startMin - GRID_START_HOUR * 60) * PX_PER_MIN
                  const heightPx = Math.max(dur * PX_PER_MIN, 40)
                  const esteAzi = viewDate.toDateString() === new Date().toDateString()
                  const autoFinalizat = esteAzi && nowMin >= startMin + dur && p.status === 'confirmed'
                  const color = autoFinalizat ? FINALIZAT_COLOR : (STATUS_COLORS[p.status] || STATUS_COLORS.confirmed)
                  const noTime = !p.ora

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
                            <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{noTime ? '📋 ' : p.ora + ' · '}{p.nume}</p>
                            <p style={{ fontSize: '11px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.serviciu} · {dur}min
                              {autoFinalizat && <span style={{ color: FINALIZAT_COLOR, fontWeight: 'bold' }}> · ✓ Finalizată</span>}
                            </p>
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
            </div>}

            {progAzi.length === 0 && viewMode === 'day' && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#AAA', fontSize: '15px' }}>
                Nicio programare pentru această zi.
              </div>
            )}

          </div>
        )}

        {/* CLIENTI TAB */}
        {tab === 'clienti' && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'normal', margin: 0 }}>Clienți ({clienti.length})</h2>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { id: 'toti', label: `Toți clienții (${clienti.filter(c => c.tip_client !== 'modela').length})` },
                { id: 'modele', label: `✦ Modele (${clienti.filter(c => c.tip_client === 'modela').length})` },
              ].map(st => (
                <button key={st.id} onClick={() => setClientiSubTab(st.id)}
                  style={{
                    padding: '9px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontFamily: 'Georgia, serif',
                    background: clientiSubTab === st.id
                      ? (st.id === 'modele' ? 'linear-gradient(135deg, #C9A84C, #A8883A)' : s.ruby)
                      : 'white',
                    color: clientiSubTab === st.id ? 'white' : '#888',
                    boxShadow: clientiSubTab === st.id ? '0 4px 14px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s',
                  }}>{st.label}</button>
              ))}
              <input type="text" placeholder="Caută după nume sau telefon..."
                value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                className="input-field" style={{ marginLeft: 'auto', maxWidth: '280px', margin: '0 0 0 auto' }} />
            </div>

            {/* MODELE sub-tab */}
            {clientiSubTab === 'modele' && (() => {
              const modele = clienti.filter(c => c.tip_client === 'modela' &&
                (c.nume?.toLowerCase().includes(clientSearch.toLowerCase()) || c.telefon?.includes(clientSearch)))
              return (
                <div>
                  <div style={{ background: 'linear-gradient(135deg, #FDF8EC, #F5EDD0)', border: '1px solid #C9A84C33', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>✦</span>
                    <div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#A8883A', fontWeight: 'bold', margin: '0 0 2px' }}>Secțiunea Modele</p>
                      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Clienți care colaborează ca modele pentru conținut — tratament prioritar, monitorizare rezistență la 7 zile</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                    {modele.map(c => {
                      const nrProg = programari.filter(p => p.telefon === c.telefon).length
                      return (
                        <div key={c.id} onClick={() => setSelectedClient(c)}
                          style={{ background: 'white', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 12px rgba(201,168,76,0.12)', cursor: 'pointer', border: '1px solid rgba(201,168,76,0.25)', transition: 'box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #C9A84C, #F5D07A, #C9A84C)' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{c.nume}</p>
                                <span style={{ background: 'linear-gradient(135deg, #C9A84C, #A8883A)', color: 'white', fontSize: '9px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>MODEL</span>
                              </div>
                              <p style={{ color: '#666', fontSize: '13px', margin: '0 0 3px' }}>{c.telefon}</p>
                              {c.oras && <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 3px' }}>📍 {c.oras}</p>}
                              {c.instagram && <p style={{ color: '#C9A84C', fontSize: '12px', margin: '0 0 3px' }}>@{c.instagram}</p>}
                              <p style={{ color: '#BBB', fontSize: '12px', margin: '6px 0 0' }}>{nrProg} programări{c.sursa ? ` · ${c.sursa}` : ''}</p>
                              {c.observatii && <p style={{ color: '#AAA', fontSize: '11px', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.4 }}>{c.observatii}</p>}
                            </div>
                            <a href={`https://wa.me/${c.telefon?.replace(/[^0-9]/g, '')}`} target="_blank"
                              onClick={e => e.stopPropagation()}
                              style={{ background: '#25D366', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', textDecoration: 'none', flexShrink: 0, marginLeft: '10px' }}>
                              WA
                            </a>
                          </div>
                        </div>
                      )
                    })}
                    {modele.length === 0 && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#AAA' }}>
                        Nicio modelă găsită{clientSearch ? ` pentru "${clientSearch}"` : ''}.
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* TOȚI CLIENȚII sub-tab */}
            {clientiSubTab === 'toti' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredClienti.filter(c => c.tip_client !== 'modela').map(c => {
                  const nrProg = programari.filter(p => p.telefon === c.telefon).length
                  const nrConf = programari.filter(p => p.telefon === c.telefon && p.status === 'confirmed').length
                  const isFidela = c.tip_client === 'fidela'
                  return (
                    <div key={c.id} onClick={() => setSelectedClient(c)}
                      style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s', borderLeft: isFidela ? '3px solid #10B981' : '3px solid transparent' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <p style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{c.nume}</p>
                          {isFidela && <span style={{ background: '#ECFDF5', color: '#10B981', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.5px' }}>FIDELĂ</span>}
                          {c.tip_client && c.tip_client !== 'fidela' && c.tip_client !== 'modela' && (
                            <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '10px', padding: '2px 8px', borderRadius: '20px' }}>{c.tip_client}</span>
                          )}
                        </div>
                        <p style={{ color: '#666', fontSize: '13px', margin: '0 0 2px' }}>{c.telefon}{c.email ? ` · ${c.email}` : ''}</p>
                        {c.oras && <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 2px' }}>📍 {c.oras}</p>}
                        <p style={{ color: '#AAA', fontSize: '12px', marginTop: '3px' }}>{nrProg} programări · {nrConf} confirmate{c.sursa ? ` · ${c.sursa}` : ''}</p>
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
            )}
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
            produseDB={produseDB}
            serviciiDBProp={serviciiDB}
          />
        )}

        {/* RAPOARTE TAB */}
        {tab === 'rapoarte' && (
          <div style={{ padding: '24px' }}>
            <button onClick={() => setTab('meniu')} style={{ background: 'white', border: '1px solid #E8DDD0', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#888', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>← Meniu Salon</button>
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

        {/* ANALITICA TAB */}
        {tab === 'analitica' && (
          <div style={{ padding: '24px', maxWidth: '1100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: 'normal', margin: '0 0 4px' }}>Analitica</h2>
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Date agregate în timp real din toate programările</p>
              </div>
              <button onClick={() => setAnaliticaKey(k => k + 1)}
                disabled={loadingAnalitica}
                style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '9px 18px', cursor: loadingAnalitica ? 'default' : 'pointer', fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', opacity: loadingAnalitica ? 0.5 : 1 }}>
                <span style={{ fontSize: '14px', display: 'inline-block', animation: loadingAnalitica ? 'spin 1s linear infinite' : 'none' }}>↻</span>
                {loadingAnalitica ? 'Se încarcă...' : 'Actualizează'}
              </button>
            </div>

            {loadingAnalitica && (
              <div style={{ textAlign: 'center', padding: '80px', color: '#AAA' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>Se calculează datele...</p>
              </div>
            )}

            {analitica && !loadingAnalitica && (() => {
              const { venLunaAc, venLunaTr, progLunaAc, progLunaTr, rataPrecentare, valoreMedie, clientiNoi, clientiReveniti, totalClienti, totalVenituri } = analitica.kpi
              const venDiff = venLunaTr ? Math.round(((venLunaAc - venLunaTr) / venLunaTr) * 100) : null
              const progDiff = progLunaTr ? Math.round(((progLunaAc - progLunaTr) / progLunaTr) * 100) : null

              return (
                <>
                  {/* ── KPI Row 1 ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                    {[
                      { label: 'Venituri luna curentă', value: `${venLunaAc} lei`, sub: venDiff !== null ? `${venDiff >= 0 ? '+' : ''}${venDiff}% față de luna trecută` : 'Prima înregistrare', subColor: venDiff === null ? '#888' : venDiff >= 0 ? '#10B981' : '#EF4444', accent: '#9B1B30' },
                      { label: 'Programări luna curentă', value: progLunaAc, sub: progDiff !== null ? `${progDiff >= 0 ? '+' : ''}${progDiff}% față de luna trecută` : 'Prima înregistrare', subColor: progDiff === null ? '#888' : progDiff >= 0 ? '#10B981' : '#EF4444', accent: '#C9A84C' },
                      { label: 'Rata de prezentare', value: `${rataPrecentare}%`, sub: 'Confirmate / total luna curentă', subColor: '#888', accent: '#10B981' },
                      { label: 'Valoare medie programare', value: `${valoreMedie} lei`, sub: 'Medie pe toate programările confirmate', subColor: '#888', accent: '#8B5CF6' },
                    ].map((k, i) => (
                      <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: `3px solid ${k.accent}` }}>
                        <p style={{ color: '#888', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>{k.label}</p>
                        <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>{k.value}</p>
                        <p style={{ fontSize: '11px', color: k.subColor, margin: 0 }}>{k.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── KPI Row 2 ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {[
                      { label: 'Clienți noi luna curentă', value: clientiNoi, accent: '#3B82F6' },
                      { label: 'Clienți reveniți luna curentă', value: clientiReveniti, accent: '#10B981' },
                      { label: 'Total clienți înregistrați', value: totalClienti, accent: '#C9A84C' },
                      { label: 'Venituri totale cumulate', value: `${totalVenituri} lei`, accent: '#9B1B30' },
                    ].map((k, i) => (
                      <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `3px solid ${k.accent}` }}>
                        <p style={{ color: '#888', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>{k.label}</p>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: k.accent, margin: 0, fontFamily: 'Georgia, serif' }}>{k.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Vizitatori site ── */}
                  {vizitatori && (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Vizitatori site</p>
                      <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 20px' }}>Sesiuni unice pe andreeaberta.com</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        {[
                          { label: 'Azi', value: vizitatori.azi, color: '#9B1B30' },
                          { label: 'Săptămâna aceasta', value: vizitatori.saptamana, color: '#C9A84C' },
                          { label: 'Luna aceasta', value: vizitatori.luna, color: '#3B82F6' },
                          { label: 'Total all-time', value: vizitatori.total, color: '#10B981' },
                        ].map((v, i) => (
                          <div key={i} style={{ background: '#FAFAFA', borderRadius: '12px', padding: '16px', textAlign: 'center', borderTop: `3px solid ${v.color}` }}>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: v.color, margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>{v.value}</p>
                            <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{v.label}</p>
                          </div>
                        ))}
                      </div>
                      {vizitatori.zilnice?.length > 0 && (() => {
                        const max = Math.max(...vizitatori.zilnice.map(z => z.sesiuni), 1)
                        return (
                          <div>
                            <p style={{ fontSize: '12px', color: '#AAA', marginBottom: '10px' }}>Vizite zilnice — ultimele 30 zile</p>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '60px' }}>
                              {vizitatori.zilnice.map((z, i) => (
                                <div key={i} title={`${z.zi}: ${z.sesiuni} vizitatori`}
                                  style={{ flex: 1, background: '#9B1B30', borderRadius: '3px 3px 0 0', height: `${Math.max(4, Math.round((z.sesiuni / max) * 60))}px`, opacity: 0.7, cursor: 'default', transition: 'opacity 0.15s' }}
                                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                  onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                      {vizitatori.paginaTop?.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <p style={{ fontSize: '12px', color: '#AAA', marginBottom: '10px' }}>Top pagini — ultimele 30 zile</p>
                          {vizitatori.paginaTop.map((p, i) => {
                            const maxV = vizitatori.paginaTop[0].vizite
                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#555', width: '140px', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.pagina || '/'}</span>
                                <div style={{ flex: 1, background: '#F0EAE0', borderRadius: '4px', height: '8px' }}>
                                  <div style={{ width: `${Math.round((p.vizite / maxV) * 100)}%`, height: '100%', background: '#C9A84C', borderRadius: '4px' }} />
                                </div>
                                <span style={{ fontSize: '12px', color: '#888', width: '30px', textAlign: 'right' }}>{p.vizite}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Funnel programări */}
                      {vizitatori.funnel && (
                        <div style={{ marginTop: '24px', borderTop: '1px solid #F0EAE0', paddingTop: '20px' }}>
                          <p style={{ fontSize: '12px', color: '#AAA', marginBottom: '14px' }}>Funnel programări — ultimele 30 zile</p>
                          {[
                            { label: 'Au apăsat Rezervă', val: vizitatori.funnel.booking_start, color: '#3B82F6' },
                            { label: 'Au ales serviciu', val: vizitatori.funnel.booking_serviciu, color: '#8B5CF6' },
                            { label: 'Au ales data/ora', val: vizitatori.funnel.booking_data, color: '#F59E0B' },
                            { label: 'Au finalizat programarea', val: vizitatori.funnel.booking_complet, color: '#10B981' },
                          ].map((f, i) => {
                            const max = vizitatori.funnel.booking_start || 1
                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '12px', color: '#555', width: '180px', flexShrink: 0 }}>{f.label}</span>
                                <div style={{ flex: 1, background: '#F0EAE0', borderRadius: '4px', height: '10px' }}>
                                  <div style={{ width: `${Math.round(((f.val || 0) / max) * 100)}%`, height: '100%', background: f.color, borderRadius: '4px', transition: 'width 0.6s' }} />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: f.color, width: '30px', textAlign: 'right' }}>{f.val || 0}</span>
                              </div>
                            )
                          })}
                          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', padding: '12px', background: '#FAFAFA', borderRadius: '10px' }}>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ fontSize: '11px', color: '#AAA', margin: '0 0 2px' }}>Roata jucată</p>
                              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#7C3AED', margin: 0 }}>{vizitatori.funnel.roata_spin || 0}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ fontSize: '11px', color: '#AAA', margin: '0 0 2px' }}>Premii câștigate</p>
                              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981', margin: 0 }}>{vizitatori.funnel.roata_castig || 0}</p>
                            </div>
                            {vizitatori.funnel.booking_start > 0 && (
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '11px', color: '#AAA', margin: '0 0 2px' }}>Rată conversie</p>
                                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#9B1B30', margin: 0 }}>
                                  {Math.round(((vizitatori.funnel.booking_complet || 0) / vizitatori.funnel.booking_start) * 100)}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Venituri 6 luni ── */}
                  <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Venituri — ultimele 6 luni</p>
                    <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 24px' }}>Numai programări confirmate</p>
                    {(() => {
                      const data = analitica.venitPeLuni
                      const maxVenit = Math.max(...data.map(d => d.venit), 1)
                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px' }}>
                          {data.map((d, i) => {
                            const pct = d.venit / maxVenit
                            const isLast = i === data.length - 1
                            return (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: isLast ? '#9B1B30' : '#555', marginBottom: '6px', textAlign: 'center' }}>{d.venit > 0 ? `${d.venit}` : '—'}</p>
                                <div style={{ width: '100%', background: isLast ? 'linear-gradient(180deg, #C9392A 0%, #9B1B30 100%)' : 'linear-gradient(180deg, #D4B870 0%, #C9A84C 100%)', borderRadius: '6px 6px 0 0', height: `${Math.max(pct * 150, d.venit > 0 ? 4 : 0)}px`, transition: 'height 0.4s ease' }} />
                                <div style={{ width: '100%', height: '1px', background: '#F0EAE0' }} />
                                <p style={{ fontSize: '11px', color: isLast ? '#9B1B30' : '#888', marginTop: '8px', textAlign: 'center', fontWeight: isLast ? 'bold' : 'normal' }}>{d.luna}</p>
                                <p style={{ fontSize: '10px', color: '#CCC', margin: '2px 0 0' }}>{d.programari} prog.</p>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>

                  {/* ── Top servicii + Zile de vârf ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', marginBottom: '20px' }}>

                    {/* Top servicii */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Top servicii</p>
                      <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 20px' }}>Ordonate după număr de programări</p>
                      {(() => {
                        const data = analitica.serviciiTop
                        const maxCount = Math.max(...data.map(d => d.count), 1)
                        return data.map((d, i) => (
                          <div key={i} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: i === 0 ? 'bold' : 'normal' }}>{d.name}</span>
                              <span style={{ fontSize: '11px', color: '#AAA', whiteSpace: 'nowrap', marginLeft: '8px' }}>{d.count}× · {d.venit} lei</span>
                            </div>
                            <div style={{ height: '7px', background: '#F5F0EB', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(d.count / maxCount) * 100}%`, background: i === 0 ? 'linear-gradient(90deg, #9B1B30, #C9392A)' : i < 3 ? 'linear-gradient(90deg, #C9A84C, #D4B870)' : '#D1D5DB', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                            </div>
                          </div>
                        ))
                      })()}
                    </div>

                    {/* Zile de vârf */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Zile de vârf</p>
                      <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 20px' }}>Distribuție pe zilele săptămânii</p>
                      {(() => {
                        const zile = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']
                        const vals = zile.map(z => analitica.zileVarf[z] || 0)
                        const maxVal = Math.max(...vals, 1)
                        return (
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '150px' }}>
                            {zile.map((z, i) => {
                              const pct = vals[i] / maxVal
                              const isWeekend = z === 'Sâm' || z === 'Dum'
                              const isPeak = vals[i] === maxVal && vals[i] > 0
                              return (
                                <div key={z} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                  {vals[i] > 0 && <p style={{ fontSize: '10px', fontWeight: 'bold', color: isPeak ? '#9B1B30' : '#888', marginBottom: '4px' }}>{vals[i]}</p>}
                                  <div style={{ width: '100%', background: isWeekend ? 'linear-gradient(180deg, #D4B870, #C9A84C)' : isPeak ? 'linear-gradient(180deg, #C9392A, #9B1B30)' : 'linear-gradient(180deg, #BFC3CA, #9CA3AF)', borderRadius: '4px 4px 0 0', height: `${Math.max(pct * 110, vals[i] > 0 ? 4 : 1)}px` }} />
                                  <p style={{ fontSize: '10px', color: isPeak ? '#9B1B30' : '#888', marginTop: '6px', fontWeight: isPeak ? 'bold' : 'normal' }}>{z}</p>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* ── Ore de vârf ── */}
                  <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', marginBottom: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Ore de vârf</p>
                    <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 24px' }}>Număr de programări pe interval orar (07:00 – 20:00)</p>
                    {(() => {
                      const ore = Object.entries(analitica.oreVarf).sort(([a], [b]) => Number(a) - Number(b))
                      const maxVal = Math.max(...ore.map(([, v]) => v), 1)
                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '130px', paddingBottom: '28px' }}>
                          {ore.map(([h, v]) => {
                            const pct = v / maxVal
                            const isPeak = v === maxVal && v > 0
                            const isHigh = pct > 0.6
                            return (
                              <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                                {v > 0 && <p style={{ fontSize: '9px', fontWeight: 'bold', color: isPeak ? '#9B1B30' : '#AAA', marginBottom: '2px' }}>{v}</p>}
                                <div style={{ width: '100%', background: isPeak ? 'linear-gradient(180deg, #C9392A, #9B1B30)' : isHigh ? 'linear-gradient(180deg, #D4B870, #C9A84C)' : v > 0 ? '#E5E7EB' : '#F5F5F5', borderRadius: '3px 3px 0 0', height: `${Math.max(pct * 80, v > 0 ? 3 : 1)}px` }} />
                                <p style={{ fontSize: '9px', color: '#999', marginTop: '24px', position: 'absolute', transform: 'rotate(-45deg) translateX(-4px)', whiteSpace: 'nowrap', transformOrigin: 'top left' }}>{h}:00</p>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>

                  {/* ── Profilul clientelei ── */}
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1C1C1C', margin: '0 0 4px' }}>Profilul clientelei</p>
                    <p style={{ color: '#AAA', fontSize: '13px', margin: '0 0 20px' }}>Date din secțiunea Clienți — sursa, locație, tip de fidelitate</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>

                      {/* Sursa clienti */}
                      <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', gridColumn: 'span 2' }}>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Cum ne-au găsit</p>
                        <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 20px' }}>Sursa de achiziție — din fișa clientului</p>
                        {(() => {
                          const data = analitica.sursaClienti
                          const maxCount = Math.max(...data.map(d => d.count), 1)
                          const colors = { 'TikTok': '#010101', 'Instagram': '#E1306C', 'Recomandare': '#10B981', 'Facebook': '#1877F2', 'Necunoscut': '#D1D5DB' }
                          if (!data.filter(d => d.sursa !== 'Necunoscut').length) return <p style={{ color: '#AAA', fontSize: '13px' }}>Nu există date de sursă încă.</p>
                          return data.map((d, i) => (
                            <div key={i} style={{ marginBottom: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                <span style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: i === 0 ? 'bold' : 'normal' }}>{d.sursa}</span>
                                <span style={{ fontSize: '12px', color: '#888', fontWeight: i === 0 ? 'bold' : 'normal' }}>{d.count} cliente</span>
                              </div>
                              <div style={{ height: '8px', background: '#F5F0EB', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(d.count / maxCount) * 100}%`, background: colors[d.sursa] || '#C9A84C', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                              </div>
                            </div>
                          ))
                        })()}
                      </div>

                      {/* Tip client */}
                      <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Tip clientă</p>
                        <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 20px' }}>Fidelitate</p>
                        {(() => {
                          const data = analitica.tipClienti
                          const total = data.reduce((s, d) => s + d.count, 0) || 1
                          const tipColors = { 'Fidelă': '#10B981', 'Modelă': '#C9A84C', 'Ocazională': '#3B82F6', 'Prima vizită': '#8B5CF6', 'Necunoscut': '#D1D5DB' }
                          return data.map((d, i) => (
                            <div key={i} style={{ marginBottom: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                <span style={{ fontSize: '13px', color: '#1C1C1C' }}>{d.tip}</span>
                                <span style={{ fontSize: '12px', color: '#888' }}>{d.count} · {Math.round(d.count/total*100)}%</span>
                              </div>
                              <div style={{ height: '6px', background: '#F5F0EB', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(d.count / total) * 100}%`, background: tipColors[d.tip] || '#9CA3AF', borderRadius: '3px' }} />
                              </div>
                            </div>
                          ))
                        })()}
                      </div>

                      {/* Oras clienti */}
                      <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', gridColumn: 'span 3' }}>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>De unde vin clientele</p>
                        <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 20px' }}>Proveniența geografică — din fișa clientului</p>
                        {(() => {
                          const data = analitica.provenientaClienti || []
                          const total = data.reduce((s, d) => s + d.count, 0) || 1
                          const maxCount = Math.max(...data.map(d => d.count), 1)
                          const colors = { 'Piatra Neamț': '#9B1B30', 'București': '#3B82F6', 'Alt oraș': '#C9A84C', 'Altă țară': '#10B981', 'Necunoscut': '#D1D5DB' }
                          if (!data.length) return <p style={{ color: '#AAA', fontSize: '13px' }}>Nu există date de proveniență încă.</p>
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                              {data.map((d, i) => {
                                const pct = Math.round(d.count / total * 100)
                                const color = colors[d.provenienta] || '#8B5CF6'
                                return (
                                  <div key={i} style={{ background: '#FAFAFA', borderRadius: '12px', padding: '16px', border: `1px solid ${color}33` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1C1C1C' }}>{d.provenienta}</span>
                                      <span style={{ fontSize: '22px', fontWeight: 'bold', color }}>{pct}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#EEEEEE', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                                      <div style={{ height: '100%', width: `${(d.count / maxCount) * 100}%`, background: color, borderRadius: '3px' }} />
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#AAA' }}>{d.count} cliente</span>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}
                      </div>

                      {/* PRODUSE TOP */}
                      <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', gridColumn: 'span 3' }}>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Produse cel mai des utilizate</p>
                        <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 20px' }}>Din secțiunea „Materiale utilizate" la programări</p>
                        {(() => {
                          const data = analitica.produseTop || []
                          const maxCount = Math.max(...data.map(d => d.count), 1)
                          if (!data.length) return <p style={{ color: '#AAA', fontSize: '13px' }}>Nu s-au înregistrat materiale utilizate încă.</p>
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {data.map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#CCC', width: '20px', textAlign: 'right', flexShrink: 0 }}>#{i + 1}</span>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <span style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: i === 0 ? 'bold' : 'normal' }}>{d.name}</span>
                                      <span style={{ fontSize: '12px', color: '#888' }}>{d.count}×</span>
                                    </div>
                                    <div style={{ height: '5px', background: '#F0EAE0', borderRadius: '3px', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${(d.count / maxCount) * 100}%`, background: `linear-gradient(90deg, #9B1B30, #C9A84C)`, borderRadius: '3px' }} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                      </div>

                    </div>
                  </div>

                </>
              )
            })()}
          </div>
        )}

        {/* IMPORT CSV TAB */}
        {tab === 'import' && (
          <div style={{ padding: '24px', maxWidth: '700px' }}>
            <button onClick={() => setTab('meniu')} style={{ background: 'white', border: '1px solid #E8DDD0', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#888', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>← Meniu Salon</button>
            <h2 style={{ fontSize: '24px', fontWeight: 'normal', marginBottom: '8px' }}>Import clienți</h2>

            {/* Sync Google Sheets */}
            <div style={{ background: 'linear-gradient(135deg, #FDF8EC, #F5EDD0)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '20px 24px', marginBottom: '28px' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 'bold', color: '#A8883A', margin: '0 0 6px' }}>✦ Sincronizare Google Sheets</p>
              <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.6 }}>
                Importă automat toți clienții din foaia Google Sheets (ANALITICA SALON CLIENTI).<br />
                Clienții existenți nu se duplică — se actualizează doar câmpurile goale.
              </p>
              <SyncSheetsButton token={token} onDone={async () => { await fetchClienti(); await fetchProgramari() }} />
            </div>

            <p style={{ color: '#888', marginBottom: '16px', fontSize: '14px', lineHeight: 1.7 }}>
              Sau importați manual din CSV (export Mero):<br />
              Coloane acceptate: <strong>nume, telefon, email, data_nastere, observatii</strong>
            </p>

            {/* Zona drag & drop + buton selectare fișier */}
            <div
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#9B1B30' }}
              onDragLeave={e => { e.currentTarget.style.borderColor = '#C9A84C' }}
              onDrop={e => {
                e.preventDefault()
                e.currentTarget.style.borderColor = '#C9A84C'
                const file = e.dataTransfer.files[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => setCsvText(ev.target.result)
                reader.readAsText(file)
              }}
              style={{ border: '2px dashed #C9A84C', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '12px', cursor: 'pointer', background: '#FDFAF4', transition: 'border-color 0.2s' }}
              onClick={() => document.getElementById('csv-file-input').click()}
            >
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,.txt"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = ev => setCsvText(ev.target.result)
                  reader.readAsText(file)
                  e.target.value = ''
                }}
              />
              <p style={{ margin: 0, color: '#9B1B30', fontWeight: 'bold', fontSize: '15px' }}>📂 Selectează fișier CSV</p>
              <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '13px' }}>sau trage fișierul aici</p>
            </div>

            <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
              rows={8} className="input-field"
              placeholder={'nume,telefon,email\nMaria Ionescu,0712345678,maria@email.com\nAna Pop,0723456789,'}
              style={{ marginBottom: '16px', fontFamily: 'monospace', fontSize: '13px' }}
            />
            <button onClick={importCSV} disabled={!csvText.trim() || importStatus === 'loading'}
              className="btn-primary" style={{ padding: '14px 32px', fontSize: '14px' }}>
              {importStatus === 'loading' ? 'Se verifică...' : 'VERIFICĂ CSV'}
            </button>
            {importPreview && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#F7EFE5', borderRadius: '10px', border: '1px solid #C9A84C' }}>
                <p style={{ fontSize: '15px', marginBottom: '12px' }}>
                  <strong style={{ color: '#10B981' }}>✅ {importPreview.noi} clienți noi</strong>
                  {importPreview.duplicate > 0 && <span style={{ color: '#888', marginLeft: '12px' }}>• {importPreview.duplicate} deja existenți (se ignoră)</span>}
                </p>
                {importPreview.noi > 0 ? (
                  <button onClick={confirmImport} className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
                    CONFIRMĂ IMPORTUL ({importPreview.noi} clienți)
                  </button>
                ) : (
                  <p style={{ color: '#888', fontSize: '14px' }}>Toți clienții din CSV există deja în baza de date.</p>
                )}
                <button onClick={() => { setImportPreview(null); setPendingClienti(null) }}
                  style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' }}>
                  Anulează
                </button>
              </div>
            )}
            {importStatus && importStatus !== 'loading' && (
              <p style={{ marginTop: '16px', color: '#10B981', fontSize: '15px' }}>{importStatus}</p>
            )}
          </div>
        )}

        {/* PRODUSE TAB */}
        {tab === 'produse' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 24px 0' }}>
              <button onClick={() => setTab('meniu')} style={{ background: 'white', border: '1px solid #E8DDD0', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#888', fontFamily: 'Georgia, serif' }}>← Meniu Salon</button>
            </div>
            <ProdusTab />
          </div>
        )}
        {tab === 'meniu' && <MeniuSalonTab token={token} clientiCount={clienti.filter(c => c.telefon).length} onNavigate={t => setTab(t)} />}

        {/* SETĂRI TAB */}
        {tab === 'setari' && (
          <div style={{ padding: '32px', maxWidth: '600px' }}>
            <button onClick={() => setTab('meniu')} style={{ background: 'white', border: '1px solid #E8DDD0', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#888', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>← Meniu Salon</button>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal', color: '#1C1C1C', margin: '0 0 6px' }}>Setări Admin</h2>
            <p style={{ color: '#AAA', fontSize: '13px', margin: '0 0 32px' }}>Modifică datele de acces și configurațiile salonului</p>

            {/* Securitate */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <IcoSetari size={36} />
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: 0 }}>Parolă Admin</p>
                  <p style={{ color: '#AAA', fontSize: '12px', margin: 0 }}>Schimbă parola de acces la panoul admin</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>PAROLĂ ACTUALĂ</label>
                  <input
                    type="password"
                    value={setariParolaVeche}
                    onChange={e => setSetariParolaVeche(e.target.value)}
                    placeholder="Introdu parola actuală"
                    style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>PAROLĂ NOUĂ</label>
                  <input
                    type="password"
                    value={setariParola}
                    onChange={e => setSetariParola(e.target.value)}
                    placeholder="Introdu parola nouă"
                    style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onClick={async () => {
                    setSetariMsg(null)
                    if (!setariParolaVeche || !setariParola) { setSetariMsg({ ok: false, text: 'Completează ambele câmpuri.' }); return }
                    if (setariParola.length < 6) { setSetariMsg({ ok: false, text: 'Parola nouă trebuie să aibă minim 6 caractere.' }); return }
                    // Verify old password by making a test request
                    const verif = await fetch('/api/admin/setari', { headers: { 'x-admin-token': setariParolaVeche } })
                    if (!verif.ok) { setSetariMsg({ ok: false, text: 'Parola actuală este incorectă.' }); return }
                    // Save new password
                    const res = await fetch('/api/admin/setari', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-admin-token': setariParolaVeche },
                      body: JSON.stringify({ cheie: 'admin_password', valoare: setariParola })
                    })
                    if (res.ok) {
                      setToken(setariParola)
                      localStorage.setItem('adminToken', setariParola)
                      setSetariParola('')
                      setSetariParolaVeche('')
                      setSetariMsg({ ok: true, text: 'Parola a fost schimbată cu succes! Folosește parola nouă data viitoare.' })
                    } else {
                      setSetariMsg({ ok: false, text: 'Eroare la salvare.' })
                    }
                  }}
                  style={{ background: 'linear-gradient(135deg, #9B1B30, #C9A84C)', color: 'white', border: 'none', borderRadius: '12px', padding: '13px 28px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.5px', alignSelf: 'flex-start' }}>
                  SCHIMBĂ PAROLA
                </button>
                {setariMsg && (
                  <div style={{ padding: '12px 16px', borderRadius: '10px', background: setariMsg.ok ? '#ECFDF5' : '#FEF2F2', color: setariMsg.ok ? '#065F46' : '#991B1B', fontSize: '13px' }}>
                    {setariMsg.text}
                  </div>
                )}
              </div>
            </div>

            {/* Info salon */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1C1C1C', margin: '0 0 4px' }}>Info Salon</p>
              <p style={{ color: '#AAA', fontSize: '12px', margin: '0 0 20px' }}>Date afișate pe site și în SMS-uri</p>
              {[
                { cheie: 'salon_nume', label: 'Nume salon', placeholder: 'ex: Andreea Berta Nail Studio' },
                { cheie: 'salon_telefon', label: 'Telefon', placeholder: 'ex: 0712345678' },
                { cheie: 'salon_adresa', label: 'Adresă', placeholder: 'ex: Str. Exemplu 10, Piatra Neamț' },
              ].map(({ cheie, label, placeholder }) => (
                <div key={cheie} style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>{label.toUpperCase()}</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      defaultValue={setariData[cheie] || ''}
                      placeholder={placeholder}
                      id={`setari-${cheie}`}
                      style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '11px 16px', fontSize: '14px', outline: 'none' }}
                    />
                    <button
                      onClick={async () => {
                        const val = document.getElementById(`setari-${cheie}`).value
                        await fetch('/api/admin/setari', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                          body: JSON.stringify({ cheie, valoare: val })
                        })
                        setSetariData(d => ({ ...d, [cheie]: val }))
                      }}
                      style={{ background: '#F0EAE0', border: 'none', borderRadius: '12px', padding: '0 18px', fontSize: '13px', fontWeight: 'bold', color: '#9B1B30', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Salvează
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

              {/* Nume cu autocomplete */}
              <div style={{ marginBottom: '14px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Nume client *</label>
                <input type="text" required value={newProg.nume}
                  onChange={e => {
                    const v = e.target.value
                    setNewProg({ ...newProg, nume: v })
                    if (v.length >= 2) {
                      const matches = clienti.filter(c => c.nume?.toLowerCase().includes(v.toLowerCase())).slice(0, 6)
                      setAcSuggestions(matches); setAcField('nume')
                    } else { setAcSuggestions([]); setAcField(null) }
                  }}
                  onBlur={() => setTimeout(() => { setAcSuggestions([]); setAcField(null) }, 150)}
                  className="input-field" placeholder="Caută după nume..." />
                {acField === 'nume' && acSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.14)', zIndex: 200, overflow: 'hidden', border: '1px solid #EDE4DC', marginTop: '4px' }}>
                    {acSuggestions.map(c => (
                      <button key={c.id} type="button"
                        onMouseDown={() => { setNewProg({ ...newProg, nume: c.nume, telefon: c.telefon || '' }); setAcSuggestions([]); setAcField(null) }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #F5EEE8' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F7EFE5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: '14px', color: '#1C1C1C' }}>{c.nume}</span>
                        <span style={{ fontSize: '12px', color: '#999' }}>{c.telefon}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Telefon cu autocomplete */}
              <div style={{ marginBottom: '14px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Telefon *</label>
                <input type="tel" required value={newProg.telefon}
                  onChange={e => {
                    const v = e.target.value
                    setNewProg({ ...newProg, telefon: v })
                    if (v.length >= 3) {
                      const matches = clienti.filter(c => c.telefon?.includes(v)).slice(0, 6)
                      setAcSuggestions(matches); setAcField('telefon')
                    } else { setAcSuggestions([]); setAcField(null) }
                  }}
                  onBlur={() => setTimeout(() => { setAcSuggestions([]); setAcField(null) }, 150)}
                  className="input-field" placeholder="07XX XXX XXX" />
                {acField === 'telefon' && acSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.14)', zIndex: 200, overflow: 'hidden', border: '1px solid #EDE4DC', marginTop: '4px' }}>
                    {acSuggestions.map(c => (
                      <button key={c.id} type="button"
                        onMouseDown={() => { setNewProg({ ...newProg, nume: c.nume, telefon: c.telefon || '' }); setAcSuggestions([]); setAcField(null) }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #F5EEE8' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F7EFE5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: '14px', color: '#1C1C1C' }}>{c.nume}</span>
                        <span style={{ fontSize: '12px', color: '#999' }}>{c.telefon}</span>
                      </button>
                    ))}
                  </div>
                )}
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
                <select required value={newProg.serviciu} onChange={e => { setNewProg({ ...newProg, serviciu: e.target.value }); setPretManualNou('') }} className="input-field">
                  <option value="">Alege serviciul</option>
                  {serviciiDB.map(sv => <option key={sv.id} value={sv.nume}>{sv.nume} — {sv.pret} lei ({sv.durata} min)</option>)}
                </select>
              </div>

              {/* Preț + Servicii extra */}
              <div style={{ marginBottom: '14px', borderTop: '1px solid #F0EAE0', paddingTop: '14px' }}>
                <ExtraServicii
                  servicii={serviciiDB}
                  mainServiciu={newProg.serviciu}
                  extras={extraServiciiNou}
                  onExtrasChange={setExtraServiciiNou}
                  pretBase={Number(serviciiDB.find(s => s.nume === newProg.serviciu)?.pret || 0)}
                  pretManual={pretManualNou}
                  onPretManualChange={setPretManualNou}
                />
              </div>

              {/* Tip vizită */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', color: '#555' }}>Tip vizită</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[{ id: 'client', label: '👤 Client', desc: 'Vizită plătită' }, { id: 'modela', label: '✦ Modelă', desc: 'Conținut / gratuită' }].map(t => (
                    <div key={t.id} onClick={() => setNewProg({ ...newProg, tip_vizita: t.id })}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', border: `2px solid ${newProg.tip_vizita === t.id ? (t.id === 'modela' ? s.gold : s.ruby) : '#E8E8E8'}`, background: newProg.tip_vizita === t.id ? (t.id === 'modela' ? '#FDF8EC' : '#FFF5F6') : 'white', transition: 'all 0.15s', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px', color: newProg.tip_vizita === t.id ? (t.id === 'modela' ? '#A8883A' : s.ruby) : '#555' }}>{t.label}</p>
                      <p style={{ fontSize: '10px', color: '#AAA', margin: 0 }}>{t.desc}</p>
                    </div>
                  ))}
                </div>
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
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Observații</label>
                <textarea rows={2} value={newProg.observatii} onChange={e => setNewProg({ ...newProg, observatii: e.target.value })} className="input-field" />
              </div>

              {/* Materiale utilizate */}
              <div style={{ marginBottom: '24px', borderTop: '1px solid #F0EAE0', paddingTop: '16px' }}>
                <MaterialeUtilizate programareId={null} produse={produseDB} onChange={setMaterialeNou} />
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

      {/* Bottom nav — doar mobil */}
      <nav className="admin-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'linear-gradient(160deg, #9B1B30 0%, #7A1525 100%)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
        justifyContent: 'space-around', alignItems: 'center',
        padding: '6px 0 8px',
      }}>
        {/* Primele 2 tab-uri */}
        {[
          { id: 'calendar', icon: (a) => <IcoCalendar active={a} size={26} />, label: 'Calendar' },
          { id: 'clienti', icon: (a) => <IcoClienti active={a} size={26} />, label: 'Clienți' },
        ].map(item => {
          const active = tab === item.id
          return (
            <button key={item.id} onClick={() => { setTab(item.id); setShowFabMenu(false); localStorage.setItem('adminTab', item.id) }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 10px', color: active ? '#F9E4A0' : 'rgba(255,255,255,0.55)' }}>
              {item.icon(active)}
              <span style={{ fontSize: '9px', letterSpacing: '0.5px', fontFamily: 'Georgia, serif', fontWeight: active ? 'bold' : 'normal' }}>{item.label}</span>
              {active && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C9A84C', marginTop: '1px' }} />}
            </button>
          )
        })}

        {/* FAB — buton + în cerc */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Meniu popup */}
          {showFabMenu && (
            <div style={{ position: 'absolute', bottom: '64px', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '8px', minWidth: '180px', zIndex: 200 }}>
              <button onClick={() => { setShowAddForm(true); setShowFabMenu(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: '#1C1C1C', borderRadius: '10px' }}>
                <span style={{ fontSize: '18px' }}>📅</span> Programare nouă
              </button>
              <button onClick={() => {
                  setNewProg({ ...newProg, data: formatDateRO(viewDate), ora: '', serviciu: 'Timp blocat', plata: 'numerar', observatii: '', nume: 'Blocat', telefon: '—' })
                  setShowAddForm(true); setShowFabMenu(false)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: '#1C1C1C', borderRadius: '10px' }}>
                <span style={{ fontSize: '18px' }}>🔒</span> Blochează timp
              </button>
            </div>
          )}
          <button onClick={() => setShowFabMenu(v => !v)}
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #F0DC8A, #C9A84C)', border: 'none', cursor: 'pointer', fontSize: '26px', color: '#1C1C1C', fontWeight: 'bold', boxShadow: '0 4px 16px rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, marginBottom: '2px', transform: showFabMenu ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
            +
          </button>
          <span style={{ fontSize: '9px', color: showFabMenu ? '#F9E4A0' : 'rgba(255,255,255,0.55)', fontFamily: 'Georgia, serif' }}>Adaugă</span>
        </div>

        {/* Ultimele 2 tab-uri */}
        {[
          { id: 'meniu', icon: (a) => <IcoMeniu active={a} size={26} />, label: 'Meniu' },
          { id: 'analitica', icon: (a) => <IcoAnalitica active={a} size={26} />, label: 'Analitica' },
        ].map(item => {
          const active = tab === item.id
          return (
            <button key={item.id} onClick={() => { setTab(item.id); setShowFabMenu(false); localStorage.setItem('adminTab', item.id) }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 10px', color: active ? '#F9E4A0' : 'rgba(255,255,255,0.55)' }}>
              {item.icon(active)}
              <span style={{ fontSize: '9px', letterSpacing: '0.5px', fontFamily: 'Georgia, serif', fontWeight: active ? 'bold' : 'normal' }}>{item.label}</span>
              {active && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C9A84C', marginTop: '1px' }} />}
            </button>
          )
        })}
      </nav>

      {/* Modal orar lucru */}
      {scheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setScheduleModal(null) }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '28px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', margin: 0, color: s.ruby }}>
                {scheduleModal === 'repetitiv' && '🔁 Orar repetitiv'}
                {scheduleModal === 'azi' && '📋 Orar pentru azi'}
                {scheduleModal === 'inchide' && '🔒 Închide ziua de lucru'}
                {scheduleModal === 'concediu' && '🏖️ Concediu / Zile libere'}
                {scheduleModal === 'limita' && '📊 Programări acceptate / zi'}
              </h3>
              <button onClick={() => setScheduleModal(null)} style={{ background: '#F0EAE0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
            </div>

            {/* ---- ORAR REPETITIV ---- */}
            {scheduleModal === 'repetitiv' && (
              <div>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>Orarul săptămânal implicit — se aplică automat în fiecare săptămână.</p>
                {scheduleWeek ? (
                  <>
                    {['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'].map((numeZi, idx) => {
                      const row = scheduleWeek[idx] || { zi: idx, activ: false, ora_start: '09:00', ora_sfarsit: '19:00', pauza_start: '12:00', pauza_sfarsit: '13:00' }
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '10px 12px', background: row.activ ? '#FAFAFA' : '#F5F5F5', borderRadius: '10px', border: `1px solid ${row.activ ? '#EEE' : '#E0E0E0'}` }}>
                          <input type="checkbox" checked={!!row.activ}
                            onChange={e => {
                              const updated = [...scheduleWeek]
                              updated[idx] = { ...row, activ: e.target.checked }
                              setScheduleWeek(updated)
                            }}
                            style={{ width: '16px', height: '16px', accentColor: s.ruby, cursor: 'pointer', flexShrink: 0 }}
                          />
                          <span style={{ width: '72px', fontSize: '13px', color: row.activ ? '#333' : '#AAA', fontWeight: row.activ ? '500' : 'normal', flexShrink: 0 }}>{numeZi}</span>
                          {row.activ ? (
                            <>
                              <input type="time" value={row.ora_start || '09:00'}
                                onChange={e => { const u=[...scheduleWeek]; u[idx]={...row,ora_start:e.target.value}; setScheduleWeek(u) }}
                                style={{ flex: 1, padding: '6px 8px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '13px', fontFamily: 'Georgia, serif' }}
                              />
                              <span style={{ fontSize: '11px', color: '#AAA' }}>—</span>
                              <input type="time" value={row.ora_sfarsit || '19:00'}
                                onChange={e => { const u=[...scheduleWeek]; u[idx]={...row,ora_sfarsit:e.target.value}; setScheduleWeek(u) }}
                                style={{ flex: 1, padding: '6px 8px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '13px', fontFamily: 'Georgia, serif' }}
                              />
                              <span style={{ fontSize: '11px', color: s.gold, flexShrink: 0 }}>P</span>
                              <input type="time" value={row.pauza_start || ''}
                                placeholder="--:--"
                                onChange={e => { const u=[...scheduleWeek]; u[idx]={...row,pauza_start:e.target.value||null}; setScheduleWeek(u) }}
                                style={{ flex: 1, padding: '6px 8px', border: `1px solid ${s.gold}`, borderRadius: '8px', fontSize: '12px', fontFamily: 'Georgia, serif' }}
                              />
                              <span style={{ fontSize: '11px', color: '#AAA' }}>—</span>
                              <input type="time" value={row.pauza_sfarsit || ''}
                                placeholder="--:--"
                                onChange={e => { const u=[...scheduleWeek]; u[idx]={...row,pauza_sfarsit:e.target.value||null}; setScheduleWeek(u) }}
                                style={{ flex: 1, padding: '6px 8px', border: `1px solid ${s.gold}`, borderRadius: '8px', fontSize: '12px', fontFamily: 'Georgia, serif' }}
                              />
                            </>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#AAA', flex: 1 }}>Zi închisă</span>
                          )}
                        </div>
                      )
                    })}
                    <button
                      disabled={savingSchedule}
                      onClick={async () => {
                        if (!scheduleWorker || !scheduleWeek) return
                        setSavingSchedule(true)
                        await fetch('/api/admin/schedule', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                          body: JSON.stringify({ type: 'schedule', worker_id: scheduleWorker, schedule: scheduleWeek })
                        })
                        setSavingSchedule(false)
                        setScheduleModal(null)
                      }}
                      style={{ width: '100%', padding: '13px', borderRadius: '50px', border: 'none', background: savingSchedule ? '#DDD' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', cursor: savingSchedule ? 'default' : 'pointer', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px', marginTop: '8px', boxShadow: savingSchedule ? 'none' : '0 4px 16px rgba(155,27,48,0.3)' }}>
                      {savingSchedule ? 'Se salvează...' : 'SALVEAZĂ ORARUL'}
                    </button>
                  </>
                ) : (
                  <p style={{ color: '#AAA', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Se încarcă...</p>
                )}

                {/* Existing time_off list */}
                {scheduleTimeOff.length > 0 && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #F0EAE0', paddingTop: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Zile speciale salvate</p>
                    {scheduleTimeOff.map(to => (
                      <div key={to.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FFF8F8', borderRadius: '8px', marginBottom: '6px', border: '1px solid #FFE0E0' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>{to.data}</span>
                          <span style={{ fontSize: '11px', color: '#AAA', marginLeft: '8px' }}>{to.tip}{to.ora_start ? ` ${to.ora_start}–${to.ora_sfarsit}` : ''}</span>
                          {to.nota && <span style={{ fontSize: '11px', color: '#888', marginLeft: '6px' }}>· {to.nota}</span>}
                        </div>
                        <button
                          onClick={async () => {
                            await fetch('/api/admin/schedule', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                              body: JSON.stringify({ id: to.id, type: 'time_off' })
                            })
                            setScheduleTimeOff(prev => prev.filter(x => x.id !== to.id))
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '16px', padding: '2px 6px', borderRadius: '6px' }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---- ORAR AZI ---- */}
            {scheduleModal === 'azi' && (
              <div>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
                  Modifică orarul doar pentru <strong>{dateStr(viewDate)}</strong> — nu afectează celelalte zile.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Ora start</label>
                    <input type="time"
                      value={newTimeOff.ora_start || '09:00'}
                      onChange={e => setNewTimeOff(prev => ({ ...prev, ora_start: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #DDD', borderRadius: '10px', fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Ora sfârșit</label>
                    <input type="time"
                      value={newTimeOff.ora_sfarsit || '19:00'}
                      onChange={e => setNewTimeOff(prev => ({ ...prev, ora_sfarsit: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #DDD', borderRadius: '10px', fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: '#AAA', marginBottom: '20px' }}>Pauza va fi eliminată pentru această zi. Poți adăuga una din orar repetitiv dacă e nevoie.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setScheduleModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '50px', border: '1.5px solid #DDD', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#555' }}>Anulează</button>
                  <button
                    disabled={savingSchedule}
                    onClick={async () => {
                      if (!scheduleWorker) return
                      setSavingSchedule(true)
                      await fetch('/api/admin/schedule', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                        body: JSON.stringify({
                          type: 'time_off',
                          worker_id: scheduleWorker,
                          data: formatDateRO(viewDate),
                          tip: 'orar_zi',
                          ora_start: newTimeOff.ora_start || '09:00',
                          ora_sfarsit: newTimeOff.ora_sfarsit || '19:00',
                          nota: ''
                        })
                      })
                      setSavingSchedule(false)
                      setNewTimeOff({ data: '', tip: 'zi_libera', ora_start: '', ora_sfarsit: '', nota: '' })
                      setScheduleModal(null)
                    }}
                    style={{ flex: 1, padding: '12px', borderRadius: '50px', border: 'none', background: savingSchedule ? '#DDD' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', cursor: savingSchedule ? 'default' : 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    {savingSchedule ? 'Se salvează...' : 'SALVEAZĂ PENTRU AZI'}
                  </button>
                </div>
              </div>
            )}

            {/* ---- INCHIDE ZIUA ---- */}
            {scheduleModal === 'inchide' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                <p style={{ color: '#444', fontSize: '15px', marginBottom: '8px' }}>
                  Marchezi <strong style={{ color: s.ruby }}>{dateStr(viewDate)}</strong> ca zi liberă?
                </p>
                <p style={{ color: '#AAA', fontSize: '12px', marginBottom: '28px' }}>Clientele nu vor mai putea face programări în această zi.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setScheduleModal(null)} style={{ flex: 1, padding: '13px', borderRadius: '50px', border: '1.5px solid #DDD', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#555' }}>Anulează</button>
                  <button
                    disabled={savingSchedule}
                    onClick={async () => {
                      if (!scheduleWorker) return
                      setSavingSchedule(true)
                      await fetch('/api/admin/schedule', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                        body: JSON.stringify({
                          type: 'time_off',
                          worker_id: scheduleWorker,
                          data: formatDateRO(viewDate),
                          tip: 'zi_libera',
                          nota: ''
                        })
                      })
                      // Actualizare optimista — overlay rosu apare instant pe calendar
                      const dataZi = formatDateRO(viewDate)
                      setScheduleTimeOff(prev => [
                        ...prev.filter(t => !(t.data?.trim() === dataZi.trim() && (t.tip === 'zi_libera' || t.tip === 'concediu') && !t.ora_start)),
                        { id: Date.now(), data: dataZi, tip: 'zi_libera', ora_start: null, ora_sfarsit: null, nota: '' },
                      ])
                      setSavingSchedule(false)
                      setScheduleModal(null)
                    }}
                    style={{ flex: 1, padding: '13px', borderRadius: '50px', border: 'none', background: savingSchedule ? '#DDD' : '#EF4444', color: 'white', cursor: savingSchedule ? 'default' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                    {savingSchedule ? 'Se procesează...' : 'Închide ziua'}
                  </button>
                </div>
              </div>
            )}

            {/* ---- CONCEDIU ---- */}
            {scheduleModal === 'concediu' && (
              <div>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>Adaugă concediu sau zile libere pentru o perioadă. Clientele nu vor putea face programări în zilele respective.</p>

                {/* Form adaugare */}
                <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #EEE' }}>
                  <p style={{ fontSize: '12px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Perioadă nouă</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Data start</label>
                      <input type="date"
                        value={newTimeOff.data || ''}
                        onChange={e => setNewTimeOff(prev => ({ ...prev, data: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Data sfârșit</label>
                      <input type="date"
                        value={newTimeOff.ora_sfarsit || ''}
                        onChange={e => setNewTimeOff(prev => ({ ...prev, ora_sfarsit: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Notă (opțional)</label>
                    <input type="text"
                      value={newTimeOff.nota || ''}
                      onChange={e => setNewTimeOff(prev => ({ ...prev, nota: e.target.value }))}
                      placeholder="ex: Concediu anual"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #DDD', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    disabled={savingSchedule || !newTimeOff.data}
                    onClick={async () => {
                      if (!scheduleWorker || !newTimeOff.data) return
                      setSavingSchedule(true)
                      // Generate all dates in range
                      const startDate = new Date(newTimeOff.data)
                      const endDate = newTimeOff.ora_sfarsit ? new Date(newTimeOff.ora_sfarsit) : new Date(newTimeOff.data)
                      const added = []
                      const cur = new Date(startDate)
                      while (cur <= endDate) {
                        const dataStr = `${cur.getDate()} ${LUNI[cur.getMonth()]} ${cur.getFullYear()}`
                        const res = await fetch('/api/admin/schedule', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                          body: JSON.stringify({
                            type: 'time_off',
                            worker_id: scheduleWorker,
                            data: dataStr,
                            tip: 'concediu',
                            nota: newTimeOff.nota || ''
                          })
                        })
                        const r = await res.json()
                        if (r.id) added.push({ id: r.id, data: dataStr, tip: 'concediu', nota: newTimeOff.nota || '', ora_start: null, ora_sfarsit: null })
                        cur.setDate(cur.getDate() + 1)
                      }
                      setScheduleTimeOff(prev => [...added, ...prev])
                      setNewTimeOff({ data: '', tip: 'zi_libera', ora_start: '', ora_sfarsit: '', nota: '' })
                      setSavingSchedule(false)
                    }}
                    style={{ width: '100%', padding: '11px', borderRadius: '50px', border: 'none', background: savingSchedule || !newTimeOff.data ? '#DDD' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', cursor: savingSchedule || !newTimeOff.data ? 'default' : 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    {savingSchedule ? 'Se salvează...' : '+ ADAUGĂ CONCEDIU'}
                  </button>
                </div>

                {/* Lista existenta */}
                {scheduleTimeOff.filter(t => t.tip === 'concediu' || t.tip === 'zi_libera').length > 0 ? (
                  <div>
                    <p style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Zile libere / Concediu salvate</p>
                    {scheduleTimeOff
                      .filter(t => t.tip === 'concediu' || t.tip === 'zi_libera')
                      .map(to => (
                        <div key={to.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FFF8F0', borderRadius: '10px', marginBottom: '6px', border: `1px solid ${s.gold}40` }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{to.data}</span>
                            <span style={{ fontSize: '11px', color: '#AAA', marginLeft: '8px', background: '#F0EAE0', borderRadius: '4px', padding: '1px 6px' }}>{to.tip === 'concediu' ? '🏖️ Concediu' : '🔒 Zi liberă'}</span>
                            {to.nota && <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>{to.nota}</p>}
                          </div>
                          <button
                            onClick={async () => {
                              await fetch('/api/admin/schedule', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                                body: JSON.stringify({ id: to.id, type: 'time_off' })
                              })
                              setScheduleTimeOff(prev => prev.filter(x => x.id !== to.id))
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '16px', padding: '4px 8px', borderRadius: '6px', flexShrink: 0 }}>
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p style={{ color: '#AAA', fontSize: '13px', textAlign: 'center', padding: '12px' }}>Nu există zile libere / concediu salvate.</p>
                )}
              </div>
            )}

            {/* ---- PROGRAMARI ACCEPTATE / ZI ---- */}
            {scheduleModal === 'limita' && (
              <div>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
                  Stabilește câte programări accepți pe zi într-o perioadă. După ce se ating, ziua devine <strong>completă</strong> și clientele nu mai pot rezerva. Se sincronizează automat cu programările existente.
                </p>

                {/* Form adaugare */}
                <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #EEE' }}>
                  <p style={{ fontSize: '12px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Regulă nouă</p>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Programări acceptate pe zi</label>
                    <input type="number" min="0" inputMode="numeric"
                      value={newLimit.max_pe_zi}
                      onChange={e => setNewLimit(prev => ({ ...prev, max_pe_zi: e.target.value }))}
                      placeholder="ex: 2"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #DDD', borderRadius: '10px', fontSize: '15px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '6px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>De la data</label>
                      <input type="date"
                        value={newLimit.data_start || ''}
                        onChange={e => setNewLimit(prev => ({ ...prev, data_start: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Până la data</label>
                      <input type="date"
                        value={newLimit.data_end || ''}
                        onChange={e => setNewLimit(prev => ({ ...prev, data_end: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#AAA', margin: '0 0 12px' }}>Lași „Până la” gol → regula se aplică permanent, din data de start încolo.</p>
                  <button
                    disabled={savingSchedule || newLimit.max_pe_zi === '' || !newLimit.data_start}
                    onClick={async () => {
                      if (!scheduleWorker || newLimit.max_pe_zi === '' || !newLimit.data_start) return
                      setSavingSchedule(true)
                      const res = await fetch('/api/admin/schedule', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                        body: JSON.stringify({
                          type: 'daily_limit',
                          worker_id: scheduleWorker,
                          data_start: newLimit.data_start,
                          data_end: newLimit.data_end || null,
                          max_pe_zi: Number(newLimit.max_pe_zi),
                        })
                      })
                      const r = await res.json()
                      if (r.id) {
                        setDailyLimits(prev => [{ id: r.id, data_start: newLimit.data_start, data_end: newLimit.data_end || null, max_pe_zi: Number(newLimit.max_pe_zi) }, ...prev])
                      }
                      setNewLimit({ max_pe_zi: '', data_start: '', data_end: '' })
                      setSavingSchedule(false)
                    }}
                    style={{ width: '100%', padding: '11px', borderRadius: '50px', border: 'none', background: savingSchedule || newLimit.max_pe_zi === '' || !newLimit.data_start ? '#DDD' : `linear-gradient(135deg, ${s.ruby}, #7A1525)`, color: 'white', cursor: savingSchedule || newLimit.max_pe_zi === '' || !newLimit.data_start ? 'default' : 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    {savingSchedule ? 'Se salvează...' : '+ ADAUGĂ REGULĂ'}
                  </button>
                </div>

                {/* Lista existenta */}
                {dailyLimits.length > 0 ? (
                  <div>
                    <p style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Reguli active</p>
                    {dailyLimits.map(lim => (
                      <div key={lim.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FFF8F0', borderRadius: '10px', marginBottom: '6px', border: `1px solid ${s.gold}40` }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: s.ruby }}>{lim.max_pe_zi} progr./zi</span>
                          <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>
                            {lim.data_start} {lim.data_end ? `→ ${lim.data_end}` : '→ permanent'}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            await fetch('/api/admin/schedule', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                              body: JSON.stringify({ id: lim.id, type: 'daily_limit' })
                            })
                            setDailyLimits(prev => prev.filter(x => x.id !== lim.id))
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '16px', padding: '4px 8px', borderRadius: '6px', flexShrink: 0 }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#AAA', fontSize: '13px', textAlign: 'center', padding: '12px' }}>Nu există limite setate — programări nelimitate pe zi.</p>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* FAB fix desktop — jos dreapta, doar pe calendar */}
      <div className="admin-fab-desktop" style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 200, flexDirection: 'column', alignItems: 'flex-end', gap: '8px', display: tab === 'calendar' ? 'flex' : 'none' }}>
        {showDesktopFab && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '8px', minWidth: '200px', border: '1px solid #EDE4DC' }}>
            <button onClick={() => { openAddForm(); setShowDesktopFab(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: '#1C1C1C', borderRadius: '10px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7EFE5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: '18px' }}>📅</span> Programare nouă
            </button>
            <button onClick={() => {
              setNewProg({ ...newProg, data: formatDateRO(viewDate), ora: '', serviciu: 'Timp blocat', plata: 'numerar', observatii: '', nume: 'Blocat', telefon: '—' })
              setShowAddForm(true)
              setShowDesktopFab(false)
            }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: '#1C1C1C', borderRadius: '10px', borderTop: '1px solid #F0EAE0' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7EFE5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: '18px' }}>🔒</span> Blochează timp
            </button>
          </div>
        )}
        <button onClick={() => setShowDesktopFab(v => !v)}
          style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #F0DC8A, #C9A84C)', border: 'none', cursor: 'pointer', fontSize: '30px', color: '#1C1C1C', fontWeight: 'bold', boxShadow: '0 6px 24px rgba(201,168,76,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, transform: showDesktopFab ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,168,76,0.7)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,168,76,0.55)'}>
          +
        </button>
      </div>

      {/* Dialog confirmare suprapunere */}
      {overlapWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontFamily: 'Georgia, serif', color: '#9B1B30', fontSize: '18px', fontWeight: 'normal', marginBottom: '12px' }}>Suprapunere programare</h3>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px', whiteSpace: 'pre-line' }}>{overlapWarning.msg}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setOverlapWarning(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #DDD', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#555' }}>
                Anulează
              </button>
              <button onClick={overlapWarning.onConfirm}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #9B1B30, #7A1525)', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
