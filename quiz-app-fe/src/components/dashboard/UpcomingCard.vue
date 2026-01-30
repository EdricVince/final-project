<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <h3 class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
      <Calendar class="text-primary h-5 w-5" />
      Upcoming
    </h3>

    <div class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="bg-secondary/50 flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="getTypeClass(item.type)"
        >
          <component :is="getTypeIcon(item.type)" class="h-5 w-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-foreground truncate text-sm font-medium">{{ item.title }}</p>
          <p class="text-muted-foreground text-xs">Due {{ item.dueIn }}</p>
        </div>
        <ChevronRight class="text-muted-foreground h-4 w-4 shrink-0" />
      </div>

      <div v-if="items.length === 0" class="py-4 text-center">
        <CheckCircle class="text-primary mx-auto mb-2 h-8 w-8" />
        <p class="text-muted-foreground text-sm">All caught up!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, ChevronRight, CheckCircle, Brain, BookOpen, Trophy } from 'lucide-vue-next'
import type { Component } from 'vue'

interface UpcomingItem {
  id: number
  title: string
  dueIn: string
  type: 'quiz' | 'review' | 'challenge'
}

defineProps<{
  items: UpcomingItem[]
}>()

const getTypeIcon = (type: string): Component => {
  const icons: Record<string, Component> = {
    quiz: Brain,
    review: BookOpen,
    challenge: Trophy,
  }
  return icons[type] || BookOpen
}

const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    quiz: 'bg-chart-1/10 text-chart-1',
    review: 'bg-chart-2/10 text-chart-2',
    challenge: 'bg-chart-4/10 text-chart-4',
  }
  return classes[type] || 'bg-secondary text-muted-foreground'
}
</script>
