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
  getAvatarConfig: async () => {
    const response = await api.get('/api/uploads/avatar-config')
    return response.data
  },
  generateCharacterAvatar: async () => {
    const response = await api.post('/api/uploads/avatar/generate-character')
    return response.data
  },
}
