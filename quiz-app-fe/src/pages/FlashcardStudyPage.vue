<template>
  <div class="flex min-h-[calc(100vh-4rem)] flex-col p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ currentDeck.title }}</h1>
          <p class="text-muted-foreground mt-1 text-base">{{ currentDeck.description }}</p>
        </div>
        <Button variant="outline" @click="exitStudy">
          <X class="mr-2 h-4 w-4" />
          Exit
        </Button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-muted-foreground text-sm">
          Card {{ currentIndex + 1 }} of {{ cards.length }}
        </span>
        <div class="flex items-center gap-4">
          <span class="text-primary flex items-center gap-1 text-sm font-medium">
            <CheckCircle class="h-4 w-4" />
            {{ knownCount }} known
          </span>
          <span class="text-muted-foreground flex items-center gap-1 text-sm">
            <XCircle class="h-4 w-4" />
            {{ unknownCount }} learning
          </span>
        </div>
      </div>
      <div class="bg-secondary h-2 overflow-hidden rounded-full">
        <div
          class="bg-primary h-full rounded-full transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Main Card Area -->
    <div class="flex flex-1 flex-col items-center justify-center">
      <!-- Card Container -->
      <div
        ref="cardContainer"
        class="perspective-1000 relative h-80 w-full max-w-lg lg:h-96"
        @click="flipCard"
      >
        <!-- Card -->
        <div
          class="card-inner absolute inset-0 transition-transform duration-500"
          :class="{ 'rotate-y-180': isFlipped }"
          :style="cardStyle"
        >
          <!-- Front (Term) -->
          <div class="card-face card-front bg-card border-border absolute inset-0 flex flex-col rounded-3xl border shadow-lg">
            <!-- Card Header -->
            <div class="flex items-center justify-between p-5">
              <span class="text-muted-foreground text-sm font-medium">Term</span>
              <div class="flex items-center gap-2">
                <button
                  v-if="currentCard?.audio"
                  class="hover:bg-secondary rounded-lg p-2 transition-colors"
                  @click.stop="playAudio"
                >
                  <Volume2 class="text-muted-foreground h-5 w-5" />
                </button>
                <button
                  class="rounded-lg p-2 transition-colors"
                  :class="currentCard?.isFavorite ? 'text-primary' : 'text-muted-foreground hover:bg-secondary'"
                  @click.stop="toggleFavorite"
                >
                  <Heart class="h-5 w-5" :fill="currentCard?.isFavorite ? 'currentColor' : 'none'" />
                </button>
              </div>
            </div>
            <!-- Card Content -->
            <div class="flex flex-1 flex-col items-center justify-center p-6">
              <img
                v-if="currentCard?.image"
                :src="currentCard.image"
                :alt="currentCard.term"
                class="mb-4 h-32 w-32 rounded-xl object-cover"
              />
              <p class="text-foreground text-center text-xl font-medium lg:text-2xl">
                {{ currentCard?.term }}
              </p>
            </div>
            <!-- Hint -->
            <div class="p-5 text-center">
              <span class="text-muted-foreground text-sm">Tap to reveal definition</span>
            </div>
          </div>

          <!-- Back (Definition) -->
          <div class="card-face card-back bg-card border-border absolute inset-0 flex flex-col rounded-3xl border shadow-lg">
            <!-- Card Header -->
            <div class="flex items-center justify-between p-5">
              <span class="text-primary text-sm font-medium">Definition</span>
              <div class="flex items-center gap-2">
                <button
                  v-if="currentCard?.audio"
                  class="hover:bg-secondary rounded-lg p-2 transition-colors"
                  @click.stop="playAudio"
                >
                  <Volume2 class="text-muted-foreground h-5 w-5" />
                </button>
                <button
                  class="rounded-lg p-2 transition-colors"
                  :class="currentCard?.isFavorite ? 'text-primary' : 'text-muted-foreground hover:bg-secondary'"
                  @click.stop="toggleFavorite"
                >
                  <Heart class="h-5 w-5" :fill="currentCard?.isFavorite ? 'currentColor' : 'none'" />
                </button>
              </div>
            </div>
            <!-- Card Content -->
            <div class="flex flex-1 items-center justify-center p-6">
              <p class="text-foreground text-center text-xl font-medium lg:text-2xl">
                {{ currentCard?.definition }}
              </p>
            </div>
            <!-- Example if available -->
            <div v-if="currentCard?.example" class="border-border border-t p-5">
              <p class="text-muted-foreground text-center text-sm italic">
                "{{ currentCard.example }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Swipe Indicators -->
        <div
          class="pointer-events-none absolute inset-y-0 left-0 flex w-20 items-center justify-center rounded-l-3xl opacity-0 transition-opacity duration-200"
          :class="{ 'opacity-100': swipeDirection === 'left' }"
          :style="{ background: 'linear-gradient(to right, var(--destructive), transparent)' }"
        >
          <XCircle class="h-10 w-10 text-white" />
        </div>
        <div
          class="pointer-events-none absolute inset-y-0 right-0 flex w-20 items-center justify-center rounded-r-3xl opacity-0 transition-opacity duration-200"
          :class="{ 'opacity-100': swipeDirection === 'right' }"
          :style="{ background: 'linear-gradient(to left, var(--primary), transparent)' }"
        >
          <CheckCircle class="h-10 w-10 text-white" />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex items-center justify-center gap-6">
        <button
          class="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/10 transition-all duration-200 hover:scale-110 hover:border-destructive hover:bg-destructive/20 active:scale-95"
          @click="markUnknown"
        >
          <X class="text-destructive h-7 w-7 transition-transform group-hover:scale-110" />
        </button>

        <button
          class="bg-secondary hover:bg-secondary/80 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
          @click="flipCard"
        >
          <RotateCcw class="text-muted-foreground h-5 w-5" />
        </button>

        <button
          class="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 transition-all duration-200 hover:scale-110 hover:border-primary hover:bg-primary/20 active:scale-95"
          @click="markKnown"
        >
          <Check class="text-primary h-7 w-7 transition-transform group-hover:scale-110" />
        </button>
      </div>

      <!-- Keyboard Hints -->
      <div class="mt-6 hidden items-center justify-center gap-6 lg:flex">
        <div class="text-muted-foreground flex items-center gap-2 text-sm">
          <kbd class="bg-secondary rounded px-2 py-1 font-mono text-xs">←</kbd>
          <span>Don't know</span>
        </div>
        <div class="text-muted-foreground flex items-center gap-2 text-sm">
          <kbd class="bg-secondary rounded px-2 py-1 font-mono text-xs">Space</kbd>
          <span>Flip card</span>
        </div>
        <div class="text-muted-foreground flex items-center gap-2 text-sm">
          <kbd class="bg-secondary rounded px-2 py-1 font-mono text-xs">→</kbd>
          <span>Know it</span>
        </div>
      </div>
    </div>

    <!-- Completion Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCompletionModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div class="bg-card border-border w-full max-w-md rounded-3xl border p-8 text-center shadow-xl">
            <div class="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
              <Trophy class="text-primary h-10 w-10" />
            </div>
            <h2 class="text-foreground mb-2 text-2xl font-bold">Session Complete!</h2>
            <p class="text-muted-foreground mb-6">You've reviewed all {{ cards.length }} cards</p>

            <!-- Stats -->
            <div class="mb-8 grid grid-cols-2 gap-4">
              <div class="bg-primary/10 rounded-2xl p-4">
                <p class="text-primary text-3xl font-bold">{{ knownCount }}</p>
                <p class="text-muted-foreground text-sm">Known</p>
              </div>
              <div class="bg-secondary rounded-2xl p-4">
                <p class="text-foreground text-3xl font-bold">{{ unknownCount }}</p>
                <p class="text-muted-foreground text-sm">Still Learning</p>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <Button class="w-full" @click="restartSession">
                <RotateCcw class="mr-2 h-4 w-4" />
                Study Again
              </Button>
              <Button variant="outline" class="w-full" @click="reviewUnknown" :disabled="unknownCount === 0">
                <RefreshCw class="mr-2 h-4 w-4" />
                Review {{ unknownCount }} Learning Cards
              </Button>
              <Button variant="ghost" class="w-full" @click="exitStudy">
                Exit Session
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Hammer from 'hammerjs'
import {
  X,
  Check,
  CheckCircle,
  XCircle,
  RotateCcw,
  RefreshCw,
  Heart,
  Volume2,
  Trophy,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

const route = useRoute()
const router = useRouter()

// Card container ref for HammerJS
const cardContainer = ref<HTMLElement | null>(null)
let hammer: HammerManager | null = null

// State
const isFlipped = ref(false)
const currentIndex = ref(0)
const swipeDirection = ref<'left' | 'right' | null>(null)
const cardOffset = ref({ x: 0, y: 0, rotation: 0 })
const showCompletionModal = ref(false)

// Deck data (would come from route params/store in real app)
const currentDeck = ref({
  id: route.params.deckId || 1,
  title: 'JavaScript Fundamentals',
  description: 'Core concepts and syntax',
})

// Flashcard interface
interface Flashcard {
  id: number
  term: string
  definition: string
  example?: string
  image?: string
  audio?: string
  isFavorite: boolean
  isKnown: boolean | null
}

// Sample flashcards (would be loaded from API/store based on deckId)
const cards = ref<Flashcard[]>([
  {
    id: 1,
    term: 'Closure',
    definition: 'A function that has access to variables from its outer (enclosing) scope, even after the outer function has returned.',
    example: 'function outer() { let x = 10; return function inner() { return x; } }',
    audio: '/audio/closure.mp3',
    isFavorite: false,
    isKnown: null,
  },
  {
    id: 2,
    term: 'let vs const',
    definition: 'let allows reassignment while const creates a read-only reference. Both are block-scoped.',
    example: 'let x = 1; x = 2; // OK | const y = 1; y = 2; // Error',
    isFavorite: true,
    isKnown: null,
  },
  {
    id: 3,
    term: 'Event Loop',
    definition: 'A mechanism that allows JavaScript to perform non-blocking operations by offloading operations to the system kernel whenever possible.',
    isFavorite: false,
    isKnown: null,
  },
  {
    id: 4,
    term: 'Hoisting',
    definition: 'JavaScript\'s default behavior of moving declarations to the top of the current scope. Variable and function declarations are hoisted, but not initializations.',
    example: 'console.log(x); var x = 5; // undefined, not error',
    isFavorite: false,
    isKnown: null,
  },
  {
    id: 5,
    term: '== vs ===',
    definition: '== performs type coercion before comparison (loose equality), while === compares both value and type without coercion (strict equality).',
    example: '1 == "1" // true | 1 === "1" // false',
    isFavorite: false,
    isKnown: null,
  },
])

// Computed
const currentCard = computed(() => cards.value[currentIndex.value])

const knownCount = computed(() => cards.value.filter(c => c.isKnown === true).length)
const unknownCount = computed(() => cards.value.filter(c => c.isKnown === false).length)
const progressPercent = computed(() => {
  const reviewed = cards.value.filter(c => c.isKnown !== null).length
  return (reviewed / cards.value.length) * 100
})

const cardStyle = computed(() => ({
  transform: `translateX(${cardOffset.value.x}px) translateY(${cardOffset.value.y}px) rotate(${cardOffset.value.rotation}deg)`,
}))

// Methods
const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const markKnown = () => {
  if (currentCard.value) {
    currentCard.value.isKnown = true
  }
  animateSwipe('right')
}

const markUnknown = () => {
  if (currentCard.value) {
    currentCard.value.isKnown = false
  }
  animateSwipe('left')
}

const animateSwipe = (direction: 'left' | 'right') => {
  const xOffset = direction === 'right' ? 300 : -300
  cardOffset.value = { x: xOffset, y: 0, rotation: direction === 'right' ? 15 : -15 }

  setTimeout(() => {
    goToNext()
    cardOffset.value = { x: 0, y: 0, rotation: 0 }
  }, 200)
}

const goToNext = () => {
  isFlipped.value = false
  if (currentIndex.value < cards.value.length - 1) {
    currentIndex.value++
  } else {
    showCompletionModal.value = true
  }
}

const toggleFavorite = () => {
  if (currentCard.value) {
    currentCard.value.isFavorite = !currentCard.value.isFavorite
  }
}

const playAudio = () => {
  if (currentCard.value?.audio) {
    const audio = new Audio(currentCard.value.audio)
    audio.play().catch(() => {
      console.log('Audio playback failed')
    })
  }
}

const restartSession = () => {
  cards.value.forEach(c => (c.isKnown = null))
  currentIndex.value = 0
  isFlipped.value = false
  showCompletionModal.value = false
}

const reviewUnknown = () => {
  const unknownCards = cards.value.filter(c => c.isKnown === false)
  cards.value = unknownCards.map(c => ({ ...c, isKnown: null }))
  currentIndex.value = 0
  isFlipped.value = false
  showCompletionModal.value = false
}

const exitStudy = () => {
  router.push('/flashcards')
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (showCompletionModal.value) return

  switch (e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault()
      flipCard()
      break
    case 'ArrowLeft':
      e.preventDefault()
      markUnknown()
      break
    case 'ArrowRight':
      e.preventDefault()
      markKnown()
      break
    case 'f':
      e.preventDefault()
      toggleFavorite()
      break
  }
}

// Setup HammerJS for swipe gestures
const setupHammer = () => {
  if (!cardContainer.value) return

  hammer = new Hammer(cardContainer.value)
  hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL })

  hammer.on('pan', (e) => {
    const x = e.deltaX
    const rotation = x * 0.05
    cardOffset.value = { x, y: 0, rotation }

    if (x > 50) {
      swipeDirection.value = 'right'
    } else if (x < -50) {
      swipeDirection.value = 'left'
    } else {
      swipeDirection.value = null
    }
  })

  hammer.on('panend', (e) => {
    const threshold = 100

    if (e.deltaX > threshold) {
      markKnown()
    } else if (e.deltaX < -threshold) {
      markUnknown()
    } else {
      // Reset position
      cardOffset.value = { x: 0, y: 0, rotation: 0 }
    }
    swipeDirection.value = null
  })
}

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  setupHammer()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (hammer) {
    hammer.destroy()
  }
})

// Reset flip when card changes
watch(currentIndex, () => {
  isFlipped.value = false
})
</script>

<style scoped>
/* 3D Perspective */
.perspective-1000 {
  perspective: 1000px;
}

/* Card flip container */
.card-inner {
  transform-style: preserve-3d;
}

/* Card faces */
.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

/* Flip animation */
.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95) translateY(20px);
}

/* Keyboard hint styling */
kbd {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 1px 0 0 var(--border);
}
</style>
