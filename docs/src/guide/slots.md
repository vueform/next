---
outline: [2,3]
---

# Slots

Slots replace a specific piece of a component's rendering with your own content — a select's option row, an element's label, a list's empty state. In a template, Vueform slots are ordinary Vue slots. The interesting part is that the same slots also work **from a schema**: every Vueform component, elements included, accepts a `slots` prop mapping slot names to content, so fully data-driven forms keep the full customization surface.

This chapter covers both routes, the shapes slot content can take, and the `defineSlot` helper that types it all.

## Template Slots

In a single-file component, use `#slotName` like on any Vue component. When the element's props carry type information, it flows into the slot props:

```vue
<VfSelect
  name="country"
  :items="[
    { id: 'us', name: 'United States', flag: '🇺🇸' },
    { id: 'de', name: 'Germany', flag: '🇩🇪' },
  ]"
>
  <template #option="{ item }">
    {{ item. }}
    //      ^|string:id|string:name|*string:flag
  </template>
</VfSelect>
```

The `item` slot prop knows your items' shape — `id`, `name`, and `flag` all complete and type-check.

## The `slots` Prop

In a schema there's no template to put `<template #option>` into, so the `slots` prop takes the content instead. Entries render as real Vue components receiving the same slot props.

An imported SFC is the usual starting point:

::: code-group

```ts [Schema]
import { defineSchema } from '@vueform/ui'
import Option from './Option.vue'

defineSchema({
  country: {
    type: 'select',
    items: [
      { id: 'us', name: 'United States', flag: '🇺🇸' },
      { id: 'de', name: 'Germany', flag: '🇩🇪' },
    ],
    slots: { option: Option }, // [!code highlight]
  },
})
```

```vue [Option.vue]
<script setup lang="ts">
defineProps<{ item: { id: string; name: string; flag: string } }>()
</script>

<template>
  {{ item.flag }} {{ item.name }}
</template>
```

:::

The slot's props arrive as the component's **props**: declare the ones you use. Vueform sets `inheritAttrs: false` on slot components automatically, so undeclared slot props don't leak onto the root node as HTML attributes (declare `inheritAttrs: true` explicitly if you want the fallthrough).

Any component definition works, not just SFCs:

```ts nolink=defineComponent
import { defineComponent } from 'vue'

const Option = defineComponent({
  props: ['item'],
  setup: (props) => () => `${props.item.flag} ${props.item.name}`,
})
```

That includes a `template` string, which Vue compiles at runtime:

```ts nolink=defineComponent
import { defineComponent } from 'vue'

const Option = defineComponent({
  props: ['item'],
  template: '{{ item.flag }} {{ item.name }}',
})
```

::: tip closed TIP
A `template` string needs a Vue build that includes the template compiler. The default `vue` entry ships _without_ it, so alias `vue` to the with-compiler build in your bundler config:

```ts
// vite.config.ts
export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
}
```

Without it the component renders nothing and Vue warns that the runtime compilation is not supported.
:::

A plain **function** is a functional component — it receives the slot props and returns the content:

```ts
slots: {
  option: (props) => `${props.item.flag} ${props.item.name}`,
}
```

### String Content

A string entry covers the simple cases without any component:

```ts
slots: {
  option: 'United States',
}
```

Strings are versatile:

- A **component name** (`'MyOption'`) resolves to the globally registered component of that name — when the name is listed in [`$security.allowComponents`](/guide/configuration#security).
- Anything else renders as **content**: plain text always, and HTML when the `slots` area is enabled in [`$security.allowHtml`](/guide/configuration#security) — sanitized through the [Security](/guide/security) module, with [expressions](/guide/expressions) resolved, so `'<strong>{name}</strong>'` works as a live, safe template.

Plain text needs no configuration. The other two forms do, because a schema often arrives from outside the app — a JSON document, an API response — where a string entry could inject markup or pull any globally registered component into the form:

```ts
createVueform({
  $security: {
    allowHtml: ['slots'], // strings may render as HTML
    allowComponents: ['MyOption'], // names that may resolve
  },
})
```

Until then an HTML string renders as escaped text (tags visible) and an unlisted name renders as text too, each with a development warning naming the option to set. Component objects and functions are never affected: they can only come from your own code. See [Untrusted Schemas](/guide/security#untrusted-schemas) for the full picture.

::: warning
In a [modular setup](/guide/modules) these gates belong to the `security` module — without it registered they fail closed regardless of the options, with a development warning pointing at the module.
:::

## `!defineSlot`

`defineSlot` is Vue's [`defineComponent`](https://vuejs.org/api/general.html#definecomponent) with knowledge of the slot's props. Name the slot as `'Component.slotName'` and the prop names complete and type:

```ts
import { defineSlot } from '@vueform/ui'

const Option = defineSlot('VfSelect.option', {
  props: [''],
  //       ^|*item
})
```

```ts
import { defineSlot } from '@vueform/ui'

const Option = defineSlot('VfSelect.option', {
  props: ['item'],
  setup: (props) => () => props.item.
  //                                 ^|*string:value|string:label|string:$raw
})
```

::: warning No generics
`defineSlot` knows which props the slot receives, but not what you pass to the element — a standalone definition has no element instance to infer from. That means the element's **generics don't apply**: the `item` above is the slot's widest `item` type, not the shape of your `items` array the way it is inside a [template slot](#template-slots). Prop names complete, but their values keep the slot's widest types.
:::
