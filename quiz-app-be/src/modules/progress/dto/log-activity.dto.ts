export type ActivityType = 'flashcard_session' | 'quiz_completion';

export class LogActivityDto {
  type: ActivityType;
  cards_count?: number;   // for flashcard_session
  score?: number;         // 0-100 percentage, for quiz_completion
  questions_count?: number; // for quiz_completion
}

export class LogActivityResponseDto {
  xp_gained: number;
  level_up: boolean;
  new_level: number;
  new_xp: number;
  streak_count: number;
  streak_updated: boolean;
}
