---
outline: [2,3]
---

# Multilingual Inputs

Multilingual inputs store **per-language values** in the form's model. Where a [translated prop](/guide/translating-props) translates a label, a multilingual input gives the _user_ one field that holds English and French copy side by side — the shape content-management forms need.

## Enabling Translation

Set `translate` on any free-text element. Its model value becomes a language-keyed object instead of a scalar, and value-shaped props like `default` accept the same shape:

::: usage model

```vue [Preview]
<VfText
  name="bio"
  label="Bio"
  translate
  :languages="{ en_US: 'English', de_DE: 'Deutsch' }"
  :default="{
    en_US: 'Frontend engineer',
    de_DE: 'Frontend-Entwickler',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  bio: {
    type: 'text',
    label: 'Bio',
    translate: true, // [!code highlight]
    languages: { en_US: 'English', de_DE: 'Deutsch' },
    default: {
      en_US: 'Frontend engineer',
      de_DE: 'Frontend-Entwickler',
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

The input shows one language at a time; typing writes to the entry of the element's active language. A plain-string `default` is applied to every language at once.

## Configuring Available Languages

Languages are a record of codes (the model keys) to display labels (what the switcher shows). They can be set at three levels — the most specific wins:

| Level | Where | Use when |
| --- | --- | --- |
| Global | `createVueform({ languages })` | All forms share one set. |
| Form | `languages` on `!VfForm` / `useForm` | A specific form differs. |
| Element | `languages` on the element | One element differs from its form. |

```ts
createVueform({
  languages: {
    en_US: 'English',
    fr_FR: 'French',
  },
})
```

Each label is itself localizable — pass a locale map and the language _name_ translates with the active locale:

```ts
languages: {
  en_US: { en_US: 'English', fr_FR: 'Anglais' },
  fr_FR: { en_US: 'French', fr_FR: 'Français' },
}
```

::: warning
Languages and locales are independent axes. The **locale** picks the UI's language; the **languages** are content slots in the data. An English UI can happily edit `en_US`, `fr_FR`, and `de_DE` content — and vice versa.
:::

## Form-Level Language Switcher

Set `multilingual` on the form to render a `VfLanguages` switcher above it — one control that drives the active language of every translatable element inside:

::: usage model

```vue [Preview]
<VfForm
  multilingual
  :languages="{ en_US: 'English', fr_FR: 'Français' }"
>
  <VfText name="title" label="Title" translate />
  <VfTextarea name="body" label="Body" translate />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  title: { type: 'text', label: 'Title', translate: true },
  body: { type: 'textarea', label: 'Body', translate: true },
})

const [Form] = useForm({
  schema,
  multilingual: true, // [!code highlight]
  languages: { en_US: 'English', fr_FR: 'Français' },
})
</script>

<template>
  <Form />
</template>
```

:::

Pick a language and every translatable element snaps to it. The form's `language` prop sets the starting language (defaulting to the first key), and the form context exposes the running state — `form$.language`, the resolved `form$.languages` map, and `form$.selectLanguage(code)` for programmatic switching:

```ts
formReady((form$) => {
  form$.selectLanguage('fr_FR')
})
```

## Per-Element Language Switcher

Every translatable element also renders its own inline switcher — a compact select in the after-addon position, next to any [addons](/guide/element-layout#addons) you define. It starts on the form's active language, but the user can point a single element at a different language — editing the French `body` while the English `title` stays visible, a natural side-by-side translation workflow.

When the form-level switcher changes language, every element realigns to it, dropping per-element overrides. On a form that isn't `multilingual`, the inline switcher is the only way to change which language an element edits.

To restyle or replace the switcher, use the element's `#language` slot — see [Element Layout](/guide/element-layout#the-language-addon).

## Multilingual Validation

Rules on a translatable element apply **per language**. A single rule set validates every language alike; an object keyed by language code applies different rules per language:

::: code-group

```ts [Schema]
defineSchema({
  bio: {
    type: 'text',
    label: 'Bio',
    translate: true,
    rules: {
      en_US: 'required|min:10',
      fr_FR: 'required|min:5',
    },
  },
})
```

```vue [Template]
<VfText
  name="bio"
  label="Bio"
  translate
  :rules="{
    en_US: 'required|min:10',
    fr_FR: 'required|min:5',
  }"
/>
```

:::

Each language validates independently, and its errors are tagged with the language's display label so the user knows which translation needs attention:

```
The bio must be at least 10 characters. (English)
The bio is required. (French)
```

Language-keyed rules require `translate: true` — a non-translatable element with multilingual rules throws. See [Multilingual Rules](/guide/validation#multilingual-rules) for how they combine with the rest of the validation system.
