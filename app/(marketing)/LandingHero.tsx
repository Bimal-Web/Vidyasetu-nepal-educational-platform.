'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Award, Star,
  TrendingUp, Users, BookMarked, Trophy, Sparkles,
  ShieldCheck, Radio, GraduationCap, Laptop, FileText, Check
} from 'lucide-react'
import { AVATAR_COLORS } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface LandingHeroProps {
  learnerCount: number
  subjectCount: number
  recentUsers: { full_name?: string | null; avatar_url?: string | null; email?: string | null }[]
  topSubjects?: string[]
}

const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k+` : `${n}+`

function initialsOf(name?: string | null, email?: string | null) {
  if (name) return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return 'ST'
}

function AnimatedCounter({ value, suffix = '+' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const duration = 1800
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(count)
  return <span ref={ref} suppressHydrationWarning>{formatted}{suffix}</span>
}

/** Animated donut ring with high-contrast indicator */
function DonutRing({ pct, size = 52, stroke = 5, color = '#6366f1' }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.22) + 'px', fontWeight: 900, color: '#4f46e5',
      }}>
        {pct}%
      </span>
    </div>
  )
}

const MINI_STATS = [
  { icon: BookMarked, label: 'Materials', value: 24000, suffix: '+' },
  { icon: Users,      label: 'Students',  value: 120000, suffix: '+' },
  { icon: TrendingUp, label: 'Subjects',  value: 850, suffix: '+' },
]

/** Curriculum streams */
const CURRICULUM_STREAMS = [
  { label: 'Loksewa GK & IQ',   pct: 94, color: '#6366f1' },
  { label: 'SEE Comp. Math',    pct: 88, color: '#f59e0b' },
  { label: 'NEB +2 Physics',    pct: 84, color: '#10b981' },
  { label: 'TU BCA / BBS',      pct: 76, color: '#8b5cf6' },
]

const EXAM_NAV_CHIPS = [
  { label: 'SEE Class 10', href: '/browse?program=secondary', icon: GraduationCap, color: 'text-indigo-600 dark:text-indigo-400' },
  { label: '+2 Science & Mgmt', href: '/browse?program=secondary', icon: FileText, color: 'text-violet-600 dark:text-violet-400' },
  { label: 'Loksewa PSC 2081', href: '/browse?program=loksewa', icon: Award, color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'TU / KU Faculties', href: '/browse?program=bachelor', icon: Laptop, color: 'text-amber-600 dark:text-amber-400' },
]

export function LandingHero({
  learnerCount, subjectCount, recentUsers,
}: LandingHeroProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const totalLearners = Math.max(learnerCount, 120000)
  const totalSubjects = Math.max(subjectCount, 850)

  return (
    <section className="hero-section" role="banner">
      <div className="hero-dot-grid" aria-hidden="true" />
      <div className="hero-bg-mesh" aria-hidden="true" />
      <div className="hero-bg-glow hero-bg-glow-1" aria-hidden="true" />
      <div className="hero-bg-glow hero-bg-glow-2" aria-hidden="true" />

      <div className={`hero-container ${visible ? 'hero-visible' : ''}`}>
        <div className="hero-grid">

          {/* â”€â”€ LEFT COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="hero-left">
            {/* Precision Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/90 dark:border-indigo-800/80 backdrop-blur-xl shadow-2xs mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-300">
                Nepal&apos;s #1 Academic & Exam Platform
              </span>
            </div>

            {/* Headline with Clean Accent */}
            <h1 className="hero-headline text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white mb-5">
              The Bridge to{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
                Every Exam
              </span>{' '}
              You&apos;ll Ever Take.
            </h1>

            {/* Subtitle */}
            <p className="hero-sub text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mb-7">
              From School fundamentals (SEE & +2) to Loksewa PSC & University faculties â€” access Nepal&apos;s
              most trusted library of verified notes, solved past papers, and MCQ practice sets.
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold"> 100% Free Forever.</strong>
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-7 w-full sm:w-auto">
              <Link 
                href="/signup" 
                id="hero-cta-primary" 
                className="btn-nested-pill w-full sm:w-auto justify-center bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_16px_36px_-6px_rgba(79,70,229,0.55)] group"
              >
                <span className="font-bold tracking-tight text-sm sm:text-base">Start Learning Free</span>
                <span className="btn-nested-icon bg-white/20 dark:bg-black/25 text-white shadow-2xs group-hover:scale-110">
                  <ArrowRight size={16} />
                </span>
              </Link>
              <Link 
                href="/browse" 
                id="hero-cta-secondary" 
                className="btn-nested-pill w-full sm:w-auto justify-center bg-white hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs group"
              >
                <span className="font-semibold text-sm">Explore All {totalSubjects}+ Subjects</span>
                <span className="btn-nested-icon bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:translate-x-0.5">
                  <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            {/* Curated Exam Stream Navigator (Clean SVG Icons, No Cartoon Emojis) */}
            <div className="mb-7">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                <Sparkles size={12} className="text-amber-500" />
                <span>Quick Stream Navigator:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXAM_NAV_CHIPS.map(chip => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900/90 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-all hover:-translate-y-0.5"
                  >
                    <chip.icon size={13} className={chip.color} />
                    <span>{chip.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust Validation Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-7 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Check size={14} className="text-emerald-500 shrink-0" />
                100% Free Forever
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Check size={14} className="text-emerald-500 shrink-0" />
                Instant Offline PDF Notes
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Check size={14} className="text-emerald-500 shrink-0" />
                Official CDC & TU Syllabi
              </span>
            </div>

            {/* Social Proof */}
            <div className="hero-social-proof pt-0 border-0">
              <div className="hero-avatars">
                {(recentUsers.length > 0 ? recentUsers : [{}, {}, {}, {}]).slice(0, 4).map((u, i) =>
                  u?.avatar_url ? (
                    <img key={i} src={u.avatar_url} alt="" loading="lazy" className="hero-avatar" />
                  ) : (
                    <div key={i} className="hero-avatar hero-avatar-initials"
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                      {initialsOf(u?.full_name, u?.email)}
                    </div>
                  )
                )}
              </div>
              <div className="hero-social-text">
                <div className="hero-stars">
                  {[0, 1, 2, 3, 4].map(i => <Star key={i} size={11} fill="#fbbf24" stroke="none" />)}
                </div>
                <span>Joined by <strong>{fmt(totalLearners)}</strong> students across all 77 districts of Nepal</span>
              </div>
            </div>

            {/* Mobile Visual Showcase Card (Visible only on < lg screens) */}
            <div className="lg:hidden mt-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Bikram Shrestha (Rank 1)</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Loksewa Mock Exam #14</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                  98/100
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">24k+</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Materials</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">120k+</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Students</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">850+</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Subjects</p>
                </div>
              </div>
            </div>

          </div>

          {/* â”€â”€ RIGHT â€” Masterpiece Showcase Visual (Desktop) â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="hero-right">
            <div className="hv-scene">

              {/* Ambient Radiant Glow Mesh */}
              <div className="hv-stage-glow" aria-hidden="true" />

              {/* Orbital Celestial Ring with Micro-Particle */}
              <div className="hv-stage-orbit" aria-hidden="true">
                <div className="hv-stage-orbit-node" />
              </div>

              {/* Luminous Pedestal at Student Base */}
              <div className="hv-stage-pedestal" aria-hidden="true" />

              {/* Transparent Student Image Cutout with Studio Mask */}
              <div className="hv-photo-wrap">
                <Image
                  src="/hero-student.png"
                  alt="VidyaSetu Student Ambassador holding study binder"
                  width={450}
                  height={600}
                  priority
                  unoptimized
                  className="hv-photo"
                />
              </div>

              {/* â”€â”€ Card 1: Top Performer (Top Left) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="hv-card hv-card-tl animate-float-a group">
                <div className="hv-card-avatar-wrap">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Trophy size={18} className="text-amber-100" />
                  </div>
                  <span className="hv-avatar-crown-badge">#1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Rank 1 Top Scorer
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Bikram Shrestha</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Loksewa Mock Exam #14</p>
                </div>
                <div className="hv-score-pill">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">98/100</span>
                </div>
              </div>

              {/* â”€â”€ Card 2: Live Activity (Top Right) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="hv-card hv-card-tr animate-float-c">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Radio size={14} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white">1,420+ Online</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Across 77 districts</p>
                </div>
              </div>

              {/* â”€â”€ Card 3: Active Study Streams (Bottom Left) â”€â”€â”€ */}
              <div className="hv-card hv-card-bl animate-float-b">
                <div className="hv-studied-header">
                  <DonutRing pct={88} size={50} stroke={5} color="#6366f1" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="hv-card-value text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">88% Active</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 uppercase">CDC</span>
                    </div>
                    <p className="hv-card-label text-[11px] text-slate-600 dark:text-slate-400 leading-tight mt-0.5 font-semibold">
                      Curriculum Progress<br />
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">This Academic Term</span>
                    </p>
                  </div>
                </div>

                <div className="hv-progress-list">
                  {CURRICULUM_STREAMS.map((s, i) => (
                    <div key={i} className="hv-prog-row">
                      <span className="hv-prog-label">{s.label}</span>
                      <div className="hv-prog-track">
                        <div className="hv-prog-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                      <span className="hv-prog-pct">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* â”€â”€ Card 4: Verified Accreditation (Bottom Right) â”€â”€ */}
              <div className="hv-card hv-card-br animate-float-c">
                <div className="hv-card-icon-wrap hv-card-icon-green">
                  <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Accreditation</p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">100% Expert Verified</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">TU & CDC Syllabi 2081/82</p>
                </div>
              </div>

              {/* â”€â”€ Glassmorphic Telemetry Dock (Bottom Center) â”€â”€ */}
              <div className="hv-stats-dock">
                {MINI_STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className="hv-dock-item"
                    style={{ borderRight: i < MINI_STATS.length - 1 ? '1px solid rgba(226,232,240,0.8)' : 'none' }}
                  >
                    <s.icon size={13} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="hv-dock-val">
                      <AnimatedCounter value={i === 1 ? totalLearners : (i === 2 ? totalSubjects : s.value)} suffix={s.suffix} />
                    </span>
                    <span className="hv-dock-label">{s.label.toUpperCase()}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
