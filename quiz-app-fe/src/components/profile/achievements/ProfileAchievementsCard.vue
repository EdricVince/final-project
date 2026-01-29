<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-foreground flex items-center gap-2 font-semibold">
        <Trophy class="text-primary h-5 w-5" />
        Achievements
      </h3>
      <span class="text-muted-foreground text-sm">
        {{ earnedCount }}/{{ data.achievements.length }}
      </span>
    </div>

    <!-- Category Tabs -->
    <div class="mb-4">
      <AchievementCategoryTabs
        v-model="selectedCategory"
        :achievements="data.achievements"
      />
    </div>

    <!-- Rarity Legend -->
    <div class="mb-4 flex flex-wrap items-center gap-3 text-xs">
      <div class="flex items-center gap-1.5">
        <span class="bg-muted-foreground h-2 w-2 rounded-full" />
        <span class="text-muted-foreground">Common</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="bg-chart-2 h-2 w-2 rounded-full" />
        <span class="text-muted-foreground">Rare</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="bg-chart-4 h-2 w-2 rounded-full" />
        <span class="text-muted-foreground">Epic</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="bg-chart-1 h-2 w-2 rounded-full" />
        <span class="text-muted-foreground">Legendary</span>
      </div>
    </div>

    <!-- Achievements Grid -->
    <div class="flex flex-wrap gap-3">
      <AchievementBadge
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        :achievement="achievement"
        @click="openDetail"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredAchievements.length === 0"
      class="py-8 text-center"
    >
      <p class="text-muted-foreground text-sm">No achievements in this category yet</p>
    </div>

    <!-- Detail Modal -->
    <AchievementDetailModal
      :show="showModal"
      :achievement="selectedAchievement"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Trophy } from 'lucide-vue-next'
import type { ProfileAchievements, EnhancedAchievement, AchievementCategory } from '@/types/profile'

import AchievementBadge from './AchievementBadge.vue'
import AchievementCategoryTabs from './AchievementCategoryTabs.vue'
import AchievementDetailModal from './AchievementDetailModal.vue'

interface Props {
  data: ProfileAchievements
}

const props = defineProps<Props>()

const selectedCategory = ref<AchievementCategory | 'all'>('all')
const showModal = ref(false)
const selectedAchievement = ref<EnhancedAchievement | null>(null)

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.data.achievements
  }
  return props.data.achievements.filter((a) => a.category === selectedCategory.value)
})

const earnedCount = computed(() => {
  return props.data.achievements.filter((a) => a.earned).length
})

const openDetail = (achievement: EnhancedAchievement) => {
  selectedAchievement.value = achievement
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedAchievement.value = null
}
</script>
