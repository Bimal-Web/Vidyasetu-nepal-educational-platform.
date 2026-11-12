import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'
import { SubjectBadge } from '@/components/features/SubjectBadge'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface ProgramPageProps {
  params: Promise<{ id: string }>
}

import { MOCK_PROGRAMS, MOCK_FACULTIES, MOCK_SUBJECTS, MOCK_COUNTS } from '@/lib/data/mock-data'

async function getData(id: string) {
  try {
    const supabase = await createClient()
    const { data: program } = await supabase.from('programs').select('*').eq('id', id).single()
    if (program) {
      const { data: faculties } = await supabase
        .from('faculties_or_streams')
        .select('*, subjects(*, faculties_or_streams(*))')
        .eq('program_id', id)
        .order('name')

      // Per-subject content counts
      const subjectIds = (faculties ?? []).flatMap(f => (f.subjects ?? []).map((s: any) => s.id))
      const { data: contentCounts } = await supabase
        .from('content')
        .select('subject_id, type')
        .eq('status', 'approved')
        .in('subject_id', subjectIds)

      const counts: Record<string, number> = {}
      ;(contentCounts ?? []).forEach(c => { counts[c.subject_id] = (counts[c.subject_id] ?? 0) + 1 })

      return { program, faculties: faculties ?? [], counts }
    }
  } catch (err) {
    console.warn('Supabase query failed, falling back to mock data:', err)
  }

  // Fallback to offline mock data
  const mockProgram = MOCK_PROGRAMS.find(p => p.id === id)
  if (!mockProgram) return null

  const mockFaculties = MOCK_FACULTIES
    .filter(f => f.program_id === id)
    .map(f => ({
      ...f,
      subjects: MOCK_SUBJECTS.filter(s => s.faculty_id === f.id)
    }))

  const counts: Record<string, number> = {}
  mockFaculties.forEach(f => {
    (f.subjects || []).forEach(s => {
      const c = MOCK_COUNTS[s.id]
      counts[s.id] = c ? (c.notes + c.papers + c.mcqs) : 1
    })
  })

  return { program: mockProgram, faculties: mockFaculties, counts }
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getData(id)
  return { title: data ? `${data.program.name} | VidyaSetu` : 'Program Not Found' }
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { id } = await params
  const data = await getData(id)
  if (!data) notFound()

  const { program, faculties, counts } = data
  const totalSubjects = faculties.reduce((acc, f) => acc + (f.subjects?.length ?? 0), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-500 mb-6 font-medium">
        <Link href="/programs" className="hover:text-indigo-600">Programs</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-slate-900 dark:text-white">{program.name}</span>
      </nav>

      {/* Header */}
      <div className="card p-8 mb-8 bg-gradient-to-br from-indigo-700 to-indigo-900 border-indigo-700 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none select-none"
          style={{ background: 'radial-gradient(circle at 80% 50%, white 0%, transparent 70%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <GraduationCap size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{program.name}</h1>
              <p className="text-indigo-200 text-sm mt-1">
                {faculties.length} faculties · {totalSubjects} subjects · {subjectCountLabel(counts)}
              </p>
            </div>
          </div>
          <Link
            href={`/browse?program=${slugify(program.name)}`}
            className="flex-shrink-0 px-5 py-2.5 bg-white text-indigo-800 font-semibold rounded-lg hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
          >
            Browse All <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Faculties */}
      {faculties.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BookOpen size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-lg font-medium">No faculties yet.</p>
          <p className="text-sm mt-1">This program will be expanded soon.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {faculties.map(fac => {
            const subs = (fac.subjects ?? []) as any[]
            return (
              <div key={fac.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-indigo-700 dark:text-indigo-300" />
                  </div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">{fac.name}</h2>
                  <span className="text-caption text-slate-400">{subs.length} subjects</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subs.map(subject => (
                    <Link
                      key={subject.id}
                      href={`/subject/${subject.id}`}
                      className="card p-5 flex items-center gap-4 hover:scale-[1.01] transition-transform"
                      id={`program-subject-${subject.id}`}
                    >
                      <SubjectBadge iconKey={subject.icon_key} colorKey={subject.color_key} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{subject.name}</p>
                        <p className="text-caption text-slate-400">
                          {subject.grade_or_semester || 'General'} · {counts[subject.id] ?? 0} resources
                        </p>
                      </div>
                      <ArrowRight size={15} className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function subjectCountLabel(counts: Record<string, number>) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return `${total} resources`
}

function slugify(name: string): string {
  const map: Record<string, string> = {
    'Pre-School & Primary': 'school',
    'Secondary School (SEE)': 'secondary',
    'Plus 2 (+2)': 'plus2',
    "Bachelor's": 'bachelor',
    'Entrance Prep': 'entrance',
    'Loksewa & PSC': 'loksewa',
    'Government Competitive': 'govt',
  }
  return map[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}