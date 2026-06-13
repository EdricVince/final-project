<template>
  <div class="border-border mt-6 border-t pt-6">
    <div class="bg-linear-to-r from-chart-1/10 to-chart-5/10 flex items-center justify-between rounded-xl p-4">
      <div class="flex items-center gap-3">
        <div class="bg-chart-1/20 flex h-12 w-12 items-center justify-center rounded-xl">
          <Gift class="text-chart-1 h-6 w-6" />
        </div>
        <div>
          <p class="text-foreground font-medium">Weekly Reward</p>
          <p class="text-muted-foreground text-sm">
            Complete all challenges to earn
          </p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-chart-1 text-xl font-bold">+{{ rewardXP }} XP</p>
        <p class="text-muted-foreground text-xs">
          {{ completed }}/{{ total }} done
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Gift } from '@/components/icons'

defineProps<{
  rewardXP: number
  completed: number
  total: number
}>()
</script>
