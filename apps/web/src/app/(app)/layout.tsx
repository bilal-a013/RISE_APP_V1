import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isMissingSupabaseAuthSession } from '@/lib/supabase/auth-errors'
import { getStudentSession } from '@/lib/student-session'
import BottomNav from '@/components/layout/BottomNav'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let sessionUser: unknown = null
  let studentSession = null

  try {
    const [studentSessionResult, supabase] = await Promise.all([
      getStudentSession(),
      createClient(),
    ])
    studentSession = studentSessionResult
    const result = await supabase.auth.getUser()

    if (result.error && !isMissingSupabaseAuthSession(result.error)) {
      console.error('[app layout] Failed to read Supabase session', result.error)
    }

    sessionUser = result.data.user ?? null
  } catch (error) {
    console.error('[app layout] Unexpected app shell failure', error)
    redirect('/?error=We could not load RISE. Please try again.')
  }

  if (!sessionUser && !studentSession) {
    redirect('/?message=Enter your tutor code to continue.')
  }

  return (
    <div className="rise-app-shell">
      <div className="rise-phone lg:grid lg:grid-cols-[200px_minmax(0,1fr)]">
        <BottomNav />
        <div className="rise-shell-panel">
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
