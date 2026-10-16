# Rendering

A Vueform form can be assembled in a handful of different ways. They all share the same runtime; the differences live at the authoring layer.

## Inline Components

The most familiar way to start is to drop Vueform components into a single-file component and wrap them in `!VfForm`:

```vue
<template>
  <VfForm>
    <VfText name="name" label="Name" />
    <VfText name="email" label="Email" />
    <VfButton name="save" text="Save" action="submit" />
  </VfForm>
</template>
```

Every element with a `name` registers itself with the form. The form's structure is just the rendered tree.

## Splitting Across Files

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

## Standalone Elements

Elements also work **without** a wrapping `!VfForm`:

```vue
<template>
  <VfText name="email" label="Email" />
</template>
```

A standalone element manages its own state. Features that need a form — cross-field conditions, validators that reference other elements, expressions, submission — require wrapping the element in `!VfForm`.

## Generics

> _⚠️ feels a bit weird here_

When an element's props carry type information, TypeScript narrows that element's model, events, and slot props from them:

```vue
<template>
  <VfSelect
    name="country"
    label="Country"
    :items="[
      { id: 'us', name: 'United States' },
      { id: 'de', name: 'Germany' },
    ]"
    item-value=""
    //          ^|*text:id@"id"|text:name@"name"
  />
</template>
```

## The `schema` Prop

You can pass the form as data to `!VfForm`'s `schema` prop instead. Keys are element names; `type` picks the registered element and completes to those types:

```vue
<template>
  <VfForm :schema="{
    country: {
      type: '',
      //     ^|text:radios@"radios"|*text:select@"select"|text:text@"text"
    },
  }" />
</template>
```

And once it is set, the rest of the entry completes to that element's props:

```vue
<template>
  <VfForm :schema="{
    country: {
      type: 'select',
      items
      //    ^|*items@"(property) ResolvedItem<{label: string, ..."|itemsDebounce@"(property) number"|itemsTrigger@"(property) ConditionsTrigger"
    },
  }" />
</template>
```

::: tip
Generics do not apply to a raw `schema` prop. For that, wrap the schema in `defineSchema`.
:::

#### Array Schema

The schema can also be an array. Each entry then carries its own `name` — useful when the list is generated, reordered, or stored as JSON:

```vue
<template>
  <VfForm :schema="[
    { type: 'text', name: 'name', label: 'Name' },
    { type: 'text', name: 'email', label: 'Email' },
  ]" />
</template>
```

Either form is just data. The object form is the usual choice when you write the schema by hand.

## `!defineSchema`

Use `defineSchema` when you want a typed form schema with **generics**, outside of the template:

```ts
import { defineSchema } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})
```

You get the same completions as on the `schema` prop plus **generics** — the same prop-driven narrowing you get when using components directly in the template.

```ts
import { defineSchema } from '@vueform/ui'

defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    items: [
      { id: 'us', name: 'United States' },
      { id: 'de', name: 'Germany' },
    ],
    itemValue: '',
    //          ^|*text:id@"id"|text:name@"name"
  },
})
```

Each entry is checked against the registered element's props. You can pass the result to `!VfForm` as usual:

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

## `!defineComputedSchema`

`!defineSchema` results are **immutable**. If the schema should change with reactive state, use `defineComputedSchema` instead. It takes a getter and returns a computed ref, with the same type hints:

```ts
import { ref } from 'vue'
import { defineComputedSchema } from '@vueform/ui'

const recipient = ref('Jordan Lee')

const schema = defineComputedSchema(() => ({
  subject: {
    type: 'text',
    label: `Subject to ${recipient.value}`,
  },
}))
```

`!defineComputedSchema` returns a computed ref and it can be passed to `!VfForm`'s `schema` prop just like a `!defineSchema` result.

## `!useForm`

With `useForm` you can define not just the schema but the whole form — including any form-level props — in a typed way. It returns a tuple whose first member is a ready-to-render component:

```vue
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  method: 'post',
})
</script>

<template>
  <MyForm />
</template>
```

`MyForm` is `!VfForm` with those options pre-bound. The two are equivalent:

```vue
<MyForm />
<!-- same as: -->
<VfForm
  :schema="{
    name: { type: 'text', label: 'Name' },
    email: { type: 'text', label: 'Email' },
  }"
  endpoint="/api/register"
  method="post"
/>
```

Options don't have to be static — any of them can be a `ref` or `computed`, and the form updates reactively when it changes, just like a bound prop in a template:

```ts
const disabled = ref(false)

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  disabled, // flip disabled.value and the form follows
})
```

The tuple has more members: they give you the form's context without a template ref and a simple way to bind a typed model — see [Context](/guide/context) and [Model](/guide/model).
