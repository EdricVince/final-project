<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-foreground text-2xl font-bold">Live Quiz</h2>
        <p class="text-muted-foreground mt-1 text-sm">Host a real-time quiz session for your students</p>
      </div>
      <button
        v-if="phase === 'idle'"
        class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-colors"
        @click="createSession"
      >
        <Radio class="h-4 w-4" />
        New Session
      </button>
    </div>

    <!-- PHASE: IDLE — Recent Sessions + Create -->
    <div v-if="phase === 'idle'">
      <!-- How It Works -->
      <div class="mb-8 grid gap-4 sm:grid-cols-3">
        <div v-for="step in howItWorks" :key="step.step" class="bg-card border-border rounded-2xl border p-5">
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" :class="step.bg">
            <component :is="step.icon" class="h-5 w-5" :class="step.color" />
          </div>
          <p class="text-foreground mb-1 font-semibold">{{ step.title }}</p>
          <p class="text-muted-foreground text-sm">{{ step.desc }}</p>
        </div>
      </div>

      <!-- Past Sessions -->
      <div class="bg-card border-border rounded-2xl border">
        <div class="border-border border-b px-6 py-4">
          <h3 class="text-foreground font-semibold">Past Sessions</h3>
        </div>
        <div class="divide-border divide-y">
          <div
            v-for="session in pastSessions"
            :key="session.id"
            class="flex items-center gap-4 px-6 py-4"
          >
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" :class="session.bg">
              <Radio class="h-5 w-5" :class="session.color" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-foreground font-medium">{{ session.title }}</p>
              <p class="text-muted-foreground text-xs">{{ session.class }} · {{ session.date }}</p>
            </div>
            <div class="flex items-center gap-4 text-right">
              <div>
                <p class="text-foreground font-semibold">{{ session.players }}</p>
                <p class="text-muted-foreground text-xs">players</p>
              </div>
              <div>
                <p class="text-foreground font-semibold">{{ session.avgScore }}%</p>
                <p class="text-muted-foreground text-xs">avg score</p>
              </div>
              <button class="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                Results →
              </button>
            </div>
          </div>
        </div>
        <div v-if="pastSessions.length === 0" class="flex flex-col items-center py-12 text-center">
          <Radio class="text-muted-foreground mb-3 h-10 w-10" />
          <p class="text-muted-foreground text-sm">No sessions yet. Create your first live quiz!</p>
        </div>
      </div>
    </div>

    <!-- PHASE: LOBBY — Waiting for players -->
    <div v-else-if="phase === 'lobby'">
      <div class="grid gap-6 lg:grid-cols-5">
        <!-- Left: PIN + Controls -->
        <div class="lg:col-span-2 space-y-4">
          <!-- PIN Card -->
          <div class="bg-card border-border rounded-2xl border p-6 text-center">
            <p class="text-muted-foreground mb-2 text-sm font-medium">Share this PIN with students</p>
            <div class="bg-primary/5 border-primary/20 mx-auto mb-4 rounded-2xl border px-6 py-4">
              <p class="text-primary font-mono text-5xl font-black tracking-[0.3em]">{{ session.pin }}</p>
            </div>
            <p class="text-muted-foreground text-xs">Go to <span class="text-foreground font-medium">studyspark.app/join</span></p>
          </div>

          <!-- Session Info -->
          <div class="bg-card border-border rounded-2xl border p-5 space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground text-sm">Quiz</span>
              <span class="text-foreground text-sm font-medium truncate max-w-[60%] text-right">{{ session.title }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground text-sm">Questions</span>
              <span class="text-foreground text-sm font-medium">{{ session.questions.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground text-sm">Time per Q</span>
              <span class="text-foreground text-sm font-medium">{{ session.timePerQuestion }}s</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground text-sm">Players joined</span>
              <span class="text-primary text-sm font-bold">{{ joinedPlayers.length }}</span>
            </div>
          </div>

          <!-- Start Button -->
          <button
            class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-colors disabled:opacity-50"
            :disabled="joinedPlayers.length === 0"
            @click="startQuiz"
          >
            <Play class="h-5 w-5" />
            Start Quiz ({{ joinedPlayers.length }} players)
          </button>
          <button
            class="border-border hover:bg-secondary/50 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors"
            @click="cancelSession"
          >
            Cancel Session
          </button>
        </div>

        <!-- Right: Player List -->
        <div class="lg:col-span-3">
          <div class="bg-card border-border rounded-2xl border h-full">
            <div class="border-border flex items-center justify-between border-b px-6 py-4">
              <h3 class="text-foreground font-semibold">Waiting Room</h3>
              <div class="flex items-center gap-2">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="bg-chart-2 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                  <span class="bg-chart-2 relative inline-flex h-2.5 w-2.5 rounded-full"></span>
                </span>
                <span class="text-muted-foreground text-sm">Live</span>
              </div>
            </div>

            <!-- Player grid -->
            <div v-if="joinedPlayers.length > 0" class="p-6">
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div
                  v-for="(player, i) in joinedPlayers"
                  :key="player.id"
                  class="animate-fade-in-up bg-secondary/50 flex items-center gap-3 rounded-xl p-3"
                  :style="{ animationDelay: `${i * 50}ms` }"
                >
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    :style="{ backgroundColor: player.color }"
                  >
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-foreground truncate text-sm font-medium">{{ player.name }}</span>
                </div>
              </div>
            </div>

            <!-- Empty waiting -->
            <div v-else class="flex flex-col items-center justify-center py-20 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users class="text-primary h-8 w-8" />
              </div>
              <p class="text-foreground mb-1 font-medium">Waiting for students...</p>
              <p class="text-muted-foreground text-sm">Share the PIN above to let students join</p>

              <!-- Simulate join for demo -->
              <button
                class="mt-4 text-primary hover:text-primary/80 text-xs font-medium transition-colors"
                @click="simulateJoin"
              >
                + Simulate student join (demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PHASE: QUESTION — Live question display -->
    <div v-else-if="phase === 'question'">
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Left: Scoreboard -->
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-card border-border rounded-2xl border p-5">
            <h3 class="text-foreground mb-4 font-semibold">Live Scores</h3>
            <div class="space-y-2">
              <div
                v-for="(player, i) in sortedPlayers"
                :key="player.id"
                class="flex items-center gap-3 rounded-xl p-2.5 transition-all"
                :class="i < 3 ? 'bg-primary/5' : 'bg-secondary/30'"
              >
                <span class="text-muted-foreground w-5 text-center text-sm font-bold">{{ i + 1 }}</span>
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  :style="{ backgroundColor: player.color }"
                >
                  {{ player.name.charAt(0) }}
                </div>
                <span class="text-foreground min-w-0 flex-1 truncate text-sm font-medium">{{ player.name }}</span>
                <span class="text-foreground text-sm font-bold">{{ player.score }}</span>
              </div>
            </div>
          </div>

          <!-- Answer progress -->
          <div class="bg-card border-border rounded-2xl border p-5">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-foreground text-sm font-medium">Answers</span>
              <span class="text-primary font-bold">{{ answeredCount }}/{{ joinedPlayers.length }}</span>
            </div>
            <div class="bg-secondary h-2.5 rounded-full">
              <div
                class="bg-primary h-2.5 rounded-full transition-all duration-500"
                :style="{ width: `${(answeredCount / joinedPlayers.length) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Right: Question display -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Timer + progress -->
          <div class="bg-card border-border rounded-2xl border p-5">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-muted-foreground text-sm">Question {{ currentQIndex + 1 }} of {{ session.questions.length }}</span>
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black transition-colors"
                :class="timeLeft <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'"
              >
                {{ timeLeft }}
              </div>
            </div>
            <!-- Progress bar -->
            <div class="bg-secondary mb-4 h-1.5 rounded-full">
              <div
                class="h-1.5 rounded-full transition-all duration-1000"
                :class="timeLeft <= 5 ? 'bg-destructive' : 'bg-primary'"
                :style="{ width: `${(currentQIndex / session.questions.length) * 100}%` }"
              ></div>
            </div>

            <!-- Question text -->
            <h2 class="text-foreground text-xl font-bold">{{ currentQuestion.question }}</h2>
          </div>

          <!-- Answer options -->
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(opt, i) in currentQuestion.options"
              :key="i"
              class="rounded-2xl p-5 text-white font-semibold text-lg flex items-center gap-3"
              :class="optionColors[i]"
            >
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-sm">
                {{ ['A', 'B', 'C', 'D'][i] }}
              </span>
              {{ opt }}
            </div>
          </div>

          <!-- Next / End buttons -->
          <div class="flex gap-3">
            <button
              class="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-xl py-3 font-medium transition-colors"
              @click="nextQuestion"
            >
              {{ currentQIndex < session.questions.length - 1 ? 'Next Question →' : 'Show Results →' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PHASE: RESULTS -->
    <div v-else-if="phase === 'results'">
      <div class="text-center mb-8">
        <div class="mb-4 flex justify-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy class="text-primary h-10 w-10" />
          </div>
        </div>
        <h2 class="text-foreground text-3xl font-bold mb-2">Quiz Complete!</h2>
        <p class="text-muted-foreground">{{ joinedPlayers.length }} students participated</p>
      </div>

      <!-- Podium top 3 -->
      <div class="mb-8 flex items-end justify-center gap-4">
        <div
          v-for="(player, i) in podium"
          :key="player.id"
          class="flex flex-col items-center"
          :class="i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'"
        >
          <div class="mb-2 text-3xl">{{ ['🥇', '🥈', '🥉'][i] }}</div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg"
            :style="{ backgroundColor: player.color }"
          >
            {{ player.name.charAt(0) }}
          </div>
          <p class="text-foreground mt-2 text-sm font-semibold">{{ player.name }}</p>
          <p class="text-primary font-bold">{{ player.score }}</p>
          <div
            class="mt-2 rounded-t-xl w-20"
            :class="[i === 0 ? 'h-20 bg-primary/20' : i === 1 ? 'h-14 bg-primary/10' : 'h-10 bg-primary/5']"
          ></div>
        </div>
      </div>

      <!-- Full leaderboard -->
      <div class="bg-card border-border mx-auto max-w-xl rounded-2xl border">
        <div class="border-border border-b px-6 py-4">
          <h3 class="text-foreground font-semibold">Final Standings</h3>
        </div>
        <div class="divide-border divide-y">
          <div v-for="(player, i) in sortedPlayers" :key="player.id" class="flex items-center gap-4 px-6 py-3">
            <span class="text-muted-foreground w-6 text-center text-sm font-bold">{{ i + 1 }}</span>
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              :style="{ backgroundColor: player.color }"
            >
              {{ player.name.charAt(0) }}
            </div>
            <span class="text-foreground flex-1 font-medium">{{ player.name }}</span>
            <span class="text-foreground font-bold">{{ player.score }} pts</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-center gap-3">
        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-3 font-medium transition-colors"
          @click="phase = 'idle'"
        >
          Back to Sessions
        </button>
      </div>
    </div>

    <!-- Create Session Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showCreateModal = false" />
          <div class="bg-card border-border relative z-10 w-full max-w-md rounded-2xl border shadow-xl">
            <div class="border-border flex items-center justify-between border-b p-6">
              <h3 class="text-foreground text-lg font-semibold">Create Live Session</h3>
              <button class="text-muted-foreground hover:text-foreground" @click="showCreateModal = false">
                <X class="h-5 w-5" />
              </button>
            </div>
            <div class="space-y-4 p-6">
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Session Title *</label>
                <input
                  v-model="newSession.title"
                  type="text"
                  placeholder="e.g. Past Tense Live Quiz"
                  class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Class</label>
                <select
                  v-model="newSession.class"
                  class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">No class (open)</option>
                  <option>English Grammar A1</option>
                  <option>Business English B2</option>
                  <option>IELTS Preparation</option>
                </select>
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Time per Question</label>
                <div class="flex gap-2">
                  <button
                    v-for="t in [10, 15, 20, 30]"
                    :key="t"
                    class="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors"
                    :class="newSession.timePerQuestion === t
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:bg-secondary/50'"
                    @click="newSession.timePerQuestion = t"
                  >
                    {{ t }}s
                  </button>
                </div>
              </div>
            </div>
            <div class="border-border flex gap-3 border-t p-6">
              <button
                class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-3 font-medium transition-colors"
                @click="showCreateModal = false"
              >
                Cancel
              </button>
              <button
                class="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
                :disabled="!newSession.title.trim()"
                @click="confirmCreate"
              >
                Create & Go Live
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { Radio, Play, Users, Trophy, X } from 'lucide-vue-next'

type Phase = 'idle' | 'lobby' | 'question' | 'results'

const phase = ref<Phase>('idle')
const showCreateModal = ref(false)
const newSession = ref({ title: '', class: '', timePerQuestion: 20 })

// Questions are loaded from teacher's vocab sets, not hardcoded
const demoQuestions: { question: string; options: string[]; correct: number }[] = []

interface Player {
  id: number
  name: string
  color: string
  score: number
  answered: boolean
}

const playerNames = ['Nguyen Van A', 'Tran Thi B', 'Le Van C', 'Pham Thi D', 'Hoang Van E', 'Bui Thi F']
const playerColors = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-primary)']

const session = ref({
  pin: '',
  title: '',
  class: '',
  timePerQuestion: 20,
  questions: demoQuestions,
})

const joinedPlayers = ref<Player[]>([])
const currentQIndex = ref(0)
const timeLeft = ref(20)
const answeredCount = ref(0)

let timer: ReturnType<typeof setInterval> | null = null
let autoAnswerTimer: ReturnType<typeof setTimeout> | null = null

const currentQuestion = computed(() => session.value.questions[currentQIndex.value])
const sortedPlayers = computed(() => [...joinedPlayers.value].sort((a, b) => b.score - a.score))
const podium = computed(() => sortedPlayers.value.slice(0, 3))

const optionColors = ['bg-chart-5', 'bg-chart-2', 'bg-chart-1', 'bg-chart-3']

const howItWorks = [
  { step: 1, icon: Radio, title: 'Create a Session', desc: 'Set title, class, and time per question. A unique PIN is generated.', bg: 'bg-primary/10', color: 'text-primary' },
  { step: 2, icon: Users, title: 'Students Join', desc: 'Students go to studyspark.app/join and enter the PIN to connect.', bg: 'bg-chart-2/10', color: 'text-chart-2' },
  { step: 3, icon: Trophy, title: 'Play Live!', desc: 'Questions display one at a time. Speed-based scoring, real-time leaderboard.', bg: 'bg-chart-3/10', color: 'text-chart-3' },
]

const pastSessions = ref<{ id: number; title: string; class: string; date: string; players: number; avgScore: number; bg: string; color: string }[]>([])

const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString()

const createSession = () => {
  newSession.value = { title: '', class: '', timePerQuestion: 20 }
  showCreateModal.value = true
}

const confirmCreate = () => {
  if (!newSession.value.title.trim()) return
  session.value = {
    pin: generatePin(),
    title: newSession.value.title,
    class: newSession.value.class,
    timePerQuestion: newSession.value.timePerQuestion,
    questions: demoQuestions,
  }
  joinedPlayers.value = []
  showCreateModal.value = false
  phase.value = 'lobby'
}

const simulateJoin = () => {
  const idx = joinedPlayers.value.length % playerNames.length
  joinedPlayers.value.push({
    id: Date.now(),
    name: playerNames[idx],
    color: playerColors[idx],
    score: 0,
    answered: false,
  })
}

const cancelSession = () => {
  phase.value = 'idle'
}

const startQuiz = () => {
  currentQIndex.value = 0
  joinedPlayers.value.forEach(p => { p.score = 0; p.answered = false })
  phase.value = 'question'
  startTimer()
}

const startTimer = () => {
  if (timer) clearInterval(timer)
  timeLeft.value = session.value.timePerQuestion
  answeredCount.value = 0
  joinedPlayers.value.forEach(p => { p.answered = false })

  // Simulate players answering at random times
  joinedPlayers.value.forEach(p => {
    const delay = 2000 + Math.random() * (session.value.timePerQuestion - 3) * 1000
    autoAnswerTimer = setTimeout(() => {
      if (!p.answered && phase.value === 'question') {
        p.answered = true
        const correct = Math.random() > 0.35
        if (correct) p.score += Math.max(500, timeLeft.value * 50)
        answeredCount.value++
      }
    }, delay)
  })

  timer = setInterval(() => {
    if (timeLeft.value <= 0) {
      clearInterval(timer!)
      timer = null
    } else {
      timeLeft.value--
    }
  }, 1000)
}

const nextQuestion = () => {
  if (timer) { clearInterval(timer); timer = null }
  if (currentQIndex.value < session.value.questions.length - 1) {
    currentQIndex.value++
    startTimer()
  } else {
    phase.value = 'results'
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (autoAnswerTimer) clearTimeout(autoAnswerTimer)
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
