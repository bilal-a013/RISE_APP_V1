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

      {/* Brand header — replaces the removed left promo card */}
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-lg font-black text-white shadow-[0_14px_28px_rgba(124,58,237,0.32)]">
            R
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#a39cb8]">RISE</p>
            <p className="text-base font-black leading-none text-[#1d1830]">
              {isTutorPath ? 'Tutor path' : 'New student'}
            </p>
          </div>
        </div>
        <Link href="/" className="text-xs font-black text-[#9993b4] hover:text-[#6d28d9]">
          ← Back
        </Link>
      </div>

      {/* Page heading */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a39cb8]">
          {isTutorPath ? 'Tutor-coded signup' : 'New-student signup'}
        </p>
        <h1 className="mt-2 text-[2.2rem] font-black leading-[0.92] text-[#1d1830] lg:text-[2.8rem]">
          {isTutorPath ? 'Finish your account' : 'Build your maths setup'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#6f6a84]">
          {isTutorPath
            ? 'Your tutor code has shaped the path. Add a few personal details so the first screen feels ready.'
            : 'Keep it short. We only ask what helps RISE recommend the right first lesson.'}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-[1rem] border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-semibold text-green-700">{message}</p>
        </div>
      )}

      {isTutorPath && (
        <div className="mb-5 rounded-[1.1rem] border border-[#ead7ff] bg-[linear-gradient(180deg,#f9f3ff_0%,#fefcff_100%)] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8f2eff]">
            Tutor code active
          </p>
          <p className="mt-2 text-lg font-black text-[#1e1931]">
            {initialValues.tutorCode} · {initialValues.recommendedTopic || 'Tutor-picked maths path'}
          </p>
          <p className="mt-2 text-sm font-medium text-[#6f6a84]">
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
              className={`rounded-[0.95rem] border px-4 py-3 text-left transition ${
                active
                  ? 'border-[#8f2eff] bg-[#f6efff] shadow-[0_12px_24px_rgba(124,58,237,0.10)]'
                  : complete
                  ? 'border-[#e8def8] bg-white/80'
                  : 'cursor-not-allowed border-[#efe7fb] bg-white/50 text-[#b6afc8]'
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a7a0bd]">
                {complete ? 'Done' : `Step ${index + 1}`}
              </p>
              <p className="mt-1 text-base font-black text-[#1f1a33]">{label}</p>
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
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#7a748f]">
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
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7a748f]">Age range</p>
                  <p className="mt-1 text-sm font-medium text-[#817b96]">
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
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7a748f]">Working at level</p>
                <p className="mt-1 text-sm font-medium text-[#817b96]">
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
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7a748f]">Target grade</p>
                  <p className="mt-1 text-sm font-medium text-[#817b96]">
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
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7a748f]">How should RISE help?</p>
                  <p className="mt-1 text-sm font-medium text-[#817b96]">
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
              <div className="rounded-[1.15rem] border border-[#ebe2f8] bg-white/60 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d88a4]">Setup summary</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#7a748f]">
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
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#7a748f]">
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#ece3f8] pt-5">
          <p className="text-sm font-medium text-[#817b96]">
            {step < 3 ? 'Keep it moving — only the essentials.' : 'Account details finish the setup.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                className="rounded-[0.95rem] border border-[#e2d8f4] bg-white/80 px-4 py-3 text-sm font-black text-[#4b4363]"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
                disabled={!canContinue}
                className={`rounded-[0.95rem] px-5 py-3 text-sm font-black text-white ${
                  canContinue ? 'bg-[#251b48]' : 'cursor-not-allowed bg-[#d3ccdf]'
                }`}
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

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#7b7790]">
        <span>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-black text-[#6d28d9]">
            Sign in
          </Link>
        </span>
        <span className="text-[#ccc6da]">·</span>
        <Link href="/auth/tutor-code" className="font-black text-[#6d28d9]">
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
      className={`rounded-[1.05rem] border px-4 py-4 text-left transition ${
        selected
          ? 'border-[#8f2eff] bg-[#f6efff] shadow-[0_12px_24px_rgba(124,58,237,0.10)]'
          : 'border-[#ede5fa] bg-white/70 hover:border-[#cdbbf0] hover:bg-white/90'
      } ${large ? 'min-h-[120px]' : 'min-h-[110px]'}`}
    >
      <p className="text-lg font-black leading-none text-[#1d1830]">{option.label}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-[#716c86]">{option.hint}</p>
    </button>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.95rem] border border-[#eee7fb] bg-white/80 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a7a0bd]">{label}</p>
      <p className="mt-1 text-base font-black text-[#1f1a33]">{value}</p>
    </div>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} className="rise-btn-primary w-auto px-5">
      {pending ? 'Creating account...' : label}
    </button>
  )
}
