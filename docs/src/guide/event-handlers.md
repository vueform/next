---
outline: [2,3]
---

# Event Handlers

Vueform events bind exactly like Vue's — `@change` on a component in a template, `onChange` in a schema — but they fire through Vueform's own pipeline, because Vue's `emit()` throws listener return values away. The pipeline awaits what pre-hook handlers return, so `false` can cancel a submission or a page change, and a returned response can take a request over. Listeners can also be attached from code — on the form, on a [model](/guide/model), and from [plugins](/guide/plugins).

## Listening to Events

In a template, events bind with Vue's `@kebab-case` syntax. In a schema or in `useForm` options, the same handler is an `onPascalCase` property:

```ts
const [MyForm] = useForm({
  schema: {
    email: {
      type: 'text',
      label: 'Email',
      onChange: (newValue, oldValue, el$) => {
        console.log(`email: ${oldValue} → ${newValue}`)
      },
    },
  },
  endpoint: '/api/register',
  onSuccess: (result) => {
    showToast('Registered!')
  },
})
```

In a template the same two are `@change` on the element and `@success` on the form.

Most events end with the firing component's context as their last argument — the pattern [context](/guide/context#context-from-argument) covers. The exceptions are few. Submission result events (`success`, `fail`, `clientInvalid`, `serverInvalid`, `canceled`) receive only the result object and carry the context on it as `result.context$`, `response` and `update:modelValue` carry no context at all, and page-navigation events pass the `pager` before the context. Every component's reference page lists its events with their exact arguments under the **Events** tab — see [`!VfForm`'s](/components/VfForm#events) or [`!VfText`'s](/components/VfText#events).

## Cancelable Events

Vueform's events come in two kinds. Most are notifications — the action already happened, return values are ignored, and a returned promise isn't awaited, so by the time it settles the event has long moved on. Pre-hook events fire *before* their action, and what their handlers return decides what happens next. Each handler runs in sequence and is awaited. Returning `false` cancels the pending action, while any other defined value becomes the event's result, the last one winning.

| Event | Fires before | Return values |
| --- | --- | --- |
| `@submit` | the submission request | `false` cancels the attempt with reason `'prevented'`, an `HttpResponse` [takes the request over](/guide/submit#intercepting-with-submit) |
| `@autosave` | a remote save | `false` skips the save, a `string` redirects it to that URL, an `HttpResponse` [replaces the request](/guide/autosave#intercepting-with-autosave) |
| `@save-draft` / `@restore-draft` / `@discard-draft` | the automatic [draft actions](/guide/autosave#observing-saves) | `false` skips the action |
| `@before-next` / `@before-back` / `@before-step` | [step navigation](/guide/multi-page-forms#events) in a stepped form | `false` keeps the current step |
| `@before-tab` | a tab change — on a tabbed form ([events](/guide/multi-page-forms#events)) and on a tabbed [`!VfGroup`](/guide/form-structure#tabbed-groups) | `false` keeps the current tab |
| `@before-finish` | the [last step's](/guide/multi-page-forms#events) submit | `false` stops it |

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

`form$.on(event, callback)` adds a listener on the [form context](/guide/context#form-context). The natural place is `formReady`, which hands over the mounted form:

```vue
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
})

const [MyForm, form$, formReady] = useForm({ schema, endpoint: '/api/register' })

formReady((form$) => {
  form$.on('success', (result) => showToast('Registered!'))
})
</script>

<template>
  <MyForm />
</template>
```

Event names may be camelCase or kebab-case — both normalize to the same event, so `on('beforeNext')` and `on('before-next')` register the same listener. The pre-mount `form$` already accepts `on()` too, because the registration lands on the form's bound [model instance](#on-a-model) and the mounted form keeps firing its events into it. Component lifecycle events (`mounted`, `beforeUnmount`, …) never reach the instance, though, and a form modeled by a plain ref or reactive object has no instance at all — its pre-mount `form$.on` is `undefined` and calling it throws — so `formReady` stays the safe default.

Element contexts carry no `on()` or `off()`. To react to an element's events, bind its `onXxx` / `@xxx` handler, or listen to the form's `change`, which fires on every element change. To attach behavior to every element of a type from code, use a plugin — see [Hooks for Plugins](#hooks-for-plugins).

### Unsubscribing

`form$.off(event, callback)` removes a listener added with `on()` — pass the same function. Omitting the callback clears every programmatic listener for the event, the `onBefore` / `onAfter` queues included:

```ts
form$.on('success', notify)
form$.off('success', notify)
```

Template and schema handlers are component props. They follow their binding, and `off()` never touches them.

### On a Model

A `!useModel` instance has its own `on(event, callback)`, which returns an unsubscribe function — there is no `off()`:

```ts
const stop = model.on('success', (result) => showToast('Saved'))

stop()
```

The available events are `change`, `load`, `reset`, `clear`, `invalid`, `valid`, and the submission events `submit`, `response`, `success`, `fail`, `clientInvalid`, `serverInvalid`, and `canceled`. The same list is accepted as `onXxx` options of `useModel`.

While a form has the instance [attached](/guide/model#attaching-the-model), the form mirrors its events into it. For pre-hooks the instance's listeners run after the form's and can cancel just the same, so `model.on('submit', () => false)` stops a form-driven submit.

## Execution Order

Every event runs its handlers in the same sequence:

1. `onBefore` listeners — registered by [plugins](#hooks-for-plugins).
2. `on()` listeners — [subscribed from code](#subscribing-from-code).
3. `onAfter` listeners — plugins again.
4. The template or schema handler.
5. The attached [model instance](#on-a-model)'s listeners — form events only, component lifecycle events excepted.

For [pre-hooks](#cancelable-events), a `false` returned at any point stops everything after it. Otherwise the last defined return value becomes the event's result, with the form's result winning over the attached model's.

### Hooks for Plugins

`onBefore()` and `onAfter()` aren't on any context. They live on the `api` a plugin's `extend(props, api)` receives, alongside `on`, `off`, `fire`, and `fireAsync` — and since that `api` exists for every component, elements included, a plugin is also the way to subscribe to element events from code. The hooks wrap behavior around the user's own handler without replacing it, running before a `submit` handler or after each `change`:

```ts
definePlugin(() => ({
  apply: 'VfText',
  extend(props, api) {
    api.onAfter('change', (newValue, oldValue, el$) => {
      trackFieldChange(el$.path, newValue)
    })
  },
}))
```

See [extending components](/guide/plugins#extending-components) for everything else `extend` can do.

## Firing Events

The form context and a plugin's `api` also carry `fire(event, ...args)` and `fireAsync(event, ...args)`, which run the same pipeline the built-in events use, [execution order](#execution-order) included. `fireAsync` resolves with `false` when a handler canceled, with the handlers' result when one returned a value, and with `true` otherwise. On the form context, both also mirror into an attached model instance.

Firing presumes an event to fire. Declaring new ones is covered in [plugins](/guide/plugins#adding-props-and-emits) for plugin-added events and in [components](/guide/components) for custom components. And `!createEvents` is the same system with no component behind it — it's what `useModel` builds its emitter from — so your own event-emitting composables can use it too; see its [API page](/api/helpers/createEvents).

## Falling Back to Native Vue Emits

Setting `nativeEmit: true` in `createVueform` routes template and schema handlers through Vue's own `emit()`. Events then show up in Vue DevTools' timeline and work with any tooling that hooks native emits:

```ts
app.use(
  createVueform({
    nativeEmit: true, // [!code highlight]
  })
)
```

The trade-off is that native emits are fire-and-forget — template and schema handlers are neither awaited nor read, so they can no longer cancel or take over a [pre-hook](#cancelable-events). Programmatic listeners — `form$.on()`, a plugin's `onBefore` / `onAfter`, `model.on()` — run through Vueform's registry either way and keep their full return-value power.

The option defaults to `false`, and its reference entry lives in [configuration](/guide/configuration#nativeemit). Leave it off unless DevTools visibility or emit-level interop matters more than cancelable template handlers.
