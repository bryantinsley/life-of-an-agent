<script setup lang="ts">
/**
 * Section layout — palette cleanser between chapters.
 * Violet environment fills the slide, with big display text.
 */
const props = defineProps<{
  eyebrow?: string;
  num?: string | number;
}>();
</script>

<template>
  <div class="loa-section">
    <div class="loa-section-eyebrow-row">
      <div class="loa-brandmark" aria-hidden="true" />
      <div class="loa-section-eyebrow">
        <span v-if="props.num" class="loa-section-num">§ {{ props.num }}</span>
        <span v-if="props.eyebrow">{{ props.eyebrow }}</span>
      </div>
    </div>

    <div class="loa-section-body">
      <slot />
    </div>

    <div class="loa-section-bottom">
      <span>Life of an Agent</span>
      <span class="loa-section-dot" />
      <span>Session 1</span>
    </div>
  </div>
</template>

<style scoped>
.loa-section {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 30%, rgba(77, 107, 255, 0.25) 0%, transparent 55%),
    var(--loa-gradient-brand);
  color: #fff;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 56px 72px;
  overflow: hidden;
}

.loa-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  pointer-events: none;
}

.loa-section > * {
  position: relative;
  z-index: 1;
}

.loa-section-eyebrow-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.loa-section-eyebrow {
  font-family: var(--loa-font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  gap: 10px;
}

.loa-section-num {
  font-family: var(--loa-font-mono);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
}

.loa-section-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--loa-space-4);
}

.loa-section-body :deep(h1) {
  font-family: var(--loa-font-sans);
  font-size: 60px;
  font-weight: 700;
  letter-spacing: -0.026em;
  line-height: 1.05;
  color: #fff;
  max-width: 820px;
}

.loa-section-body :deep(h2) {
  font-family: var(--loa-font-sans);
  font-size: var(--loa-text-lg);
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.72);
  max-width: 640px;
  margin-top: 4px;
}

.loa-section-body :deep(p) {
  color: rgba(255, 255, 255, 0.68);
  font-size: var(--loa-text-md);
  max-width: 640px;
}

.loa-section-body :deep(code) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.loa-section-bottom {
  font-family: var(--loa-font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 10px;
}

.loa-section-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}
</style>
