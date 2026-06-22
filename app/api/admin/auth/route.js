import { NextResponse } from 'next/server'
import { generateAdminToken } from '../../../lib/adminAuth'

const ADMIN_EMAIL = 'abroansrl@gmail.com'
const ADMIN_PASSWORD = 'ronaldo01Aa@'

export async function POST(request) {
  const { email, password } = await request.json()

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true, token: generateAdminToken() })
  }

  return NextResponse.json({ error: 'Date incorecte' }, { status: 401 })
}
