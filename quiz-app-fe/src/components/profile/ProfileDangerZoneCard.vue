<template>
  <div class="border-destructive/20 bg-destructive/5 rounded-2xl border p-6">
    <h3 class="text-destructive mb-4 flex items-center gap-2 text-lg font-semibold">
      <AlertTriangle class="h-5 w-5" />
      Danger Zone
    </h3>
    <div class="flex flex-wrap gap-3">
      <Button
        variant="outline"
        class="border-destructive/30 text-destructive hover:bg-destructive/10"
        @click="$emit('signOut')"
      >
        <LogOut class="mr-2 h-4 w-4" />
        Sign Out
      </Button>
      <Button
        variant="outline"
        class="border-destructive/30 text-destructive hover:bg-destructive/10"
        @click="$emit('deleteAccount')"
      >
        <Trash2 class="mr-2 h-4 w-4" />
        Delete Account
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, LogOut, Trash2 } from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'

defineEmits<{
  signOut: []
  deleteAccount: []
}>()
</script>
