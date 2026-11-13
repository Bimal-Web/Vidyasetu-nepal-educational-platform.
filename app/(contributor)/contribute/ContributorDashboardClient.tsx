'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UploadDropzone } from '@/components/features/UploadDropzone'
import { createClient } from '@/lib/supabase/client'
import {
  TrendingUp, Clock, Download, Zap, MoreHorizontal, Link2,
  Shield, Eye, ExternalLink, CheckCircle2, AlertCircle, FileText
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  profile: any
  totalContribs: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  totalDownloads: number
  submissions: any[]
  topContributors: any[]
  subjects: any[]
  userId: string
}

const STATUS_MAP: Record<string, { label: string; cls: string; desc: string }> = {
  approved:     { label: 'PUBLISHED LIVE', cls: 'status-approved', desc: 'Approved by admin & available to students' },
  under_review: { label: 'UNDER REVIEW', cls: 'status-pending', desc: 'Pending admin check before publishing' },
  rejected:     { label: 'REJECTED', cls: 'status-rejected', desc: 'Needs revision' },
}

const TIERS = ['GOLD TIER', 'SILVER TIER', 'BRONZE TIER']
const TIER_COLORS: Record<string, string> = {
  'GOLD TIER':   'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  'SILVER TIER': 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  'BRONZE TIER': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
}

export function ContributorDashboardClient({
  profile,
  totalContribs,
  pendingCount,
  approvedCount,
  rejectedCount,
  totalDownloads,
  submissions,
  topContributors,
  subjects,
  userId
}: Props) {
  const supabase = createClient()

  // Local state for immediate responsiveness without requiring reload
  const [submissionList, setSubmissionList] = useState<any[]>(submissions)
  const [pendingNum, setPendingNum] = useState<number>(pendingCount)
  const [contribsNum, setContribsNum] = useState<number>(totalContribs)

  // Upload state
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [contentType, setContentType] = useState<'note' | 'past_paper' | 'mcq_set'>('note')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Real impact score: approved content weighted + downloads, minus rejection penalty
  const impactScore = Math.min(99.9, Math.max(
    0,
    (approvedCount * 12) + (totalDownloads * 0.02) - (rejectedCount * 5) + (pendingNum * 2)
  ))

  const displayName = profile?.full_name || 'Contributor'

  const handleUpload = async () => {
    if (!title || !subjectId || !selectedFiles.length) {
      setUploadMsg({ type: 'error', text: 'Please fill in all fields and select a file.' })
      return
    }
    setUploading(true)
    setProgress(15)
    setUploadMsg(null)

    try {
      const file = selectedFiles[0]
      const ext = file.name.split('.').pop()
      const path = `${subjectId}/${contentType}/${Date.now()}.${ext}`

      // Upload to Supabase Storage
      const { error: storErr } = await supabase.storage.from('content-uploads').upload(path, file, { upsert: false })
      if (storErr) throw storErr
      setProgress(50)

      const { data: urlData } = supabase.storage.from('content-uploads').getPublicUrl(path)

      // Insert content row with status 'pending' (MUST be approved by admin before going live)
      const { data: contentRow, error: dbErr } = await supabase.from('content').insert({
        subject_id: subjectId,
        uploaded_by: userId,
        title,
        type: contentType,
        file_url: urlData.publicUrl,
        file_size: file.size,
        status: 'pending',
        views: 0,
        downloads: 0,
      }).select().single()
      if (dbErr) throw dbErr
      setProgress(75)

      // Insert submission record marked 'under_review' for admin moderation queue
      const { data: subRow, error: subErr } = await supabase.from('submissions').insert({
        contributor_id: userId,
        content_id: contentRow.id,
        status: 'under_review',
      }).select().single()
      if (subErr) throw subErr
      setProgress(100)

      // Add to local submissions table immediately
      const targetSubject = subjects.find(s => s.id === subjectId)
      const newSub = {
        id: subRow?.id || `sub-${Date.now()}`,
        contributor_id: userId,
        content_id: contentRow.id,
        status: 'under_review',
        reviewed_at: null,
        content: {
          id: contentRow.id,
          title,
          type: contentType,
          file_url: urlData.publicUrl,
          file_size: file.size,
          created_at: new Date().toISOString(),
          subjects: targetSubject ? { name: targetSubject.name } : { name: 'Subject' }
        }
      }

      setSubmissionList(prev => [newSub, ...prev])
      setPendingNum(p => p + 1)
      setContribsNum(c => c + 1)

      setUploadMsg({
        type: 'success',
        text: '✓ Submitted for Admin Verification! Your resource is now queued in the moderation center and will be published live once checked and approved by an administrator.'
      })

      // Reset form
      setTitle('')
      setSubjectId('')
      setSelectedFiles([])
      setContentType('note')
    } catch (e: any) {
      setUploadMsg({ type: 'error', text: `Upload failed: ${e.message}` })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-caption text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-semibold mb-1">Contributor Console</p>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Welcome back, {displayName}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Upload verified study resources for Nepali students. All uploads are checked by an admin before publication.</p>
        </div>
        <button onClick={handleUpload} id="new-submission-btn"
          className="btn-primary px-5 py-2.5 gap-2 flex-shrink-0">
          + New Submission
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Contributions', value: contribsNum, icon: TrendingUp, trend: '+12%', color: 'text-indigo-600' },
          { label: 'Pending Admin Check', value: pendingNum, icon: Clock, trend: 'In Queue', color: 'text-amber-600' },
          { label: 'Total Downloads', value: totalDownloads >= 1000 ? `${(totalDownloads / 1000).toFixed(1)}k` : totalDownloads, icon: Download, trend: '+8%', color: 'text-emerald-600' },
          { label: 'Impact Score', value: impactScore.toFixed(1), icon: Zap, trend: '+2.3', color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-caption text-slate-400 uppercase tracking-wide">{s.label}</p>
              <s.icon size={15} className={s.color} />
            </div>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{s.value}</p>
            {s.trend && <p className="text-caption text-emerald-600 mt-1">{s.trend}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Upload + Submissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Upload */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">Quick Upload</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                Admin Verified Workflow
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Resources uploaded here undergo administrative quality check before appearing live in student browse &amp; search.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Title</label>
                <input id="upload-title" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. MBBS Anatomy – Thorax Notes" className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Type</label>
                <select id="upload-type" value={contentType} onChange={e => setContentType(e.target.value as any)} className="input">
                  <option value="note">Note</option>
                  <option value="past_paper">Past Paper</option>
                  <option value="mcq_set">MCQ Set</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Subject</label>
                <select id="upload-subject" value={subjectId} onChange={e => setSubjectId(e.target.value)} className="input">
                  <option value="">Select subject…</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <UploadDropzone
              onFilesSelected={setSelectedFiles}
              uploading={uploading}
              progress={progress}
            />

            {uploadMsg && (
              <div className={`mt-4 p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                uploadMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                {uploadMsg.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                <span>{uploadMsg.text}</span>
              </div>
            )}

            <button onClick={handleUpload} disabled={uploading} id="upload-submit-btn"
              className="btn-primary mt-4 px-6 py-2.5">
              {uploading ? 'Uploading…' : 'Submit for Admin Review'}
            </button>
          </div>

          {/* Recent Submissions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100">Recent Submissions</h2>
                <p className="text-xs text-slate-400">Track moderation and publishing status</p>
              </div>
              <Link href="/contribute/upload" className="text-sm text-indigo-600 hover:underline font-medium" id="view-all-submissions-btn">Upload More</Link>
            </div>

            {submissionList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No submissions yet. Upload your first resource!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Resource Name', 'Category', 'Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className="table-header text-left py-3 px-3 text-xs uppercase font-bold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {submissionList.map((sub) => {
                      const content = sub.content as any
                      const statusInfo = STATUS_MAP[sub.status] ?? STATUS_MAP.under_review
                      const isPending = sub.status === 'under_review'

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="table-cell px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Link2 size={13} className="text-slate-500" />
                              </div>
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-44">
                                {content?.title ?? '—'}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell px-3 py-3 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap font-medium">
                            {content?.subjects?.name ?? '—'}
                          </td>
                          <td className="table-cell px-3 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {content?.created_at ? formatDate(content.created_at) : '—'}
                          </td>
                          <td className="table-cell px-3 py-3 whitespace-nowrap">
                            <div>
                              <span className={statusInfo.cls}>{statusInfo.label}</span>
                              <p className="text-[10px] text-slate-400 mt-0.5">{statusInfo.desc}</p>
                            </div>
                          </td>
                          <td className="table-cell px-3 py-3">
                            {content?.file_url ? (
                              <a
                                href={content.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                title="Check uploaded file"
                              >
                                <Eye size={13} />
                                <span>Check File</span>
                              </a>
                            ) : (
                              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Moderation Workflow Card */}
          <div className="card p-6 border border-indigo-100 dark:border-indigo-950 bg-gradient-to-b from-indigo-50/30 to-transparent">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-1.5">
              <Shield size={16} className="text-indigo-600" /> Publishing Verification
            </h3>
            <ol className="relative border-l border-indigo-200 dark:border-indigo-800 ml-2 space-y-4 text-xs text-slate-600 dark:text-slate-400 py-1">
              <li className="ml-4">
                <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-indigo-600 border border-white dark:border-slate-900" />
                <p className="font-bold text-slate-800 dark:text-slate-200">1. Contributor Uploads</p>
                <p className="text-[11px] mt-0.5">Submit your study notes, past papers, or MCQs.</p>
              </li>
              <li className="ml-4">
                <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-amber-500 border border-white dark:border-slate-900" />
                <p className="font-bold text-slate-800 dark:text-slate-200">2. Admin Checks Content</p>
                <p className="text-[11px] mt-0.5">Administrators inspect file clarity, syllabus accuracy, and completeness.</p>
              </li>
              <li className="ml-4">
                <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
                <p className="font-bold text-slate-800 dark:text-slate-200">3. Live on Platform</p>
                <p className="text-[11px] mt-0.5">Once approved, the resource is instantly uploaded to the student library for free download.</p>
              </li>
            </ol>
          </div>

          {/* Top Contributors */}
          <div className="card p-6">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Top Contributors</h2>
            <div className="space-y-4">
              {topContributors.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {c.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{c.full_name}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLORS[TIERS[i]] ?? TIER_COLORS['BRONZE TIER']}`}>
                      {TIERS[i] ?? 'MEMBER'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
