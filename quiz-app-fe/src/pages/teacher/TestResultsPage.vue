<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <button
        class="group mb-4 flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-sm font-semibold text-indigo-400 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/15 active:scale-95"
        @click="$router.push('/teacher/tests')"
      >
        <svg class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Tests
      </button>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ test.title }}</h1>
          <p class="text-muted-foreground mt-2">{{ $t('teacher.testResults.testResults') }}</p>
        </div>
        <Button variant="outline" @click="exportResults">
          <Download class="mr-2 h-4 w-4" />
          {{ $t('teacher.testResults.exportCsv') }}
        </Button>
      </div>
    </div>

    <!-- Stats -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-1/10">
          <Users class="text-chart-1 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ results.length }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.testResults.stats.submissions') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-4/10">
          <BarChart2 class="text-chart-4 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ avgScore }}%</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.testResults.stats.avgScore') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10">
          <TrendingUp class="text-chart-2 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ highestScore }}%</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.testResults.stats.highest') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
          <TrendingDown class="text-destructive h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ lowestScore }}%</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.testResults.stats.lowest') }}</p>
      </div>
    </div>

    <!-- Score Distribution -->
    <div class="animate-fade-in-up delay-150 mb-8">
      <div class="bg-card border-border rounded-2xl border p-6">
        <h2 class="text-foreground mb-4 font-semibold">{{ $t('teacher.testResults.scoreDistribution') }}</h2>
        <div class="flex items-end gap-2" style="height: 120px">
          <div
            v-for="(count, range) in scoreDistribution"
            :key="range"
            class="flex flex-1 flex-col items-center gap-1"
          >
            <div
              class="bg-primary w-full rounded-t"
              :style="{ height: `${(count / maxDistribution) * 100}px` }"
            ></div>
            <span class="text-muted-foreground text-xs">{{ range }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="animate-fade-in-up delay-200">
      <div class="bg-card border-border overflow-hidden rounded-2xl border">
        <div class="border-border border-b p-4">
          <h2 class="text-foreground font-semibold">{{ $t('teacher.testResults.studentResults') }}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-secondary">
              <tr>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.testResults.table.student') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.testResults.table.score') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.testResults.table.correct') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.testResults.table.timeTaken') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.testResults.table.submitted') }}</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{{ $t('teacher.testResults.table.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-border divide-y">
              <tr v-for="result in results" :key="result.id" class="hover:bg-accent/50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                      <span class="text-primary text-sm font-medium">{{ getInitials(result.student_name) }}</span>
                    </div>
                    <div>
                      <p class="text-foreground font-medium">{{ result.student_name }}</p>
                      <p class="text-muted-foreground text-xs">{{ result.student_email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2 py-1 text-sm font-medium"
                    :class="getScoreClass(result.score)"
                  >
                    {{ result.score }}%
                  </span>
                </td>
                <td class="text-foreground px-4 py-3 text-sm">
                  {{ result.correct_answers }}/{{ result.total_questions }}
                </td>
                <td class="text-muted-foreground px-4 py-3 text-sm">
                  {{ result.time_taken }} min
                </td>
                <td class="text-muted-foreground px-4 py-3 text-sm">
                  {{ formatDate(result.completed_at) }}
                </td>
                <td class="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    <Eye class="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="results.length === 0" class="p-8 text-center">
          <p class="text-muted-foreground">No submissions yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Download, Eye, Users, BarChart2, TrendingUp, TrendingDown } from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const toast = useToast()

const test = ref({
  id: Number(route.params.id),
  title: '',
})

const results = ref<{
  id: number; student_name: string; student_email: string; score: number
  correct_answers: number; total_questions: number; time_taken: number; completed_at: string
}[]>([])

const avgScore = computed(() => {
  if (results.value.length === 0) return 0
  return Math.round(results.value.reduce((sum, r) => sum + r.score, 0) / results.value.length)
})

const highestScore = computed(() => {
  if (results.value.length === 0) return 0
  return Math.max(...results.value.map(r => r.score))
})

const lowestScore = computed(() => {
  if (results.value.length === 0) return 0
  return Math.min(...results.value.map(r => r.score))
})

const scoreDistribution = computed(() => {
  const dist: Record<string, number> = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  }
  results.value.forEach(r => {
    if (r.score <= 20) dist['0-20'] = (dist['0-20'] ?? 0) + 1
    else if (r.score <= 40) dist['21-40'] = (dist['21-40'] ?? 0) + 1
    else if (r.score <= 60) dist['41-60'] = (dist['41-60'] ?? 0) + 1
    else if (r.score <= 80) dist['61-80'] = (dist['61-80'] ?? 0) + 1
    else dist['81-100'] = (dist['81-100'] ?? 0) + 1
  })
  return dist
})

const maxDistribution = computed(() => Math.max(...Object.values(scoreDistribution.value), 1))

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getScoreClass = (score: number) => {
  if (score >= 80) return 'bg-chart-2/10 text-chart-2'
  if (score >= 60) return 'bg-chart-5/10 text-chart-5'
  return 'bg-destructive/10 text-destructive'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const exportResults = () => {
  toast.success('Results exported!')
}
</script>
