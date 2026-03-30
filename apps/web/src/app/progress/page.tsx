import { createClient } from '@/lib/supabase/server'
import type { LessonProgress, DifficultyLevel } from '@rise/shared'
import { DIFFICULTY_CONFIG } from '@rise/shared'

interface WeekDay {
  date: Date
  label: string
  completed: number
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
  { name: 'Bronze', minXp: 0, maxXp: 200, emoji: '🥉', color: '#CD7F32' },
  { name: 'Silver', minXp: 200, maxXp: 500, emoji: '🥈', color: '#94A3B8' },
  { name: 'Gold', minXp: 500, maxXp: 1000, emoji: '🥇', color: '#F59E0B' },
  { name: 'Platinum', minXp: 1000, maxXp: 2000, emoji: '💎', color: '#7C3AED' },
  { name: 'Diamond', minXp: 2000, maxXp: 9999, emoji: '💠', color: '#06B6D4' },
]

function getTier(xp: number) {
  return SEASON_TIERS.findLast((t) => xp >= t.minXp) ?? SEASON_TIERS[0]
}

function getNextTier(xp: number) {
  return SEASON_TIERS.find((t) => xp < t.maxXp) ?? SEASON_TIERS[SEASON_TIERS.length - 1]
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="rise-page flex flex-col items-center justify-center min-h-[70dvh] text-center">
        <span className="text-4xl mb-4">⭐</span>
        <h1 className="text-xl font-black text-gray-900 mb-2">Sign in to track progress</h1>
        <p className="text-sm text-slate-500">Your Battle Pass and XP are waiting</p>
      </div>
    )
  }

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', user.id)

  const allProgress: LessonProgress[] = progressRows ?? []
  const completed = allProgress.filter((p) => p.completed_at)

  // XP: 10 per completed lesson, +5 bonus for confident
  const xp = completed.reduce((sum, p) => {
    return sum + 10 + (p.difficulty_level === 'confident' ? 5 : 0)
  }, 0)

  const currentTier = getTier(xp)
  const nextTier = getNextTier(xp)
  const tierPct = Math.min(
    Math.round(((xp - currentTier.minXp) / (nextTier.maxXp - currentTier.minXp)) * 100),
    100
  )

  // Weekly strip
  const weekDays = getWeekStrip()
  const completedThisWeek = completed.filter((p) => {
    if (!p.completed_at) return false
    const d = new Date(p.completed_at)
    const day = weekDays.find((w) => w.date.toDateString() === d.toDateString())
    if (day) day.completed++
    return true
  })

  // Difficulty breakdown
  const diffBreakdown = allProgress.reduce<Record<DifficultyLevel, number>>(
    (acc, p) => {
      acc[p.difficulty_level as DifficultyLevel] = (acc[p.difficulty_level as DifficultyLevel] ?? 0) + 1
      return acc
    },
    { building: 0, getting_there: 0, confident: 0 }
  )

  return (
    <div className="rise-page">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Progress</h1>
        <p className="text-sm text-slate-500 mt-1">Season 1 · Spring 2025</p>
      </div>

      {/* Battle Pass Tier Card */}
      <div className="rise-card mb-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Tier</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentTier.emoji}</span>
              <h2 className="text-xl font-black text-gray-900">{currentTier.name}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">XP</p>
            <p className="text-2xl font-black" style={{ color: currentTier.color }}>{xp}</p>
          </div>
        </div>

        {/* XP progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>{currentTier.name}</span>
            <span>{nextTier.name} at {nextTier.minXp} XP</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${tierPct}%`, backgroundColor: currentTier.color }}
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 text-right">
          {nextTier.minXp - xp} XP to {nextTier.name}
        </p>
      </div>

      {/* Weekly strip */}
      <div className="rise-card mb-4">
        <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">This Week</p>
        <div className="flex justify-between gap-1">
          {weekDays.map((day, i) => {
            const isToday = day.date.toDateString() === new Date().toDateString()
            const hasDone = day.completed > 0

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-black ${
                  isToday
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : hasDone
                    ? 'bg-[#EDE9FF] text-[#7C3AED]'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {hasDone ? '⭐' : day.label}
                </div>
                <span className={`text-[10px] font-bold ${isToday ? 'text-[#7C3AED]' : 'text-slate-400'}`}>
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rise-card p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{completed.length}</p>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Lessons done</p>
        </div>
        <div className="rise-card p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{xp}</p>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Total XP</p>
        </div>
        <div className="rise-card p-4 text-center">
          <p className="text-2xl font-black text-gray-900">
            {completedThisWeek.length}
          </p>
          <p className="text-xs font-bold text-slate-400 mt-0.5">This week</p>
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="rise-card">
        <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Difficulty Breakdown</p>
        <div className="space-y-3">
          {(Object.keys(diffBreakdown) as DifficultyLevel[]).map((level) => {
            const count = diffBreakdown[level]
            const config = DIFFICULTY_CONFIG[level]
            const total = allProgress.length
            const pct = total > 0 ? Math.round((count / total) * 100) : 0

            return (
              <div key={level}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold ${config.tailwindText}`}>
                    {config.emoji} {config.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{count} lessons</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      level === 'building' ? 'bg-red-400' :
                      level === 'getting_there' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
