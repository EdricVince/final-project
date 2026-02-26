<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-foreground flex items-center gap-2 text-lg font-semibold">
        <Activity class="text-primary h-5 w-5" />
        Recent Activity
      </h3>
      <button class="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
        View All
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="bg-secondary/50 flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="getActivityBgClass(activity.type)"
        >
          <component :is="getActivityIcon(activity.type)" class="h-5 w-5" :class="getActivityIconClass(activity.type)" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-foreground text-sm font-medium">{{ activity.title }}</p>
          <p class="text-muted-foreground truncate text-xs">{{ activity.description }}</p>
        </div>
        <div class="text-right">
          <span
            v-if="activity.xp"
            class="text-primary text-xs font-medium"
          >
            +{{ activity.xp }} XP
          </span>
          <p class="text-muted-foreground text-xs">{{ formatTime(activity.timestamp) }}</p>
        </div>
      </div>

      <div v-if="activities.length === 0" class="py-8 text-center">
        <Activity class="text-muted-foreground mx-auto mb-2 h-8 w-8" />
        <p class="text-muted-foreground text-sm">No recent activity</p>
        <p class="text-muted-foreground text-xs">Start learning to see your progress here!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Activity, BookOpen, CheckCircle, Trophy, Flame, Star, GraduationCap } from 'lucide-vue-next'
import type { Component } from 'vue'

export type ActivityType = 'lesson' | 'quiz' | 'achievement' | 'streak' | 'milestone' | 'review'

export interface RecentActivity {
  id: string
  type: ActivityType
  title: string
  description: string
  xp?: number
  timestamp: Date
}

defineProps<{
  activities: RecentActivity[]
}>()

const getActivityIcon = (type: ActivityType): Component => {
  const icons: Record<ActivityType, Component> = {
    lesson: BookOpen,
    quiz: CheckCircle,
    achievement: Trophy,
    streak: Flame,
    milestone: GraduationCap,
    review: Star,
  }
  return icons[type]
}

const getActivityBgClass = (type: ActivityType): string => {
  const classes: Record<ActivityType, string> = {
    lesson: 'bg-chart-2/10',
    quiz: 'bg-chart-1/10',
    achievement: 'bg-chart-4/10',
    streak: 'bg-chart-4/10',
    milestone: 'bg-chart-5/10',
    review: 'bg-chart-3/10',
  }
  return classes[type]
}

const getActivityIconClass = (type: ActivityType): string => {
  const classes: Record<ActivityType, string> = {
    lesson: 'text-chart-2',
    quiz: 'text-chart-1',
    achievement: 'text-chart-4',
    streak: 'text-chart-4',
    milestone: 'text-chart-5',
    review: 'text-chart-3',
  }
  return classes[type]
}

const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
