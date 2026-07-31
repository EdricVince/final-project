import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizResult from './QuizResult.vue'
import type { QuizResult as QuizResultType } from '@/types/quiz'

const makeResult = (over: Partial<QuizResultType> = {}): QuizResultType => ({
  totalQuestions: 10, correctAnswers: 9, wrongAnswers: 1, score: 180,
  timeSpent: 75, xpEarned: 120, accuracy: 90, streakBonus: 0, ...over,
})

describe('QuizResult (component)', () => {
  it('shows an "Excellent!" result with stats at ≥90% accuracy', () => {
    const w = mount(QuizResult, { props: { result: makeResult({ accuracy: 95 }) } })
    expect(w.text()).toContain('Excellent!')
    expect(w.text()).toContain('180')     // score
    expect(w.text()).toContain('9/10')    // correct / total
    expect(w.text()).toContain('1m 15s')  // formatted timeSpent (75s)
    expect(w.text()).toContain('+120')    // xp earned
  })

  it('degrades the title as accuracy drops', () => {
    expect(mount(QuizResult, { props: { result: makeResult({ accuracy: 75 }) } }).text()).toContain('Great Job!')
    expect(mount(QuizResult, { props: { result: makeResult({ accuracy: 55 }) } }).text()).toContain('Good Effort!')
    expect(mount(QuizResult, { props: { result: makeResult({ accuracy: 30 }) } }).text()).toContain('Keep Practicing!')
  })

  it('renders the streak bonus only when it is > 0', () => {
    expect(mount(QuizResult, { props: { result: makeResult({ streakBonus: 0 }) } }).text()).not.toContain('Streak Bonus')
    expect(mount(QuizResult, { props: { result: makeResult({ streakBonus: 25 }) } }).text()).toContain('+25 Streak Bonus')
  })

  it('emits playAgain and goHome from the action buttons', async () => {
    const w = mount(QuizResult, { props: { result: makeResult() } })
    const buttons = w.findAll('button')
    await buttons[0]!.trigger('click') // Play Again
    await buttons[1]!.trigger('click') // Quizzes
    expect(w.emitted('playAgain')).toBeTruthy()
    expect(w.emitted('goHome')).toBeTruthy()
  })
})
