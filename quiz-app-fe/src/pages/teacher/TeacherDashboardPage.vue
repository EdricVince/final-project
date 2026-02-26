<template>
  <div class="p-6 lg:p-8">
    <!-- Welcome Section -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
        {{ $t('dashboard.welcome', { name: userName }) }}
      </h1>
      <p class="text-muted-foreground mt-2 text-base">{{ $t('teacher.dashboard.subtitle') }}</p>
    </div>

    <!-- Stats Row -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-4 flex items-center gap-3">
          <div class="bg-chart-2/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <BookOpen class="text-chart-2 h-5 w-5" />
          </div>
          <span class="text-muted-foreground text-xs font-medium uppercase tracking-wider">{{ $t('teacher.dashboard.stats.totalClasses') }}</span>
        </div>
        <p class="text-foreground text-3xl font-bold">{{ stats.totalClasses }}</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-4 flex items-center gap-3">
          <div class="bg-chart-1/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Users class="text-chart-1 h-5 w-5" />
          </div>
          <span class="text-muted-foreground text-xs font-medium uppercase tracking-wider">{{ $t('teacher.dashboard.stats.totalStudents') }}</span>
        </div>
        <p class="text-foreground text-3xl font-bold">{{ stats.totalStudents }}</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-4 flex items-center gap-3">
          <div class="bg-chart-4/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText class="text-chart-4 h-5 w-5" />
          </div>
          <span class="text-muted-foreground text-xs font-medium uppercase tracking-wider">{{ $t('teacher.dashboard.stats.testsCreated') }}</span>
        </div>
        <p class="text-foreground text-3xl font-bold">{{ stats.totalTests }}</p>
      </div>

      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-4 flex items-center gap-3">
          <div class="bg-chart-3/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Video class="text-chart-3 h-5 w-5" />
          </div>
          <span class="text-muted-foreground text-xs font-medium uppercase tracking-wider">Videos</span>
        </div>
        <p class="text-foreground text-3xl font-bold">{{ stats.totalVideos }}</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
      <!-- Left Column -->
      <div class="space-y-6 xl:col-span-2 xl:space-y-8">
        <!-- Quick Actions -->
        <div class="animate-fade-in-up delay-150">
          <div class="bg-card border-border rounded-2xl border p-6">
            <h2 class="text-foreground mb-5 text-lg font-semibold">{{ $t('teacher.dashboard.quickActions') }}</h2>
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <router-link
                to="/teacher/classes"
                class="group border-border hover:bg-accent flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
              >
                <div class="bg-chart-2/10 group-hover:bg-chart-2/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <Plus class="text-chart-2 h-6 w-6" />
                </div>
                <span class="text-foreground text-sm font-medium">{{ $t('teacher.dashboard.actions.createClass') }}</span>
              </router-link>

              <router-link
                to="/teacher/tests/new"
                class="group border-border hover:bg-accent flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
              >
                <div class="bg-chart-4/10 group-hover:bg-chart-4/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <FileText class="text-chart-4 h-6 w-6" />
                </div>
                <span class="text-foreground text-sm font-medium">{{ $t('teacher.dashboard.actions.createTest') }}</span>
              </router-link>

              <router-link
                to="/teacher/videos"
                class="group border-border hover:bg-accent flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
              >
                <div class="bg-chart-3/10 group-hover:bg-chart-3/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <Video class="text-chart-3 h-6 w-6" />
                </div>
                <span class="text-foreground text-sm font-medium">Videos</span>
              </router-link>

              <router-link
                to="/teacher/students"
                class="group border-border hover:bg-accent flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
              >
                <div class="bg-chart-1/10 group-hover:bg-chart-1/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <Users class="text-chart-1 h-6 w-6" />
                </div>
                <span class="text-foreground text-sm font-medium">{{ $t('teacher.dashboard.actions.viewStudents') }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Recent Classes -->
        <div class="animate-fade-in-up delay-200">
          <div class="bg-card border-border rounded-2xl border p-6">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-foreground text-lg font-semibold">{{ $t('teacher.dashboard.recentClasses') }}</h2>
              <router-link
                to="/teacher/classes"
                class="text-primary hover:text-primary/80 text-sm font-medium"
              >
                {{ $t('common.viewAll') }}
              </router-link>
            </div>
            <div class="space-y-2">
              <router-link
                v-for="cls in recentClasses"
                :key="cls.id"
                :to="`/teacher/classes/${cls.id}`"
                class="hover:bg-accent group flex items-center gap-4 rounded-xl p-3 transition-colors"
              >
                <div class="bg-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <BookOpen class="text-primary h-5 w-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-foreground font-medium truncate">{{ cls.name }}</h3>
                  <p class="text-muted-foreground text-xs">{{ cls.student_count }} students · {{ cls.subject }}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="bg-secondary text-muted-foreground rounded-md px-2 py-1 text-xs font-mono">{{ cls.class_code }}</span>
                </div>
              </router-link>

              <div v-if="recentClasses.length === 0" class="py-8 text-center">
                <BookOpen class="text-muted-foreground mx-auto mb-3 h-8 w-8" />
                <p class="text-muted-foreground text-sm">No classes yet. Create your first class!</p>
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
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
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
    student_join: 'bg-chart-2/10 text-chart-2',
    test_complete: 'bg-chart-1/10 text-chart-1',
    video_upload: 'bg-chart-3/10 text-chart-3',
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
