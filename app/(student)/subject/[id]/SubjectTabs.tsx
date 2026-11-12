'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Eye, Download, FileText, ExternalLink, Clock, ArrowRight, BookOpen, Loader2, CheckCircle2, Brain, Search } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/utils'
import type { Content, Quiz, Subject } from '@/types'
import { DiscussionTab } from './DiscussionTab'
import { SubjectBadge } from '@/components/features/SubjectBadge'

interface SubjectTabsProps {
  subjectId: string
  notes: Content[]
  pastPapers: Content[]
  mcqSets: Content[]
  quizzes: Quiz[]
  subject: Subject
  initialPosts?: any[]
  related?: { id: string; name: string; icon_key: string; color_key: string; [key: string]: unknown }[]
}

const TABS = ['Notes', 'Past Papers', 'MCQ Bank', 'Quizzes', 'Discussion'] as const
type Tab = typeof TABS[number]

function ContentRow({ item, onDownload, downloading }: { item: Content; onDownload: (id: string) => void; downloading: boolean }) {
  const typeConfig: Record<string, { bg: string; label: string }> = {
    note: { bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400', label: 'PDF Note' },
    past_paper: { bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400', label: 'Solved Paper' },
    mcq_set: { bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400', label: 'MCQ Bank' },
  }
  const cfg = typeConfig[item.type] || { bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600', label: 'Resource' }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 border border-slate-150 dark:border-slate-800 transition-all hover:border-indigo-200 dark:hover:border-indigo-800 shadow-2xs group">
      <div className="flex items-start gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs`}>
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg}`}>
              {cfg.label}
            </span>
            {item.file_size && (
              <span className="text-[11px] font-medium text-slate-400">
                {formatFileSize(item.file_size)}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.title}
          </p>
          <div className="flex items-center gap-2.5 text-caption text-slate-400 mt-0.5 flex-wrap">
            <span>Added {formatDate(item.created_at)}</span>
            {(item.users as any)?.full_name && (
              <>
                <span>•</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-36">
                  {(item.users as any).full_name}
                </span>
              </>
            )}
            <span className="inline-flex items-center gap-1">
              • <Eye size={12} /> {item.views ?? 0} views
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 w-full sm:w-auto justify-end">
        {item.drive_url && (
          <a
            href={
              item.drive_url.startsWith('http')
                ? (item.drive_url.includes('/view') ? item.drive_url.replace('/view', '/preview') : item.drive_url)
                : `https://drive.google.com/file/d/${item.drive_url}/preview`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[40px] sm:min-h-[36px]"
            title="Preview on Google Drive"
          >
            <ExternalLink size={14} />
            <span>Preview</span>
          </a>
        )}
        {item.file_url && (
          <button
            onClick={() => onDownload(item.id)}
            disabled={downloading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-2xs hover:shadow-indigo-500/25 disabled:opacity-50 min-h-[40px] sm:min-h-[36px]"
            title="Download PDF"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>Download</span>
          </button>
        )}
      </div>
    </div>
  )
}

export function SubjectTabs({ subjectId, notes, pastPapers, mcqSets, quizzes, subject, initialPosts = [], related = [] }: SubjectTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Notes')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'az'>('newest')
  const [searchFilter, setSearchFilter] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadOk, setDownloadOk] = useState<string | null>(null)

  // Sync active tab with the URL (?tab=)
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab && (TABS as readonly string[]).includes(tab)) setActiveTab(tab as Tab)
  }, [])

  const selectTab = (tab: Tab) => {
    setActiveTab(tab)
    setSearchFilter('')
    const url = new URL(window.location.href)
    if (tab === 'Notes') url.searchParams.delete('tab')
    else url.searchParams.set('tab', tab)
    window.history.replaceState(null, '', url.toString())
  }

  const handleDownload = useCallback(async (contentId: string) => {
    setDownloadingId(contentId)
    setDownloadOk(null)
    try {
      const res = await fetch(`/api/download/${contentId}`, { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank', 'noopener')
        setDownloadOk(contentId)
        setTimeout(() => setDownloadOk(null), 2500)
      } else {
        console.error('Download failed')
      }
    } catch {
      console.error('Download failed')
    } finally {
      setDownloadingId(null)
    }
  }, [])

  const sortItems = useCallback((items: Content[]): Content[] => {
    let list = [...items]
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase()
      list = list.filter(item => item.title.toLowerCase().includes(q))
    }
    if (sort === 'newest') return list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    if (sort === 'oldest') return list.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    return list.sort((a, b) => a.title.localeCompare(b.title))
  }, [sort, searchFilter])

  const contentMap = useMemo<Record<Tab, Content[]>>(() => ({
    'Notes': sortItems(notes),
    'Past Papers': sortItems(pastPapers),
    'MCQ Bank': sortItems(mcqSets),
    'Quizzes': [],
    'Discussion': [],
  }), [notes, pastPapers, mcqSets, sortItems])

  return (
    <div>
      {/* Modern Segmented Tab Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-px" role="tablist" aria-label="Subject content tabs">
        {TABS.map(tab => {
          const count =
            tab === 'Notes' ? notes.length :
            tab === 'Past Papers' ? pastPapers.length :
            tab === 'MCQ Bank' ? mcqSets.length :
            tab === 'Quizzes' ? quizzes.length : initialPosts.length
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              aria-controls={`subject-tab-panel-${tab.toLowerCase().replace(' ', '-')}`}
              id={`subject-tab-${tab.toLowerCase().replace(' ', '-')}`}
              onClick={() => selectTab(tab)}
              className={`px-3.5 sm:px-5 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px flex items-center gap-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <span>{tab}</span>
              {count > 0 && (
                <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content column */}
        <div className="lg:col-span-2 space-y-4" id={`subject-tab-panel-${activeTab.toLowerCase().replace(' ', '-')}`} role="tabpanel" aria-label={`${activeTab} content`}>
          {(activeTab === 'Notes' || activeTab === 'Past Papers' || activeTab === 'MCQ Bank') && (
            <div className="card p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              
              {/* Filter and Sort Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder={`Filter ${activeTab.toLowerCase()} by chapter, title...`}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-slate-400">Sort:</span>
                  <select
                    className="text-xs sm:text-sm py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    id={`${activeTab.toLowerCase()}-sort`}
                    value={sort}
                    onChange={e => setSort(e.target.value as typeof sort)}
                    aria-label={`Sort ${activeTab}`}
                  >
                    <option value="newest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="az">A–Z</option>
                  </select>
                </div>
              </div>

              {/* Resource List */}
              {contentMap[activeTab].length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileText size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {searchFilter ? `No resources match "${searchFilter}"` : `No ${activeTab.toLowerCase()} available yet.`}
                  </p>
                  <p className="text-caption text-slate-400 mt-1">
                    {searchFilter ? 'Try clearing the search filter.' : 'Be the first to share and help fellow students.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {contentMap[activeTab].map(item => (
                    <ContentRow
                      key={item.id}
                      item={item}
                      onDownload={handleDownload}
                      downloading={downloadingId === item.id}
                    />
                  ))}
                </div>
              )}

              {downloadOk && (
                <p className="mt-3 flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <CheckCircle2 size={16} /> Download initiated. Saved to your browser downloads folder.
                </p>
              )}

              {/* Upload CTA Card */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/40 dark:to-slate-800/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Download size={18} className="-scale-y-100" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Have notes or past papers?</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Upload and help fellow learners across Nepal. Get credited as a contributor.</p>
                </div>
                <Link href="/contribute" className="btn-primary text-xs font-semibold px-4 py-2.5 whitespace-nowrap text-center rounded-xl shadow-xs">
                  Share Resources
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'Quizzes' && (
            <div className="space-y-4">
              {quizzes.length === 0 ? (
                <div className="card p-10 text-center">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Clock size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No quizzes available yet.</p>
                  <p className="text-caption text-slate-400 mt-1">Check back soon — new quizzes are added regularly.</p>
                </div>
              ) : (
                quizzes.map(q => (
                  <div key={q.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{q.title}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                        <Clock size={13} /> {q.time_limit_minutes} min · {q.question_count} questions
                      </p>
                    </div>
                    <Link href={`/quiz/${q.id}`} className="btn-primary text-sm px-4 py-2 sm:w-auto w-full text-center flex-shrink-0">
                      Start <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Discussion' && (
            <DiscussionTab subjectId={subjectId} subjectName={subject.name} initialPosts={initialPosts} />
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Practice */}
          <div className="card p-5">
            <p className="text-caption text-slate-400 uppercase tracking-wide mb-1">Practice</p>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-1 mb-1.5">{subject.name}</p>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-slate-500">Quizzes available</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">{quizzes.length}</span>
            </div>
            {quizzes.length > 0 ? (
              <Link href={`/mcq/${subjectId}`} className="btn-primary w-full justify-center text-sm py-2.5 mb-2 flex items-center gap-1.5" id="subject-resume-btn">
                <Brain size={15} /> Practice MCQs
              </Link>
            ) : (
              <span
                title="No quizzes available for this subject yet"
                className="btn-primary w-full justify-center text-sm py-2.5 mb-2 flex items-center gap-1.5 opacity-60 cursor-not-allowed"
                aria-disabled="true"
              >
                <Brain size={15} /> Practice MCQs
              </span>
            )}
            <Link href={`/quizzes?subject=${subjectId}`} className="btn-secondary w-full justify-center text-sm py-2.5" id="subject-quizzes-btn">
              Take a Quiz
            </Link>
          </div>

          {/* Recommended (real related subjects) */}
          {related.length > 0 && (
            <div className="card p-5">
              <p className="text-caption text-slate-400 uppercase tracking-wide mb-3">Related Subjects</p>
              <div className="space-y-3">
                {related.map(r => (
                  <Link key={r.id} href={`/subject/${r.id}`} className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-1 py-0.5 -mx-1 transition-colors">
                    <SubjectBadge iconKey={r.icon_key} colorKey={r.color_key} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{r.name}</p>
                    </div>
                    <BookOpen size={13} className="text-slate-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
