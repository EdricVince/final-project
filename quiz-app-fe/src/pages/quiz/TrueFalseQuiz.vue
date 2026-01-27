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
        :current-question="gameState.currentQuestion + 1"
        :total-questions="questions.length"
        :score="gameState.score"
        :streak="gameState.streak"
        @exit="confirmExit"
      />

      <!-- Question Card -->
      <div class="mx-auto mt-6 max-w-2xl">
        <Transition name="slide-up" mode="out-in">
          <div :key="gameState.currentQuestion" class="bg-card border-border rounded-3xl border p-6 shadow-lg lg:p-8">
            <!-- Question Badge -->
            <div class="mb-6 flex items-center justify-center">
              <span class="bg-primary/10 text-primary rounded-lg px-4 py-2 text-sm font-medium">
                Statement {{ gameState.currentQuestion + 1 }} of {{ questions.length }}
              </span>
            </div>

            <!-- Statement -->
            <div class="bg-secondary/30 mb-8 rounded-2xl p-6 lg:p-8">
              <p class="text-foreground text-center text-lg font-medium leading-relaxed lg:text-xl">
                "{{ currentQuestion?.statement }}"
              </p>
            </div>

            <!-- True/False Buttons -->
            <div class="flex gap-4">
              <button
                class="answer-btn group flex-1 rounded-2xl p-6 transition-all duration-300 lg:p-8"
                :class="getTrueButtonClass"
                :disabled="selectedAnswer !== null"
                @click="selectAnswer(true)"
              >
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    :class="selectedAnswer === null ? 'bg-primary/10' : ''"
                  >
                    <CheckCircle class="h-8 w-8" :class="selectedAnswer === null ? 'text-primary' : ''" />
                  </div>
                  <span class="text-xl font-bold">TRUE</span>
                </div>
              </button>

              <button
                class="answer-btn group flex-1 rounded-2xl p-6 transition-all duration-300 lg:p-8"
                :class="getFalseButtonClass"
                :disabled="selectedAnswer !== null"
                @click="selectAnswer(false)"
              >
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    :class="selectedAnswer === null ? 'bg-destructive/10' : ''"
                  >
                    <XCircle class="h-8 w-8" :class="selectedAnswer === null ? 'text-destructive' : ''" />
                  </div>
                  <span class="text-xl font-bold">FALSE</span>
                </div>
              </button>
            </div>

            <!-- Feedback -->
            <Transition name="fade-scale">
              <div
                v-if="selectedAnswer !== null"
                class="mt-6 rounded-2xl p-5"
                :class="isCorrect ? 'bg-primary/10' : 'bg-destructive/10'"
              >
                <div class="mb-3 flex items-center justify-center gap-2">
                  <CheckCircle v-if="isCorrect" class="text-primary h-6 w-6" />
                  <XCircle v-else class="text-destructive h-6 w-6" />
                  <span
                    class="text-lg font-bold"
                    :class="isCorrect ? 'text-primary' : 'text-destructive'"
                  >
                    {{ isCorrect ? 'Correct!' : 'Incorrect!' }}
                  </span>
                </div>
                <p class="text-muted-foreground text-center text-sm">
                  {{ currentQuestion?.explanation }}
                </p>
              </div>
            </Transition>

            <!-- Next Button -->
            <Transition name="fade-scale">
              <button
                v-if="selectedAnswer !== null"
                class="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors"
                @click="nextQuestion"
              >
                {{ isLastQuestion ? 'See Results' : 'Next Statement' }}
                <ArrowRight class="h-5 w-5" />
              </button>
            </Transition>
          </div>
        </Transition>
      </div>

      <!-- Quick Stats -->
      <div class="mx-auto mt-6 max-w-2xl">
        <div class="flex justify-center gap-8">
          <div class="text-center">
            <div class="text-primary text-2xl font-bold">{{ gameState.correctCount }}</div>
            <div class="text-muted-foreground text-sm">Correct</div>
          </div>
          <div class="text-center">
            <div class="text-destructive text-2xl font-bold">{{ gameState.wrongCount }}</div>
            <div class="text-muted-foreground text-sm">Wrong</div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-vue-next'
import QuizHeader from '@/components/quiz/QuizHeader.vue'
import QuizResult from '@/components/quiz/QuizResult.vue'
import type { TrueFalseQuestion, QuizResult as QuizResultType, QuizState } from '@/types/quiz'

const router = useRouter()

const gameState = ref<QuizState>({
  status: 'playing',
  currentQuestion: 0,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  streak: 0,
  timeRemaining: 0,
  answers: [],
})

const selectedAnswer = ref<boolean | null>(null)
const isCorrect = ref(false)
const showExitModal = ref(false)
const startTime = ref(Date.now())

const questions = ref<TrueFalseQuestion[]>([
  {
    id: 1,
    statement: 'The word "beautiful" has three syllables.',
    isTrue: true,
    explanation: 'Beau-ti-ful has three syllables.',
  },
  {
    id: 2,
    statement: '"Their" and "there" have the same meaning.',
    isTrue: false,
    explanation: '"Their" shows possession, while "there" refers to a place.',
  },
  {
    id: 3,
    statement: 'The past tense of "go" is "went".',
    isTrue: true,
    explanation: '"Went" is the irregular past tense of "go".',
  },
  {
    id: 4,
    statement: 'An adjective describes an action.',
    isTrue: false,
    explanation: 'An adjective describes a noun. Verbs describe actions.',
  },
  {
    id: 5,
    statement: '"I" should always be capitalized in English.',
    isTrue: true,
    explanation: 'The pronoun "I" is always capitalized in English.',
  },
  {
    id: 6,
    statement: '"Quickly" is an adverb.',
    isTrue: true,
    explanation: '"Quickly" describes how an action is done (adverb).',
  },
  {
    id: 7,
    statement: 'The plural of "child" is "childs".',
    isTrue: false,
    explanation: 'The correct plural is "children" (irregular).',
  },
  {
    id: 8,
    statement: '"A" and "an" are both articles.',
    isTrue: true,
    explanation: 'Both "a" and "an" are indefinite articles.',
  },
  {
    id: 9,
    statement: 'A sentence must have a subject and a verb.',
    isTrue: true,
    explanation: 'A complete sentence requires at least a subject and a verb.',
  },
  {
    id: 10,
    statement: '"Effect" and "affect" mean the same thing.',
    isTrue: false,
    explanation: '"Affect" is usually a verb, "effect" is usually a noun.',
  },
  {
    id: 11,
    statement: 'The word "photograph" comes from Greek.',
    isTrue: true,
    explanation: '"Photo" (light) + "graph" (writing) are Greek roots.',
  },
  {
    id: 12,
    statement: 'A comma splice is grammatically correct.',
    isTrue: false,
    explanation: 'A comma splice (two independent clauses joined only by a comma) is incorrect.',
  },
])

const currentQuestion = computed(() => questions.value[gameState.value.currentQuestion])
const isLastQuestion = computed(() => gameState.value.currentQuestion >= questions.value.length - 1)

const getTrueButtonClass = computed(() => {
  if (selectedAnswer.value === null) {
    return 'bg-secondary hover:bg-primary/20 text-foreground'
  }

  if (currentQuestion.value?.isTrue) {
    return 'bg-primary text-primary-foreground'
  }

  if (selectedAnswer.value === true) {
    return 'bg-destructive text-destructive-foreground'
  }

  return 'bg-secondary/50 opacity-50'
})

const getFalseButtonClass = computed(() => {
  if (selectedAnswer.value === null) {
    return 'bg-secondary hover:bg-destructive/20 text-foreground'
  }

  if (!currentQuestion.value?.isTrue) {
    return 'bg-primary text-primary-foreground'
  }

  if (selectedAnswer.value === false) {
    return 'bg-destructive text-destructive-foreground'
  }

  return 'bg-secondary/50 opacity-50'
})

const quizResult = computed<QuizResultType>(() => {
  const timeSpent = Math.floor((Date.now() - startTime.value) / 1000)
  const accuracy = Math.round((gameState.value.correctCount / questions.value.length) * 100)
  return {
    totalQuestions: questions.value.length,
    correctAnswers: gameState.value.correctCount,
    wrongAnswers: gameState.value.wrongCount,
    score: gameState.value.score,
    timeSpent,
    xpEarned: gameState.value.score + Math.floor(accuracy / 10) * 10,
    accuracy,
    streakBonus: gameState.value.streak > 2 ? gameState.value.streak * 10 : 0,
  }
})

const selectAnswer = (answer: boolean) => {
  if (selectedAnswer.value !== null) return

  selectedAnswer.value = answer
  isCorrect.value = answer === currentQuestion.value?.isTrue

  if (isCorrect.value) {
    gameState.value.correctCount++
    gameState.value.streak++
    gameState.value.score += 100 + gameState.value.streak * 10
  } else {
    gameState.value.wrongCount++
    gameState.value.streak = 0
  }
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    gameState.value.status = 'finished'
  } else {
    gameState.value.currentQuestion++
    selectedAnswer.value = null
    isCorrect.value = false
  }
}

const confirmExit = () => {
  showExitModal.value = true
}

const goToQuizzes = () => {
  router.push('/quizzes')
}

const restartQuiz = () => {
  gameState.value = {
    status: 'playing',
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    streak: 0,
    timeRemaining: 0,
    answers: [],
  }
  selectedAnswer.value = null
  isCorrect.value = false
  startTime.value = Date.now()
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
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

.answer-btn:not(:disabled):active {
  transform: scale(0.98);
}
</style>
