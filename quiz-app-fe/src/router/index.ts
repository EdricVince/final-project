import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import { useAuthStore } from '@/stores/auth.store'
import { AUTH_ROUTES } from './auth.route'
import { UserRole } from '@/types/role'

// Teacher routes
const TEACHER_ROUTES = {
  path: '/teacher',
  component: () => import('@/layouts/TeacherLayout.vue'),
  meta: { requiresAuth: true, requiredRole: UserRole.TEACHER },
  children: [
    {
      path: '',
      redirect: '/teacher/dashboard',
    },
    {
      path: 'dashboard',
      name: 'TeacherDashboard',
      component: () => import('@/pages/teacher/TeacherDashboardPage.vue'),
    },
    {
      path: 'classes',
      name: 'TeacherClasses',
      component: () => import('@/pages/teacher/ClassesPage.vue'),
    },
    {
      path: 'classes/:id',
      name: 'TeacherClassDetail',
      component: () => import('@/pages/teacher/ClassDetailPage.vue'),
    },
    {
      path: 'videos',
      name: 'TeacherVideos',
      component: () => import('@/pages/teacher/VideosPage.vue'),
    },
    {
      path: 'tests',
      name: 'TeacherTests',
      component: () => import('@/pages/teacher/TestsPage.vue'),
    },
    {
      path: 'tests/new',
      name: 'TeacherTestBuilder',
      component: () => import('@/pages/teacher/TestBuilderPage.vue'),
    },
    {
      path: 'tests/:id/edit',
      name: 'TeacherTestEdit',
      component: () => import('@/pages/teacher/TestBuilderPage.vue'),
    },
    {
      path: 'tests/:id/results',
      name: 'TeacherTestResults',
      component: () => import('@/pages/teacher/TestResultsPage.vue'),
    },
    {
      path: 'students',
      name: 'TeacherStudents',
      component: () => import('@/pages/teacher/StudentsPage.vue'),
    },
  ],
}

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  ...AUTH_ROUTES,
  TEACHER_ROUTES,
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
        component: () => import('@/pages/CourseExplorePage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'courses/:id',
        name: 'CourseDetail',
        component: () => import('@/pages/CourseDetailPage.vue'),
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
        component: () => import('@/pages/GoalsPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'achievements',
        name: 'Achievements',
        component: () => import('@/pages/AchievementsPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/pages/StatisticsPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/SettingsPage.vue'),
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

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Check if route requires guest (not logged in)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  // Check if route requires specific role
  if (to.meta.requiredRole) {
    const requiredRole = to.meta.requiredRole as number
    const userRole = authStore.userRole

    if (userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (userRole === UserRole.TEACHER) {
        next('/teacher/dashboard')
      } else {
        next('/dashboard')
      }
      return
    }
  }

  next()
})

export default router
