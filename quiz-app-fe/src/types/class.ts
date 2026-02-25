export interface Class {
  id: number
  name: string
  description?: string
  subject?: string
  class_code: string
  student_limit: number
  teacher_id: number
  is_active: boolean
  created_at: string
  updated_at?: string
  student_count?: number
}

export interface ClassStudent {
  id: number
  class_id: number
  student_id: number
  student_email: string
  student_name?: string
  joined_at: string
}

export interface CreateClassDto {
  name: string
  description?: string
  subject?: string
  student_limit: number
}

export interface UpdateClassDto {
  name?: string
  description?: string
  subject?: string
  student_limit?: number
  is_active?: boolean
}

export interface JoinClassDto {
  class_code: string
}

// Subject options for classes
export const CLASS_SUBJECTS = [
  'General English',
  'Business English',
  'IT English',
  'Tourism English',
  'Academic English',
  'Conversation',
  'Grammar',
  'Vocabulary',
  'Other',
] as const

export type ClassSubject = (typeof CLASS_SUBJECTS)[number]
