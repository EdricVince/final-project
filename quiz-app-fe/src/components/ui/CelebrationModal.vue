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

        <!-- Modal Content -->
        <div class="animate-bounce-in relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-primary/20 to-background p-1">
          <div class="bg-card rounded-[22px] p-8 text-center">
            <!-- Icon with glow -->
            <div class="relative mx-auto mb-6 h-24 w-24">
              <div class="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-xl"></div>
              <div class="bg-primary text-primary-foreground relative flex h-full w-full items-center justify-center rounded-full">
                <component :is="icon" class="h-12 w-12" />
              </div>
            </div>

            <!-- Title -->
            <h2 class="text-foreground mb-2 text-2xl font-bold">{{ title }}</h2>

            <!-- Subtitle -->
            <p class="text-muted-foreground mb-6">{{ subtitle }}</p>

            <!-- Stats/Rewards -->
            <div v-if="rewards.length > 0" class="mb-6 flex justify-center gap-6">
              <div
                v-for="reward in rewards"
                :key="reward.label"
                class="text-center"
              >
                <div class="text-primary text-2xl font-bold">{{ reward.value }}</div>
                <div class="text-muted-foreground text-sm">{{ reward.label }}</div>
              </div>
            </div>

            <!-- Achievement Badge (optional) -->
            <div
              v-if="badge"
              class="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            >
              <Trophy class="h-5 w-5" />
              <span class="font-medium">{{ badge }}</span>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <Button
                v-if="secondaryAction"
                variant="outline"
                class="flex-1"
                @click="handleSecondary"
              >
                {{ secondaryAction }}
              </Button>
              <Button class="flex-1" @click="handlePrimary">
                {{ primaryAction }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Confetti -->
  <Confetti :active="showConfetti" @complete="showConfetti = false" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Trophy, Star, Zap, Award, Medal, Crown } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Confetti from '@/components/ui/Confetti.vue'

interface Reward {
  value: string | number
  label: string
}

interface Props {
  show: boolean
  type?: 'success' | 'achievement' | 'levelup' | 'streak'
  title: string
  subtitle: string
  rewards?: Reward[]
  badge?: string
  primaryAction?: string
  secondaryAction?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  rewards: () => [],
  primaryAction: 'Continue',
})

const emit = defineEmits<{
  close: []
  primary: []
  secondary: []
}>()

const showConfetti = ref(false)

const iconMap = {
  success: Star,
  achievement: Trophy,
  levelup: Crown,
  streak: Zap,
}

const icon = iconMap[props.type] || Star

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

const handlePrimary = () => {
  emit('primary')
  close()
}

const handleSecondary = () => {
  emit('secondary')
  close()
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
</style>
