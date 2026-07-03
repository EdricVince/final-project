<template>
  <label :class="['inline-flex items-center gap-2 cursor-pointer', $attrs.class]">
    <input
      type="checkbox"
      :checked="checked"
      class="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
      @change="handleChange"
    />
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps<{
  checked?: boolean
}>()

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:checked', target.checked)
}
</script>
