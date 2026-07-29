import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { usePolling } from './usePolling'

/** Mount a throwaway component whose setup wires up usePolling. */
const harness = (task: () => void, interval: number) =>
  mount(defineComponent({ setup() { usePolling(task, interval); return () => null } }))

/** Override document.hidden for a test (jsdom defaults to visible). */
function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
}
function restoreHidden() {
  delete (document as unknown as { hidden?: boolean }).hidden
}

describe('usePolling', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    restoreHidden()
  })

  it('runs immediately on mount and then once per interval', async () => {
    const task = vi.fn()
    const wrapper = harness(task, 1000)
    expect(task).toHaveBeenCalledTimes(1) // immediate run
    await vi.advanceTimersByTimeAsync(1000)
    expect(task).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(2000)
    expect(task).toHaveBeenCalledTimes(4)
    wrapper.unmount()
  })

  it('stops polling after the component unmounts', async () => {
    const task = vi.fn()
    const wrapper = harness(task, 1000)
    wrapper.unmount()
    task.mockClear()
    await vi.advanceTimersByTimeAsync(5000)
    expect(task).not.toHaveBeenCalled()
  })

  it('skips ticks while the tab is hidden and resumes when visible', async () => {
    setHidden(true)
    const task = vi.fn()
    const wrapper = harness(task, 1000)
    expect(task).not.toHaveBeenCalled() // immediate run skipped (hidden)
    await vi.advanceTimersByTimeAsync(3000)
    expect(task).not.toHaveBeenCalled()

    setHidden(false)
    await vi.advanceTimersByTimeAsync(1000)
    expect(task).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
