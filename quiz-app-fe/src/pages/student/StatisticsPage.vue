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
              {{ selectedPeriod === 'week' ? 'Weekly' : selectedPeriod === 'month' ? 'Monthly' : 'Yearly' }} Progress
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
              :label="selectedPeriod === 'week' ? 'Weekly Goal' : selectedPeriod === 'month' ? 'Monthly Goal' : 'Yearly Goal'"
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
              {{ selectedPeriod === 'week' ? 'Daily' : selectedPeriod === 'month' ? 'Weekly' : 'Monthly' }} Activity
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
import { ref, computed } from 'vue'
import {
  Target,
  BarChart3,
  Flame,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Trophy,
  Check,
  Activity,
  Lightbulb,
  Brain,
  Zap,
  Calendar,
} from '@/components/icons'

import ProgressRing from '@/components/statistics/ProgressRing.vue'
import LearningSummaryGrid from '@/components/statistics/LearningSummaryGrid.vue'
import WeeklyActivityChart from '@/components/statistics/WeeklyActivityChart.vue'
import StreakCalendar from '@/components/statistics/StreakCalendar.vue'

import type { ProfileStatistics } from '@/types/profile'
import { useProgressStore } from '@/stores/progress.store'

const progressStore = useProgressStore()

// Time period selection
const periods = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]
const selectedPeriod = ref('week')

// XP System — from progress store
const totalXP = computed(() => progressStore.xp)
const currentLevel = computed(() => progressStore.level)
const xpToNextLevel = computed(() => progressStore.xpToNextLevel)
const levelProgress = computed(() => progressStore.xpProgressPercent)

// Quick Stats
const quickStats = computed(() => [
  {
    icon: BookOpen,
    value: progressStore.totalCardsStudied.toLocaleString(),
    label: 'Cards Studied',
    change: 0,
  },
  {
    icon: Trophy,
    value: progressStore.totalQuizzesCompleted.toLocaleString(),
    label: 'Quizzes Done',
    change: 0,
  },
  {
    icon: Flame,
    value: progressStore.streakCount,
    label: 'Day Streak',
    change: 0,
  },
  {
    icon: Zap,
    value: progressStore.longestStreak,
    label: 'Best Streak',
    change: 0,
  },
])

// Performance Insights — generic tips, not fake user-specific stats
const insights = [
  {
    icon: Brain,
    title: 'Study Consistently',
    description: 'Short daily sessions are more effective than occasional long ones.',
    bgClass: 'bg-chart-2/10',
    iconClass: 'text-chart-2',
  },
  {
    icon: Zap,
    title: 'Build Your Streak',
    description: 'Start your streak today! Even 5 minutes of study counts.',
    bgClass: 'bg-chart-1/10',
    iconClass: 'text-chart-1',
  },
  {
    icon: Calendar,
    title: 'Track Your Progress',
    description: 'Complete quizzes and review flashcards to see your stats grow here.',
    bgClass: 'bg-chart-4/10',
    iconClass: 'text-chart-4',
  },
]

const generateStreakDays = () => {
  const activeDates = new Set(
    progressStore.weeklyActivity.filter(d => d.xp_earned > 0).map(d => d.date)
  )
  const days = []
  const today = new Date()
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0] ?? ''
    days.push({ date, completed: activeDates.has(dateStr) })
  }
  return days
}

const weeklyActivityMapped = computed(() => {
  if (selectedPeriod.value === 'week') {
    if (progressStore.weeklyActivity.length) {
      return progressStore.weeklyActivity.map(d => ({
        day: d.day_label,
        flashcards: d.cards_studied,
        quizzes: d.quizzes_completed,
        vocabulary: 0,
      }))
    }
    return [
      { day: 'Mon', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'Tue', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'Wed', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'Thu', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'Fri', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'Sat', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'Sun', flashcards: 0, quizzes: 0, vocabulary: 0 },
    ]
  }
  if (selectedPeriod.value === 'month') {
    return [
      { day: 'W1', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'W2', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'W3', flashcards: 0, quizzes: 0, vocabulary: 0 },
      { day: 'W4', flashcards: 0, quizzes: 0, vocabulary: 0 },
    ]
  }
  // year
  return [
    { day: 'Jan', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Feb', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Mar', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Apr', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'May', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Jun', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Jul', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Aug', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Sep', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Oct', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Nov', flashcards: 0, quizzes: 0, vocabulary: 0 },
    { day: 'Dec', flashcards: 0, quizzes: 0, vocabulary: 0 },
  ]
})

const periodSummary = computed(() => ({
  totalVocabulary: progressStore.totalCardsStudied,
  flashcardsReviewed: progressStore.totalCardsStudied,
  quizzesCompleted: progressStore.totalQuizzesCompleted,
  totalTimeMinutes: 0,
}))

const periodGoal = computed(() => {
  const current = progressStore.totalCardsStudied
  if (selectedPeriod.value === 'week') return { current: progressStore.todayCards, target: 20 }
  if (selectedPeriod.value === 'month') return { current, target: 300 }
  return { current, target: 3000 }
})

const statistics = computed<ProfileStatistics>(() => ({
  weeklyActivity: weeklyActivityMapped.value,
  learningSummary: periodSummary.value,
  weeklyProgress: {
    current: periodGoal.value.current,
    target: periodGoal.value.target,
    percentage: Math.min(Math.round((periodGoal.value.current / periodGoal.value.target) * 100), 100),
  },
  currentStreak: progressStore.streakCount,
  longestStreak: progressStore.longestStreak,
  streakDays: generateStreakDays(),
}))

const getTotalActivity = () => {
  return statistics.value.weeklyActivity.reduce(
    (sum, day) => sum + day.flashcards + day.quizzes + day.vocabulary,
    0
  )
}

const getMotivationalMessage = () => {
  const percentage = statistics.value.weeklyProgress.percentage
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
      ...statistics.value,
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
