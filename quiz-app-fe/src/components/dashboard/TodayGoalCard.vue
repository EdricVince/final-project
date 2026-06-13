<template>
  <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
    <div class="mb-4 flex items-center justify-between lg:mb-5">
      <h2 class="text-foreground flex items-center gap-3 text-base font-semibold lg:text-lg">
        <Target class="text-primary h-5 w-5" />
        Today's Goal
      </h2>
      <span class="text-primary text-sm font-medium">{{ progress }}/{{ goal }} cards</span>
    </div>
    <div class="space-y-3 lg:space-y-4">
      <Progress :model-value="progressPercent" class="h-2.5 lg:h-3" />
      <div class="flex items-center justify-between">
        <p class="text-muted-foreground text-sm">
          {{ progressPercent >= 100 ? 'Goal completed!' : `${Math.round(100 - progressPercent)}% remaining` }}
        </p>
        <div v-if="progressPercent >= 100" class="text-primary flex items-center gap-1.5">
          <CheckCircle class="h-4 w-4" />
          <span class="text-sm font-medium">Done!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Target, CheckCircle } from '@/components/icons'
import Progress from '@/components/ui/progress/Progress.vue'

interface Props {
  progress: number
  goal: number
}

const props = defineProps<Props>()

const progressPercent = computed(() => Math.min((props.progress / props.goal) * 100, 100))
</script>
