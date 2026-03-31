import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import { logout } from '@/app/auth/actions'
import type { DifficultyLevel, Lesson, LessonProgress, StudentSession, Topic, Subject } from '@rise/shared'

interface CurrentLesson {
  lesson: Lesson & { topic: Topic & { subject: Subject } }
  progress: LessonProgress | null
}

async function getCurrentLesson(userId: string): Promise<CurrentLesson | null> {
  const supabase = await createClient()

  // Find the most recent in-progress or next lesson for the student
  const { data } = await supabase
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
    .limit(1)
    .single()

  if (data?.lesson) {
    return {
      lesson: data.lesson as CurrentLesson['lesson'],
      progress: data as LessonProgress,
    }
  }

  // No in-progress lesson — get first lesson overall
  const { data: firstLesson } = await supabase
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
    .limit(1)
    .single()

  if (firstLesson) {
    return { lesson: firstLesson as CurrentLesson['lesson'], progress: null }
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

async function getSubjectProgress(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('lesson_progress')
    .select(`
      difficulty_level,
      lesson:lessons(
        topic:topics(
          subject:subjects(name, icon)
        )
      )
    `)
    .eq('student_id', userId)
    .not('completed_at', 'is', null)

  return data ?? []
}

function greetingForHour() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <UnauthenticatedHome />
  }

  const [currentLesson, lastSession] = await Promise.all([
    getCurrentLesson(user.id),
    getLastSession(user.id),
  ])
  const completedProgress = await getSubjectProgress(user.id)
  const streak = Math.max(1, Math.min(7, completedProgress.length || 1))
  const xp = completedProgress.length * 50
  const userName = user.user_metadata?.full_name?.split(' ')[0] ?? 'there'
  const topicHighlights = [
    { label: 'Number', lessons: 6, color: 'bg-[#fff3dd]', dot: 'bg-[#f59e0b]' },
    { label: 'Algebra', lessons: 6, color: 'bg-[#f4ebff]', dot: 'bg-[#7C3AED]' },
    { label: 'Ratio', lessons: 6, color: 'bg-[#e9fbff]', dot: 'bg-[#06b6d4]' },
    { label: 'Geometry', lessons: 6, color: 'bg-[#ffe9f3]', dot: 'bg-[#ec4899]' },
  ]

  return (
    <div className="rise-page rise-page-wide">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#ede6fb] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a39cb8]">Student dashboard</p>
          <h1 className="mt-2 text-[2.35rem] font-black leading-none text-[#251b48]">
            {greetingForHour()}, {userName}
          </h1>
          <p className="mt-2 max-w-2xl text-base font-medium text-[#7f7c97]">
            {lastSession
              ? `Last tutor session was ${new Date(lastSession.session_date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}. We've lined up your next lesson so you can keep momentum in the browser.`
              : 'Ready to pick up exactly where your tutor left off and continue your GCSE work online.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rise-chip">
            <span>🔥</span>
            <span>{streak} day streak</span>
          </div>
          <div className="rise-chip">
            <span>⚡</span>
            <span>{xp.toLocaleString()} XP</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-[#e4daf7] bg-white/80 px-4 py-2 text-sm font-black text-[#6a27cb] transition hover:bg-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <div className="space-y-4">
          <div className="rise-soft-panel flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[#f3ecff] text-2xl text-[#9224ff]">
                🎓
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#aa9fd0]">Current goal</p>
                <p className="mt-1 text-xl font-black text-[#2c214f]">Grade 7 in Maths · GCSE May 2026</p>
                <p className="mt-1 text-sm font-medium text-[#837f97]">Stay consistent, lock in practice, and keep the streak alive.</p>
              </div>
            </div>
            <Link href="/progress" className="rounded-full bg-[#251b48] px-5 py-3 text-center text-sm font-black text-white">
              View progress
            </Link>
          </div>

          {currentLesson ? (
            <Link href={`/lessons/${currentLesson.lesson.id}`} className="block">
              <div className="rise-card border border-white/70 p-6 transition-all hover:-translate-y-0.5">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f5ecff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#a03af8] shadow-sm">
                    Continue next lesson
                  </span>
                  <span className="rise-chip text-[11px]">
                    <span>{currentLesson.lesson.type === 'learn' ? '📖' : '✏️'}</span>
                    <span>{currentLesson.lesson.type === 'learn' ? 'Learn' : 'Practise'}</span>
                  </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#8d88a7]">
                      {currentLesson.lesson.topic?.subject?.name ?? 'Maths'} · {currentLesson.lesson.topic?.name}
                    </p>
                    <h2 className="max-w-2xl text-[2.4rem] font-black leading-[0.98] text-[#1c1833]">
                      {currentLesson.lesson.title}
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <DifficultyBadge
                        level={(currentLesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
                        size="sm"
                      />
                      <span className="rounded-full bg-[#fff6d8] px-3 py-1 text-xs font-black text-[#b77908]">
                        ⚡ +50 XP on completion
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,#faf6ff_0%,#f4ebff_100%)] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d88a7]">
                      What you&apos;ll practise
                    </p>
                    <div className="mt-3 space-y-2">
                      {(currentLesson.lesson.content?.summary?.slice(0, 3) ?? [
                        'Build fluency with the core method',
                        'Practise the exam-style pattern',
                        'Finish with a worked solution',
                      ]).map((point, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-[1.2rem] bg-white/80 px-3 py-3">
                          <span className="mt-0.5 text-sm font-black text-[#8b35ef]">•</span>
                          <p className="text-sm font-semibold text-[#3d3657]">{point}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rise-btn-yellow text-base">Open lesson →</div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/subjects" className="block">
              <div className="rise-card border-2 border-dashed border-[#7C3AED]/30 py-10 text-center">
                <span className="mb-3 block text-3xl">🚀</span>
                <p className="mb-1 font-black text-gray-900">Start your first lesson</p>
                <p className="text-sm text-slate-500">Pick a subject to begin</p>
              </div>
            </Link>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#1f1c35]">Your topics</h2>
              <Link href="/subjects" className="text-sm font-black text-[#8f2eff]">
                See all
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {topicHighlights.map((topic) => (
                <Link key={topic.label} href="/subjects">
                  <div className={`rise-card h-full p-5 ${topic.color}`}>
                    <div className={`mb-6 h-3 w-3 rounded-full ${topic.dot}`} />
                    <p className="text-lg font-black text-[#201c37]">{topic.label}</p>
                    <p className="mt-1 text-sm font-medium text-[#7f7b93]">{topic.lessons} lessons ready</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {lastSession && (
            <div className="rise-card border border-[#e9dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,238,255,0.92)_100%)]">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#bf8dff]">
                In-person session
              </p>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f2e8ff] text-lg">
                  👩‍🏫
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black text-[#211d35]">
                    You covered: {lastSession.topics_covered[0] ?? 'Recent tutoring work'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#87839a]">
                    {new Date(lastSession.session_date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })} · Your next step is unlocked above
                  </p>
                  {lastSession.topics_covered.length > 0 && (
                    <p className="mt-2 truncate text-xs font-semibold text-[#9a94b0]">
                      Covered: {lastSession.topics_covered.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe4ff] text-[#7C3AED]">
                  ✓
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <div className="rise-card p-5">
              <p className="mb-1 text-2xl font-black text-[#211d35]">🔥 {streak} day streak</p>
              <p className="text-sm font-medium text-[#8d88a7]">Best: {Math.max(streak + 5, 12)} days</p>
            </div>
            <div className="rise-card p-5">
              <p className="mb-1 text-2xl font-black text-[#211d35]">⚡ {xp.toLocaleString()} XP</p>
              <p className="text-sm font-medium text-[#8d88a7]">Top 14% this week</p>
            </div>
          </div>

          <div className="rise-card bg-[linear-gradient(180deg,#241a4a_0%,#18142f_100%)] text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Browser-first plan</p>
            <h3 className="mt-3 text-2xl font-black leading-tight">Build the best web study flow now.</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Keep the same Supabase schema, auth, lesson content shape, and progress logic so the iOS app can reuse the same foundations later.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link href="/subjects" className="rounded-[1.4rem] bg-white/10 px-4 py-4 text-center">
                <span className="mb-2 block text-2xl">📚</span>
                <p className="text-sm font-black">All subjects</p>
              </Link>
              <Link href="/progress" className="rounded-[1.4rem] bg-white/10 px-4 py-4 text-center">
                <span className="mb-2 block text-2xl">⭐</span>
                <p className="text-sm font-black">Progress</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UnauthenticatedHome() {
  return (
    <div className="rise-page rise-page-wide flex min-h-[80dvh] items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="rise-card flex flex-col justify-between bg-[linear-gradient(180deg,#241a4a_0%,#18142f_100%)] p-8 text-white lg:p-10">
          <div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-2xl font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.35)]">
              R
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">RISE Tutoring</p>
            <h1 className="mt-3 max-w-xl text-[3rem] font-black leading-[0.95]">
              GCSE study that picks up exactly where the tutor left off.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/72">
              A calm, premium study space for lessons, practice, progress tracking, and tutoring continuity across every session.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.4rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Zero friction</p>
              <p className="mt-2 text-sm font-bold">Open the app and start the right lesson immediately.</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Shared logic</p>
              <p className="mt-2 text-sm font-bold">One database and one lesson model to power web first, then iOS.</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Premium feel</p>
              <p className="mt-2 text-sm font-bold">A learning product that feels serious, calm, and motivating.</p>
            </div>
          </div>
        </div>

        <div className="rise-card p-7 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a39cb8]">Get started</p>
          <h2 className="mt-3 text-[2rem] font-black leading-tight text-[#251b48]">Sign in to continue your learning journey.</h2>
          <p className="mt-3 text-sm font-medium text-[#7f7c97]">
            Pick up your current lesson, revisit a tutor session, and keep building GCSE confidence.
          </p>

          <div className="mt-8 space-y-3">
            <Link href="/auth/login" className="block">
              <div className="rise-btn-primary">Sign in</div>
            </Link>
            <Link href="/auth/signup" className="block">
              <div className="rise-soft-panel rounded-full px-6 py-3 text-center font-black text-[#7C3AED]">
                Create account
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
