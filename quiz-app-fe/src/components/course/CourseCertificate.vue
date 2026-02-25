<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="close"
        ></div>

        <!-- Certificate -->
        <div class="animate-bounce-in relative w-full max-w-2xl">
          <!-- Certificate Card -->
          <div
            ref="certificateRef"
            class="bg-card border-border relative overflow-hidden rounded-2xl border-2 p-8 shadow-2xl"
          >
            <!-- Decorative Border -->
            <div class="border-primary/20 absolute inset-4 rounded-xl border-2"></div>

            <!-- Corner Decorations -->
            <div class="absolute left-6 top-6 h-12 w-12">
              <Award class="text-primary/30 h-full w-full" />
            </div>
            <div class="absolute right-6 top-6 h-12 w-12">
              <Award class="text-primary/30 h-full w-full" />
            </div>
            <div class="absolute bottom-6 left-6 h-12 w-12">
              <Award class="text-primary/30 h-full w-full" />
            </div>
            <div class="absolute bottom-6 right-6 h-12 w-12">
              <Award class="text-primary/30 h-full w-full" />
            </div>

            <!-- Content -->
            <div class="relative z-10 py-8 text-center">
              <!-- Header -->
              <div class="mb-6">
                <GraduationCap class="text-primary mx-auto mb-3 h-16 w-16" />
                <h2 class="text-muted-foreground text-sm font-medium uppercase tracking-widest">
                  Certificate of Completion
                </h2>
              </div>

              <!-- Main Title -->
              <div class="mb-8">
                <p class="text-muted-foreground mb-2 text-lg">This certifies that</p>
                <h3 class="text-foreground mb-4 text-3xl font-bold">{{ userName }}</h3>
                <p class="text-muted-foreground text-lg">has successfully completed</p>
              </div>

              <!-- Course Name -->
              <div class="bg-primary/5 mx-auto mb-8 max-w-md rounded-xl p-6">
                <h4 class="text-primary text-2xl font-bold">{{ courseName }}</h4>
                <p class="text-muted-foreground mt-2">{{ courseCategory }}</p>
              </div>

              <!-- Stats -->
              <div class="mb-8 flex justify-center gap-8">
                <div class="text-center">
                  <div class="text-primary text-2xl font-bold">{{ totalLessons }}</div>
                  <div class="text-muted-foreground text-sm">Lessons</div>
                </div>
                <div class="text-center">
                  <div class="text-primary text-2xl font-bold">{{ totalHours }}h</div>
                  <div class="text-muted-foreground text-sm">Duration</div>
                </div>
                <div class="text-center">
                  <div class="text-primary text-2xl font-bold">{{ score }}%</div>
                  <div class="text-muted-foreground text-sm">Score</div>
                </div>
              </div>

              <!-- Date & Signature -->
              <div class="flex items-end justify-between px-8">
                <div class="text-left">
                  <div class="border-foreground/20 mb-1 w-40 border-b pb-2">
                    <span class="text-foreground font-medium">{{ completionDate }}</span>
                  </div>
                  <p class="text-muted-foreground text-xs">Date of Completion</p>
                </div>
                <div class="text-center">
                  <div class="bg-primary/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                    <Sparkles class="text-primary h-8 w-8" />
                  </div>
                  <p class="text-muted-foreground text-xs">StudySpark</p>
                </div>
                <div class="text-right">
                  <div class="border-foreground/20 mb-1 w-40 border-b pb-2">
                    <span class="font-script text-foreground text-lg">StudySpark Team</span>
                  </div>
                  <p class="text-muted-foreground text-xs">Instructor</p>
                </div>
              </div>

              <!-- Certificate ID -->
              <div class="mt-6">
                <p class="text-muted-foreground text-xs">
                  Certificate ID: {{ certificateId }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-center gap-3">
            <Button variant="outline" @click="downloadCertificate">
              <Download class="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" @click="shareCertificate">
              <Share2 class="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button @click="close">
              Continue Learning
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Confetti -->
  <Confetti :active="showConfetti" @complete="showConfetti = false" />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { GraduationCap, Award, Sparkles, Download, Share2 } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Confetti from '@/components/ui/Confetti.vue'
import { useToast } from '@/composables/useToast'

interface Props {
  show: boolean
  userName: string
  courseName: string
  courseCategory?: string
  totalLessons: number
  totalHours: number
  score?: number
  completionDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  courseCategory: 'Course',
  score: 100,
  completionDate: () => new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
})

const emit = defineEmits<{
  close: []
}>()

const toast = useToast()
const certificateRef = ref<HTMLElement | null>(null)
const showConfetti = ref(false)

const certificateId = computed(() => {
  const hash = btoa(`${props.userName}-${props.courseName}-${Date.now()}`)
  return `CERT-${hash.slice(0, 8).toUpperCase()}`
})

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      showConfetti.value = true
    }
  }
)

const close = () => {
  emit('close')
}

const downloadCertificate = () => {
  // In a real app, this would generate a PDF
  toast.success('Certificate downloaded!')
}

const shareCertificate = () => {
  // In a real app, this would open share dialog
  if (navigator.share) {
    navigator.share({
      title: 'My Certificate',
      text: `I just completed ${props.courseName} on StudySpark!`,
      url: window.location.href,
    })
  } else {
    navigator.clipboard.writeText(
      `I just completed ${props.courseName} on StudySpark! Certificate ID: ${certificateId.value}`
    )
    toast.success('Link copied to clipboard!')
  }
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

.modal-enter-from .animate-bounce-in,
.modal-leave-to .animate-bounce-in {
  transform: scale(0.9);
}

@keyframes bounce-in {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.4s ease-out;
}

.font-script {
  font-family: 'Georgia', serif;
  font-style: italic;
}
</style>
