<template>
  <div class="bg-background flex min-h-screen flex-col overflow-hidden">
    <div class="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
      <!-- Left Panel - Branding & Animation -->
      <div
        class="bg-primary relative hidden flex-col items-center justify-center overflow-hidden p-12 lg:flex"
      >
        <!-- Decorative Elements -->
        <div class="bg-primary-foreground/5 absolute -top-24 -left-24 h-96 w-96 rounded-full"></div>
        <div
          class="bg-primary-foreground/5 absolute -bottom-32 -right-32 h-125 w-125 rounded-full"
        ></div>
        <div
          class="bg-primary-foreground/10 absolute top-1/4 right-1/4 h-32 w-32 rounded-full"
        ></div>

        <!-- Logo & Brand -->
        <div class="relative z-10 flex flex-col items-center gap-8">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div
              class="bg-primary-foreground text-primary flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            >
              <Sparkles class="h-7 w-7" />
            </div>
            <span class="text-primary-foreground text-4xl font-bold tracking-tight">
              StudySpark
            </span>
          </div>

          <!-- Rive Animation - Interactive Teddy -->
          <div class="my-8">
            <RiveAnimation
              ref="riveAnimationRef"
              src="/animations/login-teddy.riv"
              state-machine="Login Machine"
              :width="320"
              :height="320"
              fit="contain"
              @load="onRiveLoad"
            />
          </div>

          <!-- Tagline -->
          <div class="text-center">
            <h2 class="text-primary-foreground mb-3 text-2xl font-semibold">
              Ignite Your Learning Journey
            </h2>
            <p class="text-primary-foreground/70 max-w-md text-base leading-relaxed">
              Master new skills with interactive quizzes, track your progress, and achieve your
              learning goals with StudySpark.
            </p>
          </div>

          <!-- Features -->
          <div class="mt-8 grid grid-cols-3 gap-6">
            <div class="flex flex-col items-center gap-2">
              <div class="bg-primary-foreground/10 rounded-xl p-3">
                <BookOpen class="text-primary-foreground h-5 w-5" />
              </div>
              <span class="text-primary-foreground/80 text-sm font-medium">Learn</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="bg-primary-foreground/10 rounded-xl p-3">
                <Target class="text-primary-foreground h-5 w-5" />
              </div>
              <span class="text-primary-foreground/80 text-sm font-medium">Practice</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="bg-primary-foreground/10 rounded-xl p-3">
                <Trophy class="text-primary-foreground h-5 w-5" />
              </div>
              <span class="text-primary-foreground/80 text-sm font-medium">Achieve</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Auth Forms -->
      <div class="relative flex flex-col items-center justify-center p-6 lg:p-12">
        <!-- Mobile Logo -->
        <div class="mb-8 flex items-center gap-2 lg:hidden">
          <div
            class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl"
          >
            <Sparkles class="h-5 w-5" />
          </div>
          <span class="text-foreground text-2xl font-bold">StudySpark</span>
        </div>

        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { Sparkles, BookOpen, Target, Trophy } from 'lucide-vue-next'
import { RiveAnimation } from '@/components/animations'
import type { Rive } from '@rive-app/canvas'

// Animation ref to expose to child components
const riveAnimationRef = ref<InstanceType<typeof RiveAnimation> | null>(null)

// Provide the animation ref to child components (LoginPage, RegisterPage, etc.)
provide('loginAnimationRef', riveAnimationRef)

const onRiveLoad = (_rive: Rive) => {
  console.log('Teddy animation loaded with inputs:', riveAnimationRef.value?.getInputs?.())
}
</script>
