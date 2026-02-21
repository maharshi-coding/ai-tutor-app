import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  register: async (data: { email: string; username: string; password: string; full_name?: string }) => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },
  login: async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    const response = await api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  getMe: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },
}

// Courses API
export const coursesAPI = {
  getAll: async () => {
    const response = await api.get('/api/courses/')
    return response.data
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/courses/${id}`)
    return response.data
  },
  getProgress: async (courseId: number) => {
    const response = await api.get(`/api/courses/${courseId}/progress`)
    return response.data
  },
  updateProgress: async (courseId: number, data: any) => {
    const response = await api.post(`/api/courses/${courseId}/progress`, data)
    return response.data
  },
}

// Tutor API
export const tutorAPI = {
  chat: async (message: string, courseId?: number) => {
    const response = await api.post('/api/tutor/chat', {
      message,
      course_id: courseId,
    })
    return response.data
  },
  generateLesson: async (courseId: number, topic: string) => {
    const response = await api.post('/api/tutor/generate-lesson', null, {
      params: { course_id: courseId, lesson_topic: topic },
    })
    return response.data
  },
}

// Upload API
export const uploadAPI = {
  uploadPhoto: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/uploads/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  uploadVoice: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/uploads/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  uploadCourseDocument: async (file: File, courseId: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('course_id', courseId.toString())
    const response = await api.post('/api/uploads/course-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  getAvatarConfig: async () => {
    const response = await api.get('/api/uploads/avatar-config')
    return response.data
  },
  generateCharacterAvatar: async () => {
    const response = await api.post('/api/uploads/avatar/generate-character')
    return response.data
  },
}

// Voice API (Kokoro TTS)
export const voiceAPI = {
  generate: async (text: string, voice?: string, speed?: number) => {
    const response = await api.post('/api/voice', { text, voice, speed })
    return response.data
  },
}

// Avatar Video API (SadTalker)
export const avatarVideoAPI = {
  generate: async (params: { audio_url?: string; text?: string; image_url?: string }) => {
    const response = await api.post('/api/avatar', params)
    return response.data
  },
}

// Streaming helper for SSE tutor responses
export const streamTutorResponse = (
  message: string,
  courseId?: number,
  onToken?: (token: string) => void,
  onDone?: () => void,
  onError?: (err: Error) => void,
) => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams({ message })
  if (courseId) params.append('course_id', courseId.toString())
  const url = `${API_URL}/api/tutor/stream?${params.toString()}`

  const controller = new AbortController()

  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Stream error: ${res.status}`)
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader available')
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: [DONE]')) {
            onDone?.()
            return
          }
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6))
              if (payload.token) onToken?.(payload.token)
            } catch { /* skip malformed lines */ }
          }
        }
      }
      onDone?.()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError?.(err)
    })

  return () => controller.abort()
}
