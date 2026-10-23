---
outline: [2,3]
---

# SSR

Vueform renders on the server with no separate build, no SSR flag, and no SSR plugin. The server render never touches browser APIs, generated IDs match between server and client, and nothing user- or request-specific lives in module scope. What's left to integrate is two things — one Vueform instance per request, and the generated stylesheet in the server response — and Nuxt does both for you.

## Nuxt

The Nuxt module calls the generated `createVueform(...)` factory inside a Nuxt plugin, so every request's Vue app gets its own instance, and styles go through Unhead — which Nuxt always provides — so they render into `<head>` on the server with no code of yours, as [With a Head Manager](#with-a-head-manager) describes. To install it, add `@vueform/nuxt-module` to `modules` in `nuxt.config` and set `vueform: { adapter: 'ui' }` — the `vueform` config key requires an `adapter`, either `'ui'` or `'primevue'`. There is nothing else to set up.

## Custom Vite Setup

A custom Vite SSR app uses the standard Vue SSR structure from [Vite's SSR guide](https://vite.dev/guide/ssr) — no Vite plugin is involved, because there is nothing for one to do. The one rule is to create the vueform instance inside the shared app factory, never at module scope; [Cross-Request State](#cross-request-state) explains why.

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

The client entry calls the same factory and mounts the app — `createSSRApp` hydrates the server-rendered HTML instead of replacing it. The server entry renders the app and hands back the generated styles alongside the HTML:

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

Your server — the Express handler from Vite's guide, or any equivalent — inserts the tag before `</head>` and the HTML into the app outlet. Component stylesheets need no server handling either. They are ordinary CSS imports that Vite bundles for the client like any other, and under plain Node — externalized dependencies, test runners — the packages' `*.css` exports resolve through the `node` condition to empty JS stubs, so server code that imports them still evaluates.

## Cross-Request State

An SSR server is a long-lived process. Anything in module scope survives from one request into the next and is shared between concurrent ones — Vue's SSR guide calls the resulting bug class [cross-request state pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution). Vueform keeps no state where it could leak:

- **Form state** — values, errors, view state — lives in the component tree of the app that renders it. A fresh app per request means a fresh form.
- **Instance state** — registered modules, the active locale, app-wide interceptors — lives on the object `createVueform()` returns.
- Composables reach the instance only through the app's provide/inject, and throw a `NotInstalledError` outside one rather than fall back — see [the Vueform context](/guide/vueform-instance#the-vueform-context).

One user's input can therefore never surface in another user's HTML. A vueform instance shared at module scope still can't leak form data, but it shares the active locale and every other piece of instance state between requests — the module-scope pattern from [outliving components](/guide/model#outliving-components) is browser-only. The per-request factory is also where per-request config belongs. A CSP nonce generated for the current response goes into `createVueform({ nonce })` inside the factory, which is one more reason the instance can't be a module-scope singleton under a strict CSP — see [style tag nonce](/guide/security#style-tag-nonce).

## Style Injection

Installing a vueform instance generates CSS — theme token declarations and grid utilities, or more precisely, the CSS every registered module contributes through its `getCSS` hook. In the browser, install injects it as a `<style id="vueform-theme">` tag in `<head>`. On the server there is no document, so install injects nothing on its own — the styles reach the response through one of two routes.

### With a Head Manager

When the app has [`@unhead/vue`](https://unhead.unjs.io/) installed, Vueform's install hook pushes the stylesheet into it — with the configured id and nonce — and the head manager renders it into `<head>` on server and client alike. Install `@unhead/vue` before `app.use(vueform)`; the lookup happens once, at install. The behavior is controlled by the [`useHead`](/guide/configuration#usehead) option, which defaults to `true`.

### Without a Head Manager

Without a head manager, extract the styles from the per-request instance with `getStyleTag()`, as the server entry in [Custom Vite Setup](#custom-vite-setup) does. The returned tag carries the configured [`build.styleId`](/guide/configuration#build) and [`nonce`](/guide/configuration#nonce), escapes `</` so CSS content can't close the tag early, and is `''` when there is no CSS. Building your own tag around `getCSS()` works too, as long as it carries the same `build.styleId` — on the client, install finds the existing tag by that id and reuses it instead of adding a second. Both members are documented in [styles on the server](/guide/vueform-instance#styles-on-the-server). The same extraction applies to SSG and prerendering, where it runs at build time.

Per-instance styles — [`tokens` overrides](/guide/themes-tokens#per-form-and-per-element-tokens) on a form or element, `!VfGrid` / `!VfMatrix` cell layouts — are `<style>` tags the components render themselves, so they are part of the SSR output with no extraction. [Style tag nonce](/guide/security#style-tag-nonce) covers giving all of these a CSP nonce.

## Hydration

A hydration mismatch is the server HTML differing from what the client produces on its first render pass. Vueform has two cases to care about.

### Stable IDs

Form and element `id`s come from the [`uid`](/guide/configuration#uid) config function, whose default is `() => useId()`; navigation and per-instance token classes use Vue's [`useId()`](https://vuejs.org/api/composition-api-helpers.html#useid) directly. `useId()` produces matching values on server and client, so the defaults never mismatch.

A custom `uid` must yield the same sequence in both environments. A module-scope counter does not — the server process keeps counting across requests while every browser starts from zero, so the sequences diverge after the very first request. Deriving the scheme from `useId()` is the simple fix — [configuration](/guide/configuration#uid) shows the pattern. For full control over the format, key the counter per app instead. `uid` runs during component `setup()`, so `getCurrentInstance()` is available inside it, and a per-app counter restarts at zero for every request and every browser:

```ts
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

### Dark Mode

Global [dark mode](/guide/themes-tokens#dark-mode) is pure CSS. `darkMode: 'system'` emits a `@media (prefers-color-scheme: dark)` block and a selector like `'.dark'` emits a `:root.dark` block, so the browser applies the right mode without the server knowing the user's preference.

`tokens.dark` overrides on a form or element are different — they resolve in JavaScript. On the server there is no `window`, so they render the light set, while the client's first render reads `prefers-color-scheme` or the `<html>` class — a dark-mode user gets a mismatching per-instance `<style>`. On a form, pass the `dark` prop from a preference the server knows, such as a cookie. Elements have no `dark` prop, so element-level `tokens.dark` always server-renders light — prefer form-level or global dark tokens in SSR apps.

## On the Server

Every `window` or `document` access inside Vueform is either environment-guarded or deferred to `onMounted`, which never runs on the server — the server render cannot crash on a missing browser API. A few features behave visibly differently there, and knowing them is knowing what the server HTML will contain.

`items` given as an endpoint URL or an async function render empty on the server and resolve on the client during hydration; arrays and synchronous functions render on the server. Drafts follow the same pattern — autosave [restores a stored draft](/guide/autosave#restoring-the-draft) on mount, so the server HTML shows the form's initial values and the draft lands after hydration.

### HTTP Is Client-Side

The built-in fetch adapter refuses to send during SSR. It throws an `HttpError` with reason `'ssr'` — "HTTP requests are not available during SSR" — so a `submit()` on the server resolves to a fail result and an autosave fails with the same reason; the reason table lives in [error handling](/guide/http#error-handling). The refusal exists because a response can't arrive before `renderToString` finishes — the result would miss the HTML and callbacks would run after the response was already sent.

The refusal belongs to the fetch adapter, not to the HTTP module itself. A custom adapter — axios, ofetch, your own — can send from the server, where the origin policy fails closed instead — `baseURL` isn't trusted implicitly and absolute URLs pass only when listed in [`allowOrigins`](/guide/security#request-origins).

Data a page needs in its server HTML comes from your framework's own data fetching — Nuxt's `useFetch`, a route loader — and goes into the form via `load()`, as [inside the form flow](/guide/http#inside-the-form-flow) shows.

## Your Own Code

Custom [templates](/guide/templates), [plugins](/guide/plugins), and components follow Vue's general rules for [SSR-friendly code](https://vuejs.org/guide/scaling-up/ssr.html#writing-ssr-friendly-code) — side effects in `onMounted`, no browser globals during render. The Vueform-specific part is the `isClient` / `isServer` pair, exported from `@vueform/ui` and evaluated once at module load:

```ts
import { isClient } from '@vueform/ui'

if (isClient) {
  window.addEventListener('resize', handleResize)
}
```

Setup-time `!useHttp` requests need the same gate — guard them with `isClient` or move them to `onMounted`, or the fetch adapter rejects them as [HTTP Is Client-Side](#http-is-client-side) describes.

## Troubleshooting

| Symptom | Cause | See |
| --- | --- | --- |
| `window is not defined` | Unguarded browser API in custom code | [Your Own Code](#your-own-code) |
| Hydration mismatch on an `id` | Custom `uid` diverging between server and client | [Stable IDs](#stable-ids) |
| Hydration mismatch on a token `<style>` in dark mode | `tokens.dark` resolving light on the server | [Dark Mode](#dark-mode) |
| `HTTP requests are not available during SSR` | Request fired during the server render | [HTTP Is Client-Side](#http-is-client-side) |
| Flash of unstyled content | Styles missing from the server response | [Style Injection](#style-injection) |
