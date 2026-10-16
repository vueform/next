# Context

Every Vueform component exposes a **context** — the same public instance you would get from a Vue template ref, and the same object `defineExpose` publishes. It holds the component's state, its resolved props, its methods, and its event helpers.

::: tip
By convention, variables that hold a context use the **`$` suffix**: `form$` for a form, `el$` for an element, `context$` as a generic callback parameter. You'll see "context" used this way throughout the docs.
:::

## Template Refs

The Vue-native way in is a template ref. Put one on `!VfForm` to get the form context, or on an element to get that element's context:

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')
const email$ = useTemplateRef('email$')

onMounted(() => {
  email$.value?.focus()
})
</script>

<template>
  <VfForm ref="form$">
    <VfText ref="email$" name="email" label="Email" />
  </VfForm>
</template>
```

> _⚠️ show type usage already_

`form$.value` and `email$.value` are `undefined` until the component mounts, so use optional chaining.

## `!useForm`

`useForm` returns the same form context as a template ref, without you having to place one:

```ts
const [MyForm, form$, formReady] = useForm({ schema })
```

`form$` is a live proxy to the underlying template ref — you don't need `.value` to access it, but you also can't destructure it:

```vue
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email' },
})

const [MyForm, form$] = useForm({ schema })
</script>

<template>
  <MyForm />
  <p v-if="form$.submitting">Sending…</p>
</template>
```

`formReady` waits until the form has mounted. Pass a callback, or call it with no arguments to get a promise:

```ts
formReady((form$) => {
  form$.find('email')
})

const form$ = await formReady()
```

Either way you reach the same context. For work that needs the mounted form, use `formReady` with `!useForm`, or `onMounted` with a template ref. `onMounted` works with `form$` too, but only when the form renders with the component itself — if it mounts later (e.g. behind `v-if`), `formReady` is the one that waits for it.

::: tip
The form context is unavailable before mount — there's no instance to access yet. The form's model has no such limit: with `useModel` you can read and modify the data before the form mounts. See [Model](/guide/model).
:::

## Finding Elements

Once you have the form context, `find` looks up any registered element by path. You don't need a ref on each element.

When the form is typed from a `defineSchema` result, TypeScript suggests known paths:

```ts
import { onMounted } from 'vue'
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  country: {
    type: 'select',
    label: 'Country',
    items: [
      { id: 'us', name: 'United States' },
      { id: 'de', name: 'Germany' },
    ],
  },
})

const [MyForm, form$] = useForm({ schema })

onMounted(() => {
  form$?.find('')
  //           ^|*text:name@"name"|text:country@"country"
})
```

`find` also returns the matching element's context with its generics:

```ts
onMounted(() => {
  form$?.find('country')?.items
//                             <|*items@"ResolvedItem<{ id: string; name: string }>[]"|rawItems|resolveItems
})
```

That typing is available in every way you reach the form — `form$` from `useForm`, the `formReady` callback, or a template ref on `!VfForm`.

Unknown paths are still accepted and return an untyped element (or `undefined` if nothing is registered there).

## Built-in Members

> _⚠️ needs $http and maybe $security?_

Form and element contexts differ in what they expose, but a few members are on **every** context — typed and always there:

| Member     | What it holds                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| `$config`  | The resolved app [configuration](/guide/configuration).                                                                 |
| `$locale`  | The [locale module](/guide/locales): `t()` for tags, `localize()` for locale maps, `set()` to switch the active locale. |
| `$globals` | The app-wide [globals](/guide/globals).                                                                                 |

They turn any callback that receives a context into a doorway to the app level, no imports needed — a handler switching the locale, for example:

```vue
<VfSelect
  name="locale"
  :items="{ en_US: 'English', de_DE: 'Deutsch' }"
  @change="(value, _old, { $locale }) => $locale.set(value)"
/>
```

## Where Context Shows Up

Context is not only something you look up. Many APIs receive it as an argument — a few examples:

#### Event Handlers

Element and form events pass the source context as their last argument. Here a country change clears the city field through the form hanging on that select:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    items: countries,
    onChange: (_value, _old, el$) => {
      el$.form$?.find('city')?.update('')
    },
  },
  city: { type: 'text', label: 'City' },
})

const [MyForm] = useForm({ schema })
```

```vue [Template]
<VfForm>
  <VfSelect
    name="country"
    label="Country"
    :items="countries"
    @change="(_value, _old, el$) => {
      el$.form$?.find('city')?.update('')
    }"
  />
  <VfText name="city" label="City" />
</VfForm>
```

:::

See [Event Handlers](/guide/event-handlers) for the rest of the event API.

#### Dynamic Props

Labels, hints, help text, and many other props also accept a function. The argument is the element's context, so the value can depend on live state:

::: code-group

```ts [Schema]
defineSchema({
  bio: {
    type: 'text',
    label: 'Bio',
    hint: (el$) =>
      `${(el$.value || '').length}/60 characters`,
  },
})
```

```vue [Template]
<VfText
  name="bio"
  label="Bio"
  :hint="(el$) => `${(el$.value || '').length}/60 characters`"
/>
```

:::

See [Dynamic Props](/guide/dynamic-props) for every shape a dynamic prop can take.

The same pattern runs through the rest of the API — wherever a prop accepts a function (e.g. conditions), the component's context is its argument.

### Callback Generics Limitation

::: warning LIMITATION
In `defineSchema`, the context argument of callbacks doesn't carry the element's generics — it keeps the widest types. This is a TypeScript limitation; contexts you reach any other way (template callbacks, `find`, refs) are unaffected.
:::
