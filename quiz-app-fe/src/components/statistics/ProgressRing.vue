<template>
  <div class="flex flex-col items-center">
    <div class="relative">
      <svg :width="size" :height="size" class="transform -rotate-90">
        <!-- Background circle -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          class="stroke-secondary"
          :stroke-width="strokeWidth"
        />
        <!-- Progress circle -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          class="stroke-primary transition-all duration-500 ease-out"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          stroke-linecap="round"
        />
      </svg>
      <!-- Center content -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-foreground text-2xl font-bold">{{ percentage }}%</span>
        <span class="text-muted-foreground text-xs">{{ label }}</span>
      </div>
    </div>
    <div v-if="showDetails" class="mt-3 text-center">
      <p class="text-muted-foreground text-sm">
        <span class="text-foreground font-medium">{{ current }}</span> / {{ target }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percentage: number
  current?: number
  target?: number
  label?: string
  size?: number
  strokeWidth?: number
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Complete',
  size: 120,
  strokeWidth: 8,
  showDetails: true,
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const clampedPercentage = Math.min(Math.max(props.percentage, 0), 100)
  return circumference.value * (1 - clampedPercentage / 100)
})
</script>
