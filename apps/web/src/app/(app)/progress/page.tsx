import { createClient } from '@/lib/supabase/server'
import { isMathsSubject } from '@/lib/onboarding'
import { DIFFICULTY_CONFIG, type DifficultyLevel, type LessonProgress } from '@rise/shared'

interface ProgressPageProps {
  searchParams: {
    focus?: string
  }
}

interface WeekDay {
  date: Date
  label: string
  completed: number
}

interface ProgressRow extends LessonProgress {
  lesson: {
    topic: {
      subject: {
        name: string | null
        slug: string | null
      } | null
    } | null
  } | null
}

function getWeekStrip(): WeekDay[] {
  const today = new Date()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push({
      date: d,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }).charAt(0),
      completed: 0,
    })
  }
  return days
}

const SEASON_TIERS = [
  { name: 'Bronze', minXp: 0, maxXp: 200, emoji: '🥉' },
  { name: 'Silver', minXp: 200, maxXp: 500, emoji: '🥈' },
  { name: 'Gold', minXp: 500, maxXp: 1000, emoji: '🥇' },
  { name: 'Platinum', minXp: 1000, maxXp: 2000, emoji: '💎' },
  { name: 'Diamond', minXp: 2000, maxXp: 9999, emoji: '💠' },
]

function getTier(xp: number) {
  return SEASON_TIERS.findLast((tier) => xp >= tier.minXp) ?? SEASON_TIERS[0]
}

function getNextTier(xp: number) {
  return SEASON_TIERS.find((tier) => xp < tier.maxXp) ?? SEASON_TIERS[SEASON_TIERS.length - 1]
}

export default async function ProgressPage({ searchParams }: ProgressPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="rise-page flex min-h-[70dvh] items-center justify-center">
        <div className="glass-card-solid max-w-md p-8 text-center">
          <span className="mb-4 block text-5xl">⭐</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-secondary-900">Sign in to view progress</h1>
          <p className="mt-3 text-sm text-secondary-400 leading-relaxed">
            The streak, XP, and maths progress view unlock once the student is inside the app.
          </p>
        </div>
      </div>
    )
  }

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        topic:topics(
          subject:subjects(name, slug)
        )
      )
    `)
    .eq('student_id', user.id)

  const allProgress = ((progressRows ?? []) as ProgressRow[]).filter((row) =>
    isMathsSubject(row.lesson?.topic?.subject)
  )
  const completed = allProgress.filter((progress) => progress.completed_at)
  const xp = completed.length * 50
  const currentTier = getTier(xp)
  const nextTier = getNextTier(xp)
  const tierPct = Math.min(
    Math.round(((xp - currentTier.minXp) / Math.max(1, nextTier.maxXp - currentTier.minXp)) * 100),
    100
  )
  const weekDays = getWeekStrip()
  const completedThisWeek = completed.filter((progress) => {
    if (!progress.completed_at) return false
    const completedDate = new Date(progress.completed_at)
    const day = weekDays.find((weekDay) => weekDay.date.toDateString() === completedDate.toDateString())
    if (day) day.completed += 1
    return true
  })

  const diffBreakdown = allProgress.reduce<Record<DifficultyLevel, number>>(
    (accumulator, progress) => {
      accumulator[progress.difficulty_level as DifficultyLevel] =
        (accumulator[progress.difficulty_level as DifficultyLevel] ?? 0) + 1
      return accumulator
    },
    { building: 0, getting_there: 0, confident: 0 }
  )

  const examReady = Math.min(100, completed.length * 14 + (allProgress.length ? 10 : 0))
  const challengeDaysDone = Math.min(7, Math.max(1, completedThisWeek.length + (completed.length > 0 ? 1 : 0)))
  const focus = searchParams.focus === 'streak' || searchParams.focus === 'xp' ? searchParams.focus : null

  return (
    <div className="rise-page rise-page-wide">

      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-primary-200/30 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="rise-overline mb-2">Maths progress</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-secondary-900 lg:text-5xl">
            See the full{' '}
            <span className="rise-gradient-text">picture</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-secondary-400 leading-relaxed">
            Streak, XP, momentum, and lesson readiness all in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rise-chip">
            <span>🔥 {Math.max(1, completedThisWeek.length + 1)} day streak</span>
          </div>
          <div className="rise-chip">
            <span>
              {currentTier.emoji} {currentTier.name}
            </span>
          </div>
        </div>
      </div>

      {allProgress.length === 0 ? (
        <div className="mb-6 glass-card-solid p-6">
          <p className="rise-overline text-[10px] mb-2">Fresh start</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-secondary-900">No maths progress yet</h2>
          <p className="mt-3 max-w-2xl text-sm text-secondary-400 leading-relaxed">
            Once you complete lessons, this page will start tracking streaks, XP, tier movement, and how confidently you are handling the work.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <div className="space-y-4">

          {/* Exam readiness + XP */}
          <div className={`glass-card-solid p-6 overflow-hidden ${focus === 'xp' ? 'rise-focus-ring' : ''}`}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div>
                <p className="rise-overline text-[10px] mb-3">Exam readiness</p>
                <p className="text-6xl font-extrabold leading-none rise-gradient-text">{examReady}%</p>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-primary-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${examReady}%`,
                      background: 'linear-gradient(90deg, #C4B5FD 0%, #8B5CF6 45%, #7C3AED 100%)',
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                  <span className="text-secondary-300">Core secure</span>
                  <span className="text-primary-600">Grade 7 push</span>
                </div>
              </div>

              <div className="rounded-xl border border-primary-200/30 bg-primary-50/60 p-5">
                <p className="rise-overline text-[10px] mb-3">XP view</p>
                <p className="text-4xl font-extrabold leading-none text-secondary-900">{xp} XP</p>
                <p className="mt-2 text-sm text-secondary-400">
                  {Math.max(1, 7 - completed.length)} more completions to feel visibly different.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-xl bg-white/70 border border-primary-100/60 p-3">
                    <p className="rise-overline text-[9px] mb-1">Lessons done</p>
                    <p className="text-2xl font-extrabold text-secondary-900">{completed.length}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 border border-primary-100/60 p-3">
                    <p className="rise-overline text-[9px] mb-1">This week</p>
                    <p className="text-2xl font-extrabold text-secondary-900">{completedThisWeek.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly streak */}
          <div className={`glass-card-solid p-6 ${focus === 'streak' ? 'rise-focus-ring' : ''}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="rise-overline">Weekly streak</p>
              <p className="text-sm font-semibold text-secondary-400">{challengeDaysDone} / 7 done</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-7">
              {weekDays.map((day, index) => {
                const isToday = day.date.toDateString() === new Date().toDateString()
                const hasDone = day.completed > 0

                return (
                  <div key={index} className="flex items-center gap-3 rounded-xl bg-white/40 p-3 sm:block sm:bg-transparent sm:p-0">
                    <div
                      className={`flex aspect-square w-10 items-center justify-center rounded-xl text-[10px] font-bold sm:w-full ${
                        isToday
                          ? 'shadow-sm text-amber-700'
                          : hasDone
                          ? 'text-white'
                          : 'text-secondary-300'
                      }`}
                      style={{
                        background: isToday
                          ? '#FCD34D'
                          : hasDone
                          ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                          : 'rgba(255,255,255,0.5)',
                        border: isToday || hasDone ? 'none' : '1px solid rgba(124,58,237,0.1)',
                      }}
                    >
                      {isToday ? 'TODAY' : hasDone ? '✓' : day.label.toUpperCase()}
                    </div>
                    <span
                      className={`text-[10px] font-semibold sm:mt-2 sm:block sm:text-center ${
                        isToday ? 'text-primary-600' : 'text-secondary-300'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-50 border border-primary-200/30 px-4 py-3">
              <p className="text-sm font-semibold text-primary-700">Weekly reward path: +500 XP bonus</p>
              <p className="text-sm font-semibold text-secondary-400">{challengeDaysDone}/7</p>
            </div>
          </div>

          {/* Maths roadmap */}
          <div className="glass-card-solid p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="rise-overline text-[10px] mb-1">Maths roadmap</p>
                <p className="text-sm text-secondary-400">
                  {currentTier.emoji} {currentTier.name} · {xp} XP total
                </p>
              </div>
              <span className="rise-chip">
                Level {Math.max(1, completed.length + 1)}
              </span>
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              {[
                'Linear equations',
                'Collecting like terms',
                'Substitution',
                'Expanding brackets',
                'Factorising basics',
                'Simultaneous equations',
              ].map((topic, index) => {
                const isCurrent = index === Math.min(completed.length, 5)
                const isDone = index < completed.length

                return (
                  <div
                    key={topic}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 border ${
                      isCurrent
                        ? 'border-amber-300/60 bg-amber-50/80'
                        : 'border-primary-100/40 bg-white/40'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isCurrent ? 'text-amber-700' : isDone ? 'text-white' : 'text-secondary-300'
                      }`}
                      style={{
                        background: isCurrent
                          ? '#FCD34D'
                          : isDone
                          ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                          : 'rgba(255,255,255,0.6)',
                        border: isDone || isCurrent ? 'none' : '1px solid rgba(124,58,237,0.15)',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${isCurrent ? 'text-amber-800' : 'text-secondary-900'}`}>
                        {topic}
                      </p>
                      {isCurrent ? (
                        <div className="mt-1.5 h-1.5 rounded-full bg-amber-200">
                          <div className="h-full w-1/3 rounded-full bg-amber-400" />
                        </div>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">+50 XP</p>
                      <p className="text-xs text-secondary-300">{isDone ? '✓' : isCurrent ? 'Current' : 'Locked'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Info card */}
          <div
            className="p-6 rounded-2xl border border-primary-200/20"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-3">What this page is for</p>
            <h3 className="text-2xl font-extrabold leading-tight text-white">A full-page maths progress view.</h3>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              The home cards now act like doors into this screen instead of dead summary blocks.
            </p>
          </div>

          {/* Difficulty breakdown */}
          <div className="glass-card-solid p-6">
            <p className="rise-overline mb-4">Difficulty breakdown</p>
            <div className="space-y-4">
              {(Object.keys(diffBreakdown) as DifficultyLevel[]).map((level) => {
                const count = diffBreakdown[level]
                const config = DIFFICULTY_CONFIG[level]
                const total = allProgress.length
                const pct = total > 0 ? Math.round((count / total) * 100) : 0

                return (
                  <div key={level}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className={`text-xs font-semibold ${config.tailwindText}`}>
                        {config.emoji} {config.label}
                      </span>
                      <span className="text-xs text-secondary-300">{count} lessons</span>
                    </div>
                    <div className="h-2 rounded-full bg-primary-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          level === 'building'
                            ? 'bg-red-400'
                            : level === 'getting_there'
                            ? 'bg-amber-400'
                            : 'bg-green-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tier + completed cards */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="glass-card-solid p-5">
              <p className="rise-overline text-[10px] mb-3">Current tier</p>
              <p className="text-3xl font-extrabold leading-none text-secondary-900">
                {currentTier.emoji} {currentTier.name}
              </p>
              <p className="mt-2 text-sm text-secondary-400">
                {Math.max(0, nextTier.minXp - xp)} XP to {nextTier.name}
              </p>
              <div className="mt-4 h-2 rounded-full bg-primary-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${tierPct}%`,
                    background: 'linear-gradient(90deg, #A78BFA 0%, #7C3AED 100%)',
                  }}
                />
              </div>
            </div>

            <div className="glass-card-solid p-5">
              <p className="rise-overline text-[10px] mb-3">Completed lessons</p>
              <p className="text-3xl font-extrabold leading-none text-secondary-900">{completed.length}</p>
              <p className="mt-2 text-sm text-secondary-400">
                Every completion makes the next recommendation a bit smarter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
