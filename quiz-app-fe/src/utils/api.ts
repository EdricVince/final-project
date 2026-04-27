import { useAuthStore } from '@/stores/auth.store'
import type {
  ApiResponse,
  ApiErrorResponse,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponseData,
  UserProfileData,
  SuccessResponse,
  UserOut,
} from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

export class ApiError extends Error {
  statusCode: number
  errorCode: string
  errorMessage: string
  details?: unknown

  constructor(statusCode: number, errorCode: string, errorMessage: string, details?: unknown) {
    super(errorMessage)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.errorMessage = errorMessage
    this.details = details
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options
  const authStore = useAuthStore()

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  }

  if (requiresAuth) {
    const token = authStore.getAccessToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    } else {
      throw new ApiError(401, 'NO_TOKEN', 'No access token available')
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: requestHeaders,
    })

    const text = await response.text()
    let responseData: ApiResponse<T> | ApiErrorResponse | null = null
    if (text) {
      try {
        responseData = JSON.parse(text)
      } catch {
        throw new ApiError(500, 'PARSE_ERROR', 'Failed to parse response')
      }
    }

    if (response.status >= 200 && response.status < 300) {
      return (responseData as ApiResponse<T>).data
    }

    const errorData = responseData as ApiErrorResponse

    if (response.status === 401 && requiresAuth) {
      const refreshed = await authStore.refreshAccessToken()
      if (refreshed) {
        const newToken = authStore.getAccessToken()
        requestHeaders['Authorization'] = `Bearer ${newToken}`
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...restOptions,
          headers: requestHeaders,
        })
        const retryText = await retryResponse.text()
        if (retryResponse.status >= 200 && retryResponse.status < 300) {
          return (JSON.parse(retryText) as ApiResponse<T>).data
        }
        const retryError = JSON.parse(retryText) as ApiErrorResponse
        throw new ApiError(retryResponse.status, retryError.code || 'ERROR', retryError.message, retryError.details)
      } else {
        authStore.logout()
        window.location.href = '/login'
        throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired')
      }
    }

    throw new ApiError(
      response.status,
      errorData?.code || (errorData as any)?.error || 'ERROR',
      errorData?.message || 'An error occurred',
      errorData?.details,
    )
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error
    console.error('API request failed:', error)
    throw new ApiError(500, 'NETWORK_ERROR', 'Network error or server unavailable')
  }
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────
  login: (email: string, password: string): Promise<LoginResponseData> =>
    apiRequest<LoginResponseData>('/auth/login', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ email, password } as LoginRequest),
    }),

  register: (email: string, password: string, roleId?: number): Promise<UserOut> => {
    const body: RegisterRequest & { role_id?: number } = { email, password }
    if (roleId) body.role_id = roleId
    return apiRequest<UserOut>('/auth/register', { method: 'POST', requiresAuth: false, body: JSON.stringify(body) })
  },

  resetPassword: (email: string): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>('/auth/reset-password', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ email }),
    }),

  refreshToken: (refreshToken: string): Promise<RefreshTokenResponseData> =>
    apiRequest<RefreshTokenResponseData>('/auth/refresh', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ refresh_token: refreshToken } as RefreshTokenRequest),
    }),

  getProfile: (): Promise<UserProfileData> => apiRequest<UserProfileData>('/auth/me'),

  updateProfile: (data: Partial<UserProfileData>): Promise<UserProfileData> =>
    apiRequest<UserProfileData>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  logout: (): Promise<SuccessResponse> => apiRequest<SuccessResponse>('/auth/logout', { method: 'POST' }),

  // ── Quizzes ───────────────────────────────────────────────────
  getQuizzes: (params?: Record<string, string | number>): Promise<unknown[]> => {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiRequest<unknown[]>(`/quizzes${q}`)
  },

  getQuiz: (id: string): Promise<unknown> => apiRequest<unknown>(`/quizzes/${id}`),

  createQuiz: (data: unknown): Promise<unknown> =>
    apiRequest<unknown>('/quizzes', { method: 'POST', body: JSON.stringify(data) }),

  updateQuiz: (id: string, data: unknown): Promise<unknown> =>
    apiRequest<unknown>(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteQuiz: (id: string): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>(`/quizzes/${id}`, { method: 'DELETE' }),

  // ── Classes ───────────────────────────────────────────────────
  getClasses: (): Promise<unknown[]> => apiRequest<unknown[]>('/classes'),

  getClass: (id: number): Promise<unknown> => apiRequest<unknown>(`/classes/${id}`),

  createClass: (data: unknown): Promise<unknown> =>
    apiRequest<unknown>('/classes', { method: 'POST', body: JSON.stringify(data) }),

  updateClass: (id: number, data: unknown): Promise<unknown> =>
    apiRequest<unknown>(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteClass: (id: number): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>(`/classes/${id}`, { method: 'DELETE' }),

  getClassStudents: (classId: number): Promise<unknown[]> =>
    apiRequest<unknown[]>(`/classes/${classId}/students`),

  removeStudent: (classId: number, studentId: number): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>(`/classes/${classId}/students/${studentId}`, { method: 'DELETE' }),

  joinClass: (classCode: string): Promise<unknown> =>
    apiRequest<unknown>('/classes/join', { method: 'POST', body: JSON.stringify({ class_code: classCode }) }),

  // ── Videos ───────────────────────────────────────────────────
  getClassVideos: (classId: number): Promise<unknown[]> => apiRequest<unknown[]>(`/classes/${classId}/videos`),

  getVideo: (id: number): Promise<unknown> => apiRequest<unknown>(`/videos/${id}`),

  createVideo: (data: unknown): Promise<unknown> =>
    apiRequest<unknown>('/videos', { method: 'POST', body: JSON.stringify(data) }),

  updateVideo: (id: number, data: unknown): Promise<unknown> =>
    apiRequest<unknown>(`/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteVideo: (id: number): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>(`/videos/${id}`, { method: 'DELETE' }),

  // ── Tests ─────────────────────────────────────────────────────
  getTests: (): Promise<unknown[]> => apiRequest<unknown[]>('/tests'),

  getTest: (id: number): Promise<unknown> => apiRequest<unknown>(`/tests/${id}`),

  createTest: (data: unknown): Promise<unknown> =>
    apiRequest<unknown>('/tests', { method: 'POST', body: JSON.stringify(data) }),

  updateTest: (id: number, data: unknown): Promise<unknown> =>
    apiRequest<unknown>(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteTest: (id: number): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>(`/tests/${id}`, { method: 'DELETE' }),

  addQuestion: (testId: number, data: unknown): Promise<unknown> =>
    apiRequest<unknown>(`/tests/${testId}/questions`, { method: 'POST', body: JSON.stringify(data) }),

  updateQuestion: (id: number, data: unknown): Promise<unknown> =>
    apiRequest<unknown>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteQuestion: (id: number): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>(`/questions/${id}`, { method: 'DELETE' }),

  assignTest: (testId: number, data: unknown): Promise<unknown> =>
    apiRequest<unknown>(`/tests/${testId}/assign`, { method: 'POST', body: JSON.stringify(data) }),

  getTestResults: (testId: number): Promise<unknown[]> => apiRequest<unknown[]>(`/tests/${testId}/results`),

  // ── Student Tests ─────────────────────────────────────────────
  getStudentTests: (): Promise<unknown[]> => apiRequest<unknown[]>('/student/tests'),

  getStudentTest: (id: number): Promise<unknown> => apiRequest<unknown>(`/student/tests/${id}`),

  submitTest: (testId: number, answers: Record<number, number | string>): Promise<unknown> =>
    apiRequest<unknown>(`/student/tests/${testId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  getStudentResults: (): Promise<unknown[]> => apiRequest<unknown[]>('/student/results'),

  // ── Progress ──────────────────────────────────────────────────
  getMyProgress: (): Promise<unknown> => apiRequest<unknown>('/progress/me'),

  logActivity: (data: { type: string; cards_count?: number; score?: number }): Promise<unknown> =>
    apiRequest<unknown>('/progress/activity', { method: 'POST', body: JSON.stringify(data) }),

  getWeeklyActivity: (): Promise<unknown[]> => apiRequest<unknown[]>('/progress/weekly'),

  getLeaderboard: (): Promise<unknown[]> => apiRequest<unknown[]>('/progress/leaderboard'),

  // ── Goals ─────────────────────────────────────────────────────
  getGoals: (): Promise<{
    daily_goals: { type: string; label: string; current: number; target: number; unit: string }[]
    weekly_challenges: { id: string; title: string; description: string; current: number; target: number; completed: boolean }[]
    milestones: { id: string; title: string; description: string; current: number; target: number; completed: boolean }[]
    custom_goals: { id: number; title: string; description: string | null; completed: boolean }[]
  }> => apiRequest('/goals'),

  updateGoalSettings: (data: { target_cards?: number; target_quizzes?: number }): Promise<unknown> =>
    apiRequest<unknown>('/goals/settings', { method: 'PUT', body: JSON.stringify(data) }),

  createCustomGoal: (data: { title: string; description?: string }): Promise<{ id: number; title: string; description: string | null; completed: boolean }> =>
    apiRequest('/goals/custom', { method: 'POST', body: JSON.stringify(data) }),

  updateCustomGoal: (id: number, data: { completed?: boolean; title?: string; description?: string }): Promise<{ id: number; title: string; description: string | null; completed: boolean }> =>
    apiRequest(`/goals/custom/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCustomGoal: (id: number): Promise<unknown> =>
    apiRequest<unknown>(`/goals/custom/${id}`, { method: 'DELETE' }),
}
