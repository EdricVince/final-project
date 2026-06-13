<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
    <!-- Streak Counter -->
    <div
      class="bg-card border-border group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:p-5"
      :class="streakCardClass"
    >
      <!-- Shimmer for 100+ streak -->
      <div v-if="streakLevel >= 4" class="pointer-events-none absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-amber-400/10 to-transparent" />

      <div class="mb-3 flex items-center justify-between">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl lg:h-12 lg:w-12" :class="streakIconBg">
          <StreakFlame :streak="stats.streak" size="md" />
        </div>
        <span v-if="streakBadge" class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" :class="streakBadgeClass">
          {{ streakBadge }}
        </span>
      </div>

      <span class="text-2xl font-bold lg:text-3xl" :class="streakNumberClass">{{ stats.streak }}</span>
      <p class="text-muted-foreground mt-1 text-sm">{{ streakLabel }}</p>
    </div>

    <!-- Cards Learned -->
    <div class="bg-card border-border group rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:p-5">
      <div class="mb-3 flex items-center gap-3">
        <div class="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl lg:h-12 lg:w-12">
          <BookOpen class="text-primary h-5 w-5 lg:h-6 lg:w-6" />
        </div>
      </div>
      <span class="text-foreground text-2xl font-bold lg:text-3xl">{{ stats.cardsLearned }}</span>
      <p class="text-muted-foreground mt-1 text-sm">{{ $t('dashboard.stats.cardsLearned') }}</p>
    </div>

    <!-- Quizzes Completed -->
    <div class="bg-card border-border group rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:p-5">
      <div class="mb-3 flex items-center gap-3">
        <div class="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl lg:h-12 lg:w-12">
          <Trophy class="text-primary h-5 w-5 lg:h-6 lg:w-6" />
        </div>
      </div>
      <span class="text-foreground text-2xl font-bold lg:text-3xl">{{ stats.quizzesCompleted }}</span>
      <p class="text-muted-foreground mt-1 text-sm">{{ $t('dashboard.stats.quizzesDone') }}</p>
    </div>

    <!-- Total XP -->
    <div class="bg-card border-border group rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:p-5">
      <div class="mb-3 flex items-center gap-3">
        <div class="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl lg:h-12 lg:w-12">
          <Zap class="text-primary h-5 w-5 lg:h-6 lg:w-6" />
        </div>
      </div>
      <span class="text-foreground text-2xl font-bold lg:text-3xl">{{ stats.totalXP }}</span>
      <p class="text-muted-foreground mt-1 text-sm">{{ $t('dashboard.stats.totalXP') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BookOpen, Trophy, Zap } from '@/components/icons'
import StreakFlame from '@/components/ui/StreakFlame.vue'
import type { DashboardStats } from '@/types/dashboard'

interface Props { stats: DashboardStats }
const props = defineProps<Props>()

const streakLevel = computed(() => {
  const s = props.stats.streak
  if (s >= 100) return 4
  if (s >= 30)  return 3
  if (s >= 7)   return 2
  if (s >= 1)   return 1
  return 0
})

const { t } = useI18n({ useScope: 'global' })
const streakLabel    = computed(() => [t('dashboard.stats.streakStart'), t('dashboard.stats.streakActive'), t('dashboard.stats.streakHot'), t('dashboard.stats.streakBlaze'), t('dashboard.stats.streakLegend')][streakLevel.value])
const streakBadge    = computed(() => ['', '', 'HOT', 'BLAZE', '★ LEGEND'][streakLevel.value])
const streakCardClass = computed(() => ['', '', 'border-orange-500/30 bg-orange-500/5', 'border-red-500/40 bg-red-500/5', 'border-amber-400/50 bg-amber-400/5'][streakLevel.value])
const streakIconBg   = computed(() => ['bg-primary/10', 'bg-orange-400/10', 'bg-orange-500/15', 'bg-red-500/15', 'bg-amber-400/20'][streakLevel.value])
const streakBadgeClass = computed(() => streakLevel.value === 2 ? 'bg-orange-500/20 text-orange-500' : streakLevel.value === 3 ? 'bg-red-500/20 text-red-500' : 'bg-amber-400/20 text-amber-500')
const streakNumberClass = computed(() => {
  if (streakLevel.value === 1) return 'text-orange-500'
  if (streakLevel.value === 2) return 'text-orange-500'
  if (streakLevel.value === 3) return 'text-red-500'
  if (streakLevel.value >= 4) return 'bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent'
  return 'text-foreground'
})
</script>

<style scoped>
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
.animate-shimmer { animation: shimmer 2.5s linear infinite; }
</style>
