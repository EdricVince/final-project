<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
          <Flame class="text-primary h-4 w-4" />
        </div>
        <h3 class="text-foreground font-semibold">Daily Challenges</h3>
      </div>
      <div class="flex items-center gap-1 text-sm">
        <Clock class="text-muted-foreground h-4 w-4" />
        <span class="text-muted-foreground">{{ timeRemaining }}</span>
      </div>
    </div>

    <!-- Challenges List -->
    <div class="space-y-3">
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="group relative overflow-hidden rounded-xl border p-4 transition-all"
        :class="challenge.completed
          ? 'border-primary/20 bg-primary/5'
          : 'border-border bg-secondary/30 hover:bg-secondary/50'"
      >
        <div class="flex items-center gap-4">
          <!-- Icon -->
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all"
            :class="'bg-primary/10 text-primary'"
          >
            <component :is="challenge.icon" class="h-5 w-5" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="text-foreground font-medium">{{ challenge.title }}</h4>
              <span
                v-if="challenge.completed"
                class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                Completed
              </span>
            </div>
            <p class="text-muted-foreground text-sm">{{ challenge.description }}</p>

            <!-- Progress Bar (if not completed) -->
            <div v-if="!challenge.completed" class="mt-2">
              <div class="bg-secondary h-2 overflow-hidden rounded-full">
                <div
                  class="bg-primary h-full rounded-full transition-all duration-500"
                  :style="{ width: `${(challenge.current / challenge.target) * 100}%` }"
                ></div>
              </div>
              <p class="text-muted-foreground mt-1 text-xs">
                {{ challenge.current }} / {{ challenge.target }}
              </p>
            </div>
          </div>

          <!-- Reward -->
          <div class="text-right">
            <div
              class="flex items-center gap-1 font-bold"
              :class="'text-primary'"
            >
              <Zap class="h-4 w-4" />
              {{ challenge.xp }} XP
            </div>
          </div>
        </div>

        <!-- Completion checkmark -->
        <div
          v-if="challenge.completed"
          class="absolute right-4 top-4"
        >
          <CheckCircle class="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>

    <!-- Bonus Challenge -->
    <div
      v-if="allCompleted"
      class="mt-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center"
    >
      <div class="mb-2 flex items-center justify-center gap-2">
        <Trophy class="text-primary h-5 w-5" />
        <span class="text-foreground font-semibold">All Challenges Complete!</span>
      </div>
      <p class="text-muted-foreground text-sm">You earned a bonus of <span class="text-primary font-bold">50 XP</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Flame, Clock, Zap, CheckCircle, Trophy, BookOpen, Brain, Layers, Target } from 'lucide-vue-next'

interface Challenge {
  id: number
  title: string
  description: string
  icon: typeof BookOpen
  current: number
  target: number
  xp: number
  completed: boolean
}

const challenges = ref<Challenge[]>([
  {
    id: 1,
    title: 'Learn 10 Words',
    description: 'Study flashcards to learn new vocabulary',
    icon: BookOpen,
    current: 10,
    target: 10,
    xp: 25,
    completed: true,
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
  },
  {
    id: 3,
    title: 'Review 20 Cards',
    description: 'Review flashcards you\'ve learned before',
    icon: Layers,
    current: 12,
    target: 20,
    xp: 20,
    completed: false,
  },
  {
    id: 4,
    title: 'Reach Daily Goal',
    description: 'Complete your daily study goal',
    icon: Target,
    current: 15,
    target: 20,
    xp: 35,
    completed: false,
  },
])

const allCompleted = computed(() => challenges.value.every(c => c.completed))

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
