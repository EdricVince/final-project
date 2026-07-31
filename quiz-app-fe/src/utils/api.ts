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
import type {
  LessonData,
  VocabSetData,
  VocabWordData,
  LessonContentData,
  GeneratedLessonData,
  GeneratedVocabSetData,
} from '@/types/content'

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
      return responseData ? (responseData as ApiResponse<T>).data : (undefined as T)
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

  oauthLogin: (supabaseToken: string): Promise<LoginResponseData> =>
    apiRequest<LoginResponseData>('/auth/oauth-login', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ supabase_token: supabaseToken }),
    }),

  resetPassword: (email: string): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>('/auth/reset-password', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ email }),
    }),

  confirmResetPassword: (token: string, newPassword: string): Promise<SuccessResponse> =>
    apiRequest<SuccessResponse>('/auth/reset-password/confirm', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ token, new_password: newPassword }),
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

  getTeacherAnalytics: (): Promise<any> => apiRequest<any>('/classes/analytics'),

  // ── Videos ───────────────────────────────────────────────────
  getVideos: (classId?: number): Promise<unknown[]> => {
    const q = classId ? `?class_id=${classId}` : ''
    return apiRequest<unknown[]>(`/videos${q}`)
  },

  getVideo: (id: number): Promise<unknown> => apiRequest<unknown>(`/videos/${id}`),

  createVideo: (data: unknown): Promise<unknown> =>
    apiRequest<unknown>('/videos', { method: 'POST', body: JSON.stringify(data) }),

  updateVideo: (id: number, data: unknown): Promise<unknown> =>
    apiRequest<unknown>(`/videos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteVideo: (id: number): Promise<void> =>
    apiRequest<void>(`/videos/${id}`, { method: 'DELETE' }),

  // ── Live Quiz ─────────────────────────────────────────────────
  createLiveSession: (data: { title: string; class_id?: number; questions?: unknown[] }): Promise<unknown> =>
    apiRequest<unknown>('/live-quiz', { method: 'POST', body: JSON.stringify(data) }),

  getMyLiveSessions: (): Promise<unknown[]> => apiRequest<unknown[]>('/live-quiz/my'),

  joinLiveSession: (pin: string): Promise<unknown> => apiRequest<unknown>(`/live-quiz/join/${pin}`),

  getLiveSession: (id: number): Promise<unknown> => apiRequest<unknown>(`/live-quiz/${id}`),

  updateLiveStatus: (id: number, status: string): Promise<unknown> =>
    apiRequest<unknown>(`/live-quiz/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  nextLiveQuestion: (id: number): Promise<unknown> =>
    apiRequest<unknown>(`/live-quiz/${id}/next`, { method: 'PATCH' }),

  updateLiveQuestions: (id: number, questions: unknown[]): Promise<unknown> =>
    apiRequest<unknown>(`/live-quiz/${id}/questions`, { method: 'PATCH', body: JSON.stringify({ questions }) }),

  deleteLiveSession: (id: number): Promise<void> =>
    apiRequest<void>(`/live-quiz/${id}`, { method: 'DELETE' }),

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

  // ── Entrance Exam ─────────────────────────────────────────────
  generateExam: (data: { exam_type: 'ielts' | 'toeic' | 'toefl'; question_count?: number; variant?: number }): Promise<{ questions: any[]; time_limit: number; exam_type: string; variant: number; session_id: string }> =>
    apiRequest('/entrance-exam/generate', { method: 'POST', body: JSON.stringify(data) }),

  submitExam: (data: { exam_type: string; answers: { question_id: number; selected?: number; written?: string }[]; session_id: string }): Promise<any> =>
    apiRequest('/entrance-exam/submit', { method: 'POST', body: JSON.stringify(data) }),

  // ── Schedule ──────────────────────────────────────────────────
  generateSchedule: (data: { current_level: string; target_exam: string; target_band?: string; weekly_hours: number; focus_areas?: string[] }): Promise<any> =>
    apiRequest('/schedule/generate', { method: 'POST', body: JSON.stringify(data) }),
  extendSchedule: (data: { current_level: string; target_exam: string; target_band?: string; weekly_hours: number; next_month_number: number; existing_themes: string[]; focus_areas?: string[] }): Promise<any> =>
    apiRequest('/schedule/extend', { method: 'POST', body: JSON.stringify(data) }),

  // ── Skills ───────────────────────────────────────────────────
  getReadingPassage: (params?: { level?: string; type?: string; topic?: string }): Promise<any> => {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiRequest<any>(`/skills/reading/passage${q}`)
  },

  submitReadingAnswers: (data: { passage_id: string; answers: number[]; questions: { correct: number }[] }): Promise<any> =>
    apiRequest<any>('/skills/reading/submit', { method: 'POST', body: JSON.stringify(data) }),

  getListeningExercise: (params?: { level?: string; type?: string; topic?: string }): Promise<any> => {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiRequest<any>(`/skills/listening/exercise${q}`)
  },

  getWritingPrompt: (params?: { type?: string; level?: string }): Promise<any> => {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiRequest<any>(`/skills/writing/prompt${q}`)
  },

  submitWriting: (data: { prompt: string; essay: string; type: string; level?: string; time_taken_seconds: number }): Promise<any> =>
    apiRequest<any>('/skills/writing/submit', { method: 'POST', body: JSON.stringify(data) }),

  getSpeakingExercise: (level?: string): Promise<any> => {
    const q = level ? `?level=${level}` : ''
    return apiRequest<any>(`/skills/speaking/exercise${q}`)
  },

  evaluateSpeaking: (data: { target_text: string; spoken_transcript: string; level?: string }): Promise<any> =>
    apiRequest<any>('/skills/speaking/evaluate', { method: 'POST', body: JSON.stringify(data) }),

  getSpeakingPrompt: (level?: string): Promise<any> => {
    const q = level ? `?level=${level}` : ''
    return apiRequest<any>(`/skills/speaking/prompt${q}`)
  },

  // ── AI ────────────────────────────────────────────────────────
  getWordOfTheDay: (): Promise<{
    word: string
    phonetic: string
    partOfSpeech: string
    definition: string
    example: string
    synonyms: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    tip: string
  }> => apiRequest('/ai/word-of-the-day'),

  importScan: (body: { url?: string; text?: string; language?: string }): Promise<unknown> =>
    apiRequest('/ai/import/scan', { method: 'POST', body: JSON.stringify(body) }),

  generateVocabulary: (body: {
    learningLang: string
    uiLang: string
    count?: number
    exclude?: string[]
  }): Promise<{ term: string; meaning: string; explanation: string; example: string }[]> =>
    apiRequest('/ai/vocabulary', { method: 'POST', body: JSON.stringify(body) }),

  generateLesson: (body: { skill: string; level: string; language?: string; meaningLanguage?: string; topic?: string }): Promise<GeneratedLessonData> =>
    apiRequest('/ai/lesson', { method: 'POST', body: JSON.stringify(body) }),

  generateVocabSet: (body: { topic: string; level: string; language?: string; meaningLanguage?: string; count?: number }): Promise<GeneratedVocabSetData> =>
    apiRequest('/ai/vocab-set', { method: 'POST', body: JSON.stringify(body) }),

  // ── Lessons ───────────────────────────────────────────────────
  getLessons: (): Promise<LessonData[]> => apiRequest('/lessons'),
  getLessonById: (id: number): Promise<LessonData> => apiRequest(`/lessons/${id}`),
  createLesson: (body: {
    title: string; description?: string; category?: string; difficulty?: string
    class_id?: number; content: LessonContentData
  }): Promise<LessonData> =>
    apiRequest('/lessons', { method: 'POST', body: JSON.stringify(body) }),
  updateLesson: (id: number, body: {
    title?: string; description?: string; category?: string; difficulty?: string
    class_id?: number; is_published?: boolean; content?: LessonContentData
  }): Promise<LessonData> =>
    apiRequest(`/lessons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLesson: (id: number): Promise<void> =>
    apiRequest(`/lessons/${id}`, { method: 'DELETE' }),

  // ── Vocabulary sets ───────────────────────────────────────────
  getVocabSets: (): Promise<VocabSetData[]> => apiRequest('/vocab-sets'),
  getVocabSet: (id: number): Promise<VocabSetData> => apiRequest(`/vocab-sets/${id}`),
  createVocabSet: (body: {
    name: string; language?: string; level?: string; class_id?: number
    is_published?: boolean; words?: VocabWordData[]
  }): Promise<VocabSetData> =>
    apiRequest('/vocab-sets', { method: 'POST', body: JSON.stringify(body) }),
  updateVocabSet: (id: number, body: {
    name?: string; language?: string; level?: string; is_published?: boolean; words?: VocabWordData[]
  }): Promise<VocabSetData> =>
    apiRequest(`/vocab-sets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteVocabSet: (id: number): Promise<void> =>
    apiRequest(`/vocab-sets/${id}`, { method: 'DELETE' }),
}
