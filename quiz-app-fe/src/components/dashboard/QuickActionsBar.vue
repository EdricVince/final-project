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
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'quiz',
    label: 'Quick Quiz',
    icon: Brain,
    path: '/quizzes/speed-round',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    icon: Layers,
    path: '/flashcards',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: BookOpen,
    path: '/courses/explore',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    iconClass: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    path: '/achievements',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: Zap,
    path: '/goals',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    iconClass: 'text-red-600 dark:text-red-400',
  },
]

const handleAction = (action: QuickAction) => {
  router.push(action.path)
}
</script>
