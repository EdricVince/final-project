<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="text-foreground text-sm font-medium">Learning Streak</h4>
      <div class="flex items-center gap-1.5">
        <Flame class="text-chart-1 h-4 w-4" />
        <span class="text-foreground text-sm font-bold">{{ currentStreak }} days</span>
      </div>
    </div>

    <!-- Mini calendar grid -->
    <div class="grid grid-cols-7 gap-1.5">
      <!-- Day labels -->
      <div
        v-for="day in dayLabels"
        :key="day"
        class="text-muted-foreground text-center text-xs"
      >
        {{ day }}
      </div>

      <!-- Calendar days -->
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="aspect-square rounded-md transition-all duration-200"
        :class="getDayClass(day)"
        :title="day ? formatDate(day.date) : ''"
      />
    </div>

    <!-- Streak info -->
    <div class="border-border flex items-center justify-between border-t pt-3">
      <div class="text-center">
        <p class="text-foreground text-lg font-bold">{{ currentStreak }}</p>
        <p class="text-muted-foreground text-xs">Current</p>
      </div>
      <div class="bg-border h-8 w-px" />
      <div class="text-center">
        <p class="text-foreground text-lg font-bold">{{ longestStreak }}</p>
        <p class="text-muted-foreground text-xs">Longest</p>
      </div>
      <div class="bg-border h-8 w-px" />
      <div class="text-center">
        <p class="text-foreground text-lg font-bold">{{ totalDays }}</p>
        <p class="text-muted-foreground text-xs">Total Days</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Flame } from 'lucide-vue-next'
import type { StreakDay } from '@/types/profile'

interface Props {
  streakDays: StreakDay[]
  currentStreak: number
  longestStreak: number
}

const props = defineProps<Props>()

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const calendarDays = computed(() => {
  const days: (StreakDay | null)[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 27) // Show last 4 weeks

  // Adjust to start from Sunday
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)

  for (let i = 0; i < 28; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    const streakDay = props.streakDays.find((d) => {
      const dDate = new Date(d.date)
      return dDate.toDateString() === currentDate.toDateString()
    })

    if (streakDay) {
      days.push(streakDay)
    } else if (currentDate <= today) {
      days.push({ date: currentDate, completed: false })
    } else {
      days.push(null)
    }
  }

  return days
})

const totalDays = computed(() => {
  return props.streakDays.filter((d) => d.completed).length
})

const getDayClass = (day: StreakDay | null): string => {
  if (!day) return 'bg-secondary/30'
  if (day.completed) return 'bg-primary'
  return 'bg-secondary'
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>
