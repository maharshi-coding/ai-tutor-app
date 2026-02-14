'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { coursesAPI } from '@/lib/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Course {
  id: number
  title: string
  description: string
  subject: string
  difficulty_level: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, fetchUser } = useAuthStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push('/login')
      return
    }

    const loadCourses = async () => {
      try {
        const data = await coursesAPI.getAll()
        setCourses(data)
      } catch (error) {
        toast.error('Failed to load courses')
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      loadCourses()
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-emerald-400 shadow-[0_0_20px_rgba(56,189,248,0.7)] flex items-center justify-center text-[0.65rem] font-black text-slate-950">
              AI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-100">
                Your Tutor Hub
              </span>
              <span className="text-[0.65rem] text-slate-500">
                Courses · Progress · Sessions
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/profile"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-slate-100 hover:border-sky-500 hover:text-sky-100 transition-colors"
            >
              {user.full_name || user.username}
            </Link>
            <button
              onClick={logout}
              className="rounded-full border border-red-500/60 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200 hover:bg-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Welcome back
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-50 sm:text-4xl">
              {user.username}, let&apos;s pick up where you left off.
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Choose a subject and your AI twin will guide you through the next session.
            </p>
          </div>

          <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3 text-xs text-slate-200">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-400 to-sky-400 flex items-center justify-center text-[0.65rem] font-semibold text-slate-950">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Session mode
              </p>
              <p className="text-xs text-slate-100">Deep focus · 20–25 minutes</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 rounded-full border-2 border-sky-500/40 border-t-sky-400 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            {/* Courses grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>Available courses</p>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{courses.length} active paths</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {courses.length === 0 ? (
                  <div className="col-span-full glass-panel flex flex-col items-center justify-center rounded-2xl py-10 text-center text-sm text-slate-300">
                    <p className="mb-1 text-slate-100">No courses available yet.</p>
                    <p className="text-xs text-slate-400">
                      New interactive journeys will appear here soon.
                    </p>
                  </div>
                ) : (
                  courses.map((course) => (
                    <motion.button
                      key={course.id}
                      type="button"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ duration: 0.18 }}
                      className="glass-panel group flex h-full flex-col justify-between rounded-2xl p-4 text-left"
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between text-[0.65rem]">
                          <span className="rounded-full bg-sky-500/10 px-2 py-1 text-sky-200">
                            {course.subject}
                          </span>
                          <span className="rounded-full bg-slate-800/80 px-2 py-1 text-[0.6rem] text-slate-300">
                            {course.difficulty_level}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-50">
                          {course.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-xs text-slate-400">
                          {course.description ||
                            'Start learning this course with your AI tutor.'}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[0.65rem] text-slate-300">
                        <span className="flex items-center gap-1 text-sky-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 group-hover:bg-emerald-400 transition-colors" />
                          Resume with your tutor
                        </span>
                        <span className="text-slate-400 group-hover:text-sky-200 transition-colors">
                          Enter space →
                        </span>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Side panel: mini stats / tips */}
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-4 text-xs text-slate-200">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                  Tutor tips
                </p>
                <p className="mt-2 text-slate-100">
                  Ask your twin to “teach like you in 6 months” for advanced intuition.
                </p>
                <ul className="mt-3 space-y-1 text-slate-300">
                  <li>• Turn complex proofs into stories.</li>
                  <li>• Ask for “one more way to see this”.</li>
                  <li>• Let it quiz you before moving on.</li>
                </ul>
              </div>

              <div className="glass-panel rounded-2xl p-4 text-xs text-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                    Suggested routine
                  </p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] text-emerald-300">
                    3× / week
                  </span>
                </div>
                <p className="mt-2 text-slate-100">
                  Two short sessions per subject, where you explain back what you just
                  learned.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
