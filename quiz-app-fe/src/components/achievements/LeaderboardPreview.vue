<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <div class="mb-5 flex items-center justify-between">
      <h3 class="text-foreground flex items-center gap-2 font-semibold">
        <Medal class="text-chart-1 h-5 w-5" />
        XP Leaderboard
      </h3>
      <span class="bg-chart-1/10 text-chart-1 rounded-full px-2.5 py-1 text-xs font-medium">Live Rankings</span>
    </div>

    <!-- Empty state -->
    <div v-if="!users.length" class="py-10 text-center">
      <Trophy class="text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-40" />
      <p class="text-muted-foreground text-sm">No rankings yet — start studying to appear here!</p>
    </div>

    <template v-else>
      <!-- Podium for top 3 -->
      <div v-if="users.length >= 3" class="mb-5 flex items-end justify-center gap-3">
        <!-- 2nd place -->
        <div class="flex flex-col items-center gap-1.5">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            :class="isMe(users[1]) ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : 'bg-secondary text-foreground'"
          >
            {{ getInitial(users[1]) }}
          </div>
          <div class="bg-chart-2/15 flex h-14 w-20 flex-col items-center justify-center rounded-t-lg border-t-2 border-chart-2/40">
            <p class="text-chart-2 text-xl font-bold leading-none">2</p>
            <p class="text-muted-foreground mt-0.5 text-xs">{{ users[1].xp.toLocaleString() }} XP</p>
          </div>
        </div>

        <!-- 1st place -->
        <div class="flex flex-col items-center gap-1.5">
          <Crown class="text-chart-1 h-5 w-5" />
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold"
            :class="isMe(users[0]) ? 'bg-primary text-primary-foreground ring-2 ring-chart-1 ring-offset-2' : 'bg-chart-1 text-white'"
          >
            {{ getInitial(users[0]) }}
          </div>
          <div class="bg-chart-1/15 flex h-20 w-20 flex-col items-center justify-center rounded-t-lg border-t-2 border-chart-1/40">
            <p class="text-chart-1 text-2xl font-bold leading-none">1</p>
            <p class="text-muted-foreground mt-0.5 text-xs">{{ users[0].xp.toLocaleString() }} XP</p>
          </div>
        </div>

        <!-- 3rd place -->
        <div class="flex flex-col items-center gap-1.5">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            :class="isMe(users[2]) ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : 'bg-secondary text-foreground'"
          >
            {{ getInitial(users[2]) }}
          </div>
          <div class="bg-chart-4/15 flex h-10 w-20 flex-col items-center justify-center rounded-t-lg border-t-2 border-chart-4/40">
            <p class="text-chart-4 text-xl font-bold leading-none">3</p>
            <p class="text-muted-foreground mt-0.5 text-xs">{{ users[2].xp.toLocaleString() }} XP</p>
          </div>
        </div>
      </div>

      <!-- Ranked list (top 5) -->
      <div class="space-y-1.5">
        <div
          v-for="user in users.slice(0, 5)"
          :key="user.user_id"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
          :class="isMe(user) ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-secondary/50'"
        >
          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="getRankClass(user.rank - 1)"
          >
            {{ user.rank }}
          </div>
          <div class="bg-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
            {{ getInitial(user) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-foreground truncate text-sm font-medium">
              {{ user.display_name || user.email }}
              <span v-if="isMe(user)" class="text-primary text-xs"> (You)</span>
            </p>
            <p class="text-muted-foreground text-xs">Lv.{{ user.level }} · {{ user.streak_count }} day streak</p>
          </div>
          <div class="text-right">
            <p class="text-foreground text-sm font-bold">{{ user.xp.toLocaleString() }}</p>
            <p class="text-muted-foreground text-xs">XP</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Medal, Crown, Trophy } from 'lucide-vue-next'
import type { LeaderboardItem } from '@/stores/progress.store'

const props = defineProps<{
  users: LeaderboardItem[]
  currentUserId?: number
}>()

const isMe = (user: LeaderboardItem) =>
  props.currentUserId !== undefined && user.user_id === props.currentUserId

const getInitial = (user: LeaderboardItem): string =>
  (user.display_name || user.email || '?').charAt(0).toUpperCase()

const getRankClass = (index: number): string => {
  if (index === 0) return 'bg-chart-1 text-white'
  if (index === 1) return 'bg-chart-2 text-white'
  if (index === 2) return 'bg-chart-4 text-white'
  return 'bg-secondary text-foreground'
}
</script>
