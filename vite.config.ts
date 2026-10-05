import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // node_modules is a symlink to node_modules.nosync (kept out of iCloud sync);
  // keep the symlinked path so Vite still treats dependencies as node_modules.
  resolve: { preserveSymlinks: true },
})
