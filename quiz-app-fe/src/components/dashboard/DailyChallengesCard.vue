<template>
  <div class="bg-card border-border rounded-xl border p-5 lg:p-6">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
          <Flame class="text-primary h-4 w-4" />
        </div>
        <h3 class="text-foreground font-semibold">Daily Challenges</h3>
      </div>
      <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock class="h-3.5 w-3.5" />
        <span>{{ timeRemaining }}</span>
      </div>
    </div>

    <!-- Challenges List -->
    <div class="space-y-2">
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="group relative cursor-pointer overflow-hidden rounded-lg border p-3.5 transition-all duration-200"
        :class="challenge.completed
          ? 'border-primary/20 bg-primary/5'
          : 'border-border bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30'"
        @click="openDetail(challenge)"
      >
        <div class="flex items-center gap-3">
          <!-- Icon -->
          <div class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <component :is="challenge.icon" class="h-4 w-4" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-foreground text-sm font-medium">{{ challenge.title }}</h4>
              <span
                v-if="challenge.completed"
                class="text-primary text-xs font-medium"
              >
                ✓
              </span>
            </div>
            <p class="text-muted-foreground text-xs">{{ challenge.description }}</p>

            <!-- Progress Bar (if not completed) -->
            <div v-if="!challenge.completed" class="mt-2">
              <div class="bg-secondary/50 h-1.5 overflow-hidden rounded-full">
                <div
                  class="bg-primary h-full rounded-full transition-all duration-500"
                  :style="{ width: `${(challenge.current / challenge.target) * 100}%` }"
                />
              </div>
              <p class="text-muted-foreground mt-1 text-xs">
                {{ challenge.current }} / {{ challenge.target }}
              </p>
            </div>
          </div>

          <!-- Reward -->
          <div class="flex shrink-0 items-center gap-1 text-primary text-sm font-semibold">
            <Zap class="h-3.5 w-3.5" />
            {{ challenge.xp }}
          </div>
        </div>
      </div>
    </div>

    <!-- Completion Message -->
    <div
      v-if="allCompleted"
      class="mt-4 rounded-lg bg-primary/5 px-4 py-3 text-center"
    >
      <p class="text-foreground text-sm font-medium">
        All challenges complete! 🎉 <span class="text-primary">+50 XP bonus</span>
      </p>
    </div>
    <div v-else class="mt-4 rounded-lg bg-secondary/20 px-4 py-2.5 text-center">
      <p class="text-muted-foreground text-xs">
        <span class="font-medium text-foreground">{{ challenges.filter(c => !c.completed).length }}</span> challenge{{ challenges.filter(c => !c.completed).length !== 1 ? 's' : '' }} remaining
      </p>
    </div>
  </div>

  <!-- Detail Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="selectedChallenge"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="selectedChallenge = null"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="selectedChallenge = null" />
        <div class="bg-card border-border relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-xl">
          <!-- Header -->
          <div class="mb-5 flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <component :is="selectedChallenge.icon" class="text-primary h-6 w-6" />
              </div>
              <div>
                <h3 class="text-foreground font-semibold">{{ selectedChallenge.title }}</h3>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="selectedChallenge.completed ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'"
                >
                  {{ selectedChallenge.completed ? 'Completed' : 'In Progress' }}
                </span>
              </div>
            </div>
            <button class="text-muted-foreground hover:text-foreground" @click="selectedChallenge = null">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Description -->
          <p class="text-muted-foreground mb-5 text-sm">{{ selectedChallenge.description }}</p>

          <!-- Progress -->
          <div class="mb-5">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="text-foreground font-medium">Progress</span>
              <span class="text-muted-foreground">{{ selectedChallenge.current }} / {{ selectedChallenge.target }}</span>
            </div>
            <div class="bg-secondary h-3 overflow-hidden rounded-full">
              <div
                class="bg-primary h-full rounded-full transition-all duration-500"
                :style="{ width: `${Math.min((selectedChallenge.current / selectedChallenge.target) * 100, 100)}%` }"
              ></div>
            </div>
          </div>

          <!-- Reward -->
          <div class="border-border bg-secondary/30 mb-5 flex items-center justify-between rounded-xl border px-4 py-3">
            <span class="text-muted-foreground text-sm">XP Reward</span>
            <div class="text-primary flex items-center gap-1 font-bold">
              <Zap class="h-4 w-4" />
              {{ selectedChallenge.xp }} XP
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
              @click="selectedChallenge = null"
            >
              Close
            </button>
            <button
              v-if="!selectedChallenge.completed"
              class="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors"
              @click="goToChallenge(selectedChallenge)"
            >
              <ArrowRight class="h-4 w-4" />
              Start
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Flame, Clock, Zap, BookOpen, Brain, Layers, Target, X, ArrowRight } from '@/components/icons'

defineEmits<{ claimReward: [challengeId: number] }>()

interface Challenge {
  id: number
  title: string
  description: string
  icon: typeof BookOpen
  current: number
  target: number
  xp: number
  completed: boolean
  path: string
}

const router = useRouter()
const selectedChallenge = ref<Challenge | null>(null)

const challenges = ref<Challenge[]>([
  {
    id: 1,
    title: 'Learn 10 Words',
    description: 'Study flashcards to learn new vocabulary',
    icon: BookOpen,
    current: 0,
    target: 10,
    xp: 25,
    completed: false,
    path: '/flashcards',
  },
  {
    id: 2,
    title: 'Complete a Quiz',
    description: 'Take any quiz and score at least 70%',
    icon: Brain,
    current: 0,
    target: 1,
    xp: 30,
    completed: false,
    path: '/quizzes',
  },
  {
    id: 3,
    title: 'Review 20 Cards',
    description: 'Review flashcards you\'ve learned before',
    icon: Layers,
    current: 0,
    target: 20,
    xp: 20,
    completed: false,
    path: '/flashcards',
  },
  {
    id: 4,
    title: 'Reach Daily Goal',
    description: 'Complete your daily study goal',
    icon: Target,
    current: 0,
    target: 20,
    xp: 35,
    completed: false,
    path: '/goals',
  },
])

const allCompleted = computed(() => challenges.value.every(c => c.completed))

const openDetail = (challenge: Challenge) => {
  selectedChallenge.value = challenge
}

const goToChallenge = (challenge: Challenge) => {
  selectedChallenge.value = null
  router.push(challenge.path)
}

// Time remaining until reset
const timeRemaining = ref('')

const updateTimeRemaining = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  timeRemaining.value = `${hours}h ${minutes}m left`
}

let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateTimeRemaining()
  interval = setInterval(updateTimeRemaining, 60000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
