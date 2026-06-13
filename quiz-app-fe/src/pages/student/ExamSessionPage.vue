<template>
  <div class="mx-auto max-w-3xl space-y-6 p-6">
    <!-- Loading -->
    <div v-if="loading" class="flex min-h-64 flex-col items-center justify-center gap-4">
      <div class="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      <p class="text-muted-foreground text-sm">{{ $t('exam.loading', { type: examType.toUpperCase() }) }}</p>
    </div>

    <!-- Exam Active -->
    <template v-else-if="!finished">
      <!-- Header -->
      <div class="bg-card border-border flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
        <div class="flex items-center gap-3">
          <span class="bg-primary/10 text-primary rounded-lg px-3 py-1 text-xs font-bold tracking-wider uppercase">
            {{ examType.toUpperCase() }}
          </span>
          <span class="text-foreground text-sm font-semibold">
            {{ $t('exam.questionOf', { current: currentIdx + 1, total: questions.length }) }}
          </span>
          <span v-if="targetBand" class="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
            🎯 {{ targetBand }}
          </span>
        </div>

        <ExamTimer :total-seconds="timeLimitSecs" @timeout="submitExam" />
      </div>

      <!-- Section transition banner -->
      <div
        v-if="isNewSection"
        class="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all"
        :class="currentSectionStyle.banner"
      >
        <span class="text-lg">{{ currentSectionStyle.icon }}</span>
        <div>
          <div class="font-bold">{{ currentSection }}</div>
          <div class="text-xs opacity-70">{{ currentSectionDesc }}</div>
        </div>
        <div class="ml-auto text-xs opacity-60">{{ questionsInSection }} question(s)</div>
      </div>

      <!-- Progress bar -->
      <div class="bg-border h-1.5 w-full overflow-hidden rounded-full">
        <div
          class="bg-primary h-full rounded-full transition-all duration-300"
          :style="{ width: ((currentIdx + 1) / questions.length * 100) + '%' }"
        />
      </div>

      <!-- Section mini-tabs -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="(sec, idx) in sectionSummary"
          :key="sec.name"
          class="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
          :class="idx === currentSectionIndex
            ? 'border-primary bg-primary/15 text-primary'
            : 'border-border text-muted-foreground hover:bg-accent'"
          @click="currentIdx = sec.startIdx"
        >
          {{ sec.icon }} {{ sec.name }}
          <span class="rounded-full px-1.5 py-0.5 text-[10px]" :class="idx === currentSectionIndex ? 'bg-primary/20' : 'bg-muted'">
            {{ sec.answered }}/{{ sec.total }}
          </span>
        </button>
      </div>

      <!-- Question -->
      <div class="bg-card border-border rounded-2xl border p-6">
        <ExamQuestion
          :question="questions[currentIdx]"
          :index="currentIdx"
          :total="questions.length"
          :selected="answers[currentIdx] ?? null"
          :show-result="false"
          :section-passage="sectionPassageMap[questions[currentIdx]?.section] ?? null"
          :writing-text="writingAnswers[currentIdx] ?? ''"
          @select="selectAnswer"
          @write="handleWrite"
        />
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between gap-4">
        <button
          class="border-border text-muted-foreground hover:bg-accent rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-30"
          :disabled="currentIdx === 0"
          @click="currentIdx--"
        >{{ $t('exam.prev') }}</button>

        <div class="flex flex-wrap justify-center gap-1.5">
          <button
            v-for="(_, i) in questions"
            :key="i"
            class="h-2.5 w-2.5 rounded-full transition-all duration-200"
            :class="{
              'bg-primary': isAnswered(i) && i !== currentIdx,
              'bg-amber-400 scale-125': i === currentIdx,
              'bg-border': !isAnswered(i) && i !== currentIdx,
            }"
            @click="currentIdx = i"
          />
        </div>

        <button
          v-if="currentIdx < questions.length - 1"
          class="border-border text-muted-foreground hover:bg-accent rounded-lg border px-4 py-2 text-sm transition-colors"
          @click="currentIdx++"
        >{{ $t('exam.next') }}</button>
        <button
          v-else
          class="bg-green-600 hover:bg-green-700 rounded-lg px-5 py-2 text-sm font-bold text-white transition-colors"
          @click="submitExam"
        >{{ $t('exam.submit') }}</button>
      </div>
    </template>

    <!-- Result -->
    <div v-else class="space-y-6">
      <h2 class="text-foreground text-2xl font-extrabold">{{ $t('exam.resultTitle', { type: examType.toUpperCase() }) }}</h2>
      <ExamResult :result="result!" :exam-type="examType" @retry="resetExam" @schedule="goSchedule" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExamTimer from '@/components/exam/ExamTimer.vue'
import ExamQuestion from '@/components/exam/ExamQuestion.vue'
import ExamResult from '@/components/exam/ExamResult.vue'
import { api } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const examType = ref((route.query.type as string) || 'ielts')
const targetBand = computed(() => (route.query.target as string) || localStorage.getItem('studyspark_target_band') || '')

const loading = ref(true)
const finished = ref(false)
const questions = ref<any[]>([])
const answers = ref<Record<number, number>>({})
const writingAnswers = ref<Record<number, string>>({})
const currentIdx = ref(0)
const timeLimitSecs = ref(1800)
const result = ref<any>(null)

const sectionStyleMap: Record<string, { icon: string; banner: string; desc: string }> = {
  'Listening Part 1':  { icon: '🎧', banner: 'border-blue-500/30 bg-blue-500/10 text-blue-300',     desc: 'Listen to the audio and answer the questions — no transcript shown' },
  'Listening Part 2':  { icon: '🎧', banner: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',     desc: 'Listen to the monologue / announcement and answer the questions' },
  Reading:             { icon: '📖', banner: 'border-green-500/30 bg-green-500/10 text-green-300',   desc: 'Academic passage — note completion (ONE WORD from text) + True/False/Not Given' },
  Writing:             { icon: '✍️', banner: 'border-violet-500/30 bg-violet-500/10 text-violet-300', desc: 'Write your responses — Task 1 (150+ words) and Task 2 (250+ words)' },
  'Listening Part 3':  { icon: '🗣️', banner: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',    desc: 'Part 3 — Short Conversations: listen and answer the questions' },
  'Listening Part 4':  { icon: '📢', banner: 'border-teal-500/30 bg-teal-500/10 text-teal-300',     desc: 'Part 4 — Short Talks: listen and answer the questions' },
  'Reading Part 5':    { icon: '📝', banner: 'border-amber-500/30 bg-amber-500/10 text-amber-300',  desc: 'Part 5 — Incomplete Sentences: choose the word or phrase that best completes each sentence' },
  'Reading Part 6':    { icon: '📄', banner: 'border-orange-500/30 bg-orange-500/10 text-orange-300', desc: 'Part 6 — Text Completion: read the passage and choose the best word for each blank' },
  'Reading Part 7':    { icon: '📰', banner: 'border-green-500/30 bg-green-500/10 text-green-300',  desc: 'Part 7 — Reading Comprehension: read the article and answer the questions' },
  Listening:               { icon: '🎧', banner: 'border-blue-500/30 bg-blue-500/10 text-blue-300',     desc: 'Listening section' },
  'Reading Passage 1':     { icon: '📖', banner: 'border-teal-500/30 bg-teal-500/10 text-teal-300',     desc: 'Academic passage — read carefully and answer the questions' },
  'Reading Passage 2':     { icon: '📖', banner: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',     desc: 'Second academic passage — read carefully and answer the questions' },
  'Listening — Lecture':   { icon: '🎓', banner: 'border-teal-500/30 bg-teal-500/10 text-teal-300',     desc: 'Professor lecture — listen and answer comprehension questions' },
  'Listening — Discussion':{ icon: '🗣️', banner: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',    desc: 'Classroom discussion — listen and answer comprehension questions' },
}

// Build section passage map: first passage per section for TTS replay
const sectionPassageMap = computed(() => {
  const map: Record<string, string> = {}
  for (const q of questions.value) {
    if (q.passage && !map[q.section]) {
      map[q.section] = q.passage
    }
  }
  return map
})

const currentSection = computed(() => questions.value[currentIdx.value]?.section ?? '')
const currentSectionStyle = computed(() => sectionStyleMap[currentSection.value] ?? { icon: '📋', banner: 'border-border bg-muted/20 text-foreground', desc: '' })
const currentSectionDesc = computed(() => currentSectionStyle.value.desc)

const isNewSection = computed(() => {
  if (currentIdx.value === 0) return true
  return questions.value[currentIdx.value]?.section !== questions.value[currentIdx.value - 1]?.section
})

const sectionSummary = computed(() => {
  const sections: { name: string; icon: string; startIdx: number; total: number; answered: number }[] = []
  let lastSection = ''
  questions.value.forEach((q, i) => {
    if (q.section !== lastSection) {
      sections.push({ name: q.section, icon: sectionStyleMap[q.section]?.icon ?? '📋', startIdx: i, total: 0, answered: 0 })
      lastSection = q.section
    }
    const sec = sections[sections.length - 1]
    sec.total++
    if (isAnswered(i)) sec.answered++
  })
  return sections
})

const currentSectionIndex = computed(() => {
  const sec = questions.value[currentIdx.value]?.section
  return sectionSummary.value.findIndex(s => s.name === sec)
})

const questionsInSection = computed(() => sectionSummary.value[currentSectionIndex.value]?.total ?? 0)

function isAnswered(i: number): boolean {
  if (questions.value[i]?.section === 'Writing') {
    return !!(writingAnswers.value[i]?.trim())
  }
  return answers.value[i] !== undefined
}

onMounted(loadExam)

async function loadExam() {
  loading.value = true
  try {
    const variant = Math.floor(Math.random() * 6)
    const data = await api.generateExam({ exam_type: examType.value as any, question_count: 20, variant })
    questions.value = data.questions
    timeLimitSecs.value = Math.round((data.time_limit ?? 30) * 60)
  } catch {
    questions.value = []
  } finally {
    loading.value = false
  }
}

function selectAnswer(i: number) {
  answers.value[currentIdx.value] = i
  if (currentIdx.value < questions.value.length - 1) {
    setTimeout(() => { currentIdx.value++ }, 400)
  }
}

function handleWrite(text: string) {
  writingAnswers.value[currentIdx.value] = text
}

async function submitExam() {
  const answerList: { question_id: number; selected?: number; written?: string }[] = [
    ...Object.entries(answers.value).map(([qi, sel]) => ({
      question_id: questions.value[Number(qi)].id,
      selected: sel,
    })),
    ...Object.entries(writingAnswers.value)
      .filter(([, text]) => text.trim())
      .map(([qi, text]) => ({
        question_id: questions.value[Number(qi)].id,
        written: text,
      })),
  ]

  try {
    const res = await api.submitExam({ exam_type: examType.value as any, answers: answerList, questions: questions.value })
    result.value = {
      ...res,
      writing_responses: Object.entries(writingAnswers.value)
        .filter(([, text]) => text.trim())
        .map(([qi, text]) => ({
          task: questions.value[Number(qi)]?.type ?? 'writing',
          question: questions.value[Number(qi)]?.question ?? '',
          text,
        })),
    }
  } catch {
    result.value = { total: 0, correct: 0, score_percent: 0, estimated_band: 'N/A', estimated_score: 'N/A', level: 'N/A', breakdown: [], recommendations: [], weak_areas: [], writing_responses: [] }
  }
  finished.value = true
}

function resetExam() {
  finished.value = false
  answers.value = {}
  writingAnswers.value = {}
  currentIdx.value = 0
  loadExam()
}

function goSchedule() { router.push('/schedule') }
</script>
