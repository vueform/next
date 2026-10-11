import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// A 100% vapor consumer app: every SFC — the app's own and none of the
// library's (those come prebuilt) — is vapor-compiled, and the `vapor`
// exports condition serves the adapters' vapor dist through the real
// exports maps. No dev plugin, no source aliases.
export default defineConfig({
  plugins: [vue({ features: { vapor: true } })],
  resolve: {
    conditions: ['vapor'],
    dedupe: ['vue'],
  },
  preview: {
    // The smoke contract: serve listens on 127.0.0.1:SMOKE_PORT (an explicit
    // IPv4 host — `localhost` resolves to ::1 on some machines, and the
    // harness probes 127.0.0.1).
    host: '127.0.0.1',
    port: Number(process.env.SMOKE_PORT) || 4173,
    strictPort: true,
  },
})
