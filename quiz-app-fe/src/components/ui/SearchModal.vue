<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[15vh] backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div class="bg-card border-border w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl">
          <!-- Search Input -->
          <div class="border-border flex items-center gap-3 border-b px-5 py-4">
            <Search class="text-muted-foreground h-5 w-5 shrink-0" />
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              placeholder="Search courses, flashcards, quizzes..."
              class="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-base outline-none"
              @keydown.escape="$emit('close')"
            />
            <kbd class="bg-secondary text-muted-foreground hidden rounded-md px-2 py-1 text-xs font-medium sm:inline-block">
              ESC
            </kbd>
          </div>

          <!-- Results -->
          <div class="max-h-[50vh] overflow-y-auto">
            <!-- No query state -->
            <div v-if="!query" class="p-5">
              <!-- Recent Searches -->
              <div v-if="recentSearches.length > 0" class="mb-6">
                <div class="mb-3 flex items-center justify-between">
                  <h4 class="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Recent</h4>
                  <button
                    class="text-muted-foreground hover:text-foreground text-xs transition-colors"
                    @click="clearRecent"
                  >
                    Clear
                  </button>
                </div>
                <div class="space-y-1">
                  <button
                    v-for="item in recentSearches"
                    :key="item"
                    class="text-foreground hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                    @click="query = item"
                  >
                    <Clock class="text-muted-foreground h-4 w-4" />
                    {{ item }}
                  </button>
                </div>
              </div>

              <!-- Quick Links -->
              <div>
                <h4 class="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">Quick Links</h4>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="link in quickLinks"
                    :key="link.path"
                    class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                    @click="navigateTo(link.path)"
                  >
                    <component :is="link.icon" class="text-primary h-4 w-4" />
                    <span class="text-foreground text-sm">{{ link.label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Search Results -->
            <div v-else-if="filteredResults.length > 0" class="p-2">
              <div v-for="group in groupedResults" :key="group.category" class="mb-2">
                <h4 class="text-muted-foreground px-3 py-2 text-xs font-semibold uppercase tracking-wider">
                  {{ group.category }}
                </h4>
                <button
                  v-for="item in group.items"
                  :key="item.id"
                  class="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                  @click="selectResult(item)"
                >
                  <div class="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <component :is="item.icon" class="text-primary h-4 w-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-foreground truncate text-sm font-medium">{{ item.title }}</p>
                    <p class="text-muted-foreground truncate text-xs">{{ item.description }}</p>
                  </div>
                  <ArrowRight class="text-muted-foreground h-4 w-4 shrink-0" />
                </button>
              </div>
            </div>

            <!-- No Results -->
            <div v-else class="px-5 py-10 text-center">
              <SearchX class="text-muted-foreground mx-auto mb-3 h-10 w-10" />
              <p class="text-foreground font-medium">No results found</p>
              <p class="text-muted-foreground mt-1 text-sm">Try a different search term</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-border bg-secondary/30 flex items-center justify-between border-t px-5 py-3">
            <div class="text-muted-foreground flex items-center gap-4 text-xs">
              <span class="flex items-center gap-1">
                <kbd class="bg-secondary rounded px-1.5 py-0.5 font-medium">↑↓</kbd> Navigate
              </span>
              <span class="flex items-center gap-1">
                <kbd class="bg-secondary rounded px-1.5 py-0.5 font-medium">↵</kbd> Open
              </span>
            </div>
            <div class="text-muted-foreground text-xs">
              {{ filteredResults.length }} results
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type Component } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Clock,
  ArrowRight,
  SearchX,
  BookOpen,
  Layers,
  Gamepad2,
  Target,
  Trophy,
  BarChart3,
  GraduationCap,
  Headphones,
  Languages,
  PenTool,
  MessageCircle,
} from 'lucide-vue-next'

interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  icon: Component
  path: string
}

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const query = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const recentSearches = ref<string[]>(['English Grammar', 'Vocabulary', 'IELTS'])

// Quick links
const quickLinks = [
  { label: 'My Courses', icon: BookOpen, path: '/courses' },
  { label: 'Flashcards', icon: Layers, path: '/flashcards' },
  { label: 'Quiz Games', icon: Gamepad2, path: '/quizzes' },
  { label: 'Goals', icon: Target, path: '/goals' },
  { label: 'Achievements', icon: Trophy, path: '/achievements' },
  { label: 'Statistics', icon: BarChart3, path: '/statistics' },
]

// Searchable items
const searchItems: SearchResult[] = [
  { id: '1', title: 'English Grammar Basics', description: 'Learn fundamental English grammar rules', category: 'Courses', icon: GraduationCap, path: '/courses/1' },
  { id: '2', title: 'English Vocabulary Builder', description: 'Expand your English vocabulary', category: 'Courses', icon: Languages, path: '/courses/2' },
  { id: '3', title: 'IELTS Preparation', description: 'Prepare for the IELTS exam', category: 'Courses', icon: BookOpen, path: '/courses/3' },
  { id: '4', title: 'Business English', description: 'English for professional settings', category: 'Courses', icon: PenTool, path: '/courses/4' },
  { id: '5', title: 'Listening Practice', description: 'Improve your English listening skills', category: 'Courses', icon: Headphones, path: '/courses/5' },
  { id: '6', title: 'Essential Vocabulary', description: '500 most common English words', category: 'Flashcards', icon: Layers, path: '/flashcards/1' },
  { id: '7', title: 'English Idioms', description: 'Common English idioms and expressions', category: 'Flashcards', icon: MessageCircle, path: '/flashcards/2' },
  { id: '8', title: 'Phrasal Verbs', description: 'Essential English phrasal verbs', category: 'Flashcards', icon: Layers, path: '/flashcards/3' },
  { id: '9', title: 'Multiple Choice Quiz', description: 'Test your grammar and vocabulary', category: 'Quizzes', icon: Gamepad2, path: '/quizzes/multiple-choice' },
  { id: '10', title: 'Word Scramble', description: 'Unscramble English words', category: 'Quizzes', icon: Gamepad2, path: '/quizzes/word-scramble' },
  { id: '11', title: 'Speed Round', description: 'Quick English quiz challenge', category: 'Quizzes', icon: Gamepad2, path: '/quizzes/speed-round' },
  { id: '12', title: 'Matching Pairs', description: 'Match words with definitions', category: 'Quizzes', icon: Gamepad2, path: '/quizzes/matching-pairs' },
]

const filteredResults = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return searchItems.filter(
    item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
  )
})

const groupedResults = computed(() => {
  const groups: Record<string, SearchResult[]> = {}
  filteredResults.value.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return Object.entries(groups).map(([category, items]) => ({ category, items }))
})

const selectResult = (item: SearchResult) => {
  if (!recentSearches.value.includes(query.value) && query.value.trim()) {
    recentSearches.value.unshift(query.value.trim())
    if (recentSearches.value.length > 5) recentSearches.value.pop()
  }
  router.push(item.path)
  emit('close')
  query.value = ''
}

const navigateTo = (path: string) => {
  router.push(path)
  emit('close')
  query.value = ''
}

const clearRecent = () => {
  recentSearches.value = []
}

// Focus input when modal opens
watch(() => props.show, (val) => {
  if (val) {
    nextTick(() => searchInput.value?.focus())
  } else {
    query.value = ''
  }
})
</script>

<style scoped>
.search-modal-enter-active,
.search-modal-leave-active {
  transition: all 0.2s ease;
}
.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;
}
.search-modal-enter-from > div,
.search-modal-leave-to > div {
  transform: scale(0.95) translateY(-20px);
}
</style>
