import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setCookie, getCookie, removeCookie } from '@/utils/cookies'
import { api } from '@/utils/api'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const REMEMBER_EMAIL_KEY = 'remembered_email'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<any | null>(null)

  const isAuthenticated = computed(() => !!getCookie(ACCESS_TOKEN_KEY))

  const setTokens = (accessToken: string, refreshToken: string) => {
    setCookie(ACCESS_TOKEN_KEY, accessToken, {
      expires: 1,
      secure: true,
      sameSite: 'strict',
    })
    setCookie(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 7,
      secure: true,
      sameSite: 'strict',
    })
  }

  const clearTokens = () => {
    removeCookie(ACCESS_TOKEN_KEY)
    removeCookie(REFRESH_TOKEN_KEY)
    currentUser.value = null
  }

  const getAccessToken = (): string | undefined => getCookie(ACCESS_TOKEN_KEY)
  const getRefreshToken = (): string | undefined => getCookie(REFRESH_TOKEN_KEY)

  const login = async (username: string, password: string, remember = false): Promise<boolean> => {
    try {
      const resp: any = await api.login(username, password)
      setTokens(resp.access_token, resp.refresh_token)
      currentUser.value = resp.user || null
      if (remember) localStorage.setItem(REMEMBER_EMAIL_KEY, username)
      else localStorage.removeItem(REMEMBER_EMAIL_KEY)
      return true
    } catch (error: any) {
      console.error('Login error:', error)
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      await new Promise((r) => setTimeout(r, 1000))
      const mock = {
        access_token: 'google_access_token_' + Date.now(),
        refresh_token: 'google_refresh_token_' + Date.now(),
        user: { id: 'google_user', email: 'user@gmail.com', name: 'Google User' },
      }
      setTokens(mock.access_token, mock.refresh_token)
      currentUser.value = mock.user
      return true
    } catch (error: any) {
      console.error('Google login error:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const resp: any = await api.register(email, password, name)
      setTokens(resp.access_token, resp.refresh_token)
      currentUser.value = resp.user || null
      return true
    } catch (error: any) {
      console.error('Registration error:', error)
      return false
    }
  }

  const registerWithGoogle = async (): Promise<boolean> => {
    try {
      await new Promise((r) => setTimeout(r, 1000))
      const mock = {
        access_token: 'google_register_token_' + Date.now(),
        refresh_token: 'google_refresh_token_' + Date.now(),
        user: { id: 'new_google_user', email: 'newuser@gmail.com', name: 'New Google User' },
      }
      setTokens(mock.access_token, mock.refresh_token)
      currentUser.value = mock.user
      return true
    } catch (error: any) {
      console.error('Google registration error:', error)
      return false
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await api.resetPassword(email)
      return true
    } catch (error: any) {
      console.error('Reset password error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      // optionally notify backend
      // await api.logout()
      clearTokens()
    } catch (error: any) {
      console.error('Logout error:', error)
      clearTokens()
    }
  }

  const getRememberedEmail = (): string => localStorage.getItem(REMEMBER_EMAIL_KEY) || ''

  const fetchUserProfile = async (): Promise<any | null> => {
    const token = getAccessToken()
    if (!token) return null
    try {
      const user = await api.getProfile()
      currentUser.value = user
      return user
    } catch (error: any) {
      console.error('Fetch profile error:', error)
      clearTokens()
      return null
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false
    try {
      const resp: any = await api.refreshToken(refreshToken)
      setCookie(ACCESS_TOKEN_KEY, resp.access_token, {
        expires: 1,
        secure: true,
        sameSite: 'strict',
      })
      return true
    } catch (error: any) {
      console.error('Token refresh error:', error)
      clearTokens()
      return false
    }
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    registerWithGoogle,
    resetPassword,
    logout,
    getRememberedEmail,
    getAccessToken,
    getRefreshToken,
    fetchUserProfile,
    refreshAccessToken,
  }
})
