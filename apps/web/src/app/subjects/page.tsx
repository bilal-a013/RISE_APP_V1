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
    <div className="rise-page">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Subjects</h1>
        <p className="text-sm text-slate-500 mt-1">Choose a subject to explore topics</p>
      </div>

      {subjects.length === 0 ? (
        <div className="rise-card text-center py-12">
          <span className="text-4xl mb-3 block">📚</span>
          <p className="font-black text-gray-900">No subjects yet</p>
          <p className="text-sm text-slate-500 mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/subjects/${subject.slug}`}>
              <div className="rise-card flex items-center gap-4 hover:shadow-xl transition-shadow active:scale-[0.99]">
                <div className="w-12 h-12 rounded-2xl bg-[#EDE9FF] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{subjectIcon(subject)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-gray-900">{subject.name}</h2>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-slate-300">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
