<template>
  <div class="bg-secondary/50 rounded-xl p-4 transition-all hover:bg-secondary">
    <div class="flex items-start gap-3">
      <!-- Checkbox with animation -->
      <button
        class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all"
        :class="
          challenge.completed
            ? 'border-primary bg-primary'
            : 'border-border hover:border-primary'
        "
        @click="$emit('toggle')"
      >
        <Check
          v-if="challenge.completed"
          class="text-primary-foreground h-3.5 w-3.5"
        />
      </button>

      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between">
          <p
            class="font-medium transition-colors"
            :class="challenge.completed ? 'text-muted-foreground line-through' : 'text-foreground'"
          >
            {{ challenge.title }}
          </p>
          <span
            v-if="challenge.completed"
            class="bg-chart-2/10 text-chart-2 rounded-full px-2 py-0.5 text-xs font-medium"
          >
            +50 XP
          </span>
        </div>
        <p class="text-muted-foreground mt-0.5 text-sm">
          {{ challenge.description }}
        </p>

        <!-- Progress -->
        <div class="mt-3">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-muted-foreground text-xs">Progress</span>
            <span
              class="text-xs font-medium"
              :class="challenge.completed ? 'text-primary' : 'text-foreground'"
            >
              {{ challenge.current }}/{{ challenge.target }}
            </span>
          </div>
          <div class="bg-background h-2 overflow-hidden rounded-full">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="challenge.completed ? 'bg-primary' : 'bg-chart-1'"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import type { WeeklyChallenge } from '@/types/profile'

const props = defineProps<{
  challenge: WeeklyChallenge
}>()

defineEmits<{
  toggle: []
}>()

const progress = computed(() =>
  Math.min((props.challenge.current / props.challenge.target) * 100, 100)
)
</script>
