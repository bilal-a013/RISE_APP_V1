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
      <div className="rise-card py-10 text-center">
        <span className="text-5xl mb-4 block">🎉</span>
        <h2 className="mb-1 text-xl font-black text-[#1e1935]">Lesson complete!</h2>
        <p className="mb-6 text-sm text-slate-500">
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
      <div className="rise-soft-panel border-l-4 border-[#b14dff] px-4 py-4">
        <p className="text-base font-medium leading-relaxed text-[#7d29f0]">{hook}</p>
      </div>

      {blocks.map((block, i) => (
        <ContentBlock key={i} block={block} />
      ))}

      {try_it && (
        <div className="rise-card border border-[#ffe082] bg-[linear-gradient(180deg,#fff7dd_0%,#fffdf2_100%)]">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">✏️</span>
            <h3 className="text-base font-black text-[#211d35]">Try It</h3>
          </div>

          <p className="mb-4 text-sm font-semibold leading-relaxed text-gray-800">
            {try_it.question}
          </p>

          {interactive_type === 'generic_mcq' ? (
            <GenericMCQ
              config={interactive_config as { options: { label: string; correct: boolean }[] }}
              correctAnswer={try_it.answer}
              onCorrect={() => setMcqCorrect(true)}
            />
          ) : (
            <div className="rounded-2xl border border-[#FCD34D]/30 bg-white p-4 text-center">
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
            <div className="mt-3 rounded-[1.5rem] border border-gray-100 bg-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-gray-700">Worked Solution</p>
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
        <div className="rise-card bg-[linear-gradient(180deg,#f5edff_0%,#f9f5ff_100%)]">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h3 className="text-base font-black text-[#271f4d]">Key Points</h3>
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

      <div className="rise-card border-2 border-[#eddfff]">
        <h3 className="mb-1 text-base font-black text-[#221d37]">How did you find this?</h3>
        <p className="mb-4 text-xs text-slate-500">Be honest — it helps set your next lesson difficulty.</p>

        <div className="space-y-2 mb-4">
          {SELF_ASSESS.map((opt) => (
            <button
              key={opt.level}
              onClick={() => setSelectedDifficulty(opt.level)}
              className={`w-full text-left rounded-2xl border-2 px-4 py-3 transition-all ${
                selectedDifficulty === opt.level
                  ? 'border-[#7C3AED] bg-[#f5ecff] shadow-[0_10px_24px_rgba(124,58,237,0.08)]'
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
    concept: { bg: 'bg-white', accent: 'border-l-4 border-[#b14dff]', icon: '💡' },
    rule: { bg: 'bg-[#f7f2ff]', accent: 'border-l-4 border-[#8f2eff]', icon: '📏' },
    example: { bg: 'bg-[#fff8e2]', accent: 'border-l-4 border-[#f0bf24]', icon: '🔍' },
  }

  const style = blockStyles[block.type]

  return (
    <div className={`rounded-[2rem] p-5 shadow-[0_12px_28px_rgba(71,46,143,0.08)] ${style.bg} ${style.accent}`}>
      <div className="mb-2 flex items-start gap-2">
        <span className="text-base flex-shrink-0">{style.icon}</span>
        <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">{block.heading}</h3>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3">{block.body}</p>

      {block.formula && (
        <div className="mb-3 rounded-[1.4rem] bg-[#efe3ff] px-4 py-4 text-center">
          <code className="text-lg font-black text-[#7C3AED]">{block.formula}</code>
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
