---
outline: [2,3]
---

# Plugins

A plugin is a reusable extension that hooks into Vueform at the global level. The same mechanism that powers the official plugin packages is available to your application: use it to mutate configuration, add validation rules, register components, augment existing components with extra props and behavior, or bundle any combination into one distributable.

Plugins run in two phases:

- **Install time** — once, as `createVueform()` builds the instance and `app.use()` installs it. Plugins mutate the global config (modules, rules, components, presets, …), populate [Globals](/guide/globals), merge extra props and emits onto matching components, and run app-side effects such as registering a directive.
- **Runtime** — once per matching component instance, right after the component builds its own API. Plugins read the props and the component's API, run setup logic (refs, watchers, lifecycle hooks, composables), and optionally return extra properties merged onto it.

## Defining a Plugin

Every plugin is a **function** — calling it produces the definition Vueform consumes, so all plugins register the same way whether or not they take options. `definePlugin` creates one from a factory returning the definition:

```ts
import { definePlugin } from '@vueform/ui'

const myPlugin = definePlugin(() => ({
  name: 'my-plugin',
  apply: 'VfText',
  props: {
    myProp: { type: String },
  },
  emits: ['myEvent'],
  extend(props, api) {
    /* runtime logic */
  },
  config(config) {
    /* mutate global config */
  },
  globals({ config, globals }) {
    /* return globals members */
  },
  install({ app, vueform }) {
    /* app-side effects, e.g. registering a directive */
  },
}))
```

The factory's parameters become the plugin's options, available in every hook through the closure:

```ts
const myPlugin = definePlugin((options: { debounce?: number } = {}) => ({
  name: 'my-plugin',
  apply: 'VfText',
  extend(props, api) {
    /* use options.debounce */
  },
}))
```

Every definition key is optional — declare only the hooks you need:

| Option    | Phase             | Purpose                                                                                                                     |
| --------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `name`    | —                 | Identifies the plugin (debugging, deduplication).                                                                           |
| `apply`   | Install + Runtime | Selects which components the plugin targets.                                                                                |
| `props`   | Install           | Extra props merged onto every matching component.                                                                           |
| `emits`   | Install           | Extra emit names merged onto every matching component.                                                                      |
| `extend`  | Runtime           | Runs inside each matching component's `setup()`, receiving `(props, api)`.                                                  |
| `config`  | Install           | Mutates the global `VueformConfig`.                                                                                         |
| `globals` | Install           | Returns members merged into the [Globals](/guide/globals) context. Receives `{ config, globals }`.                          |
| `install` | Install           | App-side effects when the instance is installed into a Vue app — e.g. registering a directive. Receives `{ app, vueform }`. |
| `plugins` | Recursive         | Nested plugins applied with the same rules.                                                                                 |

## Registering Plugins

Pass plugins to `createVueform` via the `plugins` option. A plugin is always registered by **calling** it — with options when it takes any, without arguments otherwise:

```ts
import { createVueform } from '@vueform/ui/origin'
import myPlugin from './myPlugin'

app.use(
  createVueform({
    plugins: [myPlugin({ debounce: 300 })], // [!code highlight]
  })
)
```

Array order is execution order — later plugins see the mutations of earlier ones, which is how a downstream plugin layers on top of an upstream one.

A plugin can also be registered imperatively before `app.use()`:

```ts
const vueform = createVueform({ /* ... */ })

vueform.use(myPlugin()) // [!code highlight]

app.use(vueform)
```

Both forms are equivalent. Registering after `app.use()` throws — by then the install pipeline has already run.

## Targeting Components

The `apply` option decides where `props`, `emits`, and `extend` attach:

| Form                       | Matches                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `'VfText'`                 | A single component by name.                                                                        |
| `['VfText', 'VfTextarea']` | Any of the listed names.                                                                           |
| `'*'`                      | Every registered component.                                                                        |
| `'*element'`               | Every component flagged as an element — excludes structural components like `!VfForm` and `VfTabs`. |
| `/pattern/`                | Any component whose name matches the regex.                                                        |
| `(component) => boolean`   | A predicate over the component definition.                                                         |

The predicate receives the candidate component's definition — most usefully its `name` and its `element` flag (`true` for Vueform elements):

```ts
const myPlugin = definePlugin(() => ({
  apply: (component) =>
    component.element === true && component.name !== 'VfMatrix',
  extend(props, api) {
    /* ... */
  },
}))
```

## Adding Props and Emits

`props` and `emits` merge into every matching component **before** Vue registers the components globally, so from the user's perspective the additions are indistinguishable from native ones — they work in schema and template syntax alike and go through Vue's normal prop validation:

```ts
const myPlugin = definePlugin(() => ({
  apply: 'VfText',
  props: {
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
  },
  emits: ['prefixClick'],
}))
```

```vue
<VfText name="amount" label="Amount" prefix="$" suffix="USD" />
```

Each `props` entry follows Vue's [`ComponentPropsOptions`](https://vuejs.org/api/options-state.html#props) shape — a constructor, an array of constructors, or an object with `type`, `default`, `required`, and `validator`. Declaring props and emits only extends the interface; to _read_ them or _react_ at runtime, pair them with `extend`. The additions are invisible to TypeScript on their own — declare them once more on the type level, see [Augmenting Types](#augmenting-types).

## Adding Slots, Parts, and Classes

Unlike props and emits, slots, parts, and classes need **no runtime declaration** in the plugin — outlets resolve any slot the user fills, and `context.parts` / `context.classes` resolve any key the user supplies. New ones come into existence simply by a custom [template](/guide/templates) rendering them, which is also how a plugin ships them (registering the template as a default via `config`). The only missing piece is the typing: augment the component's `Slots`, `Parts`, and `Classes` interfaces — see [Augmenting Types](#augmenting-types).

## Extending Components

The `extend(props, api)` hook runs inside each matching component's `setup()`, right after the component builds its own API. It's effectively a **second setup function**: refs, computeds, watchers, lifecycle hooks, and composables all work:

```ts
import { onMounted } from 'vue'
import { definePlugin } from '@vueform/ui'

const myPlugin = definePlugin(() => ({
  apply: 'VfText',
  props: {
    autoFocus: { type: Boolean, default: false },
  },
  extend(props, api) {
    onMounted(() => {
      if (props.autoFocus) api.focus()
    })
  },
}))
```

The first argument is the component's **props** (typed to the target when `apply` names a known component). The second — `api` — is the component's [Context](/guide/context) in its raw form: unlike the public context templates and event handlers receive, reactive members are kept as refs here (read them with `.value`, as with the element's `api.value` ref above).

::: info Classes and parts resolve later
At the time `extend` runs, the `api` carries the component's own members and event helpers — the resolved `classes` and `parts` are layered on afterwards by the rendering component and aren't visible to plugins.
:::

### Returning Extra Properties

Whatever `extend` returns is merged into the component's API. This is the supported way to add state or behavior that everything holding the component's context — template refs, `form$.find()`, event handlers, custom templates — can reach:

```ts
import { computed } from 'vue'
import { definePlugin } from '@vueform/ui'

const myPlugin = definePlugin(() => ({
  apply: 'VfText',
  extend(props, api) {
    const reversed = computed(() =>
      String(api.value.value ?? '').split('').reverse().join('')
    )

    return { reversed }
  },
}))
```

```ts
form$.find('email')?.reversed
```

::: warning
A returned key with the **same name** as an existing API property overrides it. That works — but it makes the component's behavior depend on which plugins are installed and in what order. Prefer adding new keys over replacing existing ones, and reserve overrides for cases where the benefit clearly outweighs the surprise.
:::

Returned members are typed by augmenting the component's `Expose` interface — see [Augmenting Types](#augmenting-types).

## Modifying Global Configuration

The `config(config)` hook receives the merged [Configuration](/guide/configuration) object before anything is instantiated. Use it for static, install-time values; for reactive app state use [`globals`](#populating-globals) instead.

User values reach `config` before plugin hooks run, so a plugin can either **enforce** an option or **fill it in** only when unset — prefer the latter where possible:

```ts
const myPlugin = definePlugin(() => ({
  config(config) {
    config.fallbackLocale ??= 'en_US'
  },
}))
```

### Adding Configuration Options

A plugin can introduce its own config key for consumers to set through `createVueform` (the `$` prefix is reserved for module configs — don't use it for plugin keys). Set defaults in the hook so the key is always defined:

```ts
import { definePlugin, useConfig } from '@vueform/ui'

const myPlugin = definePlugin(() => ({
  apply: 'VfText',
  config(config) {
    config.myPlugin = {
      apiKey: config.myPlugin?.apiKey ?? '',
    }
  },
  extend(props, api) {
    const config = useConfig()

    if (config.myPlugin.apiKey) {
      /* use the key */
    }
  },
}))
```

```ts
createVueform({
  plugins: [myPlugin()],
  myPlugin: {
    apiKey: 'abc123',
  },
})
```

`useConfig()` returns the same resolved object anywhere in the Vueform tree. See [Typing Plugin Configuration](#typing-plugin-configuration) for making the custom key type-safe.

### Extending the Registries

Rules, components, defaults, presets, class overrides — every registry on the config can be extended. Always **merge** into the existing entry; other plugins and the user's own config may have written to the same keys:

```ts
import { definePlugin, createRule } from '@vueform/ui'
import VfRating from './components/VfRating.vue'
import MyCheckboxTemplate from './components/MyCheckboxTemplate.vue'

const even = createRule('even', (value) => Number(value) % 2 === 0)

const myPlugin = definePlugin(() => ({
  config(config) {
    config.rules = { ...config.rules, even }
    config.components = { ...config.components, VfRating }

    config.defaults['*element'] = {
      ...config.defaults['*element'],
      columns: 6,
    }

    config.defaults.VfCheckbox = {
      ...config.defaults.VfCheckbox,
      template: MyCheckboxTemplate,
    }

    config.presets = {
      ...config.presets,
      compact: { $apply: '*element', columns: 6 },
    }
  },
}))
```

Components registered this way behave exactly like built-ins — usable by `type` in schemas, targetable by other plugins, themeable. See [Components](/guide/components) for building them, and [Configuration](/guide/configuration) for everything else `config` can touch.

## Populating Globals

The `globals` hook populates the app-wide [Globals](/guide/globals) context — the home for reactive state and shared helpers, read anywhere with `useGlobals()`. It receives `{ config, globals }` — the resolved config and a read-only view of the globals accumulated so far — and returns the members to add:

```ts
import { ref, computed } from 'vue'
import { definePlugin, useGlobals } from '@vueform/ui'

const myPlugin = definePlugin(() => ({
  globals({ config, globals }) {
    const activeFormId = ref(null)

    return {
      activeFormId,
      isEditing: computed(() => activeFormId.value !== null),
    }
  },
  extend(props, api) {
    const globals = useGlobals()

    if (globals.isEditing.value) {
      /* react to shared state */
    }
  },
}))
```

**Config vs globals:** both are readable everywhere (`useConfig()` / `useGlobals()`), but they carry different things. Config holds static install-time values — options, registries, adapters. Globals hold dynamic state — refs, computeds, methods, cross-form coordination. If it's set once and rarely changes, it's config; if it's reactive or does something, it's globals.

The app's own `globals` callback (in `createVueform`) runs first; plugin hooks run after, in registration order — plugins extend what the app provides. Globals members are typed by augmenting the `VueformGlobals` interface — see [Typing Globals](#typing-globals).

## Composing Plugins

The `plugins` field nests child plugins, which go through every install-phase walker and the runtime `extend` walker recursively. This is the canonical way to ship several related extensions as one package:

```ts
import { definePlugin } from '@vueform/ui'
import exprEval from '@vueform/expr-eval'
import dompurify from '@vueform/dompurify'

const myAppPlugin = definePlugin(() => ({
  name: 'my-app',
  plugins: [exprEval(), dompurify()],
  config(config) {
    config.$expression.consts = {
      ...config.$expression.consts,
      APP_NAME: 'My App',
    }
  },
}))
```

Registering `myAppPlugin` equals registering all three pieces — distributable as a single import.

## Lifecycle Order

When one plugin depends on another, timing matters. The full pipeline, seen from a plugin's side — the [Vueform Instance](/guide/vueform-instance#two-phases) chapter describes the same two phases from the instance's:

1. `createVueform(userConfig)` builds the instance:
   1. The user config is merged over the entry defaults.
   2. Every plugin's `config(config)` runs — registration order, depth-first into nested `plugins`.
   3. Every plugin's `props` and `emits` merge onto matching components.
   4. **Modules** are created from the final `config.modules` onto `vueform.modules`.
2. `app.use(vueform)` installs the instance into an app:
   1. Each module's `install` hook runs (e.g. the theme module injects its styles).
   2. Components register with Vue (`app.component()`).
   3. Every plugin's `install({ app, vueform })` runs — registration order, depth-first.
3. The first time the instance's globals are read, the app's `globals` callback runs, then every plugin's `globals` hook.
4. Each time a matching component instantiates, every plugin's `extend(props, api)` runs inside its `setup()`, in registration order.

Two practical consequences: everything a `config` hook writes — components, rules, adapters, custom keys — is in place before any module is created or any component mounts; and plugin `props` / `emits` are part of a component's public surface from its very first render.

## Augmenting Types

A plugin's runtime additions — extra props, emits, returned API members, custom config options, globals — are invisible to TypeScript on their own. Declare them via [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation), placed alongside the plugin (same file or a co-located `.d.ts`) so they load as soon as the plugin is imported.

### Augmenting a Specific Component

When a plugin targets one component, augment that component's `Props`, `Emits`, and `Expose` interfaces from its subpath. Declaration merging requires the **exact generic signature** of the original — copy it from the component's types:

```ts
import { computed, type ComputedRef } from 'vue'
import { definePlugin, type LanguagesProp } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  > {
    prefix?: string
    suffix?: string
  }

  interface VfTextEmits<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  > {
    prefixClick: [event: MouseEvent]
  }

  interface VfTextExpose {
    reversed: ComputedRef<string>
  }
}

export default definePlugin(() => ({
  apply: 'VfText',
  props: {
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
  },
  emits: ['prefixClick'],
  extend(props, api) {
    const reversed = computed(() =>
      String(api.value.value ?? '').split('').reverse().join('')
    )

    return { reversed }
  },
}))
```

Additions to `VfTextProps` appear as native props in templates and schemas, and additions to `VfTextEmits` as native events (`@prefix-click` in templates, `on('prefixClick')` in [event handlers](/guide/event-handlers)) — emit members are declared as labeled tuples of the handler's arguments. Additions to `VfTextExpose` show up on the resolved [Context](/guide/context) — template refs, `form$.find()`, event handler arguments.

The same subpath also exposes the component's `Slots`, `Parts`, and `Classes` interfaces. Augment them when the plugin ships a custom [template](/guide/templates) that introduces new slots or structural parts:

```ts
import type { VNode } from 'vue'
import type { ClassValue, DomAttrsOf, LanguagesProp } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextSlots<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  > {
    prefix: (props: { prefix: string }) => VNode[]
  }

  interface VfTextParts {
    prefix: DomAttrsOf<'span'>
  }

  interface VfTextClasses {
    prefix: ClassValue
  }
}
```

A slot is declared as a render function: it receives the slot's props and returns `VNode[]`. Part members map a part name to the DOM attrs of the tag it renders, typing the `part:*` shorthand attrs and part overrides; class members accept any `ClassValue`, typing the `class:*` shorthands and the class overrides in config and presets.

### Augmenting All Components

When a plugin targets every component (`'*'`) or every element (`'*element'`), augment the shared base interfaces in `@vueform/core` instead of repeating the declaration per component:

| Matcher      | Base interfaces                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `'*'`        | `BaseComponentProps`, `BaseComponentEmits`, `BaseComponentSlots`, `BaseComponentParts`, `BaseComponentClasses`, `BaseComponentExpose` |
| `'*element'` | `BaseElementProps`, `BaseElementEmits`, `BaseElementSlots`, `BaseElementParts`, `BaseElementClasses`, `BaseElementExpose`             |

The `BaseElement*` interfaces extend their `BaseComponent*` counterparts, so component-level additions reach elements automatically. Match the original generic parameters here too:

```ts
import { definePlugin } from '@vueform/ui'

declare module '@vueform/core' {
  interface BaseElementProps<T extends string, S, P, C, TContext> {
    autoFocus?: boolean
  }

  interface BaseElementExpose {
    pluginMethod: () => void
  }
}

export default definePlugin(() => ({
  apply: '*element',
  props: {
    autoFocus: { type: Boolean, default: false },
  },
  extend(props, api) {
    return {
      pluginMethod: () => { /* ... */ },
    }
  },
}))
```

### Typing Plugin Configuration

For a custom config key, augment `VueformConfig` in `@vueform/core` — the same pattern the official plugins use:

```ts
import { definePlugin } from '@vueform/ui'

interface MyPluginOptions {
  apiKey: string
  endpoint?: string
}

declare module '@vueform/core' {
  interface VueformConfig {
    myPlugin: MyPluginOptions
  }
}

export default definePlugin(() => ({
  config(config) {
    config.myPlugin = {
      apiKey: config.myPlugin?.apiKey ?? '',
      endpoint: config.myPlugin?.endpoint ?? '/api',
    }
  },
}))
```

With the augmentation in place, the key is type-checked both on the `createVueform` options and everywhere `useConfig()` is read.

### Typing Globals

Globals members are typed by augmenting the `VueformGlobals` interface:

```ts
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { definePlugin } from '@vueform/ui'

declare module '@vueform/core' {
  interface VueformGlobals {
    activeFormId: Ref<string | null>
    isEditing: ComputedRef<boolean>
  }
}

export default definePlugin(() => ({
  globals() {
    const activeFormId = ref<string | null>(null)

    return {
      activeFormId,
      isEditing: computed(() => activeFormId.value !== null),
    }
  },
}))

Both the `globals` hooks' return values and every `useGlobals()` read become fully typed — see [Globals § TypeScript](/guide/globals#typescript).
```
