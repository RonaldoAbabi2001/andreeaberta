export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { checkAuth } from '../../../lib/adminAuth'
import { parseData } from '../../../lib/reminders'
import { sendTelegram } from '../../programare/route'

// Alerta zilnica pe Telegram: programarile viitoare care cer avans si nu l-au achitat.
// Ruleaza din Vercel Cron (vercel.json). Clientele care au achitat (bifa din admin)
// nu apar aici si nu mai primesc SMS de avans.

// Data de azi in Romania (serverul Vercel ruleaza in UTC)
function aziRO() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date()).split('-').map(Number)
  return Date.UTC(p[0], p[1] - 1, p[2])
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function autorizat(request) {
  if (checkAuth(request)) return true
  const secret = process.env.CRON_SECRET
  if (secret) return request.headers.get('authorization') === `Bearer ${secret}`
  // Fara CRON_SECRET setat: acceptam doar apelul Vercel Cron.
  // Chiar daca cineva il imita, mesajul pleaca o singura data pe zi (vezi mai jos).
  return (request.headers.get('user-agent') || '').includes('vercel-cron')
}

export async function GET(request) {
  if (!autorizat(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: 'no-store' } })
  const fortat = new URL(request.url).searchParams.get('force') === '1' && checkAuth(request)

  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS avans_necesar BOOLEAN DEFAULT FALSE`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS avans_achitat BOOLEAN DEFAULT FALSE`
  await sql`CREATE TABLE IF NOT EXISTS salon_settings (
    cheie TEXT PRIMARY KEY, valoare TEXT, actualizat TIMESTAMPTZ DEFAULT NOW()
  )`

  const azi = aziRO()
  const aziKey = new Date(azi).toISOString().slice(0, 10)

  // O singura alerta pe zi
  if (!fortat) {
    const [ult] = await sql`SELECT valoare FROM salon_settings WHERE cheie = 'avans_alerta_ultima' LIMIT 1`
    if (ult?.valoare === aziKey) return NextResponse.json({ ok: true, skipped: 'deja trimisa azi' })
  }

  const rows = await sql`
    SELECT id, nume, telefon, serviciu, pret, data, ora, status
    FROM programari
    WHERE avans_necesar = true AND COALESCE(avans_achitat, false) = false
      AND COALESCE(status, '') NOT IN ('cancelled', 'noshow')
  `

  const restante = rows
    .map(p => {
      const d = parseData(p.data)
      if (!d) return null
      const zile = Math.round((Date.UTC(d.an, d.luna - 1, d.zi) - azi) / 86400000)
      return zile >= 0 ? { ...p, zile } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.zile - b.zile || String(a.ora).localeCompare(String(b.ora)))

  if (restante.length > 0) {
    const linii = restante.map(p => {
      const cand = p.zile === 0 ? '🔴 AZI' : p.zile === 1 ? '🟠 mâine' : `în ${p.zile} zile`
      const avans = Math.ceil((Number(p.pret) || 0) / 2)
      return `• <b>${esc(p.nume)}</b> · ${esc(p.telefon)}\n   ${esc(p.data)} ${esc(p.ora)} (${cand}) · ${esc(p.serviciu)} · avans ${avans} lei`
    })
    await sendTelegram(
      `💰 <b>Avans neachitat: ${restante.length} ${restante.length === 1 ? 'programare' : 'programări'}</b>\n\n` +
      linii.join('\n\n') +
      `\n\nCând primești avansul: admin → programarea → „Avans achitat”.`
    )
  }

  await sql`
    INSERT INTO salon_settings (cheie, valoare, actualizat) VALUES ('avans_alerta_ultima', ${aziKey}, NOW())
    ON CONFLICT (cheie) DO UPDATE SET valoare = EXCLUDED.valoare, actualizat = NOW()
  `
  return NextResponse.json({ ok: true, restante: restante.length })
}
