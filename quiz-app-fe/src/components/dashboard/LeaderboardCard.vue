<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
          <Trophy class="text-primary h-5 w-5" />
        </div>
        <div>
          <h3 class="text-foreground font-semibold">Leaderboard</h3>
          <p class="text-muted-foreground text-sm">This Week</p>
        </div>
      </div>
      <button
        class="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        @click="viewAll"
      >
        View All
      </button>
    </div>

    <!-- Time Filter -->
    <div class="bg-secondary mb-4 flex gap-1 rounded-lg p-1">
      <button
        v-for="period in timePeriods"
        :key="period.value"
        class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          selectedPeriod === period.value
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="selectedPeriod = period.value"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Current User Rank -->
    <div class="bg-primary/5 border-primary/20 mb-4 rounded-xl border p-4">
      <div class="flex items-center gap-3">
        <div class="bg-primary/10 relative flex h-12 w-12 items-center justify-center rounded-full">
          <span class="text-primary text-lg font-bold">{{ userInitials }}</span>
          <div
            class="bg-primary text-primary-foreground absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
          >
            {{ currentUserRank }}
          </div>
        </div>
        <div class="flex-1">
          <p class="text-foreground font-medium">You</p>
          <p class="text-muted-foreground text-sm">{{ currentUserXP.toLocaleString() }} XP</p>
        </div>
        <div class="text-right">
          <div
            class="flex items-center gap-1 text-sm"
            :class="rankChange > 0 ? 'text-green-500' : rankChange < 0 ? 'text-red-500' : 'text-muted-foreground'"
          >
            <TrendingUp v-if="rankChange > 0" class="h-4 w-4" />
            <TrendingDown v-else-if="rankChange < 0" class="h-4 w-4" />
            <Minus v-else class="h-4 w-4" />
            <span v-if="rankChange !== 0">{{ Math.abs(rankChange) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Leaderboard List -->
    <div class="space-y-2">
      <div
        v-for="(user, index) in leaderboard"
        :key="user.id"
        class="hover:bg-accent/50 flex items-center gap-3 rounded-xl p-3 transition-colors"
        :class="{ 'bg-accent/30': user.isCurrentUser }"
      >
        <!-- Rank -->
        <div class="flex h-8 w-8 items-center justify-center">
          <div
            v-if="index < 3"
            class="flex h-8 w-8 items-center justify-center rounded-full"
            :class="getRankClass(index)"
          >
            <Crown v-if="index === 0" class="h-4 w-4" />
            <Medal v-else class="h-4 w-4" />
          </div>
          <span v-else class="text-muted-foreground font-medium">{{ index + 1 }}</span>
        </div>

        <!-- Avatar -->
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
          :class="user.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'"
        >
          {{ user.initials }}
        </div>

        <!-- Info -->
        <div class="flex-1">
          <p class="text-foreground font-medium">
            {{ user.name }}
            <span v-if="user.isCurrentUser" class="text-primary text-xs">(You)</span>
          </p>
          <p class="text-muted-foreground text-sm">Level {{ user.level }}</p>
        </div>

        <!-- XP -->
        <div class="text-right">
          <p class="text-foreground font-semibold">{{ user.xp.toLocaleString() }}</p>
          <p class="text-muted-foreground text-xs">XP</p>
        </div>
      </div>
    </div>

    <!-- Motivation -->
    <div class="bg-secondary/50 mt-4 rounded-xl p-4 text-center">
      <p class="text-muted-foreground text-sm">
        <Zap class="text-primary -mt-0.5 mr-1 inline h-4 w-4" />
        <span v-if="xpToNextRank > 0">
          Earn <span class="text-primary font-semibold">{{ xpToNextRank.toLocaleString() }} XP</span> more to reach rank {{ currentUserRank - 1 }}!
        </span>
        <span v-else>You're at the top! Keep going!</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

interface LeaderboardUser {
  id: number
  name: string
  initials: string
  xp: number
  level: number
  isCurrentUser?: boolean
}

const authStore = useAuthStore()
const selectedPeriod = ref<'daily' | 'weekly' | 'monthly' | 'all'>('weekly')

const timePeriods = [
  { label: 'Daily', value: 'daily' as const },
  { label: 'Weekly', value: 'weekly' as const },
  { label: 'Monthly', value: 'monthly' as const },
  { label: 'All Time', value: 'all' as const },
]

const userInitials = computed(() => {
  const name = authStore.user?.name || authStore.user?.email?.split('@')[0] || 'GU'
  const parts = name.split(' ')
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
})

// Mock leaderboard data
const leaderboard = ref<LeaderboardUser[]>([
  { id: 1, name: 'Alex Johnson', initials: 'AJ', xp: 15420, level: 28 },
  { id: 2, name: 'Sarah Chen', initials: 'SC', xp: 14850, level: 26 },
  { id: 3, name: 'Michael Park', initials: 'MP', xp: 13200, level: 24 },
  { id: 4, name: 'Emily Davis', initials: 'ED', xp: 11500, level: 21 },
  { id: 5, name: 'You', initials: userInitials.value, xp: 8750, level: 15, isCurrentUser: true },
])

const currentUserRank = ref(5)
const currentUserXP = ref(8750)
const rankChange = ref(2) // Positive means moved up

const xpToNextRank = computed(() => {
  const userIndex = leaderboard.value.findIndex(u => u.isCurrentUser)
  if (userIndex <= 0) return 0
  return leaderboard.value[userIndex - 1].xp - currentUserXP.value
})

const getRankClass = (index: number) => {
  if (index === 0) return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (index === 1) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
  return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
}

const viewAll = () => {
  // Navigate to full leaderboard page
  console.log('View all leaderboard')
}
</script>
