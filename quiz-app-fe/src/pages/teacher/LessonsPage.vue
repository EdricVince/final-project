<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-foreground text-2xl font-bold">Lessons</h2>
        <p class="text-muted-foreground mt-1 text-sm">Create and assign lessons to your classes</p>
      </div>
      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-colors"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Create Lesson
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

    <!-- Filter Bar -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search lessons..."
          class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <select
        v-model="classFilter"
        class="border-border bg-background text-foreground rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">All Classes</option>
        <option v-for="c in classOptions" :key="c" :value="c">{{ c }}</option>
      </select>
      <div class="flex gap-2">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          class="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          :class="statusFilter === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
          @click="statusFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Lessons List -->
    <div v-if="filteredLessons.length > 0" class="space-y-4">
      <div
        v-for="lesson in filteredLessons"
        :key="lesson.id"
        class="bg-card border-border rounded-2xl border p-6 transition-all hover:shadow-md"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
          <!-- Thumbnail -->
          <div
            class="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl text-2xl"
            :class="lesson.bgColor"
          >
            {{ lesson.emoji }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <h3 class="text-foreground font-semibold">{{ lesson.title }}</h3>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="statusClass(lesson.status)"
              >
                {{ lesson.status }}
              </span>
            </div>
            <p class="text-muted-foreground mb-3 line-clamp-2 text-sm">{{ lesson.description }}</p>
            <div class="flex flex-wrap items-center gap-3 text-xs">
              <span class="text-muted-foreground flex items-center gap-1">
                <BookOpen class="h-3.5 w-3.5" />
                {{ lesson.class }}
              </span>
              <span class="text-muted-foreground flex items-center gap-1">
                <Clock class="h-3.5 w-3.5" />
                {{ lesson.duration }} min
              </span>
              <span class="text-muted-foreground flex items-center gap-1">
                <Users class="h-3.5 w-3.5" />
                {{ lesson.viewCount }} viewed
              </span>
              <span v-if="lesson.vocabSet" class="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-0.5">
                <Languages class="h-3 w-3" />
                {{ lesson.vocabSet }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex shrink-0 gap-2">
            <button
              class="bg-secondary hover:bg-secondary/80 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              @click="openEditModal(lesson)"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <button
              class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              @click="viewLesson(lesson)"
            >
              View
            </button>
            <button
              class="hover:bg-destructive/10 rounded-xl p-2.5 transition-colors"
              @click="confirmDelete(lesson)"
            >
              <Trash2 class="text-destructive h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <div class="bg-secondary mb-4 flex h-20 w-20 items-center justify-center rounded-2xl">
        <GraduationCap class="text-muted-foreground h-10 w-10" />
      </div>
      <h3 class="text-foreground mb-2 text-lg font-semibold">No lessons found</h3>
      <p class="text-muted-foreground mb-6 max-w-sm text-sm">
        Create your first lesson and assign it to a class.
      </p>
      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-colors"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Create First Lesson
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showModal = false" />
          <div class="bg-card border-border relative z-10 w-full max-w-lg rounded-2xl border shadow-xl">
            <div class="border-border flex items-center justify-between border-b p-6">
              <h3 class="text-foreground text-lg font-semibold">
                {{ editingLesson ? 'Edit Lesson' : 'Create Lesson' }}
              </h3>
              <button class="text-muted-foreground hover:text-foreground" @click="showModal = false">
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="max-h-[60vh] space-y-4 overflow-y-auto p-6">
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Title *</label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="e.g. Introduction to Past Tense"
                  class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Assign to Class *</label>
                <select
                  v-model="form.class"
                  class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a class</option>
                  <option v-for="c in classOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="What will students learn in this lesson?"
                  class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-foreground mb-1.5 block text-sm font-medium">Duration (min)</label>
                  <input
                    v-model.number="form.duration"
                    type="number" min="1" max="180"
                    class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label class="text-foreground mb-1.5 block text-sm font-medium">Status</label>
                  <select
                    v-model="form.status"
                    class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Video URL</label>
                <input
                  v-model="form.videoUrl"
                  type="url"
                  placeholder="YouTube or Vimeo URL"
                  class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Lesson Content</label>
                <textarea
                  v-model="form.content"
                  rows="4"
                  placeholder="Write lesson content, notes, grammar rules..."
                  class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Attach Vocabulary Set</label>
                <select
                  v-model="form.vocabSet"
                  class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">None</option>
                  <option>Animals</option>
                  <option>Business Terms</option>
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
                :disabled="!form.title.trim() || !form.class"
                @click="saveLesson"
              >
                {{ editingLesson ? 'Save Changes' : 'Create Lesson' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteModal = false" />
          <div class="bg-card border-border relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-xl">
            <div class="bg-destructive/10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Trash2 class="text-destructive h-6 w-6" />
            </div>
            <h3 class="text-foreground mb-2 font-semibold">Delete Lesson?</h3>
            <p class="text-muted-foreground mb-6 text-sm">"{{ deletingLesson?.title }}" will be permanently deleted.</p>
            <div class="flex gap-3">
              <button class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-2.5 font-medium" @click="showDeleteModal = false">Cancel</button>
              <button class="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1 rounded-xl py-2.5 font-medium" @click="deleteLesson">Delete</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, BookOpen, Clock, Users, Languages, GraduationCap, FileText, Pencil, Trash2, X } from '@/components/icons'

interface Lesson {
  id: number
  title: string
  description: string
  class: string
  duration: number
  status: string
  videoUrl: string
  content: string
  vocabSet: string
  viewCount: number
  emoji: string
  bgColor: string
}

// Lessons — empty until created by teacher
const lessons = ref<Lesson[]>([])

const searchQuery = ref('')
const classFilter = ref('')
const statusFilter = ref('all')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingLesson = ref<Lesson | null>(null)
const deletingLesson = ref<Lesson | null>(null)

const classOptions: string[] = []
const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'Published', label: 'Published' },
  { value: 'Draft', label: 'Draft' },
]

const stats = computed(() => [
  { label: 'Total Lessons', value: lessons.value.length, icon: GraduationCap, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Published', value: lessons.value.filter(l => l.status === 'Published').length, icon: FileText, color: 'text-chart-2', bg: 'bg-chart-2/10' },
  { label: 'Total Views', value: lessons.value.reduce((s, l) => s + l.viewCount, 0), icon: Users, color: 'text-chart-3', bg: 'bg-chart-3/10' },
  { label: 'Avg Duration', value: lessons.value.length ? Math.round(lessons.value.reduce((s, l) => s + l.duration, 0) / lessons.value.length) + 'm' : '0m', icon: Clock, color: 'text-chart-1', bg: 'bg-chart-1/10' },
])

const filteredLessons = computed(() => {
  let list = lessons.value
  if (classFilter.value) list = list.filter(l => l.class === classFilter.value)
  if (statusFilter.value !== 'all') list = list.filter(l => l.status === statusFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
  }
  return list
})

const statusClass = (status: string) => {
  if (status === 'Published') return 'bg-chart-2/10 text-chart-2'
  if (status === 'Draft') return 'bg-secondary text-muted-foreground'
  return 'bg-chart-1/10 text-chart-1'
}

const form = ref({ title: '', class: '', description: '', duration: 45, status: 'Draft', videoUrl: '', content: '', vocabSet: '' })

const openCreateModal = () => {
  editingLesson.value = null
  form.value = { title: '', class: '', description: '', duration: 45, status: 'Draft', videoUrl: '', content: '', vocabSet: '' }
  showModal.value = true
}

const openEditModal = (lesson: Lesson) => {
  editingLesson.value = lesson
  form.value = { title: lesson.title, class: lesson.class, description: lesson.description, duration: lesson.duration, status: lesson.status, videoUrl: lesson.videoUrl, content: lesson.content, vocabSet: lesson.vocabSet }
  showModal.value = true
}

const saveLesson = () => {
  if (!form.value.title.trim() || !form.value.class) return
  if (editingLesson.value) {
    const idx = lessons.value.findIndex(l => l.id === editingLesson.value!.id)
    if (idx !== -1) Object.assign(lessons.value[idx]!, form.value)
  } else {
    const emojis = ['📖', '✉️', '🎯', '💡', '📝', '🎓', '🔤', '📚']
    const colors = ['bg-chart-2/10', 'bg-chart-4/10', 'bg-chart-3/10', 'bg-chart-5/10', 'bg-chart-1/10']
    lessons.value.push({
      id: Date.now(), ...form.value, viewCount: 0,
      emoji: emojis[Math.floor(Math.random() * emojis.length)] ?? '📖',
      bgColor: colors[Math.floor(Math.random() * colors.length)] ?? 'bg-chart-1/10',
    })
  }
  showModal.value = false
}

const viewLesson = (_lesson: Lesson) => { /* navigate to lesson detail */ }
const confirmDelete = (lesson: Lesson) => { deletingLesson.value = lesson; showDeleteModal.value = true }
const deleteLesson = () => {
  if (deletingLesson.value) lessons.value = lessons.value.filter(l => l.id !== deletingLesson.value!.id)
  showDeleteModal.value = false
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
