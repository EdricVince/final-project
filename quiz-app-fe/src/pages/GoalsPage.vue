<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
            Learning Goals
          </h1>
          <p class="text-muted-foreground mt-2 text-base">
            Track your daily goals, weekly challenges, and milestones
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Notification Toggle -->
          <button
            class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            :class="
              notificationsEnabled
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            "
            @click="toggleNotifications"
          >
            <Bell class="h-4 w-4" />
            {{ notificationsEnabled ? 'On' : 'Off' }}
          </button>
          <!-- Add Custom Goal -->
          <button
            class="bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
            @click="showAddGoalModal = true"
          >
            <Plus class="h-4 w-4" />
            Add Goal
          </button>
        </div>
      </div>

      <!-- Today's Progress Summary -->
      <TodaysProgressCard
        :progress="dailyProgress"
        :completed-goals="completedGoals"
        :total-goals="goals.dailyGoals.length"
        :message="getDailyMessage()"
        :xp-earned="todayXP"
      />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:gap-8">
      <!-- Daily Goals -->
      <div class="animate-fade-in-up">
        <div class="bg-card border-border rounded-2xl border p-6">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Target class="text-primary h-5 w-5" />
              Today's Goals
            </h3>
            <button
              class="text-muted-foreground hover:text-foreground text-sm transition-colors"
              @click="resetDailyGoals"
            >
              Reset
            </button>
          </div>

          <div class="space-y-4">
            <DailyGoalItem
              v-for="goal in goals.dailyGoals"
              :key="goal.id"
              :goal="goal"
              @increment="incrementGoal(goal)"
              @edit="editGoal(goal)"
            />
          </div>

          <!-- Custom Goals Section -->
          <div v-if="customGoals.length > 0" class="border-border mt-6 border-t pt-6">
            <h4 class="text-foreground mb-4 text-sm font-medium">Custom Goals</h4>
            <div class="space-y-3">
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
      </div>

      <!-- Weekly Challenges -->
      <div class="animate-fade-in-up delay-100">
        <div class="bg-card border-border rounded-2xl border p-6">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Calendar class="text-primary h-5 w-5" />
              Weekly Challenges
            </h3>
            <div class="flex items-center gap-1.5 text-xs">
              <Clock class="text-muted-foreground h-3.5 w-3.5" />
              <span class="text-muted-foreground">{{ daysRemaining }} days left</span>
            </div>
          </div>

          <div class="space-y-4">
            <WeeklyChallengeItem
              v-for="challenge in goals.weeklyChallenges"
              :key="challenge.id"
              :challenge="challenge"
              @toggle="toggleChallenge(challenge.id)"
            />
          </div>

          <!-- Weekly Reward -->
          <WeeklyRewardCard
            :reward-x-p="200"
            :completed="completedChallenges"
            :total="goals.weeklyChallenges.length"
          />
        </div>
      </div>

      <!-- Milestones -->
      <div class="animate-fade-in-up delay-200 lg:col-span-2">
        <div class="bg-card border-border rounded-2xl border p-6">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-foreground flex items-center gap-2 font-semibold">
              <Flag class="text-primary h-5 w-5" />
              Milestones
            </h3>
            <span class="text-muted-foreground text-sm">
              {{ completedMilestones }}/{{ goals.milestones.length }} achieved
            </span>
          </div>
          <MilestoneTracker :milestones="goals.milestones" />
        </div>
      </div>
    </div>

    <!-- Add Goal Modal -->
    <AddGoalModal
      :show="showAddGoalModal"
      @close="showAddGoalModal = false"
      @add="handleAddGoal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Target, Calendar, Flag, Bell, Plus, Clock } from 'lucide-vue-next'

import TodaysProgressCard from '@/components/goals/TodaysProgressCard.vue'
import DailyGoalItem from '@/components/goals/DailyGoalItem.vue'
import CustomGoalItem from '@/components/goals/CustomGoalItem.vue'
import WeeklyChallengeItem from '@/components/goals/WeeklyChallengeItem.vue'
import WeeklyRewardCard from '@/components/goals/WeeklyRewardCard.vue'
import AddGoalModal from '@/components/goals/AddGoalModal.vue'
import MilestoneTracker from '@/components/profile/goals/MilestoneTracker.vue'

import { useGoals } from '@/composables'
import type { DailyGoal } from '@/types/profile'

// Use composable
const {
  goals,
  customGoals,
  incrementGoal,
  resetDailyGoals,
  addCustomGoal,
  toggleCustomGoal,
  deleteCustomGoal,
  toggleChallenge,
  completedGoals,
  dailyProgress,
  todayXP,
  daysRemaining,
  completedChallenges,
  completedMilestones,
  getDailyMessage,
} = useGoals()

// Local state
const notificationsEnabled = ref(true)
const showAddGoalModal = ref(false)

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value
  if (notificationsEnabled.value) {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }
}

const handleAddGoal = (data: { title: string; description: string }) => {
  addCustomGoal(data.title, data.description)
  showAddGoalModal.value = false
}

const editGoal = (goal: DailyGoal) => {
  console.log('Edit goal:', goal)
}
</script>
