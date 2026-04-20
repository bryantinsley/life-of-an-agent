<script setup lang="ts">
/**
 * Cover layout — hero/title slide.
 * Reverses the usual polarity: the entire slide becomes the violet environment
 * (no paper surface), with the BrandMark, eyebrow, and huge display title.
 */
</script>

<template>
  <div class="loa-cover">
    <div class="loa-cover-topbar">
      <div class="loa-brandmark is-large" aria-label="Life of an Agent" />
      <div class="loa-cover-topbar-text">
        <div class="loa-cover-wordmark">Life of an Agent</div>
        <div class="loa-cover-curriculum">Ten-session curriculum · For SREs</div>
      </div>
    </div>

    <div class="loa-cover-body">
      <slot />
    </div>

    <div class="loa-cover-footer">
      <span class="loa-cover-footer-dot" />
      <span>Session 1 · Foundations I · From Text to Vectors</span>
    </div>
  </div>
</template>

<style scoped>
.loa-cover {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 16% 22%, rgba(255, 255, 255, 0.08) 0%, transparent 42%),
    radial-gradient(circle at 84% 78%, rgba(77, 107, 255, 0.22) 0%, transparent 55%),
    var(--loa-gradient-hero);
  color: #fff;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 56px 72px 48px;
  overflow: hidden;
}

.loa-cover::before {
  /* faint grid — very subtle */
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  pointer-events: none;
}

.loa-cover > * {
  position: relative;
  z-index: 1;
}

.loa-cover-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.loa-cover-topbar-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1;
}

.loa-cover-wordmark {
  font-family: var(--loa-font-sans);
  font-size: var(--loa-text-md);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #fff;
}

.loa-cover-curriculum {
  font-family: var(--loa-font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.62);
}

.loa-cover-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--loa-space-5);
}

/* hero title — the markdown h1 inside the slot */
.loa-cover-body :deep(h1) {
  font-family: var(--loa-font-sans);
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.028em;
  line-height: 1.02;
  color: #fff;
  max-width: 820px;
}

.loa-cover-body :deep(h2) {
  font-family: var(--loa-font-sans);
  font-size: var(--loa-text-xl);
  font-weight: 400;
  letter-spacing: -0.015em;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.78);
  max-width: 640px;
  margin-top: -4px;
}

.loa-cover-body :deep(p) {
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--loa-text-md);
  max-width: 620px;
  letter-spacing: -0.01em;
}

.loa-cover-body :deep(code) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.loa-cover-body :deep(a) {
  color: #fff;
  border-bottom-color: rgba(255, 255, 255, 0.55);
}

.loa-cover-footer {
  font-family: var(--loa-font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  gap: 10px;
}

.loa-cover-footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--loa-cobalt-500);
  box-shadow: 0 0 10px var(--loa-cobalt-500);
}
</style>
