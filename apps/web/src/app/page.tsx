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

  return (
    <div className="rise-page">
      {/* Greeting + logout */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-[#7C3AED] mb-1">Good morning 👋</p>
          <h1 className="text-2xl font-black text-gray-900">Ready to rise?</h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs font-bold text-slate-400 hover:text-slate-600 mt-1"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Current Lesson Card — zero friction */}
      {currentLesson ? (
        <Link href={`/lessons/${currentLesson.lesson.id}`} className="block mb-4">
          <div className="rise-card border border-[#7C3AED]/10 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider mb-1">
                  {currentLesson.lesson.topic?.subject?.name ?? 'Maths'} · {currentLesson.lesson.topic?.name}
                </p>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  {currentLesson.lesson.title}
                </h2>
              </div>
              <span className="ml-3 text-2xl">
                {currentLesson.lesson.type === 'learn' ? '📖' : '✏️'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <DifficultyBadge
                level={(currentLesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
                size="sm"
              />
              <span className="text-xs font-semibold text-slate-400 capitalize">
                {currentLesson.lesson.type === 'learn' ? 'Learn' : 'Practise'}
              </span>
            </div>

            <div className="mt-4">
              <div className="rise-btn-primary text-sm py-3">
                Continue lesson →
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <Link href="/subjects" className="block mb-4">
          <div className="rise-card border-2 border-dashed border-[#7C3AED]/30 text-center py-8">
            <span className="text-3xl mb-3 block">🚀</span>
            <p className="font-black text-gray-900 mb-1">Start your first lesson</p>
            <p className="text-sm text-slate-500">Pick a subject to begin</p>
          </div>
        </Link>
      )}

      {/* Last Tutor Session */}
      {lastSession && (
        <div className="rise-card mb-4 bg-gradient-to-r from-[#7C3AED]/5 to-[#EDE9FF]/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">👩‍🏫</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider mb-0.5">
                Last Tutor Session
              </p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(lastSession.session_date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              {lastSession.topics_covered.length > 0 && (
                <p className="text-xs text-slate-500 mt-1 truncate">
                  Covered: {lastSession.topics_covered.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/subjects">
          <div className="rise-card p-4 text-center hover:shadow-xl transition-shadow">
            <span className="text-2xl mb-2 block">📚</span>
            <p className="text-sm font-black text-gray-900">All Subjects</p>
          </div>
        </Link>
        <Link href="/progress">
          <div className="rise-card p-4 text-center hover:shadow-xl transition-shadow">
            <span className="text-2xl mb-2 block">⭐</span>
            <p className="text-sm font-black text-gray-900">Progress</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function UnauthenticatedHome() {
  return (
    <div className="rise-page flex flex-col items-center justify-center min-h-[80dvh] text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#7C3AED] mb-2">RISE</h1>
        <p className="text-lg font-bold text-gray-700">GCSE Study, Supercharged</p>
        <p className="text-sm text-slate-500 mt-2">
          Pick up exactly where your tutor left off.
        </p>
      </div>

      <div className="w-full space-y-3">
        <Link href="/auth/login" className="block">
          <div className="rise-btn-primary">Sign in</div>
        </Link>
        <Link href="/auth/signup" className="block">
          <div className="bg-white text-[#7C3AED] font-black rounded-2xl px-6 py-3 w-full text-center border border-[#7C3AED]/20 transition-opacity active:opacity-80">
            Create account
          </div>
        </Link>
      </div>
    </div>
  )
}
