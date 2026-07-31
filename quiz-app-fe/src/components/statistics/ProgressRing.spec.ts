import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressRing from './ProgressRing.vue'

describe('ProgressRing (component)', () => {
  it('renders the percentage and label in the centre', () => {
    const w = mount(ProgressRing, { props: { percentage: 75, label: 'Done' } })
    expect(w.text()).toContain('75%')
    expect(w.text()).toContain('Done')
  })

  it('shows current / target when showDetails is on', () => {
    const w = mount(ProgressRing, { props: { percentage: 50, current: 5, target: 10 } })
    expect(w.text()).toContain('5')
    expect(w.text()).toContain('10')
  })

  it('clamps the progress arc (100% → zero dash offset)', () => {
    const w = mount(ProgressRing, { props: { percentage: 150 } })
    const progressCircle = w.findAll('circle')[1] // second circle = progress arc
    expect(progressCircle?.attributes('stroke-dashoffset')).toBe('0')
  })
})
