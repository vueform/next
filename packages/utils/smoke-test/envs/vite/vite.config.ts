import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// A plain consumer app: no dev plugin, no source aliases — imports resolve
// through the installed tarballs' real exports maps.
export default defineConfig({
  plugins: [vue()],
  preview: {
    // The smoke contract: serve listens on 127.0.0.1:SMOKE_PORT (an explicit
    // IPv4 host — `localhost` resolves to ::1 on some machines, and the
    // harness probes 127.0.0.1).
    host: '127.0.0.1',
    port: Number(process.env.SMOKE_PORT) || 4173,
    strictPort: true,
  },
})
