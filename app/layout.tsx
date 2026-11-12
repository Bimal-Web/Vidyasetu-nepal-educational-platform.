import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
}

export const metadata: Metadata = {
  title: 'VidyaSetu',
  description:
    "Nepal's comprehensive free digital education platform with curated notes, past papers, MCQ practice, and timed quizzes for Secondary, Higher Secondary, Bachelor, and Loksewa exams.",
  keywords: ['Nepal education', 'SEE notes', 'NEB notes', 'Loksewa preparation', 'past papers Nepal', 'free study materials'],
  openGraph: {
    title: 'VidyaSetu',
    description: "Nepal's comprehensive free digital education platform with curated notes, past papers, MCQ practice, and timed quizzes for Secondary, Higher Secondary, Bachelor, and Loksewa exams.",
    siteName: 'VidyaSetu',
    locale: 'en_US',
    type: 'website',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/favicon-32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=2', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: [
      { url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png?v=2" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('vs-dark');var d=t==='true'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}
try{var clean=function(){var els=document.querySelectorAll('[fdprocessedid]');for(var i=0;i<els.length;i++){els[i].removeAttribute('fdprocessedid')}};clean();if(typeof MutationObserver!=='undefined'){new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['fdprocessedid']})}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.className} overflow-x-clip min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
