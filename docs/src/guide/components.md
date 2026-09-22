---
outline: [2,3]
---

<script setup lang="ts">
const handlePick = (name, payload) => alert(`${name}: ${JSON.stringify(payload)}`)
</script>

# Components

Sooner or later a form needs an input Vueform doesn't ship — a star rating, a signature pad, a rich-text editor, a wrapper around a component library's widget. There are three fundamentally different ways to get there, and they differ in **how much you own**:

1. **[`!VfField`](#start-with-vffield)** — the headless element for one-off inputs: the framework runs the element shell, you provide only the input UI, right where it's used.
2. **[Building on blueprints](#building-on-blueprints)** — the CLI writes a real component's SFC into your project, to replace a built-in or to mint a new element type — while the behavior keeps coming from the package.
3. **[Authoring from scratch](#authoring-an-element-from-scratch)** — everything is yours, blueprint included, the way Vueform's own elements are built.

Each step up trades simplicity for ownership. Start as low as possible.

## Start with `!VfField`

`VfField` is a **headless element**: it registers a model entry, runs [validation](/guide/validation), renders the full [element layout](/guide/element-layout) (label, help, errors, ARIA) — but ships no input UI. You provide that through its default slot, which receives the element's [Context](/guide/context):

::: usage model

```vue [Preview]
<VfField name="color" label="Color" default="#3b82f6">
  <template #default="{ context }">
    <input type="color" v-bind="context.inputBindings" />
  </template>
</VfField>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const Color = defineSlot('VfField.default', {
  props: ['context'],
  setup: (props) => () =>
    h('input', {
      type: 'color',
      ...props.context.inputBindings,
    }),
})

const schema = defineSchema({
  color: {
    type: 'field',
    label: 'Color',
    default: '#3b82f6',
    slots: { default: Color },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

`inputBindings` is a spreadable bag with everything a native input needs to act as the element's control: it keeps the value in sync, wires focus / blur, registers the input node and so on. The pieces behind it are covered in [User Input](/guide/templates#user-input) and [Binding Bags](/guide/templates#binding-bags).

For a third-party **component** that accepts a `!v-model`, `componentBindings` is the counterpart — `modelValue`, its `update:modelValue`, and the focus / blur listeners:

```vue
<VfField name="date" label="Date">
  <template #default="{ context }">
    <DatePicker v-bind="context.componentBindings" />
  </template>
</VfField>
```

Either way the widget now behaves like a built-in input: its value lands in the form model, flows into conditions and the payload, and validation reacts to edits.

When the markup doesn't fit a bag — a click-driven widget with no single input to bind, third-party widget without `!v-model` — [User Input](/guide/templates#user-input) shows how to put the pieces together by hand.

### Model Shape

The underlying input can write any shape into the model — string, number, boolean, array, object, etc. — Vueform doesn't care.

What it does care about is what **empty** looks like: every element has a **null value**, the entry's content when nothing has been entered, and it's what `required` and the reset logic compare against. `VfField` defaults it to `null`, which fits "string-shaped" inputs. For an array or object-shaped value, set `nullValue` to the matching empty shape:

::: usage model validate

```vue [Preview]
<VfField name="tags" label="Tags" :null-value="[]" />
```

```vue [Template]
<VfField name="tags" label="Tags" :null-value="[]" rules="required">
  <template #default="{ context }">
    <div style="display: flex; gap: 0.5rem">
      <button
        v-for="tag in ['vue', 'forms', 'typescript']"
        :key="tag"
        type="button"
        class="vf-btn"
        :class="context.value.includes(tag)
          ? 'vf-filled vf-primary'
          : 'vf-outlined vf-secondary'"
        @click="
          context.handleInput(
            context.value.includes(tag)
              ? context.value.filter((t) => t !== tag)
              : [...context.value, tag]
          )
        "
        @focus="context.handleFocus"
        @blur="context.handleBlur"
      >
        {{ context.value.includes(tag) ? '✓' : '+' }} {{ tag }}
      </button>
    </div>
  </template>
</VfField>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const tags = ['vue', 'forms', 'typescript']

const Tags = defineSlot('VfField.default', {
  props: ['context'],
  setup: (props) => () =>
    h(
      'div',
      { style: 'display: flex; gap: 0.5rem' },
      tags.map((tag) =>
        h(
          'button',
          {
            type: 'button',
            class: [
              'vf-btn',
              props.context.value.includes(tag)
                ? 'vf-filled vf-primary'
                : 'vf-outlined vf-secondary',
            ],
            onClick: () =>
              props.context.handleInput(
                props.context.value.includes(tag)
                  ? props.context.value.filter((t: string) => t !== tag)
                  : [...props.context.value, tag]
              ),
            onFocus: props.context.handleFocus,
            onBlur: props.context.handleBlur,
          },
          `${props.context.value.includes(tag) ? '✓' : '+'} ${tag}`
        )
      )
    ),
})

const schema = defineSchema({
  tags: {
    type: 'field',
    label: 'Tags',
    nullValue: [], // [!code highlight]
    rules: 'required',
    slots: { default: Tags },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

With `nullValue: []` the field starts as `[]`, counts as empty — validate with nothing selected and `required` fails — until the slot writes a non-empty array, and resets back to `[]` when cleared.

### Validation

[`rules`](/guide/validation#ways-to-define-rules) works exactly as on any other element — string or array shorthand, custom rules, async rules and so on.

Since the value can be any shape, keep in mind how the built-in rules read it:

- **Presence** (`required`, `filled`, `nullable`) — anything equal to the element's [null value](#model-shape) (or `undefined`) counts as empty.
- **Size** (`min`, `max`, `between`, `size`, `gt`, `lt`, …) — character count for strings, the number itself for numbers, item count for arrays, kilobytes for files.
- **Shape-specific** (`email`, `url`, `numeric`, `date`, …) — apply when that shape is what you're collecting.

An **object** value has no canonical "size", so the size rules don't apply to it — validate objects with a [custom rule](/guide/validation#custom-rules). Errors land in the standard error block and the validation lifecycle like any input; there's nothing extra to wire.

### Events

`!VfField` emits the standard element [Events](/components/VfField#events) — `change`, `input`, `focus`, `blur`, and the rest. For anything else the wrapped input can do, it has a generic **`event`** proxy. Call `context.fire('event', name, ...args)` from inside and the element emits `event` with those arguments; a schema's `onEvent` (or `@event` in a template) picks them up:

::: usage nomodel

```vue [Live]
<VfField
  name="picker"
  label="Picker"
  @event="handlePick"
>
  <template #default="{ context }">
    <button
      type="button"
      class="vf-btn vf-filled vf-secondary"
      @click="context.fire('event', 'picked', { ts: Date.now() })"
    >
      Pick
    </button>
  </template>
</VfField>
```

```vue [Preview]
<VfField
  name="picker"
  label="Picker"
  @event="(name, payload) => alert(`${name}: ${JSON.stringify(payload)}`)"
>
  <template #default="{ context }">
    <button
      type="button"
      @click="context.fire('event', 'picked', { ts: Date.now() })"
    >
      Pick
    </button>
  </template>
</VfField>
```

```vue [Template]
<VfField
  name="picker"
  label="Picker"
  @event="(name, payload) => alert(`${name}: ${JSON.stringify(payload)}`)"
>
  <template #default="{ context }">
    <button
      type="button"
      class="vf-btn vf-filled vf-secondary"
      @click="context.fire('event', 'picked', { ts: Date.now() })"
    >
      Pick
    </button>
  </template>
</VfField>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const Picker = defineSlot('VfField.default', {
  props: ['context'],
  setup: (props) => () =>
    h(
      'button',
      {
        type: 'button',
        class: 'vf-btn vf-filled vf-secondary',
        onClick: () => props.context.fire('event', 'picked', { ts: Date.now() }),
      },
      'Pick'
    ),
})

const schema = defineSchema({
  picker: {
    type: 'field',
    label: 'Picker',
    slots: { default: Picker },
    onEvent: (name, payload) => alert(`${name}: ${JSON.stringify(payload)}`),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Press the button: the listener receives `'picked'` and the payload. This is the bridge that lets a wrapped component's own event API surface at the form layer without adding every event to `!VfField`'s emit list.

### Addons and Translation

Because `!VfField` renders the shared [element layout](/guide/element-layout), the layout's features come along: addons, icons, help and description, columns — all with the same props as `!VfText` and friends.

Here's a custom input dressed up with `addonBefore` / `addonAfter`:

::: usage model

```vue [Preview]
<VfField
  name="amount"
  label="Amount"
  addon-before="$"
  addon-after="USD"
>
  <template #default="{ context }">
    <input
      type="number"
      class="vf-input vf-text-input"
      v-bind="context.inputBindings"
    />
  </template>
</VfField>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const Amount = defineSlot('VfField.default', {
  props: ['context'],
  setup: (props) => () =>
    h('input', {
      type: 'number',
      class: 'vf-input vf-text-input',
      ...props.context.inputBindings,
    }),
})

const schema = defineSchema({
  amount: {
    type: 'field',
    label: 'Amount',
    addonBefore: '$', // [!code highlight]
    addonAfter: 'USD', // [!code highlight]
    slots: { default: Amount },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The addons render inside the input wrapper on either side of the slot content, exactly as they would around a built-in input — and the full addon surface applies: locale maps, arrays, element schemas, functions. See [Addons](/guide/element-layout#addons) for all the forms.

The only requirement on the slot's side is the `vf-input vf-text-input` classes on the input — they apply the theme's input styling so the input blends in with the addons around it.

It can also be a [translatable input](/guide/multilingual-inputs). With `translate: true` the model becomes a locale-keyed object, while the context's `value` reads and writes the **active language** only — so the slot doesn't change at all — and `context.language` / `context.languages` expose the current and available languages. The per-element language switcher renders next to the addons as on any translatable element:

::: usage model

```vue [Preview]
<VfField
  name="bio"
  label="Bio"
  translate
  :languages="{ en: 'English', de: 'German' }"
>
  <template #default="{ context }">
    <input
      class="vf-input vf-text-input"
      :placeholder="`Bio in ${context.languages[context.language]}`"
      v-bind="context.inputBindings"
    />
  </template>
</VfField>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const Bio = defineSlot('VfField.default', {
  props: ['context'],
  setup: (props) => () =>
    h('input', {
      class: 'vf-input vf-text-input',
      placeholder: `Bio in ${props.context.languages[props.context.language]}`,
      ...props.context.inputBindings,
    }),
})

const schema = defineSchema({
  bio: {
    type: 'field',
    label: 'Bio',
    translate: true, // [!code highlight]
    languages: { en: 'English', de: 'German' },
    slots: { default: Bio },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Switch the language and the model shows both entries while `context.value` follows the active one.

One-off inputs like these are `!VfField`'s whole role — quick, local, no new element type involved. Making an input a real, reusable element — its own `type`, shared across forms — is what the next approach is for.

## Building on Blueprints

Beyond `!VfField` sits the second approach: making a real Vueform component's SFC yours. What makes it practical is the **blueprint**: every built-in's behavior — model, validation, conditions, interaction, accessibility — is a separate importable module that keeps living (and updating) in the package, while the component on top of it is a single SFC — markup, classes, types — that the CLI writes into your project. You own the file; the machinery stays upstream.

That file can serve two intents, and everything about it — the anatomy, the toolkit, the way it grows — is shared between them. The intent decides only its **identity**.

### Copy or Clone?

A **copy** keeps the built-in's identity: it's a different implementation of `!VfText`, one step beyond a [custom template](/guide/templates). A custom template rewrites the component's markup while the built-in logic keeps running underneath; a copy makes the component **yours** — logic included. Registered under the built-in's name, it takes over every instance — for an element, inline `<VfText>` and schema `type: 'text'` alike — and it works the same for every Vueform component, elements like `!VfText` as much as `!VfForm`, `!VfTabs`, or `!VfLayout`.

When visuals are all that need to change — markup, classes, parts, slots — prefer a [custom template](/guide/templates): it's a smaller surface that doesn't fork the component. Reach for a copy when:

- **The logic itself needs to change** — new props, events, state, different behavior — and you'd rather write it in the component than layer it on through [Plugins](/guide/plugins).
- **Everything should live in one file** — instead of a template here and a plugin there.
- **The component renders many times.** A template is an extra component rendered inside each instance; for a hot component — a cell of a matrix, a row of a long list — a direct replacement is the leaner tree.

A **clone** answers a different question: not "a different `text`" but a **new element type** that _extends_ one. A `password` field is a text field with more: a strength meter, a show / hide toggle, options of its own. It doesn't replace `text` — it deserves a name of its own in schemas and templates.

The same approach wraps a third-party widget into a proper element. Built on `!VfSelect`'s machinery, your own select component keeps remote endpoints, async items, and everything else the built-in can do — richer than a generic [`!VfField`](#start-with-vffield) element, without authoring one from scratch.

A clone is built from an existing element's [blueprint](#blueprint-useblueprint) and coexists with the built-ins under its own name and schema `type` — and since cloning builds on an element's machinery, it applies to **elements only**, where a copy covers every component.

### The CLI

Vueform ships a small CLI for managing local components. The everyday commands:

```sh
npx vueform list                # what the installed adapter offers
npx vueform view VfText         # inspect a component's source
npx vueform copy VfText         # replace: copy it under its own name
npx vueform clone VfText range  # extend: a new `range` element on VfText's blueprint
npx vueform remove VfText       # delete local components and their wiring
```

Run any of them without a name and you get an interactive picker instead — multi-select for `copy` and `remove`, so one run can handle several components (`copy all` takes everything); `clone` picks one base element and asks for the new type.

`copy` takes the component's source from the installed package's registry and writes it into your components directory (asked once on first run, remembered in `vueform.config.json`). `clone` writes a ready template of a new element there instead: the type is a lowercase kebab-case name and doubles as the component's — `range` becomes `VfRange.vue` — and a type that collides with a built-in's is rejected. Either way the file compiles as-is — its imports point at the package's public API — and the app's theme styles it through the same `vf-*` classes.

Alongside them the CLI maintains a barrel (`index.ts`) that exports them as a single `components` map, and on the first copy it offers to register that barrel in your entry file automatically. Declined, or copying by hand? The registration is one line (`npx vueform register` applies the same edit later):

```ts
import { createVueform } from '@vueform/ui/origin'
import { components } from './components/vueform'

createVueform({
  components: { ...components }, // [!code highlight]
})
```

That's the whole integration: [`components`](/guide/configuration#components) entries override the pre-registered built-ins by name — so a copied `VfText` replaces the built-in `!VfText` everywhere — and register new names, so a cloned `VfRange` is available as `type: 'range'` in schemas and `<VfRange>` in templates from the first run. The `name` in the component's `defineOptions` must match its registration key — the generated file already has it right.

### Browsing the Sources

Everything the CLI writes comes from the installed adapter's `registry/` directory — committed to the repository, so you can browse it on GitHub before touching your project:

- [`registry/copies`](https://github.com/vueform/next/tree/main/packages/ui/registry/copies) — the copy-ready component sources
- [`registry/clones`](https://github.com/vueform/next/tree/main/packages/ui/registry/clones) — the clone templates

`npx vueform view` prints the same sources right in your terminal — and opens them as editor tabs when run from an editor's terminal.

The registry doubles as the manual path: nothing requires the CLI. Grab a file, drop it into your project, and register it in `createVueform`'s [`components`](/guide/configuration#components) as shown [above](#the-cli) — a copy works verbatim; in a clone template, replace the `VfCloneName` and `__TYPE__` placeholders with your component's name and type first. The CLI adds conveniences on top — the barrel, the registration edit, provenance tracking in `vueform.config.json` — not requirements.

### Anatomy of a Local Component

Every generated file follows the same structure — a copy of an element like `!VfText` is the richest case, so it's the one worth walking through (a clone adds a little on top, [covered after](#what-a-clone-adds)). Here's the copied `VfText.vue`, trimmed to its skeleton (the real file adds the multilingual generics and a few more bindings):

```vue
<script setup lang="ts">
import { defaults, blueprint } from '@vueform/ui/blueprints/text'
import { useBlueprint, defineEvents } from '@vueform/ui'
import type { VfTextEmits, VfTextProps, VfTextSlots } from '@vueform/ui/components/VfText'
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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ hasError }) => ({
  root: 'vf-text',
  input: {
    'vf-input': true,
    'vf-text-input': true,
    'vf-danger': hasError.value,
  },
}))

const { value, id, name, viewLoaded, aria, input, handleInput, handleFocus, handleBlur } = api

const { inputType } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <input
        :type="inputType"
        :name
        :id
        :class="classes.input"
        v-model="value"
        v-bind="{ ...aria, ...parts.input }"
        :ref="(el) => (input = el)"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </VfLayout>
  </slot>
</template>
```

The pieces, one by one.

#### `defineOptions`

```ts
defineOptions({
  name: 'VfText',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
```

The component's `name` (must match its registration key) and `inheritAttrs: false`, because fall-through attributes route through [Parts](/guide/parts). The rest depends on the component's kind — an element declares:

- `element: true` — marks it for element targeting
- `expressionable: true` — lets `default` values participate in [expression tracking](/guide/expressions#computed-defaults)
- `nullValue` — what "empty" means for the model

A non-element skips all of these — e.g. `!VfTabs` declares nothing but its `name`.

#### `!defineEvents`

```ts
defineEmits<VfTextEmits>()
// ...
const events = defineEvents<VfTextEmits>()
```

Upgrades Vue's emits into Vueform's [event hub](/guide/event-handlers): the returned object can fire events _and_ be subscribed to (`on` / `off` / `onBefore` / `onAfter`), which the blueprint needs for cancelable async events.

#### `!blueprint` + `!useBlueprint`

```ts
import { defaults, blueprint } from '@vueform/ui/blueprints/text'
// ...
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)
```

The **blueprint** is the component's entire "script" behavior, importable on its own. For `!VfText` that's model sync, input handling, validation, conditions, expressions, focus, accessibility, lifecycle — for `!VfTabs` it would be tab state and navigation. `useBlueprint` runs it with your props, events, and slots, and hands back the working surface the rest of the file binds — [covered below](#the-useblueprint-toolkit). Reusing the built-in blueprint is what makes your copy a _real_ `VfText`.

#### The Style Chunks

```ts
import '@vueform/ui/input.css'
import '@vueform/ui/text.css'
```

The `.css` imports are the component's styles, split per concern: `text.css` is `!VfText`'s own, `input.css` is shared by every input-styled component. They're plain module imports, so a chunk pulled in by several copies is bundled once. Keep them and restyle through [classes](/guide/classes), or drop them and bring your own CSS.

#### The Template Contract

```vue
<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <!-- the component's own markup -->
    </VfLayout>
  </slot>
</template>
```

The `#template` slot, the `outlets.template` component, and the `viewLoaded` gate preserve [Templates](/guide/templates) rewiring and lazy rendering for your copy; in an element copy, `<VfLayout>` additionally keeps the standard [element layout](/guide/element-layout). Keep them.

Beyond honoring that structure — and the original's public contract, so schemas, `find()`, conditions, and validation keep working — the file is yours: reorder the markup, add nodes, wrap the input in a third-party widget, write any logic the component needs.

### What a Clone Adds

A clone is the same skeleton with a new identity — `defineOptions` carries the new name, `withDefaults` sets `type: 'range'` next to the blueprint's defaults — plus two additions that make it a self-contained element:

**Its interfaces are its own.** Where a copy imports `VfTextProps` & co. from the package, the clone declares a full interface family — `VfRangeProps`, `VfRangeEmits`, `VfRangeSlots`, `VfRangeParts`, `VfRangeClasses`, `VfRangeExpose`, `VfRangeContext` — right in the SFC, composed from the same blueprint and feature types the built-in uses. Nothing references the `!VfText` component: the clone stands on the blueprint alone, so it's unaffected by anything that happens to `!VfText` — including your own [augmentations](#extending-the-types) of it. Each interface carries a doc block with a ready-to-paste example of growing it.

**It registers itself as an element.** A plain `<script>` block declares the new type on Vueform's registry and the component globally for templates:

```ts
declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfRange: DefineRegistryEntry<
      // ...the clone's own interfaces
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRange: (typeof import('./VfRange.vue'))['default']
  }
}
```

That entry is what makes the new element fully typed end to end: `type: 'range'` schema entries, `<VfRange>` in templates, `form$.find()` results, event handlers' `context$`, `ContextOf<'VfRange'>` — all resolve to the clone's interfaces. The multilingual generics come along too: `translate: true` narrows a clone's model exactly like the built-in's.

### The `!useBlueprint` Toolkit

`useBlueprint` returns everything the SFC works with:

```ts
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)
```

What each piece is for:

#### `api`

The blueprint's full working surface with **refs intact** — for `!VfText` the value, interaction handlers, and state — plus the event helpers and resolved `props`. It's what the `<script>` destructures for the template (`value`, `handleInput`, …) and what your own logic reads and writes (`api.value.value = …`).

#### `parts`

The resolved [Parts](/guide/parts) attribute bags. Spread each onto the DOM node it belongs to (`v-bind="parts.input"`); a skipped binding silently swallows the user's `parts` / `part:` attributes for that node.

#### `classes`

The [resolved classes](/guide/classes#override-priority): your `useClasses` definitions merged with theme classes, user `classes` props, and `reclass` overrides. Bind each key at the matching spot (`:class="classes.input"`).

#### `context`

The component's single public [Context](/guide/context): a proxy over the exposed API that unwraps refs on read and writes them on assignment. Bind it to the `#template` slot and the template outlet as `:context`; it's the same object event handlers receive as `context$` and `form$.find()` returns.

#### `expose`

The object to hand to `defineExpose`: the raw API behind `context`, refs intact. Every public view of the component reads through it — skip the `defineExpose(expose)` line and the rest of the form can't reach the component.

#### `outlets`

The merged slot fills, whether they arrived as inline [template slots](/guide/slots#template-slots) or through the [`slots` prop](/guide/slots#the-slots-prop). `outlets.template` is part of the template contract; render any component-specific slots of your own the same way (see [Slots](/guide/templates#slots) on the outlet pattern).

#### `propRefs`

A lazy `toRef` proxy over the resolved props, for reactive destructuring: `const { inputType } = propRefs` stays live where plain destructuring would snapshot.

#### `useClasses`

Registers the component's class definitions: a static object, or a factory over `(api, propRefs)` that re-runs as state changes — the `hasError`-driven `vf-danger` above.

### Extending the Logic

The supported way to grow the component is the **extension callback** — `useBlueprint`'s optional fifth argument. It runs right after the blueprint builds its api and receives it (followed by the resolved props and events); whatever object it returns is merged in:

```vue
<script setup lang="ts">
import { computed } from 'vue'
// ...

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots, (api) => { // [!code highlight]
    const charCount = computed(() => String(api.value.value ?? '').length)

    const clear = () => {
      api.value.value = null
    }

    return { charCount, clear } // [!code highlight]
  })
</script>
```

Because the merge happens before `context` and `expose` are assembled, the additions become real members of the component — `context.charCount` works in templates and event handlers, `form$.find('...')?.clear()` works from outside, and the returned `api` / `context` / `expose` types carry them automatically.

You _can_ also write plain code after `useBlueprint` — watchers, computeds, handlers in setup as in any SFC. But those bindings stay local to the `<script>`: they're not part of `api`, `context`, or `expose`, so nothing outside the component can reach them, and making one public means attaching it in the right places yourself. Fine for internal helpers; for anything meant to be part of the component, use the callback.

That automatic typing stops at the SFC's boundary, though. Code elsewhere in the app — `form$.find('...')` in another file, an event handler's `context$`, a `ContextOf<'VfText'>` annotation — never sees your SFC's types: TypeScript resolves those contexts from the component's _published_ interfaces. At runtime the additions are there, but to the type system they don't exist until you declare them on those interfaces — covered next.

### Extending the Types

Whenever TypeScript checks the component anywhere in your app — a schema entry, a `!<VfText />` or `!<VfRange />` in a template, what `form$.find('...')` returns — it reads the component's public interfaces: `…Props`, `…Emits`, `…Slots`, `…Parts`, `…Classes`, and `…Expose`. Where those interfaces live is the one typing difference between the two intents.

A **copy**'s interfaces are the built-in's, published at `!@vueform/ui/components/VfText`. New members are declared by **augmenting** them from a plain `<script lang="ts">` block alongside `<script setup>` — ambient declarations can't live inside `<script setup>`; it's the same pattern as in [Templates](/guide/templates#classes). The convenient part: the copy's own `defineProps` / `defineEmits` / `defineSlots` reference these very interfaces, so one augmentation covers both sides — the copy's internals and every consumer.

A **clone**'s interfaces sit right in its SFC, so there's nothing to augment: the same members go **straight onto the interfaces**. That's the only difference — each recipe below shows both intents, tab by tab.

**Props** — declare the member on the props interface and it's part of `defineProps`: give it a default next to the blueprint's own, and read it reactively through `propRefs`:

::: code-group

```vue [Copy]
<script lang="ts">
declare module '@vueform/ui/components/VfText' {
  interface VfTextProps {
    /**
     * Maximum character count displayed next to the input.
     */
    limit?: number
  }
}
</script>

<script setup lang="ts">
// ...
const props = withDefaults(defineProps<VfTextProps>(), {
  ...defaults,
  limit: 100,
})

// ...
const { limit } = propRefs
</script>
```

```vue [Clone]
<script setup lang="ts">
// ...

export interface VfRangeProps<
  // ...
> {
  /**
   * Maximum character count displayed next to the input.
   */
  limit?: number
}

// ...
const props = withDefaults(
  defineProps<VfRangeProps<TTranslate, TLanguages>>(),
  {
    ...defaults,
    type: 'range',
    limit: 100,
  }
)

// ...
const { limit } = propRefs
</script>
```

:::

**Emits** — emit entries are named tuples; by convention the last argument is the component's [context](/guide/context). Fire the event through the event helpers so both Vue listeners and the [event hub](/guide/event-handlers) see it:

::: code-group

```vue [Copy]
<script lang="ts">
import type { VfTextContext } from '@vueform/ui/components/VfText'

declare module '@vueform/ui/components/VfText' {
  interface VfTextEmits {
    cleared: [context$: VfTextContext]
  }
}
</script>
```

```vue [Clone]
<script setup lang="ts">
// ...

export interface VfRangeEmits<
  // ...
> extends TextEmits<
  // ...
> {
  cleared: [context$: VfRangeContext]
}
</script>
```

:::

```ts
import { useComponentContext } from '@vueform/ui'

const context$ = useComponentContext() // the component's own context

const clear = () => {
  api.value.value = null
  events.fire('cleared', context$)
}
```

`@cleared` on an instance and `onCleared` in a schema now typecheck with the declared payload.

**Slots** — the declaration adds the type; in the markup a regular named `<slot>` serves inline fills, with the outlet as its fallback for [`slots` prop](/guide/slots#the-slots-prop) fills — the payload bound to both:

::: code-group

```vue [Copy]
<script lang="ts">
import type { VNode } from 'vue'

declare module '@vueform/ui/components/VfText' {
  interface VfTextSlots {
    counter: (props: { count: number }) => VNode[]
  }
}
</script>
```

```vue [Clone]
<script setup lang="ts">
// ...

export interface VfRangeSlots<
  // ...
> extends
  // ...
{
  counter: (props: { count: number }) => VNode[]
}
</script>
```

:::

```vue
<template>
  <!-- inside the layout, after the input -->
  <slot name="counter" :count="charCount">
    <component v-if="outlets.counter" :is="outlets.counter" :count="charCount" />
  </slot>
</template>
```

**Parts** — a node of your own gets a [part](/guide/parts) type, so users can target it with `:parts="{ counter: … }"` / `part:counter`; spread the bag onto the node:

::: code-group

```vue [Copy]
<script lang="ts">
import type { DomAttrsOf } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextParts {
    counter: DomAttrsOf<'span'>
  }
}
</script>
```

```vue [Clone]
<script setup lang="ts">
// ...

export interface VfRangeParts extends /* ... */ {
  // ...
  counter: DomAttrsOf<'span'>
}
</script>
```

:::

```vue
<template>
  <!-- inside the layout, after the input -->
  <span v-bind="parts.counter">{{ charCount }}</span>
</template>
```

`DomAttrsOf` accepts any HTML tag and types the part as that tag's attribute set; for a part that renders a registered Vueform component, use `PartOf<'ComponentName'>` instead, which resolves to a partial prop list of that component. For a node rendered in a loop, declare the part as a function of its runtime args — see [Callable Parts](/guide/parts#callable-parts).

**Classes** — the node gets a class key too: declare it, register the value with `useClasses`, and bind it — users style it through `classes` / `reclass` / `class:counter`:

::: code-group

```vue [Copy]
<script lang="ts">
import type { ClassValue } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextClasses {
    counter: ClassValue
  }
}
</script>
```

```vue [Clone]
<script setup lang="ts">
// ...

export interface VfRangeClasses extends /* ... */ {
  // ...
  counter: ClassValue
}
</script>
```

:::

```vue
<script setup lang="ts">
// ...
useClasses({ counter: 'vf-text-counter' })
</script>

<template>
  <!-- inside the layout, after the input -->
  <span :class="classes.counter">{{ charCount }}</span>
</template>
```

<span id="expose-interface">**Expose**</span> — members added through the [extension callback](#extending-the-logic) become typed on contexts obtained _outside_ the SFC (`find()`, `ContextOf`, `context$`) by declaring them on the expose interface. Given the earlier extension:

```ts
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots, (api) => {
    const charCount = computed(() => String(api.value.value ?? '').length)

    const clear = () => {
      api.value.value = null
    }

    return { charCount, clear } // [!code highlight]
  })
```

...the declaration that types it:

::: code-group

```vue [Copy]
<script lang="ts">
import type { ComputedRef } from 'vue'

declare module '@vueform/ui/components/VfText' {
  interface VfTextExpose {
    charCount: ComputedRef<number>
    clear: () => void
  }
}
</script>
```

```vue [Clone]
<script setup lang="ts">
// ...

export interface VfRangeExpose extends TextExpose {
  charCount: ComputedRef<number>
  clear: () => void
}
</script>
```

:::

::: warning Augmentation is additive
Declaration merging can add members, never remove or reshape existing ones — and the generics are just as fixed: augmentation can't add a type parameter or change an existing one's constraint. A copy always _extends_ the built-in's contract, which is also what keeps schemas, `find()`, conditions, and validation working against it. When the contract itself must change, you're no longer replacing the component but making a new one — a [clone](#copy-or-clone) when the blueprint's behavior still fits (its interfaces are yours to shape), [from scratch](#authoring-an-element-from-scratch) when it doesn't.
:::

#### Generics

Some of the interfaces are generic: `VfTextProps`, `VfTextEmits`, and `VfTextSlots` carry `TTranslate` / `TLanguages`, the parameters that narrow the model for [multilingual inputs](/guide/multilingual-inputs). Every parameter has a default, so augmentations can simply omit them — that's what the examples above do. When a member should _reference_ a parameter, repeat the interface's parameter list verbatim — say, declaring the `limit` prop from the earlier example so it turns per-language on translatable inputs:

```vue
<script lang="ts">
import type { LanguagesProp } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  > {
    /**
     * Maximum character count displayed next to the input —
     * per-language when the input is translatable.
     */
    limit?: TTranslate extends true
      ? Partial<Record<keyof TLanguages, number>>
      : number
  }
}
</script>
```

To see an interface's exact parameter list, hover it right here in the docs — or look it up in the source. In a clone the parameters are already spelled out on its interfaces — reference them directly, nothing to repeat.

Once the copy is registered, all of this is simply what `!VfText` _is_ for the rest of the app: the new props, events, slots, parts, and classes are recognized wherever the component appears — inline usage and, for elements, schema entries alike.

### Upstream and Updates

The division of labor is deliberate: the blueprint stays in the package and keeps receiving fixes and improvements with every update, while the SFC — markup, types, defaults — is yours alone. What that means differs by intent.

::: warning A copy is a fork
`copy` records provenance — source package, version, file hashes — but there's no `diff` / `update` command yet: upstream fixes and improvements stop reaching a copied component, and bringing them over means re-copying or merging by hand. Helper tooling for this is planned but not around the corner, so choose this path expecting to maintain what you copy.
:::

A clone never tracks upstream **by design**: it isn't diffed or updated, and nothing will ever overwrite it — `vueform.config.json` records its origin under `clones` purely as bookkeeping. A new element starts its life as your code.

## Authoring an Element from Scratch

A brand-new element type — behavior no built-in blueprint provides — combines everything above: a blueprint composing Vueform's feature factories, a component rendering it, `defaults`, types, and the registry augmentation. This is the same pattern the framework's own adapters use, and the best reference is the real thing: every element in the [Vueform repository](https://github.com/vueform) follows it, from `blueprints/*` to `components/Vf*`. Copy the closest existing element and adapt.

Fair warning: the blueprint/factory API is the deepest layer of Vueform and its conventions are still settling — expect to read source. Climb this high only when the _behavior_ itself is new: for the overwhelming majority of cases, a [custom template](/guide/templates) over an existing component or a [clone](#copy-or-clone) of an existing element delivers the result at a fraction of the surface area.
