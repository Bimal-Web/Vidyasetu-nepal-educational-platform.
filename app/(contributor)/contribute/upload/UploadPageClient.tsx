'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UploadDropzone } from '@/components/features/UploadDropzone'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, UploadCloud, FileText, FileBadge, ListChecks, Info } from 'lucide-react'

interface Props {
  subjects: { id: string; name: string }[]
  userId: string
}

export function UploadPageClient({ subjects, userId }: Props) {
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [contentType, setContentType] = useState<'note' | 'past_paper' | 'mcq_set'>('note')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!title || !subjectId || !selectedFiles.length) {
      setUploadMsg('Please fill in all fields and select a file.')
      return
    }
    setUploading(true); setProgress(10); setUploadMsg(null)
    try {
      const file = selectedFiles[0]
      const ext = file.name.split('.').pop()
      const path = `${subjectId}/${contentType}/${Date.now()}.${ext}`

      const { error: storErr } = await supabase.storage.from('content-uploads').upload(path, file, { upsert: false })
      if (storErr) throw storErr
      setProgress(60)

      const { data: urlData } = supabase.storage.from('content-uploads').getPublicUrl(path)

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
      setProgress(80)

      await supabase.from('submissions').insert({
        contributor_id: userId,
        content_id: contentRow.id,
        status: 'under_review',
      })
      setProgress(100)
      setUploadMsg('✓ Resource submitted for admin review! It is queued for administrator inspection and will be published live once approved.')
      setTitle(''); setSubjectId(''); setSelectedFiles([]); setContentType('note')
    } catch (e: any) {
      setUploadMsg(`Error: ${e.message}`)
    } finally {
      setUploading(false)
    }
  }

  const contentTypes = [
    { value: 'note', label: 'Study Note', desc: 'Chapter notes, summaries, guides', icon: FileText },
    { value: 'past_paper', label: 'Past Paper', desc: 'Previous year exam papers', icon: FileBadge },
    { value: 'mcq_set', label: 'MCQ Set', desc: 'Practice question sets', icon: ListChecks },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/contribute" className="hover:text-indigo-600 flex items-center gap-1">
          <ChevronLeft size={15} /> Contributor Console
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-indigo-700 font-medium">Upload Content</span>
      </nav>

      <div className="mb-8">
        <p className="text-caption text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-semibold mb-1">Share knowledge</p>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Upload New Content</h1>
        <p className="text-sm text-slate-400 mt-1">Your submission will be reviewed by moderators before going live.</p>
      </div>

      <div className="card p-6">
        {/* Content type selector */}
        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Content Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {contentTypes.map(ct => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setContentType(ct.value as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                contentType === ct.value
                  ? 'border-indigo-700 bg-indigo-50 dark:bg-indigo-900/40'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <ct.icon size={18} className={contentType === ct.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-400'} />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-2">{ct.label}</p>
              <p className="text-caption text-slate-400">{ct.desc}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. MBBS Anatomy — Thorax Notes"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Subject</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="input">
              <option value="">Select subject…</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">File</label>
            <UploadDropzone
              onFilesSelected={setSelectedFiles}
              uploading={uploading}
              progress={progress}
            />
          </div>

          {uploadMsg && (
            <p className={`text-sm font-medium ${uploadMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>
              {uploadMsg}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleUpload} disabled={uploading} className="btn-primary px-6 py-2.5 flex items-center gap-2">
              <UploadCloud size={16} /> {uploading ? 'Uploading…' : 'Submit for Review'}
            </button>
            <Link href="/contribute" className="btn-ghost px-4 py-2.5">Cancel</Link>
          </div>

          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mt-2">
            <Info size={15} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-caption text-slate-500 dark:text-slate-400">
              Please only upload content you have permission to share. Copyrighted material, duplicate submissions,
              or intentionally misleading resources may be rejected. Max file size: 50 MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}