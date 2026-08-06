<template>
  <div class="min-h-screen p-4 lg:p-6">
    <!-- Loading State (AI is preparing descriptive clues) -->
    <template v-if="isLoading">
      <div class="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
        <p class="text-muted-foreground text-base">Preparing your word clues…</p>
      </div>
    </template>

    <!-- Show Result -->
    <template v-else-if="gameState.status === 'finished'">
      <QuizResult
        :result="quizResult"
        @play-again="restartQuiz"
        @go-home="goToQuizzes"
      />
      <VocabResultsTable v-if="vocabAnswers.length > 0" :entries="vocabAnswers" />
    </template>

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

      <!-- Game Card -->
      <div class="mx-auto mt-6 max-w-2xl">
        <Transition name="slide-up" mode="out-in">
          <div :key="gameState.currentQuestion" class="bg-card border-border rounded-3xl border p-6 shadow-lg lg:p-8">
            <!-- Question Badge -->
            <div class="mb-6 flex items-center justify-between">
              <span class="bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-sm font-medium">
                Word {{ gameState.currentQuestion + 1 }}
              </span>
              <span class="text-muted-foreground text-sm">
                +{{ 100 + gameState.streak * 10 }} points
              </span>
            </div>

            <!-- Hint: a descriptive clue to read, then guess the word -->
            <div class="bg-secondary/50 mb-6 rounded-xl p-4">
              <p class="text-foreground text-sm leading-relaxed">
                <span class="text-primary font-semibold">Clue:</span> {{ currentQuestion?.hint }}
              </p>
              <p v-if="currentQuestion?.example" class="text-muted-foreground mt-2 text-sm italic">
                e.g. {{ currentQuestion.example }}
              </p>
            </div>

            <!-- Scrambled Letters -->
            <div class="mb-8">
              <p class="text-muted-foreground mb-3 text-center text-sm">Unscramble the letters:</p>
              <div class="flex flex-wrap justify-center gap-2">
                <button
                  v-for="(letter, index) in availableLetters"
                  :key="`available-${index}`"
                  class="letter-btn bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold uppercase transition-all duration-200 hover:scale-105 lg:h-14 lg:w-14 lg:text-2xl"
                  :class="{ 'opacity-0 pointer-events-none': letter === null }"
                  @click="selectLetter(index)"
                >
                  {{ letter }}
                </button>
              </div>
            </div>

            <!-- Answer Area -->
            <div class="mb-6">
              <p class="text-muted-foreground mb-3 text-center text-sm">Your answer:</p>
              <div
                class="bg-secondary/30 border-border mx-auto flex min-h-16 max-w-md flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4"
                :class="answerAreaClass"
              >
                <button
                  v-for="(letter, index) in selectedLetters"
                  :key="`selected-${index}`"
                  class="letter-btn bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold uppercase transition-all duration-200 hover:scale-105 lg:h-14 lg:w-14 lg:text-2xl"
                  :disabled="isAnswered"
                  @click="removeLetter(index)"
                >
                  {{ letter }}
                </button>
                <span v-if="selectedLetters.length === 0" class="text-muted-foreground text-sm">
                  Tap letters above to form the word
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-3.5 font-medium transition-colors"
                :disabled="selectedLetters.length === 0 || isAnswered"
                @click="clearAnswer"
              >
                <RotateCcw class="mr-2 inline h-5 w-5" />
                Clear
              </button>
              <button
                class="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-xl py-3.5 font-medium transition-colors disabled:opacity-50"
                :disabled="selectedLetters.length !== currentQuestion?.word.length || isAnswered"
                @click="submitAnswer"
              >
                <Check class="mr-2 inline h-5 w-5" />
                Check
              </button>
            </div>

            <!-- Feedback -->
            <Transition name="fade-scale">
              <div
                v-if="isAnswered"
                class="mt-6 rounded-2xl p-4"
                :class="isCorrect ? 'bg-primary/10' : 'bg-destructive/10'"
              >
                <div class="mb-2 flex items-center gap-2">
                  <CheckCircle v-if="isCorrect" class="text-primary h-5 w-5" />
                  <XCircle v-else class="text-destructive h-5 w-5" />
                  <span
                    class="font-semibold"
                    :class="isCorrect ? 'text-primary' : 'text-destructive'"
                  >
                    {{ isCorrect ? 'Correct!' : 'Incorrect!' }}
                  </span>
                </div>
                <p v-if="!isCorrect" class="text-muted-foreground text-sm">
                  The correct word is: <strong class="text-foreground uppercase">{{ currentQuestion?.word }}</strong>
                </p>
              </div>
            </Transition>

            <!-- Next Button -->
            <Transition name="fade-scale">
              <button
                v-if="isAnswered"
                class="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors"
                @click="nextQuestion"
              >
                {{ isLastQuestion ? 'See Results' : 'Next Word' }}
                <ArrowRight class="h-5 w-5" />
              </button>
            </Transition>
          </div>
        </Transition>
      </div>
    </template>

    <!-- Exit Modal -->
    <QuizExitModal v-model="showExitModal" @confirm="goToQuizzes" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RotateCcw, Check, CheckCircle, XCircle, ArrowRight } from '@/components/icons'
import QuizHeader from '@/components/quiz/QuizHeader.vue'
import QuizResult from '@/components/quiz/QuizResult.vue'
import VocabResultsTable from '@/components/quiz/VocabResultsTable.vue'
import QuizExitModal from '@/components/quiz/QuizExitModal.vue'
import type { WordScrambleQuestion, QuizResult as QuizResultType, QuizState } from '@/types/quiz'
import { useProgressStore } from '@/stores/progress.store'
import { useQuizStore } from '@/stores/quiz.store'
import { useToast } from '@/composables/useToast'
import { useVocabulary, type VocabScrambleQuestion } from '@/composables/useVocabulary'

const router = useRouter()
const route = useRoute()
const progressStore = useProgressStore()
const quizStore = useQuizStore()
const toast = useToast()
const { generateScrambleQuestions, generateAiScrambleQuestions } = useVocabulary()

const questionCount = computed(() => Math.min(Math.max(parseInt(route.query.count as string) || 10, 3), 50))

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

const selectedLetters = ref<string[]>([])
const letterSources = ref<number[]>([])
const availableLetters = ref<(string | null)[]>([])
const isAnswered = ref(false)
const isCorrect = ref(false)
const showExitModal = ref(false)
const startTime = ref(Date.now())
const vocabAnswers = ref<{ termDisplay: string; meaningDisplay: string; isCorrect: boolean }[]>([])

const isLoading = ref(true)
const questions = ref<WordScrambleQuestion[]>([])

// Prefer AI-generated words (each carries a descriptive clue sentence); top up with
// the local word list if the AI returns too few usable words, or fall back entirely
// when the AI is unavailable.
const loadQuestions = async () => {
  isLoading.value = true
  const target = questionCount.value
  const prev = questions.value.map(q => q.word)
  let qs: WordScrambleQuestion[] = await generateAiScrambleQuestions(target, prev)
  if (qs.length < target) {
    qs = [...qs, ...generateScrambleQuestions(target - qs.length)]
  }
  questions.value = qs
  isLoading.value = false
  initializeQuestion()
}

const currentQuestion = computed(() => questions.value[gameState.value.currentQuestion])
const isLastQuestion = computed(() => gameState.value.currentQuestion >= questions.value.length - 1)

const answerAreaClass = computed(() => {
  if (!isAnswered.value) return ''
  return isCorrect.value ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5'
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

const shuffleWord = (word: string): string[] => {
  const letters = word.split('')
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j]!, letters[i]!]
  }
  // Make sure it's actually scrambled
  if (letters.join('') === word) {
    return shuffleWord(word)
  }
  return letters
}

const initializeQuestion = () => {
  if (currentQuestion.value) {
    availableLetters.value = shuffleWord(currentQuestion.value.word)
    selectedLetters.value = []
    letterSources.value = []
    isAnswered.value = false
    isCorrect.value = false
  }
}

const selectLetter = (index: number) => {
  if (isAnswered.value || availableLetters.value[index] === null) return

  selectedLetters.value.push(availableLetters.value[index]!)
  letterSources.value.push(index)
  availableLetters.value[index] = null
}

const removeLetter = (index: number) => {
  if (isAnswered.value) return

  const sourceIndex = letterSources.value[index]
  if (sourceIndex === undefined) return
  availableLetters.value[sourceIndex] = selectedLetters.value[index] ?? null
  selectedLetters.value.splice(index, 1)
  letterSources.value.splice(index, 1)
}

const clearAnswer = () => {
  if (isAnswered.value) return

  letterSources.value.forEach((sourceIndex, i) => {
    availableLetters.value[sourceIndex] = selectedLetters.value[i] ?? null
  })
  selectedLetters.value = []
  letterSources.value = []
}

const submitAnswer = () => {
  const answer = selectedLetters.value.join('').toLowerCase()
  isCorrect.value = answer === currentQuestion.value?.word.toLowerCase()
  isAnswered.value = true

  if (isCorrect.value) {
    gameState.value.correctCount++
    gameState.value.streak++
    gameState.value.score += 100 + gameState.value.streak * 10
  } else {
    gameState.value.wrongCount++
    gameState.value.streak = 0
  }

  const q = currentQuestion.value as VocabScrambleQuestion
  if (q?.vocabWord) {
    vocabAnswers.value.push({ termDisplay: q.termDisplay, meaningDisplay: q.meaningDisplay, isCorrect: isCorrect.value })
  }
}

const nextQuestion = async () => {
  if (isLastQuestion.value) {
    gameState.value.status = 'finished'
    const accuracy = Math.round((gameState.value.correctCount / questions.value.length) * 100)
    const result = await progressStore.logQuizCompletion(accuracy, questions.value.length)
    quizStore.addGame({
      modeId: 'word-scramble',
      modeName: 'Word Scramble',
      score: gameState.value.score,
      accuracy,
      questionCount: questions.value.length,
      xpEarned: result?.xp_gained ?? 0,
    })
    if (result?.level_up) {
      toast.success(`Level up! You're now Level ${result.new_level}! 🎉`)
    } else if (result?.xp_gained) {
      toast.success(`+${result.xp_gained} XP earned!`)
    }
  } else {
    gameState.value.currentQuestion++
  }
}

const confirmExit = () => {
  showExitModal.value = true
}

const goToQuizzes = () => {
  router.push('/quizzes')
}

const restartQuiz = async () => {
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
  startTime.value = Date.now()
  vocabAnswers.value = []
  await loadQuestions()
}

// Watch for question changes
watch(() => gameState.value.currentQuestion, initializeQuestion)

onMounted(loadQuestions)
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

.letter-btn {
  box-shadow: 0 2px 0 var(--border);
}

.letter-btn:active {
  transform: translateY(2px);
  box-shadow: none;
}
</style>
