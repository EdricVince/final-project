<template>
  <div class="p-6 lg:p-8">
    <!-- Back Button -->
    <button
      class="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
      @click="goBack"
    >
      <ArrowLeft class="h-4 w-4" />
      {{ $t('courses.detail.backToCourses') }}
    </button>

    <!-- Not found state -->
    <div v-if="!course" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="bg-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-2xl">
        <BookOpen class="text-muted-foreground h-12 w-12" />
      </div>
      <h3 class="text-foreground mb-3 text-2xl font-semibold">{{ $t('courses.detail.notFound') }}</h3>
      <p class="text-muted-foreground mb-8 max-w-md text-lg">{{ $t('courses.detail.notFoundDesc') }}</p>
      <Button @click="goBack">{{ $t('courses.detail.backToCourses') }}</Button>
    </div>

    <!-- Course Header -->
    <div v-else class="animate-fade-in-down mb-8">
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
            {{ isBookmarked ? $t('courses.detail.saved') : $t('courses.detail.save') }}
          </Button>
          <Button @click="startCourse">
            <Play class="mr-2 h-4 w-4" />
            {{ course.progress > 0 ? $t('courses.detail.continueCourse') : $t('courses.detail.startCourse') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="course" class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-1/10">
          <BookOpen class="text-chart-1 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ course.totalLessons }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('courses.detail.stats.lessons') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10">
          <Clock class="text-chart-2 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ course.estimatedHours }}h</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('courses.detail.stats.duration') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-3/10">
          <TrendingUp class="text-chart-3 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ course.progress }}%</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('courses.detail.stats.progress') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-4/10">
          <CheckCircle2 class="text-chart-4 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ course.completedLessons }}/{{ course.totalLessons }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('courses.detail.stats.completed') }}</p>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="course" class="animate-fade-in-up delay-150 mb-8">
      <div class="bg-card border-border rounded-xl border p-6">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-foreground font-medium">{{ $t('courses.detail.yourProgress') }}</span>
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
    <div v-if="course" class="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      <!-- Left Column - Lessons -->
      <div class="lg:col-span-2">
        <div class="animate-fade-in-up delay-200">
          <div class="bg-card border-border rounded-xl border">
            <div class="border-border border-b p-6">
              <h2 class="text-foreground text-lg font-semibold">{{ $t('courses.detail.courseContent') }}</h2>
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
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft,
  Play,
  Bookmark,
  CheckCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Lock,
  ChevronRight,
  Languages,
  BookOpen,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import CourseNotes from '@/components/course/CourseNotes.vue'
import CourseCertificate from '@/components/course/CourseCertificate.vue'
import { useAuthStore } from '@/stores/auth.store'

const { t } = useI18n()
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

// Course data — empty until loaded from API
const course = computed<{
  id: number; title: string; description: string; category: string; difficulty: string
  progress: number; completedLessons: number; totalLessons: number; estimatedHours: number
} | null>(() => null)

// Lessons — empty until loaded from API
const lessons = ref<{ id: number; title: string; duration: number; completed: boolean; unlocked: boolean }[]>([])

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
  router.push(`/courses/${courseId.value}/lessons/${lessonId}`)
}
</script>
