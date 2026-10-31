import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

// Jurnalul de vizite Royal Nails: pixelul Shopify (Customer events) trimite aici
// fiecare eveniment standard. Fara nume/email/telefon - doar un id anonim de vizita.
// Pixelul ruleaza intr-un iframe sandbox (origin "null") si trimite text/plain,
// ca sa nu existe preflight; de aceea CORS e deschis si nu citim raspunsul.
const EVENIMENTE = new Set([
  'page_viewed', 'collection_viewed', 'product_viewed', 'search_submitted',
  'product_added_to_cart', 'product_removed_from_cart', 'cart_viewed',
  'checkout_started', 'checkout_contact_info_submitted', 'checkout_address_info_submitted',
  'checkout_shipping_info_submitted', 'payment_info_submitted', 'checkout_completed',
])

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const txt = (v, n) => (v == null ? null : String(v).slice(0, n))

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers })
}

export async function POST(req) {
  try {
    const raw = await req.text()
    if (raw.length > 4000) return new NextResponse(null, { status: 413, headers })
    const b = JSON.parse(raw || '{}')
    if (!EVENIMENTE.has(b.e)) return new NextResponse(null, { status: 400, headers })

    const sql = neon(process.env.DATABASE_URL)
    await sql`CREATE TABLE IF NOT EXISTS royalnails_evenimente (
      id bigserial PRIMARY KEY,
      creat timestamptz DEFAULT now(),
      vizitator text,
      eveniment text NOT NULL,
      pagina text,
      produs text,
      varianta text,
      cantitate int,
      valoare numeric,
      cautare text,
      sursa text,
      device text
    )`
    await sql`INSERT INTO royalnails_evenimente
      (vizitator, eveniment, pagina, produs, varianta, cantitate, valoare, cautare, sursa, device)
      VALUES (${txt(b.v, 64)}, ${b.e}, ${txt(b.p, 300)}, ${txt(b.pr, 160)}, ${txt(b.va, 160)},
              ${Number.isFinite(+b.q) ? Math.round(+b.q) : null}, ${Number.isFinite(+b.val) ? +b.val : null},
              ${txt(b.s, 160)}, ${txt(b.src, 200)}, ${txt(b.d, 20)})`

    return new NextResponse(null, { status: 204, headers })
  } catch (e) {
    console.error('[royal-evenimente]', e)
    return new NextResponse(null, { status: 500, headers })
  }
}
