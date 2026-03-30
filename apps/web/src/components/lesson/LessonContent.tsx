'use client'

import { useState } from 'react'
import type { Lesson, LessonBlock, DifficultyLevel } from '@rise/shared'
import { DIFFICULTY_CONFIG } from '@rise/shared'
import GenericMCQ from '@/components/artifacts/GenericMCQ'

interface LessonContentProps {
  lesson: Lesson
  difficultyLevel: DifficultyLevel
}

export default function LessonContent({ lesson, difficultyLevel }: LessonContentProps) {
  const [tryItDone, setTryItDone] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  if (!lesson.content) return null

  const { hook, blocks, try_it, summary, interactive_type, interactive_config } = lesson.content
  const config = DIFFICULTY_CONFIG[difficultyLevel]

  return (
    <div className="space-y-4">
      {/* Hook */}
      <div className={`rise-card border-l-4 border-[#7C3AED]`}>
        <p className="text-base font-bold text-gray-800 leading-relaxed">{hook}</p>
      </div>

      {/* Content blocks */}
      {blocks.map((block, i) => (
        <ContentBlock key={i} block={block} difficultyLevel={difficultyLevel} />
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
              onCorrect={() => setTryItDone(true)}
            />
          ) : (
            <div className="bg-white rounded-2xl p-4 border border-[#FCD34D]/30">
              <p className="text-xs text-slate-500 text-center">Interactive: {interactive_type}</p>
              <p className="text-xs text-slate-400 text-center mt-1">(Component coming soon)</p>
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
                <p className="text-xs font-bold text-green-700">
                  Answer: {try_it.answer}
                </p>
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

      {/* Mark complete CTA */}
      <div className="pt-2 pb-4">
        <button className="rise-btn-yellow text-sm font-black">
          Mark as complete ✓
        </button>
      </div>
    </div>
  )
}

function ContentBlock({ block, difficultyLevel }: { block: LessonBlock; difficultyLevel: DifficultyLevel }) {
  const blockStyles = {
    concept: {
      bg: 'bg-white',
      accent: 'border-l-4 border-[#7C3AED]',
      icon: '💡',
    },
    rule: {
      bg: 'bg-[#F3F0FF]',
      accent: 'border-l-4 border-[#7C3AED]',
      icon: '📏',
    },
    example: {
      bg: 'bg-white',
      accent: 'border-l-4 border-[#FCD34D]',
      icon: '🔍',
    },
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
