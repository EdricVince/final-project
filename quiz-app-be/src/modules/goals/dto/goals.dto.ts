export class UpdateGoalSettingsDto {
  target_cards?: number;
  target_quizzes?: number;
}

export class CreateCustomGoalDto {
  title: string;
  description?: string;
}

export class UpdateCustomGoalDto {
  completed?: boolean;
  title?: string;
  description?: string;
}

export class DailyGoalItemDto {
  type: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

export class WeeklyChallengeDto {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}

export class MilestoneDto {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}

export class CustomGoalDto {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
}

export class GoalsResponseDto {
  daily_goals: DailyGoalItemDto[];
  weekly_challenges: WeeklyChallengeDto[];
  milestones: MilestoneDto[];
  custom_goals: CustomGoalDto[];
}
