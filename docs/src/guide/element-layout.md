---
outline: [2,3]
---

# Element Layout

Every element except `!VfHidden` renders its control inside one shared component, `!VfLayout`, which supplies everything around it — label, help and description, the required marker, errors and messages, icons and addons, and the ARIA wiring that connects them to the control. Because each element contributes only its control — the `<input>`, the `<select>`, a group's children — every prop in this chapter behaves the same on `!VfText`, `!VfSelect`, or `!VfGroup`. Placing elements on the grid is a different concern, covered in [form structure](/guide/form-structure).

## Anatomy

Each region of the layout is a named **part**. Hover the live element below to explore them:

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
description: 'This will be your public display name',
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

These parts are always available:

| Part | What it is |
| --- | --- |
| `root` | The outermost wrapper — a `<div>`, or a `<fieldset>` on a container with a label. |
| `labelGroup` | Holds the label, the required indicator, and the help text. |
| `label` | A `<label for>` on field elements; a `<span>` on choice elements (`!VfCheckbox`, `!VfRadio`, `!VfCheckboxes`, `!VfRadios`) and `!VfContent`; a `<span>` or `<h1>`–`<h6>` on containers. |
| `required` | The required indicator. |
| `help` | The help text below the label. |
| `elementGroup` | The control column — wrapper, description, errors, and messages. |
| `elementWrapper` | The immediate wrapper around the control. |
| `description` | The description below the control. |
| `errors` / `error` | The error list and each entry in it. |
| `messages` / `message` | The message list and each entry in it. |

These render only when called for:

| Part | Renders when |
| --- | --- |
| `iconGroup`, `iconBefore`, `iconAfter` | An icon or the loading spinner is present. |
| `addonGroup`, `addonBefore`, `addonAfter` | Any addon is present. The addon parts are callable, receiving `(addon, index)` per addon — see [callable parts](/guide/parts#callable-parts). |
| `language` | The element is translatable and renders its language addon. |
| `panel` | A `role="tabpanel"` wrapper while the element is a page of a paged container — see [multi-page forms](/guide/multi-page-forms). |
| `tabs` | The tab bar of a `tabbed` container. |

These names are the keys you target with [parts](/guide/parts) and [classes](/guide/classes), and each content part has a matching [slot](#slots); an element's full part tree, its own control parts included, is on its reference page — [`!VfText`'s](/components/VfText#parts), for example. An element simply places its control into `!VfLayout`'s default slot — the pattern is shown in [the standard layout](/guide/templates#the-standard-layout) — and `!VfHidden` is the only element that skips the layout, having no visible UI.

## Label

`label` is a [`TProp`](/guide/dynamic-props) — a plain string, a locale map, an expression, a ref, or a function of the element's [context](/guide/context):

::: usage

```vue [Preview]
<VfForm>
  <VfText name="email" label="Email address" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email address' },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

What tag it renders depends on the element. Field elements get a `<label>` whose `for` points at the control, so clicking it focuses the input. Containers turn their root into a `<fieldset>` named by the label through `aria-labelledby`. The naming details live in [accessibility](/guide/accessibility#labels).

A `label` slot alone is enough to render the label part — no `label` prop needed.

### Headings

On containers — `!VfGroup`, `!VfList`, `!VfGrid`, `!VfMatrix` — `heading: 1`–`6` renders the label as an `<h1>`–`<h6>` tag:

::: usage

```vue [Preview]
<VfForm>
  <VfGroup name="shipping" label="Shipping" :heading="2">
    <VfText name="city" label="City" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  shipping: {
    type: 'group',
    label: 'Shipping',
    heading: 2, // [!code highlight]
    schema: {
      city: { type: 'text', label: 'City' },
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

Use it when a container opens a section of the form, so the label doubles as the section's heading. Separating the sections visually is covered in [spacing & dividers](/guide/form-structure#spacing-dividers).

### Hiding the Label

`hideLabel: true` drops the label group visually. Field elements keep a screen-reader-only `<label>` carrying the element's `genericName`, and a labelled container's fieldset carries it as `aria-label` — how `genericName` and `displayName` resolve is covered in [accessibility](/guide/accessibility#labels). With horizontal columns, a label-less element keeps an empty placeholder label column so its control stays aligned with its labelled neighbors — see [horizontal labels](/guide/form-structure#horizontal-labels).

## Help and Description

`help` renders directly below the label, inside the label group. `description` renders below the control. The split follows their jobs — help explains what the field is for, description guides filling it in. Both are `TProp`s:

::: usage

```vue [Preview]
<VfForm>
  <VfText
    name="password"
    input-type="password"
    label="Password"
    help="At least 12 characters"
    description="Use a mix of letters, numbers, and symbols."
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  password: {
    type: 'text',
    inputType: 'password',
    label: 'Password',
    help: 'At least 12 characters', // [!code highlight]
    description: 'Use a mix of letters, numbers, and symbols.', // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

As with the label, a `help` or `description` slot alone renders its part. While they render, both are referenced from the control's `aria-describedby`, so screen readers announce them with the field — see [ARIA attributes](/guide/accessibility#aria-attributes).

## Required Indicator

The required indicator renders inside the label group when the element has an active `required` rule and its `showRequired` setting includes `'label'` — so it needs a visible label to appear. It is `aria-hidden`; the `aria-required` attribute on the control carries the meaning for assistive tech. Where else it can appear and how to switch it off is `showRequired`'s story in [validation](/guide/validation#required-indicators).

The `*` itself is not markup — it is CSS content from the `requiredContent` token, and the `requiredIcon` token swaps in an SVG mask instead. Override either like any token — see [per-form and per-element tokens](/guide/themes-tokens#per-form-and-per-element-tokens).

## Errors and Messages

The `errors` part renders below the control as a `role="alert"` region. It shows the element's own errors plus any hoisted from children or addons, capped by `maxErrors` — one at a time by default. The `messages` part renders below the errors and holds informational notes that don't count as errors.

Everything about what shows and when belongs to validation — [where errors render, how many show, hiding, and hoisting](/guide/validation#controlling-the-display), and [adding messages and errors from code](/guide/validation#adding-and-removing).

## Icons

`!VfText`, `!VfTextarea`, `!VfSelect`, and `!VfField` accept `iconBefore` and `iconAfter`, rendered inside the control area:

::: usage

```vue [Preview]
<VfForm>
  <VfText
    name="search"
    label="Search"
    icon-before="fa-solid fa-magnifying-glass"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  search: {
    type: 'text',
    label: 'Search',
    iconBefore: 'fa-solid fa-magnifying-glass', // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

```vue [Live]
<VfForm>
  <VfText name="search" label="Search" icon-before="magnifying-glass" />
</VfForm>
```

:::

Both are [`DProp`s](/guide/dynamic-props), so a ref or context function can switch the icon with state. The string goes through the configured [`icon`](/guide/configuration#icon) resolver — identity by default, so a CSS class works as-is — and `$`-prefixed names map through the [`icons`](/guide/configuration#icons) map first.

### Loading Indicator

`!VfText`, `!VfTextarea`, and `!VfSelect` also take a `loading` prop that shows a spinner in place of `iconAfter`. It accepts the full condition syntax, just like `disabled` — see [conditions beyond visibility](/guide/conditions#conditions-beyond-visibility). The spinner also appears on its own while one of the element's async rules is running.

Its shape is the `iconLoading` token — an SVG `url()` applied as a CSS mask, so only the shape matters. The color follows the surrounding text, the size comes from the `iconWidth` / `iconHeight` tokens, and Vueform spins it:

::: usage

```vue [Preview]
<VfForm>
  <VfText
    name="username"
    label="Username"
    loading
    :tokens="{
      iconLoading: `url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath d=%22M8 1.5A6.5 6.5 0 1 0 14.5 8%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22/%3E%3C/svg%3E')`,
    }"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    loading: true,
    tokens: {
      iconLoading: `url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath d=%22M8 1.5A6.5 6.5 0 1 0 14.5 8%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22/%3E%3C/svg%3E')`, // [!code highlight]
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

## Addons

The same four elements take `addonBefore` and `addonAfter` — content beside the control for prefixes, units, or inline actions. An addon can be a string, a locale map, an element schema, an array of any of those, or a function, and string addons also resolve `{...}` [expressions](/guide/expressions):

::: usage

```vue [Preview]
<VfForm>
  <VfText
    name="price"
    label="Price"
    addon-before="$"
    :addon-after="['.00', 'USD']"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  price: {
    type: 'text',
    label: 'Price',
    addonBefore: '$', // [!code highlight]
    addonAfter: ['.00', 'USD'], // [!code highlight]
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

An addon given as an element schema renders a real element. The supported types are `text`, `select`, `checkbox`, `radio`, and `button`:

::: usage model

```vue [Preview]
<VfForm>
  <VfText
    name="amount"
    label="Amount"
    :addon-after="{
      type: 'select',
      name: 'currency',
      default: 'USD',
      items: ['USD', 'EUR', 'GBP'],
      rules: 'required',
    }"
  />
</VfForm>
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
      name: 'currency', // [!code highlight]
      default: 'USD',
      items: ['USD', 'EUR', 'GBP'],
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

The addon is a full member of the form:

- Its value lives in the model under its own `name`, next to the host element's — `{ amount: …, currency: … }` above.
- It renders without its own layout and with `hoist` on, so its errors show in the host's error block and are reported under the host's path in the form's errors — see [hoisting errors](/guide/validation#hoisting-errors).
- For `radio` addons, a shared `radioName` puts them in one browser radio group, each still storing its own `radioValue` under its own `name`.

### Functional Addons

A function receives the element's [context](/guide/context) and re-runs reactively. It can return a string, a locale map, or an array of addon items:

::: usage

```vue [Preview]
<VfForm>
  <VfTextarea
    name="bio"
    label="Bio"
    rules="max:160"
    :addon-after="(el$) => `${160 - (el$.value?.length ?? 0)}`"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  bio: {
    type: 'textarea',
    label: 'Bio',
    rules: 'max:160',
    addonAfter: (el$) => `${160 - (el$.value?.length ?? 0)}`, // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

### Addon Slots

The `addon-before` and `addon-after` slots replace that whole side of the control, and the matching prop is ignored while the slot is present. Wrap the content in `!VfAddon` to keep the addon styling:

::: usage

```vue [Preview]
<VfForm>
  <VfText name="website" label="Website">
    <template #addon-before>
      <VfAddon>https://</VfAddon>
    </template>
  </VfText>
</VfForm>
```

:::

Elements placed in the slot are not hoisted automatically — prefer an [element addon](#element-addons), or set `hoist` on them yourself.

### The Language Addon

A translatable element (`translate: true`) automatically renders its per-element language switcher after its after-addons, and the `language` slot replaces it. Its configuration and behavior are covered in [multilingual inputs](/guide/multilingual-inputs#per-element-language-switcher).

## Slots

Every content part has a matching slot — `label`, `required`, `help`, `description`, `errors`, `messages`, `icon-before`, `icon-after`, `addon-before`, `addon-after`, and `language`, plus `tabs` and `tab` on tabbed containers. Each receives what it would have rendered:

| Slot | Scope |
| --- | --- |
| `label` | `label`, plus `for`, `id`, `tag`, and `bindings` |
| `required` | — |
| `help` | `help`, `id`, `bindings` |
| `description` | `description`, `id`, `bindings` |
| `errors` | `errors`, `bindings` |
| `messages` | `messages` |
| `icon-before` / `icon-after` | `iconBefore` / `iconAfter` |
| `addon-before` / `addon-after` | — |
| `language` | `language`, `languages` |

A slot replaces its entire part, including the attributes the ARIA wiring depends on — spread `bindings` (and keep `for` and `id` on the label) so the connection to the control survives:

::: usage

```vue [Preview]
<VfForm>
  <VfText name="email" label="Email">
    <template #label="{ label, for: forId, id, bindings }">
      <label :for="forId" :id v-bind="bindings">
        {{ label }} <em>(work address preferred)</em>
      </label>
    </template>
  </VfText>
</VfForm>
```

:::

Passing slots from a schema and typing them with `!defineSlot` is covered in [slots](/guide/slots), and each element's full slot list with exact scopes is on its reference page under the **Slots** tab.

## Removing the Layout

`layout: false` renders the control alone — no label, help, description, required marker, errors, or messages.

What belongs to the control stays — icons, the loading spinner, addons, and the language addon still render. The element still registers, validates, and keeps `aria-invalid`, `aria-required`, and `aria-busy` on its control; `aria-describedby` is dropped, since nothing remains to describe it. There is no error block either, so pair it with form-level errors — see [where errors render](/guide/validation#where-errors-render).

There is no wrapper element at all by default. Setting a `root` part or per-element `tokens` brings back an invisible `display: contents` wrapper to carry them — see [the root part](/guide/parts#the-root-part). Reach for `layout: false` when embedding an element in markup you control — a table cell, a toolbar, a composite widget.

### Replacing the Layout

The `layout` prop accepts four values — `true` (the default, the standard `!VfLayout`), `false` (above), a component definition, or a registered component name. A name string goes through `$security.allowComponents` like any other name string, and a rejected one falls back to the standard layout — see [`$security`](/guide/configuration#security).

The replacement renders in place of `!VfLayout` and receives a single `context` prop typed `ContextOf<'VfLayout'>`. The element itself is `context.el$` — its label, help, errors, ids, and handlers all live there. There is no default slot, so the replacement renders the control too, not just the frame around it. To swap the layout of every element at once, set it as a `'*element'` default — see [wildcard targets](/guide/defaults#wildcard-targets).

A working layout component re-renders the control and its whole wiring, so the honest starting point is a copy of the original [`VfLayout.vue`](https://github.com/vueform/next/blob/main/packages/core/src/components/VfLayout/VfLayout.vue) trimmed to your needs. General template-component mechanics — reading `context`, typing with `ContextOf` — are covered in [templates](/guide/templates).

## Beyond the Layout

The rest of the layout's appearance is owned by other chapters. Column widths and [horizontal labels](/guide/form-structure#horizontal-labels), along with [spacing & dividers](/guide/form-structure#spacing-dividers), live in form structure. Attributes on any part go through [parts](/guide/parts), the class keys and the app-wide `layoutClasses` through [classes](/guide/classes), and visual values through [per-form and per-element tokens](/guide/themes-tokens#per-form-and-per-element-tokens).
