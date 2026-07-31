import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import StreakBadge from './StreakBadge.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { streak: { days: 'days', milestone: '{n} day streak' } } },
})

const mountBadge = (props: { streakCount: number; compact?: boolean; milestoneReached?: boolean }) =>
  mount(StreakBadge, { props, global: { plugins: [i18n] } })

describe('StreakBadge (component)', () => {
  it('renders the starter tier (no tier badge) for a low streak', () => {
    const w = mountBadge({ streakCount: 3 })
    expect(w.classes()).toContain('tier-starter')
    expect(w.text()).toContain('3')
    expect(w.find('.tier-badge').exists()).toBe(false)
  })

  it('reaches bronze at 10', () => {
    const w = mountBadge({ streakCount: 10 })
    expect(w.classes()).toContain('tier-bronze')
    expect(w.get('.tier-badge').text()).toBe('Bronze')
  })

  it('reaches legendary at 365', () => {
    const w = mountBadge({ streakCount: 365 })
    expect(w.classes()).toContain('tier-legendary')
    expect(w.text()).toContain('Legendary')
  })
})
