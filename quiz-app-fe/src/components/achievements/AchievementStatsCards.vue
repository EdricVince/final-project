<template>
  <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total Points -->
    <div class="bg-card border-border rounded-xl border p-4">
      <div class="flex items-center gap-3">
        <div class="bg-chart-1/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <Sparkles class="text-chart-1 h-5 w-5" />
        </div>
        <div>
          <p class="text-foreground text-xl font-bold">{{ totalPoints.toLocaleString() }}</p>
          <p class="text-muted-foreground text-xs">Achievement Points</p>
        </div>
      </div>
    </div>

    <!-- Rarity Breakdown -->
    <div class="bg-card border-border rounded-xl border p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="bg-muted-foreground h-2.5 w-2.5 rounded-full" />
          <span class="text-muted-foreground text-xs">{{ rarityCount.common }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-chart-2 h-2.5 w-2.5 rounded-full" />
          <span class="text-muted-foreground text-xs">{{ rarityCount.rare }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-chart-4 h-2.5 w-2.5 rounded-full" />
          <span class="text-muted-foreground text-xs">{{ rarityCount.epic }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-chart-1 h-2.5 w-2.5 rounded-full" />
          <span class="text-muted-foreground text-xs">{{ rarityCount.legendary }}</span>
        </div>
      </div>
      <p class="text-foreground mt-2 text-sm font-medium">Rarity Breakdown</p>
    </div>

    <!-- Recent Achievement -->
    <div class="bg-card border-border rounded-xl border p-4 sm:col-span-2">
      <div class="flex items-center gap-3">
        <div
          v-if="recentAchievement"
          class="flex h-12 w-12 items-center justify-center rounded-xl border-2"
          :class="getBadgeClass(recentAchievement.rarity)"
        >
          <component
            :is="recentAchievement.icon"
            class="h-6 w-6"
            :class="getIconClass(recentAchievement.rarity)"
          />
        </div>
        <div class="flex-1">
          <p class="text-muted-foreground text-xs">Most Recent</p>
          <p class="text-foreground font-medium">
            {{ recentAchievement?.name || 'None yet' }}
          </p>
          <p v-if="recentAchievement?.earnedAt" class="text-muted-foreground text-xs">
            {{ formatDate(recentAchievement.earnedAt) }}
          </p>
        </div>
        <div
          v-if="recentAchievement"
          class="rounded-full px-2 py-1 text-xs font-medium"
          :class="getRarityBadgeClass(recentAchievement.rarity)"
        >
          {{ recentAchievement.rarity }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import type { EnhancedAchievement, AchievementRarity } from '@/types/profile'

defineProps<{
  totalPoints: number
  rarityCount: {
    common: number
    rare: number
    epic: number
    legendary: number
  }
  recentAchievement: EnhancedAchievement | null
}>()

const getBadgeClass = (rarity: AchievementRarity): string => {
  const classes: Record<AchievementRarity, string> = {
    common: 'bg-secondary border-border',
    rare: 'bg-chart-2/10 border-chart-2',
    epic: 'bg-chart-4/10 border-chart-4',
    legendary: 'bg-chart-1/10 border-chart-1',
  }
  return classes[rarity]
}

const getIconClass = (rarity: AchievementRarity): string => {
  const classes: Record<AchievementRarity, string> = {
    common: 'text-foreground',
    rare: 'text-chart-2',
    epic: 'text-chart-4',
    legendary: 'text-chart-1',
  }
  return classes[rarity]
}

const getRarityBadgeClass = (rarity: AchievementRarity): string => {
  const classes: Record<AchievementRarity, string> = {
    common: 'bg-secondary text-muted-foreground',
    rare: 'bg-chart-2/10 text-chart-2',
    epic: 'bg-chart-4/10 text-chart-4',
    legendary: 'bg-chart-1/10 text-chart-1',
  }
  return classes[rarity]
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
