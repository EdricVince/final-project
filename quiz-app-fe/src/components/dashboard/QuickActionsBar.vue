<template>
  <div class="bg-card border-border rounded-2xl border p-4">
    <div class="flex items-center justify-between gap-3 overflow-x-auto">
      <button
        v-for="action in actions"
        :key="action.id"
        class="group flex min-w-[120px] flex-1 flex-col items-center gap-2 rounded-xl p-4 transition-all hover:bg-accent"
        @click="handleAction(action)"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl transition-all group-hover:scale-110"
          :class="action.bgClass"
        >
          <component :is="action.icon" class="h-6 w-6" :class="action.iconClass" />
        </div>
        <span class="text-foreground text-sm font-medium">{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Play, Brain, Layers, BookOpen, Trophy, Zap } from 'lucide-vue-next'

const router = useRouter()

interface QuickAction {
  id: string
  label: string
  icon: typeof Play
  path: string
  bgClass: string
  iconClass: string
}

const actions: QuickAction[] = [
  {
    id: 'continue',
    label: 'Continue',
    icon: Play,
    path: '/courses',
    bgClass: 'bg-chart-2/10',
    iconClass: 'text-chart-2',
  },
  {
    id: 'quiz',
    label: 'Quick Quiz',
    icon: Brain,
    path: '/quizzes/speed-round',
    bgClass: 'bg-chart-1/10',
    iconClass: 'text-chart-1',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    icon: Layers,
    path: '/flashcards',
    bgClass: 'bg-chart-3/10',
    iconClass: 'text-chart-3',
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: BookOpen,
    path: '/courses/explore',
    bgClass: 'bg-chart-4/10',
    iconClass: 'text-chart-4',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    path: '/achievements',
    bgClass: 'bg-chart-5/10',
    iconClass: 'text-chart-5',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: Zap,
    path: '/goals',
    bgClass: 'bg-destructive/10',
    iconClass: 'text-destructive',
  },
]

const handleAction = (action: QuickAction) => {
  router.push(action.path)
}
</script>
