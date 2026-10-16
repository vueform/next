<script setup lang="ts">
import { useRoute } from 'vitepress'

import { adapters } from '../composables/useAdapter'

declare const __VF_ADAPTER__: string

// Dev servers run one port per adapter; both ports and production hosts
// come from config.json via the injected adapter list.
const adapterHosts: Record<string, string> = Object.fromEntries(
  adapters.map((a) => [
    a.key,
    import.meta.env.DEV ? `http://localhost:${a.devPort ?? 5173}` : a.host,
  ])
)

const adapterKeys = adapters.map((a) => a.key)

const route = useRoute()
const currentAdapter = __VF_ADAPTER__

function stripAdapterPrefix(path: string): string {
  for (const key of adapterKeys) {
    if (path.startsWith(`/${key}/`)) {
      return path.slice(`/${key}`.length)
    }
    if (path === `/${key}`) {
      return '/'
    }
  }
  return path
}

function onAdapterChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const targetAdapter = target.value
  if (targetAdapter === currentAdapter) return

  const host = adapterHosts[targetAdapter] ?? adapterHosts.ui
  const cleanPath = stripAdapterPrefix(route.path)
  window.location.href = `${host}${cleanPath}`
}
</script>

<template>
  <div class="vp-adapter-selector">
    <label class="vp-adapter-selector-label">Adapter</label>
    <div class="vp-adapter-selector-control">
      <select :value="currentAdapter" @change="onAdapterChange">
        <option v-for="a in adapters" :key="a.key" :value="a.key">
          {{ a.label }}
        </option>
      </select>
      <svg
        class="vp-adapter-selector-chevron"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  </div>
</template>
