import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import StatsCard from './StatsCard.vue'

const DummyIcon = defineComponent({ name: 'DummyIcon', render: () => h('svg') })

describe('StatsCard (component)', () => {
  it('renders the value, suffix and label', () => {
    const w = mount(StatsCard, { props: { icon: DummyIcon, value: 42, label: 'Cards studied', suffix: '%' } })
    expect(w.text()).toContain('42%')
    expect(w.text()).toContain('Cards studied')
  })

  it('renders the icon component', () => {
    const w = mount(StatsCard, { props: { icon: DummyIcon, value: 7, label: 'Streak' } })
    expect(w.findComponent(DummyIcon).exists()).toBe(true)
  })
})
