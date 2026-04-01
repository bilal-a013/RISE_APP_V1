'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { signup } from '@/app/auth/actions'
import {
  AGE_RANGE_OPTIONS,
  STUDY_STYLE_OPTIONS,
  TARGET_GRADE_OPTIONS,
  WORKING_LEVEL_OPTIONS,
  type OnboardingMode,
  getStudyStyleLabel,
  getTargetGradeLabel,
  getWorkingLevelLabel,
} from '@/lib/onboarding'

interface NewStudentSignupFlowProps {
  error?: string
  message?: string
  initialValues: {
    fullName: string
    ageRange: string
    workingLevel: string
    targetGrade: string
    studyStyle: string
    tutorCode: string
    recommendedTopic: string
    mode: OnboardingMode
  }
}

const STEPS = ['You', 'Level', 'Style', 'Account']

export default function NewStudentSignupFlow({
  error,
  message,
  initialValues,
}: NewStudentSignupFlowProps) {
  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState(initialValues.fullName)
  const [ageRange, setAgeRange] = useState(initialValues.ageRange)
  const [workingLevel, setWorkingLevel] = useState(initialValues.workingLevel)
  const [targetGrade, setTargetGrade] = useState(initialValues.targetGrade)
  const [studyStyle, setStudyStyle] = useState(initialValues.studyStyle || 'balanced')

  const isTutorPath = initialValues.mode === 'tutor_code'
  const canContinue =
    (step === 0 && fullName.trim().length > 1 && !!ageRange) ||
    (step === 1 && !!workingLevel) ||
    (step === 2 && !!targetGrade && !!studyStyle) ||
    step === 3

  return (
    <div className="flex flex-col">

      {/* Brand header */}
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-btn"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
          >
            R
          </div>
          <div>
            <p className="rise-overline text-[10px]">RISE</p>
            <p className="text-base font-semibold leading-none text-secondary-900">
              {isTutorPath ? 'Tutor path' : 'New student'}
            </p>
          </div>
        </div>
        <Link href="/" className="text-xs font-medium text-secondary-400 hover:text-primary-600 transition-colors">
          ← Back
        </Link>
      </div>

      {/* Page heading */}
      <div className="mb-6">
        <p className="rise-overline mb-2">
          {isTutorPath ? 'Tutor-coded signup' : 'New-student signup'}
        </p>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-secondary-900 lg:text-4xl">
          {isTutorPath ? (
            <>Finish your <span className="rise-gradient-text">account</span></>
          ) : (
            <>Build your <span className="rise-gradient-text">maths setup</span></>
          )}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary-400">
          {isTutorPath
            ? 'Your tutor code has shaped the path. Add a few personal details so the first screen feels ready.'
            : 'Keep it short. We only ask what helps RISE recommend the right first lesson.'}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50/80 px-4 py-3">
          <p className="text-sm font-medium text-green-700">{message}</p>
        </div>
      )}

      {isTutorPath && (
        <div className="mb-5 glass-card p-4 border-primary-200/40">
          <p className="rise-overline text-[10px] mb-2">Tutor code active</p>
          <p className="text-lg font-semibold text-secondary-900">
            {initialValues.tutorCode} · {initialValues.recommendedTopic || 'Tutor-picked maths path'}
          </p>
          <p className="mt-2 text-sm text-secondary-400">
            The tutor path is already aimed at the right topic. Tweak age range, level, and account details below.
          </p>
        </div>
      )}

      {/* Step tabs */}
      <div className="mb-6 grid gap-2 sm:grid-cols-4">
        {STEPS.map((label, index) => {
          const active = index === step
          const complete = index < step
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (index <= step) setStep(index)
              }}
              className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                active
                  ? 'border-primary-400/50 bg-primary-50 shadow-card'
                  : complete
                  ? 'border-primary-200/50 bg-white/70'
                  : 'cursor-not-allowed border-secondary-200/30 bg-white/40 opacity-60'
              }`}
            >
              <p className="rise-overline text-[9px] mb-1">
                {complete ? 'Done' : `Step ${index + 1}`}
              </p>
              <p className="text-sm font-semibold text-secondary-900">{label}</p>
            </button>
          )
        })}
      </div>

      {/* Form */}
      <form action={signup} className="flex flex-1 flex-col">
        <input type="hidden" name="full_name" value={fullName} />
        <input type="hidden" name="age_range" value={ageRange} />
        <input type="hidden" name="working_level" value={workingLevel} />
        <input type="hidden" name="target_grade" value={targetGrade} />
        <input type="hidden" name="study_style" value={studyStyle} />
        <input type="hidden" name="preferred_subject" value="maths" />
        <input type="hidden" name="onboarding_mode" value={initialValues.mode} />
        <input type="hidden" name="tutor_code" value={initialValues.tutorCode} />
        <input type="hidden" name="recommended_topic" value={initialValues.recommendedTopic} />

        <div className="flex-1 space-y-6">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block rise-overline text-[10px]">
                  What should we call you?
                </label>
                <input
                  name="display_name"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your first name or full name"
                  className="rise-input"
                />
              </div>

              <div>
                <div className="mb-3">
                  <p className="rise-overline text-[10px] mb-1">Age range</p>
                  <p className="text-sm text-secondary-400">
                    Helps pitch maths at the right pace.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {AGE_RANGE_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.value}
                      option={option}
                      selected={ageRange === option.value}
                      onClick={() => setAgeRange(option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="mb-4">
                <p className="rise-overline text-[10px] mb-1">Working at level</p>
                <p className="text-sm text-secondary-400">
                  Pick the closest fit. The path still adapts to actual performance.
                </p>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                {WORKING_LEVEL_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    option={option}
                    selected={workingLevel === option.value}
                    onClick={() => setWorkingLevel(option.value)}
                    large
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="mb-4">
                  <p className="rise-overline text-[10px] mb-1">Target grade</p>
                  <p className="text-sm text-secondary-400">
                    Frames how hard the opening recommendations should push.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {TARGET_GRADE_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.value}
                      option={option}
                      selected={targetGrade === option.value}
                      onClick={() => setTargetGrade(option.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <p className="rise-overline text-[10px] mb-1">How should RISE help?</p>
                  <p className="text-sm text-secondary-400">
                    Lead the session, balance with choice, or stay mostly student-led.
                  </p>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                  {STUDY_STYLE_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.value}
                      option={option}
                      selected={studyStyle === option.value}
                      onClick={() => setStudyStyle(option.value)}
                      large
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="glass-card p-4">
                <p className="rise-overline text-[10px] mb-3">Setup summary</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <SummaryItem label="Name" value={fullName || 'Not set'} />
                  <SummaryItem label="Age range" value={ageRange || 'Not set'} />
                  <SummaryItem label="Working level" value={getWorkingLevelLabel(workingLevel)} />
                  <SummaryItem label="Target grade" value={getTargetGradeLabel(targetGrade)} />
                  <SummaryItem label="Style" value={getStudyStyleLabel(studyStyle)} />
                  <SummaryItem
                    label="Track"
                    value={
                      isTutorPath
                        ? initialValues.recommendedTopic || 'Tutor-curated maths path'
                        : 'Open maths onboarding'
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block rise-overline text-[10px]">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="rise-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block rise-overline text-[10px]">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    minLength={8}
                    className="rise-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-primary-200/30 pt-5">
          <p className="text-sm text-secondary-400">
            {step < 3 ? 'Keep it moving — only the essentials.' : 'Account details finish the setup.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                className="rise-btn-outline px-4 py-2.5 text-sm"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
                disabled={!canContinue}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${
                  canContinue
                    ? 'shadow-btn hover:-translate-y-0.5 hover:shadow-btn-hover'
                    : 'cursor-not-allowed opacity-40'
                }`}
                style={canContinue ? { background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' } : { background: '#B0ABCF' }}
              >
                Continue
              </button>
            ) : (
              <SubmitButton
                label={
                  isTutorPath
                    ? 'Create account and open tutor path'
                    : 'Create account and open maths path'
                }
              />
            )}
          </div>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary-400">
        <span>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </span>
        <span className="text-primary-200">·</span>
        <Link href="/auth/tutor-code" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Enter tutor code
        </Link>
      </div>
    </div>
  )
}

function OptionCard({
  option,
  selected,
  onClick,
  large = false,
}: {
  option: { value: string; label: string; hint: string }
  selected: boolean
  onClick: () => void
  large?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-4 text-left transition-all duration-200 ${
        selected
          ? 'border-primary-400/60 bg-primary-50 shadow-card'
          : 'border-secondary-200/30 bg-white/60 hover:border-primary-300/50 hover:bg-white/80'
      } ${large ? 'min-h-[120px]' : 'min-h-[110px]'}`}
    >
      <p className="text-base font-semibold leading-tight text-secondary-900">{option.label}</p>
      <p className="mt-2 text-sm leading-relaxed text-secondary-400">{option.hint}</p>
    </button>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary-100/60 bg-white/70 px-4 py-3">
      <p className="rise-overline text-[9px] mb-1">{label}</p>
      <p className="text-sm font-semibold text-secondary-900">{value}</p>
    </div>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rise-btn-primary w-auto px-5 py-2.5 text-sm"
    >
      {pending ? 'Creating account...' : label}
    </button>
  )
}
