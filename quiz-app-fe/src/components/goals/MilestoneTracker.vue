<template>
  <div class="space-y-4">
    <h4 class="text-foreground text-sm font-medium">Milestones</h4>

    <div class="relative">
      <!-- Progress line -->
      <div class="bg-secondary absolute left-5 top-0 h-full w-0.5" />

      <div class="space-y-4">
        <div
          v-for="(milestone, index) in milestones"
          :key="milestone.id"
          class="relative flex items-start gap-4"
        >
          <!-- Icon circle -->
          <div
            class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all"
            :class="
              milestone.completed
                ? 'border-primary bg-primary'
                : isNextMilestone(index)
                  ? 'border-chart-1 bg-chart-1/10'
                  : 'border-border bg-card'
            "
          >
            <component
              :is="milestone.icon"
              class="h-4 w-4"
              :class="
                milestone.completed
                  ? 'text-primary-foreground'
                  : isNextMilestone(index)
                    ? 'text-chart-1'
                    : 'text-muted-foreground'
              "
            />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1 pb-4">
            <div class="flex items-center justify-between">
              <p
                class="text-sm font-medium"
                :class="milestone.completed ? 'text-primary' : 'text-foreground'"
              >
                {{ milestone.title }}
              </p>
              <span
                v-if="milestone.completed"
                class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium"
              >
                Completed
              </span>
            </div>
            <p class="text-muted-foreground mt-0.5 text-xs">
              {{ milestone.description }}
            </p>

            <!-- Progress bar for incomplete milestones -->
            <div v-if="!milestone.completed" class="mt-2">
              <div class="mb-1 flex items-center justify-between">
                <span class="text-muted-foreground text-xs">
                  {{ milestone.current.toLocaleString() }} / {{ milestone.target.toLocaleString() }}
                </span>
                <span class="text-foreground text-xs font-medium">
                  {{ getProgress(milestone) }}%
                </span>
              </div>
              <div class="bg-secondary h-1.5 overflow-hidden rounded-full">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="isNextMilestone(index) ? 'bg-chart-1' : 'bg-muted-foreground/30'"
                  :style="{ width: `${getProgress(milestone)}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Milestone } from '@/types/profile'

interface Props {
  milestones: Milestone[]
}

const props = defineProps<Props>()

const getProgress = (milestone: Milestone): number => {
  return Math.round((milestone.current / milestone.target) * 100)
}

const isNextMilestone = (index: number): boolean => {
  const firstIncomplete = props.milestones.findIndex((m) => !m.completed)
  return index === firstIncomplete
}
</script>
