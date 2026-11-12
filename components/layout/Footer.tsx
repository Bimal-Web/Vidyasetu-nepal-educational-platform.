'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Logo } from './Logo'
import { createClient } from '@/lib/supabase/client'
import { Send, Facebook, Upload, ArrowRight, ShieldCheck, Heart } from 'lucide-react'

const communityLinks = [
  { label: 'About VidyaSetu',      href: '/about' },
  { label: 'Leaderboard',          href: '/leaderboard' },
  { label: 'Blog & Exam Guides',   href: '/blog' },
  { label: 'Contribute Resources', href: '/contribute' },
  { label: 'Browse All Subjects',  href: '/browse' },
]

const academicLinks = [
  { label: 'Class 11 (+2) Model Papers', href: '/class11' },
  { label: 'SEE Class 10 Model Papers', href: '/class10' },
  { label: 'Class 8 BLE Model Papers', href: '/class8' },
  { label: '+2 Science & Management', href: '/browse?program=secondary' },
  { label: 'Loksewa PSC Preparation', href: '/browse?program=loksewa' },
  { label: 'TU / KU Faculties',       href: '/browse?program=bachelor' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim() })
      if (error) throw error
      setJoined(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="footer-dark mt-auto relative border-t border-slate-800/80 bg-[#05070e] text-slate-300">
      {/* Precision ambient top specular hairline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" aria-hidden="true" />

      {/* Contributor Showcase Island */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60 border border-indigo-500/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 backdrop-blur-xl shadow-xl shadow-black/20">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mx-auto sm:mx-0">
              <Upload size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Empower Fellow Nepali Learners</h3>
              <p className="text-xs sm:text-sm text-slate-400">Share your verified notes and solved past papers with 120k+ students across Nepal.</p>
            </div>
          </div>
          <Link
            href="/contribute"
            className="btn-nested-pill bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex-shrink-0 shadow-lg shadow-indigo-600/30 group"
          >
            <span>Become a Contributor</span>
            <span className="btn-nested-icon bg-indigo-700/80 group-hover:bg-indigo-700 group-hover:translate-x-0.5 text-white">
              <ArrowRight size={13} />
            </span>
          </Link>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & mission */}
          <div className="lg:col-span-2">
            <Logo size="md" className="[&_span]:text-white [&_span]:opacity-90" />
            <p className="mt-3.5 text-sm text-slate-400 leading-relaxed max-w-sm">
              The bridge to every exam you&apos;ll ever take. Nepal&apos;s leading open educational resource hub, providing verified notes, solved past papers, and interactive MCQ mock exams.
            </p>

            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-400">
              <ShieldCheck size={15} />
              <span>100% Free & Open Academic Initiative</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2.5 mt-6">
              <a
                id="footer-facebook-link"
                href="https://www.facebook.com/profile.php?id=61596641664303"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow VidyaSetu on Facebook"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                aria-label="Facebook Profile"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Academic Paths */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Academic Paths</h4>
            <ul className="space-y-2.5">
              {academicLinks.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community & Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Community</h4>
            <ul className="space-y-2.5">
              {communityLinks.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Exam Updates</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Receive notifications for new model sets, past question solutions, and Loksewa exam dates.
            </p>
            {joined ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <span>✓ You&apos;re subscribed to updates!</span>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-2" noValidate={false}>
                <label htmlFor="footer-email" className="sr-only">Email address</label>
                <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-indigo-500 transition-colors">
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null) }}
                    placeholder="student@example.com"
                    autoComplete="email"
                    required
                    aria-describedby={error ? 'footer-newsletter-error' : undefined}
                    className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    id="footer-join-btn"
                    disabled={submitting}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-wait flex items-center justify-center"
                    aria-label="Join newsletter"
                  >
                    <Send size={13} className={submitting ? 'animate-pulse' : ''} />
                  </button>
                </div>
                {error && (
                  <p id="footer-newsletter-error" role="alert" className="text-xs text-red-400">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom attribution & legal */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1">
            © 2026 VidyaSetu. Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for Nepali students.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 font-medium">BCA Final Year Project · Tribhuvan University</span>
            <span className="text-slate-700">•</span>
            <Link href="/about" className="hover:text-slate-300 text-indigo-400 font-medium transition-colors">About VidyaSetu</Link>
            <span className="text-slate-700">•</span>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
