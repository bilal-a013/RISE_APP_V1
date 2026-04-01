import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="rise-page flex flex-col items-center justify-center min-h-dvh text-center">
      <span className="text-5xl mb-4">🔍</span>
      <h1 className="text-2xl font-extrabold tracking-tight text-secondary-900 mb-2">Page not found</h1>
      <p className="text-sm text-secondary-400 mb-8">
        This page doesn&apos;t exist or was moved.
      </p>
      <Link href="/" className="rise-btn-primary block max-w-[200px] mx-auto">
        Go home
      </Link>
    </div>
  )
}
