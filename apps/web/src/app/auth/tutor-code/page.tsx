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
      <div className="rise-auth-glass w-full max-w-[620px] px-8 py-9 lg:px-10 lg:py-11">

        {/* Brand mark */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-lg font-black text-white shadow-[0_14px_28px_rgba(124,58,237,0.32)]">
              R
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#a39cb8]">RISE</p>
              <p className="text-base font-black leading-none text-[#1d1830]">Tutor code</p>
            </div>
          </div>
          <Link href="/" className="text-xs font-black text-[#9993b4] hover:text-[#6d28d9]">
            ← Back
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a39cb8]">Check code</p>
          <h1 className="mt-2 text-[2.4rem] font-black leading-[0.92] text-[#1d1830] lg:text-[3rem]">
            Do you have a tutor code?
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-[#6f6a84]">
            Enter the code from your tutor to unlock a pre-shaped maths path.
            Use <span className="font-black text-[#7C3AED]">RAYAN-SIMS</span> to see the demo.
          </p>
        </div>

        {/* Form */}
        <form action="/auth/tutor-code" className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.18em] text-[#6b6388]">
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
          <div className="mt-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              That code isn&apos;t in the demo set. Try <span className="font-black">RAYAN-SIMS</span>.
            </p>
          </div>
        )}

        {/* Success: code accepted */}
        {preset && signupHref && (
          <div className="mt-5 rounded-[1.1rem] border border-[#ead7ff] bg-[linear-gradient(180deg,#f9f3ff_0%,#fefcff_100%)] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8f2eff]">Code accepted</p>
            <h2 className="mt-2 text-[1.65rem] font-black leading-none text-[#1d1830]">
              {preset.studentName}&apos;s path is ready
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[#6f6a84]">
              {preset.summary}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[0.95rem] border border-[#eee7fb] bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a7a0bd]">Tutor</p>
                <p className="mt-1 text-base font-black text-[#1f1a33]">{preset.tutorLabel}</p>
              </div>
              <div className="rounded-[0.95rem] border border-[#eee7fb] bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a7a0bd]">First focus</p>
                <p className="mt-1 text-base font-black text-[#1f1a33]">{preset.recommendedTopic}</p>
              </div>
            </div>
            <Link
              href={signupHref}
              className="mt-5 inline-flex rounded-[0.95rem] bg-[#1f1737] px-5 py-3 text-sm font-black text-white"
            >
              Continue with tutor path →
            </Link>
          </div>
        )}

        {/* Footer links */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#7b7790]">
          <span>
            No code?{' '}
            <Link href="/auth/signup" className="font-black text-[#6d28d9]">
              Start as a new student
            </Link>
          </span>
          <span className="text-[#ccc6da]">·</span>
          <Link href="/auth/login" className="font-black text-[#6d28d9]">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
