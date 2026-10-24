---
outline: [2,3]
---

# Globals

Some values belong to the whole app rather than to one form — a country list several selects share, a permission flag that should lock every form at once, a formatter used in many help texts. Globals are where these live. They are members you return from a `globals` hook in `createVueform`, readable from every Vueform component, handler, and plugin. They are not [configuration](/guide/configuration) — config holds Vueform's own options and registries, while globals carry your values and your shared reactive state.

## Defining Globals

Pass a `globals` hook to `createVueform`. It receives a `!GlobalsHookContext` — the resolved config and a read-only view of the globals merged so far — and returns the members to add. Returning nothing is allowed.

```ts
import { ref } from 'vue'
import { createVueform } from '@vueform/ui/bundle'

app.use(
  createVueform({
    globals: () => ({
      countries: ['United States', 'Germany', 'Japan'],
      readonly: ref(false),
    }),
  })
)
```

A member can be any value — data, functions, refs, computeds. Only `ref` and `computed` members are reactive. The globals object itself is not (it's `markRaw`'d when placed on contexts), so assigning or adding members at runtime updates nothing — mutable state goes in a ref, and new members go through a hook.

Globals are built lazily, once per instance, the first time anything reads them — usually the first Vueform component's setup. Every form and component of every app the instance is installed into shares that one object. A global ref is therefore instance state, so on an SSR server the instance belongs in the per-request app factory — see [cross-request state](/guide/ssr#cross-request-state).

## Typing Globals

The hook's return type is `Partial<VueformGlobals>`, so returning a member TypeScript doesn't know about is a compile error — and reading it back doesn't type-check either. Augmenting the interface is the first step of using globals in TypeScript, not an optional extra:

```ts
import type { Ref } from 'vue'

declare module '@vueform/core' {
  interface VueformGlobals {
    countries: string[]
    readonly: Ref<boolean>
  }
}
```

Place the augmentation in any `.d.ts` file TypeScript includes. One augmentation types the hook's return and every read route — `useGlobals()`, `$globals`, and `vueform.globals`. Plugins ship theirs next to the plugin — see [augmenting types](/guide/plugins#augmenting-types).

## Reading Globals

Three routes lead to the same object — which one to use depends on where your code runs.

### In a Component

In the setup of any component inside an app that installed Vueform, `useGlobals()` returns the globals:

```vue
<script setup lang="ts">
import { useGlobals } from '@vueform/ui'

const { readonly } = useGlobals()
</script>

<template>
  <button @click="readonly = !readonly">
    {{ readonly ? 'Unlock' : 'Lock' }} all forms
  </button>
</template>
```

Flipping the ref locks every consumer at once — the next section wires a field to it. `useGlobals` is setup-only and throws a `NotInstalledError` anywhere else; the two routes below cover those cases.

### From a Context

Every Vueform component's [context](/guide/context) carries the globals as `$globals`, alongside `$config`, `$i18n`, and `$http`. Anything that receives a context reads globals without a setup — [event handlers and function props](/guide/context#context-from-argument), [functional conditions](/guide/conditions#functional-conditions), slot and template code:

```ts
{
  country: {
    type: 'select',
    label: 'Country',
    items: (el$) => el$.$globals.countries,
  },
  name: {
    type: 'text',
    label: 'Name',
    readonly: (el$) => el$.$globals.readonly.value, // [!code highlight]
  },
}
```

This schema can live in its own module, outside any component. Refs are not unwrapped on `$globals`, so read them with `.value`. The `readonly` function re-evaluates whenever the ref changes — flip the global and the field locks live — [function props](/guide/dynamic-props#functions) cover why.

### Outside Components

Pinia stores, router guards, and tests have neither a setup nor a context. There, the instance returned by `createVueform` exposes the same object as `vueform.globals`:

```ts
vueform.globals.readonly.value = true
```

Keeping an instance reference at hand is covered in [outside a setup context](/guide/vueform-instance#outside-a-setup-context).

## Globals from Plugins

`!definePlugin` accepts a `globals` hook too, with the same `!GlobalsHookContext` argument and the same return contract:

```ts
import { definePlugin } from '@vueform/ui'

export default definePlugin(() => ({
  name: 'feature-flags',
  globals: () => ({
    featureFlags: { newCheckout: true },
  }),
}))
```

Plugin hooks run after the app's hook, so a plugin can read what the app defined through its `globals` argument and build on it. Registration and the rest of the plugin surface live in [plugins](/guide/plugins).

## Merge Order and Overrides

Globals accumulate in a fixed order:

1. Vueform's built-ins. The only one is `defaultBreakpoint`, a `ComputedRef<string>` resolving to `'base'` — the breakpoint under which the layout resolves unprefixed values.
2. The app's `globals` hook.
3. Each plugin's hook in registration order — plugins bundled by the entry, then the `plugins` option. Nested `plugins` run depth-first, each right after its parent.

A name that already exists is overridden — the later value wins. In development, Vueform warns about each override (`Global "x" is defined more than once — the later value wins`), because two sources claiming one name is usually a collision. When the override is intentional, silence it with `globalWarns: false` in the config. Production never logs.

Leave `defaultBreakpoint` alone unless you mean to change the layout's base breakpoint, and keep your own member names distinct from it.
