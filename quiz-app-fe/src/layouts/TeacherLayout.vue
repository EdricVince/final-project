<template>
  <div class="bg-background flex min-h-screen">
    <!-- Sidebar -->
    <aside
      class="bg-card border-border fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r transition-transform lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo -->
      <div class="border-border flex h-16 items-center gap-3 border-b px-6">
        <div class="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
          <GraduationCap class="text-primary-foreground h-6 w-6" />
        </div>
        <div>
          <span class="text-foreground text-lg font-bold">StudySpark</span>
          <span class="text-primary ml-1 text-xs font-medium">Teacher</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
          :class="
            isActive(item.path)
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          "
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </router-link>
      </nav>

      <!-- User Section -->
      <div class="border-border border-t p-4">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            <span class="text-primary font-semibold">{{ userInitials }}</span>
          </div>
          <div class="flex-1 truncate">
            <p class="text-foreground truncate text-sm font-medium">{{ userName }}</p>
            <p class="text-muted-foreground text-xs">Teacher</p>
          </div>
          <button
            class="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors hover:bg-accent"
            @click="handleLogout"
          >
            <LogOut class="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 lg:ml-64">
      <!-- Top Bar -->
      <header class="bg-card/80 border-border sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-sm lg:px-6">
        <button
          class="text-muted-foreground hover:text-foreground lg:hidden"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <Menu class="h-6 w-6" />
        </button>

        <div class="flex-1"></div>

        <!-- Quick Actions -->
        <router-link
          to="/dashboard"
          class="text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ $t('nav.items.dashboard') }}
        </router-link>
      </header>

      <!-- Page Content -->
      <main class="min-h-[calc(100vh-4rem)]">
        <router-view :key="locale" />
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="isSidebarOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Video,
  FileText,
  BookOpen,
  Menu,
  LogOut,
  ArrowLeft,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)

const navItems = computed(() => [
  { path: '/teacher/dashboard', label: t('teacher.dashboard.title'), icon: LayoutDashboard },
  { path: '/teacher/classes', label: t('teacher.classes.title'), icon: BookOpen },
  { path: '/teacher/students', label: t('teacher.students.title'), icon: Users },
  { path: '/teacher/tests', label: t('teacher.tests.title'), icon: FileText },
])

const userName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]
  return 'Teacher'
})

const userInitials = computed(() => {
  const name = userName.value
  const parts = name.split(' ')
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
})

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
