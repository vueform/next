---
outline: [2,3]
---

# Conditions

Most real forms branch on their own data — an address block that only matters for home delivery, an admin-only settings tab, a `required` rule that applies once a checkbox is ticked.

In Vueform these branches are **conditions**, declarative rules that make an element's availability — or other aspect of its behavior — depend on other values in the form. Conditions re-evaluate reactively, so the form reshapes itself the moment a value they depend on changes.

## Showing and Hiding Elements

By far the most common case is one element appearing when another holds a given value. Pass a tuple of `[elementPath, operator, value]` to the `conditions` prop of the element you want to toggle:

::: usage

```vue [Preview]
<VfForm>
  <VfRadios
    name="delivery"
    label="Delivery Method"
    :items="['Pickup', 'Home delivery']"
    default="Pickup"
  />
  <VfText
    name="address"
    label="Shipping Address"
    :conditions="[['delivery', '==', 'Home delivery']]"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  delivery: {
    type: 'radios',
    label: 'Delivery Method',
    items: ['Pickup', 'Home delivery'],
    default: 'Pickup',
  },
  address: {
    type: 'text',
    label: 'Shipping Address',
    conditions: [['delivery', '==', 'Home delivery']], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Pick _Home delivery_ and the address field appears; switch back to _Pickup_ and it's gone. Since the tuple starts with a [path](/guide/element-paths), a condition can reference any element in the form, however deeply nested.

A hidden element isn't merely invisible — it's removed from the form entirely, with well-defined consequences for its value and validation covered in the [next section](#what-happens-to-hidden-elements).
