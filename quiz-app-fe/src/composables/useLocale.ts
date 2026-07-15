import { useI18n } from 'vue-i18n'

export type SupportedLocale = 'en' | 'vi' | 'zh'

export const localeOptions: { value: SupportedLocale; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
]

export function useLocale() {
  const { locale } = useI18n({ useScope: 'global' })

  const setLocale = (lang: SupportedLocale) => {
    locale.value = lang
    localStorage.setItem('studyspark-locale', lang)
  }

  return { locale, setLocale, localeOptions }
}


