import { signup } from '@/app/auth/actions'
import Link from 'next/link'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="rise-page rise-page-wide flex min-h-[78dvh] items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.85fr)]">
        <div className="rise-card flex flex-col justify-between bg-[linear-gradient(180deg,#241a4a_0%,#18142f_100%)] p-8 text-white lg:p-10">
          <div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-2xl font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.35)]">
              R
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Create your account</p>
            <h1 className="mt-3 text-[3rem] font-black leading-[0.95]">Set up a study space that grows with you.</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/72">
              Start with the web app, keep your learning data structured in Supabase, and stay ready for the native mobile app later.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Lessons</p>
              <p className="mt-2 text-sm font-bold">Structured learning blocks with practice and review.</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Difficulty</p>
              <p className="mt-2 text-sm font-bold">Self-assessment adjusts what comes next.</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Continuity</p>
              <p className="mt-2 text-sm font-bold">Tutoring sessions and app study stay connected.</p>
            </div>
          </div>
        </div>

        <div className="rise-card p-7 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a39cb8]">Join RISE</p>
          <h2 className="mt-3 text-[2rem] font-black leading-tight text-[#251b48]">Create account</h2>

          {searchParams.error && (
            <div className="mb-4 mt-6 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">{searchParams.error}</p>
            </div>
          )}

          {searchParams.message && (
            <div className="mb-4 mt-6 rounded-[1.2rem] border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-semibold text-green-700">{searchParams.message}</p>
            </div>
          )}

          <form action={signup} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-700">
                Full Name
              </label>
              <input
                name="full_name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                className="rise-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="rise-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                className="rise-input"
              />
            </div>

            <button type="submit" className="rise-btn-primary mt-2">
              Create account
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-black text-[#7C3AED]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
