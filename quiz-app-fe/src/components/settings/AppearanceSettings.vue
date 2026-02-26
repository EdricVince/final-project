<template>
  <div class="space-y-6">
    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Palette class="text-primary h-5 w-5" />
        {{ $t('settings.appearance.theme.title') }}
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
        {{ $t('settings.appearance.fontSize.title') }}
      </h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-sm">{{ $t('settings.appearance.fontSize.label') }}</span>
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
          <span>{{ $t('settings.appearance.fontSize.smaller') }}</span>
          <span>{{ $t('settings.appearance.fontSize.default') }}</span>
          <span>{{ $t('settings.appearance.fontSize.larger') }}</span>
        </div>
      </div>
    </div>

    <!-- Language -->
    <div class="bg-card border-border rounded-2xl border p-6">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-foreground flex items-center gap-2 text-lg font-semibold">
            <Globe class="text-primary h-5 w-5" />
            {{ $t('settings.appearance.language.title') }}
          </h2>
          <p class="text-muted-foreground mt-1 text-sm">{{ $t('settings.appearance.language.subtitle') }}</p>
        </div>
        <button
          :disabled="pendingLocale === currentLocale"
          class="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
          @click="applyLocale"
        >
          {{ $t('common.apply') }}
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          v-for="lang in localeOptions"
          :key="lang.value"
          class="border-border group relative rounded-xl border p-4 transition-all"
          :class="
            pendingLocale === lang.value
              ? 'border-primary bg-primary/5'
              : 'hover:border-primary/50'
          "
          @click="pendingLocale = lang.value"
        >
          <div class="mb-2 flex justify-center text-2xl">{{ lang.flag }}</div>
          <p class="text-foreground text-center text-sm font-medium">{{ lang.label }}</p>
          <div
            v-if="pendingLocale === lang.value"
            class="bg-primary absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full"
          >
            <Check class="text-primary-foreground h-3 w-3" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Palette, Type, Check, Sun, Moon, Monitor, Globe } from 'lucide-vue-next'
import type { Theme } from '@/composables/useTheme'
import { useLocale, type SupportedLocale } from '@/composables/useLocale'

const { t } = useI18n()
const { locale, setLocale, localeOptions } = useLocale()
const currentLocale = computed(() => locale.value as SupportedLocale)
const pendingLocale = ref<SupportedLocale>(locale.value as SupportedLocale)

const applyLocale = () => {
  setLocale(pendingLocale.value)
}

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

const themes = computed((): { value: Theme; label: string; icon: typeof Sun }[] => [
  { value: 'light', label: t('settings.appearance.theme.light'), icon: Sun },
  { value: 'dark', label: t('settings.appearance.theme.dark'), icon: Moon },
  { value: 'system', label: t('settings.appearance.theme.system'), icon: Monitor },
])
</script>
