<template>
  <Transition name="mascot">
    <div
      v-if="visible"
      class="fixed bottom-6 right-6 z-50 flex items-end gap-3"
      @click="dismiss"
    >
      <!-- Speech bubble -->
      <Transition name="bubble">
        <div
          v-if="showBubble"
          class="bg-card border-border relative mb-4 max-w-[200px] rounded-2xl border p-3 shadow-xl"
        >
          <p class="text-foreground text-sm font-medium leading-snug">{{ greeting }}</p>
          <p class="text-muted-foreground mt-1 text-xs">{{ subtext }}</p>
          <!-- Bubble tail -->
          <div class="border-card absolute -bottom-2 right-6 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent" />
        </div>
      </Transition>

      <!-- Mascot avatar -->
      <div
        class="bg-card border-primary/30 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-110 active:scale-95"
        :class="{ 'animate-mascot-bounce': isBouncing }"
      >
        <span class="text-3xl select-none">🐻</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useProgressStore } from '@/stores/progress.store'

const STORAGE_KEY = 'mascot-session-shown'

const authStore = useAuthStore()
const progressStore = useProgressStore()

const visible = ref(false)
const showBubble = ref(false)
const isBouncing = ref(false)

const userName = computed(() => {
  const name = authStore.user?.name || authStore.user?.email?.split('@')[0] || 'there'
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  const streak = progressStore.streakCount
  if (streak >= 30) return `🔥 ${streak} days! You're on FIRE, ${userName.value}!`
  if (streak >= 7)  return `⚡ ${streak}-day streak! Keep it up, ${userName.value}!`
  if (hour < 12)    return `Good morning, ${userName.value}! ☀️`
  if (hour < 18)    return `Hey ${userName.value}! Ready to learn? 📚`
  return `Good evening, ${userName.value}! 🌙`
})

const subtext = computed(() => {
  const streak = progressStore.streakCount
  if (streak >= 30) return 'Legendary dedication!'
  if (streak >= 7)  return 'Your streak is impressive!'
  return 'Tap to dismiss'
})

const dismiss = () => {
  showBubble.value = false
  setTimeout(() => { visible.value = false }, 300)
}

onMounted(() => {
  if (sessionStorage.getItem(STORAGE_KEY)) return
  sessionStorage.setItem(STORAGE_KEY, '1')

  setTimeout(() => {
    visible.value = true
    isBouncing.value = true
    setTimeout(() => {
      showBubble.value = true
      isBouncing.value = false
    }, 400)
    setTimeout(() => { dismiss() }, 6000)
  }, 1200)
})
</script>

<style scoped>
@keyframes mascot-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-16px) scale(1.1); }
  60% { transform: translateY(-6px) scale(1.05); }
}
.animate-mascot-bounce { animation: mascot-bounce 0.6s ease-out; }

.mascot-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.mascot-leave-active { transition: all 0.3s ease-in; }
.mascot-enter-from   { opacity: 0; transform: translateY(40px) scale(0.8); }
.mascot-leave-to     { opacity: 0; transform: translateY(20px) scale(0.9); }

.bubble-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bubble-leave-active { transition: all 0.2s ease-in; }
.bubble-enter-from   { opacity: 0; transform: scale(0.7) translateY(10px); }
.bubble-leave-to     { opacity: 0; transform: scale(0.9); }
</style>
