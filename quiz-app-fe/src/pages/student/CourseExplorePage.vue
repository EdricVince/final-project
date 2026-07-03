<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
        {{ $t('courses.explore.title') }}
      </h1>
      <p class="text-muted-foreground mt-2 text-base">
        {{ $t('courses.explore.subtitle') }}
      </p>
    </div>

    <!-- Search and Filters -->
    <div class="animate-fade-in-up delay-100 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative flex-1 sm:max-w-md">
        <Search class="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('courses.explore.searchPlaceholder')"
          class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          :class="selectedCategory === category
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- Courses Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="course in filteredCourses"
        :key="course.id"
        class="animate-fade-in-up bg-card border-border group cursor-pointer rounded-2xl border p-6 transition-all hover:shadow-lg"
        @click="openCourse(course.id)"
      >
        <div class="mb-4 flex items-start justify-between">
          <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
            <component :is="getCourseIcon(course.category)" class="text-primary h-6 w-6" />
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-medium"
            :class="getDifficultyClass(course.difficulty)"
          >
            {{ course.difficulty }}
          </span>
        </div>
        <h3 class="text-foreground mb-2 text-lg font-semibold group-hover:text-primary transition-colors">
          {{ course.title }}
        </h3>
        <p class="text-muted-foreground mb-4 line-clamp-2 text-sm">
          {{ course.description }}
        </p>
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">{{ course.totalLessons }} lessons</span>
          <span class="text-muted-foreground">{{ course.estimatedHours }}h</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredCourses.length === 0" class="py-12 text-center">
      <BookOpen class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
      <h3 class="text-foreground mb-2 text-lg font-semibold">{{ $t('courses.explore.empty.title') }}</h3>
      <p class="text-muted-foreground">{{ $t('courses.explore.empty.desc') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, BookOpen, Languages, GraduationCap, Briefcase, Mic, PenTool, Headphones } from '@/components/icons'

const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = ['All', 'Grammar', 'Vocabulary', 'Test Prep', 'Business', 'Speaking', 'Writing']

interface ExploreCourse {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  totalLessons: number
  estimatedHours: number
}

// Courses — empty until loaded from API
const courses = ref<ExploreCourse[]>([])

const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All' || course.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const getCourseIcon = (category: string) => {
  const icons: Record<string, typeof BookOpen> = {
    Grammar: BookOpen,
    Vocabulary: Languages,
    'Test Prep': GraduationCap,
    Business: Briefcase,
    Speaking: Mic,
    Writing: PenTool,
    Listening: Headphones,
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

const openCourse = (id: number) => {
  router.push(`/courses/${id}`)
}
</script>
