<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-foreground flex items-center gap-2 text-lg font-semibold">
        <Trophy class="text-primary h-5 w-5" />
        {{ $t('profile.achievements.title') }}
      </h3>
      <RouterLink
        to="/achievements"
        class="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium transition-colors"
      >
        {{ $t('profile.achievements.viewAll') }}
        <ChevronRight class="h-4 w-4" />
      </RouterLink>
    </div>

    <!-- Achievement Stats -->
    <div class="mb-4 grid grid-cols-3 gap-2">
      <div class="bg-secondary/50 rounded-lg p-2 text-center">
        <p class="text-foreground text-lg font-bold">{{ earnedCount }}</p>
        <p class="text-muted-foreground text-xs">{{ $t('profile.achievements.earned') }}</p>
      </div>
      <div class="bg-secondary/50 rounded-lg p-2 text-center">
        <p class="text-primary text-lg font-bold">{{ totalPoints }}</p>
        <p class="text-muted-foreground text-xs">{{ $t('profile.achievements.points') }}</p>
      </div>
      <div class="bg-secondary/50 rounded-lg p-2 text-center">
        <p class="text-foreground text-lg font-bold">{{ achievements.length - earnedCount }}</p>
        <p class="text-muted-foreground text-xs">{{ $t('profile.achievements.remaining') }}</p>
      </div>
    </div>

    <!-- Featured Achievements -->
    <div class="mb-4">
      <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">{{ $t('profile.achievements.recentUnlocks') }}</p>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <div
          v-for="achievement in recentAchievements"
          :key="achievement.id"
          class="group relative shrink-0"
        >
          <div
            class="flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl border-2 transition-all duration-300 group-hover:scale-105"
            :class="getRarityClass(achievement.rarity)"
          >
            <component
              :is="achievement.icon"
              class="h-7 w-7"
              :class="getRarityIconClass(achievement.rarity)"
            />
          </div>
          <!-- Tooltip -->
          <div class="pointer-events-none absolute -bottom-14 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div class="bg-foreground text-background whitespace-nowrap rounded-lg px-3 py-2 text-center text-xs shadow-lg">
              <p class="font-medium">{{ achievement.name }}</p>
              <p class="text-background/70 text-xs capitalize">{{ achievement.rarity }}</p>
            </div>
          </div>
        </div>
        <div
          v-if="recentAchievements.length === 0"
          class="text-muted-foreground flex w-full items-center justify-center py-4 text-sm"
        >
          {{ $t('profile.achievements.noneYet') }}
        </div>
      </div>
    </div>

    <!-- Progress to Next -->
    <div v-if="nextAchievement" class="bg-secondary/50 rounded-xl p-4">
      <div class="mb-2 flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl border"
          :class="getRarityClass(nextAchievement.rarity)"
        >
          <component
            :is="nextAchievement.icon"
            class="h-5 w-5"
            :class="getRarityIconClass(nextAchievement.rarity)"
          />
        </div>
        <div class="flex-1">
          <p class="text-foreground text-sm font-medium">{{ nextAchievement.name }}</p>
          <p class="text-muted-foreground text-xs">{{ nextAchievement.description }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
          <div
            class="bg-primary h-full rounded-full transition-all duration-500"
            :style="{ width: `${getProgress(nextAchievement)}%` }"
          ></div>
        </div>
        <span class="text-muted-foreground text-xs">
          {{ nextAchievement.progress || 0 }}/{{ nextAchievement.target }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Trophy, ChevronRight } from '@/components/icons'
import type { Component } from 'vue'

const { t: $t } = useI18n()

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface ShowcaseAchievement {
  id: string
  name: string
  description: string
  icon: Component
  rarity: AchievementRarity
  earned: boolean
  earnedAt?: Date
  progress?: number
  target?: number
}

const props = defineProps<{
  achievements: ShowcaseAchievement[]
}>()

const POINTS_MAP: Record<AchievementRarity, number> = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100,
}

const earnedCount = computed(() => props.achievements.filter((a) => a.earned).length)

const totalPoints = computed(() =>
  props.achievements
    .filter((a) => a.earned)
    .reduce((sum, a) => sum + POINTS_MAP[a.rarity], 0)
)

const recentAchievements = computed(() =>
  props.achievements
    .filter((a) => a.earned && a.earnedAt)
    .sort((a, b) => {
      const dateA = a.earnedAt ? new Date(a.earnedAt).getTime() : 0
      const dateB = b.earnedAt ? new Date(b.earnedAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 5)
)

const nextAchievement = computed(() =>
  props.achievements
    .filter((a) => !a.earned && a.progress !== undefined && a.target !== undefined)
    .sort((a, b) => {
      const progressA = ((a.progress || 0) / (a.target || 1)) * 100
      const progressB = ((b.progress || 0) / (b.target || 1)) * 100
      return progressB - progressA
    })[0] || null
)

const getProgress = (achievement: ShowcaseAchievement): number => {
  if (!achievement.target) return 0
  return Math.min(((achievement.progress || 0) / achievement.target) * 100, 100)
}

const getRarityClass = (rarity: AchievementRarity): string => {
  const classes: Record<AchievementRarity, string> = {
    common: 'bg-secondary border-border',
    rare: 'bg-chart-2/10 border-chart-2',
    epic: 'bg-chart-4/10 border-chart-4',
    legendary: 'bg-chart-1/10 border-chart-1',
  }
  return classes[rarity]
}

const getRarityIconClass = (rarity: AchievementRarity): string => {
  const classes: Record<AchievementRarity, string> = {
    common: 'text-muted-foreground',
    rare: 'text-chart-2',
    epic: 'text-chart-4',
    legendary: 'text-chart-1',
  }
  return classes[rarity]
}
</script>
