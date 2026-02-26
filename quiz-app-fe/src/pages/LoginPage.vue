<template>
  <div class="flex w-full max-w-md flex-col gap-8">
    <!-- Title Section -->
    <div class="animate-fade-in-down text-center lg:text-left">
      <h1 class="text-foreground text-3xl font-bold tracking-tight">{{ $t('auth.login.title') }}</h1>
      <p class="text-muted-foreground mt-2 text-base">
        {{ $t('auth.login.subtitle') }}
      </p>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
    >
      {{ errorMessage }}
    </div>

    <!-- Login Form -->
    <form class="animate-fade-in-up delay-100 space-y-5" @submit="handleSignIn">
      <!-- Email Field -->
      <FormField v-slot="{ componentField }" name="email">
        <FormItem class="space-y-2">
          <FormLabel class="text-foreground text-sm font-medium">{{ $t('auth.login.email') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Mail
                class="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
              />
              <Input
                v-bind="componentField"
                type="email"
                placeholder="name@example.com"
                class="border-input bg-background focus:border-primary focus:ring-primary/20 h-12 rounded-xl pl-12 text-base transition-all focus:ring-2"
                @focus="onEmailFocus"
                @blur="onEmailBlur"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Password Field -->
      <FormField v-slot="{ componentField }" name="password">
        <FormItem class="space-y-2">
          <div class="flex items-center justify-between">
            <FormLabel class="text-foreground text-sm font-medium">{{ $t('auth.login.password') }}</FormLabel>
            <Button
              type="button"
              variant="link"
              class="text-primary hover:text-primary/80 h-auto p-0 text-sm font-medium"
              @click="goToForgotPassword"
            >
              {{ $t('auth.login.forgotPassword') }}
            </Button>
          </div>
          <FormControl>
            <div class="relative">
              <Lock
                class="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
              />
              <Input
                v-bind="componentField"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="border-input bg-background focus:border-primary focus:ring-primary/20 h-12 rounded-xl pl-12 pr-12 text-base transition-all focus:ring-2"
                @focus="onPasswordFocus"
                @blur="onPasswordBlur"
              />
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 p-1 transition-colors"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Remember me -->
      <div class="flex items-center">
        <Checkbox v-model:checked="rememberMe" class="cursor-pointer">
          <span class="text-muted-foreground select-none text-sm">{{ $t('auth.login.rememberMe') }}</span>
        </Checkbox>
      </div>

      <!-- Submit Button -->
      <Button
        type="submit"
        :disabled="isSubmitting"
        class="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full cursor-pointer rounded-xl text-base font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
      >
        <Spinner v-if="isSubmitting" class="mr-2 h-5 w-5 animate-spin" />
        <span>{{ isSubmitting ? $t('auth.login.signingIn') : $t('auth.login.signIn') }}</span>
      </Button>
    </form>

    <!-- Divider -->
    <div class="animate-fade-in-up delay-200 relative">
      <div class="absolute inset-0 flex items-center">
        <div class="border-border w-full border-t"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="bg-background text-muted-foreground px-4 text-sm">{{ $t('auth.login.orContinueWith') }}</span>
      </div>
    </div>

    <!-- Social Login -->
    <div class="animate-fade-in-up delay-300 grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="outline"
        class="border-border hover:bg-accent h-12 cursor-pointer gap-2 rounded-xl text-sm font-medium transition-all"
        @click="handleGoogleSignIn"
      >
        <Icon name="google" class="h-5 w-5" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        class="border-border hover:bg-accent h-12 cursor-pointer gap-2 rounded-xl text-sm font-medium transition-all"
        @click="handleFacebookSignIn"
      >
        <Icon name="facebook" class="h-5 w-5" />
        Facebook
      </Button>
    </div>

    <!-- Sign up link -->
    <p class="animate-fade-in-up delay-400 text-muted-foreground text-center text-sm">
      {{ $t('auth.login.noAccount') }}
      <Button
        type="button"
        variant="link"
        class="text-primary hover:text-primary/80 h-auto p-0 font-semibold"
        @click="goToRegister"
      >
        {{ $t('auth.login.createAccount') }}
      </Button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Icon from '@/components/ui/icon/Icon.vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { loginSchema } from '@/types/auth'
import { useLoginAnimation } from '@/composables'
import { useAuthStore } from '@/stores/auth.store'

// Get animation ref from AuthLayout
const loginAnimationRef = inject('loginAnimationRef', ref(null))

// Setup animation controls
const {
  onEmailFocus,
  onEmailChange,
  onEmailBlur,
  onPasswordFocus,
  onPasswordBlur,
  onLoginSuccess,
  onLoginFail,
} = useLoginAnimation(loginAnimationRef)

const router = useRouter()
const authStore = useAuthStore()
const showPassword = ref(false)
const rememberMe = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const { handleSubmit, values } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: '',
    password: '',
  },
})

// Watch email changes to update animation
watch(
  () => values.email,
  (newEmail) => {
    onEmailChange(newEmail || '')
  },
)

const handleSignIn = handleSubmit(async (formValues) => {
  if (isSubmitting.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.login(formValues.email, formValues.password, rememberMe.value)

    if (result.success) {
      onLoginSuccess()
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push({ name: 'Dashboard' })
      }, 500)
    } else {
      errorMessage.value = result.message || 'Login failed'
      onLoginFail()
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred'
    onLoginFail()
  } finally {
    isSubmitting.value = false
  }
})

const goToRegister = () => {
  router.push({ name: 'Register' })
}

const goToForgotPassword = () => {
  router.push({ name: 'ForgotPassword' })
}

const handleGoogleSignIn = () => {
  // TODO: Implement Google OAuth sign in
  console.log('Google sign in clicked')
}

const handleFacebookSignIn = () => {
  // TODO: Implement Facebook OAuth sign in
  console.log('Facebook sign in clicked')
}
</script>
