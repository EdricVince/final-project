import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Progress from './Progress.vue'

describe('Progress (component)', () => {
  const indicator = (w: ReturnType<typeof mount>) => w.get('.bg-primary')

  it('sets the indicator width from modelValue and exposes aria', () => {
    const w = mount(Progress, { props: { modelValue: 40 } })
    expect(indicator(w).attributes('style')).toContain('width: 40%')
    expect(w.attributes('role')).toBe('progressbar')
    expect(w.attributes('aria-valuenow')).toBe('40')
    expect(w.attributes('aria-valuemax')).toBe('100')
  })

  it('clamps to the [0,100] range', () => {
    expect(indicator(mount(Progress, { props: { modelValue: 150 } })).attributes('style')).toContain('width: 100%')
    expect(indicator(mount(Progress, { props: { modelValue: -20 } })).attributes('style')).toContain('width: 0%')
  })

  it('supports a custom max', () => {
    const w = mount(Progress, { props: { modelValue: 5, max: 10 } })
    expect(indicator(w).attributes('style')).toContain('width: 50%')
  })
})
