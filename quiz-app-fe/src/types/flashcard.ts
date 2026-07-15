export interface FlashcardItem {
  id: number
  term: string
  definition: string
  example?: string
  image?: string
  audio?: string
  isFavorite: boolean
  status: 'New' | 'Learning' | 'Mastered'
}

export interface FlashcardDeck {
  id: string | string[]
  title: string
  description: string
  category: string
  progress: number
}

export interface CardFormData {
  term: string
  definition: string
  example: string
  image: string
  audio: string
}
