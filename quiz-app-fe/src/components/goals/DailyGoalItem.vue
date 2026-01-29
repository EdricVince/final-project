<template>
  <div class="group">
    <div class="mb-1.5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          class="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
          :class="
            isComplete
              ? 'bg-primary'
              : 'bg-secondary hover:bg-primary/20'
          "
          @click="$emit('increment')"
        >
          <component
            :is="icon"
            class="h-4 w-4"
            :class="isComplete ? 'text-primary-foreground' : 'text-muted-foreground'"
          />
        </button>
        <span
          class="text-sm transition-colors"
          :class="isComplete ? 'text-muted-foreground line-through' : 'text-foreground'"
        >
          {{ goal.label }}
        </span>
        <!-- Edit button -->
        <button
          class="text-muted-foreground hover:text-foreground opacity-0 transition-all group-hover:opacity-100"
          @click="$emit('edit')"
        >
          <Pencil class="h-3 w-3" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground text-xs">
          {{ goal.current }}/{{ goal.target }} {{ goal.unit }}
        </span>
        <!-- Completion badge -->
        <span
          v-if="isComplete"
          class="bg-chart-2/10 text-chart-2 rounded-full px-1.5 py-0.5 text-xs"
        >
          +{{ xp }} XP
        </span>
      </div>
    </div>

    <!-- Progress bar with animation -->
    <div class="bg-secondary h-2 w-full overflow-hidden rounded-full">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="isComplete ? 'bg-primary' : 'bg-chart-2'"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Pencil, BookOpen, Layers, Trophy, Clock } from 'lucide-vue-next'
import type { DailyGoal } from '@/types/profile'

const props = defineProps<{
  goal: DailyGoal
}>()

defineEmits<{
  increment: []
  edit: []
}>()

const isComplete = computed(() => props.goal.current >= props.goal.target)

const progress = computed(() => Math.min((props.goal.current / props.goal.target) * 100, 100))

const xpMap: Record<DailyGoal['type'], number> = {
  vocabulary: 20,
  flashcard: 15,
  quiz: 25,
  time: 10,
}

const xp = computed(() => xpMap[props.goal.type])

const iconMap: Record<DailyGoal['type'], Component> = {
  vocabulary: BookOpen,
  flashcard: Layers,
  quiz: Trophy,
  time: Clock,
}

const icon = computed(() => iconMap[props.goal.type])
</script>
