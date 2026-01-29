<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <h3 class="text-foreground mb-6 flex items-center gap-2 font-semibold">
      <BarChart3 class="text-primary h-5 w-5" />
      Learning Statistics
    </h3>

    <div class="space-y-6">
      <!-- Top section: Progress Ring + Summary Grid -->
      <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
        <!-- Progress Ring -->
        <div class="flex justify-center sm:justify-start">
          <ProgressRing
            :percentage="statistics.weeklyProgress.percentage"
            :current="statistics.weeklyProgress.current"
            :target="statistics.weeklyProgress.target"
            label="Weekly Goal"
            :size="140"
            :stroke-width="10"
          />
        </div>

        <!-- Summary Grid -->
        <div class="flex-1">
          <LearningSummaryGrid :summary="statistics.learningSummary" />
        </div>
      </div>

      <!-- Weekly Activity Chart -->
      <div class="border-border border-t pt-6">
        <WeeklyActivityChart :activity="statistics.weeklyActivity" />
      </div>

      <!-- Streak Calendar -->
      <div class="border-border border-t pt-6">
        <StreakCalendar
          :streak-days="statistics.streakDays"
          :current-streak="statistics.currentStreak"
          :longest-streak="statistics.longestStreak"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'
import type { ProfileStatistics } from '@/types/profile'

import ProgressRing from './ProgressRing.vue'
import LearningSummaryGrid from './LearningSummaryGrid.vue'
import WeeklyActivityChart from './WeeklyActivityChart.vue'
import StreakCalendar from './StreakCalendar.vue'

interface Props {
  statistics: ProfileStatistics
}

defineProps<Props>()
</script>
