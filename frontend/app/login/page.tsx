'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      toast.success('Logged in successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-panel w-full max-w-md rounded-3xl border border-slate-700/70 px-6 py-7 text-slate-100"
      >
        <h1 className="mb-1 text-center text-3xl font-semibold tracking-tight text-slate-50">
          Welcome back
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Step back into your personalized AI classroom.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-sky-300 hover:text-sky-200"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
