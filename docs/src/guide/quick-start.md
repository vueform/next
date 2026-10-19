# Quick Start

Think of this page as two things in one: an installation guide and a compressed mini-course that walks you through the essentials of working with Vueform. By the end of it you'll have a working mental model of the framework — and you'll be ready to either dig deeper or jump straight to the parts you need.

## Installation

::: code-group

```bash [npm]
npm install @vueform/ui
```

```bash [yarn]
yarn add @vueform/ui
```

```bash [pnpm]
pnpm add @vueform/ui
```

```bash [bun]
bun add @vueform/ui
```

:::

### Include in Your App

Once installed, install Vueform plugin in your Vue app:

```ts nolink=createVueform
import App from './App.vue'
import { createApp } from 'vue'
import { createVueform } from '@vueform/ui/origin'

const app = createApp(App)
app.use(createVueform())
app.mount('#app')
```

This installs Vueform with the Origin theme — the default theme that carries forward the look and feel of Vueform v1.

## Create a Form

A Vueform form starts with a schema and (optionally) a model. `!useForm` ties them together and returns a renderable component you can drop straight into your template:

```vue
<script setup lang="ts">
import { defineSchema, useModel, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
  save: { type: 'button', text: 'Save', action: 'submit' },
})

const model = useModel(schema, {
  name: 'John Doe',
  email: 'john@doe.com',
})

const [MyForm] = useForm({ schema }, model)
</script>

<template>
  <MyForm />
</template>
```

Under the hood this is equivalent to writing the same form by hand:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const model = ref({
  name: 'John Doe',
  email: 'john@doe.com',
})
</script>

<template>
  <VfForm v-model="model">
    <VfText name="name" label="Name" />
    <VfText name="email" label="Email" />
    <VfButton name="save" text="Save" action="submit" />
  </VfForm>
</template>
```

Both styles render the same form. The schema-driven version is fully typed end-to-end and is the focus of this guide; the template version remains equally valid.

## Form Elements

Unlike the bare inputs you might be used to in other UI libraries, a Vueform element is a small component scaffold that includes everything a real form field usually needs — a label, a description, validation errors, etc.

Most of that scaffold is rendered lazily. Render `!<VfText name="email" />` on its own (or `{ type: 'text' }` in a schema) and you get just an input; add a `label`, a `description`, or trigger a validation error, and the corresponding parts of the layout appear automatically. You don't have to compose them yourself — they're already part of the element.

## Defining Schema

[`defineSchema`](/api/helpers/defineSchema) describes the shape of the form — which elements it contains, and what properties each one has.

The element's `name` (or its key in the schema) determines where its value lives in the model.

::: example

```vue
<VfText name="name" label="Name" />
<VfText name="email" label="Email" />
<VfButton name="save" text="Save" action="submit" />
```

:::

```ts
const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
  save: { type: 'button', text: 'Save', action: 'submit' },
})
```

### Array Schema

You can also define a schema as an array, which is preferable when element order must be guaranteed — for example when the schema is persisted, generated dynamically, or transformed before being passed to `!defineSchema`:

```ts
const schema = defineSchema([
  { type: 'text', name: 'name', label: 'Name' },
  { type: 'text', name: 'email', label: 'Email' },
  { type: 'button', name: 'save', text: 'Save', action: 'submit' },
])
```

### Nested Elements

A schema can contain nested elements in `group`. By default a group is purely structural — it labels and wraps its children visually, but their values still write straight into the parent level:

::: example model

```vue
<VfGroup name="name" label="Name">
  <VfText name="first_name" placeholder="First name" />
  <VfText name="last_name" placeholder="Last name" />
</VfGroup>
```

:::

```ts
const schema = defineSchema({
  name: {
    type: 'group',
    label: 'Name',
    schema: {
      first_name: { type: 'text', placeholder: 'First name' },
      last_name: { type: 'text', placeholder: 'Last name' },
    }
  }
})
```

The form data is `{ first_name, last_name }` — flat, with no `name` wrapper.

To make the group own a sub-object in the form data, set `nested: true`:

::: example model

```vue
<VfGroup name="name" label="Name" nested>
  <VfText name="first_name" placeholder="First name" />
  <VfText name="last_name" placeholder="Last name" />
</VfGroup>
```

:::

```ts{5}
const schema = defineSchema({
  name: {
    type: 'group',
    label: 'Name',
    nested: true,
    schema: {
      first_name: { type: 'text', placeholder: 'First name' },
      last_name: { type: 'text', placeholder: 'Last name' },
    }
  }
})
```

The form data is now `{ name: { first_name, last_name } }`.

### Repeating Elements

A schema can also contain repeatable elements in `list`:

::: example model

```vue
<VfList
  name="team"
  label="Team"
  :schema="{
    name: { type: 'text', placeholder: 'Name' },
    email: { type: 'text', placeholder: 'Email' },
  }"
/>
```

:::

```ts
const schema = defineSchema({
  team: {
    type: 'list',
    label: 'Team',
    schema: {
      name: { type: 'text', label: 'Name' },
      email: { type: 'text', label: 'Email' },
    }
  }
})
```

`team` becomes an array of objects shaped after the inner schema.

If a list contains a single element, you can use `flatten` to collapse each row to that element's value:

::: example model

```vue
<VfList
  name="without_flatten"
  label="Without flatten"
  :wrap="false"
  :schema="{ name: { type: 'text', placeholder: 'Name' } }"
/>
<VfList
  name="with_flatten"
  label="With flatten"
  flatten
  :wrap="false"
  :schema="{ name: { type: 'text', placeholder: 'Name' } }"
/>
```

:::

```ts{5}
const schema = defineSchema({
  team: {
    type: 'list',
    label: 'Team',
    flatten: true,
    schema: {
      name: { type: 'text', label: 'Name' },
    }
  }
})
```

`team` is now a flat array of strings — `{ team: ['John', 'Jane', ...] }`. See the model panel above to compare: `without_flatten` keeps each row as an object, while `with_flatten` collapses each row to the inner element's value.

## Where the Data Lives?

Form data is owned internally by the form's root component. Whatever the user types, whatever you set programmatically — it all lives there as one canonical store.

You don't _need_ a separate piece of external state to work with that data, but when you want one, the form accepts a `v-model`. The binding works exactly like Vue's native `v-model`, with three things happening at once:

- The bound ref's **initial value seeds** the form data when the form mounts.
- **Form → ref** — every change inside the form (user input, programmatic updates, `reset`, `clear`, etc.) propagates out.
- **Ref → form** — assigning to the ref from outside propagates back into the form.

::: info
The value passed to `v-model` in template must be a `ref()`, not `reactive()`. `v-model` syncs by replacing the bound value via `update:modelValue`, which works for a ref's `.value` but can't replace a reactive object as a whole without losing reactivity.
:::

## Defining Model

[`useModel`](/api/useModel) creates a typed handle for the form's data. It doesn't own the data — that still lives inside the form's root component — but it gives you a typed, ergonomic way to read and write it from outside the template.

```ts
const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const model = useModel(schema)
```

You can pass an object of default values as the second argument. Its shape must comply with the schema, so referencing a non-existent field or assigning the wrong value type produces a type error.

### Model Attachment

A model is really just a plain object holding the values you've set on it — until a form attaches it. Attachment happens when you pass the model to `!useForm`:

```ts
const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const model = useModel(schema, {
  name: 'John Doe',
})

const [MyForm] = useForm({ schema }, model)
```

Once attached, the model becomes the form's external state — the same way you'd bind a `v-model` to a regular Vue component. From that point on it delegates to the form context and unlocks the full form lifecycle (validation, submission, conditions, and so on); before attachment, only the values you explicitly set are visible.

```ts
const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const model = useModel(schema, {
  name: 'John Doe',
})

model.model // { name: 'John Doe' }

const [MyForm] = useForm({ schema }, model) // <- Attachment happens here

model.model // { name: 'John Doe', email: null }
```

When the form initializes, every element registers itself into the model. Keys you supplied keep their values; the rest are initialized to their `null` / empty state.

### Model API

`useModel` returns a typed API for reading, writing, and managing the form's data. The following members are available from the moment you call `!useModel`:

```ts
model.model                         // current model snapshot
model.attached                       // whether a form has attached the model
model.get('name')                   // single value by path
model.toJSON()                      // serialized model

model.set('name', 'Jane Doe')       // set value by path
model.update({ name: 'Jane Doe' })  // partial merge
model.reset()                       // restore initial values
model.clear()                       // clear all values
```

> Note: `get` and `set` accept dot-paths (`'name.first_name'`, `'team.0.name'`).

#### After Attachment

The remaining members read from form-level state that only exists once the form has mounted:

```ts
model.data         // model excluding elements with unmet conditions
model.completed    // every rule has run and none failed (or no rules at all)
model.validated    // every rule has run, regardless of outcome
model.dirty        // any value differs from its initial value
model.empty        // every value is its null/empty state
model.invalid      // at least one rule is currently failing
model.pending      // an async rule is currently running
model.debouncing   // a debounced rule is waiting to fire
model.busy         // pending or debouncing — blocks submission

model.validate()   // run every rule against the current data
model.clean()      // mark as not dirty by snapshotting the current value as the new initial
```

Before attachment, these props return `undefined` and the methods are no-ops — both log a warning if you call them prematurely.

## Validation

You can add validation to an element with the `rules` prop. Rules can be a pipe-separated string or an array:

```ts
const schema = defineSchema({
  email: {
    type: 'text',
    rules: 'required|email',
    // or: rules: ['required', 'email']
  },
})
```

### Custom & Async Rules

Vueform ships with a set of built-in rules registered globally and referenced by name. You can also define custom rules with `!createRule` and drop them into the `rules` array — useful for one-off rules and async checks against your own backend:

```ts
import { defineSchema, createRule } from '@vueform/ui'

const checkEmail = createRule('checkEmail', async (value) => {
  const res = await fetch(`/api/check-email?email=${value}`)
  const { available } = await res.json()

  return available || 'This email is already taken'
})

const schema = defineSchema({
  email: {
    type: 'text',
    rules: ['required', 'email', checkEmail],
  },
})
```

The check function returns `true` for valid, `false` for invalid (uses the rule's default message), or a string for invalid with a custom message. Async checks return a promise of the same.

### When Inputs Are Validated

An element can be validated by any of these events:

- `change` — runs on every value change.
- `blur` — runs when the element is blurred (loses focus) for the first time.
- `next` — runs before the user navigates to the next step on a stepped form.
- `submit` — runs when the form is submitted.

Once a rule has run for the first time by any of these triggers, the element switches to **live mode** and revalidates on every subsequent change. The trigger only controls when errors first appear; afterwards the user gets immediate feedback as they edit.

The active triggers are controlled by the `validateOn` prop on the form or the element. Elements only support `change` and `blur` (some, like lists, only support `change` because they aren't blurable); `next` and `submit` apply only at the form level.

```ts
const schema = defineSchema({
  name: { type: 'text', label: 'Name', rules: 'required' },
  email: {
    type: 'text',
    label: 'Email',
    rules: 'required|email',
    validateOn: ['blur'],
  },
})

const [MyForm] = useForm({
  schema,
  validateOn: ['change', 'next', 'submit'],
})
```

`email` validates only on blur, while `name` validates on every change.

## Submitting the Form

A form is submitted when the user clicks a button with `action` set to `'submit'`, or programmatically via the [form context's](#form-context) `submit()` method. Vueform then validates every element and sends the form's `data` to the configured `endpoint`.

```ts
const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  password: { type: 'text', label: 'Password', rules: 'required' },
  save: { type: 'button', text: 'Login', action: 'submit' },
})

const [MyForm] = useForm({
  schema,
  endpoint: '/api/login',
  method: 'POST',
  onResponse: (response: HttpResponse) => {
    response.data        // The parsed response body
    response.status      // HTTP status code, (e.g. `2xx`, `422`)
    response.statusText  // HTTP status text (e.g. `"OK"`)
    response.headers     // Response headers as a flat key-value map.
    response.config      // The request config that produced this response
  },
  onFail: (result: SubmitFail) => {},
  onSuccess: (result: SubmitSuccess) => {},
  onCancelled: (result: SubmitCancelled) => {},
  onInvalidServerResponse: (result: SubmitInvalid) => {},
})
```

`onResponse` fires whenever the form receives an HTTP response — a successful submission, a validation error, or any other HTTP error — and is a useful hook for analytics, logging, or syncing other parts of your app. It doesn't fire for network failures or aborted requests, since those never reach the server.

The other four hooks each fire for exactly one outcome of submission:

- `onSuccess` — the server returned a 2xx response.
- `onInvalidServerResponse` — validation failed, either client-side or as a 422 response from the server (`result.source` distinguishes them).
- `onFail` — the request errored (network, timeout, abort, or another non-2xx); `result.reason` says which.
- `onCancelled` — the submission was stopped before reaching the network — by a guard (form busy, disabled, or already invalid) or by `onSubmit` returning `false`; `result.reason` says why.

You can also submit programmatically by awaiting the [form context's](#form-context) `submit()`. It returns a `SubmitResult` — a discriminated union of the four outcomes above — that you can branch on directly:

```ts
const [MyForm, form$, formReady] = useForm({ schema }, model)

const result: SubmitResult = await form$?.submit()

if (result?.type === 'success') {
  // ...
}
```

### Doing a Pre-Check Before Submit

`onSubmit` runs after validation succeeds, before the request is sent. Use it to run any checks that should gate the submission:

```ts
const [MyForm] = useForm({
  schema,
  endpoint: '/api/login',
  onSubmit: async () => {
    const allowed = await checkRateLimit()

    if (!allowed) {
      return false
    }
  },
})
```

Returning `false` from `onSubmit` cancels the submission — the form won't get submitted to the `endpoint`.

### Handling Submit Manually

If you'd rather make the request yourself — to call your own API client, attach a captcha token, etc. — drop the `endpoint` and do the work inside `onSubmit`:

```ts
const [MyForm] = useForm({
  schema,
  onSubmit: async (data: FormData) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: data,
      })

      if (!res.ok) {
        alert('Something went wrong. Please try again.')
        return false
      }

      window.location.href = '/dashboard'
    } catch (err) {
      alert('Network error. Please check your connection.')
      return false
    }
  },
})
```

When you handle submission yourself, you take over full responsibility — making the request, surfacing errors, and any side effects (notifications, redirects, model updates) that follow.

Because Vueform never sees the response, the result events (`@response`, `@success`, `@serverInvalid`, `@fail`) don't fire. `@cancelled` still fires if you return `false` from `onSubmit`.

### Using `!useHttp`

[`useHttp`](/api/useHttp) is Vueform's wrapper around the Fetch API. It normalizes the response shape and throws a typed `HttpError` for non-2xx responses. Awaiting it and returning the result from `onSubmit` lets Vueform pick up the response and handle it the same way it would for a string `endpoint`:

```ts
import { useHttp } from '@vueform/ui'

const [MyForm] = useForm({
  schema,
  onSubmit: async (data) => {
    return await useHttp().post('/api/login', data)
  },
  onResponse: (response: HttpResponse) => {},
  onFail: (result: SubmitFail) => {},
  onSuccess: (result: SubmitSuccess) => {},
  onCancelled: (result: SubmitCancelled) => {},
  onInvalidServerResponse: (result: SubmitInvalid) => {},
})
```

Because the response flows back into Vueform, the form's events fire normally — `@response`, `@success`, `@serverInvalid`, `@fail`, and `@cancelled` all behave just as they do with a built-in `endpoint`.

## Form & Element Contexts

A **context** is the API exposed by a Vueform component instance — its current state, its props, its methods and its events. It's essentially the same object you'd get by putting a Vue template ref on the component. Both the form and every element have one. Most of the time you can ignore them and work with `model`, but they become essential when you need to reach into the form's or an element's wider API.

### Form Context

So far you've only used the first slot of `useForm`'s return. It actually returns a tuple of three: the renderable component, plus two handles to the form context — a reactive `form$` ref and a `formReady` function:

```ts
const [MyForm, form$, formReady] = useForm({ schema })
```

Use `formReady` with a callback to run code once the form has mounted:

```ts
formReady((form$) => {
  console.log(form$.model)
})
```

Or `await` it inline in an async flow — called without arguments, it returns a promise that resolves with the context:

```ts
const form$ = await formReady()
console.log(form$.model)
```

`form$` is a proxied ref which holds the context after mount and is `undefined` before — use it when you need to read the context from a Vue lifecycle hook or display it in the template:

```ts
import { onMounted } from 'vue'

form$?.model // undefined

onMounted(() => {
  form$?.model // { name: 'John', email: 'john@doe.com', ... }
})
```

::: tip
The `$` suffix is a Vueform convention for variables that hold a component's context.
:::

For the complete list of state flags, props and methods available on the form context, see [`!VfForm`'s context reference](/ui/VfForm#context).

### Element Contexts

Use the form context's `find()` method to retrieve an element by its path. The returned element context has its own state, props and methods:

```ts
formReady((form$) => {
  const email$ = form$.find('email')

  email$.model         // current value
  email$.update('jane@doe.com')
})
```

`find()` accepts dot-paths (`'address.city'`, `'team.0.name'`) and is fully typed when the form was created with `useForm` — autocompletion knows that `find('email')` returns a `VfText` context.

Each element type exposes its own context with type-specific additions. For example, [`VfText`'s context reference](/ui/VfText#context) lists everything available on a text element.

## Next Steps

You now know the basics of working with Vueform — defining a schema, binding a model, validating inputs, submitting data, and reaching contexts when you need them. The rest of the guide goes deeper into each of these topics and introduces capabilities not covered here.

Recommended next reads:

- [Available Element Types](/)
- [Creating Components (advanced)](/)
- [Rendering](/guide/rendering)
- [Other Wrappers Beyond `group` and `list`](/)
- [Full Validation Guide](/)
- [Full Form Submitting Guide](/)
- [Stepped and Tabbed Forms](/)
- [Using Conditions](/)
- [Using Expressions](/)
- [Using Input Masks](/)
- [Using Dates](/)
- [Theming Forms](/)
- [Configuration Options](/)
- [Plugin System](/)
- [Internationalization](/)
- [Accessibility](/)
- [Server Side Rendering (SSR)](/)
- [Optimizing Bundle Size](/)
- [Performance Benchmarks](/)
- [Security Policy](/)
- [Testing 101](/)
- [Contribution Guide](/)
- [Current State](/)
- [Roadmap](/)
