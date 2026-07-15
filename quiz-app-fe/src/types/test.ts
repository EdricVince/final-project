export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'

export interface Answer {
  id?: number
  answer_text: string
  is_correct: boolean
}

export interface Question {
  id?: number
  question_text: string
  question_type: QuestionType
  image_url?: string
  points: number
  order: number
  answers: Answer[]
}

export interface Test {
  id: number
  title: string
  description?: string
  time_limit?: number // in minutes
  shuffle_questions: boolean
  show_answers_after: boolean
  teacher_id: number
  questions: Question[]
  is_active: boolean
  created_at: string
  updated_at?: string
  question_count?: number
}

export interface TestAssignment {
  id: number
  test_id: number
  class_id: number
  start_date?: string
  end_date?: string
  test?: Test
  class_name?: string
}

export interface StudentResult {
  id: number
  test_id: number
  student_id: number
  assignment_id: number
  score: number
  total_points: number
  answers: Record<number, number | string>
  started_at: string
  completed_at?: string
  student_email?: string
  student_name?: string
  test_title?: string
}

export interface CreateTestDto {
  title: string
  description?: string
  time_limit?: number
  shuffle_questions?: boolean
  show_answers_after?: boolean
}

export interface CreateQuestionDto {
  question_text: string
  question_type: QuestionType
  image_url?: string
  points: number
  order: number
  answers: Omit<Answer, 'id'>[]
}

export interface AssignTestDto {
  class_id: number
  start_date?: string
  end_date?: string
}

export interface SubmitAnswerDto {
  answers: Record<number, number | string>
}

// Question type labels
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False',
  short_answer: 'Short Answer',
}
