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
    <div className="rise-auth-stage py-12">
      {/* Decorative background orbs */}
      <div
        className="rise-auth-orb"
        style={{
          top: '-80px',
          right: '-100px',
          width: '560px',
          height: '560px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.10), transparent 70%)',
        }}
      />
      <div
        className="rise-auth-orb"
        style={{
          bottom: '-80px',
          left: '-80px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(200,176,255,0.15), transparent 70%)',
        }}
      />

      {/* Wide glass panel */}
      <div className="rise-auth-glass w-full max-w-[880px]">
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
