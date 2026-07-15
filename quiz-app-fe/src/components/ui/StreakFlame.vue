<template>
  <div class="relative flex items-center justify-center" :class="wrapperClass">
    <!-- Glow ring (level 2+) -->
    <div v-if="level >= 2" class="absolute inset-0 rounded-xl opacity-30 blur-sm" :class="glowBgClass" />

    <!-- Ping pulse (level 2+) -->
    <div v-if="level >= 2" class="absolute inset-0 animate-ping rounded-xl opacity-10" :class="glowBgClass" />

    <!-- Sparks (level 3+) -->
    <template v-if="level >= 3">
      <span
        v-for="i in 5"
        :key="i"
        class="spark absolute block rounded-full"
        :class="[sparkColorClass, `spark-${i}`]"
      />
    </template>

    <!-- Flame icon -->
    <Flame :class="['relative z-10 transition-all duration-300', flameClass]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Flame } from '@/components/icons'

interface Props {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), { size: 'md' })

const level = computed(() => {
  if (props.streak >= 100) return 4
  if (props.streak >= 30) return 3
  if (props.streak >= 7) return 2
  if (props.streak >= 1) return 1
  return 0
})

const sizeMap = { sm: 'h-4 w-4', md: 'h-5 w-5 lg:h-6 lg:w-6', lg: 'h-7 w-7' }

const flameClass = computed(() => {
  const s = sizeMap[props.size]
  if (level.value === 0) return `${s} text-muted-foreground`
  if (level.value === 1) return `${s} text-orange-400 animate-flame-flicker`
  if (level.value === 2) return `${s} text-orange-500 animate-flame-medium drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]`
  if (level.value === 3) return `${s} text-red-500 animate-flame-intense drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]`
  return `${s} text-amber-400 animate-flame-epic drop-shadow-[0_0_14px_rgba(251,191,36,1)]`
})

const glowBgClass = computed(() => {
  if (level.value === 2) return 'bg-orange-500'
  if (level.value === 3) return 'bg-red-500'
  return 'bg-amber-400'
})

const sparkColorClass = computed(() => {
  if (level.value === 3) return 'bg-red-400'
  return 'bg-amber-300'
})

const wrapperClass = computed(() => {
  const base = 'h-11 w-11 lg:h-12 lg:w-12'
  if (level.value >= 4) return `${base} streak-epic`
  return base
})
</script>

<style scoped>
/* Level 1 — gentle flicker */
@keyframes flame-flicker {
  0%, 100% { transform: scale(1) rotate(-2deg); opacity: 0.9; }
  25% { transform: scale(1.08) rotate(2deg); opacity: 1; }
  50% { transform: scale(0.95) rotate(-1deg); opacity: 0.85; }
  75% { transform: scale(1.05) rotate(3deg); opacity: 1; }
}

/* Level 2 — medium pulse */
@keyframes flame-medium {
  0%, 100% { transform: scale(1) rotate(-3deg); }
  30% { transform: scale(1.15) rotate(3deg); }
  60% { transform: scale(0.92) rotate(-2deg); }
}

/* Level 3 — intense burn */
@keyframes flame-intense {
  0%, 100% { transform: scale(1) rotate(-4deg); filter: brightness(1); }
  20% { transform: scale(1.22) rotate(4deg); filter: brightness(1.3); }
  40% { transform: scale(0.9) rotate(-3deg); filter: brightness(0.9); }
  70% { transform: scale(1.18) rotate(2deg); filter: brightness(1.4); }
}

/* Level 4 — epic blaze */
@keyframes flame-epic {
  0%, 100% { transform: scale(1) rotate(-5deg); filter: brightness(1) hue-rotate(0deg); }
  15% { transform: scale(1.3) rotate(5deg); filter: brightness(1.5) hue-rotate(10deg); }
  35% { transform: scale(0.88) rotate(-4deg); filter: brightness(1.1) hue-rotate(-10deg); }
  55% { transform: scale(1.25) rotate(3deg); filter: brightness(1.6) hue-rotate(15deg); }
  75% { transform: scale(0.92) rotate(-2deg); filter: brightness(1.2) hue-rotate(-5deg); }
}

/* Sparks */
@keyframes spark-1 { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(-8px,-14px) scale(0); } }
@keyframes spark-2 { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(10px,-12px) scale(0); } }
@keyframes spark-3 { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(-4px,-18px) scale(0); } }
@keyframes spark-4 { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(6px,-16px) scale(0); } }
@keyframes spark-5 { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(-12px,-10px) scale(0); } }

.animate-flame-flicker { animation: flame-flicker 1.8s ease-in-out infinite; }
.animate-flame-medium  { animation: flame-medium 1.2s ease-in-out infinite; }
.animate-flame-intense { animation: flame-intense 0.9s ease-in-out infinite; }
.animate-flame-epic    { animation: flame-epic 0.7s ease-in-out infinite; }

.spark { width: 4px; height: 4px; top: 20%; left: 50%; }
.spark-1 { animation: spark-1 1.1s ease-out infinite 0s; }
.spark-2 { animation: spark-2 1.1s ease-out infinite 0.22s; }
.spark-3 { animation: spark-3 1.1s ease-out infinite 0.44s; }
.spark-4 { animation: spark-4 1.1s ease-out infinite 0.66s; }
.spark-5 { animation: spark-5 1.1s ease-out infinite 0.88s; }

/* Epic rainbow border glow */
.streak-epic {
  animation: epic-aura 2s linear infinite;
}
@keyframes epic-aura {
  0%, 100% { box-shadow: 0 0 12px 3px rgba(251,191,36,0.6); }
  50% { box-shadow: 0 0 20px 6px rgba(239,68,68,0.7); }
}
</style>
