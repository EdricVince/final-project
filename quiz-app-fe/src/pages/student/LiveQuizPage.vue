<template>
  <div class="p-6 lg:p-8">

    <!-- PHASE: JOIN — Enter PIN -->
    <div v-if="phase === 'join'" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <div class="mb-4 flex justify-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Radio class="text-primary h-10 w-10" />
            </div>
          </div>
          <h1 class="text-foreground text-3xl font-bold">{{ $t('liveQuiz.title') }}</h1>
          <p class="text-muted-foreground mt-2">{{ $t('liveQuiz.enterPinDesc') }}</p>
        </div>

        <form @submit.prevent="joinSession" class="space-y-4">
          <input
            v-model="pin"
            type="text"
            inputmode="numeric"
            :placeholder="$t('liveQuiz.pinPlaceholder')"
            maxlength="8"
            class="bg-secondary text-foreground placeholder:text-muted-foreground h-16 w-full rounded-2xl border-0 px-6 text-center text-3xl font-black tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary/30"
            :disabled="joining"
            @input="pin = pin.replace(/\D/g, '')"
          />
          <p v-if="joinError" class="text-center text-sm text-destructive">{{ joinError }}</p>
          <button
            type="submit"
            class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold transition-colors disabled:opacity-50"
            :disabled="pin.length < 4 || joining"
          >
            <span v-if="joining" class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
            {{ joining ? $t('liveQuiz.joining') : $t('liveQuiz.joinNow') }}
          </button>
        </form>
      </div>
    </div>

    <!-- PHASE: WAITING — Lobby -->
    <div v-else-if="phase === 'waiting'" class="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <span class="relative flex h-12 w-12">
          <span class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-30"></span>
          <span class="bg-primary relative inline-flex h-12 w-12 rounded-full opacity-80"></span>
        </span>
      </div>
      <h2 class="text-foreground mb-2 text-2xl font-bold">{{ title }}</h2>
      <p class="text-muted-foreground mb-1">{{ $t('liveQuiz.waitingDesc') }}</p>
      <p class="text-muted-foreground text-sm">{{ $t('liveQuiz.questionsReady', { n: totalQuestions }) }}</p>
      <span class="mt-4 inline-flex items-center gap-1.5 text-xs text-chart-2">
        <span class="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse"></span> Connected live
      </span>
      <button class="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors" @click="leaveSession">
        {{ $t('liveQuiz.leaveSession') }}
      </button>
    </div>

    <!-- PHASE: QUESTION — Answer a question -->
    <div v-else-if="phase === 'question'" class="mx-auto max-w-2xl">
      <!-- Progress + Timer -->
      <div class="mb-6">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-muted-foreground text-sm font-medium">
            {{ $t('liveQuiz.questionOf', { current: (currentQuestion?.index ?? 0) + 1, total: totalQuestions }) }}
          </span>
          <div class="flex items-center gap-3">
            <span class="text-primary text-sm font-bold">{{ myScore }} pts</span>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black transition-colors"
              :class="timeLeft <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'"
            >
              {{ timeLeft }}
            </div>
          </div>
        </div>
        <div class="bg-secondary h-2 rounded-full">
          <div
            class="h-2 rounded-full transition-all duration-1000"
            :class="timeLeft <= 5 ? 'bg-destructive' : 'bg-primary'"
            :style="{ width: `${(timeLeft / (currentQuestion?.time_limit || 20)) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Question -->
      <div class="bg-card border-border mb-6 rounded-2xl border p-6">
        <h2 class="text-foreground text-xl font-bold leading-snug">{{ currentQuestion?.question }}</h2>
      </div>

      <!-- Options -->
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="(opt, i) in currentQuestion?.options"
          :key="i"
          class="rounded-2xl p-5 text-left font-semibold text-white transition-all disabled:cursor-not-allowed"
          :class="[optionColors[i], optionState(i)]"
          :disabled="answered"
          @click="selectAnswer(i)"
        >
          <span class="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold">
            {{ ['A', 'B', 'C', 'D'][i] }}
          </span>
          {{ opt }}
        </button>
      </div>

      <!-- Feedback -->
      <div v-if="answered" class="mt-4 text-center">
        <p v-if="lastResult" class="text-sm font-semibold" :class="lastResult.correct ? 'text-chart-2' : 'text-destructive'">
          {{ lastResult.correct ? `🎉 Correct! +${lastResult.gained} pts` : '❌ Not quite' }}
        </p>
        <p class="text-muted-foreground text-sm">{{ $t('liveQuiz.answerLocked') }}</p>
      </div>

      <!-- Live leaderboard -->
      <div v-if="leaderboard.length" class="mt-8">
        <h3 class="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">Live standings</h3>
        <div class="space-y-1.5">
          <div v-for="(p, i) in leaderboard" :key="p.name + i" class="bg-card border-border flex items-center gap-3 rounded-xl border px-4 py-2">
            <span class="text-muted-foreground w-5 text-center text-sm font-bold">{{ i + 1 }}</span>
            <span class="text-foreground flex-1 truncate text-sm font-medium">{{ p.name }}</span>
            <span class="text-foreground text-sm font-bold">{{ p.score }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PHASE: RESULT — Quiz finished -->
    <div v-else-if="phase === 'finished'" class="mx-auto max-w-lg text-center">
      <div class="mb-6 flex justify-center">
        <div class="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Trophy class="text-primary h-12 w-12" />
        </div>
      </div>
      <h2 class="text-foreground mb-2 text-3xl font-bold">{{ $t('liveQuiz.quizComplete') }}</h2>
      <p class="text-muted-foreground mb-6">Your score: <span class="text-primary font-bold">{{ myScore }}</span> pts</p>

      <div v-if="finalBoard.length" class="bg-card border-border mb-8 rounded-2xl border text-left">
        <div class="border-border border-b px-6 py-3">
          <h3 class="text-foreground font-semibold">Final standings</h3>
        </div>
        <div class="divide-border divide-y">
          <div v-for="(p, i) in finalBoard" :key="p.name + i" class="flex items-center gap-4 px-6 py-3">
            <span class="w-6 text-center text-sm font-bold" :class="i < 3 ? 'text-primary' : 'text-muted-foreground'">{{ i + 1 }}</span>
            <span class="text-foreground flex-1 truncate font-medium">{{ p.name }}</span>
            <span class="text-foreground font-bold">{{ p.score }} pts</span>
          </div>
        </div>
      </div>

      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3 font-semibold transition-colors"
        @click="reset"
      >
        {{ $t('liveQuiz.joinAnother') }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { io, type Socket } from 'socket.io-client'
import { Radio, Trophy } from '@/components/icons'
import { useAuthStore } from '@/stores/auth.store'

const { t } = useI18n()
const authStore = useAuthStore()

type Phase = 'join' | 'waiting' | 'question' | 'finished'
interface ClientQuestion { index: number; total: number; question: string; options: string[]; time_limit: number }
interface Standing { name: string; score: number }

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api/v1'
const SOCKET_URL = API_BASE.replace(/\/api\/v1\/?$/, '')

const phase = ref<Phase>('join')
const pin = ref('')
const joining = ref(false)
const joinError = ref('')

const title = ref('')
const totalQuestions = ref(0)
const currentQuestion = ref<ClientQuestion | null>(null)
const selectedAnswer = ref<number | null>(null)
const answered = ref(false)
const lastResult = ref<{ correct: boolean; correctIndex: number; gained: number } | null>(null)
const myScore = ref(0)
const timeLeft = ref(20)
const leaderboard = ref<Standing[]>([])
const finalBoard = ref<Standing[]>([])

const optionColors = ['bg-chart-5', 'bg-chart-2', 'bg-chart-1', 'bg-chart-3']

let socket: Socket | null = null
let questionTimer: ReturnType<typeof setInterval> | null = null

const optionState = (i: number) => {
  if (!answered.value) return 'hover:opacity-90 hover:scale-[0.98]'
  if (lastResult.value && i === lastResult.value.correctIndex) return 'ring-4 ring-white/70'
  if (i === selectedAnswer.value) return 'opacity-90 ring-2 ring-white/40'
  return 'opacity-50'
}

const stopTimer = () => {
  if (questionTimer) { clearInterval(questionTimer); questionTimer = null }
}

const startTimer = () => {
  stopTimer()
  timeLeft.value = currentQuestion.value?.time_limit || 20
  questionTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      stopTimer()
      answered.value = true // time's up — lock the question
    }
  }, 1000)
}

const joinSession = () => {
  if (!pin.value || joining.value) return
  joining.value = true
  joinError.value = ''

  const token = authStore.getAccessToken()
  socket = io(`${SOCKET_URL}/live-quiz`, { auth: { token }, transports: ['websocket', 'polling'] })

  socket.on('connect', () => socket?.emit('lq:join', { pin: pin.value }))

  socket.on('lq:joined', (d: { title: string; total: number; status: string }) => {
    joining.value = false
    title.value = d.title
    totalQuestions.value = d.total
    if (d.status !== 'active') phase.value = 'waiting'
  })

  socket.on('lq:question', (q: ClientQuestion) => {
    currentQuestion.value = q
    selectedAnswer.value = null
    answered.value = false
    lastResult.value = null
    phase.value = 'question'
    startTimer()
  })

  socket.on('lq:answer_result', (r: { correct: boolean; correctIndex: number; gained: number; score: number }) => {
    lastResult.value = { correct: r.correct, correctIndex: r.correctIndex, gained: r.gained }
    myScore.value = r.score
  })

  socket.on('lq:leaderboard', (d: { top: Standing[] }) => { leaderboard.value = d.top })

  socket.on('lq:finished', (d: { leaderboard: Standing[] }) => {
    stopTimer()
    finalBoard.value = d.leaderboard
    phase.value = 'finished'
  })

  socket.on('lq:host_left', () => {
    stopTimer()
    if (phase.value !== 'finished') {
      joinError.value = ''
      phase.value = 'finished'
    }
  })

  socket.on('lq:error', (d: { message: string }) => {
    joining.value = false
    if (phase.value === 'join') joinError.value = d.message || t('liveQuiz.sessionNotFound')
  })

  socket.on('connect_error', () => {
    joining.value = false
    joinError.value = 'Cannot reach the live quiz server.'
  })
}

const selectAnswer = (idx: number) => {
  if (answered.value || !socket) return
  selectedAnswer.value = idx
  answered.value = true
  socket.emit('lq:answer', { answerIndex: idx, timeLeft: timeLeft.value })
}

const teardown = () => {
  stopTimer()
  if (socket) { socket.disconnect(); socket = null }
}

const leaveSession = () => {
  teardown()
  reset()
}

const reset = () => {
  teardown()
  phase.value = 'join'
  pin.value = ''
  joinError.value = ''
  selectedAnswer.value = null
  answered.value = false
  lastResult.value = null
  myScore.value = 0
  leaderboard.value = []
  finalBoard.value = []
  currentQuestion.value = null
}

onUnmounted(teardown)
</script>
