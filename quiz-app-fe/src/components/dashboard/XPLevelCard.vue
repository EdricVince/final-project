<template>
  <div class="bg-card border-border overflow-hidden rounded-2xl border">
    <!-- Header with Level Badge -->
    <div class="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Animated Level Badge -->
          <div class="relative">
            <div
              class="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold shadow-lg"
              :class="{ 'animate-pulse': isLevelingUp }"
            >
              {{ level }}
            </div>
            <!-- Glow effect -->
            <div class="bg-primary/30 absolute inset-0 -z-10 rounded-2xl blur-xl"></div>
          </div>
          <div>
            <p class="text-muted-foreground text-sm font-medium">Level {{ level }}</p>
            <h3 class="text-foreground text-xl font-bold">{{ levelTitle }}</h3>
          </div>
        </div>
        <!-- XP Badge -->
        <div class="text-right">
          <div class="text-primary text-2xl font-bold">{{ formattedXP }}</div>
          <p class="text-muted-foreground text-sm">Total XP</p>
        </div>
      </div>
    </div>

    <!-- Progress Section -->
    <div class="p-6 pt-4">
      <!-- Progress Bar -->
      <div class="mb-3 flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Progress to Level {{ level + 1 }}</span>
        <span class="text-foreground font-medium">{{ currentXP }} / {{ nextLevelXP }} XP</span>
      </div>
      <div class="bg-secondary relative h-4 overflow-hidden rounded-full">
        <div
          class="bg-primary absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
          :style="{ width: `${progressPercent}%` }"
        >
          <!-- Shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
      <p class="text-muted-foreground mt-2 text-center text-xs">
        {{ xpToNextLevel }} XP needed to reach {{ nextLevelTitle }}
      </p>

      <!-- Level Milestones -->
      <div class="mt-6 grid grid-cols-4 gap-2">
        <div
          v-for="milestone in milestones"
          :key="milestone.level"
          class="text-center"
        >
          <div
            class="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all"
            :class="level >= milestone.level
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground'"
          >
            {{ milestone.level }}
          </div>
          <p class="text-muted-foreground truncate text-xs">{{ milestone.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  totalXP: number
}

const props = defineProps<Props>()

const isLevelingUp = ref(false)

// Level calculation based on XP
const levelThresholds = [
  { level: 1, xp: 0, title: 'Beginner' },
  { level: 2, xp: 100, title: 'Learner' },
  { level: 3, xp: 250, title: 'Student' },
  { level: 4, xp: 500, title: 'Scholar' },
  { level: 5, xp: 1000, title: 'Apprentice' },
  { level: 6, xp: 1750, title: 'Adept' },
  { level: 7, xp: 2750, title: 'Expert' },
  { level: 8, xp: 4000, title: 'Master' },
  { level: 9, xp: 5500, title: 'Grandmaster' },
  { level: 10, xp: 7500, title: 'Legend' },
]

const level = computed(() => {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (props.totalXP >= levelThresholds[i].xp) {
      return levelThresholds[i].level
    }
  }
  return 1
})

const levelTitle = computed(() => {
  return levelThresholds.find(t => t.level === level.value)?.title || 'Beginner'
})

const nextLevelTitle = computed(() => {
  const next = levelThresholds.find(t => t.level === level.value + 1)
  return next?.title || 'Max Level'
})

const currentXP = computed(() => {
  const currentThreshold = levelThresholds.find(t => t.level === level.value)
  return props.totalXP - (currentThreshold?.xp || 0)
})

const nextLevelXP = computed(() => {
  const current = levelThresholds.find(t => t.level === level.value)
  const next = levelThresholds.find(t => t.level === level.value + 1)
  if (!next) return 0
  return next.xp - (current?.xp || 0)
})

const xpToNextLevel = computed(() => {
  return Math.max(0, nextLevelXP.value - currentXP.value)
})

const progressPercent = computed(() => {
  if (nextLevelXP.value === 0) return 100
  return Math.min(100, (currentXP.value / nextLevelXP.value) * 100)
})

const formattedXP = computed(() => {
  return props.totalXP.toLocaleString()
})

const milestones = computed(() => {
  const currentIdx = levelThresholds.findIndex(t => t.level === level.value)
  const start = Math.max(0, currentIdx - 1)
  return levelThresholds.slice(start, start + 4)
})
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
