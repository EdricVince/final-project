import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  const pollInterval = ref<ReturnType<typeof setInterval> | null>(null)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  // No backend endpoint — notifications are local-only
  async function fetchNotifications() {
    // no-op: notifications managed locally via addNotification()
  }

  function markRead(id: number | string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) notification.read = true
  }

  function markAllRead() {
    notifications.value.forEach(n => { n.read = true })
  }

  function deleteNotification(id: number | string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function startPolling() {
    // no-op: no polling without backend endpoint
  }

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
