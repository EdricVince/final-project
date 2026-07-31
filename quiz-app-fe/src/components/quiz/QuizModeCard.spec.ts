import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import QuizModeCard from './QuizModeCard.vue'

const DummyIcon = defineComponent({ name: 'DummyIcon', render: () => h('i') })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mode: any = {
  id: 'multiple-choice',
  title: 'Multiple Choice',
  description: 'Pick the correct answer',
  icon: DummyIcon,
}

describe('QuizModeCard (component)', () => {
  it('renders the mode title and description', () => {
    const w = mount(QuizModeCard, { props: { mode } })
    expect(w.text()).toContain('Multiple Choice')
    expect(w.text()).toContain('Pick the correct answer')
  })

  it('emits "click" when the card is clicked', async () => {
    const w = mount(QuizModeCard, { props: { mode } })
    await w.trigger('click')
    expect(w.emitted('click')).toBeTruthy()
  })
})
