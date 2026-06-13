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
import ProfileAvatarCard from '@/components/profile/ProfileAvatarCard.vue'
import ProfileSocialLinksCard from '@/components/profile/ProfileSocialLinksCard.vue'
import PersonalInformationCard from '@/components/profile/PersonalInformationCard.vue'
import ProfileBioCard from '@/components/profile/ProfileBioCard.vue'
import ProfileLearningStatsCard from '@/components/profile/ProfileLearningStatsCard.vue'
import ProfileRecentActivityCard from '@/components/profile/ProfileRecentActivityCard.vue'
import ProfileAchievementsShowcase from '@/components/profile/ProfileAchievementsShowcase.vue'
import SocialLinkModal from '@/components/profile/SocialLinkModal.vue'

import { useProfile } from '@/composables'

const {
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
} = useProfile()
</script>
