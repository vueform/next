---
outline: [2,3]
---

# Slots

A slot replaces one piece of a component's rendering — a select's option text, a list's empty state, an add button. In templates they are ordinary Vue slots, and because every Vueform component also accepts a `slots` prop carrying the same content, a schema-driven form keeps the full customization surface.

## Template Slots

Fill a slot the way you would on any Vue component — a `#slotName` template whose scope carries the slot's props:

```vue
<script setup lang="ts">
const countries = [
  { id: 'us', name: 'United States', flag: '🇺🇸' },
  { id: 'de', name: 'Germany', flag: '🇩🇪' },
]
</script>

<template>
  <VfSelect name="country" label="Country" :items="countries" item-label="name">
    <template #option="{ item }">
      {{ item.$raw.flag }} {{ item.label }}
      //           ^|id|name|*flag
    </template>
  </VfSelect>
</template>
```

`item` is the **resolved** item — `value`, `label`, `disabled`, `key`, and `$raw`, the original object. The element's generics type `$raw` from your `items` and `value` from `itemValue`, so the shape of your own data completes and type-checks.

Each component's reference page lists its slots and their props under the **Slots** tab — see [`!VfSelect`'s](/components/VfSelect#slots) for the slot above. The layout slots every element shares (`label`, `help`, `errors`, …) are covered in [element layout](/guide/element-layout#slots). And the `template` slot replaces a component's entire rendering — see [templates](/guide/templates).

### What a Slot Replaces

Some slots fill a node's content and leave the node itself in place. `!VfSelect`'s `option` fills the native `<option>`, which is why its content can only be text — the browser ignores markup inside an option.

Others replace a whole part, node included — `!VfList`'s `add`, `remove`, and `placeholder`, or `!VfRadios`' `item`. These slots receive the part's resolved `bindings` bag (`data-*` state markers, ARIA attributes, [`parts`](/guide/parts) overrides); spread it with `v-bind` on your root node so the replacement keeps its state styling hooks and accessibility wiring. The bag's anatomy lives in [parts](/guide/parts#the-bindings-bag).

## The `slots` Prop

In a schema there is no template to write a `#slotName` block in, so the `slots` prop maps slot names to content. Every entry renders as a component, and the slot props arrive as its **props**:

```ts
import Option from './Option.vue'

{
  country: {
    type: 'select',
    label: 'Country',
    items: [
      { id: 'us', name: 'United States', flag: '🇺🇸' },
      { id: 'de', name: 'Germany', flag: '🇩🇪' },
    ],
    itemLabel: 'name',
    slots: { option: Option },
  },
}
```

`Option.vue` declares the slot props it uses and renders them:

```vue
<script setup lang="ts">
import type { ResolvedItem } from '@vueform/ui'

defineProps<{ item: ResolvedItem }>()
</script>

<template>
  {{ item.$raw?.flag }} {{ item.label }}
</template>
```

Declare the props you use. Vueform sets `inheritAttrs: false` on object slot components automatically, so undeclared slot props never land on your root node as HTML attributes — declaring `inheritAttrs: true` yourself opts back into the fallthrough.

Any component definition works — an SFC, a `defineComponent` with `setup` or `render`, or a `template` string, which needs Vue's runtime-compiler build. A plain function works as a functional component, receiving the slot props and returning the content:

```ts
slots: { option: ({ item }) => item.label.toUpperCase() }
```

A few rules govern how entries resolve:

- Keys may be kebab-case or camelCase — `addonBefore` lands on the `addon-before` slot.
- Slot names autocomplete in typed schemas, but entry values are only checked as "a component or a string" — typing the content is what [`defineSlot`](#defineSlot) adds.
- Components inside a reactive schema — a `ref()`, a Pinia store — are unwrapped automatically, no `markRaw` needed.
- When an inline template slot and a `slots` entry fill the same slot, the inline one wins.

### String Content

A string entry needs no component. Plain text renders as text, with [expressions](/guide/expressions) resolved and kept live — `'Ships to {country}'` follows the model as it changes. Resolution honors `no-expressions` and the `slots` key of `$expression.whitelist` — see [restriction levels](/guide/expressions#restriction-levels).

A string shaped like a component name — PascalCase or kebab-case — that names a globally registered component resolves to that component, but only when the name is listed in `$security.allowComponents`. Anything else renders as text, and a registered but unlisted name warns once in development.

HTML renders by default — to restrict this or set up sanitization, see [HTML sanitization](/guide/security#html-sanitization).

```ts
createVueform({
  $security: {
    allowComponents: ['MyOption'],
  },
})
```

The gates exist because a schema can arrive from outside the app, and a string is the only entry shape that can — component objects and functions come from your own code and are never gated. What else a schema can reach, banning the `slots` key outright with `banAttrs`, and running without the security module are covered in [security](/guide/security#untrusted-schemas).

### App-Wide Slots

`slots` is a regular prop, so [defaults](/guide/defaults) keyed by component name apply a slot to every instance, and [presets](/guide/presets) to a named subset:

```ts
createVueform({
  defaults: {
    VfSelect: { slots: { option: Option } },
  },
})
```

An instance's own `slots` merge with the default per slot name — the instance entry wins for its key while other default entries stay. Setting `mergeObjectProps: false` in the config makes the instance object replace the default as a whole.

## `!defineSlot`

`defineSlot` is Vue's `defineComponent` that knows the slot's props. The first argument names the slot as `'Component.slotName'` — `'VfSelect.option'`, `'VfText.addon-before'` — the `props` array completes to that slot's prop names, and `setup` / `render` receive them typed:

```ts
import { h } from 'vue'
import { defineSlot } from '@vueform/ui'

const Option = defineSlot('VfSelect.option', {
  props: ['item'],
  //       ^|*item
  setup(props) {
    return () => h('strong', props.item.label)
    //                                  ^|value@"any"|*label@"string"|disabled@"boolean"|key@"number"|$raw@"any"
  },
})
```

It always sets `inheritAttrs: false` and marks the component raw, so the result drops straight into a schema's `slots`.

There are no generics here. A standalone definition has no element instance to infer from, so prop values carry the slot's widest types — `item.value` and `item.$raw` are `any` above, whereas a [template slot](#template-slots) narrows them from your `items`. Prop names still complete.

`defineSlot` works for every slot, `template` included — see [templates](/guide/templates#the-template-slot) and the `!VfField` `default` pattern in [components](/guide/components). Slot props are all a slot component receives; to reach the host component's context from inside it, see [context](/guide/context#useContext). The full signature lives on the [`defineSlot`](/api/helpers/defineSlot) API page.
