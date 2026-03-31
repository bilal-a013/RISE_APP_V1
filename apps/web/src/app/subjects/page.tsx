import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Subject } from '@rise/shared'

async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subjects')
    .select('*')
    .order('name', { ascending: true })
  return data ?? []
}

const SUBJECT_ICONS: Record<string, string> = {
  mathematics: '📐',
  maths: '📐',
  english: '📝',
  science: '🔬',
  biology: '🧬',
  chemistry: '⚗️',
  physics: '⚡',
  history: '🏛️',
  geography: '🌍',
  french: '🇫🇷',
  spanish: '🇪🇸',
}

function subjectIcon(subject: Subject): string {
  if (subject.icon) return subject.icon
  const key = subject.name.toLowerCase()
  for (const [k, v] of Object.entries(SUBJECT_ICONS)) {
    if (key.includes(k)) return v
  }
  return '📚'
}

export default async function SubjectsPage() {
  const subjects = await getSubjects()

  return (
    <div className="rise-page rise-page-wide">
      <div className="mb-6 border-b border-[#ede6fb] pb-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a39cb8]">Browse curriculum</p>
        <h1 className="mt-2 text-[2.4rem] font-black leading-none text-[#5d22b3]">Your Subjects</h1>
        <p className="mt-2 max-w-2xl text-base font-medium text-[#8d88a7]">
          Explore the study areas available in the web app and jump into the exact lesson or topic you want to work on.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="rise-card text-center py-12">
          <span className="text-4xl mb-3 block">📚</span>
          <p className="font-black text-gray-900">No subjects yet</p>
          <p className="text-sm text-slate-500 mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/subjects/${subject.slug}`}>
              <div className="rise-card h-full p-6 transition-all active:scale-[0.99] hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#efe4ff]">
                    <span className="text-2xl">{subjectIcon(subject)}</span>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-2 text-[#c5bfd3]">
                    <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mt-6">
                  <h2 className="text-2xl font-black text-[#201c37]">{subject.name}</h2>
                  <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-[#8a86a0]">
                    Open topics, see lesson progress, and continue where your tutoring session left off.
                  </p>
                </div>
                <div className="mt-6 inline-flex rounded-full bg-[#f7f2ff] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#8f2eff]">
                  Open subject
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
