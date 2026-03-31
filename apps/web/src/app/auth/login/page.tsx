import { login } from '@/app/auth/actions'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="rise-auth-stage">
      {/* Ambient depth orbs */}
      <div
        className="rise-auth-orb"
        style={{
          top: '-120px',
          right: '-80px',
          width: '560px',
          height: '560px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.22), rgba(90,20,200,0.10) 60%, transparent)',
        }}
      />
      <div
        className="rise-auth-orb"
        style={{
          bottom: '-80px',
          left: '-60px',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(60,10,180,0.18), transparent 70%)',
        }}
      />

      {/* Glass form panel */}
      <div className="rise-auth-glass w-full max-w-[600px] px-8 py-9 lg:px-10 lg:py-11">

        {/* Brand mark */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-lg font-black text-white shadow-[0_14px_28px_rgba(124,58,237,0.32)]">
              R
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#a39cb8]">RISE</p>
              <p className="text-base font-black leading-none text-[#1d1830]">GCSE Maths</p>
            </div>
          </div>
          <Link href="/" className="text-xs font-black text-[#9993b4] hover:text-[#6d28d9]">
            ← Back
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a39cb8]">Welcome back</p>
          <h1 className="mt-2 text-[2.6rem] font-black leading-[0.92] text-[#1d1830] lg:text-[3.2rem]">
            Continue your maths journey.
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-[#6f6a84]">
            Sign in to pick up your next lesson and keep the streak alive.
          </p>
        </div>

        {/* Status messages */}
        {searchParams.error && (
          <div className="mb-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">{searchParams.error}</p>
          </div>
        )}
        {searchParams.message && (
          <div className="mb-5 rounded-[1rem] border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm font-semibold text-green-700">{searchParams.message}</p>
          </div>
        )}

        {/* Form */}
        <form action={login} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-[#6b6388]">
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
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-[#6b6388]">
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
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#7b7790]">
          <span>
            New to RISE?{' '}
            <Link href="/auth/signup" className="font-black text-[#6d28d9]">
              Create account
            </Link>
          </span>
          <span className="text-[#ccc6da]">·</span>
          <Link href="/auth/tutor-code" className="font-black text-[#6d28d9]">
            Enter tutor code
          </Link>
        </div>
      </div>
    </div>
  )
}
