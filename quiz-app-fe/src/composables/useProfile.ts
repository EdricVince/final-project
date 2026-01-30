import { ref, reactive, computed } from 'vue'
import {
  Star,
  Trophy,
  BookOpen,
  Flame,
  Zap,
  Crown,
  Users,
  Heart,
  Sparkles,
  Rocket,
  Brain,
  GraduationCap,
} from 'lucide-vue-next'
import { useToast } from './useToast'
import type {
  ProfileData,
  ProfileStats,
  ProfileEditForm,
  SocialLinkForm,
} from '@/types/profile'
import type { Component } from 'vue'

export type ActivityType = 'lesson' | 'quiz' | 'achievement' | 'streak' | 'milestone' | 'review'
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface LearningStats {
  level: number
  levelTitle: string
  currentXP: number
  nextLevelXP: number
  totalXP: number
  wordsLearned: number
  quizzesCompleted: number
  studyHours: number
  currentStreak: number
  longestStreak: number
}

export interface RecentActivity {
  id: string
  type: ActivityType
  title: string
  description: string
  xp?: number
  timestamp: Date
}

export interface ShowcaseAchievement {
  id: string
  name: string
  description: string
  icon: Component
  rarity: AchievementRarity
  earned: boolean
  earnedAt?: Date
  progress?: number
  target?: number
}

export function useProfile() {
  const toast = useToast()

  // Profile data
  const profile = reactive<ProfileData>({
    avatar: '',
    fullName: 'Alex Johnson',
    username: 'alexj',
    email: 'alex@studyspark.com',
    phone: '+84 123 456 789',
    title: 'Software Developer',
    location: 'Ho Chi Minh City, Vietnam',
    bio: 'Passionate learner and tech enthusiast. Currently focusing on web development and machine learning. Love to share knowledge and help others grow.',
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/alexj' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/alexj' },
      { platform: 'Twitter', url: 'https://twitter.com/alexj' },
    ],
  })

  // Avatar stats
  const avatarStats = reactive<ProfileStats>({
    courses: 12,
    streak: 21,
    xp: 2450,
  })

  // Learning stats
  const learningStats = reactive<LearningStats>({
    level: 15,
    levelTitle: 'Knowledge Seeker',
    currentXP: 2450,
    nextLevelXP: 3000,
    totalXP: 12450,
    wordsLearned: 750,
    quizzesCompleted: 48,
    studyHours: 86,
    currentStreak: 21,
    longestStreak: 35,
  })

  // Recent activities
  const recentActivities = reactive<RecentActivity[]>([
    {
      id: '1',
      type: 'quiz',
      title: 'Completed JavaScript Basics Quiz',
      description: 'Scored 95% on the quiz',
      xp: 50,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      type: 'lesson',
      title: 'Learned 15 new vocabulary words',
      description: 'Advanced English - Business Terms',
      xp: 30,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      type: 'streak',
      title: '21 Day Streak Achieved!',
      description: 'Keep up the great work!',
      xp: 100,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Unlocked "Quiz Master" Badge',
      description: 'Complete 50 quizzes',
      xp: 75,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: '5',
      type: 'review',
      title: 'Reviewed 50 flashcards',
      description: 'Daily review session completed',
      xp: 25,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
    },
  ])

  // Achievements for showcase
  const achievements = reactive<ShowcaseAchievement[]>([
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: Star,
      rarity: 'common',
      earned: true,
      earnedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Word Collector',
      description: 'Learn 100 vocabulary words',
      icon: BookOpen,
      rarity: 'common',
      earned: true,
      earnedAt: new Date('2024-02-01'),
    },
    {
      id: '3',
      name: 'Knowledge Seeker',
      description: 'Learn 500 vocabulary words',
      icon: Brain,
      rarity: 'rare',
      earned: true,
      earnedAt: new Date('2024-03-10'),
    },
    {
      id: '4',
      name: 'Vocabulary Master',
      description: 'Learn 1000 vocabulary words',
      icon: GraduationCap,
      rarity: 'epic',
      earned: false,
      progress: 750,
      target: 1000,
    },
    {
      id: '5',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: Flame,
      rarity: 'common',
      earned: true,
      earnedAt: new Date('2024-01-22'),
    },
    {
      id: '6',
      name: 'Streak Champion',
      description: 'Maintain a 30-day streak',
      icon: Zap,
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
      rarity: 'legendary',
      earned: false,
      progress: 21,
      target: 100,
    },
    {
      id: '8',
      name: 'Team Player',
      description: 'Join a study group',
      icon: Users,
      rarity: 'common',
      earned: true,
      earnedAt: new Date('2024-02-15'),
    },
    {
      id: '9',
      name: 'Helpful Friend',
      description: 'Help 10 other learners',
      icon: Heart,
      rarity: 'rare',
      earned: false,
      progress: 6,
      target: 10,
    },
    {
      id: '10',
      name: 'Quiz Master',
      description: 'Complete 50 quizzes',
      icon: Trophy,
      rarity: 'common',
      earned: true,
      earnedAt: new Date('2024-03-01'),
    },
    {
      id: '11',
      name: 'Perfect Score',
      description: 'Get 100% on 10 quizzes',
      icon: Sparkles,
      rarity: 'epic',
      earned: true,
      earnedAt: new Date('2024-03-15'),
    },
    {
      id: '12',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 1 minute',
      icon: Rocket,
      rarity: 'rare',
      earned: true,
      earnedAt: new Date('2024-02-28'),
    },
  ])

  // Edit state
  const isEditing = ref(false)
  const editForm = reactive<ProfileEditForm>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    title: '',
    location: '',
    bio: '',
  })

  const maxBioLength = 300

  // Social link modal state
  const showSocialModal = ref(false)
  const editingSocialIndex = ref<number | null>(null)
  const socialForm = reactive<SocialLinkForm>({
    platform: '',
    url: '',
  })

  // Computed
  const userInitials = computed(() => {
    const names = profile.fullName.split(' ')
    return names.map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  })

  const levelProgress = computed(() => {
    return Math.min((learningStats.currentXP / learningStats.nextLevelXP) * 100, 100)
  })

  // Avatar handlers
  const handleAvatarChange = (avatar: string) => {
    profile.avatar = avatar
    toast.success('Avatar updated!')
  }

  const changeCover = () => {
    toast.info('Cover photo feature coming soon!')
  }

  // Edit profile
  const startEditing = () => {
    editForm.fullName = profile.fullName
    editForm.username = profile.username
    editForm.email = profile.email
    editForm.phone = profile.phone
    editForm.title = profile.title
    editForm.location = profile.location
    editForm.bio = profile.bio
    isEditing.value = true
  }

  const cancelEditing = () => {
    isEditing.value = false
  }

  const saveProfile = () => {
    profile.fullName = editForm.fullName
    profile.username = editForm.username
    profile.email = editForm.email
    profile.phone = editForm.phone
    profile.title = editForm.title
    profile.location = editForm.location
    profile.bio = editForm.bio
    isEditing.value = false
    toast.success('Profile updated successfully!')
  }

  // Social links
  const addSocialLink = () => {
    socialForm.platform = ''
    socialForm.url = ''
    editingSocialIndex.value = null
    showSocialModal.value = true
  }

  const editSocialLink = (index: number) => {
    const link = profile.socialLinks[index]
    if (!link) return
    socialForm.platform = link.platform
    socialForm.url = link.url
    editingSocialIndex.value = index
    showSocialModal.value = true
  }

  const removeSocialLink = (index: number) => {
    profile.socialLinks.splice(index, 1)
    toast.success('Social link removed!')
  }

  const saveSocialLink = () => {
    if (!socialForm.platform || !socialForm.url) {
      toast.error('Please fill in all fields!')
      return
    }

    if (editingSocialIndex.value !== null) {
      profile.socialLinks[editingSocialIndex.value] = {
        platform: socialForm.platform,
        url: socialForm.url,
      }
      toast.success('Social link updated!')
    } else {
      profile.socialLinks.push({
        platform: socialForm.platform,
        url: socialForm.url,
      })
      toast.success('Social link added!')
    }
    closeSocialModal()
  }

  const closeSocialModal = () => {
    showSocialModal.value = false
    editingSocialIndex.value = null
  }

  return {
    // State
    profile,
    avatarStats,
    learningStats,
    recentActivities,
    achievements,
    isEditing,
    editForm,
    maxBioLength,
    showSocialModal,
    editingSocialIndex,
    socialForm,
    // Computed
    userInitials,
    levelProgress,
    // Actions
    handleAvatarChange,
    changeCover,
    startEditing,
    cancelEditing,
    saveProfile,
    addSocialLink,
    editSocialLink,
    removeSocialLink,
    saveSocialLink,
    closeSocialModal,
  }
}
