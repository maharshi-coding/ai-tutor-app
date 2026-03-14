'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { avatarVideoAPI, coursesAPI, tutorAPI, uploadAPI } from '@/lib/api'
import MarkdownMessage from '@/components/MarkdownMessage'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Course {
  id: number
  title: string
  description: string
  subject: string
  difficulty_level: string
}

interface TutorResponse {
  response: string
  suggestions?: string[]
}

interface Message {
  id: string
  role: 'user' | 'tutor'
  content: string
}

interface AvatarConfigResponse {
  avatar_ready?: boolean
  avatar_image_url?: string
  character_image_url?: string
  photo_path?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const AVATAR_POLL_INTERVAL_MS = 2500
const AVATAR_MAX_POLLS = 72

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const toAbsoluteUrl = (value: string) =>
  value.startsWith('http') ? value : `${API_URL}${value}`

const MessageBubble = memo(function MessageBubble({
  msg
}: {
  msg: Message
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs sm:text-sm ${
          msg.role === 'user'
            ? 'bg-sky-500/90 text-slate-950'
            : 'border border-slate-700/70 bg-slate-900/80 text-slate-100'
        }`}
      >
        {msg.role === 'user' ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <MarkdownMessage content={msg.content} />
        )}
      </div>
    </motion.div>
  )
})

export default function CoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = parseInt(params.id as string, 10)
  const { user, isAuthenticated, logout, fetchUser } = useAuthStore()

  const [course, setCourse] = useState<Course | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null)
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null)
  const [avatarReady, setAvatarReady] = useState(false)
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const [avatarStatus, setAvatarStatus] = useState('')
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [retryAvatarText, setRetryAvatarText] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const loadAvatarConfig = useCallback(async () => {
    try {
      const config: AvatarConfigResponse = await uploadAPI.getAvatarConfig()
      const imagePath =
        config.avatar_image_url || config.character_image_url || config.photo_path || null

      setAvatarReady(Boolean(config.avatar_ready))
      setAvatarImageUrl(imagePath ? toAbsoluteUrl(imagePath) : null)
    } catch {
      setAvatarReady(false)
      setAvatarImageUrl(null)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push('/login')
      return
    }

    const loadCourse = async () => {
      try {
        const data = await coursesAPI.getById(courseId)
        setCourse(data)
        setMessages([
          {
            id: `msg-${Date.now()}`,
            role: 'tutor',
            content: `Hello! I'm your AI tutor for ${data.title}. Ask a question and I'll answer with a local talking avatar response.`
          }
        ])
      } catch {
        toast.error('Failed to load course')
        router.push('/dashboard')
      }
    }

    if (isAuthenticated && courseId) {
      loadCourse()
      loadAvatarConfig().catch(() => {})
    }
  }, [courseId, isAuthenticated, loadAvatarConfig, router, user])

  const pollAvatarJob = useCallback(async (jobId: string) => {
    for (let attempt = 0; attempt < AVATAR_MAX_POLLS; attempt += 1) {
      await sleep(AVATAR_POLL_INTERVAL_MS)

      const job = await avatarVideoAPI.getJobStatus(jobId)

      if (job.status === 'done' && job.video_url) {
        return job.video_url as string
      }

      if (job.status === 'failed') {
        throw new Error(job.error || 'Avatar generation failed.')
      }

      setAvatarStatus(
        job.status === 'processing'
          ? `Animating your avatar... (${attempt + 1}/${AVATAR_MAX_POLLS})`
          : 'Waiting for the local avatar worker...'
      )
    }

    throw new Error('Avatar generation timed out after 3 minutes.')
  }, [])

  const generateAvatarVideo = useCallback(
    async (responseText: string) => {
      setRetryAvatarText(responseText)

      if (!avatarReady) {
        setAvatarError('Upload an avatar photo on the profile page to use Visual Tutor video replies.')
        return
      }

      setAvatarError(null)
      setIsGeneratingAvatar(true)
      setAvatarStatus('Generating speech audio...')

      try {
        const avatarResp = await avatarVideoAPI.generate({ text: responseText })

        let resolvedVideoUrl: string | null = null

        if (avatarResp.video_url) {
          resolvedVideoUrl = avatarResp.video_url
        } else if (avatarResp.job_id) {
          setAvatarStatus('Waiting for D-ID to finish the tutor video...')
          resolvedVideoUrl = await pollAvatarJob(avatarResp.job_id)
        } else {
          throw new Error('Local avatar generation did not return a video job id.')
        }

        setAvatarVideoUrl(toAbsoluteUrl(resolvedVideoUrl))
        setRetryAvatarText(null)
        await loadAvatarConfig()
      } catch (error: any) {
        const messageText =
          error?.response?.data?.detail ||
          error?.message ||
          'Could not generate the tutor video. Please try again.'

        setAvatarError(messageText)
        toast.error(messageText)
      } finally {
        setIsGeneratingAvatar(false)
        setAvatarStatus('')
      }
    },
    [avatarReady, loadAvatarConfig, pollAvatarJob]
  )

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!message.trim() || isLoading) return

      const userMessage = message.trim()
      setMessage('')
      setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: userMessage }])
      setIsLoading(true)
      setAvatarError(null)

      try {
        const response: TutorResponse = await tutorAPI.chat(userMessage, courseId)
        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}-tutor`, role: 'tutor', content: response.response }
        ])
        void generateAvatarVideo(response.response)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to get response')
      } finally {
        setIsLoading(false)
      }
    },
    [courseId, generateAvatarVideo, isLoading, message]
  )

  const retryAvatarGeneration = useCallback(() => {
    if (!retryAvatarText || isGeneratingAvatar) {
      return
    }

    void generateAvatarVideo(retryAvatarText)
  }, [generateAvatarVideo, isGeneratingAvatar, retryAvatarText])

  if (!isAuthenticated || !user || !course) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-emerald-400 text-[0.65rem] font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.7)]">
              AI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-100">
                Lesson space
              </span>
              <span className="text-[0.65rem] text-slate-500">
                {course.subject} | {course.difficulty_level}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-slate-100 transition-colors hover:border-sky-500 hover:text-sky-100"
            >
              Back to courses
            </Link>
            <button
              onClick={logout}
              className="rounded-full border border-red-500/60 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-2xl p-5"
            >
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Current course
              </p>
              <h1 className="mt-2 text-xl font-semibold text-slate-50">
                {course.title}
              </h1>
              <p className="mt-2 text-sm text-slate-300">{course.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[0.7rem]">
                <span className="rounded-full bg-sky-500/10 px-2 py-1 text-sky-200">
                  {course.subject}
                </span>
                <span className="rounded-full bg-slate-800/80 px-2 py-1 text-slate-200">
                  {course.difficulty_level}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-200">
                  Ask | Learn | Watch
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-2xl p-4 text-xs text-slate-200"
            >
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Visual tutor flow
              </p>
              <ul className="mt-2 space-y-1 text-slate-300">
                <li>- Ask a question and the tutor answers in text first.</li>
                <li>- The app generates speech audio locally from that answer.</li>
                <li>- D-ID turns your saved avatar photo into a tutor video.</li>
              </ul>
            </motion.div>
          </div>

          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-4"
            >
              <div className="mb-3 flex items-center justify-between text-[0.7rem] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${isGeneratingAvatar ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'}`} />
                  <span>
                    {isGeneratingAvatar
                      ? avatarStatus || 'Generating local avatar response...'
                      : avatarReady
                        ? 'Your uploaded avatar is ready to speak'
                        : 'Upload an avatar photo to enable Visual Tutor'}
                  </span>
                </div>
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.6rem]">
                  D-ID video pipeline
                </span>
              </div>

              <div className="relative h-64 overflow-hidden rounded-xl bg-slate-950">
                {avatarVideoUrl ? (
                  <video
                    key={avatarVideoUrl}
                    autoPlay
                    controls
                    className="h-full w-full object-cover"
                  >
                    <source src={avatarVideoUrl} type="video/mp4" />
                  </video>
                ) : avatarImageUrl ? (
                  <img
                    src={avatarImageUrl}
                    alt="Tutor avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),_transparent_55%),linear-gradient(160deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.92))] p-6 text-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        No avatar photo saved yet
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        Add a photo in your profile to turn this lesson into a talking avatar tutor.
                      </p>
                      <Link
                        href="/profile"
                        className="mt-4 inline-flex rounded-full border border-sky-500/60 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-400 hover:text-white"
                      >
                        Open profile
                      </Link>
                    </div>
                  </div>
                )}

                {isGeneratingAvatar ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                    <p className="mt-3 text-xs font-medium text-slate-100">
                      {avatarStatus || 'Generating tutor video...'}
                    </p>
                  </div>
                ) : null}
              </div>

              {avatarError ? (
                <div className="mt-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100">
                  <p>{avatarError}</p>
                  {retryAvatarText ? (
                    <button
                      type="button"
                      onClick={retryAvatarGeneration}
                      className="mt-3 rounded-full border border-rose-300/40 px-3 py-1.5 font-semibold text-rose-100 transition hover:border-rose-200 hover:text-white"
                    >
                      Retry video
                    </button>
                  ) : null}
                </div>
              ) : null}
            </motion.div>

            <div className="glass-panel flex-1 rounded-3xl p-4">
              <div className="mb-2 flex items-center justify-between text-[0.7rem] text-slate-300">
                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                  Dialogue
                </span>
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.6rem] text-slate-300">
                  Tip: ask for examples or a slower explanation
                </span>
              </div>
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1 pt-1 text-sm">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isLoading ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-slate-900/80 px-3 py-2">
                      <div className="flex gap-1.5">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                          style={{ animationDelay: '0.2s' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className="glass-panel rounded-3xl p-3 text-xs text-slate-200"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[0.65rem] text-slate-400">
                  Ask a question and the app will generate text first, then your talking avatar reply.
                </span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain the intuition behind this concept..."
                  className="flex-1 rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
