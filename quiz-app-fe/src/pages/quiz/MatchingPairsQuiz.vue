<template>
  <div class="min-h-screen p-4 lg:p-6">
    <!-- Show Result -->
    <QuizResult
      v-if="gameState.status === 'finished'"
      :result="quizResult"
      @play-again="restartQuiz"
      @go-home="goToQuizzes"
    />

    <!-- Quiz Game -->
    <template v-else>
      <!-- Header -->
      <QuizHeader
        :current-question="matchedPairs"
        :total-questions="pairs.length"
        :score="gameState.score"
        :streak="gameState.streak"
        :time-remaining="timeRemaining"
        :show-timer="true"
        @exit="confirmExit"
      />

      <!-- Game Instructions -->
      <div class="mx-auto mt-4 max-w-4xl">
        <div class="bg-secondary/50 mb-6 rounded-xl p-4 text-center">
          <p class="text-muted-foreground text-sm">
            <span class="font-medium">Match the words with their meanings!</span>
            Click a word, then click its matching definition.
          </p>
        </div>

        <!-- Game Board -->
        <div class="grid grid-cols-2 gap-4 lg:gap-6">
          <!-- Words Column -->
          <div class="space-y-3">
            <h3 class="text-muted-foreground mb-2 text-center text-sm font-medium">Words</h3>
            <button
              v-for="card in wordCards"
              :key="`word-${card.id}`"
              class="card-btn w-full rounded-2xl p-4 text-left transition-all duration-300 lg:p-5"
              :class="getCardClass(card, 'word')"
              :disabled="card.isMatched"
              @click="selectCard(card, 'word')"
            >
              <span class="text-base font-medium lg:text-lg">{{ card.content }}</span>
            </button>
          </div>

          <!-- Definitions Column -->
          <div class="space-y-3">
            <h3 class="text-muted-foreground mb-2 text-center text-sm font-medium">Definitions</h3>
            <button
              v-for="card in definitionCards"
              :key="`def-${card.id}`"
              class="card-btn w-full rounded-2xl p-4 text-left transition-all duration-300 lg:p-5"
              :class="getCardClass(card, 'definition')"
              :disabled="card.isMatched"
              @click="selectCard(card, 'definition')"
            >
              <span class="text-sm lg:text-base">{{ card.content }}</span>
            </button>
          </div>
        </div>

        <!-- Feedback -->
        <Transition name="fade-scale">
          <div
            v-if="showFeedback"
            class="mt-6 rounded-2xl p-4 text-center"
            :class="lastMatchCorrect ? 'bg-primary/10' : 'bg-destructive/10'"
          >
            <div class="flex items-center justify-center gap-2">
              <CheckCircle v-if="lastMatchCorrect" class="text-primary h-6 w-6" />
              <XCircle v-else class="text-destructive h-6 w-6" />
              <span
                class="text-lg font-semibold"
                :class="lastMatchCorrect ? 'text-primary' : 'text-destructive'"
              >
                {{ lastMatchCorrect ? 'Great Match! +' + (100 + gameState.streak * 10) + ' pts' : 'Try Again!' }}
              </span>
            </div>
          </div>
        </Transition>

        <!-- Stats -->
        <div class="mt-6 flex items-center justify-center gap-6">
          <div class="text-center">
            <p class="text-foreground text-2xl font-bold">{{ matchedPairs }}</p>
            <p class="text-muted-foreground text-sm">Matched</p>
          </div>
          <div class="bg-border h-10 w-px"></div>
          <div class="text-center">
            <p class="text-foreground text-2xl font-bold">{{ attempts }}</p>
            <p class="text-muted-foreground text-sm">Attempts</p>
          </div>
          <div class="bg-border h-10 w-px"></div>
          <div class="text-center">
            <p class="text-foreground text-2xl font-bold">{{ accuracy }}%</p>
            <p class="text-muted-foreground text-sm">Accuracy</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Exit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showExitModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          @click.self="showExitModal = false"
        >
          <div class="bg-card border-border w-full max-w-sm rounded-2xl border p-6 shadow-xl">
            <h3 class="text-foreground mb-2 text-lg font-semibold">Exit Quiz?</h3>
            <p class="text-muted-foreground mb-6">Your progress will be lost.</p>
            <div class="flex gap-3">
              <button
                class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-3 font-medium"
                @click="showExitModal = false"
              >
                Continue
              </button>
              <button
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1 rounded-xl py-3 font-medium"
                @click="goToQuizzes"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, XCircle } from 'lucide-vue-next'
import QuizHeader from '@/components/quiz/QuizHeader.vue'
import QuizResult from '@/components/quiz/QuizResult.vue'
import type { MatchingPair, QuizResult as QuizResultType, QuizState } from '@/types/quiz'

interface Card {
  id: number
  content: string
  pairId: number
  isMatched: boolean
}

const router = useRouter()

const gameState = ref<QuizState>({
  status: 'playing',
  currentQuestion: 0,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  streak: 0,
  timeRemaining: 180, // 3 minutes
  answers: [],
})

const pairs = ref<MatchingPair[]>([
  { id: 1, term: 'Abundant', definition: 'Existing in large quantities' },
  { id: 2, term: 'Eloquent', definition: 'Fluent and persuasive in speaking' },
  { id: 3, term: 'Persevere', definition: 'Continue despite difficulties' },
  { id: 4, term: 'Ambiguous', definition: 'Open to multiple interpretations' },
  { id: 5, term: 'Meticulous', definition: 'Very careful and precise' },
  { id: 6, term: 'Resilient', definition: 'Able to recover quickly' },
  { id: 7, term: 'Pragmatic', definition: 'Dealing with things sensibly' },
  { id: 8, term: 'Inevitable', definition: 'Certain to happen' },
])

const wordCards = ref<Card[]>([])
const definitionCards = ref<Card[]>([])
const selectedWord = ref<Card | null>(null)
const selectedDefinition = ref<Card | null>(null)
const showFeedback = ref(false)
const lastMatchCorrect = ref(false)
const attempts = ref(0)
const matchedPairs = ref(0)
const timeRemaining = ref(180)
const showExitModal = ref(false)
const startTime = ref(Date.now())

let timerInterval: ReturnType<typeof setInterval> | null = null

const accuracy = computed(() => {
  if (attempts.value === 0) return 100
  return Math.round((matchedPairs.value / attempts.value) * 100)
})

const quizResult = computed<QuizResultType>(() => {
  const timeSpent = 180 - timeRemaining.value
  const accuracyValue = Math.round((matchedPairs.value / pairs.value.length) * 100)
  return {
    totalQuestions: pairs.value.length,
    correctAnswers: matchedPairs.value,
    wrongAnswers: attempts.value - matchedPairs.value,
    score: gameState.value.score,
    timeSpent,
    xpEarned: gameState.value.score + Math.floor(accuracyValue / 10) * 10,
    accuracy: accuracyValue,
    streakBonus: gameState.value.streak > 2 ? gameState.value.streak * 10 : 0,
  }
})

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const initializeGame = () => {
  // Create word cards
  wordCards.value = shuffleArray(
    pairs.value.map((p, i) => ({
      id: i,
      content: p.term,
      pairId: p.id,
      isMatched: false,
    }))
  )

  // Create definition cards
  definitionCards.value = shuffleArray(
    pairs.value.map((p, i) => ({
      id: i + pairs.value.length,
      content: p.definition,
      pairId: p.id,
      isMatched: false,
    }))
  )

  selectedWord.value = null
  selectedDefinition.value = null
  matchedPairs.value = 0
  attempts.value = 0
  timeRemaining.value = 180
  gameState.value.score = 0
  gameState.value.streak = 0
}

const getCardClass = (card: Card, type: 'word' | 'definition') => {
  if (card.isMatched) {
    return 'bg-primary/10 border-2 border-primary opacity-60 cursor-default'
  }

  const isSelected =
    (type === 'word' && selectedWord.value?.id === card.id) ||
    (type === 'definition' && selectedDefinition.value?.id === card.id)

  if (isSelected) {
    return 'bg-primary text-primary-foreground border-2 border-primary scale-[1.02]'
  }

  return 'bg-card border-2 border-border hover:border-primary/50 hover:bg-secondary/50'
}

const selectCard = (card: Card, type: 'word' | 'definition') => {
  if (card.isMatched || showFeedback.value) return

  if (type === 'word') {
    selectedWord.value = card
  } else {
    selectedDefinition.value = card
  }

  // Check if both are selected
  if (selectedWord.value && selectedDefinition.value) {
    checkMatch()
  }
}

const checkMatch = () => {
  if (!selectedWord.value || !selectedDefinition.value) return

  attempts.value++
  const isMatch = selectedWord.value.pairId === selectedDefinition.value.pairId

  lastMatchCorrect.value = isMatch
  showFeedback.value = true

  if (isMatch) {
    // Mark as matched
    const wordCard = wordCards.value.find(c => c.id === selectedWord.value!.id)
    const defCard = definitionCards.value.find(c => c.id === selectedDefinition.value!.id)
    if (wordCard) wordCard.isMatched = true
    if (defCard) defCard.isMatched = true

    matchedPairs.value++
    gameState.value.streak++
    gameState.value.score += 100 + gameState.value.streak * 10

    // Check if all matched
    if (matchedPairs.value === pairs.value.length) {
      setTimeout(() => {
        gameState.value.status = 'finished'
        if (timerInterval) clearInterval(timerInterval)
      }, 1000)
    }
  } else {
    gameState.value.streak = 0
  }

  // Clear selection after delay
  setTimeout(() => {
    selectedWord.value = null
    selectedDefinition.value = null
    showFeedback.value = false
  }, 1000)
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      gameState.value.status = 'finished'
      if (timerInterval) clearInterval(timerInterval)
    }
  }, 1000)
}

const confirmExit = () => {
  showExitModal.value = true
}

const goToQuizzes = () => {
  if (timerInterval) clearInterval(timerInterval)
  router.push('/quizzes')
}

const restartQuiz = () => {
  gameState.value.status = 'playing'
  initializeGame()
  startTime.value = Date.now()
  startTimer()
}

onMounted(() => {
  initializeGame()
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.card-btn {
  transition: all 0.2s ease;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
