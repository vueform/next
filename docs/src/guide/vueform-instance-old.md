---
outline: [2,3]
---

# Vueform Instance

`createVueform()` returns the **Vueform instance** — the object you hand to `app.use()`. It's a Vue plugin, but that's the least interesting thing about it: the instance is the owner of everything you configured. The resolved configuration, the created modules, and the globals all live on it, and every form, element, composable, and plugin in the app reads them from there.

This chapter explains what happens when the instance is created and installed, how components reach it, and how it serves code that has no component — or no Vue app — at all.

## Creating and Installing

One `createVueform()` call produces one instance; `app.use()` installs it into an app:

```ts
import { createApp } from 'vue'
import { createVueform } from '@vueform/ui/origin'
import App from './App.vue'

const vueform: VueformInstance = createVueform({
  // your configuration
})

createApp(App).use(vueform).mount('#app')
```

Everything on the instance exists as soon as `createVueform()` returns — installing only connects it to an app. Components never need a reference to it; code outside components does, and [Outside a Setup Context](#outside-a-setup-context) shows how to keep one around.

## Two Phases

Setting Vueform up is two distinct steps, and the work is split unevenly between them: `createVueform()` builds the complete instance, while `app.use()` only connects that finished instance to an app.

**`createVueform(config)` builds the instance:**

1. Your options are merged over the entry's defaults into `vueform.config`.
2. Every [plugin](/guide/plugins)'s `config` hook runs, in registration order and depth-first into nested plugins — this is where a plugin adjusts the configuration before anything is built from it.
3. Plugin `props` and `emits` are merged onto the components they target.
4. Every [module](/guide/modules) definition in `config.modules` is created onto `vueform.modules`.

When the call returns, the instance is complete. `vueform.$http`, `!vueform.useModel`, the module doorways — all of it works with no Vue app anywhere, which is why server code and tests can use an instance that is never installed.

**`app.use(vueform)` connects it to an app:**

1. The instance is provided to the app — via Vue's standard [provide / inject](https://vuejs.org/guide/components/provide-inject) — as the [Vueform Context](#the-vueform-context), which is how composables inside components find it.
2. Each module's `install` hook runs — the theme module injects its styles here.
3. The components are registered with Vue (`app.component()`).
4. Each plugin's `install` hook runs — directives and similar app-level registrations.

Two things happen later still: the [globals](/guide/globals) are built the first time they're read (the config's `globals` callback, then every plugin's `globals` hook), and a plugin's `extend` runs inside each matching component's `setup()`.

The takeaway is that nothing about the instance itself changes at install — it's the same object before and after, only now an app knows about it. That's also why [`module()`](#registering-after-creation) and [`use()`](#registering-after-creation) refuse to run once installed: the components already mounted would be running against a different set of modules than the ones mounted next.

## The Vueform Context

The first step of installing uses Vue's standard [provide / inject](https://vuejs.org/guide/components/provide-inject) mechanism: the instance is `provide`d app-wide under Vueform's own injection key, and anything running inside the app can `inject` it back with `useVueformContext()`:

```vue
<script setup lang="ts">
import { useVueformContext } from '@vueform/ui'

const vueform = useVueformContext()

vueform.config   // the resolved configuration
vueform.modules  // the created modules
</script>
```

Not to be confused with the component [Context](/guide/context) — that one is an element's or form's own API. The **Vueform Context** is the app's instance, the same object `createVueform()` returned, and there is deliberately no fallback: outside a component (or `app.runWithContext()`) it throws rather than guess, so a call can never silently read another app's — or, on the server, another request's — instance.

This is also how the framework's own composables reach it. `useConfig()` and `useGlobals()` are nothing more than the context plus a property access:

```ts
export function useConfig() {
  return useVueformContext().config
}

export function useGlobals() {
  return useVueformContext().globals
}
```

## Outside a Setup Context

All of the above depends on an injection being available — a component's `setup()`, running inside an installed app. That isn't always the case. Server code that builds a form to validate an incoming payload, a Pinia store, a route guard, a test: none of them is a component, and some of them don't have a Vue app at all. `useForm()` and `useModel()` called there would look for a context and find none.

The instance is the way around it. Since it is complete before — and independently of — any installation, it can hand out the same capabilities directly. The first step is to keep a reference to it, which means creating it in a module of its own instead of inline in `main.ts`, so that `main.ts` and everything else can import it:

::: code-group

```ts [vueform.ts]
import { createVueform } from '@vueform/ui/origin'

export const vueform = createVueform({
  // your configuration
})
```

```ts [main.ts]
import { createApp } from 'vue'
import { vueform } from './vueform'
import App from './App.vue'

createApp(App).use(vueform).mount('#app')
```

:::

From then on, any file can build forms and models from the instance with no component in sight — a server handler validating an incoming payload, for instance:

```ts nolink=model$
// server/validate-order.ts
import { vueform } from '@/vueform'

// A headless model with no component — see Model
const model$ = vueform.useModel({ schema }, payload)

// A form with no component — see Rendering
const form = vueform.useForm({ schema })
```

`!vueform.useModel` and `!vueform.useForm` are the [`useModel`](/guide/model) and [`useForm`](/guide/rendering) composables bound to **this instance**: same signature, same typing, but the instance is already known, so nothing has to be injected.

`!vueform.$http` and `!vueform.$locale` solve the same problem for the modules code outside components most often needs — they mirror the `!$http` and `!$locale` a component finds on its context — and `!vueform.$date` is [`useDate`](/guide/date#usedate) bound the same way:

```ts
// stores/countries.ts
import { vueform } from '@/vueform'

const { data } = await vueform.$http.get('/api/countries')
const label = vueform.$locale.t('steps_next')
const expires = vueform.$date().add(30, 'day')
```

Without the corresponding module registered, `$http` and `$locale` behave like their in-component counterparts — requests reject, translations return raw tags — rather than failing at access, while `$date` throws when called, since date work without an adapter has no sensible fallback.

## Styles on the Server

Since the server is where much of this code lives, one more instance member belongs here. The theme module injects its stylesheet when the instance is installed into an app; during server-side rendering there may be no document to inject into. `getCSS()` returns the same CSS — grid and theme variables — as a string, and `getStyleTag()` returns it wrapped in a `<style>` tag with the configured style id and `nonce` already applied:

```ts
// server/render.ts
import { vueform } from '@/vueform'

const html = `<!doctype html>
<html>
  <head>${vueform.getStyleTag()}</head>
  <body>${appHtml}</body>
</html>`
```

See [SSR](/guide/ssr#without-a-head-manager) for where this fits into a rendering pipeline.

## Registering After Creation

Modules and plugins normally arrive through the `createVueform()` options, but the instance also accepts them afterwards — as long as it hasn't been installed yet:

```ts
// vueform.ts
import { createVueform } from '@vueform/ui/origin'
import { date } from '@vueform/ui/modules'
import { myPlugin } from './plugins'

export const vueform = createVueform()

vueform.module('date', date)  // adds to config.modules and creates it
vueform.use(myPlugin)         // adds to config.plugins, applies its props and emits
```

`module(name, definition)` puts the definition on `config.modules` and creates it onto `vueform.modules`, exactly as `createVueform()` would have. `use(plugin)` pushes the plugin onto `config.plugins` and applies its `props` and `emits` to the components it targets; its `config` hook is not re-run, since the config has already been resolved. Both throw once `app.use(vueform)` has run, for the reason [Two Phases](#two-phases) gave: mounted components would otherwise disagree with the ones mounted next about what the instance contains.

The typical use is a shared `createVueform()` in one file and an environment — a test, a storybook, a server entry — deciding the last few pieces before it installs.
