<template>
  <div class="mx-auto max-w-3xl p-6 lg:p-8">
    <button class="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1.5 text-sm font-medium" @click="router.push('/quizzes')">
      <ArrowLeft class="h-4 w-4" /> {{ $t('quizzesPage.title') }}
    </button>

    <div v-if="loading" class="flex items-center justify-center py-20"><Loader2 class="text-primary h-8 w-8 animate-spin" /></div>

    <div v-else-if="!test" class="bg-card border-border rounded-2xl border p-10 text-center">
      <p class="text-muted-foreground">{{ $t('quizzesPage.testNotFound') }}</p>
    </div>

    <template v-else>
      <div class="mb-6">
        <h1 class="text-foreground text-2xl font-bold tracking-tight">{{ test.title }}</h1>
        <p v-if="test.description" class="text-muted-foreground mt-1">{{ test.description }}</p>
        <p class="text-muted-foreground mt-1 text-sm">{{ test.questions.length }} {{ $t('quizzesPage.questions') }}<span v-if="test.time_limit"> · {{ test.time_limit }} min</span></p>
      </div>

      <!-- Result -->
      <div v-if="result" class="bg-card border-border mb-6 rounded-2xl border p-8 text-center">
        <div class="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
          <Trophy class="text-primary h-10 w-10" />
        </div>
        <h2 class="text-foreground text-2xl font-bold">{{ result.score }}/{{ result.total }}</h2>
        <p class="text-muted-foreground mt-1">{{ resultPct }}% {{ $t('quizzesPage.correctLabel') }}</p>
        <div class="mt-6 flex justify-center gap-3">
          <Button variant="outline" @click="retake">{{ $t('quizzesPage.retake') }}</Button>
          <Button @click="router.push('/quizzes')">{{ $t('quizzesPage.backToQuizzes') }}</Button>
        </div>
      </div>

      <!-- Questions -->
      <div v-if="!result" class="space-y-4">
        <div v-for="(q, qi) in test.questions" :key="qi" class="bg-card border-border rounded-2xl border p-5">
          <p class="text-foreground mb-4 font-semibold">{{ qi + 1 }}. {{ q.question }}</p>
          <div class="grid gap-2">
            <button
              v-for="(opt, oi) in q.options"
              :key="oi"
              class="rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all"
              :class="answers[qi] === oi ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-primary/40 hover:bg-primary/5'"
              @click="answers[qi] = oi"
            >
              <span class="mr-2 font-bold">{{ String.fromCharCode(65 + oi) }}.</span>{{ opt }}
            </button>
          </div>
        </div>

        <div class="bg-card border-border sticky bottom-4 flex items-center justify-between rounded-2xl border p-4 shadow-lg">
          <span class="text-muted-foreground text-sm">{{ answeredCount }}/{{ test.questions.length }} {{ $t('quizzesPage.answered') }}</span>
          <Button :disabled="submitting" @click="submit">{{ submitting ? '…' : $t('quizzesPage.submitTest') }}</Button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api, ApiError } from '@/utils/api'
import { useToast } from '@/composables/useToast'
import type { TestData } from '@/types/content'
import { ArrowLeft, Trophy, Loader2Icon as Loader2 } from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const testId = Number(route.params.id)

const test = ref<TestData | null>(null)
const answers = ref<number[]>([])
const result = ref<{ score: number; total: number } | null>(null)
const loading = ref(true)
const submitting = ref(false)

const answeredCount = computed(() => answers.value.filter(a => a != null && a >= 0).length)
const resultPct = computed(() => (result.value && result.value.total ? Math.round((result.value.score / result.value.total) * 100) : 0))

const load = async () => {
  loading.value = true
  try {
    test.value = await api.getTest(testId)
    answers.value = new Array(test.value.questions.length).fill(-1)
  } catch (e) {
    toast.error(e instanceof ApiError ? e.errorMessage : 'Failed to load test')
    router.push('/quizzes')
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!test.value || submitting.value) return
  submitting.value = true
  try {
    const r = await api.submitTest(testId, answers.value.map(a => (a == null ? -1 : a)))
    result.value = { score: r.score, total: r.total }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    toast.error(e instanceof ApiError ? e.errorMessage : 'Failed to submit')
  } finally {
    submitting.value = false
  }
}

const retake = () => {
  result.value = null
  answers.value = new Array(test.value?.questions.length ?? 0).fill(-1)
}

onMounted(load)
</script>
