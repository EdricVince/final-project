import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GameRecord {
  id: string
  modeId: string
  modeName: string
  score: number
  accuracy: number
  questionCount: number
  xpEarned: number
  date: string
}

const STORAGE_KEY = 'studyspark-quiz-history'
const SEEN_KEY = 'studyspark-seen-words'

function loadHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export const useQuizStore = defineStore('quiz', () => {
  const recentGames = ref<GameRecord[]>(loadHistory())

  function addGame(game: Omit<GameRecord, 'id' | 'date'>) {
    const record: GameRecord = { ...game, id: Date.now().toString(), date: new Date().toISOString() }
    recentGames.value.unshift(record)
    if (recentGames.value.length > 20) recentGames.value = recentGames.value.slice(0, 20)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentGames.value))
  }

  function getSeenWordIds(): Set<number> {
    try {
      const raw = localStorage.getItem(SEEN_KEY)
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch { return new Set() }
  }

  function markWordsAsSeen(ids: number[], totalWords: number) {
    const seen = getSeenWordIds()
    ids.forEach(id => seen.add(id))
    // Wrap-around: reset after all words have been seen
    if (seen.size >= totalWords) {
      localStorage.removeItem(SEEN_KEY)
    } else {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
    }
  }

  return { recentGames, addGame, getSeenWordIds, markWordsAsSeen }
})
