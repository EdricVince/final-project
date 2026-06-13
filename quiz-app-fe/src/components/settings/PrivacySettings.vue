<template>
  <div class="space-y-6">
    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Shield class="text-primary h-5 w-5" />
        Privacy Options
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
        Data Management
      </h2>

      <div class="space-y-4">
        <div class="bg-secondary/50 flex items-center justify-between rounded-xl p-4">
          <div>
            <p class="text-foreground font-medium">Export Your Data</p>
            <p class="text-muted-foreground text-sm">Download all your learning data as JSON</p>
          </div>
          <button
            class="bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
            @click="$emit('export')"
          >
            <Download class="h-4 w-4" />
            Export
          </button>
        </div>

        <div class="bg-destructive/5 flex items-center justify-between rounded-xl p-4">
          <div>
            <p class="text-foreground font-medium">Delete Account</p>
            <p class="text-muted-foreground text-sm">Permanently delete your account and all data</p>
          </div>
          <button
            class="bg-destructive text-destructive-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
            @click="$emit('showDeleteModal')"
          >
            <Trash2 class="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Shield, Download, Trash2 } from '@/components/icons'

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

const privacyOptions = [
  { key: 'publicProfile', label: 'Public Profile', description: 'Allow others to see your profile' },
  { key: 'showStreak', label: 'Show Streak', description: 'Display your learning streak publicly' },
  { key: 'showAchievements', label: 'Show Achievements', description: 'Display your achievements publicly' },
  { key: 'analytics', label: 'Usage Analytics', description: 'Help improve StudySpark with anonymous data' },
]

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
