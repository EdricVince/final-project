<template>
  <div
    class="course-card bg-card group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    :style="{ animationDelay: `${index * 75}ms` }"
    @click="$emit('click', course.id)"
  >
    <!-- Course Thumbnail -->
    <div class="bg-secondary relative h-40 overflow-hidden lg:h-44">
      <div class="absolute inset-0 flex items-center justify-center">
        <component
          :is="icon"
          class="text-muted-foreground h-20 w-20 opacity-30 transition-transform duration-500 group-hover:scale-125"
        />
      </div>
      <!-- Category & Difficulty -->
      <div class="absolute left-4 top-4 flex items-center gap-2">
        <span class="bg-background/90 text-foreground rounded-lg px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
          {{ course.category }}
        </span>
      </div>
      <div class="absolute right-4 top-4">
        <span class="bg-background/90 text-muted-foreground rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm">
          {{ course.difficulty }}
        </span>
      </div>
      <!-- Progress Overlay for Completed -->
      <div
        v-if="course.progress === 100"
        class="bg-primary/90 absolute inset-0 flex items-center justify-center backdrop-blur-sm"
      >
        <div class="text-center">
          <CheckCircle class="text-primary-foreground mx-auto mb-2 h-12 w-12" />
          <span class="text-primary-foreground text-lg font-semibold">Completed!</span>
        </div>
      </div>
    </div>

    <!-- Course Info -->
    <div class="p-5 lg:p-6">
      <h3 class="text-foreground mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary lg:text-xl">
        {{ course.title }}
      </h3>
      <p class="text-muted-foreground mb-5 line-clamp-2 text-base">
        {{ course.description }}
      </p>

      <!-- Progress -->
      <div class="mb-5">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-muted-foreground text-base">{{ course.completedLessons }}/{{ course.totalLessons }} lessons</span>
          <span class="text-foreground text-base font-semibold">{{ course.progress }}%</span>
        </div>
        <div class="bg-secondary h-2.5 overflow-hidden rounded-full">
          <div
            class="progress-bar bg-primary h-full rounded-full transition-all duration-500"
            :style="{ width: `${course.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between">
        <div class="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock class="h-4 w-4" />
          <span>{{ course.lastAccessed }}</span>
        </div>
        <Button
          size="sm"
          :variant="course.progress === 100 ? 'outline' : 'default'"
          class="gap-2 px-4 py-2 text-sm"
        >
          {{ buttonText }}
          <ArrowRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { CheckCircle, Clock, ArrowRight } from 'lucide-vue-next'
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
.course-card {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-bar {
  animation: progressGrow 0.8s ease-out forwards;
}

@keyframes progressGrow {
  from {
    width: 0;
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
