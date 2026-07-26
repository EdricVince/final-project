<template>
  <div class="bg-background flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="bg-sidebar border-sidebar-border flex flex-col overflow-hidden border-r transition-all duration-300 ease-in-out"
      :class="[isCollapsed ? 'w-20' : 'w-64']"
    >
      <!-- Logo -->
      <div class="border-sidebar-border flex h-16 items-center border-b px-4">
        <div
          class="flex cursor-pointer items-center gap-3 overflow-hidden"
          @click="router.push('/teacher/dashboard')"
        >
          <div class="bg-sidebar-primary text-sidebar-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Sparkles class="h-5 w-5" />
          </div>
          <div
            class="flex flex-col whitespace-nowrap transition-opacity duration-300"
            :class="[isCollapsed ? 'opacity-0' : 'opacity-100']"
          >
            <span class="text-sidebar-foreground text-base font-bold leading-tight tracking-tight">StudySpark</span>
            <span class="text-primary text-xs font-semibold">Teacher Portal</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-3">
        <div class="mb-4">
          <p
            v-if="!isCollapsed"
            class="text-sidebar-foreground/50 mb-2 px-3 text-xs font-semibold uppercase tracking-wider"
          >
            Management
          </p>
          <div v-else class="border-sidebar-border mb-2 border-t"></div>

          <router-link
            v-for="item in mainNavItems"
            :key="item.path"
            :to="item.path"
            class="nav-item group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
            :class="[
              isActive(item.path)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            ]"
          >
            <div
              v-if="isActive(item.path)"
              class="bg-sidebar-primary absolute left-0 h-6 w-1 rounded-r-full"
            ></div>
            <component :is="item.icon" class="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span
              class="whitespace-nowrap transition-opacity duration-300"
              :class="[isCollapsed ? 'opacity-0' : 'opacity-100']"
            >
              {{ item.label }}
            </span>
            <div
              v-if="isCollapsed"
              class="bg-sidebar-foreground text-sidebar pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
            >
              {{ item.label }}
            </div>
          </router-link>
        </div>

        <div>
          <p
            v-if="!isCollapsed"
            class="text-sidebar-foreground/50 mb-2 px-3 text-xs font-semibold uppercase tracking-wider"
          >
            Content
          </p>
          <div v-else class="border-sidebar-border mb-2 border-t"></div>

          <router-link
            v-for="item in contentNavItems"
            :key="item.path"
            :to="item.path"
            class="nav-item group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
            :class="[
              isActive(item.path)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            ]"
          >
            <div
              v-if="isActive(item.path)"
              class="bg-sidebar-primary absolute left-0 h-6 w-1 rounded-r-full"
            ></div>
            <component :is="item.icon" class="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span
              class="whitespace-nowrap transition-opacity duration-300"
              :class="[isCollapsed ? 'opacity-0' : 'opacity-100']"
            >
              {{ item.label }}
            </span>
            <div
              v-if="isCollapsed"
              class="bg-sidebar-foreground text-sidebar pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
            >
              {{ item.label }}
            </div>
          </router-link>
        </div>
      </nav>

      <!-- Collapse Button -->
      <div class="border-sidebar-border border-t p-3">
        <button
          class="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
          @click="isCollapsed = !isCollapsed"
        >
          <component :is="isCollapsed ? PanelLeftOpen : PanelLeftClose" class="h-5 w-5 shrink-0" />
          <span
            class="whitespace-nowrap transition-opacity duration-300"
            :class="[isCollapsed ? 'opacity-0' : 'opacity-100']"
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-card border-border flex h-16 shrink-0 items-center justify-between border-b px-6">
        <!-- Left: Page Title -->
        <div class="flex items-center gap-4">
          <button
            class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors lg:hidden"
            @click="isCollapsed = !isCollapsed"
          >
            <Menu class="h-5 w-5" />
          </button>
          <h1 class="text-foreground text-lg font-semibold">{{ currentPageTitle }}</h1>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-3">
          <!-- Class count badge -->
          <div class="hidden items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 sm:flex">
            <BookOpen class="text-primary h-3.5 w-3.5" />
            <span class="text-primary text-sm font-semibold">Teacher</span>
          </div>

          <!-- Divider -->
          <div class="bg-border h-8 w-px"></div>

          <!-- User Dropdown -->
          <div class="relative" ref="dropdownRef">
            <button
              class="hover:bg-accent flex items-center gap-3 rounded-xl p-2 transition-colors"
              @click="isDropdownOpen = !isDropdownOpen"
            >
              <div class="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                {{ userInitials }}
              </div>
              <div class="hidden text-left sm:block">
                <p class="text-foreground text-sm font-medium">{{ userName }}</p>
                <p class="text-muted-foreground text-xs">Teacher</p>
              </div>
              <ChevronDown
                class="text-muted-foreground hidden h-4 w-4 transition-transform duration-200 sm:block"
                :class="{ 'rotate-180': isDropdownOpen }"
              />
            </button>

            <Transition name="dropdown">
              <div
                v-if="isDropdownOpen"
                class="bg-popover border-border absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border shadow-lg"
              >
                <div class="border-border border-b p-3">
                  <p class="text-foreground text-sm font-medium">{{ userName }}</p>
                  <p class="text-muted-foreground text-xs">Teacher Account</p>
                </div>
                <div class="p-2">
                  <router-link
                    to="/dashboard"
                    class="text-foreground hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                    @click="isDropdownOpen = false"
                  >
                    <LayoutDashboard class="text-muted-foreground h-4 w-4" />
                    Student View
                  </router-link>
                </div>
                <div class="border-border border-t p-2">
                  <button
                    class="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                    @click="handleLogout"
                  >
                    <LogOut class="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="bg-background flex-1 overflow-y-auto">
        <router-view :key="locale" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Video,
  Languages,
  GraduationCap,
  Upload,
  Menu,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart2,
} from '@/components/icons'
import { useAuthStore } from '@/stores/auth.store'

const { locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const mainNavItems = [
  { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/teacher/classes', label: 'Classes', icon: BookOpen },
  { path: '/teacher/students', label: 'Students', icon: Users },
  { path: '/teacher/analytics', label: 'Analytics', icon: BarChart2 },
]

const contentNavItems = [
  { path: '/teacher/lessons', label: 'Lessons', icon: GraduationCap },
  { path: '/teacher/vocabulary', label: 'Vocabulary', icon: Languages },
  { path: '/teacher/tests', label: 'Tests', icon: FileText },
  { path: '/teacher/videos', label: 'Videos', icon: Video },
  { path: '/teacher/import', label: 'AI Import', icon: Upload },
]

const pageTitles: Record<string, string> = {
  '/teacher/dashboard': 'Dashboard',
  '/teacher/classes': 'Classes',
  '/teacher/students': 'Students',
  '/teacher/analytics': 'Analytics',
  '/teacher/lessons': 'Lessons',
  '/teacher/vocabulary': 'Vocabulary',
  '/teacher/tests': 'Tests',
  '/teacher/videos': 'Videos',
  '/teacher/import': 'AI Import',
}

const currentPageTitle = computed(() => {
  const path = route.path
  for (const [key, title] of Object.entries(pageTitles)) {
    if (path === key || path.startsWith(key + '/')) return title
  }
  return 'Teacher Portal'
})

const userName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0] ?? 'Teacher'
  return 'Teacher'
})

const userInitials = computed(() => {
  const name = userName.value
  const parts = name.split(' ')
  return parts.map((p: string) => p[0] ?? '').join('').toUpperCase().slice(0, 2)
})

const isActive = (path: string) =>
  route.path === path || route.path.startsWith(path + '/')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
