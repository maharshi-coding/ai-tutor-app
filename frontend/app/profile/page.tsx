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
        setAvatarConfig({ ...config, _timestamp: Date.now() })
      } catch {
        console.error('Failed to load avatar config')
      }
    }

    if (isAuthenticated) {
      loadAvatarConfig()
    }
  }, [isAuthenticated, router, user])

  const refreshAvatarConfig = useCallback(async () => {
    const config = await uploadAPI.getAvatarConfig()
    setAvatarConfig({ ...config, _timestamp: Date.now() })
  }, [])

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
      toast.success('Avatar photo uploaded successfully!')
      await refreshAvatarConfig()
      await fetchUser()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload photo')
    } finally {
      setIsUploading(false)
    }
  }, [fetchUser, refreshAvatarConfig])

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
      await refreshAvatarConfig()
      await fetchUser()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload voice')
    } finally {
      setIsUploading(false)
    }
  }, [fetchUser, refreshAvatarConfig])

  if (!isAuthenticated || !user) {
    return null
  }

  const previewPath =
    avatarConfig?.avatar_image_url ||
    avatarConfig?.character_image_url ||
    avatarConfig?.photo_path ||
    null

  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-emerald-400 text-[0.65rem] font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.7)]">
              AI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-100">
                Profile & Avatar
              </span>
              <span className="text-[0.65rem] text-slate-500">
                Identity | Voice | Tutor photo
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-slate-100 transition-colors hover:border-sky-500 hover:text-sky-100"
            >
              Back to dashboard
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

      <main className="mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex flex-col gap-6 lg:flex-row"
        >
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-semibold text-slate-50">
              Profile & identity
            </h1>
            <p className="max-w-md text-sm text-slate-400">
              Manage the avatar photo and optional voice sample your tutor uses across chat and Visual Tutor mode.
            </p>

            <div className="glass-panel rounded-2xl border border-slate-700/70 p-5 text-sm text-slate-100">
              <p className="mb-3 text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Account information
              </p>
              <div className="space-y-3">
                {previewPath ? (
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-full border border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.6)]">
                      <Image
                        src={`${API_URL}${previewPath}?t=${avatarConfig?._timestamp || Date.now()}`}
                        alt="Tutor avatar"
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="text-xs text-slate-300">
                      <p className="font-medium text-slate-100">Your tutor avatar</p>
                      <p className="text-[0.7rem] text-slate-400">
                        This is the uploaded photo D-ID reuses for Visual Tutor replies.
                      </p>
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="mb-0.5 text-[0.7rem] text-slate-400">Username</p>
                  <p className="text-sm text-slate-100">{user.username}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-[0.7rem] text-slate-400">Email</p>
                  <p className="text-sm text-slate-100">{user.email}</p>
                </div>
                {user.full_name ? (
                  <div>
                    <p className="mb-0.5 text-[0.7rem] text-slate-400">Full name</p>
                    <p className="text-sm text-slate-100">{user.full_name}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="glass-panel rounded-2xl border border-slate-700/70 p-5 text-sm text-slate-100">
              <p className="mb-2 text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Visual tutor setup
              </p>
              <p className="mb-4 text-xs text-slate-300">
                Upload a clear face photo to power D-ID video replies. Voice samples stay optional and are kept only for future customization.
              </p>

              <div className="mb-5">
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Avatar photo
                </label>
                <div className="flex items-center gap-4">
                  {avatarConfig?.has_photo ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-300">
                      <span>OK</span>
                      <span>Photo saved</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>No photo uploaded</span>
                    </div>
                  )}
                  <label className="cursor-pointer rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                    {isUploading ? 'Uploading...' : 'Upload photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="mt-2 text-[0.7rem] text-slate-500">
                  Uploading a new photo replaces the previous tutor avatar image for future video generation.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Voice sample (optional)
                </label>
                <div className="flex items-center gap-4">
                  {avatarConfig?.has_voice ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-300">
                      <span>OK</span>
                      <span>Voice sample uploaded</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>No voice sample uploaded</span>
                    </div>
                  )}
                  <label className="cursor-pointer rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                    {isUploading ? 'Uploading...' : 'Upload voice'}
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
                  Visual Tutor already works with generated speech audio, so this sample is optional.
                </p>
              </div>

              {avatarConfig?.avatar_ready ? (
                <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
                  <p className="font-medium">
                    OK Your avatar is ready. Visual Tutor can now animate your uploaded photo with D-ID video replies.
                  </p>
                  <Link
                    href="/dashboard"
                    className="mt-2 inline-block font-semibold text-emerald-200 hover:text-emerald-100"
                  >
                    Jump into a course ->
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
