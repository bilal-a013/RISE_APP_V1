type SupabaseEnvContext = 'server' | 'client' | 'middleware'

function validateSupabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl)

  if (!url.protocol.startsWith('http')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must use http or https.')
  }

  if (!url.hostname.includes('supabase.co')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must point at a Supabase project URL.')
  }

  return url
}

export function getSupabaseEnv(context: SupabaseEnvContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl) {
    throw new Error(`[${context}] NEXT_PUBLIC_SUPABASE_URL is missing.`)
  }

  if (!supabaseAnonKey) {
    throw new Error(`[${context}] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.`)
  }

  validateSupabaseUrl(supabaseUrl)

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}
