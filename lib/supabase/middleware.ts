import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isDemoMode, DEMO_SESSION_COOKIE } from './demo-db'
import { getUserById } from './demo-db'
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from './connect'

import { getAuthCookieOptions } from './cookie-options'

export async function updateSession(request: NextRequest) {
  // ── Auto-recovery: If OAuth redirected to root /?code=... instead of /api/auth/callback ──
  const code = request.nextUrl.searchParams.get('code')
  if (code && !request.nextUrl.pathname.startsWith('/api/auth/callback')) {
    const callbackUrl = new URL('/api/auth/callback', request.url)
    request.nextUrl.searchParams.forEach((val, key) => {
      callbackUrl.searchParams.set(key, val)
    })
    return NextResponse.redirect(callbackUrl)
  }

  const protectedPaths = ['/dashboard', '/contribute', '/admin', '/quiz/', '/mcq', '/bookmarks']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  // ── Demo mode: no real Supabase, use the vs-demo-user cookie ──
  if (isDemoMode()) {
    const demoUser = getUserById(request.cookies.get(DEMO_SESSION_COOKIE)?.value)

    if (isProtected && !demoUser) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (demoUser && demoUser.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL).replace(/\/rest\/v1\/?$/, '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_PUBLIC_KEY
  const authCookieOptions = getAuthCookieOptions()

  const supabase = createServerClient(
    url,
    key,
    {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: authCookieOptions.sameSite,
              secure: authCookieOptions.secure,
            })
          )
        },
      },
    }
  )

  // IMPORTANT: Do not write any logic between createServerClient and auth.getUser()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch (err) {
    console.warn('[VidyaSetu Middleware] Auth check failed or offline:', err)
  }

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin-only
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (user) {
      const adminEmails = [
        'bimalweb842@gmail.com',
        'admin@vidyasetu.com',
        'testuser123@gmail.com',
        'rayansormm@gmail.com',
        'vidyatest_1794027765238@gmail.com'
      ]
      const userEmail = (user.email || '').toLowerCase()
      if (adminEmails.includes(userEmail)) {
        return supabaseResponse
      }

      try {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        if (!profile || profile.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}
