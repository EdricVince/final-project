<template>
  <div class="min-h-full">
    <!-- Hero Banner -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-br from-green-600/15 via-emerald-600/8 to-transparent" />
      <div class="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-green-500/10 blur-3xl" />
      <div class="relative mx-auto max-w-5xl px-6 py-10">

        <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-400">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400"></span>
          AI Study Planner
        </div>
        <div>
          <h1 class="text-foreground text-4xl font-extrabold tracking-tight">{{ $t('schedule.pageTitle') }}</h1>
          <p class="text-muted-foreground mt-2 text-lg">{{ $t('schedule.pageSubtitle') }}</p>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-5xl px-6 pb-12">

      <!-- ════════════════════════════════════════
           PLAN LIST VIEW
           ════════════════════════════════════════ -->
      <div v-if="view === 'list'" class="space-y-5">
        <!-- Empty state -->
        <div v-if="savedPlans.length === 0"
          class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-3xl">📅</div>
          <div>
            <div class="text-foreground font-bold text-lg">No study plans yet</div>
            <div class="text-muted-foreground mt-1 text-sm">Create your first AI-powered monthly study plan to get started</div>
          </div>
          <button
            class="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-500 transition-colors shadow-lg shadow-green-500/20"
            @click="startNewPlan"
          >
            <span>✨</span> Create My First Plan
          </button>
        </div>

        <!-- Plan cards -->
        <div v-else class="space-y-3">
          <div class="flex items-center justify-between mb-4">
            <div class="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
              {{ savedPlans.length }} Study Plan{{ savedPlans.length > 1 ? 's' : '' }}
            </div>
            <button
              class="flex items-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/8 px-4 py-2 text-sm font-semibold text-green-400 hover:border-green-500/50 hover:bg-green-500/15 transition-all duration-200 active:scale-95"
              @click="startNewPlan"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              New Plan
            </button>
          </div>
          <div
            v-for="sp in savedPlans"
            :key="sp.id"
            class="group bg-card border-border rounded-2xl border p-5 transition-all hover:border-green-500/30 hover:shadow-lg cursor-pointer"
            @click="viewSavedPlan(sp)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4">
                <!-- Tier badge -->
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  :class="getTierBadgeBg(sp)">
                  {{ getTierIcon(sp) }}
                </div>
                <div class="min-w-0">
                  <div class="text-foreground font-bold text-base">{{ sp.name }}</div>
                  <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-400">{{ sp.plan.target }}</span>
                    <span class="text-muted-foreground text-xs">{{ sp.plan.months_needed }} months</span>
                    <span class="text-muted-foreground text-xs">·</span>
                    <span class="text-muted-foreground text-xs">{{ sp.form.weekly_hours }}h/week</span>
                    <span class="text-muted-foreground text-xs">·</span>
                    <span class="text-muted-foreground text-xs">{{ formatDate(sp.createdAt) }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span v-for="month in sp.plan.monthly_plan.slice(0, 3)" :key="month.month"
                      class="rounded-lg bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      Month {{ month.month }}: {{ month.theme.split('&')[0].trim() }}
                    </span>
                    <span v-if="sp.plan.months_needed > 3" class="rounded-lg bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      +{{ sp.plan.months_needed - 3 }} more months
                    </span>
                  </div>
                </div>
              </div>
              <!-- Actions -->
              <div class="flex shrink-0 gap-2" @click.stop>
                <button
                  class="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  @click.stop="viewSavedPlan(sp)"
                >View</button>
                <button
                  class="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  @click.stop="editSavedPlan(sp)"
                >Edit</button>
                <button
                  class="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  @click.stop="confirmDelete(sp.id)"
                >Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════
           PLAN CREATION FORM
           ════════════════════════════════════════ -->
      <div v-if="view === 'form'" class="space-y-5">
        <!-- Step indicators -->
        <div class="flex items-center gap-2">
          <div v-for="(step, i) in formSteps" :key="i" class="flex items-center gap-2">
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all"
              :class="currentStep > i ? 'bg-green-500 text-white' : currentStep === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
            >
              <svg v-if="currentStep > i" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="text-sm font-medium" :class="currentStep >= i ? 'text-foreground' : 'text-muted-foreground'">{{ step }}</span>
            <div v-if="i < formSteps.length - 1" class="mx-1 h-px w-8 bg-border" />
          </div>
        </div>

        <!-- Step 1: Level & Exam -->
        <div v-if="currentStep === 0" class="bg-card border-border space-y-7 rounded-2xl border p-6">
          <div>
            <h2 class="text-foreground text-lg font-bold">Your English Level</h2>
            <p class="text-muted-foreground text-sm mt-0.5">Select your current CEFR proficiency level</p>
          </div>

          <div class="space-y-3">
            <div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
              <button
                v-for="lvl in levels"
                :key="lvl.value"
                class="group relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                :style="form.current_level === lvl.value ? { borderColor: lvl.hex, background: lvl.hex + '22' } : {}"
                :class="form.current_level === lvl.value ? '' : 'border-border hover:border-border/80'"
                @click="form.current_level = lvl.value"
              >
                <span class="text-sm font-extrabold transition-colors"
                  :style="form.current_level === lvl.value ? { color: lvl.hex } : {}"
                  :class="form.current_level !== lvl.value && 'text-muted-foreground'">{{ lvl.value }}</span>
                <span class="text-center text-[10px] leading-tight" :class="form.current_level === lvl.value ? 'text-foreground font-medium' : 'text-muted-foreground'">{{ lvl.label }}</span>
                <div v-if="form.current_level === lvl.value" class="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm" :style="{ background: lvl.hex }" />
              </button>
            </div>
            <div class="relative h-2 rounded-full bg-border overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: levelProgress + '%', background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' }" />
            </div>
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span><span>Elementary</span><span>Intermediate</span><span>Advanced</span><span>Proficient</span>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <h3 class="text-foreground font-semibold">Target Exam</h3>
              <p class="text-muted-foreground text-sm">What are you preparing for?</p>
            </div>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                v-for="ex in examTargets"
                :key="ex.id"
                class="group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                :class="form.target_exam === ex.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'"
                @click="form.target_exam = ex.id; form.target_band = ''"
              >
                <span class="text-2xl">{{ ex.icon }}</span>
                <span class="text-foreground text-sm font-bold">{{ ex.id }}</span>
                <span class="text-muted-foreground text-xs">{{ ex.desc }}</span>
                <div v-if="form.target_exam === ex.id" class="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <div v-if="form.target_exam && form.target_exam !== 'General'" class="space-y-3">
            <div>
              <h3 class="text-foreground font-semibold">{{ $t('schedule.targetBand') }}</h3>
              <p class="text-muted-foreground text-sm">What score are you aiming for?</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="band in currentBandOptions"
                :key="band"
                class="rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-md"
                :class="form.target_band === band ? 'border-primary bg-primary/15 text-primary shadow-sm' : 'border-border text-muted-foreground hover:border-primary/40'"
                @click="form.target_band = band"
              >{{ band }}</button>
            </div>
          </div>

          <!-- Learning tier preview -->
          <div v-if="form.current_level && form.target_exam" class="rounded-xl border p-4 space-y-1"
            :class="previewTier === 1 ? 'border-amber-500/30 bg-amber-500/5' : previewTier === 2 ? 'border-blue-500/30 bg-blue-500/5' : 'border-violet-500/30 bg-violet-500/5'">
            <div class="font-semibold text-sm" :class="previewTier === 1 ? 'text-amber-300' : previewTier === 2 ? 'text-blue-300' : 'text-violet-300'">
              {{ previewTier === 1 ? '🐢 Slow & Steady Learning' : previewTier === 2 ? '🚶 Moderate Paced Learning' : '🚀 Professional Level Learning' }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ previewTier === 1
                ? 'One skill per day — Vocabulary Monday, Grammar Tuesday, Reading Wednesday, Listening Thursday, Writing Friday, Speaking Saturday. Learn slowly and deeply.'
                : previewTier === 2
                ? 'One main skill focus per day with progressive difficulty. Clear monthly milestones toward your target band.'
                : 'Framework-based plan. You already know the fundamentals — this plan refines strategy and exam technique.' }}
            </div>
          </div>

          <div v-if="!step1Valid" class="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <span class="mt-0.5 text-amber-400 text-sm">⚠</span>
            <p class="text-amber-300/80 text-sm">
              <span v-if="!form.current_level">Select your current English level</span>
              <span v-else-if="!form.target_exam">Select your target exam</span>
              <span v-else-if="form.target_exam !== 'General' && !form.target_band">Select your target {{ form.target_exam === 'IELTS' ? 'band score' : 'score' }}</span>
            </p>
          </div>

          <button
            class="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition-all duration-200"
            :class="step1Valid ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'"
            :disabled="!step1Valid"
            @click="step1Valid && (currentStep = 1)"
          >
            Continue
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        <!-- Step 2: Hours & Skills -->
        <div v-if="currentStep === 1" class="bg-card border-border space-y-7 rounded-2xl border p-6">
          <div>
            <h2 class="text-foreground text-lg font-bold">Study Preferences</h2>
            <p class="text-muted-foreground text-sm mt-0.5">Customize your learning schedule</p>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-foreground font-semibold">Weekly Study Hours</h3>
                <p class="text-muted-foreground text-sm">How much time can you commit per week?</p>
              </div>
              <div class="flex flex-col items-center justify-center h-14 w-20 rounded-xl bg-primary/10 text-primary">
                <span class="text-xl font-extrabold">{{ form.weekly_hours }}h</span>
                <span class="text-xs text-primary/70">≈ {{ monthlyHoursPreview }}h/month</span>
              </div>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="tier in hourTiers"
                :key="tier.value"
                class="rounded-xl border-2 p-3 text-center transition-all"
                :class="form.weekly_hours >= tier.min && form.weekly_hours <= tier.max ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'"
                @click="form.weekly_hours = tier.value"
              >
                <div class="text-sm font-bold" :class="form.weekly_hours >= tier.min && form.weekly_hours <= tier.max ? 'text-primary' : 'text-foreground'">{{ tier.label }}</div>
                <div class="text-muted-foreground text-xs">{{ tier.desc }}</div>
              </button>
            </div>
            <div class="space-y-1">
              <input type="range" min="2" max="40" v-model.number="form.weekly_hours" class="accent-primary w-full" />
              <div class="flex justify-between text-xs text-muted-foreground"><span>2h / week</span><span>40h / week</span></div>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <h3 class="text-foreground font-semibold">{{ $t('schedule.focusAreas') }}</h3>
              <p class="text-muted-foreground text-sm">Select skills to prioritize (optional)</p>
            </div>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                v-for="skill in skills"
                :key="skill.name"
                class="flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200"
                :class="form.focus_areas.includes(skill.name) ? 'border-green-500 bg-green-500/10' : 'border-border hover:border-green-500/30'"
                @click="toggleSkill(skill.name)"
              >
                <span class="text-xl">{{ skill.icon }}</span>
                <div>
                  <div class="text-sm font-semibold" :class="form.focus_areas.includes(skill.name) ? 'text-green-400' : 'text-foreground'">{{ skill.name }}</div>
                  <div class="text-muted-foreground text-xs">{{ skill.desc }}</div>
                </div>
              </button>
            </div>
          </div>

          <div class="rounded-xl border border-dashed border-border bg-muted/30 p-4">
            <div class="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">Plan Preview</div>
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground text-xs">Level:</span>
                <span class="text-foreground text-sm font-bold">{{ form.current_level }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground text-xs">Target:</span>
                <span class="text-foreground text-sm font-bold">{{ form.target_exam }}{{ form.target_band ? ' ' + form.target_band : '' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground text-xs">Study:</span>
                <span class="text-foreground text-sm font-bold">{{ form.weekly_hours }}h/week · {{ monthlyHoursPreview }}h/month</span>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              class="group flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-4 py-3 text-sm font-semibold text-indigo-400 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/15 active:scale-95"
              @click="currentStep = 0"
            >
              <svg class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <button
              class="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all disabled:opacity-60"
              :class="loading ? 'bg-primary/70 cursor-not-allowed' : 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/20'"
              :disabled="loading"
              @click="generatePlan"
            >
              <div v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span v-else>✨</span>
              {{ loading ? $t('schedule.generating') : $t('schedule.generate') }}
            </button>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════
           PLAN DETAIL VIEW
           ════════════════════════════════════════ -->
      <div v-if="view === 'detail' && activePlan" class="space-y-6">
        <!-- Actions -->
        <div class="flex justify-end">
          <button
            class="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            @click="editSavedPlan(activePlan)"
          >✏️ Edit Plan</button>
        </div>

        <!-- Plan hero card -->
        <div class="relative overflow-hidden rounded-2xl border border-green-500/30 bg-linear-to-br from-green-950/60 via-card to-card p-6">
          <div class="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-green-500/10 blur-2xl" />
          <div class="relative">
            <div class="text-foreground text-xl font-extrabold mb-3">{{ activePlan.name }}</div>
            <div class="flex flex-wrap gap-6">
              <div class="flex flex-col gap-1">
                <span class="text-green-400/70 text-xs font-semibold uppercase tracking-wider">Level</span>
                <span class="text-foreground text-lg font-extrabold">{{ activePlan.plan.level }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-green-400/70 text-xs font-semibold uppercase tracking-wider">Target</span>
                <span class="text-foreground text-lg font-extrabold">{{ activePlan.plan.target }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-green-400/70 text-xs font-semibold uppercase tracking-wider">Duration</span>
                <span class="text-foreground text-lg font-extrabold">{{ activePlan.plan.months_needed }} months</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-green-400/70 text-xs font-semibold uppercase tracking-wider">Study</span>
                <span class="text-foreground text-lg font-extrabold">{{ activePlan.form.weekly_hours }}h / week</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Month tabs -->
        <div class="space-y-1">
          <div class="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Monthly Schedule</div>
          <div class="flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="m in activePlan.plan.monthly_plan"
              :key="m.month"
              class="shrink-0 rounded-xl border-2 px-5 py-2 text-sm font-semibold transition-all duration-200"
              :class="activeMonthIdx === m.month - 1 ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'"
              @click="activeMonthIdx = m.month - 1"
            >Month {{ m.month }}</button>
            <div v-if="activePlan.plan.months_needed > activePlan.plan.monthly_plan.length"
              class="flex shrink-0 items-center rounded-xl border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
              + {{ activePlan.plan.months_needed - activePlan.plan.monthly_plan.length }} more months
            </div>
          </div>
        </div>

        <!-- Month content -->
        <div v-if="activeMonthData" class="space-y-4">
          <!-- Month header -->
          <div class="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 space-y-1">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-lg">📅</span>
                <span class="text-primary text-sm font-bold uppercase tracking-wider">Month {{ activeMonthData.month }} — {{ activeMonthData.theme }}</span>
              </div>
              <span class="text-primary/70 text-xs font-semibold">{{ activeMonthData.total_hours }}h this month</span>
            </div>
            <p class="text-primary/70 text-xs pl-7 leading-relaxed">{{ activeMonthData.objective }}</p>
          </div>

          <!-- Week summaries -->
          <div class="space-y-4">
            <div
              v-for="week in activeMonthData.week_summaries"
              :key="week.week_in_month"
              class="bg-card border-border rounded-2xl border p-5 space-y-4"
            >
              <!-- Week header -->
              <div class="flex items-center gap-2">
                <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-extrabold text-primary">{{ week.week_in_month }}</span>
                <span class="text-foreground font-semibold text-sm">Week {{ week.week_in_month }}: {{ week.focus }}</span>
              </div>

              <!-- Daily schedule -->
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
                <div
                  v-for="day in week.daily_schedule"
                  :key="day.day"
                  class="rounded-xl border p-3 space-y-1.5 transition-all"
                  :class="day.is_rest ? 'border-border/50 bg-muted/20 opacity-60' : 'border-border hover:border-primary/30 hover:bg-primary/5'"
                >
                  <!-- Day label -->
                  <div class="text-xs font-bold text-muted-foreground uppercase">{{ day.day }}</div>
                  <!-- Skill badge -->
                  <div v-if="day.is_rest" class="flex items-center gap-1">
                    <span class="text-base">🌿</span>
                    <span class="text-muted-foreground text-xs font-semibold">Rest</span>
                  </div>
                  <div v-else class="flex items-center gap-1">
                    <span class="text-sm">{{ skillIcon(day.skill) }}</span>
                    <span class="text-xs font-bold" :class="skillColor(day.skill)">{{ day.skill }}</span>
                  </div>
                  <!-- Topic -->
                  <div class="text-[11px] text-muted-foreground leading-snug line-clamp-3">{{ day.topic }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips & Resources -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 class="mb-4 flex items-center gap-2 text-sm font-bold text-amber-400">
              <span class="text-base">💡</span> {{ $t('schedule.aiTips') }}
            </h3>
            <ul class="space-y-3">
              <li v-for="tip in activePlan.plan.tips" :key="tip" class="flex gap-2 text-sm leading-relaxed text-amber-200/80">
                <span class="mt-0.5 shrink-0 text-amber-400">›</span>
                {{ tip }}
              </li>
            </ul>
          </div>
          <div class="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <h3 class="mb-4 flex items-center gap-2 text-sm font-bold text-blue-400">
              <span class="text-base">📚</span> {{ $t('schedule.resources') }}
            </h3>
            <div v-for="r in activePlan.plan.resources" :key="r.name" class="mb-3 last:mb-0">
              <div class="text-blue-200 text-sm font-semibold">{{ r.name }}</div>
              <div class="text-blue-300/60 mt-0.5 text-xs">{{ r.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deletingId" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-card border-border rounded-2xl border p-6 max-w-sm w-full space-y-4">
        <div class="text-foreground font-bold text-lg">Delete Plan?</div>
        <p class="text-muted-foreground text-sm">This action cannot be undone. Your study plan will be permanently deleted.</p>
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors"
            @click="deletingId = null"
          >Cancel</button>
          <button
            class="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors"
            @click="deletePlan(deletingId)"
          >Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'
import { usePageBack } from '@/composables/usePageBack'

const { t } = useI18n({ useScope: 'global' })
const { setBack, clearBack } = usePageBack()

// ── View state ──────────────────────────────────────────────────────────────
type View = 'list' | 'form' | 'detail'
const view = ref<View>('list')

watch(view, (v) => {
  if (v !== 'list') setBack('AI Study Plan', () => { view.value = 'list' })
  else clearBack()
}, { immediate: true })

onUnmounted(clearBack)
const loading = ref(false)
const activeMonthIdx = ref(0)
const currentStep = ref(0)
const deletingId = ref<string | null>(null)

// ── Saved plans (localStorage) ───────────────────────────────────────────────
const STORAGE_KEY = 'studyspark_study_plans'

interface SavedPlan {
  id: string
  name: string
  createdAt: string
  form: typeof form.value
  plan: any
}

const savedPlans = ref<SavedPlan[]>([])
const activePlan = ref<SavedPlan | null>(null)
const editingId = ref<string | null>(null)

function loadPlans(): SavedPlan[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function persistPlans(plans: SavedPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
  savedPlans.value = plans
}

function savePlan(sp: SavedPlan) {
  const plans = loadPlans().filter(p => p.id !== sp.id)
  plans.unshift(sp)
  persistPlans(plans)
}

function confirmDelete(id: string) { deletingId.value = id }

function deletePlan(id: string | null) {
  if (!id) return
  persistPlans(loadPlans().filter(p => p.id !== id))
  if (activePlan.value?.id === id) { activePlan.value = null; view.value = 'list' }
  deletingId.value = null
}

onMounted(() => { savedPlans.value = loadPlans() })

// ── Form data ────────────────────────────────────────────────────────────────
const formSteps = ['Level & Exam', 'Hours & Skills']

const form = ref({
  current_level: '',
  target_exam: '',
  target_band: '',
  weekly_hours: 10,
  focus_areas: [] as string[],
})

const levels = [
  { value: 'beginner', label: 'Beginner',    hex: '#ef4444' },
  { value: 'A1',       label: 'Elementary',  hex: '#f97316' },
  { value: 'A2',       label: 'Basic',       hex: '#eab308' },
  { value: 'B1',       label: 'Intermediate', hex: '#22c55e' },
  { value: 'B2',       label: 'Upper-Inter.', hex: '#14b8a6' },
  { value: 'C1',       label: 'Advanced',    hex: '#3b82f6' },
  { value: 'C2',       label: 'Proficient',  hex: '#8b5cf6' },
]

const examTargets = [
  { id: 'IELTS',   icon: '🎓', desc: 'Academic' },
  { id: 'TOEIC',   icon: '💼', desc: 'Business' },
  { id: 'TOEFL',   icon: '🌐', desc: 'University' },
  { id: 'General', icon: '📖', desc: 'General English' },
]

const bandMap: Record<string, string[]> = {
  IELTS: ['4.0','4.5','5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0'],
  TOEIC: ['400','500','600','700','800','900'],
  TOEFL: ['60','70','80','90','100','110'],
}
const currentBandOptions = computed(() => bandMap[form.value.target_exam] ?? [])

const hourTiers = [
  { value: 5,  min: 2,  max: 7,  label: 'Casual',    desc: '2–7h/week' },
  { value: 10, min: 8,  max: 14, label: 'Regular',   desc: '8–14h/week' },
  { value: 20, min: 15, max: 24, label: 'Intensive', desc: '15–24h/week' },
  { value: 30, min: 25, max: 40, label: 'Full-time', desc: '25–40h/week' },
]

const skills = [
  { name: 'Vocabulary', icon: '📖', desc: 'Word building' },
  { name: 'Grammar',    icon: '📝', desc: 'Rules & structure' },
  { name: 'Reading',    icon: '📰', desc: 'Comprehension' },
  { name: 'Listening',  icon: '🎧', desc: 'Audio skills' },
  { name: 'Writing',    icon: '✍️', desc: 'Composition' },
  { name: 'Speaking',   icon: '🗣️', desc: 'Pronunciation' },
]

const levelProgress = computed(() => {
  if (!form.value.current_level) return 0
  const idx = levels.findIndex(l => l.value === form.value.current_level)
  return idx < 0 ? 0 : Math.round((idx / (levels.length - 1)) * 100)
})

const step1Valid = computed(() => {
  if (!form.value.current_level || !form.value.target_exam) return false
  if (form.value.target_exam !== 'General' && !form.value.target_band) return false
  return true
})

const monthlyHoursPreview = computed(() => form.value.weekly_hours * 4)

// Preview tier before generating
const previewTier = computed(() => {
  const lv = form.value.current_level
  const ex = form.value.target_exam
  const band = form.value.target_band
  if (lv === 'C1' || lv === 'C2') return 3
  if (ex === 'IELTS' && band && parseFloat(band) >= 7.0) return 3
  if (ex === 'TOEIC' && band && parseFloat(band) >= 800) return 3
  if (lv === 'B1' || lv === 'B2') return 2
  if (ex === 'IELTS' && band && parseFloat(band) >= 5.0) return 2
  if (ex === 'TOEIC' && band && parseFloat(band) >= 500) return 2
  return 1
})

function toggleSkill(s: string) {
  const idx = form.value.focus_areas.indexOf(s)
  idx >= 0 ? form.value.focus_areas.splice(idx, 1) : form.value.focus_areas.push(s)
}

function startNewPlan() {
  form.value = { current_level: '', target_exam: '', target_band: '', weekly_hours: 10, focus_areas: [] }
  editingId.value = null
  currentStep.value = 0
  view.value = 'form'
}

function viewSavedPlan(sp: SavedPlan) {
  activePlan.value = sp
  activeMonthIdx.value = 0
  view.value = 'detail'
}

function editSavedPlan(sp: SavedPlan) {
  form.value = { ...sp.form, focus_areas: [...(sp.form.focus_areas ?? [])] }
  editingId.value = sp.id
  currentStep.value = 0
  view.value = 'form'
}

async function generatePlan() {
  loading.value = true
  try {
    const data = await api.generateSchedule(form.value as any)
    const planName = `${form.value.target_exam}${form.value.target_band ? ' ' + form.value.target_band : ''} — ${form.value.current_level}`
    const sp: SavedPlan = {
      id: editingId.value ?? crypto.randomUUID(),
      name: planName,
      createdAt: new Date().toISOString(),
      form: { ...form.value, focus_areas: [...form.value.focus_areas] },
      plan: data,
    }
    savePlan(sp)
    activePlan.value = sp
    activeMonthIdx.value = 0
    view.value = 'detail'
  } catch {
    // fallback: stay on form
  }
  loading.value = false
}

// ── Active month computed ─────────────────────────────────────────────────────
const activeMonthData = computed(() => activePlan.value?.plan?.monthly_plan?.[activeMonthIdx.value] ?? null)

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function skillIcon(skill: string): string {
  return ({ Vocabulary: '📖', Grammar: '📝', Reading: '📰', Listening: '🎧', Writing: '✍️', Speaking: '🗣️', 'Practice Test': '📋', Review: '🔍' } as Record<string, string>)[skill] ?? '📌'
}

function skillColor(skill: string): string {
  return ({
    Vocabulary: 'text-violet-400', Grammar: 'text-blue-400', Reading: 'text-green-400',
    Listening: 'text-cyan-400', Writing: 'text-amber-400', Speaking: 'text-rose-400',
    'Practice Test': 'text-indigo-400', Review: 'text-slate-400',
  } as Record<string, string>)[skill] ?? 'text-muted-foreground'
}

function getTierIcon(sp: SavedPlan): string {
  const lv = sp.form.current_level
  const ex = sp.form.target_exam
  const band = sp.form.target_band
  if (lv === 'C1' || lv === 'C2' || (ex === 'IELTS' && band && parseFloat(band) >= 7.0)) return '🚀'
  if (lv === 'B1' || lv === 'B2' || (ex === 'IELTS' && band && parseFloat(band) >= 5.0)) return '🚶'
  return '🐢'
}

function getTierBadgeBg(sp: SavedPlan): string {
  const icon = getTierIcon(sp)
  if (icon === '🚀') return 'bg-violet-500/10'
  if (icon === '🚶') return 'bg-blue-500/10'
  return 'bg-amber-500/10'
}
</script>
