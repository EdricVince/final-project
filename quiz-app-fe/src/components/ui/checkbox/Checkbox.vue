<template>
  <label :class="['inline-flex items-center gap-2', $attrs.class]">
    <input type="checkbox" v-bind="$attrs" />
    <slot />
  </label>
</template>

<script setup lang="ts">
// Minimal checkbox wrapper
</script>
