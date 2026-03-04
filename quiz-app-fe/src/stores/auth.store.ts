import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setCookie, getCookie, removeCookie } from '@/utils/cookies'
import { api, ApiError } from '@/utils/api'
import type { UserOut, UserProfileData } from '@/types/api'
import { UserRole } from '@/types/role'
import { useProgressStore } from '@/stores/progress.store'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const REMEMBER_EMAIL_KEY = 'remembered_email'
const USER_KEY = 'user_data'

export interface AuthUser {
  id: number
  email: string
  name?: string
  is_active?: boolean
  role_id?: number
}

export interface AuthResult {
  success: boolean
  message?: string
  user?: AuthUser
}

export const useAuthStore = defineStore('auth', () => {
  // Load user from localStorage on init
  const savedUser = localStorage.getItem(USER_KEY)
  const currentUser = ref<AuthUser | null>(savedUser ? JSON.parse(savedUser) : null)

  const isAuthenticated = computed(() => !!getCookie(ACCESS_TOKEN_KEY))

  const user = computed(() => currentUser.value)

  // Role-based computed properties
  const isTeacher = computed(() => currentUser.value?.role_id === UserRole.TEACHER)
  const isAdmin = computed(() => currentUser.value?.role_id === UserRole.ADMIN)
  const isStudent = computed(() => !currentUser.value?.role_id || currentUser.value.role_id === UserRole.STUDENT)
  const userRole = computed(() => currentUser.value?.role_id ?? UserRole.STUDENT)

  const setTokens = (accessToken: string, refreshToken?: string) => {
    setCookie(ACCESS_TOKEN_KEY, accessToken, {
      expires: 1,
      secure: true,
      sameSite: 'strict',
    })
    if (refreshToken) {
      setCookie(REFRESH_TOKEN_KEY, refreshToken, {
        expires: 7,
        secure: true,
        sameSite: 'strict',
      })
    }
  }

  const setUser = (user: AuthUser | null) => {
    currentUser.value = user
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  const clearTokens = () => {
    removeCookie(ACCESS_TOKEN_KEY)
    removeCookie(REFRESH_TOKEN_KEY)
    setUser(null)
  }

  const getAccessToken = (): string | undefined => getCookie(ACCESS_TOKEN_KEY)
  const getRefreshToken = (): string | undefined => getCookie(REFRESH_TOKEN_KEY)

  /**
   * Login with email and password
   * Note: BE login endpoint needs to be implemented
   */
  const login = async (email: string, password: string, remember = false): Promise<AuthResult> => {
    try {
      const resp = await api.login(email, password)
      setTokens(resp.access_token)
      setUser({
        id: resp.user.id,
        email: resp.user.email,
        is_active: resp.user.is_active,
        role_id: resp.user.role_id,
      })
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }
      // Fetch full profile (includes name/avatar) — non-critical
      try {
        const profileData = await api.getProfile()
        setUser({
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          is_active: profileData.is_active ?? resp.user.is_active,
          role_id: profileData.role_id ?? resp.user.role_id,
        })
      } catch {
        // Non-critical: continue with basic data from login response
      }
      // Fetch progress stats after login
      const progressStore = useProgressStore()
      progressStore.fetchProgress()
      progressStore.fetchWeekly()
      progressStore.fetchLeaderboard()

      return { success: true, user: currentUser.value ?? undefined }
    } catch (error) {
      console.error('Login error:', error)
      const message = error instanceof ApiError ? error.errorMessage : 'Login failed'
      return { success: false, message }
    }
  }

  /**
   * Login with Google OAuth
   * Note: BE Google OAuth needs to be implemented
   */
  const loginWithGoogle = async (): Promise<AuthResult> => {
    try {
      // TODO: Implement Google OAuth when BE is ready
      await new Promise((r) => setTimeout(r, 1000))
      const mock = {
        access_token: 'google_access_token_' + Date.now(),
        user: { id: 1, email: 'user@gmail.com', name: 'Google User' },
      }
      setTokens(mock.access_token)
      setUser(mock.user)
      return { success: true, user: mock.user }
    } catch (error) {
      console.error('Google login error:', error)
      return { success: false, message: 'Google login failed' }
    }
  }

  /**
   * Register new user
   * BE endpoint: POST /api/v1/auth/register
   * Returns user data (no token - user needs to login after register)
   * @param roleId - Optional role ID (1=Student, 2=Teacher, 3=Admin)
   */
  const register = async (email: string, password: string, roleId?: number): Promise<AuthResult> => {
    try {
      const userOut: UserOut = await api.register(email, password, roleId)
      // BE doesn't return token on register, user needs to login
      // Store user data temporarily
      const user: AuthUser = {
        id: userOut.id,
        email: userOut.email ?? '',
        is_active: userOut.is_active,
        role_id: userOut.role_id ?? roleId,
      }
      return { success: true, user, message: 'Registration successful! Please login.' }
    } catch (error) {
      console.error('Registration error:', error)
      const message = error instanceof ApiError ? error.errorMessage : 'Registration failed'
      return { success: false, message }
    }
  }

  /**
   * Register with Google OAuth
   * Note: BE Google OAuth needs to be implemented
   */
  const registerWithGoogle = async (): Promise<AuthResult> => {
    try {
      // TODO: Implement Google OAuth when BE is ready
      await new Promise((r) => setTimeout(r, 1000))
      const mock = {
        access_token: 'google_register_token_' + Date.now(),
        user: { id: 2, email: 'newuser@gmail.com', name: 'New Google User' },
      }
      setTokens(mock.access_token)
      setUser(mock.user)
      return { success: true, user: mock.user }
    } catch (error) {
      console.error('Google registration error:', error)
      return { success: false, message: 'Google registration failed' }
    }
  }

  /**
   * Request password reset
   * Note: BE endpoint needs to be implemented
   */
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      await api.resetPassword(email)
      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      console.error('Reset password error:', error)
      const message = error instanceof ApiError ? error.errorMessage : 'Reset password failed'
      return { success: false, message }
    }
  }

  /**
   * Logout user
   */
  const logout = () => {
    clearTokens()
    const progressStore = useProgressStore()
    progressStore.$reset()
  }

  const getRememberedEmail = (): string => localStorage.getItem(REMEMBER_EMAIL_KEY) || ''

  /**
   * Fetch current user profile
   * Note: BE endpoint needs to be implemented
   */
  const fetchUserProfile = async (): Promise<UserProfileData | null> => {
    const token = getAccessToken()
    if (!token) return null
    try {
      const profile = await api.getProfile()
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        is_active: profile.is_active,
        role_id: profile.role_id,
      })
      return profile
    } catch (error) {
      console.error('Fetch profile error:', error)
      clearTokens()
      return null
    }
  }

  /**
   * Refresh access token
   * Note: BE endpoint needs to be implemented
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false
    try {
      const resp = await api.refreshToken(refreshToken)
      setCookie(ACCESS_TOKEN_KEY, resp.access_token, {
        expires: 1,
        secure: true,
        sameSite: 'strict',
      })
      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      clearTokens()
      return false
    }
  }

  return {
    // State
    currentUser,
    user,
    isAuthenticated,
    // Role helpers
    isTeacher,
    isAdmin,
    isStudent,
    userRole,
    // Actions
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
    setTokens,
    setUser,
    clearTokens,
  }
})
