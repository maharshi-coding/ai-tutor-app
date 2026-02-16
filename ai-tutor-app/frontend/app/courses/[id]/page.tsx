'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { coursesAPI, tutorAPI } from '@/lib/api'
import Avatar from '@/components/Avatar'
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

// Memoized message bubble component to prevent unnecessary re-renders
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
            : 'bg-slate-900/80 text-slate-100 border border-slate-700/70'
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
  const courseId = parseInt(params.id as string)
  const { user, isAuthenticated, logout, fetchUser } = useAuthStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'tutor'; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push('/login')
      return
    }

    const loadCourse = async () => {
      try {
        const data = await coursesAPI.getById(courseId)
        setCourse(data)
        // Initialize with welcome message
        setMessages([{
          id: `msg-${Date.now()}`,
          role: 'tutor',
          content: `Hello! I'm your AI tutor for ${data.title}. I'm here to help you learn ${data.subject}. What would you like to know?`
        }])
      } catch (error) {
        toast.error('Failed to load course')
        router.push('/dashboard')
      }
    }

    if (isAuthenticated && courseId) {
      loadCourse()
    }
  }, [isAuthenticated, user, courseId, router])

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage('')
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: userMessage }])
    setIsLoading(true)
    setIsSpeaking(true)

    try {
      const response: TutorResponse = await tutorAPI.chat(userMessage, courseId)
      setMessages((prev) => [...prev, { id: `msg-${Date.now()}-tutor`, role: 'tutor', content: response.response }])
      
      // Simulate speaking animation
      setTimeout(() => setIsSpeaking(false), 2000)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to get response')
      setIsSpeaking(false)
    } finally {
      setIsLoading(false)
    }
  }, [message, isLoading, courseId])

  if (!isAuthenticated || !user || !course) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-emerald-400 shadow-[0_0_20px_rgba(56,189,248,0.7)] flex items-center justify-center text-[0.65rem] font-black text-slate-950">
              AI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-100">
                Lesson space
              </span>
              <span className="text-[0.65rem] text-slate-500">
                {course.subject} · {course.difficulty_level}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-slate-100 hover:border-sky-500 hover:text-sky-100 transition-colors"
            >
              Back to courses
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

      <main className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
          {/* Course Info Sidebar */}
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
                  Converse · Explain · Quiz
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
                How to use this space
              </p>
              <ul className="mt-2 space-y-1 text-slate-300">
                <li>• Ask for visuals, analogies, or simpler explanations.</li>
                <li>• Tell your tutor to “quiz you before continuing”.</li>
                <li>• Rephrase in your own words; the tutor will correct gently.</li>
              </ul>
            </motion.div>
          </div>

          {/* Main Learning Area */}
          <div className="flex flex-col gap-4">
            {/* Avatar Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-4"
            >
              <div className="mb-3 flex items-center justify-between text-[0.7rem] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Your AI twin is listening</span>
                </div>
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.6rem]">
                  Speaking animations react in real time
                </span>
              </div>
              <div className="h-64">
                <Avatar isSpeaking={isSpeaking} />
              </div>
            </motion.div>

            {/* Chat Messages */}
            <div className="glass-panel flex-1 rounded-3xl p-4">
              <div className="mb-2 flex items-center justify-between text-[0.7rem] text-slate-300">
                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                  Dialogue
                </span>
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.6rem] text-slate-300">
                  Tip: ask “can you show me a different way?”
                </span>
              </div>
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1 pt-1 text-sm">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isLoading && (
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
                )}
              </div>
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="glass-panel rounded-3xl p-3 text-xs text-slate-200"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[0.65rem] text-slate-400">
                  Ask a question, request an explanation, or say “quiz me”.
                </span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="“Explain the intuition behind this step...”"
                  className="flex-1 rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.7)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 transition"
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
