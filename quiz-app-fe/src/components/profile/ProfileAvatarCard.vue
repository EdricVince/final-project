<template>
  <div class="bg-card border-border overflow-hidden rounded-2xl border">
    <!-- Cover Image -->
    <div class="bg-primary/10 relative h-24">
      <button
        class="bg-background/80 hover:bg-background absolute right-3 top-3 rounded-lg p-2 backdrop-blur-sm transition-colors"
        @click="$emit('changeCover')"
      >
        <Camera class="text-foreground h-4 w-4" />
      </button>
    </div>

    <!-- Avatar Section -->
    <div class="relative -mt-12 px-6 pb-6">
      <div class="relative inline-block">
        <div class="bg-card border-card relative h-24 w-24 overflow-hidden rounded-2xl border-4 shadow-lg">
          <img
            v-if="avatar"
            :src="avatar"
            alt="Avatar"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="bg-primary text-primary-foreground flex h-full w-full items-center justify-center text-3xl font-bold"
          >
            {{ userInitials }}
          </div>
        </div>
        <button
          class="bg-primary text-primary-foreground hover:bg-primary/90 absolute -bottom-1 -right-1 rounded-lg p-2 shadow-lg transition-colors"
          @click="openAvatarUpload"
        >
          <Camera class="h-4 w-4" />
        </button>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarChange"
        />
      </div>

      <!-- Name & Role -->
      <div class="mt-4">
        <h2 class="text-foreground text-xl font-bold">{{ fullName || $t('profile.yourProfile') }}</h2>
        <p class="text-muted-foreground text-sm">{{ title || $t('profile.avatar.learner') }}</p>
      </div>

      <!-- Quick Stats -->
      <div class="border-border mt-4 grid grid-cols-3 gap-4 border-t pt-4">
        <div class="text-center">
          <p class="text-foreground text-lg font-bold">{{ stats.courses }}</p>
          <p class="text-muted-foreground text-xs">{{ $t('profile.avatar.courses') }}</p>
        </div>
        <div class="text-center">
          <p class="text-foreground text-lg font-bold">{{ stats.streak }}</p>
          <p class="text-muted-foreground text-xs">{{ $t('profile.stats.streak') }}</p>
        </div>
        <div class="text-center">
          <p class="text-foreground text-lg font-bold">{{ stats.xp }}</p>
          <p class="text-muted-foreground text-xs">{{ $t('profile.stats.xp') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Camera } from '@/components/icons'
import type { ProfileStats } from '@/types/profile'

const { t: $t } = useI18n()

interface Props {
  avatar: string
  fullName: string
  title: string
  stats: ProfileStats
}

const props = defineProps<Props>()

const emit = defineEmits<{
  changeCover: []
  avatarChange: [avatar: string]
}>()

const avatarInput = ref<HTMLInputElement | null>(null)

const userInitials = computed(() => {
  if (props.fullName) {
    return props.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return 'U'
})

const openAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      emit('avatarChange', e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}
</script>
