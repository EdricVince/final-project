<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-foreground flex items-center gap-2 text-lg font-semibold">
        <FileText class="text-primary h-5 w-5" />
        {{ $t('profile.bio.title') }}
      </h3>
      <span class="text-muted-foreground text-sm">
        {{ currentBioLength }}/{{ maxLength }}
      </span>
    </div>

    <div v-if="!isEditing" class="bg-secondary/50 min-h-25 rounded-xl p-4">
      <p v-if="bio" class="text-foreground whitespace-pre-wrap">{{ bio }}</p>
      <p v-else class="text-muted-foreground italic">{{ $t('profile.bio.noBio') }}</p>
    </div>
    <textarea
      v-else
      :value="editBio"
      :maxlength="maxLength"
      :placeholder="$t('profile.bio.placeholder')"
      class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 min-h-30 w-full resize-none rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2"
      @input="$emit('update:editBio', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileText } from '@/components/icons'

const { t: $t } = useI18n()

interface Props {
  bio: string
  editBio: string
  isEditing: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 300,
})

defineEmits<{
  'update:editBio': [value: string]
}>()

const currentBioLength = computed(() => {
  return (props.isEditing ? props.editBio : props.bio)?.length || 0
})
</script>
