<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <h3 class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
      <Zap class="text-primary h-5 w-5" />
      Quick Actions
    </h3>

    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="action in actions"
        :key="action.id"
        class="group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        :class="`bg-gradient-to-br ${action.color}`"
        @click="$emit('select', action)"
      >
        <div class="relative z-10">
          <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <component :is="action.icon" class="h-5 w-5 text-white" />
          </div>
          <p class="text-sm font-semibold text-white">{{ action.title }}</p>
          <p class="text-xs text-white/70">{{ action.description }}</p>
        </div>

        <!-- Decorative circles -->
        <div class="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-150"></div>
        <div class="absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-white/5"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Zap } from '@/components/icons'
import type { QuickAction } from '@/composables/useDashboard'

defineProps<{
  actions: QuickAction[]
}>()

defineEmits<{
  select: [action: QuickAction]
}>()
</script>
