---
outline: [2,3]
---

# Translating Props

[Locales](/guide/locales) translate Vueform's built-in strings — the texts you write yourself translate in place. Labels, placeholders, help texts, button captions, and success messages are [`TProp`](/guide/dynamic-props)s, and every `TProp` accepts a **locale map** instead of a string. The active locale picks the matching entry at render time and every map re-resolves the moment the locale switches, with no message files and no keys to maintain — each translation lives next to the prop it belongs to.

## Locale Maps

A locale map is a plain object keyed by locale codes, accepted wherever a `TProp` accepts a string:

```ts
{
  email: {
    type: 'text',
    label: { en_US: 'Email address', de_DE: 'E-Mail-Adresse' },
    placeholder: { en_US: 'you@company.com', de_DE: 'sie@firma.de' },
  },
}
```

The keys are the codes you [register under `locales`](/guide/locales#registering-locales). They aren't type-checked against the registered set, so a mistyped code doesn't error — its entry is simply never matched and the lookup falls through [the resolution chain](#the-resolution-chain).

Switching lives outside the map. `setLocale()` from `!useLocale` changes the active locale and re-resolves every map in every form — see [changing the active locale](/guide/locales#changing-the-active-locale).

## Which Props Take Maps

Text a person reads is a `TProp` and takes a map; values the framework consumes — icons, numeric bounds, severities — are `DProp`s and don't. The full per-prop breakdown is at [where each type appears](/guide/dynamic-props#where-each-type-appears).

Beyond the obvious labels, placeholders, and help texts, the less expected `TProp`s are the form's `successMessage` and `redirect` (a per-locale redirect URL works), a button's `text` and even its `href` / `to`, a repeater's `addLabel` and `removeLabel`, [page](/guide/multi-page-forms) labels, and [addons](/guide/element-layout#addons):

```ts
const [MyForm] = useForm({
  schema,
  successMessage: { en_US: 'Thanks, saved!', de_DE: 'Danke, gespeichert!' },
  redirect: { en_US: '/en/thanks', de_DE: '/de/danke' },
})
```

What `successMessage` and `redirect` do once the form submits is [submit](/guide/submit#after-success)'s territory. Two more surfaces take maps in their own ways — validation messages in `ruleMessages` and in `!createRule`'s `message` (see [multilingual messages](/guide/validation#multilingual-messages)), and the language names of [multilingual inputs](/guide/multilingual-inputs#configuring-available-languages). On the PrimeVue integration, `info`, `tooltip`, `floatLabel`, and `ifta` are `TProp`s as well, so those texts translate the same way.

What doesn't take maps are option **item labels** — the `items` of select, radio, and checkbox elements aren't `TProp`s, so a map there is never resolved. [Localizing Your Own Content](#localizing-your-own-content) shows how to translate them anyway.

## The Resolution Chain

A map doesn't need an entry for every registered locale. A prop resolves to the first non-empty entry of:

1. the active locale's entry
2. the [`fallbackLocale`](/guide/locales#fallback-locale)'s entry
3. the map's first entry

```ts
// locale: 'fr_FR', fallbackLocale: 'en_US'
{
  name: {
    type: 'text',
    label: { fr_FR: 'Nom', en_US: 'Name' }, // → 'Nom' (active locale)
    help: { en_US: 'Legal name, please' }, // → 'Legal name, please' (fallback)
    placeholder: { de_DE: 'Name eingeben' }, // → 'Name eingeben' (first entry)
  },
}
```

An empty-string entry counts as missing and falls through to the next step, and without a configured `fallbackLocale` step 2 is skipped. When no step yields a non-empty string, the prop falls back to its own default — exactly as an empty plain string would.

## Maps and Expressions

Each entry of a map is an ordinary prop string, so it can hold [expression](/guide/expressions) blocks. Localization runs **before** expression resolution — the active locale picks the entry first, then its `{...}` blocks resolve against the live form data:

```ts
{
  name: { type: 'text', label: 'Name' },
  bio: {
    type: 'textarea',
    label: { en_US: 'Bio of {name}', de_DE: 'Biografie von {name}' },
  },
}
```

`{name}` here references the `name` element, not a [locale-tag parameter](/guide/locales#parameters) — `localeParamPattern` plays no part inside maps.

The inverse doesn't hold. An expression resolves to a string and never to a map, so an expression can't pick between translations — the map picks first.

## Translating Through Locale Tags

A plain-string prop is never looked up as a locale tag. `label: 'steps_next'` renders the literal text `steps_next` even though that tag exists in every shipped locale — among props, only validation messages resolve tags on their own (see [locale tags](/guide/validation#locale-tags)). When translations should live in locale files instead of the schema, use the prop's function form and the context's `$locale` module:

```ts
{
  email: {
    type: 'text',
    label: (el$) => el$.$locale.t('email_label'),
  },
}
```

`t()` reads the active locale inside the prop's computed, so the label re-evaluates on every locale switch. Registering the `email_label` tag is covered in [writing a locale](/guide/locales#writing-a-locale).

Choosing between the two is mostly a storage question. Inline maps keep translations next to the schema and survive JSON serialization, while tags centralize them in locale files or a [custom locale backend](/guide/locales#custom-locale-backend).

## Localizing Your Own Content

The resolution behind text props is yours to call. `!useLocale` exposes `localize(map)`, which returns the entry picked by [the chain above](#the-resolution-chain), and `localizeObject(record)`, which runs `localize` on every value of a `{ key: map }` record.

That closes the item-label gap — `items` accepts a ref, and `localizeObject` returns exactly the `Record<string, string>` shape items take:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useForm, useLocale } from '@vueform/ui'

const { localizeObject } = useLocale()

const countries = computed(() =>
  localizeObject({
    de: { en_US: 'Germany', fr_FR: 'Allemagne' },
    fr: { en_US: 'France', fr_FR: 'France' },
  })
)

const [MyForm] = useForm({
  schema: {
    country: { type: 'select', label: 'Country', items: countries },
  },
})
</script>

<template>
  <MyForm />
</template>
```

The `computed` re-runs on locale switches, so the option labels follow the active locale like any translated prop. The same calls work in your own components rendered inside a form — [`useContext`](/guide/context#useContext) hands you the nearest component's context, which carries the module as `$locale`.
