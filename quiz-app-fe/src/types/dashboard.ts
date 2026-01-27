import type { Component } from 'vue'

export interface DashboardStats {
  streak: number
  cardsLearned: number
  quizzesCompleted: number
  totalXP: number
}

export interface DashboardCourse {
  id: number
  title: string
  progress: number
  icon: Component
}

export interface DashboardFlashcard {
  id: number
  question: string
  difficulty: string
  lastStudied: string
}

export interface StudyMode {
  id: number
  title: string
  description: string
  icon: Component
}

export interface DayActivity {
  name: string
  percent: number
}

export interface BadgeItem {
  id: number
  name: string
  icon: Component
}
