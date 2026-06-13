<template>
  <div
    class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-bold tabular-nums transition-all duration-300"
    :class="timeLeft < 20
      ? 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse'
      : timeLeft < 60
        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
        : 'border-border text-foreground'"
  >
    <span>⏱</span>
    <span>{{ formatted }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ totalSeconds: number }>()
const emit = defineEmits<{ (e: 'timeout'): void }>()

const timeLeft = ref(props.totalSeconds)
let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) { clearInterval(interval); emit('timeout') }
  }, 1000)
})
onUnmounted(() => clearInterval(interval))

const formatted = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})
</script>
