import { login } from '@/app/auth/actions'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="rise-page rise-page-wide flex min-h-[78dvh] items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.85fr)]">
        <div className="rise-card flex flex-col justify-between bg-[linear-gradient(180deg,#241a4a_0%,#18142f_100%)] p-8 text-white lg:p-10">
          <div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-2xl font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.35)]">
              R
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Welcome back</p>
            <h1 className="mt-3 text-[3rem] font-black leading-[0.95]">Continue your maths journey.</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/72">
              Pick up the right lesson, keep the streak alive, and jump back into the sharper maths flow.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Current lesson</p>
              <p className="mt-2 text-sm font-bold">Jump straight back into what matters next.</p>
            </div>
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Progress</p>
              <p className="mt-2 text-sm font-bold">Open the full progress view from the dashboard cards.</p>
            </div>
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Two ways in</p>
              <p className="mt-2 text-sm font-bold">New students and tutor-code students now enter through different paths.</p>
            </div>
          </div>
        </div>

        <div className="rise-card p-7 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a39cb8]">Account access</p>
          <h2 className="mt-3 text-[2rem] font-black leading-tight text-[#251b48]">Sign in to RISE</h2>

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

          <form action={login} className="mt-6 space-y-4">
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
                autoComplete="current-password"
                placeholder="••••••••"
                className="rise-input"
              />
            </div>

            <button type="submit" className="rise-btn-primary mt-2">
              Sign in
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Need an account?{' '}
            <Link href="/auth/signup" className="font-black text-[#7C3AED]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
