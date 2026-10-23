---
outline: [2,3]
---

# Event Handlers

Vueform's events look and feel like Vue's — `@change` in the template, `onChange` in a schema — but run through Vueform's own pipeline, which adds the capabilities forms tend to need: handlers can be **asynchronous**, they can **return values** that decide what happens next (most commonly `false` to cancel an action), and they can be **subscribed programmatically** through any component's [Context](/guide/context).

For fire-and-forget side effects the syntax is identical to Vue. The extra power kicks in on events like `submit`, `beforeNext`, or `beforeFinish` — moments where you want to run a check, possibly against a server, and only then let the form proceed.

## Listening to Events

Attach listeners the way you would on any Vue component — `@event-name` in kebab-case in the template, or `onEventName` properties in PascalCase in a schema:

::: code-group

```vue [Template]
<VfText
  name="email"
  label="Email"
  @change="(value, oldValue, el$) => {
    /* ... */
  }"
/>
```

```ts [Schema]
defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    onChange: (value, oldValue, el$) => {
      /* ... */
    },
  },
})
```

:::

The events each component emits are listed on its reference page — [VfText](/components/VfText#events), [VfForm](/components/VfForm#events), and so on — along with each event's exact arguments.

### Handler Arguments

Events pass the firing component's [Context](/guide/context) as their **last argument**, giving the handler the component's full public API — and, through it, the form — without a template ref or a `find()` call:

::: code-group

```vue [Template]
<VfText
  name="email"
  label="Email"
  @change="(newValue, oldValue, el$) => {
    el$.form$?.find('confirm_email')?.validate()
  }"
/>
```

```ts [Schema]
defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    onChange: (newValue, oldValue, el$) => {
      el$.form$?.find('confirm_email')?.validate()
    },
  },
})
```

:::

## Subscribing at Runtime

Every component context exposes its event system directly. Use `on()` to subscribe after the fact — the natural moment is [`formReady`](/guide/context#useForm), once elements have registered and `find()` can resolve them:

```vue
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email' },
})

const [Form, form$, formReady] = useForm({ schema })

formReady((form$) => {
  form$.find('email')?.on('change', (value) => {
    /* ... */
  })

  form$.on('submit', (payload, context$) => {
    /* ... */
  })
})
</script>

<template>
  <Form />
</template>
```

Reach for this when listeners are attached dynamically, several places need to react to the same event, or the wiring lives outside the template — in a composable, a store, a [plugin](/guide/plugins).

### Unsubscribing

Listeners registered with `on()` are removed with `off()`, passing the same function:

```ts
const handleChange = (value) => {
  /* ... */
}

form$.find('email')?.on('change', handleChange)
form$.find('email')?.off('change', handleChange)
```

Calling `off()` without a callback removes **all** programmatically registered listeners for that event:

```ts
form$.find('email')?.off('change')
```

::: warning
`off()` only affects listeners registered through `on()`, `onBefore()`, or `onAfter()`. Handlers attached via template `@event` syntax or schema `onEventName` properties are component props — they live as long as the component does and can't be detached at runtime.
:::

## Cancelable Events

Some events read their handler's **return value**. The most common pattern: return `false` to cancel the action. On a stepped form, `@before-next` returning `false` keeps the user on the current page:

::: code-group

```vue [Template]
<VfForm stepped @before-next="(newPage, oldPage, pager, form$) => {
  if (!canProceed()) return false
}">
  <!-- ... -->
</VfForm>
```

```ts [Schema]
import { useForm, type Pager, type FormContext } from '@vueform/ui'

const [Form] = useForm({
  schema,
  stepped: true,
  onBeforeNext: (newPage, oldPage, pager: Pager, form$: FormContext) => {
    if (!canProceed()) return false
  },
})
```

:::

The cancelable events are the ones Vueform fires through its async pipeline: `submit` and `autosave`, plus the navigation pre-hooks `beforeNext`, `beforeBack`, `beforeStep`, `beforeTab`, and `beforeFinish`. Some accept richer return values too — `submit` and `autosave` can return an `HttpResponse` that replaces the built-in request (see [Submit](/guide/submit) and [Autosaving Forms](/guide/autosave)). Each event's reference entry notes whether its return value is read.

::: tip
This is why Vueform has its own event pipeline at all: Vue's native `emit()` discards listener return values, so cancelable and async events can't be built on top of it.
:::

## Async Handlers

Cancelable events can also be **async** — Vueform awaits the handler before deciding what to do:

```ts
const handleBeforeNext = async (newPage, oldPage, pager, form$) => {
  const valid = await validateOnServer(form$.payload)

  if (!valid) return false
}
```

While an async handler is pending, the component's `eventInProgress` state is `true` — the built-in UI uses it to keep navigation buttons disabled and prevent double-clicks until the handler resolves, with no manual loading state on your part.

::: warning
Async behavior only applies to the async-fired events listed above. Returning a `Promise` from a fire-and-forget event like `change` doesn't pause anything — the event continues immediately and the resolved value is ignored.
:::

## Before and After Hooks

Beyond `on()`, every context exposes `onBefore()` and `onAfter()` — listener queues that run around the main one:

```ts
formReady((form$) => {
  form$.onBefore('submit', (payload, context$) => {
    /* runs first */
  })

  form$.onAfter('submit', (payload, context$) => {
    /* runs after the on() listeners */
  })
})
```

The full execution order for any event is: `onBefore()` listeners → `on()` listeners → `onAfter()` listeners → the template / schema handler. For cancelable events, a `false` from any point in the chain stops everything after it.

These hooks exist for plugins and shared composables that need to wrap behavior around a user-defined handler without replacing it. Like `on()` listeners, they're removed with `off()`.

## Falling Back to Native Vue Emits

If you'd rather have Vueform behave like a stock Vue component — events flowing through `emit()`, visible in Vue DevTools' timeline, compatible with tooling that hooks the native emit mechanism — enable `nativeEmit` globally:

```ts
app.use(
  createVueform({
    nativeEmit: true, // [!code highlight]
  })
)
```

::: warning
With `nativeEmit: true`, template and schema handlers lose their return-value powers — `submit`, `beforeNext`, etc. can no longer be canceled or made async from an `@event` handler.
:::

Programmatic listeners are unaffected: `on()`, `off()`, `onBefore()`, and `onAfter()` operate on Vueform's listener registry, which stays in place — including cancellation from those listeners.

Use it only when DevTools visibility or interop with another library outweighs bi-directional events. Most apps should leave it off.
