import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExamTimer from './ExamTimer.vue'

describe('ExamTimer (component)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('formats the remaining time as mm:ss', () => {
    const w = mount(ExamTimer, { props: { totalSeconds: 90 } })
    expect(w.text()).toContain('01:30')
  })

  it('turns red under 20 seconds', () => {
    const w = mount(ExamTimer, { props: { totalSeconds: 10 } })
    expect(w.classes().join(' ')).toContain('text-red-400')
  })

  it('counts down and emits "timeout" when it hits zero', async () => {
    const w = mount(ExamTimer, { props: { totalSeconds: 2 } })
    await vi.advanceTimersByTimeAsync(2000)
    expect(w.emitted('timeout')).toBeTruthy()
  })
})
