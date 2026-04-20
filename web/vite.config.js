import { defineConfig } from 'vite';

// Relative base so the built landing page works from any URL prefix
// (GitHub Pages /life-of-an-agent/ or local _site/ preview, equally).
export default defineConfig({
  base: './',
});
