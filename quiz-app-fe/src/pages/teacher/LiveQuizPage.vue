<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-foreground text-2xl font-bold">{{ $t('liveLesson.teacherTitle') }}</h2>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('liveLesson.teacherSubtitle') }}</p>
      </div>
    </div>

    <!-- PHASE: SETUP — just name the room and go live -->
    <div v-if="phase === 'setup'" class="mx-auto max-w-lg">
      <div class="bg-card border-border space-y-5 rounded-2xl border p-6">
        <div>
          <label class="text-foreground mb-1.5 block text-sm font-medium">{{ $t('liveLesson.lessonTitle') }} *</label>
          <input
            v-model="lessonTitle"
            type="text"
            :placeholder="$t('liveLesson.lessonTitlePlaceholder')"
            class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            @keyup.enter="createAndHost"
          />
        </div>

        <p v-if="setupError" class="text-destructive text-sm">{{ setupError }}</p>
        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-colors disabled:opacity-50"
          :disabled="creating"
          @click="createAndHost"
        >
          <span v-if="creating" class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
          <Radio v-else class="h-5 w-5" />
          {{ creating ? $t('liveLesson.creating') : $t('liveLesson.createAndGoLive') }}
        </button>
      </div>
    </div>

    <!-- PHASE: LOBBY — share the PIN, wait for participants -->
    <div v-else-if="phase === 'lobby'" class="grid gap-6 lg:grid-cols-5">
      <div class="space-y-4 lg:col-span-2">
        <div class="bg-card border-border rounded-2xl border p-6 text-center">
          <p class="text-muted-foreground mb-2 text-sm font-medium">{{ $t('liveLesson.sharePin') }}</p>
          <div class="bg-primary/5 border-primary/20 mx-auto mb-2 rounded-2xl border px-6 py-4">
            <p class="text-primary font-mono text-5xl font-black tracking-[0.3em]">{{ pin }}</p>
          </div>
          <p class="text-muted-foreground text-xs">{{ $t('liveLesson.sharePinHint') }}</p>
        </div>
        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-colors disabled:opacity-50"
          :disabled="participants.length === 0"
          @click="start"
        >
          <Play class="h-5 w-5" /> {{ $t('liveLesson.startLesson', { n: participants.length }) }}
        </button>
        <button class="border-border hover:bg-secondary/50 w-full rounded-xl border py-3 text-sm font-medium transition-colors" @click="quit">
          {{ $t('liveLesson.cancel') }}
        </button>
      </div>

      <div class="lg:col-span-3">
        <div class="bg-card border-border h-full rounded-2xl border">
          <div class="border-border flex items-center justify-between border-b px-6 py-4">
            <h3 class="text-foreground font-semibold">{{ $t('liveLesson.waitingRoom') }}</h3>
            <span class="text-chart-2 inline-flex items-center gap-1.5 text-xs">
              <span class="bg-chart-2 h-1.5 w-1.5 animate-pulse rounded-full"></span> {{ $t('liveLesson.live') }}
            </span>
          </div>
          <div v-if="participants.length" class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
            <div v-for="(p, i) in participants" :key="p.name + i" class="bg-secondary/50 flex items-center gap-2 rounded-xl p-3">
              <div class="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
                {{ p.name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-foreground truncate text-sm font-medium">{{ p.name }}</span>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-20 text-center">
            <Users class="text-primary mb-3 h-10 w-10" />
            <p class="text-foreground font-medium">{{ $t('liveLesson.waitingForStudents') }}</p>
            <p class="text-muted-foreground text-sm">{{ $t('liveLesson.sharePinToJoin') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PHASE: LIVE — the meeting room -->
    <div v-else-if="phase === 'live'" class="grid gap-6 lg:grid-cols-5">
      <div class="space-y-4 lg:col-span-2">
        <div class="bg-card border-border rounded-2xl border p-6 text-center">
          <span class="text-chart-2 mb-3 inline-flex items-center gap-1.5 text-xs font-medium">
            <span class="bg-chart-2 h-1.5 w-1.5 animate-pulse rounded-full"></span> {{ $t('liveLesson.live') }}
          </span>
          <p class="text-muted-foreground mb-2 text-sm font-medium">{{ $t('liveLesson.sharePin') }}</p>
          <div class="bg-primary/5 border-primary/20 mx-auto mb-2 rounded-2xl border px-6 py-4">
            <p class="text-primary font-mono text-5xl font-black tracking-[0.3em]">{{ pin }}</p>
          </div>
          <p class="text-muted-foreground text-xs">{{ $t('liveLesson.sharePinHint') }}</p>
        </div>
        <button
          class="bg-destructive/10 text-destructive hover:bg-destructive/20 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-colors"
          @click="end"
        >
          {{ $t('liveLesson.endLesson') }}
        </button>
      </div>

      <div class="lg:col-span-3">
        <div class="bg-card border-border h-full rounded-2xl border">
          <div class="border-border flex items-center justify-between border-b px-6 py-4">
            <h3 class="text-foreground truncate font-semibold">{{ lessonTitle }}</h3>
            <span class="text-chart-2 inline-flex items-center gap-1.5 text-xs">
              <span class="bg-chart-2 h-1.5 w-1.5 animate-pulse rounded-full"></span> {{ participantCount }} {{ $t('liveLesson.watching') }}
            </span>
          </div>
          <div v-if="participants.length" class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
            <div v-for="(p, i) in participants" :key="p.name + i" class="bg-secondary/50 flex items-center gap-2 rounded-xl p-3">
              <div class="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
                {{ p.name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-foreground truncate text-sm font-medium">{{ p.name }}</span>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-20 text-center">
            <Users class="text-primary mb-3 h-10 w-10" />
            <p class="text-foreground font-medium">{{ $t('liveLesson.waitingForStudents') }}</p>
            <p class="text-muted-foreground text-sm">{{ $t('liveLesson.sharePinToJoin') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PHASE: ENDED -->
    <div v-else-if="phase === 'ended'" class="mx-auto max-w-lg text-center">
      <div class="mb-6 flex justify-center">
        <div class="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
          <CircleCheck class="text-primary h-10 w-10" />
        </div>
      </div>
      <h2 class="text-foreground mb-2 text-3xl font-bold">{{ $t('liveLesson.lessonEnded') }}</h2>
      <p class="text-muted-foreground mb-8">{{ $t('liveLesson.lessonEndedDesc') }}</p>
      <button class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3 font-semibold transition-colors" @click="quit">
        {{ $t('liveLesson.newLesson') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { io, type Socket } from 'socket.io-client'
import { Radio, Play, Users, CircleCheck } from '@/components/icons'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth.store'

type Phase = 'setup' | 'lobby' | 'live' | 'ended'
interface Participant { name: string }

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api/v1'
const SOCKET_URL = API_BASE.replace(/\/api\/v1\/?$/, '')

const { t } = useI18n()
const authStore = useAuthStore()

const phase = ref<Phase>('setup')
const lessonTitle = ref('')
const creating = ref(false)
const setupError = ref('')

const pin = ref('')
const participants = ref<Participant[]>([])
const participantCount = ref(0)

let socket: Socket | null = null

const createAndHost = async () => {
  setupError.value = ''
  if (!lessonTitle.value.trim()) { setupError.value = t('liveLesson.errTitle'); return }

  creating.value = true
  try {
    // A live lesson is just a meeting room — no presentation steps required.
    const session = (await api.createLiveSession({ title: lessonTitle.value.trim(), steps: [] })) as { id: number; pin: string }
    connect(session.pin)
  } catch {
    setupError.value = t('liveLesson.errCreate')
    creating.value = false
  }
}

const connect = (sessionPin: string) => {
  const token = authStore.getAccessToken()
  socket = io(`${SOCKET_URL}/live-quiz`, { auth: { token }, transports: ['websocket', 'polling'] })

  socket.on('connect', () => socket?.emit('lm:host', { pin: sessionPin }))

  socket.on('lm:host_ready', (d: { pin: string; participants: Participant[] }) => {
    creating.value = false
    pin.value = d.pin
    participants.value = d.participants
    participantCount.value = d.participants.length
    phase.value = 'lobby'
  })

  socket.on('lm:participants', (d: { participants: Participant[]; count: number }) => {
    participants.value = d.participants
    participantCount.value = d.count
  })

  // The room is live — switch the host into the meeting view.
  socket.on('lm:live', () => { phase.value = 'live' })

  socket.on('lm:ended', () => { phase.value = 'ended' })

  socket.on('lm:error', (d: { message: string }) => {
    creating.value = false
    setupError.value = d.message || t('liveLesson.errGeneric')
  })

  socket.on('connect_error', () => {
    creating.value = false
    setupError.value = t('liveLesson.errServer')
  })
}

const start = () => socket?.emit('lm:start')
const end = () => socket?.emit('lm:end')

const teardown = () => { if (socket) { socket.disconnect(); socket = null } }

const quit = () => {
  teardown()
  phase.value = 'setup'
  lessonTitle.value = ''
  pin.value = ''
  participants.value = []
  participantCount.value = 0
  creating.value = false
  setupError.value = ''
}

onUnmounted(teardown)
</script>
