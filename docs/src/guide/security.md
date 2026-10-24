---
outline: [2,3]
---

# Security

A schema is data that describes rendering, and it often comes from outside the app — a CMS, an API response, a form builder's output. Out of the box nothing is restricted — the right default when schemas are your own code. When they aren't, every surface a schema can reach locks down with one [`$security`](/guide/configuration#security) option, and Vueform's guarantee is that a set option is enforced exactly as written — strings render as text outside the allowed HTML areas, component names resolve only from the allowlist, and requests stay on the origins you name.

These guarantees cover the client. Validation, file checks, and authorization still belong to your server — the [last section](#server-side-responsibilities) names exactly what.

## Why It Matters

Forms collect an app's most sensitive data — credentials, payment details, personal information — and in a schema-driven library the form itself is described by data, so whoever shapes that data shapes what runs in front of the user.

Schemas increasingly come from AI assistants, CMS fields, and API responses rather than a developer's editor, and every one of those channels can be steered — a compromised account, a poisoned upstream source, a prompt injection. Meanwhile AI keeps collapsing the cost of attacking, so incidents will only grow in volume and sophistication — and defenses bolted on after the first one come too late.

Vueform therefore treats the schema as untrustable by design. Every surface it can reach has a gate, a misconfigured policy [fails closed in production](#the-security-module), and each guarantee is pinned by an [adversarial test suite](#adversarial-testing). Locking down is a config change you make today, not a rewrite you start after an incident.


## The Security Module

Every protection in this chapter is one module, `security`, configured through the  [`$security`](/guide/configuration#security) config key. The [Full Bundle](/guide/code-splitting#the-full-bundle) registers it out of the box; in a [Modular Setup](/guide/code-splitting#modular-setup) you register it yourself:

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

Leaving the `security` [module](/guide/modules#leaving-a-module-out) out saves bundle size, at the cost of the protections in this chapter — the `$security` options have nothing to turn on, and the [always-on guards](#always-on-guards) are gone too. Setting `$security` policy without the module is a misconfiguration, not an opt-out — development warns at `createVueform()` and stays permissive, while production **fails closed**, so a misconfigured app can never ship looking enforced while it isn't.

## HTML Sanitization

Most strings — labels, placeholders, help texts, button captions — go through Vue's text interpolation and render escaped, so a `<script>` tag in a label shows up as literal text. Rendering a string **as HTML** happens in exactly three areas:

| Area | Covers |
| --- | --- |
| `'content'` | `!VfContent`'s [`content`](/components/VfContent#usage.html-content) prop. |
| `'slots'` | String [`slots`](/guide/slots#string-content) entries. |
| `'grid'` | String grid [cells](/guide/form-structure#cells). |

All three render HTML out of the box. [`$security.allowHtml`]((/guide/configuration#security)) is the restriction — once set, it is a pure allowlist, and an area left off it renders markup as escaped text, tags visible, nothing silently dropped, so a tightened area is diagnosable at a glance:

```ts
import dompurify from '@vueform/dompurify'

createVueform({
  plugins: [dompurify()],
  $security: {
    allowHtml: ['content'], // slot and grid strings now render escaped
  },
})
```

`allowHtml: []` escapes everywhere. The app config is the only authority — no schema entry can grant itself HTML rendering — and strings without markup never consult the gate; they render the same either way.

### The Sanitize Step

HTML in an allowed area always passes through [`$security.sanitizer`](/guide/configuration#security), after localization and [expression](/guide/expressions) resolution, so the sanitizer sees the final markup — including values interpolated out of form data. That ordering is what makes a template like `'Welcome, {name}!'` safe, whatever `{name}` carries in.

There is no built-in engine — sanitization happens only when a `sanitizer` is installed, typically the [`@vueform/dompurify`](/plugins/dompurify) plugin. Once `allowHtml` is set, a sanitizer is required — missing one warns in development and fails closed in production, rendering the allowed areas empty. To render raw HTML on purpose for a fully trusted schema, set `$security.sanitizer: (html) => html`.

A custom engine is a single `SecuritySanitizer` function, `(html: string) => string`, set as [`$security.sanitizer`](/guide/configuration#security) — and a sanitizer you set yourself wins over the plugin's. The DOMPurify plugin's own options (`sanitizeOptions`, `sanitizeInit`) are covered on [its page](/plugins/dompurify).

## Untrusted Schemas

A schema reaches more than text — component names, attribute bags, element props, URLs, CSS values. Each of those surfaces has a gate, and with every gate set a crafted document stays data no matter what it spells. For an app loading schemas from outside, the baseline looks like this:

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

The first two lines — the sanitizer and the `allowHtml` restriction — are the [HTML sanitization](#html-sanitization) setup covered above; the subsections below cover the rest.

### Component Names

A schema names components as strings — in [`slots`](/guide/slots#string-content) entries, the [`template`](/guide/templates#by-name) and [`layout`](/guide/templates#the-standard-layout) props, an element's `component` key, and the `component` key of [element addons](/guide/element-layout#element-addons). Unset, any registered name resolves. Setting [`$security.allowComponents`](/guide/configuration#security) makes it the allowlist those strings resolve against — `[]` resolves nothing.

A rejected name falls back instead of failing. A slot string renders as content, `template` and `layout` fall back to the standard rendering, and `component` falls back to the `Vf*` element derived from `type` — with a one-time dev warning per rejected name. A slot string only consults the list when it's shaped like a component name **and** names a registered component; anything else is content. Keep the list to purpose-built slot, template, and layout components rather than exposing general application components.

### Banning Attributes

Several objects in a schema end up spread onto a component or a DOM element key by key — the element schema entry itself (its keys become the element's props), and the attribute bags it can carry, like [`parts`](/guide/parts) values and grid cell [`attrs`](/guide/form-structure#cells).

Every such bag passes a filter before binding, however deep in the schema the entry sits. Only `innerHTML` / `outerHTML` and prototype keys are dropped unconditionally. Everything else — inline `on*` handlers, `srcdoc`, DOM-clobbering `id` / `name` — is your policy, declared through [`$security.banAttrs`](/guide/configuration#security); for untrusted schemas, configure at least `[/^on/i, 'srcdoc']` as in the baseline above.

String entries match case-insensitively, RegExp entries as written — add the `i` flag yourself. Spelling doesn't matter either — a ban on `inputMode` catches a schema spelling it `input-mode`, and the other way around. A banned key is dropped in every value form, and each drop warns in development naming the key.

Some element vocabularies have legitimate `on*`-named props — `onTrue` / `onFalse`, or `onLabel` / `onIcon`. Carve them out with a negative lookahead instead of widening the ban:

```ts
banAttrs: [/^on(?!True$|False$)/, 'srcdoc']
```

A RegExp like `/^on/i` also drops developer-written **function** listeners inside `parts` bags — the filter can't tell trusted objects from untrusted ones once they merge. Keep listeners in template code, which is never filtered.

Because schema entries pass the same filter, listing a prop name turns that whole channel off for schemas while template usage keeps working — props written in your SFCs never go through schema resolution. For schemas that should carry no presentation at all:

```ts
banAttrs: ['style', 'parts', 'attrs', 'slots', 'tokens']
```

### Prop References

[Conditions](/guide/conditions#referencing-element-properties) and [expressions](/guide/expressions#element-props) can read element props through the `path@prop` / `@prop` reference form. Unlike value references, these read the live element context — an untrusted schema could otherwise walk `@form$` or deep internals and leak values into rendered text — so `allowProps` gates which prop paths resolve.

Unset, every reference resolves. Setting [`$security.allowProps`](/guide/configuration#security) makes it the allowlist references resolve against — a reference outside your list resolves as `undefined` (the condition counts as unmet, the expression renders empty) with a dev warning naming the prop.

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
| `'**'` | Every prop at every depth — the explicit spelling of the unset default. |

```ts
allowProps: ['label', 'selected*', 'meta.*']
```

An entry may also be a RegExp, tested against the full prop path with index access normalized to dots (`@model[0]` tests as `model.0`) — anchor it yourself. An invalid string pattern is ignored with a dev warning rather than silently never matching.

Value references — `{field}` interpolation and `[path, operator, value]` conditions without `@` — read form data, not props, and aren't affected.

### Always-On Guards

Three guards have no option — with the module registered, they always apply:

| Guard | What it covers |
| --- | --- |
| CSS values | Schema-supplied values that reach `<style>` text — theme `tokens`, grid and matrix column widths, and the like — a value containing `{` or `}` is dropped, since it could break out of its scoped rule. |
| URLs | Schema-supplied URLs that reach a navigation or load sink — a form's `redirect`, a button's `href` / `to`, a file's `url`, and the like — each sink allows only the schemes that make sense for it (`http(s)`, and e.g. `mailto` / `tel` for buttons or `blob` for files); any other scheme never reaches the sink, obfuscations like `java\tscript:` included, while relative URLs pass. |
| Storage keys | A custom `draft.key` is forced under the `vueform:` namespace — see [draft options](/guide/autosave#draft-options). |

Like everything above, these are the module's features — without it the values pass unchecked.

### What Stays Code-Trust

Function-valued props — a function `endpoint`, `transformResponse`, event handlers, function `parts` — can't travel through JSON, so only your own code supplies them; no gate is needed. The `endpoint`, `method`, and `headers` props are plumbing for your API — with untrusted schemas, pin where they may point via [`allowOrigins`](#request-origins).

JavaScript running in your page sits inside the trust boundary. Code that can swap the sanitizer could equally call `fetch` or read the DOM directly — no client-side library defends against hostile code, and Vueform's guarantees are about **data** (schemas, input, responses, drafts), never about code.

## Request Origins

[Interceptors](/guide/http#interceptors) attach credentials to every request, and a form's `endpoint` — or an element's endpoint-loaded `items` — is an ordinary prop. In an app whose schemas come from outside, a crafted absolute URL would receive your tokens along with the data.

Setting [`$security.allowOrigins`]((/guide/configuration#security)) pins where requests may go. The app's own origin passes untouched — relative URLs, and absolute URLs spelling out the current origin — and in the browser the origin of [`$http.baseURL`](/guide/configuration#http) is trusted implicitly. Anything else is a decision the app states by listing it:

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
| unset | No restriction — the default. |
| `[]` | Own origin and `$http.baseURL` only — the tightest policy. |
| `['https://cdn.example.com']` | The above, plus the listed origins. |
| `['https://*.example.com']` | Any subdomain of `example.com`, at any depth, over `https` — never the apex itself, never another scheme. |
| `['https://example.com:*']` | That exact host on any port, the scheme default included. |

A wildcard is valid only in the subdomain or port position; any other placement is ignored with a dev warning. Trusting `baseURL` costs nothing — a schema can only reach it through a relative URL, and an absolute URL bypasses `baseURL` entirely, so it's still judged against the list.

The check runs after your interceptors and before the adapter, so it covers every request the [HTTP module](/guide/http) makes, whichever adapter is configured. A blocked request never leaves the browser — it rejects with an `HttpError` whose `reason` is `'blocked'` (see [error handling](/guide/http#error-handling)).

Outside a browser nothing is trusted implicitly — not even `baseURL` — so once the option is set, absolute URLs must be listed. The built-in fetch adapter [refuses SSR requests](/guide/ssr#http-is-client-side) outright anyway; this guards server-capable custom adapters.

## Draft Encryption

[`$security.encrypt`](/guide/configuration#http) and [`decrypt`](/guide/configuration#http) are app-provided ciphers applied to values Vueform persists — currently form [drafts](/guide/autosave#encrypting-drafts). There is deliberately no built-in cipher, because any key generated on the device would sit next to the ciphertext it protects. Bring a scheme whose key lives outside the stored data — typically delivered per user after login and held only in memory:

```ts
let key: CryptoKey // import after login; memory only, never storage

createVueform({
  $security: {
    encrypt: async (value, purpose) => {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const data = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(value)
      )

      return btoa(String.fromCharCode(...iv, ...new Uint8Array(data)))
    },
    decrypt: async (value, purpose) => {
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

Both functions may be sync or async, and both receive a `purpose` tag naming the call site, so one implementation can serve every feature that encrypts. Configure them as a pair — half a pair can't round-trip values, so it warns in development and fails closed in production (nothing persists, stored values read as absent). A `decrypt` that throws marks the stored value unreadable, and the consuming feature treats it as absent.

Until the ciphers are configured, values are persisted as-is — plaintext drafts and the per-form `draft.encrypt: false` flag are covered in [encrypting drafts](/guide/autosave#encrypting-drafts).

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

The default icon tokens are static `data:image/svg+xml` URLs shipped with the package, so `img-src` needs `data:`. If your policy forbids it, override the icon tokens with same-origin assets:

```ts
createVueform({
  tokens: {
    iconAdd: 'url("/icons/icon-add.svg")',
    iconRemove: 'url("/icons/icon-remove.svg")',
  },
})
```

To keep the default looks, download the stock SVGs — [vueform-icons.zip](/icons/vueform-icons.zip) — and copy them into your app; the bundled README maps each file to its token.

In total, Vueform asks exactly two things of your policy — everything else depends on your app, not Vueform:

| Directive | Value | Reason |
| --- | --- | --- |
| `style-src-elem` | `'nonce-…'` | Every `<style>` tag Vueform injects or renders. |
| `img-src` | `data:` | The default icon tokens are inline SVG data URIs. |

## Server-Side Responsibilities

Client-side validation is UX, not a boundary — instant feedback and fewer round trips, nothing an attacker can't skip. Mirror every rule on the server, and map a rejected submission's `422` errors back onto elements as described in [when the server rejects](/guide/submit#when-the-server-rejects).

File constraints are UX in the same way. `accept` and `maxSize` shape the picker and catch mistakes; the server must validate and sanitize every upload it stores.

Authorization and CSRF protection are server decisions too. The client's share — attaching tokens to requests — is one [interceptor](/guide/http#interceptors).

## Adversarial Testing

Every guarantee in this chapter is pinned by a dedicated [adversarial test suite](https://github.com/vueform/next/tree/main/packages/core/tests/integration/security) that attacks the gates instead of trusting the happy path — hostile schemas, breakout payloads, polluted prototypes, smuggled URL schemes, forged server responses. The suite reaches beyond this chapter and the `security` module, too: the invariants that hold in every app — prototype-key guards, header injection, forged responses around validation and submission — are attacked the same way.

Each test documents the threat it covers and the measure that stops it, so the suite doubles as a readable record of what exactly is protected and how — worth a look when you need to know precisely what a gate does and doesn't catch, or want to vet the protections before trusting them with untrusted schemas.