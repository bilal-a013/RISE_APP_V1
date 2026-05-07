import { createHash } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'

export type TutorKeyValidationResult =
  | {
      ok: true
      tutorKeyId: string
      childProfileId: string
    }
  | {
      ok: false
      reason: 'missing' | 'invalid' | 'inactive' | 'not_connected' | 'supabase_error'
      message: string
    }

export interface TutorKeyChildProfile {
  id: string
  full_name?: string | null
  year_group?: string | null
  age_range?: string | null
  working_level?: string | null
  target_grade?: string | null
  preferred_subject?: string | null
  active?: boolean | null
}

const SCHEMA_MISSING_CODES = new Set(['42P01', '42703', 'PGRST200', 'PGRST204', 'PGRST205'])

export function normaliseTutorKey(key: string) {
  return key.trim().toUpperCase().replace(/\s+/g, '-')
}

export function hashTutorKey(normalisedKey: string) {
  return createHash('sha256').update(normalisedKey).digest('hex')
}

function isSchemaMissingError(error: { code?: string; message?: string }) {
  if (error.code && SCHEMA_MISSING_CODES.has(error.code)) {
    return true
  }

  const message = error.message?.toLowerCase() ?? ''
  return (
    message.includes('tutor_keys') ||
    message.includes('child_profiles') ||
    message.includes('could not find the table') ||
    message.includes('schema cache')
  )
}

async function createTutorKeyLookupClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!serviceRoleKey) {
    return createClient()
  }

  const { supabaseUrl } = getSupabaseEnv('server')

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function hasServiceRoleKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
}

async function validateTutorKeyWithRpc(keyHash: string): Promise<TutorKeyValidationResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('validate_tutor_key_hash', { lookup_key_hash: keyHash })
    .maybeSingle()

  if (error) {
    console.error('[tutor key] validation RPC failed', {
      code: error.code,
      message: error.message,
    })

    if (isSchemaMissingError(error)) {
      return {
        ok: false,
        reason: 'not_connected',
        message:
          'Tutor Key sign-in is nearly ready, but the shared tutor system is not connected yet.',
      }
    }

    return {
      ok: false,
      reason: 'supabase_error',
      message: 'RISE could not check that code right now. Please try again in a moment.',
    }
  }

  const row = data as { tutor_key_id?: string | null; child_profile_id?: string | null } | null

  if (!row?.tutor_key_id || !row.child_profile_id) {
    return {
      ok: false,
      reason: 'invalid',
      message: 'We could not find that code. Check it with your tutor and try again.',
    }
  }

  return {
    ok: true,
    tutorKeyId: row.tutor_key_id,
    childProfileId: row.child_profile_id,
  }
}

export async function validateTutorKey(rawKey: string): Promise<TutorKeyValidationResult> {
  const normalisedKey = normaliseTutorKey(rawKey)

  if (!normalisedKey) {
    return {
      ok: false,
      reason: 'missing',
      message: 'Enter the code your tutor gave you.',
    }
  }

  const keyHash = hashTutorKey(normalisedKey)

  if (!hasServiceRoleKey()) {
    return validateTutorKeyWithRpc(keyHash)
  }

  const supabase = await createTutorKeyLookupClient()

  const { data, error } = await supabase
    .from('tutor_keys')
    .select(`
      id,
      child_profile_id,
      status,
      child_profile:child_profiles(
        id,
        active
      )
    `)
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (error) {
    console.error('[tutor key] validation failed', {
      code: error.code,
      message: error.message,
    })

    if (isSchemaMissingError(error)) {
      return {
        ok: false,
        reason: 'not_connected',
        message:
          'Tutor Key sign-in is nearly ready, but the shared tutor system is not connected yet.',
      }
    }

    return {
      ok: false,
      reason: 'supabase_error',
      message: 'RISE could not check that code right now. Please try again in a moment.',
    }
  }

  if (!data) {
    return {
      ok: false,
      reason: 'invalid',
      message: 'We could not find that code. Check it with your tutor and try again.',
    }
  }

  const childProfile = Array.isArray(data.child_profile)
    ? data.child_profile[0]
    : data.child_profile

  if (data.status !== 'active' || childProfile?.active === false) {
    return {
      ok: false,
      reason: 'inactive',
      message: 'That code is not active. Ask your tutor for the latest code.',
    }
  }

  const childProfileId = data.child_profile_id ?? childProfile?.id

  if (!childProfileId) {
    console.error('[tutor key] valid key is missing child profile reference', {
      tutorKeyId: data.id,
    })

    return {
      ok: false,
      reason: 'supabase_error',
      message: 'That code is not linked to a student profile yet. Ask your tutor to check it.',
    }
  }

  const { error: updateError } = await supabase
    .from('tutor_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  if (updateError) {
    console.error('[tutor key] last_used_at update failed', {
      code: updateError.code,
      message: updateError.message,
    })
  }

  return {
    ok: true,
    tutorKeyId: data.id,
    childProfileId,
  }
}

export async function getChildProfileForStudentSession(input: {
  childProfileId: string
  tutorKeyId: string
}): Promise<TutorKeyChildProfile | null> {
  if (hasServiceRoleKey()) {
    const supabase = await createTutorKeyLookupClient()
    const { data, error } = await supabase
      .from('child_profiles')
      .select('id, full_name, year_group, age_range, working_level, target_grade, preferred_subject, active')
      .eq('id', input.childProfileId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as TutorKeyChildProfile | null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('get_child_profile_for_student_session', {
      lookup_child_profile_id: input.childProfileId,
      lookup_tutor_key_id: input.tutorKeyId,
    })
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as TutorKeyChildProfile | null
}
