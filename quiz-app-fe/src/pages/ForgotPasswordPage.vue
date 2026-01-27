<template>
  <div class="flex w-full max-w-md flex-col gap-8">
    <!-- Title Section -->
    <div class="animate-fade-in-down text-center lg:text-left">
      <div
        class="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl lg:mx-0"
      >
        <KeyRound class="h-7 w-7" />
      </div>
      <h1 class="text-foreground text-3xl font-bold tracking-tight">Reset password</h1>
      <p class="text-muted-foreground mt-2 text-base">
        Enter your email and we'll send you instructions to reset your password
      </p>
    </div>

    <!-- Success Alert -->
    <Transition name="fade-scale">
      <div
        v-if="success"
        class="animate-fade-in-up border-chart-2/30 bg-chart-2/10 flex items-center gap-3 rounded-xl border p-4"
      >
        <div class="bg-chart-2/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <CheckCircle class="text-chart-2 h-5 w-5" />
        </div>
        <div>
          <p class="text-foreground text-sm font-medium">Check your email</p>
          <p class="text-muted-foreground text-sm">
            We've sent password reset instructions to your email
          </p>
        </div>
      </div>
    </Transition>

    <!-- Error Alert -->
    <Transition name="fade-scale">
      <div
        v-if="error"
        class="animate-fade-in-up border-destructive/30 bg-destructive/10 flex items-center gap-3 rounded-xl border p-4"
      >
        <div
          class="bg-destructive/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        >
          <AlertCircle class="text-destructive h-5 w-5" />
        </div>
        <p class="text-foreground text-sm font-medium">{{ error }}</p>
      </div>
    </Transition>

    <!-- Reset Form -->
    <form class="animate-fade-in-up delay-100 space-y-5" @submit.prevent="handleSubmit">
      <!-- Email Field -->
      <div class="space-y-2">
        <label class="text-foreground text-sm font-medium">Email address</label>
        <div class="relative">
          <Mail
            class="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
          />
          <input
            v-model="email"
            type="email"
            placeholder="name@example.com"
            class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 w-full rounded-xl border pl-12 text-base transition-all focus:ring-2 focus:outline-none"
          />
        </div>
        <p class="text-muted-foreground text-sm">
          We'll send password reset instructions to this email
        </p>
      </div>

      <!-- Submit Button -->
      <Button
        type="submit"
        :disabled="loading || !email"
        class="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full cursor-pointer rounded-xl text-base font-semibold shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Spinner v-if="loading" class="mr-2 h-5 w-5 animate-spin" />
        <span>{{ loading ? 'Sending...' : 'Send reset link' }}</span>
      </Button>
    </form>

    <!-- Divider -->
    <div class="animate-fade-in-up delay-200 relative">
      <div class="absolute inset-0 flex items-center">
        <div class="border-border w-full border-t"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="bg-background text-muted-foreground px-4 text-sm">or</span>
      </div>
    </div>

    <!-- Back to Login -->
    <Button
      type="button"
      variant="outline"
      class="animate-fade-in-up border-border hover:bg-accent delay-300 h-12 cursor-pointer gap-2 rounded-xl text-base font-medium transition-all"
      @click="goToLogin"
    >
      <ArrowLeft class="h-5 w-5" />
      Back to sign in
    </Button>

    <!-- Sign up link -->
    <p class="animate-fade-in-up delay-400 text-muted-foreground text-center text-sm">
      Don't have an account?
      <Button
        type="button"
        variant="link"
        class="text-primary hover:text-primary/80 h-auto p-0 font-semibold"
        @click="goToRegister"
      >
        Create account
      </Button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { KeyRound, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!email.value || loading.value) return

  error.value = ''
  success.value = false
  loading.value = true

  try {
    const result = await authStore.resetPassword(email.value)

    if (result) {
      success.value = true
      email.value = ''
    } else {
      error.value = 'Please enter a valid email address.'
    }
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push({ name: 'Login' })
}

const goToRegister = () => {
  router.push({ name: 'Register' })
}
</script>
