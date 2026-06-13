<template>
  <div class="bg-background flex min-h-screen flex-col overflow-hidden">
    <div class="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
      <!-- Left Panel - Branding -->
      <div
        class="bg-primary relative hidden flex-col items-center justify-center overflow-hidden p-12 lg:flex"
      >
        <!-- Decorative background circles -->
        <div class="bg-primary-foreground/5 absolute -top-24 -left-24 h-96 w-96 rounded-full" />
        <div class="bg-primary-foreground/5 absolute -bottom-32 -right-32 h-125 w-125 rounded-full" />
        <div class="bg-primary-foreground/10 absolute top-1/4 right-1/4 h-32 w-32 rounded-full" />

        <div class="relative z-10 flex flex-col items-center gap-6">
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

          <!-- Language learning illustration — no bounding box -->
          <div class="relative h-72 w-80 select-none">
            <!-- Ambient glow -->
            <div
              class="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/8 blur-3xl"
            />

            <!-- Main vocabulary card -->
            <div
              class="animate-float-a absolute left-1/2 top-1/2 w-52 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                class="rounded-2xl border border-white/25 bg-white/15 p-5 shadow-2xl backdrop-blur-md"
              >
                <div class="mb-2 flex items-center gap-1.5">
                  <BookOpen class="h-3 w-3 text-white/60" />
                  <span class="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                    Vocabulary
                  </span>
                </div>
                <p class="text-2xl font-bold text-white">Hello</p>
                <p class="mt-1 text-sm text-white/65">こんにちは &nbsp;·&nbsp; 你好</p>
                <div class="mt-3 flex items-center gap-2">
                  <div class="h-1 flex-1 rounded-full bg-white/20">
                    <div class="h-1 w-3/5 rounded-full bg-white/60" />
                  </div>
                  <span class="text-[10px] text-white/50">3 / 5</span>
                </div>
              </div>
            </div>

            <!-- Floating card: English -->
            <div class="animate-float-b absolute left-1 top-8">
              <div
                class="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 shadow-lg backdrop-blur-sm"
              >
                <p class="text-xl font-bold leading-none text-white">Aa</p>
                <p class="mt-0.5 text-[10px] text-white/50">English</p>
              </div>
            </div>

            <!-- Floating card: Chinese -->
            <div class="animate-float-c absolute right-3 top-4">
              <div
                class="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 shadow-lg backdrop-blur-sm"
              >
                <p class="text-xl font-bold leading-none text-white">文</p>
                <p class="mt-0.5 text-[10px] text-white/50">中文</p>
              </div>
            </div>

            <!-- Floating card: French -->
            <div class="animate-float-b absolute bottom-6 right-1">
              <div
                class="rounded-xl border border-white/20 bg-white/10 px-3 py-2 shadow-lg backdrop-blur-sm"
              >
                <p class="text-base font-bold leading-none text-white">Bonjour</p>
                <p class="mt-0.5 text-[10px] text-white/50">Français</p>
              </div>
            </div>

            <!-- XP badge -->
            <div class="animate-float-c absolute right-5 top-[44%]">
              <div
                class="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 shadow backdrop-blur-sm"
              >
                <Zap class="h-3 w-3 text-yellow-200/90" />
                <span class="text-xs font-bold text-white">+25 XP</span>
              </div>
            </div>

            <!-- Sparkle accents -->
            <Sparkles class="animate-float-a absolute right-14 top-14 h-4 w-4 text-white/25" />
            <Sparkles class="animate-float-d absolute bottom-16 left-16 h-3 w-3 text-white/20" />
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
          <div class="mt-2 grid grid-cols-3 gap-6">
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
import { Sparkles, BookOpen, Target, Trophy, Zap } from '@/components/icons'
</script>
