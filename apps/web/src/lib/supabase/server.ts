import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from './env'

export async function createClient() {
  const cookieStore = await cookies()
  type CookieSetOptions = Parameters<typeof cookieStore.set>[2]
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv('server')

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieSetOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore — called from a Server Component; middleware handles session refresh
          }
        },
      },
    }
  )
}
