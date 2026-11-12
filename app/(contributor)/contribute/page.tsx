import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContributorDashboardClient } from './ContributorDashboardClient'

export default async function ContributePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnUrl=/contribute')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  // Stats
  const [
    { count: totalContribs },
    { count: pendingCount },
    { data: submissions },
    { data: topContributors },
    { data: subjects },
    { count: approvedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    supabase.from('content').select('*', { count: 'exact', head: true }).eq('uploaded_by', user.id),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('contributor_id', user.id).eq('status', 'under_review'),
    supabase.from('submissions')
      .select('*, content(id, title, type, file_url, file_size, created_at, subjects(name, faculties_or_streams(name)))')
      .eq('contributor_id', user.id)
      .limit(20),
    supabase.from('users')
      .select('id, full_name, avatar_url')
      .eq('role', 'contributor')
      .limit(5),
    supabase.from('subjects').select('id, name, faculty_id').order('name').limit(50),
    supabase.from('content').select('*', { count: 'exact', head: true }).eq('uploaded_by', user.id).eq('status', 'approved'),
    supabase.from('content').select('*', { count: 'exact', head: true }).eq('uploaded_by', user.id).eq('status', 'rejected'),
  ])

  // Download totals for this contributor
  const { data: dlData } = await supabase
    .from('downloads_log')
    .select('content!inner(uploaded_by)')
    .eq('content.uploaded_by', user.id)

  const totalDownloads = dlData?.length ?? 0

  const sortedSubmissions = (submissions ?? []).sort((a: any, b: any) => {
    if (a.status === 'under_review' && b.status !== 'under_review') return -1
    if (b.status === 'under_review' && a.status !== 'under_review') return 1
    const da = new Date(a.content?.created_at || a.reviewed_at || 0).getTime()
    const db = new Date(b.content?.created_at || b.reviewed_at || 0).getTime()
    return db - da
  })

  return (
    <ContributorDashboardClient
      profile={profile}
      totalContribs={totalContribs ?? 0}
      pendingCount={pendingCount ?? 0}
      approvedCount={approvedCount ?? 0}
      rejectedCount={rejectedCount ?? 0}
      totalDownloads={totalDownloads}
      submissions={sortedSubmissions}
      topContributors={topContributors ?? []}
      subjects={subjects ?? []}
      userId={user.id}
    />
  )
}
