import Link from 'next/link'
import { enterTutorKey } from '@/app/auth/actions'
import { normaliseTutorKey } from '@/lib/tutor-key'

interface TutorCodePageProps {
  searchParams: {
    code?: string
    error?: string
  }
}

export default function TutorCodePage({ searchParams }: TutorCodePageProps) {
  const rawCode = typeof searchParams.code === 'string' ? searchParams.code : ''
  const normalisedCode = rawCode ? normaliseTutorKey(rawCode) : ''
  const error = typeof searchParams.error === 'string' ? searchParams.error : ''

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
      <div className="rise-auth-glass w-full max-w-[560px]">

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
              <p className="text-base font-semibold leading-none text-secondary-900">Tutor code</p>
            </div>
          </div>
          <Link href="/" className="text-xs font-medium text-secondary-400 hover:text-primary-600 transition-colors">
            ← Back
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <p className="rise-overline mb-2">Start with your code</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-secondary-900 lg:text-5xl">
            Enter the code your{' '}
            <span className="rise-gradient-text">tutor gave you</span>.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-secondary-400">
            Your code helps us find the learning plan your tutor made for you.
            We check it safely with RISE before opening your student space.
          </p>
        </div>

        {/* Form */}
        <form action={enterTutorKey} className="space-y-4">
          <div>
            <label className="mb-1.5 block rise-overline text-[10px]">
              Tutor code
            </label>
            <input
              name="tutor_key"
              defaultValue={normalisedCode}
              placeholder="Enter your tutor code"
              className="rise-input py-3.5"
              autoCapitalize="characters"
              autoCorrect="off"
            />
          </div>

          <button type="submit" className="rise-btn-primary mt-1 py-4 text-base">
            Continue
          </button>
        </form>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        {/* Footer links */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary-400">
          <span>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in instead
            </Link>
          </span>
          <span className="text-primary-200">·</span>
          <span>
            Optional:{' '}
            <Link href="/auth/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              account setup
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
