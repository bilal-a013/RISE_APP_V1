'use client'

import { useState, useTransition } from 'react'
import type {
  Lesson,
  LessonBlock,
  DifficultyLevel,
  LearnLessonContent,
  PractiseLessonContent,
  PracticeQuestion,
  CommonMistake,
} from '@rise/shared'
import {
  DIFFICULTY_CONFIG,
  isLearnContent,
  isPractiseContent,
} from '@rise/shared'
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [isPending, startTransition] = useTransition()

  if (!lesson.content) return null

  function handleComplete() {
    if (!selectedDifficulty) return
    startTransition(async () => {
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

  const selfAssessSection = (
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
  )

  if (isLearnContent(lesson.content)) {
    return (
      <LearnRenderer
        content={lesson.content}
        difficultyLevel={difficultyLevel}
        selfAssessSection={selfAssessSection}
      />
    )
  }

  if (isPractiseContent(lesson.content)) {
    return (
      <PractiseRenderer
        content={lesson.content}
        difficultyLevel={difficultyLevel}
        onScoreChange={setScore}
        selfAssessSection={selfAssessSection}
      />
    )
  }

  // Legacy v1 content
  return (
    <LegacyRenderer
      lesson={lesson}
      selfAssessSection={selfAssessSection}
    />
  )
}

// ─── Learn Renderer ───────────────────────────────────────────────────────────

function LearnRenderer({
  content,
  difficultyLevel,
  selfAssessSection,
}: {
  content: LearnLessonContent
  difficultyLevel: DifficultyLevel
  selfAssessSection: React.ReactNode
}) {
  const { intro, why_it_matters, explanation, visual, worked_example, summary, scaffolding } = content
  const isBuilding = difficultyLevel === 'building'
  const isConfident = difficultyLevel === 'confident'

  return (
    <div className="space-y-4">
      {/* 1. Intro */}
      <div className="glass-card border-l-4 border-primary-400 px-5 py-4">
        <p className="rise-overline text-[10px] mb-1">What you will learn</p>
        <p className="text-base leading-relaxed text-primary-700 font-medium">{intro.what_you_will_learn}</p>
      </div>

      {/* Building: simplified explanation (shown early, before main content) */}
      {isBuilding && scaffolding?.simplified_explanation && (
        <div className="glass-card-solid border border-blue-200/50 bg-blue-50/40 px-5 py-4">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-base">🧭</span>
            <p className="rise-overline text-[10px]">A simpler way to think about it</p>
          </div>
          <p className="text-sm leading-relaxed text-secondary-700">{scaffolding.simplified_explanation}</p>
        </div>
      )}

      {/* 2. Why it matters */}
      <div className="glass-card-solid p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">🎯</span>
          <h3 className="text-sm font-bold text-secondary-900">Why this matters</h3>
        </div>
        <ul className="space-y-2">
          {why_it_matters.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
              <span className="text-primary-500 font-bold flex-shrink-0 mt-0.5">→</span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Explanation */}
      <div className="rounded-2xl border border-primary-100/40 p-5 bg-white/70 border-l-4 border-l-primary-400">
        <div className="mb-2 flex items-start gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-700">The Method</h3>
        </div>
        <p className="text-sm text-secondary-700 leading-relaxed mb-3">{explanation.body}</p>

        {explanation.formula && (
          <div className="mb-3 rounded-xl bg-primary-50 border border-primary-200/40 px-4 py-4 text-center">
            <code className="text-lg font-bold text-primary-700">{explanation.formula}</code>
          </div>
        )}

        {explanation.key_terms && explanation.key_terms.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="rise-overline text-[10px]">Key terms</p>
            {explanation.key_terms.map((kt, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-primary-700 flex-shrink-0">{kt.term}:</span>
                <span className="text-secondary-600 leading-relaxed">{kt.definition}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Building: extra hints */}
      {isBuilding && scaffolding?.extra_hints && scaffolding.extra_hints.length > 0 && (
        <div className="glass-card-solid border border-blue-200/50 bg-blue-50/40 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-base">💬</span>
            <h3 className="text-sm font-bold text-secondary-900">Extra hints</h3>
          </div>
          <ul className="space-y-2">
            {scaffolding.extra_hints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
                <span className="text-blue-500 font-bold flex-shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Visual / Interactive */}
      <div className="glass-card-solid border border-amber-200/50 bg-amber-50/30 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">🖥️</span>
          <h3 className="text-base font-bold text-secondary-900">Check your understanding</h3>
        </div>
        {visual.interactive_type === 'generic_mcq' ? (
          <GenericMCQ
            config={visual.config as { question?: string; options: { label: string; correct: boolean }[] }}
            onCorrect={() => {}}
          />
        ) : (
          <div className="rounded-xl border border-primary-100 bg-white/60 p-4 text-center">
            <p className="text-xs text-secondary-300">Interactive: {visual.interactive_type}</p>
            <p className="text-xs text-secondary-300 mt-1">(Component coming soon)</p>
          </div>
        )}
        {visual.caption && (
          <p className="mt-3 text-xs text-secondary-400 italic">{visual.caption}</p>
        )}
      </div>

      {/* 5. Worked example */}
      <WorkedExampleBlock
        question={worked_example.question}
        steps={worked_example.steps}
        answer={worked_example.answer}
      />

      {/* 6. Summary */}
      <SummaryBlock points={summary} />

      {/* Confident: extension note */}
      {isConfident && scaffolding?.extension_note && (
        <div className="glass-card-solid border border-purple-200/50 bg-purple-50/40 p-5">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-base">🚀</span>
            <p className="rise-overline text-[10px]">Extension</p>
          </div>
          <p className="text-sm leading-relaxed text-secondary-700">{scaffolding.extension_note}</p>
        </div>
      )}

      {/* Self-assessment */}
      {selfAssessSection}
    </div>
  )
}

// ─── Practise Renderer ────────────────────────────────────────────────────────

function PractiseRenderer({
  content,
  difficultyLevel,
  onScoreChange,
  selfAssessSection,
}: {
  content: PractiseLessonContent
  difficultyLevel: DifficultyLevel
  onScoreChange: (score: number) => void
  selfAssessSection: React.ReactNode
}) {
  const { orientation, worked_example, questions, common_mistakes, summary } = content
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  function handleCorrect() {
    const newCount = correctCount + 1
    setCorrectCount(newCount)
    setAnsweredCount((a) => a + 1)
    onScoreChange(newCount)
  }

  function handleAnswered() {
    setAnsweredCount((a) => a + 1)
  }

  return (
    <div className="space-y-4">
      {/* Orientation */}
      <div className="glass-card border-l-4 border-primary-400 px-5 py-4">
        <p className="rise-overline text-[10px] mb-1">Practise session</p>
        <p className="text-base leading-relaxed text-primary-700 font-medium">{orientation}</p>
      </div>

      {/* Worked example (model answer before questions) */}
      <WorkedExampleBlock
        question={worked_example.question}
        steps={worked_example.steps}
        answer={worked_example.answer}
        defaultOpen
      />

      {/* Questions */}
      <div className="glass-card-solid p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">✏️</span>
            <h3 className="text-base font-bold text-secondary-900">5 Questions</h3>
          </div>
          {answeredCount > 0 && (
            <span className="rise-chip text-xs">
              {correctCount}/{answeredCount} correct
            </span>
          )}
        </div>
        <div className="space-y-5">
          {questions.map((q, i) => (
            <PractiseQuestion
              key={i}
              index={i}
              question={q}
              difficultyLevel={difficultyLevel}
              onCorrect={handleCorrect}
              onAnswered={handleAnswered}
            />
          ))}
        </div>
      </div>

      {/* Common mistakes */}
      <div className="glass-card-solid p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <h3 className="text-base font-bold text-secondary-900">Common mistakes</h3>
        </div>
        <div className="space-y-3">
          {common_mistakes.map((m, i) => (
            <CommonMistakeBlock key={i} mistake={m} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <SummaryBlock points={summary} />

      {/* Self-assessment */}
      {selfAssessSection}
    </div>
  )
}

function PractiseQuestion({
  index,
  question,
  difficultyLevel,
  onCorrect,
  onAnswered,
}: {
  index: number
  question: PracticeQuestion
  difficultyLevel: DifficultyLevel
  onCorrect: () => void
  onAnswered: () => void
}) {
  const [answered, setAnswered] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const isBuilding = difficultyLevel === 'building'

  function handleCorrect() {
    if (!answered) {
      setAnswered(true)
      onCorrect()
      onAnswered()
    }
  }

  function handleWrong() {
    if (!answered) {
      setAnswered(true)
      onAnswered()
    }
  }

  return (
    <div className="rounded-xl border border-primary-100/40 bg-white/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
        >
          {index + 1}
        </span>
        <p className="text-sm font-semibold text-secondary-900">{question.question}</p>
      </div>

      {/* Building: show hint before they attempt */}
      {isBuilding && question.hint && !answered && (
        <div className="mb-3 rounded-lg bg-blue-50/60 border border-blue-200/40 px-3 py-2">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Hint:</span> {question.hint}
          </p>
        </div>
      )}

      {question.interactive_type === 'generic_mcq' && question.interactive_config ? (
        <GenericMCQ
          config={question.interactive_config as { options: { label: string; correct: boolean }[] }}
          correctAnswer={question.answer}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      ) : (
        <div className="rounded-xl border border-primary-100 bg-white/60 p-3 text-center">
          <p className="text-xs font-semibold text-secondary-700">Answer: {question.answer}</p>
        </div>
      )}

      {!showSolution && (
        <button
          onClick={() => setShowSolution(true)}
          className="mt-2 text-xs font-semibold text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors"
        >
          Show worked solution
        </button>
      )}

      {showSolution && (
        <div className="mt-3 rounded-xl border border-primary-100/60 bg-white/70 p-4">
          <p className="mb-2 rise-overline text-[9px]">Worked Solution</p>
          <ol className="space-y-1">
            {question.worked_solution.map((step, i) => (
              <li key={i} className="text-sm text-secondary-700 flex gap-2">
                <span className="font-semibold text-primary-600 flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-2 pt-2 border-t border-primary-100/40">
            <p className="text-xs font-semibold text-green-700">Answer: {question.answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CommonMistakeBlock({ mistake }: { mistake: CommonMistake }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-amber-200/50 bg-amber-50/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm flex-shrink-0 mt-0.5">❌</span>
        <p className="text-sm font-semibold text-secondary-900 flex-1">{mistake.mistake}</p>
        <span className="text-xs text-secondary-400 flex-shrink-0 mt-0.5">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-amber-200/40">
          <div className="pt-3">
            <p className="rise-overline text-[9px] mb-1">Why it's wrong</p>
            <p className="text-sm text-secondary-700 leading-relaxed">{mistake.why_wrong}</p>
          </div>
          <div className="rounded-lg bg-green-50/60 border border-green-200/40 px-3 py-2">
            <p className="rise-overline text-[9px] mb-1">Correction</p>
            <p className="text-sm text-green-800 leading-relaxed">{mistake.correction}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Legacy Renderer (v1) ─────────────────────────────────────────────────────

function LegacyRenderer({
  lesson,
  selfAssessSection,
}: {
  lesson: Lesson
  selfAssessSection: React.ReactNode
}) {
  const [showSolution, setShowSolution] = useState(false)
  const [mcqCorrect, setMcqCorrect] = useState(false)

  if (!lesson.content) return null

  // v1 content — access fields directly (no version guard needed here)
  const content = lesson.content as {
    hook: string
    blocks: LessonBlock[]
    interactive_type: string
    interactive_config: Record<string, unknown>
    try_it: { question: string; interactive_config: Record<string, unknown>; answer: string; worked_solution: string[] }
    summary: string[]
  }

  const { hook, blocks, try_it, summary, interactive_type, interactive_config } = content
  void interactive_type
  void interactive_config
  void mcqCorrect

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
          <p className="mb-4 text-sm leading-relaxed text-secondary-700">{try_it.question}</p>
          <GenericMCQ
            config={try_it.interactive_config as { options: { label: string; correct: boolean }[] }}
            correctAnswer={try_it.answer}
            onCorrect={() => setMcqCorrect(true)}
          />
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

      <SummaryBlock points={summary} />
      {selfAssessSection}
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function WorkedExampleBlock({
  question,
  steps,
  answer,
  defaultOpen = false,
}: {
  question: string
  steps: string[]
  answer: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="glass-card-solid border border-amber-200/50 bg-amber-50/30 p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 mb-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🔍</span>
          <h3 className="text-base font-bold text-secondary-900">Worked example</h3>
        </div>
        <span className="text-xs text-secondary-400">{open ? '▲ Hide' : '▼ Show'}</span>
      </button>
      <p className="text-sm text-secondary-600 mb-3">{question}</p>
      {open && (
        <>
          <ol className="space-y-1.5 mb-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
                <span
                  className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <div className="bg-green-50 border border-green-200/60 rounded-xl px-4 py-2">
            <p className="text-xs font-semibold text-green-700">Answer: {answer}</p>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryBlock({ points }: { points: string[] }) {
  return (
    <div className="glass-card-solid border border-primary-200/30 bg-primary-50/50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <h3 className="text-base font-bold text-secondary-900">Key Points</h3>
      </div>
      <ul className="space-y-2">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
            <span className="text-primary-600 font-semibold flex-shrink-0 mt-0.5">•</span>
            <span className="leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContentBlock({ block }: { block: LessonBlock }) {
  const blockStyles = {
    concept: { bg: 'bg-white/70', borderAccent: 'border-l-4 border-primary-400', icon: '💡' },
    rule: { bg: 'bg-primary-50/60', borderAccent: 'border-l-4 border-primary-600', icon: '📏' },
    example: { bg: 'bg-amber-50/60', borderAccent: 'border-l-4 border-amber-400', icon: '🔍' },
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
              <span
                className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
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
