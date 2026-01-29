import { ref, reactive, computed } from 'vue'
import {
  Trophy,
  Star,
  Crown,
  Rocket,
  Zap,
  BookOpen,
  GraduationCap,
  Flame,
  Users,
  Brain,
  Sparkles,
  Heart,
} from 'lucide-vue-next'
import type { ProfileAchievements, EnhancedAchievement, AchievementCategory, AchievementRarity } from '@/types/profile'

export interface LeaderboardUser {
  name: string
  achievements: number
  points: number
  isCurrentUser: boolean
}

const POINTS_MAP: Record<AchievementRarity, number> = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100,
}

export function useAchievements() {
  const selectedCategory = ref<AchievementCategory | 'all'>('all')
  const selectedAchievement = ref<EnhancedAchievement | null>(null)
  const showModal = ref(false)

  // Leaderboard data
  const leaderboard: LeaderboardUser[] = [
    { name: 'Sarah Chen', achievements: 42, points: 1850, isCurrentUser: false },
    { name: 'Alex Johnson', achievements: 35, points: 1420, isCurrentUser: true },
    { name: 'Mike Wilson', achievements: 31, points: 1280, isCurrentUser: false },
    { name: 'Emma Davis', achievements: 28, points: 1150, isCurrentUser: false },
    { name: 'James Brown', achievements: 25, points: 980, isCurrentUser: false },
  ]

  // Achievements data
  const achievementsData = reactive<ProfileAchievements>({
    achievements: [
      // Learning category
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: Star,
        category: 'learning',
        rarity: 'common',
        earned: true,
        earnedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Word Collector',
        description: 'Learn 100 vocabulary words',
        icon: BookOpen,
        category: 'learning',
        rarity: 'common',
        earned: true,
        earnedAt: new Date('2024-02-01'),
      },
      {
        id: '3',
        name: 'Knowledge Seeker',
        description: 'Learn 500 vocabulary words',
        icon: Brain,
        category: 'learning',
        rarity: 'rare',
        earned: true,
        earnedAt: new Date('2024-03-10'),
      },
      {
        id: '4',
        name: 'Vocabulary Master',
        description: 'Learn 1000 vocabulary words',
        icon: GraduationCap,
        category: 'learning',
        rarity: 'epic',
        earned: false,
        progress: 750,
        target: 1000,
      },
      // Streak category
      {
        id: '5',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: Flame,
        category: 'streak',
        rarity: 'common',
        earned: true,
        earnedAt: new Date('2024-01-22'),
      },
      {
        id: '6',
        name: 'Streak Champion',
        description: 'Maintain a 30-day streak',
        icon: Zap,
        category: 'streak',
        rarity: 'rare',
        earned: false,
        progress: 21,
        target: 30,
      },
      {
        id: '7',
        name: 'Unstoppable',
        description: 'Maintain a 100-day streak',
        icon: Crown,
        category: 'streak',
        rarity: 'legendary',
        earned: false,
        progress: 21,
        target: 100,
      },
      // Social category
      {
        id: '8',
        name: 'Team Player',
        description: 'Join a study group',
        icon: Users,
        category: 'social',
        rarity: 'common',
        earned: true,
        earnedAt: new Date('2024-02-15'),
      },
      {
        id: '9',
        name: 'Helpful Friend',
        description: 'Help 10 other learners',
        icon: Heart,
        category: 'social',
        rarity: 'rare',
        earned: false,
        progress: 6,
        target: 10,
      },
      // Mastery category
      {
        id: '10',
        name: 'Quiz Master',
        description: 'Complete 50 quizzes',
        icon: Trophy,
        category: 'mastery',
        rarity: 'common',
        earned: true,
        earnedAt: new Date('2024-03-01'),
      },
      {
        id: '11',
        name: 'Perfect Score',
        description: 'Get 100% on 10 quizzes',
        icon: Sparkles,
        category: 'mastery',
        rarity: 'epic',
        earned: true,
        earnedAt: new Date('2024-03-15'),
      },
      {
        id: '12',
        name: 'Speed Demon',
        description: 'Complete a quiz in under 1 minute',
        icon: Rocket,
        category: 'mastery',
        rarity: 'rare',
        earned: true,
        earnedAt: new Date('2024-02-28'),
      },
    ],
    totalEarned: 8,
    totalAvailable: 12,
  })

  // Helper functions
  const getPoints = (rarity: AchievementRarity): number => POINTS_MAP[rarity]

  const getRarityColor = (rarity: AchievementRarity): string => {
    const colors: Record<AchievementRarity, string> = {
      common: 'text-muted-foreground',
      rare: 'text-chart-2',
      epic: 'text-chart-4',
      legendary: 'text-chart-1',
    }
    return colors[rarity]
  }

  const getRarityBgClass = (rarity: AchievementRarity): string => {
    const classes: Record<AchievementRarity, string> = {
      common: 'bg-secondary border-border',
      rare: 'bg-chart-2/10 border-chart-2',
      epic: 'bg-chart-4/10 border-chart-4',
      legendary: 'bg-chart-1/10 border-chart-1',
    }
    return classes[rarity]
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Modal
  const openDetail = (achievement: EnhancedAchievement) => {
    selectedAchievement.value = achievement
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    selectedAchievement.value = null
  }

  // Computed
  const filteredAchievements = computed(() => {
    if (selectedCategory.value === 'all') {
      return achievementsData.achievements
    }
    return achievementsData.achievements.filter((a) => a.category === selectedCategory.value)
  })

  const earnedCount = computed(() => {
    return achievementsData.achievements.filter((a) => a.earned).length
  })

  const totalPoints = computed(() => {
    return achievementsData.achievements
      .filter((a) => a.earned)
      .reduce((sum, a) => sum + getPoints(a.rarity), 0)
  })

  const rarityCount = computed(() => {
    const earned = achievementsData.achievements.filter((a) => a.earned)
    return {
      common: earned.filter((a) => a.rarity === 'common').length,
      rare: earned.filter((a) => a.rarity === 'rare').length,
      epic: earned.filter((a) => a.rarity === 'epic').length,
      legendary: earned.filter((a) => a.rarity === 'legendary').length,
    }
  })

  const recentAchievement = computed(() => {
    const earned = achievementsData.achievements.filter((a) => a.earned && a.earnedAt)
    if (earned.length === 0) return null
    return earned.sort((a, b) => {
      const dateA = a.earnedAt ? new Date(a.earnedAt).getTime() : 0
      const dateB = b.earnedAt ? new Date(b.earnedAt).getTime() : 0
      return dateB - dateA
    })[0]
  })

  return {
    // State
    selectedCategory,
    selectedAchievement,
    showModal,
    achievementsData,
    leaderboard,
    // Helpers
    getPoints,
    getRarityColor,
    getRarityBgClass,
    formatDate,
    // Modal
    openDetail,
    closeModal,
    // Computed
    filteredAchievements,
    earnedCount,
    totalPoints,
    rarityCount,
    recentAchievement,
  }
}
