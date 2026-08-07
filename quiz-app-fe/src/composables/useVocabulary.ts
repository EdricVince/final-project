import { vocabulary, getWordInLang, type VocabWord } from '@/data/vocabulary'
import { useLearningLanguage } from './useLearningLanguage'
import { useLocale } from './useLocale'
import { useQuizStore } from '@/stores/quiz.store'
import { api } from '@/utils/api'
import type { MultipleChoiceQuestion, WordScrambleQuestion, MatchingPair, TrueFalseQuestion } from '@/types/quiz'

// Human-readable topic label per category, per UI language — used to build a
// descriptive scramble hint ("a word in the Animals topic…") when no AI clue exists.
const CATEGORY_LABELS: Record<string, { en: string; vi: string; zh: string }> = {
  animals:    { en: 'animals',            vi: 'động vật',        zh: '动物' },
  colors:     { en: 'colors',             vi: 'màu sắc',         zh: '颜色' },
  food:       { en: 'food & drink',       vi: 'đồ ăn thức uống', zh: '食物' },
  family:     { en: 'family',             vi: 'gia đình',        zh: '家庭' },
  nature:     { en: 'nature',             vi: 'thiên nhiên',     zh: '自然' },
  numbers:    { en: 'numbers',            vi: 'số đếm',          zh: '数字' },
  daily:      { en: 'daily life',         vi: 'đời sống hằng ngày', zh: '日常生活' },
  body:       { en: 'the human body',     vi: 'cơ thể',          zh: '身体' },
  adjectives: { en: 'describing words',   vi: 'tính từ',         zh: '形容词' },
  verbs:      { en: 'actions',            vi: 'hành động',       zh: '动作' },
  transport:  { en: 'transport',          vi: 'phương tiện',     zh: '交通' },
  clothes:    { en: 'clothing',           vi: 'quần áo',         zh: 'trang phục' },
}

// A readable, sentence-style clue the learner reads before guessing the word.
function buildDescriptiveHint(word: VocabWord, ui: string): string {
  const meaning = getWordInLang(word, ui)
  const label = CATEGORY_LABELS[word.category]?.[ui as 'en' | 'vi' | 'zh']
    ?? CATEGORY_LABELS[word.category]?.en ?? word.category
  if (ui === 'vi') return `Một từ thuộc chủ đề "${label}", mang nghĩa là "${meaning}".`
  if (ui === 'zh') return `一个与"${label}"有关的词，意思是"${meaning}"。`
  return `A word in the "${label}" topic that means "${meaning}".`
}

// Extended interfaces with vocab reference for results screen
export interface VocabMCQuestion extends MultipleChoiceQuestion {
  vocabWord: VocabWord
  termDisplay: string
  meaningDisplay: string
}

export interface VocabTFQuestion extends TrueFalseQuestion {
  vocabWord: VocabWord
  termDisplay: string
  meaningDisplay: string
}

export interface VocabScrambleQuestion extends WordScrambleQuestion {
  vocabWord: VocabWord
  termDisplay: string
  meaningDisplay: string
}

export interface VocabMatchingPair extends MatchingPair {
  vocabWord: VocabWord
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function scrambleWord(word: string): string[] {
  const letters = word.split('')
  // Ensure the scrambled version differs from the original
  let shuffled = shuffleArray(letters)
  let attempts = 0
  while (shuffled.join('') === word && attempts < 10) {
    shuffled = shuffleArray(letters)
    attempts++
  }
  return shuffled
}

export function useVocabulary() {
  const { current: learningLang } = useLearningLanguage()
  const { locale: uiLang } = useLocale()
  const quizStore = useQuizStore()

  // Pick words that haven't been seen recently; wraps around when all are seen
  function getRandomWords(count: number): VocabWord[] {
    const seenIds = quizStore.getSeenWordIds()
    const unseen = vocabulary.filter(w => !seenIds.has(w.id))
    const seenWords = vocabulary.filter(w => seenIds.has(w.id))

    let pool: VocabWord[]
    if (unseen.length >= count) {
      pool = unseen
    } else {
      // Not enough unseen words — mix in seen ones to fill up
      pool = [...unseen, ...seenWords]
    }

    const selected = shuffleArray(pool).slice(0, Math.min(count, vocabulary.length))
    quizStore.markWordsAsSeen(selected.map(w => w.id), vocabulary.length)
    return selected
  }

  function generateMCQuestions(count = 10): VocabMCQuestion[] {
    // Need at least 4 words for wrong answers
    const words = getRandomWords(Math.max(count, 4))
    return words.slice(0, count).map((word, i) => {
      const term = getWordInLang(word, learningLang.value)
      const correct = getWordInLang(word, uiLang.value as string)
      const others = words.filter(w => w.id !== word.id)
      const wrongs = shuffleArray(others).slice(0, 3).map(w => getWordInLang(w, uiLang.value as string))
      const options = shuffleArray([correct, ...wrongs])
      return {
        id: i + 1,
        question: `What does "${term}" mean?`,
        options,
        correctAnswer: correct,
        explanation: `"${term}" means "${correct}"`,
        vocabWord: word,
        termDisplay: term,
        meaningDisplay: correct,
      }
    })
  }

  function generateTFQuestions(count = 10): VocabTFQuestion[] {
    const words = getRandomWords(Math.max(count, 4))
    return words.slice(0, count).map((word, i) => {
      const term = getWordInLang(word, learningLang.value)
      const correctMeaning = getWordInLang(word, uiLang.value as string)
      const isTrue = Math.random() > 0.5
      let shownMeaning = correctMeaning
      if (!isTrue) {
        const others = vocabulary.filter(w => w.id !== word.id)
        const wrong = others[Math.floor(Math.random() * others.length)]
        if (wrong) shownMeaning = getWordInLang(wrong, uiLang.value as string)
      }
      return {
        id: i + 1,
        statement: `"${term}" means "${shownMeaning}"`,
        isTrue,
        explanation: `"${term}" means "${correctMeaning}"`,
        vocabWord: word,
        termDisplay: term,
        meaningDisplay: correctMeaning,
      }
    })
  }

  function generateScrambleQuestions(count = 10): VocabScrambleQuestion[] {
    const words = getRandomWords(count)
    return words.map((word, i) => {
      const term = getWordInLang(word, learningLang.value)
      const meaning = getWordInLang(word, uiLang.value as string)
      const canScramble = /^[a-zA-Z\s]+$/.test(term) && term.length > 2
      const scrambled = canScramble ? scrambleWord(term) : term.split('')
      return {
        id: i + 1,
        word: term,
        // A descriptive clue sentence to read and guess from — not the bare translation.
        hint: buildDescriptiveHint(word, uiLang.value as string),
        scrambled,
        vocabWord: word,
        termDisplay: term,
        meaningDisplay: meaning,
      }
    })
  }

  // AI batch: each word comes with a natural one-sentence explanation used as the
  // descriptive hint (and an example sentence). Falls back to [] on any error so the
  // caller can top up with the local generator.
  async function generateAiScrambleQuestions(count = 10, exclude: string[] = []): Promise<VocabScrambleQuestion[]> {
    try {
      const items = await api.generateVocabulary({
        learningLang: learningLang.value,
        uiLang: uiLang.value as string,
        count: count + 5, // over-fetch: some terms won't be scrambleable single words
        exclude,
      })
      const usable = (items ?? []).filter((it) => it?.term && /^[a-zA-Z]{3,14}$/.test(it.term))
      return usable.slice(0, count).map((it, i) => {
        const word = it.term.toLowerCase()
        return {
          id: i + 1,
          word,
          hint: it.explanation?.trim() || it.meaning,
          example: it.example?.trim() || undefined,
          scrambled: scrambleWord(word),
          // Synthetic vocab word so the results table still has term/meaning to show.
          vocabWord: { id: -(i + 1), category: 'daily', en: word, vi: it.meaning, zh: it.meaning },
          termDisplay: word,
          meaningDisplay: it.meaning,
        }
      })
    } catch {
      return []
    }
  }

  function generateMatchingPairs(count = 8): VocabMatchingPair[] {
    const words = getRandomWords(count)
    return words.map((word, i) => ({
      id: i + 1,
      term: getWordInLang(word, learningLang.value),
      definition: getWordInLang(word, uiLang.value as string),
      vocabWord: word,
    }))
  }

  function generateSpeedQuestions(count = 15): VocabMCQuestion[] {
    return generateMCQuestions(count)
  }

  return {
    getRandomWords,
    generateMCQuestions,
    generateTFQuestions,
    generateScrambleQuestions,
    generateAiScrambleQuestions,
    generateMatchingPairs,
    generateSpeedQuestions,
    getWordInLang: (word: VocabWord, lang: string) => getWordInLang(word, lang),
  }
}
