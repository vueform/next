---
outline: [2,3]
---

# Code-Splitting

Vueform is built so that its bundle cost is a choice. A schema names element types and validation rules as strings — `{ type: 'text', rules: 'required|email' }` — and strings resolve at runtime, so no bundler can look at your forms and work out which parts to drop. Instead of pretending tree-shaking works where it can't, Vueform makes the boundary explicit: **what you register is what you bundle**, and every part is importable on its own.

A **pre-configured entry** like `@vueform/ui/origin` registers everything: every component, module and rule, a [theme](/guide/themes-tokens), a locale. This chapter is about the alternative for when bundle size matters: a **modular setup** that starts from a bare core and registers only what your app uses — everything you leave out never makes it into the bundle.

The sections below walk through the parts one by one — [Modules](#modules), [Components](#components), [Rules](#rules), [Theme](#theme), [Locales](#locales) — with the measured size of each, and close with what the familiar [pre-configured entries](#pre-configured-entries) cost for comparison.

## Modular Setup

Import `createVueform` from the bare `@vueform/ui` entry and each part from its own subpath. Registering _everything_, as this example does, produces the exact same build as `@vueform/ui/origin` — the point is what you leave out:

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
}))

app.mount('#app')
```

Each subpath maps to one config option:

| Entry                    | Provides                                                                    | Config option                                   |
| ------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------- |
| `@vueform/ui/modules`    | The built-in [Modules](/guide/modules)                                      | [`modules`](/guide/configuration#modules)       |
| `@vueform/ui/components` | All [components](/components), also available as individual entries         | [`components`](/guide/configuration#components) |
| `@vueform/ui/rules`      | The built-in [validation rules](/guide/validation#built-in-rules-reference) | [`rules`](/guide/configuration#rules)           |
| `@vueform/ui/themes`     | The built-in [Themes](/guide/themes-tokens) and theme helpers               | [`theme`](/guide/configuration#theme)           |
| `@vueform/ui/locales`    | The shipped [Locales](/guide/locales)                                       | [`locales`](/guide/configuration#locales)       |

The bare entry registers nothing on its own. Its floor is <!-- @size:entry-core -->`4.63 kB`<!-- /@size --> gzipped, and the smallest _working_ build — core plus the required `model` module — lands at <!-- @size:entry-model -->`12.56 kB`<!-- /@size -->. Everything between that floor and the [full build](#pre-configured-entries) is your choice, made section by section below.

Note that only what's **registered through the config** — components, modules, rules, locales — needs these explicit choices. Everything you import by name in code — `defineSchema`, `useForm`, composables, helpers — tree-shakes like any ES module.

::: info How sizes are measured
Every size in this chapter is the **gzipped** amount the item adds to a production Vite build (default settings, esbuild minification), measured by the repository's [bundle-size suite](https://github.com/vueform/next/tree/main/bundle-size) with <!-- @size:measured-with -->`@vueform/ui@2.0.0`<!-- /@size -->. In tables with a **Total** row, each individual row shows what removing that item saves, while the Total is measured directly with everything registered — items share code, so the Total can exceed the sum of the rows. Values near zero (even slightly negative) are compression noise.
:::

## Modules

[Modules](/guide/modules) are Vueform's features — validation, conditions, HTTP, theming — packaged as self-contained units. In a modular setup you register the ones your app uses under `modules`:

```ts
import { createVueform } from '@vueform/ui'
import { model, validation, conditions } from '@vueform/ui/modules'

createVueform({
  modules: { model, validation, conditions },
})
```

`model` is the one module Vueform cannot run without — the data layer itself — and TypeScript enforces it: the bare entry's `createVueform` doesn't accept a config without `modules.model`. Every other module is optional and degrades predictably when left out — conditions count as met, validation counts as valid, and so on. See [Leaving a Module Out](/guide/modules#leaving-a-module-out) for what each absence means.

<!-- @bundle-sizes:modules start -->

| Module                                              | Size          |
| --------------------------------------------------- | ------------- |
| [`model`](/guide/model)                             | 7.95&nbsp;kB  |
| [`validation`](/guide/validation)                   | 7.01&nbsp;kB  |
| [`conditions`](/guide/conditions)                   | 2.27&nbsp;kB  |
| [`autosave`](/guide/autosave)                       | 1.70&nbsp;kB  |
| [`theme`](/guide/themes-tokens)                     | 1.46&nbsp;kB  |
| [`expression`](/guide/expressions)                  | 1.38&nbsp;kB  |
| [`router`](/guide/multi-page-forms#browser-history) | 0.67&nbsp;kB  |
| [`http`](/guide/http)                               | 0.44&nbsp;kB  |
| [`locale`](/guide/locales)                          | 0.36&nbsp;kB  |
| [`security`](/guide/security)                       | 0.19&nbsp;kB  |
| [`date`](/guide/date)                               | 0.17&nbsp;kB  |
| **Total**                                           | 23.37&nbsp;kB |

<!-- @bundle-sizes:modules end -->

## Components

Components resolve through the same runtime registry the schema uses, so unused ones can only stay out of the bundle by not being registered. Cherry-pick them by importing each one from its own entry:

```ts
import { createVueform } from '@vueform/ui'
import { model } from '@vueform/ui/modules'
import VfForm from '@vueform/ui/components/VfForm'
import VfElements from '@vueform/ui/components/VfElements'
import VfLayout from '@vueform/ui/components/VfLayout'
import VfAddon from '@vueform/ui/components/VfAddon'
import VfIcon from '@vueform/ui/components/VfIcon'
import VfText from '@vueform/ui/components/VfText'
import VfButton from '@vueform/ui/components/VfButton'

createVueform({
  modules: { model },
  components: {
    VfForm,
    VfElements,
    VfLayout,
    VfAddon,
    VfIcon,
    VfText,
    VfButton,
  },
})
```

The `@vueform/ui/components` barrel is the all-in counterpart — `import * as components` registers everything, as in the full setup above.

No CSS imports are needed: each component's entry carries exactly the stylesheet chunks its markup needs, which is why the tables below have a CSS column. Shared chunks are counted once, under whichever component pulls them in first — see [Themes & Tokens](/guide/themes-tokens#choosing-a-theme) for how styling ships.

### Internal Components

Vueform components render each other through the registry too, so a trimmed set must include the internals your forms reach, not just the element types you write:

- **Always**: `VfForm` renders its schema through `VfElements`, and every element wraps itself in `VfLayout`, which renders `VfAddon` and `VfIcon`. These five are the fixed companions of any form.
- `VfCheckboxes` and `VfRadios` render a `VfCheckbox` / `VfRadio` per item.
- `VfFile`, `VfList`, `VfMatrix`, and `VfNav` render `VfButton`.
- [Multi-page forms](/guide/multi-page-forms) need `VfSteps` or `VfTabs`, plus `VfNav`.
- [Multilingual forms](/guide/multilingual-inputs) need `VfLanguages`.

A component that's rendered but not registered surfaces as Vue's "Failed to resolve component" warning in development, with nothing rendered in its place.

### Component Sizes

All components together add <!-- @size:components-total-js -->`54.52 kB`<!-- /@size --> of JS and <!-- @size:components-total-css -->`6.52 kB`<!-- /@size --> of CSS, both gzipped — the per-component numbers below are what each contributes on top of the rest:

<!-- @bundle-sizes:components start -->

**Elements**

| Component                          | JS           | CSS           |
| ---------------------------------- | ------------ | ------------- |
| [`VfButton`](/ui/VfButton)         | 1.05&nbsp;kB | 1.00&nbsp;kB  |
| [`VfCheckbox`](/ui/VfCheckbox)     | 0.79&nbsp;kB | -0.01&nbsp;kB |
| [`VfCheckboxes`](/ui/VfCheckboxes) | 0.94&nbsp;kB | 0.00&nbsp;kB  |
| [`VfContent`](/ui/VfContent)       | 0.31&nbsp;kB | 0.04&nbsp;kB  |
| [`VfField`](/ui/VfField)           | 0.33&nbsp;kB | 0.00&nbsp;kB  |
| [`VfFile`](/ui/VfFile)             | 1.63&nbsp;kB | 0.04&nbsp;kB  |
| [`VfHidden`](/ui/VfHidden)         | 0.27&nbsp;kB | 0.00&nbsp;kB  |
| [`VfRadio`](/ui/VfRadio)           | 0.77&nbsp;kB | 0.00&nbsp;kB  |
| [`VfRadios`](/ui/VfRadios)         | 0.82&nbsp;kB | 0.00&nbsp;kB  |
| [`VfSelect`](/ui/VfSelect)         | 0.54&nbsp;kB | 0.12&nbsp;kB  |
| [`VfText`](/ui/VfText)             | 0.53&nbsp;kB | 0.08&nbsp;kB  |
| [`VfTextarea`](/ui/VfTextarea)     | 0.54&nbsp;kB | 0.04&nbsp;kB  |

**Containers**

| Component                  | JS           | CSS          |
| -------------------------- | ------------ | ------------ |
| [`VfForm`](/ui/VfForm)     | 5.96&nbsp;kB | 0.00&nbsp;kB |
| [`VfGrid`](/ui/VfGrid)     | 2.57&nbsp;kB | 0.00&nbsp;kB |
| [`VfGroup`](/ui/VfGroup)   | 0.46&nbsp;kB | 0.08&nbsp;kB |
| [`VfList`](/ui/VfList)     | 1.69&nbsp;kB | 0.17&nbsp;kB |
| [`VfMatrix`](/ui/VfMatrix) | 4.26&nbsp;kB | 0.18&nbsp;kB |

**Form components**

| Component                        | JS           | CSS          |
| -------------------------------- | ------------ | ------------ |
| [`VfElements`](/ui/VfElements)   | 0.15&nbsp;kB | 0.00&nbsp;kB |
| [`VfLanguages`](/ui/VfLanguages) | 0.41&nbsp;kB | 0.13&nbsp;kB |
| [`VfNav`](/ui/VfNav)             | 1.06&nbsp;kB | 0.07&nbsp;kB |
| [`VfSteps`](/ui/VfSteps)         | 0.17&nbsp;kB | 0.63&nbsp;kB |
| [`VfTabs`](/ui/VfTabs)           | 0.14&nbsp;kB | 0.12&nbsp;kB |

**Layout & internals**

| Component                  | JS           | CSS           |
| -------------------------- | ------------ | ------------- |
| [`VfAddon`](/ui/VfAddon)   | 0.34&nbsp;kB | 0.47&nbsp;kB  |
| [`VfCol`](/ui/VfCol)       | 0.73&nbsp;kB | 0.01&nbsp;kB  |
| [`VfIcon`](/ui/VfIcon)     | 0.14&nbsp;kB | -0.05&nbsp;kB |
| [`VfLayout`](/ui/VfLayout) | 3.15&nbsp;kB | 0.54&nbsp;kB  |
| [`VfRow`](/ui/VfRow)       | 0.28&nbsp;kB | 0.00&nbsp;kB  |

<!-- @bundle-sizes:components end -->

## Rules

Validation rules follow the same pattern: a rule referenced by name — `rules: 'required|email'` in a schema — must be registered under `rules`, or validation throws pointing at the missing name. Register only what your forms use:

```ts
import { createVueform } from '@vueform/ui'
import { model, validation } from '@vueform/ui/modules'
import { required, email, min } from '@vueform/ui/rules'

createVueform({
  modules: { model, validation },
  rules: { required, email, min },
})
```

Rules are the cheapest part of the framework: the complete built-in set adds <!-- @size:rules-total -->`3.15 kB`<!-- /@size --> gzipped, a single rule between <!-- @size:rules-min -->`0.19 kB`<!-- /@size --> and <!-- @size:rules-max -->`0.62 kB`<!-- /@size -->. Unless you're chasing every kilobyte, `import * as rules` is a perfectly reasonable default — trimming pays off in the other sections first. Rules only run when the `validation` module is registered; without it, they're dead weight.

::: details Per-rule sizes
<!-- @bundle-sizes:rules start -->

| Rule              | Size         |
| ----------------- | ------------ |
| `accepted`        | 0.21&nbsp;kB |
| `after`           | 0.45&nbsp;kB |
| `after_or_equal`  | 0.47&nbsp;kB |
| `alpha`           | 0.21&nbsp;kB |
| `alpha_dash`      | 0.22&nbsp;kB |
| `alpha_num`       | 0.21&nbsp;kB |
| `array`           | 0.19&nbsp;kB |
| `before`          | 0.45&nbsp;kB |
| `before_or_equal` | 0.47&nbsp;kB |
| `between`         | 0.26&nbsp;kB |
| `boolean`         | 0.21&nbsp;kB |
| `captcha`         | 0.21&nbsp;kB |
| `confirmed`       | 0.22&nbsp;kB |
| `date`            | 0.25&nbsp;kB |
| `date_equals`     | 0.22&nbsp;kB |
| `date_format`     | 0.28&nbsp;kB |
| `different`       | 0.29&nbsp;kB |
| `digits`          | 0.23&nbsp;kB |
| `digits_between`  | 0.25&nbsp;kB |
| `dimensions`      | 0.62&nbsp;kB |
| `distinct`        | 0.23&nbsp;kB |
| `email`           | 0.29&nbsp;kB |
| `file`            | 0.23&nbsp;kB |
| `filled`          | 0.20&nbsp;kB |
| `gt`              | 0.32&nbsp;kB |
| `gte`             | 0.32&nbsp;kB |
| `image`           | 0.29&nbsp;kB |
| `in`              | 0.23&nbsp;kB |
| `in_array`        | 0.27&nbsp;kB |
| `integer`         | 0.21&nbsp;kB |
| `ip`              | 0.47&nbsp;kB |
| `ipv4`            | 0.27&nbsp;kB |
| `ipv6`            | 0.40&nbsp;kB |
| `json`            | 0.20&nbsp;kB |
| `lt`              | 0.32&nbsp;kB |
| `lte`             | 0.32&nbsp;kB |
| `max`             | 0.25&nbsp;kB |
| `mimes`           | 0.29&nbsp;kB |
| `mimetypes`       | 0.29&nbsp;kB |
| `min`             | 0.25&nbsp;kB |
| `not_in`          | 0.22&nbsp;kB |
| `not_regex`       | 0.29&nbsp;kB |
| `nullable`        | 0.19&nbsp;kB |
| `numeric`         | 0.24&nbsp;kB |
| `regex`           | 0.26&nbsp;kB |
| `required`        | 0.20&nbsp;kB |
| `same`            | 0.28&nbsp;kB |
| `size`            | 0.24&nbsp;kB |
| `string`          | 0.19&nbsp;kB |
| `timezone`        | 0.23&nbsp;kB |
| `url`             | 0.45&nbsp;kB |
| `uuid`            | 0.22&nbsp;kB |
| **Total**         | 3.15&nbsp;kB |

<!-- @bundle-sizes:rules end -->

:::

## Theme

Styling is three separable pieces, each with its own cost:

1. **The `theme` module** — converts tokens to CSS variables and injects them into the page (<!-- @size:module-theme -->`1.46 kB`<!-- /@size --> gzipped, in the [Modules](#modules) table).
2. **The theme's tokens** — the JS token map passed to the `theme` option, selecting the look:

   ```ts
   import { createVueform } from '@vueform/ui'
   import { material as theme } from '@vueform/ui/themes'

   createVueform({
     theme,
     // ...
   })
   ```

<!-- @bundle-sizes:themes start -->

| Tokens                                              | Size         |
| --------------------------------------------------- | ------------ |
| [`origin`](/guide/themes-tokens#available-themes)   | 4.01&nbsp;kB |
| [`material`](/guide/themes-tokens#available-themes) | 4.01&nbsp;kB |

<!-- @bundle-sizes:themes end -->

3. **The stylesheets** — ship with the components themselves (the CSS column of the [component tables](#component-sizes)), never as a separate import. The CSS is identical across themes; only the token values differ.

## Locales

The bare entry registers no locale — you provide every locale your app offers and leave out the rest. When only one is registered it becomes the active one automatically:

```ts
import { createVueform } from '@vueform/ui'
import { de_DE } from '@vueform/ui/locales'

createVueform({
  locales: { de_DE },
})
```

<!-- @bundle-sizes:locales start -->

| Code    | Language     | Size         |
| ------- | ------------ | ------------ |
| `de_DE` | German       | 1.69&nbsp;kB |
| `en_US` | English (US) | 1.39&nbsp;kB |
| `hu_HU` | Hungarian    | 1.85&nbsp;kB |

<!-- @bundle-sizes:locales end -->

Registered locales are resolved by the `locale` **module** (<!-- @size:module-locale -->`0.36 kB`<!-- /@size --> gzipped, in the [Modules](#modules) table) — without it, built-in strings show their raw tags. See [Locales](/guide/locales) for the full localization story.

## Pre-Configured Entries

The pre-configured entries — `@vueform/ui/origin` and `@vueform/ui/material` — bundle the [modular setup](#modular-setup) with everything registered behind a single import: all components, all modules, all validation rules, the [theme](/guide/themes-tokens) the entry is named after, and the `en_US` locale:

```ts nolink=createVueform
import { createApp } from 'vue'
import App from './App.vue'
import { createVueform } from '@vueform/ui/origin'

const app = createApp(App)
app.use(createVueform())
app.mount('#app')
```

Everything registered means everything bundled: a pre-configured entry adds <!-- @size:entry-full -->`99.02 kB`<!-- /@size --> gzipped to a production build — <!-- @size:entry-full-js -->`92.50 kB`<!-- /@size --> of JS and <!-- @size:entry-full-css -->`6.52 kB`<!-- /@size --> of CSS. That is the ceiling: the complete framework, every element type, every rule, fully styled. If that's fine for your app — as it often is for form-heavy ones — there's nothing wrong with staying on a pre-configured entry: a modular setup registering everything produces the same build, just with more imports.
