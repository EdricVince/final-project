<template>
  <div class="bg-background flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="bg-sidebar border-sidebar-border flex flex-col border-r transition-all duration-300 ease-in-out"
      :class="[isCollapsed ? 'w-20' : 'w-64']"
    >
      <!-- Logo -->
      <div class="border-sidebar-border flex h-16 items-center border-b px-4">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="bg-sidebar-primary text-sidebar-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Sparkles class="h-5 w-5" />
          </div>
          <span
            class="text-sidebar-foreground whitespace-nowrap text-xl font-bold tracking-tight transition-opacity duration-300"
            :class="[isCollapsed ? 'opacity-0' : 'opacity-100']"
          >
            StudySpark
          </span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-3">
        <div v-for="section in menuSections" :key="section.title" class="mb-6">
          <p
            v-if="!isCollapsed"
            class="text-sidebar-foreground/50 mb-2 px-3 text-xs font-semibold uppercase tracking-wider"
          >
            {{ section.title }}
          </p>
          <div v-else class="border-sidebar-border mb-2 border-t"></div>

          <router-link
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            class="nav-item group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
            :class="[
              isActiveRoute(item.path)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            ]"
          >
            <!-- Active indicator -->
            <div
              v-if="isActiveRoute(item.path)"
              class="bg-sidebar-primary absolute left-0 h-6 w-1 rounded-r-full"
            ></div>

            <component
              :is="item.icon"
              class="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            <span
              class="whitespace-nowrap transition-opacity duration-300"
              :class="[isCollapsed ? 'opacity-0' : 'opacity-100']"
            >
              {{ item.label }}
            </span>

            <!-- Tooltip when collapsed -->
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
          @click="toggleSidebar"
        >
          <component
            :is="isCollapsed ? PanelLeftOpen : PanelLeftClose"
            class="h-5 w-5 shrink-0"
          />
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
        <!-- Left: Breadcrumb / Page Title -->
        <div class="flex items-center gap-4">
          <button
            class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors lg:hidden"
            @click="toggleSidebar"
          >
            <Menu class="h-5 w-5" />
          </button>
          <div>
            <h1 class="text-foreground text-lg font-semibold">{{ currentPageTitle }}</h1>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-3">
          <!-- Search -->
          <button class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors">
            <Search class="h-5 w-5" />
          </button>

          <!-- Notifications -->
          <button class="text-muted-foreground hover:text-foreground hover:bg-accent relative rounded-lg p-2 transition-colors">
            <Bell class="h-5 w-5" />
            <span class="bg-destructive absolute top-1.5 right-1.5 h-2 w-2 rounded-full"></span>
          </button>

          <!-- Divider -->
          <div class="bg-border h-8 w-px"></div>

          <!-- User Dropdown -->
          <div class="relative" ref="dropdownRef">
            <button
              class="hover:bg-accent flex items-center gap-3 rounded-xl p-2 transition-colors"
              @click="toggleDropdown"
            >
              <div class="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                {{ userInitials }}
              </div>
              <div class="hidden text-left sm:block">
                <p class="text-foreground text-sm font-medium">{{ userName }}</p>
                <p class="text-muted-foreground text-xs">{{ userEmail }}</p>
              </div>
              <ChevronDown
                class="text-muted-foreground hidden h-4 w-4 transition-transform duration-200 sm:block"
                :class="{ 'rotate-180': isDropdownOpen }"
              />
            </button>

            <!-- Dropdown Menu -->
            <Transition name="dropdown">
              <div
                v-if="isDropdownOpen"
                class="bg-popover border-border absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-lg"
              >
                <div class="border-border border-b p-3">
                  <p class="text-foreground text-sm font-medium">{{ userName }}</p>
                  <p class="text-muted-foreground text-xs">{{ userEmail }}</p>
                </div>
                <div class="p-2">
                  <router-link
                    v-for="item in dropdownItems"
                    :key="item.path"
                    :to="item.path"
                    class="text-foreground hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                    @click="isDropdownOpen = false"
                  >
                    <component :is="item.icon" class="text-muted-foreground h-4 w-4" />
                    {{ item.label }}
                  </router-link>
                </div>
                <div class="border-border border-t p-2">
                  <button
                    class="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                    @click="handleLogout"
                  >
                    <LogOut class="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="bg-background flex-1 overflow-y-auto">
        <router-view v-slot="{ Component, route }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Layers,
  Trophy,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronDown,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Gamepad2,
  Target,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Sidebar state
const isCollapsed = ref(false)
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// Dropdown state
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// User data - get from auth store
const userName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]
  return 'Guest'
})
const userEmail = computed(() => authStore.user?.email || 'guest@example.com')
const userInitials = computed(() => {
  const name = userName.value
  const names = name.split(' ')
  if (names.length > 1) {
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return name.slice(0, 2).toUpperCase()
})

// Navigation menu
const menuSections = [
  {
    title: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/courses', label: 'My Courses', icon: BookOpen },
      { path: '/flashcards', label: 'Flashcards', icon: Layers },
      { path: '/quizzes', label: 'Quizzes', icon: Gamepad2 },
    ],
  },
  {
    title: 'Progress',
    items: [
      { path: '/goals', label: 'Goals', icon: Target },
      { path: '/achievements', label: 'Achievements', icon: Trophy },
      { path: '/statistics', label: 'Statistics', icon: BarChart3 },
    ],
  },
]

// Dropdown menu items
const dropdownItems = [
  { path: '/profile', label: 'My Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
]

// Check active route
const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Current page title
const currentPageTitle = computed(() => {
  const allItems = menuSections.flatMap(s => s.items)
  const current = allItems.find(item => isActiveRoute(item.path))
  return current?.label || 'Dashboard'
})

// Page transition
const transitionName = ref('page-slide')
const previousPath = ref('')

watch(
  () => route.path,
  (newPath, oldPath) => {
    previousPath.value = oldPath || ''
    // Could add logic to determine slide direction based on menu order
  }
)

// Logout handler
const handleLogout = () => {
  isDropdownOpen.value = false
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Nav item hover effect */
.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.nav-item:hover::before {
  opacity: 1;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Page transitions */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Fade transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
