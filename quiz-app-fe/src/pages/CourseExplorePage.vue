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
import { Search, BookOpen, Languages, GraduationCap, Briefcase, Mic, PenTool, Headphones } from 'lucide-vue-next'

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

const courses = ref<ExploreCourse[]>([
  {
    id: 101,
    title: 'Advanced English Grammar',
    description: 'Master complex grammar structures including conditionals, reported speech, and advanced tenses.',
    category: 'Grammar',
    difficulty: 'Intermediate',
    totalLessons: 48,
    estimatedHours: 24,
  },
  {
    id: 102,
    title: 'Essential English Vocabulary',
    description: 'Build a strong vocabulary foundation with 3000+ most common English words and phrases.',
    category: 'Vocabulary',
    difficulty: 'Beginner',
    totalLessons: 36,
    estimatedHours: 18,
  },
  {
    id: 103,
    title: 'TOEFL Preparation',
    description: 'Complete TOEFL iBT preparation with practice tests and strategies for all sections.',
    category: 'Test Prep',
    difficulty: 'Advanced',
    totalLessons: 30,
    estimatedHours: 15,
  },
  {
    id: 104,
    title: 'Business English Communication',
    description: 'Professional English for meetings, presentations, emails, and negotiations in the workplace.',
    category: 'Business',
    difficulty: 'Intermediate',
    totalLessons: 42,
    estimatedHours: 28,
  },
  {
    id: 105,
    title: 'English Conversation & Speaking',
    description: 'Improve your speaking fluency with guided conversations, pronunciation drills, and role plays.',
    category: 'Speaking',
    difficulty: 'Beginner',
    totalLessons: 24,
    estimatedHours: 12,
  },
  {
    id: 106,
    title: 'Academic English Writing',
    description: 'Learn to write essays, reports, and research papers with proper structure and academic style.',
    category: 'Writing',
    difficulty: 'Intermediate',
    totalLessons: 20,
    estimatedHours: 10,
  },
])

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
