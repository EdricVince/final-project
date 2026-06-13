<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">{{ pageTitle }}</h2>
        <p class="text-sm text-slate-500 mt-0.5">{{ filteredUsers.length }} {{ roleFilter === 'teacher' ? 'teachers' : roleFilter === 'student' ? 'students' : 'users' }} found</p>
      </div>
      <button
        v-if="roleFilter === 'teacher' || roleFilter === 'all'"
        @click="openCreateTeacher"
        class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Teacher
      </button>
    </div>

    <!-- Tabs + Search -->
    <div class="flex items-center gap-4 flex-wrap">
      <!-- Tabs -->
      <div class="flex bg-slate-100 rounded-lg p-1 gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="roleFilter = tab.value"
          class="px-3 py-1.5 text-xs font-semibold rounded-md transition"
          :class="roleFilter === tab.value
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'"
        >
          {{ tab.label }}
          <span class="ml-1 text-[10px] opacity-60">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Search -->
      <div class="relative flex-1 min-w-48 max-w-xs">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="search"
          placeholder="Search by name or email…"
          class="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="adminStore.loading" class="p-6 space-y-3">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-slate-100 rounded animate-pulse w-1/4" />
            <div class="h-2.5 bg-slate-100 rounded animate-pulse w-1/3" />
          </div>
          <div class="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
        </div>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="py-16 text-center">
        <svg class="w-12 h-12 mx-auto text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-sm text-slate-400">No users found</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">#</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">User</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Role</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">XP</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
            <th class="px-5 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            <th class="px-5 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr
            v-for="(user, idx) in filteredUsers"
            :key="user.id"
            class="hover:bg-slate-50/60 transition-colors"
          >
            <td class="px-5 py-3.5 text-xs text-slate-400">{{ idx + 1 }}</td>
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  :class="user.role_id === 2 ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ initials(user.name ?? user.email) }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-800 truncate">{{ user.name ?? '—' }}</p>
                  <p class="text-xs text-slate-400 truncate">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5 hidden md:table-cell">
              <span
                class="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                :class="user.role_id === 2 ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'"
              >{{ user.role_id === 2 ? 'Teacher' : 'Student' }}</span>
            </td>
            <td class="px-5 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
              {{ user.xp.toLocaleString() }} XP
            </td>
            <td class="px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-5 py-3.5 text-center">
              <button
                @click="toggleActive(user)"
                :disabled="togglingId === user.id"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50"
                :class="user.is_active ? 'bg-emerald-500' : 'bg-slate-300'"
                :title="user.is_active ? 'Deactivate' : 'Activate'"
              >
                <span
                  class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                  :class="user.is_active ? 'translate-x-4.5' : 'translate-x-0.5'"
                />
              </button>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="openResetPwd(user)"
                  class="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                  title="Reset password"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(user)"
                  class="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                  title="Delete user"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Create Teacher Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showCreateModal = false" />
          <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <!-- Modal header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 class="text-base font-semibold text-slate-800">Create Teacher Account</h3>
              <button @click="showCreateModal = false" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="px-6 py-5 space-y-4">
              <p class="text-xs text-slate-500">
                Create a teacher account for a verified instructor. They will receive login credentials to access the teacher portal.
              </p>

              <!-- Full Name -->
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1.5">Full Name <span class="text-red-400">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Nguyen Van A"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>

              <!-- Login Email (custom or auto) -->
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1.5">
                  Login Email
                  <span class="text-slate-400 font-normal ml-1">(optional — auto-generated if blank)</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  :placeholder="emailPreview"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <p class="mt-1 text-[11px] text-slate-400">
                  Auto: <span class="text-indigo-500 font-mono">{{ emailPreview }}</span>
                </p>
              </div>

              <!-- Password -->
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1.5">Initial Password <span class="text-red-400">*</span></label>
                <div class="relative">
                  <input
                    v-model="form.password"
                    :type="showFormPwd ? 'text' : 'password'"
                    placeholder="Min 8 characters"
                    class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition pr-10"
                  />
                  <button type="button" @click="showFormPwd = !showFormPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition" tabindex="-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path v-if="showFormPwd" stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Error -->
              <p v-if="formError" class="text-xs text-red-500 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ formError }}
              </p>

              <!-- Success -->
              <div v-if="createdEmail" class="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <svg class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="text-xs font-semibold text-emerald-700">Teacher account created!</p>
                  <p class="text-[11px] text-emerald-600 mt-0.5">Login email: <span class="font-mono">{{ createdEmail }}</span></p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                @click="showCreateModal = false"
                class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                {{ createdEmail ? 'Close' : 'Cancel' }}
              </button>
              <button
                v-if="!createdEmail"
                @click="submitCreateTeacher"
                :disabled="formLoading || !form.name.trim() || form.password.length < 8"
                class="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                <svg v-if="formLoading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ formLoading ? 'Creating…' : 'Create Account' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Reset Password Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="resetTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="resetTarget = null" />
          <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 class="text-base font-semibold text-slate-800">Reset Password</h3>
              <button @click="resetTarget = null" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <p class="text-sm text-slate-600">
                Set a new password for <span class="font-semibold">{{ resetTarget?.name ?? resetTarget?.email }}</span>
              </p>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1.5">New Password</label>
                <input
                  v-model="newPwd"
                  type="password"
                  placeholder="Min 8 characters"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                />
              </div>
              <p v-if="resetError" class="text-xs text-red-500">{{ resetError }}</p>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button @click="resetTarget = null" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
              <button
                @click="submitResetPwd"
                :disabled="resetLoading || newPwd.length < 8"
                class="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white rounded-lg transition"
              >
                <svg v-if="resetLoading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirm Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="deleteTarget = null" />
          <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div class="px-6 pt-6 pb-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-base font-semibold text-slate-800">Delete User?</h3>
              </div>
              <p class="text-sm text-slate-600">
                Are you sure you want to permanently delete <span class="font-semibold">{{ deleteTarget?.name ?? deleteTarget?.email }}</span>? This action cannot be undone.
              </p>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button @click="deleteTarget = null" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
              <button
                @click="submitDelete"
                :disabled="deleteLoading"
                class="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition"
              >
                <svg v-if="deleteLoading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore, type AdminUser, ROLE_TEACHER } from '@/stores/admin.store'

const route = useRoute()
const adminStore = useAdminStore()

// Determine default tab from route
const routeRole = computed(() => {
  if (route.path.includes('/students')) return 'student'
  if (route.path.includes('/teachers')) return 'teacher'
  return 'all'
})

const roleFilter = ref<'all' | 'student' | 'teacher'>(routeRole.value as 'all' | 'student' | 'teacher')
const search = ref('')
const togglingId = ref<number | null>(null)

const pageTitle = computed(() => {
  if (roleFilter.value === 'student') return 'Students'
  if (roleFilter.value === 'teacher') return 'Teachers'
  return 'All Users'
})

const tabs = computed(() => [
  { value: 'all', label: 'All', count: adminStore.users.length },
  { value: 'student', label: 'Students', count: adminStore.students.length },
  { value: 'teacher', label: 'Teachers', count: adminStore.teachers.length },
])

const filteredUsers = computed(() => {
  let list = adminStore.users
  if (roleFilter.value === 'student') list = adminStore.students
  if (roleFilter.value === 'teacher') list = adminStore.teachers
  const q = search.value.toLowerCase().trim()
  if (!q) return list
  return list.filter(u =>
    u.email.toLowerCase().includes(q) ||
    (u.name?.toLowerCase().includes(q) ?? false)
  )
})

function initials(str: string) {
  return str.split(/[\s.@_-]+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function toggleActive(user: AdminUser) {
  togglingId.value = user.id
  try {
    await adminStore.setActive(user.id, !user.is_active)
  } finally {
    togglingId.value = null
  }
}

// ── Create Teacher modal ─────────────────────────────────────────────────────
const showCreateModal = ref(false)
const showFormPwd = ref(false)
const formLoading = ref(false)
const formError = ref('')
const createdEmail = ref('')
const form = ref({ name: '', email: '', password: '' })

const emailPreview = computed(() => {
  const slug = form.value.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
  return slug ? `${slug}@teacher.sprk` : 'name.here@teacher.sprk'
})

function openCreateTeacher() {
  form.value = { name: '', email: '', password: '' }
  formError.value = ''
  createdEmail.value = ''
  showFormPwd.value = false
  showCreateModal.value = true
}

async function submitCreateTeacher() {
  if (!form.value.name.trim() || form.value.password.length < 8) return
  formLoading.value = true
  formError.value = ''
  try {
    const email = await adminStore.createTeacher(
      form.value.name.trim(),
      form.value.password,
      form.value.email.trim() || undefined,
    )
    createdEmail.value = email
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Failed to create teacher'
  } finally {
    formLoading.value = false
  }
}

// ── Reset Password modal ─────────────────────────────────────────────────────
const resetTarget = ref<AdminUser | null>(null)
const newPwd = ref('')
const resetLoading = ref(false)
const resetError = ref('')

function openResetPwd(user: AdminUser) {
  resetTarget.value = user
  newPwd.value = ''
  resetError.value = ''
}

async function submitResetPwd() {
  if (!resetTarget.value || newPwd.value.length < 8) return
  resetLoading.value = true
  resetError.value = ''
  try {
    await adminStore.resetPassword(resetTarget.value.id, newPwd.value)
    resetTarget.value = null
  } catch (e: unknown) {
    resetError.value = e instanceof Error ? e.message : 'Failed to reset password'
  } finally {
    resetLoading.value = false
  }
}

// ── Delete modal ─────────────────────────────────────────────────────────────
const deleteTarget = ref<AdminUser | null>(null)
const deleteLoading = ref(false)

function confirmDelete(user: AdminUser) {
  deleteTarget.value = user
}

async function submitDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    await adminStore.deleteUser(deleteTarget.value.id)
    deleteTarget.value = null
  } finally {
    deleteLoading.value = false
  }
}

onMounted(async () => {
  if (!adminStore.users.length) await adminStore.fetchUsers()
  if (!adminStore.stats) await adminStore.fetchStats()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
