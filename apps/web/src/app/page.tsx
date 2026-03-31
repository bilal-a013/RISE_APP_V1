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
        <div className="rise-splash-card">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-xl font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.35)]">
              R
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/40">RISE</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-white/55">Maths studio</p>
            </div>
          </div>

          <h1 className="max-w-lg text-[2.9rem] font-black leading-[0.92] text-white">
            Choose how the student enters RISE.
          </h1>

          <div className="mt-8 space-y-3">
            <Link href="/auth/signup" className="block">
              <div className="rise-btn-primary text-base">Sign up as a new user</div>
            </Link>

            <Link href="/auth/login" className="block">
              <div className="rise-splash-btn-secondary text-base">Sign in</div>
            </Link>
          </div>

          <form action="/auth/tutor-code" className="mt-6">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
              Enter tutor code
            </label>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px]">
              <input
                name="code"
                placeholder="Tutor code"
                autoCapitalize="characters"
                autoCorrect="off"
                className="rise-input border-white/10 bg-white/92"
              />
              <button type="submit" className="rise-splash-btn-secondary bg-white/10 text-base">
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
