'use client'

import { useState, useTransition } from 'react'
import type { Lesson, LessonBlock, DifficultyLevel } from '@rise/shared'
import { DIFFICULTY_CONFIG } from '@rise/shared'
import GenericMCQ from '@/components/artifacts/GenericMCQ'
import { completelesson } from '@/app/actions/lesson'

interface LessonContentProps {
  lesson: Lesson
  difficultyLevel: DifficultyLevel
}

const SELF_ASSESS: { level: DifficultyLevel; label: string; sub: string }[] = [
  { level: 'building', label: '🔴 Still working on it', sub: 'I need more practice' },
  { level: 'getting_there', label: '🟡 Getting there', sub: 'I mostly understand it' },
  { level: 'confident', label: '🟢 Got it!', sub: 'I could explain this to someone' },
]

export default function LessonContent({ lesson, difficultyLevel }: LessonContentProps) {
  const [showSolution, setShowSolution] = useState(false)
  const [mcqCorrect, setMcqCorrect] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null)
  const [completed, setCompleted] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!lesson.content) return null

  const { hook, blocks, try_it, summary, interactive_type, interactive_config } = lesson.content

  function handleComplete() {
    if (!selectedDifficulty) return
    startTransition(async () => {
      const score = mcqCorrect ? 1 : 0
      const result = await completelesson(lesson.id, selectedDifficulty, score)
      if (!result.error) setCompleted(true)
    })
  }

  if (completed) {
    return (
      <div className="glass-card-solid py-12 text-center">
        <span className="text-5xl mb-4 block">🎉</span>
        <h2 className="mb-1 text-2xl font-extrabold tracking-tight text-secondary-900">Lesson complete!</h2>
        <p className="mb-6 text-sm text-secondary-400">
          Marked as{' '}
          <span className="font-semibold">{DIFFICULTY_CONFIG[selectedDifficulty!].label}</span>
        </p>
        <a href="/subjects" className="rise-btn-primary inline-flex w-auto px-8">
          Back to subjects
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Hook */}
      <div className="glass-card border-l-4 border-primary-400 px-5 py-4">
        <p className="text-base leading-relaxed text-primary-700 font-medium">{hook}</p>
      </div>

      {blocks.map((block, i) => (
        <ContentBlock key={i} block={block} />
      ))}

      {try_it && (
        <div className="glass-card-solid border border-amber-200/50 bg-amber-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">✏️</span>
            <h3 className="text-base font-bold text-secondary-900">Try It</h3>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-secondary-700">
            {try_it.question}
          </p>

          {interactive_type === 'generic_mcq' ? (
            <GenericMCQ
              config={interactive_config as { options: { label: string; correct: boolean }[] }}
              correctAnswer={try_it.answer}
              onCorrect={() => setMcqCorrect(true)}
            />
          ) : (
            <div className="rounded-xl border border-primary-100 bg-white/60 p-4 text-center">
              <p className="text-xs text-secondary-300">Interactive: {interactive_type}</p>
              <p className="text-xs text-secondary-300 mt-1">(Component coming soon)</p>
            </div>
          )}

          {!showSolution && (
            <button
              onClick={() => setShowSolution(true)}
              className="mt-3 text-xs font-semibold text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors"
            >
              Show worked solution
            </button>
          )}

          {showSolution && (
            <div className="mt-3 rounded-xl border border-primary-100/60 bg-white/70 p-4">
              <p className="mb-2 rise-overline text-[9px]">Worked Solution</p>
              <ol className="space-y-1">
                {try_it.worked_solution.map((step, i) => (
                  <li key={i} className="text-sm text-secondary-700 flex gap-2">
                    <span className="font-semibold text-primary-600 flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-2 pt-2 border-t border-primary-100/40">
                <p className="text-xs font-semibold text-green-700">Answer: {try_it.answer}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {summary.length > 0 && (
        <div className="glass-card-solid border border-primary-200/30 bg-primary-50/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h3 className="text-base font-bold text-secondary-900">Key Points</h3>
          </div>
          <ul className="space-y-2">
            {summary.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
                <span className="text-primary-600 font-semibold flex-shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Self-assessment */}
      <div className="glass-card-solid border border-primary-200/30 p-5">
        <h3 className="mb-1 text-base font-bold text-secondary-900">How did you find this?</h3>
        <p className="mb-4 text-xs text-secondary-400">Be honest — it helps set your next lesson difficulty.</p>

        <div className="space-y-2 mb-4">
          {SELF_ASSESS.map((opt) => (
            <button
              key={opt.level}
              onClick={() => setSelectedDifficulty(opt.level)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-200 ${
                selectedDifficulty === opt.level
                  ? 'border-primary-400/60 bg-primary-50 shadow-card'
                  : 'border-secondary-200/30 bg-white/60 hover:border-primary-300/50 hover:bg-white/80'
              }`}
            >
              <p className="text-sm font-semibold text-secondary-900">{opt.label}</p>
              <p className="text-xs text-secondary-400">{opt.sub}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleComplete}
          disabled={!selectedDifficulty || isPending}
          className={`rise-btn-primary text-sm transition-opacity ${
            !selectedDifficulty || isPending ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? 'Saving...' : 'Mark as complete ✓'}
        </button>
      </div>
    </div>
  )
}

function ContentBlock({ block }: { block: LessonBlock }) {
  const blockStyles = {
    concept: {
      bg: 'bg-white/70',
      borderAccent: 'border-l-4 border-primary-400',
      icon: '💡',
    },
    rule: {
      bg: 'bg-primary-50/60',
      borderAccent: 'border-l-4 border-primary-600',
      icon: '📏',
    },
    example: {
      bg: 'bg-amber-50/60',
      borderAccent: 'border-l-4 border-amber-400',
      icon: '🔍',
    },
  }

  const style = blockStyles[block.type]

  return (
    <div className={`rounded-2xl border border-primary-100/40 p-5 ${style.bg} ${style.borderAccent}`}>
      <div className="mb-2 flex items-start gap-2">
        <span className="text-base flex-shrink-0">{style.icon}</span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-700">{block.heading}</h3>
      </div>

      <p className="text-sm text-secondary-700 leading-relaxed mb-3">{block.body}</p>

      {block.formula && (
        <div className="mb-3 rounded-xl bg-primary-50 border border-primary-200/40 px-4 py-4 text-center">
          <code className="text-lg font-bold text-primary-700">{block.formula}</code>
        </div>
      )}

      {block.steps && block.steps.length > 0 && (
        <ol className="space-y-1.5 mb-3">
          {block.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
              <span className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
              >
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {block.answer && (
        <div className="bg-green-50 border border-green-200/60 rounded-xl px-4 py-2">
          <p className="text-xs font-semibold text-green-700">Answer: {block.answer}</p>
        </div>
      )}
    </div>
  )
}
