<template>
  <div class="min-h-[calc(100vh-4rem)] p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ $t('flashcards.title') }}</h1>
        <p class="text-muted-foreground mt-1 text-base">{{ $t('flashcards.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button variant="outline" @click="showImportModal = true">
          <Upload class="mr-2 h-5 w-5" />
          {{ $t('flashcards.import') }}
        </Button>
        <Button @click="openCreateDeck">
          <Plus class="mr-2 h-5 w-5" />
          {{ $t('flashcards.createDeck') }}
        </Button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      <div class="bg-card border-border rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg lg:p-6">
        <div class="mb-3 flex items-center gap-3">
          <div class="bg-chart-1/10 flex h-12 w-12 items-center justify-center rounded-xl lg:h-14 lg:w-14">
            <Layers class="text-chart-1 h-6 w-6 lg:h-7 lg:w-7" />
          </div>
        </div>
        <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ stats.totalDecks }}</span>
        <p class="text-muted-foreground mt-1 text-base">{{ $t('flashcards.stats.totalDecks') }}</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg lg:p-6">
        <div class="mb-3 flex items-center gap-3">
          <div class="bg-chart-2/10 flex h-12 w-12 items-center justify-center rounded-xl lg:h-14 lg:w-14">
            <CreditCard class="text-chart-2 h-6 w-6 lg:h-7 lg:w-7" />
          </div>
        </div>
        <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ stats.totalCards }}</span>
        <p class="text-muted-foreground mt-1 text-base">{{ $t('flashcards.stats.totalCards') }}</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg lg:p-6">
        <div class="mb-3 flex items-center gap-3">
          <div class="bg-chart-3/10 flex h-12 w-12 items-center justify-center rounded-xl lg:h-14 lg:w-14">
            <CheckCircle class="text-chart-3 h-6 w-6 lg:h-7 lg:w-7" />
          </div>
        </div>
        <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ stats.masteredCards }}</span>
        <p class="text-muted-foreground mt-1 text-base">{{ $t('flashcards.stats.mastered') }}</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg lg:p-6">
        <div class="mb-3 flex items-center gap-3">
          <div class="bg-chart-4/10 flex h-12 w-12 items-center justify-center rounded-xl lg:h-14 lg:w-14">
            <TrendingUp class="text-chart-4 h-6 w-6 lg:h-7 lg:w-7" />
          </div>
        </div>
        <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ stats.studyStreak }}</span>
        <p class="text-muted-foreground mt-1 text-base">{{ $t('flashcards.stats.dayStreak') }}</p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="animate-fade-in-up delay-150 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="relative flex-1 lg:max-w-md">
        <Search class="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('flashcards.searchPlaceholder')"
          class="bg-secondary text-foreground placeholder:text-muted-foreground h-12 w-full rounded-xl border-0 pl-12 pr-4 text-base transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="selectedCategory"
          class="bg-secondary text-foreground h-12 rounded-xl border-0 px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">{{ $t('flashcards.allCategories') }}</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <div class="bg-secondary flex items-center gap-1 rounded-xl p-1">
          <button
            class="rounded-lg p-2 transition-colors"
            :class="viewMode === 'grid' ? 'bg-card shadow-sm' : 'hover:bg-card/50'"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid class="text-foreground h-5 w-5" />
          </button>
          <button
            class="rounded-lg p-2 transition-colors"
            :class="viewMode === 'list' ? 'bg-card shadow-sm' : 'hover:bg-card/50'"
            @click="viewMode = 'list'"
          >
            <List class="text-foreground h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Decks Grid/List -->
    <div v-if="filteredDecks.length > 0">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
        <div
          v-for="(deck, index) in filteredDecks"
          :key="deck.id"
          class="deck-card bg-card border-border group cursor-pointer rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg lg:p-6"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <!-- Deck Header -->
          <div class="mb-4 flex items-start justify-between">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
              :class="getCategoryColor(deck.category)"
            >
              <component :is="getCategoryIcon(deck.category)" class="h-7 w-7" />
            </div>
            <div class="relative">
              <button
                class="hover:bg-secondary rounded-lg p-2 transition-colors"
                @click.stop="toggleDeckMenu(deck.id)"
              >
                <MoreVertical class="text-muted-foreground h-5 w-5" />
              </button>
              <!-- Dropdown Menu -->
              <div
                v-if="activeDeckMenu === deck.id"
                class="bg-card border-border absolute right-0 top-10 z-10 w-40 rounded-xl border py-2 shadow-lg"
              >
                <button
                  class="hover:bg-secondary text-foreground flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
                  @click.stop="openEditDeck(deck)"
                >
                  <Pencil class="h-4 w-4" />
                  {{ $t('flashcards.deck.edit') }}
                </button>
                <button
                  class="hover:bg-secondary text-foreground flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
                  @click.stop="duplicateDeck(deck)"
                >
                  <Copy class="h-4 w-4" />
                  {{ $t('flashcards.deck.duplicate') }}
                </button>
                <button
                  class="hover:bg-destructive/10 text-destructive flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
                  @click.stop="confirmDeleteDeck(deck)"
                >
                  <Trash2 class="h-4 w-4" />
                  {{ $t('flashcards.deck.delete') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Deck Info -->
          <div @click="openDeck(deck.id)">
            <h3 class="text-foreground mb-1 text-lg font-semibold lg:text-xl">{{ deck.title }}</h3>
            <p class="text-muted-foreground mb-4 line-clamp-2 text-sm">{{ deck.description }}</p>

            <!-- Stats -->
            <div class="mb-4 flex items-center gap-4">
              <span class="text-muted-foreground flex items-center gap-1 text-sm">
                <CreditCard class="h-4 w-4" />
                {{ deck.cardCount }} {{ $t('flashcards.deck.cards') }}
              </span>
              <span class="text-muted-foreground flex items-center gap-1 text-sm">
                <Clock class="h-4 w-4" />
                {{ deck.lastStudied }}
              </span>
            </div>

            <!-- Progress -->
            <div>
              <div class="mb-2 flex items-center justify-between">
                <span class="text-muted-foreground text-sm">{{ $t('flashcards.deck.progress') }}</span>
                <span class="text-foreground text-sm font-medium">{{ deck.progress }}%</span>
              </div>
              <div class="bg-secondary h-2 overflow-hidden rounded-full">
                <div
                  class="bg-primary h-full rounded-full transition-all duration-500"
                  :style="{ width: `${deck.progress}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mt-4 flex gap-2">
            <Button
              variant="default"
              class="flex-1"
              size="sm"
              @click.stop="startStudy(deck.id)"
            >
              <Play class="mr-2 h-4 w-4" />
              {{ $t('flashcards.deck.study') }}
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click.stop="openDeck(deck.id)"
            >
              <Eye class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="space-y-3">
        <div
          v-for="(deck, index) in filteredDecks"
          :key="deck.id"
          class="deck-list-item bg-card border-border group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:gap-6 lg:p-5"
          :style="{ animationDelay: `${index * 50}ms` }"
          @click="openDeck(deck.id)"
        >
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
            :class="getCategoryColor(deck.category)"
          >
            <component :is="getCategoryIcon(deck.category)" class="h-7 w-7" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="text-foreground mb-1 text-lg font-semibold">{{ deck.title }}</h3>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-muted-foreground text-sm">{{ deck.cardCount }} cards</span>
              <span class="text-muted-foreground text-sm">{{ deck.lastStudied }}</span>
              <span class="text-muted-foreground text-sm">{{ deck.progress }}% complete</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button variant="default" size="sm" @click.stop="startStudy(deck.id)">
              <Play class="mr-2 h-4 w-4" />
              Study
            </Button>
            <button
              class="hover:bg-secondary rounded-lg p-2 transition-colors"
              @click.stop="toggleDeckMenu(deck.id)"
            >
              <MoreVertical class="text-muted-foreground h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="animate-fade-in-up flex flex-col items-center justify-center py-20 text-center">
      <div class="bg-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <Layers class="text-muted-foreground h-12 w-12" />
      </div>
      <h3 class="text-foreground mb-2 text-xl font-semibold lg:text-2xl">No flashcard decks yet</h3>
      <p class="text-muted-foreground mb-6 max-w-md text-base">
        Create your first deck to start learning with flashcards
      </p>
      <div class="flex gap-3">
        <Button variant="outline" @click="showImportModal = true">
          <Upload class="mr-2 h-5 w-5" />
          {{ $t('flashcards.import') }}
        </Button>
        <Button @click="openCreateDeck">
          <Plus class="mr-2 h-5 w-5" />
          {{ $t('flashcards.createDeck') }}
        </Button>
      </div>
    </div>

    <!-- Create/Edit Deck Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeckModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          @click.self="closeDeckModal"
        >
          <div class="bg-card border-border w-full max-w-lg rounded-3xl border p-6 shadow-xl lg:p-8">
            <div class="mb-6 flex items-center justify-between">
              <h2 class="text-foreground text-xl font-bold lg:text-2xl">
                {{ editingDeck ? 'Edit Deck' : 'Create New Deck' }}
              </h2>
              <button
                class="hover:bg-secondary rounded-lg p-2 transition-colors"
                @click="closeDeckModal"
              >
                <X class="text-muted-foreground h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="saveDeck" class="space-y-5">
              <div>
                <label class="text-foreground mb-2 block text-sm font-medium">Deck Title</label>
                <input
                  v-model="deckForm.title"
                  type="text"
                  placeholder="e.g., Japanese Vocabulary N5"
                  required
                  class="bg-secondary text-foreground placeholder:text-muted-foreground h-12 w-full rounded-xl border-0 px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="text-foreground mb-2 block text-sm font-medium">Description</label>
                <textarea
                  v-model="deckForm.description"
                  placeholder="What will you learn in this deck?"
                  rows="3"
                  class="bg-secondary text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border-0 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <div>
                <label class="text-foreground mb-2 block text-sm font-medium">Category</label>
                <select
                  v-model="deckForm.category"
                  class="bg-secondary text-foreground h-12 w-full rounded-xl border-0 px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <div class="flex gap-3 pt-4">
                <Button type="button" variant="outline" class="flex-1" @click="closeDeckModal">
                  Cancel
                </Button>
                <Button type="submit" class="flex-1">
                  {{ editingDeck ? 'Save Changes' : 'Create Deck' }}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Import Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showImportModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          @click.self="showImportModal = false"
        >
          <div class="bg-card border-border w-full max-w-lg rounded-3xl border p-6 shadow-xl lg:p-8">
            <div class="mb-6 flex items-center justify-between">
              <h2 class="text-foreground text-xl font-bold lg:text-2xl">Import Flashcards</h2>
              <button
                class="hover:bg-secondary rounded-lg p-2 transition-colors"
                @click="showImportModal = false"
              >
                <X class="text-muted-foreground h-5 w-5" />
              </button>
            </div>

            <div class="space-y-4">
              <!-- File Upload Area -->
              <div
                class="border-border hover:border-primary/50 relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
                @click="triggerFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleFileDrop"
                :class="{ 'border-primary bg-primary/5': isDragging }"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <div class="bg-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <FileSpreadsheet class="text-muted-foreground h-8 w-8" />
                </div>
                <p class="text-foreground mb-1 text-base font-medium">
                  Drop your file here or click to browse
                </p>
                <p class="text-muted-foreground text-sm">Supports CSV, Excel (.xlsx, .xls)</p>
              </div>

              <!-- Selected File -->
              <div v-if="importFile" class="bg-secondary flex items-center gap-3 rounded-xl p-4">
                <FileSpreadsheet class="text-primary h-6 w-6" />
                <div class="min-w-0 flex-1">
                  <p class="text-foreground truncate text-sm font-medium">{{ importFile.name }}</p>
                  <p class="text-muted-foreground text-xs">{{ formatFileSize(importFile.size) }}</p>
                </div>
                <button
                  class="hover:bg-card rounded-lg p-2 transition-colors"
                  @click="importFile = null"
                >
                  <X class="text-muted-foreground h-4 w-4" />
                </button>
              </div>

              <!-- Import Options -->
              <div v-if="importFile" class="space-y-4">
                <div>
                  <label class="text-foreground mb-2 block text-sm font-medium">Deck Name</label>
                  <input
                    v-model="importDeckName"
                    type="text"
                    placeholder="Enter deck name"
                    class="bg-secondary text-foreground placeholder:text-muted-foreground h-12 w-full rounded-xl border-0 px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div class="bg-secondary/50 rounded-xl p-4">
                  <p class="text-muted-foreground mb-2 text-sm">Expected format:</p>
                  <div class="bg-card overflow-hidden rounded-lg">
                    <table class="w-full text-sm">
                      <thead class="bg-secondary">
                        <tr>
                          <th class="text-foreground px-3 py-2 text-left font-medium">Term</th>
                          <th class="text-foreground px-3 py-2 text-left font-medium">Definition</th>
                          <th class="text-foreground px-3 py-2 text-left font-medium">Image (optional)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="border-border border-t">
                          <td class="text-muted-foreground px-3 py-2">Hello</td>
                          <td class="text-muted-foreground px-3 py-2">A greeting</td>
                          <td class="text-muted-foreground px-3 py-2">image_url</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <Button type="button" variant="outline" class="flex-1" @click="showImportModal = false">
                  Cancel
                </Button>
                <Button class="flex-1" :disabled="!importFile || !importDeckName" @click="importCards">
                  <Upload class="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          @click.self="showDeleteModal = false"
        >
          <div class="bg-card border-border w-full max-w-md rounded-3xl border p-6 text-center shadow-xl lg:p-8">
            <div class="bg-destructive/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <Trash2 class="text-destructive h-8 w-8" />
            </div>
            <h2 class="text-foreground mb-2 text-xl font-bold">Delete Deck?</h2>
            <p class="text-muted-foreground mb-6">
              Are you sure you want to delete "{{ deckToDelete?.title }}"? This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <Button variant="outline" class="flex-1" @click="showDeleteModal = false">
                Cancel
              </Button>
              <Button variant="destructive" class="flex-1" @click="deleteDeck">
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Upload,
  Search,
  Layers,
  CreditCard,
  CheckCircle,
  TrendingUp,
  Clock,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Play,
  Eye,
  X,
  FileSpreadsheet,
  BookOpen,
  Globe,
  MessageCircle,
  ArrowUpDown,
  Mic,
  GraduationCap,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { useProgressStore } from '@/stores/progress.store'

const router = useRouter()
const progressStore = useProgressStore()

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const showDeckModal = ref(false)
const showImportModal = ref(false)
const showDeleteModal = ref(false)
const editingDeck = ref<Deck | null>(null)
const deckToDelete = ref<Deck | null>(null)
const activeDeckMenu = ref<number | null>(null)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const importFile = ref<File | null>(null)
const importDeckName = ref('')

// Categories
const categories = [
  'Vocabulary',
  'Grammar',
  'Idioms',
  'Phrasal Verbs',
  'Pronunciation',
  'IELTS/TOEFL',
  'General',
]

// Deck form
const deckForm = ref({
  title: '',
  description: '',
  category: '',
})

// Stats (deck/card counts are local; streak & mastered from progress store)
const stats = ref({
  totalDecks: 5,
  totalCards: 234,
  masteredCards: 0,
  studyStreak: 0,
})

// Sample decks
interface Deck {
  id: number
  title: string
  description: string
  category: string
  cardCount: number
  progress: number
  lastStudied: string
}

const decks = ref<Deck[]>([
  {
    id: 1,
    title: 'Essential English Vocabulary',
    description: '500 most common English words with examples and usage',
    category: 'Vocabulary',
    cardCount: 120,
    progress: 72,
    lastStudied: '2 hours ago',
  },
  {
    id: 2,
    title: 'English Idioms & Expressions',
    description: 'Common English idioms, proverbs, and everyday expressions',
    category: 'Idioms',
    cardCount: 80,
    progress: 45,
    lastStudied: 'Yesterday',
  },
  {
    id: 3,
    title: 'IELTS Academic Vocabulary',
    description: 'High-frequency words for IELTS Academic test preparation',
    category: 'IELTS/TOEFL',
    cardCount: 200,
    progress: 90,
    lastStudied: '3 days ago',
  },
  {
    id: 4,
    title: 'English Phrasal Verbs',
    description: 'Essential phrasal verbs with meanings and example sentences',
    category: 'Phrasal Verbs',
    cardCount: 60,
    progress: 60,
    lastStudied: 'Last week',
  },
  {
    id: 5,
    title: 'English Grammar Rules',
    description: 'Key grammar rules: tenses, articles, prepositions, and more',
    category: 'Grammar',
    cardCount: 50,
    progress: 35,
    lastStudied: '2 days ago',
  },
])

// Computed
const filteredDecks = computed(() => {
  return decks.value.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'all' || deck.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

// Methods
const getCategoryIcon = (category: string): Component => {
  const icons: Record<string, Component> = {
    Vocabulary: Globe,
    Grammar: BookOpen,
    Idioms: MessageCircle,
    'Phrasal Verbs': ArrowUpDown,
    Pronunciation: Mic,
    'IELTS/TOEFL': GraduationCap,
    General: BookOpen,
  }
  return icons[category] || BookOpen
}

const getCategoryColor = (_category: string): string => {
  return 'bg-primary/10 text-primary'
}

const toggleDeckMenu = (deckId: number) => {
  activeDeckMenu.value = activeDeckMenu.value === deckId ? null : deckId
}

const openCreateDeck = () => {
  editingDeck.value = null
  deckForm.value = { title: '', description: '', category: '' }
  showDeckModal.value = true
}

const openEditDeck = (deck: Deck) => {
  editingDeck.value = deck
  deckForm.value = {
    title: deck.title,
    description: deck.description,
    category: deck.category,
  }
  activeDeckMenu.value = null
  showDeckModal.value = true
}

const closeDeckModal = () => {
  showDeckModal.value = false
  editingDeck.value = null
}

const saveDeck = () => {
  if (editingDeck.value) {
    // Update existing deck
    const existingDeck = decks.value.find(d => d.id === editingDeck.value!.id)
    if (existingDeck) {
      existingDeck.title = deckForm.value.title
      existingDeck.description = deckForm.value.description
      existingDeck.category = deckForm.value.category || existingDeck.category
    }
  } else {
    // Create new deck
    const newDeck: Deck = {
      id: Date.now(),
      title: deckForm.value.title,
      description: deckForm.value.description,
      category: deckForm.value.category || 'General',
      cardCount: 0,
      progress: 0,
      lastStudied: 'Never',
    }
    decks.value.unshift(newDeck)
    stats.value.totalDecks++
  }
  closeDeckModal()
}

const duplicateDeck = (deck: Deck) => {
  const newDeck: Deck = {
    ...deck,
    id: Date.now(),
    title: `${deck.title} (Copy)`,
    progress: 0,
    lastStudied: 'Never',
  }
  decks.value.unshift(newDeck)
  stats.value.totalDecks++
  activeDeckMenu.value = null
}

const confirmDeleteDeck = (deck: Deck) => {
  deckToDelete.value = deck
  activeDeckMenu.value = null
  showDeleteModal.value = true
}

const deleteDeck = () => {
  if (deckToDelete.value) {
    const deckToRemove = decks.value.find(d => d.id === deckToDelete.value!.id)
    if (deckToRemove) {
      stats.value.totalCards -= deckToRemove.cardCount
      decks.value = decks.value.filter(d => d.id !== deckToDelete.value!.id)
      stats.value.totalDecks--
    }
  }
  showDeleteModal.value = false
  deckToDelete.value = null
}

const openDeck = (deckId: number) => {
  router.push(`/flashcards/${deckId}`)
}

const startStudy = (deckId: number) => {
  router.push(`/flashcards/${deckId}/study`)
}

// File import methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    importFile.value = target.files[0]
    importDeckName.value = target.files[0].name.replace(/\.[^/.]+$/, '')
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      importFile.value = file
      importDeckName.value = file.name.replace(/\.[^/.]+$/, '')
    }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const importCards = () => {
  // In a real app, this would parse the file and create cards
  const newDeck: Deck = {
    id: Date.now(),
    title: importDeckName.value,
    description: 'Imported from ' + importFile.value?.name,
    category: 'General',
    cardCount: 0,
    progress: 0,
    lastStudied: 'Never',
  }
  decks.value.unshift(newDeck)
  stats.value.totalDecks++

  showImportModal.value = false
  importFile.value = null
  importDeckName.value = ''

  // Navigate to the new deck to add cards
  router.push(`/flashcards/${newDeck.id}`)
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('[data-deck-menu]')) {
    activeDeckMenu.value = null
  }
}

onMounted(() => {
  stats.value.masteredCards = progressStore.totalCardsStudied
  stats.value.studyStreak = progressStore.streakCount
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Deck card animation */
.deck-card,
.deck-list-item {
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
