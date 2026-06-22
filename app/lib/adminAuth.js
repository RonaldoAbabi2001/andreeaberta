import crypto from 'crypto'

// Server-only module — niciun fișier 'use client' nu importă acest fișier,
// deci aceste valori nu ajung niciodată în bundle-ul JS trimis browserului.
const SESSION_SECRET = 'c1cc375cb71a2b9148e0e330cad444f86922e0294e535499591ac49820eed3cb'
const WORKER_TOKEN = '4766928ef24a23aeaf11d17d64a60cc4f43b7320307cad71c741be05244b3de9'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000

export function generateAdminToken() {
  const expires = Date.now() + SESSION_TTL_MS
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(String(expires)).digest('hex')
  return `${expires}.${sig}`
}

function validSessionToken(token) {
  if (!token || !token.includes('.')) return false
  const [expiresStr, sig] = token.split('.')
  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return false
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(expiresStr).digest('hex')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// Acceptă fie un token de sesiune admin (emis la login, expiră în 24h),
// fie token-ul fix de worker (folosit de scripturile de pe Beelink pentru SMS).
export function checkAuth(request) {
  const token = request.headers.get('x-admin-token') || ''
  if (!token) return false
  if (token === WORKER_TOKEN) return true
  return validSessionToken(token)
}

export const WORKER_AUTH_TOKEN = WORKER_TOKEN
