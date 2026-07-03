<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-foreground text-sm font-medium">Weekly Challenges</h4>
      <div class="flex items-center gap-1.5">
        <Clock class="text-muted-foreground h-3.5 w-3.5" />
        <span class="text-muted-foreground text-xs">{{ daysRemaining }} days left</span>
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="bg-secondary/50 rounded-xl p-4 transition-colors hover:bg-secondary"
      >
        <div class="flex items-start gap-3">
          <!-- Checkbox -->
          <button
            class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all"
            :class="
              challenge.completed
                ? 'border-primary bg-primary'
                : 'border-border hover:border-primary'
            "
            @click="$emit('toggle', challenge.id)"
          >
            <Check
              v-if="challenge.completed"
              class="text-primary-foreground h-3 w-3"
            />
          </button>

          <div class="min-w-0 flex-1">
            <p
              class="text-sm font-medium transition-colors"
              :class="challenge.completed ? 'text-muted-foreground line-through' : 'text-foreground'"
            >
              {{ challenge.title }}
            </p>
            <p class="text-muted-foreground mt-0.5 text-xs">
              {{ challenge.description }}
            </p>

            <!-- Progress -->
            <div class="mt-2">
              <div class="mb-1 flex items-center justify-between">
                <span class="text-muted-foreground text-xs">Progress</span>
                <span class="text-xs font-medium" :class="challenge.completed ? 'text-primary' : 'text-foreground'">
                  {{ challenge.current }}/{{ challenge.target }}
                </span>
              </div>
              <div class="bg-background h-1.5 overflow-hidden rounded-full">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="challenge.completed ? 'bg-primary' : 'bg-chart-1'"
                  :style="{ width: `${getProgress(challenge)}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Clock } from '@/components/icons'
import type { WeeklyChallenge } from '@/types/profile'

interface Props {
  challenges: WeeklyChallenge[]
}

const props = defineProps<Props>()

defineEmits<{
  toggle: [id: string]
}>()

const getProgress = (challenge: WeeklyChallenge): number => {
  return Math.min((challenge.current / challenge.target) * 100, 100)
}

const daysRemaining = computed(() => {
  if (props.challenges.length === 0) return 0
  const now = new Date()
  const expiry = new Date(props.challenges[0]!.expiresAt)
  const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 0)
})
</script>
