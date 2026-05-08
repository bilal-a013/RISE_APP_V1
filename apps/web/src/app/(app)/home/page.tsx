import { redirect } from 'next/navigation'
import Link from 'next/link'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import { logout } from '@/app/auth/actions'
import { updateHomeworkStatus } from '@/app/(app)/home/actions'
import { getStudentHomeworkTask, type HomeworkTask, type HomeworkStatus } from '@/lib/homework'
import { createClient } from '@/lib/supabase/server'
import { isMathsSubject } from '@/lib/onboarding'
import { getStudentSession, type StudentSession as TutorStudentSession } from '@/lib/student-session'
import {
  getRecentStudentAppActivity,
  recordStudentAppActivity,
  type StudentAppActivity,
} from '@/lib/student-activity'
import {
  getChildProfileForStudentSession,
  getStudentHomeSnapshot,
  type TutorKeyChildProfile,
  type TutorKeyDashboardReport,
  type TutorKeyDashboardSession,
  type TutorKeyDashboardStudent,
  type TutorKeyHomeSnapshot,
} from '@/lib/tutor-key'
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
      subject: Pick<Subject, 'name' | 'slug'> & {
        icon_name?: string | null
      }
    } | null
  } | null
}

type LoadResult<T> = {
  data: T | null
  error: string | null
}

interface HomePageProps {
  searchParams?: {
    homework_success?: string
    homework_error?: string
  }
}

function getHomeLoadErrorMessage(label: string, error: unknown) {
  if (error instanceof Error) {
    const message = error.message

    if (message.includes('NEXT_PUBLIC_SUPABASE_URL is missing')) {
      return 'RISE is missing its Supabase URL on this deployment.'
    }

    if (message.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')) {
      return 'RISE is missing its Supabase anon key on this deployment.'
    }

    if (message.includes('fetch failed')) {
      return `RISE could not load ${label} from Supabase.`
    }

    if (message.toLowerCase().includes('permission denied')) {
      return `RISE could not read ${label} because Supabase permissions blocked it.`
    }

    if (message) {
      return message
    }
  }

  return `RISE could not load ${label}.`
}

async function safeLoad<T>(label: string, loader: () => Promise<T>): Promise<LoadResult<T>> {
  try {
    return {
      data: await loader(),
      error: null,
    }
  } catch (error) {
    console.error(`[home] ${label} failed`, error)
    return {
      data: null,
      error: getHomeLoadErrorMessage(label, error),
    }
  }
}

async function getCurrentLesson(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<CurrentLesson | null> {
  const { data: progressRows, error: progressError } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        *,
        topic:topics(
          *,
          subject:subjects(name, slug, icon_name)
        )
      )
    `)
    .eq('student_id', userId)
    .is('completed_at', null)
    .order('last_accessed_at', { ascending: false })
    .limit(18)

  if (progressError) {
    throw progressError
  }

  const inProgressLesson = (progressRows ?? []).find((row) => isMathsSubject(row.lesson?.topic?.subject))
  if (inProgressLesson?.lesson) {
    return {
      lesson: inProgressLesson.lesson as CurrentLesson['lesson'],
      progress: inProgressLesson as LessonProgress,
    }
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      *,
      topic:topics(
        *,
        subject:subjects(name, slug, icon_name)
      )
    `)
    .eq('type', 'learn')
    .order('order_index', { ascending: true })
    .limit(40)

  if (lessonsError) {
    throw lessonsError
  }

  const firstMathsLesson = (lessons ?? []).find((lesson) => isMathsSubject(lesson.topic?.subject))
  if (firstMathsLesson) {
    return { lesson: firstMathsLesson as CurrentLesson['lesson'], progress: null }
  }

  return null
}

async function getFirstMathsLesson(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<CurrentLesson | null> {
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      *,
      topic:topics(
        *,
        subject:subjects(name, slug, icon_name)
      )
    `)
    .eq('type', 'learn')
    .order('order_index', { ascending: true })
    .limit(40)

  if (lessonsError) {
    throw lessonsError
  }

  const firstMathsLesson = (lessons ?? []).find((lesson) => isMathsSubject(lesson.topic?.subject))
  if (firstMathsLesson) {
    return { lesson: firstMathsLesson as CurrentLesson['lesson'], progress: null }
  }

  return null
}

async function getLastSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<StudentSession | null> {
  const { data, error } = await supabase
    .from('student_sessions')
    .select('*')
    .eq('student_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function getMathsProgress(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        topic:topics(
          subject:subjects(name, slug, icon_name)
        )
      )
    `)
    .eq('student_id', userId)
    .not('completed_at', 'is', null)

  if (error) {
    throw error
  }

  return ((data ?? []) as CompletedProgressRow[]).filter((row) => isMathsSubject(row.lesson?.topic?.subject))
}

async function getTutorChildProfile(
  session: TutorStudentSession
): Promise<TutorKeyChildProfile | null> {
  return getChildProfileForStudentSession(session)
}

async function getTutorHomeSnapshot(
  session: TutorStudentSession
): Promise<TutorKeyHomeSnapshot | null> {
  return getStudentHomeSnapshot(session)
}

async function getTutorAppActivity(session: TutorStudentSession): Promise<StudentAppActivity[]> {
  try {
    await recordStudentAppActivity(session, {
      activityType: 'home_viewed',
      title: 'Home opened',
      description: 'Opened the RISE student home dashboard.',
      metadata: {
        route: '/home',
        source: 'rise_app',
      },
    })
  } catch (error) {
    console.error('[home] Failed to record student app activity', error)
  }

  return getRecentStudentAppActivity(session, 6)
}

async function getTutorHomeworkTask(session: TutorStudentSession): Promise<HomeworkTask | null> {
  return getStudentHomeworkTask(session)
}

function greetingForHour() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function compactText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function compactList(values: Array<string | null | undefined>) {
  return values.map(compactText).filter(Boolean) as string[]
}

function formatDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatActivityTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function humaniseToken(value?: string | null) {
  return compactText(value)?.replace(/[-_]/g, ' ') ?? null
}

function reportSectionText(report: TutorKeyDashboardReport | null | undefined, key: string) {
  const value = report?.report_sections?.[key]
  if (Array.isArray(value)) return value.map(compactText).filter(Boolean).join(', ')
  return compactText(value)
}

function getHomework(profile?: TutorKeyDashboardStudent | null, session?: TutorKeyDashboardSession | null, report?: TutorKeyDashboardReport | null) {
  return (
    compactText(profile?.current_homework) ||
    compactText(session?.homework) ||
    reportSectionText(report, 'homework') ||
    null
  )
}

function homeworkStatusLabel(status?: string | null) {
  switch (status) {
    case 'in_progress':
      return 'In progress'
    case 'completed':
      return 'Completed'
    case 'need_help':
      return 'Need help'
    case 'not_started':
      return 'Not started'
    default:
      return humaniseToken(status) ?? 'Not started'
  }
}

function getFocusTopic(profile?: TutorKeyDashboardStudent | null, session?: TutorKeyDashboardSession | null, homework?: string | null) {
  return (
    compactText(session?.topic) ||
    compactText(session?.key_skill) ||
    compactText(profile?.main_learning_priority) ||
    compactText(profile?.current_topics?.[0]) ||
    compactText(profile?.struggles?.[0]) ||
    homework ||
    compactText(profile?.working_level) ||
    "your tutor's next maths focus"
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient()
  const [authResult, tutorSession] = await Promise.all([
    supabase.auth.getUser(),
    getStudentSession(),
  ])
  const user = authResult.data.user

  if (authResult.error) {
    console.error('[home] Failed to read Supabase session', authResult.error)
  }

  if (!user && !tutorSession) {
    redirect('/?message=Enter your tutor code to continue.')
  }

  const [currentLessonResult, lastSessionResult, completedProgressResult, tutorProfileResult, tutorHomeResult, tutorActivityResult, tutorHomeworkResult] =
    await Promise.all([
      safeLoad('current lesson', () =>
        user ? getCurrentLesson(supabase, user.id) : getFirstMathsLesson(supabase)
      ),
      user
        ? safeLoad('latest session', () => getLastSession(supabase, user.id))
        : Promise.resolve({ data: null, error: null }),
      user
        ? safeLoad('progress summary', () => getMathsProgress(supabase, user.id))
        : Promise.resolve({ data: [], error: null }),
      tutorSession
        ? safeLoad('tutor profile', () => getTutorChildProfile(tutorSession))
        : Promise.resolve({ data: null, error: null }),
      tutorSession
        ? safeLoad('tutor updates', () => getTutorHomeSnapshot(tutorSession))
        : Promise.resolve({ data: null, error: null }),
      tutorSession
        ? safeLoad('recent app activity', () => getTutorAppActivity(tutorSession))
        : Promise.resolve({ data: [], error: null }),
      tutorSession
        ? safeLoad('homework', () => getTutorHomeworkTask(tutorSession))
        : Promise.resolve({ data: null, error: null }),
    ])

    const homeErrors = [
      currentLessonResult.error,
      lastSessionResult.error,
      completedProgressResult.error,
      tutorProfileResult.error,
      tutorHomeResult.error,
      tutorActivityResult.error,
      tutorHomeworkResult.error,
    ].filter(Boolean) as string[]

    const currentLesson = currentLessonResult.data
    const lastSession = lastSessionResult.data
    const completedProgress = completedProgressResult.data ?? []
    const tutorHome = tutorHomeResult.data
    const recentAppActivity = tutorActivityResult.data ?? []
    const homeworkTask = tutorHomeworkResult.data
    const dashboardProfile = tutorHome?.profile ?? null
    const tutorProfile = tutorProfileResult.data ?? dashboardProfile
    const latestTutorSession = tutorHome?.latest_session ?? null
    const latestReport = tutorHome?.latest_report ?? null
    const legacyHomework = getHomework(dashboardProfile, latestTutorSession, latestReport)
    const homework = homeworkTask?.title ?? legacyHomework
    const homeworkInstructions = homeworkTask?.instructions ?? null
    const homeworkStatus = homeworkTask?.status ?? dashboardProfile?.homework_status ?? 'not_started'
    const homeworkSuccess = searchParams?.homework_success
    const homeworkError = searchParams?.homework_error
    const focusTopic = getFocusTopic(dashboardProfile, latestTutorSession, homework)
    const sessionDate = formatDate(latestTutorSession?.session_date ?? latestTutorSession?.created_at)
    const reportDate = formatDate(latestReport?.created_at)
    const tutorCovered = compactList([
      latestTutorSession?.topic,
      latestTutorSession?.key_skill,
      ...(latestTutorSession?.session_focus ?? []),
    ])
    const struggles = compactList([
      ...(latestTutorSession?.struggles ?? []),
      ...(dashboardProfile?.struggles ?? []),
    ])
    const confidenceNote =
      humaniseToken(latestTutorSession?.understanding_level) ||
      (typeof latestTutorSession?.confidence_rating === 'number'
        ? `Confidence ${latestTutorSession.confidence_rating}/5`
        : null)
    const engagementNote =
      typeof latestTutorSession?.effort_rating === 'number'
        ? `Effort ${latestTutorSession.effort_rating}/5`
        : null
    const nextPlan =
      compactText(latestTutorSession?.next_steps) ||
      compactText(dashboardProfile?.next_session_focus) ||
      reportSectionText(latestReport, 'nextFocus') ||
      null
    const reportSummary =
      reportSectionText(latestReport, 'tutorSummary') ||
      reportSectionText(latestReport, 'todayFocus') ||
      compactText(latestReport?.title) ||
      null

    const userMetadata = (user?.user_metadata ?? {}) as Record<string, unknown>
    const userName =
      tutorProfile?.full_name
        ? tutorProfile.full_name.split(' ')[0]
        : typeof userMetadata.full_name === 'string'
          ? userMetadata.full_name.split(' ')[0]
          : 'there'
    const recommendedTopic =
      typeof userMetadata.recommended_topic === 'string' ? userMetadata.recommended_topic : ''
    const profileSummary = [
      tutorProfile?.year_group,
      tutorProfile?.working_level ?? dashboardProfile?.current_grade,
      tutorProfile?.target_grade ? `Target ${tutorProfile.target_grade}` : null,
    ].filter(Boolean).join(' · ')
    const hasStartedLesson = Boolean(currentLesson?.progress)
    const streak = Math.max(1, Math.min(7, completedProgress.length || 1))
    const xp = completedProgress.length * 50
    const introCopy = lastSession
      ? `Last tutor session recorded on ${new Date(
          (lastSession as StudentSession & { created_at?: string }).created_at ?? Date.now()
        ).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })}.`
      : hasStartedLesson
        ? 'Continue your current lesson.'
        : 'Start with the lesson below or pick your own maths topic.'

    const topicHighlights = [
      recommendedTopic ? { label: recommendedTopic, summary: 'Suggested' } : null,
      { label: 'Algebra', summary: 'Equations' },
      { label: 'Number', summary: 'Fluency' },
      { label: 'Ratio', summary: 'Proportion' },
      { label: 'Geometry', summary: 'Angles' },
    ].filter(Boolean) as Array<{ label: string; summary: string }>

  return (
    <div className="rise-page">
        {homeErrors.length ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4">
            <p className="rise-overline text-[10px] mb-2">Some data could not load</p>
            <p className="text-sm font-medium text-secondary-800">
              Your sign-in worked, but part of the dashboard could not read from Supabase.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-secondary-500">
              {homeErrors.map((message) => (
                <li key={message}>• {message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 border-b border-primary-200/30 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rise-overline mb-2">Home</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-secondary-900 lg:text-5xl">
              {greetingForHour()},{' '}
              <span className="rise-gradient-text">{userName}</span>
            </h1>
            <p className="mt-2 text-sm text-secondary-400">{introCopy}</p>
            {tutorProfile ? (
              <p className="mt-2 text-sm font-semibold text-primary-600">
                {profileSummary || 'Your tutor profile is connected.'}
              </p>
            ) : null}
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rise-btn-outline rounded-xl px-4 py-2 text-sm"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="glass-card-solid p-5">
            <p className="rise-overline text-[10px] mb-3">Your tutor update</p>
            {latestTutorSession ? (
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {sessionDate ? <span className="rise-chip">{sessionDate}</span> : null}
                  {latestTutorSession.subject ? <span className="rise-chip">{latestTutorSession.subject}</span> : null}
                  {confidenceNote ? <span className="rise-chip capitalize">{confidenceNote}</span> : null}
                  {engagementNote ? <span className="rise-chip">{engagementNote}</span> : null}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-secondary-900">
                  {latestTutorSession.topic || latestTutorSession.key_skill || 'Latest session'}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-secondary-500">
                  {latestTutorSession.summary || 'Your tutor has logged a session update for you.'}
                </p>
                {tutorCovered.length ? (
                  <InfoList title="Worked on" items={tutorCovered.slice(0, 4)} />
                ) : null}
                {struggles.length ? (
                  <InfoList title="Needs practice" items={struggles.slice(0, 4)} tone="amber" />
                ) : null}
                {nextPlan ? (
                  <div className="mt-4 rounded-xl border border-primary-200/30 bg-primary-50/60 px-4 py-3">
                    <p className="rise-overline text-[9px] mb-1">Next plan</p>
                    <p className="text-sm font-semibold text-secondary-800">{nextPlan}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyTutorCard
                title="Session updates will appear here"
                body="Your tutor profile is connected. Once your tutor logs a session, you will see what you covered and what to practise next."
              />
            )}
          </section>

          <section className="glass-card-solid p-5">
            <p className="rise-overline text-[10px] mb-3">Student profile</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-secondary-900">
              {tutorProfile?.full_name || 'Tutor-linked student'}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ProfilePill label="Year group" value={tutorProfile?.year_group ?? dashboardProfile?.age_range} />
              <ProfilePill label="Working level" value={tutorProfile?.working_level ?? dashboardProfile?.current_grade} />
              <ProfilePill label="Target" value={tutorProfile?.target_grade ?? dashboardProfile?.student_target_grade} />
              <ProfilePill label="Subject" value={tutorProfile?.preferred_subject ?? dashboardProfile?.preferred_subject} />
            </div>
            {reportSummary ? (
              <div className="mt-4 rounded-xl border border-primary-200/30 bg-white/60 px-4 py-3">
                <p className="rise-overline text-[9px] mb-1">
                  {reportDate ? `Report · ${reportDate}` : 'Latest report'}
                </p>
                <p className="text-sm leading-relaxed text-secondary-600">{reportSummary}</p>
              </div>
            ) : null}
          </section>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-3">
          <section className="glass-card-solid p-5">
            <p className="rise-overline text-[10px] mb-3">Homework set</p>
            {homework ? (
              <>
                <h2 className="text-2xl font-extrabold tracking-tight text-secondary-900">{homework}</h2>
                {homeworkInstructions ? (
                  <p className="mt-3 text-sm leading-relaxed text-secondary-500">{homeworkInstructions}</p>
                ) : null}
                <p className="mt-3 text-sm font-semibold text-primary-600">
                  {homeworkStatusLabel(homeworkStatus)}
                </p>
                {homeworkSuccess ? (
                  <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm font-semibold text-emerald-700">
                    {homeworkSuccess}
                  </p>
                ) : null}
                {homeworkError ? (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-sm font-semibold text-red-700">
                    {homeworkError}
                  </p>
                ) : null}
                {homeworkTask ? (
                  <div className="mt-5 grid gap-2">
                    <HomeworkStatusButton
                      homeworkTaskId={homeworkTask.id}
                      status="in_progress"
                      label={homeworkTask.status === 'in_progress' ? 'In progress' : 'Start'}
                      active={homeworkTask.status === 'in_progress'}
                    />
                    <HomeworkStatusButton
                      homeworkTaskId={homeworkTask.id}
                      status="completed"
                      label="Mark completed"
                      active={homeworkTask.status === 'completed'}
                    />
                    <HomeworkStatusButton
                      homeworkTaskId={homeworkTask.id}
                      status="need_help"
                      label="Need help"
                      active={homeworkTask.status === 'need_help'}
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-xs leading-relaxed text-secondary-400">
                    Your tutor set this before homework status tracking was connected.
                  </p>
                )}
              </>
            ) : (
              <EmptyTutorCard
                title="No homework has been set yet"
                body="When your tutor sets homework, it will show up here."
              />
            )}
          </section>

          <section className="glass-card-solid p-5">
            <p className="rise-overline text-[10px] mb-3">Focus for this week</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-secondary-900">{focusTopic}</h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary-500">
              This is based on your tutor profile, latest session notes, homework, and struggle areas.
            </p>
          </section>

          <section className="glass-card-solid p-5">
            <p className="rise-overline text-[10px] mb-3">Recommended practice</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-secondary-900">
              Practise: {focusTopic}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary-500">
              Your tutor has not linked a RISE lesson yet, but your next practice should focus here.
            </p>
            <Link href="/subjects" className="mt-5 inline-flex rise-btn-primary w-auto px-5 py-3 text-sm">
              Browse maths
            </Link>
          </section>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
          <div className="glass-card-solid p-5">
            <p className="rise-overline text-[10px] mb-3">Progress coming soon</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-secondary-900">
              App progress will sync back to your tutor here.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary-500">
              For now, your Tutor Key profile is connected. Next, lessons and quiz progress will be written into the shared Dashboard backend.
            </p>
          </div>

          <section className="glass-card-solid p-5">
            <p className="rise-overline text-[10px] mb-3">Recent app activity</p>
            {recentAppActivity.length ? (
              <div className="space-y-3">
                {recentAppActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-xl border border-primary-200/30 bg-white/60 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-secondary-900">
                        {activity.title || humaniseToken(activity.activity_type) || 'App activity'}
                      </p>
                      {activity.created_at ? (
                        <span className="text-[11px] font-semibold text-secondary-300">
                          {formatActivityTime(activity.created_at)}
                        </span>
                      ) : null}
                    </div>
                    {activity.description ? (
                      <p className="mt-1 text-xs leading-relaxed text-secondary-500">
                        {activity.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyTutorCard
                title="Activity will appear here"
                body="When you start lessons, practice, or quizzes in RISE, your tutor will be able to see the useful progress signals here later."
              />
            )}
          </section>

          <div className="flex flex-col gap-3">
            <Link href="/progress?focus=streak" className="block">
              <div className="glass-card-solid rise-card-interactive p-5">
                <p className="rise-overline text-[10px] mb-3">Daily streak</p>
                <p className="text-5xl font-extrabold leading-none text-secondary-900">🔥 {streak}</p>
                <p className="mt-2 text-sm text-secondary-400">Open full progress.</p>
              </div>
            </Link>

            <Link href="/progress?focus=xp" className="block">
              <div className="glass-card-solid rise-card-interactive p-5">
                <p className="rise-overline text-[10px] mb-3">XP total</p>
                <p className="text-5xl font-extrabold leading-none text-secondary-900">
                  ⚡ {xp.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-secondary-400">See the full breakdown.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Maths topics section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-secondary-900">Maths topics</h2>
            <Link
              href="/subjects"
              className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              Open maths →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {topicHighlights.map((topic) => (
              <Link key={topic.label} href="/subjects">
                <div className="glass-card rise-card-interactive h-full p-5">
                  <p className="text-xl font-bold leading-tight text-secondary-900">{topic.label}</p>
                  <p className="mt-2 text-sm text-secondary-400">{topic.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
  )
}

function InfoList({
  title,
  items,
  tone = 'primary',
}: {
  title: string
  items: string[]
  tone?: 'primary' | 'amber'
}) {
  const toneClasses =
    tone === 'amber'
      ? 'border-amber-200/60 bg-amber-50/70 text-amber-900'
      : 'border-primary-200/40 bg-primary-50/70 text-secondary-800'

  return (
    <div className="mt-4">
      <p className="rise-overline mb-2 text-[9px]">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${toneClasses}`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyTutorCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-primary-200/30 bg-white/55 px-4 py-5">
      <h2 className="text-2xl font-extrabold tracking-tight text-secondary-900">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-secondary-500">{body}</p>
    </div>
  )
}

function HomeworkStatusButton({
  homeworkTaskId,
  status,
  label,
  active,
}: {
  homeworkTaskId: string
  status: Exclude<HomeworkStatus, 'not_started'>
  label: string
  active?: boolean
}) {
  const buttonClass = active
    ? 'rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-bold text-primary-700'
    : 'rise-btn-outline rounded-xl px-4 py-3 text-sm'

  return (
    <form action={updateHomeworkStatus}>
      <input type="hidden" name="homework_task_id" value={homeworkTaskId} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`${buttonClass} w-full`}>
        {label}
      </button>
    </form>
  )
}

function ProfilePill({ label, value }: { label: string; value?: string | null }) {
  const displayValue = humaniseToken(value) ?? 'Not set yet'

  return (
    <div className="rounded-xl border border-primary-200/30 bg-primary-50/45 px-4 py-3">
      <p className="rise-overline mb-1 text-[9px]">{label}</p>
      <p className="text-sm font-bold capitalize text-secondary-900">{displayValue}</p>
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
        <span className="rise-chip">
          {lesson.lesson.topic?.subject?.name ?? 'Maths'} · {lesson.lesson.topic?.name}
        </span>
        <DifficultyBadge
          level={(lesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
          size="sm"
        />
      </div>

      <div>
        <h3 className="text-3xl font-extrabold leading-tight tracking-tight text-secondary-900">
          {lesson.lesson.title}
        </h3>
        <p className="mt-1 text-sm text-secondary-400">
          {lesson.lesson.type === 'learn' ? 'Learn' : 'Practise'} · +50 XP on completion
        </p>
      </div>

      <div className="space-y-2">
        {summary.map((point, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-xl border border-primary-200/20 bg-primary-50/60 px-3 py-2.5"
          >
            <span className="mt-0.5 text-sm font-semibold text-primary-600">•</span>
            <p className="text-sm text-secondary-700">{point}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
