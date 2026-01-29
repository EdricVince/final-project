<template>
  <div class="space-y-6">
    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Target class="text-primary h-5 w-5" />
        Daily Goals
      </h2>

      <div class="space-y-6">
        <div>
          <div class="mb-2 flex items-center justify-between">
            <span class="text-foreground font-medium">Cards per day</span>
            <span class="text-primary font-bold">{{ study.cardsPerDay }}</span>
          </div>
          <input
            :value="study.cardsPerDay"
            type="range"
            min="10"
            max="100"
            step="5"
            class="w-full accent-primary"
            @input="updateField('cardsPerDay', Number(($event.target as HTMLInputElement).value))"
          />
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between">
            <span class="text-foreground font-medium">Study minutes</span>
            <span class="text-primary font-bold">{{ study.studyMinutes }} min</span>
          </div>
          <input
            :value="study.studyMinutes"
            type="range"
            min="5"
            max="60"
            step="5"
            class="w-full accent-primary"
            @input="updateField('studyMinutes', Number(($event.target as HTMLInputElement).value))"
          />
        </div>
      </div>
    </div>

    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Languages class="text-primary h-5 w-5" />
        Language & Region
      </h2>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">App Language</label>
          <select
            :value="study.language"
            class="bg-secondary border-border text-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @change="updateField('language', ($event.target as HTMLSelectElement).value)"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
        </div>
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">Learning Language</label>
          <select
            :value="study.learningLanguage"
            class="bg-secondary border-border text-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @change="updateField('learningLanguage', ($event.target as HTMLSelectElement).value)"
          >
            <option value="en">English</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Target, Languages } from 'lucide-vue-next'

export interface StudyData {
  cardsPerDay: number
  studyMinutes: number
  language: string
  learningLanguage: string
}

const props = defineProps<{
  study: StudyData
}>()

const emit = defineEmits<{
  'update:study': [value: StudyData]
}>()

const updateField = (key: keyof StudyData, value: string | number) => {
  emit('update:study', {
    ...props.study,
    [key]: value,
  })
}
</script>
