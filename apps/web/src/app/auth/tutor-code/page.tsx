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
    <div className="rise-page rise-page-wide flex min-h-[78dvh] items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <div className="rise-card flex flex-col justify-between bg-[linear-gradient(180deg,#1d1830_0%,#100d1d_100%)] p-8 text-white lg:p-10">
          <div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-2xl font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.35)]">
              R
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Tutor code</p>
            <h1 className="mt-3 max-w-xl text-[3rem] font-black leading-[0.92]">
              Let the tutor shape the student&apos;s starting point first.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/72">
              This is the bridge into the later tutor system: a code can preload who the student is working with and what topic should greet them first.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Demo code</p>
              <p className="mt-2 text-sm font-bold">Use `RAYAN-SIMS` for the dummy tutor flow.</p>
            </div>
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Focus</p>
              <p className="mt-2 text-sm font-bold">Simultaneous equations is preloaded in the demo.</p>
            </div>
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Later</p>
              <p className="mt-2 text-sm font-bold">Tutor logs can replace this manual preset path.</p>
            </div>
          </div>
        </div>

        <div className="rise-card p-7 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8f89aa]">Check code</p>
          <h2 className="mt-2 text-[2rem] font-black leading-none text-[#1d1830]">Do you have a tutor code?</h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-[#6f6a84]">
            Enter the code from the tutor to unlock the student&apos;s pre-shaped maths path.
          </p>

          <form action="/auth/tutor-code" className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#7a748f]">
                Tutor code
              </label>
              <input
                name="code"
                defaultValue={normalisedCode}
                placeholder="RAYAN-SIMS"
                className="rise-input"
                autoCapitalize="characters"
                autoCorrect="off"
              />
            </div>

            <button type="submit" className="rise-btn-primary">
              Check code
            </button>
          </form>

          {hasLookup && !preset && (
            <div className="mt-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                That tutor code is not in the demo set yet. Try `RAYAN-SIMS`.
              </p>
            </div>
          )}

          {preset && signupHref && (
            <div className="mt-5 rounded-[1.1rem] border border-[#ead7ff] bg-[linear-gradient(180deg,#f9f3ff_0%,#fefcff_100%)] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8f2eff]">Code accepted</p>
              <h3 className="mt-2 text-[1.65rem] font-black leading-none text-[#1d1830]">
                {preset.studentName}&apos;s path is ready
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#6f6a84]">
                {preset.summary}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[0.95rem] border border-[#eee7fb] bg-white px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#a7a0bd]">Tutor</p>
                  <p className="mt-1 text-base font-black text-[#1f1a33]">{preset.tutorLabel}</p>
                </div>
                <div className="rounded-[0.95rem] border border-[#eee7fb] bg-white px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#a7a0bd]">First focus</p>
                  <p className="mt-1 text-base font-black text-[#1f1a33]">{preset.recommendedTopic}</p>
                </div>
              </div>
              <Link href={signupHref} className="mt-5 inline-flex rounded-[0.95rem] bg-[#1f1737] px-5 py-3 text-sm font-black text-white">
                Continue with tutor path
              </Link>
            </div>
          )}

          <p className="mt-6 text-sm text-[#7b7790]">
            No code yet?{' '}
            <Link href="/auth/signup" className="font-black text-[#6d28d9]">
              Start as a new student
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
