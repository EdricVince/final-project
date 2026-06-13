<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Welcome back, Admin</h2>
        <p class="text-sm text-slate-500 mt-0.5">Here's what's happening on your platform today.</p>
      </div>
      <button
        @click="refresh"
        :disabled="refreshing"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
      >
        <svg class="w-4 h-4" :class="{ 'animate-spin': refreshing }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Stats Grid -->
    <div v-if="adminStore.stats" class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        label="Total Users"
        :value="adminStore.stats.total"
        color="indigo"
        icon="users"
      />
      <StatCard
        label="Students"
        :value="adminStore.stats.students"
        color="blue"
        icon="student"
      />
      <StatCard
        label="Teachers"
        :value="adminStore.stats.teachers"
        color="violet"
        icon="teacher"
      />
      <StatCard
        label="Active Accounts"
        :value="adminStore.stats.active"
        color="emerald"
        icon="check"
      />
      <StatCard
        label="New This Week"
        :value="adminStore.stats.newThisWeek"
        color="amber"
        icon="sparkle"
      />
    </div>

    <!-- Skeleton stats -->
    <div v-else class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="i" class="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
    </div>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Users -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 class="text-sm font-semibold text-slate-700">Recent Registrations</h3>
          <RouterLink to="/admin/users" class="text-xs text-indigo-600 font-medium hover:underline">View all</RouterLink>
        </div>
        <div v-if="adminStore.loading" class="p-5 space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
              <div class="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>
        <div v-else-if="recentUsers.length" class="divide-y divide-slate-50">
          <div
            v-for="user in recentUsers"
            :key="user.id"
            class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition"
          >
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="user.role_id === 2 ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ initials(user.name ?? user.email) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800 truncate">{{ user.name ?? '—' }}</p>
              <p class="text-xs text-slate-400 truncate">{{ user.email }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                :class="user.role_id === 2 ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'"
              >{{ user.role_id === 2 ? 'Teacher' : 'Student' }}</span>
              <span class="text-[10px] text-slate-400">{{ formatDate(user.created_at) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="px-5 py-10 text-center text-sm text-slate-400">No users yet</div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h3>
          <div class="space-y-2.5">
            <RouterLink
              to="/admin/teachers"
              class="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Teacher Account
            </RouterLink>
            <RouterLink
              to="/admin/users"
              class="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage All Users
            </RouterLink>
            <RouterLink
              to="/admin/students"
              class="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              View Students
            </RouterLink>
          </div>
        </div>

        <!-- Role Distribution -->
        <div v-if="adminStore.stats" class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">User Distribution</h3>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-500">Students</span>
                <span class="font-semibold text-slate-700">{{ adminStore.stats.students }}</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500 rounded-full transition-all"
                  :style="{ width: adminStore.stats.total ? (adminStore.stats.students / adminStore.stats.total * 100) + '%' : '0%' }"
                />
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-500">Teachers</span>
                <span class="font-semibold text-slate-700">{{ adminStore.stats.teachers }}</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-violet-500 rounded-full transition-all"
                  :style="{ width: adminStore.stats.total ? (adminStore.stats.teachers / adminStore.stats.total * 100) + '%' : '0%' }"
                />
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-500">Active Rate</span>
                <span class="font-semibold text-slate-700">{{ adminStore.stats.total ? Math.round(adminStore.stats.active / adminStore.stats.total * 100) : 0 }}%</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-emerald-500 rounded-full transition-all"
                  :style="{ width: adminStore.stats.total ? (adminStore.stats.active / adminStore.stats.total * 100) + '%' : '0%' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useAdminStore } from '@/stores/admin.store'

const adminStore = useAdminStore()
const refreshing = ref(false)

const recentUsers = computed(() => [...adminStore.users].slice(0, 8))

function initials(str: string) {
  return str.split(/[\s.@_-]+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

async function refresh() {
  refreshing.value = true
  try {
    await Promise.all([adminStore.fetchStats(), adminStore.fetchUsers()])
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  if (!adminStore.stats) await adminStore.fetchStats()
  if (!adminStore.users.length) await adminStore.fetchUsers()
})

// Stat card component
interface StatCardProps { label: string; value: number; color: string; icon: string }

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
}

const StatCard = defineComponent<StatCardProps>({
  props: ['label', 'value', 'color', 'icon'],
  setup(props) {
    return () => h('div', { class: 'bg-white rounded-xl border border-slate-200 p-4' }, [
      h('div', { class: 'flex items-center justify-between mb-3' }, [
        h('span', { class: `inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm ${colorMap[props.color] ?? colorMap.indigo}` }, props.icon[0]?.toUpperCase()),
      ]),
      h('div', { class: 'text-2xl font-bold text-slate-800' }, props.value?.toLocaleString()),
      h('div', { class: 'text-xs text-slate-500 mt-0.5' }, props.label),
    ])
  },
})
</script>
