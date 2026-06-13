interface CookieOptions {
  expires?: number // days
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

/**
 * Set a cookie
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const { expires, path = '/', domain, secure = true, sameSite = 'strict' } = options

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (expires) {
    const date = new Date()
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000)
    cookieString += `; expires=${date.toUTCString()}`
  }

  cookieString += `; path=${path}`

  if (domain) {
    cookieString += `; domain=${domain}`
  }

  if (secure) {
    cookieString += '; secure'
  }

  cookieString += `; samesite=${sameSite}`

  document.cookie = cookieString
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | undefined {
  const nameEQ = encodeURIComponent(name) + '='
  const cookies = document.cookie.split(';')

  for (const raw of cookies) {
    const cookie = raw.trimStart()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return undefined
}

/**
 * Remove a cookie
 */
export function removeCookie(name: string, options: Omit<CookieOptions, 'expires'> = {}): void {
  setCookie(name, '', {
    ...options,
    expires: -1,
  })
}

/**
 * Check if cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== undefined
}
