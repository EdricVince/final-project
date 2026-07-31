import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button (component)', () => {
  it('renders a <button> with the slotted content by default', () => {
    const w = mount(Button, { slots: { default: 'Click me' } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.text()).toBe('Click me')
  })

  it('renders as a different element via the `as` prop', () => {
    const w = mount(Button, { props: { as: 'a' }, slots: { default: 'Link' } })
    expect(w.element.tagName).toBe('A')
  })

  it('merges a caller-supplied class with the variant classes', () => {
    const w = mount(Button, { props: { class: 'my-custom-class' }, slots: { default: 'x' } })
    expect(w.classes()).toContain('my-custom-class')
  })
})
