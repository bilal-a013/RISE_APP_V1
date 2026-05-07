'use client'

import { useEffect } from 'react'

function getReadableErrorMessage(error: Error) {
  const message = error.message.toLowerCase()

  if (message.includes('next_public_supabase_url is missing')) {
    return 'RISE is missing its Supabase URL on this deployment.'
  }

  if (message.includes('next_public_supabase_anon_key is missing')) {
    return 'RISE is missing its Supabase anon key on this deployment.'
  }

  if (message.includes('fetch failed')) {
    return 'RISE could not reach Supabase from this deployment.'
  }

  if (message.includes('permission denied')) {
    return 'RISE could not read some dashboard data because access was blocked.'
  }

  return "We hit a problem loading RISE right now. Please try again."
}

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
      <p className="text-sm text-secondary-400 mb-6">{getReadableErrorMessage(error)}</p>
      <button
        onClick={reset}
        className="rise-btn-primary max-w-[200px] mx-auto"
      >
        Try again
      </button>
    </div>
  )
}
