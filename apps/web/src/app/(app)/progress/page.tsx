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
        <div className="rise-card max-w-md text-center">
          <span className="mb-4 block text-4xl">⭐</span>
          <h1 className="text-[2rem] font-black leading-none text-[#1d1830]">Sign in to view progress</h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-[#6f6a84]">
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
      <div className="mb-6 flex flex-col gap-4 border-b border-[#ede6fb] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a39cb8]">Maths progress</p>
          <h1 className="mt-2 text-[2.55rem] font-black leading-none text-[#1f1833]">See the full picture</h1>
          <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-[#6f6a84]">
            This page is the full-screen version of the clickable home cards: streak, XP, momentum, and lesson readiness all in one place.
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
        <div className="mb-6 rise-card">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a7a0bd]">Fresh start</p>
          <h2 className="mt-2 text-[2rem] font-black leading-none text-[#1d1830]">No maths progress yet</h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#6f6a84]">
            Once the student completes lessons, this page will start tracking streaks, XP, tier movement, and how confidently they are handling the work.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <div className={`rise-card overflow-hidden ${focus === 'xp' ? 'rise-focus-ring' : ''}`}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b0abc0]">Exam readiness</p>
                <p className="mt-3 text-[4.5rem] font-black leading-none text-[#9224ff]">{examReady}%</p>
                <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#eee8fb]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#c17bff_0%,#962aff_45%,#7C3AED_100%)]"
                    style={{ width: `${examReady}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm font-black">
                  <span className="text-[#a49cb9]">Core secure</span>
                  <span className="text-[#8c2eff]">Grade 7 push</span>
                </div>
              </div>

              <div className="rounded-[1rem] bg-[linear-gradient(180deg,#faf6ff_0%,#f3ebff_100%)] p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#aa9fd0]">XP view</p>
                <p className="mt-3 text-[2.6rem] font-black leading-none text-[#251b48]">{xp} XP</p>
                <p className="mt-2 text-sm font-medium text-[#6f6a84]">
                  {Math.max(1, 7 - completed.length)} more completions to feel visibly different on the board.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[0.95rem] bg-white/80 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#aba4bf]">Lessons done</p>
                    <p className="mt-2 text-2xl font-black text-[#241d39]">{completed.length}</p>
                  </div>
                  <div className="rounded-[0.95rem] bg-white/80 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#aba4bf]">This week</p>
                    <p className="mt-2 text-2xl font-black text-[#241d39]">{completedThisWeek.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`rise-card ${focus === 'streak' ? 'rise-focus-ring' : ''}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-black uppercase tracking-[0.12em] text-[#6a27cb]">Weekly streak</p>
              <p className="text-sm font-black text-[#b36cff]">{challengeDaysDone} / 7 done</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-7">
              {weekDays.map((day, index) => {
                const isToday = day.date.toDateString() === new Date().toDateString()
                const hasDone = day.completed > 0

                return (
                  <div key={index} className="flex items-center gap-3 rounded-[1rem] bg-[#faf7ff] p-3 sm:block sm:bg-transparent sm:p-0">
                    <div
                      className={`flex aspect-square w-11 items-center justify-center rounded-[0.95rem] text-[11px] font-black sm:w-full ${
                        isToday
                          ? 'bg-[#ffd84f] text-[#7b5200] shadow-md'
                          : hasDone
                          ? 'bg-[#8f2eff] text-white'
                          : 'bg-[#f5f1fb] text-[#d1cbde]'
                      }`}
                    >
                      {isToday ? 'TODAY' : hasDone ? '✓' : day.label.toUpperCase()}
                    </div>
                    <span
                      className={`text-[10px] font-bold sm:mt-2 sm:block sm:text-center ${
                        isToday ? 'text-[#7C3AED]' : 'text-slate-400'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[1rem] bg-[#f7f1ff] px-4 py-3">
              <p className="text-sm font-black text-[#7C3AED]">Weekly reward path: +500 XP bonus</p>
              <p className="text-sm font-bold text-[#aba4bf]">{challengeDaysDone}/7</p>
            </div>
          </div>

          <div className="rise-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#5f22bc]">Maths roadmap</p>
                <p className="mt-1 text-sm font-medium text-[#8d88a7]">
                  {currentTier.emoji} {currentTier.name} · {xp} XP total
                </p>
              </div>
              <span className="rounded-[999px] bg-[#8f2eff] px-3 py-1 text-sm font-black text-white">
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
                    className={`flex items-center gap-3 rounded-[1rem] px-3 py-3 ${
                      isCurrent ? 'border-2 border-[#f1c93d] bg-[#fff8dc]' : 'bg-[#f7f1ff]'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                        isCurrent ? 'bg-[#ffd84f] text-[#7b5200]' : 'bg-[#8f2eff] text-white'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-black ${isCurrent ? 'text-[#8a6200]' : 'text-[#5d22b3]'}`}>
                        {topic}
                      </p>
                      {isCurrent ? (
                        <div className="mt-2 h-1.5 rounded-full bg-[#f4e6a6]">
                          <div className="h-full w-1/3 rounded-full bg-[#e1b000]" />
                        </div>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#8f2eff]">+50 XP</p>
                      <p className="text-xs font-bold text-[#b4aec7]">{isDone ? '✓' : isCurrent ? 'Current' : 'Locked'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rise-card bg-[linear-gradient(180deg,#241a4a_0%,#18142f_100%)] text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">What this page is for</p>
            <h3 className="mt-3 text-[2rem] font-black leading-none">A full-page maths progress view.</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              The home cards now act like doors into this screen instead of dead summary blocks.
            </p>
          </div>

          <div className="rise-card">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#5f22bc]">Difficulty breakdown</p>
            <div className="mt-4 space-y-3">
              {(Object.keys(diffBreakdown) as DifficultyLevel[]).map((level) => {
                const count = diffBreakdown[level]
                const config = DIFFICULTY_CONFIG[level]
                const total = allProgress.length
                const pct = total > 0 ? Math.round((count / total) * 100) : 0

                return (
                  <div key={level}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`text-xs font-bold ${config.tailwindText}`}>
                        {config.emoji} {config.label}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{count} lessons</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#ede7f8]">
                      <div
                        className={`h-full rounded-full ${
                          level === 'building'
                            ? 'bg-red-400'
                            : level === 'getting_there'
                            ? 'bg-yellow-400'
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

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rise-card p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#aba4bf]">Current tier</p>
              <p className="mt-3 text-[2.2rem] font-black leading-none text-[#241d39]">
                {currentTier.emoji} {currentTier.name}
              </p>
              <p className="mt-2 text-sm font-medium text-[#7f7a92]">
                {Math.max(0, nextTier.minXp - xp)} XP to {nextTier.name}
              </p>
              <div className="mt-4 h-2 rounded-full bg-[#eee8fb]">
                <div className="h-full rounded-full bg-[#8f2eff]" style={{ width: `${tierPct}%` }} />
              </div>
            </div>

            <div className="rise-card p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#aba4bf]">Completed lessons</p>
              <p className="mt-3 text-[2.2rem] font-black leading-none text-[#241d39]">{completed.length}</p>
              <p className="mt-2 text-sm font-medium text-[#7f7a92]">
                Every completion makes the next recommendation a bit smarter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
