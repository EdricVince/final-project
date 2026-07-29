<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-foreground text-2xl font-bold">Live Quiz</h2>
        <p class="text-muted-foreground mt-1 text-sm">Host a real-time quiz — students join by PIN over a live connection</p>
      </div>
    </div>

    <!-- PHASE: SETUP — build the quiz -->
    <div v-if="phase === 'setup'" class="mx-auto max-w-3xl">
      <div class="bg-card border-border rounded-2xl border p-6 space-y-5">
        <div>
          <label class="text-foreground mb-1.5 block text-sm font-medium">Quiz title *</label>
          <input
            v-model="quizTitle"
            type="text"
            placeholder="e.g. Present Perfect Review"
            class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div v-for="(q, qi) in questions" :key="qi" class="border-border rounded-xl border p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-foreground text-sm font-semibold">Question {{ qi + 1 }}</span>
            <button v-if="questions.length > 1" class="text-muted-foreground hover:text-destructive" @click="removeQuestion(qi)">
              <X class="h-4 w-4" />
            </button>
          </div>
          <input
            v-model="q.question"
            type="text"
            placeholder="Type the question"
            class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label v-for="(_, oi) in q.options" :key="oi" class="flex items-center gap-2">
              <input
                type="radio"
                :name="`correct-${qi}`"
                :checked="q.correct === oi"
                class="accent-primary"
                @change="q.correct = oi"
              />
              <input
                v-model="q.options[oi]"
                type="text"
                :placeholder="`Option ${['A', 'B', 'C', 'D'][oi]}`"
                class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground text-xs">Time per question</span>
            <select v-model.number="q.time_limit" class="border-border bg-background text-foreground rounded-lg border px-2 py-1 text-xs">
              <option :value="10">10s</option>
              <option :value="15">15s</option>
              <option :value="20">20s</option>
              <option :value="30">30s</option>
            </select>
            <span class="text-muted-foreground ml-auto text-xs">Tick the radio next to the correct option</span>
          </div>
        </div>

        <button class="border-border hover:bg-secondary/50 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-medium transition-colors" @click="addQuestion">
          <Plus class="h-4 w-4" /> Add question
        </button>

        <p v-if="setupError" class="text-sm text-destructive">{{ setupError }}</p>
        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-colors disabled:opacity-50"
          :disabled="creating"
          @click="createAndHost"
        >
          <span v-if="creating" class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
          <Radio v-else class="h-5 w-5" />
          {{ creating ? 'Creating…' : 'Create & Go Live' }}
        </button>
      </div>
    </div>

    <!-- PHASE: LOBBY — waiting for players -->
    <div v-else-if="phase === 'lobby'" class="grid gap-6 lg:grid-cols-5">
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-card border-border rounded-2xl border p-6 text-center">
          <p class="text-muted-foreground mb-2 text-sm font-medium">Share this PIN with students</p>
          <div class="bg-primary/5 border-primary/20 mx-auto mb-2 rounded-2xl border px-6 py-4">
            <p class="text-primary font-mono text-5xl font-black tracking-[0.3em]">{{ pin }}</p>
          </div>
          <p class="text-muted-foreground text-xs">Students open <span class="text-foreground font-medium">Live Quiz</span> and enter this PIN</p>
        </div>
        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-colors disabled:opacity-50"
          :disabled="players.length === 0"
          @click="start"
        >
          <Play class="h-5 w-5" /> Start Quiz ({{ players.length }})
        </button>
        <button class="border-border hover:bg-secondary/50 w-full rounded-xl border py-3 text-sm font-medium transition-colors" @click="quit">
          Cancel
        </button>
      </div>

      <div class="lg:col-span-3">
        <div class="bg-card border-border h-full rounded-2xl border">
          <div class="border-border flex items-center justify-between border-b px-6 py-4">
            <h3 class="text-foreground font-semibold">Waiting Room</h3>
            <span class="inline-flex items-center gap-1.5 text-xs text-chart-2">
              <span class="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse"></span> Live
            </span>
          </div>
          <div v-if="players.length" class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
            <div v-for="(p, i) in players" :key="p.name + i" class="bg-secondary/50 flex items-center gap-2 rounded-xl p-3">
              <div class="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
                {{ p.name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-foreground truncate text-sm font-medium">{{ p.name }}</span>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-20 text-center">
            <Users class="text-primary mb-3 h-10 w-10" />
            <p class="text-foreground font-medium">Waiting for students…</p>
            <p class="text-muted-foreground text-sm">Share the PIN to let them join</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PHASE: QUESTION — live control -->
    <div v-else-if="phase === 'question'" class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-card border-border rounded-2xl border p-5">
          <div class="mb-3 flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Question {{ (current?.index ?? 0) + 1 }} of {{ current?.total }}</span>
            <span class="text-primary font-bold">{{ answeredCount }}/{{ playerCount }} answered</span>
          </div>
          <h2 class="text-foreground text-xl font-bold">{{ current?.question }}</h2>
        </div>

        <div class="space-y-3">
          <div v-for="(opt, i) in current?.options" :key="i" class="bg-card border-border rounded-xl border p-3">
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-foreground font-medium">
                <span class="text-muted-foreground mr-2 font-bold">{{ ['A', 'B', 'C', 'D'][i] }}</span>{{ opt }}
              </span>
              <span class="text-muted-foreground">{{ distribution[i] ?? 0 }}</span>
            </div>
            <div class="bg-secondary h-2 overflow-hidden rounded-full">
              <div class="h-2 rounded-full transition-all duration-500" :class="optionColors[i]" :style="{ width: `${pct(distribution[i] ?? 0)}%` }"></div>
            </div>
          </div>
        </div>

        <button class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl py-3 font-semibold transition-colors" @click="next">
          {{ isLast ? 'Show Results →' : 'Next Question →' }}
        </button>
      </div>

      <div class="lg:col-span-1">
        <div class="bg-card border-border rounded-2xl border p-5">
          <h3 class="text-foreground mb-3 font-semibold">Live Scores</h3>
          <div class="space-y-2">
            <div v-for="(p, i) in leaderboard" :key="p.name + i" class="flex items-center gap-3 rounded-xl p-2" :class="i < 3 ? 'bg-primary/5' : 'bg-secondary/30'">
              <span class="text-muted-foreground w-5 text-center text-sm font-bold">{{ i + 1 }}</span>
              <span class="text-foreground min-w-0 flex-1 truncate text-sm font-medium">{{ p.name }}</span>
              <span class="text-foreground text-sm font-bold">{{ p.score }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PHASE: RESULTS -->
    <div v-else-if="phase === 'results'" class="mx-auto max-w-lg text-center">
      <div class="mb-6 flex justify-center">
        <div class="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
          <Trophy class="text-primary h-10 w-10" />
        </div>
      </div>
      <h2 class="text-foreground mb-6 text-3xl font-bold">Quiz Complete!</h2>
      <div class="bg-card border-border mb-8 rounded-2xl border text-left">
        <div class="border-border border-b px-6 py-3"><h3 class="text-foreground font-semibold">Final Standings</h3></div>
        <div class="divide-border divide-y">
          <div v-for="(p, i) in leaderboard" :key="p.name + i" class="flex items-center gap-4 px-6 py-3">
            <span class="w-6 text-center text-sm font-bold" :class="i < 3 ? 'text-primary' : 'text-muted-foreground'">{{ i + 1 }}</span>
            <span class="text-foreground flex-1 truncate font-medium">{{ p.name }}</span>
            <span class="text-foreground font-bold">{{ p.score }} pts</span>
          </div>
        </div>
      </div>
      <button class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3 font-semibold transition-colors" @click="quit">
        New Quiz
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { Radio, Play, Users, Trophy, X, Plus } from '@/components/icons'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth.store'

type Phase = 'setup' | 'lobby' | 'question' | 'results'
interface BuilderQuestion { question: string; options: string[]; correct: number; time_limit: number }
interface ClientQuestion { index: number; total: number; question: string; options: string[]; time_limit: number }
interface Standing { name: string; score: number }

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api/v1'
const SOCKET_URL = API_BASE.replace(/\/api\/v1\/?$/, '')

const authStore = useAuthStore()

const phase = ref<Phase>('setup')
const quizTitle = ref('')
const questions = ref<BuilderQuestion[]>([blankQuestion()])
const creating = ref(false)
const setupError = ref('')

const pin = ref('')
const players = ref<Standing[]>([])
const leaderboard = ref<Standing[]>([])
const current = ref<ClientQuestion | null>(null)
const distribution = ref<number[]>([0, 0, 0, 0])
const answeredCount = ref(0)
const playerCount = ref(0)

const optionColors = ['bg-chart-5', 'bg-chart-2', 'bg-chart-1', 'bg-chart-3']
const isLast = computed(() => current.value !== null && current.value.index >= current.value.total - 1)

let socket: Socket | null = null

function blankQuestion(): BuilderQuestion {
  return { question: '', options: ['', '', '', ''], correct: 0, time_limit: 20 }
}
const addQuestion = () => questions.value.push(blankQuestion())
const removeQuestion = (i: number) => questions.value.splice(i, 1)

const pct = (n: number) => (playerCount.value > 0 ? Math.round((n / playerCount.value) * 100) : 0)

const createAndHost = async () => {
  setupError.value = ''
  if (!quizTitle.value.trim()) { setupError.value = 'Please enter a quiz title.'; return }
  const clean = questions.value
    .map((q) => ({ ...q, question: q.question.trim(), options: q.options.map((o) => o.trim()) }))
    .filter((q) => q.question && q.options.every((o) => o.length > 0))
  if (clean.length === 0) { setupError.value = 'Add at least one complete question (text + 4 options).'; return }

  creating.value = true
  try {
    const session = (await api.createLiveSession({ title: quizTitle.value.trim(), questions: clean })) as { id: number; pin: string }
    connect(session.pin)
  } catch {
    setupError.value = 'Could not create the session. Please try again.'
    creating.value = false
  }
}

const connect = (sessionPin: string) => {
  const token = authStore.getAccessToken()
  socket = io(`${SOCKET_URL}/live-quiz`, { auth: { token }, transports: ['websocket', 'polling'] })

  socket.on('connect', () => socket?.emit('lq:host', { pin: sessionPin }))

  socket.on('lq:host_ready', (d: { pin: string; players: Standing[] }) => {
    creating.value = false
    pin.value = d.pin
    players.value = d.players
    playerCount.value = d.players.length
    phase.value = 'lobby'
  })

  socket.on('lq:players', (d: { players: Standing[]; count: number }) => {
    players.value = d.players
    playerCount.value = d.count
  })

  socket.on('lq:question', (q: ClientQuestion) => {
    current.value = q
    distribution.value = [0, 0, 0, 0]
    answeredCount.value = 0
    phase.value = 'question'
  })

  socket.on('lq:progress', (d: { answered: number; count: number; distribution: number[] }) => {
    answeredCount.value = d.answered
    playerCount.value = d.count
    distribution.value = d.distribution
  })

  socket.on('lq:leaderboard', (d: { top: Standing[] }) => { leaderboard.value = d.top })

  socket.on('lq:finished', (d: { leaderboard: Standing[] }) => {
    leaderboard.value = d.leaderboard
    phase.value = 'results'
  })

  socket.on('lq:error', (d: { message: string }) => {
    creating.value = false
    setupError.value = d.message || 'Something went wrong.'
  })

  socket.on('connect_error', () => {
    creating.value = false
    setupError.value = 'Cannot reach the live quiz server.'
  })
}

const start = () => socket?.emit('lq:start')
const next = () => socket?.emit('lq:next')

const teardown = () => { if (socket) { socket.disconnect(); socket = null } }

const quit = () => {
  teardown()
  phase.value = 'setup'
  quizTitle.value = ''
  questions.value = [blankQuestion()]
  pin.value = ''
  players.value = []
  leaderboard.value = []
  current.value = null
  distribution.value = [0, 0, 0, 0]
  answeredCount.value = 0
  playerCount.value = 0
  creating.value = false
  setupError.value = ''
}

onUnmounted(teardown)
</script>
