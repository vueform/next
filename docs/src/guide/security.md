---
outline: [2,3]
---

# Security

Vueform provides defense-in-depth on the client — CSP-compatible style injection, HTML sanitization, schema gating, and draft encryption — but a client-side library cannot replace server-side protections. Security is a shared responsibility: Vueform handles the layers it controls, and documents exactly what your server and CSP policy need to cover for the rest.

## The Security Module

The protections Vueform itself provides live in one place: the `security` module, configured through the `$security` config key:

| Option | Default | Controls |
| --- | --- | --- |
| [`allowHtml`](#html-sanitization) | `[]` | The areas where strings may render as **HTML** — `'content'`, `'grid'`, `'slots'`. |
| [`sanitizer`](#the-sanitize-step) | — | The sanitization engine every allowed HTML area renders through. No built-in one — the [DOMPurify plugin](/plugins/dompurify) provides it; an identity function is the conscious opt-out. |
| [`allowComponents`](#components-from-schemas) | `[]` | The component names a schema string may resolve to. |
| [`banProps`](#banning-props) | `[]` | Attribute keys (strings or RegExps, e.g. `/^on/i`) to drop from schema-reachable attribute bags. Only `innerHTML`/`outerHTML` and prototype keys are built in. |
| [`allowOrigins`](#request-origins) | `[]` | Cross-origin destinations requests may target. Own origin allowed by default. |
| [`encrypt`](#draft-encryption) / [`decrypt`](#draft-encryption) | — | Ciphers applied to persisted values, such as local autosave drafts. |

The headline guarantee these add up to, with the module registered: **a string from a schema renders as HTML only in an area you listed in `allowHtml`, and always through the `sanitizer`** — with unsanitized HTML requiring the explicit identity-sanitizer opt-out. Everything else renders as escaped text.

Pre-configured entries like `@vueform/ui/origin` register the module out of the box. In a [modular setup](/guide/modules) it must be registered explicitly. **The security module is the security**: deliberately omitting it opts out of every protection wholesale, the same way an absent `validation` module counts everything valid — HTML renders unsanitized in every area, any registered component name resolves, requests are unrestricted, URLs and CSS values pass unchecked, drafts are stored as-is. (Prototype-key guards always apply — they are invariants, not policy — and slot HTML is inserted with the platform's own `innerHTML` semantics, so `<script>` elements stay inert regardless.) Configuring `$security` policies without the module is a different case — a misconfiguration: in development they warn and stay inert; in production they **fail closed** — HTML escapes, components stop resolving, requests are blocked, prop bags are emptied, drafts are not persisted — so the config can never ship looking enforced while it isn't:

```ts
import { createVueform } from '@vueform/ui'
import { model, security } from '@vueform/ui/modules'

createVueform({
  modules: { model, security },
  $security: {
    // options
  },
})
```

The rest of this chapter — CSP, HTTP, server-side validation — is the shared-responsibility side: what your policies and your server need to cover.

## Content Security Policy

Vueform is designed to work under strict Content Security Policies. This section documents exactly what Vueform needs from your CSP — nothing more.

### Scripts

Vueform injects no `<script>` tags, uses no `eval()`, no `new Function()`, and no string-argument `setTimeout`. Your `script-src` directive is unaffected by Vueform.

### Style Tag Nonce

Vueform injects a `<style id="vueform-theme">` tag at runtime containing CSS custom properties ([theme tokens](/guide/themes-tokens#tokens)) and [grid](/guide/form-structure#the-12-column-grid) utility classes. Components additionally render their own small `<style>` tags where styling is per-instance: [token overrides](/guide/themes-tokens#per-form-and-per-element-tokens) on a form or element, and the cell layout of a `VfGrid` or `VfMatrix`. Under a strict `style-src-elem` policy, all of these need a nonce.

Pass it once through the [`nonce`](/guide/configuration#nonce) config option and it's applied everywhere:

```ts
createVueform({
  locales: { en_US },
  nonce: document.querySelector('meta[name="csp-nonce"]')
           ?.getAttribute('content') ?? undefined,
})
```

The global `<style id="vueform-theme">` tag is injected three different ways depending on the environment, and the nonce is applied in each:

| Path | How the nonce is applied |
| --- | --- |
| `@unhead/vue` available (Nuxt, or manual install) | Passed in `head.push({ style: [{ nonce }] })`. |
| DOM fallback (no Unhead) | Set via `style.setAttribute('nonce', nonce)`. |
| SSR via `getStyleTag()` | Included as a `nonce` attribute in the returned HTML string. |

Per-instance `<style>` tags are rendered by the components themselves — in the browser and in SSR output alike — with the same `nonce` attribute.

::: tip Nuxt
In Nuxt, Vueform doesn't insert the `<style id="vueform-theme">` tag itself — it hands the CSS to Unhead (always present there), which renders it into `<head>`. If the [nuxt-security](https://nuxt-security.vercel.app/) module manages your CSP, it adds its per-request nonce to every head-rendered tag — Vueform's included — so you don't set Vueform's `nonce` option at all. Without such a module, pass your server's nonce through Vueform's `nonce` config option as in any other app.
:::

### Inline Style Attributes

Vueform does not use inline `style` attributes on DOM elements — in the browser or in SSR output. Per-instance token overrides and grid layouts are injected via nonce'd `<style>` tags, and prop-driven styling is carried by classes, never `:style` bindings. The only styles set at runtime (such as the autogrow height of a textarea) go through the [CSSOM](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model), which CSP does not restrict. No `style-src-attr 'unsafe-inline'` is required.

### Theme Icon Data URIs

The default theme tokens use `data:image/svg+xml,...` URLs for [icons](/guide/themes-tokens#icons) (add, remove, sort, loading spinner, select caret, choice checkmarks, step indicators). These are static, hardcoded values shipped with the package — not user-controlled. Your CSP needs `data:` in the directive that governs image sources:

```
img-src 'self' data:;
```

If your policy forbids `data:` entirely, override the icon tokens with same-origin asset paths in your theme configuration:

```ts
createVueform({
  locales: { en_US },
  tokens: {
    iconAdd: 'url("/icons/add.svg")',
    iconRemove: 'url("/icons/remove.svg")',
    iconSort: 'url("/icons/sort.svg")',
    iconLoading: 'url("/icons/loading.svg")',
  },
})
```

See [Themes & Tokens](/guide/themes-tokens) for the full list of icon tokens and how to customize them.

### CSP Requirements Summary

Vueform requires exactly two additions to your existing policy:

| Directive | Required value | Reason |
| --- | --- | --- |
| `style-src-elem` | `'nonce-{SERVER_NONCE}'` | The injected `<style id="vueform-theme">` tag. |
| `img-src` | `data:` | Default theme icons use inline SVG data URIs. |

Everything else — `script-src`, `connect-src`, `default-src`, `font-src`, `form-action` — depends on your application, not Vueform.

## Secure HTTP Communication

Vueform's HTTP module (`$http`) handles form submissions, autosave, and any manual requests you make through `useHttp()`. The security-relevant configuration lives in the `$http` config block and its interceptors. See [HTTP Requests](/guide/http) for the full API.

### CSRF Tokens

Attach a CSRF token to every request using a global request interceptor:

```ts
createVueform({
  locales: { en_US },
  $http: {
    onRequest: [(config) => {
      config.headers = {
        ...config.headers,
        'X-CSRF-TOKEN':
          document.querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '',
      }
      return config
    }],
  },
})
```

This covers form submissions, autosave, and any manual `$http.get()` / `$http.post()` calls — they all flow through the same interceptor chain.

An interceptor attaches its header to **every** request, whatever the destination. What keeps those headers from ever leaving your own origins is the default-deny [`allowOrigins`](#request-origins) policy: a request to a foreign host is blocked before the adapter runs, interceptor headers and all.

### Authentication Headers

The same pattern works for Bearer tokens:

```ts
createVueform({
  locales: { en_US },
  $http: {
    onRequest: [(config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }
      return config
    }],
  },
})
```

### Cross-Origin Credentials

For cookie-based authentication with a cross-origin API, enable `withCredentials` so the browser includes cookies in requests:

```ts
createVueform({
  locales: { en_US },
  $http: {
    withCredentials: true,
  },
})
```

This maps to `credentials: 'include'` on the underlying `fetch()` call.

### Request Origins

Interceptors attach credentials to **every** request, and a form's `endpoint` (or an element's `items` URL) is an ordinary prop — so in an app whose schemas come from outside, a crafted `endpoint` would receive your tokens along with the submission.

Vueform therefore **denies cross-origin requests by default**. Anything on the app's own origin passes untouched — relative URLs, absolute URLs spelling out the current origin, and the origin of a configured [`$http.baseURL`](/guide/configuration#http). Reaching any other host is a decision the app states explicitly:

```ts
createVueform({
  $http: { baseURL: 'https://api.example.com' }, // trusted implicitly
  $security: {
    allowOrigins: ['https://cdn.example.com'], // additional destinations
  },
})
```

A blocked request never leaves the browser: it rejects with an `HttpError` carrying `reason: 'blocked'` before the adapter runs. The check happens after your interceptors, so it covers every request the HTTP module makes, whichever adapter is configured.

| `allowOrigins` | Effect |
| --- | --- |
| unset / `[]` (default) | The app's own origin and `$http.baseURL` only. |
| `['https://cdn.example.com']` | The above, plus the listed origins. |
| `['https://*.example.com']` | Any subdomain of `example.com` (at any depth) over `https` — never the apex `example.com` itself, and never another scheme. |
| `['https://example.com:*']` | That exact host on any port (including the scheme default). |
| `['*']` | No restriction. |

::: warning
A subdomain wildcard covers subdomains only: `https://*.example.com` does **not** match plain `https://example.com` — list the apex separately if you need both. The wildcard is valid only in the subdomain or port position (`https://*.example.com`, `https://example.com:*`); any other placement is ignored with a development warning.
:::

::: tip
`baseURL` is trusted because it is your own configuration, and a schema can only reach it through a _relative_ URL — which is allowed regardless. The attack this blocks is an **absolute** URL in a schema, which bypasses `baseURL` entirely and so is still judged against the list.
:::

::: warning
Vueform's HTTP stack is **client-side**: during [SSR](/guide/ssr) the built-in fetch adapter refuses to send requests, and no origin is trusted implicitly outside a browser — nothing passes without being listed. Make requests from the browser, or use your framework's own server-side data fetching.
:::

::: tip
Prefer attaching credentials in an interceptor that checks the destination, rather than baking a static `Authorization` value into `$http.headers`: a closure-held token doesn't travel with the config object into error reporters and devtools snapshots.
:::

### What HTTP Security Cannot Cover

`HttpError`s carry the request config so you can inspect failures — with `Authorization`, `Proxy-Authorization`, `Cookie` and `Set-Cookie` headers redacted, so a `fail` result forwarded to an error reporter doesn't ship credentials.

::: warning
Because of the redaction, don't replay a failed request by reusing `error.config` verbatim (`$http.request(error.config)`) — it would go out with the literal string `[redacted]` as its credentials. Re-issue the request through the original call instead, so your interceptors re-attach fresh headers.
:::

Beyond that, JavaScript running in your page is inside the trust boundary. Code that can mutate `createVueform`'s config, register its own interceptors, or read a closure-held token could equally call `fetch` directly, replace the sanitizer, or read the DOM — no client-side library can defend against it, and Vueform doesn't pretend to. Its guarantees are about **data** — schemas, form input, server responses, stored drafts — never escalating into code.

## Server-Side Validation

Client-side validation is a UX convenience — it provides instant feedback and prevents unnecessary round trips. It is not a security boundary. Every validation rule enforced on the client must be duplicated on the server.

Vueform makes the feedback loop seamless: when the server rejects a submission with a `422` response carrying field-level errors, map them back onto elements with the `setInvalid` prop:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  password: { type: 'text', label: 'Password', rules: 'required' },
})

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  setInvalid: true,
})
```

```vue [Template]
<VfForm endpoint="/api/register" set-invalid>
  <VfText name="email" label="Email" rules="required|email" />
  <VfText name="password" label="Password" rules="required" />
</VfForm>
```

:::

The error map is expected keyed by element path (e.g. `{ email: ['Already taken'] }`) — by default it's read from the response's `errors` key, falling back to the whole response body. Use the `transformServerInvalid` prop to adapt any other shape (`(data) => data?.validationErrors || {}`). See [Server Validation Errors](/guide/submit#server-validation-errors) for the full lifecycle.

## HTML Sanitization

Most strings in Vueform — labels, placeholders, hints, button captions — render through Vue's text interpolation, which escapes HTML automatically: a `<script>` tag in a label shows up as literal text, never as executable code. Rendering a string **as HTML** happens in exactly three places, and each is an area you opt into with `$security.allowHtml`:

| Area | What it covers |
| --- | --- |
| `'content'` | `VfContent`'s `content` prop. |
| `'slots'` | HTML strings in [`slots`](#slot-content) entries. |
| `'grid'` | String cells in a [grid](/guide/form-structure#the-12-column-grid). |

```ts
createVueform({
  plugins: [dompurify()],
  $security: {
    allowHtml: ['content'],
  },
})
```

An area you don't list renders its strings as **escaped text** — tags visible, nothing silently dropped, and immediately visible on the page. There is no per-element opt-in to pair with this: the app config is the only authority, so no schema entry can grant itself HTML rendering. (Strings without markup skip the check entirely — they render the same either way.)

### The Sanitize Step

Strings in an allowed area pass through the sanitizer immediately before rendering — **after** localization and [expression](/guide/expressions) resolution, so what the sanitizer inspects is the final markup, including any values interpolated out of form data.

Like the [ciphers](#draft-encryption), there is no built-in engine, and there is no on/off switch — HTML in an allowed area **always** passes through `$security.sanitizer`:

| `sanitizer` | Result |
| --- | --- |
| An engine (the [DOMPurify plugin](#installing-dompurify), or your own) | Sanitized HTML renders. |
| Unset, in development | Raw HTML renders with a one-time warning naming the fix. |
| Unset, in production | The HTML area renders **empty** — unsanitizable HTML never ships. |
| `(html) => html` — the identity function | Raw HTML renders: the conscious, greppable opt-out for trusted schemas. |

::: tip
The order matters more than it looks. A template like `content: 'Welcome, {name}!'` is harmless on its own — the danger is what `{name}` carries in. Sanitizing the resolved result is what makes user input safe here, not sanitizing the template.
:::

### Installing DOMPurify

The `@vueform/dompurify` plugin wires DOMPurify into the sanitization step so every string the pipeline sanitizes is stripped of unsafe markup before it reaches the DOM. It uses [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify) under the hood, so it works in both browser and SSR environments without extra configuration:

```ts
import { createVueform } from '@vueform/ui'
import { en_US } from '@vueform/ui/locales'
import security from '@vueform/dompurify'

app.use(
  createVueform({
    locales: { en_US },
    plugins: [security()],
  })
)
```

With the plugin in place, a `content` value like `<img src=x onerror=alert(1)>` is sanitized to `<img src="x">` before rendering.

### Customizing DOMPurify

The plugin extends the `$security` options with two keys for fine-tuning:

```ts
createVueform({
  locales: { en_US },
  plugins: [security()],
  $security: {
    sanitizeOptions: {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href', 'target'],
    },
    sanitizeInit: (DOMPurify) => {
      DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A') {
          node.setAttribute('rel', 'noopener noreferrer')
        }
      })
      return DOMPurify
    },
  },
})
```

| Option | Purpose |
| --- | --- |
| `sanitizeOptions` | Passed directly to `DOMPurify.sanitize()` as the config object. |
| `sanitizeInit` | Receives the DOMPurify instance before first use — add hooks, set global config, etc. |

### Custom Sanitizer

If you prefer a different sanitizer (sanitize-html, or a custom implementation), the engine is a single `SecuritySanitizer` function — raw HTML in, safe HTML out:

```ts
import type { SecuritySanitizer } from '@vueform/core'

const mySanitizer: SecuritySanitizer = (html) => {
  // Your sanitization logic
  return sanitizedHtml
}

createVueform({
  locales: { en_US },
  $security: { allowHtml: ['content'], sanitizer: mySanitizer },
})
```

::: warning
Sanitization covers the strings Vueform itself renders. If you write custom templates that use `v-html` with arbitrary content, you are responsible for sanitizing that content yourself.
:::

## Untrusted Schemas

A schema describes rendering, not just data — and schemas frequently come from outside the app: a JSON document from a CMS, an API response, a form builder. Everything a schema can reach is therefore gated so that a crafted document cannot escalate from _data_ into _code_.

### Components From Schemas

A schema can name a component as a string — in a [`slots`](/guide/slots#the-slots-prop) entry, in the [`template`](/guide/templates#by-name) or [`layout`](/guide/templates#the-standard-layout) prop, or as an element's `component` key. Without a gate, a crafted schema could mount anything registered in the app, with props of its choosing.

`$security.allowComponents` is the allowlist those strings resolve against:

```ts
createVueform({
  $security: {
    allowComponents: ['MyOption', 'MyTextTemplate'],
  },
})
```

A name outside the list never resolves: a slot string renders as text, a `template` or `layout` prop falls back to the standard rendering, and an element `component` falls back to the `Vf*` component derived from its `type`. (Slot strings are only treated as candidate component names when they are shaped like one — PascalCase or kebab-case; anything else is content and never consults the list.) Built-in `Vf*` names derived from `type` are exempt — they are the element vocabulary itself. Development warns once per rejected name, so a missing entry is easy to spot without flooding the console.

::: tip
Treat `allowComponents` as a contract with your schema authors: only the components listed there are part of the schema's vocabulary. Keep the list to purpose-built slot, template, and layout components rather than exposing general application components.
:::

### What Else Is Gated

| Schema surface | Treatment |
| --- | --- |
| `slots` / grid cell strings, `VfContent` content | Text always renders escaped; HTML only through [`allowHtml`](#html-sanitization), always sanitized. |
| `component`, `template`, `layout` name strings | Resolved only through [`allowComponents`](#components-from-schemas). |
| `parts` bags, grid cell `attrs`, undeclared schema keys (form entries, flat list prototypes, grid cell / matrix column schemas) | Filtered before reaching the DOM: `innerHTML`/`outerHTML` and prototype keys are always dropped; everything else — including inline `on*` handlers and `srcdoc` — is app policy via [`banProps`](#banning-props), dropped in every value form. |
| `tokens`, grid `widths`, matrix `gridTemplateColumns` | Values that could break out of a scoped CSS rule are dropped. |
| `redirect`, button `href` / `to`, file `url` | Scheme-validated — `javascript:` and other script-bearing schemes never reach a navigation sink. |
| `autosave.local.key` | Forced under the `vueform:` storage namespace. |

### Banning Props

The prop filtering hardcodes only the entries no app can ever want from data: `innerHTML`/`outerHTML` (an attribute bag as an HTML sink) and prototype keys (`__proto__`, `constructor`, `prototype`). **Everything else is your policy**, declared through `banProps` — including inline event handlers.

::: warning Configure `banProps` when schemas are untrusted
If your schemas come from a semi-trusted source (CMS, form builder, database), configure at least:

```ts
createVueform({
  $security: {
    // Ban on* keys — except element props your schemas legitimately
    // use, carved out with a negative lookahead (here: onTrue/onFalse).
    banProps: [/^on(?!True$|False$)/, 'srcdoc'],
  },
})
```

The `on*` pattern stops string-valued `onclick`/`onerror`/… entries from becoming live inline handlers via `setAttribute`, and `srcdoc` closes the iframe HTML sink. Element vocabularies have legitimate `on*`-named props (`onLabel` / `onIcon` on the PrimeVue toggle elements, for example) — list each one you use in the lookahead, anchored with `$`, rather than widening the pattern; an unlisted prop fails safe by being dropped, and the dev warning tells you which one to add. Without any of this, only `innerHTML`/`outerHTML` and prototype keys are blocked by default. Every dropped entry warns in development, naming the key.
:::

A `banProps` entry is dropped from every filtered surface — schema entries themselves (form entries, group children, flat list prototypes, grid cell / matrix column schemas), `parts` bags, and grid cell `attrs` — **in every value form** (for `style`, that covers both the string and the object binding, since both are JSON-expressible). String entries match case-insensitively; RegExp entries are tested as written, so add the `i` flag yourself. Both forms are checked against the key's original spelling **and** its camelized form — Vue camelizes spread keys when matching a component's declared props, so a ban on `onLabel` also catches a schema author writing `on-label`:

```ts
createVueform({
  $security: {
    banProps: [/^on/i, 'srcdoc', 'style'], // also: no schema-supplied styling
    // banProps: [/^on/i, 'srcdoc', 'style', 'id', 'name'], // + DOM clobbering
  },
})
```

Note that a RegExp like `/^on/i` matches in every value form too: developer-written **function** listeners inside `parts` bags are also dropped, since the filter cannot tell trusted from untrusted objects once they merge. Keep function listeners in template code (never filtered), or scope the pattern tighter if you rely on them in `parts`.

`banProps` only ever tightens: the built-in denylist applies regardless and cannot be relaxed.

#### Turning Off Schema Channels

Because schema entries pass through the same filter, `banProps` doubles as a per-channel kill-switch: listing a prop name removes that **entire channel** from schemas, with no filter to trust and nothing to bypass. Your own template code is unaffected — props written in SFCs never pass through schema resolution, so `parts`, `slots`, or `tokens` set in your components keep working while the same keys arriving in schema JSON are dropped:

```ts
createVueform({
  $security: {
    // Schemas describe elements and data — nothing presentational.
    banProps: ['style', 'parts', 'attrs', 'slots', 'tokens'],
  },
})
```

Combined with the defaults — HTML dead without [`allowHtml`](#html-sanitization), component names dead without [`allowComponents`](#components-from-schemas), cross-origin requests dead without [`allowOrigins`](#request-origins) — this closes every presentation channel a schema has.

What stays **code-trust**, and must never be built from untrusted input:

- Function-valued props (`endpoint` as a function, `transformResponse`, event handlers, function `parts`) — functions cannot travel through JSON, so these can only come from your own code.
- The `endpoint`, `method`, and `headers` props themselves. They are plumbing for your API; if your schemas are untrusted, pin the destinations with [`allowOrigins`](#request-origins).

::: warning
These gates are the security module's features. In a [modular setup](/guide/modules) without the `security` module registered, nothing here is enforced — schemas can do all of the above. Omitting the module is the deliberate, wholesale opt-out for trusted environments; configuring any `$security` policy without the module warns in development and fails closed in production.
:::

## Draft Encryption

The security module's persistence capability is a pair of app-provided ciphers — `$security.encrypt` and `$security.decrypt` — applied by features that persist values, currently [local autosave](/guide/autosave#encrypting-drafts) drafts. There is deliberately no built-in cipher: any key Vueform could generate on the device would sit right next to the ciphertext it protects. Bring a scheme whose key lives outside the stored data — typically delivered per user after login and held only in memory:

```ts
createVueform({
  $security: {
    encrypt: async (value, purpose) => { /* e.g. Web Crypto with a session key */ },
    decrypt: async (value, purpose) => { /* the inverse */ },
  },
})
```

Both functions may be sync or async, and both receive a `purpose` tag naming the call site (e.g. `'autosave:local'`), so one implementation can serve every feature that encrypts. Configure them as a pair — one without the other can't round-trip persisted values and warns in dev. A `decrypt` that throws marks the stored value unreadable, and the feature treats it as absent (autosave discards the draft).

Storage keys are namespaced: a custom `autosave.local.key` is forced under the `vueform:` prefix, so a schema can't address an unrelated localStorage entry. Elements marked [`sensitive`](/guide/autosave#sensitive-values) are stripped from local drafts entirely — the strongest option for values that should never touch the disk.

See [Encrypting Drafts](/guide/autosave#encrypting-drafts) for a complete Web Crypto example and the storage mechanics.

## Best Practices

- Set the `nonce` config option when your app enforces a strict CSP.
- Allow `img-src data:` for the default theme icons, or replace the icon tokens with same-origin assets.
- Attach CSRF and authentication tokens via `$http` interceptors, and pin your API origins with `$security.allowOrigins` when schemas come from outside the app.
- Mirror every client-side validation rule on the server.
- Validate and sanitize uploaded files server-side — client-side `accept` and `maxSize` constraints are UX, not enforcement.
- Install `@vueform/dompurify` whenever you list an area in `$security.allowHtml` — without an engine, HTML renders escaped rather than unsanitized.
- Keep `allowHtml` to the areas that actually need markup, and reserve the identity-`sanitizer` opt-out for schemas you fully control.
- Keep `allowComponents` to purpose-built slot, template, and layout components — never expose general application components to schema authors.
- Encrypt locally persisted autosave drafts via the `$security` ciphers when forms carry sensitive data, and mark secrets `sensitive` so they are never stored at all.
