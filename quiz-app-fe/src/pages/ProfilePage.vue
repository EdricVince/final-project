<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">Your Profile</h1>
      <p class="text-muted-foreground mt-2 text-base">Manage your personal information and settings</p>
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
            :stats="stats"
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

        <!-- Achievements Card -->
        <div class="animate-fade-in-up delay-200">
          <ProfileAchievementsCard :achievements="achievements" />
        </div>
      </div>

      <!-- Right Column - Editable Info -->
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

        <!-- Learning Preferences -->
        <div class="animate-fade-in-up delay-300">
          <LearningPreferencesCard
            :preferences="preferences"
            @update:preferences="Object.assign(preferences, $event)"
          />
        </div>

        <!-- Danger Zone -->
        <div class="animate-fade-in-up delay-400">
          <ProfileDangerZoneCard
            @sign-out="handleSignOut"
            @delete-account="handleDeleteAccount"
          />
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
import { Star, Medal, Crown, Rocket, Zap, Target } from 'lucide-vue-next'

import ProfileAvatarCard from '@/components/profile/ProfileAvatarCard.vue'
import ProfileSocialLinksCard from '@/components/profile/ProfileSocialLinksCard.vue'
import ProfileAchievementsCard from '@/components/profile/ProfileAchievementsCard.vue'
import PersonalInformationCard from '@/components/profile/PersonalInformationCard.vue'
import ProfileBioCard from '@/components/profile/ProfileBioCard.vue'
import LearningPreferencesCard from '@/components/profile/LearningPreferencesCard.vue'
import ProfileDangerZoneCard from '@/components/profile/ProfileDangerZoneCard.vue'
import SocialLinkModal from '@/components/profile/SocialLinkModal.vue'

import type {
  ProfileData,
  ProfileStats,
  ProfileEditForm,
  Achievement,
  LearningPreferences,
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

// Stats
const stats = reactive<ProfileStats>({
  courses: 12,
  streak: 7,
  xp: 2450,
})

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

// Achievements
const achievements: Achievement[] = [
  { id: 1, name: 'First Steps', icon: Star, earned: true },
  { id: 2, name: 'Quiz Master', icon: Medal, earned: true },
  { id: 3, name: 'Week Warrior', icon: Crown, earned: true },
  { id: 4, name: 'Speed Demon', icon: Rocket, earned: true },
  { id: 5, name: 'Power User', icon: Zap, earned: false },
  { id: 6, name: 'Goal Crusher', icon: Target, earned: false },
]

// Preferences
const preferences = reactive<LearningPreferences>({
  dailyGoal: 20,
  reminder: true,
  reminderTime: '09:00',
  language: 'en',
  theme: 'system',
})

// Danger zone handlers
const handleSignOut = () => {
  console.log('Sign out')
}

const handleDeleteAccount = () => {
  console.log('Delete account')
}
</script>
