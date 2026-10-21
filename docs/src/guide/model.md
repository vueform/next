---
outline: [2,3]
---

# Model

Every form owns a single data object — the **model**: each element writes its value under its `name`, and the result is one canonical store. By default the model is internal and the form takes care of everything, but you can also externalize it and own the store yourself.

## Internal Model

The form doesn't need a store handed to it: it builds one from its schema on mount and exposes it through the [form context](/guide/context#form-context):

```vue
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const [MyForm, form$] = useForm({ schema })
</script>

<template>
  <MyForm />
  <pre>{{ form$.data }}</pre> // [!code highlight]
</template>
```

The context exposes the full data API: `form$.data` and `form$.payload` to read, `form$.set()` and `form$.update()` to write — see the [full reference](/components/VfForm#context.section-data).

For most forms this is all the model handling you need. Its boundary is the form's lifecycle: the store is created on mount and gone on unmount, and nothing can reach it before the form exists. Crossing that boundary is what externalizing the model is for.

## External Model

To externalize the model, create a store with `!useModel` and hand it to the form:

```vue
<script setup lang="ts">
import { defineSchema, useForm, useModel } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
  city: { type: 'text', label: 'City' },
})

const model = useModel(schema, {
  name: 'John',           // ✅ string | number | null — typed from the schema
  email: true,            // ❌ compile error — not a text value
  c                       // 💡 autocomplete
// ^|*text:city?@"string | number | null"
})

const [MyForm] = useForm({ schema }, model)
</script>

<template>
  <MyForm />
</template>
```

`!useModel` translates the schema to model shape: each element becomes a key in the model, typed by its model shape. The second argument accepts a seed of initial values, type-checked against the schema — known keys are offered as autocomplete and wrong value types surface as compile errors, while extra keys are deliberately tolerated, so data carrying more than the form shows (a server row, say) can seed it as-is.

Alternatively you can pass plainer model shapes to `!useForm`:

| You pass         | The form                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| `ref`            | Two-way syncs it, exactly like any `v-model`.                            |
| `reactive`       | Syncs form changes back into its keys, preserving the object's identity. |
| `object` (plain) | Seeds the initial values — no syncing back.                              |

These are fine when the form's data is just another piece of component state. What they lack is what `!useModel` adds: none of them is type-checked against the schema, and none carries the [Model API](#the-model-api).


::: tip

`useModel` and `useForm` depend on setup context, so as long as you are using them inside `<script setup>` you are fine. If you want to use them outside of it [follow this guide](/guide/vueform-instance#outside-a-setup-context).

:::

### Inline Forms

Inline forms — built without `!useForm` — accept the same model shapes, including `!useModel` as a `v-model` on `!VfForm` directly:

```vue
<script setup lang="ts">
import { useModel } from '@vueform/ui'

const model = useModel({}, { name: 'John' })
</script>

<template>
  <VfForm v-model="model">
    <VfText name="name" label="Name" />
  </VfForm>
</template>
```

The schema argument stays an empty object: the form's shape is defined inline by the template, so there is nothing to type the model against — typing is what inline usage gives up. The instance still carries the full [Model API](#the-model-api).

It also works one level down, on individual elements — whether they sit inside a form or stand alone:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const name = ref('John')
</script>

<template>
  <VfText v-model="name" name="name" label="Name" />
</template>
```

Element binding comes with two caveats. It moves the plain value, so a `!useModel` instance can't be bound here — `!VfForm` is the only place that attaches one. And each value should reach exactly one `v-model`: an element bound inside a bound form would be written from two directions at once.

## The Model API

The Model API is a single set of members for managing data:

```ts
const model = useModel(schema) // external instance…
// …or the internal model: const model = form$

model.data // the reactive data object
model.payload // the data that gets submitted

model.set('email', 'john@example.com') // single value by dot-path
model.update({ name: 'Jane' }) // partial deep-merge
model.clear() // every value back to its null value
model.reset() // back to the initial snapshot

await model.validate() // run the schema's rules
await model.submit() // submit the form
```

The [internal model](#internal-model)'s API lives on the form context — `form$`, or the `formReady` callback — while the [external model](#external-model) returns the same API directly via  `!useModel`.

## Attaching The Model

Passing the `!useModel` instance to `!useForm` makes the form **attach** it. Attachment is not syncing: the form doesn't clone the data or wire up update listeners — it uses it **as its own store**, so there is one source of truth and nothing to keep in sync.

- **Before attachment** the instance is yours alone: only your code changes its data, and `submit()` runs the instance's own headless flow against its `endpoint` and submission options.
- **After attachment** the model is kept in sync with the form for free: whatever is typed into the form is already in `model.data`, and whatever you `set()` is already on screen. `model.attached` turns `true` and the form owns submission — `model.submit()` submits the attaching form with the form's props and UX. The instance mirrors the form while attached, so `model.submitting`, `model.submits`, `model.result`, and your `model.on('success')` listeners follow form-driven submits too. There is one flow and one set of counters, never two.

## Using Pinia

A model owned by a [Pinia](https://pinia.vuejs.org/) store outlives any component: a form can mount anywhere, attach it, and unmount without losing data. A store is not a component, though, so `!useModel` has no setup context — create the model from your own instance instead:

::: code-group

```ts [stores/user.ts]
import { defineStore } from 'pinia'
import { defineSchema } from '@vueform/ui'
import { vueform } from '@/vueform'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

export const useUserStore = defineStore('user', () => {
  const model = vueform.useModel(schema)

  return { model }
})
```

```ts [vueform.ts]
import { createVueform } from '@vueform/ui/origin'

export const vueform = createVueform()
```

```ts [main.ts]
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { vueform } from './vueform'
import App from './App.vue'

createApp(App).use(createPinia()).use(vueform).mount('#app')
```

:::

A component that renders a form attaches `store.model` like any other instance — and because the store never looks for an injection, it works no matter when it's first touched: a router guard before mount, a test, another store.

One caveat: `vueform.ts` keeps the instance in module scope, which is the right pattern in the browser and the wrong one on an SSR server, where module scope is shared between requests — there, the instance belongs in the per-request app factory, as [Cross-Request State](/guide/ssr#cross-request-state) explains.

To learn more about using `!useForm` and `!useModel` outside of a setup context, see [Outside a Setup Context](/guide/vueform-instance#outside-a-setup-context).

## DevTools

The `@vueform/devtools` plugin registers a **Vueform** inspector in [Vue DevTools](https://devtools.vuejs.org/): every mounted form with its elements on the left, the selected node's live data, state, and validation on the right — the same members you'd read from the [Context](/guide/context), without writing a single `console.log`. Install the package and register its plugin:

```ts
import { createVueform } from '@vueform/ui'
import devtools from '@vueform/devtools'

createVueform({
  plugins: [devtools()], // [!code highlight]
})
```

That's the whole setup — with Vue DevTools installed, the inspector is active whenever `NODE_ENV` is not `production`:

<img class="light-only" src="/images/devtools-light.webp" alt="The Vueform inspector in Vue DevTools, with a form tree on the left and the selected element's data and state on the right." />
<img class="dark-only" src="/images/devtools-dark.webp" alt="The Vueform inspector in Vue DevTools, with a form tree on the left and the selected element's data and state on the right." />

The plugin is development-only by design: production builds exclude the package entirely, so registering it unconditionally is safe.
