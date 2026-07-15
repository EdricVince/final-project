<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: number
  max?: number
  class?: HTMLAttributes['class']
  indicatorClass?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  max: 100,
})

const percentage = computed(() => {
  return Math.min(Math.max((props.modelValue / props.max) * 100, 0), 100)
})
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="modelValue"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :class="
      cn(
        'bg-secondary relative h-2 w-full overflow-hidden rounded-full',
        props.class
      )
    "
  >
    <div
      :class="
        cn(
          'bg-primary h-full transition-all duration-500 ease-out',
          props.indicatorClass
        )
      "
      :style="{ width: `${percentage}%` }"
    />
  </div>
</template>