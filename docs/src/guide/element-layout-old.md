---
outline: [2,3]
---

# Element Layout

Every element renders inside the same layout wrapper — `VfLayout`. It provides the element's **layout** (sometimes called the element's _chrome_): everything around the element's core control. The label, the required indicator, help and description texts, validation errors, info messages, icons, addons, and the accessibility wiring between them all come from this shared layer. Each element type only supplies what's unique to it — the `<input>` for `VfText`, the child elements for `VfGroup`, the button tag for `VfButton`. This is not to be confused with arranging elements on a grid — rows, columns, and sizing are covered in [Form Structure](/guide/form-structure).

Because the layout is shared, everything in this chapter applies to every element the same way. This chapter walks through each part of it — how to configure it, and how to hide, replace, or extend it.

## Anatomy

This is the structure `VfLayout` renders around an element's control, shown live on a `VfText` — select a part in the tree to highlight what it renders, or switch to the HTML tab for the rendered markup:

<VPParts
component="VfText"
:examples="{
default: 'Default',
icons: 'With Icons',
addons: 'With Addons',
multilingual: 'Multilingual',
}"
:schema="{
label: 'Username',
help: 'Letters, numbers and underscores only',
hint: 'This will be your public display name',
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
<template #example-icons="{ schema }">
<VfText
      name="icons"
      v-bind="schema"
      icon-before="user"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfText
      name="addons"
      v-bind="schema"
      addon-before="https://"
      addon-after=".com"
    />
</template>
<template #example-multilingual="{ schema }">
<VfText
      name="multilingual"
      v-bind="schema"
      :languages="{
        en: 'English',
      }"
      translate
    />
</template>
</VPParts>

Each of these is a named [Part](/guide/parts) — the handle you use to target it with the `parts` prop, restyle it via [Classes](/guide/classes), or replace its content with a [Slot](/guide/slots):

| Part | What it wraps |
| --- | --- |
| `root` | The outermost wrapper. A `<div>` for plain elements, a `<fieldset>` for containers with a label. |
| `labelGroup` | Holds the label, the required indicator, and the help text. |
| `label` | The label tag itself (`<label>` for inputs, `<span>` or `<h1>`–`<h6>` for containers). |
| `required` | The required indicator. |
| `help` | Help text shown next to the label. |
| `elementGroup` | The column that holds the control, description, errors, and messages. |
| `elementWrapper` | The wrapper directly around the control. |
| `description` | Description text shown below the control. |
| `errors` / `error` | Validation error container and individual entries. |
| `messages` / `message` | Info message container and individual entries. |

A few parts only appear when the element calls for them:

| Part | When it appears |
| --- | --- |
| `addonGroup` | Wraps the control together with its [addons](#addons) — rendered when the element has any addon (including the [language addon](#the-language-addon)). |
| `iconGroup` | Wraps the control together with its [icons](#icons) — rendered when the element has an icon or shows the [loading indicator](#loading-indicator). |
| `panel` | A tab/step panel wrapper — rendered when the element sits inside a paged container. See [Multi-Page Forms](/guide/multi-page-forms). |
| `tabs` | The tab bar of a tabbed container — rendered when the element itself has the `tabbed` prop (e.g. a tabbed `VfGroup`). See [Multi-Page Forms](/guide/multi-page-forms). |

::: tip
Each element's full part tree — including its own input-specific parts like `input` — is documented on its component page under the **Parts** tab, with an interactive preview of the structure in different states. See [VfText Parts](/components/VfText#parts) for an example.
:::

To see how elements build on this, here's a stripped-down look at how `VfText` is put together internally — notice it only supplies the `<input>` tag, while `VfLayout` takes care of everything around it:

```vue
<!-- VfText's template (simplified) -->
<template>
  <VfLayout>
    <input
      :type="inputType"
      :id
      :name
      v-model="value"
      :placeholder
      :disabled
      :readonly
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </VfLayout>
</template>
```

With just that, the text input gains the full layout — label, help and description texts, validation errors, ARIA wiring, columns. Every other element is built the same way: `VfCheckbox` puts a checkbox control inside `VfLayout`, `VfSelect` puts a dropdown, `VfGroup` puts its child elements, and so on.

::: info
`VfHidden` is the one exception — since it has no visible UI at all, it skips `VfLayout` entirely and renders a bare `<input type="hidden">`, or nothing at all with `meta: true`.
:::

## Label

The label sits above the element by default. Pass any [TextProp](/guide/dynamic-props) — a plain string, a locale map, a ref, or a function — and Vueform renders it. For inputs it's a real `<label>` wired to the underlying control via `for` / `id`:

::: usage

```vue [Preview]
<VfText name="email" label="Email" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: 'Email',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Containers render their label as the heading of a `<fieldset>` root, connected via `aria-labelledby` — so a `VfGroup`'s label announces the whole group to assistive technologies.

### Headings

Container elements render their `label` as regular-sized label text like any other element. To promote it to a section heading, set the `heading` prop to a number from `1` to `6` — it maps directly to `<h1>` through `<h6>`:

::: usage

```vue [Preview]
<VfGroup name="address" label="Address" :heading="2">
  <VfText name="street" label="Street" />
  <VfText name="city" label="City" :columns="6" />
  <VfText name="zip" label="ZIP" :columns="6" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  address: {
    type: 'group',
    label: 'Address', // [!code highlight]
    heading: 2, // [!code highlight]
    schema: {
      street: { type: 'text', label: 'Street' },
      city: { type: 'text', label: 'City', columns: 6 },
      zip: { type: 'text', label: 'ZIP', columns: 6 },
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Use this when a container serves as a **section header** in the form — typically when it wraps a larger set of fields (address details, contact info, billing data) that benefit from a visual break above them. See [Spacing & Dividers](/guide/form-structure#spacing-dividers) for adding extra space or visual separators between sections.

### Hiding the Label

Set `hideLabel: true` to remove the label visually while keeping the element accessible:

::: usage

```vue [Preview]
<VfText
  name="search"
  label="Search"
  hide-label
  placeholder="Search…"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  search: {
    type: 'text',
    label: 'Search',
    hideLabel: true,
    placeholder: 'Search…',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The label group isn't rendered, but a screen-reader-only `<label>` still is — using the element's resolved `genericName` as its text. The same happens when no label is set at all, so even a bare `<VfText name="email" />` announces "email" to assistive technologies. See [Accessibility](/guide/accessibility#labels) for how the accessible name resolves and how to control it with `displayName`.

## Required Indicator

When an element has a label and a `required` validation rule, Vueform renders the required indicator (a `*` by default) next to the label:

::: usage

```vue [Preview]
<VfText name="email" label="Email" rules="required" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    rules: 'required',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The `showRequired` prop controls where the indicator appears — on the element, on the form (for all elements), or in the global config:

- `['label']` — next to the label (the default)
- `['placeholder']` — appended to the placeholder
- `['label', 'placeholder']` — both
- `false` — no indicator

See [Required Indicators](/guide/validation#required-indicators) in the Validation chapter.

## Help and Description

`help` renders a short explanatory text next to the label; `description` renders a longer one under the control. Both accept any [TextProp](/guide/dynamic-props), so both can be localized, reactive, or contextual — and both apply to every element:

::: usage

```vue [Preview]
<VfText
  name="email"
  label="Email"
  help="Used for login and notifications."
  description="We'll send a confirmation link to this address."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    help: 'Used for login and notifications.',
    description: "We'll send a confirmation link to this address.",
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

::: tip Help vs. description?
`help` explains what the element is for — it sits with the label, like the label's chattier sibling. `description` guides filling it in — longer-form text that sits under the control.
:::

Both texts are wired into the control's `aria-describedby`, so screen readers announce them alongside the label — see [ARIA Attributes](/guide/accessibility#aria-attributes).

## Errors and Messages

When validation fails on an input, the resulting error messages render below the element in the `errors` part — a live `role="alert"` region, one entry per failing rule. They appear automatically as the user interacts with the element:

::: usage validate

```vue [Preview]
<VfText
  name="email"
  label="Email"
  rules="required|email"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    rules: 'required|email',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The layout only handles the display — everything about _what_ gets displayed and _when_ lives in the [Validation](/guide/validation) chapter:

- [Where Errors Appear](/guide/validation#where-errors-appear) — the `errorLevel` prop for element-level vs. form-level display
- [Hiding Errors](/guide/validation#hiding-errors) — the `hideErrors` prop to suppress the error block while validation still runs
- [Hoisting Errors](/guide/validation#hoisting-errors) — the `hoist` prop to surface an element's errors on its parent

Elements can also display **info messages** — non-error text rendered in the same area below the control. Use `messageBag.append()` on the element's [Context](/guide/context) to add one:

::: usage

```vue [Preview]
<VfText
  name="username"
  label="Username"
  @mounted="(el$) => el$.messageBag.append(
    '✓ Username is available',
    'message'
  )"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    onMounted: (el$) => {
      el$.messageBag.append(
        '✓ Username is available',
        'message'
      )
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

See [Manual Errors](/guide/validation#manual-errors) for the full `messageBag` API — appending, prepending, removing, and clearing both errors and messages.

## Icons

Elements that wrap a single text-like control (`VfText`, `VfTextarea`, `VfSelect`, `VfField`) accept `iconBefore` and `iconAfter` props to display icons inside the input area:

::: usage

```vue [Preview]
<VfText name="search" placeholder="Search..." icon-before="search" />
<VfText name="email" placeholder="Email" icon-after="envelope" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  search: {
    type: 'text',
    placeholder: 'Search...',
    iconBefore: 'search',
  },
  email: {
    type: 'text',
    placeholder: 'Email',
    iconAfter: 'envelope',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The value you pass is resolved through the `icon` function in your Vueform config. By default it returns the name as-is, so you can pass a CSS class directly. Override the resolver to integrate any icon library:

```ts
createVueform({
  icon: (name) => `fa-solid fa-${name}`,
})
```

### Loading Indicator

Set the `loading` prop and a spinner renders in the after-icon position (replacing any `iconAfter` while active):

::: usage

```vue [Preview]
<VfText name="city" label="City" loading />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  city: {
    type: 'text',
    label: 'City',
    loading: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

`loading` is a [ConditionalProp](/api/useConditions#type-declarations.conditionalprop), so it can react to form state. The spinner also appears automatically while the element is `pending` — for example during a debounced or async validation rule.

The spinner's shape comes from the `iconLoading` [theming token](/guide/themes-tokens#token-tiers) — an SVG `url()` applied as a CSS mask. Override the token to swap in your own shape:

```ts
createVueform({
  tokens: {
    iconLoading: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 1.5a6.5 6.5 0 1 1-6.5 6.5' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  },
})
```

Because the SVG is used as a mask, only its shape matters — the color always follows the surrounding text color, the size comes from the `iconWidth` and `iconHeight` tokens, and Vueform applies the spinning animation itself, so provide a static (and preferably asymmetric) shape.

## Addons

Inputs that accept icons also accept `addonBefore` and `addonAfter` addons — content rendered alongside the control itself for prefix/suffix material like a currency symbol, a unit, or an inline button:

::: usage

```vue [Preview]
<VfText name="price" label="Price" addon-before="$" addon-after=".00" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  price: {
    type: 'text',
    label: 'Price',
    addonBefore: '$',
    addonAfter: '.00',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

An addon can be a plain string, a locale map (`{ en: '$', de: '€' }`), a full element schema, an array mixing any of those, or a function — each covered below.

### Multiple Addons

Pass an array to render several addons stacked on the same side:

::: usage

```vue [Preview]
<VfText name="price" label="Price" :addon-before="['$', 'USD']" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  price: {
    type: 'text',
    label: 'Price',
    addonBefore: ['$', 'USD'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

### Element Addons

An addon can be a full element schema, not just text. Use this for inline buttons, unit pickers, or anything else interactive — the addon renders as a real Vueform element with its own props and events:

::: usage

```vue [Preview]
<VfText
  name="search"
  placeholder="Search"
  :addon-after="{ type: 'button', text: 'Go', severity: 'primary' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  search: {
    type: 'text',
    placeholder: 'Search',
    addonAfter: {
      type: 'button',
      text: 'Go',
      severity: 'primary',
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Element and string addons can be mixed in the same array — for example, a numeric input with a unit picker and a help marker:

::: usage

```vue [Preview]
<VfText
  name="length"
  label="Length"
  :addon-after="[
    { type: 'select', name: 'unit', items: ['cm', 'm', 'km'], default: 'cm' },
    '?',
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  length: {
    type: 'text',
    label: 'Length',
    addonAfter: [
      {
        type: 'select',
        name: 'unit',
        items: ['cm', 'm', 'km'],
        default: 'cm',
      },
      '?',
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Any registered element type can be used as an addon — the schema's `type` resolves to the matching `Vf*` component. In practice the compact ones work best:

- `button` — an inline action next to the field.
- `select` — a unit or mode picker.
- `checkbox` — a small toggle, e.g. a case-sensitive switch on a search input.
- `radio` — mutually exclusive toggles. Give the radios a shared `radioName` to wire them into the same browser-level radio group, so selecting one deselects the others; each still has its own form-model `name` and stores its `radioValue` when active.

### Functional Addons

For addons that depend on form state, pass a function. It receives the element [Context](/guide/context) and reruns reactively on each change. Return a string, a locale map, or an array of addon items:

::: usage

```vue [Preview]
<VfText
  name="username"
  label="Username"
  :addon-after="(el$) => `${20 - (el$.value ?? '').length} left`"
/>
```

```vue [Template]
<script setup lang="ts">
const counter = (el$: any) => `${20 - (el$.value ?? '').length} left`
</script>

<template>
  <VfText name="username" label="Username" :addon-after="counter" />
</template>
```

```vue [Live]
<VfText
  name="username"
  label="Username"
  :addon-after="(el$) => `${20 - (el$.value ?? '').length} left`"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    addonAfter: (el$) => `${20 - (el$.value ?? '').length} left`,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Here the after-addon recomputes on every keystroke to show how many characters are left.

### Addon Validation

When an element addon has its own validation rules, **its errors surface in the parent input's error block**, not next to the addon. This keeps a single error region per form row even when the row contains several sub-elements:

::: usage validate

```vue [Preview]
<VfText
  name="amount"
  label="Amount"
  :addon-after="{
    type: 'select',
    name: 'currency',
    items: ['USD', 'EUR'],
    rules: 'required',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  amount: {
    type: 'text',
    label: 'Amount',
    addonAfter: {
      type: 'select',
      name: 'currency',
      items: ['USD', 'EUR'],
      rules: 'required',
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

If `currency` is empty, the "required" message shows up under the parent `amount` element. From the user's perspective the whole row is one cohesive input — the addon's errors live where the eye is already trained to look.

Under the hood this uses error **hoisting**: addon elements render with the `hoist` prop enabled, which pushes an element's errors to its nearest ancestor element. Any element can opt in — see [Hoisting Errors](/guide/validation#hoisting-errors).

### Slot Addons

For full control over the addon markup — custom classes, arbitrary structure, components Vueform doesn't ship — use the `addon-before` and `addon-after` slots. They replace the corresponding addon section entirely, so the matching prop is bypassed when the slot is present. Wrap your content in `<VfAddon>` to keep the standard addon wrapper styling:

::: usage

```vue [Preview]
<VfText name="search" label="Search">
  <template #addon-after>
    <VfAddon>
      <button class="my-search-btn" type="button">🔍</button>
    </VfAddon>
  </template>
</VfText>
```

```vue [Schema]
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const SearchBtn = defineSlot('VfText.addon-after', {
  setup: () => {
    const VfAddon = resolveComponent('VfAddon')

    return () =>
      h(VfAddon, () =>
        h('button', { class: 'my-search-btn', type: 'button' }, '🔍')
      )
  },
})

const schema = defineSchema({
  search: {
    type: 'text',
    label: 'Search',
    slots: { 'addon-after': SearchBtn },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

`<VfAddon>` gives you the wrapper styling for free; what you put inside is yours to shape. Validation routing is a different story — it kicks in only when an addon comes through the `addonBefore` / `addonAfter` prop and `VfAddon` resolves it into a child element internally. Slot content — even wrapped in `<VfAddon>` — bypasses that mechanism. If you need a sub-element that participates in the form model, prefer the [element addons](#element-addons) form so its errors surface on the parent as usual.

### The Language Addon

One addon renders itself: on a [translatable element](/guide/multilingual-inputs) (`translate: true`), the per-element language switcher appears in the after-addon position, alongside any addons you define:

::: usage

```vue [Preview]
<VfText
  name="title"
  label="Title"
  translate
  :languages="{ en_US: 'English', de_DE: 'Deutsch' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  title: {
    type: 'text',
    label: 'Title',
    translate: true,
    languages: { en_US: 'English', de_DE: 'Deutsch' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

See [Per-Element Language Switcher](/guide/multilingual-inputs#per-element-language-switcher) for configuring or replacing it.

## Columns, Spacing, and Dividers

`VfLayout` is also where the form's grid attaches to each element:

- The `columns` prop sizes the element within the 12-column grid — and can split the width **between the label and the control**, producing horizontal labels. See [Form Structure](/guide/form-structure) and [Horizontal Labels](/guide/form-structure#horizontal-labels).
- `spaceTop`, `spaceBottom`, `lineTop`, and `lineBottom` add vertical breathing room and divider lines above or below the element. See [Spacing & Dividers](/guide/form-structure#spacing-dividers).

## Removing the Layout

Set `layout: false` and the element renders only its control — no label, help, description, or errors:

::: usage

```vue [Preview]
<VfText name="q" placeholder="Bare input" :layout="false" />
```

```vue [Live]
<VfText
  name="q"
  placeholder="Bare input"
  :layout="false"
  class:input="vf-col-12"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  q: {
    type: 'text',
    placeholder: 'Bare input',
    layout: false,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The element still works like any other: it registers in the model, validates, and keeps its ARIA attributes. [Addons](#addons) and [icons](#icons) still render too — they belong to the control, not the layout. What disappears is everything around the control, which makes `layout: false` the tool for embedding an element into markup you fully control — a table cell, a toolbar, a custom composite widget.

Note that with the layout gone there is no error block either — pair `layout: false` with a form-level error summary ([Where Errors Appear](/guide/validation#where-errors-appear)) or handle errors in your surrounding markup.

## Replacing the Layout

`layout` accepts more than a boolean — pass a component and it renders **instead of** the default `VfLayout` layout, receiving the element's full [Context](/guide/context):

```ts
import { defineSchema } from '@vueform/ui'
import CompactLayout from './CompactLayout.vue'

defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    layout: CompactLayout,
  },
})
```

This swaps the layout for a single element. To restructure the layout for **every** element — or rewrite any other component's template — see [Templates](/guide/templates).

## Customizing the Layout

Short of replacing it wholesale, the layout can be customized at three levels — content, attributes, and styling.

### Slots

Every layout part that displays content has a matching slot that replaces it: `label`, `required`, `help`, `description`, `errors`, `messages`, `icon-before`, `icon-after`, `addon-before`, `addon-after`, and `language`. Use them for rich content where a plain [TextProp](/guide/dynamic-props) isn't enough:

::: usage

```vue [Preview]
<VfText name="email">
  <template #label>
    Email <em>(work address)</em>
  </template>
</VfText>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const Label = defineSlot('VfText.label', {
  setup: () => () => ['Email ', h('em', '(work address)')],
})

const schema = defineSchema({
  email: {
    type: 'text',
    slots: { label: Label },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Slots that replace generated content receive the data they'd otherwise render — the `errors` slot receives the element's error list, the `help` slot the resolved help text, and so on. In schemas, slots are passed via the `slots` property using [`defineSlot`](/guide/slots#defineslot) — see [Slots](/guide/slots) for the full mechanism, and each component's reference page (e.g. [VfText](/components/VfText)) for its complete slot list.

### Parts

The `parts` prop passes attributes — classes, `data-*` attributes, event listeners, props — onto any named part of the layout without replacing it:

```vue
<VfText
  name="email"
  label="Email"
  :parts="{
    label: { 'data-testid': 'email-label' },
    errors: { 'data-testid': 'email-errors' },
  }"
/>
```

See [Parts](/guide/parts) for the full syntax — shorthands, context-aware functions, and forwarding parts to child components — and [Discovering Available Parts](/guide/parts#discovering-available-parts) for finding what a component exposes.

### Classes and Tokens

The layout's look is driven by the theme: every part has a class key (`labelGroup`, `help`, `errors`, …) that can be extended with `classes` or replaced with `reclass`, and sizing/colors flow from design tokens that can be overridden globally, per form, or per element. Both have their own chapters — see [Classes](/guide/classes) and [Per-Form and Per-Element Tokens](/guide/themes-tokens#per-form-and-per-element-tokens).
