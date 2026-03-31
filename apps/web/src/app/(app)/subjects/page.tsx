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
  { label: 'Algebra', summary: 'Equations, substitution, and structure', color: 'bg-[#fff3dd]', dot: 'bg-[#f59e0b]' },
  { label: 'Number', summary: 'Methods, fluency, and confidence', color: 'bg-[#e9fbff]', dot: 'bg-[#06b6d4]' },
  { label: 'Ratio', summary: 'Proportion, scale, and comparison', color: 'bg-[#ffe9f3]', dot: 'bg-[#ec4899]' },
  { label: 'Geometry', summary: 'Angles, shapes, and visual rules', color: 'bg-[#edf4ff]', dot: 'bg-[#3b82f6]' },
]

export default async function SubjectsPage() {
  const subjects = await getMathsSubjects()
  const mathsSubject = subjects[0]

  return (
    <div className="rise-page rise-page-wide">
      <div className="mb-6 border-b border-[#ede6fb] pb-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a39cb8]">Maths hub</p>
        <h1 className="mt-2 text-[2.55rem] font-black leading-none text-[#1f1833]">Choose what to learn</h1>
        <p className="mt-3 max-w-3xl text-base font-medium leading-relaxed text-[#6f6a84]">
          The home screen will always suggest a smart next step, but this space stays open for students who want to steer the maths journey themselves.
        </p>
      </div>

      {mathsSubject ? (
        <div className="space-y-4">
          <div className="rise-card grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d88a7]">Live subject</p>
              <h2 className="mt-2 text-[2.2rem] font-black leading-none text-[#1d1830]">{mathsSubject.name}</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#6f6a84]">
                Maths is the only visible subject for now so the lessons, onboarding, and recommendation logic can stay sharp instead of spread too thin.
              </p>
            </div>
            <div className="flex items-end justify-start lg:justify-end">
              <Link
                href={`/subjects/${mathsSubject.slug}`}
                className="inline-flex rounded-[0.95rem] bg-[#1f1737] px-5 py-3 text-sm font-black text-white"
              >
                Open maths lessons
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TOPIC_LANES.map((topic) => (
              <Link key={topic.label} href={`/subjects/${mathsSubject.slug}`}>
                <div className={`rise-card rise-card-interactive h-full p-5 ${topic.color}`}>
                  <div className={`mb-6 h-3 w-3 rounded-full ${topic.dot}`} />
                  <p className="text-[1.55rem] font-black leading-none text-[#201c37]">{topic.label}</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[#7f7b93]">{topic.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rise-card py-12 text-center">
          <span className="mb-3 block text-4xl">📐</span>
          <p className="text-[1.8rem] font-black leading-none text-[#1d1830]">Maths content is being wired in</p>
          <p className="mt-3 text-sm font-medium text-[#6f6a84]">
            No maths subject is available yet in the database, so the browsing hub is waiting on content.
          </p>
        </div>
      )}
    </div>
  )
}
