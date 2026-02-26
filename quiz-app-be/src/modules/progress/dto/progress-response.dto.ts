export class TodayActivityDto {
  cards_studied: number;
  quizzes_completed: number;
  xp_earned: number;
}

export class WeeklyActivityItemDto {
  date: string;         // YYYY-MM-DD
  day_label: string;    // Mon, Tue, ...
  xp_earned: number;
  cards_studied: number;
  quizzes_completed: number;
}

export class ProgressResponseDto {
  xp: number;
  level: number;
  streak_count: number;
  longest_streak: number;
  total_cards_studied: number;
  total_quizzes_completed: number;
  xp_for_current_level: number;
  xp_to_next_level: number;
  xp_progress_percent: number;
  today: TodayActivityDto;
}
