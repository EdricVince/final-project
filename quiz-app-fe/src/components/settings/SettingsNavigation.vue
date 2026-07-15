<template>
  <div class="bg-card border-border sticky top-6 rounded-2xl border p-4">
    <nav class="space-y-1">
      <button
        v-for="section in sections"
        :key="section.id"
        class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
        :class="
          activeSection === section.id
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        "
        @click="$emit('update:activeSection', section.id)"
      >
        <component :is="section.icon" class="h-5 w-5" />
        <span class="font-medium">{{ section.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

export interface SettingsSection {
  id: string
  label: string
  icon: Component
}

defineProps<{
  sections: SettingsSection[]
  activeSection: string
}>()

defineEmits<{
  'update:activeSection': [value: string]
}>()
</script>
