<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-foreground flex items-center gap-2 font-semibold">
        <Link2 class="text-primary h-5 w-5" />
        Social Links
      </h3>
      <Button variant="ghost" size="sm" @click="$emit('add')">
        <Plus class="mr-1 h-4 w-4" />
        Add
      </Button>
    </div>

    <div class="space-y-3">
      <div
        v-for="(link, index) in socialLinks"
        :key="index"
        class="social-link-item bg-secondary/50 group flex items-center gap-3 rounded-xl p-3"
      >
        <div class="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
          <component :is="getSocialIcon(link.platform)" class="text-primary h-4 w-4" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-foreground text-sm font-medium">{{ link.platform }}</p>
          <p class="text-muted-foreground truncate text-xs">{{ link.url }}</p>
        </div>
        <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            class="hover:bg-secondary rounded-lg p-1.5 transition-colors"
            @click="$emit('edit', index)"
          >
            <Pencil class="text-muted-foreground h-3.5 w-3.5" />
          </button>
          <button
            class="hover:bg-destructive/10 rounded-lg p-1.5 transition-colors"
            @click="$emit('remove', index)"
          >
            <Trash2 class="text-destructive h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        v-if="socialLinks.length === 0"
        class="text-muted-foreground py-4 text-center text-sm"
      >
        No social links added yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import {
  Link2,
  Plus,
  Pencil,
  Trash2,
  Code2,
  Briefcase,
  MessageSquare,
  Globe,
  Image,
  Users,
  Play,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import type { SocialLink } from '@/types/profile'

interface Props {
  socialLinks: SocialLink[]
}

defineProps<Props>()

defineEmits<{
  add: []
  edit: [index: number]
  remove: [index: number]
}>()

const getSocialIcon = (platform: string): Component => {
  const icons: Record<string, Component> = {
    GitHub: Code2,
    LinkedIn: Briefcase,
    Twitter: MessageSquare,
    Instagram: Image,
    Facebook: Users,
    YouTube: Play,
    Website: Globe,
  }
  return icons[platform] || Globe
}
</script>

<style scoped>
.social-link-item {
  transition: all 0.2s ease;
}

.social-link-item:hover {
  background: var(--secondary);
}
</style>
