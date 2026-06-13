<template>
  <div class="bg-card border-border rounded-2xl border p-6">
    <div class="mb-6 flex items-center justify-between">
      <h3 class="text-foreground flex items-center gap-2 text-lg font-semibold">
        <User class="text-primary h-5 w-5" />
        Personal Information
      </h3>
      <Button
        v-if="!isEditing"
        variant="outline"
        size="sm"
        @click="$emit('startEditing')"
      >
        <Pencil class="mr-1 h-4 w-4" />
        Edit
      </Button>
      <div v-else class="flex gap-2">
        <Button variant="ghost" size="sm" @click="$emit('cancelEditing')">
          Cancel
        </Button>
        <Button size="sm" @click="$emit('saveProfile')">
          <Check class="mr-1 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <!-- Full Name -->
      <div class="space-y-2">
        <Label class="text-foreground text-sm font-medium">Full Name</Label>
        <div v-if="!isEditing" class="bg-secondary/50 text-foreground rounded-xl px-4 py-3">
          {{ profile.fullName || 'Not set' }}
        </div>
        <Input
          v-else
          :model-value="editForm.fullName"
          placeholder="Enter your full name"
          class="h-11 rounded-xl"
          @update:model-value="$emit('update:editForm', { ...editForm, fullName: String($event) })"
        />
      </div>

      <!-- Username -->
      <div class="space-y-2">
        <Label class="text-foreground text-sm font-medium">Username</Label>
        <div v-if="!isEditing" class="bg-secondary/50 text-foreground rounded-xl px-4 py-3">
          @{{ profile.username || 'username' }}
        </div>
        <div v-else class="relative">
          <span class="text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2">@</span>
          <Input
            :model-value="editForm.username"
            placeholder="username"
            class="h-11 rounded-xl pl-8"
            @update:model-value="$emit('update:editForm', { ...editForm, username: String($event) })"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="space-y-2">
        <Label class="text-foreground text-sm font-medium">Email Address</Label>
        <div v-if="!isEditing" class="bg-secondary/50 text-foreground flex items-center gap-2 rounded-xl px-4 py-3">
          <Mail class="text-muted-foreground h-4 w-4" />
          {{ profile.email }}
        </div>
        <Input
          v-else
          :model-value="editForm.email"
          type="email"
          placeholder="your@email.com"
          class="h-11 rounded-xl"
          @update:model-value="$emit('update:editForm', { ...editForm, email: String($event) })"
        />
      </div>

      <!-- Phone -->
      <div class="space-y-2">
        <Label class="text-foreground text-sm font-medium">Phone Number</Label>
        <div v-if="!isEditing" class="bg-secondary/50 text-foreground flex items-center gap-2 rounded-xl px-4 py-3">
          <Phone class="text-muted-foreground h-4 w-4" />
          {{ profile.phone || 'Not set' }}
        </div>
        <Input
          v-else
          :model-value="editForm.phone"
          type="tel"
          placeholder="+84 123 456 789"
          class="h-11 rounded-xl"
          @update:model-value="$emit('update:editForm', { ...editForm, phone: String($event) })"
        />
      </div>

      <!-- Title/Role -->
      <div class="space-y-2">
        <Label class="text-foreground text-sm font-medium">Title / Role</Label>
        <div v-if="!isEditing" class="bg-secondary/50 text-foreground rounded-xl px-4 py-3">
          {{ profile.title || 'Not set' }}
        </div>
        <Input
          v-else
          :model-value="editForm.title"
          placeholder="e.g. Student, Developer"
          class="h-11 rounded-xl"
          @update:model-value="$emit('update:editForm', { ...editForm, title: String($event) })"
        />
      </div>

      <!-- Location -->
      <div class="space-y-2">
        <Label class="text-foreground text-sm font-medium">Location</Label>
        <div v-if="!isEditing" class="bg-secondary/50 text-foreground flex items-center gap-2 rounded-xl px-4 py-3">
          <MapPin class="text-muted-foreground h-4 w-4" />
          {{ profile.location || 'Not set' }}
        </div>
        <Input
          v-else
          :model-value="editForm.location"
          placeholder="City, Country"
          class="h-11 rounded-xl"
          @update:model-value="$emit('update:editForm', { ...editForm, location: String($event) })"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Pencil, Check, Mail, Phone, MapPin } from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import type { ProfileData, ProfileEditForm } from '@/types/profile'

interface Props {
  profile: ProfileData
  editForm: ProfileEditForm
  isEditing: boolean
}

defineProps<Props>()

defineEmits<{
  startEditing: []
  cancelEditing: []
  saveProfile: []
  'update:editForm': [form: ProfileEditForm]
}>()
</script>
