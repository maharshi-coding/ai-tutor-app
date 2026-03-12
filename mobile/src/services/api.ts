import axios, {InternalAxiosRequestConfig} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Base URL configuration.
 * Android emulator routes 10.0.2.2 → host machine localhost.
 * Set REACT_NATIVE_API_URL env var or update this for production.
 */
export const BASE_URL = __DEV__
  ? 'http://172.30.27.23:8000'
  : 'https://your-production-api.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {'Content-Type': 'application/json'},
});

// Attach JWT token on every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post(
      '/api/auth/login',
      new URLSearchParams({username: email, password}).toString(),
      {headers: {'Content-Type': 'application/x-www-form-urlencoded'}},
    ),
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => apiClient.post('/api/auth/register', data),
  getMe: () => apiClient.get('/api/auth/me'),
};

// ─── Courses ──────────────────────────────────────────────────────────────────

export const coursesAPI = {
  getAll: () => apiClient.get('/api/courses/'),
  getOne: (id: number) => apiClient.get(`/api/courses/${id}`),
};

// ─── Tutor ────────────────────────────────────────────────────────────────────

export const tutorAPI = {
  chat: (message: string, courseId?: number) =>
    apiClient.post('/api/tutor/chat', {message, course_id: courseId}),
};

// ─── Uploads ──────────────────────────────────────────────────────────────────

export const uploadAPI = {
  uploadPhoto: (formData: FormData) =>
    apiClient.post('/api/uploads/photo', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
      timeout: 60000,
    }),
  uploadCourseDocument: (formData: FormData, courseId: number) =>
    apiClient.post(
      `/api/uploads/course-document?course_id=${courseId}`,
      formData,
      {
        headers: {'Content-Type': 'multipart/form-data'},
        timeout: 120000,
      },
    ),
  getAvatarConfig: () => apiClient.get('/api/uploads/avatar-config'),
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

export const avatarAPI = {
  /** Async generation — returns {job_id} immediately */
  generate: (data: {text?: string; audio_url?: string; image_url?: string}) =>
    apiClient.post('/api/avatar/generate', data),
  /** Poll for job completion */
  getJobStatus: (jobId: string) =>
    apiClient.get(`/api/avatar/job/${jobId}`),
};
