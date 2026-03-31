import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="rise-app-shell">
      <div className="rise-phone lg:grid lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-2">
        <BottomNav />
        <div className="rise-shell-panel">
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
