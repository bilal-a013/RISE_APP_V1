'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/home',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#B0ABCF'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/subjects',
    label: 'Maths',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="3" width="8" height="8" rx="2"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#B0ABCF'}
          strokeWidth="2"
        />
        <rect
          x="13" y="3" width="8" height="8" rx="2"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#B0ABCF'}
          strokeWidth="2"
        />
        <rect
          x="3" y="13" width="8" height="8" rx="2"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#B0ABCF'}
          strokeWidth="2"
        />
        <rect
          x="13" y="13" width="8" height="8" rx="2"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#B0ABCF'}
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#B0ABCF'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar — light glass */}
      <aside className="rise-sidebar">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 px-1">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-btn"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
          >
            R
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary-600">RISE</p>
            <p className="text-xs font-semibold leading-none text-secondary-900">Maths studio</p>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200/50'
                    : 'text-secondary-400 hover:bg-white/60 hover:text-secondary-900'
                }`}
              >
                <span className="shrink-0">{item.icon(active)}</span>
                <span className={`text-sm font-medium ${active ? 'text-primary-700' : 'text-secondary-500'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-4 left-0 right-0 z-50 lg:hidden">
        <div className="mx-auto max-w-xs px-4">
          <div
            className="flex items-center justify-around rounded-2xl px-3 py-2"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(124, 58, 237, 0.15)',
              boxShadow: '0 8px 30px rgba(124, 58, 237, 0.12)',
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-[68px] flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 ${
                    active ? 'bg-primary-50 border border-primary-200/40' : ''
                  }`}
                >
                  {item.icon(active)}
                  <span
                    className={`text-[10px] font-semibold tracking-wide ${
                      active ? 'text-primary-600' : 'text-secondary-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
