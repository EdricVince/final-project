<template>
  <component :is="iconComponent" :class="sizeClass" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import GoogleIcon from './icons/GoogleIcon.vue'
import FacebookIcon from './icons/FacebookIcon.vue'

interface IconProps {
  name: 'google' | 'facebook'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 'md',
})

const iconMap: Record<string, Component> = {
  google: GoogleIcon,
  facebook: FacebookIcon,
}

const sizeMap: Record<string, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}

const iconComponent = computed(() => iconMap[props.name])
const sizeClass = computed(() => sizeMap[props.size])
</script>
