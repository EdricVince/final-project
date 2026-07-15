<template>
  <div class="min-h-screen bg-background">
    <!-- Top Navigation Bar -->
    <div class="bg-card border-border sticky top-0 z-20 border-b px-4 py-3 lg:px-6">
      <div class="flex items-center justify-between gap-4">
        <button
          class="group flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-sm font-semibold text-indigo-400 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/15 active:scale-95"
          @click="goBackToCourse"
        >
          <svg class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          <span class="hidden max-w-40 truncate sm:inline">{{ course?.title ?? 'Course' }}</span>
          <span class="sm:hidden">Course</span>
        </button>

        <div class="flex items-center gap-3">
          <span class="text-muted-foreground text-sm">
            {{ currentLessonIndex + 1 }} / {{ lessons.length }}
          </span>
          <div class="hidden items-center gap-1 sm:flex">
            <div
              v-for="(l, i) in lessons"
              :key="l.id"
              class="h-2 rounded-full transition-all"
              :class="[
                i === currentLessonIndex ? 'bg-primary w-4' :
                l.completed ? 'bg-primary/50 w-2' : 'bg-secondary w-2',
              ]"
            />
          </div>
        </div>

        <div
          v-if="currentLesson?.completed"
          class="bg-chart-2/10 text-chart-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
        >
          <CheckCircle class="h-4 w-4" />
          <span class="hidden sm:inline">Completed</span>
        </div>
        <div
          v-else-if="lessonProgress < 80"
          class="text-muted-foreground flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm"
        >
          <span>{{ Math.round(lessonProgress) }}% listened</span>
        </div>
        <button
          v-else
          class="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:opacity-90"
          @click="markComplete"
        >
          <Check class="h-4 w-4" />
          <span class="hidden sm:inline">Mark Complete</span>
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex" style="height: calc(100vh - 57px)">
      <!-- Main Content -->
      <div class="flex flex-1 flex-col overflow-y-auto">
        <!-- Audio Player Area -->
        <div
          class="relative w-full overflow-hidden"
          style="aspect-ratio: 16/6; min-height: 180px"
          :class="isPlaying ? 'bg-linear-to-br from-primary/30 via-chart-5/20 to-chart-1/20' : 'bg-linear-to-br from-secondary/80 to-secondary/40'"
        >
          <!-- Language pill -->
          <div class="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            <span>{{ currentLearningOption.flag }}</span>
            <span>{{ currentLearningOption.label }}</span>
          </div>

          <!-- Animated wave bars -->
          <div class="absolute inset-0 flex items-center justify-center gap-1 px-8">
            <div
              v-for="(bar, i) in waveBars"
              :key="i"
              class="rounded-full transition-all duration-300"
              :class="isPlaying ? 'bg-primary/60' : 'bg-primary/20'"
              :style="{
                width: '4px',
                height: isPlaying ? `${bar}%` : '20%',
                animationDuration: `${0.4 + (i % 5) * 0.1}s`,
                transition: `height ${0.1 + (i % 3) * 0.05}s ease-in-out`,
              }"
            />
          </div>

          <!-- Live Captions -->
          <div
            v-if="isPlaying && activeSegment >= 0"
            class="absolute bottom-14 left-4 right-4 z-10 text-center"
          >
            <p class="inline-block rounded-xl bg-black/50 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
              {{ currentLessonContent.transcript[activeSegment]?.text }}
            </p>
          </div>

          <!-- Center Controls -->
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div class="flex items-center gap-4">
              <!-- Skip Back 10s -->
              <button
                class="text-foreground/70 hover:text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-black/10 active:scale-95"
                title="Back 10s"
                @click="skipSeconds(-10)"
              >
                <SkipBack class="h-5 w-5" />
              </button>

              <!-- Play/Pause -->
              <button
                class="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
                :class="isPlaying ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card text-foreground hover:bg-accent'"
                @click="togglePlay"
              >
                <Play v-if="!isPlaying" class="ml-1 h-7 w-7" />
                <Pause v-else class="h-7 w-7" />
              </button>

              <!-- Skip Forward 10s -->
              <button
                class="text-foreground/70 hover:text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-black/10 active:scale-95"
                title="Forward 10s"
                @click="skipSeconds(10)"
              >
                <SkipForward class="h-5 w-5" />
              </button>
            </div>

            <p class="max-w-xs text-center text-sm font-medium" :class="isPlaying ? 'text-foreground' : 'text-muted-foreground'">
              <template v-if="!speechSupported">No speech synthesis available in this browser</template>
              <template v-else-if="isPlaying">Reading lesson in {{ currentLearningOption.label }} ({{ currentLearningOption.flag }})...</template>
              <template v-else-if="lessonProgress > 0 && lessonProgress < 100">Paused · {{ Math.round(lessonProgress) }}% complete</template>
              <template v-else-if="lessonProgress >= 100">Finished! ✓</template>
              <template v-else>Click Play to listen to this lesson</template>
            </p>
          </div>

          <!-- Bottom progress bar -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div
              class="bg-primary h-full transition-all duration-500"
              :style="{ width: `${lessonProgress}%` }"
            />
          </div>
        </div>

        <!-- Player Controls Bar -->
        <div class="bg-card border-border border-b px-6 py-3">
          <div class="flex items-center gap-3">
            <!-- Time -->
            <span class="text-muted-foreground w-10 shrink-0 font-mono text-xs">{{ currentTimeStr }}</span>

            <!-- Seekable Progress Bar -->
            <div
              class="relative h-2 flex-1 cursor-pointer rounded-full bg-secondary"
              @click="seekProgress($event)"
            >
              <div
                class="bg-primary h-2 rounded-full transition-all"
                :style="{ width: `${lessonProgress}%` }"
              />
              <div
                class="bg-primary absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full shadow transition-all"
                :style="{ left: `calc(${lessonProgress}% - 7px)` }"
              />
            </div>

            <span class="text-muted-foreground w-10 shrink-0 text-right font-mono text-xs">{{ totalTimeStr }}</span>

            <!-- Speed -->
            <select
              v-model="playbackRate"
              class="bg-secondary text-foreground rounded-md px-2 py-1 text-xs"
              @change="changeRate"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>

            <!-- Volume -->
            <button
              class="text-muted-foreground hover:text-foreground transition-colors"
              @click="toggleMute"
            >
              <Volume2 v-if="!isMuted" class="h-4 w-4" />
              <VolumeX v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Lesson Info -->
        <div class="p-6 lg:p-8">
          <div class="mx-auto max-w-3xl">
            <!-- Header -->
            <div class="mb-6">
              <div class="mb-2 flex items-center gap-2">
                <span class="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                  Lesson {{ currentLessonIndex + 1 }}
                </span>
                <span class="text-muted-foreground text-sm">{{ currentLesson?.duration }} min</span>
                <span
                  v-if="!currentLesson?.completed && lessonProgress < 80"
                  class="text-muted-foreground text-xs"
                >
                  · Listen to at least 80% to unlock completion
                </span>
              </div>
              <h1 class="text-foreground text-2xl font-bold">{{ currentLesson?.title }}</h1>
            </div>

            <!-- Tabs -->
            <div class="mb-6 flex gap-1 rounded-lg bg-secondary p-1">
              <button
                v-for="tab in contentTabs"
                :key="tab.value"
                class="flex-1 rounded-md py-2 text-sm font-medium transition-all"
                :class="
                  activeTab === tab.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                "
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Overview -->
            <div v-if="activeTab === 'overview'" class="space-y-4">
              <div class="bg-card border-border rounded-xl border p-5">
                <h3 class="text-foreground mb-3 font-semibold">About This Lesson</h3>
                <p class="text-muted-foreground leading-relaxed">{{ currentLessonContent.description }}</p>
              </div>
              <div class="bg-card border-border rounded-xl border p-5">
                <h3 class="text-foreground mb-3 font-semibold">What You'll Learn</h3>
                <ul class="space-y-2">
                  <li
                    v-for="(item, i) in currentLessonContent.objectives"
                    :key="i"
                    class="text-muted-foreground flex items-start gap-3"
                  >
                    <CheckCircle class="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Transcript -->
            <div v-else-if="activeTab === 'transcript'">
              <div class="bg-card border-border rounded-xl border p-5">
                <h3 class="text-foreground mb-4 font-semibold">Transcript</h3>
                <div class="space-y-4">
                  <div
                    v-for="(seg, i) in currentLessonContent.transcript"
                    :key="i"
                    class="flex gap-4 rounded-lg p-2 transition-colors"
                    :class="activeSegment === i ? 'bg-primary/10' : ''"
                  >
                    <span class="text-primary shrink-0 font-mono text-sm font-medium">{{ seg.time }}</span>
                    <p
                      class="text-sm leading-relaxed transition-colors"
                      :class="activeSegment === i ? 'text-foreground font-medium' : 'text-muted-foreground'"
                    >
                      {{ seg.text }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resources -->
            <div v-else-if="activeTab === 'resources'" class="space-y-3">
              <div
                v-for="(res, i) in currentLessonContent.resources"
                :key="i"
                class="bg-card border-border flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-accent/50"
              >
                <div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <FileText class="text-primary h-5 w-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-foreground font-medium">{{ res.name }}</p>
                  <p class="text-muted-foreground text-sm">{{ res.type }} · {{ res.size }}</p>
                </div>
                <button class="text-primary hover:text-primary/80 shrink-0 text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Navigation -->
        <div class="border-border mt-auto border-t px-6 py-4">
          <div class="mx-auto flex max-w-3xl items-center justify-between">
            <button
              class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              :class="
                currentLessonIndex > 0
                  ? 'bg-secondary hover:bg-secondary/80 text-foreground'
                  : 'opacity-40 cursor-not-allowed'
              "
              :disabled="currentLessonIndex === 0"
              @click="previousLesson"
            >
              <ChevronLeft class="h-4 w-4" />
              Previous
            </button>

            <div class="text-muted-foreground text-center text-xs">
              <span v-if="!currentLesson?.completed && lessonProgress < 80">
                Listen {{ Math.round(80 - lessonProgress) }}% more to complete
              </span>
              <span v-else-if="!currentLesson?.completed">
                Ready to complete!
              </span>
            </div>

            <button
              v-if="!currentLesson?.completed"
              class="flex items-center gap-2 rounded-xl px-6 py-2 font-medium transition-all"
              :class="
                lessonProgress >= 80
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-60'
              "
              :disabled="lessonProgress < 80"
              @click="markCompleteAndNext"
            >
              <Check class="h-4 w-4" />
              {{ isLastLesson ? 'Complete Course' : 'Complete & Next' }}
            </button>

            <button
              v-else
              class="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-6 py-2 font-medium transition-all hover:opacity-90"
              :class="isLastLesson ? 'opacity-40 cursor-not-allowed' : ''"
              :disabled="isLastLesson"
              @click="nextLesson"
            >
              Next Lesson
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="border-border bg-card hidden w-72 shrink-0 overflow-y-auto border-l xl:block">
        <div class="border-border border-b p-4">
          <h3 class="text-foreground font-semibold">Course Content</h3>
          <p class="text-muted-foreground text-sm">{{ completedCount }} / {{ lessons.length }} completed</p>
          <div class="bg-secondary mt-2 h-1.5 overflow-hidden rounded-full">
            <div
              class="bg-primary h-full rounded-full transition-all duration-500"
              :style="{ width: `${(completedCount / lessons.length) * 100}%` }"
            />
          </div>
        </div>
        <div class="divide-border divide-y">
          <button
            v-for="(lesson, index) in lessons"
            :key="lesson.id"
            class="flex w-full items-center gap-3 p-4 text-left transition-colors"
            :class="[
              lesson.id === currentLessonId
                ? 'bg-primary/5 border-l-2 border-primary'
                : lesson.unlocked
                  ? 'hover:bg-accent/50'
                  : 'opacity-50 cursor-not-allowed',
            ]"
            :disabled="!lesson.unlocked"
            @click="lesson.unlocked && navigateToLesson(lesson.id)"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              :class="
                lesson.completed
                  ? 'bg-primary/10 text-primary'
                  : lesson.id === currentLessonId
                    ? 'bg-primary text-primary-foreground'
                    : lesson.unlocked
                      ? 'bg-secondary text-foreground'
                      : 'bg-secondary text-muted-foreground'
              "
            >
              <CheckCircle v-if="lesson.completed" class="h-4 w-4" />
              <Lock v-else-if="!lesson.unlocked" class="h-3 w-3" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-medium"
                :class="lesson.id === currentLessonId ? 'text-primary' : 'text-foreground'"
              >
                {{ lesson.title }}
              </p>
              <p class="text-muted-foreground text-xs">{{ lesson.duration }} min</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Play,
  Pause,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  FileText,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from '@/components/icons'
import { useToast } from '@/composables/useToast'
import { useLearningLanguage } from '@/composables/useLearningLanguage'
import { useProgressStore } from '@/stores/progress.store'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { currentOption: currentLearningOption } = useLearningLanguage()
const progressStore = useProgressStore()

const courseId = computed(() => Number(route.params.courseId) || 1)
const currentLessonId = computed(() => Number(route.params.lessonId) || 1)

const isPlaying = ref(false)
const isMuted = ref(false)
const activeTab = ref('overview')
const playbackRate = ref('1')
const lessonProgress = ref(0) // 0–100
const activeSegment = ref(-1)

const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

const contentTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'resources', label: 'Resources' },
]

// Wave bar heights for visualizer (static heights, animated via CSS)
const waveBars = Array.from({ length: 40 }, (_, i) => 20 + Math.sin(i * 0.5) * 30 + Math.cos(i * 0.3) * 20)

const course = computed(() => {
  const map: Record<number, { id: number; title: string }> = {
    1: { id: 1, title: 'English Grammar Fundamentals' },
    2: { id: 2, title: 'English Vocabulary Builder' },
    3: { id: 3, title: 'IELTS Preparation Course' },
  }
  return map[courseId.value] || map[1]
})

const lessons = ref([
  { id: 1, title: 'Introduction to the Course', duration: 10, completed: true, unlocked: true },
  { id: 2, title: 'Getting Started', duration: 15, completed: true, unlocked: true },
  { id: 3, title: 'Core Concepts', duration: 25, completed: true, unlocked: true },
  { id: 4, title: 'Working with Data', duration: 30, completed: true, unlocked: true },
  { id: 5, title: 'Advanced Techniques', duration: 35, completed: false, unlocked: true },
  { id: 6, title: 'Best Practices', duration: 20, completed: false, unlocked: true },
  { id: 7, title: 'Real-world Projects', duration: 45, completed: false, unlocked: false },
  { id: 8, title: 'Final Assessment', duration: 30, completed: false, unlocked: false },
])

const currentLessonIndex = computed(
  () => lessons.value.findIndex(l => l.id === currentLessonId.value)
)
const currentLesson = computed(
  () => lessons.value.find(l => l.id === currentLessonId.value) || lessons.value[0]
)
const isLastLesson = computed(() => currentLessonIndex.value >= lessons.value.length - 1)
const completedCount = computed(() => lessons.value.filter(l => l.completed).length)

interface LessonContent {
  description: string
  objectives: string[]
  transcript: { time: string; text: string }[]
  resources: { name: string; type: string; size: string }[]
}

const lessonContents: Record<number, LessonContent> = {
  1: {
    description:
      "Welcome to the course! In this introductory lesson, we'll give you an overview of what you'll learn and how to get the most out of this course.",
    objectives: [
      'Understand the structure and goals of this course',
      'Learn how to navigate the course materials',
      'Set your learning objectives for success',
      'Get familiar with key English grammar terminology',
    ],
    transcript: [
      { time: '0:00', text: "Welcome to English Grammar Fundamentals. I'm your instructor and I'm excited to start this journey with you." },
      { time: '0:15', text: "In this course, we'll cover all the essential grammar rules you need to communicate effectively in English." },
      { time: '0:45', text: "We'll start from the basics and gradually move to more complex topics, ensuring you build a solid foundation." },
      { time: '1:20', text: "By the end of this course, you'll have the confidence to write and speak English with proper grammar." },
    ],
    resources: [
      { name: 'Course Syllabus', type: 'PDF', size: '245 KB' },
      { name: 'Grammar Reference Guide', type: 'PDF', size: '1.2 MB' },
    ],
  },
  5: {
    description:
      'Dive deep into advanced grammar techniques used by native speakers. This lesson covers complex sentence structures, nuanced tenses, and sophisticated vocabulary.',
    objectives: [
      'Master complex sentence structures and subordinate clauses',
      'Use advanced tenses correctly, including perfect continuous forms',
      'Understand nuanced differences between similar words',
      'Write more sophisticated and varied English sentences',
    ],
    transcript: [
      { time: '0:00', text: "In this advanced lesson, we're going to explore techniques that will elevate your English to the next level." },
      { time: '0:30', text: 'Complex sentences combine independent and dependent clauses to express nuanced ideas more precisely.' },
      { time: '1:15', text: "Let's look at how native speakers use these structures in real conversation and formal writing." },
      { time: '2:00', text: "Practice is key — we'll work through several examples and exercises to solidify your understanding." },
    ],
    resources: [
      { name: 'Advanced Grammar Notes', type: 'PDF', size: '620 KB' },
      { name: 'Complex Sentences Worksheet', type: 'PDF', size: '380 KB' },
      { name: 'Example Sentences Audio', type: 'MP3', size: '8.5 MB' },
    ],
  },
}

const defaultContent: LessonContent = {
  description:
    "In this lesson, we'll explore key concepts and practice exercises to strengthen your English grammar understanding.",
  objectives: [
    'Understand core concepts introduced in this lesson',
    'Apply new knowledge through practical exercises',
    'Build confidently on previous lesson topics',
    'Improve overall English language proficiency',
  ],
  transcript: [
    { time: '0:00', text: "Welcome back! In today's lesson, we'll continue building on what we've learned so far." },
    { time: '0:30', text: "Let's review the key concepts from the previous lesson before introducing new material." },
    { time: '1:15', text: "Now let's dive into the main topic of today's lesson with practical examples." },
    { time: '2:00', text: "Practice makes perfect — let's work through some exercises together." },
  ],
  resources: [
    { name: 'Lesson Notes', type: 'PDF', size: '310 KB' },
    { name: 'Practice Exercises', type: 'PDF', size: '450 KB' },
  ],
}

const currentLessonContent = computed(
  () => lessonContents[currentLessonId.value] || defaultContent
)

// Build the full lesson script for speech synthesis
const lessonScript = computed(() => {
  const c = currentLessonContent.value
  const parts = [
    `Lesson ${currentLessonIndex.value + 1}. ${currentLesson.value?.title}.`,
    c.description,
    'In this lesson you will learn:',
    ...c.objectives.map((o, i) => `Point ${i + 1}. ${o}.`),
    "Let's go through the lesson content.",
    ...c.transcript.map(t => t.text),
    "That's the end of this lesson. Well done!",
  ]
  return parts.join(' ')
})

// Speech synthesis state
let utterance: SpeechSynthesisUtterance | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null
let estimatedDurationMs = 0
let startTimestamp = 0
let pausedProgress = 0
const WAVE_UPDATE_INTERVAL = 100

// Time display
const currentTimeStr = computed(() => {
  const secs = Math.round((lessonProgress.value / 100) * estimatedDurationMs / 1000)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

const totalTimeStr = computed(() => {
  const secs = Math.round(estimatedDurationMs / 1000)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

// Update active transcript segment based on progress
const updateTranscriptSegment = () => {
  const segments = currentLessonContent.value.transcript
  if (!segments.length) return
  const idx = Math.floor((lessonProgress.value / 100) * segments.length)
  activeSegment.value = Math.min(idx, segments.length - 1)
}

// Animate wave bars when playing
let waveTimer: ReturnType<typeof setInterval> | null = null
const waveHeights = ref([...waveBars])

const startWaveAnimation = () => {
  waveTimer = setInterval(() => {
    if (isPlaying.value) {
      waveHeights.value = waveBars.map((base, i) => {
        const noise = Math.sin(Date.now() / (200 + i * 20)) * 25
        return Math.max(10, Math.min(90, base + noise))
      })
    }
  }, WAVE_UPDATE_INTERVAL)
}

const stopWaveAnimation = () => {
  if (waveTimer) { clearInterval(waveTimer); waveTimer = null }
  waveHeights.value = waveBars.map(() => 20)
}

const startProgressTimer = () => {
  if (progressTimer) clearInterval(progressTimer)
  const tickMs = 100
  progressTimer = setInterval(() => {
    if (!isPlaying.value) return
    const elapsed = Date.now() - startTimestamp
    const prog = pausedProgress + (elapsed / estimatedDurationMs) * 100
    lessonProgress.value = Math.min(prog, 100)
    updateTranscriptSegment()
    if (lessonProgress.value >= 100) {
      stopProgressTimer()
    }
  }, tickMs)
}

const stopProgressTimer = () => {
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
}

const startSpeech = () => {
  if (!speechSupported) {
    // Fallback: just run a timer
    simulateWithTimer()
    return
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
  }

  const text = lessonScript.value
  // Estimate duration: ~150 words/min at rate 1, adjust for rate
  const wordCount = text.split(' ').length
  const wordsPerMin = 150 * Number(playbackRate.value)
  estimatedDurationMs = (wordCount / wordsPerMin) * 60 * 1000

  const speechCode = currentLearningOption.value.speechCode
  const langPrefix = speechCode.split('-')[0] ?? speechCode

  utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = speechCode
  utterance.rate = Number(playbackRate.value)
  utterance.volume = isMuted.value ? 0 : 1
  utterance.pitch = 1.0

  // Pick a voice matching the learning language
  const voices = window.speechSynthesis.getVoices()
  const targetVoice =
    voices.find(v => v.lang === speechCode && v.localService) ||
    voices.find(v => v.lang === speechCode) ||
    voices.find(v => v.lang.startsWith(langPrefix) && v.localService) ||
    voices.find(v => v.lang.startsWith(langPrefix))
  if (targetVoice) utterance.voice = targetVoice

  utterance.onstart = () => {
    isPlaying.value = true
    startTimestamp = Date.now()
    startProgressTimer()
    startWaveAnimation()
  }

  utterance.onend = async () => {
    isPlaying.value = false
    lessonProgress.value = 100
    stopProgressTimer()
    stopWaveAnimation()
    pausedProgress = 100
    // Auto-complete lesson
    const lesson = lessons.value.find(l => l.id === currentLessonId.value)
    if (lesson && !lesson.completed) {
      lesson.completed = true
      const next = lessons.value[currentLessonIndex.value + 1]
      if (next) next.unlocked = true
      // Log activity and show XP toast
      const result = await progressStore.logFlashcardSession(5)
      if (result?.level_up) {
        toast.success(`Level up! You're now Level ${result.new_level}! 🎉`)
      } else if (result?.xp_gained) {
        toast.success(`+${result.xp_gained} XP! Lesson completed!`)
      } else {
        toast.success('Lesson completed! 🎉')
      }
      if (!isLastLesson.value) {
        setTimeout(() => nextLesson(), 1500)
      }
    }
  }

  utterance.onerror = () => {
    isPlaying.value = false
    stopProgressTimer()
    stopWaveAnimation()
  }

  utterance.onpause = () => {
    isPlaying.value = false
    pausedProgress = lessonProgress.value
    stopProgressTimer()
    stopWaveAnimation()
  }

  utterance.onresume = () => {
    isPlaying.value = true
    startTimestamp = Date.now()
    startProgressTimer()
    startWaveAnimation()
  }

  window.speechSynthesis.speak(utterance)
}

// Fallback for browsers without speech (simulated timer ~30s per lesson)
const simulateWithTimer = () => {
  const duration = (currentLesson.value?.duration || 5) * 1000 * 3 // 3s per lesson-minute
  estimatedDurationMs = duration
  isPlaying.value = true
  startTimestamp = Date.now()
  startProgressTimer()
  startWaveAnimation()
}

const togglePlay = () => {
  if (!speechSupported) {
    if (isPlaying.value) {
      isPlaying.value = false
      pausedProgress = lessonProgress.value
      stopProgressTimer()
      stopWaveAnimation()
    } else {
      startTimestamp = Date.now()
      startProgressTimer()
      startWaveAnimation()
      isPlaying.value = true
    }
    return
  }

  const synth = window.speechSynthesis
  if (synth.speaking) {
    if (isPlaying.value) {
      synth.pause()
      // pause/resume events handle state
    } else {
      synth.resume()
    }
  } else {
    pausedProgress = lessonProgress.value < 100 ? lessonProgress.value : 0
    lessonProgress.value = pausedProgress
    startSpeech()
  }
}

const changeRate = () => {
  if (window.speechSynthesis?.speaking) {
    window.speechSynthesis.cancel()
    pausedProgress = lessonProgress.value
    setTimeout(() => startSpeech(), 100)
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (utterance) utterance.volume = isMuted.value ? 0 : 1
}

const skipSeconds = (seconds: number) => {
  if (!estimatedDurationMs) return
  const delta = (seconds * 1000 / estimatedDurationMs) * 100
  const newPct = Math.max(0, Math.min(100, lessonProgress.value + delta))
  pausedProgress = newPct
  lessonProgress.value = newPct
  updateTranscriptSegment()
  if (speechSupported && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
    setTimeout(() => startSpeech(), 100)
  }
}

const seekProgress = (e: MouseEvent) => {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const pct = ((e.clientX - rect.left) / rect.width) * 100
  const newPct = Math.max(0, Math.min(100, pct))

  pausedProgress = newPct
  lessonProgress.value = newPct
  updateTranscriptSegment()

  if (speechSupported && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
    setTimeout(() => startSpeech(), 100)
  }
}

const markComplete = async () => {
  const lesson = lessons.value.find(l => l.id === currentLessonId.value)
  if (lesson && !lesson.completed) {
    lesson.completed = true
    const next = lessons.value[currentLessonIndex.value + 1]
    if (next) next.unlocked = true
    const result = await progressStore.logFlashcardSession(5)
    if (result?.level_up) {
      toast.success(`Level up! You're now Level ${result.new_level}! 🎉`)
    } else if (result?.xp_gained) {
      toast.success(`+${result.xp_gained} XP! Lesson completed!`)
    } else {
      toast.success('Lesson completed! 🎉')
    }
  }
}

const markCompleteAndNext = () => {
  markComplete()
  if (!isLastLesson.value) {
    setTimeout(() => nextLesson(), 400)
  } else {
    toast.success('Course complete! 🏆')
    setTimeout(() => goBackToCourse(), 1200)
  }
}

const previousLesson = () => {
  if (currentLessonIndex.value > 0) {
    navigateToLesson(lessons.value[currentLessonIndex.value - 1]!.id)
  }
}

const nextLesson = () => {
  if (!isLastLesson.value) {
    const next = lessons.value[currentLessonIndex.value + 1]
    if (next?.unlocked) navigateToLesson(next.id)
  }
}

const navigateToLesson = (lessonId: number) => {
  stopSpeech()
  activeTab.value = 'overview'
  lessonProgress.value = 0
  pausedProgress = 0
  activeSegment.value = -1
  router.push(`/courses/${courseId.value}/lessons/${lessonId}`)
}

const stopSpeech = () => {
  if (speechSupported) window.speechSynthesis.cancel()
  stopProgressTimer()
  stopWaveAnimation()
  isPlaying.value = false
}

const goBackToCourse = () => {
  stopSpeech()
  router.push(`/courses/${courseId.value}`)
}

// Reset state when lesson changes (same component, different params)
watch(currentLessonId, () => {
  stopSpeech()
  lessonProgress.value = 0
  pausedProgress = 0
  activeSegment.value = -1
})

// Load voices when available
onMounted(() => {
  if (speechSupported) {
    // Force voice list load
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices() }
  }
})

onUnmounted(() => {
  stopSpeech()
})
</script>

<style scoped>
/* Wave bar animation */
@keyframes wave {
  0%, 100% { transform: scaleY(0.6); }
  50% { transform: scaleY(1); }
}
</style>
