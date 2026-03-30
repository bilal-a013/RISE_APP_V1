'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    label: 'Subjects',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-sm mx-auto flex items-center justify-around px-4 py-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors"
            >
              {item.icon(active)}
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  active ? 'text-[#7C3AED]' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
