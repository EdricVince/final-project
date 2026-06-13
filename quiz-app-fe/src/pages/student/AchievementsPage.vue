<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">Achievements</h1>
          <p class="text-muted-foreground mt-1 text-base">Unlock badges and compete with other learners</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="bg-secondary text-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-secondary/80"
            @click="handleShareAchievements"
          >
            <Share2 class="h-4 w-4" />
            Share
          </button>
          <div class="bg-linear-to-r from-primary/10 to-chart-1/10 rounded-xl px-4 py-2 text-center">
            <p class="text-foreground text-2xl font-bold">{{ earnedCount }}</p>
            <p class="text-muted-foreground text-xs">of {{ achievementsData.achievements.length }} earned</p>
          </div>
        </div>
      </div>

      <AchievementStatsCards
        :total-points="totalPoints"
        :rarity-count="rarityCount"
        :recent-achievement="recentAchievement ?? null"
      />
    </div>

    <!-- Leaderboard — competitive section, shown first -->
    <div class="animate-fade-in-up mb-8">
      <LeaderboardPreview
        :users="progressStore.leaderboard"
        :current-user-id="authStore.currentUser?.id"
      />
    </div>

    <!-- Category Tabs -->
    <div class="animate-fade-in-up mb-4">
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
      <AchievementsGrid :achievements="filteredAchievements" @select="openDetail" />
    </div>

    <!-- Detail Modal -->
    <AchievementDetailModal
      :show="showModal"
      :achievement="selectedAchievement"
      @close="closeModal"
      @share="handleShareAchievement"
    />

    <ShareToast :show="showShareToast" :message="toastMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Share2 } from '@/components/icons'

import AchievementStatsCards from '@/components/achievements/AchievementStatsCards.vue'
import RarityLegend from '@/components/achievements/RarityLegend.vue'
import AchievementsGrid from '@/components/achievements/AchievementsGrid.vue'
import LeaderboardPreview from '@/components/achievements/LeaderboardPreview.vue'
import ShareToast from '@/components/achievements/ShareToast.vue'
import AchievementCategoryTabs from '@/components/achievements/AchievementCategoryTabs.vue'
import AchievementDetailModal from '@/components/achievements/AchievementDetailModal.vue'

import { useAchievements } from '@/composables'
import { useProgressStore } from '@/stores/progress.store'
import { useAuthStore } from '@/stores/auth.store'
import type { EnhancedAchievement } from '@/types/profile'

const progressStore = useProgressStore()
const authStore = useAuthStore()

const {
  selectedCategory,
  selectedAchievement,
  showModal,
  achievementsData,
  openDetail,
  closeModal,
  filteredAchievements,
  earnedCount,
  totalPoints,
  rarityCount,
  recentAchievement,
} = useAchievements()

const showShareToast = ref(false)
const toastMessage = ref('Link copied to clipboard!')

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showShareToast.value = true
    setTimeout(() => { showShareToast.value = false }, 3000)
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
