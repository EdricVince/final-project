<template>
  <div class="p-6 lg:p-8">

    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-foreground text-2xl font-bold">AI Content Import</h2>
        <p class="text-muted-foreground mt-1 text-sm">Paste a URL or text — AI will generate vocabulary, quizzes, and comprehension exercises instantly</p>
      </div>
      <div class="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2">
        <Sparkles class="text-primary h-4 w-4" />
        <span class="text-primary text-sm font-semibold">Powered by Claude AI</span>
      </div>
    </div>

    <!-- Step indicators -->
    <div class="mb-8 flex items-center gap-0">
      <div v-for="(step, i) in steps" :key="step.label" class="flex flex-1 items-center">
        <div class="flex flex-col items-center">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all"
            :class="currentStep > i ? 'bg-primary text-primary-foreground'
              : currentStep === i ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
              : 'bg-secondary text-muted-foreground'"
          >
            <Check v-if="currentStep > i" class="h-4 w-4" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="mt-1.5 hidden text-xs font-medium sm:block" :class="currentStep >= i ? 'text-foreground' : 'text-muted-foreground'">
            {{ step.label }}
          </span>
        </div>
        <div v-if="i < steps.length - 1" class="mx-2 h-0.5 flex-1 transition-all" :class="currentStep > i ? 'bg-primary' : 'bg-border'" />
      </div>
    </div>

    <!-- STEP 0: Input -->
    <div v-if="currentStep === 0" class="mx-auto max-w-2xl">
      <div class="bg-card border-border rounded-2xl border p-6">
        <h3 class="text-foreground mb-5 font-semibold">Source Content</h3>

        <!-- Tab: URL vs Text -->
        <div class="mb-5 flex rounded-xl border border-border bg-secondary/30 p-1">
          <button
            v-for="tab in ['URL', 'Paste Text']"
            :key="tab"
            class="flex-1 rounded-lg py-2 text-sm font-medium transition-all"
            :class="inputTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            @click="inputTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- URL input -->
        <div v-if="inputTab === 'URL'" class="mb-4">
          <label class="text-foreground mb-1.5 block text-sm font-medium">Webpage URL</label>
          <div class="relative">
            <Link class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              v-model="urlInput"
              type="url"
              placeholder="https://example.com/article"
              class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <p class="text-muted-foreground mt-1.5 text-xs">Works best with news articles, Wikipedia pages, blog posts, or educational content</p>
        </div>

        <!-- Text paste -->
        <div v-else class="mb-4">
          <label class="text-foreground mb-1.5 block text-sm font-medium">Paste Text</label>
          <textarea
            v-model="textInput"
            rows="8"
            placeholder="Paste your lesson content, article, or reading passage here..."
            class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p class="text-muted-foreground mt-1 text-xs">{{ textInput.length.toLocaleString() }} characters · minimum 80 required</p>
        </div>

        <!-- Language -->
        <div class="mb-6">
          <label class="text-foreground mb-1.5 block text-sm font-medium">Target Language</label>
          <select
            v-model="language"
            class="border-border bg-background text-foreground w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>English</option>
            <option>Vietnamese</option>
            <option>Chinese</option>
          </select>
        </div>

        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-colors disabled:opacity-50"
          :disabled="!canScan"
          @click="startScan"
        >
          <Sparkles class="h-4 w-4" />
          Generate Learning Content
        </button>
      </div>
    </div>

    <!-- STEP 1: Processing -->
    <div v-else-if="currentStep === 1" class="mx-auto max-w-md text-center">
      <div class="bg-card border-border rounded-2xl border px-8 py-16">
        <div class="mb-6 flex justify-center">
          <div class="relative flex h-20 w-20 items-center justify-center">
            <div class="border-primary absolute inset-0 animate-spin rounded-full border-4 border-t-transparent"></div>
            <Sparkles class="text-primary h-8 w-8" />
          </div>
        </div>
        <h3 class="text-foreground mb-2 text-lg font-bold">Analyzing Content...</h3>
        <p class="text-muted-foreground text-sm">{{ scanStatus }}</p>
        <div class="mt-4 flex justify-center gap-1.5">
          <span v-for="i in 3" :key="i" class="bg-primary h-1.5 w-1.5 animate-bounce rounded-full" :style="{ animationDelay: `${(i-1)*0.15}s` }" />
        </div>
      </div>
    </div>

    <!-- STEP 2: Preview & Save -->
    <div v-else-if="currentStep === 2 && result">
      <!-- Title & Summary -->
      <div class="bg-card border-border mb-6 rounded-2xl border p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="mb-1 flex items-center gap-2">
              <span class="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-semibold">{{ result.language }}</span>
              <span class="text-muted-foreground text-xs">Generated by Claude AI</span>
            </div>
            <h3 class="text-foreground text-xl font-bold">{{ result.title }}</h3>
            <p class="text-muted-foreground mt-1.5 text-sm">{{ result.summary }}</p>
          </div>
          <button
            class="group flex shrink-0 items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-sm font-semibold text-indigo-400 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/15 active:scale-95"
            @click="currentStep = 0; result = null"
          >
            <svg class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            New Import
          </button>
        </div>

        <!-- Stats row -->
        <div class="mt-4 flex flex-wrap gap-3">
          <div class="bg-secondary rounded-xl px-4 py-2 text-center">
            <p class="text-foreground text-lg font-bold">{{ result.vocabulary.length }}</p>
            <p class="text-muted-foreground text-xs">Vocabulary</p>
          </div>
          <div class="bg-secondary rounded-xl px-4 py-2 text-center">
            <p class="text-foreground text-lg font-bold">{{ result.quiz.length }}</p>
            <p class="text-muted-foreground text-xs">Quiz Questions</p>
          </div>
          <div class="bg-secondary rounded-xl px-4 py-2 text-center">
            <p class="text-foreground text-lg font-bold">{{ result.comprehension.length }}</p>
            <p class="text-muted-foreground text-xs">Comprehension</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-5 flex gap-2">
        <button
          v-for="tab in previewTabs"
          :key="tab.key"
          class="rounded-xl border px-4 py-2 text-sm font-medium transition-all"
          :class="activeTab === tab.key
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Vocabulary Tab -->
      <div v-if="activeTab === 'vocab'" class="bg-card border-border rounded-2xl border">
        <div class="border-border border-b px-5 py-4">
          <div class="flex items-center justify-between">
            <h4 class="text-foreground font-semibold">Vocabulary ({{ result.vocabulary.length }} words)</h4>
            <button class="text-primary text-sm font-medium" @click="selectAll('vocab')">Select All</button>
          </div>
        </div>
        <div class="divide-border divide-y">
          <div
            v-for="(word, i) in result.vocabulary"
            :key="i"
            class="flex items-start gap-4 px-5 py-3.5 transition-colors"
            :class="selectedVocab.has(i) ? 'bg-primary/3' : 'hover:bg-secondary/30'"
            @click="toggleVocab(i)"
          >
            <div
              class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all"
              :class="selectedVocab.has(i) ? 'border-primary bg-primary' : 'border-border'"
            >
              <Check v-if="selectedVocab.has(i)" class="h-3 w-3 text-white" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-foreground font-semibold">{{ word.term }}</span>
                <span class="text-muted-foreground text-sm">— {{ word.definition }}</span>
              </div>
              <p v-if="word.example" class="text-muted-foreground mt-0.5 text-xs italic">e.g. {{ word.example }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Tab -->
      <div v-else-if="activeTab === 'quiz'" class="space-y-3">
        <div
          v-for="(q, i) in result.quiz"
          :key="i"
          class="bg-card border-border rounded-2xl border p-5 transition-colors cursor-pointer"
          :class="selectedQuiz.has(i) ? 'border-primary/40 bg-primary/3' : 'hover:border-primary/20'"
          @click="toggleQuiz(i)"
        >
          <div class="mb-3 flex items-start gap-3">
            <div
              class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all"
              :class="selectedQuiz.has(i) ? 'border-primary bg-primary' : 'border-border'"
            >
              <Check v-if="selectedQuiz.has(i)" class="h-3 w-3 text-white" />
            </div>
            <p class="text-foreground font-medium">{{ i + 1 }}. {{ q.question }}</p>
          </div>
          <div class="ml-8 grid grid-cols-2 gap-2">
            <div
              v-for="(opt, j) in q.options"
              :key="j"
              class="rounded-lg px-3 py-1.5 text-sm"
              :class="j === q.correct ? 'bg-chart-2/15 text-chart-2 font-semibold' : 'bg-secondary text-muted-foreground'"
            >
              {{ ['A','B','C','D'][j] }}. {{ opt }}
            </div>
          </div>
          <p v-if="q.explanation" class="text-muted-foreground ml-8 mt-2 text-xs">💡 {{ q.explanation }}</p>
        </div>
      </div>

      <!-- Comprehension Tab -->
      <div v-else class="space-y-3">
        <div
          v-for="(c, i) in result.comprehension"
          :key="i"
          class="bg-card border-border rounded-2xl border p-5 cursor-pointer"
          :class="selectedComp.has(i) ? 'border-primary/40 bg-primary/3' : 'hover:border-primary/20'"
          @click="toggleComp(i)"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all"
              :class="selectedComp.has(i) ? 'border-primary bg-primary' : 'border-border'"
            >
              <Check v-if="selectedComp.has(i)" class="h-3 w-3 text-white" />
            </div>
            <div class="flex-1">
              <p class="text-foreground font-medium">{{ c.question }}</p>
              <p class="text-muted-foreground mt-1.5 text-sm">{{ c.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Bar -->
      <div class="bg-card border-border mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center">
        <div class="text-sm">
          <p class="text-foreground font-semibold">
            {{ selectedVocab.size }} vocab · {{ selectedQuiz.size }} quiz · {{ selectedComp.size }} comprehension selected
          </p>
          <p class="text-muted-foreground mt-0.5 text-xs">Content will be saved as a new lesson for your students</p>
        </div>
        <div class="flex gap-3">
          <select
            v-model="saveToClass"
            class="border-border bg-background text-foreground rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Save to Library</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
          <button
            class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-colors disabled:opacity-50"
            :disabled="selectedVocab.size + selectedQuiz.size + selectedComp.size === 0 || saving"
            @click="saveContent"
          >
            <div v-if="saving" class="border-white h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
            <Upload v-else class="h-4 w-4" />
            {{ saving ? 'Saving...' : 'Publish to Students' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="mx-auto mt-4 max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      {{ error }}
    </div>

    <!-- Success toast -->
    <Transition name="toast">
      <div v-if="saved" class="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-chart-2 px-5 py-3 text-white shadow-xl">
        <Check class="h-5 w-5" />
        <span class="font-semibold">Lesson published to students!</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Sparkles, Check, Link, Upload } from '@/components/icons'
import { api } from '@/utils/api'
import type { Class } from '@/types/class'

const steps = [
  { label: 'Source' },
  { label: 'Processing' },
  { label: 'Preview & Save' },
]

const currentStep = ref(0)
const scanTimers = ref<ReturnType<typeof setTimeout>[]>([])
const inputTab = ref('URL')
const urlInput = ref('')
const textInput = ref('')
const language = ref('English')
const scanStatus = ref('Fetching content...')
const error = ref('')
const saved = ref(false)
const activeTab = ref('vocab')
const saveToClass = ref<number | ''>('')
const classes = ref<Class[]>([])

const previewTabs = [
  { key: 'vocab', label: '📖 Vocabulary' },
  { key: 'quiz', label: '❓ Quiz' },
  { key: 'comp', label: '💬 Comprehension' },
]

interface ImportResult {
  title: string
  summary: string
  language: string
  vocabulary: { term: string; definition: string; example: string }[]
  quiz: { question: string; options: string[]; correct: number; explanation: string }[]
  comprehension: { question: string; answer: string }[]
}

const result = ref<ImportResult | null>(null)
const selectedVocab = ref(new Set<number>())
const selectedQuiz = ref(new Set<number>())
const selectedComp = ref(new Set<number>())

const canScan = computed(() => {
  if (inputTab.value === 'URL') return urlInput.value.trim().startsWith('http')
  return textInput.value.trim().length >= 80
})

const toggleVocab = (i: number) => {
  if (selectedVocab.value.has(i)) selectedVocab.value.delete(i)
  else selectedVocab.value.add(i)
  selectedVocab.value = new Set(selectedVocab.value)
}
const toggleQuiz = (i: number) => {
  if (selectedQuiz.value.has(i)) selectedQuiz.value.delete(i)
  else selectedQuiz.value.add(i)
  selectedQuiz.value = new Set(selectedQuiz.value)
}
const toggleComp = (i: number) => {
  if (selectedComp.value.has(i)) selectedComp.value.delete(i)
  else selectedComp.value.add(i)
  selectedComp.value = new Set(selectedComp.value)
}

const selectAll = (tab: string) => {
  if (tab === 'vocab' && result.value) {
    result.value.vocabulary.forEach((_, i) => selectedVocab.value.add(i))
    selectedVocab.value = new Set(selectedVocab.value)
  }
}

const startScan = async () => {
  error.value = ''
  currentStep.value = 1
  scanStatus.value = inputTab.value === 'URL' ? 'Fetching webpage content...' : 'Reading your text...'

  try {
    const body: { url?: string; text?: string; language: string } = { language: language.value }
    if (inputTab.value === 'URL') body.url = urlInput.value.trim()
    else body.text = textInput.value.trim()

    scanTimers.value.forEach(clearTimeout)
    scanTimers.value = [
      setTimeout(() => { if (currentStep.value === 1) scanStatus.value = 'Analyzing with Claude AI...' }, 1500),
      setTimeout(() => { if (currentStep.value === 1) scanStatus.value = 'Generating exercises...' }, 3500),
    ]

    const res = await api.importScan(body)
    result.value = res as ImportResult

    selectedVocab.value = new Set((result.value.vocabulary ?? []).map((_, i) => i))
    selectedQuiz.value = new Set((result.value.quiz ?? []).map((_, i) => i))
    selectedComp.value = new Set((result.value.comprehension ?? []).map((_, i) => i))

    currentStep.value = 2
    activeTab.value = 'vocab'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to scan content. Please try again.'
    currentStep.value = 0
  }
}

const saving = ref(false)

const saveContent = async () => {
  if (!result.value) return
  saving.value = true
  try {
    const filteredContent = {
      vocabulary: result.value.vocabulary.filter((_, i) => selectedVocab.value.has(i)),
      quiz: result.value.quiz.filter((_, i) => selectedQuiz.value.has(i)),
      comprehension: result.value.comprehension.filter((_, i) => selectedComp.value.has(i)),
    }
    await api.createLesson({
      title: result.value.title,
      description: result.value.summary,
      category: result.value.language,
      difficulty: 'beginner',
      class_id: saveToClass.value !== '' ? Number(saveToClass.value) : undefined,
      content: filteredContent,
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save lesson.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    classes.value = (await api.getClasses()) as Class[]
  } catch {
    // ignore
  }
})

onUnmounted(() => {
  scanTimers.value.forEach(clearTimeout)
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(1rem); }
</style>
