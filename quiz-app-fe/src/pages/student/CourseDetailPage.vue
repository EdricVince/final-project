<template>
  <div class="p-6 lg:p-8">
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

    <!-- Content Tabs -->
    <div v-if="course && lessonContent" ref="contentRef" class="animate-fade-in-up delay-200 scroll-mt-20">
      <!-- Tab Bar -->
      <div class="mb-5 flex gap-2">
        <button
          v-for="tab in contentTabs"
          :key="tab.key"
          class="rounded-xl border px-4 py-2 text-sm font-medium transition-all"
          :class="activeContentTab === tab.key
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border text-muted-foreground hover:bg-secondary/50 hover:text-foreground'"
          @click="activeContentTab = tab.key"
        >
          {{ tab.label }}
          <span class="ml-1.5 rounded-full bg-secondary px-1.5 py-0.5 text-xs">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Vocabulary Tab -->
      <div v-if="activeContentTab === 'vocab'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(word, i) in lessonContent.vocabulary"
          :key="i"
          class="bg-card border-border cursor-pointer rounded-2xl border p-4 transition-all hover:border-primary/30 hover:shadow-md"
          @click="flippedCards.has(i) ? flippedCards.delete(i) : flippedCards.add(i); flippedCards = new Set(flippedCards)"
        >
          <div v-if="!flippedCards.has(i)">
            <p class="text-foreground text-lg font-bold">{{ word.term }}</p>
            <p class="text-muted-foreground mt-0.5 text-xs">Click to reveal</p>
          </div>
          <div v-else>
            <p class="text-primary text-sm font-semibold">{{ word.term }}</p>
            <p class="text-foreground mt-1 text-sm">{{ word.definition }}</p>
            <p v-if="word.example" class="text-muted-foreground mt-1.5 text-xs italic">{{ word.example }}</p>
          </div>
        </div>
        <div v-if="!lessonContent.vocabulary.length" class="col-span-3 py-12 text-center">
          <p class="text-muted-foreground text-sm">No vocabulary in this lesson.</p>
        </div>
      </div>

      <!-- Quiz Tab -->
      <div v-else-if="activeContentTab === 'quiz'" class="space-y-4">
        <div
          v-for="(q, i) in lessonContent.quiz"
          :key="i"
          class="bg-card border-border rounded-2xl border p-5"
        >
          <p class="text-foreground mb-4 font-semibold">{{ i + 1 }}. {{ q.question }}</p>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              v-for="(opt, j) in q.options"
              :key="j"
              class="rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all"
              :class="quizAnswers.get(i) === undefined
                ? 'border-border hover:border-primary/40 hover:bg-primary/5 text-foreground'
                : quizAnswers.get(i) === j
                  ? j === q.correct ? 'border-chart-2 bg-chart-2/10 text-chart-2' : 'border-destructive bg-destructive/10 text-destructive'
                  : j === q.correct && quizAnswers.get(i) !== undefined ? 'border-chart-2 bg-chart-2/10 text-chart-2' : 'border-border text-muted-foreground'"
              @click="answerQuiz(i, j)"
            >
              <span class="mr-2 font-bold">{{ ['A','B','C','D'][j] }}.</span>{{ opt }}
            </button>
          </div>
          <div v-if="quizAnswers.has(i)" class="mt-3 rounded-xl bg-secondary/50 px-4 py-2.5 text-sm">
            <span v-if="quizAnswers.get(i) === q.correct" class="text-chart-2 font-semibold">✓ Correct! </span>
            <span v-else class="text-destructive font-semibold">✗ Incorrect. </span>
            <span class="text-muted-foreground">{{ q.explanation }}</span>
          </div>
        </div>
        <div v-if="!lessonContent.quiz.length" class="py-12 text-center">
          <p class="text-muted-foreground text-sm">No quiz questions in this lesson.</p>
        </div>
        <div v-if="lessonContent.quiz.length > 0" class="bg-card border-border rounded-2xl border p-4 text-center">
          <p class="text-foreground font-semibold">Score: {{ quizScore }}/{{ lessonContent.quiz.length }}</p>
          <p class="text-muted-foreground text-sm">{{ quizAnswers.size }} answered</p>
        </div>
      </div>

      <!-- Comprehension Tab -->
      <div v-else class="space-y-4">
        <div
          v-for="(c, i) in lessonContent.comprehension"
          :key="i"
          class="bg-card border-border rounded-2xl border p-5"
        >
          <p class="text-foreground mb-3 font-semibold">{{ i + 1 }}. {{ c.question }}</p>
          <div
            class="cursor-pointer rounded-xl bg-secondary/50 px-4 py-3 text-sm transition-all"
            :class="revealedComp.has(i) ? '' : 'blur-sm select-none'"
            @click="revealedComp.has(i) ? revealedComp.delete(i) : revealedComp.add(i); revealedComp = new Set(revealedComp)"
          >
            {{ c.answer }}
          </div>
          <p v-if="!revealedComp.has(i)" class="text-muted-foreground mt-1 text-center text-xs">Click to reveal answer</p>
        </div>
        <div v-if="!lessonContent.comprehension.length" class="py-12 text-center">
          <p class="text-muted-foreground text-sm">No comprehension questions in this lesson.</p>
        </div>
      </div>
    </div>

    <!-- Empty content state -->
    <div v-else-if="course && !lessonContent" class="bg-card border-border flex flex-col items-center justify-center rounded-2xl border py-16 text-center">
      <BookOpen class="text-muted-foreground mb-4 h-12 w-12" />
      <p class="text-foreground font-semibold">No content yet</p>
      <p class="text-muted-foreground mt-1 text-sm">Your teacher hasn't added exercises to this lesson yet.</p>
    </div>

    <!-- Course Certificate Modal -->
    <CourseCertificate
      v-if="course"
      :show="showCertificate"
      :user-name="userName"
      :course-name="course.title"
      :course-category="course.category ?? ''"
      :total-lessons="course.totalLessons"
      :total-hours="course.estimatedHours"
      @close="showCertificate = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Play,
  Bookmark,
  CheckCircle2,
  Clock,
  TrendingUp,
  Languages,
  BookOpen,
} from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'
import CourseCertificate from '@/components/course/CourseCertificate.vue'
import { useAuthStore } from '@/stores/auth.store'
import { api } from '@/utils/api'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isBookmarked = ref(false)
const showCertificate = ref(false)
const courseId = computed(() => Number(route.params.id) || 1)

interface LessonContent {
  vocabulary: { term: string; definition: string; example: string }[]
  quiz: { question: string; options: string[]; correct: number; explanation: string }[]
  comprehension: { question: string; answer: string }[]
}

interface CourseData {
  id: number; title: string; description: string; category: string; difficulty: string
  progress: number; completedLessons: number; totalLessons: number; estimatedHours: number
}

const course = ref<CourseData | null>(null)
const lessonContent = ref<LessonContent | null>(null)

const activeContentTab = ref('vocab')
const contentRef = ref<HTMLElement | null>(null)
const flippedCards = ref(new Set<number>())
const quizAnswers = ref(new Map<number, number>())
const revealedComp = ref(new Set<number>())

const contentTabs = computed(() => [
  { key: 'vocab', label: t('courses.detail.tabs.vocabulary'), count: lessonContent.value?.vocabulary.length ?? 0 },
  { key: 'quiz', label: t('courses.detail.tabs.quiz'), count: lessonContent.value?.quiz.length ?? 0 },
  { key: 'comprehension', label: t('courses.detail.tabs.comprehension'), count: lessonContent.value?.comprehension.length ?? 0 },
])

const quizScore = computed(() => {
  if (!lessonContent.value) return 0
  let correct = 0
  quizAnswers.value.forEach((answer, idx) => {
    const q = lessonContent.value!.quiz[idx]
    if (q && answer === q.correct) correct++
  })
  return correct
})

const answerQuiz = (questionIdx: number, optionIdx: number) => {
  if (quizAnswers.value.has(questionIdx)) return
  quizAnswers.value = new Map(quizAnswers.value).set(questionIdx, optionIdx)
}

const userName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0] ?? 'Guest'
  return 'Guest'
})

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

const goBack = () => router.push('/courses')
const toggleBookmark = () => { isBookmarked.value = !isBookmarked.value }

const startCourse = () => {
  activeContentTab.value = 'vocab'
  if (course.value && course.value.progress === 0) course.value.progress = 5
  nextTick(() => contentRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

onMounted(async () => {
  try {
    const lesson = (await api.getLessonById(courseId.value)) as any
    if (!lesson) return
    course.value = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description ?? '',
      category: lesson.category ?? 'General',
      difficulty: lesson.difficulty ?? 'Beginner',
      progress: 0,
      completedLessons: 0,
      totalLessons: 1,
      estimatedHours: 1,
    }
    if (lesson.content) {
      lessonContent.value = lesson.content as LessonContent
    }
  } catch {
    // keep null
  }
})
</script>
