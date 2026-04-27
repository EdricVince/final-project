import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

export interface Notification {
  id: number | string
  type: 'achievement' | 'streak' | 'goal' | 'quiz' | 'course' | 'xp' | 'lesson' | 'badge'
  title: string
  message: string
  time: string
  read: boolean
  timestamp?: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const pollInterval = ref<NodeJS.Timeout | null>(null)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  // Fetch notifications from API
  async function fetchNotifications() {
    try {
      isLoading.value = true
      const response = await api.get<Notification[]>('/notifications', {
        limit: 50,
        sort: 'desc'
      })
      notifications.value = response || []
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Fallback: keep existing notifications
    } finally {
      isLoading.value = false
    }
  }

  // Mark single notification as read
  async function markRead(id: number | string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
      try {
        await api.put(`/notifications/${id}`, { read: true })
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }
  }

  // Mark all as read
  async function markAllRead() {
    notifications.value.forEach(n => { n.read = true })
    try {
      await api.post('/notifications/mark-all-read', {})
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Delete a notification
  async function deleteNotification(id: number | string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
    try {
      await api.delete(`/notifications/${id}`)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // Start polling for new notifications (every 30 seconds)
  function startPolling() {
    fetchNotifications()
    pollInterval.value = setInterval(() => {
      fetchNotifications()
    }, 30000)
  }

  // Stop polling
  function stopPolling() {
    if (pollInterval.value) {
      clearInterval(pollInterval.value)
      pollInterval.value = null
    }
  }

  // Add notification manually (for real-time events)
  function addNotification(notification: Omit<Notification, 'id' | 'time'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      time: 'Just now',
      timestamp: Date.now(),
    }
    notifications.value.unshift(newNotification)
    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    startPolling,
    stopPolling,
    addNotification,
  }
})
