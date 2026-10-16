---
outline: [2,3]
---

# Presets

Presets are named, reusable bundles of props that components apply **on demand** via the `presets` prop. They behave like scoped [Defaults](/guide/defaults): instead of configuring every instance globally, you opt in where the bundle should apply — and a preset attached to a container can cascade through its entire subtree.

This chapter covers registering and applying presets, targeting with `$apply`, cascade control, merge semantics, and the inline form for one-off cases.

## Basic Usage

Register presets under `presets` in `createVueform`:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { createVueform } from '@vueform/ui/origin'

const app = createApp(App)

app.use(createVueform({
  presets: {
    age: {
      label: 'Age',
      help: 'Please pick your age',
      rules: 'required',
    },
  },
}))

app.mount('#app')
```

Then apply one by name through the `presets` prop:

::: code-group

```ts [Schema]
defineSchema({
  age: { type: 'text', presets: ['age'] },
})
```

```vue [Template]
<VfText name="age" :presets="['age']" />
```

:::

The component inherits every prop the preset declares. Presets stack — they apply in the order listed, later ones overriding earlier ones for the same prop.

## Targeting Components

By default a preset applies to the component carrying the `presets` prop — the **host** — and nothing else. The `$apply` directive widens the target: the preset then applies to every component matching it, both the host (if it matches) and every matching **descendant** in the host's subtree.

That's what makes presets practical to hang on a wrapper. Define one with `$apply`, attach it to a `!VfForm` or `VfGroup`, and every match below picks it up:

```ts
createVueform({
  presets: {
    placeholder: {
      $apply: 'VfText', // [!code highlight]
      placeholder: 'Type something...',
    },
  },
})
```

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email' },
  username: { type: 'text', label: 'Username' },
  subscribe: { type: 'checkbox', text: 'Subscribe' },
})

const [Form] = useForm({
  schema,
  presets: ['placeholder'],
})
```

```vue [Template]
<VfForm :presets="['placeholder']">
  <VfText name="email" label="Email" />
  <VfText name="username" label="Username" />
  <VfCheckbox name="subscribe" text="Subscribe" />
</VfForm>
```

:::

Vueform tests every component in the subtree against `$apply: 'VfText'`: the form itself doesn't match, both text elements do and receive the placeholder, the checkbox doesn't and is untouched.

`$apply` accepts several shapes:

| `$apply`                 | Matches                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `'this'` (or omitted)    | Only the host component.                                                           |
| `'VfText'`               | Every component of that type.                                                      |
| `['VfText', 'VfSelect']` | Any of the listed types.                                                           |
| `'*'`                    | Every component.                                                                   |
| `'*element'`             | Every element — structural components (`!VfForm`, `VfTabs`, `VfSteps`) are skipped. |
| `(component) => boolean` | Custom predicate.                                                                  |

Mixing `'this'` into an array also works — `$apply: ['this', 'VfText']` reaches the host plus every text element below it.

### Custom Predicate

The function form receives the candidate component's definition and returns whether it matches. Its most useful fields are `name` (the registered component name) and `element` (`true` for Vueform elements); `props` and `emits` are available for interface checks:

```ts
import type { ComponentOptions } from '@vueform/ui'

createVueform({
  presets: {
    elementsOnly: {
      $apply: (component: ComponentOptions) => component.element === true,
      columns: 6,
    },
  },
})
```

## Disabling Cascade

With `$apply` set, a preset does two things: it **filters** which components receive it, and it **cascades** through the subtree so descendants get a chance to match. Sometimes you want the filter without the cascade — set `$cascade: false`:

```ts
createVueform({
  presets: {
    highlightedGroup: {
      $apply: 'VfGroup',
      $cascade: false, // [!code highlight]
      class: 'highlighted-group',
    },
  },
})
```

```vue
<VfGroup name="contact" :presets="['highlightedGroup']">
  <VfText name="name" />

  <!-- Nested VfGroup: NOT affected — cascading is off. -->
  <VfGroup name="address">
    <VfText name="street" />
  </VfGroup>
</VfGroup>
```

The outer group matches and gets the class; without `$cascade: false`, the inner group would match too. This turns a preset into a guard — attach it anywhere, only matching hosts pick it up, and it never leaks deeper.

::: tip
Without `$apply` (or with `$apply: 'this'`), `$cascade` defaults to `false` automatically — that's why [Basic Usage](#basic-usage) doesn't cascade. The default flips to `true` once `$apply` names a real target. The reverse shortcut also exists: `$cascade: true` with no `$apply` means "the host and everything below it" (`$apply: '*'`).
:::

## Merging Behavior

Preset values layer between [Defaults](/guide/defaults) and local props: plain objects **shallow-merge** with what the component already resolves, primitives and arrays are replaced — closer to local wins:

```ts
createVueform({
  defaults: {
    VfForm: {
      languages: {
        en_US: 'English',
        de_DE: 'German',
        ar_JO: 'Arabic',
      },
    },
  },
  presets: {
    europe: {
      $apply: 'VfForm',
      languages: {
        en_US: 'English',
        de_DE: 'German',
      },
    },
  },
})
```

```vue
<VfForm :presets="['europe']" />
```

The resolved `languages` keeps `ar_JO` from the default — the preset's object merged over it:

```ts
{
  en_US: 'English',
  de_DE: 'German',
  ar_JO: 'Arabic',
}
```

To **replace** instead, set `$merge: false` on the preset — `languages` then becomes exactly `{ en_US, de_DE }`:

```ts
presets: {
  europe: {
    $apply: 'VfForm',
    $merge: false, // [!code highlight]
    languages: {
      en_US: 'English',
      de_DE: 'German',
    },
  },
},
```

### `class` and `classes`

As everywhere in Vueform, `class` and `classes` **merge across every level** — built-in defaults, global defaults, presets, and local props all contribute, and `$merge: false` doesn't change that:

```ts
createVueform({
  presets: {
    branded: {
      $apply: '*element',
      class: 'border',
      classes: {
        input: 'p-2',
      },
    },
  },
})
```

```vue
<VfText
  name="email"
  :presets="['branded']"
  class="rounded"
  :classes="{ input: 'text-lg' }"
/>
```

The element renders with `border rounded` on its root and `p-2 text-lg` on its input part. To replace classes rather than append, use [`reclass`](/guide/classes#adding-and-replacing-classes).

## Multiple Rules per Preset

A preset entry can be an **array** of rules, each with its own `$apply` — one name configuring several component types at once:

```ts
createVueform({
  presets: {
    us: [
      {
        $apply: 'VfForm',
        languages: { en_US: 'English' },
      },
      {
        $apply: 'VfText',
        placeholder: 'Type something...',
      },
    ],
  },
})
```

`presets: ['us']` applies both rules in one go.

## Inline Presets

The `presets` prop also accepts full preset **objects**, skipping registration entirely — handy for one-offs and prototyping before promoting something to a global preset:

::: usage

```vue [Preview]
<VfGroup
  name="contact"
  :presets="[
    {
      $apply: 'VfText',
      columns: 6,
    },
  ]"
>
  <VfText name="firstName" label="First name" />
  <VfText name="lastName" label="Last name" />
  <VfText name="email" label="Email" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contact: {
    type: 'group',
    presets: [
      {
        $apply: 'VfText', // [!code highlight]
        columns: 6, // [!code highlight]
      },
    ],
    schema: {
      firstName: { type: 'text', label: 'First name' },
      lastName: { type: 'text', label: 'Last name' },
      email: { type: 'text', label: 'Email' },
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

Every element inside the group gets the half-width layout — nothing registered globally, nothing leaking outside the group.

## TypeScript

The `presets` config is typed end-to-end: keys autocomplete, `$apply` knows the registered component names, and prop overrides are checked against the target's prop types. To author a preset outside the `createVueform` block with the same checking, wrap it in `definePreset`:

```ts
import { createVueform, definePreset } from '@vueform/ui'

const compact = definePreset({
  $apply: '*element',
  columns: 6,
})

createVueform({
  presets: { compact },
})
```

See the [`definePreset` reference](/api/helpers/definePreset) for the overloads covering arrays, predicates, and wildcards.

## Limitations

Presets compose **static configuration** only. They cannot:

- Subscribe to component events — use schema `onEventName` properties, template `@event` handlers, or `on()` (see [Event Handlers](/guide/event-handlers)).
- Attach further presets — the `presets` prop itself isn't picked up from inside another preset.
