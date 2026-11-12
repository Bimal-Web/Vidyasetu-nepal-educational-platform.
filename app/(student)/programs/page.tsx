import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, BookOpen, Sparkles, GraduationCap, Atom } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Academic Programs | VidyaSetu',
  description: 'Browse all academic programs and faculties on VidyaSetu.',
}

import { MOCK_PROGRAMS, MOCK_FACULTIES } from '@/lib/data/mock-data'

export default async function ProgramsPage() {
  let programs = MOCK_PROGRAMS
  let faculties = MOCK_FACULTIES

  try {
    const supabase = await createClient()
    const { data: dbPrograms } = await supabase.from('programs').select('*').order('level_order')
    const { data: dbFaculties } = await supabase
      .from('faculties_or_streams')
      .select('*, programs(name)')
      .order('name')

    if (dbPrograms && dbPrograms.length > 0) {
      programs = dbPrograms
    }
    if (dbFaculties && dbFaculties.length > 0) {
      faculties = dbFaculties
    }
  } catch (err) {
    console.warn('Supabase query failed, falling back to mock data:', err)
  }

  const facultyByProgram: Record<string, any[]> = {}
  ;(faculties ?? []).forEach(f => {
    if (!facultyByProgram[f.program_id]) facultyByProgram[f.program_id] = []
    facultyByProgram[f.program_id].push(f)
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
          <Link href="/" className="hover:text-indigo-700">Home</Link>
          <ChevronRight size={14} />
          <span className="text-indigo-700 font-medium">Programs</span>
        </div>
        <h1 className="text-section text-slate-800 dark:text-slate-100">Academic Programs</h1>
        <p className="text-body text-slate-500 dark:text-slate-400 mt-2">
          Select your academic level to browse relevant subjects and resources.
        </p>
      </div>

      {/* Featured Banners for Class 11 (+2), Class 10 (SEE) & Class 8 (BLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Class 11 (+2 NEB) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-indigo-500/10 border border-blue-200/80 dark:border-blue-900/50 flex flex-col justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Atom size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Class 11 (+2 NEB)</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                  NEB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Physics & Chemistry official board model papers embedded.
              </p>
            </div>
          </div>
          <Link
            href="/class11"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap self-start"
          >
            <span>View Class 11 Papers</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Class 10 (SEE) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Class 10 (SEE)</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                  8 Subjects
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Science, Math, English, Nepali, Social, Opt Math, Computer, Economics.
              </p>
            </div>
          </div>
          <Link
            href="/class10"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap self-start"
          >
            <span>View Class 10 Papers</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Class 8 (BLE) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-pink-200/80 dark:border-pink-900/50 flex flex-col justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Class 8 (BLE)</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300">
                  4 Subjects
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Health & PE, Moral Education, Social Studies, and Vocational papers.
              </p>
            </div>
          </div>
          <Link
            href="/class8"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs whitespace-nowrap self-start"
          >
            <span>View Class 8 Papers</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {(programs ?? []).map(prog => (
          <div key={prog.id} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-indigo-700 dark:text-indigo-300" />
              </div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{prog.name}</h2>
            </div>
            <div className="space-y-1.5">
              {(facultyByProgram[prog.id] ?? []).map(fac => (
                <Link
                  key={fac.id}
                  href={`/browse?faculty=${fac.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 group transition-colors"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {fac.name}
                  </span>
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </Link>
              ))}
              {!facultyByProgram[prog.id]?.length && (
                <p className="text-sm text-slate-400 px-3 py-2">Coming soon…</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
