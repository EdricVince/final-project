<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <h3 class="text-foreground mb-6 flex items-center gap-2 font-semibold">
      <Target class="text-primary h-5 w-5" />
      Learning Goals
    </h3>

    <div class="space-y-6">
      <!-- Daily Goals -->
      <DailyGoalProgress :goals="goals.dailyGoals" />

      <!-- Weekly Challenges -->
      <div class="border-border border-t pt-6">
        <WeeklyChallenges
          :challenges="goals.weeklyChallenges"
          @toggle="$emit('toggle-challenge', $event)"
        />
      </div>

      <!-- Milestones -->
      <div class="border-border border-t pt-6">
        <MilestoneTracker :milestones="goals.milestones" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Target } from 'lucide-vue-next'
import type { ProfileGoals } from '@/types/profile'

import DailyGoalProgress from './DailyGoalProgress.vue'
import WeeklyChallenges from './WeeklyChallenges.vue'
import MilestoneTracker from './MilestoneTracker.vue'

interface Props {
  goals: ProfileGoals
}

defineProps<Props>()

defineEmits<{
  'toggle-challenge': [id: string]
}>()
</script>
