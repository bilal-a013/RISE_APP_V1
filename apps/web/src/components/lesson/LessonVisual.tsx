'use client'

import { useMemo, useState } from 'react'
import type {
  LessonVisual as LessonVisualType,
  StepThroughVisual,
  SliderFormulaVisual,
  VisualDiagramVisual,
} from '@rise/shared'

export default function LessonVisual({ visual }: { visual: LessonVisualType }) {
  switch (visual.type) {
    case 'step_through':
      return <StepThrough visual={visual} />
    case 'slider_formula':
      return <SliderFormula visual={visual} />
    case 'visual_diagram':
      return <VisualDiagram visual={visual} />
  }
}

// ─── Step Through ─────────────────────────────────────────────────────────────

function StepThrough({ visual }: { visual: StepThroughVisual }) {
  const { steps } = visual.data
  const total = steps.length
  const [index, setIndex] = useState(0)

  if (total === 0) {
    return (
      <div className="rounded-xl border border-primary-100 bg-white/60 p-4 text-center text-xs text-secondary-400">
        No steps provided.
      </div>
    )
  }

  const current = steps[Math.min(index, total - 1)]
  const atStart = index === 0
  const atEnd = index >= total - 1

  return (
    <div className="rounded-2xl border border-primary-100/60 bg-white/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="rise-overline text-[10px]">Step {index + 1} of {total}</p>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i <= index ? 'bg-primary-500' : 'bg-primary-100'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mb-4 min-h-[64px] rounded-xl bg-primary-50/60 border border-primary-200/40 px-4 py-4">
        <p className="text-sm leading-relaxed text-secondary-800">{current}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={atStart}
          className={`rise-btn-outline text-xs px-4 py-1.5 ${atStart ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={atEnd}
          className={`rise-btn-primary text-xs px-4 py-1.5 ${atEnd ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Slider Formula ───────────────────────────────────────────────────────────

function SliderFormula({ visual }: { visual: SliderFormulaVisual }) {
  const { formula, variables } = visual.data
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(variables.map((v) => [v.name, v.default])),
  )

  const substituted = useMemo(() => substituteFormula(formula, values), [formula, values])
  const computed = useMemo(() => evaluateFormula(substituted), [substituted])

  return (
    <div className="rounded-2xl border border-primary-100/60 bg-white/70 p-5">
      <div className="mb-4 rounded-xl bg-primary-50 border border-primary-200/40 px-4 py-4 text-center">
        <p className="rise-overline text-[10px] mb-1">Formula</p>
        <code className="block text-base font-semibold text-primary-700">{formula}</code>
        <div className="mt-2 pt-2 border-t border-primary-200/40">
          <code className="block text-lg font-bold text-primary-800">
            = {substituted}
            {computed !== null && (
              <span className="text-secondary-700"> = {formatNumber(computed)}</span>
            )}
          </code>
        </div>
      </div>

      <div className="space-y-4">
        {variables.map((v) => {
          const value = values[v.name] ?? v.default
          return (
            <div key={v.name}>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor={`slider-${v.name}`} className="text-xs font-semibold text-secondary-700">
                  {v.label}
                </label>
                <span className="text-xs font-mono text-primary-700">{value}</span>
              </div>
              <input
                id={`slider-${v.name}`}
                type="range"
                min={v.min}
                max={v.max}
                value={value}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [v.name]: Number(e.target.value) }))
                }
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-[10px] text-secondary-400">
                <span>{v.min}</span>
                <span>{v.max}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function substituteFormula(formula: string, values: Record<string, number>): string {
  const names = Object.keys(values).sort((a, b) => b.length - a.length)
  let out = formula
  for (const name of names) {
    const pattern = new RegExp(`\\b${escapeRegex(name)}\\b`, 'g')
    out = out.replace(pattern, String(values[name]))
  }
  return out
}

function evaluateFormula(expression: string): number | null {
  const normalised = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
  if (!/^[\d\s+\-*/().]+$/.test(normalised)) return null
  try {
    const result = Function(`"use strict"; return (${normalised});`)() as unknown
    if (typeof result === 'number' && Number.isFinite(result)) return result
    return null
  } catch {
    return null
  }
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Visual Diagram (placeholder) ─────────────────────────────────────────────

function VisualDiagram({ visual }: { visual: VisualDiagramVisual }) {
  const { diagram_type } = visual.data
  return (
    <div className="rounded-2xl border border-dashed border-primary-200 bg-white/60 p-6 text-center">
      <p className="rise-overline text-[10px] mb-2">Diagram</p>
      <p className="text-sm font-semibold text-secondary-800">{diagram_type}</p>
      <p className="mt-1 text-xs text-secondary-400">Diagram component coming soon.</p>
    </div>
  )
}
