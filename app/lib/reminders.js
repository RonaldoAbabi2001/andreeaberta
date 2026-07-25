// Helper partajat pentru remindere SMS — sursă unică de adevăr pentru text + timing.
// Folosit de /api/programare (booking public) și /api/admin/programari (booking admin).
// Setările se citesc din salon_settings (cheia 'reminder_settings'); dacă lipsesc,
// se folosesc DEFAULT_REMINDERS, identice cu comportamentul hardcodat anterior (zero regresie).

export const REMINDER_TYPES = ['confirmare', 'reminder_24h', 'feedback', 'recontact']

// Placeholdere disponibile în textul mesajelor
export const PLACEHOLDERS = ['{nume}', '{data}', '{ora}', '{serviciu}']

// unit: 'imediat' | 'ore_inainte' | 'zile_dupa'
export const DEFAULT_REMINDERS = {
  confirmare: {
    activ: true,
    unit: 'imediat',
    offset: 0,
    text: 'Buna ziua {nume}! Programarea ta la EVOLIS a fost confirmata pentru {data} ora {ora}. Serviciu: {serviciu}. Te asteptam! 💅',
  },
  reminder_24h: {
    activ: true,
    unit: 'ore_inainte',
    offset: 24,
    text: 'Reminder EVOLIS: maine la {ora} ai programare pentru {serviciu}. Ne vedem! 💅',
  },
  feedback: {
    activ: true,
    unit: 'zile_dupa',
    offset: 3,
    text: 'Buna {nume}! Cum iti sunt unghiile dupa vizita de {data}? Orice intrebare ne poti contacta. Multumim ca esti clienta noastra! 🌟',
  },
  recontact: {
    activ: true,
    unit: 'zile_dupa',
    offset: 14,
    text: 'Buna {nume}! A trecut cam 2 saptamani de la ultima vizita. Vrei sa-ti faci o noua programare? andreeaberta.com 💅',
  },
}

// Etichete lizibile pentru UI
export const REMINDER_LABELS = {
  confirmare: 'Confirmare (imediat)',
  reminder_24h: 'Reminder (înainte de programare)',
  feedback: 'Feedback (după vizită)',
  recontact: 'Recontact (după vizită)',
}

function fillDefaults(saved) {
  // Îmbină setările salvate peste default-uri, ca un tip nou/lipsă să aibă mereu valori valide.
  const out = {}
  for (const t of REMINDER_TYPES) {
    const d = DEFAULT_REMINDERS[t]
    const s = (saved && saved[t]) || {}
    out[t] = {
      activ: typeof s.activ === 'boolean' ? s.activ : d.activ,
      unit: s.unit || d.unit,
      offset: Number.isFinite(Number(s.offset)) ? Number(s.offset) : d.offset,
      text: typeof s.text === 'string' && s.text.trim() ? s.text : d.text,
    }
  }
  return out
}

// Citește setările de reminder din salon_settings; întoarce DEFAULT dacă nu există.
export async function getReminderSettings(sql) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS salon_settings (
        cheie TEXT PRIMARY KEY, valoare TEXT, actualizat TIMESTAMPTZ DEFAULT NOW()
      )`
    const rows = await sql`SELECT valoare FROM salon_settings WHERE cheie = 'reminder_settings' LIMIT 1`
    if (rows.length && rows[0].valoare) {
      return fillDefaults(JSON.parse(rows[0].valoare))
    }
  } catch {}
  return fillDefaults(null)
}

function applyPlaceholders(text, { nume, data, ora, serviciu }) {
  return String(text)
    .replaceAll('{nume}', nume || 'client')
    .replaceAll('{data}', data || '')
    .replaceAll('{ora}', ora || '')
    .replaceAll('{serviciu}', serviciu || '')
}

const LUNI_RO = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']

// Parsează data programării în {an, luna(1-12), zi}. Acceptă AMBELE formate:
// - RO "30 August 2026" (folosit de booking public ȘI admin)
// - ISO "2026-08-30" (fallback)
function parseData(dataF) {
  if (!dataF) return null
  const s = String(dataF).trim()
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return { an: +iso[1], luna: +iso[2], zi: +iso[3] }
  const parts = s.split(/\s+/)
  if (parts.length === 3) {
    const zi = parseInt(parts[0], 10)
    const luna = LUNI_RO.indexOf(parts[1]) + 1
    const an = parseInt(parts[2], 10)
    if (zi && luna && an) return { an, luna, zi }
  }
  return null
}

// Calculează momentul de trimitere pentru un tip. Întoarce Date sau null (dacă e în trecut/invalid).
function computeSendAt(cfg, { dataF, oraF }, now) {
  const parsed = parseData(dataF)
  if (!parsed) return null
  const { an, luna, zi } = parsed

  if (cfg.unit === 'imediat') {
    // Doar dacă programarea e în viitor (păstrează logica anterioară pentru confirmare)
    if (oraF) {
      const [h, m] = oraF.split(':').map(Number)
      const apt = new Date(an, luna - 1, zi, h || 0, m || 0)
      return apt > now ? now : null
    }
    return now
  }

  if (cfg.unit === 'ore_inainte') {
    if (!oraF) return null
    const [h, m] = oraF.split(':').map(Number)
    const apt = new Date(an, luna - 1, zi, h || 0, m || 0)
    const when = new Date(apt.getTime() - (cfg.offset || 0) * 60 * 60 * 1000)
    return when > now ? when : null
  }

  if (cfg.unit === 'zile_dupa') {
    // La ora 10:00, ca în comportamentul anterior
    const when = new Date(an, luna - 1, zi + (cfg.offset || 0), 10, 0)
    return when > now ? when : null
  }

  return null
}

// Inserează în sms_queue toate reminderele active pentru o programare.
// params: { programareId, telefon, numeClient, dataF (YYYY-MM-DD), oraF (HH:MM), serviciu }
export async function enqueueReminders(sql, params) {
  const { programareId, telefon, numeClient, dataF, oraF, serviciu } = params
  if (!telefon) return { inserted: 0 }

  const settings = await getReminderSettings(sql)
  const now = new Date()
  const base = Date.now()
  let i = 0
  let inserted = 0

  for (const tip of REMINDER_TYPES) {
    const cfg = settings[tip]
    if (!cfg || !cfg.activ) continue

    const when = computeSendAt(cfg, { dataF, oraF }, now)
    if (!when) continue

    const mesaj = applyPlaceholders(cfg.text, {
      nume: numeClient, data: dataF, ora: oraF, serviciu,
    })
    const id = base + i
    i++

    await sql`
      INSERT INTO sms_queue (id, telefon, mesaj, tip, programare_id, de_trimis_la)
      VALUES (${id}, ${telefon}, ${mesaj}, ${tip}, ${programareId || null}, ${when.toISOString()})
    `
    inserted++
  }

  return { inserted }
}
