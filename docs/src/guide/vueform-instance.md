---
outline: [2,3]
---

# Vueform Instance

`createVueform()` returns the **Vueform instance** — the object you hand to `app.use()`. Being a Vue plugin is the least interesting part of it. The instance owns the resolved configuration, the created modules, and the globals, and every form, element, composable, and plugin reads them from there. It is complete the moment `createVueform()` returns, so code with no component — and even no Vue app — can use it directly.

## Creating the Instance

```ts
import { createApp } from 'vue'
import { createVueform } from '@vueform/ui/origin'
import App from './App.vue'

const vueform = createVueform()

createApp(App).use(vueform).mount('#app')
```

The entry decides what the instance starts with. `@vueform/ui/origin` and `@vueform/ui/material` bundle every component, module, and rule, while the bare `@vueform/ui` entry starts empty and throws without a `model` module — [configuration](/guide/configuration) covers the entries, and [leaving a module out](/guide/modules#leaving-a-module-out) covers why `model` is the one you can't skip.

What the instance holds:

| Member | What it is |
| --- | --- |
| `config` | The resolved [configuration](/guide/configuration). |
| `modules` | The created [modules](/guide/modules). |
| `defaults` | The merged per-component [defaults](/guide/defaults), built on first read. |
| `globals` | The [globals](/guide/globals), built on first read. |
| `$http`, `$locale`, `$date`, `useModel`, `useForm` | Instance-bound capabilities — [outside a setup context](#outside-a-setup-context). |
| `module()`, `use()` | Late registration — [registering after creation](#registering-after-creation). |
| `getCSS()`, `getStyleTag()` | CSS extraction — [styles on the server](#styles-on-the-server). |
| `install` | Vue's plugin hook, called by `app.use()` — [two phases](#two-phases). |

## Two Phases

The setup is a two-phase pipeline. `createVueform()` builds the complete instance, and `app.use()` connects that finished instance to an app.

### `createVueform(config)`

Creation runs six steps, in order:

1. Your options merge over the entry's defaults into `vueform.config`. The merge rules — what shallow-merges, what concatenates, what replaces — live in [configuration](/guide/configuration).
2. Without a `model` module, creation throws.
3. Every plugin's `config` hook runs, in registration order and depth-first into nested `plugins`.
4. Plugin `props` and `emits` merge onto the components they target. They merge onto the instance's own copies of the component definitions, so two instances never share plugin-extended components.
5. Every [module](/guide/modules) in `config.modules` is created onto `vueform.modules`.
6. In development, a configured `$`-options key whose module isn't registered warns — `$autosave` options without the `autosave` module, say.

Everything on the instance works from here, with no app anywhere.

### `app.use(vueform)`

Install runs every step inside `app.runWithContext()`, so a module's or plugin's `install` hook can use injection-based composables:

1. The instance is provided app-wide through Vue's [provide / inject](https://vuejs.org/guide/components/provide-inject) — this is [the Vueform context](#the-vueform-context).
2. Each module's `install` hook runs — the theme module injects its stylesheet here.
3. Every component in `config.components` is registered with `app.component()`.
4. Each plugin's `install` hook runs, in registration order and depth-first.

One instance can be installed into several apps, and installing it into the same app twice is a no-op. In development the resolved config is also deep-frozen after the first install, so an accidental post-install mutation throws — `components`, `plugins`, `modules`, `globals`, and `rules` stay mutable, and refs like `config.locale` are skipped.

The pipeline has a lazy tail. The [globals](/guide/globals) are built the first time something reads them — the config's `globals` hook first, then every plugin's — and the merged component [defaults](/guide/defaults) are built on first read the same way. A plugin's `extend` hook runs later still, inside each matching component's `setup()` — see [plugins](/guide/plugins).

## Registering After Creation

Between the two phases the instance is still open. `module()` and `use()` add the pieces `createVueform()` didn't receive:

```ts
import { createVueform } from '@vueform/ui'
import { model, date } from '@vueform/ui/modules'
import myPlugin from './my-plugin'

const vueform = createVueform({ modules: { model } })

vueform.module('date', date)
vueform.use(myPlugin())
```

`module(name, definition)` sets `config.modules[name]` and creates the module onto `vueform.modules`, exactly as creation would have. Registering a name that already exists replaces that module.

`use(plugin)` is narrower. It pushes the plugin onto `config.plugins` and merges its `props` / `emits`, but the plugin's `config` hook never runs — that pass happened once, during creation. A plugin whose work lives in `config` is therefore a no-op through `use()`, and that includes the official `@vueform/expr-eval` and `@vueform/devtools` plugins, which register their adapter and module there — pass those through `createVueform({ plugins })`. A `globals` hook added this way only takes effect if the globals haven't been read yet.

Both throw once the instance has been installed into any app — components already mounted would disagree with later ones about what the instance holds. The typical use is a shared `createVueform()` file, with a test, a storybook, or a server entry adding its last pieces before installing.

## The Vueform Context

Inside an app, `useVueformContext()` returns the instance that app installed:

```vue
<script setup lang="ts">
import { useVueformContext } from '@vueform/ui'

const vueform = useVueformContext()

vueform.config // the resolved configuration
vueform.modules // the created modules
</script>
```

Don't confuse it with a component's [context](/guide/context) — that is one component's exposed surface, while this is the app-wide instance.

The injection resolves inside component `setup()` and inside `app.runWithContext()`. Anywhere else it throws a `NotInstalledError`, deliberately without a fallback, so a call can never silently read another app's — or, under SSR, another request's — instance.

The setup-bound composables — `useForm`, `useModel`, `useHttp`, `useLocale`, `useDate`, `useSecurity` — find the instance exactly this way, which is what makes them setup-bound in the first place.

## Outside a Setup Context

Pinia stores, route guards, tests, and server handlers aren't components, and some have no app at all, so the setup-bound composables throw there. The instance itself doesn't care — it was complete before any app existed — so every route below comes down to having it in hand.

Keep a reference. Create the instance in its own module and import it from `main.ts` and everywhere else:

```ts
// vueform.ts
import { createVueform } from '@vueform/ui/origin'

export const vueform = createVueform({
  // your configuration
})
```

`main.ts` imports `vueform` and passes it to `app.use()`, and a store or a plain script imports the same object directly. One caveat — module scope is shared between requests on an SSR server, so there the instance belongs in the per-request app factory, as [cross-request state](/guide/ssr#cross-request-state) explains.

### Instance Members

`!vueform.useModel` and `!vueform.useForm` are the [`useModel`](/guide/model#external-model) and [`useForm`](/guide/context#form-context) composables bound to this instance — same signature, same typing, no injection needed:

```ts
import { vueform } from '@/vueform'

const model = vueform.useModel({ schema }, payload)

await model.validate()
```

The typical use for `vueform.useForm` is defining a form in a store or module — its model-layer `form$` members work before anything mounts, and a component renders the returned component later. Models and forms built here belong to no component, so nothing tears them down for you. Call `model.destroy()` when you're done with one — per server request, say — to stop its watchers.

`!vueform.$http` and `!vueform.$locale` mirror the `$http` and `$locale` a component finds on its [context](/guide/context), and `!vueform.$date` is [`useDate`](/guide/date#useDate) bound to this instance's adapter:

```ts
const { data } = await vueform.$http.get('/api/countries')
const next = vueform.$locale.t('steps_next') // 'Next'
const due = vueform.$date(order.deadline).add(30, 'day')
```

`$http` is created once per instance and reused. When the backing module isn't registered, each member degrades as [leaving a module out](/guide/modules#leaving-a-module-out) describes — `$http` requests reject, `$locale.t()` returns the raw tag, and `$date()` throws.

### Passing the Instance

`useHttp`, `useLocale`, `useDate`, `useSecurity`, and `useForm` also take the instance as their last argument, and with it they work anywhere:

```ts
const $http = useHttp(vueform)
const [MyForm, form$] = useForm({ schema }, model, vueform)
```

`useLocale(vueform)`, `useDate(value, format, vueform)`, and `useSecurity(vueform)` follow the same shape — each composable's API page documents the parameter. `useModel` has no such parameter, which is why the instance carries `vueform.useModel`. Composables that bind to a component — `useConditions`, `useTemplateContext` — stay setup-only, instance or not.

## Styles on the Server

The theme module injects its stylesheet into the document at install, and a server render has no document to inject into — so the instance exposes the CSS as strings instead. `getCSS()` returns everything the registered modules contribute through their `getCSS` hooks, which today is the theme module's token variables and, with `grid` on, its grid utilities. `getStyleTag()` wraps the same CSS in a `<style>` tag carrying the configured `build.styleId` and `nonce`, escapes `</` so CSS content can't close the tag early, and returns `''` when there is no CSS.

```ts
vueform.getStyleTag()
// '<style id="vueform-theme">…</style>'
```

Where the tag goes in a render pipeline — and when a head manager makes extraction unnecessary — is covered in [SSR](/guide/ssr#without-a-head-manager).
