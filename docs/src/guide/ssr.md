---
outline: [2,3]
---

# SSR

Vueform renders on the server with no separate build, no SSR flag, and no SSR plugin. The server render never touches browser APIs, generated IDs match between server and client, and nothing user- or request-specific lives in module scope. What's left to integrate is two things — one Vueform instance per request, and the generated stylesheet in the server response — and Nuxt does both for you.

## Nuxt

The Nuxt module calls the generated `createVueform(...)` factory inside a Nuxt plugin, so every request's Vue app gets its own instance, and styles go through [Unhead](https://unhead.unjs.io/docs/vue/head/guides/get-started/installation) — which Nuxt always provides — so they render into `<head>` on the server with no code of yours, as [With a Head Manager](#with-a-head-manager) describes. To install it, add `@vueform/nuxt-module` to `modules` in `nuxt.config` and name your adapter under the `vueform` config key — for example `vueform: { adapter: 'ui' }`. There is nothing else to set up.

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

Your server — the Express handler from Vite's guide, or any equivalent — inserts the tag before `</head>` and the HTML into the app outlet. Component stylesheets need no server handling either in a **built app** — they are ordinary CSS imports that `vite build` extracts into `<link>` tags in the HTML, so the response is styled before any JavaScript runs. Under plain Node — externalized dependencies, test runners — the packages' `*.css` exports resolve through the `node` condition to empty JS stubs, so server code that imports them still evaluates.

### Styles in Development

The dev server behaves differently. In middleware mode Vite serves CSS imports as JavaScript modules that inject `<style>` tags once the client bundle runs, so the server-rendered HTML paints unstyled first. This flash of unstyled content is a dev-server artifact every Vite SSR app has, not a Vueform behavior — the theme tag from `getStyleTag()` is unaffected, what flashes in is the component stylesheets — and a production build does not have it, because there the stylesheets arrive as render-blocking `<link>` tags.

Verifying styling against a production build is usually enough. To remove the flash in dev, inline the stylesheets the app imported — after a render, Vite's module graph knows them all, and `?direct` is the raw-CSS form Vite serves to `<link>` tags:

```js
// server.js — dev only, after ssrLoadModule + render
async function collectDevStyleTags() {
  const tags = []
  const seen = new Set()

  for (const mod of vite.moduleGraph.urlToModuleMap.values()) {
    const url = mod.url.replace(/\?.*$/, '')
    if (!/\.(css|scss|sass|less|styl)$/.test(url) || seen.has(url)) continue
    seen.add(url)

    const result = await vite.transformRequest(`${url}?direct`)
    if (result?.code) tags.push(`<style data-dev-css="${url}">${result.code}</style>`)
  }

  return tags.join('')
}
```

Insert the result into `<head>` next to the theme tag. The client injects the same rules again once it loads, which is harmless — the JS-injected copies come later in `<head>` and win the cascade, so HMR updates stay effective.

## Cross-Request State

An SSR server is a long-lived process. Anything in module scope survives from one request into the next and is shared between concurrent ones — Vue's SSR guide calls the resulting bug class [cross-request state pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution). Vueform keeps no state where it could leak:

- **Form state** — values, errors, view state — lives in the component tree of the app that renders it. A fresh app per request means a fresh form.
- **Instance state** — registered modules, the active locale, app-wide interceptors — lives on the object `createVueform()` returns.
- Composables reach the instance only through the app's provide/inject, and throw a `NotInstalledError` outside one rather than fall back — see [`useVueform`](/guide/vueform-instance#accessing-the-instance).

One user's input can therefore never surface in another user's HTML. A vueform instance shared at module scope still can't leak form data, but it shares the active locale and every other piece of instance state between requests — the module-scope pattern from [outliving components](/guide/model#outliving-components) is browser-only. The per-request factory is also where per-request config belongs. A CSP nonce generated for the current response goes into `createVueform({ nonce })` inside the factory, which is one more reason the instance can't be a module-scope singleton under a strict CSP — see [style tag nonce](/guide/security#style-tag-nonce).

## Style Injection

Installing a vueform instance generates CSS — theme token declarations and grid utilities, or more precisely, the CSS every registered module contributes through its `getCSS` hook. In the browser, install injects it as a `<style id="vueform-theme">` tag in `<head>`. On the server there is no document, so install injects nothing on its own — the styles reach the response through one of two routes.

### With a Head Manager

When the app has [`@unhead/vue`](https://unhead.unjs.io/docs/vue/head/guides/get-started/installation) installed, Vueform's install hook pushes the stylesheet into it — with the configured id and nonce — and the head manager renders it into `<head>` on server and client alike. Install `@unhead/vue` before `app.use(vueform)`; the lookup happens once, at install. The behavior is controlled by the [`useHead`](/guide/configuration#useHead) option, which defaults to `true`.

### Without a Head Manager

Without a head manager, extract the styles from the per-request instance with `getStyleTag()`, as the server entry in [Custom Vite Setup](#custom-vite-setup) does. The returned tag carries the configured [`build.styleId`](/guide/configuration#build) and [`nonce`](/guide/configuration#nonce), escapes `</` so CSS content can't close the tag early, and is `''` when there is no CSS. Building your own tag around `getCSS()` works too, as long as it carries the same `build.styleId` — on the client, install finds the existing tag by that id and reuses it instead of adding a second. Both members are documented in [styles on the server](/guide/vueform-instance#styles-on-the-server). The same extraction applies at build time — [static generation](#static-generation-and-streaming) covers where it runs.

Per-instance styles — [`tokens` overrides](/guide/themes-tokens#per-form-and-per-element-tokens) on a form or element, `!VfGrid` / `!VfMatrix` cell layouts — are `<style>` tags the components render themselves, so they are part of the SSR output with no extraction. [Style tag nonce](/guide/security#style-tag-nonce) covers giving all of these a CSP nonce.

## Hydration

A hydration mismatch is the server HTML differing from what the client produces on its first render pass. Vueform has one case to care about. [Dark mode](/guide/themes-tokens#dark-mode), the classic suspect, needs nothing — it is pure CSS at every level, per-component `tokens.dark` included, so the server renders the same text the client hydrates with.

### Stable IDs

Form and element `id`s come from the [`uid`](/guide/configuration#uid) config function, whose default is `() => useId()`; navigation and per-instance token classes use Vue's [`useId()`](https://vuejs.org/api/composition-api-helpers.html#useid) directly. `useId()` produces matching values on server and client, so the defaults never mismatch.

A custom `uid` must yield the same sequence in both environments. A module-scope counter does not — the server process keeps counting across requests while every browser starts from zero, so the sequences diverge after the very first request. Deriving the scheme from `useId()` is the simple fix — [configuration](/guide/configuration#uid) shows the pattern.

For full control over the format, keep the counter in the [per-request app factory](#custom-vite-setup) instead, where it restarts at zero for every request and every browser:

```ts
// src/app.ts
export function createApp() {
  let n = 0

  const vueform = createVueform({
    uid: () => `vf-${++n}`,
  })

  const app = createSSRApp(App).use(vueform)

  return { app, vueform }
}
```

## On the Server

Every `window` or `document` access inside Vueform is either environment-guarded or deferred to `onMounted`, which never runs on the server — the server render cannot crash on a missing browser API. A few features behave visibly differently there, and knowing them is knowing what the server HTML will contain.

`items` given as an endpoint URL or an async function render empty on the server and resolve on the client during hydration; arrays and synchronous functions render on the server. Drafts follow the same pattern — autosave [restores a stored draft](/guide/autosave#restoring-the-draft) on mount, so the server HTML shows the form's initial values and the draft lands after hydration.

### HTTP Is Client-Side

The built-in fetch adapter refuses to send during SSR. It throws an `HttpError` with reason `'ssr'` — "HTTP requests are not available during SSR" — so a `submit()` on the server resolves to a fail result and an autosave fails with the same reason; the reason table lives in [error handling](/guide/http#error-handling). The refusal exists because a response can't arrive before `renderToString` finishes — the result would miss the HTML and callbacks would run after the response was already sent. A setup-time `!useHttp` request in your own code hits it too — guard it with [`isClient`](#your-own-code) or move it to `onMounted`.

The refusal belongs to the fetch adapter, not to the HTTP module itself. A custom adapter — axios, ofetch, your own — can send from the server, where a configured origin policy fails closed instead — once [`allowOrigins`](/guide/security#request-origins) is set, `baseURL` isn't trusted implicitly and absolute URLs pass only when listed.

Data a page needs in its server HTML comes from your framework's own data fetching — Nuxt's `useFetch`, a route loader — and goes into the form via `load()`, as [inside the form flow](/guide/http#inside-the-form-flow) shows.

## Static Generation and Streaming

Prerendering is a server render that runs at build time, so everything above applies unchanged — one vueform instance per rendered page, and the generated styles extracted into it. Nuxt's `nitro.prerender` and `nuxt generate` go through the same Unhead path as its server rendering, with nothing extra to set up. [vite-ssg](https://github.com/antfu-collective/vite-ssg) ships with `@unhead/vue`, so creating the vueform instance inside the `ViteSSG(...)` setup function is the whole integration — install finds the head manager and the styles land in every generated page. Any other generator follows the same two rules by hand, with a fresh `createVueform()` per rendered page and its `getStyleTag()` written into that page's `<head>`.

Streaming — `renderToNodeStream` or `renderToWebStream` in place of `renderToString` — needs no special handling either. The generated stylesheet is install-time state, not render output, so `getStyleTag()` is already complete before the first chunk renders and the tag can be flushed with the document head, ahead of the body stream. Per-instance token `<style>` tags are part of the streamed markup itself.

## Your Own Code

Custom [templates](/guide/templates), [plugins](/guide/plugins), and components follow Vue's general rules for [SSR-friendly code](https://vuejs.org/guide/scaling-up/ssr.html#writing-ssr-friendly-code) — side effects in `onMounted`, no browser globals during render. The Vueform-specific part is the `isClient` / `isServer` pair, exported from `@vueform/ui` and evaluated once at module load:

```ts
import { isClient } from '@vueform/ui'

if (isClient) {
  window.addEventListener('resize', handleResize)
}
```

## Troubleshooting

| Symptom | Cause | See |
| --- | --- | --- |
| `window is not defined` | Unguarded browser API in custom code | [Your Own Code](#your-own-code) |
| Hydration mismatch on an `id` | Custom `uid` diverging between server and client | [Stable IDs](#stable-ids) |
| `HTTP requests are not available during SSR` | Request fired during the server render | [HTTP Is Client-Side](#http-is-client-side) |
| Flash of unstyled content in production | Theme styles missing from the server response | [Style Injection](#style-injection) |
| Flash of unstyled content in dev only | Vite's dev server delivering component CSS through JS | [Styles in Development](#styles-in-development) |
