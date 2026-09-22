---
outline: [2,3]
---

# SSR

Vueform is SSR-compatible out of the box. There is no separate build, no SSR flag, and no SSR-specific plugin to install. Browser APIs are never touched during the server render, element IDs are hydration-stable, and no user or request state is ever kept where another request could read it. In Nuxt everything is automatic; in a custom setup the only integration point is getting the generated CSS into the server response.

## Nuxt

In Nuxt there is nothing to set up for SSR specifically. The adapter's Nuxt module — installation is covered in [Quick Start](/guide/quick-start) — does two things on the SSR side: it installs Vueform per request, so every user gets a fresh instance, and it hands the generated styles to Nuxt's head manager, so they render into `<head>` on the server. Everything the rest of this chapter covers — style injection, per-request isolation, stable IDs — is handled for you.

## Vite

A plain Vite SSR app needs no build-time integration — there is no Vite plugin to install, because there is nothing for one to do. The setup is the standard Vue SSR structure from [Vite's SSR guide](https://vite.dev/guide/ssr), with two Vueform-specific points: create the vueform instance inside the shared app factory (so every request gets its own), and put the generated CSS into the server response.

The factory is the same one a client-only app would have, switched to `createSSRApp`:

```ts
// src/app.ts — shared between the server and client entries
import { createSSRApp } from 'vue'
import { createVueform } from '@vueform/ui/origin'
import App from './App.vue'

export function createApp() {
  const vueform = createVueform()
  const app = createSSRApp(App).use(vueform)

  return { app, vueform }
}
```

The client entry mounts it — `createSSRApp` hydrates the server-rendered HTML instead of replacing it:

```ts
// src/entry-client.ts
import { createApp } from './app'

createApp().app.mount('#app')
```

The server entry renders it and hands back the styles alongside the HTML:

```ts
// src/entry-server.ts
import { renderToString } from 'vue/server-renderer'
import { createApp } from './app'

export async function render() {
  const { app, vueform } = createApp()

  return {
    html: await renderToString(app),
    styleTag: vueform.getStyleTag(),
  }
}
```

Your server — the Express handler from Vite's guide, or any equivalent — inserts both into the HTML shell:

```ts
const { html, styleTag } = await render()

const page = template
  .replace('</head>', `${styleTag}\n</head>`)
  .replace('<!--app-html-->', html)
```

That's the whole integration. If your setup uses [`@unhead/vue`](https://unhead.unjs.io/), you can skip the `styleTag` plumbing entirely — see [Style Injection](#style-injection) below.

## Style Injection

Vueform generates CSS at install time: [theme token](/guide/themes-tokens#tokens) declarations (`:root { --vf-*: ... }`) and [responsive grid](/guide/form-structure#the-12-column-grid) utilities. In the browser these are injected as a `<style id="vueform-theme">` tag in `<head>`. During SSR the DOM is not available, so Vueform uses one of two strategies to get the styles into the server-rendered page.

### With `@unhead/vue`

When [`@unhead/vue`](https://unhead.unjs.io/) is installed on the app — which is always the case in Nuxt — Vueform pushes its stylesheet through the head manager instead of the DOM. The head manager renders it into `<head>` on both server and client, with no extra code on your part.

This behavior is controlled by the [`useHead`](/guide/configuration#usehead) config option, which defaults to `true`.

### Without a Head Manager

If your SSR setup does not use `@unhead/vue`, extract the generated CSS from the vueform instance and insert it into your HTML shell yourself, as the server entry in the [Vite](#vite) section above does:

```ts
// a complete <style> tag, ready to insert
const styleTag = vueform.getStyleTag()

// or assemble it yourself from the raw pieces
const css = vueform.getCSS()
const styleId = vueform.config.build.styleId // 'vueform-theme' by default
const nonce = vueform.config.nonce
```

`getStyleTag()` returns a complete `<style>` tag with the configured [`build.styleId`](/guide/configuration#build) and [`nonce`](/guide/configuration#nonce) already applied. If you build your own tag around `getCSS()`, give it that same id — on the client Vueform adopts the existing tag by id, and one without it would end up duplicated during hydration. Having the styles in the initial response prevents a flash of unstyled content. The same technique applies to SSG and prerendering, where the extraction runs at build time.

::: tip Content Security Policy
If your CSP restricts inline styles, pass your server's nonce through the `nonce` config option — `getStyleTag()`, the head manager path, and per-instance style tags all carry it. See [Style Tag Nonce](/guide/security#style-tag-nonce).
:::

## Cross-Request State

An SSR server is a long-lived process: anything stored in module scope survives from one request into the next and is shared between concurrent requests. Vue's SSR guide calls the resulting bug class [cross-request state pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution) — and a form framework handles exactly the kind of data (user input) where it would be most damaging.

Vueform keeps no state in module scope:

- **Form state** — values, errors, view state — lives inside the component tree of the app rendering it. A fresh app per request, which every SSR setup already creates, means a fresh, empty form for every user.
- **Instance state** — registered modules, the active locale, interceptors — lives on the object returned by `createVueform()`.
- Composables resolve everything through the app's provide/inject chain. There is deliberately no ambient fallback, so a call can never silently read another request's instance.

One user's input can therefore never surface in another user's HTML. The single rule to follow on your side: create the vueform instance inside the per-request app factory, as in the [Vite](#vite) section's `createApp`, rather than at the server entry's module scope — a shared instance cannot leak form data, but it would share app-level state like the active locale between requests. The Nuxt module already creates one per request.

## Hydration

Hydration mismatches happen when the HTML rendered on the server differs from what the client produces on its first render pass. Vueform avoids this in three ways.

### Stable IDs

Every element's `id` attribute is generated by the [`uid`](/guide/configuration#uid) config function. The default implementation uses Vue's [`useId()`](https://vuejs.org/api/composition-api-helpers.html#useid), which is designed to produce matching values on server and client. No mismatch, no extra setup.

If you override `uid`, it must produce the same sequence in both environments. Beware that the obvious implementation — a module-scope counter — is fine in a client-only app but breaks under SSR: the server process keeps counting across requests while every browser starts from zero, so the sequences diverge after the very first request:

```ts
// ❌ don't do this — hydration mismatch under SSR
let counter = 0

createVueform({
  uid: () => `vf-${++counter}`,
})
```

If all you need is a custom scheme, build it on top of `useId()` — it stays per-app and identical on server and client:

```ts
// ✅ derives from useId(), safe under SSR
import { useId } from 'vue'

createVueform({
  uid: () => `myform-${useId()}`,
})
```

And if you need full control over the format, key your counter per app instead of module scope. `uid` runs during component `setup()`, so `getCurrentInstance()` is available inside it (that's also why `useId()` works) — and a per-app counter restarts at zero for every request and every browser, which is exactly what `useId()` does internally:

```ts
// ✅ per-app counter, safe under SSR
import { getCurrentInstance, type App } from 'vue'

const counters = new WeakMap<App, number>()

createVueform({
  uid: () => {
    const app = getCurrentInstance()!.appContext.app
    const n = (counters.get(app) ?? 0) + 1
    counters.set(app, n)
    return `vf-${n}`
  },
})
```

### Browser API Access

All `window` and `document` access inside Vueform is either guarded with environment checks or deferred to `onMounted`, which never runs during SSR. The server render never touches browser-only APIs.

### Dark Mode

Global [dark mode](/guide/themes-tokens#dark-mode) is handled through CSS custom properties declared on `:root`. When `darkMode` is set to `'system'`, Vueform emits a `@media (prefers-color-scheme: dark)` block. When set to a CSS selector like `'.dark'`, it emits a `:root.dark` block. In both cases the browser applies the correct mode purely through CSS — the server-rendered HTML does not need to know the user's color scheme preference, and no inline style mismatch occurs.

## Writing SSR-Safe Code

If you are writing custom [templates](/guide/templates), [plugins](/guide/plugins), or components that interact with Vueform, keep these rules in mind.

### Guard Browser APIs

Use `isClient` or `isServer` to protect code that depends on `window`, `document`, or other browser globals:

```ts
import { isClient } from '@vueform/ui'

if (isClient) {
  window.addEventListener('resize', handleResize)
}
```

### Defer Side Effects

During SSR, only `setup()` runs — lifecycle hooks like `onMounted`, `onBeforeUnmount`, and `onUpdated` are skipped entirely. Move DOM manipulation, event listeners, timers, and any other side effects into `onMounted`:

```ts
import { onMounted } from 'vue'

onMounted(() => {
  const el = document.querySelector('.my-element')
  el?.focus()
})
```

### Gate HTTP Requests

[`useHttp`](/guide/http) requests made during the server render are rejected with an `HttpError` — `HTTP requests are not available during SSR` — because the response could never arrive before `renderToString` finishes: its result would silently miss the HTML and its callbacks would run after the response was already sent. Rejecting immediately makes the mistake visible instead. Gate setup-time requests with `isClient`, or defer them to `onMounted`:

```ts
import { isClient, useHttp } from '@vueform/ui'

const http = useHttp()

if (isClient) {
  http.get('/api/options').then((response) => {
    // ...
  })
}
```

### HTTP Is Client-Side

Vueform's [HTTP module](/guide/http) doesn't operate during SSR: the built-in fetch adapter refuses server-side requests (a `submit()` there fails with `reason: 'ssr'`), and elements with endpoint-driven items render empty on the server and fetch after hydration. Fetch server-rendered data through your framework's own data-fetching layer.

## Troubleshooting

### `window is not defined`

Custom code is accessing a browser API at the module's top level or during `setup()`. Guard the access with `isClient` or move it into `onMounted`:

```ts
import { isClient } from '@vueform/ui'

// top-level guard
const width = isClient ? window.innerWidth : 0

// or defer entirely
onMounted(() => {
  const width = window.innerWidth
})
```

### Hydration Mismatch on IDs

A custom `uid` function is producing different values on the server and client — most commonly a module-scope counter that keeps incrementing across requests on the server (see [Stable IDs](#stable-ids)). Switch back to the default (Vue's `useId()`) or ensure your implementation is deterministic across both environments.

### `HTTP requests are not available during SSR`

An HTTP request is being fired during the server render — typically an unguarded `useHttp` call in `setup()` — so it was rejected with this `HttpError`. Gate it with `isClient` or move it into `onMounted`; see [Gate HTTP Requests](#gate-http-requests) above.

### Flash of Unstyled Content ([FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content))

Vueform styles are not reaching the server-rendered HTML. Either install [`@unhead/vue`](https://unhead.unjs.io/) so styles are injected into `<head>` automatically, or call `getStyleTag()` in your server entry and insert the result into the HTML template. See [Style Injection](#style-injection) above.
