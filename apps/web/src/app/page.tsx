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

          {/* Brand mark */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-btn"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              R
            </div>
            <div>
              <p className="rise-overline">RISE</p>
              <p className="mt-1 text-base font-semibold text-secondary-900">Maths studio</p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-secondary-900">
            Choose how you enter{' '}
            <span className="rise-gradient-text">RISE</span>.
          </h1>

          <p className="mt-3 text-sm text-secondary-400 leading-relaxed">
            Start fresh as a new student, sign in to continue, or use a tutor code to unlock a pre-shaped maths path.
          </p>

          <div className="mt-8 space-y-3">
            <Link href="/auth/signup" className="block">
              <div className="rise-btn-primary text-base">Sign up as a new student</div>
            </Link>

            <Link href="/auth/login" className="block">
              <div className="rise-splash-btn-secondary text-base">Sign in</div>
            </Link>
          </div>

          {/* Tutor code section */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-primary-200/40" />
              <span className="rise-overline text-[10px]">or enter tutor code</span>
              <div className="flex-1 h-px bg-primary-200/40" />
            </div>

            <form action="/auth/tutor-code" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
              <input
                name="code"
                placeholder="e.g. RAYAN-SIMS"
                autoCapitalize="characters"
                autoCorrect="off"
                className="rise-input"
              />
              <button
                type="submit"
                className="rise-btn-outline w-full justify-center rounded-xl px-5 py-3 text-sm font-semibold"
              >
                Continue
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
