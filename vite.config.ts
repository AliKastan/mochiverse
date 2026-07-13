import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Emit RELATIVE asset URLs (./assets/…) instead of absolute (/assets/…) so the
  // built app loads its sprites/CSS/JS no matter where it's hosted — domain root,
  // a subpath (e.g. GitHub Pages project page), or a static file host. Absolute
  // paths 404 everywhere but the root, which shows up as broken images and an
  // invisible character (its sprite PNG fails to load, leaving only the shadow).
  base: './',
  plugins: [react()],
})
