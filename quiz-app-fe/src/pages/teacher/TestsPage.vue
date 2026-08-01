<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ $t('teacher.tests.title') }}</h1>
        <p class="text-muted-foreground mt-2">{{ $t('teacher.tests.subtitle') }}</p>
      </div>
      <Button @click="$router.push('/teacher/tests/new')">
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('teacher.tests.createTest') }}
      </Button>
    </div>

    <!-- Stats -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-4/10">
          <FileText class="text-chart-4 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ tests.length }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.tests.stats.total') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-3/10">
          <HelpCircle class="text-chart-3 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ totalQuestions }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.tests.stats.questions') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-1/10">
          <Users class="text-chart-1 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ totalSubmissions }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.tests.stats.submissions') }}</p>
      </div>
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10">
          <BarChart2 class="text-chart-2 h-4 w-4" />
        </div>
        <p class="text-foreground text-2xl font-bold">{{ avgScore }}%</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('teacher.tests.stats.avgScore') }}</p>
      </div>
    </div>

    <!-- Tests List -->
    <div class="animate-fade-in-up delay-150 space-y-4">
      <div
        v-for="test in tests"
        :key="test.id"
        class="bg-card border-border rounded-2xl border p-6 transition-all hover:shadow-lg"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-start gap-4">
            <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <FileText class="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 class="text-foreground text-lg font-semibold">{{ test.title }}</h3>
              <p class="text-muted-foreground text-sm">{{ test.description }}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span class="bg-secondary text-foreground rounded-full px-2 py-0.5 text-xs">
                  {{ test.question_count ?? test.questions?.length ?? 0 }} questions
                </span>
                <span v-if="test.time_limit" class="bg-secondary text-foreground rounded-full px-2 py-0.5 text-xs">
                  {{ test.time_limit }} min
                </span>
                <span class="bg-chart-1/10 text-chart-1 rounded-full px-2 py-0.5 text-xs">
                  {{ test.submission_count ?? 0 }} submissions
                </span>
                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="test.is_published ? 'bg-chart-2/10 text-chart-2' : 'bg-secondary text-muted-foreground'"
                >
                  {{ test.is_published ? $t('teacher.tests.status.active') : $t('teacher.tests.status.draft') }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button size="sm" :variant="test.is_published ? 'outline' : 'default'" @click="togglePublish(test)">
              {{ test.is_published ? 'Unpublish' : 'Publish' }}
            </Button>
            <Button variant="outline" size="sm" @click="$router.push(`/teacher/tests/${test.id}/results`)">
              <BarChart class="mr-2 h-4 w-4" />
              Results
            </Button>
            <Button variant="outline" size="sm" @click="$router.push(`/teacher/tests/${test.id}/edit`)">
              <Pencil class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" @click="deleteTest(test.id)">
              <Trash2 class="text-destructive h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>

      <!-- Empty State -->
      <div
        v-if="tests.length === 0"
        class="bg-card border-border flex flex-col items-center justify-center rounded-2xl border p-12"
      >
        <div class="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <FileText class="text-muted-foreground h-8 w-8" />
        </div>
        <h3 class="text-foreground mb-2 font-medium">No tests yet</h3>
        <p class="text-muted-foreground mb-4 text-sm">Create your first test to get started</p>
        <Button @click="$router.push('/teacher/tests/new')">
          <Plus class="mr-2 h-4 w-4" />
          Create Test
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, FileText, BarChart, Pencil, Trash2, HelpCircle, Users, BarChart2 } from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'
import { useToast } from '@/composables/useToast'
import { api, ApiError } from '@/utils/api'
import type { TestData } from '@/types/content'

const toast = useToast()
const tests = ref<TestData[]>([])
const loading = ref(true)

const totalQuestions = computed(() => tests.value.reduce((s, t) => s + (t.question_count ?? t.questions?.length ?? 0), 0))
const totalSubmissions = computed(() => tests.value.reduce((s, t) => s + (t.submission_count ?? 0), 0))
const avgScore = computed(() => {
  const withSubs = tests.value.filter(t => (t.submission_count ?? 0) > 0)
  return withSubs.length ? Math.round(withSubs.reduce((s, t) => s + (t.avg_score ?? 0), 0) / withSubs.length) : 0
})

const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.errorMessage : fb)

const load = async () => {
  loading.value = true
  try { tests.value = await api.getTests() } catch (e) { toast.error(errMsg(e, 'Failed to load tests')) } finally { loading.value = false }
}
onMounted(load)

const togglePublish = async (test: TestData) => {
  try {
    const u = await api.updateTest(test.id, { is_published: !test.is_published })
    test.is_published = u.is_published
    toast.success(u.is_published ? 'Published to students' : 'Unpublished')
  } catch (e) { toast.error(errMsg(e, 'Failed to update')) }
}

const deleteTest = async (id: number) => {
  try {
    await api.deleteTest(id)
    tests.value = tests.value.filter(t => t.id !== id)
    toast.success('Test deleted')
  } catch (e) { toast.error(errMsg(e, 'Failed to delete')) }
}
</script>
