<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">Tests & Exams</h1>
        <p class="text-muted-foreground mt-2">Create and manage your tests</p>
      </div>
      <Button @click="$router.push('/teacher/tests/new')">
        <Plus class="mr-2 h-4 w-4" />
        Create Test
      </Button>
    </div>

    <!-- Stats -->
    <div class="animate-fade-in-up delay-100 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="bg-card border-border rounded-xl border p-4">
        <p class="text-muted-foreground text-sm">Total Tests</p>
        <p class="text-foreground text-2xl font-bold">{{ tests.length }}</p>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <p class="text-muted-foreground text-sm">Total Questions</p>
        <p class="text-foreground text-2xl font-bold">{{ totalQuestions }}</p>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <p class="text-muted-foreground text-sm">Submissions</p>
        <p class="text-foreground text-2xl font-bold">{{ totalSubmissions }}</p>
      </div>
      <div class="bg-card border-border rounded-xl border p-4">
        <p class="text-muted-foreground text-sm">Avg. Score</p>
        <p class="text-foreground text-2xl font-bold">{{ avgScore }}%</p>
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
                  {{ test.question_count }} questions
                </span>
                <span class="bg-secondary text-foreground rounded-full px-2 py-0.5 text-xs">
                  {{ test.time_limit }} min
                </span>
                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="test.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-secondary text-muted-foreground'"
                >
                  {{ test.is_active ? 'Active' : 'Draft' }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
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

        <!-- Assigned Classes -->
        <div v-if="test.assigned_classes && test.assigned_classes.length > 0" class="border-border mt-4 border-t pt-4">
          <p class="text-muted-foreground mb-2 text-sm">Assigned to:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="cls in test.assigned_classes"
              :key="cls"
              class="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
            >
              {{ cls }}
            </span>
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
import { ref, computed } from 'vue'
import { Plus, FileText, BarChart, Pencil, Trash2 } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// Mock tests
const tests = ref([
  {
    id: 1,
    title: 'Business Vocabulary Quiz',
    description: 'Test your knowledge of business English vocabulary',
    question_count: 20,
    time_limit: 20,
    is_active: true,
    assigned_classes: ['Business English 101'],
  },
  {
    id: 2,
    title: 'IELTS Practice Test 1',
    description: 'Full IELTS reading and listening practice',
    question_count: 40,
    time_limit: 60,
    is_active: true,
    assigned_classes: ['IELTS Preparation'],
  },
  {
    id: 3,
    title: 'Grammar Mid-term',
    description: 'Comprehensive grammar test covering units 1-5',
    question_count: 50,
    time_limit: 45,
    is_active: false,
    assigned_classes: [],
  },
])

const totalQuestions = computed(() => tests.value.reduce((sum, t) => sum + t.question_count, 0))
const totalSubmissions = ref(156)
const avgScore = ref(72)

const deleteTest = (id: number) => {
  tests.value = tests.value.filter(t => t.id !== id)
  toast.success('Test deleted')
}
</script>
