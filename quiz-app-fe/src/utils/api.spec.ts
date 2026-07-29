import { describe, it, expect } from 'vitest'
import { ApiError } from './api'

describe('ApiError', () => {
  it('is an Error carrying status, code, message and details', () => {
    const err = new ApiError(404, 'NOT_FOUND', 'Resource missing', { id: 7 })
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('ApiError')
    expect(err.statusCode).toBe(404)
    expect(err.errorCode).toBe('NOT_FOUND')
    expect(err.message).toBe('Resource missing')
    expect(err.errorMessage).toBe('Resource missing')
    expect(err.details).toEqual({ id: 7 })
  })

  it('works without details', () => {
    const err = new ApiError(500, 'NETWORK_ERROR', 'Network error or server unavailable')
    expect(err.statusCode).toBe(500)
    expect(err.details).toBeUndefined()
  })
})
