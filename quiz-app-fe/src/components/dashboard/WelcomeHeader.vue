<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
        Welcome back, {{ userName }}!
      </h1>
      <p class="text-muted-foreground mt-1 text-base">Ready to continue your learning journey?</p>
    </div>

    <!-- Level Badge -->
    <div class="bg-card border-border flex items-center gap-4 rounded-2xl border px-4 py-3">
      <div class="relative">
        <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
          <span class="text-primary text-lg font-bold">{{ level }}</span>
        </div>
        <div class="bg-primary absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
          <Star class="text-primary-foreground h-3 w-3" />
        </div>
      </div>
      <div>
        <p class="text-foreground text-sm font-semibold">Level {{ level }}</p>
        <p class="text-muted-foreground text-xs">{{ title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next'

defineProps<{
  userName: string
  level: number
  title: string
}>()
</script>
