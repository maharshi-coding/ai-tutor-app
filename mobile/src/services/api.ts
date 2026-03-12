import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules, Platform} from 'react-native';

declare module 'axios' {
  export interface AxiosRequestConfig {
    retryable?: boolean;
    __retryCount?: number;
  }
}

const API_PORT = 8000;
const API_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;
const API_BASE_URL_OVERRIDE_KEY = 'api_base_url_override';
let apiBaseUrlOverrideCache: string | null = null;
let hasLoadedApiBaseUrlOverride = false;

function resolveDevApiHost(): string {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  const metroHost = scriptURL?.match(/^https?:\/\/([^/:]+)/)?.[1];

  if (metroHost) {
    return metroHost;
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;

  return withProtocol.replace(/\/+$/, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isAbsoluteUrl(value?: string): boolean {
  return !!value && /^[a-z][a-z\d+\-.]*:\/\//i.test(value);
}

async function readCachedApiBaseUrlOverride(): Promise<string | null> {
  if (hasLoadedApiBaseUrlOverride) {
    return apiBaseUrlOverrideCache;
  }

  const override = await AsyncStorage.getItem(API_BASE_URL_OVERRIDE_KEY);
  apiBaseUrlOverrideCache = normalizeBaseUrl(override ?? '') || null;
  hasLoadedApiBaseUrlOverride = true;
  return apiBaseUrlOverrideCache;
}

function toFormUrlEncoded(data: Record<string, string>): string {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
}

function shouldRetry(error: AxiosError): boolean {
  const config = error.config;

  if (!config?.retryable) {
    return false;
  }

  if ((config.__retryCount ?? 0) >= MAX_RETRIES) {
    return false;
  }

  if (error.code === 'ECONNABORTED') {
    return true;
  }

  if (!error.response) {
    return true;
  }

  return error.response.status >= 500;
}

export function getDefaultApiBaseUrl(): string {
  return __DEV__
    ? `http://${resolveDevApiHost()}:${API_PORT}`
    : 'https://your-production-api.com';
}

export const BASE_URL = getDefaultApiBaseUrl();

export async function getApiBaseUrl(): Promise<string> {
  const override = await readCachedApiBaseUrlOverride();
  return override || getDefaultApiBaseUrl();
}

export async function setApiBaseUrlOverride(value: string): Promise<string> {
  const normalizedValue = normalizeBaseUrl(value);

  if (!normalizedValue) {
    await AsyncStorage.removeItem(API_BASE_URL_OVERRIDE_KEY);
    apiBaseUrlOverrideCache = null;
    hasLoadedApiBaseUrlOverride = true;
    apiClient.defaults.baseURL = getDefaultApiBaseUrl();
    return apiClient.defaults.baseURL ?? getDefaultApiBaseUrl();
  }

  await AsyncStorage.setItem(API_BASE_URL_OVERRIDE_KEY, normalizedValue);
  apiBaseUrlOverrideCache = normalizedValue;
  hasLoadedApiBaseUrlOverride = true;
  apiClient.defaults.baseURL = normalizedValue;
  return normalizedValue;
}

export async function clearApiBaseUrlOverride(): Promise<string> {
  await AsyncStorage.removeItem(API_BASE_URL_OVERRIDE_KEY);
  apiBaseUrlOverrideCache = null;
  hasLoadedApiBaseUrlOverride = true;
  const defaultUrl = getDefaultApiBaseUrl();
  apiClient.defaults.baseURL = defaultUrl;
  return defaultUrl;
}

export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data;

    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (detail && typeof detail === 'object') {
      const message =
        (detail as Record<string, unknown>).detail ??
        (detail as Record<string, unknown>).message ??
        (detail as Record<string, unknown>).error;

      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.';
    }

    if (!error.response) {
      return 'Cannot reach the AI Tutor service. Check your connection and server URL.';
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {'Content-Type': 'application/json'},
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!isAbsoluteUrl(config.url)) {
      const baseUrl = await getApiBaseUrl();
      config.baseURL = baseUrl;
      apiClient.defaults.baseURL = baseUrl;
    }

    const token = await AsyncStorage.getItem('auth_token');

    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (!shouldRetry(error)) {
      return Promise.reject(error);
    }

    const config = error.config as AxiosRequestConfig;
    config.__retryCount = (config.__retryCount ?? 0) + 1;

    await sleep(350 * config.__retryCount);
    return apiClient(config);
  },
);

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post(
      '/api/auth/login',
      toFormUrlEncoded({username: email, password}),
      {headers: {'Content-Type': 'application/x-www-form-urlencoded'}},
    ),
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => apiClient.post('/api/auth/register', data),
  getMe: () => apiClient.get('/api/auth/me', {retryable: true}),
};

export const coursesAPI = {
  getAll: () => apiClient.get('/api/courses/', {retryable: true}),
  getOne: (id: number) => apiClient.get(`/api/courses/${id}`, {retryable: true}),
};

export const tutorAPI = {
  chat: (message: string, courseId?: number) =>
    apiClient.post('/api/tutor/chat', {message, course_id: courseId}),
};

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
  getAvatarConfig: () =>
    apiClient.get('/api/uploads/avatar-config', {retryable: true}),
};

export const avatarAPI = {
  generate: (data: {text?: string; audio_url?: string; image_url?: string}) =>
    apiClient.post('/api/avatar/generate', data),
  getJobStatus: (jobId: string) =>
    apiClient.get(`/api/avatar/job/${jobId}`, {retryable: true}),
};
