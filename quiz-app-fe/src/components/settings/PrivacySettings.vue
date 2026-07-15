<template>
  <div class="space-y-6">
    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Shield class="text-primary h-5 w-5" />
        {{ $t('settings.privacy.privacyOptions') }}
      </h2>

      <div class="space-y-4">
        <div
          v-for="option in privacyOptions"
          :key="option.key"
          class="flex items-center justify-between rounded-xl p-4 transition-all hover:bg-secondary/50"
        >
          <div>
            <p class="text-foreground font-medium">{{ option.label }}</p>
            <p class="text-muted-foreground text-sm">{{ option.description }}</p>
          </div>
          <button
            class="relative h-6 w-11 rounded-full transition-colors"
            :class="privacy[option.key] ? 'bg-primary' : 'bg-secondary'"
            @click="togglePrivacy(option.key)"
          >
            <span
              class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
              :class="privacy[option.key] ? 'left-5.5' : 'left-0.5'"
            />
          </button>
        </div>
      </div>
    </div>

    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Download class="text-primary h-5 w-5" />
        {{ $t('settings.privacy.dataManagement') }}
      </h2>

      <div class="space-y-4">
        <div class="bg-secondary/50 flex items-center justify-between rounded-xl p-4">
          <div>
            <p class="text-foreground font-medium">{{ $t('settings.privacy.exportYourData') }}</p>
            <p class="text-muted-foreground text-sm">{{ $t('settings.privacy.exportDesc') }}</p>
          </div>
          <button
            class="bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
            @click="$emit('export')"
          >
            <Download class="h-4 w-4" />
            {{ $t('settings.privacy.exportBtn') }}
          </button>
        </div>

        <div class="bg-destructive/5 flex items-center justify-between rounded-xl p-4">
          <div>
            <p class="text-foreground font-medium">{{ $t('settings.privacy.deleteAccount') }}</p>
            <p class="text-muted-foreground text-sm">{{ $t('settings.privacy.deleteAccountDesc') }}</p>
          </div>
          <button
            class="bg-destructive text-destructive-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
            @click="$emit('showDeleteModal')"
          >
            <Trash2 class="h-4 w-4" />
            {{ $t('settings.privacy.deleteBtn') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Shield, Download, Trash2 } from '@/components/icons'

const { t } = useI18n()

export interface PrivacyData {
  publicProfile: boolean
  showStreak: boolean
  showAchievements: boolean
  analytics: boolean
  [key: string]: boolean
}

const props = defineProps<{
  privacy: PrivacyData
}>()

const emit = defineEmits<{
  'update:privacy': [value: PrivacyData]
  export: []
  showDeleteModal: []
}>()

const privacyOptions = computed(() => [
  { key: 'publicProfile', label: t('settings.privacy.publicProfile'), description: t('settings.privacy.publicProfileDesc') },
  { key: 'showStreak', label: t('settings.privacy.showStreak'), description: t('settings.privacy.showStreakDesc') },
  { key: 'showAchievements', label: t('settings.privacy.showAchievements'), description: t('settings.privacy.showAchievementsDesc') },
  { key: 'analytics', label: t('settings.privacy.analytics'), description: t('settings.privacy.analyticsDesc') },
])

const togglePrivacy = (key: string) => {
  emit('update:privacy', {
    ...props.privacy,
    [key]: !props.privacy[key],
  })
}
</script>

<style scoped>
.left-5\.5 {
  left: 1.375rem;
}
</style>
