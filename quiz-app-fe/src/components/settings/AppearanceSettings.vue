<template>
  <div class="space-y-6">
    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Palette class="text-primary h-5 w-5" />
        Theme
      </h2>

      <div class="grid grid-cols-3 gap-4">
        <button
          v-for="theme in themes"
          :key="theme.value"
          class="border-border group relative rounded-xl border p-4 transition-all"
          :class="
            appearance.theme === theme.value
              ? 'border-primary bg-primary/5'
              : 'hover:border-primary/50'
          "
          @click="$emit('setTheme', theme.value)"
        >
          <div class="mb-3 flex justify-center">
            <component :is="theme.icon" class="h-8 w-8" :class="appearance.theme === theme.value ? 'text-primary' : 'text-muted-foreground'" />
          </div>
          <p class="text-foreground text-center text-sm font-medium">{{ theme.label }}</p>
          <div
            v-if="appearance.theme === theme.value"
            class="bg-primary absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full"
          >
            <Check class="text-primary-foreground h-3 w-3" />
          </div>
        </button>
      </div>
    </div>

    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Type class="text-primary h-5 w-5" />
        Font Size
      </h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-sm">Text Size</span>
          <span class="text-foreground font-medium">{{ appearance.fontSize }}%</span>
        </div>
        <input
          :value="appearance.fontSize"
          type="range"
          min="80"
          max="120"
          step="5"
          class="w-full accent-primary"
          @input="$emit('update:appearance', { ...appearance, fontSize: Number(($event.target as HTMLInputElement).value) })"
        />
        <div class="text-muted-foreground flex justify-between text-xs">
          <span>Smaller</span>
          <span>Default</span>
          <span>Larger</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Palette, Type, Check, Sun, Moon, Monitor } from 'lucide-vue-next'
import type { Theme } from '@/composables/useTheme'

export interface AppearanceData {
  theme: Theme
  fontSize: number
}

defineProps<{
  appearance: AppearanceData
}>()

defineEmits<{
  'update:appearance': [value: AppearanceData]
  setTheme: [value: Theme]
}>()

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]
</script>
