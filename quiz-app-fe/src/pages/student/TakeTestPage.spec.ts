import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// ── Mocks for the page's external dependencies ───────────────────────────────
const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ params: { id: '5' } }),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}))

vi.mock('@/utils/api', () => ({
  api: { getTest: vi.fn(), submitTest: vi.fn() },
  ApiError: class ApiError extends Error { errorMessage = '' },
}))

import TakeTestPage from './TakeTestPage.vue'
import { api } from '@/utils/api'

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const mountPage = () => mount(TakeTestPage, { global: { plugins: [createPinia(), i18n] } })
const getTest = api.getTest as unknown as ReturnType<typeof vi.fn>
const submitTest = api.submitTest as unknown as ReturnType<typeof vi.fn>

// The server strips the correct index before a student takes a test.
const sampleTest = {
  id: 5, title: 'Business Basics', description: 'A short quiz',
  class_id: null, time_limit: null, is_published: true,
  questions: [
    { question: 'What is 2+2?', options: ['3', '4', '5'], points: 1 },
    { question: 'Capital of France?', options: ['Paris', 'London'], points: 1 },
  ],
}

const submitButton = (w: ReturnType<typeof mountPage>) =>
  w.findAll('button').find(b => b.text().includes('quizzesPage.submitTest'))

describe('TakeTestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  })

  it('loads the test by id and renders its questions with nothing answered yet', async () => {
    getTest.mockResolvedValue(sampleTest)
    const w = mountPage()
    await flushPromises()

    expect(getTest).toHaveBeenCalledWith(5)
    expect(w.text()).toContain('Business Basics')
    expect(w.text()).toContain('What is 2+2?')
    expect(w.text()).toContain('Capital of France?')
    expect(w.text()).toContain('0/2') // answeredCount / total
  })

  it('tracks the answered count as options are selected', async () => {
    getTest.mockResolvedValue(sampleTest)
    const w = mountPage()
    await flushPromises()

    const firstQuestionOptions = w.findAll('.grid.gap-2')[0]!.findAll('button')
    await firstQuestionOptions[1]!.trigger('click') // pick "4"
    expect(w.text()).toContain('1/2')
  })

  it('submits the answers and shows the graded score', async () => {
    getTest.mockResolvedValue(sampleTest)
    submitTest.mockResolvedValue({ score: 2, total: 2, submission_id: 1 })
    const w = mountPage()
    await flushPromises()

    await submitButton(w)!.trigger('click')
    await flushPromises()

    expect(submitTest).toHaveBeenCalledWith(5, expect.any(Array))
    expect(w.text()).toContain('2/2')   // score / total
    expect(w.text()).toContain('100%')  // resultPct
  })

  it('redirects to /quizzes when the test fails to load', async () => {
    getTest.mockRejectedValue(new Error('boom'))
    mountPage()
    await flushPromises()

    expect(push).toHaveBeenCalledWith('/quizzes')
  })
})
