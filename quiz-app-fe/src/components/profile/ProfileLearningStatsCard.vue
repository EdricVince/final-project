<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <h3 class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
      <TrendingUp class="text-primary h-5 w-5" />
      Learning Progress
    </h3>

    <!-- Level Progress -->
    <div class="mb-6">
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <span class="text-primary text-sm font-bold">{{ stats.level }}</span>
          </div>
          <div>
            <p class="text-foreground text-sm font-medium">Level {{ stats.level }}</p>
            <p class="text-muted-foreground text-xs">{{ stats.levelTitle }}</p>
          </div>
        </div>
        <span class="text-muted-foreground text-sm">{{ stats.currentXP }} / {{ stats.nextLevelXP }} XP</span>
      </div>
      <div class="bg-secondary h-2 overflow-hidden rounded-full">
        <div
          class="bg-primary h-full rounded-full transition-all duration-500"
          :style="{ width: `${levelProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="stat in statItems"
        :key="stat.label"
        class="bg-secondary/50 rounded-xl p-3 text-center"
      >
        <component :is="stat.icon" class="text-primary mx-auto mb-2 h-5 w-5" />
        <p class="text-foreground text-lg font-bold">{{ stat.value }}</p>
        <p class="text-muted-foreground text-xs">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Streak Info -->
    <div class="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
          <Flame class="h-6 w-6 text-white" />
        </div>
        <div>
          <p class="text-foreground font-semibold">{{ stats.currentStreak }} Day Streak!</p>
          <p class="text-muted-foreground text-sm">Best: {{ stats.longestStreak }} days</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-foreground text-sm font-medium">Keep it up!</p>
        <p class="text-muted-foreground text-xs">Study today to maintain</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, Flame, BookOpen, CheckCircle, Clock, Target } from 'lucide-vue-next'

export interface LearningStats {
  level: number
  levelTitle: string
  currentXP: number
  nextLevelXP: number
  totalXP: number
  wordsLearned: number
  quizzesCompleted: number
  studyHours: number
  currentStreak: number
  longestStreak: number
}

const props = defineProps<{
  stats: LearningStats
}>()

const levelProgress = computed(() => {
  return Math.min((props.stats.currentXP / props.stats.nextLevelXP) * 100, 100)
})

const statItems = computed(() => [
  { icon: BookOpen, value: props.stats.wordsLearned, label: 'Words Learned' },
  { icon: CheckCircle, value: props.stats.quizzesCompleted, label: 'Quizzes Done' },
  { icon: Clock, value: `${props.stats.studyHours}h`, label: 'Study Time' },
  { icon: Target, value: props.stats.totalXP, label: 'Total XP' },
])
</script>
