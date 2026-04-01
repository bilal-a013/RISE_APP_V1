import { login } from '@/app/auth/actions'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="rise-auth-stage">
      {/* Decorative background orbs */}
      <div
        className="rise-auth-orb"
        style={{
          top: '-80px',
          right: '-80px',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)',
        }}
      />
      <div
        className="rise-auth-orb"
        style={{
          bottom: '-60px',
          left: '-60px',
          width: '360px',
          height: '360px',
          background: 'radial-gradient(circle, rgba(200,176,255,0.18), transparent 70%)',
        }}
      />

      {/* Glass form panel */}
      <div className="rise-auth-glass w-full max-w-[540px]">

        {/* Brand mark */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-btn"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              R
            </div>
            <div>
              <p className="rise-overline text-[10px]">RISE</p>
              <p className="text-base font-semibold leading-none text-secondary-900">GCSE Maths</p>
            </div>
          </div>
          <Link href="/" className="text-xs font-medium text-secondary-400 hover:text-primary-600 transition-colors">
            ← Back
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <p className="rise-overline mb-2">Welcome back</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-secondary-900 lg:text-5xl">
            Continue your{' '}
            <span className="rise-gradient-text">maths journey</span>.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-secondary-400">
            Sign in to pick up your next lesson and keep the streak alive.
          </p>
        </div>

        {/* Status messages */}
        {searchParams.error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{searchParams.error}</p>
          </div>
        )}
        {searchParams.message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50/80 px-4 py-3">
            <p className="text-sm font-medium text-green-700">{searchParams.message}</p>
          </div>
        )}

        {/* Form */}
        <form action={login} className="space-y-4">
          <div>
            <label className="mb-1.5 block rise-overline text-[10px]">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="rise-input py-3.5"
            />
          </div>

          <div>
            <label className="mb-1.5 block rise-overline text-[10px]">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="rise-input py-3.5"
            />
          </div>

          <button type="submit" className="rise-btn-primary mt-2 py-4 text-base">
            Sign in
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary-400">
          <span>
            New to RISE?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Create account
            </Link>
          </span>
          <span className="text-primary-200">·</span>
          <Link href="/auth/tutor-code" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Enter tutor code
          </Link>
        </div>
      </div>
    </div>
  )
}
