# VidyaSetu — Nepal Educational Platform

> **Vidyasetu**, Nepal's comprehensive educational platform that provides exam-related services for students across Nepal. The platform offers curated notes, past solved papers, model questions, exam results, notices, preparation resources, interactive MCQs, timed quizzes, and academic guidance for national and board examinations.

> **Project:** BCA Project — Tribhuvan University, Mechi Multiple Campus  
> **Authors:** Bimal & Dipesh 

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 15 (App Router), TypeScript     |
| Styling    | Tailwind CSS v4, custom design tokens   |
| Auth       | Supabase Auth (email + Google OAuth)    |
| Database   | Supabase (PostgreSQL)                   |
| Storage    | Supabase Storage (`content-uploads`)    |
| Hosting    | Vercel (Production)                     |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                         | Description                                      |
|----------------------------------|--------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | Your Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Your Supabase anon/public key                    |
| `NEXT_PUBLIC_SITE_URL`           | App URL (e.g. `https://vidyasetu.vercel.app`)    |

---

## Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migrations in order:

```sql
-- Run first:
\i supabase/migrations/001_initial_schema.sql

-- Run second (after creating your first admin user):
\i supabase/migrations/002_seed_data.sql
```

3. Create a **Supabase Storage bucket** named `content-uploads`:
   - Go to Storage → New Bucket → Name: `content-uploads`
   - Toggle "Public bucket" ON (or configure signed URLs)

4. Enable **Google OAuth** in Supabase:
   - Go to Auth → Providers → Google
   - Add your Google OAuth Client ID and Secret from [console.cloud.google.com](https://console.cloud.google.com)
   - Set redirect URL to: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add the following environment variables in the Vercel dashboard (Settings → Environment Variables):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (set to your `.vercel.app` URL)

Then update the **Google OAuth redirect URL** and **Supabase Site URL** to match your production domain.

---

## Project Structure

```
vidyasetu/
├── app/
│   ├── (marketing)/        # Landing page, About, Terms, Privacy
│   │   └── blog/           # Blog listing + individual post pages
│   ├── (auth)/             # Login, Signup
│   ├── (student)/          # Dashboard, Browse, Subject, MCQ, Quiz, Programs
│   ├── (contributor)/      # Contribute / Contributor Console
│   ├── (admin)/            # Admin Panel
│   └── api/                # Auth callback, Download API, Admin Moderation
├── components/
│   ├── layout/             # Navbar, Footer, Logo
│   └── features/           # SubjectCard, MCQCard, UploadDropzone, StatCard
├── lib/
│   └── supabase/           # client.ts, server.ts, middleware.ts
├── types/                  # Shared TypeScript types
├── supabase/
│   └── migrations/         # SQL schema + seed data
└── .env.example
```

---

## License

MIT — Free to use, modify, and distribute for educational purposes.
