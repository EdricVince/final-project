<template>
  <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
    <h2 class="text-foreground mb-4 flex items-center gap-3 text-base font-semibold lg:mb-5 lg:text-lg">
      <BarChart3 class="text-primary h-5 w-5" />
      Weekly Activity
    </h2>
    <div class="flex items-end justify-between gap-2 lg:gap-3">
      <div
        v-for="(day, index) in activity"
        :key="day.name"
        class="activity-bar flex flex-1 flex-col items-center gap-2 lg:gap-3"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <div class="bg-secondary relative h-24 w-full overflow-hidden rounded-lg lg:h-28">
          <div
            class="bg-primary absolute bottom-0 left-0 w-full rounded-lg transition-all duration-500"
            :style="{ height: `${day.percent}%` }"
          ></div>
        </div>
        <span class="text-muted-foreground text-xs font-medium">{{ day.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'
import type { DayActivity } from '@/types/dashboard'

interface Props {
  activity: DayActivity[]
}

defineProps<Props>()
</script>

<style scoped>
.activity-bar {
  animation: growUp 0.6s ease-out forwards;
}

@keyframes growUp {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}
</style>
