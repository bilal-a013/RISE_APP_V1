import { signup } from '@/app/auth/actions'
import Link from 'next/link'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="rise-page flex flex-col justify-center min-h-dvh">
      {/* Logo */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-[#7C3AED]">RISE</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">GCSE Study, Supercharged</p>
      </div>

      <div className="rise-card">
        <h2 className="text-xl font-black text-gray-900 mb-6">Create account</h2>

        {searchParams.error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
            <p className="text-sm font-semibold text-red-700">{searchParams.error}</p>
          </div>
        )}

        {searchParams.message && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-4">
            <p className="text-sm font-semibold text-green-700">{searchParams.message}</p>
          </div>
        )}

        <form action={signup} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wide">
              Full Name
            </label>
            <input
              name="full_name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
            />
          </div>

          <button type="submit" className="rise-btn-primary mt-2">
            Create account
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-black text-[#7C3AED]">
          Sign in
        </Link>
      </p>
    </div>
  )
}
