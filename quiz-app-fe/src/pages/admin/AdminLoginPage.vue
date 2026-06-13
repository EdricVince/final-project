<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
          <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">Admin Portal</h1>
        <p class="text-slate-400 text-sm mt-1">SPRK Platform Management</p>
      </div>

      <!-- Card -->
      <div class="bg-slate-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
        <h2 class="text-base font-semibold text-white mb-5">Sign in with Admin Key</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Key input -->
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">Admin Secret Key</label>
            <div class="relative">
              <input
                v-model="keyInput"
                :type="showKey ? 'text' : 'password'"
                placeholder="Enter admin secret key"
                autocomplete="current-password"
                class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10 transition"
                :class="{ 'border-red-500/60 focus:ring-red-500': errorMsg }"
              />
              <button
                type="button"
                @click="showKey = !showKey"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                tabindex="-1"
              >
                <svg v-if="showKey" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error -->
          <p v-if="errorMsg" class="text-xs text-red-400 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errorMsg }}
          </p>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading || !keyInput.trim()"
            class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3 transition-all"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? 'Verifying...' : 'Sign In' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-slate-600 mt-6">
        SPRK Admin Portal — Authorized Personnel Only
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin.store'

const router = useRouter()
const adminStore = useAdminStore()

const keyInput = ref('')
const showKey = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!keyInput.value.trim()) return
  loading.value = true
  errorMsg.value = ''
  try {
    const ok = await adminStore.login(keyInput.value.trim())
    if (ok) {
      await router.push('/admin/dashboard')
    } else {
      errorMsg.value = 'Invalid admin key. Please check your credentials.'
    }
  } catch {
    errorMsg.value = 'Could not connect to server. Is the backend running?'
  } finally {
    loading.value = false
  }
}
</script>
