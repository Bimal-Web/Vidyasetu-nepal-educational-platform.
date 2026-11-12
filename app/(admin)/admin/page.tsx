import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminClient } from './AdminClient'

const ADMIN_EMAILS = [
  'bimalweb842@gmail.com',
  'admin@vidyasetu.com',
  'testuser123@gmail.com',
  'rayansormm@gmail.com',
  'vidyatest_1794027765238@gmail.com'
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnUrl=/admin')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const userEmail = (user.email || profile?.email || '').toLowerCase()
  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(userEmail)

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const [
    { data: allUsers, count: userCount },
    { data: rawSubmissions },
    { data: recentDownloads },
    { data: allContent },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(50),
    supabase.from('submissions')
      .select('*, content(id, title, type, file_url, file_size, status, created_at, subjects(name)), users!submissions_contributor_id_fkey(id, full_name, email, avatar_url)')
      .limit(100),
    supabase.from('downloads_log')
      .select('downloaded_at, content(title), users(full_name)')
      .gte('downloaded_at', sevenDaysAgo)
      .order('downloaded_at', { ascending: false })
      .limit(200),
    supabase.from('content').select('id, type, status, downloads, views, created_at').limit(300),
  ])

  // Sort submissions so newest pending submissions always appear on top
  const submissions = (rawSubmissions ?? []).sort((a: any, b: any) => {
    if (a.status === 'under_review' && b.status !== 'under_review') return -1
    if (b.status === 'under_review' && a.status !== 'under_review') return 1
    const da = new Date(a.content?.created_at || a.reviewed_at || 0).getTime()
    const db = new Date(b.content?.created_at || b.reviewed_at || 0).getTime()
    return db - da
  })

  return (
    <AdminClient
      users={allUsers ?? []}
      userCount={userCount ?? 0}
      submissions={submissions}
      recentDownloads={recentDownloads ?? []}
      allContent={allContent ?? []}
      currentAdminEmail={userEmail}
    />
  )
}
