<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h4 class="text-foreground text-sm font-medium">Weekly Activity</h4>
      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="bg-chart-1 h-2.5 w-2.5 rounded-full" />
          <span class="text-muted-foreground">Flashcards</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="bg-chart-2 h-2.5 w-2.5 rounded-full" />
          <span class="text-muted-foreground">Quizzes</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="bg-chart-3 h-2.5 w-2.5 rounded-full" />
          <span class="text-muted-foreground">Vocabulary</span>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="flex min-h-44 flex-1 items-end justify-between gap-2">
      <div
        v-for="(day, index) in activity"
        :key="index"
        class="flex h-full flex-1 flex-col items-center gap-1"
      >
        <div class="flex w-full flex-1 flex-col-reverse items-center gap-0.5">
          <div
            class="bg-chart-1 w-full rounded-t transition-all duration-300"
            :style="{ height: `${getBarHeight(day.flashcards)}%` }"
          />
          <div
            class="bg-chart-2 w-full transition-all duration-300"
            :style="{ height: `${getBarHeight(day.quizzes)}%` }"
          />
          <div
            class="bg-chart-3 w-full rounded-t transition-all duration-300"
            :style="{ height: `${getBarHeight(day.vocabulary)}%` }"
          />
        </div>
        <span class="text-muted-foreground text-xs">{{ day.day }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyActivity } from '@/types/profile'

interface Props {
  activity: DailyActivity[]
}

const props = defineProps<Props>()

const maxValue = () => {
  let max = 0
  props.activity.forEach((day) => {
    const total = day.flashcards + day.quizzes + day.vocabulary
    if (total > max) max = total
  })
  return max || 1
}

const getBarHeight = (value: number): number => {
  return (value / maxValue()) * 100
}
</script>
