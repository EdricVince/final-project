<template>
  <div class="min-h-[calc(100vh-4rem)] p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <div class="mb-4 flex items-center gap-2">
        <button
          class="hover:bg-secondary rounded-lg p-2 transition-colors"
          @click="goBack"
        >
          <ArrowLeft class="text-muted-foreground h-5 w-5" />
        </button>
        <span class="text-muted-foreground text-sm">Back to Flashcards</span>
      </div>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex-1">
          <div class="mb-2 flex items-center gap-3">
            <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <component :is="getCategoryIcon(deck.category)" class="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ deck.title }}</h1>
              <p class="text-muted-foreground text-base">{{ deck.description }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <Button variant="outline" @click="showImportModal = true">
            <Upload class="mr-2 h-5 w-5" />
            Import
          </Button>
          <Button variant="outline" @click="exportDeck">
            <Download class="mr-2 h-5 w-5" />
            Export
          </Button>
          <Button @click="startStudy" :disabled="cards.length === 0">
            <Play class="mr-2 h-5 w-5" />
            Study Now
          </Button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
        <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ cards.length }}</span>
        <p class="text-muted-foreground mt-1 text-base">Total Cards</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
        <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ masteredCount }}</span>
        <p class="text-muted-foreground mt-1 text-base">Mastered</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
        <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ learningCount }}</span>
        <p class="text-muted-foreground mt-1 text-base">Learning</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
        <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ deck.progress }}%</span>
        <p class="text-muted-foreground mt-1 text-base">Progress</p>
      </div>
    </div>

    <!-- Search and Add -->
    <div class="animate-fade-in-up delay-150 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="relative flex-1 lg:max-w-md">
        <Search class="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search cards..."
          class="bg-secondary text-foreground placeholder:text-muted-foreground h-12 w-full rounded-xl border-0 pl-12 pr-4 text-base transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Button @click="openCreateCard">
        <Plus class="mr-2 h-5 w-5" />
        Add Card
      </Button>
    </div>

    <!-- Cards List -->
    <div v-if="filteredCards.length > 0" class="space-y-3">
      <FlashcardCardItem
        v-for="(card, index) in filteredCards"
        :key="card.id"
        :card="card"
        :index="index"
        @edit="openEditCard"
        @toggle-favorite="toggleFavorite"
        @open-menu="openCardMenu"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="animate-fade-in-up flex flex-col items-center justify-center py-20 text-center">
      <div class="bg-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <CreditCard class="text-muted-foreground h-12 w-12" />
      </div>
      <h3 class="text-foreground mb-2 text-xl font-semibold lg:text-2xl">
        {{ searchQuery ? 'No cards found' : 'No cards yet' }}
      </h3>
      <p class="text-muted-foreground mb-6 max-w-md text-base">
        {{ searchQuery ? 'Try a different search term' : 'Add your first flashcard to start learning' }}
      </p>
      <div v-if="!searchQuery" class="flex gap-3">
        <Button variant="outline" @click="showImportModal = true">
          <Upload class="mr-2 h-5 w-5" />
          Import
        </Button>
        <Button @click="openCreateCard">
          <Plus class="mr-2 h-5 w-5" />
          Add Card
        </Button>
      </div>
    </div>

    <!-- Card Menu Dropdown -->
    <CardMenuDropdown
      v-model="showCardMenu"
      :position="menuPosition"
      @duplicate="duplicateCard"
      @delete="confirmDeleteCard"
    />

    <!-- Create/Edit Card Modal -->
    <FlashcardCardModal
      v-model="showCardModal"
      :card="editingCard"
      @save="saveCard"
    />

    <!-- Import Modal -->
    <FlashcardImportModal
      v-model="showImportModal"
      @import="importCards"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-model="showDeleteModal"
      title="Delete Card?"
      message="Are you sure you want to delete this card? This action cannot be undone."
      @confirm="deleteCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Plus,
  Upload,
  Download,
  Play,
  Search,
  CreditCard,
  BookOpen,
  Code2,
  Globe,
  Music,
  Calculator,
  Palette,
  FlaskConical,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import FlashcardCardItem from '@/components/flashcard/FlashcardCardItem.vue'
import FlashcardCardModal from '@/components/flashcard/FlashcardCardModal.vue'
import FlashcardImportModal from '@/components/flashcard/FlashcardImportModal.vue'
import CardMenuDropdown from '@/components/flashcard/CardMenuDropdown.vue'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import type { FlashcardItem, CardFormData } from '@/types/flashcard'

const route = useRoute()
const router = useRouter()
const deckId = route.params.id

// Modal states
const showCardModal = ref(false)
const showImportModal = ref(false)
const showDeleteModal = ref(false)
const showCardMenu = ref(false)

// Card states
const editingCard = ref<FlashcardItem | null>(null)
const cardToDelete = ref<FlashcardItem | null>(null)
const activeCardId = ref<number | null>(null)
const menuPosition = ref({ top: '0px', left: '0px' })
const searchQuery = ref('')

// Sample deck data
const deck = ref({
  id: deckId,
  title: 'JavaScript Fundamentals',
  description: 'Core concepts and syntax of JavaScript programming language',
  category: 'Programming',
  progress: 72,
})

// Cards data
const cards = ref<FlashcardItem[]>([
  {
    id: 1,
    term: 'Closure',
    definition: 'A function that has access to variables from its outer scope, even after the outer function has returned.',
    example: 'function outer() { let x = 10; return function inner() { return x; } }',
    isFavorite: false,
    status: 'Mastered',
  },
  {
    id: 2,
    term: 'Hoisting',
    definition: "JavaScript's default behavior of moving declarations to the top of the current scope.",
    example: 'console.log(x); var x = 5; // undefined',
    image: 'https://via.placeholder.com/200x200?text=Hoisting',
    isFavorite: true,
    status: 'Learning',
  },
  {
    id: 3,
    term: 'Event Loop',
    definition: 'A mechanism that allows JavaScript to perform non-blocking operations by offloading operations to the system kernel.',
    isFavorite: false,
    status: 'New',
  },
  {
    id: 4,
    term: 'Promise',
    definition: 'An object representing the eventual completion or failure of an asynchronous operation.',
    example: 'new Promise((resolve, reject) => { ... })',
    isFavorite: false,
    status: 'Mastered',
  },
  {
    id: 5,
    term: 'async/await',
    definition: 'Syntactic sugar over Promises. async declares an async function, await pauses until Promise resolves.',
    example: 'async function fetch() { const data = await api.get(); }',
    audio: '/audio/async.mp3',
    isFavorite: true,
    status: 'Learning',
  },
])

// Computed
const filteredCards = computed(() => {
  if (!searchQuery.value) return cards.value
  const query = searchQuery.value.toLowerCase()
  return cards.value.filter(
    (card) => card.term.toLowerCase().includes(query) || card.definition.toLowerCase().includes(query)
  )
})

const masteredCount = computed(() => cards.value.filter((c) => c.status === 'Mastered').length)
const learningCount = computed(() => cards.value.filter((c) => c.status === 'Learning').length)

// Methods
const getCategoryIcon = (category: string): Component => {
  const icons: Record<string, Component> = {
    Language: Globe,
    Programming: Code2,
    Science: FlaskConical,
    Math: Calculator,
    Music: Music,
    Art: Palette,
    General: BookOpen,
  }
  return icons[category] || BookOpen
}

const goBack = () => {
  router.push('/flashcards')
}

const startStudy = () => {
  router.push(`/flashcards/${deckId}/study`)
}

const openCreateCard = () => {
  editingCard.value = null
  showCardModal.value = true
}

const openEditCard = (card: FlashcardItem) => {
  editingCard.value = card
  showCardModal.value = true
}

const saveCard = (formData: CardFormData) => {
  if (editingCard.value) {
    const card = cards.value.find((c) => c.id === editingCard.value!.id)
    if (card) {
      card.term = formData.term
      card.definition = formData.definition
      card.example = formData.example || undefined
      card.image = formData.image || undefined
      card.audio = formData.audio || undefined
    }
  } else {
    const newCard: FlashcardItem = {
      id: Date.now(),
      term: formData.term,
      definition: formData.definition,
      example: formData.example || undefined,
      image: formData.image || undefined,
      audio: formData.audio || undefined,
      isFavorite: false,
      status: 'New',
    }
    cards.value.unshift(newCard)
  }
  editingCard.value = null
}

const toggleFavorite = (card: FlashcardItem) => {
  card.isFavorite = !card.isFavorite
}

const openCardMenu = (cardId: number, event: MouseEvent) => {
  activeCardId.value = cardId
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  menuPosition.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left - 120}px`,
  }
  showCardMenu.value = true
}

const duplicateCard = () => {
  const card = cards.value.find((c) => c.id === activeCardId.value)
  if (card) {
    const newCard: FlashcardItem = {
      ...card,
      id: Date.now(),
      term: `${card.term} (Copy)`,
      status: 'New',
    }
    cards.value.unshift(newCard)
  }
}

const confirmDeleteCard = () => {
  const card = cards.value.find((c) => c.id === activeCardId.value)
  if (card) {
    cardToDelete.value = card
    showDeleteModal.value = true
  }
}

const deleteCard = () => {
  if (cardToDelete.value) {
    cards.value = cards.value.filter((c) => c.id !== cardToDelete.value!.id)
  }
  cardToDelete.value = null
}

const importCards = (_file: File) => {
  // In real app, parse the file here
  const sampleImportedCards: FlashcardItem[] = [
    {
      id: Date.now(),
      term: 'Imported Term 1',
      definition: 'Definition from import',
      isFavorite: false,
      status: 'New',
    },
    {
      id: Date.now() + 1,
      term: 'Imported Term 2',
      definition: 'Another definition from import',
      isFavorite: false,
      status: 'New',
    },
  ]
  cards.value.unshift(...sampleImportedCards)
}

const exportDeck = () => {
  const headers = ['Term', 'Definition', 'Example', 'Image', 'Audio']
  const rows = cards.value.map((card) => [
    card.term,
    card.definition,
    card.example || '',
    card.image || '',
    card.audio || '',
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${deck.value.title}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
