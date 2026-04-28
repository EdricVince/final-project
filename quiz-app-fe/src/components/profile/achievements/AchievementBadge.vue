<template>
  <button
    class="group relative focus:outline-none"
    @click="$emit('click', achievement)"
  >
    <!-- Badge container -->
    <div
      class="flex h-14 w-14 items-center justify-center rounded-xl border-2 transition-all duration-300 group-hover:scale-110"
      :class="getBadgeClasses()"
    >
      <component
        :is="achievement.icon"
        class="h-6 w-6 transition-colors"
        :class="getIconClasses()"
      />
    </div>

    <!-- Rarity glow effect for legendary -->
    <div
      v-if="achievement.earned && achievement.rarity === 'legendary'"
      class="bg-chart-1/20 absolute inset-0 -z-10 animate-pulse rounded-xl blur-md"
    />

    <!-- Progress indicator for unearned -->
    <div
      v-if="!achievement.earned && achievement.progress !== undefined"
      class="absolute -bottom-1 left-1/2 -translate-x-1/2"
    >
      <div class="bg-secondary h-1 w-10 overflow-hidden rounded-full">
        <div
          class="bg-muted-foreground h-full rounded-full transition-all"
          :style="{ width: `${getProgressPercent()}%` }"
        />
      </div>
    </div>

    <!-- Tooltip - removed -->


    <!-- Rarity indicator -->
    <div
      v-if="achievement.earned"
      class="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-card"
      :class="getRarityDotClasses()"
    />
  </button>
</template>

<script setup lang="ts">
import type { EnhancedAchievement } from '@/types/profile'

interface Props {
  achievement: EnhancedAchievement
}

const props = defineProps<Props>()

defineEmits<{
  click: [achievement: EnhancedAchievement]
}>()

const getBadgeClasses = (): string => {
  if (!props.achievement.earned) {
    return 'bg-secondary border-border opacity-50'
  }

  const rarityClasses: Record<string, string> = {
    common: 'bg-secondary border-border',
    rare: 'bg-chart-2/10 border-chart-2',
    epic: 'bg-chart-4/10 border-chart-4',
    legendary: 'bg-chart-1/10 border-chart-1',
  }

  return rarityClasses[props.achievement.rarity] || rarityClasses.common
}

const getIconClasses = (): string => {
  if (!props.achievement.earned) {
    return 'text-muted-foreground'
  }

  const rarityClasses: Record<string, string> = {
    common: 'text-foreground',
    rare: 'text-chart-2',
    epic: 'text-chart-4',
    legendary: 'text-chart-1',
  }

  return rarityClasses[props.achievement.rarity] || rarityClasses.common
}

const getRarityDotClasses = (): string => {
  const rarityClasses: Record<string, string> = {
    common: 'bg-muted-foreground',
    rare: 'bg-chart-2',
    epic: 'bg-chart-4',
    legendary: 'bg-chart-1',
  }

  return rarityClasses[props.achievement.rarity] || rarityClasses.common
}

const getProgressPercent = (): number => {
  if (!props.achievement.progress || !props.achievement.target) return 0
  return Math.min((props.achievement.progress / props.achievement.target) * 100, 100)
}
</script>
