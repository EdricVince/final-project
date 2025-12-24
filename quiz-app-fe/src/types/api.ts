/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false
  error: string
  message: string
  statusCode?: number
  details?: unknown
  timestamp?: string
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  message?: string
}

/**
 * API List Response (without pagination)
 */
export interface ListResponse<T> {
  success: boolean
  data: T[]
  total: number
  message?: string
}

/**
 * Empty success response
 */
export interface SuccessResponse {
  success: true
  message: string
}
