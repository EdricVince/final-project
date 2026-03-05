<template>
  <div class="p-6 lg:p-8">
    <!-- Welcome -->
    <div class="mb-8">
      <h1 class="text-foreground text-2xl font-bold lg:text-3xl">
        Welcome back, {{ userName }} 👋
      </h1>
      <p class="text-muted-foreground mt-1">Here's what's happening in your classes today.</p>
    </div>

    <!-- Stats -->
    <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-card border-border rounded-2xl border p-5 transition-all hover:shadow-md"
      >
        <div class="mb-3 flex items-center justify-between">
          <span class="text-muted-foreground text-sm">{{ stat.label }}</span>
          <div class="rounded-xl p-2.5" :class="stat.bg">
            <component :is="stat.icon" class="h-5 w-5" :class="stat.color" />
          </div>
        </div>
        <p class="text-foreground text-3xl font-bold">{{ stat.value }}</p>
        <p class="text-muted-foreground mt-1 text-xs">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Grid: Quick Actions + Recent Activity -->
    <div class="mb-8 grid gap-6 lg:grid-cols-3">
      <!-- Quick Actions -->
      <div class="bg-card border-border rounded-2xl border p-6">
        <h2 class="text-foreground mb-4 font-semibold">Quick Actions</h2>
        <div class="space-y-2">
          <button
            v-for="action in quickActions"
            :key="action.label"
            class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors"
            :class="action.style"
            @click="router.push(action.path)"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" :class="action.iconBg">
              <component :is="action.icon" class="h-4 w-4" :class="action.iconColor" />
            </div>
            <div>
              <p class="text-foreground text-sm font-medium">{{ action.label }}</p>
              <p class="text-muted-foreground text-xs">{{ action.desc }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Recent Classes -->
      <div class="bg-card border-border rounded-2xl border p-6 lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-foreground font-semibold">Active Classes</h2>
          <button
            class="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            @click="router.push('/teacher/classes')"
          >
            View all →
          </button>
        </div>
        <div class="space-y-3">
          <div
            v-for="cls in recentClasses"
            :key="cls.id"
            class="hover:bg-secondary/50 flex items-center gap-4 rounded-xl p-3 transition-colors cursor-pointer"
            @click="router.push(`/teacher/classes/${cls.id}`)"
          >
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl" :class="cls.bgColor">
              {{ cls.emoji }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-foreground font-medium">{{ cls.name }}</p>
              <p class="text-muted-foreground text-xs">{{ cls.studentCount }} students · {{ cls.lessonCount }} lessons</p>
            </div>
            <div class="text-right">
              <div class="bg-primary/5 border-primary/20 rounded-lg border px-3 py-1.5">
                <p class="text-primary font-mono text-sm font-bold tracking-wider">{{ cls.joinCode }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid: Recent Activity + Upcoming -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent Activity -->
      <div class="bg-card border-border rounded-2xl border p-6">
        <h2 class="text-foreground mb-4 font-semibold">Recent Activity</h2>
        <div class="space-y-4">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start gap-3">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm" :class="activity.bg">
              <component :is="activity.icon" class="h-4 w-4" :class="activity.color" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-foreground text-sm">{{ activity.text }}</p>
              <p class="text-muted-foreground text-xs">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Tests -->
      <div class="bg-card border-border rounded-2xl border p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-foreground font-semibold">Upcoming Tests</h2>
          <button
            class="text-primary hover:text-primary/80 text-sm font-medium"
            @click="router.push('/teacher/tests')"
          >
            View all →
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="test in upcomingTests" :key="test.id" class="bg-secondary/30 rounded-xl p-4">
            <div class="mb-2 flex items-start justify-between gap-2">
              <p class="text-foreground text-sm font-medium">{{ test.title }}</p>
              <span class="bg-primary/10 text-primary shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
                {{ test.status }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs text-muted-foreground">
              <span class="flex items-center gap-1">
                <BookOpen class="h-3.5 w-3.5" />
                {{ test.class }}
              </span>
              <span class="flex items-center gap-1">
                <FileText class="h-3.5 w-3.5" />
                {{ test.questions }} questions
              </span>
              <span class="flex items-center gap-1">
                <Clock class="h-3.5 w-3.5" />
                {{ test.duration }} min
              </span>
            </div>
          </div>
        </div>
        <div v-if="upcomingTests.length === 0" class="flex flex-col items-center py-8 text-center">
          <FileText class="text-muted-foreground mb-2 h-8 w-8" />
          <p class="text-muted-foreground text-sm">No upcoming tests</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  BookOpen, Users, FileText, GraduationCap, Plus,
  Languages, Video, Clock, UserCheck,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]
  return 'Teacher'
})

const stats = [
  { label: 'Total Classes', value: 0, sub: '', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Total Students', value: 0, sub: '', icon: Users, color: 'text-chart-2', bg: 'bg-chart-2/10' },
  { label: 'Vocab Sets', value: 0, sub: '', icon: Languages, color: 'text-chart-3', bg: 'bg-chart-3/10' },
  { label: 'Tests Created', value: 0, sub: '', icon: FileText, color: 'text-chart-1', bg: 'bg-chart-1/10' },
]

const quickActions = [
  { label: 'Create New Class', desc: 'Set up a class with join code', path: '/teacher/classes', icon: Plus, iconBg: 'bg-primary/10', iconColor: 'text-primary', style: 'hover:bg-secondary/50' },
  { label: 'Add Lesson', desc: 'Create and assign a new lesson', path: '/teacher/lessons', icon: GraduationCap, iconBg: 'bg-chart-2/10', iconColor: 'text-chart-2', style: 'hover:bg-secondary/50' },
  { label: 'Build a Test', desc: 'Create quiz or test for students', path: '/teacher/tests', icon: FileText, iconBg: 'bg-chart-1/10', iconColor: 'text-chart-1', style: 'hover:bg-secondary/50' },
  { label: 'Manage Vocabulary', desc: 'Add words to vocabulary sets', path: '/teacher/vocabulary', icon: Languages, iconBg: 'bg-chart-3/10', iconColor: 'text-chart-3', style: 'hover:bg-secondary/50' },
  { label: 'Upload Video', desc: 'Add video content to a class', path: '/teacher/videos', icon: Video, iconBg: 'bg-chart-4/10', iconColor: 'text-chart-4', style: 'hover:bg-secondary/50' },
  { label: 'View Students', desc: 'Monitor student progress', path: '/teacher/students', icon: UserCheck, iconBg: 'bg-chart-5/10', iconColor: 'text-chart-5', style: 'hover:bg-secondary/50' },
]

const recentClasses: { id: number; name: string; studentCount: number; lessonCount: number; joinCode: string; emoji: string; bgColor: string }[] = []

const recentActivity: { id: number; text: string; time: string; icon: typeof Users; color: string; bg: string }[] = []

const upcomingTests: { id: number; title: string; class: string; questions: number; duration: number; status: string }[] = []
</script>
