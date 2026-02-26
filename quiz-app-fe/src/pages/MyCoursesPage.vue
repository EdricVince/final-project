<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-foreground text-3xl font-bold tracking-tight lg:text-4xl">My Courses</h1>
          <p class="text-muted-foreground mt-2 text-lg">Track your learning progress and continue where you left off</p>
        </div>
        <Button class="w-full lg:w-auto" @click="exploreCourses">
          <Plus class="mr-2 h-5 w-5" />
          Explore Courses
        </Button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      <StatsCard :icon="BookOpen" :value="stats.totalCourses" label="Total Courses" />
      <StatsCard :icon="CheckCircle" :value="stats.completed" label="Completed" />
      <StatsCard :icon="Clock" :value="stats.totalHours" label="Learning Hours" suffix="h" />
      <StatsCard :icon="TrendingUp" :value="stats.avgProgress" label="Avg. Progress" suffix="%" />
    </div>

    <!-- Search & Filters -->
    <CourseFilters
      v-model:search-query="searchQuery"
      v-model:active-filter="activeFilter"
      v-model:view-mode="viewMode"
      :filter-tabs="filterTabs"
    />

    <!-- Course Grid/List -->
    <div v-if="filteredCourses.length > 0">
      <!-- Grid View -->
      <div
        v-if="viewMode === 'grid'"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <template v-if="isLoading">
          <CourseGridSkeleton v-for="i in 6" :key="i" />
        </template>
        <template v-else>
          <CourseGridItem
            v-for="(course, index) in filteredCourses"
            :key="course.id"
            :course="course"
            :index="index"
            :icon="getCategoryIcon(course.category)"
            @click="openCourse"
          />
        </template>
      </div>

      <!-- List View -->
      <div v-else class="space-y-4">
        <template v-if="isLoading">
          <CourseListSkeleton v-for="i in 4" :key="i" />
        </template>
        <template v-else>
          <CourseListItem
            v-for="(course, index) in filteredCourses"
            :key="course.id"
            :course="course"
            :index="index"
            :icon="getCategoryIcon(course.category)"
            @click="openCourse"
          />
        </template>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!isLoading"
      class="animate-fade-in-up flex flex-col items-center justify-center py-20 text-center"
    >
      <div class="bg-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-2xl">
        <BookOpen class="text-muted-foreground h-12 w-12" />
      </div>
      <h3 class="text-foreground mb-3 text-2xl font-semibold">
        {{ searchQuery ? 'No courses found' : 'No courses yet' }}
      </h3>
      <p class="text-muted-foreground mb-8 max-w-md text-lg">
        {{ searchQuery
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Start your learning journey by exploring our course catalog.'
        }}
      </p>
      <Button size="lg" @click="searchQuery ? (searchQuery = '') : exploreCourses()">
        {{ searchQuery ? 'Clear Search' : 'Explore Courses' }}
        <ArrowRight class="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import {
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Layers,
  PlayCircle,
  PauseCircle,
  Languages,
  GraduationCap,
  Briefcase,
  Mic,
  PenTool,
  Headphones,
  Globe,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import CourseFilters from '@/components/course/CourseFilters.vue'
import CourseGridItem from '@/components/course/CourseGridItem.vue'
import CourseListItem from '@/components/course/CourseListItem.vue'
import CourseGridSkeleton from '@/components/course/CourseGridSkeleton.vue'
import CourseListSkeleton from '@/components/course/CourseListSkeleton.vue'
import type { Course } from '@/types/course'

const router = useRouter()

// Stats
const stats = ref({
  totalCourses: 8,
  completed: 2,
  totalHours: 45,
  avgProgress: 58,
})

// Search & Filters
const searchQuery = ref('')
const activeFilter = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const isLoading = ref(true)

// Filter tabs
const filterTabs = computed(() => [
  { value: 'all', label: 'All', icon: Layers, count: courses.value.length },
  { value: 'in-progress', label: 'In Progress', icon: PlayCircle, count: courses.value.filter(c => c.progress > 0 && c.progress < 100).length },
  { value: 'completed', label: 'Completed', icon: CheckCircle, count: courses.value.filter(c => c.progress === 100).length },
  { value: 'not-started', label: 'Not Started', icon: PauseCircle, count: courses.value.filter(c => c.progress === 0).length },
])

// Courses data
const courses = ref<Course[]>([
  {
    id: 1,
    title: 'English Grammar Fundamentals',
    description: 'Master essential English grammar: tenses, articles, prepositions, and sentence structure.',
    category: 'Grammar',
    difficulty: 'Beginner',
    progress: 68,
    completedLessons: 17,
    totalLessons: 25,
    lastAccessed: '2 hours ago',
    estimatedHours: 12,
  },
  {
    id: 2,
    title: 'English Vocabulary Builder',
    description: 'Expand your vocabulary with 2000+ essential words, collocations, and usage examples.',
    category: 'Vocabulary',
    difficulty: 'Beginner',
    progress: 45,
    completedLessons: 9,
    totalLessons: 20,
    lastAccessed: '1 day ago',
    estimatedHours: 15,
  },
  {
    id: 3,
    title: 'IELTS Preparation Course',
    description: 'Comprehensive IELTS prep covering Reading, Writing, Listening, and Speaking sections.',
    category: 'Test Prep',
    difficulty: 'Intermediate',
    progress: 32,
    completedLessons: 8,
    totalLessons: 25,
    lastAccessed: '3 days ago',
    estimatedHours: 20,
  },
  {
    id: 4,
    title: 'Business English',
    description: 'Professional English for meetings, emails, presentations, and negotiations.',
    category: 'Business',
    difficulty: 'Intermediate',
    progress: 100,
    completedLessons: 18,
    totalLessons: 18,
    lastAccessed: '1 week ago',
    estimatedHours: 10,
  },
  {
    id: 5,
    title: 'English Pronunciation Mastery',
    description: 'Perfect your English pronunciation, stress patterns, and intonation.',
    category: 'Pronunciation',
    difficulty: 'Beginner',
    progress: 0,
    completedLessons: 0,
    totalLessons: 20,
    lastAccessed: 'Not started',
    estimatedHours: 15,
  },
  {
    id: 6,
    title: 'Advanced English Writing',
    description: 'Learn to write essays, reports, and formal letters with proper structure and style.',
    category: 'Writing',
    difficulty: 'Advanced',
    progress: 100,
    completedLessons: 12,
    totalLessons: 12,
    lastAccessed: '2 weeks ago',
    estimatedHours: 8,
  },
  {
    id: 7,
    title: 'English Listening & Comprehension',
    description: 'Improve listening skills with native speaker audio, podcasts, and conversations.',
    category: 'Listening',
    difficulty: 'Intermediate',
    progress: 55,
    completedLessons: 11,
    totalLessons: 20,
    lastAccessed: '5 hours ago',
    estimatedHours: 18,
  },
  {
    id: 8,
    title: 'TOEFL Test Preparation',
    description: 'Complete TOEFL iBT preparation with practice tests and strategies for all sections.',
    category: 'Test Prep',
    difficulty: 'Advanced',
    progress: 0,
    completedLessons: 0,
    totalLessons: 30,
    lastAccessed: 'Not started',
    estimatedHours: 25,
  },
])

// Filtered courses
const filteredCourses = computed(() => {
  let result = courses.value

  if (activeFilter.value === 'in-progress') {
    result = result.filter(c => c.progress > 0 && c.progress < 100)
  } else if (activeFilter.value === 'completed') {
    result = result.filter(c => c.progress === 100)
  } else if (activeFilter.value === 'not-started') {
    result = result.filter(c => c.progress === 0)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    )
  }

  return result
})

// Category icons mapping
const categoryIcons: Record<string, Component> = {
  Grammar: BookOpen,
  Vocabulary: Languages,
  'Test Prep': GraduationCap,
  Business: Briefcase,
  Pronunciation: Mic,
  Writing: PenTool,
  Listening: Headphones,
}

const getCategoryIcon = (category: string): Component => {
  return categoryIcons[category] || Globe
}

// Actions
const exploreCourses = () => {
  router.push('/courses/explore')
}

const openCourse = (courseId: number) => {
  router.push(`/courses/${courseId}`)
}

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 600)
})
</script>
