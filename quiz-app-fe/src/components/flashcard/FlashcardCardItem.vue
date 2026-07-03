<template>
  <div
    class="card-item bg-card border-border group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg lg:gap-6 lg:p-5"
    :style="{ animationDelay: `${index * 30}ms` }"
    @click="$emit('edit', card)"
  >
    <!-- Card Image -->
    <div
      v-if="card.image"
      class="h-20 w-20 shrink-0 overflow-hidden rounded-xl lg:h-24 lg:w-24"
    >
      <img
        :src="card.image"
        :alt="card.term"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div
      v-else
      class="bg-secondary flex h-20 w-20 shrink-0 items-center justify-center rounded-xl lg:h-24 lg:w-24"
    >
      <CreditCard class="text-muted-foreground h-8 w-8" />
    </div>

    <!-- Card Content -->
    <div class="min-w-0 flex-1">
      <div class="mb-2 flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <h3 class="text-foreground mb-1 text-lg font-semibold lg:text-xl">{{ card.term }}</h3>
          <p class="text-muted-foreground line-clamp-2 text-base">{{ card.definition }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button
            class="rounded-lg p-2 transition-colors"
            :class="card.isFavorite ? 'text-primary' : 'text-muted-foreground hover:bg-secondary'"
            @click.stop="$emit('toggle-favorite', card)"
          >
            <Heart class="h-5 w-5" :fill="card.isFavorite ? 'currentColor' : 'none'" />
          </button>
          <button
            class="hover:bg-secondary text-muted-foreground rounded-lg p-2 transition-colors"
            @click.stop="$emit('open-menu', card.id, $event)"
          >
            <MoreVertical class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Card Stats -->
      <div class="flex items-center gap-3">
        <span
          class="rounded-lg px-2 py-1 text-xs font-medium"
          :class="statusColor"
        >
          {{ card.status }}
        </span>
        <span v-if="card.example" class="text-muted-foreground text-sm">
          Has example
        </span>
        <span v-if="card.audio" class="text-muted-foreground text-sm">
          Has audio
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CreditCard, Heart, MoreVertical } from '@/components/icons'
import type { FlashcardItem } from '@/types/flashcard'

interface Props {
  card: FlashcardItem
  index: number
}

const props = defineProps<Props>()

defineEmits<{
  edit: [card: FlashcardItem]
  'toggle-favorite': [card: FlashcardItem]
  'open-menu': [cardId: number, event: MouseEvent]
}>()

const statusColor = computed(() => {
  const colors: Record<string, string> = {
    New: 'bg-secondary text-muted-foreground',
    Learning: 'bg-primary/10 text-primary',
    Mastered: 'bg-primary/20 text-primary',
  }
  return colors[props.card.status] || 'bg-secondary text-muted-foreground'
})
</script>

<style scoped>
.card-item {
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
