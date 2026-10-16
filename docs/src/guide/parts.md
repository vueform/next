---
outline: [2,3]
---

# Parts

A **part** is a named internal piece of a Vueform component — usually a DOM element (the `<input>` of a text field, the `<label>` tag), sometimes a nested component (the `VfTabs` a tabbed `!VfForm` renders). The `parts` prop reaches into that internal markup and merges attributes onto a specific part — or props onto a nested component — without replacing any slots or templates.

Reach for parts when you need to touch one spot in a component's rendering — an ARIA attribute, a test ID, a listener on the raw input, a prop on an internal component — and everything else should stay exactly as it is. If you instead want to _replace_ what renders there, that's [Slots](/guide/slots) and [Templates](/guide/templates).

Here is `VfText`'s part tree. Every name in it is a valid key for `parts` — select one to see which element it renders, and the tag your attributes would be merged onto:

<VPParts
component="VfText"
:examples="{
default: 'Default',
}"
:schema="{
label: 'Username',
help: 'Letters, numbers and underscores only',
rules: 'required',
showRequired: ['label'],
onMounted: ({ messageBag }) => {
messageBag.append('Username is already taken', 'error')
messageBag.append('Username is available', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfText
      name="default"
      v-bind="schema"
    />
</template>
</VPParts>

Every component's reference page carries this same viewer for its own part tree — [VfText](/components/VfText#parts) is one example; see [Discovering Available Parts](#discovering-available-parts) for how to find the rest.

## Basic Usage

Pass an object to `parts`: keys are part names, values are the attributes to merge onto them.

::: code-group

```ts [Schema]
defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    parts: {
      input: { 'data-testid': 'email-input' }, // [!code highlight]
    },
  },
})
```

```vue [Template]
<VfText
  name="email"
  label="Email"
  :parts="{
    input: { 'data-testid': 'email-input' },
  }"
/>
```

:::

The `data-testid` lands on `VfText`'s internal `<input>`, merged with whatever the component would normally render there. Event listeners work too — `onFocus`, `onKeydown`, any `on*` key becomes a listener on that part.

## Shorthand Syntax

A single part can be targeted directly with the `part:` prefix instead of building the full object:

```vue
<VfText
  name="email"
  label="Email"
  :part:input="{ 'data-testid': 'email-input' }"
/>
```

The two styles mix freely; a `part:*` attribute takes precedence over the same key inside `parts`. And since `part:<key>` behaves as a prop, [Defaults](/guide/defaults) and [Presets](/guide/presets) can target parts as well — e.g. a preset adding a test ID to every text input's `input` part.

::: tip
The prefix is singular (`part:input`) while the object prop is plural (`parts`) — that's the naming convention, not a typo.
:::

## The Root Part

Every component has a `root` part: the outermost element it renders. For form elements that's the [layout](/guide/element-layout) wrapper — a `<div>`, or a `<fieldset>` for containers with a label; for `!VfForm` it's the `<form>` tag, and for `VfTabs`, `VfRow`, and the rest their outer `<div>`.

`root` matters because attributes written directly on the component tag **do not** reach the DOM — Vueform components render through slots, so there is no single element for Vue to forward them to, and they're dropped silently. To put an attribute on the wrapper, target `root`:

::: code-group

```ts [Schema]
defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    parts: {
      root: { 'data-testid': 'email-field' }, // [!code highlight]
    },
  },
})
```

```vue [Template]
<VfText
  name="email"
  label="Email"
  :part:root="{ 'data-testid': 'email-field' }"
/>
```

:::

The `data-testid` lands on the `<div class="vf-element …">` wrapping the whole field, not on the `<input>` — use `input` for that. The wrapper also carries the element's built-in attributes (its classes, `hidden` when invisible, the ARIA wiring of a fieldset); a `root` value merges with them, with `class` and `style` concatenating rather than replacing.

With [`layout: false`](/guide/element-layout#removing-the-layout) the element normally renders its bare control with no wrapper at all. Giving it a `root` part brings one back — a `<div class="vf-passthrough">` carrying your attributes around the control. The class sets `display: contents`, so the wrapper exists in the DOM (for your attributes, test IDs, and listeners) but is invisible to layout — the control sits in the surrounding flow exactly as it would without it:

```vue
<VfText
  name="search"
  :layout="false"
  :part:root="{ 'data-testid': 'search-field' }"
/>
```

```html
<div class="vf-passthrough" data-testid="search-field">
  <input type="text" name="search" … />
</div>
```

## Context-Aware Functions

A part's value can be a function receiving the component's [Context](/guide/context) and returning the attribute object. It re-runs whenever the reactive state it reads changes, keeping the attributes in sync with the form:

::: code-group

```ts [Schema]
defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    parts: {
      input: (el$) => ({
        'aria-invalid': el$.invalid,
        'aria-describedby': el$.invalid ? `${el$.id}-error` : undefined,
      }),
    },
  },
})
```

```vue [Template]
<VfText
  name="email"
  label="Email"
  :part:input="(el$) => ({
    'aria-invalid': el$.invalid,
    'aria-describedby': el$.invalid ? `${el$.id}-error` : undefined,
  })"
/>
```

:::

The argument is the same context you'd get from `form$.find('email')`.

## Callable Parts

Some parts render in a loop, so the component hands them per-instance values — `VfList`'s `item` part receives the row's drag state, an addon part receives the addon and its index. These **callable parts** take their runtime arguments first, with the context available as one extra trailing argument if you accept it:

::: code-group

```ts [Schema]
defineSchema({
  price: {
    type: 'text',
    label: 'Price',
    before: ['$', '%'],
    parts: {
      beforeAddon: (addon, index, el$) => ({
        'data-addon-index': index,
        'data-path': el$.path,
      }),
    },
  },
})
```

```vue [Template]
<VfText
  name="price"
  label="Price"
  :before="['$', '%']"
  :parts="{
    beforeAddon: (addon, index, el$) => ({
      'data-addon-index': index,
      'data-path': el$.path,
    }),
  }"
/>
```

:::

Each callable part's runtime arguments are documented next to the part in the component's reference.

## Forwarding to Nested Components

When a part is itself a component — `!VfForm`'s nested `VfTabs`, `VfSteps`, or `VfNav` — the value is forwarded as **props** instead of attributes. Anything the target accepts works: its `classes`, its slots, its event handlers, and, most usefully, its own `parts`:

::: code-group

```ts [Schema]
import { useForm } from '@vueform/ui'

const [Form] = useForm({
  schema,
  tabbed: true,
  parts: {
    VfTabs: {
      parts: {
        tab: { 'data-testid': 'form-tab' }, // [!code highlight]
      },
    },
  },
})
```

```vue [Template]
<VfForm
  tabbed
  :parts="{
    VfTabs: {
      parts: {
        tab: { 'data-testid': 'form-tab' },
      },
    },
  }"
>
  <!-- ... -->
</VfForm>
```

:::

This reaches through the form into the `VfTabs` it renders and stamps every tab `<button>` with the test ID. Because parts forward as props, the nesting goes as deep as the component tree does — the simplest way to configure a deeply internal component without custom templates.

## Discovering Available Parts

Every component's reference page lists its parts under a **Parts** section — the tag each renders, its position in the layout, and the runtime arguments of callable ones. Pick the component in the top navigation's **Components** tab — e.g. [VfText](/components/VfText#parts), [VfList](/components/VfList#parts), or [VfForm](/components/VfForm#parts) — and scroll to **Parts**.

::: info
Parts can differ between adapters — each adapter renders its own internal structure. Consult the reference of the adapter you're using for the exact list.
:::
