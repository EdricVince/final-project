<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

// Initialize theme globally when app loads
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<style>
/* App-level styles (kept minimal) */
</style>
