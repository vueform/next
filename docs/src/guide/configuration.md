---
outline: [2,3]
---

# Configuration

Vueform is configured through one object passed to `createVueform`. The result is merged on top of the import entry defaults and becomes the single source every form, element, module, and plugin reads at runtime.

The quickest start is a pre-configured entry point like `@vueform/ui/origin` — it bundles the Origin theme, every component, all validation rules, the built-in modules, and the `en_US` locale, so the config only carries your project-specific overrides:

```ts nolink=createVueform
import { createApp } from 'vue'
import App from './App.vue'
import { createVueform } from '@vueform/ui/origin'

const app = createApp(App)
app.use(createVueform({
  // config options
}))
app.mount('#app')
```

When you need more control — a different theme, a trimmed component set, your own module implementations — import each part from its own subpath and wire them together with the bare entry:

```ts nolink=createVueform
import { createApp } from 'vue'
import App from './App.vue'
import { createVueform } from '@vueform/ui'
import { en_US } from '@vueform/ui/locales'
import * as components from '@vueform/ui/components'
import * as modules from '@vueform/ui/modules'
import * as rules from '@vueform/ui/rules'
import { origin as theme } from '@vueform/ui/themes'

const app = createApp(App)

app.use(createVueform({
  locales: { en_US },
  theme,
  components,
  modules,
  rules,
  // config options
}))

app.mount('#app')
```

See [Code Splitting](/guide/code-splitting) for each subpath and how to trim the bundle.

For type-checked configuration outside the `createVueform` call — for example when splitting config across files — wrap the object in `defineConfig`:

```ts
import { defineConfig } from '@vueform/ui'

export default defineConfig({
  // config options
})
```

The rest of this page walks through every option, grouped by concern: components and props, theming and layout, validation, internationalization, modules, extension hooks, and the advanced switches.

## Components & Props

### `components`

- Type: `Record<string, VueformComponent>`
- Default: `{}`

The component registry — the components available to your forms. With a pre-configured entry (like `@vueform/ui/origin`) every built-in is already registered, so this option holds your custom components and overrides:

```ts
import { createVueform } from '@vueform/ui/origin'
import { VfRating } from './components/VfRating'

createVueform({
  components: {
    VfRating,
  },
})
```

With a [modular setup](/guide/code-splitting#modular-setup), all components are registered here.

> ⚠️ maybe explain why register components instead of auto-import:
>
> - we have schema...
> - we have local components...
> - plugins...

### `defaults`

- Type: `Record<ComponentName | '*' | '*element', Partial<Props>>`
- Default: `{}`

[Default](/guide/defaults) prop values applied to every instance of a component. Keys are component names (`VfText`, `!VfForm`, …) or the wildcards `'*'` (every component) and `'*element'` (every element):

```ts
createVueform({
  defaults: {
    '*element': {
      columns: 6,
    },
    VfText: {
      placeholder: 'Type here...',
    },
  },
})
```

Defaults are layered beneath the component's own props, with plain objects shallow-merged and primitives replaced. See [Defaults](/guide/defaults) for the full resolution chain.

### `presets`

- Type: `Record<string, PresetDefinition>`
- Default: `{}`

Named bundles of props that components opt into via the [`presets`](/guide/presets) prop. Unlike `defaults`, presets aren't applied globally — they cascade from a host into matching descendants, targeted with `$apply` and `$cascade`:

```ts
createVueform({
  presets: {
    compact: {
      $apply: '*element',
      columns: 6,
    },
  },
})
```

See [Presets](/guide/presets) for targeting, cascading, multi-rule presets, and inline usage.

### `mergeObjectProps`

- Type: `boolean`
- Default: `true`

Whether plain-object prop values you pass are **merged into** object values coming from blueprint defaults, config `defaults`, and presets — or replace them entirely when `false`. Arrays always replace regardless, and `classes` / `presets` keep their dedicated merge semantics:

```ts
createVueform({
  mergeObjectProps: false,
})
```

## Theming & Layout

### `theme`

- Type: `ThemeTokens`
- Default: the entry point's bundled theme

The base [theme](/guide/themes-tokens#what-are-themes): a complete token map, such as `origin` or `material` from `@vueform/ui/themes`, or one produced by [`extendTheme` / `defineTheme`](/guide/themes-tokens#custom-themes). It replaces the entry's bundled theme **wholesale** — its `dark` block included — so it both selects the theme in a [modular setup](/guide/code-splitting#modular-setup) and switches themes on a pre-configured entry:

```ts
// Plain entry — no bundled theme of its own
import { createVueform } from '@vueform/ui'
import { origin as theme } from '@vueform/ui/themes'

createVueform({
  theme,
})
```

### `tokens`

- Type: `ThemeTokens`
- Default: `{}`

[Token](/guide/themes-tokens#tokens) overrides, shallow-merged on top of the base theme (the `theme` option, or the entry's bundled theme) at install time — the primary way to customize the look, covered in [Overriding Tokens](/guide/themes-tokens#overriding-tokens). Top-level keys replace same-named tokens; a `dark` block is shallow-merged with the base's `dark`:

```ts
// Pre-configured entry — the Origin theme is already wired up
import { createVueform } from '@vueform/ui/origin'

createVueform({
  tokens: {
    primary: '#5b21b6',
    gutter: '1.5rem',
    dark: {
      primary: '#a78bfa',
    },
  },
})
```

### `darkMode`

- Type: `'system' | string`
- Default: `'system'`

How [dark mode](/guide/themes-tokens#dark-mode) is detected globally:

- `'system'` — follows the OS preference via `prefers-color-scheme: dark`; the dark CSS block is emitted inside a `@media` query.
- A CSS subselector (`'.dark'`, `'[data-theme="dark"]'`, …) — Vueform watches `<html>` for that class or attribute and switches when it appears; the dark block is emitted as `:root<subselector> { ... }`.

```ts
createVueform({
  darkMode: '.dark',
})
```

### `reclass`

- Type: `Record<ComponentName | '*' | '*element', LooseClasses>`
- Default: `{}`

Global class [**replacements**](/guide/classes#adding-and-replacing-classes) per component, keyed by component name or the `'*'` / `'*element'` wildcards:

```ts
createVueform({
  reclass: {
    VfText: {
      input: 'my-input',
    },
  },
})
```

See [Global Class Configuration](/guide/classes#global-class-configuration) for how `reclass` interacts with the per-instance `class` and `classes` props.

### `layoutClasses`

- Type: `Record<string, ClassValue>`
- Default: the element layout's built-in classes

Per-key overrides for the shared element classes the element layout assigns (`vf-element`, `vf-label`, `vf-errors`, …). A key you set replaces that key's layout-provided value at the very _bottom_ of the class chain — every other key keeps the layout's default, and downstream overrides (presets, the `classes`/`reclass` props) still apply on top:

```ts
createVueform({
  layoutClasses: {
    root: 'my-element',
    label: 'my-label',
  },
})
```

See [Layout Classes](/guide/classes#layout-classes) for where these classes sit in the chain.

### `classHelpers`

- Type: `boolean`
- Default: `false`

A [development aid](/guide/classes#class-helpers) that prefixes every resolved class string with its key (e.g. `[__VfText.input__] vf-input ...`), making it trivial to spot in the browser inspector which class key a DOM element came from. Automatically suppressed in production builds:

```ts
createVueform({
  classHelpers: true,
})
```

### `classHelper`

- Type: `(key: string) => string`
- Default: ``(key) => `[__${key}__]` ``

The formatter behind [`classHelpers`](#classhelpers) — receives the class key and returns the prefix string:

```ts
createVueform({
  classHelpers: true,
  classHelper: (key) => `[${key}]`,
})
```

### `breakpoints`

- Type: `Record<string, string | number>`
- Default: `{ sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' }`

The [responsive breakpoint](/guide/form-structure#responsive-breakpoints) map behind the grid system. Keys become breakpoint names; values are CSS widths. Replacing the map regenerates the column classes — add `xxl: '1920px'` and `vf-col-xxl-*` classes exist everywhere:

```ts
createVueform({
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    xxl: '1920px',
  },
})
```

### `mobileFirst`

- Type: `boolean`
- Default: `true`

Whether breakpoint logic is mobile-first (`min-width`) or [desktop-first](/guide/form-structure#desktop-first) (`max-width`). Switching inverts the meaning of every breakpoint in `columns` props and the generated CSS:

```ts
createVueform({
  mobileFirst: false,
})
```

### `grid`

- Type: `boolean`
- Default: `true`

Whether to generate and inject Vueform's CSS grid utility classes (`vf-col-*`, label helpers, …). Disable it when you bring your own column system and don't want the extra CSS:

```ts
createVueform({
  grid: false,
})
```

### `cols`

- Type: `(size?: number, breakpoint?: string) => string`
- Default: built-in generator emitting `vf-col`, `vf-col-{size}`, `vf-col-{breakpoint}`, or `vf-col-{breakpoint}-{size}`

The function that turns a size and breakpoint into a column class name — called by every [`columns`](/guide/form-structure#multiple-elements-per-row) prop and by the generated grid CSS. Override it to adapt to a different column convention (Tailwind's `col-span-*`, Bootstrap's `col-md-*`, your own):

```ts
createVueform({
  cols: (size, breakpoint) => {
    if (breakpoint === undefined) {
      return size === undefined ? 'vf-col' : `vf-col-${size}`
    }
    return size === undefined
      ? `vf-col-${breakpoint}`
      : `vf-col-${breakpoint}-${size}`
  },
})
```

### `label`

- Type: `(size: number, breakpoint?: string) => string`
- Default: built-in generator emitting `vf-horizontal` / `vf-vertical` (optionally scoped to a breakpoint)

The function that decides which class marks an element's label as sitting above the input (vertical) or [next to it](/guide/form-structure#horizontal-labels) (horizontal), from the resolved label column size. The theme hangs alignment rules off the returned class — for instance top-padding horizontal labels so they line up with a single-line input while staying top-pinned next to a textarea. Pair with a custom `cols()` when porting to another grid system:

```ts
createVueform({
  label: (size, breakpoint) => {
    const alignment = size < 12 ? 'vf-horizontal' : 'vf-vertical'

    return breakpoint === undefined
      ? alignment
      : `vf-col-${breakpoint}:${alignment}`
  },
})
```

### `icon`

- Type: `(name: string) => string`
- Default: `(name) => name`

Resolves an icon name into the CSS class string rendered by `VfIcon` — called whenever an element's `iconBefore` / `iconAfter` (or any icon prop) is set. The default passes the name through; override it to map onto your icon library:

```ts
createVueform({
  icon: (name) => `fa-solid fa-${name}`,
})
```

With this resolver, `icon-before="search"` renders an `<i>` with class `fa-solid fa-search`. Common integrations:

```ts
// Font Awesome
icon: (name) => `fa-solid fa-${name}`

// PrimeIcons
icon: (name) => `pi pi-${name}`

// Your own sprite classes
icon: (name) => `icon-${name}`
```

See [Icons](/guide/element-layout#icons) for per-element usage.

### `icons`

- Type: `Record<string, string>`
- Default: `{ add: 'vf-icon-add', remove: 'vf-icon-remove', sort: 'vf-icon-sort' }`

Semantic icon names for Vueform's built-in controls — the [repeater's](/guide/repeaters) add/remove buttons and drag handle, and anywhere a `$`-prefixed icon name (`$add`, `$remove`, `$sort`) appears. Each mapped value still runs through the `icon` resolver, so the two options compose:

```ts
createVueform({
  icons: {
    add: 'plus',
    remove: 'trash',
    sort: 'grip-vertical',
  },
  icon: (name) => `fa-solid fa-${name}`,
})
```

### `build`

- Type: `{ styleId: string; scopedDarkMode: boolean; darkClass: string; lightClass: string }`
- Default: `{ styleId: 'vueform-theme', scopedDarkMode: false, darkClass: 'vf-dark', lightClass: 'vf-light' }`

Options controlling how Vueform emits its CSS:

| Option           | Default           | Description                                                                                                                                                                                       |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styleId`        | `'vueform-theme'` | The `id` of the injected `<style>` tag.                                                                                                                                                           |
| `scopedDarkMode` | `false`           | Generates extra scoped CSS re-declaring all theme tokens under `darkClass` / `lightClass`, so the `dark` prop on `!VfForm` can toggle dark mode per form in any environment. Adds ~5–10 KB of CSS. |
| `darkClass`      | `'vf-dark'`       | Class applied to forms with `:dark="true"` when `scopedDarkMode` is on.                                                                                                                           |
| `lightClass`     | `'vf-light'`      | Class applied to forms with `:dark="false"` when `scopedDarkMode` is on.                                                                                                                          |

```ts
createVueform({
  build: {
    styleId: 'my-vueform-theme',
    scopedDarkMode: true,
  },
})
```

### `nonce`

- Type: `string | undefined`
- Default: `undefined`

A CSP nonce applied to the `<style>` tags Vueform injects — required when your Content-Security-Policy restricts inline styles to nonce-carrying tags:

```ts
createVueform({
  nonce: 'your-csp-nonce',
})
```

### `useHead`

- Type: `boolean`
- Default: `true`

Whether to inject the generated stylesheet via [`@unhead/vue`](https://www.npmjs.com/package/@unhead/vue) when that package is available. `false` skips the lookup and appends a `<style>` tag to `<head>` directly:

```ts
createVueform({
  useHead: false,
})
```

## Validation

### `rules`

- Type: `Record<string, RuleDefinition>`
- Default: `{}`

The registry of [validation rules](/guide/validation) keyed by name. Pre-configured entry points register the built-ins; this option **adds** custom rules (or, in a modular setup, registers the built-ins too):

```ts
import { createVueform } from '@vueform/ui/origin'
import { createRule } from '@vueform/ui'

const even = createRule('even', (value) => Number(value) % 2 === 0)

createVueform({
  rules: {
    even,
  },
})
```

See [Registering Global Rules](/guide/validation#registering-global-rules) for the authoring API.

### `ruleMessageTag`

- Type: `(name: string, type?: 'numeric' | 'array' | 'file' | 'string') => string`
- Default: emits `rule_{name}_error` / `rule_{name}_{type}_error`

Turns a rule's name (and optional value-type variant) into the locale tag holding its error message — `rule_required_error`, `rule_min_string_error`, and so on. Override it when your translation files follow a different naming scheme:

```ts
createVueform({
  ruleMessageTag: (name, type) =>
    type ? `validation.${name}.${type}` : `validation.${name}`,
})
```

## Internationalization

### `locales`

- Type: `Record<string, Record<string, string>>`
- Default: `{}`

The map of [locales](/guide/locales) available to the app — each key a locale code, each value the locale's tag map (validation messages, step labels, screen-reader strings). `@vueform/ui/origin` pre-registers `en_US`; add more alongside it:

```ts
import { createVueform } from '@vueform/ui/origin'
import { de_DE } from '@vueform/ui/locales'

createVueform({
  locales: { de_DE },
  locale: 'de_DE',
})
```

When only one locale is registered it activates automatically — no `locale` needed.

### `!locale`

- Type: `string | Ref<string>`
- Default: `''`

The active locale's key. Required when multiple locales are registered. Pass a Vue `ref` to own the source of truth elsewhere (a store, a URL param) — see [Changing the Active Locale](/guide/locales#changing-the-active-locale):

```ts
createVueform({
  locales: { en_US, de_DE },
  locale: 'de_DE',
})
```

### `fallbackLocale`

- Type: `string`
- Default: `''`

The locale consulted when a tag is missing from the active one — the enabler of [partial locales](/guide/locales#fallback-locale):

```ts
createVueform({
  locales: { fr_FR, en_US },
  locale: 'fr_FR',
  fallbackLocale: 'en_US',
})
```

### `localeParamPattern`

- Type: `RegExp`
- Default: `/\{(\w+)\}/g`

The regex locating `{param}` placeholders in locale strings. Swap it when your translation source uses another convention — the first capture group must yield the parameter name:

```ts
createVueform({
  localeParamPattern: /:(\w+)/g,
})
```

See [Parameters](/guide/locales#parameters).

### `languages`

- Type: `Record<string, string | Record<string, string>>`
- Default: `{}`

The languages available to [translatable elements](/guide/multilingual-inputs) — keys are language codes stored in the model, values the labels shown in switchers (each label itself localizable):

```ts
createVueform({
  languages: {
    en_US: 'English',
    fr_FR: 'French',
  },
})
```

Languages can also be set per form or per element — the most specific wins. See [Configuring Available Languages](/guide/multilingual-inputs#configuring-available-languages).

## Modules

Vueform's runtime capabilities — conditions, dates, expressions, HTTP, locales, validation, and the rest — are packaged as **modules**. Pre-configured entry points register all of them; with the bare entry you pass them yourself, which is also the lever for leaving unused ones out of the bundle:

```ts
import { createVueform } from '@vueform/ui'
import * as modules from '@vueform/ui/modules'

createVueform({
  modules,
})
```

See [Code Splitting](/guide/code-splitting) for what removing each module does.

Each module reads its own options from a matching `$`-prefixed config key — the ones with options today:

### `!$conditions`

- Type: `ConditionsModuleOptions`
- Default: `{}`

| Field      | Default | Description                                                                                           |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `strict`   | `false` | Use [strict comparisons](/guide/conditions#strict-comparisons) when evaluating structured conditions. |
| `debounce` | `300`   | Debounce in ms before re-evaluating async conditional props when their trigger source changes.        |

```ts
createVueform({
  $conditions: { strict: true },
})
```

### `!$date`

- Type: `DateModuleOptions`
- Default: `{}`

The date `adapter` — the engine behind every [date feature](/guide/date). Pre-configured entries wire in the native adapter; the [format plugins](/guide/date#format-plugins) swap in a library-backed one, so you only set this directly for a [custom adapter](/guide/date#custom-adapters):

```ts
createVueform({
  $date: { adapter: myDateAdapter },
})
```

### `!$expression`

- Type: `ExpressionModuleOptions`
- Default: `{}`

Options for the [expression](/guide/expressions) system:

| Field       | Default                 | Description                                                              |
| ----------- | ----------------------- | ------------------------------------------------------------------------ |
| `enabled`   | `true`                  | Turns the expression system off entirely when `false`.                   |
| `trigger`   | all expressionable keys | Allow-list of prop keys where expressions resolve.                       |
| `functions` | `{}`                    | Custom expression functions keyed by name.                               |
| `consts`    | `{}`                    | Custom expression constants keyed by name.                               |
| `debug`     | `false`                 | Log expression parse/evaluation warnings.                                |
| `adapter`   | path interpolation      | The engine — the [expr-eval plugin](/plugins/expr-eval) sets a full one. |

```ts
createVueform({
  $expression: {
    trigger: ['label', 'default'],
    consts: { APP_NAME: 'Acme' },
  },
})
```

### `!$http`

- Type: `HttpModuleOptions`
- Default: `{ defaultMethod: 'GET', requestType: 'json', responseType: 'json', timeout: 0, withCredentials: false, base64: false, headers: {} }`

Defaults for the built-in [HTTP module](/guide/http) — shared by form submission, autosave, endpoint-loaded items, and every manual `useHttp()` call:

```ts
createVueform({
  $http: {
    baseURL: 'https://api.example.com',
    headers: { 'X-App': 'myapp' },
    timeout: 10000,
    withCredentials: true,
  },
})
```

| Option            | Type                                                        | Default            | Description                                            |
| ----------------- | ----------------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| `baseURL`         | `string`                                                    | —                  | Prepended to relative URLs.                            |
| `headers`         | `Record<string, string>`                                    | `{}`               | Default headers merged into every request.             |
| `timeout`         | `number`                                                    | `0`                | Request timeout in ms; `0` disables.                   |
| `requestType`     | `'json' \| 'form' \| 'multipart' \| 'text' \| 'urlencoded'` | `'json'`           | Default body encoding.                                 |
| `responseType`    | `'json' \| 'text' \| 'blob' \| 'arrayBuffer'`               | `'json'`           | Expected response body type.                           |
| `withCredentials` | `boolean`                                                   | `false`            | Include cookies on cross-origin requests.              |
| `base64`          | `boolean`                                                   | `false`            | Convert `File`/`Blob` values to base64 in JSON bodies. |
| `defaultMethod`   | `string`                                                    | `'GET'`            | Method when none is given per request.                 |
| `onRequest`       | `RequestInterceptor[]`                                      | `[]`               | Global request interceptors.                           |
| `onResponse`      | `ResponseInterceptor[]`                                     | `[]`               | Global response interceptors.                          |
| `adapter`         | `HttpAdapter`                                               | `fetchHttpAdapter` | The client behind every request.                       |

Per-request config overrides these; headers merge. See [HTTP Requests](/guide/http) for interceptors and adapter swaps.

### `!$locale`

- Type: `LocaleModuleOptions`
- Default: `{}`

Module-level overrides for [locale](/guide/locales) settings — the same `locales`, `locale`, `fallbackLocale`, and `localeParamPattern` you'd normally set as top-level config keys, applied on top of them — plus the `adapter` slot that replaces the whole locale backend (the [Vue I18n plugin](/plugins/vue-i18n) sets it):

```ts
createVueform({
  $locale: { fallbackLocale: 'en_US' },
})
```

### `!$router`

- Type: `RouterModuleOptions`
- Default: `{}`

Options for [browser-history integration](/guide/multi-page-forms#browser-history) in multi-page forms:

| Field        | Default       | Description                                                                      |
| ------------ | ------------- | -------------------------------------------------------------------------------- |
| `queryParam` | —             | Encode the active step as this query parameter instead of a path segment.        |
| `router`     | auto-detected | The vue-router instance, or `false` to disable auto-detection.                   |
| `adapter`    | built-in      | Custom router integration replacing the vue-router / `pushState` implementation. |

```ts
createVueform({
  $router: { queryParam: 'step' },
})
```

### `!$security`

- Type: `SecurityModuleOptions`
- Default: `{}` (unset options are equivalent to empty lists — every gate denies by default)

Options for the [security module](/guide/security):

| Field             | Type                                 | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowHtml`       | `('content' \| 'grid' \| 'slots')[]` | `[]`    | The areas where strings may render as HTML: `VfContent`'s `content`, grid string cells, and [`slots`](/guide/slots#string-content) entries. An area not listed renders its strings as escaped text with a dev warning.                                                                                                                                                                                                      |
| `sanitizer`       | `SecuritySanitizer`                  | —       | The sanitization engine — `(html: string) => string`; HTML in `allowHtml` areas always renders through it. The [DOMPurify plugin](/plugins/dompurify) installs one. Unset: raw + dev warning in development, **empty in production**; an identity function is the conscious opt-out.                                                                                                                                        |
| `allowComponents` | `string[]`                           | `[]`    | The globally registered component names a schema string may resolve to — in `slots` entries, the [`template`](/guide/templates#by-name) prop, the `layout` prop, and an element's `component` key (form entries, flat list prototypes, grid cell and matrix column schemas alike). A name outside the list is ignored with a dev warning; `Vf*` names derived from `type` are exempt.                                       |
| `allowOrigins`    | `string[]`                           | `[]`    | Additional **cross-origin** destinations requests may target, as absolute origins. The app's own origin and the `$http.baseURL` origin always pass; everything else is rejected before the request is sent unless listed. Wildcards: `'https://*.example.com'` (any subdomain, never the apex) and `'https://example.com:*'` (any port); `['*']` removes the restriction.                                                   |
| `banProps`        | `(string \| RegExp)[]`               | `[]`    | Keys dropped (in every value form) from schema-reachable prop bags — schema entries, `parts` bags, grid cell `attrs`. Strings match case-insensitively, RegExps test the original key. Only `innerHTML`/`outerHTML` and prototype keys are always dropped; **configure at least `[/^on/i, 'srcdoc']` when schemas are untrusted**. Dropped entries warn in development. See [Banning Props](/guide/security#banning-props). |
| `encrypt`         | `SecurityCipher`                     | —       | Encrypts values before features persist them — currently [local autosave drafts](/guide/autosave#encrypting-drafts). May be async.                                                                                                                                                                                                                                                                                          |
| `decrypt`         | `SecurityCipher`                     | —       | The inverse, applied when persisted values are read back. A throw marks the value unreadable.                                                                                                                                                                                                                                                                                                                               |

HTML rendering and component names are gated because schemas often come from outside the app — see [Untrusted Schemas](/guide/security#untrusted-schemas):

```ts
createVueform({
  plugins: [dompurify()],
  $security: {
    allowHtml: ['content'],
    allowComponents: ['MyOption', 'MyTextTemplate'],
  },
})
```

The [DOMPurify plugin](/plugins/dompurify) provides the engine in one step; a custom sanitizer is a single `(html) => string` function:

```ts
createVueform({
  $security: {
    allowHtml: ['content'],
    sanitizer: (html: string) => myCustomSanitizer(html),
  },
})
```

### `!router`

- Type: `VueformRouter | false`
- Default: auto-detected

The vue-router instance used for [browser history integration](/guide/multi-page-forms#browser-history) in multi-page forms. Auto-detected from the Vue app by default; pass `false` to disable router integration entirely.

## Extension

### `plugins`

- Type: `VueformPlugin[]`
- Default: `[]`

[Plugins](/guide/plugins) applied at install time. A plugin can mutate config, register modules and rules, augment components with extra props, or bundle several extensions as one:

```ts
import exprEval from '@vueform/expr-eval'
import dompurify from '@vueform/dompurify'

createVueform({
  plugins: [exprEval(), dompurify()],
})
```

Order matters — each plugin sees the mutations of every earlier one. See [Plugins](/guide/plugins) for the lifecycle and authoring guide.

### `globals`

- Type: `(config: VueformConfig, globals: Partial<VueformGlobals>) => void`
- Default: `undefined`

A callback that runs once at install time, after config merge. It receives the resolved config and the mutable [Globals](/guide/globals) context — the app-wide state any Vueform component or plugin can read at runtime:

```ts
import { ref } from 'vue'

createVueform({
  globals: (config, globals) => {
    globals.currentUser = ref(null)
  },
})
```

See [Globals](/guide/globals) for what lives in the context and how components consume it.

## Advanced

### `nativeEmit`

- Type: `boolean`
- Default: `false`

Routes events through Vue's native `emit()` instead of Vueform's own pipeline — gaining DevTools visibility, losing cancelable/async template handlers:

```ts
createVueform({
  nativeEmit: true,
})
```

See [Falling Back to Native Vue Emits](/guide/event-handlers#falling-back-to-native-vue-emits) for the trade-offs.

### `lazy`

- Type: `boolean`
- Default: `true`

Elements mount their full templates lazily — after an idle callback, or when they become visible — which speeds up the initial render of large forms. Set `false` to render everything immediately:

```ts
createVueform({
  lazy: false,
})
```

### `uid`

- Type: `() => string | number`
- Default: Vue's [`useId()`](https://vuejs.org/api/composition-api-helpers.html#useid) — stable across SSR and hydration

The generator behind every element's `id` attribute. It is called during component `setup()`, so composables like Vue's `useId()` and `getCurrentInstance()` are available inside it. Replace it when IDs must follow a specific scheme (analytics, accessibility audits, snapshot tests):

```ts
import { useId } from 'vue'

createVueform({
  uid: () => `myform-${useId()}`,
})
```

Custom implementations must produce identical values on server and client under SSR — see [Stable IDs](/guide/ssr#stable-ids) for what's safe and what isn't.

### `matrixTypes`

- Type: `{ single: [string, string]; multiple: [string, string]; auto: [string, string] }`
- Default: `{ single: ['radio', 'radios'], multiple: ['checkbox', 'checkboxes'], auto: ['text', 'group'] }`

The element types [`VfMatrix`](/guide/form-structure#matrix-layout) renders for each selection mode. Each value is a **tuple**: the first entry is the element type rendered for a single cell, the second is the holder/container type wrapping a row's cells — in `single` mode each cell is a `radio` inside a `radios` holder. Each adapter configures these to its own components, so it's unlikely you'll ever touch them — the exception being custom elements that should back a mode:

```ts
createVueform({
  matrixTypes: {
    single: ['my-radio', 'my-radios'],
    multiple: ['checkbox', 'checkboxes'],
    auto: ['text', 'group'],
  },
})
```
