<template>
  <div
    class="course-list-item bg-card group flex cursor-pointer gap-5 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg lg:gap-6 lg:p-6"
    :style="{ animationDelay: `${index * 50}ms` }"
    @click="$emit('click', course.id)"
  >
    <!-- Course Icon -->
    <div class="bg-secondary flex h-24 w-24 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 lg:h-28 lg:w-28">
      <component
        :is="icon"
        class="text-muted-foreground h-12 w-12 lg:h-14 lg:w-14"
      />
    </div>

    <!-- Course Info -->
    <div class="min-w-0 flex-1">
      <div class="mb-2 flex flex-wrap items-center gap-3">
        <span class="text-primary text-base font-medium">{{ course.category }}</span>
        <span class="text-muted-foreground">•</span>
        <span class="text-muted-foreground text-base">{{ course.difficulty }}</span>
        <span v-if="course.progress === 100" class="text-primary flex items-center gap-1 font-medium">
          <CheckCircle class="h-4 w-4" />
          Completed
        </span>
      </div>
      <h3 class="text-foreground mb-2 truncate text-lg font-semibold transition-colors group-hover:text-primary lg:text-xl">
        {{ course.title }}
      </h3>
      <p class="text-muted-foreground mb-4 line-clamp-1 text-base">
        {{ course.description }}
      </p>

      <!-- Progress Bar -->
      <div class="flex items-center gap-4">
        <div class="min-w-0 flex-1">
          <div class="bg-secondary h-2.5 overflow-hidden rounded-full">
            <div
              class="bg-primary h-full rounded-full transition-all duration-500"
              :style="{ width: `${course.progress}%` }"
            ></div>
          </div>
        </div>
        <span class="text-foreground text-base font-semibold">{{ course.progress }}%</span>
      </div>
    </div>

    <!-- Right Side -->
    <div class="hidden flex-col items-end justify-between sm:flex">
      <div class="text-muted-foreground flex items-center gap-2 text-sm">
        <Clock class="h-4 w-4" />
        <span>{{ course.lastAccessed }}</span>
      </div>
      <Button
        size="sm"
        :variant="course.progress === 100 ? 'outline' : 'default'"
        class="gap-2 px-4 py-2"
      >
        {{ buttonText }}
        <ArrowRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { CheckCircle, Clock, ArrowRight } from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'
import type { Course } from '@/types/course'

interface Props {
  course: Course
  index: number
  icon: Component
}

const props = defineProps<Props>()

defineEmits<{
  click: [id: number]
}>()

const buttonText = computed(() => {
  if (props.course.progress === 100) return 'Review'
  if (props.course.progress === 0) return 'Start'
  return 'Continue'
})
</script>

<style scoped>
.course-list-item {
  animation: slideInLeft 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
