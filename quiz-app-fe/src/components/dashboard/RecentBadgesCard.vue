<template>
  <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
    <h2 class="text-foreground mb-4 flex items-center gap-3 text-base font-semibold lg:mb-5 lg:text-lg">
      <Award class="text-primary h-5 w-5" />
      {{ $t('dashboard.recentBadges') }}
    </h2>
    <div class="flex flex-wrap gap-3 lg:gap-4">
      <div
        v-for="(badge, index) in badges"
        :key="badge.id"
        class="badge-item group relative"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <div class="bg-primary/10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 lg:h-14 lg:w-14">
          <component :is="badge.icon" class="text-primary h-5 w-5 lg:h-6 lg:w-6" />
        </div>
        <div class="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span class="bg-foreground text-background rounded px-2 py-1 text-xs font-medium">{{ badge.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Award } from '@/components/icons'
import type { BadgeItem } from '@/types/dashboard'

interface Props {
  badges: BadgeItem[]
}

defineProps<Props>()
</script>

<style scoped>
.badge-item {
  animation: popIn 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
