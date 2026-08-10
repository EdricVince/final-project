<template>
  <div class="p-6 lg:p-8">

    <!-- PHASE: JOIN — Enter PIN -->
    <div v-if="phase === 'join'" class="flex min-h-[60vh] flex-col items-center justify-center">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <div class="mb-4 flex justify-center">
            <div class="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-2xl">
              <Radio class="text-primary h-10 w-10" />
            </div>
          </div>
          <h1 class="text-foreground text-3xl font-bold">{{ $t('liveLesson.studentTitle') }}</h1>
          <p class="text-muted-foreground mt-2">{{ $t('liveLesson.enterPinDesc') }}</p>
        </div>

        <form class="space-y-4" @submit.prevent="joinSession">
          <input
            v-model="pin"
            type="text"
            inputmode="numeric"
            :placeholder="$t('liveLesson.pinPlaceholder')"
            maxlength="8"
            class="bg-secondary text-foreground placeholder:text-muted-foreground focus:ring-primary/30 h-16 w-full rounded-2xl border-0 px-6 text-center text-3xl font-black tracking-[0.4em] focus:outline-none focus:ring-2"
            :disabled="joining"
            @input="pin = pin.replace(/\D/g, '')"
          />
          <p v-if="joinError" class="text-destructive text-center text-sm">{{ joinError }}</p>
          <button
            type="submit"
            class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold transition-colors disabled:opacity-50"
            :disabled="pin.length < 4 || joining"
          >
            <span v-if="joining" class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
            {{ joining ? $t('liveLesson.joining') : $t('liveLesson.joinNow') }}
          </button>
        </form>
      </div>
    </div>

    <!-- PHASE: WAITING — Lobby -->
    <div v-else-if="phase === 'waiting'" class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div class="bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
        <span class="relative flex h-12 w-12">
          <span class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-30"></span>
          <span class="bg-primary relative inline-flex h-12 w-12 rounded-full opacity-80"></span>
        </span>
      </div>
      <h2 class="text-foreground mb-2 text-2xl font-bold">{{ title }}</h2>
      <p class="text-muted-foreground mb-1">{{ $t('liveLesson.waitingDesc') }}</p>
      <span class="text-chart-2 mt-4 inline-flex items-center gap-1.5 text-xs">
        <span class="bg-chart-2 h-1.5 w-1.5 animate-pulse rounded-full"></span> {{ $t('liveLesson.connectedLive') }}
      </span>
      <button class="text-muted-foreground hover:text-foreground mt-8 text-sm transition-colors" @click="leaveSession">
        {{ $t('liveLesson.leaveSession') }}
      </button>
    </div>

    <!-- PHASE: LIVE — in the meeting room -->
    <div v-else-if="phase === 'live'" class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span class="text-chart-2 mb-4 inline-flex items-center gap-1.5 text-sm font-medium">
        <span class="bg-chart-2 h-2 w-2 animate-pulse rounded-full"></span> {{ $t('liveLesson.live') }}
      </span>
      <div class="bg-primary/10 mb-6 flex h-24 w-24 items-center justify-center rounded-3xl">
        <Radio class="text-primary h-12 w-12" />
      </div>
      <h2 class="text-foreground mb-2 text-3xl font-bold">{{ title }}</h2>
      <p class="text-muted-foreground mb-1">{{ $t('liveLesson.followAlong') }}</p>
      <p v-if="presenceCount" class="text-muted-foreground text-sm">{{ presenceCount }} {{ $t('liveLesson.watching') }}</p>
      <button class="text-muted-foreground hover:text-foreground mt-8 text-sm transition-colors" @click="leaveSession">
        {{ $t('liveLesson.leaveSession') }}
      </button>
    </div>

    <!-- PHASE: ENDED -->
    <div v-else-if="phase === 'ended'" class="mx-auto max-w-lg text-center">
      <div class="mb-6 flex justify-center">
        <div class="bg-primary/10 flex h-24 w-24 items-center justify-center rounded-full">
          <CircleCheck class="text-primary h-12 w-12" />
        </div>
      </div>
      <h2 class="text-foreground mb-2 text-3xl font-bold">{{ $t('liveLesson.lessonComplete') }}</h2>
      <p class="text-muted-foreground mb-8">{{ $t('liveLesson.lessonCompleteDesc') }}</p>
      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3 font-semibold transition-colors"
        @click="reset"
      >
        {{ $t('liveLesson.joinAnother') }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { io, type Socket } from 'socket.io-client'
import { Radio, CircleCheck } from '@/components/icons'
import { useAuthStore } from '@/stores/auth.store'

const { t } = useI18n()
const authStore = useAuthStore()

type Phase = 'join' | 'waiting' | 'live' | 'ended'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api/v1'
const SOCKET_URL = API_BASE.replace(/\/api\/v1\/?$/, '')

const phase = ref<Phase>('join')
const pin = ref('')
const joining = ref(false)
const joinError = ref('')

const title = ref('')
const presenceCount = ref(0)

let socket: Socket | null = null

const joinSession = () => {
  if (!pin.value || joining.value) return
  joining.value = true
  joinError.value = ''

  const token = authStore.getAccessToken()
  socket = io(`${SOCKET_URL}/live-quiz`, { auth: { token }, transports: ['websocket', 'polling'] })

  socket.on('connect', () => socket?.emit('lm:join', { pin: pin.value }))

  socket.on('lm:joined', (d: { title: string; status: string }) => {
    joining.value = false
    title.value = d.title
    if (d.status !== 'live') phase.value = 'waiting'
  })

  // The teacher started (or we joined a session already live) — enter the room.
  socket.on('lm:live', (d: { title: string }) => {
    if (d?.title) title.value = d.title
    phase.value = 'live'
  })

  socket.on('lm:presence', (d: { count: number }) => { presenceCount.value = d.count })

  socket.on('lm:ended', () => { phase.value = 'ended' })

  socket.on('lm:host_left', () => {
    if (phase.value !== 'ended') phase.value = 'ended'
  })

  socket.on('lm:error', (d: { message: string }) => {
    joining.value = false
    if (phase.value === 'join') joinError.value = d.message || t('liveLesson.sessionNotFound')
  })

  socket.on('connect_error', () => {
    joining.value = false
    joinError.value = t('liveLesson.errServer')
  })
}

const teardown = () => {
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
  title.value = ''
  presenceCount.value = 0
}

onUnmounted(teardown)
</script>
