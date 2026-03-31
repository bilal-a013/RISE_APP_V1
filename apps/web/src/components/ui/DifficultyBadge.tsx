import { DIFFICULTY_CONFIG, type DifficultyLevel } from '@rise/shared'

interface DifficultyBadgeProps {
  level: DifficultyLevel
  size?: 'sm' | 'md'
}

export default function DifficultyBadge({ level, size = 'md' }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[level]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold shadow-[0_8px_16px_rgba(124,58,237,0.06)] ${config.tailwindBg} ${config.tailwindText} ${config.tailwindBorder} ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
