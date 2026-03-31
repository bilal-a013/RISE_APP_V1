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
    : 'RISE has a strong maths starting point ready, but you can still choose your own topic.'

  const topicHighlights = [
    recommendedTopic
      ? {
          label: recommendedTopic,
          summary: 'Suggested next focus',
          color: 'bg-[#efe4ff]',
          dot: 'bg-[#7C3AED]',
        }
      : null,
    { label: 'Algebra', summary: 'Equations and structure', color: 'bg-[#fff3dd]', dot: 'bg-[#f59e0b]' },
    { label: 'Number', summary: 'Fluency and method', color: 'bg-[#e9fbff]', dot: 'bg-[#06b6d4]' },
    { label: 'Ratio', summary: 'Proportion and scaling', color: 'bg-[#ffe9f3]', dot: 'bg-[#ec4899]' },
    { label: 'Geometry', summary: 'Shapes, angles, and rules', color: 'bg-[#edf4ff]', dot: 'bg-[#3b82f6]' },
  ].filter(Boolean) as Array<{ label: string; summary: string; color: string; dot: string }>

  return (
    <div className="rise-page rise-page-wide">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#ede6fb] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a39cb8]">Home</p>
          <h1 className="mt-2 text-[2.65rem] font-black leading-none text-[#1f1833]">
            {greetingForHour()}, {userName}
          </h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-relaxed text-[#6f6a84]">{introCopy}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rise-chip">
            <span>Maths only</span>
          </div>
          <div className="rise-chip">
            <span>{onboardingMode === 'tutor_code' ? 'Tutor-shaped' : 'AI-guided'}</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-[0.95rem] border border-[#e4daf7] bg-white/80 px-4 py-2 text-sm font-black text-[#6a27cb] transition hover:bg-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_320px]">
        <div className="space-y-4">
          <div className="rise-soft-panel flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d88a7]">
                {onboardingMode === 'tutor_code' ? 'Tutor route' : 'Maths profile'}
              </p>
              <h2 className="mt-2 text-[2rem] font-black leading-none text-[#1e1830]">
                {targetGradeLabel} goal · {workingLevelLabel}
              </h2>
              <p className="mt-2 text-sm font-medium text-[#6f6a84]">{pathSummary}</p>
            </div>
            <Link
              href="/progress"
              className="inline-flex rounded-[0.95rem] bg-[#1f1737] px-5 py-3 text-sm font-black text-white"
            >
              Open progress
            </Link>
          </div>

          <div className="rise-card p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d88a7]">
                  {recommendation.eyebrow}
                </p>
                <h2 className="mt-2 max-w-2xl text-[2.35rem] font-black leading-[0.95] text-[#1e1830]">
                  {recommendation.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#6f6a84]">
                  {recommendation.description}
                </p>
              </div>
              {recommendedTopic ? (
                <div className="rounded-[0.95rem] border border-[#ece2fb] bg-[#faf7ff] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#a49eb8]">
                    Loaded focus
                  </p>
                  <p className="mt-1 text-lg font-black text-[#1d1830]">{recommendedTopic}</p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[1.15rem] border border-[#ede3fb] bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)] p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-[999px] bg-[#f3e8ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#8f2eff]">
                    {hasStartedLesson ? 'Lesson in progress' : 'Recommended next step'}
                  </span>
                  <span className="rise-chip text-[11px]">
                    <span>{onboardingMode === 'tutor_code' ? 'Tutor-aware' : 'AI-shaped'}</span>
                  </span>
                </div>

                {currentLesson ? (
                  <Link href={`/lessons/${currentLesson.lesson.id}`} className="block">
                    <div className="relative overflow-hidden rounded-[1.1rem] border border-[#ece2fb] bg-white p-5">
                      {hasStartedLesson ? (
                        <>
                          <div className="pointer-events-none select-none blur-[3px]">
                            <LessonPreview lesson={currentLesson} />
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.94)_38%,rgba(255,255,255,1)_100%)] p-5 pt-14">
                            <div className="rise-btn-primary text-sm">Continue lesson</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <LessonPreview lesson={currentLesson} />
                          <div className="mt-5 rise-btn-primary text-sm">Start this lesson</div>
                        </>
                      )}
                    </div>
                  </Link>
                ) : (
                  <Link href="/subjects" className="block">
                    <div className="rounded-[1.1rem] border border-dashed border-[#caaef2] bg-white px-5 py-8 text-center">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d88a7]">
                        No lesson queued
                      </p>
                      <h3 className="mt-2 text-[1.9rem] font-black leading-none text-[#1d1830]">
                        Pick your starting maths topic
                      </h3>
                      <p className="mt-3 text-sm font-medium text-[#6f6a84]">
                        Choose the topic you want, or let the app guide the first move.
                      </p>
                      <div className="mt-5 inline-flex rounded-[0.95rem] bg-[#1f1737] px-5 py-3 text-sm font-black text-white">
                        Open maths hub
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/progress?focus=streak" className="block">
                  <div className="rise-card rise-card-interactive h-full p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a7a0bd]">Daily streak</p>
                    <p className="mt-3 text-[2.4rem] font-black leading-none text-[#1f1833]">🔥 {streak}</p>
                    <p className="mt-2 text-sm font-medium text-[#6f6a84]">
                      Open the full progress page to see the weekly streak view.
                    </p>
                  </div>
                </Link>

                <Link href="/progress?focus=xp" className="block">
                  <div className="rise-card rise-card-interactive h-full p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a7a0bd]">XP total</p>
                    <p className="mt-3 text-[2.4rem] font-black leading-none text-[#1f1833]">⚡ {xp.toLocaleString()}</p>
                    <p className="mt-2 text-sm font-medium text-[#6f6a84]">
                      Tap through for the full XP, tier, and exam-readiness breakdown.
                    </p>
                  </div>
                </Link>

                <Link href="/subjects" className="block">
                  <div className="rise-card rise-card-interactive h-full bg-[linear-gradient(180deg,#1d1830_0%,#100d1d_100%)] p-5 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Your choice</p>
                    <p className="mt-3 text-[1.9rem] font-black leading-none">
                      {userMetadata.study_style === 'self_directed'
                        ? 'Choose your maths topic'
                        : 'Pick something different'}
                    </p>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-white/70">
                      The recommendation is there to help, not trap the student. Browse maths any time.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[1.9rem] font-black leading-none text-[#1f1c35]">Pick your maths lane</h2>
              <Link href="/subjects" className="text-sm font-black text-[#8f2eff]">
                Open maths hub
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {topicHighlights.map((topic) => (
                <Link key={topic.label} href="/subjects">
                  <div className={`rise-card rise-card-interactive h-full p-5 ${topic.color}`}>
                    <div className={`mb-6 h-3 w-3 rounded-full ${topic.dot}`} />
                    <p className="text-[1.5rem] font-black leading-none text-[#201c37]">{topic.label}</p>
                    <p className="mt-2 text-sm font-medium text-[#7f7b93]">{topic.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {lastSession ? (
            <div className="rise-card border border-[#e9dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,238,255,0.92)_100%)]">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#bf8dff]">
                Last session
              </p>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[0.95rem] bg-[#f2e8ff] text-lg">
                  👩‍🏫
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black leading-none text-[#211d35]">
                    {lastSession.topics_covered[0] ?? 'Recent tutoring work'}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#87839a]">
                    Use the dashboard recommendation as the next independent step.
                  </p>
                  {lastSession.topics_covered.length > 0 ? (
                    <p className="mt-2 truncate text-xs font-semibold text-[#9a94b0]">
                      Covered: {lastSession.topics_covered.join(', ')}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="rise-card bg-[linear-gradient(180deg,#241a4a_0%,#18142f_100%)] text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Maths first</p>
              <h3 className="mt-3 text-[2rem] font-black leading-none">The first screen knows what to do.</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Onboarding captures level and guidance preference so the dashboard is useful from the first visit.
              </p>
            </div>
          )}

          <div className="rise-card">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a7a0bd]">Why this path</p>
            <h3 className="mt-2 text-[1.85rem] font-black leading-none text-[#1d1830]">
              {onboardingMode === 'tutor_code' ? 'Tutor input is shaping the route.' : 'Using the signup answers well.'}
            </h3>
            <div className="mt-4 grid gap-3">
              <SmallInfoCard label="Working level" value={workingLevelLabel} />
              <SmallInfoCard label="Target" value={targetGradeLabel} />
              <SmallInfoCard label="Guidance style" value={studyStyleLabel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LessonPreview({ lesson }: { lesson: CurrentLesson }) {
  const summary =
    lesson.lesson.content?.summary?.slice(0, 3) ?? [
      'Build fluency with the core method.',
      'Work through an exam-shaped example.',
      'Finish with a clear self-check.',
    ]

  return (
    <div className="space-y-4">
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
        <h3 className="text-[2rem] font-black leading-[0.95] text-[#1c1833]">{lesson.lesson.title}</h3>
        <p className="mt-2 text-sm font-medium text-[#6f6a84]">
          {lesson.lesson.type === 'learn' ? 'Learn' : 'Practise'} · +50 XP on completion
        </p>
      </div>

      <div className="space-y-2">
        {summary.map((point, index) => (
          <div key={index} className="flex items-start gap-3 rounded-[0.95rem] bg-[#faf7ff] px-3 py-3">
            <span className="mt-0.5 text-sm font-black text-[#8b35ef]">•</span>
            <p className="text-sm font-semibold text-[#3d3657]">{point}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SmallInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.95rem] border border-[#ede5fa] bg-[#faf8ff] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#a7a0bd]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#1f1a33]">{value}</p>
    </div>
  )
}
