<template>
  <div class="bg-card border-border group rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg lg:p-6">
    <div class="mb-3 flex items-center gap-3">
      <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl lg:h-14 lg:w-14">
        <component :is="icon" class="text-primary h-6 w-6 lg:h-7 lg:w-7" />
      </div>
    </div>
    <span class="text-foreground text-3xl font-bold lg:text-4xl">{{ value }}{{ suffix }}</span>
    <p class="text-muted-foreground mt-1 text-base">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  value: number | string
  label: string
  suffix?: string
}

withDefaults(defineProps<Props>(), {
  suffix: '',
})
</script>
