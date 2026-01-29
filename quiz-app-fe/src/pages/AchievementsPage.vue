<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
            Achievements
          </h1>
          <p class="text-muted-foreground mt-2 text-base">
            Unlock badges and track your learning journey
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Share Button -->
          <button
            class="bg-secondary text-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-secondary/80"
            @click="handleShareAchievements"
          >
            <Share2 class="h-4 w-4" />
            Share
          </button>
          <!-- Stats Card -->
          <div class="bg-linear-to-r from-primary/10 to-chart-1/10 rounded-xl px-4 py-2 text-center">
            <p class="text-foreground text-2xl font-bold">{{ earnedCount }}</p>
            <p class="text-muted-foreground text-xs">of {{ achievementsData.achievements.length }} earned</p>
          </div>
        </div>
      </div>

      <!-- Achievement Stats Cards -->
      <AchievementStatsCards
        :total-points="totalPoints"
        :rarity-count="rarityCount"
        :recent-achievement="recentAchievement ?? null"
      />
    </div>

    <!-- Category Tabs -->
    <div class="animate-fade-in-up mb-6">
      <AchievementCategoryTabs
        v-model="selectedCategory"
        :achievements="achievementsData.achievements"
      />
    </div>

    <!-- Rarity Legend -->
    <div class="animate-fade-in-up mb-6">
      <RarityLegend />
    </div>

    <!-- Achievements Grid -->
    <div class="animate-fade-in-up delay-100">
      <AchievementsGrid
        :achievements="filteredAchievements"
        @select="openDetail"
      />
    </div>

    <!-- Leaderboard Preview -->
    <div class="animate-fade-in-up delay-200 mt-8">
      <LeaderboardPreview :users="leaderboard" />
    </div>

    <!-- Detail Modal -->
    <AchievementDetailModal
      :show="showModal"
      :achievement="selectedAchievement"
      @close="closeModal"
      @share="handleShareAchievement"
    />

    <!-- Share Toast -->
    <ShareToast :show="showShareToast" :message="toastMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Share2 } from 'lucide-vue-next'

import AchievementStatsCards from '@/components/achievements/AchievementStatsCards.vue'
import RarityLegend from '@/components/achievements/RarityLegend.vue'
import AchievementsGrid from '@/components/achievements/AchievementsGrid.vue'
import LeaderboardPreview from '@/components/achievements/LeaderboardPreview.vue'
import ShareToast from '@/components/achievements/ShareToast.vue'
import AchievementCategoryTabs from '@/components/profile/achievements/AchievementCategoryTabs.vue'
import AchievementDetailModal from '@/components/profile/achievements/AchievementDetailModal.vue'

import { useAchievements } from '@/composables'
import type { EnhancedAchievement } from '@/types/profile'

// Use composable
const {
  selectedCategory,
  selectedAchievement,
  showModal,
  achievementsData,
  leaderboard,
  openDetail,
  closeModal,
  filteredAchievements,
  earnedCount,
  totalPoints,
  rarityCount,
  recentAchievement,
} = useAchievements()

// Local state for toast
const showShareToast = ref(false)
const toastMessage = ref('Link copied to clipboard!')

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showShareToast.value = true
    setTimeout(() => {
      showShareToast.value = false
    }, 3000)
  } catch {
    console.error('Failed to copy')
  }
}

const handleShareAchievements = async () => {
  const text = `I've earned ${earnedCount.value} achievements (${totalPoints.value} pts) on StudySpark!`
  toastMessage.value = 'Link copied to clipboard!'
  await copyToClipboard(text)
}

const handleShareAchievement = async (achievement: EnhancedAchievement) => {
  const text = `I just earned "${achievement.name}" on StudySpark!`
  toastMessage.value = 'Achievement shared!'
  await copyToClipboard(text)
  closeModal()
}
</script>
