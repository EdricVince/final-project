import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// The learner's UI language (meaning side) — mocked so the composable is
// deterministic without a mounted i18n instance.
vi.mock('@/composables/useLocale', () => ({
  useLocale: () => ({ locale: { value: 'vi' } }),
}))

import { useVocabulary } from './useVocabulary'
import { useLearningLanguage } from './useLearningLanguage'

describe('useVocabulary', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    useLearningLanguage().setLanguage('en') // study English terms
  })

  it('generateMCQuestions builds N questions whose options include the correct answer', () => {
    const { generateMCQuestions } = useVocabulary()
    const qs = generateMCQuestions(5)
    expect(qs).toHaveLength(5)
    for (const q of qs) {
      expect(q.options).toContain(q.correctAnswer)
      expect(q.options).toHaveLength(4) // correct + 3 distractors
      expect(new Set(q.options).size).toBe(4) // no duplicate options
      expect(q.question).toContain(q.termDisplay)
    }
  })

  it('generateTFQuestions explains the true meaning regardless of the shown statement', () => {
    const { generateTFQuestions } = useVocabulary()
    const qs = generateTFQuestions(6)
    expect(qs).toHaveLength(6)
    for (const q of qs) {
      expect(typeof q.isTrue).toBe('boolean')
      expect(q.statement).toContain(q.termDisplay)
      expect(q.explanation).toContain(q.meaningDisplay) // always the correct meaning
    }
  })

  it('generateMatchingPairs returns term/definition pairs tied to a vocab word', () => {
    const { generateMatchingPairs } = useVocabulary()
    const pairs = generateMatchingPairs(8)
    expect(pairs).toHaveLength(8)
    for (const p of pairs) {
      expect(p.term.length).toBeGreaterThan(0)
      expect(p.definition.length).toBeGreaterThan(0)
      expect(p.vocabWord).toBeDefined()
    }
  })

  it('getRandomWords does not repeat within a single batch', () => {
    const { getRandomWords } = useVocabulary()
    const words = getRandomWords(12)
    const ids = words.map(w => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
