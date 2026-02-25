<template>
  <div class="p-6 lg:p-8">
    <!-- Welcome Section -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
        Welcome back, {{ userName }}!
      </h1>
      <p class="text-muted-foreground mt-2 text-base">Manage your classes and track student progress.</p>
    </div>

    <!-- Stats Row -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex items-center justify-between">
          <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <BookOpen class="text-primary h-5 w-5" />
          </div>
        </div>
        <p class="text-foreground text-2xl font-bold">{{ stats.totalClasses }}</p>
        <p class="text-muted-foreground text-sm">Active Classes</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex items-center justify-between">
          <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Users class="text-primary h-5 w-5" />
          </div>
        </div>
        <p class="text-foreground text-2xl font-bold">{{ stats.totalStudents }}</p>
        <p class="text-muted-foreground text-sm">Total Students</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex items-center justify-between">
          <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText class="text-primary h-5 w-5" />
          </div>
        </div>
        <p class="text-foreground text-2xl font-bold">{{ stats.totalTests }}</p>
        <p class="text-muted-foreground text-sm">Tests Created</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex items-center justify-between">
          <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Video class="text-primary h-5 w-5" />
          </div>
        </div>
        <p class="text-foreground text-2xl font-bold">{{ stats.totalVideos }}</p>
        <p class="text-muted-foreground text-sm">Videos Uploaded</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
      <!-- Left Column -->
      <div class="space-y-6 xl:col-span-2 xl:space-y-8">
        <!-- Quick Actions -->
        <div class="animate-fade-in-up delay-150">
          <div class="bg-card border-border rounded-2xl border p-6">
            <h2 class="text-foreground mb-4 text-lg font-semibold">Quick Actions</h2>
            <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <router-link
                to="/teacher/classes"
                class="bg-primary/5 hover:bg-primary/10 flex flex-col items-center gap-2 rounded-xl p-4 transition-colors"
              >
                <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Plus class="text-primary h-6 w-6" />
                </div>
                <span class="text-foreground text-sm font-medium">New Class</span>
              </router-link>

              <router-link
                to="/teacher/tests/new"
                class="bg-primary/5 hover:bg-primary/10 flex flex-col items-center gap-2 rounded-xl p-4 transition-colors"
              >
                <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <FileText class="text-primary h-6 w-6" />
                </div>
                <span class="text-foreground text-sm font-medium">Create Test</span>
              </router-link>

              <router-link
                to="/teacher/videos"
                class="bg-primary/5 hover:bg-primary/10 flex flex-col items-center gap-2 rounded-xl p-4 transition-colors"
              >
                <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Video class="text-primary h-6 w-6" />
                </div>
                <span class="text-foreground text-sm font-medium">Upload Video</span>
              </router-link>

              <router-link
                to="/teacher/students"
                class="bg-primary/5 hover:bg-primary/10 flex flex-col items-center gap-2 rounded-xl p-4 transition-colors"
              >
                <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Users class="text-primary h-6 w-6" />
                </div>
                <span class="text-foreground text-sm font-medium">View Students</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Recent Classes -->
        <div class="animate-fade-in-up delay-200">
          <div class="bg-card border-border rounded-2xl border p-6">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-foreground text-lg font-semibold">Recent Classes</h2>
              <router-link
                to="/teacher/classes"
                class="text-primary hover:text-primary/80 text-sm font-medium"
              >
                View All
              </router-link>
            </div>
            <div class="space-y-3">
              <div
                v-for="cls in recentClasses"
                :key="cls.id"
                class="hover:bg-accent/50 flex items-center gap-4 rounded-xl p-3 transition-colors"
              >
                <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <BookOpen class="text-primary h-6 w-6" />
                </div>
                <div class="flex-1">
                  <h3 class="text-foreground font-medium">{{ cls.name }}</h3>
                  <p class="text-muted-foreground text-sm">{{ cls.student_count }} students</p>
                </div>
                <div class="text-right">
                  <p class="text-foreground text-sm font-medium">{{ cls.subject }}</p>
                  <p class="text-muted-foreground text-xs">{{ cls.class_code }}</p>
                </div>
              </div>

              <div v-if="recentClasses.length === 0" class="py-8 text-center">
                <p class="text-muted-foreground">No classes yet. Create your first class!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6 xl:space-y-8">
        <!-- Recent Activity -->
        <div class="animate-fade-in-up delay-200">
          <div class="bg-card border-border rounded-2xl border p-6">
            <h2 class="text-foreground mb-4 text-lg font-semibold">Recent Activity</h2>
            <div class="space-y-4">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="flex items-start gap-3"
              >
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  :class="getActivityClass(activity.type)"
                >
                  <component :is="getActivityIcon(activity.type)" class="h-4 w-4" />
                </div>
                <div class="flex-1">
                  <p class="text-foreground text-sm">{{ activity.message }}</p>
                  <p class="text-muted-foreground text-xs">{{ activity.time }}</p>
                </div>
              </div>

              <div v-if="recentActivity.length === 0" class="py-4 text-center">
                <p class="text-muted-foreground text-sm">No recent activity</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Tests -->
        <div class="animate-fade-in-up delay-300">
          <div class="bg-card border-border rounded-2xl border p-6">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-foreground text-lg font-semibold">Upcoming Tests</h2>
              <router-link
                to="/teacher/tests"
                class="text-primary hover:text-primary/80 text-sm font-medium"
              >
                View All
              </router-link>
            </div>
            <div class="space-y-3">
              <div
                v-for="test in upcomingTests"
                :key="test.id"
                class="hover:bg-accent/50 rounded-xl p-3 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <h3 class="text-foreground font-medium">{{ test.title }}</h3>
                  <span class="text-primary text-xs font-medium">{{ test.class_name }}</span>
                </div>
                <p class="text-muted-foreground mt-1 text-sm">
                  {{ test.question_count }} questions • {{ test.time_limit }} min
                </p>
              </div>

              <div v-if="upcomingTests.length === 0" class="py-4 text-center">
                <p class="text-muted-foreground text-sm">No upcoming tests</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BookOpen,
  Users,
  FileText,
  Video,
  Plus,
  UserPlus,
  CheckCircle,
  Clock,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const userName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]
  return 'Teacher'
})

// Mock stats
const stats = ref({
  totalClasses: 5,
  totalStudents: 87,
  totalTests: 12,
  totalVideos: 24,
})

// Mock recent classes
const recentClasses = ref([
  { id: 1, name: 'Business English 101', subject: 'Business', student_count: 18, class_code: 'BUS101' },
  { id: 2, name: 'IELTS Preparation', subject: 'Academic', student_count: 15, class_code: 'IELTS01' },
  { id: 3, name: 'Conversation Practice', subject: 'Speaking', student_count: 12, class_code: 'CONV01' },
])

// Mock recent activity
const recentActivity = ref([
  { id: 1, type: 'student_join', message: 'John Doe joined Business English 101', time: '2 hours ago' },
  { id: 2, type: 'test_complete', message: '15 students completed Grammar Quiz', time: '5 hours ago' },
  { id: 3, type: 'video_upload', message: 'New video uploaded to IELTS Preparation', time: '1 day ago' },
])

// Mock upcoming tests
const upcomingTests = ref([
  { id: 1, title: 'Mid-term Grammar Test', class_name: 'BUS101', question_count: 30, time_limit: 45 },
  { id: 2, title: 'Vocabulary Quiz', class_name: 'IELTS01', question_count: 20, time_limit: 20 },
])

const getActivityClass = (type: string) => {
  const classes: Record<string, string> = {
    student_join: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    test_complete: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    video_upload: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return classes[type] || 'bg-secondary text-muted-foreground'
}

const getActivityIcon = (type: string) => {
  const icons: Record<string, typeof UserPlus> = {
    student_join: UserPlus,
    test_complete: CheckCircle,
    video_upload: Video,
  }
  return icons[type] || Clock
}
</script>
