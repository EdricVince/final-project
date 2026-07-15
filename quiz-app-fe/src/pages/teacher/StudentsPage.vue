<template>
  <div class="p-6 lg:p-8">

    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">Students</h1>
        <p class="text-muted-foreground mt-1 text-sm">Track and manage your students' learning progress</p>
      </div>
      <div class="flex gap-2">
        <button
          class="border-border hover:bg-secondary/60 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
          @click="exportCSV"
        >
          <Download class="h-4 w-4" />
          Export
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="stat in statsCards" :key="stat.label" class="bg-card border-border rounded-2xl border p-5 transition-all hover:shadow-md">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-muted-foreground text-sm">{{ stat.label }}</span>
          <div class="rounded-xl p-2.5" :class="stat.bg">
            <component :is="stat.icon" class="h-4 w-4" :class="stat.color" />
          </div>
        </div>
        <p class="text-foreground text-3xl font-bold tabular-nums">{{ stat.value }}</p>
        <p v-if="stat.sub" class="text-muted-foreground mt-1 text-xs">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-5 flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or email..."
          class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <select
        v-model="selectedClass"
        class="border-border bg-background text-foreground rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">All Classes</option>
        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
      </select>
      <select
        v-model="sortBy"
        class="border-border bg-background text-foreground rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="name">Sort: Name</option>
        <option value="xp">Sort: XP</option>
        <option value="streak">Sort: Streak</option>
        <option value="accuracy">Sort: Accuracy</option>
        <option value="joined">Sort: Joined</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
    </div>

    <!-- Student Grid -->
    <div v-else class="grid gap-3">
      <div
        v-for="student in sortedStudents"
        :key="student.student_id"
        class="bg-card border-border hover:border-primary/30 hover:shadow-md cursor-pointer rounded-2xl border p-4 transition-all"
        :class="selectedStudent?.student_id === student.student_id ? 'border-primary/50 ring-1 ring-primary/20' : ''"
        @click="openStudent(student)"
      >
        <div class="flex items-center gap-4">
          <!-- Avatar + Status -->
          <div class="relative shrink-0">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white"
              :style="{ backgroundColor: avatarColor(student.student_id) }"
            >
              {{ getInitials(student.name) }}
            </div>
            <span
              class="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card"
              :class="student.isActive ? 'bg-chart-2' : 'bg-muted-foreground/40'"
            ></span>
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="text-foreground truncate font-semibold">{{ student.name }}</p>
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="levelBadge(student.level)"
              >Lv.{{ student.level }}</span>
            </div>
            <p class="text-muted-foreground truncate text-xs">{{ student.email }}</p>
          </div>

          <!-- Stats row -->
          <div class="hidden items-center gap-6 sm:flex">
            <div class="text-center">
              <p class="text-foreground text-sm font-bold">{{ student.xp.toLocaleString() }}</p>
              <p class="text-muted-foreground text-xs">XP</p>
            </div>
            <div class="text-center">
              <p class="text-foreground flex items-center gap-1 text-sm font-bold">
                <Flame class="text-chart-1 h-3.5 w-3.5" />{{ student.streak }}
              </p>
              <p class="text-muted-foreground text-xs">Streak</p>
            </div>
            <div class="text-center">
              <p class="text-foreground text-sm font-bold">{{ student.accuracy }}%</p>
              <p class="text-muted-foreground text-xs">Accuracy</p>
            </div>
            <div class="text-center">
              <p class="text-foreground text-sm font-bold">{{ student.quizzes }}</p>
              <p class="text-muted-foreground text-xs">Quizzes</p>
            </div>
          </div>

          <!-- Classes + Arrow -->
          <div class="flex shrink-0 items-center gap-3">
            <div class="hidden flex-wrap gap-1 lg:flex">
              <span
                v-for="cls in student.classes.slice(0,2)"
                :key="cls"
                class="bg-secondary text-muted-foreground rounded-md px-2 py-0.5 text-xs"
              >{{ cls }}</span>
              <span v-if="student.classes.length > 2" class="bg-secondary text-muted-foreground rounded-md px-2 py-0.5 text-xs">
                +{{ student.classes.length - 2 }}
              </span>
            </div>
            <ChevronRight class="text-muted-foreground h-4 w-4" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="sortedStudents.length === 0" class="bg-card border-border flex flex-col items-center justify-center rounded-2xl border py-16 text-center">
        <div class="bg-secondary mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Users class="text-muted-foreground h-7 w-7" />
        </div>
        <p class="text-foreground mb-1 font-medium">No students found</p>
        <p class="text-muted-foreground text-sm">{{ searchQuery ? 'Try a different search term.' : 'Students will appear here once they join a class.' }}</p>
      </div>
    </div>

    <!-- Student Detail Side Panel -->
    <Teleport to="body">
      <Transition name="slide-panel">
        <div v-if="selectedStudent" class="fixed inset-0 z-50 flex justify-end">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="selectedStudent = null" />
          <div class="bg-card border-border relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto border-l shadow-2xl">

            <!-- Panel Header -->
            <div class="border-border flex items-center justify-between border-b px-6 py-5">
              <h2 class="text-foreground font-semibold">Student Profile</h2>
              <button class="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg p-1.5 transition-colors" @click="selectedStudent = null">
                <X class="h-5 w-5" />
              </button>
            </div>

            <!-- Avatar + Identity -->
            <div class="px-6 py-6">
              <div class="mb-5 flex items-center gap-4">
                <div
                  class="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-md"
                  :style="{ backgroundColor: avatarColor(selectedStudent.student_id) }"
                >
                  {{ getInitials(selectedStudent.name) }}
                </div>
                <div>
                  <h3 class="text-foreground text-lg font-bold">{{ selectedStudent.name }}</h3>
                  <p class="text-muted-foreground text-sm">{{ selectedStudent.email }}</p>
                  <div class="mt-1.5 flex items-center gap-2">
                    <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="levelBadge(selectedStudent.level)">
                      Level {{ selectedStudent.level }}
                    </span>
                    <span v-if="selectedStudent.isActive" class="flex items-center gap-1 rounded-full bg-chart-2/15 px-2.5 py-0.5 text-xs font-semibold text-chart-2">
                      <span class="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse"></span> Active Today
                    </span>
                  </div>
                </div>
              </div>

              <!-- XP Progress Bar -->
              <div class="bg-secondary/50 mb-5 rounded-2xl p-4">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-foreground text-sm font-semibold">{{ selectedStudent.xp.toLocaleString() }} XP</span>
                  <span class="text-muted-foreground text-xs">Next level: {{ nextLevelXP(selectedStudent.level) }} XP</span>
                </div>
                <div class="bg-background h-2.5 overflow-hidden rounded-full">
                  <div
                    class="bg-primary h-2.5 rounded-full transition-all duration-700"
                    :style="{ width: `${xpProgress(selectedStudent.xp, selectedStudent.level)}%` }"
                  ></div>
                </div>
                <div class="mt-2 flex items-center gap-1.5">
                  <Flame class="text-chart-1 h-3.5 w-3.5" />
                  <span class="text-muted-foreground text-xs">{{ selectedStudent.streak }}-day streak</span>
                </div>
              </div>

              <!-- Key Stats Grid -->
              <div class="mb-5 grid grid-cols-2 gap-3">
                <div v-for="stat in studentStats(selectedStudent)" :key="stat.label" class="bg-secondary/40 rounded-xl p-3.5">
                  <div class="flex items-center gap-2 mb-1">
                    <component :is="stat.icon" class="h-3.5 w-3.5" :class="stat.color" />
                    <span class="text-muted-foreground text-xs">{{ stat.label }}</span>
                  </div>
                  <p class="text-foreground text-xl font-bold">{{ stat.value }}</p>
                </div>
              </div>

              <!-- Skills Breakdown -->
              <div class="mb-5">
                <h4 class="text-foreground mb-3 text-sm font-semibold">Skills Performance</h4>
                <div class="space-y-3">
                  <div v-for="skill in selectedStudent.skills" :key="skill.name">
                    <div class="mb-1.5 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-base">{{ skill.icon }}</span>
                        <span class="text-foreground text-sm font-medium">{{ skill.name }}</span>
                      </div>
                      <span class="text-foreground text-sm font-bold">{{ skill.score }}%</span>
                    </div>
                    <div class="bg-secondary h-2 overflow-hidden rounded-full">
                      <div
                        class="h-2 rounded-full transition-all duration-700"
                        :class="skill.barColor"
                        :style="{ width: `${skill.score}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Classes -->
              <div class="mb-5">
                <h4 class="text-foreground mb-3 text-sm font-semibold">Enrolled Classes</h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="cls in selectedStudent.classes"
                    :key="cls"
                    class="bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-sm font-medium"
                  >{{ cls }}</span>
                </div>
              </div>

              <!-- Goal Completion -->
              <div class="bg-secondary/40 rounded-xl p-4">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-foreground text-sm font-semibold">Daily Goals</span>
                  <span class="text-muted-foreground text-xs">{{ selectedStudent.goalsCompleted }}/{{ selectedStudent.goalsTotal }} today</span>
                </div>
                <div class="bg-background h-2.5 overflow-hidden rounded-full">
                  <div
                    class="bg-chart-2 h-2.5 rounded-full transition-all duration-700"
                    :style="{ width: `${selectedStudent.goalsTotal ? (selectedStudent.goalsCompleted / selectedStudent.goalsTotal) * 100 : 0}%` }"
                  ></div>
                </div>
              </div>

              <!-- Joined -->
              <p class="text-muted-foreground mt-4 text-xs">
                Joined {{ formatJoined(selectedStudent.joined_at) }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Search, Users, TrendingUp, Flame, BookOpen, Trophy,
  ChevronRight, Download, X, Target, Brain, CheckSquare,
} from '@/components/icons'
import { api } from '@/utils/api'
import type { Class, ClassStudent } from '@/types/class'

const searchQuery = ref('')
const selectedClass = ref('')
const sortBy = ref('name')
const loading = ref(true)

interface SkillStat { name: string; icon: string; score: number; barColor: string }
interface StudentRow {
  id: number; student_id: number; name: string; email: string
  classes: string[]; joined_at: string
  xp: number; level: number; streak: number; accuracy: number
  quizzes: number; flashcards: number; goalsCompleted: number; goalsTotal: number
  isActive: boolean; skills: SkillStat[]
}

const classes = ref<Class[]>([])
const students = ref<StudentRow[]>([])
const selectedStudent = ref<StudentRow | null>(null)

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length] ?? '#6366f1'

const statsCards = computed(() => [
  { label: 'Total Students', value: students.value.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10', sub: `${classes.value.length} classes` },
  { label: 'Active Today', value: students.value.filter(s => s.isActive).length, icon: TrendingUp, color: 'text-chart-2', bg: 'bg-chart-2/10', sub: 'Studied in last 24h' },
  { label: 'Avg Accuracy', value: students.value.length ? Math.round(students.value.reduce((s,x) => s+x.accuracy,0)/students.value.length) + '%' : '—', icon: Brain, color: 'text-chart-4', bg: 'bg-chart-4/10', sub: 'Across all quizzes' },
  { label: 'Multi-class', value: students.value.filter(s => s.classes.length > 1).length, icon: CheckSquare, color: 'text-chart-3', bg: 'bg-chart-3/10', sub: 'Students in 2+ classes' },
])

const filteredStudents = computed(() => {
  let result = students.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
  }
  if (selectedClass.value) {
    const cls = classes.value.find(c => c.id === Number(selectedClass.value))
    if (cls) result = result.filter(s => s.classes.includes(cls.name))
  }
  return result
})

const sortedStudents = computed(() => {
  const arr = [...filteredStudents.value]
  switch (sortBy.value) {
    case 'xp': return arr.sort((a,b) => b.xp - a.xp)
    case 'streak': return arr.sort((a,b) => b.streak - a.streak)
    case 'accuracy': return arr.sort((a,b) => b.accuracy - a.accuracy)
    case 'joined': return arr.sort((a,b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())
    default: return arr.sort((a,b) => a.name.localeCompare(b.name))
  }
})

const levelBadge = (level: number) => {
  if (level >= 8) return 'bg-chart-1/20 text-chart-1'
  if (level >= 5) return 'bg-chart-4/20 text-chart-4'
  if (level >= 3) return 'bg-chart-2/20 text-chart-2'
  return 'bg-secondary text-muted-foreground'
}

const nextLevelXP = (level: number) => [100,300,600,1000,1500,2200,3000,4000,5500,7500][level] ?? 9999

const xpProgress = (xp: number, level: number) => {
  const thresholds = [0,100,300,600,1000,1500,2200,3000,4000,5500,7500]
  const curr = thresholds[level - 1] ?? 0
  const next = thresholds[level] ?? 9999
  return Math.min(((xp - curr) / (next - curr)) * 100, 100)
}

const studentStats = (s: StudentRow) => [
  { label: 'Flashcards', value: s.flashcards.toLocaleString(), icon: BookOpen, color: 'text-primary' },
  { label: 'Quizzes Done', value: s.quizzes, icon: Trophy, color: 'text-chart-5' },
  { label: 'XP Earned', value: s.xp.toLocaleString(), icon: TrendingUp, color: 'text-chart-2' },
  { label: 'Goals Done', value: `${s.goalsCompleted}/${s.goalsTotal}`, icon: Target, color: 'text-chart-4' },
]

function openStudent(s: StudentRow) {
  selectedStudent.value = selectedStudent.value?.student_id === s.student_id ? null : s
}

const formatJoined = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const getInitials = (name: string) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

const exportCSV = () => {
  const rows = [['Name','Email','Classes','XP','Level','Streak','Accuracy','Quizzes']]
  students.value.forEach(s => rows.push([s.name,s.email,s.classes.join('|'),String(s.xp),String(s.level),String(s.streak),s.accuracy+'%',String(s.quizzes)]))
  const csv = rows.map(r => r.join(',')).join('\n')
  const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = 'students.csv'; a.click()
}

function fakeStudentStats(seed: number): Pick<StudentRow, 'xp'|'level'|'streak'|'accuracy'|'quizzes'|'flashcards'|'goalsCompleted'|'goalsTotal'|'isActive'|'skills'> {
  const rng = (min: number, max: number) => min + ((seed * 7 + max * 3) % (max - min + 1))
  const xp = rng(50, 5000)
  const level = [1,1,1,2,2,3,3,4,5,6,7,8,9,10][Math.floor(xp/500)] ?? 1
  return {
    xp, level,
    streak: rng(0, 30),
    accuracy: rng(45, 98),
    quizzes: rng(0, 120),
    flashcards: rng(0, 800),
    goalsCompleted: rng(0, 4),
    goalsTotal: 4,
    isActive: seed % 3 !== 0,
    skills: [
      { name: 'Reading',   icon: '📖', score: rng(40, 95), barColor: 'bg-chart-2' },
      { name: 'Listening', icon: '🎧', score: rng(40, 95), barColor: 'bg-primary' },
      { name: 'Writing',   icon: '✍️', score: rng(40, 95), barColor: 'bg-chart-4' },
      { name: 'Speaking',  icon: '🎙️', score: rng(40, 95), barColor: 'bg-chart-1' },
    ],
  }
}

onMounted(async () => {
  try {
    const cls = (await api.getClasses()) as Class[]
    classes.value = cls
    const perClass = await Promise.all(
      cls.map(c => api.getClassStudents(c.id).then(s => ({ className: c.name, students: s as ClassStudent[] })))
    )
    const map = new Map<number, StudentRow>()
    for (const { className, students: studs } of perClass) {
      for (const s of studs) {
        if (map.has(s.student_id)) {
          map.get(s.student_id)!.classes.push(className)
        } else {
          map.set(s.student_id, {
            id: s.id, student_id: s.student_id,
            name: s.student_name || s.student_email,
            email: s.student_email,
            classes: [className],
            joined_at: s.joined_at,
            ...fakeStudentStats(s.student_id),
          })
        }
      }
    }
    students.value = Array.from(map.values())
  } catch {
    // keep empty
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-panel-enter-from .slide-panel-leave-to {
  opacity: 0;
}
.slide-panel-enter-from > div:last-child,
.slide-panel-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
