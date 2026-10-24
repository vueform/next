---
outline: [2,3]
---

# Components

Sooner or later a form needs an input Vueform doesn't ship — a star rating, a rich-text editor, a component library's date picker. Every element's behavior lives in an importable **blueprint**, separate from the SFC that renders it, so a custom input never means forking the framework. You either hand the markup to `!VfField` right where it's used, or take a real component's SFC into your project and own it, while the blueprint keeps coming from the package.

## Wrapping a Widget with `!VfField`

`VfField` is a headless element. It registers a model entry, validates, takes [conditions](/guide/conditions), and renders the full [element layout](/guide/element-layout) — label, help, errors, ARIA wiring — but no input. Its default slot receives the element's [context](/guide/context) and renders the control:

```vue
<template>
  <VfField name="color" label="Color">
    <template #default="{ context }">
      <input
        type="color"
        v-bind="{ ...context.bindings.input(), ...context.inputBindings }"
      />
    </template>
  </VfField>
</template>
```

`inputBindings` wires a native text-like input — the input report, focus and blur, the input ref, and the model-to-DOM write-back, so no `v-model` is needed. Its counterpart for a component that speaks `v-model` is `componentBindings`, which wires `modelValue`, `update:modelValue`, focus, and blur. `bindings.input()` adds what the element knows about itself — the ARIA state and any `part:input` override — and its entries are resolvers, so the template calls it. The contract behind the bags lives in [binding bags](/guide/templates#binding-bags), and inputs that fit neither bag — checkboxes, radios, selects, components emitting payload objects — are hand-wired as [user input](/guide/templates#user-input) shows.

In a schema the slot goes into `slots: { default: … }` through [`defineSlot('VfField.default', …)`](/guide/slots#defineSlot) — the [reference page](/components/VfField#basic-usage) shows the full schema form.

To make the control look like a built-in, give it the theme's input classes. `vf-input` brings the border, background, focus ring, and the disabled and invalid states. The invalid state keys on the `data-invalid` attribute — `VfText` places it through `useBindings`, but `VfField` can't reach markup it doesn't render, so bind `:data-invalid="context.hasError ? '' : undefined"` yourself. `vf-text-input` adds the text-input padding, but its styles ship in `text.css`, which `VfField` doesn't import — add `import '@vueform/ui/text.css'` when you use it.

The [`options`](/components/VfField#options) prop passes arbitrary data into `context.options`, which is how one slot component is parameterized per schema entry.

Everything else the element layout offers comes along with the same props as on `!VfText` — [addons](/guide/element-layout#addons), icons, help, description, columns. Translation works too. With `translate: true` the model becomes locale-keyed while `context.value` keeps reading and writing the active language, so the slot doesn't change — see [multilingual inputs](/guide/i18n#multilingual-inputs).

### Model Shape

The slot may write any value shape. What `VfField` needs to know is the **null value** — what the element holds when empty, defaulting to `null`. It's the initial value when there's no `default`, the target of `clear()`, what `reset()` falls back to, and what the form's `empty` state compares against:

```ts
{
  tags: { type: 'field', label: 'Tags', nullValue: [] },
}
```

In a typed schema `nullValue` also types the model — a string or number widens to its primitive, an array becomes `any[]`, and an object keeps its keys as optional members.

The slot writes through `context.handleInput(next)`, so the change registers as [user input](/guide/templates#user-input) rather than a programmatic write.

### Validation

`rules` works exactly as on any element — see [the rule language](/guide/validation#the-rule-language).

Presence rules (`required`, `filled`) don't read `nullValue`. They treat `null`, `undefined`, `''`, `false`, `[]`, and `{}` as empty, and an object with any key as filled — even when every value is `null` — so a `nullValue: { from: null, to: null }` passes `required` untouched.

Size rules measure by the model's current shape — the per-shape table lives on [min](/rules/min). An object has no size, so size rules pass on it. Validate object models with [your own rule](/guide/validation#writing-your-own-rules).

### Events

`VfField` emits the standard element [events](/components/VfField#events). For anything else the widget does, the slot fires through the `event` proxy — `context.fire('event', name, ...args)` makes the element emit `event` with those arguments, received as `@event` in templates or `onEvent` in schemas:

```vue
<template>
  <VfField name="location" @event="(name, coords) => save(coords)">
    <template #default="{ context }">
      <button @click="context.fire('event', 'picked', { lat: 47.49, lng: 19.04 })">
        Pick on map
      </button>
    </template>
  </VfField>
</template>
```

A `VfField` is local by design — the markup lives where the element is used. When the input should be a reusable element with its own `type`, build it on a blueprint instead.

## Building on Blueprints

A blueprint is a component's whole behavior as an importable module — `@vueform/ui/blueprints/text` for the text element, also re-exported as `defaults` and `blueprint` from `@vueform/ui/components/VfText`. For `VfText` it covers model sync, input handling, validation, conditions, expressions, focus, and lifecycle. The SFC on top holds the markup, classes, part bindings, and types. Taking that SFC into your project means you own the rendering, while the blueprint keeps receiving fixes with every package update.

### Copy or Clone

A **copy** keeps the built-in's name and replaces it everywhere — inline `<VfText>` usage and `type: 'text'` schema entries alike. Every component can be copied, structural ones included (`VfForm`, `VfTabs`, `VfLayout`). Reach for a copy when:

- the **logic** changes, not just the markup — a markup-only change is a [template](/guide/templates)
- everything should live in one file instead of a template plus a [plugin](/guide/plugins)
- the component renders many times — a template is one more component per instance

A **clone** is a new element type built on an existing element's blueprint — a `password` element on `text`, or a select-backed widget that keeps the remote items and async search. It coexists with the built-ins under its own name and `type`. Only elements can be cloned.

### The CLI

The `vf` binary ships with the adapter package — there's nothing to install separately, and it runs as `npx vf` or `pnpm vf`:

| Command | What it does |
| --- | --- |
| `vf list` | Lists the components available for copying. |
| `vf view <Name>` | Prints a component's registry source. |
| `vf copy <Name\|all>` | Copies components into your project. |
| `vf clone <Element> <type>` | Creates a new element from an existing element's blueprint. |
| `vf remove <Name…\|all>` | Removes local components, their provenance, and the registration when nothing is left. |
| `vf register` | Adds the components' registration to your entry file. |
| `vf info` | Prints environment and package details. |

Run without arguments, the component commands open an interactive picker — a multi-select for `copy` and `remove`.

The first run asks for a components directory and recommends `src/vueform/components` (Vite or `src`-based projects) or `vueform/components` otherwise. The answer is saved to `vueform.config.json`, which belongs to the CLI — it is not the Vueform instance config.

A clone's type must be lowercase kebab-case, the component name becomes `Vf<PascalCase>` (`range` → `VfRange`), a built-in's type is rejected, and an existing file is never overwritten.

`vf view` prints the pristine registry source — inside a VS Code terminal it opens the file as an editor tab instead.

Flags (`--dir`, `--yes`, `--overwrite`, `--dry-run`, `--force`), post-copy formatting, and the config file format are covered in the [CLI reference](/tools/cli).

### Registering Local Components

The CLI keeps a barrel — an `index.ts` in the components directory exporting every local component. On the first copy it offers to add the registration to your entry file, and `vf register` applies the same edit later:

```ts
import localComponents from './vueform/components'

createVueform({
  components: { ...localComponents },
})
```

[Entries](/guide/configuration#components) register by name — an existing name overrides the built-in, a new name registers a new component. A clone registered as `VfRange` is `type: 'range'` in schemas, because a schema `type` resolves to `Vf` plus the PascalCased type. The `name` in `defineOptions` must match the registration key — it's how config defaults, presets, and classes find the component.

The CLI isn't required. The registry is committed and browsable on GitHub ([copies](https://github.com/vueform/next/tree/main/packages/ui/registry/copies), [clones](https://github.com/vueform/next/tree/main/packages/ui/registry/clones)) — a copy works verbatim, and a clone template needs its `VfCloneName` / `__TYPE__` placeholders replaced. The CLI only adds the barrel, the registration edit, and provenance tracking on top.

### Anatomy of a Local Component

A copied `VfText`, trimmed — the real copy also carries the multilingual generics and the full input wiring:

```vue
<script setup lang="ts">
import { tInputAria, useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfTextEmits,
  type VfTextProps,
  type VfTextSlots,
} from '@vueform/ui/components/VfText'

import '@vueform/ui/input.css'
import '@vueform/ui/text.css'

defineOptions({
  name: 'VfText',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfTextEmits>()

const props = withDefaults(defineProps<VfTextProps>(), defaults)
const events = defineEvents<VfTextEmits>()
const slots = defineSlots<VfTextSlots>()

const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

const classes = useClasses({
  root: 'vf-text',
  input: 'vf-input vf-text-input',
})

const bindings = useBindings(
  {
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  tInputAria(api)
)

const { value, loading, viewLoaded, inputRef, handleInput, handleFocus, handleBlur } =
  api
const { inputType } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading>
      <input
        :type="inputType"
        v-model="value"
        :class="classes.input"
        v-bind="bindings.input()"
        :ref="(el) => (inputRef = el)"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </VfLayout>
  </slot>
</template>
```

- **`defineOptions`** — `name` must match the registration key, and `inheritAttrs: false` is required because attributes route through [parts](/guide/parts). Elements also declare `element: true` (marks the component as a form element — what `'*element'` targets in defaults and plugins), `expressionable: true` (enables [computed defaults](/guide/expressions#computed-defaults)), and `nullValue(props)` — model metadata that `!useModel`'s schema walk reads to build the model without mounting anything. Containers declare `children(props)` the same way. Non-elements like `VfTabs` declare only `name`.
- **`defineEvents`** — turns the emits into Vueform's event hub (`fire`, `fireAsync`, `on`, `off`, `onBefore`, `onAfter`), which the blueprint needs for cancelable async events. See [event handlers](/guide/event-handlers).
- **`blueprint` + `!useBlueprint`** — reusing the built-in blueprint is what makes the copy a real `VfText`. Classes, state attributes, and ARIA stay in the SFC.
- **CSS chunks** — `text.css` is the component's own and `input.css` is shared by input-styled components. They're plain imports, so a shared chunk is bundled once. Keep them and restyle through [classes](/guide/classes), or drop them.
- **The template contract** — the `#template` slot and `outlets.template` keep [templates](/guide/templates) working for the copy, `viewLoaded` honors lazy rendering, and `<VfLayout>` keeps the element layout. Beyond these and the original's public contract, the markup is yours.

### What a Clone Adds

A clone is the same skeleton with a new identity. `defineOptions` carries the new name, `withDefaults` adds `type: 'range'` next to the blueprint's defaults, and `defaults` / `blueprint` are imported from the blueprint subpath (`@vueform/ui/blueprints/text`) instead of the component.

Its interfaces live in the SFC — `VfRangeProps`, `…Emits`, `…Slots`, `…Parts`, `…Classes`, `…Bindings`, `…Expose`, and the derived `…Context`. They're composed from the blueprint's types (`TextProps`, `TextEmits`, …), never from the `VfText` component, so augmentations of `VfText` don't leak into the clone. Each interface carries an `@example` doc block showing how to extend it — except `…Context`, which is derived from the others, so customize those and don't edit it.

A plain `<script lang="ts">` block next to `<script setup>` registers the clone's types — `ControlRegistry` in `@vueform/core` and `GlobalComponents` in `vue` (trimmed; the generated file carries the imports and the `EntryProps` helper):

```ts
declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfRange: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfRangeEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
      VfRangeSlots,
      VfRangeParts,
      VfRangeClasses,
      VfRangeContext<EntryProps<TEntry>>
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRange: (typeof import('./VfRange.vue'))['default']
  }
}
```

That block is what types `type: 'range'` schema entries, `<VfRange>` in templates, `form$.find()`, `context$`, and `ContextOf<'VfRange'>`. The multilingual generics come along, so `translate: true` narrows the clone's model like the built-in's.

### The `!useBlueprint` Toolkit

What `!useBlueprint` hands the SFC:

| Member | What it is |
| --- | --- |
| `api` | The blueprint's working surface with refs intact, plus the event helpers and the resolved `props`. The script destructures from it and your logic writes through it (`api.value.value = …`). |
| `context` | The single public [context](/guide/context) — unwraps refs on read, writes them on assignment. Bound to the `#template` slot and outlet, and the same object `context$` and `find()` return. |
| `expose` | The raw object behind `context`, handed to `defineExpose`. Skip that line and nothing outside can reach the component. |
| `outlets` | Merged slot fills from inline slots and the `slots` prop — see [templates](/guide/templates#slots) for the outlet pattern. |
| `propRefs` | A lazy `toRef` proxy over the resolved props, for destructuring that stays live. |
| `useClasses(defs)` | Registers part-keyed classes — each key a static value or a zero-argument function that re-runs as state changes — and returns `classes`, bound as `:class="classes.x"`. |
| `useBindings(...defs)` | Registers part-keyed attribute resolvers (state `data-*` markers, ARIA) — zero-argument for plain parts, parameterized for per-item parts — and returns `bindings`. Each key resolves the registered entries merged with the user's [part override](/guide/parts#callable-parts), so templates call it — `v-bind="bindings.input()"`, `bindings.item(item)`. Classes are not in the bag. |

Ready-made ARIA patterns plug into `useBindings` and take the api — `inputAria(api)`, `tInputAria(api)`, `choicesAria(api, { role: 'radiogroup' })` — see [accessibility](/guide/accessibility).

### Extending the Logic

The fifth `!useBlueprint` argument is an extension callback, called with `(api, props, events)`. Whatever object it returns merges into the api before `context` and `expose` are assembled, so the additions become real members — reachable from templates, handlers, and `find()`, and typed inside the SFC:

```ts
const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots,
  (api) => ({
    charCount: computed(() => String(api.value.value ?? '').length),
    truncate: (len: number) => {
      api.value.value = String(api.value.value ?? '').slice(0, len)
    },
  })
)
```

Plain setup code after `useBlueprint` stays local to the script — fine for helpers, but anything public belongs in the callback.

The SFC's inferred types stop at its boundary. `find()` in another file, `context$`, and `ContextOf` read the published interfaces — extending those is next.

### Extending the Types

The published interfaces are `VfTextProps`, `…Emits`, `…Slots`, `…Parts`, `…Classes`, `…Bindings` (the entries registered with `useBindings`), and `…Expose`.

A **copy** augments the built-in's interfaces from a plain `<script lang="ts">` block next to `<script setup>` — ambient declarations can't live in `<script setup>`. Because the copy's `defineProps` / `defineEmits` / `defineSlots` reference those same interfaces, one augmentation covers the copy's internals and every consumer, and augmenting the `@vueform/ui/components/VfText` re-export merges into core's declaration. A **clone** edits its own interfaces in place — there's nothing to augment.

Continuing the copy from the [extension callback](#extending-the-logic), with a `limit` prop on top:

```vue
<script setup lang="ts">
// … the copy from above …
</script>

<script lang="ts">
import type { ComputedRef } from 'vue'

declare module '@vueform/ui/components/VfText' {
  interface VfTextProps {
    limit?: number
  }

  interface VfTextExpose {
    charCount: ComputedRef<number>
    truncate: (len: number) => void
  }
}
</script>
```

Each addition needs its runtime side too. The augmentation syntax per interface lives at [props, emits, expose](/guide/plugins#a-single-component) and [classes, parts, slots](/guide/templates#typing-new-keys); on the runtime side:

- **Props** get a default in `withDefaults` and are read through `propRefs`.
- **Emits** are labeled tuples with the context last, fired through `events.fire('name', …, context$)`. Inside the extension callback the context isn't assembled yet — read it with `useContext()` from `@vueform/ui`.
- **Slots** render as a named `<slot>` with the outlet as fallback, the payload bound to both.
- **Parts** spread `bindings.<part>()` on their node.
- **Classes** are registered in `useClasses` and bound with `:class`.
- <span id="expose-interface">**Expose members**</span> come from the [extension callback](#extending-the-logic).

Every type parameter on these interfaces has a default, so an augmentation may omit the parameter list. To reference a parameter, repeat the list verbatim — renamed parameters are a TS2428 error:

```ts
import type { LanguagesProp } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  > {
    limit?: [TTranslate] extends [true]
      ? Partial<Record<keyof TLanguages, number>>
      : number
  }
}
```

In a clone the parameters are already on its interfaces, so reference them directly.

Augmentation is additive — declaration merging can't remove or reshape members or change generics. When the contract itself must change, make a clone.

### Upstream and Updates

The blueprint updates with the package, and the SFC is yours. A copy is a fork — `vf copy` records provenance (the source package, its version, and the settled and registry hashes in `vueform.config.json`), but no `diff` or `update` command exists yet, so upstream fixes to the SFC reach a copy only by re-copying or merging by hand. A clone is never diffed or updated by design — it's recorded under `clones` for bookkeeping only.

## Authoring an Element from Scratch

Writing a blueprint of your own is needed only when no existing blueprint's behavior fits. A blueprint is a chain of feature factories — `useFeatures(props, events).use(makeElement()).use(makeLayout())….build()` — with prop defaults from `defineDefaults`, and the SFC plus the registry augmentation follow the clone's pattern. These helpers carry `@private` doc tags and their conventions may still change, so expect to read source — the [blueprints directory](https://github.com/vueform/next/tree/main/packages/core/src/blueprints) is the reference, with `field.ts` as the smallest real example. Start from the blueprint closest to your element, and prefer a clone whenever an existing blueprint fits.
