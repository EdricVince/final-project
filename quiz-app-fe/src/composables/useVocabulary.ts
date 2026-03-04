import { vocabulary, getWordInLang, type VocabWord } from '@/data/vocabulary'
import { useLearningLanguage } from './useLearningLanguage'
import { useLocale } from './useLocale'
import type { MultipleChoiceQuestion, WordScrambleQuestion, MatchingPair, TrueFalseQuestion } from '@/types/quiz'

// Extended interfaces with vocab reference for results screen
export interface VocabMCQuestion extends MultipleChoiceQuestion {
  vocabWord: VocabWord
  termDisplay: string   // word in learning lang
  meaningDisplay: string // word in ui lang
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
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function scrambleWord(word: string): string[] {
  const letters = word.split('')
  return shuffleArray(letters)
}

export function useVocabulary() {
  const { current: learningLang } = useLearningLanguage()
  const { locale: uiLang } = useLocale()

  function getRandomWords(count: number): VocabWord[] {
    return shuffleArray([...vocabulary]).slice(0, count)
  }

  function generateMCQuestions(count = 10): VocabMCQuestion[] {
    const words = getRandomWords(Math.max(count, 4))
    return words.slice(0, count).map((word, i) => {
      const term = getWordInLang(word, learningLang.value)
      const correct = getWordInLang(word, uiLang.value as string)
      // Pick 3 wrong answers from other words
      const others = words.filter(w => w.id !== word.id)
      const wrongs = shuffleArray(others)
        .slice(0, 3)
        .map(w => getWordInLang(w, uiLang.value as string))
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

  function generateTFQuestions(count = 12): VocabTFQuestion[] {
    const words = getRandomWords(Math.max(count, 4))
    return words.slice(0, count).map((word, i) => {
      const term = getWordInLang(word, learningLang.value)
      const correctMeaning = getWordInLang(word, uiLang.value as string)
      const isTrue = Math.random() > 0.5
      let shownMeaning = correctMeaning
      if (!isTrue) {
        const others = vocabulary.filter(w => w.id !== word.id)
        const wrong = others[Math.floor(Math.random() * others.length)]
        shownMeaning = getWordInLang(wrong, uiLang.value as string)
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
      const hint = getWordInLang(word, uiLang.value as string)
      // Only scramble simple ASCII words (English/romaji); others keep original
      const canScramble = /^[a-zA-Z\s]+$/.test(term) && term.length > 2
      const scrambled = canScramble ? scrambleWord(term) : term.split('')
      return {
        id: i + 1,
        word: term,
        hint,
        scrambled,
        vocabWord: word,
        termDisplay: term,
        meaningDisplay: hint,
      }
    })
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
    generateMatchingPairs,
    generateSpeedQuestions,
    getWordInLang: (word: VocabWord, lang: string) => getWordInLang(word, lang),
  }
}
