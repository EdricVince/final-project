<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="show"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-chart-2 px-4 py-3 text-white shadow-lg"
      >
        <Check class="h-5 w-5" />
        <span class="font-medium">{{ message }}</span>
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
  transform: translateY(20px);
}
</style>
