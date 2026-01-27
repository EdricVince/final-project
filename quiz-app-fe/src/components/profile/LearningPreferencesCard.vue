<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <h3 class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
      <Settings class="text-primary h-5 w-5" />
      Learning Preferences
    </h3>

    <div class="grid gap-4 sm:grid-cols-2">
      <!-- Daily Goal -->
      <div class="bg-secondary/50 rounded-xl p-4">
        <div class="mb-3 flex items-center justify-between">
          <Label class="text-foreground text-sm font-medium">Daily Goal</Label>
          <Badge variant="secondary">{{ preferences.dailyGoal }} cards/day</Badge>
        </div>
        <input
          type="range"
          :value="preferences.dailyGoal"
          min="5"
          max="50"
          step="5"
          class="w-full accent-primary"
          @input="updatePreference('dailyGoal', Number(($event.target as HTMLInputElement).value))"
        />
        <div class="text-muted-foreground mt-1 flex justify-between text-xs">
          <span>5</span>
          <span>50</span>
        </div>
      </div>

      <!-- Study Reminder -->
      <div class="bg-secondary/50 rounded-xl p-4">
        <div class="mb-3 flex items-center justify-between">
          <Label class="text-foreground text-sm font-medium">Study Reminder</Label>
          <div
            class="relative h-6 w-11 cursor-pointer rounded-full transition-colors"
            :class="preferences.reminder ? 'bg-primary' : 'bg-secondary'"
            @click="updatePreference('reminder', !preferences.reminder)"
          >
            <div
              class="bg-primary-foreground absolute top-0.5 h-5 w-5 rounded-full shadow transition-transform"
              :class="preferences.reminder ? 'left-5.5' : 'left-0.5'"
            ></div>
          </div>
        </div>
        <p class="text-muted-foreground text-sm">
          {{ preferences.reminder ? 'Reminders enabled at ' + preferences.reminderTime : 'No reminders' }}
        </p>
      </div>

      <!-- Preferred Language -->
      <div class="bg-secondary/50 rounded-xl p-4">
        <Label class="text-foreground mb-2 block text-sm font-medium">Interface Language</Label>
        <select
          :value="preferences.language"
          class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm"
          @change="updatePreference('language', ($event.target as HTMLSelectElement).value)"
        >
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      <!-- Theme -->
      <div class="bg-secondary/50 rounded-xl p-4">
        <Label class="text-foreground mb-2 block text-sm font-medium">Theme</Label>
        <div class="flex gap-2">
          <button
            v-for="theme in themes"
            :key="theme.value"
            class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            :class="preferences.theme === theme.value ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-secondary'"
            @click="updatePreference('theme', theme.value)"
          >
            <component :is="theme.icon" class="h-4 w-4" />
            {{ theme.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings, Sun, Moon, Monitor } from 'lucide-vue-next'
import Label from '@/components/ui/label/Label.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import type { LearningPreferences, ThemeOption } from '@/types/profile'

interface Props {
  preferences: LearningPreferences
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:preferences': [preferences: LearningPreferences]
}>()

const themes: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Auto', icon: Monitor },
]

const updatePreference = <K extends keyof LearningPreferences>(key: K, value: LearningPreferences[K]) => {
  emit('update:preferences', { ...props.preferences, [key]: value })
}
</script>

<style scoped>
input[type='range'] {
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--secondary);
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: 2px solid var(--background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: 2px solid var(--background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
