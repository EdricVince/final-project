<template>
  <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
    <h2 class="text-foreground mb-4 flex items-center gap-3 text-base font-semibold lg:mb-5 lg:text-lg">
      <Gamepad2 class="text-primary h-5 w-5" />
      Study Modes
    </h2>
    <div class="space-y-3">
      <button
        v-for="(mode, index) in modes"
        :key="mode.id"
        class="study-mode-btn bg-secondary/50 hover:bg-secondary group flex w-full items-center gap-4 rounded-xl p-3.5 transition-all duration-300 lg:p-4"
        :style="{ animationDelay: `${index * 100}ms` }"
        @click="$emit('selectMode', mode.id)"
      >
        <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 lg:h-11 lg:w-11">
          <component :is="mode.icon" class="text-primary h-5 w-5" />
        </div>
        <div class="flex-1 text-left">
          <h3 class="text-foreground font-medium">{{ mode.title }}</h3>
          <p class="text-muted-foreground text-xs">{{ mode.description }}</p>
        </div>
        <ArrowRight class="text-muted-foreground h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Gamepad2, ArrowRight } from '@/components/icons'
import type { StudyMode } from '@/types/dashboard'

interface Props {
  modes: StudyMode[]
}

defineProps<Props>()

defineEmits<{
  selectMode: [id: number]
}>()
</script>

<style scoped>
.study-mode-btn {
  animation: slideInRight 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
