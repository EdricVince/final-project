import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComboMultiplier from './ComboMultiplier.vue'

describe('ComboMultiplier (component)', () => {
  it('renders nothing below a combo of 2', () => {
    const w = mount(ComboMultiplier, { props: { combo: 1 } })
    expect(w.text()).not.toContain('COMBO')
  })

  it('shows the 1.25× multiplier and primary colour at combo 2', () => {
    const w = mount(ComboMultiplier, { props: { combo: 2 } })
    expect(w.text()).toContain('2x COMBO')
    expect(w.text()).toContain('1.25×')
    expect(w.find('.bg-primary').exists()).toBe(true)
  })

  it('caps at 3× and turns red for a high combo', () => {
    const w = mount(ComboMultiplier, { props: { combo: 12 } })
    expect(w.text()).toContain('12x COMBO')
    expect(w.text()).toContain('3×')
    expect(w.find('.bg-red-500').exists()).toBe(true)
  })
})
