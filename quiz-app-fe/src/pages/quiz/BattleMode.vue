<template>
  <div class="min-h-screen p-4 lg:p-6">

    <!-- LOBBY -->
    <template v-if="phase === 'lobby'">
      <div class="mx-auto max-w-lg">
        <div class="mb-8 text-center">
          <div class="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl">
            <Swords class="text-primary h-10 w-10" />
          </div>
          <h1 class="text-foreground text-3xl font-black">Battle Mode</h1>
          <p class="text-muted-foreground mt-2">Challenge AI opponents and climb the rankings!</p>
        </div>

        <!-- Difficulty -->
        <div class="bg-card border-border mb-6 rounded-2xl border p-6">
          <h3 class="text-foreground mb-4 font-semibold">Choose Difficulty</h3>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="d in difficulties"
              :key="d.value"
              class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all"
              :class="selectedDifficulty === d.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'"
              @click="selectedDifficulty = d.value"
            >
              <span class="text-2xl">{{ d.emoji }}</span>
              <span class="text-foreground text-sm font-semibold">{{ d.label }}</span>
              <span class="text-muted-foreground text-xs">{{ d.desc }}</span>
            </button>
          </div>
        </div>

        <!-- Opponent -->
        <div class="bg-card border-border mb-6 rounded-2xl border p-6">
          <h3 class="text-foreground mb-4 font-semibold">Your Opponent</h3>
          <div class="flex items-center gap-4 rounded-xl bg-secondary/50 p-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" :class="currentOpponent.bg">
              {{ currentOpponent.avatar }}
            </div>
            <div class="flex-1">
              <p class="text-foreground font-semibold">{{ currentOpponent.name }}</p>
              <p class="text-muted-foreground text-sm">{{ currentOpponent.desc }}</p>
              <div class="mt-1 flex items-center gap-1">
                <Star v-for="i in currentOpponent.stars" :key="i" class="h-3.5 w-3.5 fill-chart-4 text-chart-4" />
                <Star v-for="i in (5 - currentOpponent.stars)" :key="'e' + i" class="text-border h-3.5 w-3.5" />
              </div>
            </div>
            <button class="text-muted-foreground hover:text-foreground transition-colors" @click="randomizeOpponent">
              <RefreshCw class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-4 font-medium transition-colors"
            @click="router.push('/quizzes')"
          >
            Cancel
          </button>
          <button
            class="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors"
            @click="startBattle"
          >
            <Swords class="h-5 w-5" />
            Start Battle!
          </button>
        </div>
      </div>
    </template>

    <!-- COUNTDOWN -->
    <template v-else-if="phase === 'countdown'">
      <div class="flex min-h-[80vh] flex-col items-center justify-center">
        <div class="mb-6 text-center">
          <p class="text-muted-foreground mb-2 text-lg">Battle starts in</p>
          <div
            class="bg-primary text-primary-foreground flex h-32 w-32 items-center justify-center rounded-full text-6xl font-black shadow-2xl"
            :style="`box-shadow: 0 0 ${40 - countdownNum * 10}px rgba(var(--primary), 0.5)`"
          >
            {{ countdownNum }}
          </div>
          <p class="text-muted-foreground mt-4 text-base">Get ready to fight!</p>
        </div>
        <!-- VS Preview -->
        <div class="flex items-center gap-8">
          <div class="text-center">
            <div class="bg-primary/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl">👤</div>
            <p class="text-foreground font-semibold">You</p>
          </div>
          <div class="text-primary text-2xl font-black">VS</div>
          <div class="text-center">
            <div class="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" :class="currentOpponent.bg">
              {{ currentOpponent.avatar }}
            </div>
            <p class="text-foreground font-semibold">{{ currentOpponent.name }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- BATTLE -->
    <template v-else-if="phase === 'battle'">
      <!-- Score Header -->
      <div class="bg-card border-border mb-6 rounded-2xl border p-4">
        <!-- Players -->
        <div class="mb-3 flex items-center gap-3">
          <!-- Player -->
          <div class="flex flex-1 flex-col items-start gap-1">
            <div class="flex items-center gap-2">
              <div class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-xl text-base">👤</div>
              <span class="text-foreground text-sm font-semibold">You</span>
              <span v-if="streak > 1" class="bg-chart-1/10 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-chart-1">
                🔥 {{ streak }}x
              </span>
            </div>
            <div class="text-primary text-xl font-black">{{ playerScore }}</div>
          </div>

          <!-- Timer -->
          <div class="flex flex-col items-center">
            <div class="relative h-14 w-14">
              <svg class="h-14 w-14 -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="none" class="text-secondary" />
                <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="none"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="timerOffset"
                  :class="timeLeft <= 3 ? 'text-destructive' : 'text-primary'"
                  class="transition-all duration-100"
                />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center font-black" :class="timeLeft <= 3 ? 'text-destructive' : 'text-foreground'">
                {{ timeLeft }}
              </span>
            </div>
            <span class="text-muted-foreground mt-1 text-xs">{{ currentQ + 1 }}/{{ questions.length }}</span>
          </div>

          <!-- Opponent -->
          <div class="flex flex-1 flex-col items-end gap-1">
            <div class="flex items-center gap-2">
              <span class="text-foreground text-sm font-semibold">{{ currentOpponent.name }}</span>
              <div class="flex h-8 w-8 items-center justify-center rounded-xl text-base" :class="currentOpponent.bg">
                {{ currentOpponent.avatar }}
              </div>
            </div>
            <div class="text-chart-1 text-xl font-black">{{ opponentScore }}</div>
          </div>
        </div>

        <!-- Progress bars -->
        <div class="flex gap-2">
          <div class="flex-1 overflow-hidden rounded-full bg-secondary h-2">
            <div class="bg-primary h-full rounded-full transition-all duration-500" :style="`width: ${playerPercent}%`" />
          </div>
          <div class="flex-1 overflow-hidden rounded-full bg-secondary h-2">
            <div class="bg-chart-1 h-full rounded-full transition-all duration-500 ml-auto" :style="`width: ${opponentPercent}%`" />
          </div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="mx-auto max-w-2xl">
        <Transition name="slide-up" mode="out-in">
          <div :key="currentQ" class="bg-card border-border rounded-3xl border p-6 shadow-lg lg:p-8">
            <!-- Opponent Status -->
            <div class="mb-4 flex items-center justify-between">
              <span class="text-muted-foreground text-sm">Question {{ currentQ + 1 }}</span>
              <div class="flex items-center gap-2 text-sm">
                <div class="flex h-2 w-2 animate-pulse rounded-full" :class="opponentAnswered ? 'bg-chart-1' : 'bg-chart-2'" />
                <span class="text-muted-foreground">
                  {{ opponentAnswered ? currentOpponent.name + ' answered!' : currentOpponent.name + ' thinking...' }}
                </span>
              </div>
            </div>

            <h2 class="text-foreground mb-6 text-center text-xl font-bold lg:text-2xl">
              {{ questions[currentQ]?.question }}
            </h2>

            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="(opt, i) in questions[currentQ]?.options"
                :key="i"
                class="rounded-2xl p-4 text-center transition-all duration-200"
                :class="getOptionClass(opt)"
                :disabled="answered !== null"
                @click="selectAnswer(opt)"
              >
                <span class="text-sm font-bold uppercase tracking-wide text-muted-foreground mr-2">
                  {{ ['A','B','C','D'][i] }}
                </span>
                <span class="font-medium">{{ opt }}</span>
              </button>
            </div>

            <!-- Speed Bonus -->
            <div class="mt-4 text-center">
              <span class="text-muted-foreground text-sm">Speed bonus: </span>
              <span class="text-primary font-bold">+{{ Math.max(0, timeLeft * 10) }} pts</span>
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <!-- RESULT -->
    <template v-else-if="phase === 'result'">
      <div class="mx-auto max-w-lg">
        <!-- Win/Lose Banner -->
        <div
          class="mb-6 rounded-3xl p-8 text-center"
          :class="playerScore > opponentScore ? 'bg-primary/10' : playerScore === opponentScore ? 'bg-secondary' : 'bg-destructive/10'"
        >
          <div class="mb-4 text-6xl">
            {{ playerScore > opponentScore ? '🏆' : playerScore === opponentScore ? '🤝' : '😔' }}
          </div>
          <h1 class="text-foreground mb-2 text-3xl font-black">
            {{ playerScore > opponentScore ? 'Victory!' : playerScore === opponentScore ? 'Draw!' : 'Defeated!' }}
          </h1>
          <p class="text-muted-foreground">
            {{ playerScore > opponentScore ? 'Outstanding performance!' : playerScore === opponentScore ? 'Neck and neck!' : 'Keep practicing!' }}
          </p>
        </div>

        <!-- Score Comparison -->
        <div class="bg-card border-border mb-6 rounded-2xl border p-6">
          <div class="mb-4 flex items-center justify-around">
            <div class="text-center">
              <div class="bg-primary/10 mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl">👤</div>
              <p class="text-primary text-3xl font-black">{{ playerScore }}</p>
              <p class="text-muted-foreground text-sm">You</p>
            </div>
            <div class="text-muted-foreground text-xl font-bold">VS</div>
            <div class="text-center">
              <div class="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" :class="currentOpponent.bg">{{ currentOpponent.avatar }}</div>
              <p class="text-chart-1 text-3xl font-black">{{ opponentScore }}</p>
              <p class="text-muted-foreground text-sm">{{ currentOpponent.name }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center text-sm">
            <div>
              <p class="text-foreground font-bold">{{ correctCount }}</p>
              <p class="text-muted-foreground text-xs">Correct</p>
            </div>
            <div>
              <p class="text-foreground font-bold">{{ Math.round(correctCount / questions.length * 100) }}%</p>
              <p class="text-muted-foreground text-xs">Accuracy</p>
            </div>
            <div>
              <p class="text-foreground font-bold">{{ streak > 0 ? streak : '-' }}</p>
              <p class="text-muted-foreground text-xs">Best Streak</p>
            </div>
          </div>
        </div>

        <!-- XP Reward -->
        <div class="bg-primary/5 border-primary/20 mb-6 flex items-center gap-4 rounded-2xl border p-5">
          <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
            <Zap class="text-primary h-6 w-6" />
          </div>
          <div>
            <p class="text-foreground font-semibold">+{{ xpEarned }} XP earned</p>
            <p class="text-muted-foreground text-sm">{{ playerScore > opponentScore ? 'Victory bonus included!' : 'Keep fighting to earn more!' }}</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-4 font-medium transition-colors"
            @click="router.push('/quizzes')"
          >
            Exit
          </button>
          <button
            class="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors"
            @click="rematch"
          >
            <RefreshCw class="h-4 w-4" />
            Rematch
          </button>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Swords, Star, RefreshCw, Zap } from 'lucide-vue-next'

const router = useRouter()

type Phase = 'lobby' | 'countdown' | 'battle' | 'result'

const phase = ref<Phase>('lobby')
const selectedDifficulty = ref('medium')
const countdownNum = ref(3)
const currentQ = ref(0)
const timeLeft = ref(10)
const answered = ref<string | null>(null)
const opponentAnswered = ref(false)
const playerScore = ref(0)
const opponentScore = ref(0)
const streak = ref(0)
const correctCount = ref(0)
const circumference = 2 * Math.PI * 24

let timer: ReturnType<typeof setInterval> | null = null
let opponentTimer: ReturnType<typeof setTimeout> | null = null

const difficulties = [
  { value: 'easy', emoji: '🌱', label: 'Easy', desc: 'Slow AI' },
  { value: 'medium', emoji: '⚡', label: 'Medium', desc: 'Normal AI' },
  { value: 'hard', emoji: '💀', label: 'Hard', desc: 'Fast AI' },
]

const opponents = [
  { name: 'Nova Bot', avatar: '🤖', desc: 'Balanced all-rounder', stars: 2, bg: 'bg-chart-3/10', speed: [4, 8] },
  { name: 'Speed King', avatar: '⚡', desc: 'Blazing fast responder', stars: 4, bg: 'bg-chart-4/10', speed: [1, 4] },
  { name: 'Rookie Ryan', avatar: '🐣', desc: 'Just getting started', stars: 1, bg: 'bg-chart-2/10', speed: [6, 10] },
  { name: 'Professor Q', avatar: '🎓', desc: 'Academic genius', stars: 5, bg: 'bg-primary/10', speed: [2, 5] },
  { name: 'Lucky Lisa', avatar: '🍀', desc: 'Unpredictable guesses', stars: 3, bg: 'bg-chart-5/10', speed: [3, 9] },
]

const opponentIndex = ref(0)
const currentOpponent = computed(() => opponents[opponentIndex.value])

const randomizeOpponent = () => {
  opponentIndex.value = Math.floor(Math.random() * opponents.length)
}

const questions = [
  { question: 'Past tense of "eat"?', options: ['ate', 'eated', 'eaten', 'eating'], correct: 'ate' },
  { question: 'Synonym of "happy"?', options: ['sad', 'joyful', 'angry', 'tired'], correct: 'joyful' },
  { question: 'Opposite of "ancient"?', options: ['old', 'modern', 'historic', 'classic'], correct: 'modern' },
  { question: '"She ___ to school"', options: ['go', 'goes', 'going', 'gone'], correct: 'goes' },
  { question: 'Plural of "mouse"?', options: ['mouses', 'mice', 'mices', 'mouse'], correct: 'mice' },
  { question: 'Synonym of "big"?', options: ['tiny', 'small', 'huge', 'thin'], correct: 'huge' },
  { question: 'Past of "run"?', options: ['runned', 'runs', 'ran', 'running'], correct: 'ran' },
  { question: '"___ you help me?"', options: ['Do', 'Is', 'Can', 'Are'], correct: 'Can' },
  { question: 'Opposite of "fast"?', options: ['quick', 'rapid', 'slow', 'swift'], correct: 'slow' },
  { question: 'Past of "buy"?', options: ['buyed', 'buys', 'buying', 'bought'], correct: 'bought' },
]

const timerOffset = computed(() => {
  return circumference * (1 - timeLeft.value / 10)
})

const maxScore = computed(() => questions.length * (100 + 10 * 10))
const playerPercent = computed(() => Math.min(100, (playerScore.value / maxScore.value) * 100))
const opponentPercent = computed(() => Math.min(100, (opponentScore.value / maxScore.value) * 100))

const xpEarned = computed(() => {
  const base = correctCount.value * 15
  const bonus = playerScore.value > opponentScore.value ? 50 : 0
  return base + bonus
})

const getOptionClass = (opt: string) => {
  if (answered.value === null) return 'bg-secondary hover:bg-primary hover:text-primary-foreground cursor-pointer'
  if (opt === questions[currentQ.value]?.correct) return 'bg-primary text-primary-foreground'
  if (opt === answered.value) return 'bg-destructive text-destructive-foreground'
  return 'bg-secondary/50 opacity-50'
}

const startBattle = () => {
  phase.value = 'countdown'
  countdownNum.value = 3
  const cd = setInterval(() => {
    countdownNum.value--
    if (countdownNum.value <= 0) {
      clearInterval(cd)
      phase.value = 'battle'
      currentQ.value = 0
      playerScore.value = 0
      opponentScore.value = 0
      streak.value = 0
      correctCount.value = 0
      startQuestionTimer()
    }
  }, 1000)
}

const startQuestionTimer = () => {
  timeLeft.value = 10
  answered.value = null
  opponentAnswered.value = false
  if (timer) clearInterval(timer)

  // Opponent answers after random delay based on difficulty
  const opp = currentOpponent.value
  const [minT, maxT] = opp.speed
  const oppDelay = (minT + Math.random() * (maxT - minT)) * 1000
  opponentTimer = setTimeout(() => {
    if (answered.value !== null) return
    opponentAnswered.value = true
    // Opponent correct % based on difficulty
    const correctChance = selectedDifficulty.value === 'easy' ? 0.5 : selectedDifficulty.value === 'medium' ? 0.7 : 0.85
    const oppCorrect = Math.random() < correctChance
    const oppBonus = Math.max(0, Math.round((10 - (oppDelay / 1000)) * 10))
    if (oppCorrect) opponentScore.value += 100 + oppBonus
  }, oppDelay)

  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      if (answered.value === null) {
        answered.value = ''
        streak.value = 0
      }
      clearInterval(timer!)
      setTimeout(nextQuestion, 1200)
    }
  }, 1000)
}

const selectAnswer = (opt: string) => {
  if (answered.value !== null) return
  answered.value = opt
  clearInterval(timer!)
  if (opponentTimer) clearTimeout(opponentTimer)

  const isCorrect = opt === questions[currentQ.value]?.correct
  if (isCorrect) {
    streak.value++
    correctCount.value++
    playerScore.value += 100 + timeLeft.value * 10 + streak.value * 10
  } else {
    streak.value = 0
  }
  setTimeout(nextQuestion, 1000)
}

const nextQuestion = () => {
  if (currentQ.value >= questions.length - 1) {
    phase.value = 'result'
  } else {
    currentQ.value++
    startQuestionTimer()
  }
}

const rematch = () => {
  phase.value = 'lobby'
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (opponentTimer) clearTimeout(opponentTimer)
})
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.slide-up-enter-from { opacity: 0; transform: translateY(20px) scale(0.98); }
.slide-up-leave-to { opacity: 0; transform: translateY(-20px) scale(0.98); }
</style>
