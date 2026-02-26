export { useLoginAnimation } from './useLoginAnimation'
export { useLocale } from './useLocale'
export type { SupportedLocale } from './useLocale'
export { useToast } from './useToast'
export { useTheme } from './useTheme'
export { useGoals } from './useGoals'
export { useAchievements } from './useAchievements'
export { useSettings } from './useSettings'
export { useProfile } from './useProfile'
export { useDashboard } from './useDashboard'

// Re-export types
export type { ToastOptions } from './useToast'
export type { Theme } from './useTheme'
export type { CustomGoal } from './useGoals'
export type { LeaderboardUser } from './useAchievements'
export type {
  AccountSettings,
  PasswordForm,
  AppearanceSettings,
  NotificationSettings,
  StudySettings,
  PrivacySettings,
} from './useSettings'
export type {
  LearningStats,
  RecentActivity,
  ShowcaseAchievement,
  ActivityType,
} from './useProfile'
