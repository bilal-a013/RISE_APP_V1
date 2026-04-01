'use client'

import { useState } from 'react'

interface MCQOption {
  label: string
  correct: boolean
}

interface GenericMCQProps {
  config: { question?: string; options: MCQOption[] }
  correctAnswer?: string
  onCorrect?: () => void
  onWrong?: () => void
}

export default function GenericMCQ({ config, correctAnswer, onCorrect, onWrong }: GenericMCQProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const options = config?.options ?? []

  function handleSelect(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    if (options[idx]?.correct) {
      onCorrect?.()
    } else {
      onWrong?.()
    }
  }

  return (
    <div className="space-y-2">
      {config.question && (
        <p className="text-sm font-semibold text-secondary-900 mb-3">{config.question}</p>
      )}
      {options.map((opt, idx) => {
        const isSelected = selected === idx
        const isCorrect = opt.correct
        const showResult = selected !== null

        let stateClass = 'border-secondary-200/30 bg-white/60 hover:border-primary-300/50 hover:bg-white/80'
        if (showResult && isSelected && isCorrect) {
          stateClass = 'border-green-400/60 bg-green-50/80'
        } else if (showResult && isSelected && !isCorrect) {
          stateClass = 'border-red-400/60 bg-red-50/80'
        } else if (showResult && isCorrect) {
          stateClass = 'border-green-300/60 bg-green-50/50'
        }

        return (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={selected !== null}
            className={`w-full rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ${stateClass}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                showResult && isCorrect
                  ? 'border-green-500 bg-green-500'
                  : showResult && isSelected
                  ? 'border-red-500 bg-red-500'
                  : isSelected
                  ? 'border-[#7C3AED] bg-[#7C3AED]'
                  : 'border-gray-300'
              }`}>
                {showResult && isCorrect && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {showResult && isSelected && !isCorrect && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold text-secondary-900">{opt.label}</span>
            </div>
          </button>
        )
      })}

      {selected !== null && (
        <div className={`mt-1 rounded-xl px-4 py-3 border ${
          options[selected]?.correct ? 'bg-green-50/80 border-green-200/50' : 'bg-red-50/80 border-red-200/50'
        }`}>
          <p className={`text-sm font-bold ${
            options[selected]?.correct ? 'text-green-700' : 'text-red-700'
          }`}>
            {options[selected]?.correct
              ? '✅ Correct!'
              : correctAnswer
              ? `❌ Not quite — the answer is ${correctAnswer}`
              : '❌ Not quite — try the worked solution below'}
          </p>
        </div>
      )}
    </div>
  )
}
