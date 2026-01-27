<template>
  <div
    class="quiz-card bg-card border-border group cursor-pointer rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    :style="{ animationDelay: `${index * 100}ms` }"
    @click="$emit('click')"
  >
    <!-- Icon -->
    <div class="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
      <component :is="mode.icon" class="text-primary h-7 w-7" />
    </div>

    <!-- Title & Description -->
    <h3 class="text-foreground mb-2 text-lg font-semibold">{{ mode.title }}</h3>
    <p class="text-muted-foreground mb-4 line-clamp-2 text-sm">{{ mode.description }}</p>

    <!-- Meta Info -->
    <div class="flex flex-wrap items-center gap-2">
      <span
        class="rounded-lg px-2.5 py-1 text-xs font-medium"
        :class="difficultyClass"
      >
        {{ mode.difficulty }}
      </span>
      <span class="bg-secondary text-secondary-foreground rounded-lg px-2.5 py-1 text-xs">
        {{ mode.questionsCount }} questions
      </span>
      <span class="bg-secondary text-secondary-foreground rounded-lg px-2.5 py-1 text-xs">
        {{ mode.estimatedTime }}
      </span>
    </div>

    <!-- Play Button -->
    <div class="mt-5 flex items-center justify-between">
      <span class="text-muted-foreground text-sm">Tap to play</span>
      <div class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
        <Play class="h-5 w-5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Play } from 'lucide-vue-next'
import type { QuizMode } from '@/types/quiz'

interface Props {
  mode: QuizMode
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
})

defineEmits<{
  click: []
}>()

const difficultyClass = computed(() => {
  switch (props.mode.difficulty) {
    case 'easy':
      return 'bg-primary/10 text-primary'
    case 'medium':
      return 'bg-accent text-accent-foreground'
    case 'hard':
      return 'bg-destructive/10 text-destructive'
    default:
      return 'bg-secondary text-secondary-foreground'
  }
})
</script>

<style scoped>
.quiz-card {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
