<template>
  <div class="bg-secondary/50 group flex items-center justify-between rounded-xl p-3">
    <div class="flex items-center gap-3">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg"
        :class="goal.completed ? 'bg-primary' : 'bg-secondary'"
      >
        <Check
          v-if="goal.completed"
          class="text-primary-foreground h-4 w-4"
        />
        <Star v-else class="text-muted-foreground h-4 w-4" />
      </div>
      <div>
        <p
          class="text-sm"
          :class="goal.completed ? 'text-muted-foreground line-through' : 'text-foreground'"
        >
          {{ goal.title }}
        </p>
        <p class="text-muted-foreground text-xs">{{ goal.description }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button
        class="text-muted-foreground hover:text-foreground transition-colors"
        @click="$emit('toggle')"
      >
        <Check class="h-4 w-4" />
      </button>
      <button
        class="text-muted-foreground hover:text-destructive transition-colors"
        @click="$emit('delete')"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Star, Trash2 } from '@/components/icons'

export interface CustomGoal {
  id: string
  title: string
  description: string
  completed: boolean
}

defineProps<{
  goal: CustomGoal
}>()

defineEmits<{
  toggle: []
  delete: []
}>()
</script>
