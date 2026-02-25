<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
        Explore Courses
      </h1>
      <p class="text-muted-foreground mt-2 text-base">
        Discover new courses to expand your knowledge
      </p>
    </div>

    <!-- Search and Filters -->
    <div class="animate-fade-in-up delay-100 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative flex-1 sm:max-w-md">
        <Search class="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search courses..."
          class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2"
        />
      </div>
      <div class="flex gap-2">
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
      <h3 class="text-foreground mb-2 text-lg font-semibold">No courses found</h3>
      <p class="text-muted-foreground">Try adjusting your search or filters</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, BookOpen, Code, Languages, Calculator, Palette, Music, Camera } from 'lucide-vue-next'

const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = ['All', 'Programming', 'Languages', 'Math', 'Design', 'Music']

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
    title: 'JavaScript Mastery',
    description: 'Master JavaScript from basics to advanced concepts including ES6+, async/await, and more.',
    category: 'Programming',
    difficulty: 'Intermediate',
    totalLessons: 48,
    estimatedHours: 24,
  },
  {
    id: 102,
    title: 'Python for Beginners',
    description: 'Learn Python programming from scratch. Perfect for absolute beginners.',
    category: 'Programming',
    difficulty: 'Beginner',
    totalLessons: 36,
    estimatedHours: 18,
  },
  {
    id: 103,
    title: 'Spanish Essentials',
    description: 'Learn essential Spanish vocabulary and grammar for everyday conversations.',
    category: 'Languages',
    difficulty: 'Beginner',
    totalLessons: 30,
    estimatedHours: 15,
  },
  {
    id: 104,
    title: 'Advanced Calculus',
    description: 'Deep dive into calculus concepts including integrals, derivatives, and limits.',
    category: 'Math',
    difficulty: 'Advanced',
    totalLessons: 42,
    estimatedHours: 28,
  },
  {
    id: 105,
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of user interface and experience design.',
    category: 'Design',
    difficulty: 'Beginner',
    totalLessons: 24,
    estimatedHours: 12,
  },
  {
    id: 106,
    title: 'Music Theory Basics',
    description: 'Understand the fundamentals of music theory, scales, and chord progressions.',
    category: 'Music',
    difficulty: 'Beginner',
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
  const icons: Record<string, typeof Code> = {
    Programming: Code,
    Languages: Languages,
    Math: Calculator,
    Design: Palette,
    Music: Music,
  }
  return icons[category] || BookOpen
}

const getDifficultyClass = (difficulty: string) => {
  const classes: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return classes[difficulty] || 'bg-secondary text-secondary-foreground'
}

const openCourse = (id: number) => {
  router.push(`/courses/${id}`)
}
</script>
