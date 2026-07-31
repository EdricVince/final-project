import { describe, it, expect, beforeEach } from 'vitest'
import { useLearningLanguage, learningLanguageOptions } from './useLearningLanguage'

describe('useLearningLanguage', () => {
  beforeEach(() => localStorage.clear())

  it('exposes the three supported target languages', () => {
    expect(learningLanguageOptions.map(o => o.value).sort()).toEqual(['en', 'vi', 'zh'])
  })

  it('setLanguage updates the current language and persists it', () => {
    const { current, setLanguage } = useLearningLanguage()
    setLanguage('zh')
    expect(current.value).toBe('zh')
    expect(localStorage.getItem('studyspark-learning-target')).toBe('zh')
  })

  it('currentOption reflects the active language with its flag and name', () => {
    const { setLanguage, currentOption } = useLearningLanguage()
    setLanguage('vi')
    expect(currentOption.value.value).toBe('vi')
    expect(currentOption.value.label).toBe('Tiếng Việt')
    expect(currentOption.value.speechCode).toBe('vi-VN')
  })
})
