<template>
  <div class="flex min-h-[80vh] flex-col items-center justify-center p-6">
    <!-- Result Card -->
    <div class="animate-fade-in-up bg-card border-border w-full max-w-md rounded-3xl border p-8 text-center shadow-xl">
      <!-- Trophy/Icon -->
      <div class="mx-auto mb-6">
        <div
          class="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl"
          :class="resultIconClass"
        >
          <component :is="resultIcon" class="h-12 w-12" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-foreground mb-2 text-3xl font-bold">{{ resultTitle }}</h1>
      <p class="text-muted-foreground mb-8 text-lg">{{ resultMessage }}</p>

      <!-- Score -->
      <div class="bg-secondary/50 mb-6 rounded-2xl p-6">
        <div class="text-primary mb-1 text-5xl font-bold">{{ result.score }}</div>
        <p class="text-muted-foreground text-sm">Total Score</p>
      </div>

      <!-- Stats Grid -->
      <div class="mb-8 grid grid-cols-2 gap-4">
        <div class="bg-secondary/30 rounded-xl p-4">
          <div class="text-foreground text-2xl font-bold">{{ result.correctAnswers }}/{{ result.totalQuestions }}</div>
          <p class="text-muted-foreground text-sm">Correct</p>
        </div>
        <div class="bg-secondary/30 rounded-xl p-4">
          <div class="text-foreground text-2xl font-bold">{{ result.accuracy }}%</div>
          <p class="text-muted-foreground text-sm">Accuracy</p>
        </div>
        <div class="bg-secondary/30 rounded-xl p-4">
          <div class="text-foreground text-2xl font-bold">{{ formattedTime }}</div>
          <p class="text-muted-foreground text-sm">Time</p>
        </div>
        <div class="bg-secondary/30 rounded-xl p-4">
          <div class="text-primary text-2xl font-bold">+{{ result.xpEarned }}</div>
          <p class="text-muted-foreground text-sm">XP Earned</p>
        </div>
      </div>

      <!-- Streak Bonus -->
      <div v-if="result.streakBonus > 0" class="bg-primary/10 mb-6 flex items-center justify-center gap-2 rounded-xl p-3">
        <Flame class="text-primary h-5 w-5" />
        <span class="text-primary font-medium">+{{ result.streakBonus }} Streak Bonus!</span>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3">
        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors"
          @click="$emit('playAgain')"
        >
          <RotateCcw class="h-5 w-5" />
          Play Again
        </button>
        <button
          class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors"
          @click="$emit('goHome')"
        >
          <Home class="h-5 w-5" />
          Back to Quizzes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Trophy, Star, Medal, ThumbsUp, Flame, RotateCcw, Home } from 'lucide-vue-next'
import type { QuizResult } from '@/types/quiz'

interface Props {
  result: QuizResult
}

const props = defineProps<Props>()

defineEmits<{
  playAgain: []
  goHome: []
}>()

const formattedTime = computed(() => {
  const minutes = Math.floor(props.result.timeSpent / 60)
  const seconds = props.result.timeSpent % 60
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

const resultIcon = computed<Component>(() => {
  if (props.result.accuracy >= 90) return Trophy
  if (props.result.accuracy >= 70) return Star
  if (props.result.accuracy >= 50) return Medal
  return ThumbsUp
})

const resultIconClass = computed(() => {
  if (props.result.accuracy >= 90) return 'bg-primary/10 text-primary'
  if (props.result.accuracy >= 70) return 'bg-accent text-accent-foreground'
  if (props.result.accuracy >= 50) return 'bg-secondary text-secondary-foreground'
  return 'bg-muted text-muted-foreground'
})

const resultTitle = computed(() => {
  if (props.result.accuracy >= 90) return 'Excellent!'
  if (props.result.accuracy >= 70) return 'Great Job!'
  if (props.result.accuracy >= 50) return 'Good Effort!'
  return 'Keep Practicing!'
})

const resultMessage = computed(() => {
  if (props.result.accuracy >= 90) return 'You nailed it! Outstanding performance!'
  if (props.result.accuracy >= 70) return 'Well done! You\'re making great progress!'
  if (props.result.accuracy >= 50) return 'Nice try! Keep pushing forward!'
  return 'Don\'t give up! Practice makes perfect!'
})
</script>
