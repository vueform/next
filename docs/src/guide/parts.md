---
outline: [2,3]
---

# Parts

Every Vueform component renders named internal pieces — **parts** — the `<input>` of `!VfText`, an element's label, a list's remove button, the tab bar of a tabbed form. A part override merges attributes onto one of them — or props, when the part is itself a component — and leaves the rest of the rendering untouched, which makes it the lightest tool for a test ID, an ARIA tweak, an extra listener, or a button variant. To replace what a part renders instead of adjusting it, reach for [slots](/guide/slots) and [templates](/guide/templates).

## Targeting a Part

The `parts` prop maps part names to attribute objects:

```ts
{
  email: {
    type: 'text',
    label: 'Email',
    parts: {
      input: { 'data-testid': 'email-input' },
    },
  },
}
```

Each value merges with what the component renders on that part:

- `class` and `style` combine with the built-in ones.
- `on*` keys (`onFocus`, `onKeydown`) become listeners that run alongside the component's own handlers.
- Every other key replaces the built-in value of the same name — the computed ARIA attributes included, which is exactly [how they're overridden](/guide/accessibility#overriding-aria-attributes).

Part keys are typed per component — the `parts` object autocompletes the component's part names, and each value is typed as its target tag's attribute set. Before any part value reaches the DOM it is filtered — `innerHTML`, `outerHTML`, and prototype keys are always dropped, and anything else can be banned through [`banAttrs`](/guide/security#banning-attributes).

### The `part:` Shorthand

`part:<name>` targets a single part directly:

```vue
<template>
  <VfText name="email" :part:input="{ 'data-testid': 'email-input' }" />
</template>
```

Both forms mix freely, but for the same part `part:<name>` replaces the `parts` entry wholesale — the two are never merged. And because `part:<name>` is a namespaced prop, [defaults](/guide/defaults) and [presets](/guide/presets) can set it — a test ID on every `!VfText` input, say — with the config, preset, and local values combining per [merging behavior](/guide/defaults#merging-behavior). A `part:<name>` coming from defaults or presets also outranks a local `parts.<name>`, so to adjust an inherited override locally, use `part:<name>`.

## The Root Part

Every component has a `root` part — its outermost element. For elements it's the layout wrapper (a `<div>` or `<fieldset>`, see [anatomy](/guide/element-layout#anatomy)), for `!VfForm` the `<form>` tag, and for the rest their own outer element.

`root` matters because Vueform components don't inherit attributes — `class`, `style`, `data-*`, and listeners written on an element's or the form's tag are dropped silently. `part:root` is how they reach the wrapper:

```vue
<template>
  <VfText name="email" :part:root="{ 'data-testid': 'email-field' }" />
</template>
```

The exception is `!VfButton` — it forwards tag attributes onto its `<button>` (or `<a>`), and so do `!VfIcon` and `!VfAddon`. Everywhere else the wrapper keeps its own classes, visibility handling, and fieldset wiring, and your `root` value merges in by the same rules as any other part.

### Without a Layout

With [`layout: false`](/guide/element-layout#removing-the-layout) the element renders no wrapper at all, so there is nothing to carry a `root` override. Setting one brings a wrapper back:

```vue
<template>
  <VfText name="search" :layout="false" :part:root="{ 'data-testid': 'search-field' }" />
</template>
```

The element renders a `<div class="vf-passthrough">` carrying your attributes, styled `display: contents` so it stays invisible to layout.

## Function Values

Any part value can be a function returning the attribute object. It receives the component's [context](/guide/context) and re-runs whenever the reactive state it reads changes:

```ts
{
  email: {
    type: 'text',
    label: 'Email',
    parts: {
      input: (el$) => ({ 'data-dirty': el$.dirty ? '' : undefined }),
    },
  },
}
```

Function values are code, so they are available in code-authored schemas but can't come from a JSON one.

### Callable Parts

Parts rendered once per item take per-instance arguments — `!VfList`'s `item` receives its drag state, `remove` and `sort` the item's `index`, an element's `addonBefore` and `addonAfter` the addon and its index, `!VfTabs`' `wrapper` the page it belongs to. A function value receives those arguments first, with the context appended last:

```ts
{
  guests: {
    type: 'list',
    schema: { name: { type: 'text' } },
    parts: {
      remove: (index) => ({ 'data-testid': `remove-guest-${index}` }),
    },
  },
}
```

A static object works on a callable part too and applies to every instance. Each callable part's arguments are spelled out by its signature in the component's `Vf*Parts` type, so autocomplete shows them as you type the function.

## Component Parts

When a part renders a Vueform component instead of a plain tag, its value is forwarded as that component's **props** — typed `PartOf<'VfButton'>` and the like, and listed on the reference page with the component as the part's element. This covers the `add`, `remove`, and `sort` buttons of `!VfList` and `!VfMatrix` and the `add` and `remove` of `!VfFile`, `!VfNav`'s `back`, `next`, and `finish`, addon parts (`!VfAddon`), icon parts (`!VfIcon`), and `!VfForm`'s `tabs`, `steps`, `nav`, `elements`, and `languages`:

```ts
{
  tags: {
    type: 'list',
    schema: { tag: { type: 'text' } },
    parts: {
      add: { variant: 'outlined' },
    },
  },
}
```

Because the forwarded props include the target's own `parts`, overrides nest as deep as the component tree goes — note that the key is the part's name (`tabs`), not the component's:

```vue
<template>
  <VfForm tabbed :parts="{ tabs: { parts: { tab: { 'data-testid': 'form-tab' } } } }">
    <!-- pages -->
  </VfForm>
</template>
```

Anything else the target component accepts works the same way — `classes`, `slots`, and listeners included.

## State Attributes

Parts carry built-in `data-*` attributes that reflect component state — `data-invalid` on an errored input, `data-selected` on the active tab wrapper, `data-dragging` on a list row being dragged, `data-variant="outlined"` on a button. Boolean states are presence attributes (`data-loading=""` while loading, absent otherwise), enumerated ones carry their value (`data-align="right"`), so CSS targets them with attribute selectors like `[data-invalid]`.

They exist alongside the ARIA attributes rather than replacing them — why the two stay separate, and the native `disabled` exception, is covered in [ARIA vs. styling attributes](/guide/accessibility#aria-vs-styling-attributes). Each component's state attributes are typed on its `Vf*Bindings` interface (`VfTextBindings`, `VfListBindings`), which plugins [extend by augmentation](/guide/plugins#augmenting-types).

## The Bindings Bag

For every part the component merges its state attributes and ARIA attributes in registration order and puts your override on top — the result is the part's **bindings bag**, and your override always wins. Classes are never in the bag — they resolve separately, through the [class override chain](/guide/classes).

The bag matters once you replace a part's markup. A slot that replaces a part receives the resolved bag as its `bindings` prop — per-item parts included — and spreading it keeps the user's part overrides, the state attributes, and the ARIA wiring alive in your markup:

```vue
<template>
  <VfList name="guests" :schema="{ name: { type: 'text' } }">
    <template #item="{ bindings }">
      <div v-bind="bindings">
        <!-- custom row markup -->
      </div>
    </template>
  </VfList>
</template>
```

Since the bag carries no classes, the replacement markup brings its own. Custom templates consume the same bags through the context, calling one per part — `bindings.input()`, `bindings.item(…)` — as [templates](/guide/templates) shows.

## Finding a Component's Parts

Every component's reference page has a **Parts** tab listing each part's tag or component and its classes, with a live viewer of the part tree — see [VfText](/components/VfText#parts), [VfList](/components/VfList#parts), or [VfForm](/components/VfForm#parts). Adapters render their own structure, so part names can differ between adapters. To introduce parts in markup of your own, see [typing new keys](/guide/templates#typing-new-keys) in templates and [components](/guide/components).
