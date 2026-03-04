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

    <!-- Section 1: Assigned by Teacher -->
    <div class="animate-fade-in-up delay-150 mb-8">
      <h2 class="text-foreground mb-5 flex items-center gap-2 text-xl font-semibold">
        <BookOpen class="text-primary h-6 w-6" />
        Bài Giáo Viên Giao
      </h2>
      <div class="bg-card border-border rounded-2xl border p-10 flex flex-col items-center justify-center text-center">
        <div class="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <BookOpen class="text-muted-foreground h-8 w-8" />
        </div>
        <h3 class="text-foreground mb-2 text-lg font-semibold">Chưa có bài được giao</h3>
        <p class="text-muted-foreground max-w-md text-sm">
          Giáo viên chưa giao bài nào. Các bài tập sẽ xuất hiện ở đây khi được giao.
        </p>
      </div>
    </div>

    <!-- Section 2: Practice Games -->
    <div class="animate-fade-in-up delay-200 mb-8">
      <h2 class="text-foreground mb-2 flex items-center gap-2 text-xl font-semibold">
        <Gamepad2 class="text-primary h-6 w-6" />
        Luyện Tập
      </h2>
      <p class="text-muted-foreground mb-5 text-sm">
        Chơi game với từ vựng ngẫu nhiên — kết quả hiện nghĩa bằng ngôn ngữ của bạn
      </p>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <QuizModeCard
          v-for="(mode, index) in quizModes"
          :key="mode.id"
          :mode="mode"
          :index="index"
          @click="startPractice(mode.id)"
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
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Medal class="text-primary h-5 w-5" />
              Leaderboard
            </h3>
            <div class="flex items-center gap-2">
              <button
                class="hover:bg-secondary rounded-lg p-1.5 transition-colors"
                @click="changeWeek(-1)"
              >
                <ChevronLeft class="text-muted-foreground h-4 w-4" />
              </button>
              <span class="text-muted-foreground text-sm font-medium">{{ weekLabel }}</span>
              <button
                class="hover:bg-secondary rounded-lg p-1.5 transition-colors"
                :disabled="currentWeekOffset >= 0"
                :class="currentWeekOffset >= 0 ? 'opacity-30 cursor-default' : ''"
                @click="changeWeek(1)"
              >
                <ChevronRight class="text-muted-foreground h-4 w-4" />
              </button>
            </div>
          </div>
          <div class="space-y-3">
            <div
              v-for="entry in currentLeaderboard"
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
import { ref, computed, type Component } from 'vue'
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
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import QuizModeCard from '@/components/quiz/QuizModeCard.vue'
import type { QuizMode, LeaderboardEntry } from '@/types/quiz'
import { useProgressStore } from '@/stores/progress.store'

const router = useRouter()
const progressStore = useProgressStore()

// User stats — live from progress store
const userStats = computed(() => ({
  streak: progressStore.streakCount,
  xp: progressStore.xp,
  totalGames: progressStore.totalQuizzesCompleted,
  accuracy: 0, // no per-quiz accuracy tracked yet
  badges: 0,
  totalTime: 0,
}))

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

// Leaderboard week navigation
const currentWeekOffset = ref(0) // 0 = this week, -1 = last week, -2 = two weeks ago

const leaderboardData: Record<number, LeaderboardEntry[]> = {
  0: [
    { rank: 1, username: 'ProLearner', avatar: '', score: 15420, accuracy: 94, time: 0 },
    { rank: 2, username: 'WordMaster', avatar: '', score: 14350, accuracy: 91, time: 0 },
    { rank: 3, username: 'QuizKing', avatar: '', score: 13800, accuracy: 89, time: 0 },
    { rank: 4, username: 'StudyStar', avatar: '', score: 12500, accuracy: 85, time: 0 },
    { rank: 5, username: 'LearnFast', avatar: '', score: 11200, accuracy: 82, time: 0 },
  ],
  [-1]: [
    { rank: 1, username: 'QuizKing', avatar: '', score: 18200, accuracy: 96, time: 0 },
    { rank: 2, username: 'ProLearner', avatar: '', score: 16800, accuracy: 93, time: 0 },
    { rank: 3, username: 'LearnFast', avatar: '', score: 15400, accuracy: 90, time: 0 },
    { rank: 4, username: 'WordMaster', avatar: '', score: 13900, accuracy: 87, time: 0 },
    { rank: 5, username: 'StudyStar', avatar: '', score: 12100, accuracy: 84, time: 0 },
  ],
  [-2]: [
    { rank: 1, username: 'StudyStar', avatar: '', score: 20100, accuracy: 97, time: 0 },
    { rank: 2, username: 'LearnFast', avatar: '', score: 17500, accuracy: 92, time: 0 },
    { rank: 3, username: 'ProLearner', avatar: '', score: 14200, accuracy: 88, time: 0 },
    { rank: 4, username: 'QuizKing', avatar: '', score: 13000, accuracy: 86, time: 0 },
    { rank: 5, username: 'WordMaster', avatar: '', score: 11800, accuracy: 83, time: 0 },
  ],
}

const currentLeaderboard = computed(() => {
  return leaderboardData[currentWeekOffset.value] || leaderboardData[0]
})

const weekLabel = computed(() => {
  if (currentWeekOffset.value === 0) return 'This Week'
  if (currentWeekOffset.value === -1) return 'Last Week'
  return `${Math.abs(currentWeekOffset.value)} Weeks Ago`
})

const changeWeek = (delta: number) => {
  const next = currentWeekOffset.value + delta
  if (next > 0) return // can't go into the future
  if (next < -2) return // only keep 3 weeks of data
  currentWeekOffset.value = next
}

const getRankClass = (rank: number): string => {
  if (rank === 1) return 'bg-primary text-primary-foreground'
  if (rank === 2) return 'bg-secondary text-secondary-foreground'
  if (rank === 3) return 'bg-secondary text-secondary-foreground'
  return 'bg-muted text-muted-foreground'
}

const startPractice = (modeId: string) => {
  router.push(`/quizzes/${modeId}?mode=practice`)
}
</script>
