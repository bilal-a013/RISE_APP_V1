import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SplashPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  }

  return (
    <div className="rise-splash">
      <div className="rise-splash-inner">
        <div className="mb-10">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-xl font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.35)]">
            R
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/40">RISE</p>
          <h1 className="mt-3 text-[3rem] font-black leading-[0.92] text-white">
            GCSE maths.<br />Sharper.
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-white/55">
            Personalised lessons, smart recommendations, tutor-ready paths.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/auth/signup" className="block">
            <div className="rise-btn-primary text-base">Sign up as a new student</div>
          </Link>

          <Link href="/auth/login" className="block">
            <div className="rise-splash-btn-secondary">Sign in</div>
          </Link>

          <Link href="/auth/tutor-code" className="block">
            <div className="rise-splash-btn-ghost">Enter tutor code</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
