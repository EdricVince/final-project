<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-foreground text-2xl font-bold">Analytics</h2>
        <p class="text-muted-foreground mt-1 text-sm">Track student performance and engagement across all classes</p>
      </div>
      <div class="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
        <button
          v-for="p in periods"
          :key="p.value"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-all"
          :class="selectedPeriod === p.value
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'"
          @click="selectedPeriod = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="kpi in kpiCards"
        :key="kpi.label"
        class="bg-card border-border rounded-2xl border p-5 transition-all hover:shadow-md"
      >
        <div class="mb-3 flex items-center justify-between">
          <span class="text-muted-foreground text-sm">{{ kpi.label }}</span>
          <div class="rounded-xl p-2.5" :class="kpi.bg">
            <component :is="kpi.icon" class="h-4 w-4" :class="kpi.color" />
          </div>
        </div>
        <p class="text-foreground text-3xl font-bold">{{ kpi.value }}</p>
        <div class="mt-1 flex items-center gap-1.5">
          <TrendingUp v-if="kpi.trend >= 0" class="h-3.5 w-3.5 text-chart-2" />
          <TrendingDown v-else class="h-3.5 w-3.5 text-destructive" />
          <p class="text-xs" :class="kpi.trend >= 0 ? 'text-chart-2' : 'text-destructive'">
            {{ Math.abs(kpi.trend) }}% vs last {{ selectedPeriod }}
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="mb-6 grid gap-6 lg:grid-cols-5">
      <!-- Activity Bar Chart -->
      <div class="bg-card border-border rounded-2xl border p-6 lg:col-span-3">
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-foreground font-semibold">Student Activity</h3>
          <span class="text-muted-foreground text-xs">Quizzes completed per day</span>
        </div>
        <div class="flex h-40 items-end gap-1.5">
          <div
            v-for="(bar, i) in activityData"
            :key="i"
            class="group relative flex flex-1 flex-col items-center"
          >
            <div
              class="bg-primary/20 hover:bg-primary w-full rounded-t-lg transition-all duration-300 hover:scale-y-105"
              :style="{ height: `${(bar.value / maxActivity) * 100}%` }"
            >
              <div class="bg-foreground text-background pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {{ bar.value }} quizzes
              </div>
            </div>
          </div>
        </div>
        <div class="mt-2 flex gap-1.5">
          <div
            v-for="(bar, i) in activityData"
            :key="i"
            class="text-muted-foreground flex-1 text-center text-xs"
          >
            {{ bar.label }}
          </div>
        </div>
      </div>

      <!-- Class Performance Bars -->
      <div class="bg-card border-border rounded-2xl border p-6 lg:col-span-2">
        <h3 class="text-foreground mb-5 font-semibold">Avg Score by Class</h3>
        <div class="space-y-4">
          <div v-for="cls in classScores" :key="cls.name">
            <div class="mb-1.5 flex items-center justify-between">
              <span class="text-foreground truncate mr-2 text-sm font-medium">{{ cls.name }}</span>
              <span class="text-foreground shrink-0 text-sm font-bold">{{ cls.score }}%</span>
            </div>
            <div class="bg-secondary h-2.5 overflow-hidden rounded-full">
              <div
                class="h-2.5 rounded-full transition-all duration-700"
                :class="cls.barColor"
                :style="{ width: `${cls.score}%` }"
              ></div>
            </div>
          </div>
        </div>
        <div class="mt-5 space-y-1.5">
          <div v-for="cls in classScores" :key="cls.name" class="flex items-center gap-2">
            <div class="h-2.5 w-2.5 rounded-full" :class="cls.dotColor"></div>
            <span class="text-muted-foreground text-xs">{{ cls.name }} · {{ cls.students }} students</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="mb-6 grid gap-6 lg:grid-cols-2">
      <!-- Top Students -->
      <div class="bg-card border-border rounded-2xl border p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-foreground font-semibold">Top Students</h3>
          <span class="text-muted-foreground text-xs">This {{ selectedPeriod }}</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="(student, i) in topStudents"
            :key="student.id"
            class="flex items-center gap-4 rounded-xl p-3 transition-colors"
            :class="i < 3 ? 'bg-primary/5' : 'hover:bg-secondary/50'"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
              :class="i === 0 ? 'bg-chart-5/20 text-chart-5'
                     : i === 1 ? 'bg-secondary text-muted-foreground'
                     : i === 2 ? 'bg-chart-1/20 text-chart-1'
                     : 'bg-secondary text-muted-foreground'"
            >
              {{ i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1 }}
            </div>
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground"
              :class="avatarBg[i % avatarBg.length]"
            >
              {{ student.name.charAt(0) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-foreground font-medium">{{ student.name }}</p>
              <p class="text-muted-foreground text-xs">{{ student.class }}</p>
            </div>
            <div class="text-right">
              <p class="text-foreground font-bold">{{ student.score }}%</p>
              <p class="text-muted-foreground text-xs">{{ student.quizzes }} quizzes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Type Breakdown -->
      <div class="bg-card border-border rounded-2xl border p-6">
        <h3 class="text-foreground mb-4 font-semibold">Quiz Type Performance</h3>
        <div class="space-y-4">
          <div v-for="qt in quizTypes" :key="qt.type">
            <div class="mb-1.5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="rounded-lg p-1.5" :class="qt.bg">
                  <component :is="qt.icon" class="h-3.5 w-3.5" :class="qt.color" />
                </div>
                <span class="text-foreground text-sm font-medium">{{ qt.type }}</span>
              </div>
              <div class="text-right">
                <span class="text-foreground text-sm font-bold">{{ qt.avg }}%</span>
                <span class="text-muted-foreground ml-1 text-xs">({{ qt.count }} games)</span>
              </div>
            </div>
            <div class="bg-secondary h-2 rounded-full">
              <div
                class="h-2 rounded-full transition-all duration-700"
                :class="qt.barColor"
                :style="{ width: `${qt.avg}%` }"
              ></div>
            </div>
          </div>
        </div>
        <div class="mt-5 flex flex-wrap gap-2">
          <div class="bg-secondary rounded-xl px-3 py-2 text-center">
            <p class="text-foreground text-lg font-bold">{{ totalQuizzes }}</p>
            <p class="text-muted-foreground text-xs">Total Games</p>
          </div>
          <div class="bg-secondary rounded-xl px-3 py-2 text-center">
            <p class="text-foreground text-lg font-bold">{{ avgAccuracy }}%</p>
            <p class="text-muted-foreground text-xs">Avg Accuracy</p>
          </div>
          <div class="bg-secondary rounded-xl px-3 py-2 text-center">
            <p class="text-foreground text-lg font-bold">{{ totalLiveQuizzes }}</p>
            <p class="text-muted-foreground text-xs">Live Sessions</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Struggling Students -->
    <div class="bg-card border-border rounded-2xl border p-6">
      <div class="mb-4 flex items-center gap-2">
        <AlertCircle class="text-chart-1 h-5 w-5" />
        <h3 class="text-foreground font-semibold">Students Needing Attention</h3>
        <span class="bg-chart-1/10 text-chart-1 rounded-full px-2.5 py-0.5 text-xs font-medium">{{ strugglingStudents.length }}</span>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(student, i) in strugglingStudents"
          :key="student.id"
          class="bg-secondary/50 border-border border rounded-xl p-4"
        >
          <div class="mb-3 flex items-center gap-3">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground"
              :class="avatarBg[i % avatarBg.length]"
            >
              {{ student.name.charAt(0) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-foreground text-sm font-medium">{{ student.name }}</p>
              <p class="text-muted-foreground text-xs">{{ student.class }}</p>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">Avg Score</span>
              <span class="text-chart-1 font-semibold">{{ student.score }}%</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">Last Active</span>
              <span class="text-foreground">{{ student.lastActive }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">Quizzes</span>
              <span class="text-foreground">{{ student.quizzes }} completed</span>
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
  Users, FileText, Trophy, TrendingUp, TrendingDown,
  AlertCircle, CircleHelp, Shuffle, Timer, CircleCheck,
} from 'lucide-vue-next'

const selectedPeriod = ref<'week' | 'month' | 'year'>('week')
const periods = [
  { label: 'Week', value: 'week' as const },
  { label: 'Month', value: 'month' as const },
  { label: 'Year', value: 'year' as const },
]

const avatarBg = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5', 'bg-primary']

const kpiData = {
  week:  { students: 0, quizzes: 0, avgScore: 0, liveQuizzes: 0, trends: [0, 0, 0, 0] },
  month: { students: 0, quizzes: 0, avgScore: 0, liveQuizzes: 0, trends: [0, 0, 0, 0] },
  year:  { students: 0, quizzes: 0, avgScore: 0, liveQuizzes: 0, trends: [0, 0, 0, 0] },
}

const kpiCards = computed(() => {
  const d = kpiData[selectedPeriod.value]
  return [
    { label: 'Active Students', value: d.students, trend: d.trends[0], icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Quizzes Played', value: d.quizzes, trend: d.trends[1], icon: FileText, color: 'text-chart-2', bg: 'bg-chart-2/10' },
    { label: 'Avg Score', value: `${d.avgScore}%`, trend: d.trends[2], icon: Trophy, color: 'text-chart-3', bg: 'bg-chart-3/10' },
    { label: 'Live Sessions', value: d.liveQuizzes, trend: d.trends[3], icon: Users, color: 'text-chart-1', bg: 'bg-chart-1/10' },
  ]
})

const activityDataMap = {
  week: [
    { label: 'Mon', value: 0 }, { label: 'Tue', value: 0 }, { label: 'Wed', value: 0 },
    { label: 'Thu', value: 0 }, { label: 'Fri', value: 0 }, { label: 'Sat', value: 0 }, { label: 'Sun', value: 0 },
  ],
  month: [
    { label: 'W1', value: 0 }, { label: 'W2', value: 0 }, { label: 'W3', value: 0 },
    { label: 'W4', value: 0 }, { label: 'W5', value: 0 },
  ],
  year: [
    { label: 'Jan', value: 0 }, { label: 'Feb', value: 0 }, { label: 'Mar', value: 0 },
    { label: 'Apr', value: 0 }, { label: 'May', value: 0 }, { label: 'Jun', value: 0 },
    { label: 'Jul', value: 0 }, { label: 'Aug', value: 0 }, { label: 'Sep', value: 0 },
    { label: 'Oct', value: 0 }, { label: 'Nov', value: 0 }, { label: 'Dec', value: 0 },
  ],
}

const activityData = computed(() => activityDataMap[selectedPeriod.value])
const maxActivity = computed(() => Math.max(...activityData.value.map(d => d.value)))

const classScores: { name: string; score: number; students: number; barColor: string; dotColor: string }[] = []

const topStudents: { id: number; name: string; class: string; score: number; quizzes: number }[] = []

const quizTypes = [
  { type: 'Multiple Choice', avg: 0, count: 0, icon: CircleHelp, bg: 'bg-primary/10', color: 'text-primary', barColor: 'bg-primary' },
  { type: 'True or False', avg: 0, count: 0, icon: CircleCheck, bg: 'bg-chart-2/10', color: 'text-chart-2', barColor: 'bg-chart-2' },
  { type: 'Speed Round', avg: 0, count: 0, icon: Timer, bg: 'bg-chart-1/10', color: 'text-chart-1', barColor: 'bg-chart-1' },
  { type: 'Word Scramble', avg: 0, count: 0, icon: Shuffle, bg: 'bg-chart-3/10', color: 'text-chart-3', barColor: 'bg-chart-3' },
]

const totalQuizzes = computed(() => quizTypes.reduce((s, q) => s + q.count, 0))
const avgAccuracy = computed(() => {
  const withData = quizTypes.filter(q => q.avg > 0)
  return withData.length ? Math.round(withData.reduce((s, q) => s + q.avg, 0) / withData.length) : 0
})
const totalLiveQuizzes = computed(() => kpiData[selectedPeriod.value].liveQuizzes)

const strugglingStudents: { id: number; name: string; class: string; score: number; quizzes: number; lastActive: string }[] = []
</script>
