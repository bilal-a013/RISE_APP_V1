import Link from 'next/link'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import { logout } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'
import {
  getAgeRangeLabel,
  getDashboardRecommendation,
  getStudyStyleLabel,
  getTargetGradeLabel,
  getWorkingLevelLabel,
  isMathsSubject,
} from '@/lib/onboarding'
import type {
  DifficultyLevel,
  Lesson,
  LessonProgress,
  StudentSession,
  Subject,
  Topic,
} from '@rise/shared'

interface CurrentLesson {
  lesson: Lesson & { topic: Topic & { subject: Subject } }
  progress: LessonProgress | null
}

interface CompletedProgressRow extends LessonProgress {
  lesson: {
    topic: {
      subject: Pick<Subject, 'name' | 'slug' | 'icon'>
    } | null
  } | null
}

async function getCurrentLesson(userId: string): Promise<CurrentLesson | null> {
  const supabase = await createClient()

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        *,
        topic:topics(
          *,
          subject:subjects(*)
        )
      )
    `)
    .eq('student_id', userId)
    .is('completed_at', null)
    .order('created_at', { ascending: false })
    .limit(18)

  const inProgressLesson = (progressRows ?? []).find((row) => isMathsSubject(row.lesson?.topic?.subject))
  if (inProgressLesson?.lesson) {
    return {
      lesson: inProgressLesson.lesson as CurrentLesson['lesson'],
      progress: inProgressLesson as LessonProgress,
    }
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      *,
      topic:topics(
        *,
        subject:subjects(*)
      )
    `)
    .eq('type', 'learn')
    .order('order_index', { ascending: true })
    .limit(40)

  const firstMathsLesson = (lessons ?? []).find((lesson) => isMathsSubject(lesson.topic?.subject))
  if (firstMathsLesson) {
    return { lesson: firstMathsLesson as CurrentLesson['lesson'], progress: null }
  }

  return null
}

async function getLastSession(userId: string): Promise<StudentSession | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('student_sessions')
    .select('*')
    .eq('student_id', userId)
    .order('session_date', { ascending: false })
    .limit(1)
    .single()

  return data
}

async function getMathsProgress(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        topic:topics(
          subject:subjects(name, slug, icon)
        )
      )
    `)
    .eq('student_id', userId)
    .not('completed_at', 'is', null)

  return ((data ?? []) as CompletedProgressRow[]).filter((row) => isMathsSubject(row.lesson?.topic?.subject))
}

function greetingForHour() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [currentLesson, lastSession, completedProgress] = await Promise.all([
    getCurrentLesson(user.id),
    getLastSession(user.id),
    getMathsProgress(user.id),
  ])

  const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const recommendation = getDashboardRecommendation(userMetadata)
  const streak = Math.max(1, Math.min(7, completedProgress.length || 1))
  const xp = completedProgress.length * 50
  const userName = userMetadata.full_name?.toString().split(' ')[0] ?? 'there'
  const onboardingMode = userMetadata.onboarding_mode === 'tutor_code' ? 'tutor_code' : 'new_student'
  const recommendedTopic =
    typeof userMetadata.recommended_topic === 'string' ? userMetadata.recommended_topic : ''
  const targetGradeLabel = getTargetGradeLabel(userMetadata.target_grade)
  const workingLevelLabel = getWorkingLevelLabel(userMetadata.working_level)
  const ageRangeLabel = getAgeRangeLabel(userMetadata.age_range)
  const studyStyleLabel = getStudyStyleLabel(userMetadata.study_style)
  const hasStartedLesson = Boolean(currentLesson?.progress)
  const pathSummary =
    onboardingMode === 'tutor_code'
      ? `${recommendedTopic || 'Tutor-curated maths path'} is already shaping the route.`
      : `${ageRangeLabel} learner · ${studyStyleLabel}.`
  const introCopy = lastSession
    ? `Last tutor session: ${new Date(lastSession.session_date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })}. The next maths step is ready below.`
    : hasStartedLesson
    ? 'You have a lesson in motion. Best move is to keep the streak alive and continue.'
    : 'RISE has a strong maths starting point ready, with a clear next lesson waiting.'

  return (
    <div className="rise-page rise-page-wide">
      <div className="mb-5 flex flex-col gap-5 border-b border-[#ede6fb] pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a39cb8]">Home</p>
          <h1 className="mt-2 text-[2.9rem] font-black leading-[0.92] text-[#1f1833] xl:text-[4rem]">
            {greetingForHour()}, {userName}
          </h1>
          <div className="mt-4 rounded-[1.2rem] border border-[#ece3fb] bg-white/70 px-5 py-4 shadow-[0_14px_34px_rgba(71,46,143,0.06)] backdrop-blur-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9b94b4]">Long-term goal</p>
            <p className="mt-2 text-[1.65rem] font-black leading-none text-[#1c1833] xl:text-[2.1rem]">
              {targetGradeLabel} goal
            </p>
            <p className="mt-2 text-sm font-medium text-[#6f6a84]">
              {workingLevelLabel} · {pathSummary}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Link href="/progress" className="rise-chip">
            <span>Open progress</span>
          </Link>
          <Link href="/subjects" className="rise-chip">
            <span>Browse maths</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-[999px] border border-[#e4daf7] bg-white/88 px-5 py-2.5 text-sm font-black text-[#6a27cb] transition hover:bg-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.48fr)_290px]">
        <div className="space-y-5">
          <div className="rise-card overflow-hidden p-0">
            <div className="border-b border-[#f0e9fb] px-6 py-6 xl:px-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d88a7]">
                {recommendation.eyebrow}
              </p>
              <h2 className="mt-3 max-w-4xl text-[2.8rem] font-black leading-[0.9] text-[#1e1830] xl:text-[4rem]">
                {recommendation.title}
              </h2>
              <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-[#6f6a84]">
                {introCopy}
              </p>
            </div>

            {currentLesson ? (
              <Link href={`/lessons/${currentLesson.lesson.id}`} className="block">
                <div className="relative min-h-[440px] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(164,111,255,0.18),transparent_32%),linear-gradient(180deg,#f9f5ff_0%,#f3edff_48%,#ffffff_100%)] px-6 py-6 xl:px-8 xl:py-8">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0)_42%)]" />
                  <div className="relative flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="rounded-[1.35rem] border border-white/60 bg-white/72 p-5 shadow-[0_24px_54px_rgba(71,46,143,0.08)] backdrop-blur-md xl:p-6">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-[999px] bg-[#efe3ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#8f2eff]">
                          {hasStartedLesson ? 'Continue next lesson' : 'Ready to start'}
                        </span>
                        <DifficultyBadge
                          level={(currentLesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
                          size="sm"
                        />
                      </div>
                      <LessonPreview lesson={currentLesson} blurred={hasStartedLesson} />
                    </div>

                    <div className="flex flex-col justify-between gap-4">
                      <div className="rounded-[1.35rem] border border-[#e9def9] bg-white/72 p-5 shadow-[0_16px_34px_rgba(71,46,143,0.06)] backdrop-blur-sm">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9f97b8]">
                          Next move
                        </p>
                        <p className="mt-2 text-[1.8rem] font-black leading-[0.92] text-[#1e1830]">
                          {hasStartedLesson ? 'Pick up exactly where you left off.' : 'Open the lesson and get moving.'}
                        </p>
                        <p className="mt-3 text-sm font-medium leading-relaxed text-[#6f6a84]">
                          {recommendation.description}
                        </p>
                      </div>

                      <div className="rounded-[1.35rem] border border-[#e9def9] bg-[#151127] p-5 text-white shadow-[0_18px_40px_rgba(10,10,24,0.22)]">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                          Lesson focus
                        </p>
                        <p className="mt-2 text-lg font-black">
                          {recommendedTopic || currentLesson.lesson.topic?.name || 'Maths'}
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                          {onboardingMode === 'tutor_code' ? 'Tutor-shaped route.' : 'Chosen to match the student profile.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 flex flex-wrap items-center gap-3">
                    <div className="rounded-[999px] bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#6f37d4] shadow-[0_10px_24px_rgba(71,46,143,0.08)] backdrop-blur-sm">
                      {currentLesson.lesson.topic?.subject?.name ?? 'Maths'} · {currentLesson.lesson.topic?.name}
                    </div>
                    <div className="rounded-[999px] bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#7c6f98] shadow-[0_10px_24px_rgba(71,46,143,0.08)] backdrop-blur-sm">
                      {currentLesson.lesson.type === 'learn' ? 'Learn' : 'Practise'} · +50 XP
                    </div>
                    <div className="ml-auto">
                      <div className="rise-btn-primary min-w-[220px] text-sm xl:min-w-[260px]">
                        {hasStartedLesson ? 'Continue lesson' : 'Start lesson'}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/subjects" className="block">
                <div className="px-6 py-10 xl:px-8">
                  <div className="rounded-[1.25rem] border border-dashed border-[#caaef2] bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)] px-6 py-12 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d88a7]">No lesson queued</p>
                    <h3 className="mt-3 text-[2.3rem] font-black leading-[0.92] text-[#1d1830]">
                      Open a maths topic and begin.
                    </h3>
                    <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-[#6f6a84]">
                      Choose the topic you want, or let the app guide the first move with a focused recommendation.
                    </p>
                    <div className="mt-6 inline-flex rounded-[0.95rem] bg-[#1f1737] px-6 py-3 text-sm font-black text-white">
                      Open maths hub
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/progress?focus=streak" className="block">
            <div className="rise-card rise-card-interactive p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a7a0bd]">Daily streak</p>
              <p className="mt-3 text-[2.6rem] font-black leading-none text-[#1f1833]">🔥 {streak}</p>
              <p className="mt-2 text-sm font-medium text-[#6f6a84]">A quiet reminder to keep momentum going.</p>
            </div>
          </Link>

          <Link href="/progress?focus=xp" className="block">
            <div className="rise-card rise-card-interactive p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a7a0bd]">XP total</p>
              <p className="mt-3 text-[2.6rem] font-black leading-none text-[#1f1833]">⚡ {xp.toLocaleString()}</p>
              <p className="mt-2 text-sm font-medium text-[#6f6a84]">Keep this secondary to the lesson, not equal to it.</p>
            </div>
          </Link>

          {lastSession ? (
            <div className="rise-card border border-[#e9dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,238,255,0.92)_100%)] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#bf8dff]">Last session</p>
              <p className="mt-3 text-[1.55rem] font-black leading-[0.95] text-[#211d35]">
                {lastSession.topics_covered[0] ?? 'Recent tutoring work'}
              </p>
              <p className="mt-3 text-sm font-medium text-[#87839a]">
                {new Date(lastSession.session_date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })} · The lesson window is ready above.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function LessonPreview({ lesson, blurred = false }: { lesson: CurrentLesson; blurred?: boolean }) {
  const summary =
    lesson.lesson.content?.summary?.slice(0, 3) ?? [
      'Build fluency with the core method.',
      'Work through an exam-shaped example.',
      'Finish with a clear self-check.',
    ]

  return (
    <div className={`space-y-5 ${blurred ? 'blur-[4px] opacity-80' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-[999px] bg-[#f5ecff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#a03af8]">
          {lesson.lesson.topic?.subject?.name ?? 'Maths'} · {lesson.lesson.topic?.name}
        </span>
        <DifficultyBadge
          level={(lesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
          size="sm"
        />
      </div>

      <div>
        <h3 className="text-[2.4rem] font-black leading-[0.92] text-[#1c1833] xl:text-[3rem]">
          {lesson.lesson.title}
        </h3>
        <p className="mt-2 text-sm font-medium text-[#6f6a84]">
          {lesson.lesson.type === 'learn' ? 'Learn' : 'Practise'} · +50 XP on completion
        </p>
      </div>

      <div className="space-y-3">
        {summary.map((point, index) => (
          <div key={index} className="flex items-start gap-3 rounded-[1rem] bg-[#faf7ff] px-4 py-4">
            <span className="mt-0.5 text-sm font-black text-[#8b35ef]">•</span>
            <p className="text-sm font-semibold text-[#3d3657] xl:text-base">{point}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
