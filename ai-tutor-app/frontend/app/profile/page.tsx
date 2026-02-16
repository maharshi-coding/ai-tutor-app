'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { uploadAPI } from '@/lib/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, fetchUser, logout } = useAuthStore()
  const [avatarConfig, setAvatarConfig] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push('/login')
      return
    }

    const loadAvatarConfig = async () => {
      try {
        const config = await uploadAPI.getAvatarConfig()
        setAvatarConfig(config)
      } catch (error) {
        console.error('Failed to load avatar config')
      }
    }

    if (isAuthenticated) {
      loadAvatarConfig()
    }
  }, [isAuthenticated, user, router])

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setIsUploading(true)
    try {
      await uploadAPI.uploadPhoto(file)
      toast.success('Photo uploaded successfully!')
      const config = await uploadAPI.getAvatarConfig()
      setAvatarConfig(config)
      await fetchUser()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload photo')
    } finally {
      setIsUploading(false)
    }
  }, [fetchUser])

  const handleVoiceUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an audio file (wav, mp3, webm)')
      return
    }

    setIsUploading(true)
    try {
      await uploadAPI.uploadVoice(file)
      toast.success('Voice sample uploaded successfully!')
      const config = await uploadAPI.getAvatarConfig()
      setAvatarConfig(config)
      await fetchUser()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload voice')
    } finally {
      setIsUploading(false)
    }
  }, [fetchUser])

  const handleGenerateCharacter = useCallback(async () => {
    if (!avatarConfig?.has_photo) {
      toast.error('Please upload a profile photo first.')
      return
    }
    if (isGeneratingCharacter) return

    setIsGeneratingCharacter(true)
    try {
      await uploadAPI.generateCharacterAvatar()
      toast.success('Character avatar generation started!')
      const config = await uploadAPI.getAvatarConfig()
      setAvatarConfig(config)
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail ||
          'Avatar generation failed. Check your Stable Diffusion API settings.',
      )
    } finally {
      setIsGeneratingCharacter(false)
    }
  }, [avatarConfig?.has_photo, isGeneratingCharacter])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-emerald-400 shadow-[0_0_20px_rgba(56,189,248,0.7)] flex items-center justify-center text-[0.65rem] font-black text-slate-950">
              AI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-100">
                Profile & Avatar
              </span>
              <span className="text-[0.65rem] text-slate-500">
                Identity · Voice · Presence
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-slate-100 hover:border-sky-500 hover:text-sky-100 transition-colors"
            >
              Back to dashboard
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
          className="mx-auto flex flex-col gap-6 lg:flex-row"
        >
          {/* Left: account info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-semibold text-slate-50">
              Profile & identity
            </h1>
            <p className="text-sm text-slate-400 max-w-md">
              Tune how your AI tutor presents itself: your name, your avatar, and your
              voice.
            </p>

            <div className="glass-panel rounded-2xl border border-slate-700/70 p-5 text-sm text-slate-100">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400 mb-3">
                Account information
              </p>
              <div className="space-y-3">
                {avatarConfig?.character_image_url && (
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-full border border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.6)]">
                      <Image
                        src={`${API_URL}${avatarConfig.character_image_url}`}
                        alt="Character avatar"
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-slate-300">
                      <p className="font-medium text-slate-100">Your tutor persona</p>
                      <p className="text-[0.7rem] text-slate-400">
                        Generated from your photo in a stylized, lesson-ready look.
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[0.7rem] text-slate-400 mb-0.5">Username</p>
                  <p className="text-sm text-slate-100">{user.username}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] text-slate-400 mb-0.5">Email</p>
                  <p className="text-sm text-slate-100">{user.email}</p>
                </div>
                {user.full_name && (
                  <div>
                    <p className="text-[0.7rem] text-slate-400 mb-0.5">Full name</p>
                    <p className="text-sm text-slate-100">{user.full_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: avatar setup */}
          <div className="flex-1 space-y-4">
            <div className="glass-panel rounded-2xl border border-slate-700/70 p-5 text-sm text-slate-100">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400 mb-2">
                AI avatar setup
              </p>
              <p className="mb-4 text-xs text-slate-300">
                Upload a face and a short voice sample to let your tutor mirror you more
                closely in lessons.
              </p>

              {/* Photo Upload */}
              <div className="mb-5">
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Profile photo
                </label>
                <div className="flex items-center gap-4">
                  {avatarConfig?.has_photo ? (
                    <div className="flex items-center gap-2 text-emerald-300 text-xs">
                      <span>✓</span>
                      <span>Photo uploaded</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>No photo uploaded</span>
                    </div>
                  )}
                  <label className="cursor-pointer rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                    {isUploading ? 'Uploading…' : 'Upload photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Voice Upload */}
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Voice sample
                </label>
                <div className="flex items-center gap-4">
                  {avatarConfig?.has_voice ? (
                    <div className="flex items-center gap-2 text-emerald-300 text-xs">
                      <span>✓</span>
                      <span>Voice sample uploaded</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>No voice sample uploaded</span>
                    </div>
                  )}
                  <label className="cursor-pointer rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                    {isUploading ? 'Uploading…' : 'Upload voice'}
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleVoiceUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="mt-2 text-[0.7rem] text-slate-500">
                  Record a short clip (wav, mp3, or webm) of you explaining something you
                  care about.
                </p>
              </div>

              <div className="mt-5 border-t border-slate-800/80 pt-4">
                <p className="mb-2 text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                  Stylized tutor character
                </p>
                <p className="mb-3 text-[0.7rem] text-slate-300">
                  Once you&apos;ve uploaded a photo, you can ask the backend to create a
                  Ghibli-style full-body caricature of you using your Stable Diffusion
                  server.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateCharacter}
                  disabled={isGeneratingCharacter}
                  className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.7)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  {isGeneratingCharacter ? 'Generating avatar…' : 'Generate my character'}
                </button>
                {avatarConfig?.character_image_url && (
                  <p className="mt-2 text-[0.7rem] text-slate-400">
                    Character image generated. It will be used in future animated lesson
                    views.
                  </p>
                )}
              </div>

              {avatarConfig?.has_photo && avatarConfig?.has_voice && (
                <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
                  <p className="font-medium">
                    ✓ Your avatar is ready. Your tutor will now appear and speak more like
                    you in sessions.
                  </p>
                  <Link
                    href="/dashboard"
                    className="mt-2 inline-block font-semibold text-emerald-200 hover:text-emerald-100"
                  >
                    Jump into a course →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
