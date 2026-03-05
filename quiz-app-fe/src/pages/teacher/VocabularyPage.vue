<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-foreground text-2xl font-bold">Vocabulary</h2>
        <p class="text-muted-foreground mt-1 text-sm">Create and manage vocabulary sets for your classes</p>
      </div>
      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-colors"
        @click="openCreateSet"
      >
        <Plus class="h-4 w-4" />
        New Vocab Set
      </button>
    </div>

    <!-- Stats -->
    <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-muted-foreground text-sm">{{ stat.label }}</span>
          <div class="rounded-lg p-2" :class="stat.bg">
            <component :is="stat.icon" class="h-4 w-4" :class="stat.color" />
          </div>
        </div>
        <p class="text-foreground text-2xl font-bold">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Two-panel layout: Sets list + Words editor -->
    <div class="grid gap-6 lg:grid-cols-5">
      <!-- Left: Vocab Sets -->
      <div class="lg:col-span-2">
        <div class="bg-card border-border rounded-2xl border">
          <div class="border-border flex items-center justify-between border-b px-5 py-4">
            <h3 class="text-foreground font-semibold">Vocab Sets</h3>
            <span class="bg-secondary text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">{{ sets.length }}</span>
          </div>

          <div class="divide-border divide-y">
            <button
              v-for="set in sets"
              :key="set.id"
              class="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors"
              :class="selectedSet?.id === set.id ? 'bg-primary/5' : 'hover:bg-secondary/50'"
              @click="selectedSet = set"
            >
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" :class="set.bgColor">
                {{ set.emoji }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-foreground truncate text-sm font-medium">{{ set.name }}</p>
                <p class="text-muted-foreground text-xs">{{ set.words.length }} words · {{ set.language }}</p>
              </div>
              <div class="flex shrink-0 gap-1">
                <button
                  class="text-muted-foreground hover:text-destructive rounded-lg p-1.5 transition-colors hover:bg-destructive/10"
                  @click.stop="deleteSet(set.id)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </button>
          </div>

          <div v-if="sets.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <Languages class="text-muted-foreground mb-3 h-10 w-10" />
            <p class="text-muted-foreground text-sm">No vocab sets yet</p>
          </div>
        </div>
      </div>

      <!-- Right: Words Editor -->
      <div class="lg:col-span-3">
        <div v-if="selectedSet" class="bg-card border-border rounded-2xl border">
          <!-- Set Header -->
          <div class="border-border border-b px-6 py-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl text-xl" :class="selectedSet.bgColor">
                  {{ selectedSet.emoji }}
                </div>
                <div>
                  <h3 class="text-foreground font-semibold">{{ selectedSet.name }}</h3>
                  <p class="text-muted-foreground text-xs">{{ selectedSet.language }} · {{ selectedSet.class }}</p>
                </div>
              </div>
              <button
                class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                @click="addWord"
              >
                <Plus class="h-4 w-4" />
                Add Word
              </button>
            </div>
          </div>

          <!-- Words Table -->
          <div class="divide-border divide-y">
            <div
              v-for="(word, idx) in selectedSet.words"
              :key="word.id"
              class="flex items-center gap-3 px-6 py-3"
            >
              <span class="text-muted-foreground w-6 shrink-0 text-center text-sm">{{ idx + 1 }}</span>

              <input
                v-model="word.term"
                type="text"
                placeholder="Term"
                class="border-border bg-background text-foreground placeholder:text-muted-foreground min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                v-model="word.definition"
                type="text"
                placeholder="Definition / Translation"
                class="border-border bg-background text-foreground placeholder:text-muted-foreground min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                v-model="word.example"
                type="text"
                placeholder="Example (optional)"
                class="border-border bg-background text-foreground placeholder:text-muted-foreground hidden min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 lg:block"
              />
              <button
                class="text-muted-foreground hover:text-destructive shrink-0 rounded-lg p-1.5 transition-colors hover:bg-destructive/10"
                @click="removeWord(word.id)"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div v-if="selectedSet.words.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen class="text-muted-foreground mb-3 h-10 w-10" />
            <p class="text-foreground mb-1 font-medium">No words yet</p>
            <p class="text-muted-foreground mb-4 text-sm">Add words to this vocabulary set</p>
            <button
              class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              @click="addWord"
            >
              <Plus class="h-4 w-4" />
              Add First Word
            </button>
          </div>

          <!-- Footer -->
          <div v-if="selectedSet.words.length > 0" class="border-border flex items-center justify-between border-t px-6 py-4">
            <p class="text-muted-foreground text-sm">{{ selectedSet.words.length }} words</p>
            <button
              class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
              @click="saveWords"
            >
              Save Changes
            </button>
          </div>
        </div>

        <!-- No set selected -->
        <div v-else class="bg-card border-border flex flex-col items-center justify-center rounded-2xl border py-20 text-center">
          <Languages class="text-muted-foreground mb-4 h-14 w-14" />
          <h3 class="text-foreground mb-2 font-semibold">Select a vocab set</h3>
          <p class="text-muted-foreground max-w-xs text-sm">Choose a set from the left to view and edit its words</p>
        </div>
      </div>
    </div>

    <!-- Create Set Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showModal = false" />
          <div class="bg-card border-border relative z-10 w-full max-w-md rounded-2xl border shadow-xl">
            <div class="border-border flex items-center justify-between border-b p-6">
              <h3 class="text-foreground text-lg font-semibold">Create Vocab Set</h3>
              <button class="text-muted-foreground hover:text-foreground" @click="showModal = false">
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="space-y-4 p-6">
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Set Name *</label>
                <input
                  v-model="newSet.name"
                  type="text"
                  placeholder="e.g. Animals, Daily Vocabulary..."
                  class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Language</label>
                <select
                  v-model="newSet.language"
                  class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option>English</option>
                  <option>Japanese</option>
                  <option>Chinese</option>
                  <option>French</option>
                  <option>Korean</option>
                </select>
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Assign to Class</label>
                <select
                  v-model="newSet.class"
                  class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">No class (general)</option>
                  <option>English Grammar A1</option>
                  <option>Business English B2</option>
                  <option>IELTS Preparation</option>
                </select>
              </div>
            </div>

            <div class="border-border flex gap-3 border-t p-6">
              <button
                class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-3 font-medium transition-colors"
                @click="showModal = false"
              >
                Cancel
              </button>
              <button
                class="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
                :disabled="!newSet.name.trim()"
                @click="createSet"
              >
                Create Set
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
import { Plus, Trash2, X, BookOpen, Languages, FileText, GraduationCap } from 'lucide-vue-next'

interface VocabWord {
  id: number
  term: string
  definition: string
  example: string
}

interface VocabSet {
  id: number
  name: string
  language: string
  class: string
  emoji: string
  bgColor: string
  words: VocabWord[]
}

// Vocab sets — empty until created by teacher
const sets = ref<VocabSet[]>([])

const selectedSet = ref<VocabSet | null>(null)
const showModal = ref(false)
const newSet = ref({ name: '', language: 'English', class: '' })

const stats = computed(() => [
  { label: 'Total Sets', value: sets.value.length, icon: Languages, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Total Words', value: sets.value.reduce((s, v) => s + v.words.length, 0), icon: BookOpen, color: 'text-chart-2', bg: 'bg-chart-2/10' },
  { label: 'Languages', value: new Set(sets.value.map(s => s.language)).size, icon: GraduationCap, color: 'text-chart-3', bg: 'bg-chart-3/10' },
  { label: 'Assigned', value: sets.value.filter(s => s.class).length, icon: FileText, color: 'text-chart-1', bg: 'bg-chart-1/10' },
])

const openCreateSet = () => {
  newSet.value = { name: '', language: 'English', class: '' }
  showModal.value = true
}

const createSet = () => {
  if (!newSet.value.name.trim()) return
  const emojis = ['📚', '🌟', '🎯', '💡', '🔤', '📖', '✏️', '🗣️']
  const colors = ['bg-chart-2/10', 'bg-chart-4/10', 'bg-chart-3/10', 'bg-chart-5/10', 'bg-chart-1/10']
  const set: VocabSet = {
    id: Date.now(),
    name: newSet.value.name,
    language: newSet.value.language,
    class: newSet.value.class,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    bgColor: colors[Math.floor(Math.random() * colors.length)],
    words: [],
  }
  sets.value.push(set)
  selectedSet.value = set
  showModal.value = false
}

const deleteSet = (id: number) => {
  sets.value = sets.value.filter(s => s.id !== id)
  if (selectedSet.value?.id === id) selectedSet.value = sets.value[0] ?? null
}

const addWord = () => {
  if (!selectedSet.value) return
  selectedSet.value.words.push({ id: Date.now(), term: '', definition: '', example: '' })
}

const removeWord = (id: number) => {
  if (!selectedSet.value) return
  selectedSet.value.words = selectedSet.value.words.filter(w => w.id !== id)
}

const saveWords = () => {
  // In real app: call API to save
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
