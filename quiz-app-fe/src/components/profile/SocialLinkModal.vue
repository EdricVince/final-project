<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div class="bg-card border-border w-full max-w-md rounded-2xl border p-6 shadow-xl">
          <h3 class="text-foreground mb-4 text-lg font-semibold">
            {{ isEditing ? $t('profile.socialModal.editTitle') : $t('profile.socialModal.addTitle') }}
          </h3>

          <div class="space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium">{{ $t('profile.socialModal.platform') }}</Label>
              <select
                :value="form.platform"
                class="border-input bg-background text-foreground w-full rounded-xl border px-4 py-3"
                @change="updateForm('platform', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">{{ $t('profile.socialModal.platform') }}</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium">{{ $t('profile.socialModal.url') }}</Label>
              <Input
                :model-value="form.url"
                :placeholder="$t('profile.socialModal.urlPlaceholder')"
                class="h-11 rounded-xl"
                @update:model-value="updateForm('url', String($event))"
              />
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <Button variant="outline" class="flex-1" @click="$emit('close')">
              {{ $t('profile.socialModal.cancel') }}
            </Button>
            <Button class="flex-1" @click="$emit('save')">
              {{ $t('profile.socialModal.save') }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import type { SocialLinkForm } from '@/types/profile'

const { t: $t } = useI18n()

interface Props {
  show: boolean
  form: SocialLinkForm
  isEditing: boolean
  platforms?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  platforms: () => ['GitHub', 'LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'YouTube', 'Website'],
})

const emit = defineEmits<{
  close: []
  save: []
  'update:form': [form: SocialLinkForm]
}>()

const updateForm = (key: keyof SocialLinkForm, value: string) => {
  emit('update:form', { ...props.form, [key]: value })
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
  transform: scale(0.95) translateY(10px);
}
</style>
