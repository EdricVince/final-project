<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">{{ $t('goals.title') }}</h1>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ $t('goals.trackDesc') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all"
            :class="notificationsEnabled ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'"
            @click="toggleNotifications"
          >
            <Bell class="h-4 w-4" />
            <span class="hidden sm:inline">{{ notificationsEnabled ? $t('goals.alertsOn') : $t('goals.alertsOff') }}</span>
          </button>
          <button
            class="bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
            @click="showAddGoalModal = true"
          >
            <Plus class="h-4 w-4" />
            {{ $t('goals.addGoal') }}
          </button>
        </div>
      </div>

      <!-- Today's progress summary -->
      <TodaysProgressCard
        :progress="dailyProgress"
        :completed-goals="completedGoals"
        :total-goals="dailyGoals.length"
        :message="getDailyMessage()"
        :xp-earned="todayXP"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
    </div>

    <div v-else class="space-y-6">
      <!-- Row 1: Daily Goals + Weekly Challenges -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Daily Goals -->
        <div class="bg-card border-border rounded-2xl border p-5">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Target class="text-primary h-4 w-4" />
              {{ $t('goals.todaysGoals') }}
            </h3>
            <button
              class="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              @click="fetchGoals"
            >
              <RefreshCw class="h-3 w-3" />
              {{ $t('goals.refresh') }}
            </button>
          </div>

          <div class="space-y-3">
            <DailyGoalItem
              v-for="goal in dailyGoals"
              :key="goal.id"
              :goal="goal"
              @edit="() => {}"
            />
            <div v-if="dailyGoals.length === 0" class="py-6 text-center">
              <Target class="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-40" />
              <p class="text-muted-foreground text-sm">{{ $t('goals.noGoalsStart') }}</p>
            </div>
          </div>

          <!-- Custom Goals section -->
          <div v-if="customGoals.length > 0" class="border-border mt-4 border-t pt-4">
            <h4 class="text-foreground mb-3 text-sm font-medium">{{ $t('goals.personalGoals') }}</h4>
            <div class="space-y-2">
              <CustomGoalItem
                v-for="goal in customGoals"
                :key="goal.id"
                :goal="goal"
                @toggle="toggleCustomGoal(goal.id)"
                @delete="deleteCustomGoal(goal.id)"
              />
            </div>
          </div>
        </div>

        <!-- Weekly Challenges -->
        <div class="bg-card border-border rounded-2xl border p-5">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Calendar class="text-primary h-4 w-4" />
              {{ $t('goals.weeklyChallenges') }}
            </h3>
            <div class="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock class="h-3 w-3" />
              {{ $t('goals.daysLeft', { n: daysRemaining }) }}
            </div>
          </div>

          <div class="space-y-3">
            <WeeklyChallengeItem
              v-for="challenge in weeklyChallenges"
              :key="challenge.id"
              :challenge="challenge"
            />
            <div v-if="weeklyChallenges.length === 0" class="py-6 text-center">
              <Calendar class="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-40" />
              <p class="text-muted-foreground text-sm">{{ $t('goals.challengesLoad') }}</p>
            </div>
          </div>

          <WeeklyRewardCard
            :reward-x-p="200"
            :completed="completedChallenges"
            :total="weeklyChallenges.length"
          />
        </div>
      </div>

      <!-- Row 2: Milestones (full width) -->
      <div class="bg-card border-border rounded-2xl border p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-foreground flex items-center gap-2 font-semibold">
            <Flag class="text-primary h-4 w-4" />
            {{ $t('goals.milestones') }}
          </h3>
          <span class="text-muted-foreground text-sm">
            {{ $t('goals.achieved', { done: completedMilestones, total: milestones.length }) }}
          </span>
        </div>
        <MilestoneTracker :milestones="milestones" />
      </div>
    </div>

    <AddGoalModal
      :show="showAddGoalModal"
      @close="showAddGoalModal = false"
      @add="handleAddGoal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Target, Calendar, Flag, Bell, Plus, Clock, RefreshCw } from '@/components/icons'

const { t } = useI18n()

import TodaysProgressCard from '@/components/goals/TodaysProgressCard.vue'
import DailyGoalItem from '@/components/goals/DailyGoalItem.vue'
import CustomGoalItem from '@/components/goals/CustomGoalItem.vue'
import WeeklyChallengeItem from '@/components/goals/WeeklyChallengeItem.vue'
import WeeklyRewardCard from '@/components/goals/WeeklyRewardCard.vue'
import AddGoalModal from '@/components/goals/AddGoalModal.vue'
import MilestoneTracker from '@/components/goals/MilestoneTracker.vue'
import { useGoals } from '@/composables'

const {
  loading,
  dailyGoals,
  weeklyChallenges,
  milestones,
  customGoals,
  fetchGoals,
  completedGoals,
  dailyProgress,
  todayXP,
  daysRemaining,
  completedChallenges,
  completedMilestones,
  getDailyMessage,
  addCustomGoal,
  toggleCustomGoal,
  deleteCustomGoal,
} = useGoals()

const notificationsEnabled = ref(true)
const showAddGoalModal = ref(false)

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value
  if (notificationsEnabled.value && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

const handleAddGoal = async (data: { title: string; description: string }) => {
  await addCustomGoal(data.title, data.description)
  showAddGoalModal.value = false
}
</script>
