import type { Component } from 'vue'

export interface SocialLink {
  platform: string
  url: string
}

export interface ProfileData {
  avatar: string
  fullName: string
  username: string
  email: string
  phone: string
  title: string
  location: string
  bio: string
  socialLinks: SocialLink[]
}

export interface ProfileStats {
  courses: number
  streak: number
  xp: number
}

export interface ProfileEditForm {
  fullName: string
  username: string
  email: string
  phone: string
  title: string
  location: string
  bio: string
}

export interface Achievement {
  id: number
  name: string
  icon: Component
  earned: boolean
}

export interface LearningPreferences {
  dailyGoal: number
  reminder: boolean
  reminderTime: string
  language: string
  theme: string
}

export interface ThemeOption {
  value: string
  label: string
  icon: Component
}

export interface SocialLinkForm {
  platform: string
  url: string
}
