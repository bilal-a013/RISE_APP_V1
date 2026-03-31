'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/home',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#94A3B8'}
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="3" width="8" height="8" rx="2"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#94A3B8'}
          strokeWidth="2"
        />
        <rect
          x="13" y="3" width="8" height="8" rx="2"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#94A3B8'}
          strokeWidth="2"
        />
        <rect
          x="3" y="13" width="8" height="8" rx="2"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#94A3B8'}
          strokeWidth="2"
        />
        <rect
          x="13" y="13" width="8" height="8" rx="2"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#94A3B8'}
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={active ? '#7C3AED' : 'none'}
          stroke={active ? '#7C3AED' : '#94A3B8'}
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
      {/* Desktop sidebar — 72px column */}
      <aside className="rise-sidebar">
        <div className="mb-7 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-gradient-to-br from-[#a22df4] to-[#7C3AED] text-lg font-black text-white shadow-[0_14px_28px_rgba(124,58,237,0.38)]">
            R
          </div>
        </div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 rounded-[1rem] px-1 py-3 transition-all ${
                  active
                    ? 'bg-white/95 text-[#231b44] shadow-[0_16px_36px_rgba(8,8,22,0.28)]'
                    : 'text-white/55 hover:bg-white/[0.06] hover:text-white/85'
                }`}
              >
                <span className="shrink-0">{item.icon(active)}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.14em]">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-4 left-0 right-0 z-50 lg:hidden">
        <div className="mx-auto max-w-sm px-4">
          <div className="rise-soft-panel flex items-center justify-around rounded-[1.8rem] px-4 py-2.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-all ${
                    active ? 'bg-white/90 shadow-[0_10px_18px_rgba(109,40,217,0.10)]' : ''
                  }`}
                >
                  {item.icon(active)}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                      active ? 'text-[#7C3AED]' : 'text-slate-400'
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
