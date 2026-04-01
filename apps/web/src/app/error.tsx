'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="rise-page flex flex-col items-center justify-center min-h-dvh text-center">
      <span className="text-5xl mb-4">😕</span>
      <h1 className="text-xl font-extrabold tracking-tight text-secondary-900 mb-2">Something went wrong</h1>
      <p className="text-sm text-secondary-400 mb-6">Don&apos;t worry — it&apos;s not you. Try again.</p>
      <button
        onClick={reset}
        className="rise-btn-primary max-w-[200px] mx-auto"
      >
        Try again
      </button>
    </div>
  )
}
