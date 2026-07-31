// Shared types for teacher-authored content (lessons + vocabulary sets).

export interface VocabWordData {
  term: string
  definition: string
  example: string
}

export interface LessonContentData {
  vocabulary: VocabWordData[]
  quiz: { question: string; options: string[]; correct: number; explanation: string }[]
  comprehension: { question: string; answer: string }[]
}

export interface LessonData {
  id: number
  teacher_id: number
  class_id: number | null
  title: string
  description: string | null
  category: string
  difficulty: string
  content?: LessonContentData
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface VocabSetData {
  id: number
  teacher_id: number
  class_id: number | null
  name: string
  language: string
  level: string
  words: VocabWordData[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface TeacherClassData {
  id: number
  name: string
  class_code: string
  student_count?: number
}

// AI generation payloads
export interface GeneratedLessonData {
  title: string
  description: string
  category: string
  difficulty: string
  content: LessonContentData
}

export interface GeneratedVocabSetData {
  name: string
  words: VocabWordData[]
}
