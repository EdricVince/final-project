<template>
  <div class="bg-card border-border rounded-xl border p-5 lg:p-6">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Level Badge -->
        <div class="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold">
          {{ level }}
        </div>
        <div>
          <p class="text-muted-foreground text-xs">Level {{ level }}</p>
          <h3 class="text-foreground font-semibold">{{ levelTitle }}</h3>
        </div>
      </div>
      <!-- Total XP -->
      <div class="text-right">
        <p class="text-muted-foreground text-xs">Total XP</p>
        <p class="text-primary text-lg font-bold">{{ formattedXP }}</p>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Progress to Level {{ level + 1 }}</span>
        <span class="text-foreground font-medium">{{ currentXP }} / {{ nextLevelXP }}</span>
      </div>
      <div class="bg-secondary h-2 overflow-hidden rounded-full">
        <div
          class="bg-primary h-full rounded-full transition-all duration-1000"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  totalXP: number
}

const props = defineProps<Props>()

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
    if (props.totalXP >= (levelThresholds[i]?.xp ?? 0)) {
      return levelThresholds[i]?.level ?? 1
    }
  }
  return 1
})

const levelTitle = computed(() => {
  return levelThresholds.find(t => t.level === level.value)?.title || 'Beginner'
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

const progressPercent = computed(() => {
  if (nextLevelXP.value === 0) return 100
  return Math.min(100, (currentXP.value / nextLevelXP.value) * 100)
})

const formattedXP = computed(() => {
  return props.totalXP.toLocaleString()
})
</script>
