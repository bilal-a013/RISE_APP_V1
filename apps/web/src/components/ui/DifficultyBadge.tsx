import { DIFFICULTY_CONFIG, type DifficultyLevel } from '@rise/shared'

interface DifficultyBadgeProps {
  level: DifficultyLevel
  size?: 'sm' | 'md'
}

export default function DifficultyBadge({ level, size = 'md' }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[level]

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border ${config.tailwindBg} ${config.tailwindText} ${config.tailwindBorder} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
