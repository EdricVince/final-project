import { ref, computed, onMounted } from 'vue'
import { BookOpen, Award, GraduationCap, Trophy } from 'lucide-vue-next'
import type { Component } from 'vue'
import { api } from '@/utils/api'
import type { DailyGoal, WeeklyChallenge, Milestone } from '@/types/profile'

export interface CustomGoal {
  id: string
  title: string
  description: string
  completed: boolean
}

interface ApiGoalsResponse {
  daily_goals: { type: string; label: string; current: number; target: number; unit: string }[]
  weekly_challenges: { id: string; title: string; description: string; current: number; target: number; completed: boolean }[]
  milestones: { id: string; title: string; description: string; current: number; target: number; completed: boolean }[]
  custom_goals: { id: number; title: string; description: string | null; completed: boolean }[]
}

const MILESTONE_ICONS: Record<string, Component> = {
  cards_100: BookOpen,
  cards_500: Award,
  cards_1000: GraduationCap,
  quiz_50: Trophy,
}

export function useGoals() {
  const loading = ref(false)
  const dailyGoals = ref<DailyGoal[]>([])
  const weeklyChallenges = ref<WeeklyChallenge[]>([])
  const milestones = ref<Milestone[]>([])
  const customGoals = ref<CustomGoal[]>([])

  const fetchGoals = async () => {
    loading.value = true
    try {
      const data = await api.getGoals()
      dailyGoals.value = data.daily_goals.map((g) => ({
        id: g.type,
        type: g.type as DailyGoal['type'],
        label: g.label,
        current: g.current,
        target: g.target,
        unit: g.unit,
      }))
      weeklyChallenges.value = data.weekly_challenges.map((c) => ({
        ...c,
        expiresAt: getWeekEnd(),
      }))
      milestones.value = data.milestones.map((m) => ({
        ...m,
        icon: MILESTONE_ICONS[m.id] ?? BookOpen,
      }))
      customGoals.value = data.custom_goals.map((g) => ({
        id: String(g.id),
        title: g.title,
        description: g.description ?? '',
        completed: g.completed,
      }))
    } catch (e) {
      console.error('Failed to fetch goals', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchGoals)

  function getWeekEnd(): Date {
    const d = new Date()
    d.setDate(d.getDate() + (7 - d.getDay()))
    return d
  }

  const completedGoals = computed(() => dailyGoals.value.filter((g) => g.current >= g.target).length)
  const dailyProgress = computed(() =>
    dailyGoals.value.length ? Math.round((completedGoals.value / dailyGoals.value.length) * 100) : 0,
  )
  const todayXP = computed(() => {
    const XP: Record<string, number> = { flashcard: 15, quiz: 25, vocabulary: 20, time: 10 }
    return dailyGoals.value.filter((g) => g.current >= g.target).reduce((s, g) => s + (XP[g.type] ?? 10), 0)
  })
  const daysRemaining = computed(() => {
    const now = new Date()
    const end = new Date(now)
    end.setDate(now.getDate() + (7 - now.getDay()))
    return Math.ceil((end.getTime() - now.getTime()) / 86400000)
  })
  const completedChallenges = computed(() => weeklyChallenges.value.filter((c) => c.completed).length)
  const completedMilestones = computed(() => milestones.value.filter((m) => m.completed).length)

  const getGoalProgress = (goal: DailyGoal) => Math.min((goal.current / goal.target) * 100, 100)
  const getChallengeProgress = (c: { current: number; target: number }) =>
    Math.min((c.current / c.target) * 100, 100)
  const getDailyMessage = () => {
    const p = dailyProgress.value
    if (p >= 100) return 'Perfect day! All goals completed!'
    if (p >= 75) return 'Almost there! Just a little more!'
    if (p >= 50) return 'Great progress! Keep it up!'
    if (p >= 25) return "Good start! You're on your way!"
    return "Let's crush some goals today!"
  }

  const addCustomGoal = async (title: string, description: string) => {
    const goal = await api.createCustomGoal({ title, description })
    customGoals.value.unshift({ id: String(goal.id), title: goal.title, description: goal.description ?? '', completed: goal.completed })
  }

  const toggleCustomGoal = async (id: string) => {
    const goal = customGoals.value.find((g) => g.id === id)
    if (!goal) return
    const updated = await api.updateCustomGoal(+id, { completed: !goal.completed })
    goal.completed = updated.completed
  }

  const deleteCustomGoal = async (id: string) => {
    await api.deleteCustomGoal(+id)
    customGoals.value = customGoals.value.filter((g) => g.id !== id)
  }

  return {
    loading,
    dailyGoals,
    weeklyChallenges,
    milestones,
    customGoals,
    fetchGoals,
    completedGoals,
    dailyProgress,
    todayXP,
    daysRemaining,
    completedChallenges,
    completedMilestones,
    getGoalProgress,
    getChallengeProgress,
    getDailyMessage,
    addCustomGoal,
    toggleCustomGoal,
    deleteCustomGoal,
  }
}
