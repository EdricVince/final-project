import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/api\/v1$/, '')

export interface AdminUser {
  id: number
  email: string
  name: string | null
  role_id: number
  is_active: boolean
  created_at: string
  xp: number
}

export interface AdminStats {
  total: number
  students: number
  teachers: number
  active: number
  newThisWeek: number
}

export const ROLE_STUDENT = 1
export const ROLE_TEACHER = 2

export const useAdminStore = defineStore('admin', () => {
  const adminKey = ref<string>(localStorage.getItem('admin_key') ?? '')
  const isAuthenticated = ref(false)
  const users = ref<AdminUser[]>([])
  const stats = ref<AdminStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const headers = computed((): Record<string, string> => ({
    'Content-Type': 'application/json',
    'x-admin-key': adminKey.value,
  }))

  const students = computed(() => users.value.filter(u => u.role_id === ROLE_STUDENT))
  const teachers = computed(() => users.value.filter(u => u.role_id === ROLE_TEACHER))

  async function login(key: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/api/v1/admin/stats`, {
        headers: { 'x-admin-key': key },
      })
      if (res.ok) {
        adminKey.value = key
        isAuthenticated.value = true
        localStorage.setItem('admin_key', key)
        const data = await res.json()
        stats.value = data.data
        return true
      }
      return false
    } catch {
      return false
    }
  }

  async function tryRestoreSession(): Promise<boolean> {
    const stored = localStorage.getItem('admin_key')
    if (!stored) return false
    const ok = await login(stored)
    if (!ok) localStorage.removeItem('admin_key')
    return ok
  }

  function logout() {
    adminKey.value = ''
    isAuthenticated.value = false
    localStorage.removeItem('admin_key')
    users.value = []
    stats.value = null
  }

  async function fetchStats() {
    const res = await fetch(`${BASE}/api/v1/admin/stats`, { headers: headers.value })
    if (!res.ok) { isAuthenticated.value = false; throw new Error('Unauthorized') }
    const data = await res.json()
    stats.value = data.data
  }

  async function fetchUsers() {
    loading.value = true
    try {
      const res = await fetch(`${BASE}/api/v1/admin/users`, { headers: headers.value })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      users.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function setActive(userId: number, isActive: boolean) {
    await fetch(`${BASE}/api/v1/admin/users/${userId}/active`, {
      method: 'PATCH',
      headers: headers.value,
      body: JSON.stringify({ is_active: isActive }),
    })
    const user = users.value.find(u => u.id === userId)
    if (user) user.is_active = isActive
    await fetchStats()
  }

  async function resetPassword(userId: number, newPassword: string) {
    const res = await fetch(`${BASE}/api/v1/admin/users/${userId}/reset-password`, {
      method: 'PATCH',
      headers: headers.value,
      body: JSON.stringify({ new_password: newPassword }),
    })
    if (!res.ok) throw new Error('Failed to reset password')
  }

  async function deleteUser(userId: number) {
    const res = await fetch(`${BASE}/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: headers.value,
    })
    if (!res.ok) throw new Error('Failed to delete user')
    users.value = users.value.filter(u => u.id !== userId)
    await fetchStats()
  }

  async function createTeacher(name: string, password: string, email?: string): Promise<string> {
    const res = await fetch(`${BASE}/api/v1/admin/create-teacher`, {
      method: 'POST',
      headers: headers.value,
      body: JSON.stringify({ name, password, ...(email ? { email } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to create teacher' }))
      throw new Error(err.message ?? 'Failed to create teacher')
    }
    const data = await res.json()
    await fetchUsers()
    await fetchStats()
    return data.data.email as string
  }

  return {
    adminKey, isAuthenticated, users, stats, loading, error,
    students, teachers,
    login, tryRestoreSession, logout,
    fetchStats, fetchUsers,
    setActive, resetPassword, deleteUser, createTeacher,
  }
})
