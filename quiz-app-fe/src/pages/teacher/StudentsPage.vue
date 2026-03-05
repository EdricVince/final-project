<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ $t('teacher.students.title') }}</h1>
      <p class="text-muted-foreground mt-2">{{ $t('teacher.students.subtitle') }}</p>
    </div>

    <!-- Stats -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-1/10">
          <Users class="text-chart-1 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ students.length }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.students.stats.total') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10">
          <TrendingUp class="text-chart-2 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ activeStudents }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.students.stats.active') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-4/10">
          <BarChart2 class="text-chart-4 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ avgScore }}%</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.students.stats.avgScore') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-3/10">
          <CheckSquare class="text-chart-3 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ totalTestsCompleted }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.students.stats.topPerformers') }}</p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="animate-fade-in-up delay-150 mb-6 flex flex-col gap-4 sm:flex-row">
      <div class="relative flex-1">
        <Search class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search students..."
          class="bg-secondary text-foreground placeholder:text-muted-foreground h-10 w-full rounded-xl border-0 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <select
        v-model="selectedClass"
        class="bg-secondary text-foreground h-10 rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">{{ $t('teacher.students.filters.allClasses') }}</option>
        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
      </select>
    </div>

    <!-- Students Table -->
    <div class="animate-fade-in-up delay-200">
      <div class="bg-card border-border overflow-hidden rounded-2xl border">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-secondary">
              <tr>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.students.table.student') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.students.table.class') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.students.table.avgScore') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.students.table.progress') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.students.table.lastActive') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.students.table.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-border divide-y">
              <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-accent/50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <span class="text-primary font-medium">{{ getInitials(student.name) }}</span>
                    </div>
                    <div>
                      <p class="text-foreground font-medium">{{ student.name }}</p>
                      <p class="text-muted-foreground text-xs">{{ student.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="cls in student.classes"
                      :key="cls"
                      class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs"
                    >
                      {{ cls }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2 py-1 text-sm font-medium"
                    :class="getScoreClass(student.avg_score)"
                  >
                    {{ student.avg_score }}%
                  </span>
                </td>
                <td class="text-foreground px-4 py-3 text-sm">{{ student.tests_completed }}</td>
                <td class="text-muted-foreground px-4 py-3 text-sm">{{ student.last_active }}</td>
                <td class="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    <Eye class="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredStudents.length === 0" class="p-8 text-center">
          <p class="text-muted-foreground">{{ $t('teacher.students.noStudentsFound') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Eye, Users, TrendingUp, BarChart2, CheckSquare } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

const searchQuery = ref('')
const selectedClass = ref('')

const classes = ref<{ id: number; name: string; code: string }[]>([])
const students = ref<{ id: number; name: string; email: string; classes: string[]; avg_score: number; tests_completed: number; last_active: string }[]>([])

const filteredStudents = computed(() => {
  let result = students.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      s => s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query)
    )
  }

  if (selectedClass.value) {
    const cls = classes.value.find(c => c.id === Number(selectedClass.value))
    if (cls) {
      result = result.filter(s => s.classes.includes(cls.code))
    }
  }

  return result
})

const activeStudents = computed(() => {
  return students.value.filter(s => !s.last_active.includes('week')).length
})

const avgScore = computed(() => {
  if (students.value.length === 0) return 0
  return Math.round(students.value.reduce((sum, s) => sum + s.avg_score, 0) / students.value.length)
})

const totalTestsCompleted = computed(() => {
  return students.value.reduce((sum, s) => sum + s.tests_completed, 0)
})

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getScoreClass = (score: number) => {
  if (score >= 80) return 'bg-chart-2/10 text-chart-2'
  if (score >= 60) return 'bg-chart-5/10 text-chart-5'
  return 'bg-destructive/10 text-destructive'
}
</script>
