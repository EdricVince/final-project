<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-foreground text-2xl font-bold">Classes</h2>
        <p class="text-muted-foreground mt-1 text-sm">Manage your classes and share join codes with students</p>
      </div>
      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-colors"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Create Class
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

    <!-- Search & Filter -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search classes..."
          class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          class="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          :class="activeFilter === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Classes Grid -->
    <div v-if="filteredClasses.length > 0" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="cls in filteredClasses"
        :key="cls.id"
        class="bg-card border-border rounded-2xl border p-6 transition-all hover:shadow-md"
      >
        <!-- Card Header -->
        <div class="mb-4 flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl text-xl" :class="cls.bgColor">
              {{ cls.emoji }}
            </div>
            <div>
              <h3 class="text-foreground font-semibold">{{ cls.name }}</h3>
              <p class="text-muted-foreground text-xs">{{ cls.subject }}</p>
            </div>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="cls.isActive ? 'bg-chart-2/10 text-chart-2' : 'bg-secondary text-muted-foreground'"
          >
            {{ cls.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <!-- Join Code — main feature -->
        <div class="bg-primary/5 border-primary/20 mb-4 flex items-center justify-between rounded-xl border px-4 py-3">
          <div>
            <p class="text-muted-foreground mb-0.5 text-xs font-medium uppercase tracking-wide">Join Code</p>
            <p class="text-primary font-mono text-2xl font-bold tracking-widest">{{ cls.joinCode }}</p>
          </div>
          <button
            class="hover:bg-primary/10 rounded-lg p-2 transition-colors"
            @click="copyCode(cls.joinCode)"
            title="Copy join code"
          >
            <Check v-if="copiedCode === cls.joinCode" class="text-primary h-5 w-5" />
            <Copy v-else class="text-muted-foreground h-5 w-5" />
          </button>
        </div>

        <!-- Mini Stats -->
        <div class="mb-4 grid grid-cols-3 gap-2 text-center">
          <div class="bg-secondary/50 rounded-lg p-2">
            <p class="text-foreground text-sm font-bold">{{ cls.studentCount }}</p>
            <p class="text-muted-foreground text-xs">Students</p>
          </div>
          <div class="bg-secondary/50 rounded-lg p-2">
            <p class="text-foreground text-sm font-bold">{{ cls.lessonCount }}</p>
            <p class="text-muted-foreground text-xs">Lessons</p>
          </div>
          <div class="bg-secondary/50 rounded-lg p-2">
            <p class="text-foreground text-sm font-bold">{{ cls.testCount }}</p>
            <p class="text-muted-foreground text-xs">Tests</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            class="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
            @click="router.push(`/teacher/classes/${cls.id}`)"
          >
            View Details
          </button>
          <button
            class="bg-secondary hover:bg-secondary/80 rounded-xl p-2.5 transition-colors"
            @click="openEditModal(cls)"
          >
            <Pencil class="text-muted-foreground h-4 w-4" />
          </button>
          <button
            class="hover:bg-destructive/10 rounded-xl p-2.5 transition-colors"
            @click="confirmDelete(cls)"
          >
            <Trash2 class="text-destructive h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <div class="bg-secondary mb-4 flex h-20 w-20 items-center justify-center rounded-2xl">
        <BookOpen class="text-muted-foreground h-10 w-10" />
      </div>
      <h3 class="text-foreground mb-2 text-lg font-semibold">No classes yet</h3>
      <p class="text-muted-foreground mb-6 max-w-sm text-sm">
        Create your first class and share the join code with students so they can enroll.
      </p>
      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-colors"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Create First Class
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showModal = false" />
          <div class="bg-card border-border relative z-10 w-full max-w-md rounded-2xl border shadow-xl">
            <div class="border-border flex items-center justify-between border-b p-6">
              <h3 class="text-foreground text-lg font-semibold">
                {{ editingClass ? 'Edit Class' : 'Create New Class' }}
              </h3>
              <button class="text-muted-foreground hover:text-foreground" @click="showModal = false">
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="space-y-4 p-6">
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Class Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. English Grammar A1"
                  class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Subject</label>
                <select
                  v-model="form.subject"
                  class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="What will students learn in this class?"
                  class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label class="text-foreground mb-1.5 block text-sm font-medium">Max Students</label>
                <input
                  v-model.number="form.maxStudents"
                  type="number" min="1" max="100"
                  class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <!-- Join Code Preview -->
              <div v-if="!editingClass" class="bg-primary/5 border-primary/20 rounded-xl border p-4">
                <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Join Code (auto-generated)</p>
                <div class="flex items-center justify-between">
                  <p class="text-primary font-mono text-2xl font-bold tracking-widest">{{ previewCode }}</p>
                  <button
                    class="text-muted-foreground hover:text-primary rounded-lg px-2 py-1 text-xs underline transition-colors"
                    @click="previewCode = generateCode()"
                  >
                    Regenerate
                  </button>
                </div>
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
                :disabled="!form.name.trim()"
                @click="saveClass"
              >
                {{ editingClass ? 'Save Changes' : 'Create Class' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteModal = false" />
          <div class="bg-card border-border relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-xl">
            <div class="bg-destructive/10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Trash2 class="text-destructive h-6 w-6" />
            </div>
            <h3 class="text-foreground mb-2 font-semibold">Delete Class?</h3>
            <p class="text-muted-foreground mb-6 text-sm">
              "{{ deletingClass?.name }}" will be permanently deleted along with all student data.
            </p>
            <div class="flex gap-3">
              <button
                class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-2.5 font-medium transition-colors"
                @click="showDeleteModal = false"
              >
                Cancel
              </button>
              <button
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1 rounded-xl py-2.5 font-medium transition-colors"
                @click="deleteClass"
              >
                Delete
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
import {
  Plus, Search, BookOpen, Users, FileText, GraduationCap,
  Copy, Check, Pencil, Trash2, X,
} from 'lucide-vue-next'

const router = useRouter()

interface ClassItem {
  id: number
  name: string
  subject: string
  description: string
  joinCode: string
  studentCount: number
  lessonCount: number
  testCount: number
  maxStudents: number
  isActive: boolean
  emoji: string
  bgColor: string
}

// Classes — empty until created by teacher
const classes = ref<ClassItem[]>([])

const searchQuery = ref('')
const activeFilter = ref('all')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingClass = ref<ClassItem | null>(null)
const deletingClass = ref<ClassItem | null>(null)
const copiedCode = ref('')
const previewCode = ref('')

const subjects = ['English', 'IELTS', 'TOEIC', 'Japanese', 'Chinese', 'Korean', 'French', 'Other']
const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const stats = computed(() => [
  { label: 'Total Classes', value: classes.value.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Active', value: classes.value.filter(c => c.isActive).length, icon: GraduationCap, color: 'text-chart-2', bg: 'bg-chart-2/10' },
  { label: 'Total Students', value: classes.value.reduce((s, c) => s + c.studentCount, 0), icon: Users, color: 'text-chart-3', bg: 'bg-chart-3/10' },
  { label: 'Total Tests', value: classes.value.reduce((s, c) => s + c.testCount, 0), icon: FileText, color: 'text-chart-1', bg: 'bg-chart-1/10' },
])

const filteredClasses = computed(() => {
  let list = classes.value
  if (activeFilter.value === 'active') list = list.filter(c => c.isActive)
  if (activeFilter.value === 'inactive') list = list.filter(c => !c.isActive)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q))
  }
  return list
})

const form = ref({ name: '', subject: 'English', description: '', maxStudents: 30 })

const generateCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('')
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${num}`
}

const openCreateModal = () => {
  editingClass.value = null
  form.value = { name: '', subject: 'English', description: '', maxStudents: 30 }
  previewCode.value = generateCode()
  showModal.value = true
}

const openEditModal = (cls: ClassItem) => {
  editingClass.value = cls
  form.value = { name: cls.name, subject: cls.subject, description: cls.description, maxStudents: cls.maxStudents }
  showModal.value = true
}

const saveClass = () => {
  if (!form.value.name.trim()) return
  if (editingClass.value) {
    const idx = classes.value.findIndex(c => c.id === editingClass.value!.id)
    if (idx !== -1) Object.assign(classes.value[idx], form.value)
  } else {
    const emojis = ['📚', '💼', '🎯', '🌸', '⭐', '🔥', '💡', '🎓']
    const colors = ['bg-chart-2/10', 'bg-chart-4/10', 'bg-chart-3/10', 'bg-chart-5/10', 'bg-chart-1/10']
    classes.value.push({
      id: Date.now(), ...form.value,
      joinCode: previewCode.value,
      studentCount: 0, lessonCount: 0, testCount: 0, isActive: true,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      bgColor: colors[Math.floor(Math.random() * colors.length)],
    })
  }
  showModal.value = false
}

const confirmDelete = (cls: ClassItem) => { deletingClass.value = cls; showDeleteModal.value = true }
const deleteClass = () => {
  if (deletingClass.value) classes.value = classes.value.filter(c => c.id !== deletingClass.value!.id)
  showDeleteModal.value = false
}

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code)
  copiedCode.value = code
  setTimeout(() => { copiedCode.value = '' }, 2000)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
