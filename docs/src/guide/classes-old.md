---
outline: [2,3]
---

# Classes

While [tokens](/guide/themes-tokens) offer a way to customize CSS aspects of components, they stop short of _which_ classes they render. When that's what you need to change — to apply Tailwind utilities directly to an input, replace a label's class with your own, or swap in a CSS module — turn to the class layer.

Every Vueform component assigns a default class to each of its internal parts (root, label, input, errors, and so on). This chapter walks through how to target those parts, add to or replace their default classes, and react to runtime state.

## Class Keys

Every class a component renders belongs to a **named part** of its markup, and that name is the part's **class key**. A class key is a stable handle for one spot in the rendered output: `VfText`'s `input` key means "the classes on its `<input>`", its `label` key means "the classes on its `<label>`" — regardless of which theme is active or how the surrounding markup evolves. Instead of chasing DOM elements with CSS selectors, you address the part by its key and Vueform applies your classes to the right element.

To see where keys come from, here is how `VfText` defines and renders its own (simplified):

```vue
<!-- VfText.vue (simplified) -->
<script setup lang="ts">
const { bindings, useClasses } = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  input: 'vf-input vf-text-input',
}))
</script>

<template>
  <VfLayout>
    <input v-bind="bindings.input" />
  </VfLayout>
</template>
```

The component declares a default class value under each of its keys, and its template binds each part's merged `bindings` bag, which carries the key's _resolved_ value under `class`: the declared default, plus whatever overrides the rest of this chapter is about — and whichever override mechanism you use, you always target a part by its key.

::: info
`VfText` renders more parts than its own template shows — the label, errors, and the rest come from the `VfLayout` wrapper (the shared [element layout](/guide/element-layout)). Their keys (`label`, `errors`, and so on) work just like `input`: they belong to the same flat key map, no matter which template renders the part. [Element Class Resolution](#element-class-resolution) covers where each of them is defined.
:::

## Adding and Replacing Classes

Use the `classes` prop to **add** classes to specific keys. The added value is merged with the component's default:

```vue
<VfText name="email" :classes="{ input: 'border-2' }" />
```

Use the `reclass` prop to **replace** the default class instead of merging:

```vue
<VfText name="email" :reclass="{ input: 'custom-input' }" />
```

What `reclass` replaces is the **base** class only — the two props compose, so a `classes` value passed for the same key is still merged on top of the replaced base:

```vue
<VfText
  name="email"
  :reclass="{ input: 'custom-input' }"
  :classes="{ input: 'extra' }"
/>
```

The result for `input` is `custom-input extra`.

### Shorthands

When you only need to target a single key, the `class:` and `reclass:` shorthand props are equivalent to passing a single-key object:

```vue
<VfText name="email" class:input="border-2" />
<VfText name="email" reclass:input="custom-input" />
```

Both shorthands are fully typed.

The standard Vue `class` prop is a shorthand for targeting the component's [root keys](#the-root-key) — its value is merged into every key whose name starts with `root`:

```vue
<VfText name="email" class="my-wrapper" />
```

### Class Value Formats

Class values accept the same formats as Vue's `:class` binding — a string, an array, a conditional object, or a mixed array. Conditional objects are useful when a class should depend on reactive state:

::: code-group

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'

const highlighted = ref(false)
</script>

<template>
  <VfForm>
    <VfText
      name="email"
      :classes="{
        input: 'border-2',
        label: ['font-medium', 'text-sm'],
        elementGroup: { highlight: highlighted },
        elementWrapper: ['rounded', { shadow: highlighted }],
      }"
    />
  </VfForm>
</template>
```

```ts [Schema]
import { ref } from 'vue'
import { defineSchema } from '@vueform/ui'

const highlighted = ref(false)

const schema = defineSchema({
  email: {
    type: 'text',
    classes: {
      input: 'border-2',
      label: ['font-medium', 'text-sm'],
      elementGroup: { highlight: highlighted },
      elementWrapper: ['rounded', { shadow: highlighted }],
    },
  },
})
```

:::

Conditional values also accept refs directly: pass the ref itself — as the Schema tab does with `highlighted` — and the class stays reactive, toggling whenever the ref changes.

## Dynamic Classes

Some class keys are **functions** — used when the class needs to reflect runtime state of the rendered part. For example, `VfList` defines its `item` key as a function that receives a `beingDragged` flag (among others) and emits `vf-list-item` plus `vf-dragging` while the row is being reordered.

When targeting a functional key with `classes`, pass either a static value (merged into the result on every call) or a function with the same signature:

```vue
<VfList name="tasks" :classes="{ item: 'my-item' }" />

<VfList
  name="tasks"
  :classes="{
    item: (beingDragged) => (beingDragged ? 'opacity-50' : ''),
  }"
/>
```

## Contextual Classes

Class values can also be **contextual** — receiving the element's [Context](/guide/context) lets them depend on the element's state. The context is provided differently depending on whether the class key is functional or not.

For a **non-functional** key, pass a function that takes the context as its only argument and returns a class value:

```vue
<VfText
  name="email"
  :classes="{
    input: (el$) => (el$.error ? 'border-red-500' : 'border-gray-300'),
  }"
/>
```

For a **functional** key (like `VfList`'s `item`), the context is appended as the **last argument** after the key's own runtime arguments. This keeps the original signature intact and lets you opt into the context only when you need it:

```vue
<VfList
  name="tasks"
  :classes="{
    item: (beingDragged, isDropTarget, el$) => [
      beingDragged ? 'opacity-50' : '',
      el$.path,
    ],
  }"
/>
```

The same shape applies to `reclass` and to the `class:` and `reclass:` shorthand props.

## The Root Key

One key every component has is `root` — the classes of its outermost rendered element:

```vue
<VfText name="email" :classes="{ root: 'my-wrapper' }" />
```

In case of elements, the root is not part of the component's own template: as seen in [Class Keys](#class-keys), `VfText`'s `root` classes land on the [element layout](/guide/element-layout) wrapper that `VfLayout` renders around it.

::: info
With [`layout: false`](/guide/element-layout#removing-the-layout) there is no layout wrapper for `root` classes to land on — target a control key directly instead, e.g. `:classes="{ input: 'vf-col-12' }"`.
:::

## Element Class Resolution

An element's class keys come from two sources. The component itself defines the keys of its own template, like `VfText`'s `input`. Every other key — `root`, `label`, `elementGroup`, `errors`, and the rest — belongs to `VfLayout`, the shared [element layout](/guide/element-layout) that wraps each element.

The defaults of these shared keys ship with the layout itself: `VfLayout` assigns them to its element when it mounts. That's why the wrapper structure looks and behaves the same across elements.

From the outside the distinction is invisible: each element exposes a single flat key map, and every mechanism in this chapter targets both kinds the same way — component and shared keys can sit next to each other in one `classes` object:

```vue
<VfText name="email" :classes="{ input: 'border-2', label: 'font-medium' }" />
```

## Global Class Configuration

For overrides that should apply to every instance of a component, use the `reclass` option on the global config:

```ts
createVueform({
  reclass: {
    VfText: {
      input: 'custom-input',
      elementGroup: 'custom-element-group',
    },
    VfCheckbox: {
      input: 'custom-checkbox',
    },
  },
})
```

Every `VfText` in the application now renders with `custom-input` in place of the default. A prop-level `reclass` on an individual instance always takes priority. Use `'*'` to target every component or `'*element'` to target every element.

### Defaults and Presets

The [`classes`](/guide/configuration#classes) and [`reclass`](/guide/configuration#reclass) props can also be set via [Defaults](/guide/defaults) and [Presets](/guide/presets):

```ts
createVueform({
  defaults: {
    VfText: {
      classes: { input: 'styled-input' },
    },
    '*element': {
      classes: { root: 'my-element' },
    },
  },
  presets: {
    compact: {
      classes: { root: 'compact-element', label: 'text-sm' },
    },
  },
})
```

```vue
<VfText name="email" :presets="['compact']" />
```

### Layout Classes

The shared classes every element starts from — `vf-element`, `vf-label`, `vf-errors`, and the rest — are defined by the [element layout](#element-class-resolution). To swap them app-wide, use the [`layoutClasses`](/guide/configuration#layoutclasses) config option — a key you set replaces that key's default, every other key stays:

```ts
createVueform({
  layoutClasses: {
    root: 'my-element',
    label: 'my-label',
  },
})
```

### Override Priority

For any given class key, the final value is resolved in this order (lowest to highest priority):

1. The component's own internal classes — the **base**. For elements, this is also where the layout's shared classes are added (see [Element Class Resolution](#element-class-resolution)).
2. The `config.reclass` option — **replaces** the base for any key it sets.
3. The component's resolved `reclass` prop — **replaces** the value again for any key it sets, winning over `config.reclass`. Per key, the prop resolves in the standard prop order: a value from [Defaults](/guide/defaults) is overridden by [Presets](/guide/presets), which are overridden by the local prop — the winning value is what replaces.
4. The component's resolved `classes` prop — **merged** on top. Unlike `reclass`, the sources don't override each other here: values from [Defaults](/guide/defaults), [Presets](/guide/presets), and the local prop are all **merged** together. This is also why a `classes` value from any of them survives a `reclass` — only the _base_ is replaced.
5. The component's `class:` shorthand and the `class` prop (the latter for every key starting with `root`) — merged last.

## Class Helpers

When iterating on styles, it can be hard to tell which class came from which component and key by reading the rendered DOM. Enable `classHelpers` to inject a marker string alongside every class value:

```ts
createVueform({
  classHelpers: true,
})
```

With class helpers enabled, the `input` key of a `VfText` includes a marker like `[__VfText.input__]`, making it easy to trace a class back to its source key in browser DevTools.

::: tip
Class helpers are only active in development (`NODE_ENV !== 'production'`). They are automatically stripped from production builds.
:::

Customize the marker format with the `classHelper` option:

```ts
createVueform({
  classHelpers: true,
  classHelper: (key) => `[${key}]`,
})
```

The function receives the full path (e.g. `VfText.input`) and returns the marker string to merge into the class value.
