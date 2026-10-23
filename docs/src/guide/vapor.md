---
outline: [2,3]
---

# Vapor

[Vapor mode](https://github.com/vuejs/core/issues/13687) is Vue 3.6's new compilation strategy — templates compile into code that creates and updates DOM nodes directly, with no virtual DOM to build or diff. It currently ships as part of Vue 3.6's release candidates. Vueform is built for it from the start — every component has a vapor build alongside the regular one, selected by the `vapor` export condition, so forms run in vapor mode out of the box, with no bridge and no separate integration.

Vapor support is **experimental** on both sides. Vapor itself is in release-candidate phase, and Vueform's vapor builds track it, so the opt-in may change until it stabilizes.

## When It Pays Off

Vapor's gains are in updates, not mounting. [Replacing all values](/guide/performance#replacing-all-values) — the operation behind loading a draft or populating an edit view — runs more than twice as fast in vapor in a 1,000-element form, while [mount cost](/guide/performance#rendering) lands within a few percent of the virtual DOM's. The charts and measured numbers live in [performance](/guide/performance).

## Setup in a Vite App

Opting in takes two switches in the build — compile the app's SFCs with Vue's vapor feature, and add the `vapor` export condition so `@vueform/ui` resolves to its vapor build:

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defaultClientConditions, defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue({ features: { vapor: true } })],
  resolve: { conditions: ['vapor', ...defaultClientConditions] },
})
```

Since Vite 6, a user-set `resolve.conditions` replaces the default client conditions instead of adding to them — spreading `defaultClientConditions` keeps the standard `module` / `browser` / production resolution intact.

A vapor app is mounted with `createVaporApp` instead of `createApp`, and Vueform installs the same either way:

```ts
// main.ts
import { createVaporApp } from 'vue'
import { createVueform } from '@vueform/ui/origin'
import App from './App.vue'

const app = createVaporApp(App)

app.use(createVueform())
app.mount('#app')
```

Nothing else changes — schemas, components, configuration, and the rest of this guide apply identically in both modes. The [Nuxt module](/guide/ssr#nuxt) doesn't wire the `vapor` condition yet.
