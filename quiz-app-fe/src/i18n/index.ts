import { createI18n } from 'vue-i18n'
import en from './locales/en'
import vi from './locales/vi'
import zh from './locales/zh'

const savedLocale = localStorage.getItem('studyspark-locale') || 'en'

export default createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, vi, zh },
})
