<template>
  <div class="space-y-6">
    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <User class="text-primary h-5 w-5" />
        Account Information
      </h2>

      <!-- Profile Picture -->
      <div class="mb-6 flex items-center gap-4">
        <div class="bg-primary text-primary-foreground flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold">
          {{ userInitials }}
        </div>
        <div>
          <button class="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90">
            Change Avatar
          </button>
          <p class="text-muted-foreground mt-2 text-xs">JPG, PNG or GIF. Max 2MB</p>
        </div>
      </div>

      <!-- Form Fields -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">Full Name</label>
          <input
            :value="account.fullName"
            type="text"
            class="bg-secondary border-border text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @input="$emit('update:account', { ...account, fullName: ($event.target as HTMLInputElement).value })"
          />
        </div>
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">Username</label>
          <input
            :value="account.username"
            type="text"
            class="bg-secondary border-border text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @input="$emit('update:account', { ...account, username: ($event.target as HTMLInputElement).value })"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="text-foreground mb-2 block text-sm font-medium">Email</label>
          <input
            :value="account.email"
            type="email"
            class="bg-secondary border-border text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @input="$emit('update:account', { ...account, email: ($event.target as HTMLInputElement).value })"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          class="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium transition-all hover:opacity-90"
          @click="$emit('save')"
        >
          Save Changes
        </button>
      </div>
    </div>

    <!-- Teacher Portal (only shown for @teacher.sprk accounts) -->
    <div v-if="authStore.isTeacherEmail" class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
        <GraduationCap class="text-primary h-5 w-5" />
        Teacher Portal
      </h2>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-foreground text-sm font-medium">You have teacher access</p>
          <p class="text-muted-foreground mt-0.5 text-xs">Access class management, tests, and analytics</p>
        </div>
        <button
          class="bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
          @click="goToTeacherDashboard"
        >
          <GraduationCap class="h-4 w-4" />
          Go to Dashboard
        </button>
      </div>
    </div>

    <!-- Password Change -->
    <div class="bg-card border-border rounded-2xl border p-6">
      <h2 class="text-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
        <Lock class="text-primary h-5 w-5" />
        Change Password
      </h2>

      <div class="space-y-4">
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">Current Password</label>
          <input
            :value="password.current"
            type="password"
            class="bg-secondary border-border text-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @input="$emit('update:password', { ...password, current: ($event.target as HTMLInputElement).value })"
          />
        </div>
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">New Password</label>
          <input
            :value="password.new"
            type="password"
            class="bg-secondary border-border text-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @input="$emit('update:password', { ...password, new: ($event.target as HTMLInputElement).value })"
          />
        </div>
        <div>
          <label class="text-foreground mb-2 block text-sm font-medium">Confirm New Password</label>
          <input
            :value="password.confirm"
            type="password"
            class="bg-secondary border-border text-foreground w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            @input="$emit('update:password', { ...password, confirm: ($event.target as HTMLInputElement).value })"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          class="bg-secondary text-foreground hover:bg-secondary/80 rounded-lg px-6 py-2.5 text-sm font-medium transition-all"
          @click="$emit('changePassword')"
        >
          Update Password
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, GraduationCap } from '@/components/icons'
import { useAuthStore } from '@/stores/auth.store'

export interface AccountData {
  fullName: string
  username: string
  email: string
}

export interface PasswordData {
  current: string
  new: string
  confirm: string
}

const props = defineProps<{
  account: AccountData
  password: PasswordData
}>()

defineEmits<{
  'update:account': [value: AccountData]
  'update:password': [value: PasswordData]
  save: []
  changePassword: []
}>()

const router = useRouter()
const authStore = useAuthStore()

const goToTeacherDashboard = () => {
  router.push('/teacher/dashboard')
}

const userInitials = computed(() => {
  const names = props.account.fullName.split(' ')
  return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
})
</script>
