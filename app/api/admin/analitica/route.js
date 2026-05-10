import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'
const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']
const ZILE_RO = ['Dum','Lun','Mar','Mie','Joi','Vin','Sâm']

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

export async function GET(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const [programari, clienti] = await Promise.all([
    sql`SELECT * FROM programari`,
    sql`SELECT * FROM clienti`,
  ])

  const now = new Date()
  const lunaAc = now.getMonth()
  const anAc = now.getFullYear()
  const lunaTr = lunaAc === 0 ? 11 : lunaAc - 1
  const anTr = lunaAc === 0 ? anAc - 1 : anAc

  // filtre
  const active = programari.filter(p => p.status !== 'cancelled')
  const confirmed = programari.filter(p => p.status === 'confirmed')

  function inLuna(p, m, y) {
    const d = parseDateRO(p.data)
    return d && d.getMonth() === m && d.getFullYear() === y
  }

  const progLunaAc = active.filter(p => inLuna(p, lunaAc, anAc))
  const progLunaTr = active.filter(p => inLuna(p, lunaTr, anTr))
  const venLunaAc = confirmed.filter(p => inLuna(p, lunaAc, anAc)).reduce((s,p) => s + (Number(p.pret)||0), 0)
  const venLunaTr = confirmed.filter(p => inLuna(p, lunaTr, anTr)).reduce((s,p) => s + (Number(p.pret)||0), 0)

  // Rata prezentare luna curenta
  const totalLunaAc = programari.filter(p => inLuna(p, lunaAc, anAc))
  const rataPrecentare = totalLunaAc.length
    ? Math.round((totalLunaAc.filter(p => p.status === 'confirmed').length / totalLunaAc.length) * 100)
    : 0

  // Venituri pe ultimele 6 luni
  const venitPeLuni = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(anAc, lunaAc - i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const prog = active.filter(p => inLuna(p, m, y))
    const venit = confirmed.filter(p => inLuna(p, m, y)).reduce((s,p) => s + (Number(p.pret)||0), 0)
    venitPeLuni.push({ luna: LUNI[m].slice(0,3) + ' ' + y, venit, programari: prog.length })
  }

  // Top servicii
  const serviciiMap = {}
  active.forEach(p => {
    if (!p.serviciu) return
    if (!serviciiMap[p.serviciu]) serviciiMap[p.serviciu] = { count: 0, venit: 0 }
    serviciiMap[p.serviciu].count++
    if (p.status === 'confirmed') serviciiMap[p.serviciu].venit += Number(p.pret) || 0
  })
  const serviciiTop = Object.entries(serviciiMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 7)

  // Ore de vârf (0-23)
  const oreVarf = {}
  for (let h = 7; h <= 20; h++) oreVarf[String(h).padStart(2,'0')] = 0
  active.forEach(p => {
    if (!p.ora) return
    const h = p.ora.split(':')[0]
    if (oreVarf[h] !== undefined) oreVarf[h]++
  })

  // Zile de vârf (0=Dum..6=Sâm)
  const zileVarf = {}
  ZILE_RO.forEach(z => { zileVarf[z] = 0 })
  active.forEach(p => {
    const d = parseDateRO(p.data)
    if (d) zileVarf[ZILE_RO[d.getDay()]]++
  })

  // Clienti noi vs reveniti luna curenta
  const telefoaneLunaAc = new Set(progLunaAc.map(p => p.telefon))
  const telefoaneLunaTr = new Set(active.filter(p => inLuna(p, lunaTr, anTr)).map(p => p.telefon))
  let clientiNoi = 0, clientiReveniti = 0
  telefoaneLunaAc.forEach(tel => {
    const primaData = programari
      .filter(p => p.telefon === tel)
      .map(p => parseDateRO(p.data))
      .filter(Boolean)
      .sort((a,b) => a-b)[0]
    if (primaData && primaData.getMonth() === lunaAc && primaData.getFullYear() === anAc) clientiNoi++
    else clientiReveniti++
  })

  // Valoare medie programare
  const valoreMedie = confirmed.length
    ? Math.round(confirmed.reduce((s,p) => s + (Number(p.pret)||0), 0) / confirmed.length)
    : 0

  // Sursa clienti
  const sursaMap = {}
  clienti.forEach(c => {
    const sursa = (c.sursa || '').trim().toUpperCase() || 'NECUNOSCUT'
    sursaMap[sursa] = (sursaMap[sursa] || 0) + 1
  })
  const sursaClienti = Object.entries(sursaMap)
    .sort((a, b) => b[1] - a[1])
    .map(([sursa, count]) => ({ sursa, count }))

  // Oras clienti
  const orasMap = {}
  clienti.forEach(c => {
    const oras = (c.oras || '').trim().toUpperCase() || 'NECUNOSCUT'
    orasMap[oras] = (orasMap[oras] || 0) + 1
  })
  const orasClienti = Object.entries(orasMap)
    .sort((a, b) => b[1] - a[1])
    .map(([oras, count]) => ({ oras, count }))

  // Tip client
  const tipMap = {}
  clienti.forEach(c => {
    const tip = (c.tip_client || '').trim().toLowerCase() || 'necunoscut'
    const label = tip === 'fidela' ? 'Fidelă' : tip === 'modela' ? 'Modelă' : tip === 'ocazionala' ? 'Ocazională' : tip === 'prima vizita' ? 'Prima vizită' : 'Necunoscut'
    tipMap[label] = (tipMap[label] || 0) + 1
  })
  const tipClienti = Object.entries(tipMap)
    .sort((a, b) => b[1] - a[1])
    .map(([tip, count]) => ({ tip, count }))

  return NextResponse.json({
    kpi: {
      venLunaAc, venLunaTr,
      progLunaAc: progLunaAc.length, progLunaTr: progLunaTr.length,
      rataPrecentare, clientiNoi, clientiReveniti,
      totalClienti: clienti.length, valoreMedie,
      totalVenituri: confirmed.reduce((s,p) => s + (Number(p.pret)||0), 0),
    },
    venitPeLuni,
    serviciiTop,
    oreVarf,
    zileVarf,
    sursaClienti,
    orasClienti,
    tipClienti,
  })
}
