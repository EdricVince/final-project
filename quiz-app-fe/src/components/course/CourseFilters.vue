<template>
  <div class="animate-fade-in-up delay-150 mb-6">
    <div class="bg-card flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
      <!-- Search -->
      <div class="relative flex-1 lg:max-w-md">
        <Search class="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
        <input
          :value="searchQuery"
          type="text"
          placeholder="Search courses..."
          class="bg-secondary text-foreground placeholder:text-muted-foreground focus:ring-primary/20 h-12 w-full rounded-xl pl-12 pr-4 text-base transition-colors focus:outline-none focus:ring-2"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-base font-medium transition-all duration-200"
          :class="activeFilter === tab.value
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
          @click="$emit('update:activeFilter', tab.value)"
        >
          <component :is="tab.icon" class="h-5 w-5" />
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            class="text-sm font-semibold"
          >
            ({{ tab.count }})
          </span>
        </button>
      </div>

      <!-- View Toggle -->
      <div class="flex items-center gap-1 rounded-xl bg-secondary p-1">
        <button
          class="rounded-lg p-2.5 transition-colors"
          :class="viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'"
          @click="$emit('update:viewMode', 'grid')"
        >
          <LayoutGrid class="h-5 w-5" />
        </button>
        <button
          class="rounded-lg p-2.5 transition-colors"
          :class="viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'"
          @click="$emit('update:viewMode', 'list')"
        >
          <List class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, LayoutGrid, List } from 'lucide-vue-next'
import type { FilterTab } from '@/types/course'

interface Props {
  searchQuery: string
  activeFilter: string
  viewMode: 'grid' | 'list'
  filterTabs: FilterTab[]
}

defineProps<Props>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:activeFilter': [value: string]
  'update:viewMode': [value: 'grid' | 'list']
}>()
</script>
