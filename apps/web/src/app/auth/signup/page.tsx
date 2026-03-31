import Link from 'next/link'
import NewStudentSignupFlow from '@/components/auth/NewStudentSignupFlow'
import { type OnboardingMode } from '@/lib/onboarding'

interface SignupPageProps {
  searchParams: {
    error?: string
    message?: string
    path?: string
    full_name?: string
    age_range?: string
    working_level?: string
    target_grade?: string
    study_style?: string
    tutor_code?: string
    recommended_topic?: string
  }
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  const mode: OnboardingMode =
    searchParams.path === 'tutor-code' ? 'tutor_code' : 'new_student'

  return (
    <div className="rise-page rise-page-wide flex min-h-[88dvh] items-center">
      <div className="grid w-full gap-5 lg:grid-cols-[minmax(320px,0.56fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(29,24,48,0.92)_0%,rgba(16,13,29,0.98)_100%)] p-6 text-white shadow-[0_24px_60px_rgba(5,8,22,0.32)] lg:p-8">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-xl font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.35)]">
                R
              </div>
              <div>
                <p className="text-[1.65rem] font-black leading-none">RISE</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
                  Maths onboarding
                </p>
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">
              {mode === 'tutor_code' ? 'Tutor-coded signup' : 'New-student signup'}
            </p>
            <h1 className="mt-3 max-w-md text-[2.8rem] font-black leading-[0.92] lg:text-[3.3rem]">
              {mode === 'tutor_code'
                ? 'The path is shaped. Now make the account feel personal and ready.'
                : 'A clean, fast maths setup that gets the student into the app quickly.'}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/68">
              {mode === 'tutor_code'
                ? 'The tutor code already handles direction. We only need the essentials so the first screen feels ready immediately.'
                : 'Keep the questions short and useful so the first home screen already knows what lesson to push next.'}
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">What matters</p>
              <p className="mt-2 text-lg font-black leading-tight text-white">
                Less setup. Faster entry. Stronger first lesson.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span>Need a different route?</span>
            <Link href="/" className="font-black text-white">
              Back
            </Link>
            <span className="text-white/30">/</span>
            <Link href="/auth/tutor-code" className="font-black text-white">
              Use tutor code
            </Link>
          </div>
        </div>

        <NewStudentSignupFlow
          error={searchParams.error}
          message={searchParams.message}
          initialValues={{
            fullName: searchParams.full_name ?? '',
            ageRange: searchParams.age_range ?? '',
            workingLevel: searchParams.working_level ?? '',
            targetGrade: searchParams.target_grade ?? '',
            studyStyle: searchParams.study_style ?? 'balanced',
            tutorCode: searchParams.tutor_code ?? '',
            recommendedTopic: searchParams.recommended_topic ?? '',
            mode,
          }}
        />
      </div>
    </div>
  )
}
