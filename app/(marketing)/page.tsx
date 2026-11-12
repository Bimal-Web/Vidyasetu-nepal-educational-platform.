import { createClient } from '@/lib/supabase/server'
import { LandingHero } from './LandingHero'
import { HomeStats } from './HomeStats'
import { SubjectBadge } from '@/components/features/SubjectBadge'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, WifiOff, Users, TrendingUp, ShieldCheck,
  Map, BookOpen, Award, Star, Quote, Zap, Sparkles,
  CheckCircle2, Check
} from 'lucide-react'

const DEFAULT_MARQUEE_SUBJECTS = [
  'Loksewa General Knowledge & IQ',
  'SEE Compulsory Mathematics',
  'NEB Grade 12 Physics',
  'TU BCA Computer Fundamentals',
  'Human Anatomy & Physiology',
  'KU Engineering Mathematics',
  'NEB Chemistry & Organic Reactions',
  'C Programming & Data Structures',
  'Kharidar Model Questions',
  'TU BBS Business Finance',
  'NEB Grade 11 Accountancy',
  'Na.Su. Administrative Aptitude',
  'IOE Entrance Mathematics',
  'CEE Medical Biology',
  'Nepali Byakaran & Sahitya',
  'SEE Science & Technology',
  'Database Management Systems (DBMS)',
  'Macroeconomics & Microeconomics',
  'Civil Engineering Mechanics',
  'Constitutional Law of Nepal',
  'Optional Mathematics (SEE)',
  'Class 10 Social Studies',
  'Digital Logic & Microprocessors',
  'Hotel Management & Tourism',
  'Business Mathematics & Statistics',
  'Object-Oriented Programming with Java',
  'Banking Law & Financial Management',
  'Sociology & Nepali Society',
  'Teacher Service Commission (TSC) Pedagogy',
  'Web Technology & Modern JS',
]

async function getStats() {
  try {
    const supabase = await createClient()
    const [{ count: resources }, { count: learners }, { count: subjects }, { data: recentUsers }, { data: dbSubjectRows }] = await Promise.all([
      supabase.from('content').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('full_name, avatar_url, email').order('created_at', { ascending: false }).limit(4),
      supabase.from('subjects').select('name, grade_or_semester').limit(100),
    ])

    const formattedDbSubjects: string[] = []
    if (dbSubjectRows && Array.isArray(dbSubjectRows)) {
      for (const row of dbSubjectRows) {
        const name = (row.name || '').trim()
        const grade = (row.grade_or_semester || '').trim()
        if (!name) continue

        let label = name
        if (grade && !/grade|class|semester|year|ioe|see|ble|kharidar|officer|bca|entrance/i.test(name)) {
          label = `${name} (${grade})`
        }
        formattedDbSubjects.push(label)
      }
    }

    const seen = new Set<string>()
    const topSubjects: string[] = []

    const addUnique = (item: string) => {
      const clean = item.trim()
      if (clean && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase())
        topSubjects.push(clean)
      }
    }

    const maxLen = Math.max(formattedDbSubjects.length, DEFAULT_MARQUEE_SUBJECTS.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < formattedDbSubjects.length) addUnique(formattedDbSubjects[i])
      if (i < DEFAULT_MARQUEE_SUBJECTS.length) addUnique(DEFAULT_MARQUEE_SUBJECTS[i])
    }

    return {
      resources: resources ?? 50000,
      learners: learners ?? 120000,
      subjects: subjects ?? 850,
      recentUsers: recentUsers ?? [],
      topSubjects: topSubjects.length >= 8 ? topSubjects : DEFAULT_MARQUEE_SUBJECTS,
    }
  } catch {
    return {
      resources: 50000,
      learners: 120000,
      subjects: 850,
      recentUsers: [],
      topSubjects: DEFAULT_MARQUEE_SUBJECTS,
    }
  }
}

const pathCards = [
  {
    id: 'secondary',
    title: 'Secondary School',
    description: 'Complete coverage for Class 1 to 12, including SEE and NEB model questions and chapter-wise notes.',
    href: '/browse?program=secondary',
    linkLabel: 'Explore School',
    icon: 'education',
    color: 'indigo',
    cardColor: 'path-card-indigo',
    eyebrow: 'Class 1–12',
  },
  {
    id: 'bachelor',
    title: 'Bachelor Faculties',
    description: 'Engineering, CSIT, Management, and Medicine, TU, KU, and PU syllabi-aligned resources.',
    href: '/browse?program=bachelor',
    linkLabel: 'Explore Bachelor',
    icon: 'engineering',
    color: 'amber',
    cardColor: 'path-card-amber',
    eyebrow: 'University Level',
    badge: 'Popular',
  },
  {
    id: 'loksewa',
    title: 'Loksewa & PSC',
    description: 'Intensive preparation material for Kharidar, Na.Su., and Officer levels with daily updated MCQ sets.',
    href: '/browse?program=loksewa',
    linkLabel: 'Explore Loksewa',
    icon: 'loksewa',
    color: 'green',
    cardColor: 'path-card-green',
    eyebrow: 'Government Exams',
  },
]

const testimonials = [
  {
    name: 'Aarav Sharma',
    role: 'Grade 12 Science Scholar',
    badge: 'SEE 3.95 GPA',
    text: 'VidyaSetu completely transformed how I prepared for NEB board exams. The chapter-wise notes and solved model papers saved me dozens of hours every single week before finals.',
    avatar: 'AS',
    avatarBg: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  },
  {
    name: 'Pooja Shrestha',
    role: 'Loksewa Candidate',
    badge: 'Officer & Na.Su. Prep',
    text: 'Balancing a full-time job while preparing for Loksewa seemed impossible until I found VidyaSetu. The daily MCQ practice sets and instant explanations doubled my confidence.',
    avatar: 'PS',
    avatarBg: 'linear-gradient(135deg, #059669, #10b981)',
  },
  {
    name: 'Bikash Adhikari',
    role: 'TU BCA 6th Sem Student',
    badge: 'Semester Rank 1',
    text: 'Finding organized notes for TU BCA used to be a nightmare of begging seniors. Here everything is structured, accurate, and completely free of cost.',
    avatar: 'BA',
    avatarBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
  },
]

export default async function HomePage() {
  const stats = await getStats()
  const learnerFmt = stats.learners >= 1000 ? `${(stats.learners / 1000).toFixed(0)}k+` : `${stats.learners}+`
  const marqueeList = stats.topSubjects && stats.topSubjects.length >= 4 ? stats.topSubjects : DEFAULT_MARQUEE_SUBJECTS

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <LandingHero
        learnerCount={stats.learners}
        subjectCount={stats.subjects}
        recentUsers={stats.recentUsers}
        topSubjects={stats.topSubjects}
      />

      {/* ── Marquee Subject Ticker ────────────────────────── */}
      <section className="marquee-section" aria-label="Available subjects and courses ticker">
        <div className="marquee-track">
          <div className="marquee-group">
            {marqueeList.map((name, i) => (
              <span key={`grp1-${i}-${name}`} className="marquee-item">
                <span className="marquee-dot" />
                {name}
              </span>
            ))}
          </div>
          <div className="marquee-group" aria-hidden="true">
            {marqueeList.map((name, i) => (
              <span key={`grp2-${i}-${name}`} className="marquee-item">
                <span className="marquee-dot" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Band ────────────────────────────────────── */}
      <HomeStats resources={stats.resources} learners={stats.learners} subjects={stats.subjects} />

      {/* ── Choose Your Path ─────────────────────────────── */}
      <section className="path-section" aria-labelledby="paths-heading">
        <div className="section-heading-wrap" style={{ maxWidth: '1100px', margin: '0 auto 3.5rem' }}>
          <div className="section-eyebrow">
            <Map size={12} />
            Choose Your Path
          </div>
          <h2 id="paths-heading" className="text-section text-slate-800 dark:text-slate-100" style={{ marginBottom: '0.5rem' }}>
            Tailored For Every Academic Stage
          </h2>
          <p className="text-body text-slate-500 dark:text-slate-400">
            Curated resources specifically designed for where you are on your learning journey.
          </p>
        </div>

        <div className="path-grid max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {pathCards.map(card => (
            <Link
              key={card.id}
              href={card.href}
              className="double-bezel group block no-underline"
              id={`path-card-${card.id}`}
            >
              <div className="double-bezel-inner h-full flex flex-col justify-between gap-6 p-6 sm:p-7 relative overflow-hidden">
                {/* Subtle decorative gradient glow behind icon */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" aria-hidden="true" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="transition-transform group-hover:scale-110 duration-300">
                      <SubjectBadge iconKey={card.icon} colorKey={card.color} size="md" />
                    </div>
                    {card.badge && (
                      <span className="text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    {card.eyebrow}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Kinetic Button-in-Button link */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {card.linkLabel}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:translate-x-1.5 group-hover:-translate-y-0.5 shadow-2xs">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features Bento Grid ───────────────────────────── */}
      <section className="features-section" aria-labelledby="features-heading">
        <div className="section-heading-wrap" style={{ maxWidth: '1100px', margin: '0 auto 3.5rem' }}>
          <div className="section-eyebrow">
            <Award size={12} />
            Platform Architecture
          </div>
          <h2 id="features-heading" className="text-section text-slate-800 dark:text-slate-100" style={{ marginBottom: '0.5rem' }}>
            Engineered for Academic Excellence
          </h2>
          <p className="text-body text-slate-500 dark:text-slate-400">
            Intelligent features purpose-built to help Nepali students study smarter, retain more, and pass exams with flying colors.
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Offline Sync Vault (Wide span 4) */}
          <div className="bento-card bento-span-4 double-bezel group p-1.5" id="bento-feature-offline">
            <div className="double-bezel-inner h-full flex flex-col justify-between gap-6 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bento-icon bento-icon-indigo group-hover:scale-105 transition-transform duration-300">
                    <WifiOff size={24} color="#fff" />
                  </div>
                  <div>
                    <h3 className="bento-title text-lg sm:text-xl font-bold">Offline-First Synchronized Learning</h3>
                    <p className="bento-desc mt-1.5">
                      Never let spotty internet disrupt your exam revision. Cache entire subject modules, PDF notes, and formula sheets directly to your device with one tap.
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulated Interactive Offline Vault Widget */}
              <div className="bento-mockup-frame space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Device Cache Status</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Active &bull; 100% Offline Ready
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">NEB Grade 12 Physics &bull; Unit 3 Optics</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Complete handwritten summary &bull; 4.2 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cached in IndexedDB</span>
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="bento-visual">
                <span className="bento-tag">Instant PDF Viewer</span>
                <span className="bento-tag">Offline Quizzes</span>
                <span className="bento-tag">Zero Data Lag</span>
                <span className="bento-tag">Auto-Sync on Reconnect</span>
              </div>
            </div>
          </div>

          {/* Card 2: Student Discussion (Span 2) */}
          <div className="bento-card bento-span-2 double-bezel group p-1.5" id="bento-feature-community">
            <div className="double-bezel-inner h-full flex flex-col justify-between gap-5 p-6">
              <div>
                <div className="bento-icon bento-icon-amber group-hover:scale-105 transition-transform duration-300 mb-4">
                  <Users size={24} color="#fff" />
                </div>
                <h3 className="bento-title font-bold">Peer Study Circles</h3>
                <p className="bento-desc mt-1.5 text-xs sm:text-sm">
                  Join vibrant student communities across Nepal. Ask tough questions and get verified answers from senior toppers.
                </p>
              </div>

              {/* Simulated Live Community Bubble */}
              <div className="bento-mockup-frame space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[10px] text-white font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">AS</div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-[10px] text-white font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">PS</div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-[10px] text-white font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">BA</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="pulse-green-dot" />
                    <span>4.2k active now</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Bikash (Rank 1):</span> &ldquo;NEB 2080 Model Paper solutions uploaded!&rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Smart Analytics (Span 2) */}
          <div className="bento-card bento-span-2 double-bezel group p-1.5" id="bento-feature-analytics">
            <div className="double-bezel-inner h-full flex flex-col justify-between gap-5 p-6">
              <div>
                <div className="bento-icon bento-icon-emerald group-hover:scale-105 transition-transform duration-300 mb-4">
                  <TrendingUp size={24} color="#fff" />
                </div>
                <h3 className="bento-title font-bold">Adaptive Exam Radar</h3>
                <p className="bento-desc mt-1.5 text-xs sm:text-sm">
                  Identify weak chapters before exam day. Real-time quiz breakdowns highlight where you need more practice.
                </p>
              </div>

              {/* Simulated Progress Analytics */}
              <div className="bento-mockup-frame space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Exam Readiness</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">88%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                  <span>Math: 94%</span>
                  <span>Physics: 85%</span>
                  <span>Chem: 82%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Verified Curriculum (Wide span 4) */}
          <div className="bento-card bento-span-4 double-bezel group p-1.5" id="bento-feature-curriculum">
            <div className="double-bezel-inner h-full flex flex-col justify-between gap-6 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="bento-icon bento-icon-violet group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck size={24} color="#fff" />
                </div>
                <div>
                  <h3 className="bento-title text-lg sm:text-xl font-bold">100% University & Board Syllabus Aligned</h3>
                  <p className="bento-desc mt-1.5">
                    Every single past paper, chapter summary, and MCQ question is strictly mapped against the latest official syllabi from NEB, TU, KU, PU, and Loksewa Aayog.
                  </p>
                </div>
              </div>

              {/* Official Board Syllabus Certification Mockup */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { name: 'NEB Board', level: 'Grade 11 & 12', verified: true },
                  { name: 'Tribhuvan Univ', level: 'IOST & IOE', verified: true },
                  { name: 'Kathmandu Univ', level: 'SOE & SOM', verified: true },
                  { name: 'Loksewa Aayog', level: 'PSC Kharidar/Officer', verified: true },
                ].map(board => (
                  <div key={board.name} className="bento-mockup-frame p-2.5 text-center flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      <span>{board.name}</span>
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{board.level}</span>
                  </div>
                ))}
              </div>

              <div className="bento-visual">
                <span className="bento-tag">Official CDC Standards</span>
                <span className="bento-tag">Verified Answer Keys</span>
                <span className="bento-tag">Annual Revision Cycle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ──────────────────────────── */}
      <section className="testimonials-section" aria-labelledby="testimonials-heading">
        <div className="section-heading-wrap" style={{ maxWidth: '1100px', margin: '0 auto 3.5rem' }}>
          <div className="section-eyebrow">
            <Sparkles size={12} />
            Student Voices
          </div>
          <h2 id="testimonials-heading" className="text-section text-slate-800 dark:text-slate-100" style={{ marginBottom: '0.5rem' }}>
            Trusted by Thousands Across Nepal
          </h2>
          <p className="text-body text-slate-500 dark:text-slate-400">
            Hear from students who simplified their academic journey and scored top grades with VidyaSetu.
          </p>
        </div>

        <div className="testimonials-grid max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="double-bezel group p-1.5">
              <div className="double-bezel-inner h-full flex flex-col justify-between gap-5 p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="testimonial-quote-icon">
                      <Quote size={18} />
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map(i => (
                        <Star key={i} size={14} fill="#fbbf24" stroke="none" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0" style={{ background: t.avatarBg }}>
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.name}</h4>
                      <span title="Verified Learner" className="inline-flex items-center">
                        <CheckCircle2 size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {t.role} &bull; <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.badge}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Blog Teaser ──────────────────────────────────── */}
      <section className="blog-section" aria-labelledby="blog-heading">
        <div className="section-label-row">
          <div>
            <div className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>
              <BookOpen size={12} />
              Learning Resources
            </div>
            <h2 id="blog-heading" className="text-section text-slate-800 dark:text-slate-100" style={{ marginBottom: '0.25rem' }}>
              From the Blog
            </h2>
            <p className="text-body text-slate-500 dark:text-slate-400">
              Expert guides, exam strategies, and study science — all free.
            </p>
          </div>
          <Link href="/blog" className="section-view-all" id="blog-view-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="blog-grid">
          {[
            {
              slug: 'how-to-crack-see-exam-nepal',
              num: '01',
              gradientClass: 'blog-gradient-1',
              image: '/assets/blog/see-student-dhakatopi.jpg',
              imageAlt: 'Single Nepali student wearing traditional Dhaka topi studying with books for SEE exam',
              icon: BookOpen,
              title: 'How to Crack the SEE Exam: A Complete Strategy Guide',
              category: 'Exam Strategy',
              badge: { bg: 'rgba(99,102,241,0.08)', color: '#6366f1', border: 'rgba(99,102,241,0.2)' },
              readTime: '8 min read',
            },
            {
              slug: 'loksewa-preparation-guide-nepal',
              num: '02',
              gradientClass: 'blog-gradient-2',
              image: '/assets/blog/loksewa-dhakatopi.jpg',
              imageAlt: 'Single Nepali aspirant wearing Dhaka topi preparing for Loksewa civil service examination',
              icon: Award,
              title: 'The Ultimate Loksewa Preparation Guide: Beginner to Officer',
              category: 'Loksewa',
              badge: { bg: 'rgba(16,185,129,0.08)', color: '#059669', border: 'rgba(16,185,129,0.2)' },
              readTime: '12 min read',
            },
            {
              slug: 'best-study-techniques-nepali-students',
              num: '03',
              gradientClass: 'blog-gradient-3',
              image: '/assets/blog/study-techniques-dhakatopi.jpg',
              imageAlt: 'Focused Nepali student wearing Dhaka topi studying with notes and textbooks',
              icon: Zap,
              title: '7 Science-Backed Study Techniques Every Student Should Use',
              category: 'Study Tips',
              badge: { bg: 'rgba(139,92,246,0.08)', color: '#7c3aed', border: 'rgba(139,92,246,0.2)' },
              readTime: '6 min read',
            },
          ].map(post => {
            const PostIcon = post.icon
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-card-enhanced group"
                id={`blog-${post.slug}`}
              >
                {/* Visual Header with AI generated photo of Nepali student in Dhaka topi */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Subtle dark gradient overlay to keep badge and icon crystal clear */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                  <div className="blog-card-gradient-number shadow-md">{post.num}</div>
                  <div className="blog-card-gradient-icon shadow-md">
                    <PostIcon size={18} />
                  </div>
                </div>

                <div className="blog-card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem',
                      borderRadius: '9999px', letterSpacing: '0.04em',
                      background: post.badge.bg, color: post.badge.color,
                      border: `1px solid ${post.badge.border}`,
                    }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{post.readTime}</span>
                  </div>

                  <h3 className="blog-card-title group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>

                  <span className="blog-card-cta" style={{ marginTop: 'auto' }}>
                    Read article <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── CTA Banner (Agency-Grade Glowing Beacon) ───────── */}
      <section className="cta-section relative max-w-6xl mx-auto px-4 my-16 sm:my-24 bg-transparent" aria-labelledby="cta-heading">
        {/* Soft atmospheric backlight that seamlessly merges with page background */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl -z-10 rounded-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/25 p-8 sm:p-14 md:p-16 text-center shadow-2xl shadow-indigo-950/20">
          {/* Subtle ambient lighting */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-6">
              <Sparkles size={13} className="text-amber-400" />
              <span>Join {learnerFmt} High-Achieving Nepali Students</span>
            </div>

            <h2 id="cta-heading" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-5 text-white">
              Start Your Learning Journey Today
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
              Free, unrestricted access to Nepal&apos;s most comprehensive repository of chapter notes,
              solved past papers, and interactive MCQ mock exams.
            </p>

            {/* High-Contrast Interactive CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                id="cta-banner-signup"
                className="btn-nested-pill bg-white hover:bg-slate-100 text-indigo-950 font-extrabold shadow-xl shadow-black/20 group/cta w-full sm:w-auto"
              >
                <span>Create Free Account</span>
                <div className="btn-nested-icon bg-indigo-50 text-indigo-700 group-hover/cta:translate-x-1 transition-all">
                  <ArrowRight size={15} />
                </div>
              </Link>

              <Link
                href="/browse"
                id="cta-banner-browse"
                className="px-6 py-3.5 rounded-full font-bold text-sm text-white hover:bg-white/10 border border-white/20 backdrop-blur-md transition-colors w-full sm:w-auto"
              >
                Browse All 850+ Subjects
              </Link>
            </div>

            {/* Trust validation chips */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-8 border-t border-white/10 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> 100% Free Forever
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Works Offline Anywhere
              </span>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
