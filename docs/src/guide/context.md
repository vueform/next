---
outline: [2,3]
---

# Context

A context is simply what the component [exposes](https://www.youtube.com/watch?v=PLQTJ5qL1rg) — roughly the same public instance you'd reach with a [template ref](https://vuejs.org/guide/essentials/template-refs.html). It holds the component's state, its resolved props, methods, event helpers and so on.

The context differs per component. Every component's [reference page](/components) has a **Context** tab listing precisely what its context holds — see [`!VfForm`'s](/components/VfForm#context) for the form, or [`!VfText`'s](/components/VfText#context) for a text element.

## Form Context

`useForm` can be used to define a **typed** form — [schema](/guide/rendering#schema-based-forms) plus any [form-level props](/components/VfForm#props) — in code, and returns a tuple of three:

```ts
const [MyForm, form$, formReady] = useForm({ schema })
```

- **`MyForm`** — the renderable component: essentially `VfForm` with your options pre-bound.
- **`form$`** — the form's context.
- **`formReady`** — a function that hands you that same context once the form has mounted.

::: tip
By convention, variables that hold a context use the **`$` suffix** in Vueform: `form$` for a form, `el$` for an element, `context$` or `ctx$` for generic ones. You'll see it throughout the docs.
:::

`form$` and `formReady` are two routes to the same: the **form's context**. The one difference is timing: `form$` exists immediately but its members are `undefined` until the form *mounts*, while `formReady` *waits* for the form to mount. Use `form$` wherever reactivity absorbs the timing — like a template — and read it directly, no `.value`:

```vue
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email' },
})

const [MyForm, form$, formReady] = useForm({ schema })
</script>

<template>
  <MyForm />
  <p v-if="form$.submitting">Sending…</p> // [!code highlight]
</template>
```

For code that must run against the mounted form, use `formReady`. Pass a callback, or call it with no arguments to get a promise of the same:

```ts
formReady((form$) => {
  form$.find('email')
})

const form$ = await formReady()
```

## Element Context

The form context is also the gateway to its elements: its [`find`](/components/VfForm#context.find) method looks up any registered element's context by [path](/guide/element-paths). When the form is typed from a `defineSchema` result, TypeScript suggests the known paths:

```ts
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

const [MyForm, form$, formReady] = useForm({ schema })

formReady((form$) => {
  form$.find('')
  //          ^|*text:name@"name"|text:country@"country"
})
```

What it returns is the matching element's context — generics included:

```ts
formReady((form$) => {
  form$.find('country')?.items
//                            <|*items@"ResolvedItem<{ id: string; name: string }>[]"|rawItems|resolveItems
})
```

Unknown paths are still accepted: they return the element's context typed as `unknown`. You get the same typing whether you reach the form through `form$` or the `formReady` callback.

## Context from Argument

You don't always have to go looking for a context — sometimes it's handed to you. Every [event handler](/guide/event-handlers) receives the firing component's context as its **last argument**. And wherever a [dynamic prop](/guide/dynamic-props) accepts a function, that function is called with the owning component's context, so the value can follow live state.

```ts
defineSchema({
  name: {
    type: 'text',
    label: 'Name',
    onChange: (newValue, oldValue, el$) => {
      console.log(el$.valid) // [!code highlight]
    },
    help: (el$) => {
      return el$.dirty ? 'Unsaved change' : '' // [!code highlight]
    },
  },
})
```

## `!useContext`

Inside your own component rendered within a Vueform component or element — through a [slot](/guide/slots) or a [template](/guide/templates) — `useContext` returns the nearest Vueform component's context: the same object the `#template` slot and event handlers receive. Its argument is the component's name, used purely for type inference:

```ts
import { useContext } from '@vueform/ui'

const el$ = useContext('VfText')
```

See the [`useContext`](/api/composables/useContext) API page for full reference.
