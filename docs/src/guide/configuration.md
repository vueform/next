---
outline: [2,3]
---

# Configuration

Every app-wide setting — registered components and modules, theming, grid and locale behavior, each module's options — lives in one object passed to `createVueform`. It's merged over the entry's defaults once, when the instance is created, and the resolved object is what every form, element, module, and plugin reads from then on. The entry you import `createVueform` from decides the starting point, so the object usually carries only what your project changes.

## Passing Options

The config object is `createVueform`'s single argument:

```ts
import { createVueform } from '@vueform/ui/origin'

app.use(
  createVueform({
    darkMode: '.dark',
    $http: { baseURL: 'https://api.example.com' },
  })
)
```

The pre-configured entries — `@vueform/ui/origin` and `@vueform/ui/material` — register every built-in component, module, and rule, their theme, the `en_US` locale set active, and three adapters — `fetchHttpAdapter` for `$http`, `nativeDateAdapter` for `$date`, and `pathExpressionAdapter` for `$expression`. What that convenience costs in bundle size is covered in [code-splitting](/guide/code-splitting#pre-configured-entries).

The bare `@vueform/ui` entry starts from the core defaults alone — no components, modules, rules, theme, locale, or adapters. Only `modules.model` is mandatory; the bare `createVueform`'s type demands it, and the call throws without it. The full wiring of a hand-picked setup lives in [code-splitting](/guide/code-splitting#modular-setup).

A config authored outside the call — in a shared file, say — keeps its typing with [`defineConfig`](/api/helpers/defineConfig). Its type is `UserConfig`, in which every key is optional and `build` / `modules` are partial one level down; every other object-valued option, such as `matrixTypes`, must be passed whole.

The resolved object is available as `vueform.config` on the instance and through `useConfig()` inside components — see [vueform instance](/guide/vueform-instance#the-vueform-context).

In development the resolved config is deep-frozen once installed (except the `components`, `plugins`, `modules`, `globals`, and `rules` branches), so writing to it after `app.use()` throws. Config changes belong in a plugin's `config` hook, before install — see [plugins](/guide/plugins#modifying-global-configuration).

## How Options Merge

The merge runs once, inside `createVueform()`. Your keys go over the entry's, then every plugin's `config` hook runs on the result — [vueform instance](/guide/vueform-instance#two-phases) walks through the full sequence. Most options simply replace the entry's value, with these exceptions:

| Option | Combined with the entry's value |
| --- | --- |
| `components`, `modules`, `icons`, `build` | Shallow-merged — your keys add to or override the entry's. |
| every `$`-prefixed module option | Shallow-merged per module — `$http: { baseURL }` keeps the entry's adapter. |
| `plugins` | Appended after the entry's own plugins. |
| `globals` | Both hooks run, the entry's first — see [globals](/guide/globals). |
| `theme` | Replaces the entry's theme wholesale, `dark` block included. |
| `tokens` | Merged on top of the resolved theme — top-level keys replace, `dark` blocks shallow-merge. See [themes & tokens](/guide/themes-tokens#overriding-tokens). |
| `locale` | Wrapped in a ref — a ref you pass is used as-is. |
| everything else | Replaced. |

The last row matters most for `rules` and `locales` — your object replaces the entry's built-ins instead of adding to them. To extend, spread the subpath export:

```ts
import { createVueform } from '@vueform/ui/origin'
import * as rules from '@vueform/ui/rules'
import { phone } from './rules'

createVueform({
  rules: { ...rules, phone },
})
```

The same replacement applies to `locales` — registration and the active-locale consequence are covered in [locales](/guide/locales#registering-locales). `breakpoints` and `matrixTypes` replace too, so adding to them means re-listing the defaults ([breakpoints](#breakpoints), [matrixTypes](#matrixtypes)).

## Registries

### `components`

- Type: `Record<string, VueformComponent>`
- Default: `{}` — the pre-configured entries pre-register every built-in

Every entry is registered globally with `app.component()` at install, and a schema `type` resolves to a component by that name — `type: 'my-input'` renders `VfMyInput`, so the registration key is the name. Your entries add new names or replace a built-in under the same name. Registration instead of auto-import is deliberate — schema types are strings resolved at runtime, invisible to any bundler, as [code-splitting](/guide/code-splitting) explains. Building and registering your own components is covered in [components](/guide/components).

### `modules`

- Type: `VueformModules`
- Default: `{}` — the pre-configured entries register every built-in

Module definitions created with `defineModule`, keyed by module name. `model` is the one required entry on the bare entry. Registering, leaving out, and swapping modules is covered in [modules](/guide/modules).

### `rules`

- Type: `Record<string, RuleDefinition>`
- Default: `{}` — the pre-configured entries register the built-in catalog

Validation rules available to every form by name. Your object replaces the entry's catalog, so spread the built-ins when extending — see [how options merge](#how-options-merge). Authoring rules with `createRule` and typing them through the `CustomRules` augmentation is covered in [validation](/guide/validation#registering-rules-globally).

### `plugins`

- Type: `VueformPlugin[]`
- Default: `[]`

Plugins applied at creation, in array order, after any plugins the entry ships (the PrimeVue entry ships two). `vueform.use()` appends more before install. See [plugins](/guide/plugins#registering-plugins).

## Component Props

### `defaults`

- Type: `ComponentDefaultsMap`
- Default: `{}`

Default prop values keyed by component name, with `'*'` for every component and `'*element'` for every element. Per component the layers stack `'*'` → `'*element'` → the component's own key, with `classes` merging and `presets` concatenating. See [defaults](/guide/defaults).

### `presets`

- Type: `Record<string, PresetDefinition>`
- Default: `{}`

Named prop bundles a component opts into through its `presets` prop. See [presets](/guide/presets).

### `mergeObjectProps`

- Type: `boolean`
- Default: `true` (unset counts as `true`)

When `false`, a plain-object prop you pass replaces the object coming from blueprint defaults, config `defaults`, and presets instead of shallow-merging into it. Arrays and non-plain values always replace, and `classes` / `presets` keep their own merge semantics either way. See [defaults](/guide/defaults#merging-behavior).

## Theming

### `theme`

- Type: `ThemeTokens`
- Default: the entry's bundled theme (none on the bare entry)

The base token map. It replaces the entry's theme wholesale, `dark` block included. Choosing and authoring themes is covered in [themes & tokens](/guide/themes-tokens#choosing-a-theme).

### `tokens`

- Type: `ThemeTokens`
- Default: `{}`

Token overrides merged on top of the resolved base theme when `createVueform()` runs — top-level keys replace, `dark` blocks shallow-merge. See [themes & tokens](/guide/themes-tokens#overriding-tokens).

### `darkMode`

- Type: `'system' | string`
- Default: unset, behaving as `'system'`

How dark mode is detected — the OS preference, or a selector matched against `<html>` (e.g. `'.dark'`). Live switching reacts only to changes of the `class` and `data-theme` attributes, so a selector on any other attribute is evaluated at startup only. The detection modes and the `dark` token block are covered in [themes & tokens](/guide/themes-tokens#dark-mode).

### `build`

- Type: an object, shallow-merged with the entry's

| Field | Default |
| --- | --- |
| `styleId` | `'vueform-theme'` |
| `scopedDarkMode` | `false` |
| `darkClass` | `'vf-dark'` |
| `lightClass` | `'vf-light'` |

`styleId` is the `id` of the injected `<style>` tag and of `getStyleTag()`'s output. On the client an existing tag with that id is reused, so two instances on one page need distinct ids — development warns when the contents differ. See [SSR](/guide/ssr#style-injection) for where the tag ends up in server-rendered apps.

`scopedDarkMode` additionally emits `darkClass` / `lightClass` blocks that re-declare every root token, pinning any subtree wrapped in one of those classes to that mode.

### `nonce`

- Type: `string | undefined`
- Default: `undefined`

A CSP nonce applied to every `<style>` tag Vueform injects and to `getStyleTag()`'s output. Coverage details live in [security](/guide/security#style-tag-nonce), per-request nonces in [SSR](/guide/ssr).

### `useHead`

- Type: `boolean`
- Default: `true`

When the app provides [`@unhead/vue`](https://unhead.unjs.io/docs/vue/head/guides/get-started/installation), the generated stylesheet goes through it. Otherwise — or with `false` — a `<style>` tag is injected into `<head>` directly. See [SSR](/guide/ssr#style-injection).

## Classes

### `reclass`

- Type: `ComponentClassesMap`
- Default: `{}`

Replaces a component's base classes per class key, keyed by component name, `'*element'`, or `'*'`. Per key the most specific entry wins — component name, then `'*element'`, then `'*'` — the three are not merged. See [classes](/guide/classes#global-class-configuration).

### `layoutClasses`

- Type: `LayoutClassesMap`
- Default: unset

Per-key overrides of the shared element classes the element layout installs at the bottom of the class chain (`root`, `label`, `errors`, …). See [classes](/guide/classes#layout-classes).

### `classHelpers`

- Type: `boolean`
- Default: `false`

Development-only markers on every resolved class value, for tracing which class key styles what. See [classes](/guide/classes#class-helpers).

### `classHelper`

- Type: `(key: string) => string`
- Default: `` (key) => `[__${key}__]` ``

The function producing the helper markers. It receives `ComponentName.classKey`, and whitespace is stripped from its result. See [classes](/guide/classes#class-helpers).

## Grid and Layout

### `breakpoints`

- Type: `Record<string, string | number>`
- Default: `{ sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' }`

The responsive breakpoints. Keys become the breakpoint names of `columns` props and of the generated `vf-col-{breakpoint}-{size}` classes, and numeric values are read as pixels. The map replaces the default whole, so adding one means re-listing the rest:

```ts
createVueform({
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    xxl: '1920px', // [!code highlight]
  },
})
```

How breakpoints drive column layout is covered in [form structure](/guide/form-structure#responsive-breakpoints).

### `mobileFirst`

- Type: `boolean`
- Default: `true`

Switches the generated media queries between `min-width` (mobile-first) and `max-width` (desktop-first). Global only — see [form structure](/guide/form-structure#desktop-first).

### `grid`

- Type: `boolean`
- Default: `true`

Whether Vueform generates the column CSS and the per-breakpoint label-alignment rules. With `false` you bring both yourself.

### `cols`

- Type: `(size?: number, breakpoint?: string) => string`
- Default: emits `vf-col`, `vf-col-{size}`, `vf-col-{breakpoint}`, and `vf-col-{breakpoint}-{size}`

The column class name generator. It's called both when `columns` props resolve and when the grid CSS is generated — each class gets a `grid-column: span …` rule — so the two always agree. Mapping onto another framework's column classes therefore pairs with `grid: false`, since the generated CSS would otherwise target the foreign names:

```ts
createVueform({
  grid: false,
  cols: (size, breakpoint) =>
    breakpoint ? `col-${breakpoint}-${size ?? 12}` : `col-${size ?? 12}`,
})
```

### `label`

- Type: `(size: number, breakpoint?: string) => string`
- Default: returns `vf-horizontal` below `12` and `vf-vertical` at `12`, prefixed with `vf-col-{breakpoint}:` when scoped

The label-alignment class generator. The generated grid CSS aligns labels by selecting `{cols(undefined, breakpoint)}:vf-horizontal` / `:vf-vertical`, so a custom `cols` needs a `label` whose scoped output matches — or `grid: false` with your own alignment CSS. See [form structure](/guide/form-structure#horizontal-labels).

### `matrixTypes`

- Type: `{ single: [string, string]; multiple: [string, string]; auto: [string, string] }`
- Default: `{ single: ['radio', 'radios'], multiple: ['checkbox', 'checkboxes'], auto: ['text', 'group'] }` (the PrimeVue adapter ships its own)

The element types `!VfMatrix` renders per selection mode — each tuple is the cell's element type and the row holder's type. Types resolve through the [component registry](#components), and a column's own `schema.type` wins over the mode's cell type, so custom elements can back any mode. The object replaces the default whole, and its type requires all three modes. See [form structure](/guide/form-structure#matrix-layout).

## Icons

### `icon`

- Type: `(name: string) => string`
- Default: `(name) => name` (the PrimeVue adapter prefixes `pi pi-`)

Resolves every icon prop into the class string rendered for it:

```ts
createVueform({
  icon: (name) => `fa-solid fa-${name}`,
})
```

Per-element icon usage is covered in [element layout](/guide/element-layout#icons).

### `icons`

- Type: `Record<string, string>`
- Default: `{ add: 'vf-icon-add', remove: 'vf-icon-remove', sort: 'vf-icon-sort' }`

Semantic icon names behind `$`-prefixed icon props. `$add` looks up `icons.add` (falling back to the bare name), and the result still runs through `icon` — so `icons: { add: 'plus' }` with the Font Awesome resolver above renders `fa-solid fa-plus`. Shallow-merged with the entry's. Semantic icons appear in [dynamic props](/guide/dynamic-props#icons) and the [repeater](/guide/repeaters) controls.

## Internationalization

The locale module reads these top-level keys, and each of them can be overridden per app through the `$locale` options bag under [module options](#module-options).

### `locales`

- Type: `LocalesProp`
- Default: `{}` (`{ en_US }` on the pre-configured entries)

The registered locale definitions keyed by locale code. Your map replaces the entry's — see [locales](/guide/locales#registering-locales).

### `!locale`

- Type: `string | Ref<string>`
- Default: `''` (`'en_US'` on the pre-configured entries)

The active locale key. It's never required — when empty, the first registered key is active, however many are registered. A ref binds two-way. See [locales](/guide/locales#changing-the-active-locale).

### `fallbackLocale`

- Type: `string`
- Default: `''` (no fallback)

The locale consulted when a tag is missing from the active one. See [locales](/guide/locales#fallback-locale).

### `localeParamPattern`

- Type: `RegExp`
- Default: `/\{(\w+)\}/g`

The pattern matching parameter placeholders in locale messages. The first capture group is the parameter name, and the pattern always runs globally. See [locales](/guide/locales#parameters).

### `languages`

- Type: `Record<string, string | Record<string, string>>`
- Default: `{}`

The languages available to multilingual inputs — keys are the codes stored in the model, values the (localizable) labels. A form's own `languages` prop takes precedence. See [multilingual inputs](/guide/multilingual-inputs#configuring-available-languages).

### `ruleMessageTag`

- Type: `(name: string, type?: 'array' | 'string' | 'numeric' | 'file') => string`
- Default: emits `rule_{name}_error`, or `rule_{name}_{type}_error` for typed rules

Maps a validation rule to the locale tag of its error message. `type` is passed only for typed rules, and a tag missing from the locale falls back to `ruleMessageTag('default')`. See [validation](/guide/validation#locale-tags).

## Module Options

Each module reads its options from the config key named after it with a `$` prefix, and the bags are shallow-merged with the entry's. Configuring a bag whose module isn't registered warns at `createVueform()` in development — the module list lives in [modules](/guide/modules#the-built-in-modules). `$devtools`, `$model`, `$theme`, and `$validation` exist but take no options yet.

### `!$autosave`

`storage` (`DraftStorage`) sets the default storage backend for drafts, `localStorage` where available. A form's own `draft.storage` wins. See [autosave](/guide/autosave#draft-options).

### `!$conditions`

`strict` (default `false`) switches structured conditions to strict comparisons — see [conditions](/guide/conditions#strict-comparisons). `debounce` (default `300`) is the delay in milliseconds before async conditional props re-evaluate — see [conditions](/guide/conditions#async-conditions).

### `!$date`

`adapter` is the date backend the [date module](/guide/date#the-date-adapter) requires — it throws on first use without one, and the pre-configured entries wire `nativeDateAdapter`. Writing your own is covered in [custom adapters](/guide/date#custom-adapters).

### `!$expression`

| Field | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | `false` switches the expression system off entirely. |
| `whitelist` | `['*']` | The prop keys that resolve expressions — fail-closed when unset. See [restriction levels](/guide/expressions#restriction-levels). |
| `localConsts` | `true` | Whether a form's `consts` prop counts. See [constants](/guide/expressions#constants). |
| `functions` | — | Custom expression functions. See [custom functions](/guide/expressions#custom-functions). |
| `consts` | — | Global expression constants. See [constants](/guide/expressions#constants). |
| `debug` | on in development | Warnings are logged unless set to `false`. See [debugging](/guide/expressions#debugging). |
| `adapter` | `pathExpressionAdapter` on the pre-configured entries | The expression engine. Without one the module stays inert with a dev warning. See [expr-eval](/plugins/expr-eval). |

### `!$http`

The defaults every request picks up — Vueform's own and your `useHttp()` calls alike:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseURL` | `string` | — | Base URL prepended to relative request URLs. |
| `headers` | `Record<string, string>` | `{}` | Headers sent with every request. |
| `timeout` | `number` | `0` (none) | Request timeout in milliseconds. |
| `requestType` | `RequestType` | `'json'` | Body encoding. |
| `responseType` | `ResponseType` | `'json'` | How the response body is parsed. |
| `withCredentials` | `boolean` | `false` | Include credentials in cross-origin requests. |
| `base64` | `boolean` | `false` | Convert `File`/`Blob` values to base64 in JSON bodies. |
| `defaultMethod` | `RequestMethod` | `'GET'` | Method when none is specified. |
| `onRequest` | `RequestInterceptor[]` | — | App-wide request interceptors. |
| `onResponse` | `ResponseInterceptor[]` | — | App-wide response interceptors. |
| `adapter` | `HttpAdapter` | `fetchHttpAdapter` on the pre-configured entries | The transport. Without one every request rejects. |

App-wide interceptors nest inside instance-registered ones — instance request → config request → adapter → config response → instance response — as [HTTP](/guide/http#interceptors) details. Per-request config overrides these defaults, and headers merge — see [HTTP](/guide/http#configuring-defaults).

### `!$locale`

`locales`, `locale`, `fallbackLocale`, and `localeParamPattern` override the [top-level keys](#internationalization) of the same name, and `adapter` (`LocaleAdapter`) replaces the whole locale backend. See [locales](/guide/locales#custom-locale-backend).

### `!$router`

`queryParam` encodes the current step into a query parameter (a form's `routerQueryParam` prop overrides it), `router` passes a vue-router instance — or `false` to disable auto-detection — and `adapter` replaces the built-in vue-router / `pushState` integration. The top-level `router` option is the same setting as `$router.router`, which wins when both are set; auto-detection reads the app's global `$router`. See [multi-page forms](/guide/multi-page-forms#vue-router-integration).

### `!$security`

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `sanitizer` | `(html: string) => string` | — | The HTML sanitization engine. See [HTML sanitization](/guide/security#html-sanitization). |
| `encrypt` | `(value, purpose) => string \| Promise<string>` | — | Encrypts values before features persist them. See [draft encryption](/guide/security#draft-encryption). |
| `decrypt` | same as `encrypt` | — | The inverse, applied when persisted values are read back. |
| `allowOrigins` | `string[]` | — | The origins requests may target — unset, any; set, the app's own origin plus the listed ones. See [request origins](/guide/security#request-origins). |
| `allowHtml` | `SecurityHtmlArea[]` | — | The areas where strings may render as HTML — unset, all of them; set, only the listed ones. See [HTML sanitization](/guide/security#html-sanitization). |
| `allowComponents` | `string[]` | — | The registered component names a schema string may resolve to — unset, all of them; set, only the listed ones. See [component names](/guide/security#component-names). |
| `allowProps` | `(string \| RegExp)[]` | — | The prop paths `path@prop` references may resolve — unset, all of them; set, only the matching ones. See [prop references](/guide/security#prop-references). |
| `banAttrs` | `(string \| RegExp)[]` | — | Keys dropped from every schema-reachable prop bag — unset, none beyond the built-in invariants. Strings match case-insensitively, and every entry is checked against both the original and the camelized key. See [banning attributes](/guide/security#banning-attributes). |

What to configure when schemas come from untrusted sources is covered in [security](/guide/security#untrusted-schemas).

## Runtime Behavior

### `globals`

- Type: `(context: GlobalsHookContext) => Partial<VueformGlobals> | void`

The hook extending the app's [globals](/guide/globals). It receives `{ config, globals }` and returns the members to add, running lazily the first time globals are read — after the entry's own hook and before plugins' hooks.

### `globalWarns`

- Type: `boolean`
- Default: `true`

Development warning when a `globals` hook overrides an existing member. See [globals](/guide/globals).

### `uid`

- Type: `() => string`
- Default: `() => useId()`

Generates the `id` of every form and element. It's called during their `setup()`, so composables such as `useId()` and `getCurrentInstance()` work inside it:

```ts
import { useId } from 'vue'

createVueform({
  uid: () => `order-${useId()}`,
})
```

The server/client constraints on custom generators are covered in [SSR](/guide/ssr#stable-ids).

### `lazy`

- Type: `boolean`
- Default: `true`

Element views mount at browser idle (`requestIdleCallback`, or a 300 ms timeout without it) or as soon as they become visible, while values, validation, and conditions register at mount regardless. `false` renders every element's DOM at mount — e.g. for DOM assertions in tests. See [performance](/guide/performance) and [testing](/guide/testing).

### `nativeEmit`

- Type: `boolean`
- Default: `false`

Switches component events from Vueform's event system to native Vue emits. The trade-offs are covered in [event handlers](/guide/event-handlers#falling-back-to-native-vue-emits).

### `devtools`

- Type: `boolean`
- Default: `true`

`false` switches the `@vueform/devtools` inspector off even in development. See [model](/guide/model#devtools).
