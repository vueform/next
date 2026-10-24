---
outline: [2,3]
---

# Event Handlers

Vueform events bind exactly like Vue's — `@change` on a component in a template, `onChange` in a schema — but they fire through Vueform's own pipeline (a takeover you can *opt out of*), because Vue's `emit()` throws listener return values away. The pipeline awaits what pre-hook handlers return, so `false` can cancel a submission or a page change, and a returned response can take a request over. And unlike Vue's, listeners can also be subscribed programmatically — on the form, on a model, and from plugins.

## Listening to Events

In a template, events bind with Vue's `@kebab-case` syntax. In a schema or in `useForm` options, the same handler is an `onPascalCase` property:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    onChange: (newValue, oldValue, el$) => {
      console.log(`email: ${oldValue} → ${newValue}`)
    },
  },
})

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  onSuccess: (result) => {
    showToast('Registered!')
  },
})
</script>

<template>
  <MyForm />
</template>
```

```vue [Template]
<script setup lang="ts">
const onEmailChange = (newValue, oldValue) => {
  console.log(`email: ${oldValue} → ${newValue}`)
}

const onSuccess = () => showToast('Registered!')
</script>

<template>
  <VfForm endpoint="/api/register" @success="onSuccess">
    <VfText name="email" label="Email" @change="onEmailChange" />
  </VfForm>
</template>
```

:::

Most events end with the firing component's context as their last argument — the pattern [context](/guide/context#context-from-argument) covers. The exceptions are few. Every component's reference page lists its events with their exact arguments under the **Events** tab — see [`!VfForm`'s](/components/VfForm#events) or [`!VfText`'s](/components/VfText#events).

## Cancelable Events

Vueform's events come in two kinds. Most are notifications — the action already happened, return values are ignored, and a returned promise isn't awaited, so by the time it settles the event has long moved on. Pre-hook events fire *before* their action, and what their handlers return decides what happens next. Each handler runs in sequence and is awaited. Returning `false` cancels the pending action, while any other defined value becomes the event's result, the last one winning.

A pre-hook handler can hold its action for as long as it needs. This stepped form won't advance until the availability check resolves — and stays put when it fails:

```ts
const [MyForm] = useForm({
  schema,
  stepped: true,
  onBeforeNext: async (newPage, oldPage, pager, form$) => {
    if (!(await isEmailAvailable(form$.data.email))) return false
  },
})
```

While a navigation pre-hook is pending, the pager locks its controls — see [multi-page forms](/guide/multi-page-forms#events).

## Subscribing from Code

Every [context](/guide/context) carries its component's event system, so handlers don't have to be declared where the component is — `on(event, callback)` subscribes to the same events the `onXxx` / `@xxx` props bind, with the event named in camelCase.

The [form context](/guide/context#form-context) is the one you'll hold most often — the natural place is `formReady`, which hands over the mounted form — and from there any [element context](/guide/context#element-context) is one [`find()`](/guide/element-paths#paths-in-code) away:

```vue
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
})

const [MyForm, form$, formReady] = useForm({ schema, endpoint: '/register' })

formReady((form$) => {
  form$.on('success', (result) => showToast('Registered!'))

  form$.find('email')?.on('change', (value) => checkAvailability(value))
})
</script>

<template>
  <MyForm />
</template>
```

The same goes for a context however you got it — handed to an [event handler](#listening-to-events) as `context$`, or returned by [`useContext`](/guide/context#useContext) inside your own component rendered in a slot or template.

### Unsubscribing

The matching `off(event, callback)` removes a listener added with `on()` — pass the same function. Omitting the callback clears every programmatic listener for the event:

```ts
form$.on('success', notify)
form$.off('success', notify)
```

Template and schema handlers are component props. They follow their binding, and `off()` never touches them.

### From a Plugin

A plugin's `extend(props, api)` receives the same event methods — `on`, `off`, `fire`, and `fireAsync` — and runs for every instance of the components it applies to, so one `on()` there subscribes to all of them at once:

```ts
definePlugin(() => ({
  apply: 'VfText',
  extend(props, api) {
    api.on('change', (newValue, oldValue, el$) => {
      trackFieldChange(el$.path, newValue)
    })
  },
}))
```

See [extending components](/guide/plugins#extending-components) for everything else `extend` can do.

### On a Model

A `useModel` instance has its own `on(event, callback)`, which returns an unsubscribe function — there is no `off()`:

```ts
const stop = model.on('success', (result) => showToast('Saved'))

stop()
```

While a form has the instance [attached](/guide/model#attaching-the-model), the form mirrors its events into it. For pre-hooks the instance's listeners run after the form's and can cancel just the same, so `model.on('submit', () => false)` stops a form-driven submit.

## Execution Order

Every event runs its handlers in the same sequence:

1. `on()` listeners — [subscribed from code](#subscribing-from-code), plugin subscriptions included.
2. The template or schema handler.
3. The attached [model instance](#on-a-model)'s listeners — form events only, component lifecycle events excepted.

For [pre-hooks](#cancelable-events), a `false` returned at any point stops everything after it. Otherwise the last defined return value becomes the event's result — with one asymmetry: the attached model's listeners can still cancel, but a value they return only becomes the result when no form-side handler returned one.

## Firing Events

Component contexts and a plugin's [`api`](/guide/plugins#extending-components) also carry `fire(event, ...args)` and `fireAsync(event, ...args)`, which run the same pipeline the built-in events use, [execution order](#execution-order) included. `fireAsync` resolves with `false` when a handler canceled, with the handlers' result when one returned a value, and with `true` otherwise. On the form context, both also mirror into an attached model instance.

Firing presumes an event to fire. Declaring new ones is covered in [plugins](/guide/plugins#adding-props-and-emits) for plugin-added events and in [components](/guide/components) for custom components.

## Falling Back to Native Vue Emits

Vue's `emit()` is fire-and-forget on purpose — any number of unrelated listeners may answer one event, so no single return value could be authoritative, and awaiting handlers mid-render isn't something Vue's scheduling can absorb. Vueform's events dodge both hazards, because they aren't open-ended component communication: return values feed exactly one consumer — the form engine deciding whether to proceed — under the defined [execution order](#execution-order), the same way a router's navigation guards work. That is what buys cancelable submits, awaited pre-hooks, and programmatic subscription.

If you'd rather have plain Vue semantics, the takeover is one flag. Setting [`nativeEmit: true`](/guide/configuration#nativeEmit) in config routes template and schema handlers through Vue's own `emit()`. Events then show up in Vue DevTools' timeline and work with any tooling that hooks native emits:

```ts
app.use(
  createVueform({
    nativeEmit: true, // [!code highlight]
  })
)
```

The trade-off follows directly — template and schema handlers are neither awaited nor read, so they can no longer cancel or take over a [pre-hook](#cancelable-events). Programmatic listeners — `form$.on()`, a plugin's `api.on()`, `model.on()` — run through Vueform's registry either way and keep their full return-value power.

The option defaults to `false`, and its reference entry lives in [configuration](/guide/configuration#nativeEmit). Leave it off unless DevTools visibility or emit-level interop matters more than cancelable template handlers.
