---
outline: [2,3]
---

# Code-Splitting

A schema names element types and validation rules as strings — `{ type: 'text', rules: 'required|email' }` — and strings resolve at runtime, so no bundler can look at your forms and work out which parts they use. Vueform makes the boundary explicit instead. **What you register is what you bundle**, and every registrable part — component, module, rule, theme, locale — is importable on its own.

## The Full Bundle

The **Full Bundle** is Vueform with nothing left to assemble. A single `!createVueform` import from `@vueform/ui/bundle` registers everything — all components, modules, and validation rules, the [default theme](/guide/themes-tokens#choosing-a-theme), the `en_US` locale, and default adapters for HTTP, dates, and expressions.

Every size in this chapter is the **gzipped** amount the item adds to a production Vite build with default settings, measured with <!-- @size:measured-with -->`@vueform/ui@2.0.0-0.7`<!-- /@size --> by the repository's size suite (`pnpm size`); all published numbers are for the regular virtual-DOM builds. In tables with a **Total** row, each row shows what removing that one item saves, while the Total is measured directly — items share code, so the Total can exceed the sum of the rows, and values near zero or slightly negative are compression noise. CSS only counts in builds that register the `theme` module, so module, rule, and locale rows are JS-only.

## Modular Setup

A **Modular Setup** starts from the bare `@vueform/ui` entry, whose `createVueform` registers nothing by itself, and imports each part from its own subpath. This example registers everything, so every line of it is one thing you can leave out:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import {
  createVueform,
  fetchHttpAdapter,
  nativeDateAdapter,
  pathExpressionAdapter,
} from '@vueform/ui'
import { en_US } from '@vueform/ui/locales'
import * as components from '@vueform/ui/components'
import * as modules from '@vueform/ui/modules'
import * as rules from '@vueform/ui/rules'
import { primary as theme } from '@vueform/ui/themes'

const app = createApp(App)

app.use(createVueform({
  locales: { en_US },
  theme,
  components,
  modules,
  rules,
  $http: { adapter: fetchHttpAdapter },
  $date: { adapter: nativeDateAdapter },
  $expression: { adapter: pathExpressionAdapter },
}))

app.mount('#app')
```

Each subpath maps to one config option:

| Entry | Provides | Config option |
| --- | --- | --- |
| `@vueform/ui/modules` | The built-in [modules](/guide/modules). | [`modules`](/guide/configuration#modules) |
| `@vueform/ui/components` | All [components](/components), each also importable from its own entry. | [`components`](/guide/configuration#components) |
| `@vueform/ui/rules` | The built-in [validation rules](/rules/). | [`rules`](/guide/configuration#rules) |
| `@vueform/ui/themes` | The built-in [themes](/guide/themes-tokens). | [`theme`](/guide/configuration#theme) |
| `@vueform/ui/locales` | The shipped [locales](/guide/i18n#locales). | [`locales`](/guide/configuration#locales) |

### What the Bare Entry Leaves Out

The bare entry registers no components, modules, rules, theme, or locale — and it also wires no adapters, the part of the example above that's easiest to forget. Each adapter matters once its module is registered, and each costs only when wired:

- Without `$http.adapter`, every request the `http` module makes rejects with a "No `http` adapter is configured" error.
- Without `$date.adapter`, the `date` module throws on first use.
- Without `$expression.adapter`, expressions stay inert — even plain `{path}` interpolation — with a development warning.

All three defaults ship in `@vueform/ui`, as in the example. Swapping in custom ones is covered in [adapters and plugins](/guide/in-depth-modules#adapters-and-plugins).

### The Required Module

`model` is the one module the bare entry can't run without. The bare `createVueform`'s type doesn't accept a config without `modules.model`, and a config that slips one past TypeScript throws at `createVueform()`. The bare entry itself is <!-- @size:entry-core -->`4.26 kB`<!-- /@size --> gzipped, and the smallest working build — core plus `model` — lands at <!-- @size:entry-model -->`11.76 kB`<!-- /@size -->.

Only what's registered through the config needs these explicit choices. Anything you import by name — `defineSchema`, `useForm`, composables, helpers — tree-shakes like any ES module.

## Modules

[Modules](/guide/modules) package Vueform's features — validation, conditions, HTTP, theming — as self-contained units, registered under `modules`:

```ts
import { createVueform } from '@vueform/ui'
import { model, validation, conditions } from '@vueform/ui/modules'

createVueform({
  modules: { model, validation, conditions },
})
```

Every module except `model` is optional and degrades predictably when left out — see [leaving a module out](/guide/modules#leaving-a-module-out) for what each absence means.

<!-- @bundle-sizes:modules start -->

| Module | Size |
| --- | --- |
| [`model`](/guide/model) | 7.50&nbsp;kB |
| [`validation`](/guide/validation) | 5.99&nbsp;kB |
| [`conditions`](/guide/conditions) | 2.01&nbsp;kB |
| [`autosave`](/guide/autosave) | 1.98&nbsp;kB |
| [`theme`](/guide/themes-tokens) | 2.06&nbsp;kB |
| [`expression`](/guide/expressions) | 1.25&nbsp;kB |
| [`router`](/guide/multi-page-forms#browser-history) | 0.59&nbsp;kB |
| [`http`](/guide/http) | 0.97&nbsp;kB |
| [`i18n`](/guide/i18n) | 0.28&nbsp;kB |
| [`security`](/guide/security) | 1.60&nbsp;kB |
| [`date`](/guide/date) | 0.14&nbsp;kB |
| **Total** | 23.64&nbsp;kB |

<!-- @bundle-sizes:modules end -->

## Components

A schema resolves its components by name through Vue's global registry — `type: 'text'` renders the component registered as `VfText` — so unused components only stay out of the bundle by not being registered. Cherry-pick them by importing each from its own entry:

```ts
import { createVueform } from '@vueform/ui'
import { model } from '@vueform/ui/modules'
import VfForm from '@vueform/ui/components/VfForm'
import VfElements from '@vueform/ui/components/VfElements'
import VfLayout from '@vueform/ui/components/VfLayout'
import VfAddon from '@vueform/ui/components/VfAddon'
import VfIcon from '@vueform/ui/components/VfIcon'
import VfText from '@vueform/ui/components/VfText'

createVueform({
  modules: { model },
  components: { VfForm, VfElements, VfLayout, VfAddon, VfIcon, VfText },
})
```

`@vueform/ui/components` is the all-in barrel — `import * as components` registers everything, as in the [full setup](#modular-setup).

Importing a component's default entry brings in everything that component needs:

- **The component** — ready to register through `components`.
- **Its stylesheets** — exactly the chunks its markup needs, with chunks shared between components bundled once, so there are no CSS imports to manage; see [choosing a theme](/guide/themes-tokens#choosing-a-theme) for how styling ships.
- **Its type registrations** — the component joins Vue's `GlobalComponents`, so it type-checks in templates without a local import, and an element joins the `ControlRegistry`, so its schema `type` and props — `text` for `!VfText` — are known to schema-based forms.

When you want less than that, each entry has two leaner variants: <a id="component-entries"></a>

| Entry | Ships |
| --- | --- |
| `!@vueform/ui/components/VfText` | The component with its stylesheets. |
| `!@vueform/ui/components/VfText/unstyled` | The component without CSS, type registrations kept — for bringing your own styles. |
| `!@vueform/ui/components/VfText/raw` | No CSS and no global type registration (`ControlRegistry`, `GlobalComponents`). |

Under the `vapor` export condition every one of these entries resolves to its vapor build — see [Vapor](/guide/vapor).

### Internal Components

Components render each other by name too, so a trimmed set must include the internals your forms reach, not just the element types you write:

- Always — `VfForm` renders its schema through `VfElements`, and elements render inside `VfLayout`, which renders `VfAddon` and `VfIcon`.
- `VfCheckboxes` and `VfRadios` render a `VfCheckbox` / `VfRadio` per item.
- `VfFile`, `VfList`, `VfMatrix`, and `VfNav` render `VfButton`.
- [Multi-page forms](/guide/multi-page-forms) need `VfSteps` or `VfTabs`, plus `VfNav`.
- [Multilingual inputs](/guide/i18n#multilingual-inputs) need `VfLanguages`.

A component that's rendered but not registered surfaces as Vue's "Failed to resolve component" warning in development, with nothing rendered in its place.

### Component Sizes

All components together add <!-- @size:components-total-js -->`49.88 kB`<!-- /@size --> of JS and <!-- @size:components-total-css -->`6.58 kB`<!-- /@size --> of CSS, both gzipped — each row below is what that component adds on top of the rest:

<!-- @bundle-sizes:components start -->

**Elements**

| Component | JS | CSS |
| --- | --- | --- |
| [`VfButton`](/components/VfButton) | 1.10&nbsp;kB | 1.05&nbsp;kB |
| [`VfCheckbox`](/components/VfCheckbox) | 0.75&nbsp;kB | 0.00&nbsp;kB |
| [`VfCheckboxes`](/components/VfCheckboxes) | 0.77&nbsp;kB | -0.01&nbsp;kB |
| [`VfContent`](/components/VfContent) | 0.26&nbsp;kB | 0.04&nbsp;kB |
| [`VfField`](/components/VfField) | 0.36&nbsp;kB | 0.00&nbsp;kB |
| [`VfFile`](/components/VfFile) | 1.59&nbsp;kB | 0.04&nbsp;kB |
| [`VfHidden`](/components/VfHidden) | 0.27&nbsp;kB | 0.00&nbsp;kB |
| [`VfRadio`](/components/VfRadio) | 0.64&nbsp;kB | 0.00&nbsp;kB |
| [`VfRadios`](/components/VfRadios) | 0.59&nbsp;kB | 0.00&nbsp;kB |
| [`VfSelect`](/components/VfSelect) | 0.42&nbsp;kB | 0.12&nbsp;kB |
| [`VfText`](/components/VfText) | 0.42&nbsp;kB | 0.09&nbsp;kB |
| [`VfTextarea`](/components/VfTextarea) | 0.46&nbsp;kB | 0.04&nbsp;kB |

**Containers**

| Component | JS | CSS |
| --- | --- | --- |
| [`VfForm`](/components/VfForm) | 5.77&nbsp;kB | 0.00&nbsp;kB |
| [`VfGrid`](/components/VfGrid) | 2.32&nbsp;kB | 0.00&nbsp;kB |
| [`VfGroup`](/components/VfGroup) | 0.47&nbsp;kB | 0.08&nbsp;kB |
| [`VfList`](/components/VfList) | 1.58&nbsp;kB | 0.17&nbsp;kB |
| [`VfMatrix`](/components/VfMatrix) | 4.08&nbsp;kB | 0.18&nbsp;kB |

**Form components**

| Component | JS | CSS |
| --- | --- | --- |
| [`VfElements`](/components/VfElements) | 0.13&nbsp;kB | 0.00&nbsp;kB |
| [`VfLanguages`](/components/VfLanguages) | 0.38&nbsp;kB | 0.13&nbsp;kB |
| [`VfNav`](/components/VfNav) | 0.97&nbsp;kB | 0.07&nbsp;kB |
| [`VfSteps`](/components/VfSteps) | 0.17&nbsp;kB | 0.63&nbsp;kB |
| [`VfTabs`](/components/VfTabs) | 0.12&nbsp;kB | 0.12&nbsp;kB |

**Layout & internals**

| Component | JS | CSS |
| --- | --- | --- |
| [`VfAddon`](/components/VfAddon) | 0.31&nbsp;kB | 0.47&nbsp;kB |
| [`VfCol`](/components/VfCol) | 0.70&nbsp;kB | 0.00&nbsp;kB |
| [`VfIcon`](/components/VfIcon) | 0.13&nbsp;kB | -0.01&nbsp;kB |
| [`VfLayout`](/components/VfLayout) | 3.02&nbsp;kB | 0.55&nbsp;kB |
| [`VfRow`](/components/VfRow) | 0.26&nbsp;kB | 0.00&nbsp;kB |

<!-- @bundle-sizes:components end -->

## Rules

A rule referenced by name — `rules: 'required|email'` — must be registered under `rules`, or validation throws naming the missing rule:

```ts
import { createVueform } from '@vueform/ui'
import { model, validation } from '@vueform/ui/modules'
import { required, email, min } from '@vueform/ui/rules'

createVueform({
  modules: { model, validation },
  rules: { required, email, min },
})
```

Rules are the cheapest part of the framework. The complete built-in set adds <!-- @size:rules-total -->`3.19 kB`<!-- /@size --> gzipped and a single rule costs between <!-- @size:rules-min -->`0.17 kB`<!-- /@size --> and <!-- @size:rules-max -->`0.60 kB`<!-- /@size -->, so `import * as rules` is a reasonable default — trimming pays off in the other sections first. Rules only run with the `validation` module registered. Each rule's measured size is listed on its [reference page](/rules/), in the **Bundle size** row.

## Theme

The cost of styling splits three ways. The `theme` module (<!-- @size:module-theme -->`2.06 kB`<!-- /@size --> gzipped, in the [modules](#modules) table) converts the theme's tokens to CSS variables and injects them. The theme itself contributes its token map, selected through the `theme` option — see [choosing a theme](/guide/themes-tokens#choosing-a-theme):

<!-- @bundle-sizes:themes start -->

| Tokens | Size |
| --- | --- |
| [`primary`](/guide/themes-tokens#available-themes) | 3.95&nbsp;kB |
| [`material`](/guide/themes-tokens#available-themes) | 3.95&nbsp;kB |

<!-- @bundle-sizes:themes end -->

The third piece — the component stylesheets — ships with the components themselves and is already counted in the CSS column of the [component tables](#component-sizes). To leave it out and bring your own styles, import the components through their [`/unstyled` entries](#component-entries).

## Locales

The bare entry registers no locale, so ship only the ones your app offers — registration and how the active locale is picked are covered in [registering locales](/guide/i18n#locales).

<!-- @bundle-sizes:locales start -->

| Code | Language | Size |
| --- | --- | --- |
| `de_DE` | German | 1.57&nbsp;kB |
| `en_US` | English (US) | 1.28&nbsp;kB |
| `hu_HU` | Hungarian | 1.72&nbsp;kB |

<!-- @bundle-sizes:locales end -->

Locale strings resolve through the `i18n` module (<!-- @size:module-i18n -->`0.28 kB`<!-- /@size --> gzipped, in the [modules](#modules) table) — see [leaving a module out](/guide/modules#leaving-a-module-out) for what its absence means.

## What the Full Bundle Costs

Registering everything, as the [Full Bundle](#the-full-bundle) does, adds <!-- @size:entry-full -->`92.83 kB`<!-- /@size --> gzipped to a production build — <!-- @size:entry-full-js -->`86.25 kB`<!-- /@size --> of JS and <!-- @size:entry-full-css -->`6.58 kB`<!-- /@size --> of CSS. That's the ceiling the sections above chip away at; the floor — core plus `model` — is <!-- @size:entry-model -->`11.76 kB`<!-- /@size -->. Everything between the two is a choice you make per part.
