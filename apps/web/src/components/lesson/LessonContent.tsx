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
      <div className="rise-card text-center py-10">
        <span className="text-5xl mb-4 block">🎉</span>
        <h2 className="text-xl font-black text-gray-900 mb-1">Lesson complete!</h2>
        <p className="text-sm text-slate-500 mb-6">
          Marked as{' '}
          <span className="font-bold">{DIFFICULTY_CONFIG[selectedDifficulty!].label}</span>
        </p>
        <a href="/subjects" className="rise-btn-primary block">
          Back to subjects
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Hook */}
      <div className="rise-card border-l-4 border-[#7C3AED]">
        <p className="text-base font-bold text-gray-800 leading-relaxed">{hook}</p>
      </div>

      {/* Content blocks */}
      {blocks.map((block, i) => (
        <ContentBlock key={i} block={block} />
      ))}

      {/* Try It */}
      {try_it && (
        <div className="rise-card border border-[#FCD34D]/40 bg-[#FFFBEB]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✏️</span>
            <h3 className="text-base font-black text-gray-900">Try It</h3>
          </div>

          <p className="text-sm font-semibold text-gray-800 mb-4 leading-relaxed">
            {try_it.question}
          </p>

          {interactive_type === 'generic_mcq' ? (
            <GenericMCQ
              config={interactive_config as { options: { label: string; correct: boolean }[] }}
              correctAnswer={try_it.answer}
              onCorrect={() => setMcqCorrect(true)}
            />
          ) : (
            <div className="bg-white rounded-2xl p-4 border border-[#FCD34D]/30 text-center">
              <p className="text-xs text-slate-500">Interactive: {interactive_type}</p>
              <p className="text-xs text-slate-400 mt-1">(Component coming soon)</p>
            </div>
          )}

          {!showSolution && (
            <button
              onClick={() => setShowSolution(true)}
              className="mt-3 text-xs font-bold text-[#7C3AED] underline underline-offset-2"
            >
              Show worked solution
            </button>
          )}

          {showSolution && (
            <div className="mt-3 bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-black text-gray-700 mb-2">Worked Solution</p>
              <ol className="space-y-1">
                {try_it.worked_solution.map((step, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="font-bold text-[#7C3AED] flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-green-700">Answer: {try_it.answer}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {summary.length > 0 && (
        <div className="rise-card bg-[#F3F0FF]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚡</span>
            <h3 className="text-base font-black text-gray-900">Key Points</h3>
          </div>
          <ul className="space-y-2">
            {summary.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-[#7C3AED] font-black flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Self-assessment + Mark complete */}
      <div className="rise-card border-2 border-[#7C3AED]/10">
        <h3 className="text-base font-black text-gray-900 mb-1">How did you find this?</h3>
        <p className="text-xs text-slate-500 mb-4">Be honest — it helps set your next lesson difficulty.</p>

        <div className="space-y-2 mb-4">
          {SELF_ASSESS.map((opt) => (
            <button
              key={opt.level}
              onClick={() => setSelectedDifficulty(opt.level)}
              className={`w-full text-left rounded-2xl border-2 px-4 py-3 transition-all ${
                selectedDifficulty === opt.level
                  ? 'border-[#7C3AED] bg-[#F3F0FF]'
                  : 'border-gray-100 bg-white hover:border-[#7C3AED]/30'
              }`}
            >
              <p className="text-sm font-black text-gray-900">{opt.label}</p>
              <p className="text-xs text-slate-500">{opt.sub}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleComplete}
          disabled={!selectedDifficulty || isPending}
          className={`rise-btn-yellow text-sm transition-opacity ${
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
    concept: { bg: 'bg-white', accent: 'border-l-4 border-[#7C3AED]', icon: '💡' },
    rule: { bg: 'bg-[#F3F0FF]', accent: 'border-l-4 border-[#7C3AED]', icon: '📏' },
    example: { bg: 'bg-white', accent: 'border-l-4 border-[#FCD34D]', icon: '🔍' },
  }

  const style = blockStyles[block.type]

  return (
    <div className={`rounded-3xl shadow-sm p-5 ${style.bg} ${style.accent}`}>
      <div className="flex items-start gap-2 mb-2">
        <span className="text-base flex-shrink-0">{style.icon}</span>
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">{block.heading}</h3>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3">{block.body}</p>

      {block.formula && (
        <div className="bg-[#EDE9FF] rounded-2xl px-4 py-3 text-center mb-3">
          <code className="text-sm font-black text-[#7C3AED]">{block.formula}</code>
        </div>
      )}

      {block.steps && block.steps.length > 0 && (
        <ol className="space-y-1.5 mb-3">
          {block.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {block.answer && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-2">
          <p className="text-xs font-black text-green-700">Answer: {block.answer}</p>
        </div>
      )}
    </div>
  )
}
