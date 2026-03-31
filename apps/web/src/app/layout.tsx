import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/layout/BottomNav'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'RISE — GCSE Study',
  description: 'Your intelligent GCSE study companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="rise-app-shell">
          <div className="rise-phone lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
            <BottomNav />
            <div className="rise-shell-panel">
              <div className="hidden items-center justify-between border-b border-[#efe8ff]/80 px-8 py-5 lg:flex">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a7a0bd]">RISE Tutoring</p>
                  <h1 className="mt-1 text-2xl font-black text-[#231d39]">Web App Workspace</h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rise-chip">
                    <span>🧠</span>
                    <span>Study mode</span>
                  </div>
                  <div className="rise-chip">
                    <span>⚡</span>
                    <span>Supabase live</span>
                  </div>
                </div>
              </div>
              <main>{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
