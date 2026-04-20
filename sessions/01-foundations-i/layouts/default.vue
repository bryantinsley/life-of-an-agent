<script setup lang="ts">
/**
 * Default content layout — warm-paper slide with a small brand strip
 * at the top (wordmark + eyebrow) and a page-number tick at the bottom.
 * The `title` prop lets frontmatter set the slide title without repeating
 * an h1 in the markdown body.
 */
defineProps<{
  title?: string;
  eyebrow?: string;
}>();
</script>

<template>
  <div class="loa-default">
    <header class="loa-default-head">
      <div class="loa-default-head-left">
        <div class="loa-brandmark on-paper" aria-hidden="true" />
        <div class="loa-default-head-text">
          <div class="loa-default-head-wordmark">Life of an Agent</div>
          <div class="loa-default-head-eyebrow">
            <span>S1 · Foundations I</span>
            <span v-if="eyebrow" class="loa-default-head-sep">·</span>
            <span v-if="eyebrow">{{ eyebrow }}</span>
          </div>
        </div>
      </div>
    </header>

    <h1 v-if="title" class="loa-default-title">{{ title }}</h1>

    <div class="loa-default-body" :class="{ 'has-title': !!title }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.loa-default {
  position: absolute;
  inset: 0;
  padding: 36px 56px 40px;
  background: var(--loa-paper);
  color: var(--loa-ink);
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: var(--loa-space-4);
  overflow: hidden;
}

.loa-default-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--loa-rule);
}

.loa-default-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loa-default-head-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: 3px;
}

.loa-default-head-wordmark {
  font-family: var(--loa-font-sans);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.012em;
  color: var(--loa-ink);
}

.loa-default-head-eyebrow {
  font-family: var(--loa-font-sans);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--loa-ink-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.loa-default-head-sep {
  color: var(--loa-ink-dim);
}

.loa-default-title {
  font-family: var(--loa-font-sans);
  font-size: var(--loa-text-2xl);
  font-weight: 700;
  letter-spacing: -0.022em;
  line-height: 1.08;
  color: var(--loa-ink);
  margin: 0;
  max-width: 720px;
}

.loa-default-body {
  overflow: hidden;
}

.loa-default-body.has-title {
  margin-top: -4px;
}

.loa-default-body :deep(h1:first-child) {
  font-size: var(--loa-text-2xl);
  font-weight: 700;
  letter-spacing: -0.022em;
  line-height: 1.08;
  margin: 0 0 var(--loa-space-3);
  max-width: 720px;
}

.loa-default-body :deep(h2:first-child) {
  font-size: var(--loa-text-xl);
  font-weight: 600;
  letter-spacing: -0.018em;
  line-height: 1.15;
  margin: 0 0 var(--loa-space-3);
  max-width: 720px;
}

.loa-default-body :deep(p) {
  font-size: var(--loa-text-md);
  line-height: 1.5;
  max-width: 68ch;
  margin-top: 0;
  margin-bottom: var(--loa-space-3);
}

.loa-default-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
