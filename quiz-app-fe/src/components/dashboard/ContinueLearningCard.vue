<template>
  <div class="bg-card border-border rounded-2xl border p-5 lg:p-6">
    <div class="mb-4 flex items-center justify-between lg:mb-5">
      <h2 class="text-foreground flex items-center gap-3 text-base font-semibold lg:text-lg">
        <PlayCircle class="text-primary h-5 w-5" />
        {{ $t('dashboard.continueLearning') }}
      </h2>
      <Button variant="ghost" size="sm" class="text-primary" @click="$emit('viewAll')">
        {{ $t('dashboard.viewAll') }}
        <ChevronRight class="ml-1 h-4 w-4" />
      </Button>
    </div>
    <div class="space-y-3 lg:space-y-4">
      <template v-if="isLoading">
        <div v-for="i in 3" :key="i" class="bg-secondary/50 rounded-xl p-4">
          <div class="flex items-center gap-4">
            <div class="skeleton h-12 w-12 rounded-xl"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-3/4 rounded"></div>
              <div class="skeleton h-2 w-1/2 rounded"></div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(course, index) in courses"
          :key="course.id"
          class="course-card bg-secondary/50 hover:bg-secondary group cursor-pointer rounded-xl p-4 transition-all duration-300"
          :style="{ animationDelay: `${index * 100}ms` }"
          @click="$emit('openCourse', course.id)"
        >
          <div class="flex items-center gap-4">
            <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105">
              <component :is="course.icon" class="text-primary h-6 w-6" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-foreground truncate font-medium">{{ course.title }}</h3>
              <div class="mt-2 flex items-center gap-3">
                <Progress :model-value="course.progress" class="h-1.5 flex-1" />
                <span class="text-muted-foreground text-xs font-medium">{{ course.progress }}%</span>
              </div>
            </div>
            <ChevronRight class="text-muted-foreground h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayCircle, ChevronRight } from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'
import Progress from '@/components/ui/progress/Progress.vue'
import type { DashboardCourse } from '@/types/dashboard'

interface Props {
  courses: DashboardCourse[]
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), { isLoading: false })

defineEmits<{
  viewAll: []
  openCourse: [id: number]
}>()
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, var(--muted) 25%, var(--secondary) 50%, var(--muted) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.course-card {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
