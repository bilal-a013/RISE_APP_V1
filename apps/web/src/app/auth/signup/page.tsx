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
    <div className="rise-auth-stage">
      {/* Ambient depth orbs */}
      <div
        className="rise-auth-orb"
        style={{
          top: '-140px',
          right: '-100px',
          width: '640px',
          height: '640px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.20), rgba(90,20,200,0.08) 60%, transparent)',
        }}
      />
      <div
        className="rise-auth-orb"
        style={{
          bottom: '-100px',
          left: '-80px',
          width: '440px',
          height: '440px',
          background: 'radial-gradient(circle, rgba(60,10,180,0.16), transparent 70%)',
        }}
      />

      {/* Wide glass panel — no left promo card, form fills the space */}
      <div className="rise-auth-glass w-full max-w-[920px] px-8 py-9 lg:px-10 lg:py-10">
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
