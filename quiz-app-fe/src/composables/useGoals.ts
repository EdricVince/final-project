import { ref, reactive, computed } from 'vue'
import { BookOpen, Award, GraduationCap, Crown } from 'lucide-vue-next'
import type { ProfileGoals, DailyGoal } from '@/types/profile'

export interface CustomGoal {
  id: string
  title: string
  description: string
  completed: boolean
}

const XP_MAP: Record<DailyGoal['type'], number> = {
  vocabulary: 20,
  flashcard: 15,
  quiz: 25,
  time: 10,
}

export function useGoals() {
  // Custom Goals
  const customGoals = ref<CustomGoal[]>([])

  // Helper functions
  const getWeekEndDate = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilSunday = 7 - dayOfWeek
    const endDate = new Date(now)
    endDate.setDate(now.getDate() + daysUntilSunday)
    return endDate
  }

  // Goals Data — all progress starts at 0 for new users
  const goals = reactive<ProfileGoals>({
    dailyGoals: [
      { id: '1', type: 'vocabulary', label: 'Learn new words', current: 0, target: 20, unit: 'words' },
      { id: '2', type: 'flashcard', label: 'Review flashcards', current: 0, target: 50, unit: 'cards' },
      { id: '3', type: 'quiz', label: 'Complete quizzes', current: 0, target: 3, unit: 'quizzes' },
      { id: '4', type: 'time', label: 'Study time', current: 0, target: 30, unit: 'min' },
    ],
    weeklyChallenges: [
      {
        id: '1',
        title: 'Vocabulary Champion',
        description: 'Learn 100 new words this week',
        current: 0,
        target: 100,
        completed: false,
        expiresAt: getWeekEndDate(),
      },
      {
        id: '2',
        title: 'Quiz Master',
        description: 'Complete 15 quizzes with 80%+ accuracy',
        current: 0,
        target: 15,
        completed: false,
        expiresAt: getWeekEndDate(),
      },
      {
        id: '3',
        title: 'Streak Keeper',
        description: 'Maintain a 7-day learning streak',
        current: 0,
        target: 7,
        completed: false,
        expiresAt: getWeekEndDate(),
      },
    ],
    milestones: [
      {
        id: '1',
        title: 'Word Beginner',
        description: 'Learn your first 100 words',
        target: 100,
        current: 0,
        completed: false,
        icon: BookOpen,
      },
      {
        id: '2',
        title: 'Word Explorer',
        description: 'Learn 500 words',
        target: 500,
        current: 0,
        completed: false,
        icon: Award,
      },
      {
        id: '3',
        title: 'Word Master',
        description: 'Learn 1,000 words',
        target: 1000,
        current: 0,
        completed: false,
        icon: GraduationCap,
      },
      {
        id: '4',
        title: 'Word Legend',
        description: 'Learn 5,000 words',
        target: 5000,
        current: 0,
        completed: false,
        icon: Crown,
      },
    ],
  })

  // Daily Goals
  const isGoalComplete = (goal: DailyGoal): boolean => {
    return goal.current >= goal.target
  }

  const getGoalProgress = (goal: DailyGoal): number => {
    return Math.min((goal.current / goal.target) * 100, 100)
  }

  const getGoalXP = (goal: DailyGoal): number => {
    return XP_MAP[goal.type]
  }

  const incrementGoal = (goal: DailyGoal) => {
    if (goal.current < goal.target) {
      goal.current++
    }
  }

  const resetDailyGoals = () => {
    goals.dailyGoals.forEach((goal) => {
      goal.current = 0
    })
  }

  // Custom Goals
  const addCustomGoal = (title: string, description: string) => {
    customGoals.value.push({
      id: Date.now().toString(),
      title,
      description,
      completed: false,
    })
  }

  const toggleCustomGoal = (id: string) => {
    const goal = customGoals.value.find((g) => g.id === id)
    if (goal) {
      goal.completed = !goal.completed
    }
  }

  const deleteCustomGoal = (id: string) => {
    customGoals.value = customGoals.value.filter((g) => g.id !== id)
  }

  // Weekly Challenges
  const toggleChallenge = (id: string) => {
    const challenge = goals.weeklyChallenges.find((c) => c.id === id)
    if (challenge) {
      challenge.completed = !challenge.completed
    }
  }

  const getChallengeProgress = (challenge: { current: number; target: number }): number => {
    return Math.min((challenge.current / challenge.target) * 100, 100)
  }

  // Computed values
  const completedGoals = computed(() => {
    return goals.dailyGoals.filter((g) => isGoalComplete(g)).length
  })

  const dailyProgress = computed(() => {
    const total = goals.dailyGoals.length
    return Math.round((completedGoals.value / total) * 100)
  })

  const todayXP = computed(() => {
    return goals.dailyGoals
      .filter((g) => isGoalComplete(g))
      .reduce((sum, g) => sum + getGoalXP(g), 0)
  })

  const daysRemaining = computed(() => {
    const now = new Date()
    const end = getWeekEndDate()
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  })

  const completedChallenges = computed(() => {
    return goals.weeklyChallenges.filter((c) => c.completed).length
  })

  const completedMilestones = computed(() => {
    return goals.milestones.filter((m) => m.completed).length
  })

  const getDailyMessage = () => {
    const progress = dailyProgress.value
    if (progress >= 100) return "Perfect day! All goals completed!"
    if (progress >= 75) return "Almost there! Just a little more!"
    if (progress >= 50) return "Great progress! Keep it up!"
    if (progress >= 25) return "Good start! You're on your way!"
    return "Let's crush some goals today!"
  }

  return {
    goals,
    customGoals,
    // Daily Goals
    isGoalComplete,
    getGoalProgress,
    getGoalXP,
    incrementGoal,
    resetDailyGoals,
    // Custom Goals
    addCustomGoal,
    toggleCustomGoal,
    deleteCustomGoal,
    // Weekly Challenges
    toggleChallenge,
    getChallengeProgress,
    // Computed
    completedGoals,
    dailyProgress,
    todayXP,
    daysRemaining,
    completedChallenges,
    completedMilestones,
    getDailyMessage,
  }
}
