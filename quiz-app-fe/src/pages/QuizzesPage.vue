<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-foreground text-3xl font-bold tracking-tight lg:text-4xl">Quiz Games</h1>
          <p class="text-muted-foreground mt-2 text-lg">Challenge yourself and learn English through fun games</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-card border-border flex items-center gap-2 rounded-xl border px-4 py-2">
            <Flame class="text-primary h-5 w-5" />
            <span class="text-foreground font-semibold">{{ userStats.streak }} day streak</span>
          </div>
          <div class="bg-card border-border flex items-center gap-2 rounded-xl border px-4 py-2">
            <Zap class="text-primary h-5 w-5" />
            <span class="text-foreground font-semibold">{{ userStats.xp }} XP</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      <div class="bg-card border-border rounded-2xl border p-5 transition-all hover:shadow-lg">
        <div class="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
          <Trophy class="text-primary h-6 w-6" />
        </div>
        <span class="text-foreground text-2xl font-bold">{{ userStats.totalGames }}</span>
        <p class="text-muted-foreground mt-1 text-sm">Games Played</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5 transition-all hover:shadow-lg">
        <div class="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
          <Target class="text-primary h-6 w-6" />
        </div>
        <span class="text-foreground text-2xl font-bold">{{ userStats.accuracy }}%</span>
        <p class="text-muted-foreground mt-1 text-sm">Accuracy</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5 transition-all hover:shadow-lg">
        <div class="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
          <Award class="text-primary h-6 w-6" />
        </div>
        <span class="text-foreground text-2xl font-bold">{{ userStats.badges }}</span>
        <p class="text-muted-foreground mt-1 text-sm">Badges Earned</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5 transition-all hover:shadow-lg">
        <div class="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
          <Clock class="text-primary h-6 w-6" />
        </div>
        <span class="text-foreground text-2xl font-bold">{{ userStats.totalTime }}h</span>
        <p class="text-muted-foreground mt-1 text-sm">Time Played</p>
      </div>
    </div>

    <!-- Game Modes Grid -->
    <div class="animate-fade-in-up delay-200 mb-8">
      <h2 class="text-foreground mb-5 flex items-center gap-2 text-xl font-semibold">
        <Gamepad2 class="text-primary h-6 w-6" />
        Choose Your Game
      </h2>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <QuizModeCard
          v-for="(mode, index) in quizModes"
          :key="mode.id"
          :mode="mode"
          :index="index"
          @click="startQuiz(mode.id)"
        />
      </div>
    </div>

    <!-- Recent Activity & Leaderboard -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <!-- Recent Games -->
      <div class="animate-fade-in-up delay-300">
        <div class="bg-card border-border rounded-2xl border p-6">
          <h3 class="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <History class="text-primary h-5 w-5" />
            Recent Games
          </h3>
          <div class="space-y-3">
            <div
              v-for="game in recentGames"
              :key="game.id"
              class="bg-secondary/50 flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-secondary"
            >
              <div class="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl">
                <component :is="game.icon" class="text-primary h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-foreground font-medium">{{ game.mode }}</h4>
                <p class="text-muted-foreground text-sm">{{ game.date }}</p>
              </div>
              <div class="text-right">
                <p class="text-foreground font-semibold">{{ game.score }} pts</p>
                <p class="text-muted-foreground text-sm">{{ game.accuracy }}% accuracy</p>
              </div>
            </div>
            <div v-if="recentGames.length === 0" class="text-muted-foreground py-8 text-center">
              No games played yet. Start your first quiz!
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="animate-fade-in-up delay-400">
        <div class="bg-card border-border rounded-2xl border p-6">
          <h3 class="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <Medal class="text-primary h-5 w-5" />
            Weekly Leaderboard
          </h3>
          <div class="space-y-3">
            <div
              v-for="entry in leaderboard"
              :key="entry.rank"
              class="flex items-center gap-4 rounded-xl p-3 transition-colors"
              :class="entry.rank <= 3 ? 'bg-primary/5' : 'bg-secondary/50'"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg font-bold"
                :class="getRankClass(entry.rank)"
              >
                {{ entry.rank }}
              </div>
              <div class="bg-secondary flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
                <span class="text-foreground font-medium">{{ entry.username.charAt(0) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-foreground font-medium">{{ entry.username }}</h4>
                <p class="text-muted-foreground text-sm">{{ entry.accuracy }}% accuracy</p>
              </div>
              <div class="text-right">
                <p class="text-foreground font-bold">{{ entry.score.toLocaleString() }}</p>
                <p class="text-muted-foreground text-xs">points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
import { useRouter } from 'vue-router'
import {
  Flame,
  Zap,
  Trophy,
  Target,
  Award,
  Clock,
  Gamepad2,
  History,
  Medal,
  CircleHelp,
  Shuffle,
  Link,
  Timer,
  CircleCheck,
} from 'lucide-vue-next'
import QuizModeCard from '@/components/quiz/QuizModeCard.vue'
import type { QuizMode, LeaderboardEntry } from '@/types/quiz'

const router = useRouter()

// User stats
const userStats = ref({
  streak: 7,
  xp: 2450,
  totalGames: 45,
  accuracy: 78,
  badges: 12,
  totalTime: 8,
})

// Quiz modes
const quizModes = ref<QuizMode[]>([
  {
    id: 'multiple-choice',
    title: 'Multiple Choice',
    description: 'Classic quiz with 4 options. Test your vocabulary and grammar knowledge.',
    icon: CircleHelp,
    difficulty: 'easy',
    estimatedTime: '5 min',
    questionsCount: 10,
    color: 'primary',
  },
  {
    id: 'word-scramble',
    title: 'Word Scramble',
    description: 'Unscramble the letters to form the correct English word.',
    icon: Shuffle,
    difficulty: 'medium',
    estimatedTime: '7 min',
    questionsCount: 10,
    color: 'primary',
  },
  {
    id: 'matching-pairs',
    title: 'Matching Pairs',
    description: 'Match words with their meanings. Train your memory and vocabulary.',
    icon: Link,
    difficulty: 'medium',
    estimatedTime: '5 min',
    questionsCount: 8,
    color: 'primary',
  },
  {
    id: 'speed-round',
    title: 'Speed Round',
    description: 'Answer as fast as you can! Higher speed means higher score.',
    icon: Timer,
    difficulty: 'hard',
    estimatedTime: '3 min',
    questionsCount: 15,
    color: 'primary',
  },
  {
    id: 'true-false',
    title: 'True or False',
    description: 'Quick decisions! Is the statement correct or not?',
    icon: CircleCheck,
    difficulty: 'easy',
    estimatedTime: '4 min',
    questionsCount: 12,
    color: 'primary',
  },
])

// Recent games
interface RecentGame {
  id: number
  mode: string
  icon: Component
  score: number
  accuracy: number
  date: string
}

const recentGames = ref<RecentGame[]>([
  { id: 1, mode: 'Multiple Choice', icon: CircleHelp, score: 850, accuracy: 85, date: '2 hours ago' },
  { id: 2, mode: 'Word Scramble', icon: Shuffle, score: 720, accuracy: 72, date: '5 hours ago' },
  { id: 3, mode: 'Speed Round', icon: Timer, score: 1200, accuracy: 80, date: 'Yesterday' },
])

// Leaderboard
const leaderboard = ref<LeaderboardEntry[]>([
  { rank: 1, username: 'ProLearner', avatar: '', score: 15420, accuracy: 94, time: 0 },
  { rank: 2, username: 'WordMaster', avatar: '', score: 14350, accuracy: 91, time: 0 },
  { rank: 3, username: 'QuizKing', avatar: '', score: 13800, accuracy: 89, time: 0 },
  { rank: 4, username: 'StudyStar', avatar: '', score: 12500, accuracy: 85, time: 0 },
  { rank: 5, username: 'LearnFast', avatar: '', score: 11200, accuracy: 82, time: 0 },
])

const getRankClass = (rank: number): string => {
  if (rank === 1) return 'bg-primary text-primary-foreground'
  if (rank === 2) return 'bg-secondary text-secondary-foreground'
  if (rank === 3) return 'bg-secondary text-secondary-foreground'
  return 'bg-muted text-muted-foreground'
}

const startQuiz = (modeId: string) => {
  router.push(`/quizzes/${modeId}`)
}
</script>
