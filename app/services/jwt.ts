import { createHmac } from 'node:crypto'

const SECRET = process.env.JWT_SECRET ?? '12345678'

interface JwtPayload {
  id: number
  iat: number
}

function base64url(data: string): string {
  return Buffer.from(data).toString('base64url')
}

export function signJwt(payload: { id: number }): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }))
  const signature = createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64url')
  return `${header}.${body}.${signature}`
}

export function verifyJwt(token: string): JwtPayload {
  const [header, body, signature] = token.split('.')
  const expected = createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64url')

  if (signature !== expected) {
    throw new Error('Invalid token signature')
  }

  return JSON.parse(Buffer.from(body!, 'base64url').toString())
}
