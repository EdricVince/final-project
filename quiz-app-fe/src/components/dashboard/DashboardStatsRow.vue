<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
    <!-- Streak Counter -->
    <div class="bg-card border-border group rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:p-5">
      <div class="mb-3 flex items-center gap-3">
        <div class="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl lg:h-12 lg:w-12">
          <Flame class="text-primary h-5 w-5 lg:h-6 lg:w-6" />
        </div>
      </div>
      <span class="text-foreground text-2xl font-bold lg:text-3xl">{{ stats.streak }}</span>
      <p class="text-muted-foreground mt-1 text-sm">Day Streak</p>
    </div>

    <!-- Cards Learned -->
    <div class="bg-card border-border group rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:p-5">
      <div class="mb-3 flex items-center gap-3">
        <div class="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl lg:h-12 lg:w-12">
          <BookOpen class="text-primary h-5 w-5 lg:h-6 lg:w-6" />
        </div>
      </div>
      <span class="text-foreground text-2xl font-bold lg:text-3xl">{{ stats.cardsLearned }}</span>
      <p class="text-muted-foreground mt-1 text-sm">Cards Learned</p>
    </div>

    <!-- Quizzes Completed -->
    <div class="bg-card border-border group rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:p-5">
      <div class="mb-3 flex items-center gap-3">
        <div class="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl lg:h-12 lg:w-12">
          <Trophy class="text-primary h-5 w-5 lg:h-6 lg:w-6" />
        </div>
      </div>
      <span class="text-foreground text-2xl font-bold lg:text-3xl">{{ stats.quizzesCompleted }}</span>
      <p class="text-muted-foreground mt-1 text-sm">Quizzes Done</p>
    </div>

    <!-- Total XP -->
    <div class="bg-card border-border group rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:p-5">
      <div class="mb-3 flex items-center gap-3">
        <div class="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl lg:h-12 lg:w-12">
          <Zap class="text-primary h-5 w-5 lg:h-6 lg:w-6" />
        </div>
      </div>
      <span class="text-foreground text-2xl font-bold lg:text-3xl">{{ stats.totalXP }}</span>
      <p class="text-muted-foreground mt-1 text-sm">Total XP</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flame, BookOpen, Trophy, Zap } from 'lucide-vue-next'
import type { DashboardStats } from '@/types/dashboard'

interface Props {
  stats: DashboardStats
}

defineProps<Props>()
</script>
