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
} from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    public details?: unknown
  ) {
    super(error)
    this.name = 'ApiError'
  }
}

/**
 * API helper function with automatic token handling
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options
  const authStore = useAuthStore()

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add Authorization header if required
  if (requiresAuth) {
    const token = authStore.getAccessToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    } else {
      throw new ApiError(401, 'No access token available')
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: requestHeaders,
    })

    const responseData: ApiResponse<T> | ApiErrorResponse = await response.json()

    // Handle error responses
    if (!responseData.success) {
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

          const retryData: ApiResponse<T> | ApiErrorResponse = await retryResponse.json()

          if (!retryData.success) {
            const retryError = retryData as ApiErrorResponse
            throw new ApiError(retryResponse.status, retryError.message, retryError.details)
          }

          return (retryData as ApiResponse<T>).data
        } else {
          // Refresh failed, logout user
          authStore.logout()
          window.location.href = '/login'
          throw new ApiError(401, 'Session expired')
        }
      }

      throw new ApiError(response.status, errorData.message, errorData.details)
    }

    // Return data from successful response
    return (responseData as ApiResponse<T>).data
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error
    }

    console.error('API request failed:', error)
    throw new ApiError(500, 'Network error or server unavailable')
  }
}

/**
 * Specific API methods
 */
export const api = {
  // ==================== Auth Endpoints ====================

  /**
   * Login with username/email and password
   */
  login: async (username: string, password: string): Promise<LoginResponseData> => {
    return apiRequest<LoginResponseData>('/auth/login', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ username, password } as LoginRequest),
    })
  },

  /**
   * Register new user
   */
  register: async (email: string, password: string, name: string): Promise<LoginResponseData> => {
    return apiRequest<LoginResponseData>('/auth/register', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ email, password, name } as RegisterRequest),
    })
  },

  /**
   * Request password reset
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
   */
  getProfile: (): Promise<UserProfileData> => {
    return apiRequest<UserProfileData>('/auth/profile', {
      method: 'GET',
    })
  },

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<UserProfileData>): Promise<UserProfileData> => {
    return apiRequest<UserProfileData>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Logout (optional: if backend needs to invalidate token)
   */
  logout: (): Promise<SuccessResponse> => {
    return apiRequest<SuccessResponse>('/auth/logout', {
      method: 'POST',
    })
  },

  // ==================== Example: Quiz Endpoints ====================

  /**
   * Get all quizzes (with optional filters)
   */
  getQuizzes: (params?: Record<string, string | number>): Promise<any[]> => {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : ''

    return apiRequest<any[]>(`/quizzes${queryString}`, {
      method: 'GET',
    })
  },

  /**
   * Get single quiz by ID
   */
  getQuiz: (id: string): Promise<any> => {
    return apiRequest<any>(`/quizzes/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Create new quiz
   */
  createQuiz: (quizData: any): Promise<any> => {
    return apiRequest<any>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    })
  },

  /**
   * Update quiz
   */
  updateQuiz: (id: string, quizData: any): Promise<any> => {
    return apiRequest<any>(`/quizzes/${id}`, {
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
