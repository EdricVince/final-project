import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Replace the HTTP client so the store never touches the network.
vi.mock('@/utils/api', () => ({
  api: {
    getLeaderboard: vi.fn().mockResolvedValue([
      { rank: 1, user_id: 1, email: 'top@x.com', display_name: 'top', xp: 999, level: 5, streak_count: 3 },
    ]),
  },
}))

import { useProgressStore } from './progress.store'

describe('progress.store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts at level 1 with zeroed stats', () => {
    const store = useProgressStore()
    expect(store.level).toBe(1)
    expect(store.xp).toBe(0)
    expect(store.levelLabel).toBe('Level 1')
    expect(store.nextLevelXP).toBe(100) // LEVEL_THRESHOLDS[1]
  })

  it('$reset clears stats, leaderboard and the cached storage', () => {
    const store = useProgressStore()
    store.xp = 500
    store.leaderboard.push({
      rank: 1, user_id: 1, email: 'a@b.c', display_name: 'a', xp: 10, level: 2, streak_count: 1,
    })
    localStorage.setItem('studyspark-progress', '{"xp":500}')

    store.$reset()

    expect(store.xp).toBe(0)
    expect(store.leaderboard).toHaveLength(0)
    expect(localStorage.getItem('studyspark-progress')).toBeNull()
  })

  it('fetchLeaderboard stores the API result', async () => {
    const store = useProgressStore()
    await store.fetchLeaderboard()
    expect(store.leaderboard).toHaveLength(1)
    expect(store.leaderboard[0]?.display_name).toBe('top')
  })
})
