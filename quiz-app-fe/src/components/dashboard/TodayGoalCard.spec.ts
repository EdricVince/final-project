import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import TodayGoalCard from './TodayGoalCard.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      dashboard: {
        todayGoal: 'Today Goal', cards: 'cards', goalCompleted: 'Completed!',
        pctRemaining: '{pct}% left', done: 'Done',
      },
    },
  },
})

const mountCard = (props: { progress: number; goal: number }) =>
  mount(TodayGoalCard, { props, global: { plugins: [i18n] } })

describe('TodayGoalCard (component)', () => {
  it('shows the progress fraction and remaining percentage', () => {
    const w = mountCard({ progress: 25, goal: 50 })
    expect(w.text()).toContain('25/50')
    expect(w.text()).toContain('50% left') // 100 - 50%
    expect(w.text()).not.toContain('Done')
  })

  it('shows the completed state once the goal is met', () => {
    const w = mountCard({ progress: 50, goal: 50 })
    expect(w.text()).toContain('Completed!')
    expect(w.text()).toContain('Done')
  })
})
