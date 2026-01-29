<template>
  <div class="grid grid-cols-2 gap-3">
    <div
      v-for="item in summaryItems"
      :key="item.label"
      class="bg-secondary/50 rounded-xl p-4 transition-colors hover:bg-secondary"
    >
      <div class="flex items-center gap-3">
        <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <component :is="item.icon" class="text-primary h-5 w-5" />
        </div>
        <div>
          <p class="text-foreground text-lg font-bold">{{ item.value }}</p>
          <p class="text-muted-foreground text-xs">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, Layers, Trophy, Clock } from 'lucide-vue-next'
import type { LearningSummary } from '@/types/profile'

interface Props {
  summary: LearningSummary
}

const props = defineProps<Props>()

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const summaryItems = computed(() => [
  {
    icon: BookOpen,
    value: props.summary.totalVocabulary.toLocaleString(),
    label: 'Words Learned',
  },
  {
    icon: Layers,
    value: props.summary.flashcardsReviewed.toLocaleString(),
    label: 'Cards Reviewed',
  },
  {
    icon: Trophy,
    value: props.summary.quizzesCompleted.toLocaleString(),
    label: 'Quizzes Done',
  },
  {
    icon: Clock,
    value: formatTime(props.summary.totalTimeMinutes),
    label: 'Time Spent',
  },
])
</script>
