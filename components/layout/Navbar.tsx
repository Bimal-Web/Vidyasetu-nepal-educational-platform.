'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from './Logo'
import { isUserAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { 
  Search, Moon, Sun, Menu, X, BookOpen, FileText, Brain, 
  Clock, Award, Upload, ChevronDown, ChevronRight, LogOut, LayoutDashboard, 
  Settings, User, Trophy, CornerDownLeft, Loader2, Newspaper, Sparkles, GraduationCap, Atom, Info
} from 'lucide-react'

const mobileNavSections = [
  {
    title: 'Study Materials',
    links: [
      { label: 'Notes', href: '/browse?type=note', icon: BookOpen },
      { label: 'Past Papers', href: '/browse?type=past_paper', icon: FileText },
      { label: 'MCQs', href: '/browse?type=mcq', icon: Brain },
      { label: 'Quizzes', href: '/browse?type=quiz', icon: Clock },
    ]
  },
  {
    title: 'Classes & Boards',
    links: [
      { label: 'Class 11 (+2 NEB)', href: '/class11', icon: Atom },
      { label: 'Class 10 (SEE)', href: '/class10', icon: GraduationCap },
      { label: 'Class 8 (BLE)', href: '/class8', icon: Sparkles },
    ]
  },
  {
    title: 'Exams & Ranking',
    links: [
      { label: 'Loksewa', href: '/browse?program=loksewa', icon: Award },
      { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    ]
  },
  {
    title: 'Community',
    links: [
      { label: 'About VidyaSetu', href: '/about', icon: Info },
      { label: 'Blog', href: '/blog', icon: Newspaper },
      { label: 'Contribute', href: '/contribute', icon: Upload },
    ]
  }
]

const classDropdownItems = [
  {
    label: 'Class 11 (+2 NEB)',
    badge: 'NEB Board',
    description: 'Science, Management & Humanities model papers',
    href: '/class11',
    icon: Atom,
  },
  {
    label: 'Class 10 (SEE)',
    badge: 'CDC Official',
    description: 'SEE model question papers & solutions',
    href: '/class10',
    icon: GraduationCap,
  },
  {
    label: 'Class 8 (BLE)',
    badge: 'Basic Level',
    description: 'District BLE model papers & question bank',
    href: '/class8',
    icon: Sparkles,
  },
]


interface SearchSuggestion {
  id: string
  name: string
  match: 'subject'
}

export function Navbar() {
  const [dark, setDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [classesOpen, setClassesOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [searchStr, setSearchStr] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userRole, setUserRole] = useState<string>('student')
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!profileOpen) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileOpen])

  // Scroll listener for dynamic navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cmd+K / Ctrl+K shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Dark mode init + cross-tab sync
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'vs-dark') return
      const d = e.newValue === 'true'
      document.documentElement.classList.toggle('dark', d)
      setDark(d)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Track the current query string for exact nav-link matching
  useEffect(() => {
    setSearchStr(window.location.search)
    const onPop = () => setSearchStr(window.location.search)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [pathname])

  // Auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('users').select('role').eq('id', user.id).single()
          .then(({ data }) => {
            const isAdmin = isUserAdmin(user.email, data?.role)
            setUserRole(isAdmin ? 'admin' : (data?.role || 'student'))
          })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('users').select('role').eq('id', session.user.id).single()
          .then(({ data }) => {
            const isAdmin = isUserAdmin(session.user.email, data?.role)
            setUserRole(isAdmin ? 'admin' : (data?.role || 'student'))
          })
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('vs-dark', String(next))
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err)
    }
    try {
      document.cookie = 'vs-demo-user=; path=/; max-age=0'
      localStorage.removeItem('vs-demo-user')
    } catch {}
    setUser(null)
    setUserRole('student')
    setProfileOpen(false)
    setMobileOpen(false)
    router.push('/')
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
      setSuggestions([])
    }
  }

  // Live suggestions while typing
  useEffect(() => {
    if (!searchOpen) return
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSuggestions([])
      return
    }
    setSearching(true)
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('subjects')
        .select('id, name')
        .ilike('name', `%${q}%`)
        .order('name')
        .limit(6)
      setSuggestions((data ?? []).map(s => ({ ...s, match: 'subject' as const })))
      setSearching(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery, searchOpen, supabase])

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  // Exact matching: /browse?type=note is active only when pathname=/browse AND type=note
  const isNavActive = (href: string) => {
    const [base, query] = href.split('?')
    if (pathname !== base) return false
    if (!query) return true
    const wanted = new URLSearchParams(query)
    const current = new URLSearchParams(searchStr)
    return Array.from(wanted.entries()).every(([k, v]) => current.get(k) === v)
  }

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-sm border-b border-slate-200/80 dark:border-slate-800/80' 
            : 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40'
        }`}
      >
        {/* Subtle top glow line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 dark:via-indigo-400/25 to-transparent" aria-hidden="true" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Logo size="md" />
            </div>

            {/* Center: Nav Links (desktop) */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main Navigation">
              {/* Notes */}
              <Link
                href="/browse?type=note"
                className={`text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  isNavActive('/browse?type=note')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                Notes
              </Link>

              {/* Past Papers */}
              <Link
                href="/browse?type=past_paper"
                className={`text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  isNavActive('/browse?type=past_paper')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                Past Papers
              </Link>

              {/* Classes Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setClassesOpen(true)}
                onMouseLeave={() => setClassesOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setClassesOpen(p => !p)}
                  aria-expanded={classesOpen}
                  className={`flex items-center gap-1 text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    pathname.startsWith('/class11') || pathname.startsWith('/class10') || pathname.startsWith('/class8') || searchStr.includes('program=plus2') || searchStr.includes('program=secondary') || searchStr.includes('program=school')
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`}
                  id="navbar-classes-dropdown-btn"
                >
                  <GraduationCap size={15} className="text-indigo-500 shrink-0" />
                  <span>Classes</span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${classesOpen ? 'rotate-180' : ''}`} />
                </button>

                {classesOpen && (
                  <div 
                    className="absolute left-0 top-full mt-1.5 w-80 p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-scale-in"
                  >
                    <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Academic Classes & Board Papers
                      </p>
                    </div>

                    <div className="space-y-1">
                      {classDropdownItems.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setClassesOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <item.icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.label}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/40 dark:border-indigo-800/40">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 flex items-center justify-between text-xs">
                      <Link 
                        href="/browse?program=plus2" 
                        onClick={() => setClassesOpen(false)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Plus 2 (+2) Streams</span>
                        <ChevronRight size={12} />
                      </Link>
                      <Link 
                        href="/browse" 
                        onClick={() => setClassesOpen(false)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                      >
                        Browse All
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* MCQs */}
              <Link
                href="/browse?type=mcq"
                className={`text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  isNavActive('/browse?type=mcq')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                MCQs
              </Link>

              {/* Quizzes */}
              <Link
                href="/browse?type=quiz"
                className={`text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  isNavActive('/browse?type=quiz')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                Quizzes
              </Link>

              {/* Loksewa */}
              <Link
                href="/browse?program=loksewa"
                className={`text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  searchStr.includes('program=loksewa')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                Loksewa
              </Link>

              {/* Leaderboard */}
              <Link
                href="/leaderboard"
                className={`text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  pathname === '/leaderboard'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                Leaderboard
              </Link>

              {/* Contribute */}
              <Link
                href="/contribute"
                className={`hidden xl:inline-flex text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  pathname === '/contribute'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                Contribute
              </Link>

              {/* About */}
              <Link
                href="/about"
                className={`text-xs xl:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  pathname === '/about'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                About
              </Link>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Search button with subtle shortcut */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-slate-200/80 dark:border-slate-800/80 text-xs group"
                aria-label="Search (⌘K)"
                id="navbar-search-btn"
                title="Search subjects & notes (⌘K / Ctrl+K)"
              >
                <Search size={14} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                <span className="hidden xl:inline text-xs font-normal text-slate-400 dark:text-slate-500">Search...</span>
                <kbd className="hidden xl:inline-flex text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">⌘K</kbd>
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                className="w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-center border border-slate-200/80 dark:border-slate-800/80"
                aria-label="Toggle theme"
                id="navbar-dark-toggle"
                title="Toggle theme"
                suppressHydrationWarning
              >
                <Moon size={16} className="dark:hidden" />
                <Sun size={16} className="text-amber-400 hidden dark:block" />
              </button>

              {user ? (
                /* Profile dropdown */
                <div className="relative" ref={profileRef}>
                  <button
                    id="navbar-profile-btn"
                    onClick={() => setProfileOpen(p => !p)}
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement | null)?.classList.remove('hidden') }} />
                    ) : null}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-xs${avatarUrl ? ' hidden' : ''}`}>
                      {initials}
                    </div>
                    <span className="hidden sm:block text-xs font-medium text-slate-700 dark:text-slate-200 max-w-24 truncate">
                      {displayName}
                    </span>
                    <ChevronDown size={13} className="text-slate-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 card p-1.5 shadow-xl border border-slate-200 dark:border-slate-700 animate-scale-in z-50 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          {userRole} Account
                        </p>
                      </div>
                      <div className="py-1">
                        <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <LayoutDashboard size={15} className="text-indigo-600" /> Dashboard
                        </Link>
                        <Link href="/profile" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <User size={15} className="text-slate-400" /> Profile & Stats
                        </Link>
                        {userRole === 'admin' && (
                          <Link href="/admin" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
                            <Settings size={15} /> Admin Portal
                          </Link>
                        )}
                      </div>
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl transition-colors" id="navbar-login-btn">
                    Log In
                  </Link>
                  <Link href="/signup" className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-3.5 py-2 rounded-xl shadow-xs hover:shadow-indigo-500/25 transition-all" id="navbar-signup-btn">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile hamburger button with min 44px touch target */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open Navigation Menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-drawer"
                id="navbar-menu-btn"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE SLIDE-OUT DRAWER ──────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out drawer sheet */}
          <div className="fixed inset-y-0 right-0 max-w-xs sm:max-w-sm w-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-50 transform transition-transform ease-out duration-300 animate-slide-left">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User / Sign-in Banner in Drawer */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              {user ? (
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement | null)?.classList.remove('hidden') }} />
                  ) : null}
                  <div className={`w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow-xs${avatarUrl ? ' hidden' : ''}`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 capitalize">{userRole} Account</p>
                  </div>
                  <Link 
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    aria-label="Go to Dashboard"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Join Nepal&apos;s #1 Student Hub</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-center py-2 px-3 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="text-center py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Categorized Nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {mobileNavSections.map(section => (
                <div key={section.title} className="space-y-1.5">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.links.map(link => {
                      const active = isNavActive(link.href)
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            active
                              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <link.icon size={18} className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
                            <span>{link.label}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}

              {user && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Account & Settings
                  </p>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LayoutDashboard size={18} className="text-indigo-600" />
                    <span>Student Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User size={18} className="text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      <Settings size={18} />
                      <span>Admin Management</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer with Quick Theme Toggle */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Theme</span>
              <button
                onClick={toggleDark}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                <Moon size={15} className="dark:hidden" />
                <Sun size={15} className="text-amber-400 hidden dark:block" />
                <span className="dark:hidden">Dark Mode</span>
                <span className="hidden dark:inline">Light Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH MODAL OVERLAY ─────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Search subjects"
          onClick={() => { setSearchOpen(false); setSearchQuery(''); setSuggestions([]) }}>
          <div className="w-full max-w-2xl card p-4 animate-scale-in shadow-2xl rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <Search size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <input
                id="search-input"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search subjects, notes, past papers (e.g. SEE, Physics, Loksewa)..."
                className="flex-1 text-sm sm:text-base outline-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSuggestions([]) }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Close search">
                <X size={18} />
              </button>
            </form>

            {/* Live suggestions */}
            {searchQuery.trim().length >= 2 && (
              <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                {searching ? (
                  <p className="flex items-center gap-2 text-sm text-slate-400 py-2">
                    <Loader2 size={14} className="animate-spin" /> Searching catalogue…
                  </p>
                ) : suggestions.length > 0 ? (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {suggestions.map(s => (
                      <li key={s.id}>
                        <Link
                          href={`/subject/${s.id}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); setSuggestions([]) }}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                          </span>
                          <span className="text-caption text-indigo-600 dark:text-indigo-400 font-medium">Open Subject →</span>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={handleSearch}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors text-left"
                      >
                        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                          Search all results for &quot;{searchQuery.trim()}&quot;
                        </span>
                        <CornerDownLeft size={14} className="text-slate-400" />
                      </button>
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 py-2">No direct subject matches found. Press Enter to search full library.</p>
                )}
              </div>
            )}

            <p className="mt-3 text-xs text-slate-400 text-center">Press Enter to search · Esc to dismiss</p>
          </div>
        </div>
      )}

    </>
  )
}

