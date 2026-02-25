<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <button
        class="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2 text-sm transition-colors"
        @click="$router.push('/teacher/tests')"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to Tests
      </button>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ test.title }}</h1>
          <p class="text-muted-foreground mt-2">Test Results</p>
        </div>
        <Button variant="outline" @click="exportResults">
          <Download class="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>

    <!-- Stats -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-xl border p-4">
        <p class="text-muted-foreground text-sm">Total Submissions</p>
        <p class="text-foreground text-2xl font-bold">{{ results.length }}</p>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <p class="text-muted-foreground text-sm">Average Score</p>
        <p class="text-foreground text-2xl font-bold">{{ avgScore }}%</p>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <p class="text-muted-foreground text-sm">Highest Score</p>
        <p class="text-foreground text-2xl font-bold">{{ highestScore }}%</p>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <p class="text-muted-foreground text-sm">Lowest Score</p>
        <p class="text-foreground text-2xl font-bold">{{ lowestScore }}%</p>
      </div>
    </div>

    <!-- Score Distribution -->
    <div class="animate-fade-in-up delay-150 mb-8">
      <div class="bg-card border-border rounded-2xl border p-6">
        <h2 class="text-foreground mb-4 font-semibold">Score Distribution</h2>
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
          <h2 class="text-foreground font-semibold">Student Results</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-secondary">
              <tr>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Student</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Score</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Correct</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Time Taken</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Submitted</th>
                <th class="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Actions</th>
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
import { ArrowLeft, Download, Eye } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const toast = useToast()

const test = ref({
  id: Number(route.params.id),
  title: 'Business Vocabulary Quiz',
})

// Mock results
const results = ref([
  { id: 1, student_name: 'John Doe', student_email: 'john@example.com', score: 85, correct_answers: 17, total_questions: 20, time_taken: 18, completed_at: '2024-02-01T10:30:00' },
  { id: 2, student_name: 'Jane Smith', student_email: 'jane@example.com', score: 92, correct_answers: 18, total_questions: 20, time_taken: 15, completed_at: '2024-02-01T11:00:00' },
  { id: 3, student_name: 'Mike Johnson', student_email: 'mike@example.com', score: 75, correct_answers: 15, total_questions: 20, time_taken: 20, completed_at: '2024-02-01T11:30:00' },
  { id: 4, student_name: 'Sarah Williams', student_email: 'sarah@example.com', score: 60, correct_answers: 12, total_questions: 20, time_taken: 19, completed_at: '2024-02-01T12:00:00' },
  { id: 5, student_name: 'David Brown', student_email: 'david@example.com', score: 95, correct_answers: 19, total_questions: 20, time_taken: 12, completed_at: '2024-02-01T12:30:00' },
])

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
    if (r.score <= 20) dist['0-20']++
    else if (r.score <= 40) dist['21-40']++
    else if (r.score <= 60) dist['41-60']++
    else if (r.score <= 80) dist['61-80']++
    else dist['81-100']++
  })
  return dist
})

const maxDistribution = computed(() => Math.max(...Object.values(scoreDistribution.value), 1))

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getScoreClass = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
