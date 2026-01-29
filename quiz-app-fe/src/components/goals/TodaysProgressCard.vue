<template>
  <div class="bg-card border-border mt-6 rounded-2xl border p-4">
    <div class="flex items-center gap-4">
      <div class="relative">
        <svg class="h-16 w-16 -rotate-90 transform">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            class="stroke-secondary"
            stroke-width="6"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            class="stroke-primary transition-all duration-500"
            stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="175.93"
            :stroke-dashoffset="175.93 * (1 - progress / 100)"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-foreground text-sm font-bold">{{ progress }}%</span>
        </div>
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <span class="text-foreground font-semibold">Today's Progress</span>
          <span class="text-muted-foreground text-sm">
            {{ completedGoals }}/{{ totalGoals }} goals
          </span>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ message }}
        </p>
        <!-- XP Earned Today -->
        <div class="mt-2 flex items-center gap-2">
          <Sparkles class="text-chart-1 h-4 w-4" />
          <span class="text-chart-1 text-sm font-medium">+{{ xpEarned }} XP earned today</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

defineProps<{
  progress: number
  completedGoals: number
  totalGoals: number
  message: string
  xpEarned: number
}>()
</script>
