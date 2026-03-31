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
    <div className="rise-page rise-page-wide flex min-h-[78dvh] items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(460px,0.95fr)]">
        <div className="rise-card flex flex-col justify-between bg-[linear-gradient(180deg,#1d1830_0%,#100d1d_100%)] p-8 text-white lg:p-10">
          <div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-2xl font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.35)]">
              R
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">
              {mode === 'tutor_code' ? 'Tutor-coded signup' : 'New-student signup'}
            </p>
            <h1 className="mt-3 max-w-xl text-[3rem] font-black leading-[0.92]">
              {mode === 'tutor_code'
                ? 'The tutor has shaped the path. Now the student gets a clean way in.'
                : 'Set up a sharper first-time maths experience instead of a generic sign-up form.'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/72">
              {mode === 'tutor_code'
                ? 'The code handles the direction. The student just completes their profile and lands in a more relevant maths flow.'
                : 'Keep the questions light, personalised, and useful so the first dashboard feels like it already knows how to help.'}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Only maths</p>
              <p className="mt-2 text-sm font-bold">We&apos;re keeping the subject list tight while the learning path gets stronger.</p>
            </div>
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Smarter start</p>
              <p className="mt-2 text-sm font-bold">The onboarding data feeds the first recommendation on the home dashboard.</p>
            </div>
            <div className="rounded-[1rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Choice stays open</p>
              <p className="mt-2 text-sm font-bold">Students still keep the option to choose what they want to learn next.</p>
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
