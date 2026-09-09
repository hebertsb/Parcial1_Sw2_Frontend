import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      // usePolling: corriendo dentro de Docker (bind mount Windows -> Linux), los eventos
      // nativos de inotify no cruzan esa frontera, asi que Vite nunca detecta los cambios
      // de archivo sin polling activo.
      watch: process.env.DISABLE_HMR === 'true' ? null : { usePolling: true, interval: 300 },
    },
  };
});
