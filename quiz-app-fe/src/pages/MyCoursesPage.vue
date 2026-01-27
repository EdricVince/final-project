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
  Code,
  Languages,
  Calculator,
  Palette,
  Music,
  Microscope,
  Globe,
  Camera,
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
    title: 'JavaScript Fundamentals',
    description: 'Learn the core concepts of JavaScript programming language from scratch.',
    category: 'Programming',
    difficulty: 'Beginner',
    progress: 68,
    completedLessons: 17,
    totalLessons: 25,
    lastAccessed: '2 hours ago',
    estimatedHours: 12,
  },
  {
    id: 2,
    title: 'Spanish for Beginners',
    description: 'Master the basics of Spanish language with interactive lessons and exercises.',
    category: 'Language',
    difficulty: 'Beginner',
    progress: 45,
    completedLessons: 9,
    totalLessons: 20,
    lastAccessed: '1 day ago',
    estimatedHours: 15,
  },
  {
    id: 3,
    title: 'Advanced Mathematics',
    description: 'Deep dive into calculus, linear algebra, and differential equations.',
    category: 'Mathematics',
    difficulty: 'Advanced',
    progress: 32,
    completedLessons: 8,
    totalLessons: 25,
    lastAccessed: '3 days ago',
    estimatedHours: 20,
  },
  {
    id: 4,
    title: 'UI/UX Design Principles',
    description: 'Learn modern design principles and create beautiful user interfaces.',
    category: 'Design',
    difficulty: 'Intermediate',
    progress: 100,
    completedLessons: 18,
    totalLessons: 18,
    lastAccessed: '1 week ago',
    estimatedHours: 10,
  },
  {
    id: 5,
    title: 'Data Science with Python',
    description: 'Explore data analysis, visualization, and machine learning with Python.',
    category: 'Programming',
    difficulty: 'Intermediate',
    progress: 0,
    completedLessons: 0,
    totalLessons: 30,
    lastAccessed: 'Not started',
    estimatedHours: 25,
  },
  {
    id: 6,
    title: 'Music Theory Basics',
    description: 'Understand the fundamentals of music theory, scales, and chord progressions.',
    category: 'Music',
    difficulty: 'Beginner',
    progress: 100,
    completedLessons: 12,
    totalLessons: 12,
    lastAccessed: '2 weeks ago',
    estimatedHours: 8,
  },
  {
    id: 7,
    title: 'Biology: Human Anatomy',
    description: 'Comprehensive study of human body systems and their functions.',
    category: 'Science',
    difficulty: 'Intermediate',
    progress: 55,
    completedLessons: 11,
    totalLessons: 20,
    lastAccessed: '5 hours ago',
    estimatedHours: 18,
  },
  {
    id: 8,
    title: 'Digital Photography',
    description: 'Master camera settings, composition, and photo editing techniques.',
    category: 'Photography',
    difficulty: 'Beginner',
    progress: 0,
    completedLessons: 0,
    totalLessons: 15,
    lastAccessed: 'Not started',
    estimatedHours: 10,
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
  Programming: Code,
  Language: Languages,
  Mathematics: Calculator,
  Design: Palette,
  Music: Music,
  Science: Microscope,
  Photography: Camera,
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
