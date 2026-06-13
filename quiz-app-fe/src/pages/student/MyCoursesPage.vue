<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-3xl font-bold tracking-tight lg:text-4xl">{{ $t('courses.myCourses.title') }}</h1>
      <p class="text-muted-foreground mt-2 text-lg">{{ $t('courses.myCourses.subtitle') }}</p>
    </div>

    <!-- Stats Overview -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      <StatsCard :icon="BookOpen" :value="stats.totalCourses" :label="$t('courses.myCourses.stats.total')" icon-bg-class="bg-chart-1/10" icon-class="text-chart-1" />
      <StatsCard :icon="CheckCircle" :value="stats.completed" :label="$t('courses.myCourses.stats.completed')" icon-bg-class="bg-chart-2/10" icon-class="text-chart-2" />
      <StatsCard :icon="Clock" :value="stats.totalHours" :label="$t('courses.myCourses.stats.hours')" suffix="h" icon-bg-class="bg-chart-3/10" icon-class="text-chart-3" />
      <StatsCard :icon="TrendingUp" :value="stats.avgProgress" :label="$t('courses.myCourses.stats.avgProgress')" suffix="%" icon-bg-class="bg-chart-4/10" icon-class="text-chart-4" />
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
        {{ searchQuery ? $t('courses.myCourses.notFound.title') : $t('courses.myCourses.empty.title') }}
      </h3>
      <p class="text-muted-foreground mb-8 max-w-md text-lg">
        {{ searchQuery ? $t('courses.myCourses.notFound.desc') : $t('courses.myCourses.empty.desc') }}
      </p>
      <Button size="lg" @click="searchQuery ? (searchQuery = '') : exploreCourses()">
        {{ searchQuery ? $t('courses.myCourses.clearSearch') : $t('courses.myCourses.exploreCourses') }}
        <ArrowRight class="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'
import {
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
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
} from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import CourseFilters from '@/components/course/CourseFilters.vue'
import CourseGridItem from '@/components/course/CourseGridItem.vue'
import CourseListItem from '@/components/course/CourseListItem.vue'
import CourseGridSkeleton from '@/components/course/CourseGridSkeleton.vue'
import CourseListSkeleton from '@/components/course/CourseListSkeleton.vue'
import type { Course } from '@/types/course'

const { t } = useI18n()
const router = useRouter()

// Stats
const stats = ref({
  totalCourses: 0,
  completed: 0,
  totalHours: 0,
  avgProgress: 0,
})

// Search & Filters
const searchQuery = ref('')
const activeFilter = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const isLoading = ref(true)

// Filter tabs
const filterTabs = computed(() => [
  { value: 'all', label: t('courses.myCourses.filters.all'), icon: Layers, count: courses.value.length },
  { value: 'in-progress', label: t('courses.myCourses.filters.inProgress'), icon: PlayCircle, count: courses.value.filter(c => c.progress > 0 && c.progress < 100).length },
  { value: 'completed', label: t('courses.myCourses.filters.completed'), icon: CheckCircle, count: courses.value.filter(c => c.progress === 100).length },
  { value: 'not-started', label: t('courses.myCourses.filters.notStarted'), icon: PauseCircle, count: courses.value.filter(c => c.progress === 0).length },
])

interface LessonItem {
  id: number; title: string; description: string | null
  category: string; difficulty: string; is_published: boolean; created_at: string
}

const courses = ref<Course[]>([])

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

onMounted(async () => {
  try {
    const lessons = ((await api.getLessons()) as LessonItem[] | null) ?? []
    courses.value = lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description ?? '',
      category: l.category ?? 'General',
      difficulty: l.difficulty ?? 'beginner',
      progress: 0,
      completedLessons: 0,
      totalLessons: 1,
      lastAccessed: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      estimatedHours: 1,
    }))
    stats.value = {
      totalCourses: courses.value.length,
      completed: courses.value.filter(c => c.progress === 100).length,
      totalHours: courses.value.reduce((s, c) => s + c.estimatedHours, 0),
      avgProgress: courses.value.length
        ? Math.round(courses.value.reduce((s, c) => s + c.progress, 0) / courses.value.length)
        : 0,
    }
  } catch {
    // keep empty
  } finally {
    isLoading.value = false
  }
})
</script>
