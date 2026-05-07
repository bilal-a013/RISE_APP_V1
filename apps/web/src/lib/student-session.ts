import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const STUDENT_SESSION_COOKIE = 'rise_student_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

interface StudentSessionPayload {
  childProfileId: string
  tutorKeyId: string
  issuedAt: number
  expiresAt: number
}

export interface StudentSession {
  childProfileId: string
  tutorKeyId: string
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function getSessionSecret() {
  return (
    process.env.STUDENT_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ''
  )
}

function signPayload(encodedPayload: string) {
  const secret = getSessionSecret()

  if (!secret) {
    throw new Error('A server-side session secret is required for Tutor Key sessions.')
  }

  return createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

function signaturesMatch(receivedSignature: string, expectedSignature: string) {
  const received = Buffer.from(receivedSignature, 'base64url')
  const expected = Buffer.from(expectedSignature, 'base64url')

  return received.length === expected.length && timingSafeEqual(received, expected)
}

export async function setStudentSession(input: {
  childProfileId: string
  tutorKeyId: string
}) {
  const now = Date.now()
  const payload: StudentSessionPayload = {
    childProfileId: input.childProfileId,
    tutorKeyId: input.tutorKeyId,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS * 1000,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(encodedPayload)
  const cookieStore = await cookies()

  cookieStore.set(STUDENT_SESSION_COOKIE, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function clearStudentSession() {
  const cookieStore = await cookies()
  cookieStore.delete(STUDENT_SESSION_COOKIE)
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value

  if (!token) {
    return null
  }

  const [encodedPayload, receivedSignature] = token.split('.')
  if (!encodedPayload || !receivedSignature) {
    return null
  }

  try {
    const expectedSignature = signPayload(encodedPayload)
    if (!signaturesMatch(receivedSignature, expectedSignature)) {
      return null
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<StudentSessionPayload>

    if (
      typeof payload.childProfileId !== 'string' ||
      typeof payload.tutorKeyId !== 'string' ||
      typeof payload.expiresAt !== 'number' ||
      payload.expiresAt <= Date.now()
    ) {
      return null
    }

    return {
      childProfileId: payload.childProfileId,
      tutorKeyId: payload.tutorKeyId,
    }
  } catch (error) {
    console.error('[student session] Failed to read Tutor Key session', error)
    return null
  }
}
