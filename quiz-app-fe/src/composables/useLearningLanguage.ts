import { ref, computed } from 'vue'

export type LearningLanguage = 'en' | 'zh' | 'vi'

export interface LearningLanguageOption {
  value: LearningLanguage
  label: string
  flag: string
  speechCode: string
  name: string
}

export const learningLanguageOptions: LearningLanguageOption[] = [
  { value: 'en', label: 'English',     flag: '🇺🇸', speechCode: 'en-US', name: 'American English' },
  { value: 'zh', label: '中文',        flag: '🇨🇳', speechCode: 'zh-CN', name: 'Chinese (Simplified)' },
  { value: 'vi', label: 'Tiếng Việt',  flag: '🇻🇳', speechCode: 'vi-VN', name: 'Vietnamese' },
]

const STORAGE_KEY = 'studyspark-learning-target'

const current = ref<LearningLanguage>(
  (localStorage.getItem(STORAGE_KEY) as LearningLanguage) ?? 'en'
)

export function useLearningLanguage() {
  const setLanguage = (lang: LearningLanguage) => {
    current.value = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }

  const currentOption = computed<LearningLanguageOption>(
    () => learningLanguageOptions.find(o => o.value === current.value)!
  )

  return { current, setLanguage, currentOption, learningLanguageOptions }
}
