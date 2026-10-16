# Model

Every form owns a single data object — the **model**. Each element writes its value under its `name`, containers nest or flatten their children's keys, and the result is one canonical store. This chapter covers how to bind that model to your own state, how to read and write it, and how to manage it headlessly with `useModel`.

## `v-model`

The form accepts a `v-model` like any input component. Bind a `ref` and three things happen at once:

- The ref's initial value **seeds** the model when the form mounts.
- **Form → ref** — every change inside the form (user input, programmatic updates, `reset`, `clear`) propagates out.
- **Ref → form** — assigning to the ref from outside propagates back in.

```vue
<script setup lang="ts">
import { ref } from 'vue'

const model = ref({ name: 'John' })
</script>

<template>
  <VfForm v-model="model">
    <VfText name="name" label="Name" />
    <VfText name="email" label="Email" />
  </VfForm>
</template>
```

The ref doesn't need to hold every key — missing ones are filled in as elements register: each element contributes its `default` value, or its null value when it has none. Here `model` becomes `{ name: 'John', email: null }` once the form mounts.

::: info
In-template `v-model` needs a `ref()`, not `reactive()`. `v-model` syncs by replacing the bound value, which works for a ref's `.value` but can't replace a reactive object as a whole without losing reactivity. To bind a reactive object, use `useForm` below.
:::

## Binding in `!useForm`

> _⚠️ probably I would swap this with useModel – that's more relevant, useForm is the addition_

`useForm`'s second argument binds the model without template wiring. The binding itself is the same one `v-model` gives you — the difference is that the schema, the form props, and the model now live together in a single typed form definition:

```ts
import { defineSchema, useForm } from '@vueform/ui'
import { ref } from 'vue'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const model = ref({ name: 'John' })

const [MyForm] = useForm({ schema }, model)
```

The binding adapts to the shape you pass:

| You pass         | The form                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| `ref`            | Two-way syncs it, exactly like `v-model`.                                |
| `reactive`       | Syncs form changes back into its keys, preserving the object's identity. |
| `object` (plain) | Seeds the initial values — no syncing back.                              |
| `useModel`       | Adopts Vueform's headless store — more on this below.                    |

None of the first three shapes is type-checked against the schema — a model whose keys or value types don't match the schema compiles without complaint. When you want the model enforced by TypeScript, define it with `useModel`.

## `!useModel`

Everything so far required a mounted form. `useModel` removes that requirement: it is a **headless data engine** that builds the complete model — defaults, null values, nested structure — from a schema alone, without mounting a single component. If you know headless form libraries, this is that role — with the difference that the same instance can later power your rendered form.

```ts
import { defineSchema, useModel } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const model = useModel(schema, { name: 'John' })

model.model // { name: 'John', email: null }
```

The model's shape is built up front — no mount involved. Once Vueform is installed as a Vue plugin with `createVueform`, `!useModel` and `!useForm` are callable anywhere: plain modules, event handlers, tests — no component setup context required.

The second argument is an optional seed — a one-time cloned snapshot, type-checked against the schema. Keys you skip receive their default or null value; keys the schema doesn't know stay in the model as plain data — they don't appear in the payload or the inferred type. Later mutations of the seed are ignored: the instance owns its own data from then on.

::: warning
The seed must be a plain object or a `reactive` object — not a Vue `ref`. A `ref` is rejected (the instance would otherwise clone the ref internals). For a live two-way binding with a form, pass the `!useModel` instance via `v-model` or `!useForm`.
:::

::: info
The schema can also be reactive: pass a ref (e.g. a `defineComputedSchema` result) and the instance follows schema changes — added elements seed their defaults, removed elements drop their data, existing values survive.
:::

### The Model API

The instance owns its data and exposes the full reading and writing API. State is unwrapped — no `.value`:

```ts
model.model // the reactive data object
model.payload // the data that gets submitted
model.dirty // differs from the initial snapshot
model.empty // every value is its null value

model.get('email')
model.set('email', 'john@example.com')
model.update({ name: 'Jane' })
model.load(serverData)
model.clear()
model.reset()
model.clean()

model.toJSON() // JSON string
model.toFormData() // FormData instance
```

`payload` is what submission sends: the model without elements whose [Conditions](/guide/conditions) aren't met and elements with `submit: false` — conditions are evaluated headlessly too. `find()` even returns a virtual [Context](/guide/context) for any element path — no component behind it.

`update` and `load` merge the same way: plain objects are deep-merged, arrays and leaf values are replaced. The difference is intent — `load` announces the data as externally loaded and fires the `load` event. `clean` doesn't change any value; it re-snapshots the model so `dirty` turns `false` and `reset` returns to the new baseline.

### Validating Headlessly

`validate()` runs every element's rules against the current data — again, no mounted form — and resolves with whether everything passed:

```ts
const model = useModel(schema)

await model.validate() // resolves false when any rule fails

model.invalid // whether any validated element is invalid
model.errors // aggregated error messages
model.issues // structured validation issues
```

Everything about validation — defining rules, validation schemas, error messages, when validation runs — is covered in [Validation](/guide/validation).

### Adopting the Model

The instance can be passed anywhere a model is accepted — `!useForm`'s second argument or `v-model` — and the form **adopts** it:

::: code-group

```ts [useForm]
import { defineSchema, useForm, useModel } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const model = useModel(schema, { name: 'John' })

                                    // ▼ adoption happens here
const [MyForm] = useForm({ schema }, model)
```

```vue [v-model]
<script setup lang="ts">
import { defineSchema, useModel } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const model = useModel(schema, { name: 'John' })
</script>

<template>
                <!-- ▼ adoption happens here -->
  <VfForm v-model="model" :schema />
</template>
```

:::

Adoption is not syncing. The form doesn't clone the data or wire up update listeners — it uses the instance's store as its own. There is one source of truth and nothing to keep in sync: type into the form and `model.model` already holds it, call `model.set()` and the form already shows it.

Adoption is also what unlocks the form-bound members:

```ts
model.adopted // true once a form has adopted the instance
model.submit() // submits the adopting form
```

On the form side, `form$.hasAdoptedModel` reports whether the form adopted a model instance. See [Submitting Forms](/guide/submit) for the submission flow.

### Using the Model Before Mount

A `useModel` instance works immediately — no form required. Create it during app setup, seed it from a route or a store, then mount the form whenever:

::: code-group

```ts [user.ts]
import { defineSchema, useModel } from '@vueform/ui'

export const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

export const model = useModel(schema)
```

```vue [UserForm.vue]
<script setup lang="ts">
import { useForm } from '@vueform/ui'
import { model, schema } from './user'

// The form doesn't exist yet — the model is already usable
model.load(serverData)

const [MyForm] = useForm({ schema }, model)
</script>

<template>
  <MyForm />
</template>
```

:::

The form can live in `user.ts` too. Pass the instance to `!useForm` there and you can skip keeping a `model` variable altogether — the returned `form$` already has `load`, `set`, `get`, `update`, `validate`, and the other shared methods, working even before the form mounts:

::: code-group

```ts [user.ts]
import { defineSchema, useForm, useModel } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

export const [MyForm, form$] = useForm({ schema }, useModel(schema))
```

```vue [UserForm.vue]
<script setup lang="ts">
import { MyForm, form$ } from './user'

// The form doesn't exist yet — form$ answers from the model
form$.load(serverData)
</script>

<template>
  <MyForm />
</template>
```

:::

#### Import order

::: warning closed
The examples above are fine as long as `user.ts` is not imported in the same file as `createVueform` — or earlier — where Vueform is installed as a Vue plugin (usually `main.ts`). If it is, wrap the call in a function and invoke it after install:

::: code-group

```ts [user.ts]
import { defineSchema, useForm, useModel } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

export function createUserModel() {
  return useModel(schema)
}
```

```vue [UserForm.vue]
<script setup lang="ts">
import { useForm } from '@vueform/ui'
import { createUserModel, schema } from './user'

const model = createUserModel()

model.load(serverData)

const [MyForm] = useForm({ schema }, model)
</script>

<template>
  <MyForm />
</template>
```

:::

::: code-group

```ts [user.ts]
import { defineSchema, useForm, useModel } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

export function createUserForm() {
  return useForm({ schema }, useModel(schema))
}
```

```vue [UserForm.vue]
<script setup lang="ts">
import { createUserForm } from './user'

const [MyForm, form$] = createUserForm()

form$.load(serverData)
</script>

<template>
  <MyForm />
</template>
```

:::
:::

## Reading the Model via Context

You don't need a `useModel` instance to work with a mounted form's data — the form's [Context](/guide/context) exposes the same API. `model` is the full data object: every registered element's current value.

```ts
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const [MyForm, form$, formReady] = useForm({ schema })

formReady((form$) => {
  form$.model // { name: null, email: null }
})
```

Single values are read by dot-path with `get` — typed and autocompleted when the schema comes from `!defineSchema`:

```ts
form$.get('email')
```

The `dirty` and `empty` flags are here too, along with the rest of the form's state — see [VfForm Context](/components/VfForm#context) for the full API.

## Writing the Model via Context

The same context carries the writing API:

```ts
formReady((form$) => {
  form$.update({ name: 'Jane' }) // partial deep-merge
  form$.set('email', 'jane@example.com') // single value by path
  form$.load(serverData) // like update + fires the `load` event
  form$.clear() // every value back to its null value
  form$.reset() // back to the mounted snapshot
  form$.clean() // current state becomes the new snapshot
})
```

## DevTools

Everything above is available for inspection without writing a single `console.log`. The `@vueform/devtools` plugin registers a **Vueform** inspector in [Vue DevTools](https://devtools.vuejs.org/) that shows every mounted form, its elements, and their live data and state. Install the package and register its plugin:

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

The left pane lists each form by its `name` (`!VfForm` when unnamed) with its elements underneath, nested the same way the model is — `nested` and `flattened` containers are tagged, and so is any element that is currently `invalid`. Select a node and the right pane shows its state, grouped:

| Section          | Form                                                                                                 | Element                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**         | `model`, `payload`, `initialModel`                                                                   | `model`, `payload`, `initialModel`, `tracking`                                                                                                  |
| **State**        | `empty`, `dirty`, `validated`, `invalid`, `debouncing`, `pending`, `busy`, `completed`, `submitting` | `available`, `empty`, `visited`, `touched`, `dirty`, `validated`, `invalid`, `debouncing`, `pending`, `busy`, `completed`, `success`, `hoisted` |
| **Validation**   | `errors`, `messages`                                                                                 | `errors`, `messages`, `required`                                                                                                                |
| **Localization** | `language`, `languages`                                                                              | —                                                                                                                                               |
| **Submit**       | `submits`, `result`, `response`                                                                      | —                                                                                                                                               |
| **Path**         | —                                                                                                    | `path`, `dataPath`                                                                                                                              |
| **UID**          | `uid`                                                                                                | `uid`                                                                                                                                           |

These are the same members you read from the [Context](/guide/context) — the panel is a live window onto `form$` and `el$`. Type into a field and `model` updates in the panel, fail a rule and the `invalid` tag appears on the element, call `form$.load()` from the console and `dirty` flips — `model` versus `payload` is a particularly handy pair to compare when debugging `submit: false` elements or unmet [Conditions](/guide/conditions).

The plugin is development-only by design: it registers its module behind a `NODE_ENV` guard and loads the inspector lazily, so production builds exclude the package entirely and it adds nothing to your bundle. Registering it unconditionally is safe; the top-level `devtools: false` config option opts out in development too.

::: info
A `!useModel` instance that hasn't been adopted by a form has no component to attach to and doesn't appear in the inspector. Once a form adopts it, the form node reflects its data — there is one store, so what you see is the instance's store.
:::
