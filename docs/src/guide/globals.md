---
outline: [2,3]
---

# Globals

Some values belong to every form in the app: a country list used by five selects, a currency formatter, a read-only switch flipped by user permissions. **Globals** are Vueform's application-wide store for exactly this kind of shared state — defined once at config time, readable from any component at runtime via `useGlobals`.

## Defining Globals

Pass a `globals` callback to `createVueform`. It receives a context object — the resolved `config` and a read-only view of the `globals` registered so far — and **returns** the members to register:

```ts
import { ref } from 'vue'
import { createApp } from 'vue'
import App from './App.vue'
import { createVueform } from '@vueform/ui/origin'

const app = createApp(App)

app.use(createVueform({
  globals: ({ config }) => ({
    countries: ['us', 'gb', 'de', 'fr'],

    formatCurrency: (value: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value),

    readonly: ref(false),
  }),
}))

app.mount('#app')
```

The returned object is merged into the app's globals on top of the entry's built-ins. Returning a name that already exists overrides it — with a dev warning, since that's usually an accident (see [Override Warnings](#override-warnings)). Whatever you return becomes available to every component in the app.

## Consuming Globals

Call `useGlobals` in any component inside the app that installed Vueform:

```vue
<script setup lang="ts">
import { useGlobals } from '@vueform/ui'

const { countries, formatCurrency, readonly } = useGlobals()
</script>

<template>
  <p>{{ formatCurrency(99.9) }}</p>
  <ul>
    <li v-for="code in countries" :key="code">{{ code }}</li>
  </ul>
</template>
```

Globals travel through Vue's injection system, so `useGlobals` works in page components, custom [components](/guide/components), [plugin](/guide/plugins) code, and composables alike.

## Use Cases

**Static lists** — one array feeding many selects, no duplication:

```ts
createVueform({
  globals: () => ({
    roles: ['admin', 'editor', 'viewer'],
    priorities: [
      { value: 1, label: 'Low' },
      { value: 2, label: 'Medium' },
      { value: 3, label: 'High' },
    ],
  }),
})
```

**Shared methods** — formatters, converters, domain helpers that read app-level context (the resolved config is right there on the hook's context):

```ts
createVueform({
  globals: ({ config }) => ({
    toSlug: (text: string) =>
      text.toLowerCase().replace(/\s+/g, '-'),

    formatDate: (date: Date) =>
      new Intl.DateTimeFormat(String(config.locale)).format(date),
  }),
})
```

**Reactive state** — a `ref` or `computed` updates every consumer at once:

```ts
import { ref } from 'vue'

createVueform({
  globals: () => ({
    readonly: ref(false),
  }),
})
```

Set `useGlobals().readonly.value = true` anywhere — every component reading it reacts immediately. Combined with [dynamic props](/guide/dynamic-props) and [conditions](/guide/conditions), a single global ref can drive behavior across all forms:

::: code-group

```ts [Schema]
import { defineSchema, useGlobals } from '@vueform/ui'

defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    readonly: useGlobals().readonly,
  },
})
```

```vue [Template]
<script setup lang="ts">
import { useGlobals } from '@vueform/ui'

const { readonly } = useGlobals()
</script>

<template>
  <VfText name="email" label="Email" :readonly />
</template>
```

:::

## Globals from Plugins

Plugins register globals through the same-named hook in `definePlugin`, running **after** the app-level callback — so plugins extend what the app already provides. The hook receives the same context object as the app-level callback — with the `globals` view now including everything registered before it — and returns its own members:

```ts
import { definePlugin } from '@vueform/ui'

export default definePlugin(() => ({
  name: 'feature-flags',
  globals: ({ config, globals }) => ({
    featureFlags: {
      darkMode: true,
      betaEditor: false,
    },
  }),
}))
```

```ts
import featureFlags from './plugins/featureFlags'

createVueform({
  plugins: [featureFlags()],
})
```

Every component can now read `useGlobals().featureFlags` without knowing which plugin provided it. See [Plugins](/guide/plugins) for the full plugin surface.

## Override Warnings

Globals merge in a fixed order: the entry's built-ins, then the app-level callback, then each plugin's hook. A hook returning a name that already exists **overrides** it — the later value wins — and Vueform logs a dev warning, because two sources claiming one name is usually a plugin collision rather than a plan.

When the override is intentional, turn the warning off:

```ts
createVueform({
  globalWarns: false,
})
```

The warning is development-only either way; production builds never log it.

## TypeScript

The globals object is typed as `VueformGlobals`. Augment the interface in a declaration file and both the `globals` callbacks' return values and `useGlobals()` become fully typed:

```ts
// globals.d.ts
import type { Ref } from 'vue'

declare module '@vueform/core' {
  interface VueformGlobals {
    countries: string[]
    formatCurrency: (value: number) => string
    readonly: Ref<boolean>
  }
}
```

Place the file anywhere TypeScript can see it (e.g. `src/globals.d.ts`) — no import needed, the augmentation applies globally. Mistyped names or wrong shapes are flagged at compile time.

::: info
The globals start with one built-in member: `defaultBreakpoint`, the base breakpoint Vueform's layout calculations start from. Everything else is yours.
:::
