import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Brain,
  Timer,
  Shuffle,
  Star,
  Medal,
  Crown,
  Rocket,
  BookOpen,
  Languages,
  Headphones,
  Layers,
  Zap,
  CheckCircle,
  ListChecks,
} from 'lucide-vue-next'

import type {
  DashboardStats,
  DashboardCourse,
  DashboardFlashcard,
  StudyMode,
  DayActivity,
  BadgeItem,
} from '@/types/dashboard'

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: typeof Brain
  color: string
  route: string
}

export function useDashboard() {
  const router = useRouter()

  // User data
  const userName = ref('Alex')
  const userLevel = ref(15)
  const userTitle = ref('Knowledge Seeker')

  // Loading state
  const isLoading = ref(true)

  // Stats
  const stats = ref<DashboardStats>({
    streak: 21,
    cardsLearned: 750,
    quizzesCompleted: 48,
    totalXP: 12450,
  })

  // Today's goal
  const todayProgress = ref(15)
  const todayGoal = ref(20)

  const todayProgressPercent = computed(() => {
    return Math.min((todayProgress.value / todayGoal.value) * 100, 100)
  })

  // Continue Learning data
  const continueLearning = ref<DashboardCourse[]>([
    { id: 1, title: 'English Grammar Basics', progress: 68, icon: BookOpen },
    { id: 2, title: 'English Vocabulary Builder', progress: 45, icon: Languages },
    { id: 3, title: 'English Listening Practice', progress: 32, icon: Headphones },
  ])

  // Recent Flashcards
  const recentFlashcards = ref<DashboardFlashcard[]>([
    { id: 1, question: 'What does "ubiquitous" mean?', difficulty: 'Medium', lastStudied: '2 hours ago' },
    { id: 2, question: 'What is the past tense of "teach"?', difficulty: 'Easy', lastStudied: '5 hours ago' },
    { id: 3, question: 'What does the idiom "break the ice" mean?', difficulty: 'Hard', lastStudied: '1 day ago' },
    { id: 4, question: 'Choose the correct form: "She ___ to school every day"', difficulty: 'Medium', lastStudied: '2 days ago' },
  ])

  // Study Modes
  const studyModes = ref<StudyMode[]>([
    { id: 1, title: 'Flashcards', description: 'Classic study mode', icon: Layers },
    { id: 2, title: 'Quiz Mode', description: 'Test your knowledge', icon: Brain },
    { id: 3, title: 'Speed Round', description: 'Race against time', icon: Timer },
    { id: 4, title: 'Shuffle', description: 'Random practice', icon: Shuffle },
  ])

  // Quick Actions
  const quickActions = ref<QuickAction[]>([
    {
      id: 'quiz',
      title: 'Start Quiz',
      description: 'Test your knowledge',
      icon: Brain,
      color: 'from-chart-1 to-chart-2',
      route: '/quizzes',
    },
    {
      id: 'flashcard',
      title: 'Review Cards',
      description: 'Practice flashcards',
      icon: Layers,
      color: 'from-chart-2 to-chart-3',
      route: '/flashcards',
    },
    {
      id: 'goals',
      title: 'Daily Goals',
      description: 'Track progress',
      icon: ListChecks,
      color: 'from-chart-3 to-chart-4',
      route: '/goals',
    },
    {
      id: 'speed',
      title: 'Speed Round',
      description: 'Beat the clock',
      icon: Zap,
      color: 'from-chart-4 to-chart-5',
      route: '/quizzes/speed-round',
    },
  ])

  // Weekly Activity
  const weeklyActivity = ref<DayActivity[]>([
    { name: 'Mon', percent: 80 },
    { name: 'Tue', percent: 95 },
    { name: 'Wed', percent: 60 },
    { name: 'Thu', percent: 100 },
    { name: 'Fri', percent: 75 },
    { name: 'Sat', percent: 40 },
    { name: 'Sun', percent: 85 },
  ])

  // Recent Badges
  const recentBadges = ref<BadgeItem[]>([
    { id: 1, name: 'First Steps', icon: Star },
    { id: 2, name: 'Quiz Master', icon: Medal },
    { id: 3, name: 'Week Warrior', icon: Crown },
    { id: 4, name: 'Speed Demon', icon: Rocket },
    { id: 5, name: 'Perfect Score', icon: CheckCircle },
  ])

  // Upcoming deadlines/reminders
  const upcomingItems = ref([
    { id: 1, title: 'English Grammar Quiz', dueIn: '2 hours', type: 'quiz' },
    { id: 2, title: 'Vocabulary Review', dueIn: 'Tomorrow', type: 'review' },
    { id: 3, title: 'Weekly Challenge Ends', dueIn: '3 days', type: 'challenge' },
  ])

  // Navigation actions
  const navigateToCourses = () => {
    router.push('/courses')
  }

  const openCourse = (id: number) => {
    router.push(`/courses/${id}`)
  }

  const navigateToFlashcards = () => {
    router.push('/flashcards')
  }

  const openFlashcard = (id: number) => {
    router.push(`/flashcards/${id}`)
  }

  const selectStudyMode = (id: number) => {
    const mode = studyModes.value.find((m) => m.id === id)
    if (mode) {
      const routeMap: Record<string, string> = {
        Flashcards: '/flashcards',
        'Quiz Mode': '/quizzes',
        'Speed Round': '/quizzes/speed-round',
        Shuffle: '/flashcards',
      }
      router.push(routeMap[mode.title] || '/dashboard')
    }
  }

  const navigateToQuickAction = (action: QuickAction) => {
    router.push(action.route)
  }

  // Simulate loading
  const loadDashboardData = () => {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 600)
  }

  onMounted(() => {
    loadDashboardData()
  })

  return {
    // State
    userName,
    userLevel,
    userTitle,
    isLoading,
    stats,
    todayProgress,
    todayGoal,
    todayProgressPercent,
    continueLearning,
    recentFlashcards,
    studyModes,
    quickActions,
    weeklyActivity,
    recentBadges,
    upcomingItems,
    // Actions
    navigateToCourses,
    openCourse,
    navigateToFlashcards,
    openFlashcard,
    selectStudyMode,
    navigateToQuickAction,
    loadDashboardData,
  }
}
