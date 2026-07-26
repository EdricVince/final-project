<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ $t('classroom.title') }}</h1>
        <p class="text-muted-foreground mt-2">{{ $t('classroom.watchVideos') }}</p>
      </div>
      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-colors"
        @click="showJoinModal = true"
      >
        <Plus class="h-4 w-4" />
        {{ $t('classroom.joinClass') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
    </div>

    <template v-else>
      <!-- No classes joined -->
      <div v-if="classes.length === 0" class="bg-card border-border flex flex-col items-center justify-center rounded-2xl border p-16 text-center">
        <div class="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <BookOpen class="text-muted-foreground h-8 w-8" />
        </div>
        <h3 class="text-foreground mb-2 font-medium">{{ $t('classroom.noClassesJoined') }}</h3>
        <p class="text-muted-foreground mb-6 max-w-sm text-sm">
          {{ $t('classroom.noClassesJoinedDesc') }}
        </p>
        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-colors"
          @click="showJoinModal = true"
        >
          <Plus class="h-4 w-4" />
          {{ $t('classroom.joinClass') }}
        </button>
      </div>

      <template v-else>
        <!-- Class Tabs -->
        <div class="animate-fade-in-up mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            class="shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            :class="selectedClassId === null ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'"
            @click="selectClass(null)"
          >{{ $t('classroom.allClasses') }}</button>
          <button
            v-for="cls in classes"
            :key="cls.id"
            class="shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            :class="selectedClassId === cls.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'"
            @click="selectClass(cls.id)"
          >{{ cls.name }}</button>
        </div>

        <!-- Videos loading -->
        <div v-if="videosLoading" class="flex items-center justify-center py-16">
          <div class="border-primary h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"></div>
        </div>

        <!-- Videos Grid -->
        <div v-else-if="videos.length > 0" class="animate-fade-in-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="video in videos"
            :key="video.id"
            class="bg-card border-border group cursor-pointer overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-lg"
            @click="activeVideo = video"
          >
            <div class="bg-secondary relative aspect-video overflow-hidden">
              <img
                v-if="isYouTube(video.video_url)"
                :src="getYouTubeThumbnail(video.video_url)"
                class="h-full w-full object-cover"
                alt=""
              />
              <div v-else class="flex h-full items-center justify-center">
                <PlayCircle class="text-muted-foreground h-12 w-12" />
              </div>
              <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
                <div class="scale-0 rounded-full bg-white/90 p-3 shadow-lg transition-transform group-hover:scale-100">
                  <Play class="text-foreground h-6 w-6" />
                </div>
              </div>
              <div v-if="video.duration" class="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                {{ formatDuration(video.duration) }}
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-foreground mb-1 font-semibold line-clamp-2">{{ video.title }}</h3>
              <p v-if="video.description" class="text-muted-foreground mb-2 text-sm line-clamp-2">{{ video.description }}</p>
              <div class="flex items-center justify-between text-xs">
                <span v-if="video.lesson_name" class="text-primary font-medium">{{ video.lesson_name }}</span>
                <span class="text-muted-foreground">{{ getClassName(video.class_id) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- No videos -->
        <div v-else class="bg-card border-border flex flex-col items-center justify-center rounded-2xl border p-16 text-center">
          <div class="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <PlayCircle class="text-muted-foreground h-8 w-8" />
          </div>
          <h3 class="text-foreground mb-2 font-medium">{{ $t('classroom.noVideosYet') }}</h3>
          <p class="text-muted-foreground text-sm">{{ $t('classroom.noVideosDesc') }}</p>
        </div>
      </template>
    </template>

    <!-- Video Player Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="activeVideo" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="activeVideo = null"></div>
          <div class="relative z-10 w-full max-w-4xl">
            <button
              class="absolute -top-10 right-0 text-white/70 transition-colors hover:text-white"
              @click="activeVideo = null"
            ><X class="h-6 w-6" /></button>
            <div class="overflow-hidden rounded-2xl bg-black shadow-2xl">
              <div class="relative aspect-video">
                <iframe
                  v-if="isYouTube(activeVideo.video_url)"
                  :src="getYouTubeEmbed(activeVideo.video_url)"
                  class="h-full w-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
                <video v-else :src="activeVideo.video_url" class="h-full w-full" controls autoplay></video>
              </div>
              <div class="bg-card p-4">
                <h3 class="text-foreground font-semibold">{{ activeVideo.title }}</h3>
                <p v-if="activeVideo.description" class="text-muted-foreground mt-1 text-sm">{{ activeVideo.description }}</p>
                <div class="mt-2 flex items-center gap-3 text-xs">
                  <span v-if="activeVideo.lesson_name" class="text-primary font-medium">{{ activeVideo.lesson_name }}</span>
                  <span class="text-muted-foreground">{{ getClassName(activeVideo.class_id) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Join Class Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showJoinModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showJoinModal = false"></div>
          <div class="bg-card border-border relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-xl">
            <h3 class="text-foreground mb-1 text-lg font-semibold">{{ $t('classroom.modal.title') }}</h3>
            <p class="text-muted-foreground mb-5 text-sm">{{ $t('classroom.modal.desc') }}</p>

            <input
              v-model="joinCode"
              type="text"
              :placeholder="$t('classroom.modal.placeholder')"
              maxlength="10"
              class="border-border bg-background text-foreground placeholder:text-muted-foreground mb-2 h-12 w-full rounded-xl border px-4 text-center font-mono text-lg font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30"
              @input="joinCode = joinCode.toUpperCase()"
              @keyup.enter="joinClass"
            />
            <p v-if="joinError" class="mb-3 text-center text-sm text-destructive">{{ joinError }}</p>

            <div class="flex gap-3 pt-2">
              <button
                class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 rounded-xl py-3 font-medium transition-colors"
                @click="showJoinModal = false"
              >{{ $t('classroom.modal.cancel') }}</button>
              <button
                class="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
                :disabled="joinCode.length < 4 || joining"
                @click="joinClass"
              >
                {{ joining ? $t('classroom.modal.joining') : $t('classroom.modal.join') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { BookOpen, Play, PlayCircle, Plus, X } from '@/components/icons'
import { formatDuration } from '@/types/video'
import { useToast } from '@/composables/useToast'
import { usePolling } from '@/composables/usePolling'
import { api } from '@/utils/api'
import type { Class } from '@/types/class'

interface VideoItem {
  id: number
  title: string
  description?: string
  class_id?: number
  duration?: number
  lesson_name?: string
  video_url: string
}

const toast = useToast()
const loading = ref(true)
const videosLoading = ref(false)
const joining = ref(false)
const classes = ref<Class[]>([])
const videos = ref<VideoItem[]>([])
const selectedClassId = ref<number | null>(null)
const activeVideo = ref<VideoItem | null>(null)
const showJoinModal = ref(false)
const joinCode = ref('')
const joinError = ref('')

const getClassName = (classId?: number) =>
  classes.value.find(c => c.id === classId)?.name || ''

const isYouTube = (url: string) =>
  url.includes('youtube.com') || url.includes('youtu.be')

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return match ? match[1] : ''
}

const getYouTubeEmbed = (url: string) =>
  `https://www.youtube.com/embed/${getYouTubeId(url)}?autoplay=1`

const getYouTubeThumbnail = (url: string) =>
  `https://img.youtube.com/vi/${getYouTubeId(url)}/mqdefault.jpg`

const loadVideos = async (classId?: number) => {
  videosLoading.value = true
  try {
    videos.value = (await api.getVideos(classId)) as VideoItem[]
  } catch {
    videos.value = []
  } finally {
    videosLoading.value = false
  }
}

const selectClass = (id: number | null) => {
  selectedClassId.value = id
}

watch(selectedClassId, (id) => loadVideos(id ?? undefined))

const joinClass = async () => {
  if (!joinCode.value.trim() || joining.value) return
  joining.value = true
  joinError.value = ''
  try {
    const joined = (await api.joinClass(joinCode.value.trim())) as Class
    classes.value.push(joined)
    showJoinModal.value = false
    joinCode.value = ''
    toast.success(`Joined "${joined.name}" successfully!`)
    selectClass(joined.id)
  } catch (err: any) {
    joinError.value = err?.errorMessage || 'Invalid code or class is full.'
  } finally {
    joining.value = false
  }
}

async function refresh() {
  try {
    classes.value = (await api.getClasses()) as Class[]
    await loadVideos(selectedClassId.value ?? undefined)
  } finally {
    loading.value = false
  }
}

// Live classroom: new classes/videos from teachers appear without reload.
// Skip while joining or watching a video so it doesn't disrupt the user.
usePolling(() => { if (!showJoinModal.value && !activeVideo.value) return refresh() }, 15000)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
