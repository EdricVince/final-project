<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <div class="bg-foreground/50 absolute inset-0" />
        <div class="bg-card border-border relative w-full max-w-md rounded-2xl border p-6 shadow-xl">
          <button
            class="text-muted-foreground hover:text-foreground absolute right-4 top-4"
            @click="$emit('close')"
          >
            <X class="h-5 w-5" />
          </button>

          <h3 class="text-foreground mb-4 text-lg font-semibold">Add Custom Goal</h3>

          <div class="space-y-4">
            <div>
              <label class="text-foreground mb-1.5 block text-sm font-medium">Goal Title</label>
              <input
                v-model="localTitle"
                type="text"
                placeholder="e.g., Review Chapter 5"
                class="bg-secondary text-foreground placeholder:text-muted-foreground w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="text-foreground mb-1.5 block text-sm font-medium">Description (optional)</label>
              <input
                v-model="localDescription"
                type="text"
                placeholder="e.g., Focus on irregular verbs"
                class="bg-secondary text-foreground placeholder:text-muted-foreground w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              class="bg-secondary text-foreground flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/80"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              class="bg-primary text-primary-foreground flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
              :disabled="!localTitle"
              @click="handleAdd"
            >
              Add Goal
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from '@/components/icons'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  add: [{ title: string; description: string }]
}>()

const localTitle = ref('')
const localDescription = ref('')

watch(() => props.show, (newVal) => {
  if (!newVal) {
    localTitle.value = ''
    localDescription.value = ''
  }
})

const handleAdd = () => {
  if (!localTitle.value) return
  emit('add', {
    title: localTitle.value,
    description: localDescription.value,
  })
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
