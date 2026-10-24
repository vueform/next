---
outline: [2,3]
---

# Plugins

A plugin is a function that returns a definition of hooks, and that one definition extends Vueform at two levels in a single distributable import. At the instance level it adjusts configuration and registries before anything is built; at the component level it adds props, events, and setup logic to every component it targets. The official packages — [`@vueform/expr-eval`](/plugins/expr-eval), [`@vueform/dompurify`](/plugins/dompurify), [`@vueform/devtools`](/plugins/devtools), and the PrimeVue entry's bundled tooltip and info-icon plugins — are built from exactly the same surface your app gets.

## Defining a Plugin

`!definePlugin` takes a factory that returns the plugin's definition and returns that factory unchanged — an identity helper that exists for typing (it only throws when handed something that isn't a function). The factory's parameters are the plugin's options, available in every hook through the closure:

```ts
import { definePlugin } from '@vueform/ui'

const myPlugin = definePlugin((options: { debounce?: number } = {}) => ({
  name: 'my-plugin',
  apply: 'VfText',
  extend(props, api) {
    // `options` is in scope in every hook
  },
}))
```

The definition is made up of these keys:

| Key | Runs | Purpose |
| --- | --- | --- |
| `name` | — | A label for your own debugging — Vueform never reads it, and nothing deduplicates by it, so registering the same plugin twice runs it twice. |
| `apply` | — | Selects the components `props`, `emits`, and `extend` attach to — see [targeting components](#targeting-components). |
| `props` / `emits` | Inside `createVueform()` | Merged onto every matching component — see [adding props and emits](#adding-props-and-emits). |
| `extend(props, api)` | Inside each matching component's `setup()` | Adds setup logic and extra context members — see [extending components](#extending-components). |
| `config(config)` | Once, inside `createVueform()` | Writes the resolved configuration — see [modifying global configuration](#modifying-global-configuration). |
| `globals({ config, globals })` | Once, the first time the instance's globals are read | Returns members merged into the app's [globals](/guide/globals#globals-from-plugins). |
| `install({ app, vueform })` | At `app.use()`, once per app | App-side effects, like registering a directive — see [app-side effects](#app-side-effects). |
| `plugins` | Depth-first, right after their parent | Nested child plugins — see [composing plugins](#composing-plugins). |

Without `apply`, `props`, `emits`, and `extend` attach nowhere, so a config-only plugin simply leaves it out. The full signature lives on the [`definePlugin`](/api/helpers/definePlugin) API page.

## Registering Plugins

Pass **called** plugins to the `plugins` option of `createVueform` — with options, or with no arguments:

```ts
createVueform({
  plugins: [myPlugin({ debounce: 300 })],
})
```

Passing the factory uncalled (`plugins: [myPlugin]`) is silently ignored, because a bare function carries none of the hook keys — it's the most likely registration mistake.

Plugins run in a fixed order. Plugins bundled by the entry run first (the PrimeVue entry ships two), then the `plugins` array in order, and nested `plugins` run depth-first, right after their parent. Every hook follows this order, so a `config` hook sees everything earlier hooks wrote — which is how a downstream plugin layers on an upstream one.

## Targeting Components

`apply` decides where `props`, `emits`, and `extend` attach:

| `apply` | Matches |
| --- | --- |
| `'VfText'` | The component with that name. |
| `['VfText', /Checkbox/]` | Any entry of the array — names and RegExps can mix. |
| `'*'` | Every component. |
| `'*element'` | Every component flagged `element: true`. |
| `/^VfText/` | Every component whose name matches the RegExp. |
| `(component) => boolean` | A predicate called with the component definition. |

`'*element'` covers the form elements only — `!VfForm`, `VfTabs`, `VfSteps`, `VfLayout`, and the other structural components are excluded. The predicate receives the component definition, most usefully its `name` and `element` flag:

```ts
apply: (component) => component.element === true && component.name !== 'VfMatrix'
```

A plugin's reach is the instance's registered components. `props` and `emits` merge into per-instance copies of them, so they apply wherever components resolve by name — schema `type`s and globally registered tags — and never mutate the imported definitions or leak into another `createVueform()` instance. A component you import and register locally is the original definition and doesn't receive them.

## Adding Props and Emits

`props` and `emits` merge into every matching component before the components are registered with Vue, so they behave like native ones — they work in schemas and templates alike and go through Vue's prop validation. Each `props` entry uses Vue's `ComponentPropsOptions` shape:

```ts
import { definePlugin } from '@vueform/ui'

export default definePlugin(() => ({
  name: 'prefix',
  apply: 'VfText',
  props: {
    prefix: { type: String, default: '' },
  },
  emits: ['prefixClick'],
}))
```

```vue
<VfText name="amount" label="Amount" prefix="$" />
```

Declaring only extends the interface. Reading the prop and firing the event happen in `extend` — `api.fire('prefixClick', e)` reaches `@prefix-click` template handlers and programmatic listeners alike, through the pipeline [firing events](/guide/event-handlers#firing-events) describes. See [extending components](#extending-components).

Slots, parts, and classes need no runtime declaration at all — a custom template introduces them, and the plugin ships that template [as a default](/guide/templates#globally-as-a-default) through its `config` hook, typed as [typing new keys](/guide/templates#typing-new-keys) shows. TypeScript doesn't see plugin props and emits either, until you declare them — see [augmenting types](#augmenting-types).

## Extending Components

`extend(props, api)` runs inside each matching component's `setup()`, after the component has built its API — the blueprint setup plus the SFC's own extension callback. It is effectively a second setup function, so refs, computeds, watchers, lifecycle hooks, and composables all work:

```ts
import { definePlugin } from '@vueform/ui'

export default definePlugin(() => ({
  name: 'change-log',
  apply: '*element',
  extend(props, api) {
    api.on('change', (newValue, oldValue) => {
      console.log(`${props.name} changed:`, newValue)
    })
  },
}))
```

The `props` argument is the instance's raw Vue props — what was passed plus each declaration's own `default`. Config [defaults](/guide/defaults), [presets](/guide/presets), and [dynamic prop](/guide/dynamic-props) resolution are not applied to it.

The `api` argument is the component's internal API, not the public context. Reactive members stay refs — an element's value reads as `api.value.value` — and the event helpers are merged in (`on`, `off`, `onBefore`, `onAfter`, `fire`, `fireAsync`), which makes `api.on()` the plugin's way to react to component events — see [hooks for plugins](/guide/event-handlers#hooks-for-plugins).

What `api` lacks are the template-facing members. `classes`, `parts`, `bindings`, `outlets`, and the resolved `props` are not on it. Calling `!useContext` inside `extend` returns the component's public context, which serves the resolved props right away and receives the rest once setup finishes — so read those lazily, in a computed, watcher, or lifecycle hook.

### Returning Extra Properties

Whatever `extend` returns is merged into the component's API and from there onto its public context, so template refs, `form$.find()`, event handlers, and custom templates all reach it:

```ts
import { computed } from 'vue'
import { definePlugin } from '@vueform/ui'

export default definePlugin(() => ({
  name: 'reversible',
  apply: 'VfText',
  extend(props, api) {
    const reversed = computed(() =>
      String(api.value.value ?? '').split('').reverse().join('')
    )

    return { reversed }
  },
}))
```

With this registered, `form$.find('email')?.reversed` reads the member on the element's [context](/guide/context#element-context).

Returned members land on the context after setup, not on the `api` argument of later plugins — each plugin receives the same pre-built object, while direct mutations of it are shared. A returned key with an existing name replaces that member on the context only; the component's internal logic keeps calling the original, so anything relying on the original has to be overridden as well. Prefer new keys.

Typing the returned members goes through the component's `Expose` interface — see [augmenting types](#augmenting-types).

## Modifying Global Configuration

`config(config)` runs once inside `createVueform()`, after the user's config is merged over the entry defaults, and before plugin `props` / `emits` merge and before the modules are created. It is the only hook that should write the config — after install the resolved config is deep-frozen in development, so a late write throws (see [two phases](/guide/vueform-instance#two-phases)).

User values are already in place when the hook runs, so a plugin can enforce an option or — preferably — fill it only when unset:

```ts
import { definePlugin } from '@vueform/ui'

export default definePlugin(() => ({
  name: 'locale-fallback',
  config(config) {
    config.fallbackLocale ||= 'en_US'
  },
}))
```

Config is for static install-time values. Reactive state the app should share belongs in [globals](/guide/globals).

### Adding Configuration Options

A plugin can introduce its own top-level config key, which consumers set through `createVueform`. Don't prefix it with `$` — `$`-keys are [module option bags](/guide/modules), and a `$`-key without a registered module triggers a dev warning. Fill the defaults in the `config` hook so the key is always defined, and read it with `useConfig()` (or `$config` on any [context](/guide/context)) at runtime:

```ts
import { definePlugin, useConfig } from '@vueform/ui'

export default definePlugin(() => ({
  name: 'analytics',
  apply: '*element',
  config(config) {
    config.analytics = { apiKey: '', ...config.analytics }
  },
  extend(props, api) {
    const { apiKey } = useConfig().analytics
    // …
  },
}))
```

```ts
createVueform({
  plugins: [analytics()],
  analytics: { apiKey: 'pk_live_123' },
})
```

Typing the new key is covered in [plugin configuration](#plugin-configuration).

### Extending the Registries

Every registry on the config can be extended the same way. Always merge into the existing entry, because the user and other plugins may have written the same keys:

```ts
import { createRule, definePlugin } from '@vueform/ui'
import VfRating from './VfRating.vue'
import CheckboxCard from './CheckboxCard.vue'

const even = createRule('even', (value) => Number(value) % 2 === 0)

export default definePlugin(() => ({
  name: 'ui-pack',
  config(config) {
    config.rules = { ...config.rules, even }
    config.components = { ...config.components, VfRating }
    config.defaults = {
      ...config.defaults,
      VfCheckbox: { ...config.defaults.VfCheckbox, template: CheckboxCard },
    }
  },
}))
```

Rules created with `!createRule` become available by name in every `rules` prop, exactly as if the app had [registered them](/guide/validation#registering-rules-globally). Components added to `components` need a `name` and behave like built-ins — and because plugin `props` / `emits` merge after every `config` hook, other plugins can target them too; [components](/guide/components) covers building them. The merged component [defaults](/guide/defaults) are built lazily from the final config, so writes here count.

Modules and adapter slots are registries too. The modules are created after the `config` hooks run, so a plugin can fill `$http.adapter`, `$date.adapter`, or `$expression.adapter`, or add an entry to `config.modules`. The official plugins work exactly this way — `@vueform/expr-eval` fills the expression adapter only when unset, and `@vueform/devtools` registers its module. See [adapters and plugins](/guide/modules#adapters-and-plugins).

Every other config key is listed in [configuration](/guide/configuration).

## Contributing Globals

A `globals` hook receives `{ config, globals }` and returns members merged into the app's globals, after the app's own hook and in plugin order. The contract, merge order, override warning, and typing all live in [globals from plugins](/guide/globals#globals-from-plugins).

## App-Side Effects

`install({ app, vueform })` runs at `app.use()`, after the instance is provided, the modules' install hooks have run, and the components are registered — once per app the instance is installed into. It's the place for app-level registrations, like the PrimeVue entry's tooltip directive:

```ts
import { definePlugin } from '@vueform/ui'
import { vTooltip } from './directives'

export default definePlugin(() => ({
  name: 'tooltip',
  install({ app }) {
    if (!app.directive('tooltip')) {
      app.directive('tooltip', vTooltip)
    }
  },
}))
```

The full install pipeline lives in [two phases](/guide/vueform-instance#two-phases).

## Composing Plugins

The `plugins` key nests child plugins, which is how several extensions ship as one import:

```ts
import { definePlugin } from '@vueform/ui'
import exprEval from '@vueform/expr-eval'
import dompurify from '@vueform/dompurify'

export default definePlugin(() => ({
  name: 'company-kit',
  plugins: [exprEval(), dompurify()],
  config(config) {
    config.$expression = {
      ...config.$expression,
      consts: { ...config.$expression.consts, BRAND: 'Acme' },
    }
  },
}))
```

Children's `config`, `props` / `emits`, `globals`, and `install` hooks always run, depth-first right after their parent's. Their `extend` is different — it runs only on components the parent's `apply` also matches, so a parent without `apply` never runs a child's `extend`. Give children their own targeting, and give the parent an `apply` that covers all of them.

There is no deduplication by `name`, so registering a bundle and one of its children separately runs that child twice.

## Augmenting Types

A plugin's runtime additions are invisible to TypeScript until declared through module augmentation. Put the `declare module` block in the plugin's own source file — it ships with the plugin's types and applies wherever the plugin is imported. Each kind of addition has its interface:

| Addition | Interface |
| --- | --- |
| Props | `Vf*Props` |
| Emits | `Vf*Emits` — labeled tuples of the handler's arguments |
| Members returned from `extend` | `Vf*Expose` |
| A custom config key | `VueformConfig` |
| Globals | `VueformGlobals` — see [typing globals](/guide/globals#typing-globals) |
| Slots, parts, and classes from a shipped template | `Vf*Slots` / `Vf*Parts` / `Vf*Classes` — see [typing new keys](/guide/templates#typing-new-keys) |
| State attributes registered through `useBindings` | `Vf*Bindings` — part-keyed attribute bags, see [state attributes](/guide/parts#state-attributes) |

### A Single Component

For a named `apply`, augment the target's interfaces from its own module path, next to the `definePlugin` call. Here the plugin from the earlier sections declares its `prefix` prop, `prefixClick` emit, and `reversed` expose member:

```ts
import { definePlugin } from '@vueform/ui'
import type { ComputedRef } from 'vue'

declare module '@vueform/ui/components/VfText' {
  interface VfTextProps {
    prefix?: string
  }

  interface VfTextEmits {
    prefixClick: [e: MouseEvent]
  }

  interface VfTextExpose {
    reversed: ComputedRef<string>
  }
}

export default definePlugin(() => ({
  name: 'prefix',
  apply: 'VfText',
  props: { prefix: { type: String, default: '' } },
  emits: ['prefixClick'],
  extend(props, api) {
    // …
  },
}))
```

`VfTextProps`, `VfTextEmits`, and `VfTextSlots` give every type parameter a default, so the augmentation may omit the parameter list — unless a member references a parameter, in which case repeat the list verbatim. The per-interface recipes live in [extending the types](/guide/components#extending-the-types).

With the augmentation in place, `prefix` type-checks like a native prop in templates and schemas, `@prefix-click` and `on('prefixClick')` know their arguments, and `reversed` is typed on the resolved context.

### All Components or Elements

For `'*'` or `'*element'`, augment the shared base interfaces in `@vueform/core` instead of each component:

| Target | Interfaces |
| --- | --- |
| `'*'` | `BaseComponentProps`, `BaseComponentEmits`, `BaseComponentSlots`, `BaseComponentParts`, `BaseComponentClasses`, `BaseComponentExpose` |
| `'*element'` | `BaseElementProps`, `BaseElementEmits`, `BaseElementSlots`, `BaseElementParts`, `BaseElementClasses`, `BaseElementExpose` |

Each `BaseElement*` interface extends its `BaseComponent*` counterpart, so a `'*element'` plugin augments the element row only. `BaseComponentProps<S, P, C, TContext>` and `BaseElementProps<T extends string, S, P, C, TContext>` have type parameters without defaults, so their augmentations must repeat the parameter names and constraints (the defaults may be left out); the other base interfaces are non-generic or fully defaulted:

```ts
declare module '@vueform/core' {
  interface BaseElementProps<T extends string, S, P, C, TContext> {
    autoFocus?: boolean
  }

  interface BaseElementExpose {
    pluginMethod: () => void
  }
}
```

### Plugin Configuration

A [custom config key](#adding-configuration-options) augments `VueformConfig` in `@vueform/core`:

```ts
export type AnalyticsOptions = {
  apiKey: string
}

declare module '@vueform/core' {
  interface VueformConfig {
    analytics: AnalyticsOptions
  }
}
```

The `createVueform` options type is a partial of `VueformConfig`, so consumers may omit the key — while `useConfig()` reads it as always defined, because the plugin's `config` hook fills it.
