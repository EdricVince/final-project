<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-foreground text-sm font-medium">Today's Goals</h4>
      <span class="text-muted-foreground text-xs">
        {{ completedCount }}/{{ goals.length }} completed
      </span>
    </div>

    <div class="space-y-3">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="group"
      >
        <div class="mb-1.5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
              :class="isCompleted(goal) ? 'bg-primary' : 'bg-secondary'"
            >
              <component
                :is="getIcon(goal.type)"
                class="h-3.5 w-3.5"
                :class="isCompleted(goal) ? 'text-primary-foreground' : 'text-muted-foreground'"
              />
            </div>
            <span
              class="text-sm transition-colors"
              :class="isCompleted(goal) ? 'text-muted-foreground line-through' : 'text-foreground'"
            >
              {{ goal.label }}
            </span>
          </div>
          <span class="text-muted-foreground text-xs">
            {{ goal.current }}/{{ goal.target }} {{ goal.unit }}
          </span>
        </div>

        <!-- Progress bar -->
        <div class="bg-secondary h-2 w-full overflow-hidden rounded-full">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="isCompleted(goal) ? 'bg-primary' : 'bg-chart-2'"
            :style="{ width: `${getProgress(goal)}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, Layers, Trophy, Clock } from 'lucide-vue-next'
import type { DailyGoal } from '@/types/profile'

interface Props {
  goals: DailyGoal[]
}

const props = defineProps<Props>()

const getIcon = (type: DailyGoal['type']) => {
  const icons = {
    vocabulary: BookOpen,
    flashcard: Layers,
    quiz: Trophy,
    time: Clock,
  }
  return icons[type]
}

const isCompleted = (goal: DailyGoal): boolean => {
  return goal.current >= goal.target
}

const getProgress = (goal: DailyGoal): number => {
  return Math.min((goal.current / goal.target) * 100, 100)
}

const completedCount = computed(() => {
  return props.goals.filter((g) => isCompleted(g)).length
})
</script>
