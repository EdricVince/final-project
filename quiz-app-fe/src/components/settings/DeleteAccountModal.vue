<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="$emit('close')"
      >
        <div class="bg-card border-border w-full max-w-md rounded-2xl border p-6 shadow-xl">
          <div class="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle class="text-destructive h-6 w-6" />
          </div>
          <h3 class="text-foreground mb-2 text-center text-lg font-semibold">
            {{ $t('settings.deleteModal.title') }}
          </h3>
          <p class="text-muted-foreground mb-6 text-center text-sm">
            {{ $t('settings.deleteModal.message') }}
          </p>

          <div class="mb-4">
            <label class="text-foreground mb-2 block text-sm font-medium">
              {{ $t('settings.deleteModal.typeToConfirm') }}
            </label>
            <input
              v-model="confirmText"
              type="text"
              :placeholder="$t('settings.deleteModal.confirmPlaceholder')"
              class="bg-secondary border-border text-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-destructive/50"
            />
          </div>

          <div class="flex gap-3">
            <button
              class="bg-secondary text-foreground flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-secondary/80"
              @click="$emit('close')"
            >
              {{ $t('settings.deleteModal.cancel') }}
            </button>
            <button
              class="bg-destructive text-destructive-foreground flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
              :disabled="confirmText !== 'DELETE'"
              @click="handleDelete"
            >
              {{ $t('settings.deleteModal.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle } from '@/components/icons'

const { t } = useI18n()

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const confirmText = ref('')

watch(() => props.show, (newVal) => {
  if (!newVal) {
    confirmText.value = ''
  }
})

const handleDelete = () => {
  if (confirmText.value === 'DELETE') {
    emit('confirm')
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

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
