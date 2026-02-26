'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(formData)
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed')
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
          Create your space
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Spin up your personal AI tutor in under a minute.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
              placeholder="••••••••"
            />
            <p className="mt-1 text-[0.65rem] text-slate-500">
              8–72 characters. You can change it later.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-sky-300 hover:text-sky-200"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
