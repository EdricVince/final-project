<template>
  <Transition name="dropdown">
    <div
      v-if="show"
      class="bg-popover border-border absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-2xl border shadow-xl"
    >
      <!-- Header -->
      <div class="border-border flex items-center justify-between border-b px-5 py-4">
        <h3 class="text-foreground font-semibold">Notifications</h3>
        <button
          v-if="notificationStore.unreadCount > 0"
          class="text-primary text-xs font-medium hover:underline"
          @click="markAllRead"
        >
          Mark all as read
        </button>
      </div>

      <!-- Notification List -->
      <div class="max-h-[400px] overflow-y-auto">
        <div v-if="notificationStore.notifications.length > 0">
          <button
            v-for="notification in notificationStore.notifications"
            :key="notification.id"
            class="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-accent"
            :class="{ 'bg-primary/5': !notification.read }"
            @click="markRead(notification.id)"
          >
            <!-- Icon -->
            <div
              class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              :class="getNotificationStyle(notification.type)"
            >
              <component :is="getNotificationIcon(notification.type)" class="h-4 w-4" />
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <p class="text-foreground text-sm font-medium">{{ notification.title }}</p>
              <p class="text-muted-foreground mt-0.5 text-xs">{{ notification.message }}</p>
              <p class="text-muted-foreground mt-1 text-xs">{{ notification.time }}</p>
            </div>

            <!-- Unread dot -->
            <div v-if="!notification.read" class="bg-primary mt-2 h-2 w-2 shrink-0 rounded-full"></div>
          </button>
        </div>

        <!-- Empty State -->
        <div v-else class="px-5 py-10 text-center">
          <Bell class="text-muted-foreground mx-auto mb-3 h-8 w-8" />
          <p class="text-muted-foreground text-sm">No notifications yet</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-border border-t px-5 py-3 text-center">
        <button class="text-primary text-sm font-medium hover:underline">
          View all notifications
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, type Component } from 'vue'
import {
  Bell,
  Trophy,
  Flame,
  Target,
  CheckCircle,
  Star,
  BookOpen,
  Zap,
} from '@/components/icons'
import { useNotificationStore } from '@/stores/notification.store'

defineProps<{
  show: boolean
}>()

const notificationStore = useNotificationStore()

// Load notifications on mount and start polling
onMounted(() => {
  notificationStore.fetchNotifications()
  notificationStore.startPolling()
})

// Stop polling on unmount
onUnmounted(() => {
  notificationStore.stopPolling()
})

const getNotificationIcon = (type: string): Component => {
  const icons: Record<string, Component> = {
    achievement: Trophy,
    streak: Flame,
    goal: Target,
    quiz: CheckCircle,
    course: BookOpen,
    xp: Zap,
    lesson: BookOpen,
    badge: Trophy,
  }
  return icons[type] || Star
}

const getNotificationStyle = (type: string): string => {
  const styles: Record<string, string> = {
    achievement: 'bg-chart-1/10 text-chart-1',
    streak: 'bg-chart-5/10 text-chart-5',
    goal: 'bg-primary/10 text-primary',
    quiz: 'bg-chart-2/10 text-chart-2',
    course: 'bg-chart-3/10 text-chart-3',
    xp: 'bg-chart-4/10 text-chart-4',
    lesson: 'bg-chart-3/10 text-chart-3',
    badge: 'bg-chart-1/10 text-chart-1',
  }
  return styles[type] || 'bg-primary/10 text-primary'
}

const markRead = (id: number | string) => {
  notificationStore.markRead(id)
}

const markAllRead = () => {
  notificationStore.markAllRead()
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
