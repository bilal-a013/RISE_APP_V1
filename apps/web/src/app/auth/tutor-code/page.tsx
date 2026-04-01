import Link from 'next/link'
import { getTutorCodePreset, normaliseTutorCode } from '@/lib/onboarding'

interface TutorCodePageProps {
  searchParams: {
    code?: string
  }
}

export default function TutorCodePage({ searchParams }: TutorCodePageProps) {
  const rawCode = typeof searchParams.code === 'string' ? searchParams.code : ''
  const normalisedCode = rawCode ? normaliseTutorCode(rawCode) : ''
  const preset = getTutorCodePreset(rawCode)
  const hasLookup = rawCode.length > 0
  const signupHref = preset
    ? `/auth/signup?${new URLSearchParams({
        path: 'tutor-code',
        tutor_code: preset.code,
        full_name: preset.studentName,
        age_range: preset.ageRange,
        working_level: preset.workingLevel,
        target_grade: preset.targetGrade,
        recommended_topic: preset.recommendedTopic,
      }).toString()}`
    : null

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
          <p className="rise-overline mb-2">Check code</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-secondary-900 lg:text-5xl">
            Do you have a{' '}
            <span className="rise-gradient-text">tutor code</span>?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-secondary-400">
            Enter the code from your tutor to unlock a pre-shaped maths path.
            Use <span className="font-semibold text-primary-600">RAYAN-SIMS</span> to see the demo.
          </p>
        </div>

        {/* Form */}
        <form action="/auth/tutor-code" className="space-y-4">
          <div>
            <label className="mb-1.5 block rise-overline text-[10px]">
              Tutor code
            </label>
            <input
              name="code"
              defaultValue={normalisedCode}
              placeholder="RAYAN-SIMS"
              className="rise-input py-3.5"
              autoCapitalize="characters"
              autoCorrect="off"
            />
          </div>

          <button type="submit" className="rise-btn-primary mt-1 py-4 text-base">
            Check code
          </button>
        </form>

        {/* Error: code not found */}
        {hasLookup && !preset && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              That code isn&apos;t in the demo set. Try <span className="font-semibold">RAYAN-SIMS</span>.
            </p>
          </div>
        )}

        {/* Success: code accepted */}
        {preset && signupHref && (
          <div className="mt-5 glass-card p-5 border-primary-200/40">
            <p className="rise-overline text-[10px] mb-2">Code accepted</p>
            <h2 className="text-2xl font-bold leading-tight text-secondary-900">
              {preset.studentName}&apos;s path is ready
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary-400">
              {preset.summary}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-primary-100 bg-white/70 px-4 py-3">
                <p className="rise-overline text-[10px] mb-1">Tutor</p>
                <p className="text-base font-semibold text-secondary-900">{preset.tutorLabel}</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white/70 px-4 py-3">
                <p className="rise-overline text-[10px] mb-1">First focus</p>
                <p className="text-base font-semibold text-secondary-900">{preset.recommendedTopic}</p>
              </div>
            </div>
            <Link
              href={signupHref}
              className="mt-5 rise-btn-primary inline-flex w-auto px-6 py-3 text-sm"
            >
              Continue with tutor path →
            </Link>
          </div>
        )}

        {/* Footer links */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary-400">
          <span>
            No code?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Start as a new student
            </Link>
          </span>
          <span className="text-primary-200">·</span>
          <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
