<template>
  <div class="p-6 lg:p-8">
    <!-- Back Button -->
    <button
      class="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
      @click="goBack"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to Courses
    </button>

    <!-- Course Header -->
    <div class="animate-fade-in-down mb-8">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex-1">
          <div class="mb-4 flex items-center gap-3">
            <div class="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-xl">
              <component :is="getCourseIcon(course.category)" class="text-primary h-7 w-7" />
            </div>
            <div>
              <span
                class="rounded-full px-3 py-1 text-xs font-medium"
                :class="getDifficultyClass(course.difficulty)"
              >
                {{ course.difficulty }}
              </span>
            </div>
          </div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
            {{ course.title }}
          </h1>
          <p class="text-muted-foreground mt-3 text-base">
            {{ course.description }}
          </p>
        </div>
        <div class="flex gap-3">
          <Button variant="outline" @click="toggleBookmark">
            <Bookmark :class="isBookmarked ? 'fill-current' : ''" class="mr-2 h-4 w-4" />
            {{ isBookmarked ? 'Saved' : 'Save' }}
          </Button>
          <Button @click="startCourse">
            <Play class="mr-2 h-4 w-4" />
            {{ course.progress > 0 ? 'Continue' : 'Start Course' }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-xl border p-4">
        <div class="text-muted-foreground mb-1 text-sm">Lessons</div>
        <div class="text-foreground text-2xl font-bold">{{ course.totalLessons }}</div>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <div class="text-muted-foreground mb-1 text-sm">Duration</div>
        <div class="text-foreground text-2xl font-bold">{{ course.estimatedHours }}h</div>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <div class="text-muted-foreground mb-1 text-sm">Progress</div>
        <div class="text-foreground text-2xl font-bold">{{ course.progress }}%</div>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <div class="text-muted-foreground mb-1 text-sm">Completed</div>
        <div class="text-foreground text-2xl font-bold">{{ course.completedLessons }}/{{ course.totalLessons }}</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="animate-fade-in-up delay-150 mb-8">
      <div class="bg-card border-border rounded-xl border p-6">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-foreground font-medium">Your Progress</span>
          <span class="text-muted-foreground text-sm">{{ course.progress }}% complete</span>
        </div>
        <div class="bg-secondary h-3 overflow-hidden rounded-full">
          <div
            class="bg-primary h-full rounded-full transition-all duration-500"
            :style="{ width: `${course.progress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      <!-- Left Column - Lessons -->
      <div class="lg:col-span-2">
        <div class="animate-fade-in-up delay-200">
          <div class="bg-card border-border rounded-xl border">
            <div class="border-border border-b p-6">
              <h2 class="text-foreground text-lg font-semibold">Course Content</h2>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ course.totalLessons }} lessons • {{ course.estimatedHours }} hours total
              </p>
            </div>
            <div class="divide-border divide-y">
              <div
                v-for="(lesson, index) in lessons"
                :key="lesson.id"
                class="flex items-center gap-4 p-4 transition-colors hover:bg-accent/50"
                :class="{ 'cursor-pointer': lesson.unlocked }"
                @click="lesson.unlocked && openLesson(lesson.id)"
              >
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  :class="lesson.completed
                    ? 'bg-primary/10 text-primary'
                    : lesson.unlocked
                      ? 'bg-chart-1/10 text-chart-1'
                      : 'bg-secondary text-muted-foreground'"
                >
                  <CheckCircle v-if="lesson.completed" class="h-5 w-5" />
                  <Lock v-else-if="!lesson.unlocked" class="h-4 w-4" />
                  <span v-else class="text-sm font-medium">{{ index + 1 }}</span>
                </div>
                <div class="flex-1">
                  <h3
                    class="font-medium"
                    :class="lesson.unlocked ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    {{ lesson.title }}
                  </h3>
                  <p class="text-muted-foreground text-sm">{{ lesson.duration }} min</p>
                </div>
                <ChevronRight
                  v-if="lesson.unlocked"
                  class="text-muted-foreground h-5 w-5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Notes -->
      <div class="animate-fade-in-up delay-300">
        <CourseNotes :course-id="courseId" :lessons="lessonsForNotes" />
      </div>
    </div>

    <!-- Course Certificate Modal -->
    <CourseCertificate
      v-if="course"
      :show="showCertificate"
      :user-name="userName"
      :course-name="course.title"
      :course-category="course.category"
      :total-lessons="course.totalLessons"
      :total-hours="course.estimatedHours"
      @close="showCertificate = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft,
  Play,
  Bookmark,
  CheckCircle,
  Lock,
  ChevronRight,
  Languages,
  BookOpen,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import CourseNotes from '@/components/course/CourseNotes.vue'
import CourseCertificate from '@/components/course/CourseCertificate.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isBookmarked = ref(false)
const showCertificate = ref(false)

// User name for certificate
const userName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]
  return 'Guest'
})

// Lessons formatted for notes component
const lessonsForNotes = computed(() => {
  return lessons.value.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
  }))
})

// Get course ID from route
const courseId = computed(() => Number(route.params.id) || 1)

// Mock course data based on ID
const course = computed(() => {
  const courses: Record<number, {
    id: number
    title: string
    description: string
    category: string
    difficulty: string
    progress: number
    completedLessons: number
    totalLessons: number
    estimatedHours: number
  }> = {
    1: {
      id: 1,
      title: 'English Grammar Fundamentals',
      description: 'Master essential English grammar rules including tenses, articles, prepositions, and sentence structure for clear communication.',
      category: 'Grammar',
      difficulty: 'Beginner',
      progress: 68,
      completedLessons: 12,
      totalLessons: 18,
      estimatedHours: 12,
    },
    2: {
      id: 2,
      title: 'English Vocabulary Builder',
      description: 'Expand your English vocabulary with essential words, collocations, and usage examples for everyday conversations.',
      category: 'Vocabulary',
      difficulty: 'Beginner',
      progress: 45,
      completedLessons: 9,
      totalLessons: 20,
      estimatedHours: 10,
    },
    3: {
      id: 3,
      title: 'IELTS Preparation Course',
      description: 'Comprehensive IELTS preparation covering Reading, Writing, Listening, and Speaking sections with practice tests.',
      category: 'Test Prep',
      difficulty: 'Advanced',
      progress: 32,
      completedLessons: 8,
      totalLessons: 25,
      estimatedHours: 20,
    },
  }
  return courses[courseId.value] || courses[1]
})

// Mock lessons data
const lessons = ref([
  { id: 1, title: 'Introduction to the Course', duration: 10, completed: true, unlocked: true },
  { id: 2, title: 'Getting Started', duration: 15, completed: true, unlocked: true },
  { id: 3, title: 'Core Concepts', duration: 25, completed: true, unlocked: true },
  { id: 4, title: 'Working with Data', duration: 30, completed: true, unlocked: true },
  { id: 5, title: 'Advanced Techniques', duration: 35, completed: false, unlocked: true },
  { id: 6, title: 'Best Practices', duration: 20, completed: false, unlocked: true },
  { id: 7, title: 'Real-world Projects', duration: 45, completed: false, unlocked: false },
  { id: 8, title: 'Final Assessment', duration: 30, completed: false, unlocked: false },
])

const getCourseIcon = (category: string) => {
  const icons: Record<string, typeof BookOpen> = {
    Grammar: BookOpen,
    Vocabulary: Languages,
    'Test Prep': BookOpen,
    Business: BookOpen,
    Pronunciation: BookOpen,
    Writing: BookOpen,
    Listening: BookOpen,
  }
  return icons[category] || BookOpen
}

const getDifficultyClass = (difficulty: string) => {
  const classes: Record<string, string> = {
    Beginner: 'bg-chart-2/10 text-chart-2',
    Intermediate: 'bg-chart-5/10 text-chart-5',
    Advanced: 'bg-destructive/10 text-destructive',
  }
  return classes[difficulty] || 'bg-secondary text-secondary-foreground'
}

const goBack = () => {
  router.push('/courses')
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
}

const startCourse = () => {
  // Find first incomplete lesson
  const nextLesson = lessons.value.find(l => !l.completed && l.unlocked)
  if (nextLesson) {
    openLesson(nextLesson.id)
  }
}

const openLesson = (lessonId: number) => {
  // For now, just show a toast or navigate to a lesson page
  console.log('Opening lesson:', lessonId)
}
</script>
