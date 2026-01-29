<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="show"
        class="bg-foreground text-background fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-3 shadow-lg"
      >
        <div class="flex items-center gap-2">
          <Check class="h-4 w-4" />
          <span class="text-sm">{{ message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

defineProps<{
  show: boolean
  message: string
}>()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
