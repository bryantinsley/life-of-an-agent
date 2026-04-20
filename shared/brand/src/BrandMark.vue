<script setup lang="ts">
defineProps<{
  variant?: 'on-env' | 'on-paper';
  size?: 'sm' | 'md' | 'lg';
}>();
</script>

<template>
  <div
    class="loa-brandmark"
    :class="[
      variant === 'on-paper' ? 'on-paper' : '',
      size === 'lg' ? 'is-large' : '',
    ]"
    aria-label="Life of an Agent"
  />
</template>
