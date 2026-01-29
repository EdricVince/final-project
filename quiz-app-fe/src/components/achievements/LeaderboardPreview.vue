<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <div class="mb-6 flex items-center justify-between">
      <h3 class="text-foreground flex items-center gap-2 font-semibold">
        <Medal class="text-chart-1 h-5 w-5" />
        Leaderboard
      </h3>
      <button class="text-primary text-sm font-medium hover:underline">
        View All
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="(user, index) in users"
        :key="user.name"
        class="flex items-center gap-4 rounded-xl p-3 transition-colors"
        :class="user.isCurrentUser ? 'bg-primary/5' : 'hover:bg-secondary/50'"
      >
        <!-- Rank -->
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
          :class="getRankClass(index)"
        >
          {{ index + 1 }}
        </div>

        <!-- Avatar -->
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
          :class="user.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'"
        >
          {{ user.name.charAt(0) }}
        </div>

        <!-- Name & Achievements -->
        <div class="flex-1">
          <p class="text-foreground font-medium">
            {{ user.name }}
            <span v-if="user.isCurrentUser" class="text-primary text-xs">(You)</span>
          </p>
          <p class="text-muted-foreground text-xs">
            {{ user.achievements }} achievements
          </p>
        </div>

        <!-- Points -->
        <div class="text-right">
          <p class="text-foreground font-bold">{{ user.points.toLocaleString() }}</p>
          <p class="text-muted-foreground text-xs">points</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Medal } from 'lucide-vue-next'

export interface LeaderboardUser {
  name: string
  achievements: number
  points: number
  isCurrentUser: boolean
}

defineProps<{
  users: LeaderboardUser[]
}>()

const getRankClass = (index: number): string => {
  if (index === 0) return 'bg-chart-1 text-white'
  if (index === 1) return 'bg-chart-2 text-white'
  if (index === 2) return 'bg-chart-4 text-white'
  return 'bg-secondary text-foreground'
}
</script>
