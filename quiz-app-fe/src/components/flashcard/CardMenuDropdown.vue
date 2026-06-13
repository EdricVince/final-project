<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-40"
      @click="close"
    ></div>
    <div
      v-if="modelValue"
      class="bg-card border-border fixed z-50 w-40 rounded-xl border py-2 shadow-lg"
      :style="position"
    >
      <button
        class="hover:bg-secondary text-foreground flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
        @click="handleDuplicate"
      >
        <Copy class="h-4 w-4" />
        Duplicate
      </button>
      <button
        class="hover:bg-destructive/10 text-destructive flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
        @click="handleDelete"
      >
        <Trash2 class="h-4 w-4" />
        Delete
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Copy, Trash2 } from '@/components/icons'

interface Props {
  modelValue: boolean
  position: { top: string; left: string }
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  duplicate: []
  delete: []
}>()

const close = () => {
  emit('update:modelValue', false)
}

const handleDuplicate = () => {
  emit('duplicate')
  close()
}

const handleDelete = () => {
  emit('delete')
  close()
}
</script>
