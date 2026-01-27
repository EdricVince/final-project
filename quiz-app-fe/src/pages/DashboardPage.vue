<template>
  <div class="p-6 lg:p-8">
    <!-- Welcome Section -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
        Welcome back, {{ userName }}!
      </h1>
      <p class="text-muted-foreground mt-2 text-base">Ready to continue your learning journey?</p>
    </div>

    <!-- Stats Row -->
    <div class="animate-fade-in-up delay-100 mb-8">
      <DashboardStatsRow :stats="stats" />
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
      <!-- Left Column -->
      <div class="space-y-6 xl:col-span-2 xl:space-y-8">
        <!-- Today's Goal -->
        <div class="animate-fade-in-up delay-150">
          <TodayGoalCard :progress="todayProgress" :goal="todayGoal" />
        </div>

        <!-- Continue Learning -->
        <div class="animate-fade-in-up delay-200">
          <ContinueLearningCard
            :courses="continueLearning"
            :is-loading="isLoading"
            @view-all="navigateToCourses"
            @open-course="openCourse"
          />
        </div>

        <!-- Recent Flashcards -->
        <div class="animate-fade-in-up delay-300">
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
        <div class="animate-fade-in-up delay-300">
          <WeeklyActivityCard :activity="weeklyActivity" />
        </div>

        <!-- Achievements -->
        <div class="animate-fade-in-up delay-400">
          <RecentBadgesCard :badges="recentBadges" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Brain,
  Timer,
  Shuffle,
  Star,
  Medal,
  Crown,
  Rocket,
  Code,
  Languages,
  Calculator,
  Layers,
} from 'lucide-vue-next'

import DashboardStatsRow from '@/components/dashboard/DashboardStatsRow.vue'
import TodayGoalCard from '@/components/dashboard/TodayGoalCard.vue'
import ContinueLearningCard from '@/components/dashboard/ContinueLearningCard.vue'
import RecentFlashcardsCard from '@/components/dashboard/RecentFlashcardsCard.vue'
import StudyModesCard from '@/components/dashboard/StudyModesCard.vue'
import WeeklyActivityCard from '@/components/dashboard/WeeklyActivityCard.vue'
import RecentBadgesCard from '@/components/dashboard/RecentBadgesCard.vue'

import type {
  DashboardStats,
  DashboardCourse,
  DashboardFlashcard,
  StudyMode,
  DayActivity,
  BadgeItem,
} from '@/types/dashboard'

const router = useRouter()

// User data
const userName = ref('Alex')

// Stats
const stats = ref<DashboardStats>({
  streak: 7,
  cardsLearned: 156,
  quizzesCompleted: 23,
  totalXP: 2450,
})

// Today's goal
const todayProgress = ref(15)
const todayGoal = ref(20)

// Loading state
const isLoading = ref(true)

// Continue Learning data
const continueLearning = ref<DashboardCourse[]>([
  { id: 1, title: 'JavaScript Fundamentals', progress: 68, icon: Code },
  { id: 2, title: 'Spanish Vocabulary', progress: 45, icon: Languages },
  { id: 3, title: 'Advanced Mathematics', progress: 32, icon: Calculator },
])

// Recent Flashcards
const recentFlashcards = ref<DashboardFlashcard[]>([
  { id: 1, question: 'What is a closure in JavaScript?', difficulty: 'Medium', lastStudied: '2 hours ago' },
  { id: 2, question: 'Explain the difference between let and const', difficulty: 'Easy', lastStudied: '5 hours ago' },
  { id: 3, question: 'What is the event loop?', difficulty: 'Hard', lastStudied: '1 day ago' },
  { id: 4, question: 'How does prototypal inheritance work?', difficulty: 'Medium', lastStudied: '2 days ago' },
])

// Study Modes
const studyModes = ref<StudyMode[]>([
  { id: 1, title: 'Flashcards', description: 'Classic study mode', icon: Layers },
  { id: 2, title: 'Quiz Mode', description: 'Test your knowledge', icon: Brain },
  { id: 3, title: 'Speed Round', description: 'Race against time', icon: Timer },
  { id: 4, title: 'Shuffle', description: 'Random practice', icon: Shuffle },
])

// Weekly Activity
const weeklyActivity = ref<DayActivity[]>([
  { name: 'M', percent: 60 },
  { name: 'T', percent: 80 },
  { name: 'W', percent: 45 },
  { name: 'T', percent: 90 },
  { name: 'F', percent: 70 },
  { name: 'S', percent: 30 },
  { name: 'S', percent: 55 },
])

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
  if (mode) {
    router.push(`/study/${mode.title.toLowerCase().replace(' ', '-')}`)
  }
}

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})
</script>
