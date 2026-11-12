'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users, FileText, Download, BarChart3, CheckCircle2, XCircle,
  MoreHorizontal, Shield, Eye, ExternalLink, Calendar, User, BookOpen,
  Filter, AlertCircle, Sparkles, Check, X, File, Image as ImageIcon
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  users: any[]
  userCount: number
  submissions: any[]
  recentDownloads: any[]
  allContent: any[]
  currentAdminEmail?: string
}

type AdminTab = 'submissions' | 'users' | 'analytics'
type SubmissionFilter = 'under_review' | 'approved' | 'rejected' | 'all'

export function AdminClient({ users, userCount, submissions: initialSubmissions, recentDownloads, allContent, currentAdminEmail }: Props) {
  const supabase = createClient()
  const [tab, setTab] = useState<AdminTab>('submissions')
  const [subFilter, setSubFilter] = useState<SubmissionFilter>('under_review')
  const [submissions, setSubmissions] = useState<any[]>(initialSubmissions)
  const [actioning, setActioning] = useState<string | null>(null)
  const [userList, setUserList] = useState(users)
  const [selectedSub, setSelectedSub] = useState<any | null>(null)
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text })
    setTimeout(() => setToastMsg(null), 4500)
  }

  // Handle Approve or Reject
  const approveOrReject = async (submissionId: string, contentId: string, action: 'approved' | 'rejected') => {
    setActioning(submissionId)
    try {
      // 1. Try server-side moderation endpoint first
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, contentId, action }),
      })

      if (!res.ok) {
        // Fallback to client-side Supabase updates
        await Promise.all([
          supabase.from('submissions').update({ status: action, reviewed_at: new Date().toISOString() }).eq('id', submissionId),
          supabase.from('content').update({ status: action }).eq('id', contentId),
        ])
      }

      // 2. Update local state
      setSubmissions(prev => prev.map(s => {
        if (s.id === submissionId) {
          return {
            ...s,
            status: action,
            reviewed_at: new Date().toISOString(),
            content: s.content ? { ...s.content, status: action } : s.content,
          }
        }
        return s
      }))

      if (selectedSub?.id === submissionId) {
        setSelectedSub(null)
      }

      showToast(
        action === 'approved'
          ? '✓ Resource approved & uploaded! It is now published live for students.'
          : 'Submission rejected.'
      )
    } catch (err: any) {
      showToast(`Error: ${err.message || 'Operation failed'}`, 'error')
    } finally {
      setActioning(null)
    }
  }

  const changeRole = async (userId: string, role: string) => {
    await supabase.from('users').update({ role }).eq('id', userId)
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    showToast(`User role updated to ${role}`)
  }

  // Count aggregates
  const pendingCount = submissions.filter(s => s.status === 'under_review').length
  const approvedCount = submissions.filter(s => s.status === 'approved').length
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length
  const totalDownloads = recentDownloads.length

  const filteredSubmissions = submissions.filter(s => {
    if (subFilter === 'all') return true
    return s.status === subFilter
  })

  // Format file size nicely
  const formatBytes = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Downloads per day (last 7 days) for bar chart
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dlByDay = recentDownloads.reduce((acc: Record<string, number>, dl) => {
    const d = new Date(dl.downloaded_at).toLocaleDateString('en-US', { weekday: 'short' })
    acc[d] = (acc[d] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-sm font-semibold transition-all animate-in slide-in-from-bottom-3 ${
          toastMsg.type === 'success'
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
            : 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Administrator Console</h1>
            <p className="text-sm text-slate-400">Content verification, resource approvals, and user governance</p>
          </div>
        </div>
        {currentAdminEmail && (
          <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Admin: {currentAdminEmail}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: pendingCount, icon: MoreHorizontal, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
          { label: 'Approved & Live', value: approvedCount, icon: FileText, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
          { label: 'Total Users', value: userCount, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' },
          { label: 'Weekly Downloads', value: totalDownloads, icon: Download, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
        ].map(s => (
          <div key={s.label} className="card p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color.split(' ').slice(1).join(' ')}`}>
              <s.icon size={17} className={s.color.split(' ')[0]} />
            </div>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{s.value}</p>
            <p className="text-caption text-slate-400 mt-1 uppercase tracking-wider font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        {[
          { id: 'submissions', label: `Review & Verification Queue (${pendingCount})` },
          { id: 'users', label: `Users (${userCount})` },
          { id: 'analytics', label: 'Platform Analytics' },
        ].map(t => (
          <button
            key={t.id}
            id={`admin-tab-${t.id}`}
            onClick={() => setTab(t.id as AdminTab)}
            className={`px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-all ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Submissions & Moderation Tab ────────────────────────── */}
      {tab === 'submissions' && (
        <div className="space-y-4">
          {/* Sub-filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {[
                { id: 'under_review', label: `Pending Check (${pendingCount})` },
                { id: 'approved', label: `Approved & Live (${approvedCount})` },
                { id: 'rejected', label: `Rejected (${rejectedCount})` },
                { id: 'all', label: `All Submissions (${submissions.length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSubFilter(f.id as SubmissionFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    subFilter === f.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredSubmissions.length} resource{filteredSubmissions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="card overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            {filteredSubmissions.length === 0 ? (
              <div className="p-14 text-center">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-200 text-base">No items in this filter</p>
                <p className="text-sm text-slate-400 mt-1">All submissions have been reviewed or none match the criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/70 dark:border-slate-800">
                    <tr>
                      {['Uploaded Resource', 'Type', 'Subject', 'Contributor', 'Status', 'Actions'].map(h => (
                        <th key={h} className="table-header text-left py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredSubmissions.map(sub => {
                      const content = sub.content as any
                      const user = sub.users as any
                      const isPending = sub.status === 'under_review'
                      const isApproved = sub.status === 'approved'
                      const isRejected = sub.status === 'rejected'

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="table-cell px-4 py-3.5">
                            <div className="flex items-start gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center shrink-0 mt-0.5">
                                {content?.file_url?.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                                  <ImageIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                                ) : (
                                  <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-xs sm:max-w-md">
                                  {content?.title || 'Untitled Resource'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  {content?.file_size && <span>{formatBytes(content.file_size)}</span>}
                                  {content?.created_at && <span>&bull; {formatDate(content.created_at)}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="table-cell px-4 py-3.5 whitespace-nowrap">
                            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full capitalize border border-slate-200/60 dark:border-slate-700">
                              {content?.type?.replace('_', ' ') || 'Note'}
                            </span>
                          </td>

                          <td className="table-cell px-4 py-3.5 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300 text-sm">
                            {content?.subjects?.name || 'General Subject'}
                          </td>

                          <td className="table-cell px-4 py-3.5 whitespace-nowrap">
                            <div className="text-sm">
                              <p className="font-semibold text-slate-700 dark:text-slate-200">{user?.full_name || 'Contributor'}</p>
                              <p className="text-xs text-slate-400">{user?.email || '—'}</p>
                            </div>
                          </td>

                          <td className="table-cell px-4 py-3.5 whitespace-nowrap">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending Check
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                                <CheckCircle2 size={12} />
                                Published Live
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80">
                                <XCircle size={12} />
                                Rejected
                              </span>
                            )}
                          </td>

                          <td className="table-cell px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {/* Inspect & Check Resource Modal Button */}
                              <button
                                onClick={() => setSelectedSub(sub)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/80 dark:border-indigo-800 transition-all"
                                title="Inspect and verify file before publishing"
                              >
                                <Eye size={13} />
                                <span>Check Resource</span>
                              </button>

                              {/* Direct Approve & Upload Live */}
                              {isPending && (
                                <button
                                  onClick={() => approveOrReject(sub.id, sub.content_id, 'approved')}
                                  disabled={actioning === sub.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs disabled:opacity-50 transition-all"
                                  title="Approve and make available to students"
                                >
                                  <Check size={13} />
                                  <span>Approve & Upload</span>
                                </button>
                              )}

                              {isPending && (
                                <button
                                  onClick={() => approveOrReject(sub.id, sub.content_id, 'rejected')}
                                  disabled={actioning === sub.id}
                                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all disabled:opacity-50"
                                  title="Reject submission"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
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
      )}

      {/* ── Resource Inspection & Verification Modal ────────────── */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Admin Verification & Quality Inspection
                </span>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
                  {selectedSub.content?.title || 'Resource Review'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-5">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-1">Subject</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSub.content?.subjects?.name || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-1">Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{selectedSub.content?.type?.replace('_', ' ') || 'Note'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-1">Contributor</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{selectedSub.users?.full_name || selectedSub.users?.email || 'Contributor'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-1">File Size</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(selectedSub.content?.file_size) || 'Standard'}</span>
                </div>
              </div>

              {/* Resource Preview Container */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resource Preview & Content Check</span>
                  {selectedSub.content?.file_url && (
                    <a
                      href={selectedSub.content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <ExternalLink size={12} />
                      Open Full Resource in New Tab
                    </a>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-3 min-h-56 flex flex-col items-center justify-center overflow-hidden">
                  {selectedSub.content?.file_url ? (
                    selectedSub.content.file_url.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                      <div className="w-full flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedSub.content.file_url}
                          alt={selectedSub.content.title}
                          className="max-h-80 w-auto object-contain rounded-lg shadow-sm border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                          <FileText size={28} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Document Resource Attached</p>
                          <p className="text-xs text-slate-400 mt-0.5">Click below to open and inspect the document contents.</p>
                        </div>
                        <a
                          href={selectedSub.content.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-4"
                        >
                          <ExternalLink size={14} /> Inspect Document
                        </a>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-6 text-slate-400 text-xs">
                      No direct file preview available. Check external link or attachment.
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Verification Checklist */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs space-y-1.5 text-indigo-900 dark:text-indigo-200">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
                  Quality & Publishing Protocol:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                  <li>Verify handwriting/text is clear, legible, and uncorrupted.</li>
                  <li>Ensure content maps accurately to the selected subject and Nepal curriculum.</li>
                  <li>Approving will immediately publish this resource to all student search and subject pages.</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => approveOrReject(selectedSub.id, selectedSub.content_id, 'rejected')}
                  disabled={actioning === selectedSub.id}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 transition-all disabled:opacity-50"
                >
                  <XCircle size={14} />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => approveOrReject(selectedSub.id, selectedSub.content_id, 'approved')}
                  disabled={actioning === selectedSub.id}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>{actioning === selectedSub.id ? 'Publishing…' : 'Approve & Upload to Platform'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ───────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="card overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/70 dark:border-slate-800">
                <tr>{['Name', 'Email', 'Role', 'Joined', 'Change Role'].map(h => (
                  <th key={h} className="table-header text-left py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {userList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="table-cell px-4 py-3 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{u.full_name || '—'}</td>
                    <td className="table-cell px-4 py-3 text-slate-500 text-sm whitespace-nowrap">{u.email}</td>
                    <td className="table-cell px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize whitespace-nowrap border ${
                        u.role === 'admin' ? 'bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-800' :
                        u.role === 'contributor' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="table-cell px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="table-cell px-4 py-3">
                      <select
                        id={`admin-role-${u.id}`}
                        defaultValue={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        className="input text-xs py-1.5 px-3 w-36 font-semibold"
                      >
                        <option value="student">Student</option>
                        <option value="contributor">Contributor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Analytics Tab ───────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 size={17} className="text-indigo-600" /> Downloads Activity
            </h2>
            <div className="flex items-end gap-2 h-40 pt-4">
              {dayLabels.map(d => {
                const val = dlByDay[d] ?? 0
                const max = Math.max(...dayLabels.map(day => dlByDay[day] ?? 0), 1)
                return (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-caption text-slate-400 font-semibold">{val}</span>
                    <div className="w-full rounded-md bg-indigo-600/85 hover:bg-indigo-500 transition-colors" style={{ height: `${(val / max) * 100}%` }} />
                    <span className="text-caption text-slate-400 font-semibold">{d}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Content Type Breakdown</h2>
            {[
              { label: 'Study Notes', count: allContent.filter(c => c.type === 'note').length, color: '#4f46e5' },
              { label: 'Past Papers', count: allContent.filter(c => c.type === 'past_paper').length, color: '#059669' },
              { label: 'MCQ Practice Sets', count: allContent.filter(c => c.type === 'mcq_set').length, color: '#f59e0b' },
            ].map(row => {
              const total = allContent.length || 1
              return (
                <div key={row.label} className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{row.label}</span>
                    <span className="font-bold" style={{ color: row.color }}>{row.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(row.count / total) * 100}%`, background: row.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
