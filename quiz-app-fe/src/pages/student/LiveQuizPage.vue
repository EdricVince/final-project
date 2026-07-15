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
      <h2 class="text-foreground mb-2 text-2xl font-bold">{{ session.title }}</h2>
      <p class="text-muted-foreground mb-1">{{ $t('liveQuiz.waitingDesc') }}</p>
      <p class="text-muted-foreground text-sm">{{ $t('liveQuiz.questionsReady', { n: session.total_questions }) }}</p>
      <button
        class="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        @click="leaveSession"
      >
        {{ $t('liveQuiz.leaveSession') }}
      </button>
    </div>

    <!-- PHASE: QUESTION — Answer a question -->
    <div v-else-if="phase === 'question'" class="mx-auto max-w-2xl">
      <!-- Progress + Timer -->
      <div class="mb-6">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-muted-foreground text-sm font-medium">
            {{ $t('liveQuiz.questionOf', { current: currentQIndex + 1, total: session.total_questions }) }}
          </span>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black transition-colors"
            :class="timeLeft <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'"
          >
            {{ timeLeft }}
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
          :class="[
            optionColors[i],
            selectedAnswer === i ? 'ring-4 ring-white/60 scale-[0.97]' : 'hover:opacity-90 hover:scale-[0.98]',
            answered ? 'opacity-70' : '',
          ]"
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
        <p class="text-muted-foreground text-sm">{{ $t('liveQuiz.answerLocked') }}</p>
      </div>
    </div>

    <!-- PHASE: RESULT — Quiz finished -->
    <div v-else-if="phase === 'finished'" class="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div class="mb-6 flex justify-center">
        <div class="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Trophy class="text-primary h-12 w-12" />
        </div>
      </div>
      <h2 class="text-foreground mb-2 text-3xl font-bold">{{ $t('liveQuiz.quizComplete') }}</h2>
      <p class="text-muted-foreground mb-8">{{ $t('liveQuiz.answeredOf', { answered: answeredQuestions, total: session.total_questions }) }}</p>
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
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Radio, Trophy } from '@/components/icons'
import { api } from '@/utils/api'

const { t } = useI18n()

type Phase = 'join' | 'waiting' | 'question' | 'finished'

interface Question {
  question: string
  options: string[]
  correct: number
  time_limit: number
}

interface Session {
  id: number
  title: string
  status: string
  current_question: number
  total_questions: number
  questions: Question[]
}

const phase = ref<Phase>('join')
const pin = ref('')
const joining = ref(false)
const joinError = ref('')

const session = ref<Session>({
  id: 0,
  title: '',
  status: 'waiting',
  current_question: 0,
  total_questions: 0,
  questions: [],
})

const currentQIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const answered = ref(false)
const timeLeft = ref(20)
const answeredQuestions = ref(0)

let pollTimer: ReturnType<typeof setInterval> | null = null
let questionTimer: ReturnType<typeof setInterval> | null = null

const currentQuestion = computed<Question | undefined>(
  () => session.value.questions[currentQIndex.value]
)

const optionColors = ['bg-chart-5', 'bg-chart-2', 'bg-chart-1', 'bg-chart-3']

const joinSession = async () => {
  if (!pin.value || joining.value) return
  joining.value = true
  joinError.value = ''
  try {
    const data = (await api.joinLiveSession(pin.value)) as Session
    session.value = data
    currentQIndex.value = data.current_question
    if (data.status === 'active') {
      startQuestion()
    } else if (data.status === 'finished') {
      phase.value = 'finished'
    } else {
      phase.value = 'waiting'
      startPolling()
    }
  } catch {
    joinError.value = t('liveQuiz.sessionNotFound')
  } finally {
    joining.value = false
  }
}

const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = setInterval(async () => {
    try {
      const data = (await api.getLiveSession(session.value.id)) as Session
      session.value = data
      if (data.status === 'active') {
        stopPolling()
        currentQIndex.value = data.current_question
        startQuestion()
      } else if (data.status === 'finished') {
        stopPolling()
        phase.value = 'finished'
      }
    } catch {
      // ignore poll errors
    }
  }, 2000)
}

const stopPolling = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

const startQuestion = () => {
  phase.value = 'question'
  selectedAnswer.value = null
  answered.value = false
  const q = session.value.questions[currentQIndex.value]
  timeLeft.value = q?.time_limit || 20

  if (questionTimer) clearInterval(questionTimer)
  questionTimer = setInterval(async () => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(questionTimer!)
      questionTimer = null
      // Poll for next question or finish
      await checkNextQuestion()
    }
  }, 1000)
}

const selectAnswer = (idx: number) => {
  if (answered.value) return
  selectedAnswer.value = idx
  answered.value = true
  answeredQuestions.value++
  // Don't stop the timer — let it run to sync with teacher
}

const checkNextQuestion = async () => {
  try {
    const data = (await api.getLiveSession(session.value.id)) as Session
    session.value = data
    if (data.status === 'finished') {
      phase.value = 'finished'
      return
    }
    if (data.current_question !== currentQIndex.value) {
      currentQIndex.value = data.current_question
      startQuestion()
    } else {
      // Still same question, poll until teacher advances
      startPolling()
      phase.value = 'waiting'
    }
  } catch {
    startPolling()
    phase.value = 'waiting'
  }
}

const leaveSession = () => {
  stopPolling()
  if (questionTimer) { clearInterval(questionTimer); questionTimer = null }
  reset()
}

const reset = () => {
  phase.value = 'join'
  pin.value = ''
  joinError.value = ''
  selectedAnswer.value = null
  answered.value = false
  answeredQuestions.value = 0
}

onUnmounted(() => {
  stopPolling()
  if (questionTimer) clearInterval(questionTimer)
})
</script>
