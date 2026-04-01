import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isMathsSubject } from '@/lib/onboarding'
import type { Subject } from '@rise/shared'

async function getMathsSubjects(): Promise<Subject[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('subjects').select('*').order('name', { ascending: true })
  return (data ?? []).filter((subject) => isMathsSubject(subject))
}

const TOPIC_LANES = [
  {
    label: 'Algebra',
    summary: 'Equations, substitution, and structure',
    bg: 'bg-violet-50/80',
    dot: 'bg-violet-400',
    border: 'border-violet-200/50',
  },
  {
    label: 'Number',
    summary: 'Methods, fluency, and confidence',
    bg: 'bg-cyan-50/80',
    dot: 'bg-cyan-400',
    border: 'border-cyan-200/50',
  },
  {
    label: 'Ratio',
    summary: 'Proportion, scale, and comparison',
    bg: 'bg-pink-50/80',
    dot: 'bg-pink-400',
    border: 'border-pink-200/50',
  },
  {
    label: 'Geometry',
    summary: 'Angles, shapes, and visual rules',
    bg: 'bg-blue-50/80',
    dot: 'bg-blue-400',
    border: 'border-blue-200/50',
  },
]

export default async function SubjectsPage() {
  const subjects = await getMathsSubjects()
  const mathsSubject = subjects[0]

  return (
    <div className="rise-page rise-page-wide">

      {/* Page header */}
      <div className="mb-6 border-b border-primary-200/30 pb-6">
        <p className="rise-overline mb-2">Maths hub</p>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-secondary-900 lg:text-5xl">
          Choose what to{' '}
          <span className="rise-gradient-text">learn</span>
        </h1>
        <p className="mt-3 max-w-3xl text-base text-secondary-400 leading-relaxed">
          The home screen will always suggest a smart next step, but this space stays open for students who want to steer the maths journey themselves.
        </p>
      </div>

      {mathsSubject ? (
        <div className="space-y-4">
          {/* Active subject card */}
          <div className="glass-card-solid p-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
            <div>
              <p className="rise-overline text-[10px] mb-2">Live subject</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-secondary-900">{mathsSubject.name}</h2>
              <p className="mt-3 max-w-2xl text-sm text-secondary-400 leading-relaxed">
                Maths is the only visible subject for now so the lessons, onboarding, and recommendation logic can stay sharp instead of spread too thin.
              </p>
            </div>
            <div className="flex items-center lg:justify-end">
              <Link
                href={`/subjects/${mathsSubject.slug}`}
                className="rise-btn-primary w-auto px-6 py-3 text-sm"
              >
                Open maths lessons
              </Link>
            </div>
          </div>

          {/* Topic lanes grid */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TOPIC_LANES.map((topic) => (
              <Link key={topic.label} href={`/subjects/${mathsSubject.slug}`}>
                <div className={`glass-card rise-card-interactive h-full p-5 ${topic.bg} border ${topic.border}`}>
                  <div className={`mb-5 h-3 w-3 rounded-full ${topic.dot}`} />
                  <p className="text-xl font-bold leading-tight text-secondary-900">{topic.label}</p>
                  <p className="mt-2 text-sm text-secondary-400 leading-relaxed">{topic.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card-solid py-16 text-center">
          <span className="mb-3 block text-5xl">📐</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-secondary-900">Maths content is being wired in</h2>
          <p className="mt-3 max-w-md mx-auto text-sm text-secondary-400 leading-relaxed">
            No maths subject is available yet in the database, so the browsing hub is waiting on content.
          </p>
        </div>
      )}
    </div>
  )
}
