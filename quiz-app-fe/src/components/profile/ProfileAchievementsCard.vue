<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <h3 class="text-foreground mb-4 flex items-center gap-2 font-semibold">
      <Trophy class="text-primary h-5 w-5" />
      Achievements
    </h3>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="badge in achievements"
        :key="badge.id"
        class="group relative"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          :class="badge.earned ? 'bg-primary/10' : 'bg-secondary opacity-50'"
        >
          <component
            :is="badge.icon"
            class="h-5 w-5"
            :class="badge.earned ? 'text-primary' : 'text-muted-foreground'"
          />
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span class="bg-foreground text-background rounded px-2 py-1 text-xs">{{ badge.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import type { Achievement } from '@/types/profile'

interface Props {
  achievements: Achievement[]
}

defineProps<Props>()
</script>
