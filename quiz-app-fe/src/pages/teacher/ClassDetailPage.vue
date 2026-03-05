<template>
  <div class="p-6 lg:p-8">
    <!-- Back Button -->
    <button
      class="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
      @click="goBack"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to Classes
    </button>

    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div class="mb-2 flex items-center gap-3">
            <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
              {{ classData.name }}
            </h1>
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="classData.is_active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'"
            >
              {{ classData.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p class="text-muted-foreground">{{ classData.description }}</p>
        </div>

        <!-- Class Code -->
        <div class="bg-card border-border rounded-xl border p-4 text-center">
          <p class="text-muted-foreground text-sm">Class Code</p>
          <p class="text-foreground font-mono text-2xl font-bold">{{ classData.class_code }}</p>
          <button
            class="text-primary hover:text-primary/80 mt-2 flex items-center gap-1 text-sm"
            @click="copyCode"
          >
            <Copy class="h-4 w-4" />
            Copy Code
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-1/10">
          <Users class="text-chart-1 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ students.length }}/{{ classData.student_limit }}</p>
        <p class="text-muted-foreground mt-1 text-sm">Students</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10">
          <Video class="text-chart-2 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ videos.length }}</p>
        <p class="text-muted-foreground mt-1 text-sm">Videos</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-3/10">
          <FileText class="text-chart-3 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ tests.length }}</p>
        <p class="text-muted-foreground mt-1 text-sm">Tests</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-4/10">
          <BarChart2 class="text-chart-4 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ avgScore }}%</p>
        <p class="text-muted-foreground mt-1 text-sm">Avg. Score</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="animate-fade-in-up delay-150 mb-6">
      <div class="border-border flex gap-1 border-b">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="border-b-2 px-4 py-3 text-sm font-medium transition-colors"
          :class="
            activeTab === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="animate-fade-in-up delay-200">
      <!-- Students Tab -->
      <div v-if="activeTab === 'students'" class="bg-card border-border rounded-2xl border">
        <div class="border-border flex items-center justify-between border-b p-4">
          <h2 class="text-foreground font-semibold">Students ({{ students.length }})</h2>
        </div>
        <div class="divide-border divide-y">
          <div
            v-for="student in students"
            :key="student.id"
            class="flex items-center gap-4 p-4"
          >
            <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <span class="text-primary font-medium">{{ getInitials(student.student_name || student.student_email) }}</span>
            </div>
            <div class="flex-1">
              <p class="text-foreground font-medium">{{ student.student_name || student.student_email }}</p>
              <p class="text-muted-foreground text-sm">Joined {{ formatDate(student.joined_at) }}</p>
            </div>
            <Button variant="ghost" size="sm" @click="removeStudent(student)">
              <UserMinus class="text-destructive h-4 w-4" />
            </Button>
          </div>

          <div v-if="students.length === 0" class="p-8 text-center">
            <p class="text-muted-foreground">No students have joined this class yet.</p>
          </div>
        </div>
      </div>

      <!-- Videos Tab -->
      <div v-if="activeTab === 'videos'" class="bg-card border-border rounded-2xl border">
        <div class="border-border flex items-center justify-between border-b p-4">
          <h2 class="text-foreground font-semibold">Videos ({{ videos.length }})</h2>
          <Button size="sm">
            <Plus class="mr-2 h-4 w-4" />
            Add Video
          </Button>
        </div>
        <div class="divide-border divide-y">
          <div
            v-for="video in videos"
            :key="video.id"
            class="flex items-center gap-4 p-4"
          >
            <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <Video class="text-primary h-6 w-6" />
            </div>
            <div class="flex-1">
              <p class="text-foreground font-medium">{{ video.title }}</p>
              <p class="text-muted-foreground text-sm">{{ video.lesson_name }}</p>
            </div>
          </div>

          <div v-if="videos.length === 0" class="p-8 text-center">
            <p class="text-muted-foreground">No videos uploaded yet.</p>
          </div>
        </div>
      </div>

      <!-- Tests Tab -->
      <div v-if="activeTab === 'tests'" class="bg-card border-border rounded-2xl border">
        <div class="border-border flex items-center justify-between border-b p-4">
          <h2 class="text-foreground font-semibold">Tests ({{ tests.length }})</h2>
          <Button size="sm" @click="$router.push('/teacher/tests/new')">
            <Plus class="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </div>
        <div class="divide-border divide-y">
          <div
            v-for="test in tests"
            :key="test.id"
            class="flex items-center gap-4 p-4"
          >
            <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <FileText class="text-primary h-6 w-6" />
            </div>
            <div class="flex-1">
              <p class="text-foreground font-medium">{{ test.title }}</p>
              <p class="text-muted-foreground text-sm">{{ test.question_count }} questions • {{ test.time_limit }} min</p>
            </div>
            <Button variant="outline" size="sm" @click="$router.push(`/teacher/tests/${test.id}/results`)">
              View Results
            </Button>
          </div>

          <div v-if="tests.length === 0" class="p-8 text-center">
            <p class="text-muted-foreground">No tests assigned to this class.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Copy, UserMinus, Plus, Video, FileText, Users, BarChart2 } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { useToast } from '@/composables/useToast'
import type { ClassStudent } from '@/types/class'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const activeTab = ref('students')

const tabs = [
  { label: 'Students', value: 'students' },
  { label: 'Videos', value: 'videos' },
  { label: 'Tests', value: 'tests' },
]

const classData = ref({
  id: Number(route.params.id),
  name: '',
  description: '',
  subject: '',
  class_code: '—',
  student_limit: 0,
  is_active: false,
})

const students = ref<ClassStudent[]>([])
const videos = ref<{ id: number; title: string; lesson_name: string }[]>([])
const tests = ref<{ id: number; title: string; question_count: number; time_limit: number }[]>([])
const avgScore = ref(0)

const goBack = () => {
  router.push('/teacher/classes')
}

const copyCode = () => {
  navigator.clipboard.writeText(classData.value.class_code)
  toast.success('Class code copied!')
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const removeStudent = (student: ClassStudent) => {
  students.value = students.value.filter(s => s.id !== student.id)
  toast.success('Student removed from class')
}
</script>
