<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">Your Profile</h1>
      <p class="text-muted-foreground mt-2 text-base">View your learning journey and manage your profile</p>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
      <!-- Left Column - Avatar & Quick Info -->
      <div class="space-y-6">
        <!-- Avatar Card -->
        <div class="animate-fade-in-up">
          <ProfileAvatarCard
            :avatar="profile.avatar"
            :full-name="profile.fullName"
            :title="profile.title"
            :stats="avatarStats"
            @change-cover="changeCover"
            @avatar-change="handleAvatarChange"
          />
        </div>

        <!-- Social Links Card -->
        <div class="animate-fade-in-up delay-100">
          <ProfileSocialLinksCard
            :social-links="profile.socialLinks"
            @add="addSocialLink"
            @edit="editSocialLink"
            @remove="removeSocialLink"
          />
        </div>

        <!-- Achievements Showcase -->
        <div class="animate-fade-in-up delay-200">
          <ProfileAchievementsShowcase :achievements="achievements" />
        </div>
      </div>

      <!-- Right Column - Info & Stats -->
      <div class="space-y-6 xl:col-span-2">
        <!-- Personal Information -->
        <div class="animate-fade-in-up delay-100">
          <PersonalInformationCard
            :profile="profile"
            :edit-form="editForm"
            :is-editing="isEditing"
            @start-editing="startEditing"
            @cancel-editing="cancelEditing"
            @save-profile="saveProfile"
            @update:edit-form="Object.assign(editForm, $event)"
          />
        </div>

        <!-- Bio Section -->
        <div class="animate-fade-in-up delay-200">
          <ProfileBioCard
            :bio="profile.bio"
            :edit-bio="editForm.bio"
            :is-editing="isEditing"
            :max-length="maxBioLength"
            @update:edit-bio="editForm.bio = $event"
          />
        </div>

        <!-- Learning Stats -->
        <div class="animate-fade-in-up delay-300">
          <ProfileLearningStatsCard :stats="learningStats" />
        </div>

        <!-- Recent Activity -->
        <div class="animate-fade-in-up delay-400">
          <ProfileRecentActivityCard :activities="recentActivities" />
        </div>
      </div>
    </div>

    <!-- Social Link Modal -->
    <SocialLinkModal
      :show="showSocialModal"
      :form="socialForm"
      :is-editing="editingSocialIndex !== null"
      @close="closeSocialModal"
      @save="saveSocialLink"
      @update:form="Object.assign(socialForm, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
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
import ProfileAvatarCard from '@/components/profile/ProfileAvatarCard.vue'
import ProfileSocialLinksCard from '@/components/profile/ProfileSocialLinksCard.vue'
import PersonalInformationCard from '@/components/profile/PersonalInformationCard.vue'
import ProfileBioCard from '@/components/profile/ProfileBioCard.vue'
import ProfileLearningStatsCard, { type LearningStats } from '@/components/profile/ProfileLearningStatsCard.vue'
import ProfileRecentActivityCard, { type RecentActivity } from '@/components/profile/ProfileRecentActivityCard.vue'
import ProfileAchievementsShowcase, { type ShowcaseAchievement } from '@/components/profile/ProfileAchievementsShowcase.vue'
import SocialLinkModal from '@/components/profile/SocialLinkModal.vue'

import type {
  ProfileData,
  ProfileStats,
  ProfileEditForm,
  SocialLinkForm,
} from '@/types/profile'

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

// Avatar stats (for ProfileAvatarCard)
const avatarStats = reactive<ProfileStats>({
  courses: 12,
  streak: 21,
  xp: 2450,
})

// Learning stats (for ProfileLearningStatsCard)
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
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    type: 'lesson',
    title: 'Learned 15 new vocabulary words',
    description: 'Advanced English - Business Terms',
    xp: 30,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    type: 'streak',
    title: '21 Day Streak Achieved!',
    description: 'Keep up the great work!',
    xp: 100,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Unlocked "Quiz Master" Badge',
    description: 'Complete 50 quizzes',
    xp: 75,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: '5',
    type: 'review',
    title: 'Reviewed 50 flashcards',
    description: 'Daily review session completed',
    xp: 25,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
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

// Avatar handlers
const handleAvatarChange = (avatar: string) => {
  profile.avatar = avatar
}

const changeCover = () => {
  console.log('Change cover')
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
}

// Social links
const showSocialModal = ref(false)
const editingSocialIndex = ref<number | null>(null)
const socialForm = reactive<SocialLinkForm>({
  platform: '',
  url: '',
})

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
}

const saveSocialLink = () => {
  if (!socialForm.platform || !socialForm.url) return

  if (editingSocialIndex.value !== null) {
    profile.socialLinks[editingSocialIndex.value] = {
      platform: socialForm.platform,
      url: socialForm.url,
    }
  } else {
    profile.socialLinks.push({
      platform: socialForm.platform,
      url: socialForm.url,
    })
  }
  closeSocialModal()
}

const closeSocialModal = () => {
  showSocialModal.value = false
  editingSocialIndex.value = null
}
</script>
