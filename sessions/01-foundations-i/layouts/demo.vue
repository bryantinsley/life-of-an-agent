<script setup lang="ts">
/**
 * Demo layout — edge-to-edge iframe, zero added chrome.
 * The demo itself provides its own brand chrome (consistent Life-of-an-Agent
 * design system), so wrapping it in another header would be redundant.
 * The surrounding violet environment is the deck's; the demo shows through.
 */
defineProps<{
  url: string;
}>();
</script>

<template>
  <div class="loa-demo">
    <iframe
      :src="url"
      class="loa-demo-frame"
      frameborder="0"
      allow="fullscreen"
      loading="lazy"
    />
  </div>
</template>

<style scoped>
.loa-demo {
  position: absolute;
  inset: 0;
  background: var(--loa-paper);
  overflow: hidden;
}

.loa-demo-frame {
  width: 100%;
  height: 100%;
  display: block;
  background: var(--loa-paper);
  border: 0;
}
</style>
