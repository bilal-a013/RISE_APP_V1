export type OnboardingMode = 'new_student' | 'tutor_code'

export interface OnboardingOption {
  value: string
  label: string
  hint: string
}

export const AGE_RANGE_OPTIONS: OnboardingOption[] = [
  { value: '9-11', label: '9-11', hint: 'Starting to build confidence with core maths.' },
  { value: '11-13', label: '11-13', hint: 'Moving into steady secondary-school topics.' },
  { value: '13-14', label: '13-14', hint: 'Working through GCSE foundations and algebra.' },
  { value: '15-16', label: '15-16', hint: 'GCSE push with exam technique and sharper fluency.' },
  { value: '16+', label: '16+', hint: 'Extra practice with focused revision support.' },
]

export const WORKING_LEVEL_OPTIONS: OnboardingOption[] = [
  {
    value: 'building_core',
    label: 'Building the basics',
    hint: 'I want the app to keep things calm, clear, and step-by-step.',
  },
  {
    value: 'foundation_secure',
    label: 'Secure at foundation',
    hint: 'I can do a fair bit, but I need consistency and stronger recall.',
  },
  {
    value: 'higher_push',
    label: 'Pushing higher',
    hint: 'I want tougher algebra, stronger reasoning, and grade 7+ momentum.',
  },
]

export const TARGET_GRADE_OPTIONS: OnboardingOption[] = [
  { value: '4-5', label: 'Grade 4-5', hint: 'Solid pass and dependable basics.' },
  { value: '6', label: 'Grade 6', hint: 'Confident, steady, and exam ready.' },
  { value: '7', label: 'Grade 7', hint: 'Sharper method, accuracy, and stretch.' },
  { value: '8-9', label: 'Grade 8-9', hint: 'High ceiling, hard questions, full push.' },
]

export const STUDY_STYLE_OPTIONS: OnboardingOption[] = [
  {
    value: 'guided',
    label: 'Guide me',
    hint: 'Tell me the best next maths task and keep me moving.',
  },
  {
    value: 'balanced',
    label: 'Give me both',
    hint: 'Show a smart recommendation, but let me choose too.',
  },
  {
    value: 'self_directed',
    label: 'Let me choose',
    hint: 'I mostly want to pick my own topics and lessons.',
  },
]

export interface TutorCodePreset {
  code: string
  studentName: string
  ageRange: string
  workingLevel: string
  targetGrade: string
  recommendedTopic: string
  tutorLabel: string
  summary: string
}

const TUTOR_CODE_PRESETS: TutorCodePreset[] = [
  {
    code: 'RAYAN-SIMS',
    studentName: 'Rayan',
    ageRange: '13-14',
    workingLevel: 'higher_push',
    targetGrade: '7',
    recommendedTopic: 'Simultaneous equations',
    tutorLabel: 'Bilal tutoring',
    summary:
      'Your tutor has already pointed the app toward simultaneous equations, so your first path is curated before you even start.',
  },
]

export function normaliseTutorCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '-')
}

export function getTutorCodePreset(code?: string | null) {
  if (!code) return null
  const normalised = normaliseTutorCode(code)
  return TUTOR_CODE_PRESETS.find((preset) => preset.code === normalised) ?? null
}

export function isMathsSubject(subject?: { name?: string | null; slug?: string | null } | null) {
  if (!subject) return false
  const label = `${subject.name ?? ''} ${subject.slug ?? ''}`.toLowerCase()
  return label.includes('math')
}

function optionLabel(options: OnboardingOption[], value: unknown, fallback: string) {
  if (typeof value !== 'string' || !value) return fallback
  return options.find((option) => option.value === value)?.label ?? fallback
}

export function getAgeRangeLabel(value: unknown) {
  return optionLabel(AGE_RANGE_OPTIONS, value, 'Age range not set')
}

export function getWorkingLevelLabel(value: unknown) {
  return optionLabel(WORKING_LEVEL_OPTIONS, value, 'General maths practice')
}

export function getTargetGradeLabel(value: unknown) {
  return optionLabel(TARGET_GRADE_OPTIONS, value, 'GCSE maths')
}

export function getStudyStyleLabel(value: unknown) {
  return optionLabel(STUDY_STYLE_OPTIONS, value, 'Mixed guidance')
}

export interface DashboardRecommendation {
  eyebrow: string
  title: string
  description: string
}

export function getDashboardRecommendation(
  metadata: Record<string, unknown> | undefined
): DashboardRecommendation {
  const recommendedTopic =
    typeof metadata?.recommended_topic === 'string' ? metadata.recommended_topic : ''
  const onboardingMode = metadata?.onboarding_mode
  const workingLevel = metadata?.working_level
  const studyStyle = metadata?.study_style

  if (onboardingMode === 'tutor_code' && recommendedTopic) {
    return {
      eyebrow: 'Tutor-shaped start',
      title: `Start with ${recommendedTopic}.`,
      description:
        'Your tutor already narrowed the focus, so the fastest win is to open the lesson they lined up and build from there.',
    }
  }

  if (workingLevel === 'building_core') {
    return {
      eyebrow: 'Best next move',
      title: 'Lock in the core algebra habits first.',
      description:
        'A calm equations lesson is the quickest way to make the rest of maths feel less noisy and more manageable.',
    }
  }

  if (workingLevel === 'higher_push') {
    return {
      eyebrow: 'Best next move',
      title: 'Push straight into harder algebra.',
      description:
        'You look ready for a sharper challenge, so start with a lesson that stretches reasoning instead of staying too safe.',
    }
  }

  if (studyStyle === 'self_directed') {
    return {
      eyebrow: 'Best next move',
      title: 'Pick a maths topic and get moving.',
      description:
        'You told RISE you like choosing for yourself, so the app will recommend a strong start but keep the door open to browse freely.',
    }
  }

  return {
    eyebrow: 'Best next move',
    title: 'Start with a focused GCSE maths lesson.',
    description:
      'The quickest way to get traction is one strong lesson now, then you can branch into the topic list if you want something different.',
  }
}
