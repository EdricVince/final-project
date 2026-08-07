import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// ── Mocks for the page's external dependencies ───────────────────────────────
const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ params: { id: '7' } }),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}))

vi.mock('@/utils/api', () => ({
  api: { getTest: vi.fn(), getTestSubmissions: vi.fn() },
  ApiError: class ApiError extends Error { errorMessage = '' },
}))

import TestResultsPage from './TestResultsPage.vue'
import { api } from '@/utils/api'

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const mountPage = () => mount(TestResultsPage, { global: { plugins: [createPinia(), i18n] } })
const getTest = api.getTest as unknown as ReturnType<typeof vi.fn>
const getSubs = api.getTestSubmissions as unknown as ReturnType<typeof vi.fn>

const sampleTest = { id: 7, title: 'Unit 3 Test', questions: [{}, {}, {}, {}] }
const submissions = [
  { id: 1, student_id: 10, student_name: 'Alice', student_email: 'alice@demo.com', score: 4, total: 4, submitted_at: '2026-08-01T10:00:00Z' },
  { id: 2, student_id: 11, student_name: 'Bob', student_email: 'bob@demo.com', score: 2, total: 4, submitted_at: '2026-08-01T11:00:00Z' },
]

describe('TestResultsPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the test with its submissions and renders the results table', async () => {
    getTest.mockResolvedValue(sampleTest)
    getSubs.mockResolvedValue(submissions)
    const w = mountPage()
    await flushPromises()

    expect(getTest).toHaveBeenCalledWith(7)
    expect(getSubs).toHaveBeenCalledWith(7)
    expect(w.text()).toContain('Unit 3 Test')

    const rows = w.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(w.text()).toContain('Alice')
    expect(w.text()).toContain('alice@demo.com')
    expect(w.text()).toContain('Bob')
    expect(w.text()).toContain('4/4')
    expect(w.text()).toContain('2/4')
  })

  it('computes the average score across submissions (100% and 50% → 75%)', async () => {
    getTest.mockResolvedValue(sampleTest)
    getSubs.mockResolvedValue(submissions)
    const w = mountPage()
    await flushPromises()

    expect(w.text()).toContain('75%')
  })

  it('shows the empty state when there are no submissions', async () => {
    getTest.mockResolvedValue(sampleTest)
    getSubs.mockResolvedValue([])
    const w = mountPage()
    await flushPromises()

    expect(w.findAll('tbody tr')).toHaveLength(0)
    expect(w.text()).toContain('teacher.testResults.noSubmissions')
  })

  it('redirects to the tests list when loading fails', async () => {
    getTest.mockRejectedValue(new Error('boom'))
    getSubs.mockResolvedValue([])
    mountPage()
    await flushPromises()

    expect(push).toHaveBeenCalledWith('/teacher/tests')
  })
})
