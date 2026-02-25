<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">Videos</h1>
        <p class="text-muted-foreground mt-2">Upload and manage teaching videos</p>
      </div>
      <Button @click="showUploadModal = true">
        <Upload class="mr-2 h-4 w-4" />
        Upload Video
      </Button>
    </div>

    <!-- Filter by Class -->
    <div class="animate-fade-in-up delay-100 mb-6">
      <select
        v-model="selectedClass"
        class="bg-secondary text-foreground h-10 rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">All Classes</option>
        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
      </select>
    </div>

    <!-- Videos Grid -->
    <div class="animate-fade-in-up delay-150 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="video in filteredVideos"
        :key="video.id"
        class="bg-card border-border group overflow-hidden rounded-2xl border transition-all hover:shadow-lg"
      >
        <!-- Thumbnail -->
        <div class="bg-secondary relative aspect-video">
          <div class="flex h-full items-center justify-center">
            <Play class="text-muted-foreground h-12 w-12" />
          </div>
          <div class="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {{ formatDuration(video.duration) }}
          </div>
        </div>

        <!-- Info -->
        <div class="p-4">
          <h3 class="text-foreground mb-1 font-semibold">{{ video.title }}</h3>
          <p class="text-muted-foreground mb-2 text-sm line-clamp-2">{{ video.description }}</p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-primary">{{ video.lesson_name }}</span>
            <span class="text-muted-foreground">{{ getClassName(video.class_id) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="border-border flex border-t">
          <button class="text-muted-foreground hover:text-foreground hover:bg-accent flex-1 py-3 transition-colors">
            <Pencil class="mx-auto h-4 w-4" />
          </button>
          <button class="text-muted-foreground hover:text-destructive hover:bg-accent flex-1 py-3 transition-colors" @click="deleteVideo(video.id)">
            <Trash2 class="mx-auto h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredVideos.length === 0"
        class="bg-card border-border col-span-full flex flex-col items-center justify-center rounded-2xl border p-12"
      >
        <div class="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Video class="text-muted-foreground h-8 w-8" />
        </div>
        <h3 class="text-foreground mb-2 font-medium">No videos yet</h3>
        <p class="text-muted-foreground mb-4 text-sm">Upload your first teaching video</p>
        <Button @click="showUploadModal = true">
          <Upload class="mr-2 h-4 w-4" />
          Upload Video
        </Button>
      </div>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showUploadModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showUploadModal = false"></div>
          <div class="bg-card border-border relative w-full max-w-lg rounded-2xl border p-6 shadow-xl">
            <h2 class="text-foreground mb-6 text-xl font-semibold">Upload Video</h2>

            <form @submit.prevent="uploadVideo" class="space-y-5">
              <div>
                <label class="text-foreground mb-2 block text-sm font-medium">Title *</label>
                <input
                  v-model="uploadForm.title"
                  type="text"
                  placeholder="Video title"
                  required
                  class="bg-secondary text-foreground placeholder:text-muted-foreground h-12 w-full rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="text-foreground mb-2 block text-sm font-medium">Description</label>
                <textarea
                  v-model="uploadForm.description"
                  rows="3"
                  placeholder="Video description"
                  class="bg-secondary text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border-0 p-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <div>
                <label class="text-foreground mb-2 block text-sm font-medium">Class *</label>
                <select
                  v-model="uploadForm.class_id"
                  required
                  class="bg-secondary text-foreground h-12 w-full rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a class</option>
                  <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                </select>
              </div>

              <div>
                <label class="text-foreground mb-2 block text-sm font-medium">Video URL *</label>
                <input
                  v-model="uploadForm.video_url"
                  type="url"
                  placeholder="https://..."
                  required
                  class="bg-secondary text-foreground placeholder:text-muted-foreground h-12 w-full rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p class="text-muted-foreground mt-1 text-xs">YouTube, Vimeo, or direct video URL</p>
              </div>

              <div>
                <label class="text-foreground mb-2 block text-sm font-medium">Lesson Name</label>
                <input
                  v-model="uploadForm.lesson_name"
                  type="text"
                  placeholder="e.g., Lesson 1"
                  class="bg-secondary text-foreground placeholder:text-muted-foreground h-12 w-full rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div class="flex gap-3 pt-2">
                <Button type="button" variant="outline" class="flex-1" @click="showUploadModal = false">
                  Cancel
                </Button>
                <Button type="submit" class="flex-1">Upload</Button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Play, Video, Pencil, Trash2 } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { useToast } from '@/composables/useToast'
import { formatDuration } from '@/types/video'

const toast = useToast()

const selectedClass = ref('')
const showUploadModal = ref(false)

const uploadForm = ref({
  title: '',
  description: '',
  class_id: '',
  video_url: '',
  lesson_name: '',
})

// Mock classes
const classes = ref([
  { id: 1, name: 'Business English 101' },
  { id: 2, name: 'IELTS Preparation' },
  { id: 3, name: 'Conversation Practice' },
])

// Mock videos
const videos = ref([
  { id: 1, title: 'Introduction to Business English', description: 'Overview of the course', class_id: 1, duration: 1200, lesson_name: 'Lesson 1' },
  { id: 2, title: 'Business Email Writing', description: 'How to write professional emails', class_id: 1, duration: 900, lesson_name: 'Lesson 2' },
  { id: 3, title: 'IELTS Speaking Part 1', description: 'Tips and practice', class_id: 2, duration: 1500, lesson_name: 'Lesson 1' },
])

const filteredVideos = computed(() => {
  if (!selectedClass.value) return videos.value
  return videos.value.filter(v => v.class_id === Number(selectedClass.value))
})

const getClassName = (classId: number) => {
  return classes.value.find(c => c.id === classId)?.name || ''
}

const uploadVideo = () => {
  const newVideo = {
    id: Date.now(),
    title: uploadForm.value.title,
    description: uploadForm.value.description,
    class_id: Number(uploadForm.value.class_id),
    video_url: uploadForm.value.video_url,
    duration: 0,
    lesson_name: uploadForm.value.lesson_name,
  }
  videos.value.unshift(newVideo)
  toast.success('Video uploaded successfully!')
  showUploadModal.value = false
  uploadForm.value = { title: '', description: '', class_id: '', video_url: '', lesson_name: '' }
}

const deleteVideo = (id: number) => {
  videos.value = videos.value.filter(v => v.id !== id)
  toast.success('Video deleted')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
