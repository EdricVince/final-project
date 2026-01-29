<template>
  <div class="p-6 lg:p-8">
    <!-- Header with XP Bar -->
    <div class="animate-fade-in-down mb-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
            Learning Statistics
          </h1>
          <p class="text-muted-foreground mt-2 text-base">
            Track your learning progress and activity
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Time Period Selector -->
          <div class="bg-secondary flex rounded-lg p-1">
            <button
              v-for="period in periods"
              :key="period.value"
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-all"
              :class="
                selectedPeriod === period.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="selectedPeriod = period.value"
            >
              {{ period.label }}
            </button>
          </div>
          <!-- Export Button -->
          <button
            class="bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
            @click="exportData"
          >
            <Download class="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <!-- XP Progress Bar -->
      <div class="bg-card border-border mt-6 rounded-2xl border p-4">
        <div class="flex items-center gap-4">
          <div class="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-xl">
            <Sparkles class="text-primary h-7 w-7" />
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-foreground text-lg font-bold">Level {{ currentLevel }}</span>
                <span class="bg-chart-1/10 text-chart-1 rounded-full px-2 py-0.5 text-xs font-medium">
                  {{ xpToNextLevel }} XP to next
                </span>
              </div>
              <span class="text-foreground font-semibold">{{ totalXP.toLocaleString() }} XP</span>
            </div>
            <div class="bg-secondary mt-2 h-3 overflow-hidden rounded-full">
              <div
                class="from-chart-1 to-chart-5 h-full rounded-full bg-linear-to-r transition-all duration-500"
                :style="{ width: `${levelProgress}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="animate-fade-in-up mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <div
        v-for="(stat, index) in quickStats"
        :key="stat.label"
        class="bg-card border-border group relative overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-lg"
        :class="`delay-${index * 50}`"
      >
        <div class="relative z-10">
          <div class="flex items-center justify-between">
            <component :is="stat.icon" class="text-primary h-5 w-5" />
            <span
              class="flex items-center gap-1 text-xs font-medium"
              :class="stat.change >= 0 ? 'text-chart-2' : 'text-destructive'"
            >
              <TrendingUp v-if="stat.change >= 0" class="h-3 w-3" />
              <TrendingDown v-else class="h-3 w-3" />
              {{ Math.abs(stat.change) }}%
            </span>
          </div>
          <p class="text-foreground mt-3 text-2xl font-bold">{{ stat.value }}</p>
          <p class="text-muted-foreground text-sm">{{ stat.label }}</p>
        </div>
        <!-- Gradient overlay on hover -->
        <div
          class="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:gap-8">
      <!-- Weekly Progress Ring -->
      <div class="animate-fade-in-up">
        <div class="bg-card border-border rounded-2xl border p-6">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Target class="text-primary h-5 w-5" />
              Weekly Progress
            </h3>
            <span
              v-if="statistics.weeklyProgress.percentage >= 100"
              class="bg-chart-2/10 text-chart-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
            >
              <Check class="h-3 w-3" />
              Complete!
            </span>
          </div>
          <div class="flex justify-center">
            <ProgressRing
              :percentage="statistics.weeklyProgress.percentage"
              :current="statistics.weeklyProgress.current"
              :target="statistics.weeklyProgress.target"
              label="Weekly Goal"
              :size="160"
              :stroke-width="12"
            />
          </div>
          <!-- Motivational message -->
          <p class="text-muted-foreground mt-4 text-center text-sm">
            {{ getMotivationalMessage() }}
          </p>
        </div>
      </div>

      <!-- Learning Summary -->
      <div class="animate-fade-in-up delay-100 lg:col-span-2">
        <div class="bg-card border-border rounded-2xl border p-6">
          <h3 class="text-foreground mb-6 flex items-center gap-2 font-semibold">
            <BarChart3 class="text-primary h-5 w-5" />
            Learning Summary
          </h3>
          <LearningSummaryGrid :summary="statistics.learningSummary" />
        </div>
      </div>

      <!-- Weekly Activity Chart -->
      <div class="animate-fade-in-up delay-200 lg:col-span-2">
        <div class="bg-card border-border rounded-2xl border p-6">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Activity class="text-primary h-5 w-5" />
              Activity Overview
            </h3>
            <div class="text-muted-foreground text-sm">
              Total: <span class="text-foreground font-medium">{{ getTotalActivity() }}</span> activities
            </div>
          </div>
          <WeeklyActivityChart :activity="statistics.weeklyActivity" />
        </div>
      </div>

      <!-- Streak Calendar -->
      <div class="animate-fade-in-up delay-300">
        <div class="bg-card border-border rounded-2xl border p-6">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Flame class="text-chart-1 h-5 w-5" />
              Learning Streak
            </h3>
            <div
              v-if="statistics.currentStreak >= 7"
              class="bg-chart-1/10 text-chart-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
            >
              <Flame class="h-3 w-3" />
              On Fire!
            </div>
          </div>
          <StreakCalendar
            :streak-days="statistics.streakDays"
            :current-streak="statistics.currentStreak"
            :longest-streak="statistics.longestStreak"
          />
        </div>
      </div>
    </div>

    <!-- Performance Insights -->
    <div class="animate-fade-in-up delay-400 mt-6">
      <div class="bg-card border-border rounded-2xl border p-6">
        <h3 class="text-foreground mb-6 flex items-center gap-2 font-semibold">
          <Lightbulb class="text-chart-5 h-5 w-5" />
          Performance Insights
        </h3>
        <div class="grid gap-4 md:grid-cols-3">
          <div
            v-for="insight in insights"
            :key="insight.title"
            class="bg-secondary/50 rounded-xl p-4"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                :class="insight.bgClass"
              >
                <component :is="insight.icon" class="h-5 w-5" :class="insight.iconClass" />
              </div>
              <div>
                <p class="text-foreground font-medium">{{ insight.title }}</p>
                <p class="text-muted-foreground mt-1 text-sm">{{ insight.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  Target,
  BarChart3,
  Flame,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Layers,
  Trophy,
  Clock,
  Check,
  Activity,
  Lightbulb,
  Brain,
  Zap,
  Calendar,
} from 'lucide-vue-next'

import ProgressRing from '@/components/profile/statistics/ProgressRing.vue'
import LearningSummaryGrid from '@/components/profile/statistics/LearningSummaryGrid.vue'
import WeeklyActivityChart from '@/components/profile/statistics/WeeklyActivityChart.vue'
import StreakCalendar from '@/components/profile/statistics/StreakCalendar.vue'

import type { ProfileStatistics } from '@/types/profile'

// Time period selection
const periods = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]
const selectedPeriod = ref('week')

// XP System
const totalXP = ref(2450)
const currentLevel = computed(() => Math.floor(totalXP.value / 500) + 1)
const xpForCurrentLevel = computed(() => (currentLevel.value - 1) * 500)
const xpForNextLevel = computed(() => currentLevel.value * 500)
const xpToNextLevel = computed(() => xpForNextLevel.value - totalXP.value)
const levelProgress = computed(() => {
  const progressInLevel = totalXP.value - xpForCurrentLevel.value
  const levelRange = xpForNextLevel.value - xpForCurrentLevel.value
  return (progressInLevel / levelRange) * 100
})

// Quick Stats
const quickStats = computed(() => [
  {
    icon: BookOpen,
    value: '1,250',
    label: 'Words Learned',
    change: 12,
  },
  {
    icon: Layers,
    value: '3,420',
    label: 'Cards Reviewed',
    change: 8,
  },
  {
    icon: Trophy,
    value: '89',
    label: 'Quizzes Done',
    change: 15,
  },
  {
    icon: Clock,
    value: '39h',
    label: 'Time Spent',
    change: -5,
  },
])

// Performance Insights
const insights = [
  {
    icon: Brain,
    title: 'Best Learning Time',
    description: 'You learn best between 9-11 AM. Try to study during these hours!',
    bgClass: 'bg-chart-2/10',
    iconClass: 'text-chart-2',
  },
  {
    icon: Zap,
    title: 'Fastest Improvement',
    description: 'Your vocabulary speed has improved by 23% this week!',
    bgClass: 'bg-chart-1/10',
    iconClass: 'text-chart-1',
  },
  {
    icon: Calendar,
    title: 'Consistency Tip',
    description: 'You often skip Sundays. A short 10-min session can keep your streak!',
    bgClass: 'bg-chart-4/10',
    iconClass: 'text-chart-4',
  },
]

const generateStreakDays = () => {
  const days = []
  const today = new Date()
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push({
      date,
      completed: Math.random() > 0.3,
    })
  }
  return days
}

const statistics = reactive<ProfileStatistics>({
  weeklyActivity: [
    { day: 'Mon', flashcards: 25, quizzes: 3, vocabulary: 15 },
    { day: 'Tue', flashcards: 40, quizzes: 5, vocabulary: 20 },
    { day: 'Wed', flashcards: 15, quizzes: 2, vocabulary: 10 },
    { day: 'Thu', flashcards: 35, quizzes: 4, vocabulary: 25 },
    { day: 'Fri', flashcards: 50, quizzes: 6, vocabulary: 30 },
    { day: 'Sat', flashcards: 20, quizzes: 2, vocabulary: 12 },
    { day: 'Sun', flashcards: 30, quizzes: 3, vocabulary: 18 },
  ],
  learningSummary: {
    totalVocabulary: 1250,
    flashcardsReviewed: 3420,
    quizzesCompleted: 89,
    totalTimeMinutes: 2340,
  },
  weeklyProgress: {
    current: 145,
    target: 200,
    percentage: 73,
  },
  currentStreak: 7,
  longestStreak: 21,
  streakDays: generateStreakDays(),
})

const getTotalActivity = () => {
  return statistics.weeklyActivity.reduce(
    (sum, day) => sum + day.flashcards + day.quizzes + day.vocabulary,
    0
  )
}

const getMotivationalMessage = () => {
  const percentage = statistics.weeklyProgress.percentage
  if (percentage >= 100) return "Amazing! You've crushed your weekly goal! 🎉"
  if (percentage >= 75) return "Almost there! Keep pushing! 💪"
  if (percentage >= 50) return "Halfway done! You're doing great! 🌟"
  if (percentage >= 25) return "Good start! Keep the momentum going! 🚀"
  return "Every step counts! Let's get started! 📚"
}

const exportData = () => {
  const data = {
    period: selectedPeriod.value,
    exportedAt: new Date().toISOString(),
    statistics: {
      totalXP: totalXP.value,
      level: currentLevel.value,
      ...statistics,
    },
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `studyspark-stats-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
