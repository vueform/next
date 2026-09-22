---
outline: [2,3]
---

# Translating Props

Translatable props translate what _you_ write: labels, placeholders, help texts, button captions — every [TextProp](/guide/dynamic-props) in a form. Instead of a plain string, pass a **locale map** and the active [locale](/guide/locales) picks the entry at render time.

## Locale Maps

A locale map is an object keyed by locale codes. Wherever a `TextProp` accepts a string, it accepts a map — switch the locale below and watch the label and placeholder re-resolve:

::: usage nomodel

```vue [Preview]
<VfText
  name="email"
  :label="{
    en_US: 'Email',
    de_DE: 'E-Mail-Adresse',
  }"
  :placeholder="{
    en_US: 'you@example.com',
    de_DE: 'z. B. name@beispiel.de',
  }"
/>
```

```vue [Template]
<VfText
  name="email"
  :label="{
    en_US: 'Email',
    de_DE: 'E-Mail-Adresse',
  }"
  :placeholder="{
    en_US: 'you@example.com',
    de_DE: 'z. B. name@beispiel.de',
  }"
/>
<VfSelect
  name="locale"
  :items="{
    en_US: '🇺🇸 \u00a0English',
    de_DE: '🇩🇪 \u00a0German',
  }"
  default="en_US"
  @change="(value, old, { $locale }) => $locale.set(value)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: {
      en_US: 'Email',
      de_DE: 'E-Mail-Adresse',
    },
    placeholder: {
      en_US: 'you@example.com',
      de_DE: 'z. B. name@beispiel.de',
    },
  },
  locale: {
    type: 'select',
    items: {
      en_US: '🇺🇸 \u00a0English',
      de_DE: '🇩🇪 \u00a0German',
    },
    default: 'en_US',
    onChange: (value, old, { $locale }) => $locale.set(value),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The demo's switcher drives it through the element context's `$locale` module; in app code you'd typically call [`setLocale()`](/guide/locales#changing-the-active-locale) instead. Either way, every locale map in every form re-resolves on the spot.

## The Resolution Chain

The value resolves through a chain, so a translatable prop never collapses to an empty string just because one translation is missing:

1. The **active locale's** entry.
2. The **fallback locale's** entry.
3. The **first key** in the map.

```ts
// active: fr_FR, fallback: en_US
label: { en_US: 'Email', fr_FR: 'Courriel' } // → 'Courriel'
label: { en_US: 'Email', de_DE: 'E-Mail' }   // → 'Email'  (fallback)
label: { de_DE: 'E-Mail' }                   // → 'E-Mail' (first key)
```

## Beyond Labels

Locale maps aren't an element-only feature — they work on every `TextProp` in the system: element `help`, `description`, and `info`, button `text` and `tooltip`, the form's `successMessage`, floating labels, addon texts, and so on. If a prop renders text, it takes a map:

```ts
const [Form] = useForm({
  schema,
  successMessage: {
    en_US: 'Thanks — we got your message.',
    fr_FR: 'Merci — votre message est bien reçu.',
  },
})
```

## Combining With Other Shapes

Locale maps combine freely with the other `TextProp` shapes — refs, functions, and [expressions](/guide/expressions) can all yield or contain them. See [Dynamic Props](/guide/dynamic-props) for the full resolution pipeline the maps take part in.
