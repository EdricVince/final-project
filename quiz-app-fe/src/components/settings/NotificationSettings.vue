<template>
  <div class="space-y-6">
    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Bell class="text-primary h-5 w-5" />
        Notification Preferences
      </h2>

      <div class="space-y-4">
        <div
          v-for="option in notificationOptions"
          :key="option.key"
          class="flex items-center justify-between rounded-xl p-4 transition-all hover:bg-secondary/50"
        >
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <component :is="option.icon" class="text-primary h-5 w-5" />
            </div>
            <div>
              <p class="text-foreground font-medium">{{ option.label }}</p>
              <p class="text-muted-foreground text-sm">{{ option.description }}</p>
            </div>
          </div>
          <button
            class="relative h-6 w-11 rounded-full transition-colors"
            :class="notifications[option.key] ? 'bg-primary' : 'bg-secondary'"
            @click="toggleNotification(option.key)"
          >
            <span
              class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
              :class="notifications[option.key] ? 'left-5.5' : 'left-0.5'"
            />
          </button>
        </div>
      </div>
    </div>

    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Clock class="text-primary h-5 w-5" />
        Reminder Schedule
      </h2>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">Reminder Time</label>
          <input
            :value="notifications.reminderTime"
            type="time"
            class="bg-secondary border-border text-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @input="updateField('reminderTime', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">Timezone</label>
          <select
            :value="notifications.timezone"
            class="bg-secondary border-border text-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @change="updateField('timezone', ($event.target as HTMLSelectElement).value)"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</option>
            <option value="America/New_York">Eastern Time (US)</option>
            <option value="Europe/London">London (GMT)</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bell, Clock, Mail, Flame, Trophy, Zap } from 'lucide-vue-next'

export interface NotificationData {
  email: boolean
  streakReminder: boolean
  achievements: boolean
  weeklyReport: boolean
  reminderTime: string
  timezone: string
  [key: string]: boolean | string
}

const props = defineProps<{
  notifications: NotificationData
}>()

const emit = defineEmits<{
  'update:notifications': [value: NotificationData]
}>()

const notificationOptions = [
  { key: 'email', label: 'Email Notifications', description: 'Receive updates via email', icon: Mail },
  { key: 'streakReminder', label: 'Streak Reminders', description: 'Get notified to maintain your streak', icon: Flame },
  { key: 'achievements', label: 'Achievement Alerts', description: 'Celebrate your milestones', icon: Trophy },
  { key: 'weeklyReport', label: 'Weekly Reports', description: 'Summary of your learning progress', icon: Zap },
]

const toggleNotification = (key: string) => {
  emit('update:notifications', {
    ...props.notifications,
    [key]: !props.notifications[key],
  })
}

const updateField = (key: string, value: string) => {
  emit('update:notifications', {
    ...props.notifications,
    [key]: value,
  })
}
</script>

<style scoped>
.left-5\.5 {
  left: 1.375rem;
}
</style>
