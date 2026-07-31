// Shared options for AI-assisted teacher content generation (lessons + vocab sets).

export interface SkillOption {
  value: string
  label: string
  emoji: string
}

// The "skill / topic" an AI-generated lesson focuses on.
export const LESSON_SKILLS: SkillOption[] = [
  { value: 'vocabulary', label: 'Vocabulary', emoji: '🔤' },
  { value: 'grammar', label: 'Grammar', emoji: '📐' },
  { value: 'reading', label: 'Reading', emoji: '📖' },
  { value: 'listening', label: 'Listening', emoji: '🎧' },
  { value: 'writing', label: 'Writing', emoji: '✍️' },
  { value: 'speaking', label: 'Speaking', emoji: '🗣️' },
  { value: 'test-prep', label: 'Test Prep', emoji: '🎯' },
]

// Level / band scale — grouped so a <select> can render <optgroup>s.
export const LEVEL_GROUPS: { label: string; options: string[] }[] = [
  { label: 'CEFR', options: ['Beginner (A1)', 'Elementary (A2)', 'Intermediate (B1)', 'Upper-Intermediate (B2)', 'Advanced (C1)', 'Proficient (C2)'] },
  { label: 'IELTS band', options: ['IELTS 5.0', 'IELTS 5.5', 'IELTS 6.0', 'IELTS 6.5', 'IELTS 7.0', 'IELTS 7.5', 'IELTS 8.0'] },
  { label: 'Simple', options: ['Beginner', 'Intermediate', 'Advanced'] },
]

export const LEVEL_OPTIONS: string[] = LEVEL_GROUPS.flatMap(g => g.options)

export const CONTENT_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'zh', label: 'Chinese' },
]
