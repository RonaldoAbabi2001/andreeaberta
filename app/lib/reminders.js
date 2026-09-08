// Helper partajat pentru remindere SMS — sursă unică de adevăr pentru text + timing.
// Folosit de /api/programare (booking public) și /api/admin/programari (booking admin).
// Setările se citesc din salon_settings (cheia 'reminder_settings'); dacă lipsesc,
// se folosesc DEFAULT_REMINDERS, identice cu comportamentul hardcodat anterior (zero regresie).

export const REMINDER_TYPES = ['confirmare', 'modificare', 'reminder_24h', 'feedback', 'recontact']

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
  // Se trimite DOAR cand data sau ora unei programari se schimba din admin.
  // Fara el, clienta ramane cu ora veche in telefon.
  modificare: {
    activ: true,
    unit: 'imediat',
    offset: 0,
    text: 'Buna {nume}! Programarea ta la EVOLIS MANI s-a mutat pe {data}, ora {ora}. Daca nu iti convine, scrie-ne. Te asteptam!💅🏼',
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
  modificare: 'Programare mutata (la schimbarea datei/orei)',
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
// Un telefon e valid doar daca are cifre reale (min 9). Asa excludem
// intrarile de tip "Timp blocat", care au telefon "—" sau gol.
function telefonValid(t) {
  if (!t) return false
  const cifre = String(t).replace(/\D/g, '')
  return cifre.length >= 9
}

// Sterge din coada SMS-urile NETRIMISE ale unei programari.
// Se apeleaza cand programarea se modifica, se anuleaza sau se sterge —
// altfel pleaca mesaje cu ora veche sau catre cliente care au anulat.
export async function stergeRemindere(sql, programareId) {
  if (!programareId) return { deleted: 0 }
  const r = await sql`
    DELETE FROM sms_queue
    WHERE programare_id = ${programareId} AND trimis = false
    RETURNING id
  `
  return { deleted: r.length }
}

// Resincronizeaza reminderele dupa o modificare de programare:
// sterge ce nu a plecat inca, apoi pune la loc cu datele NOI.
// Tipurile care AU FOST DEJA TRIMISE nu se recreeaza — altfel clienta ar primi
// inca o confirmare la fiecare editare (confirmarea pleaca "imediat").
export async function resyncReminders(sql, params) {
  if (!params.programareId) return { inserted: 0 }
  await stergeRemindere(sql, params.programareId)
  return enqueueReminders(sql, params)
}

export async function enqueueReminders(sql, params) {
  const { programareId, telefon, numeClient, dataF, oraF, serviciu } = params
  // 'modificare' NU face parte din fluxul normal: pleaca doar cand data/ora s-au schimbat.
  const notificaModificare = params.notificaModificare === true

  // FIX 1: nu trimite SMS pentru timp blocat / intrari fara telefon real
  if (!telefonValid(telefon)) return { inserted: 0, skipped: 'telefon invalid' }
  if (serviciu === 'Timp blocat' || numeClient === 'Blocat') {
    return { inserted: 0, skipped: 'timp blocat' }
  }

  const settings = await getReminderSettings(sql)
  const now = new Date()
  const base = Date.now()
  let i = 0
  let inserted = 0
  let skipped = 0

  for (const tip of REMINDER_TYPES) {
    const cfg = settings[tip]
    if (!cfg || !cfg.activ) continue
    if (tip === 'modificare' && !notificaModificare) continue

    const when = computeSendAt(cfg, { dataF, oraF }, now)
    if (!when) continue

    // FIX 3: confirmarea pleaca O SINGURA DATA pe programare.
    // Fara asta, fiecare modificare din admin ar trimite clientei inca o confirmare.
    // (mesajul de mutare, in schimb, se poate repeta — se muta de mai multe ori)
    if (tip === 'confirmare' && programareId) {
      const dejaTrimis = await sql`
        SELECT 1 FROM sms_queue
        WHERE programare_id = ${programareId} AND tip = ${tip} AND trimis = true
        LIMIT 1
      `
      if (dejaTrimis.length > 0) { skipped++; continue }
    }

    // FIX 2: daca acelasi client are deja un SMS de acelasi tip programat
    // in ACEEASI ZI, nu mai adaugam unul. Altfel, un client cu 2 programari
    // in aceeasi zi primea totul de doua ori.
    const existent = tip === 'modificare' ? [] : await sql`
      SELECT 1 FROM sms_queue
      WHERE telefon = ${telefon}
        AND tip = ${tip}
        AND DATE(de_trimis_la) = DATE(${when.toISOString()}::timestamptz)
        AND programare_id IS DISTINCT FROM ${programareId || null}
      LIMIT 1
    `
    if (existent.length > 0) { skipped++; continue }

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

  return { inserted, skipped }
}
