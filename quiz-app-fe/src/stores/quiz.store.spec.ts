import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuizStore } from './quiz.store'

const game = (score: number) => ({ modeId: 'mc', modeName: 'Multiple Choice', score, accuracy: 100, questionCount: 10, xpEarned: 5 })

describe('quiz.store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('prepends the newest game and caps history at 20', () => {
    const store = useQuizStore()
    for (let i = 0; i < 25; i++) store.addGame(game(i))
    expect(store.recentGames).toHaveLength(20)
    expect(store.recentGames[0]?.score).toBe(24) // most recent first
    expect(JSON.parse(localStorage.getItem('studyspark-quiz-history')!)).toHaveLength(20)
  })

  it('tracks seen word ids and wraps around once every word is seen', () => {
    const store = useQuizStore()
    store.markWordsAsSeen([1, 2], 5)
    expect([...store.getSeenWordIds()].sort()).toEqual([1, 2])

    store.markWordsAsSeen([3, 4, 5], 5) // 5 seen ≥ total 5 → reset
    expect(store.getSeenWordIds().size).toBe(0)
    expect(localStorage.getItem('studyspark-seen-words')).toBeNull()
  })
})
