import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let sessionUser: unknown = null

  try {
    const supabase = await createClient()
    const result = await supabase.auth.getUser()

    if (result.error) {
      console.error('[app layout] Failed to read Supabase session', result.error)
      throw result.error
    }

    sessionUser = result.data.user
  } catch (error) {
    console.error('[app layout] Unexpected app shell failure', error)
    redirect('/auth/login?error=We could not load RISE. Please try signing in again.')
  }

  if (!sessionUser) {
    redirect('/auth/login?message=Please sign in to continue.')
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
