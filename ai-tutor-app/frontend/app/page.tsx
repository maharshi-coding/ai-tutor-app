'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, fetchUser, isLoading } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-12 w-12 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* subtle moving gradient orbs */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-300 to-emerald-300 shadow-[0_0_25px_rgba(56,189,248,0.8)] flex items-center justify-center text-slate-950 font-black">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200 tracking-wide">
                Personal Tutor
              </p>
              <p className="text-xs text-slate-400">Face + Voice powered learning</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden md:inline-flex neon-pill">Beta · Experimental</span>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-slate-100 hover:border-sky-500 hover:text-sky-100 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.65)] hover:brightness-110 transition"
                >
                  My Avatar
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-slate-100 hover:border-sky-500 hover:text-sky-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.65)] hover:brightness-110 transition"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 pb-20 pt-8 lg:flex-row lg:items-stretch lg:pt-16">
        {/* Left hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full lg:w-1/2"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-slate-900/60 px-3 py-1 text-xs text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.4)] mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live AI tutor · Personalized to you
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
            Learn from an
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              {' '}
              AI that looks &amp; sounds like you.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-sm sm:text-base text-slate-300">
            Upload your face, clone your voice, and let your future self teach you
            step-by-step. Interactive explanations, instant quizzes, and a tutor that
            never gets tired.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.7)] hover:brightness-110 transition"
                >
                  Create my AI tutor
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-slate-600 bg-slate-900/60 px-6 py-3 text-sm font-medium text-slate-100 hover:border-sky-500 hover:text-sky-100 transition"
                >
                  I already have one
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.7)] hover:brightness-110 transition"
              >
                Continue learning
              </Link>
            )}
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="glass-panel rounded-2xl px-3 py-3">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">
                Avatar
              </p>
              <p className="mt-1 font-semibold text-sky-100">Your face, your vibe</p>
              <p className="mt-1 text-[0.7rem] text-slate-400">
                Mirror-style avatar that reacts as you learn.
              </p>
            </div>
            <div className="glass-panel rounded-2xl px-3 py-3">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">
                Voice
              </p>
              <p className="mt-1 font-semibold text-sky-100">Cloned narration</p>
              <p className="mt-1 text-[0.7rem] text-slate-400">
                Hear explanations in a familiar voice: yours.
              </p>
            </div>
            <div className="glass-panel rounded-2xl px-3 py-3">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">
                Lessons
              </p>
              <p className="mt-1 font-semibold text-sky-100">Adaptive paths</p>
              <p className="mt-1 text-[0.7rem] text-slate-400">
                Interactive sessions that adjust to your pace.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right side: preview of tutor space */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="glass-panel neon-border relative w-full rounded-3xl p-4 text-slate-100 shadow-2xl lg:w-1/2"
        >
          <div className="absolute right-4 top-4 flex items-center gap-2 text-[0.65rem] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Interactive demo
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-[0.7rem] text-slate-300">
                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
                  Live chat
                </p>
                <p className="mt-1 text-xs">
                  “Hey future me, explain derivatives like I’m five.”
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                    Smart roadmap
                  </p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] text-emerald-300">
                    Adaptive
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[0.65rem]">
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-200">
                    • Concepts you keep missing
                  </span>
                  <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-200">
                    • Next-step practice
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                    • Quick progress check-ins
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-[0.7rem]">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                    Today’s focus
                  </p>
                  <p className="mt-1 text-xs text-slate-100">
                    “Derivatives · visual intuition + practice”
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.65rem] text-slate-400">Session length</p>
                  <p className="text-xs font-semibold text-sky-200">18 min</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="h-40 rounded-2xl bg-gradient-to-b from-slate-900/40 via-slate-900/80 to-slate-950/90 p-2">
                {/* tiny avatar preview card */}
                <div className="flex h-full flex-col justify-between rounded-xl bg-slate-950/70 p-2">
                  <div className="flex items-center justify-between text-[0.7rem] text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Tutor online
                    </span>
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[0.6rem] text-sky-200">
                      You · v1.0
                    </span>
                  </div>
                  <div className="mt-2 h-20 rounded-xl bg-slate-900/90">
                    {/* This is just a static visual hint; real avatar is in the course view */}
                    <div className="flex h-full items-center justify-center text-[0.6rem] text-slate-500">
                      3D avatar lives in the lesson space
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between rounded-2xl border border-slate-700/70 bg-slate-950/70 p-3 text-[0.7rem]">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                  Built for students who:
                </p>
                <ul className="mt-2 space-y-1 text-slate-200">
                  <li>• Learn better when they teach</li>
                  <li>• Want bite-sized, high-focus sessions</li>
                  <li>• Prefer visual + conversational explanations</li>
                </ul>
                <p className="mt-3 text-[0.65rem] text-slate-400">
                  Your tutor syncs across subjects, remembers your gaps, and re-explains
                  things without judgement.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
