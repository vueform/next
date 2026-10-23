---
outline: [2,3]
---

# Security

A schema is data that describes rendering, and it often comes from outside the app — a CMS, an API response, a form builder's output. Vueform's guarantee is that such data never escalates into code — strings render as text unless an area is explicitly opted into HTML, component names resolve only from an allowlist, and requests stay on your own origin.

These guarantees cover the client. Validation, file checks, and authorization still belong to your server — the [last section](#server-side-responsibilities) names exactly what.

## The Security Module

Every protection in this chapter is one module, `security`, configured through the `$security` config key. Pre-configured entries like `@vueform/ui/origin` register it out of the box; in a [modular setup](/guide/modules) you register it yourself:

```ts
import { createVueform } from '@vueform/ui'
import { model, security } from '@vueform/ui/modules'

createVueform({
  modules: { model, security },
  $security: {
    // policy options
  },
})
```

The full `$security` option reference lives in [configuration](/guide/configuration#security); this chapter introduces each option where its protection comes up.

Leaving the module out is the deliberate, wholesale opt-out. HTML renders unsanitized in every area, any registered component name resolves, requests are unrestricted, URLs and CSS values pass unchecked, and persisted values are stored as-is. Prototype-key guards apply even then — they are invariants, not policy — and slot HTML goes in with the platform's `innerHTML` semantics, so a `<script>` element stays inert regardless.

Configuring `$security` policy without the module is a misconfiguration, not an opt-out. Development warns at `createVueform()` and stays permissive so the app remains workable; production **fails closed** — HTML escapes, component names stop resolving, requests are blocked, schema prop bags come back empty, and the ciphers throw so nothing persists in plaintext. A misconfigured app can never ship looking enforced while it isn't. (`allowOrigins: ['*']` doesn't count as policy — permissive is exactly what it configures.)

## HTML Sanitization

Most strings — labels, placeholders, help texts, button captions — go through Vue's text interpolation and render escaped, so a `<script>` tag in a label shows up as literal text. Rendering a string **as HTML** happens in exactly three areas, each opted into through `$security.allowHtml`:

| Area | Covers |
| --- | --- |
| `'content'` | `!VfContent`'s `content` prop. |
| `'slots'` | String [`slots`](/guide/slots#string-content) entries. |
| `'grid'` | String grid [cells](/guide/form-structure#cells). |

```ts
import dompurify from '@vueform/dompurify'

createVueform({
  plugins: [dompurify()],
  $security: {
    allowHtml: ['content'],
  },
})
```

An unlisted area renders markup as escaped text — tags visible, nothing silently dropped, so a missing entry is diagnosable at a glance. The app config is the only authority; no schema entry can grant itself HTML rendering. Strings without markup never consult the gate — they render the same either way.

### The Sanitize Step

HTML in an allowed area always passes through `$security.sanitizer`, after localization and [expression](/guide/expressions) resolution, so the sanitizer sees the final markup — including values interpolated out of form data. That ordering is what makes a template like `'Welcome, {name}!'` safe, whatever `{name}` carries in.

There is no built-in engine and no on/off switch — what renders depends entirely on what `sanitizer` holds:

| `sanitizer` | Result |
| --- | --- |
| An engine — the [DOMPurify plugin](/plugins/dompurify) or your own | Sanitized HTML renders. |
| Unset, in development | Raw HTML renders, with a one-time warning naming the fix. |
| Unset, in production | The area renders **empty** — unsanitizable HTML never ships. |
| `(html) => html` | Raw HTML renders — the conscious, greppable opt-out for fully trusted schemas. |

A custom engine is a single `SecuritySanitizer` function, `(html: string) => string`, set as `$security.sanitizer` — and a sanitizer you set yourself wins over the plugin's. The DOMPurify plugin's own options (`sanitizeOptions`, `sanitizeInit`) are covered on [its page](/plugins/dompurify).

These gates cover the strings Vueform renders. HTML you render yourself through `v-html` in [custom templates](/guide/templates) is yours to sanitize.

## Untrusted Schemas

A schema reaches more than text — component names, attribute bags, element props, URLs, CSS values. Each of those surfaces is gated, so a crafted document stays data no matter what it spells. For an app loading schemas from outside, the baseline looks like this, and the subsections below explain it line by line:

```ts
createVueform({
  plugins: [dompurify()],
  $security: {
    allowHtml: ['content'],
    allowComponents: ['MyOption'],
    banAttrs: [/^on/i, 'srcdoc'],
    allowProps: ['label'],
  },
})
```

### Component Names

A schema names components as strings — in [`slots`](/guide/slots#string-content) entries, the [`template`](/guide/templates#by-name) and [`layout`](/guide/templates#the-standard-layout) props, an element's `component` key, and the `component` key of schema addons (`addonBefore` / `addonAfter`). `$security.allowComponents` is the allowlist those strings resolve against. It's empty by default, so no name resolves until listed; built-in `Vf*` names derived from an element's `type` are exempt — they are the element vocabulary itself.

A rejected name falls back instead of failing. A slot string renders as content, `template` and `layout` fall back to the standard rendering, and `component` falls back to the `Vf*` element derived from `type` — with a one-time dev warning per rejected name. A slot string only consults the list when it's shaped like a component name **and** names a registered component; anything else is content. Keep the list to purpose-built slot, template, and layout components rather than exposing general application components.

### Banning Attributes

Schema-reachable prop bags pass a filter before binding — schema entries themselves (form entries, group children, flat list prototypes, grid cell and matrix column schemas, addon schemas), [`parts`](/guide/parts) bags, and grid cell `attrs`. Only `innerHTML` / `outerHTML` and prototype keys are dropped unconditionally. Everything else — inline `on*` handlers, `srcdoc`, DOM-clobbering `id` / `name` — is your policy, declared through `banAttrs`; for untrusted schemas, configure at least `[/^on/i, 'srcdoc']` as in the baseline above.

String entries match case-insensitively, RegExp entries as written — add the `i` flag yourself. Both are tested against the original key and its camelized form, so a ban on `onLabel` also catches a schema spelling it `on-label`. A banned key is dropped in every value form, and each drop warns in development naming the key.

Some element vocabularies have legitimate `on*`-named props — `onTrue` / `onFalse`, or `onLabel` / `onIcon` on PrimeVue toggles. Carve them out with a negative lookahead instead of widening the ban:

```ts
banAttrs: [/^on(?!True$|False$)/, 'srcdoc']
```

A RegExp like `/^on/i` also drops developer-written **function** listeners inside `parts` bags — the filter can't tell trusted objects from untrusted ones once they merge. Keep listeners in template code, which is never filtered.

Because schema entries pass the same filter, listing a prop name turns that whole channel off for schemas while template usage keeps working — props written in your SFCs never go through schema resolution. For schemas that should carry no presentation at all:

```ts
banAttrs: ['style', 'parts', 'attrs', 'slots', 'tokens']
```

`banAttrs` only ever tightens; the built-in denylist applies regardless and can't be relaxed.

### Prop References

[Conditions](/guide/conditions#referencing-element-properties) and [expressions](/guide/expressions#element-props) can read element props through the `path@prop` / `@prop` reference form. Unlike value references, these read the live element context — an untrusted schema could otherwise walk `@form$` or deep internals and leak values into rendered text — so `allowProps` gates which prop paths resolve.

The default config ships `allowProps: ['**']`, so every reference resolves until you set the option yourself; setting it replaces the default (the `$security` merge is shallow). A reference outside your list resolves as `undefined` — the condition counts as unmet, the expression renders empty — with a dev warning naming the prop.

Each entry is a pattern over the prop part of the reference, with `[n]` index access counting as a nesting level:

| Pattern | Allows |
| --- | --- |
| `'propName'` | The flat reference only (`@propName`), no nesting. |
| `'propName.*'` | One nested level (`@propName.foo`), never the flat form. |
| `'propName.*.*'` | One **or** two nested levels — trailing `*` segments are optional. |
| `'propName.*.foo.*'` | Static segments midway must be present — `@propName.x.foo` resolves, `@propName.x` doesn't. |
| `'propName.**'` | Any nesting depth, at least one level. |
| `'*propName'` / `'propName*'` | Any prop name ending / starting with `propName`; combines with the nesting forms. |
| `'*'` | Every prop, flat references only. |
| `'**'` | Every prop at every depth — the default. |

```ts
allowProps: ['label', 'selected*', 'meta.*']
```

An entry may also be a RegExp, tested against the full prop path with index access normalized to dots (`@model[0]` tests as `model.0`) — anchor it yourself. An invalid string pattern is ignored with a dev warning rather than silently never matching.

Value references — `{field}` interpolation and `[path, operator, value]` conditions without `@` — read form data, not props, and aren't affected.

### Always-On Guards

Three guards have no option — with the module registered, they always apply:

| Guard | What it covers |
| --- | --- |
| CSS values | `tokens`, grid `widths` / `minWidth` / `maxWidth`, matrix `gridTemplateColumns` and column widths — a value containing `{` or `}` is dropped, since it could break out of its scoped rule. |
| URLs | Form `redirect` (`http` / `https`), button `href` / `to` (`http` / `https` / `mailto` / `tel`), file `url` (`http` / `https` / `blob`) — any other scheme never reaches the sink, obfuscations like `java\tscript:` included; relative URLs pass. |
| Storage keys | A custom `draft.key` is forced under the `vueform:` namespace — see [draft options](/guide/autosave#draft-options). |

Like everything above, these are the module's features — [without it](#the-security-module) the values pass unchecked.

### What Stays Code-Trust

Function-valued props — a function `endpoint`, `transformResponse`, event handlers, function `parts` — can't travel through JSON, so only your own code supplies them; no gate is needed. The `endpoint`, `method`, and `headers` props are plumbing for your API — with untrusted schemas, pin where they may point via [`allowOrigins`](#request-origins).

JavaScript running in your page sits inside the trust boundary. Code that can swap the sanitizer could equally call `fetch` or read the DOM directly — no client-side library defends against hostile code, and Vueform's guarantees are about **data** (schemas, input, responses, drafts), never about code.

## Request Origins

[Interceptors](/guide/http#interceptors) attach credentials to every request, and a form's `endpoint` — or an element's endpoint-loaded `items` — is an ordinary prop. In an app whose schemas come from outside, a crafted absolute URL would receive your tokens along with the data.

Vueform therefore denies cross-origin requests by default. The app's own origin passes untouched — relative URLs, and absolute URLs spelling out the current origin — and in the browser the origin of `$http.baseURL` is trusted implicitly. Anything else is a decision the app states by listing it:

```ts
createVueform({
  $http: { baseURL: 'https://api.example.com' }, // trusted implicitly
  $security: {
    allowOrigins: ['https://cdn.example.com'],
  },
})
```

| `allowOrigins` | Effect |
| --- | --- |
| unset / `[]` | Own origin and `$http.baseURL` only — the default. |
| `['https://cdn.example.com']` | The above, plus the listed origins. |
| `['https://*.example.com']` | Any subdomain of `example.com`, at any depth, over `https` — never the apex itself, never another scheme. |
| `['https://example.com:*']` | That exact host on any port, the scheme default included. |
| `['*']` | No restriction. |

A wildcard is valid only in the subdomain or port position; any other placement is ignored with a dev warning. Trusting `baseURL` costs nothing — a schema can only reach it through a relative URL, and an absolute URL bypasses `baseURL` entirely, so it's still judged against the list.

The check runs after your interceptors and before the adapter, so it covers every request the HTTP module makes, whichever adapter is configured. A blocked request never leaves the browser — it rejects with an `HttpError` whose `reason` is `'blocked'` (see [error handling](/guide/http#error-handling)).

Outside a browser nothing is trusted implicitly — not even `baseURL` — so absolute URLs must be listed. The built-in fetch adapter [refuses SSR requests](/guide/ssr#http-is-client-side) outright anyway; this guards server-capable custom adapters.

## Draft Encryption

`$security.encrypt` and `decrypt` are app-provided ciphers applied to values Vueform persists — currently form [drafts](/guide/autosave#encrypting-drafts). There is deliberately no built-in cipher, because any key generated on the device would sit next to the ciphertext it protects. Bring a scheme whose key lives outside the stored data — typically delivered per user after login and held only in memory:

```ts
let key: CryptoKey // import after login; memory only, never storage

createVueform({
  $security: {
    encrypt: async (value) => {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const data = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(value)
      )

      return btoa(String.fromCharCode(...iv, ...new Uint8Array(data)))
    },
    decrypt: async (value) => {
      const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0))
      const data = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: bytes.slice(0, 12) },
        key,
        bytes.slice(12)
      )

      return new TextDecoder().decode(data)
    },
  },
})
```

Both functions may be sync or async, and both receive a `purpose` tag naming the call site (`'draft'`), so one implementation can serve every feature that encrypts. Configure them as a pair — one without the other can't round-trip persisted values and warns in dev. A `decrypt` that throws marks the stored value unreadable, and the feature treats it as absent.

Until the ciphers are configured, drafts are written as plaintext with a dev warning — the identity-cipher opt-out and the per-form `draft.encrypt: false` flag are covered in [encrypting drafts](/guide/autosave#encrypting-drafts).

Encryption protects data **at rest**. Values that must never touch the disk at all belong under [`sensitive`](/guide/autosave#sensitive-values).

## Content Security Policy

Vueform injects no `<script>` tags and uses no `eval`, `new Function`, or string-argument `setTimeout`, so your `script-src` directive is untouched. What a strict policy does need to account for is two things — the `<style>` tags Vueform renders and the default icon images.

### Style Tag Nonce

Vueform injects a `<style id="vueform-theme">` tag holding the theme tokens and grid utilities, and components render small per-instance `<style>` tags of their own — token overrides on forms, element layouts, and buttons, and the cell layout of grids and matrices. Under a strict `style-src-elem` policy, all of them need a nonce.

Pass it once through the [`nonce`](/guide/configuration#nonce) config option and every injection path and every per-instance tag carries it:

```ts
createVueform({
  nonce: document
    .querySelector('meta[name="csp-nonce"]')
    ?.getAttribute('content') ?? undefined,
})
```

How each delivery path applies it — Unhead, the DOM fallback, `getStyleTag()` on the server — is covered in [style injection](/guide/ssr#style-injection). In Nuxt, Unhead renders the tag, so a CSP module like nuxt-security that nonces head-rendered tags covers Vueform's too.

### Inline Styles

Vueform sets no `style` attributes, in browser or SSR output — per-instance styling goes through the nonce'd tags and classes, and runtime-only styles such as a textarea's autogrow height go through the CSSOM, which CSP doesn't restrict. No `style-src-attr 'unsafe-inline'` is needed.

### Icon Data URIs

The default icon tokens are static `data:image/svg+xml` URLs shipped with the package, so `img-src` needs `data:`. If your policy forbids it, override the `icon*` tokens with same-origin assets:

```ts
createVueform({
  tokens: {
    iconAdd: 'url("/icons/add.svg")',
    iconRemove: 'url("/icons/remove.svg")',
  },
})
```

The full token list lives under [primitives](/guide/themes-tokens#primitives).

In total, Vueform asks exactly two things of your policy — everything else depends on your app, not Vueform:

| Directive | Value | Reason |
| --- | --- | --- |
| `style-src-elem` | `'nonce-…'` | Every `<style>` tag Vueform injects or renders. |
| `img-src` | `data:` | The default icon tokens are inline SVG data URIs. |

## Server-Side Responsibilities

Client-side validation is UX, not a boundary — instant feedback and fewer round trips, nothing an attacker can't skip. Mirror every rule on the server, and map a rejected submission's `422` errors back onto elements as described in [when the server rejects](/guide/submit#when-the-server-rejects).

File constraints are UX in the same way. `accept` and `maxSize` shape the picker and catch mistakes; the server must validate and sanitize every upload it stores.

Authorization and CSRF protection are server decisions too. The client's share — attaching tokens to requests — is one [interceptor](/guide/http#interceptors).
