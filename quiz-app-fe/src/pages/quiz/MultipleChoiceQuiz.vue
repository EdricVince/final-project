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
            <!-- Question Number Badge -->
            <div class="mb-6 flex items-center justify-between">
              <span class="bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-sm font-medium">
                Question {{ gameState.currentQuestion + 1 }}
              </span>
              <span class="text-muted-foreground text-sm">
                +{{ getQuestionPoints() }} points
              </span>
            </div>

            <!-- Question Text -->
            <h2 class="text-foreground mb-8 text-xl font-semibold lg:text-2xl">
              {{ currentQuestion?.question }}
            </h2>

            <!-- Options -->
            <div class="space-y-3">
              <button
                v-for="(option, index) in currentQuestion?.options"
                :key="index"
                class="option-btn group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300"
                :class="getOptionClass(option)"
                :disabled="selectedAnswer !== null"
                @click="selectAnswer(option)"
              >
                <div
                  class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300"
                  :class="getOptionBadgeClass(option)"
                >
                  {{ String.fromCharCode(65 + index) }}
                </div>
                <span class="text-foreground flex-1 text-base font-medium lg:text-lg">{{ option }}</span>
                <div v-if="selectedAnswer === option" class="flex-shrink-0">
                  <CheckCircle v-if="isCorrectAnswer(option)" class="h-6 w-6 text-primary" />
                  <XCircle v-else class="text-destructive h-6 w-6" />
                </div>
              </button>
            </div>

            <!-- Feedback -->
            <Transition name="fade-scale">
              <div
                v-if="selectedAnswer !== null"
                class="mt-6 rounded-2xl p-4"
                :class="isCorrectAnswer(selectedAnswer) ? 'bg-primary/10' : 'bg-destructive/10'"
              >
                <div class="mb-2 flex items-center gap-2">
                  <CheckCircle v-if="isCorrectAnswer(selectedAnswer)" class="text-primary h-5 w-5" />
                  <XCircle v-else class="text-destructive h-5 w-5" />
                  <span
                    class="font-semibold"
                    :class="isCorrectAnswer(selectedAnswer) ? 'text-primary' : 'text-destructive'"
                  >
                    {{ isCorrectAnswer(selectedAnswer) ? 'Correct!' : 'Incorrect!' }}
                  </span>
                </div>
                <p v-if="currentQuestion?.explanation" class="text-muted-foreground text-sm">
                  {{ currentQuestion.explanation }}
                </p>
                <p v-if="!isCorrectAnswer(selectedAnswer)" class="text-muted-foreground mt-1 text-sm">
                  The correct answer is: <strong class="text-foreground">{{ currentQuestion?.correctAnswer }}</strong>
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
                {{ isLastQuestion ? 'See Results' : 'Next Question' }}
                <ArrowRight class="h-5 w-5" />
              </button>
            </Transition>
          </div>
        </Transition>
      </div>
    </template>

    <!-- Exit Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showExitModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          @click.self="showExitModal = false"
        >
          <div class="bg-card border-border w-full max-w-sm rounded-2xl border p-6 shadow-xl">
            <h3 class="text-foreground mb-2 text-lg font-semibold">Exit Quiz?</h3>
            <p class="text-muted-foreground mb-6">Your progress will be lost if you exit now.</p>
            <div class="flex gap-3">
              <button
                class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-3 font-medium transition-colors"
                @click="showExitModal = false"
              >
                Continue
              </button>
              <button
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1 rounded-xl py-3 font-medium transition-colors"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-vue-next'
import QuizHeader from '@/components/quiz/QuizHeader.vue'
import QuizResult from '@/components/quiz/QuizResult.vue'
import type { MultipleChoiceQuestion, QuizResult as QuizResultType, QuizState } from '@/types/quiz'

const router = useRouter()

// Game state
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

const selectedAnswer = ref<string | null>(null)
const showExitModal = ref(false)
const startTime = ref(Date.now())

// Sample questions
const questions = ref<MultipleChoiceQuestion[]>([
  {
    id: 1,
    question: 'What is the past tense of "go"?',
    options: ['goed', 'went', 'gone', 'going'],
    correctAnswer: 'went',
    explanation: '"Went" is the irregular past tense of "go".',
  },
  {
    id: 2,
    question: 'Which word is a synonym for "happy"?',
    options: ['sad', 'joyful', 'angry', 'tired'],
    correctAnswer: 'joyful',
    explanation: '"Joyful" means feeling or expressing great happiness.',
  },
  {
    id: 3,
    question: 'Choose the correct sentence:',
    options: [
      'She don\'t like coffee.',
      'She doesn\'t likes coffee.',
      'She doesn\'t like coffee.',
      'She not like coffee.',
    ],
    correctAnswer: 'She doesn\'t like coffee.',
    explanation: 'Use "doesn\'t" + base verb for third person singular negative.',
  },
  {
    id: 4,
    question: 'What does "ubiquitous" mean?',
    options: ['rare', 'everywhere', 'beautiful', 'dangerous'],
    correctAnswer: 'everywhere',
    explanation: '"Ubiquitous" means present, appearing, or found everywhere.',
  },
  {
    id: 5,
    question: 'Which is the correct plural form of "child"?',
    options: ['childs', 'childes', 'children', 'childrens'],
    correctAnswer: 'children',
    explanation: '"Children" is the irregular plural of "child".',
  },
  {
    id: 6,
    question: 'What is the opposite of "ancient"?',
    options: ['old', 'modern', 'historic', 'antique'],
    correctAnswer: 'modern',
    explanation: '"Modern" is the antonym of "ancient" (very old).',
  },
  {
    id: 7,
    question: 'Choose the correct preposition: "I\'m interested ___ learning English."',
    options: ['at', 'in', 'on', 'for'],
    correctAnswer: 'in',
    explanation: 'The correct collocation is "interested in".',
  },
  {
    id: 8,
    question: 'What type of word is "quickly"?',
    options: ['noun', 'verb', 'adjective', 'adverb'],
    correctAnswer: 'adverb',
    explanation: '"Quickly" is an adverb that describes how an action is done.',
  },
  {
    id: 9,
    question: 'Which sentence uses the present perfect correctly?',
    options: [
      'I have saw that movie.',
      'I have seen that movie.',
      'I have seeing that movie.',
      'I has seen that movie.',
    ],
    correctAnswer: 'I have seen that movie.',
    explanation: 'Present perfect: have/has + past participle (seen).',
  },
  {
    id: 10,
    question: 'What does the idiom "break the ice" mean?',
    options: [
      'To destroy something',
      'To start a conversation',
      'To cool down',
      'To break rules',
    ],
    correctAnswer: 'To start a conversation',
    explanation: '"Break the ice" means to initiate social interaction.',
  },
])

const currentQuestion = computed(() => questions.value[gameState.value.currentQuestion])
const isLastQuestion = computed(() => gameState.value.currentQuestion >= questions.value.length - 1)

const quizResult = computed<QuizResultType>(() => {
  const timeSpent = Math.floor((Date.now() - startTime.value) / 1000)
  const accuracy = Math.round((gameState.value.correctCount / questions.value.length) * 100)
  const xpEarned = gameState.value.score + Math.floor(accuracy / 10) * 10

  return {
    totalQuestions: questions.value.length,
    correctAnswers: gameState.value.correctCount,
    wrongAnswers: gameState.value.wrongCount,
    score: gameState.value.score,
    timeSpent,
    xpEarned,
    accuracy,
    streakBonus: gameState.value.streak > 2 ? gameState.value.streak * 10 : 0,
  }
})

const getQuestionPoints = () => {
  const basePoints = 100
  const streakBonus = gameState.value.streak * 10
  return basePoints + streakBonus
}

const getOptionClass = (option: string) => {
  if (selectedAnswer.value === null) {
    return 'bg-secondary/50 hover:bg-secondary border-2 border-transparent hover:border-primary/30'
  }

  if (option === currentQuestion.value?.correctAnswer) {
    return 'bg-primary/10 border-2 border-primary'
  }

  if (option === selectedAnswer.value && option !== currentQuestion.value?.correctAnswer) {
    return 'bg-destructive/10 border-2 border-destructive'
  }

  return 'bg-secondary/30 border-2 border-transparent opacity-50'
}

const getOptionBadgeClass = (option: string) => {
  if (selectedAnswer.value === null) {
    return 'bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground'
  }

  if (option === currentQuestion.value?.correctAnswer) {
    return 'bg-primary text-primary-foreground'
  }

  if (option === selectedAnswer.value && option !== currentQuestion.value?.correctAnswer) {
    return 'bg-destructive text-destructive-foreground'
  }

  return 'bg-muted text-muted-foreground'
}

const isCorrectAnswer = (answer: string) => {
  return answer === currentQuestion.value?.correctAnswer
}

const selectAnswer = (option: string) => {
  if (selectedAnswer.value !== null) return

  selectedAnswer.value = option
  const isCorrect = isCorrectAnswer(option)

  if (isCorrect) {
    gameState.value.correctCount++
    gameState.value.streak++
    gameState.value.score += getQuestionPoints()
  } else {
    gameState.value.wrongCount++
    gameState.value.streak = 0
  }

  gameState.value.answers.push({
    questionId: currentQuestion.value!.id,
    userAnswer: option,
    isCorrect,
    timeSpent: 0,
  })
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    gameState.value.status = 'finished'
  } else {
    gameState.value.currentQuestion++
    selectedAnswer.value = null
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
  startTime.value = Date.now()
}

onMounted(() => {
  startTime.value = Date.now()
})
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

.option-btn {
  transform: translateX(0);
}

.option-btn:not(:disabled):hover {
  transform: translateX(4px);
}
</style>
