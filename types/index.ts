// ============================================================
// VidyaSetu — Shared TypeScript type definitions
// Mirrors the Supabase database schema defined in
// supabase/setup_all.sql — keep in sync when schema changes.
// ============================================================

// ── Database row types ──────────────────────────────────────

export interface Program {
  id: string
  name: string
  level_order: number
  description?: string | null
  created_at?: string
}

export interface FacultyOrStream {
  id: string
  program_id: string
  name: string
  description?: string | null
  programs?: Program
  created_at?: string
}

export interface Subject {
  id: string
  faculty_id: string
  name: string
  grade_or_semester?: string | null
  description?: string | null
  icon_key: string
  color_key: string
  created_at?: string
  /** Joined relation */
  faculties_or_streams?: FacultyOrStream | null
}

export interface User {
  id: string
  full_name?: string | null
  email?: string | null
  avatar_url?: string | null
  role?: 'student' | 'contributor' | 'admin' | string
  auth_provider?: string | null
  created_at?: string
}

export type ContentStatus = 'pending' | 'approved' | 'rejected'
export type ContentType = 'note' | 'past_paper' | 'mcq_set' | string

export interface Content {
  id: string
  subject_id: string
  uploaded_by: string
  title: string
  type: ContentType
  /** Direct file URL (Supabase storage). Use drive_url for Google Drive hosted files. */
  file_url?: string | null
  /** Google Drive file ID or full URL for in-browser preview */
  drive_url?: string | null
  file_size?: number | null
  status: ContentStatus
  views?: number | null
  downloads?: number | null
  created_at?: string
  /** Joined relations */
  subjects?: Subject | null
  users?: User | null
}

export type SubmissionStatus = 'under_review' | 'approved' | 'rejected'

export interface Submission {
  id: string
  contributor_id: string
  content_id: string
  status: SubmissionStatus
  reviewed_by?: string | null
  reviewed_at?: string | null
  /** Joined relations */
  content?: Content | null
  reviewer?: User | null
}

export interface Quiz {
  id: string
  subject_id: string
  title: string
  question_count: number
  time_limit_minutes?: number | null
  created_by?: string | null
  created_at?: string
  /** Joined relation */
  subjects?: Subject | null
}

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'a' | 'b' | 'c' | 'd'
  explanation?: string | null
  created_at?: string
}

export interface QuizResult {
  id: string
  quiz_id: string
  user_id: string
  score: number
  answers?: Record<string, string> | null
  time_taken_seconds?: number | null
  completed_at?: string
  /** Joined relations */
  quizzes?: Quiz | null
  users?: User | null
}

// ── UI / view helper types ──────────────────────────────────

export type StreamCategory = 'all' | 'see' | 'plus2' | 'loksewa' | 'bachelor'

export interface LeaderboardUser {
  id: string
  name: string
  email: string
  avatar?: string | null
  avgScore: number
  quizzesTaken: number
  bestScore: number
  stream: string
  streamCategory: StreamCategory
  points: number
  streakDays: number
  honorTier: 'Grandmaster' | 'Diamond' | 'Gold' | 'Rising'
  trend: 'up' | 'steady' | 'new'
  weeklyScore?: number
  monthlyScore?: number
}

export interface Bookmark {
  id: string
  user_id: string
  subject_id: string
  created_at?: string
  subjects?: Subject | null
}

export interface DiscussionPost {
  id: string
  subject_id: string
  author_id: string
  content: string
  likes: number
  created_at?: string
  users?: User | null
}

