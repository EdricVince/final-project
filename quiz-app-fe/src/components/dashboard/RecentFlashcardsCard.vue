<template>
  <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
    <div class="mb-4 flex items-center justify-between lg:mb-5">
      <h2 class="text-foreground flex items-center gap-3 text-base font-semibold lg:text-lg">
        <Layers class="text-primary h-5 w-5" />
        Recent Flashcards
      </h2>
      <Button variant="ghost" size="sm" class="text-primary" @click="$emit('viewAll')">
        View All
        <ChevronRight class="ml-1 h-4 w-4" />
      </Button>
    </div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="bg-secondary/50 rounded-xl p-4">
          <div class="skeleton mb-3 h-4 w-3/4 rounded"></div>
          <div class="skeleton h-3 w-1/2 rounded"></div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(flashcard, index) in flashcards"
          :key="flashcard.id"
          class="flashcard-item bg-secondary/50 hover:bg-secondary group cursor-pointer rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          :style="{ animationDelay: `${index * 75}ms` }"
          @click="$emit('openFlashcard', flashcard.id)"
        >
          <div class="mb-3 flex items-start justify-between gap-3">
            <span class="text-foreground line-clamp-2 text-sm font-medium">{{ flashcard.question }}</span>
            <Badge variant="secondary" class="shrink-0 text-xs">
              {{ flashcard.difficulty }}
            </Badge>
          </div>
          <div class="text-muted-foreground flex items-center gap-2 text-xs">
            <Clock class="h-3.5 w-3.5" />
            <span>{{ flashcard.lastStudied }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Layers, ChevronRight, Clock } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import type { DashboardFlashcard } from '@/types/dashboard'

interface Props {
  flashcards: DashboardFlashcard[]
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
})

defineEmits<{
  viewAll: []
  openFlashcard: [id: number]
}>()
</script>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    var(--secondary) 50%,
    var(--muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.flashcard-item {
  animation: fadeInUp 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
