<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ $t('teacher.classes.title') }}</h1>
        <p class="text-muted-foreground mt-2">{{ $t('teacher.classes.subtitle') }}</p>
      </div>
      <Button @click="openCreateModal">
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('teacher.classes.createClass') }}
      </Button>
    </div>

    <!-- Stats -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-1/10">
          <BookOpen class="text-chart-1 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ classes.length }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.classes.stats.total') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10">
          <CheckSquare class="text-chart-2 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ activeClassCount }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.classes.stats.active') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-3/10">
          <Users class="text-chart-3 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ totalStudents }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.classes.stats.students') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-4/10">
          <BarChart2 class="text-chart-4 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ avgClassSize }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.classes.stats.avgSize') }}</p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="animate-fade-in-up delay-150 mb-6 flex flex-col gap-4 sm:flex-row">
      <div class="relative flex-1">
        <Search class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search classes..."
          class="bg-secondary text-foreground placeholder:text-muted-foreground h-10 w-full rounded-xl border-0 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          :class="
            activeFilter === filter.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          "
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Classes Grid -->
    <div class="animate-fade-in-up delay-200 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="cls in filteredClasses"
        :key="cls.id"
        class="bg-card border-border group relative rounded-2xl border p-6 transition-all hover:shadow-lg"
      >
        <!-- Class Code Badge -->
        <div class="mb-4 flex items-center justify-between">
          <span
            class="rounded-full px-3 py-1 text-xs font-medium"
            :class="cls.is_active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'"
          >
            {{ cls.is_active ? $t('teacher.classes.status.active') : $t('teacher.classes.status.inactive') }}
          </span>
          <button
            class="text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100"
            @click="copyClassCode(cls.class_code)"
          >
            <Copy class="h-4 w-4" />
          </button>
        </div>

        <!-- Class Info -->
        <h3 class="text-foreground mb-2 text-lg font-semibold">{{ cls.name }}</h3>
        <p class="text-muted-foreground mb-4 line-clamp-2 text-sm">{{ cls.description || 'No description' }}</p>

        <!-- Class Code Display -->
        <div class="bg-secondary mb-4 rounded-xl p-3 text-center">
          <p class="text-muted-foreground text-xs">{{ $t('teacher.classes.classCode') }}</p>
          <p class="text-foreground font-mono text-lg font-bold">{{ cls.class_code }}</p>
        </div>

        <!-- Stats -->
        <div class="mb-4 flex justify-between text-sm">
          <div class="flex items-center gap-1">
            <Users class="text-muted-foreground h-4 w-4" />
            <span class="text-foreground">{{ cls.student_count || 0 }}/{{ cls.student_limit }}</span>
          </div>
          <div class="flex items-center gap-1">
            <BookOpen class="text-muted-foreground h-4 w-4" />
            <span class="text-muted-foreground">{{ cls.subject || 'General' }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <Button variant="outline" size="sm" class="flex-1" @click="viewClass(cls.id)">
            {{ $t('teacher.classes.viewDetails') }}
          </Button>
          <Button variant="ghost" size="sm" @click="editClass(cls)">
            <Pencil class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" @click="confirmDelete(cls)">
            <Trash2 class="text-destructive h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredClasses.length === 0"
        class="bg-card border-border col-span-full flex flex-col items-center justify-center rounded-2xl border p-12"
      >
        <div class="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <BookOpen class="text-muted-foreground h-8 w-8" />
        </div>
        <h3 class="text-foreground mb-2 font-medium">{{ $t('teacher.classes.noClassesFound') }}</h3>
        <p class="text-muted-foreground mb-4 text-sm">{{ $t('teacher.classes.createFirstClass') }}</p>
        <Button @click="openCreateModal">
          <Plus class="mr-2 h-4 w-4" />
          {{ $t('teacher.classes.createClass') }}
        </Button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <ClassModal
      :show="showModal"
      :class-data="editingClass"
      @close="closeModal"
      @save="saveClass"
    />

    <!-- Delete Confirmation -->
    <DeleteConfirmModal
      :show="showDeleteModal"
      title="Delete Class"
      :message="`Are you sure you want to delete '${deletingClass?.name}'? This action cannot be undone.`"
      @confirm="deleteClass"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Search, Users, BookOpen, Copy, Pencil, Trash2, CheckSquare, BarChart2 } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import ClassModal from '@/components/teacher/ClassModal.vue'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { useToast } from '@/composables/useToast'
import type { Class, CreateClassDto } from '@/types/class'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const searchQuery = ref('')
const activeFilter = ref('all')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingClass = ref<Class | null>(null)
const deletingClass = ref<Class | null>(null)

const filters = computed(() => [
  { label: t('teacher.classes.filters.all'), value: 'all' },
  { label: t('teacher.classes.filters.active'), value: 'active' },
  { label: t('teacher.classes.filters.inactive'), value: 'inactive' },
])

// Mock data
const classes = ref<Class[]>([
  {
    id: 1,
    name: 'Business English 101',
    description: 'Introduction to business communication and vocabulary',
    subject: 'Business',
    class_code: 'BUS101',
    student_limit: 20,
    teacher_id: 1,
    is_active: true,
    created_at: '2024-01-01',
    student_count: 18,
  },
  {
    id: 2,
    name: 'IELTS Preparation',
    description: 'Comprehensive IELTS exam preparation course',
    subject: 'Academic',
    class_code: 'IELTS01',
    student_limit: 15,
    teacher_id: 1,
    is_active: true,
    created_at: '2024-01-15',
    student_count: 15,
  },
  {
    id: 3,
    name: 'Conversation Practice',
    description: 'Daily conversation and speaking practice',
    subject: 'Speaking',
    class_code: 'CONV01',
    student_limit: 20,
    teacher_id: 1,
    is_active: true,
    created_at: '2024-02-01',
    student_count: 12,
  },
])

const filteredClasses = computed(() => {
  let result = classes.value

  // Filter by status
  if (activeFilter.value === 'active') {
    result = result.filter(c => c.is_active)
  } else if (activeFilter.value === 'inactive') {
    result = result.filter(c => !c.is_active)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.subject?.toLowerCase().includes(query) ||
        c.class_code.toLowerCase().includes(query)
    )
  }

  return result
})

const activeClassCount = computed(() => classes.value.filter(c => c.is_active).length)
const totalStudents = computed(() => classes.value.reduce((sum, c) => sum + (c.student_count || 0), 0))
const avgClassSize = computed(() => {
  if (classes.value.length === 0) return 0
  return Math.round(totalStudents.value / classes.value.length)
})

const generateClassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const openCreateModal = () => {
  editingClass.value = null
  showModal.value = true
}

const editClass = (cls: Class) => {
  editingClass.value = cls
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingClass.value = null
}

const saveClass = (data: CreateClassDto) => {
  if (editingClass.value) {
    // Update existing class
    const index = classes.value.findIndex(c => c.id === editingClass.value!.id)
    if (index !== -1) {
      classes.value[index] = {
        ...classes.value[index],
        ...data,
      }
      toast.success('Class updated successfully!')
    }
  } else {
    // Create new class
    const newClass: Class = {
      id: Date.now(),
      ...data,
      class_code: generateClassCode(),
      teacher_id: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      student_count: 0,
    }
    classes.value.unshift(newClass)
    toast.success('Class created successfully!')
  }
  closeModal()
}

const viewClass = (id: number) => {
  router.push(`/teacher/classes/${id}`)
}

const copyClassCode = (code: string) => {
  navigator.clipboard.writeText(code)
  toast.success('Class code copied!')
}

const confirmDelete = (cls: Class) => {
  deletingClass.value = cls
  showDeleteModal.value = true
}

const deleteClass = () => {
  if (deletingClass.value) {
    classes.value = classes.value.filter(c => c.id !== deletingClass.value!.id)
    toast.success('Class deleted successfully!')
  }
  showDeleteModal.value = false
  deletingClass.value = null
}
</script>
