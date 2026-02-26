<template>
  <div class="p-6 lg:p-8">
    <!-- Welcome Section -->
    <div class="animate-fade-in-down mb-6">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
        {{ $t('dashboard.welcome', { name: userName }) }}
      </h1>
      <p class="text-muted-foreground mt-2 text-base">{{ $t('dashboard.subtitle') }}</p>
    </div>

    <!-- Quick Actions Bar -->
    <div class="animate-fade-in-up delay-50 mb-6">
      <QuickActionsBar @action="handleQuickAction" />
    </div>

    <!-- Stats Row -->
    <div class="animate-fade-in-up delay-100 mb-6">
      <DashboardStatsRow :stats="stats" />
    </div>

    <!-- XP Level Card -->
    <div class="animate-fade-in-up delay-150 mb-6">
      <XPLevelCard :totalXP="stats.totalXP" />
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
      <!-- Left Column -->
      <div class="space-y-6 xl:col-span-2 xl:space-y-8">
        <!-- Daily Challenges -->
        <div class="animate-fade-in-up delay-200">
          <DailyChallengesCard @claim-reward="handleClaimReward" />
        </div>

        <!-- Today's Goal -->
        <div class="animate-fade-in-up delay-250">
          <TodayGoalCard :progress="todayProgress" :goal="todayGoal" />
        </div>

        <!-- Continue Learning -->
        <div class="animate-fade-in-up delay-300">
          <ContinueLearningCard
            :courses="continueLearning"
            :is-loading="isLoading"
            @view-all="navigateToCourses"
            @open-course="openCourse"
          />
        </div>

        <!-- Recent Flashcards -->
        <div class="animate-fade-in-up delay-350">
          <RecentFlashcardsCard
            :flashcards="recentFlashcards"
            :is-loading="isLoading"
            @view-all="navigateToFlashcards"
            @open-flashcard="openFlashcard"
          />
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6 xl:space-y-8">
        <!-- Study Modes -->
        <div class="animate-fade-in-up delay-200">
          <StudyModesCard :modes="studyModes" @select-mode="selectStudyMode" />
        </div>

        <!-- Weekly Activity -->
        <div class="animate-fade-in-up delay-250">
          <WeeklyActivityCard :activity="weeklyActivity" />
        </div>

        <!-- Leaderboard -->
        <div class="animate-fade-in-up delay-300">
          <LeaderboardCard />
        </div>

        <!-- Achievements -->
        <div class="animate-fade-in-up delay-350">
          <RecentBadgesCard :badges="recentBadges" />
        </div>
      </div>
    </div>

    <!-- Celebration Modal -->
    <CelebrationModal
      :show="showCelebration"
      :type="celebrationType"
      :title="celebrationTitle"
      :subtitle="celebrationSubtitle"
      :rewards="celebrationRewards"
      :badge="celebrationBadge"
      @close="showCelebration = false"
      @primary="showCelebration = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useProgressStore } from '@/stores/progress.store'
import {
  Brain,
  Timer,
  Shuffle,
  Star,
  Medal,
  Crown,
  Rocket,
  BookOpen,
  Languages,
  Headphones,
  Layers,
} from 'lucide-vue-next'

import DashboardStatsRow from '@/components/dashboard/DashboardStatsRow.vue'
import TodayGoalCard from '@/components/dashboard/TodayGoalCard.vue'
import ContinueLearningCard from '@/components/dashboard/ContinueLearningCard.vue'
import RecentFlashcardsCard from '@/components/dashboard/RecentFlashcardsCard.vue'
import StudyModesCard from '@/components/dashboard/StudyModesCard.vue'
import WeeklyActivityCard from '@/components/dashboard/WeeklyActivityCard.vue'
import RecentBadgesCard from '@/components/dashboard/RecentBadgesCard.vue'
import XPLevelCard from '@/components/dashboard/XPLevelCard.vue'
import DailyChallengesCard from '@/components/dashboard/DailyChallengesCard.vue'
import QuickActionsBar from '@/components/dashboard/QuickActionsBar.vue'
import LeaderboardCard from '@/components/dashboard/LeaderboardCard.vue'
import CelebrationModal from '@/components/ui/CelebrationModal.vue'

import type {
  DashboardStats,
  DashboardCourse,
  DashboardFlashcard,
  StudyMode,
  DayActivity,
  BadgeItem,
} from '@/types/dashboard'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const progressStore = useProgressStore()

// User data - use email from auth store or fallback to 'Guest'
const userName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]
  return 'Guest'
})

// Stats — live from progress store
const stats = computed<DashboardStats>(() => ({
  streak: progressStore.streakCount,
  cardsLearned: progressStore.totalCardsStudied,
  quizzesCompleted: progressStore.totalQuizzesCompleted,
  totalXP: progressStore.xp,
}))

// Celebration Modal
const showCelebration = ref(false)
const celebrationType = ref<'success' | 'achievement' | 'levelup' | 'streak'>('success')
const celebrationTitle = ref('')
const celebrationSubtitle = ref('')
const celebrationRewards = ref<{ value: string | number; label: string }[]>([])
const celebrationBadge = ref<string | undefined>(undefined)

// Today's goal
const todayProgress = computed(() => progressStore.todayCards)
const todayGoal = ref(20)

// Loading state
const isLoading = computed(() => progressStore.isLoading)

// Continue Learning data
const continueLearning = ref<DashboardCourse[]>([
  { id: 1, title: 'English Grammar Basics', progress: 68, icon: BookOpen },
  { id: 2, title: 'English Vocabulary Builder', progress: 45, icon: Languages },
  { id: 3, title: 'English Listening Practice', progress: 32, icon: Headphones },
])

// Recent Flashcards
const recentFlashcards = ref<DashboardFlashcard[]>([
  { id: 1, question: 'What does "ubiquitous" mean?', difficulty: 'Medium', lastStudied: '2 hours ago' },
  { id: 2, question: 'What is the past tense of "teach"?', difficulty: 'Easy', lastStudied: '5 hours ago' },
  { id: 3, question: 'What does the idiom "break the ice" mean?', difficulty: 'Hard', lastStudied: '1 day ago' },
  { id: 4, question: 'Choose the correct form: "She ___ to school every day"', difficulty: 'Medium', lastStudied: '2 days ago' },
])

// Study Modes - linked to actual pages
const studyModes = ref<StudyMode[]>([
  { id: 1, title: 'Flashcards', description: 'Classic study mode', icon: Layers, path: '/flashcards' },
  { id: 2, title: 'Quiz Mode', description: 'Test your knowledge', icon: Brain, path: '/quizzes' },
  { id: 3, title: 'Speed Round', description: 'Race against time', icon: Timer, path: '/quizzes/speed-round' },
  { id: 4, title: 'Multiple Choice', description: 'Select answers', icon: Shuffle, path: '/quizzes/multiple-choice' },
])

// Weekly Activity — from progress store
const weeklyActivity = computed<DayActivity[]>(() =>
  progressStore.weeklyActivity.map(d => ({
    name: d.day_label.charAt(0),
    percent: Math.min(d.xp_earned, 100),
  }))
)

// Recent Badges
const recentBadges = ref<BadgeItem[]>([
  { id: 1, name: 'First Steps', icon: Star },
  { id: 2, name: 'Quiz Master', icon: Medal },
  { id: 3, name: 'Week Warrior', icon: Crown },
  { id: 4, name: 'Speed Demon', icon: Rocket },
])

// Navigation actions
const navigateToCourses = () => {
  router.push('/courses')
}

const openCourse = (id: number) => {
  router.push(`/courses/${id}`)
}

const navigateToFlashcards = () => {
  router.push('/flashcards')
}

const openFlashcard = (id: number) => {
  router.push(`/flashcards/${id}`)
}

const selectStudyMode = (id: number) => {
  const mode = studyModes.value.find(m => m.id === id)
  if (mode?.path) {
    router.push(mode.path)
  }
}

// Quick actions handler
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'flashcard':
      router.push('/flashcards')
      break
    case 'quiz':
      router.push('/quizzes')
      break
    case 'course':
      router.push('/courses')
      break
    case 'goal':
      router.push('/goals')
      break
  }
}

// Claim reward handler
const handleClaimReward = (_challengeId: number, xpReward: number) => {
  celebrationType.value = 'success'
  celebrationTitle.value = 'Challenge Complete!'
  celebrationSubtitle.value = 'Great job completing your daily challenge!'
  celebrationRewards.value = [
    { value: `+${xpReward}`, label: 'XP Earned' },
    { value: (progressStore.xp + xpReward).toLocaleString(), label: 'Total XP' },
  ]
  celebrationBadge.value = undefined
  showCelebration.value = true
}

onMounted(() => {
  progressStore.fetchProgress()
  progressStore.fetchWeekly()
  progressStore.fetchLeaderboard()
})
</script>
