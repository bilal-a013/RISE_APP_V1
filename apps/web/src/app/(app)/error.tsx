'use client'

import { useEffect } from 'react'
import Link from 'next/link'

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
    return 'RISE could not read some student data because access was blocked.'
  }

  return 'We could not load this part of RISE right now.'
}

export default function AppError({
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
    <div className="rise-page flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <span className="mb-4 text-5xl">⚠️</span>
      <h1 className="mb-2 text-xl font-extrabold tracking-tight text-secondary-900">
        We hit a dashboard problem
      </h1>
      <p className="mb-6 text-sm text-secondary-400">{getReadableErrorMessage(error)}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="rise-btn-primary max-w-[200px]">
          Try again
        </button>
        <Link href="/auth/login" className="rise-btn-outline max-w-[200px]">
          Back to login
        </Link>
      </div>
    </div>
  )
}
