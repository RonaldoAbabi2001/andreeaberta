'use client'
import { useEffect, useState } from 'react'
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

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState('calendar')
  const [programari, setProgramari] = useState([])
  const [clienti, setClienti] = useState([])
  const [viewDate, setViewDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('day')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [csvText, setCsvText] = useState('')
  const [importStatus, setImportStatus] = useState(null)
  const [token, setToken] = useState(null)

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

  async function addProgramare(e) {
    e.preventDefault()
    const serv = SERVICII.find(s => s.name === newProg.serviciu)
    await fetch('/api/admin/programari', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...newProg, pret: serv?.pret || 0, durata: serv?.durata || 0 })
    })
    setShowAddForm(false)
    setNewProg({ nume: '', telefon: '', serviciu: '', data: '', ora: '', plata: 'numerar', observatii: '' })
    fetchProgramari()
  }

  async function updateStatus(id, status) {
    await fetch('/api/admin/programari', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ id, status })
    })
    fetchProgramari()
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

  // Calendar helpers
  const dateStr = (d) => `${d.getDate()} ${LUNI[d.getMonth()]} ${d.getFullYear()}`
  const progAzi = programari.filter(p => p.data === dateStr(viewDate))

  const hours = Array.from({ length: 19 }, (_, i) => i + 7)

  const filteredClienti = clienti.filter(c =>
    c.nume?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.telefon?.includes(clientSearch)
  )

  const clientProgramari = (telefon) => programari.filter(p => p.telefon === telefon)

  if (!token) return null

  const s = {
    ruby: '#9B1B30', gold: '#C9A84C', nude: '#F7EFE5', white: '#fff', text: '#1C1C1C'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>

      {/* Sidebar */}
      <div style={{ width: '220px', background: `linear-gradient(180deg, ${s.ruby} 0%, #6A1020 100%)`, color: 'white', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <p style={{ fontSize: '16px', letterSpacing: '3px', fontWeight: 'bold' }}>EVOLIS</p>
          <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>Admin Panel</p>
        </div>

        {[
          { id: 'calendar', label: '📅 Calendar' },
          { id: 'clienti', label: '👤 Clienți' },
          { id: 'rapoarte', label: '📊 Rapoarte' },
          { id: 'import', label: '📥 Import CSV' },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '14px 20px', background: tab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
              border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer',
              borderLeft: tab === item.id ? `3px solid ${s.gold}` : '3px solid transparent',
            }}>{item.label}</button>
        ))}

        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button onClick={() => { localStorage.removeItem('admin_token'); router.push('/admin/login') }}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', width: '100%' }}>
            Deconectare
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, background: '#F8F4F0', overflow: 'auto' }}>

        {/* CALENDAR TAB */}
        {tab === 'calendar' && (
          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d) }}
                  style={{ background: 'white', border: '1px solid #DDD', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
                <h2 style={{ fontSize: '20px', fontWeight: 'normal', margin: 0 }}>
                  {ZILE[viewDate.getDay()]}, {dateStr(viewDate)}
                </h2>
                <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d) }}
                  style={{ background: 'white', border: '1px solid #DDD', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '16px' }}>›</button>
                <button onClick={() => setViewDate(new Date())}
                  style={{ background: s.nude, border: `1px solid ${s.gold}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: s.ruby }}>Azi</button>
              </div>
              <button onClick={() => setShowAddForm(true)}
                style={{ background: s.ruby, color: 'white', border: 'none', borderRadius: '50px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                + Adaugă programare
              </button>
            </div>

            {/* Calendar grid */}
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              {hours.map(h => {
                const hStr = String(h).padStart(2, '0') + ':00'
                const prog = progAzi.filter(p => p.ora && timeToMin(p.ora) >= h * 60 && timeToMin(p.ora) < (h + 1) * 60)
                const isPauza = h === 12
                return (
                  <div key={h} style={{
                    display: 'flex', borderBottom: '1px solid #F0EAE0',
                    background: isPauza ? '#FFF8F0' : 'white', minHeight: '60px'
                  }}>
                    <div style={{ width: '70px', padding: '12px 16px', color: '#999', fontSize: '13px', borderRight: '1px solid #F0EAE0', flexShrink: 0 }}>{hStr}</div>
                    <div style={{ flex: 1, padding: '4px 8px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      {isPauza && <span style={{ color: '#C9A84C', fontSize: '12px', padding: '8px 0', opacity: 0.7 }}>Pauză prânz</span>}
                      {prog.map(p => (
                        <div key={p.id} style={{
                          background: STATUS_COLORS[p.status] + '22',
                          border: `2px solid ${STATUS_COLORS[p.status]}`,
                          borderRadius: '10px', padding: '8px 12px', minWidth: '180px'
                        }}>
                          <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>{p.nume}</p>
                          <p style={{ fontSize: '12px', color: '#666' }}>{p.serviciu} · {p.durata}min</p>
                          <p style={{ fontSize: '12px', color: '#666' }}>{p.telefon}</p>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                            {['confirmed', 'cancelled', 'noshow'].map(st => (
                              <button key={st} onClick={() => updateStatus(p.id, st)}
                                style={{
                                  padding: '2px 8px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                  background: p.status === st ? STATUS_COLORS[st] : '#EEE',
                                  color: p.status === st ? 'white' : '#666', fontSize: '10px'
                                }}>
                                {st === 'confirmed' ? '✓' : st === 'cancelled' ? '✗' : '—'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
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
              {filteredClienti.map(c => (
                <div key={c.id} style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                  onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{c.nume}</p>
                      <p style={{ color: '#666', fontSize: '14px' }}>{c.telefon} {c.email && `· ${c.email}`}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <a href={`https://wa.me/${c.telefon?.replace(/[^0-9]/g, '')}`} target="_blank"
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#25D366', color: 'white', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>
                        WhatsApp
                      </a>
                      <span style={{ color: '#999', fontSize: '20px' }}>{selectedClient?.id === c.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {selectedClient?.id === c.id && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #F0EAE0', paddingTop: '16px' }}>
                      <p style={{ color: s.ruby, fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>Istoric programări</p>
                      {clientProgramari(c.telefon).length === 0
                        ? <p style={{ color: '#999', fontSize: '13px' }}>Nicio programare înregistrată.</p>
                        : clientProgramari(c.telefon).map(p => (
                          <div key={p.id} style={{ background: s.nude, borderRadius: '10px', padding: '10px 14px', marginBottom: '8px' }}>
                            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{p.serviciu}</p>
                            <p style={{ fontSize: '13px', color: '#666' }}>{p.data} · {p.ora} · {p.pret} lei</p>
                            <span style={{ fontSize: '11px', background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status], padding: '2px 8px', borderRadius: '20px' }}>{p.status}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
              rows={12}
              className="input-field"
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
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', marginBottom: '24px' }}>Adaugă programare</h3>
            <form onSubmit={addProgramare}>
              {[
                { label: 'Nume client *', key: 'nume', type: 'text', required: true },
                { label: 'Telefon *', key: 'telefon', type: 'tel', required: true },
                { label: 'Data *', key: 'data', type: 'text', required: true, placeholder: 'ex: 10 Mai 2026' },
                { label: 'Ora *', key: 'ora', type: 'time', required: true },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>{f.label}</label>
                  <input type={f.type} required={f.required} placeholder={f.placeholder}
                    value={newProg[f.key]} onChange={e => setNewProg({ ...newProg, [f.key]: e.target.value })}
                    className="input-field" />
                </div>
              ))}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Serviciu *</label>
                <select required value={newProg.serviciu} onChange={e => setNewProg({ ...newProg, serviciu: e.target.value })} className="input-field">
                  <option value="">Alege serviciul</option>
                  {SERVICII.map(s => <option key={s.name} value={s.name}>{s.name} — {s.pret} lei</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', color: '#555' }}>Plată</label>
                <select value={newProg.plata} onChange={e => setNewProg({ ...newProg, plata: e.target.value })} className="input-field">
                  <option value="numerar">Numerar</option>
                  <option value="transfer">Transfer bancar</option>
                </select>
              </div>

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
