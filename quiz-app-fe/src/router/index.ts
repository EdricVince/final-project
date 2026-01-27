import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import { useAuthStore } from '@/stores/auth.store'
import { AUTH_ROUTES } from './auth.route'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  ...AUTH_ROUTES,
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardPage,
        meta: { requiresAuth: false },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: false },
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('@/pages/MyCoursesPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'courses/explore',
        name: 'ExploreCourses',
        component: () => import('@/pages/ComingSoonPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'courses/:id',
        name: 'CourseDetail',
        component: () => import('@/pages/ComingSoonPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'flashcards',
        name: 'Flashcards',
        component: () => import('@/pages/FlashcardsPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'flashcards/:id',
        name: 'FlashcardDeck',
        component: () => import('@/pages/FlashcardDeckPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'flashcards/:id/study',
        name: 'FlashcardStudy',
        component: () => import('@/pages/FlashcardStudyPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'quizzes',
        name: 'Quizzes',
        component: () => import('@/pages/QuizzesPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'quizzes/multiple-choice',
        name: 'MultipleChoiceQuiz',
        component: () => import('@/pages/quiz/MultipleChoiceQuiz.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'quizzes/word-scramble',
        name: 'WordScrambleQuiz',
        component: () => import('@/pages/quiz/WordScrambleQuiz.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'quizzes/matching-pairs',
        name: 'MatchingPairsQuiz',
        component: () => import('@/pages/quiz/MatchingPairsQuiz.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'quizzes/speed-round',
        name: 'SpeedRoundQuiz',
        component: () => import('@/pages/quiz/SpeedRoundQuiz.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'quizzes/true-false',
        name: 'TrueFalseQuiz',
        component: () => import('@/pages/quiz/TrueFalseQuiz.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'goals',
        name: 'Goals',
        component: () => import('@/pages/ComingSoonPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'achievements',
        name: 'Achievements',
        component: () => import('@/pages/ComingSoonPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/pages/ComingSoonPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/ComingSoonPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'help',
        name: 'Help',
        component: () => import('@/pages/ComingSoonPage.vue'),
        meta: { requiresAuth: false },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
