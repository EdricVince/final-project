<template>
  <Teleport to="body">
    <div v-if="isActive" class="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <div
        v-for="(piece, index) in confettiPieces"
        :key="index"
        class="absolute animate-confetti"
        :style="{
          left: `${piece.x}%`,
          top: '-20px',
          backgroundColor: piece.color,
          width: `${piece.size}px`,
          height: `${piece.size * 0.4}px`,
          borderRadius: piece.isCircle ? '50%' : '2px',
          transform: `rotate(${piece.rotation}deg)`,
          animationDelay: `${piece.delay}s`,
          animationDuration: `${piece.duration}s`,
        }"
      ></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Props {
  active: boolean
  particleCount?: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  particleCount: 150,
  duration: 3000,
})

const emit = defineEmits<{
  complete: []
}>()

const isActive = ref(false)

interface ConfettiPiece {
  x: number
  color: string
  size: number
  rotation: number
  delay: number
  duration: number
  isCircle: boolean
}

const confettiPieces = ref<ConfettiPiece[]>([])

const colors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
]

const generateConfetti = () => {
  confettiPieces.value = Array.from({ length: props.particleCount }, () => ({
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 10 + 5,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.5,
    duration: Math.random() * 2 + 2,
    isCircle: Math.random() > 0.5,
  }))
}

let timeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.active,
  (newVal) => {
    if (newVal) {
      generateConfetti()
      isActive.value = true

      timeout = setTimeout(() => {
        isActive.value = false
        confettiPieces.value = []
        emit('complete')
      }, props.duration)
    }
  }
)

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})
</script>

<style scoped>
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti-fall linear forwards;
}
</style>
