'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, 
  BookOpen, Trophy, Users, Star, Sun, Moon, ShieldCheck, Check
} from 'lucide-react'
import { Logo } from '@/components/layout/Logo'

const ADMIN_EMAILS = [
  'bimalweb842@gmail.com',
  'admin@vidyasetu.com',
  'testuser123@gmail.com',
  'rayansormm@gmail.com',
  'vidyatest_1794027765238@gmail.com'
]

const STATS = [
  { icon: BookOpen, value: '50K+', label: 'Verified Resources' },
  { icon: Trophy, value: '96%', label: 'Board Pass Rate' },
  { icon: Users, value: '120K+', label: 'Active Learners' },
  { icon: Star, value: '4.9/5', label: 'Student Rating' },
]

function GoogleLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  )
}

function FloatingOrb({ className }: { className: string }) {
  return <div className={`login-orb ${className}`} aria-hidden="true" />
}

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="login-stat-card">
      <div className="login-stat-icon">
        <Icon size={16} />
      </div>
      <div>
        <div className="login-stat-value">{value}</div>
        <div className="login-stat-label">{label}</div>
      </div>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'
  const supabase = createClient()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40)
    setDark(document.documentElement.classList.contains('dark'))
    return () => clearTimeout(t)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('vs-dark', String(next))
    } catch {}
  }

  const resolveEmail = async (rawInput: string): Promise<string> => {
    const trimmed = rawInput.trim().toLowerCase()
    if (trimmed.includes('@')) return trimmed

    // Lookup registered user in Supabase public.users by username or fullname
    try {
      const { data } = await supabase
        .from('users')
        .select('email')
        .ilike('full_name', trimmed)
        .limit(1)
        .maybeSingle()
      if (data?.email) return data.email
    } catch {
      // ignore
    }

    return trimmed
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const targetEmail = await resolveEmail(identifier)
      // Clear any legacy demo cookie so real Supabase session is strictly used
      try {
        document.cookie = 'vs-demo-user=; path=/; max-age=0'
        localStorage.removeItem('vs-demo-user')
      } catch {}

      const { data, error: err } = await supabase.auth.signInWithPassword({ 
        email: targetEmail, 
        password 
      })

      if (err) {
        if (err.message.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed: Please check your inbox for the confirmation link from Supabase, or turn off "Confirm email" in your Supabase dashboard (Authentication -> Providers -> Email).')
        } else if (err.message.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid login credentials: Check your email and password, or create a new account below.')
        } else {
          setError(err.message)
        }
        setLoading(false)
        return
      }

      setLoading(false)
      // Fetch user role for proper redirection
      if (data?.user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
        const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes((data.user.email || '').toLowerCase())
        router.push(returnUrl && returnUrl !== '/' ? returnUrl : (isAdmin ? '/admin' : '/dashboard'))
      } else {
        router.push(returnUrl || '/dashboard')
      }
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.'
      setError(msg)
      setLoading(false)
    }
  }

  // Returns whether current execution is inside an iframe
  const isRunningInIframe = () => {
    if (typeof window === 'undefined') return false
    try {
      return window.self !== window.top
    } catch {
      return true
    }
  }

  // Listen for OAuth completion from popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Strict origin verification: only accept messages from our exact app origin
      if (event.origin !== window.location.origin) {
        return
      }

      if (!event.data || typeof event.data !== 'object') {
        return
      }

      if (event.data.type === 'OAUTH_AUTH_SUCCESS') {
        setGoogleLoading(false)

        if (event.data.session) {
          try {
            await supabase.auth.setSession({
              access_token: event.data.session.access_token,
              refresh_token: event.data.session.refresh_token,
            })
          } catch (syncErr) {
            console.warn('Session sync warning:', syncErr)
          }
        }

        const targetUrl = event.data.returnUrl || returnUrl || '/dashboard'
        router.push(targetUrl)
        router.refresh()
      } else if (event.data.type === 'OAUTH_AUTH_CODE') {
        // Fallback: client-side PKCE exchange
        try {
          const { error: codeErr } = await supabase.auth.exchangeCodeForSession(event.data.code)
          if (!codeErr) {
            setGoogleLoading(false)
            router.push(event.data.returnUrl || returnUrl || '/dashboard')
            router.refresh()
            return
          }
        } catch (codeExErr) {
          console.warn('Client code exchange warning:', codeExErr)
        }
        setGoogleLoading(false)
        router.push(event.data.returnUrl || returnUrl || '/dashboard')
        router.refresh()
      } else if (event.data.type === 'OAUTH_AUTH_ERROR') {
        setGoogleLoading(false)
        const rawErr = event.data.error || 'Google authentication could not be completed.'
        const lower = rawErr.toLowerCase()
        if (
          lower.includes('already registered') ||
          lower.includes('identity') ||
          lower.includes('user already exists')
        ) {
          // Supabase automatic identity linking explanation:
          // When a user originally registered with an email & password, Supabase creates an identity.
          // If automatic OAuth linking is not enabled, Supabase prevents overwriting the existing identity.
          // Prompt the user to log in with their password or use Google with the same email.
          setError('This email is already registered. Log in with your password, or use Google with the same email')
        } else {
          setError(rawErr)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router, returnUrl, supabase])

  // Check for error in URL params
  useEffect(() => {
    const urlErr = searchParams.get('error')
    const urlDesc = searchParams.get('error_description')
    if (urlErr || urlDesc) {
      const raw = decodeURIComponent(urlDesc || urlErr || '')
      const lower = raw.toLowerCase()
      if (
        lower.includes('already registered') ||
        lower.includes('identity') ||
        lower.includes('user already exists')
      ) {
        setError('This email is already registered. Log in with your password, or use Google with the same email')
      } else {
        setError(raw)
      }
    }
  }, [searchParams])

  const handleGoogle = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (googleLoading || loading) return
    setError(null)
    setGoogleLoading(true)

    const inIframe = isRunningInIframe()
    const callbackUrl = `${window.location.origin}/api/auth/callback?returnUrl=${encodeURIComponent(returnUrl || '/dashboard')}`

    // If NOT in iframe (normal browser tab or production domain):
    // Use the standard supabase.auth.signInWithOAuth redirect flow and exchange code on server
    if (!inIframe) {
      try {
        const { error: err } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: callbackUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        })
        if (err) {
          setError(err.message || 'Failed to start Google sign-in.')
          setGoogleLoading(false)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google sign-in could not be initiated.')
        setGoogleLoading(false)
      }
      return
    }

    // Inside iframe: use popup flow to avoid X-Frame-Options DENY
    const width = 500
    const height = 650
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    let popup: Window | null = null

    try {
      popup = window.open(
        'about:blank',
        'supabase_google_oauth',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      )
    } catch {
      popup = null
    }

    // Fall back to redirect if popup was blocked
    if (!popup) {
      setError('Popups were blocked by your browser. Please allow popups for VidyaSetu, or continuing via direct redirect...')
      try {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: callbackUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        })
      } catch {
        setGoogleLoading(false)
      }
      return
    }

    try {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Connecting to Google — VidyaSetu</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#94a3b8;">
            <div style="text-align:center;padding:24px;">
              <div style="width:36px;height:36px;border:3px solid #6366f1;border-top-color:transparent;border-radius:50%;margin:0 auto 16px auto;animation:spin 1s linear infinite;"></div>
              <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
              <p style="font-size:15px;color:#f8fafc;margin:0 0 6px 0;font-weight:600;">Connecting to Google…</p>
              <p style="font-size:12px;margin:0;color:#64748b;">Please select your Google Account in this window</p>
            </div>
          </body>
        </html>
      `)
    } catch {}

    // 60-second timeout to always reset loading state
    const timeoutTimer = setTimeout(() => {
      setGoogleLoading(false)
      if (popup && !popup.closed) {
        try { popup.close() } catch {}
      }
    }, 60000)

    // Monitor if user closes popup manually
    const pollTimer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollTimer)
        clearTimeout(timeoutTimer)
        setGoogleLoading(false)
      }
    }, 800)

    try {
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (err) {
        clearInterval(pollTimer)
        clearTimeout(timeoutTimer)
        if (popup && !popup.closed) popup.close()
        setError(err.message || 'Failed to start Google sign-in.')
        setGoogleLoading(false)
        return
      }

      if (data?.url) {
        if (popup && !popup.closed) {
          popup.location.href = data.url
        } else {
          clearInterval(pollTimer)
          clearTimeout(timeoutTimer)
          window.location.href = data.url
        }
      } else {
        clearInterval(pollTimer)
        clearTimeout(timeoutTimer)
        if (popup && !popup.closed) popup.close()
        setError('No authorization URL returned from Supabase.')
        setGoogleLoading(false)
      }
    } catch (err: unknown) {
      clearInterval(pollTimer)
      clearTimeout(timeoutTimer)
      if (popup && !popup.closed) popup.close()
      const msg = err instanceof Error ? err.message : 'Google authentication could not be completed.'
      setError(msg)
      setGoogleLoading(false)
    }
  }

  return (
    <div className={`login-page-wrapper ${mounted ? 'login-mounted' : ''}`}>
      
      {/* ── LEFT PANEL: National Educational Trust Showcase ── */}
      <div className="login-left-panel">
        <FloatingOrb className="login-orb-1" />
        <FloatingOrb className="login-orb-2" />
        <FloatingOrb className="login-orb-3" />

        <div className="login-left-content">
          {/* Brand */}
          <Logo variant="white" size="lg" className="login-brand group" id="login-brand-link" badge="Nepal" />

          {/* Headline */}
          <div className="login-left-headline">
            <h2 className="login-left-title">
              Nepal&apos;s <span className="login-gradient-text">#1 Open Digital</span><br />
              Education Platform
            </h2>
            <p className="login-left-sub">
              Access curated study materials, solved past papers from 2075–2081, and timed practice tests covering SEE, +2 Board, University, and Loksewa PSC.
            </p>
          </div>

          {/* Ambient Study Hall Showcase */}
          <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl aspect-[16/9] max-w-md bg-slate-900 group">
            <Image
              src="/images/about_hero_learning.jpg"
              alt="Nepali students studying with VidyaSetu"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 420px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                Accredited CDC & TU Syllabi
              </span>
              <span className="text-[11px] text-slate-300 font-mono tabular-nums">
                77 Districts
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="login-stats-grid max-w-md">
            {STATS.map((s) => (
              <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </div>

          {/* Testimonial */}
          <div className="login-testimonial max-w-md">
            <div className="flex items-center justify-between mb-1.5">
              <div className="login-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="#fbbf24" stroke="none" />
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                IOE Entrance Ranker
              </span>
            </div>
            <p className="login-testimonial-text text-xs leading-relaxed">
              &ldquo;VidyaSetu helped me ace my IOE engineering entrance. The chapter-wise MCQs feel exactly like the official examination!&rdquo;
            </p>
            <div className="login-testimonial-author mt-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                RK
              </div>
              <div>
                <div className="login-testimonial-name text-xs">Raj Kumar Shrestha</div>
                <div className="login-testimonial-role text-[10px]">Pulchowk Campus &bull; IOE Entrance Top 50</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Refined Modern Login Form ── */}
      <div className="login-right-panel overflow-y-auto">
        <div className="login-form-wrapper py-8 sm:py-12 my-auto">
          {/* Top navigation controls */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
            
            <button
              onClick={toggleTheme}
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Toggle theme"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              <Moon size={15} className="dark:hidden" />
              <Sun size={15} className="text-amber-400 hidden dark:block" />
            </button>
          </div>

          {/* Header */}
          <div className="login-form-header">
            <div className="login-welcome-icon">
              <Sparkles size={22} />
            </div>
            <h1 className="login-form-title">Welcome back</h1>
            <p className="login-form-sub">Sign in to continue your learning journey across Nepal</p>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="login-error animate-fade-in">
              <span className="font-bold shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth */}
          <button
            id="login-google-btn"
            onClick={(e) => handleGoogle(e)}
            disabled={googleLoading || loading}
            type="button"
            className="login-google-btn group"
            suppressHydrationWarning
          >
            <GoogleLogo />
            <span>{googleLoading ? 'Connecting to Google…' : 'Continue with Google'}</span>
            <div className="login-google-arrow group-hover:translate-x-0.5 transition-transform">
              <ArrowRight size={14} />
            </div>
          </button>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">or sign in with credentials</span>
            <div className="login-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form space-y-4">
            
            {/* Email or Username */}
            <div className="login-field">
              <label htmlFor="login-identifier" className="login-label">
                Email or Username
              </label>
              <div className="login-input-wrap">
                <Mail size={15} className="login-input-icon" />
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="student@vidyasetu.com or username"
                  className="login-input"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-label">
                  Password
                </label>
                <Link href="/forgot-password" className="login-forgot">
                  Forgot password?
                </Link>
              </div>
              <div className="login-input-wrap">
                <Lock size={15} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="login-input login-input-pass"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  aria-pressed={showPass}
                  className="login-eye-btn"
                  suppressHydrationWarning
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="login-submit-btn group mt-2"
              suppressHydrationWarning
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In…</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Trust Guarantees */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Check size={12} className="text-emerald-500" /> 100% Free Access
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-indigo-500" /> 256-Bit TLS Secured
            </span>
          </div>

          {/* Footer */}
          <p className="login-footer-text mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="login-signup-link font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an account free
            </Link>
          </p>

          {/* Legal */}
          <p className="login-legal mt-2 text-center text-[11px] text-slate-400">
            Protected by VidyaSetu Academic Trust &bull;{' '}
            <Link href="/terms" className="login-legal-link hover:underline">Terms</Link>
            {' '}&bull;{' '}
            <Link href="/privacy" className="login-legal-link hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-page-wrapper">
        <div className="login-left-panel" />
        <div className="login-right-panel">
          <div className="login-form-wrapper animate-pulse">
            <div style={{ height: 480, background: 'rgba(99,102,241,0.05)', borderRadius: 16 }} />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
