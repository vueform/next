---
outline: [2,3]
---

# Vueform Instance

`createVueform()` returns the **Vueform instance** — the object you hand to `app.use()`. Being a Vue plugin is just one aspect of it. The instance owns the resolved configuration, the created modules, and the globals, and every form, element, composable, and plugin reads them from there. It is complete the moment `createVueform()` returns, so code with no component — and even no Vue app — can use it directly.

## Creating the Instance

```ts
import { createApp } from 'vue'
import { createVueform } from '@vueform/ui/origin'
import App from './App.vue'

const vueform = createVueform()

createApp(App).use(vueform).mount('#app')
```

The entry decides what the instance starts with. [Pre-configured entries](/guide/code-splitting#pre-configured-entries) bundle every component, module, and rule, while with [modular setup](/guide/code-splitting#modular-setup) entry starts empty.

What the instance holds:

| Member | What it is |
| --- | --- |
| `config` | The resolved [configuration](/guide/configuration). |
| `modules` | The created [modules](/guide/modules). |
| `defaults` | The merged per-component [defaults](/guide/defaults), built on first read. |
| `globals` | The [globals](/guide/globals), built on first read. |
| `!useForm()`, `!useModel()`, `!useHttp()`, `!useLocale()`, `!useDate()`, `!useSecurity()` | The composables, bound to this instance — [outside a setup context](#outside-a-setup-context). |
| `getCSS()`, `getStyleTag()` | CSS extraction — [styles on the server](#styles-on-the-server). |
| `install` | Vue's plugin hook, called by `app.use()` — [two phases](#two-phases). |

## Two Phases

The setup is a two-phase pipeline. `createVueform()` builds the complete instance, and `app.use()` connects that finished instance to an app.

### `!createVueform(config)`

Creation runs six steps, in order:

1. Your options merge over the entry's defaults into `vueform.config`. The merge rules — what shallow-merges, what concatenates, what replaces — live in [configuration](/guide/configuration).
2. Without a [`model` module](/guide/code-splitting#the-required-module), creation throws.
3. Every plugin's [`config`](/guide/plugins#modifying-global-configuration) hook runs, in registration order and depth-first into nested `plugins`.
4. Plugin [`props` and `emits`](/guide/plugins#adding-props-and-emits) merge onto the components they target. They merge onto the instance's own copies of the component definitions, so two instances never share plugin-extended components.
5. Every [module](/guide/modules) in `config.modules` is created onto `vueform.modules`.
6. In development, a configured `$`-options key whose module isn't registered warns — `$autosave` options without the `autosave` module, say.

Everything on the instance works from here, with no app anywhere.

### `app.use(vueform)`

Install runs every step inside `app.runWithContext()`, so a module's or plugin's `install` hook can use injection-based composables:

1. The instance is provided app-wide through Vue's [provide / inject](https://vuejs.org/guide/components/provide-inject) — this is what [`useVueform`](#accessing-the-instance) reads.
2. Each [module](/guide/modules)'s `install` hook runs — the theme module injects its stylesheet here.
3. Every component in [`config.components`](/guide/configuration#components) is registered with `app.component()`.
4. Each plugin's [`install`](/guide/plugins#app-side-effects) hook runs, in registration order and depth-first.

One instance can be installed into several apps, and installing it into the same app twice is a no-op. In development the resolved config is also deep-frozen after the first install, so an accidental post-install mutation throws — `components`, `plugins`, `modules`, `globals`, and `rules` stay mutable, and refs like `config.locale` are skipped.

The pipeline has a lazy tail. The [globals](/guide/globals) are built the first time something reads them — the config's `globals` hook first, then every plugin's — and the merged component [defaults](/guide/defaults) are built on first read the same way. A plugin's `extend` hook runs later still, inside each matching component's `setup()` — see [plugins](/guide/plugins).

## Accessing the Instance

Inside an app, `useVueform()` returns the instance that app installed — the same object `createVueform()` built:

```vue
<script setup lang="ts">
import { useVueform } from '@vueform/ui'

const vueform = useVueform()

vueform.config // the resolved configuration
vueform.modules // the created modules
</script>
```

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

### Instance-Bound Composables

The same six composables live on the instance, pre-bound — `!vueform.useForm`, `!vueform.useModel`, `!vueform.useHttp`, `!vueform.useLocale`, `!vueform.useDate`, and `!vueform.useSecurity`. Same names, same signatures, same typing — the only difference is that nothing is resolved by injection:

```ts
import { vueform } from '@/vueform'

const model = vueform.useModel({ schema }, payload)
await model.validate()

const { data } = await vueform.useHttp().get('/api/countries')
const next = vueform.useLocale().t('steps_next') // 'Next'
const due = vueform.useDate(order.deadline).add(30, 'day')
```

Each gives what its setup-bound twin would — `useHttp()` creates an http client over this instance's http module, `useLocale()` and `useSecurity()` return their module, [`useDate()`](/guide/date#useDate) parses through its date adapter, and [`useModel()`](/guide/model#external-model) / [`useForm()`](/guide/context#form-context) build models and forms that belong to this instance.

## Styles on the Server

The theme module injects its stylesheet into the document at install, and a server render has no document to inject into — so the instance exposes the CSS as strings instead. `getCSS()` returns everything the registered modules contribute through their `getCSS` hooks, which today is the theme module's token variables and, with `grid` on, its grid utilities. `getStyleTag()` wraps the same CSS in a `<style>` tag carrying the configured `build.styleId` and `nonce`, escapes `</` so CSS content can't close the tag early, and returns `''` when there is no CSS.

```ts
vueform.getStyleTag()
// '<style id="vueform-theme">…</style>'
```

Where the tag goes in a render pipeline — and when a head manager makes extraction unnecessary — is covered in [style injection](/guide/ssr#style-injection).
