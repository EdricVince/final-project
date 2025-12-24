import { API_BASE_URL, API_TIMEOUT } from '../config/env'

interface FetchOptions extends RequestInit {
  timeout?: number
}

// Type for query parameters
type QueryParamValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryParamValue>

// Type for JSON values
type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

// Type for request body (anything that can be JSON.stringified)
type RequestBody = JsonObject | JsonArray | FormData | null

class APIError extends Error {
  status?: number
  data?: unknown

  constructor(message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = API_TIMEOUT, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout', 408)
    }
    throw error
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  let data: unknown
  try {
    data = isJson ? await response.json() : await response.text()
  } catch {
    data = null
  }

  if (!response.ok) {
    // Type guard for error response
    const errorData = data as { message?: string; error?: string } | null
    const message =
      errorData?.message || errorData?.error || `HTTP ${response.status}: ${response.statusText}`
    throw new APIError(message, response.status, data)
  }

  return data as T
}

function buildUrl(endpoint: string, params?: QueryParams): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const token = localStorage.getItem('authToken')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export const api = {
  async get<T>(endpoint: string, params?: QueryParams): Promise<T> {
    const url = buildUrl(endpoint, params)
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<T>(response)
  },

  async post<T>(endpoint: string, data?: RequestBody): Promise<T> {
    const url = buildUrl(endpoint)
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
    return handleResponse<T>(response)
  },

  async put<T>(endpoint: string, data?: RequestBody): Promise<T> {
    const url = buildUrl(endpoint)
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
    return handleResponse<T>(response)
  },

  async patch<T>(endpoint: string, data?: RequestBody): Promise<T> {
    const url = buildUrl(endpoint)
    const response = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
    return handleResponse<T>(response)
  },

  async delete<T>(endpoint: string): Promise<T> {
    const url = buildUrl(endpoint)
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return handleResponse<T>(response)
  },
}

export { APIError }
