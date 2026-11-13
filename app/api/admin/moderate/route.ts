import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in as an administrator.' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('users').select('role, email').eq('id', user.id).single()
    const userEmail = (user.email || profile?.email || '').toLowerCase()
    const isAdmin = isUserAdmin(userEmail, profile?.role)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const { submissionId, contentId, action } = body

    if (!submissionId || !contentId || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters provided.' }, { status: 400 })
    }

    const now = new Date().toISOString()

    // 1. Update the submissions table
    const { error: subErr } = await supabase
      .from('submissions')
      .update({
        status: action === 'approved' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: now,
      })
      .eq('id', submissionId)

    if (subErr) {
      console.error('Submission update error:', subErr)
    }

    // 2. Update content table status
    const { error: contentErr } = await supabase
      .from('content')
      .update({
        status: action === 'approved' ? 'approved' : 'rejected',
      })
      .eq('id', contentId)

    if (contentErr) {
      console.error('Content update error:', contentErr)
      return NextResponse.json({ error: contentErr.message || 'Failed to update content status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action,
      submissionId,
      contentId,
      reviewedAt: now,
      message: action === 'approved'
        ? 'Resource checked and successfully uploaded/published to the platform!'
        : 'Resource rejected.'
    })
  } catch (err: any) {
    console.error('Admin moderate error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

