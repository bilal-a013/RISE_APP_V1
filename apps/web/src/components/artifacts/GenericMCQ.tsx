'use client'

import { useState } from 'react'

interface MCQOption {
  label: string
  correct: boolean
}

interface GenericMCQProps {
  config: { options: MCQOption[] }
  correctAnswer: string
  onCorrect?: () => void
}

export default function GenericMCQ({ config, correctAnswer, onCorrect }: GenericMCQProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const options = config?.options ?? []

  function handleSelect(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    if (options[idx]?.correct) {
      onCorrect?.()
    }
  }

  return (
    <div className="space-y-2">
      {options.map((opt, idx) => {
        const isSelected = selected === idx
        const isCorrect = opt.correct
        const showResult = selected !== null

        let stateClass = 'border-gray-200 bg-white hover:border-[#7C3AED]/40 hover:bg-[#F8F3FF]'
        if (showResult && isSelected && isCorrect) {
          stateClass = 'border-green-400 bg-green-50'
        } else if (showResult && isSelected && !isCorrect) {
          stateClass = 'border-red-400 bg-red-50'
        } else if (showResult && isCorrect) {
          stateClass = 'border-green-300 bg-green-50/50'
        }

        return (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={selected !== null}
            className={`w-full rounded-[1.4rem] border-2 px-4 py-3 text-left transition-all shadow-[0_10px_24px_rgba(71,46,143,0.05)] ${stateClass}`}
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
              <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
            </div>
          </button>
        )
      })}

      {selected !== null && (
        <div className={`mt-1 rounded-[1.4rem] px-4 py-3 ${
          options[selected]?.correct ? 'bg-green-100' : 'bg-red-50'
        }`}>
          <p className={`text-sm font-bold ${
            options[selected]?.correct ? 'text-green-700' : 'text-red-700'
          }`}>
            {options[selected]?.correct ? '✅ Correct!' : `❌ Not quite — the answer is ${correctAnswer}`}
          </p>
        </div>
      )}
    </div>
  )
}
