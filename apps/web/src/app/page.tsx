import Link from 'next/link'

export const dynamic = 'force-static'

export default function SplashPage() {
  return (
    <div className="rise-splash">
      <div className="rise-splash-inner">
        <div className="rise-splash-card">
          <div className="mb-8 flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-btn"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              R
            </div>
            <div>
              <p className="rise-overline">RISE</p>
              <p className="mt-1 text-base font-semibold text-secondary-900">Student app</p>
            </div>
          </div>

          <h1 className="max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-secondary-900">
            Enter the code your{' '}
            <span className="rise-gradient-text">tutor gave you</span>.
          </h1>

          <p className="mt-3 text-sm text-secondary-400 leading-relaxed">
            Your code helps us find the learning plan your tutor made for you.
          </p>

          <div className="mt-8">
            <form action="/auth/tutor-code" className="space-y-4">
              <div>
                <label className="mb-2 block rise-overline text-[10px]">
                  Tutor code
                </label>
                <p className="mb-3 text-sm text-secondary-400">
                  Type it exactly as your tutor gave it to you.
                </p>
              </div>
              <input
                name="code"
                placeholder="Enter your tutor code"
                autoCapitalize="characters"
                autoCorrect="off"
                className="rise-input py-3.5"
              />
              <button
                type="submit"
                className="rise-btn-primary py-4 text-base"
              >
                Continue
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-xl border border-primary-100 bg-white/60 px-4 py-3">
            <p className="text-sm leading-relaxed text-secondary-500">
              If you already have an account, you can{' '}
              <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                sign in instead
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 text-center text-sm text-secondary-400">
            <Link href="/auth/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Account setup
            </Link>{' '}
            is optional and only needed for the current demo flow.
          </div>
        </div>
      </div>
    </div>
  )
}
