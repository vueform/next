---
outline: [2,3]
---

# Rendering

A Vueform form can be built by writing components inline, the natural way to develop forms in templates, or by using a schema object, which enables dynamic rendering, storage, and generation. Both share the same runtime — the difference is purely in how you author them.

## Inline Forms

The most familiar way to start is to drop [Vueform elements](/components/#elements) into a single-file component and wrap them in `VfForm`:

```vue
<template>
  <VfForm>
    <VfText name="name" label="Name" />
    <VfText name="email" label="Email" />
  </VfForm>
</template>
```

Every element with a `name` registers itself with the form. The form's structure is just the rendered tree.

### Splitting Across Files

Because elements register themselves no matter how deep they sit inside `!VfForm`, you can break a form into multiple components without any special wiring:

::: code-group

```vue [Form.vue]
<script setup lang="ts">
import PersonalInfo from './PersonalInfo.vue'
import AddressInfo from './AddressInfo.vue'
</script>

<template>
  <VfForm>
    <PersonalInfo />
    <AddressInfo />
  </VfForm>
</template>
```

```vue [PersonalInfo.vue]
<template>
  <VfText name="name" label="Name" />
  <VfText name="email" label="Email" />
</template>
```

```vue [AddressInfo.vue]
<template>
  <VfText name="city" label="City" />
  <VfText name="zip" label="ZIP" />
</template>
```

:::

Each child contributes its elements to the same form instance.

### Standalone Elements

Elements also work **without** a wrapping `!VfForm`:

```vue
<template>
  <VfText name="email" label="Email" />
</template>
```

A standalone element manages its own state. Features that need a form — cross-field conditions, validators that reference other elements, expressions, submission — require wrapping the element in `!VfForm`.

## Schema Based Forms

Instead of writing inline templates, a form can also be described as a schema. Wrap the schema in `defineSchema` and bind it to `!VfForm`'s `schema` prop:

```vue
<script setup lang="ts">
import { defineSchema } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})
</script>

<template>
  <VfForm :schema />
</template>
```

Keys are element names, `type` picks the registered element, and the rest of each entry is that element's props. `!defineSchema` checks every entry against those props and makes the whole schema fully typed — the type-level details live on that page.

The schema can also be an array, with each entry carrying its own `name`:

```ts
[
  { type: 'text', name: 'name', label: 'Name' },
  { type: 'text', name: 'email', label: 'Email' },
]
```

The array notation is useful when the schema is generated, reordered, or stored as JSON; the object notation is the usual choice when you write it by hand.

When the schema should change with reactive state, use `defineComputedSchema` instead. It takes a getter and returns a `computed` ref, which the `schema` prop accepts just the same:

```ts
const count = ref(10)

const schema = defineComputedSchema(() =>
  Array.from({ length: count.value }, (_, i) => ({
    type: 'text',
    name: `field_${i}`,
    label: `Field ${i + 1}`,
  }))
)
```

Neither helper is required at runtime — the same object or array can be bound directly to the `schema` prop. The identity functions add the entry checking and typing on top.

## Beyond Flat Forms

Both authoring modes extend past a flat list of fields. Elements can nest into groups and objects ([Form Structure](/guide/form-structure)), split across steps ([Multi-Page Forms](/guide/multi-page-forms)), and repeat dynamically ([Repeaters](/guide/repeaters)) — all built on the same inline/schema duality covered here.
