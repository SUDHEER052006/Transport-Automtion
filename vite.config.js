import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site at /<repo-name>/ — must match your repo name.
  // Local dev stays at plain "/".
  base: command === 'build' ? '/Transport-Automtion/' : '/',
}))
