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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://techtus-training-quiz-app-be.onrender.com/api/v1'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

/**
 * Custom API Error class
 */
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

/**
 * Check if response is successful (2xx status codes)
 */
function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300
}

/**
 * API helper function with automatic token handling
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options
  const authStore = useAuthStore()

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  }

  // Add Authorization header if required
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

    // Handle empty responses
    const text = await response.text()
    let responseData: ApiResponse<T> | ApiErrorResponse | null = null

    if (text) {
      try {
        responseData = JSON.parse(text)
      } catch {
        throw new ApiError(500, 'PARSE_ERROR', 'Failed to parse response')
      }
    }

    // Handle error responses
    if (!isSuccessStatus(response.status)) {
      const errorData = responseData as ApiErrorResponse

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && requiresAuth) {
        const refreshed = await authStore.refreshAccessToken()

        if (refreshed) {
          // Retry the request with new token
          const newToken = authStore.getAccessToken()
          requestHeaders['Authorization'] = `Bearer ${newToken}`

          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...restOptions,
            headers: requestHeaders,
          })

          const retryText = await retryResponse.text()
          if (!isSuccessStatus(retryResponse.status)) {
            const retryError = JSON.parse(retryText) as ApiErrorResponse
            throw new ApiError(
              retryResponse.status,
              retryError.code || 'ERROR',
              retryError.message,
              retryError.details
            )
          }

          const retryData = JSON.parse(retryText) as ApiResponse<T>
          return retryData.data
        } else {
          // Refresh failed, logout user
          authStore.logout()
          window.location.href = '/login'
          throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired')
        }
      }

      throw new ApiError(
        response.status,
        errorData?.code || 'ERROR',
        errorData?.message || 'An error occurred',
        errorData?.details
      )
    }

    // Return data from successful response
    const successData = responseData as ApiResponse<T>
    return successData.data
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error
    }

    console.error('API request failed:', error)
    throw new ApiError(500, 'NETWORK_ERROR', 'Network error or server unavailable')
  }
}

/**
 * Specific API methods
 */
export const api = {
  // ==================== Auth Endpoints ====================

  /**
   * Login with email and password
   * BE endpoint: POST /api/v1/auth/login (needs to be implemented in BE)
   */
  login: async (email: string, password: string): Promise<LoginResponseData> => {
    return apiRequest<LoginResponseData>('/auth/login', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ email, password } as LoginRequest),
    })
  },

  /**
   * Register new user
   * BE endpoint: POST /api/v1/auth/register
   * Returns: UserOut (id, email, is_active, role_id)
   */
  register: async (email: string, password: string): Promise<UserOut> => {
    return apiRequest<UserOut>('/auth/register', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ email, password } as RegisterRequest),
    })
  },

  /**
   * Request password reset
   * BE endpoint: POST /api/v1/auth/reset-password (needs to be implemented in BE)
   */
  resetPassword: async (email: string): Promise<SuccessResponse> => {
    return apiRequest<SuccessResponse>('/auth/reset-password', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ email }),
    })
  },

  /**
   * Refresh access token
   * BE endpoint: POST /api/v1/auth/refresh (needs to be implemented in BE)
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponseData> => {
    return apiRequest<RefreshTokenResponseData>('/auth/refresh', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ refresh_token: refreshToken } as RefreshTokenRequest),
    })
  },

  /**
   * Get current user profile
   * BE endpoint: GET /api/v1/auth/me (needs to be implemented in BE)
   */
  getProfile: (): Promise<UserProfileData> => {
    return apiRequest<UserProfileData>('/auth/me', {
      method: 'GET',
    })
  },

  /**
   * Update user profile
   * BE endpoint: PUT /api/v1/auth/me (needs to be implemented in BE)
   */
  updateProfile: (data: Partial<UserProfileData>): Promise<UserProfileData> => {
    return apiRequest<UserProfileData>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Logout
   * BE endpoint: POST /api/v1/auth/logout (needs to be implemented in BE)
   */
  logout: (): Promise<SuccessResponse> => {
    return apiRequest<SuccessResponse>('/auth/logout', {
      method: 'POST',
    })
  },

  // ==================== Quiz Endpoints ====================

  /**
   * Get all quizzes (with optional filters)
   */
  getQuizzes: (params?: Record<string, string | number>): Promise<unknown[]> => {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : ''

    return apiRequest<unknown[]>(`/quizzes${queryString}`, {
      method: 'GET',
    })
  },

  /**
   * Get single quiz by ID
   */
  getQuiz: (id: string): Promise<unknown> => {
    return apiRequest<unknown>(`/quizzes/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Create new quiz
   */
  createQuiz: (quizData: unknown): Promise<unknown> => {
    return apiRequest<unknown>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    })
  },

  /**
   * Update quiz
   */
  updateQuiz: (id: string, quizData: unknown): Promise<unknown> => {
    return apiRequest<unknown>(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    })
  },

  /**
   * Delete quiz
   */
  deleteQuiz: (id: string): Promise<SuccessResponse> => {
    return apiRequest<SuccessResponse>(`/quizzes/${id}`, {
      method: 'DELETE',
    })
  },
}
