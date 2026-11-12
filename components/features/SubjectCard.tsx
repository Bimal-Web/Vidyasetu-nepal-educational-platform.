'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SubjectBadge } from './SubjectBadge'
import { getSubjectCoverImage } from '@/lib/subject-covers'
import type { Subject } from '@/types'
import { ArrowRight, BookOpen, FileText, Brain } from 'lucide-react'

interface SubjectCardProps {
  subject: Subject
  noteCount?: number
  paperCount?: number
  quizCount?: number
}

export function SubjectCard({ subject, noteCount = 0, paperCount = 0, quizCount = 0 }: SubjectCardProps) {
  const [imgSrc, setImgSrc] = useState(getSubjectCoverImage(subject))

  return (
    <div className="card overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
      <div>
        {/* Cover image header */}
        <div className="relative h-36 w-full overflow-hidden bg-slate-900">
          <Image
            src={imgSrc}
            alt={subject.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            sizes="(max-width: 640px) 100vw, 33vw"
            onError={() => setImgSrc('/assets/subjects/physics-science.jpg')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-3 left-3.5 transition-transform group-hover:scale-105 duration-300 drop-shadow-md">
            <SubjectBadge iconKey={subject.icon_key} colorKey={subject.color_key} size="md" />
          </div>
        </div>

        <div className="p-5 pb-2">
          <h3 className="text-card font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
            {subject.name}
          </h3>
          <p className="text-caption text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {subject.description}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="flex gap-4 text-xs py-3 border-t border-slate-100 dark:border-slate-800/80 mb-3 text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5"><BookOpen size={13} className="text-indigo-500" /> {noteCount} Notes</span>
          <span className="flex items-center gap-1.5"><FileText size={13} className="text-emerald-500" /> {paperCount} Papers</span>
          {quizCount > 0 && <span className="flex items-center gap-1.5"><Brain size={13} className="text-amber-500" /> {quizCount} Quizzes</span>}
        </div>

        <Link
          href={`/subject/${subject.id}`}
          className="btn-primary w-full justify-center text-sm py-2.5 rounded-xl flex items-center gap-2 group-hover:bg-indigo-500 transition-colors"
          id={`subject-card-view-${subject.id}`}
        >
          <span>View Subject</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
