---
outline: [2,3]
---

# Classes

[Themes and tokens](/guide/themes-tokens) change the values behind Vueform's CSS; the class layer changes which classes render at all — Tailwind utilities on an input, or your own class names in place of the theme's. Every part of a component's markup has a class key, and every class on it resolves through one fixed chain of defaults and overrides, so a class can be added or replaced for a single instance, a group of instances, or the whole app.

## Adding Classes

The `classes` prop takes an object keyed by **class key**, and each value is merged with the classes the key already has:

```vue
<template>
  <VfForm>
    <VfText
      name="email"
      label="Email"
      :classes="{
        input: 'font-mono tracking-wide',
        label: 'font-semibold',
      }"
    />
  </VfForm>
</template>
```

The input now renders `vf-input vf-text-input font-mono tracking-wide` — the defaults stay, the additions land after them.

Class keys name the component's **parts** — the same names the `parts` prop targets (see [parts](/guide/parts)) — so a key is a stable handle for one spot in the markup regardless of theme or template.

Each element has one flat key map. Its own keys (`!VfText`'s `input`) sit next to the shared keys every element gets from the [element layout](/guide/element-layout) — `root`, `label`, `elementGroup`, `errors`, and the rest — and both kinds go in the same `classes` object, as the example above already does. `root` is a shared key the element also defines for itself, so its own value (`vf-text`) merges with the layout's (`vf-element` plus the spacing classes).

To find a component's keys and their default classes, open the **Parts** tab of its reference page — [`!VfText`'s](/components/VfText#parts), for example.

A component rendered inside another one — the `!VfTabs` of a tabbed form — takes its `classes` through the host's `parts` prop, which forwards to nested components (see [component parts](/guide/parts#component-parts)).

### Class Values

A class value is anything Vue's `:class` accepts — a string, an array, a conditional object, or a mix of them. Refs are accepted anywhere inside the value — as the whole value, an array member, or a condition in a conditional object — and stay reactive, which matters in a schema, where there's no template to unwrap them:

```ts
const highlighted = ref(false)

const schema = {
  email: {
    type: 'text',
    label: 'Email',
    classes: {
      input: ['font-mono', { 'ring-2': highlighted }],
    },
  },
}
```

Toggling `highlighted` adds and removes `ring-2` on the input without touching the schema.

## Replacing Classes

When the default classes are in the way rather than a starting point, `reclass` replaces the key's base classes instead of merging with them:

```ts
email: {
  type: 'text',
  label: 'Email',
  reclass: { input: 'ticket-input' },
},
```

Only the base is replaced — `classes` for the same key still merges on top, so a `reclass` of `ticket-input` plus a `classes` of `extra` renders `ticket-input extra`. To remove a key's classes entirely, replace them with an empty array (`reclass: { input: [] }`).

### Shorthands

Both props have a single-key attribute form, typed per component so only real keys are accepted:

```vue
<template>
  <VfText name="email" label="Email" class:input="font-mono" />
  <VfText name="code" label="Code" reclass:input="code-input" />
</template>
```

`class:` merges after the `classes` prop. `reclass:` only applies when no `reclass` object — local, from [defaults](/guide/defaults), or from [presets](/guide/presets) — sets that key.

The plain Vue `class` prop works on Vueform components too, merging into the root key (every key whose name starts with `root`). Unlike `classes`, it doesn't merge across defaults, presets, and local values — the closest one wins, as [Override Priority](#override-priority) details.

With `layout: false` the element renders without its wrapper, so there's no node for root classes to land on — see [removing the layout](/guide/element-layout#removing-the-layout).

## Contextual Classes

Any class value can be a function of the component's [context](/guide/context#context-from-argument), re-resolved as the state it reads changes:

```ts
email: {
  type: 'text',
  label: 'Email',
  classes: {
    input: (el$) => (el$.hasError ? 'border-red-500' : 'border-slate-300'),
  },
},
```

Contextual functions work the same in `classes`, `reclass`, the shorthands, and the global [`reclass` config](#global-classes).

For state-dependent *styling*, check the component's [state attributes](/guide/parts#state-attributes) first — built-in components already expose state as `data-*` attributes (`data-invalid` on an errored input, for one), so plain CSS on those usually beats a contextual class. Reach for a function when the class itself must change, as with utility frameworks.

## Keys with Arguments

A few keys are functions the template calls with per-render arguments:

| Key | Arguments |
| --- | --- |
| `root` (every element) | The element's resolved props, which drive the spacing and divider classes. |
| `labelGroup` | The element's `heading` prop. |
| `addonBefore` / `addonAfter` | The addon and its index. |
| `cell` (`!VfGrid`) | `{ colHeader, rowHeader, schema }` of the cell. |

Overriding such a key takes either a static value — merged into every call's result through `classes`, or replacing it through `reclass` — or a function with the same arguments, which receives the context appended as the last one:

```ts
addonBefore: ['$', '€'],
classes: {
  addonBefore: (addon, index, el$) => (index === 0 ? 'rounded-l-md' : null),
},
```

The trap to know about is `root` — it's functional on every element, so a function there receives the element's props first and the context only second, unlike on non-functional keys where the context is the first and only argument.

## Global Classes

The `reclass` config option replaces classes app-wide, keyed by component name, `'*element'` (every element), or `'*'` (every component):

```ts
createVueform({
  reclass: {
    VfText: { input: 'ticket-input' },
    '*element': { label: 'ticket-label' },
    '*': { root: 'ticket-root' },
  },
})
```

Per key, the most specific target wins — a `VfText` entry beats `'*element'`, which beats `'*'` — and entries don't combine.

*Adding* classes app-wide or per group is `classes` set through [defaults](/guide/defaults) or [presets](/guide/presets). A `reclass` coming from defaults or presets resolves like the local prop, so it also beats the global `reclass` config.

### Layout Classes

The `layoutClasses` config option swaps the [element layout](/guide/element-layout)'s shared classes app-wide, per key, at the very bottom of the chain:

```ts
createVueform({
  layoutClasses: {
    label: 'ticket-label',
    errors: 'ticket-errors',
  },
})
```

The difference from `reclass['*element']` is scope. `layoutClasses` replaces only the layout's contribution — an element's own `root` value (`vf-text`) still merges in, and a static value on a functional key stays callable — while `reclass` replaces the key's entire base value. The option reference is at [configuration](/guide/configuration#layoutClasses).

## Override Priority

Per class key, the chain resolves from the bottom up:

1. **Base** — the layout's shared classes (after [`layoutClasses`](#layout-classes)) merged with the component's own; a custom template's `!useClasses` replaces the component's own value per key (see [templates](/guide/templates#classes)).
2. **Global `reclass` config** — replaces the base.
3. **`reclass` prop** — defaults, presets, and local values resolve into one object (local beating presets beating defaults per key) that replaces again; the `reclass:` shorthand fills in only for keys none of them set.
4. **`classes` prop** — merged on top; defaults, presets, and local values all merge rather than override (see [merging `class` and `classes`](/guide/defaults#merging-class-and-classes)).
5. **`class:` shorthand** — merged after `classes`.
6. **`class` prop** — resolves closer-wins like any plain prop (a local `class` beats presets, which beat defaults, and a component-specific default beats `'*'`), and only that single winning value merges into the root keys at render.

The resolved map is readable on any [context](/guide/context) as `classes` — `form$.find('email')?.classes.input` — which is also what custom [templates](/guide/templates#classes) bind.

## Class Helpers

With `classHelpers` on, every non-empty class value gets a marker prepended — `[__VfText.input__]` — tracing any class in the DOM back to its component and key right in the element inspector. The markers are inactive whenever `NODE_ENV` is `production`, so leaving the option on is safe. `classHelper` customizes the marker and receives the `Component.key` path:

```ts
createVueform({
  classHelpers: true,
  classHelper: (key) => `[${key}]`, // default: (key) => `[__${key}__]`
})
```

Both options are documented in [configuration](/guide/configuration#classHelpers).
