---
outline: [2,3]
---

# Submit

Submitting a form sounds like a single action, but it's a cycle: validate the data, take the payload, send the request, classify what came back, and react to it — display errors, apply server values, reset, redirect. Vueform owns this entire cycle. This chapter walks through it the same way the [Model](/guide/model) and [Validation](/guide/validation) chapters did — starting below the component layer, then mounting a form and turning on the machinery piece by piece.

## Submission Without a Form

A [`!useModel`](/guide/model) instance can't submit itself — submission is a form capability. But every ingredient of a submission is already there, headlessly: validation, the payload, and the [HTTP module](/guide/http). Composed by hand:

```ts
import { defineSchema, useModel, useHttp } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  plan: { type: 'select', label: 'Plan', items: ['free', 'pro'] },
})
d
const model = useModel(schema, { email: 'jane@example.com', plan: 'pro' })

if (await model.validate()) {
  await useHttp().post('/api/register', model.payload)
}
```

Validate, take the payload, send it. That's all a submission is. `payload` is the model minus elements whose [Conditions](/guide/conditions) aren't met and elements with `submit: false`; `toFormData()` and `toJSON()` produce the same data as `FormData` or a JSON string when your endpoint needs a specific wire format.

The form's `submit()` is this same three-line cycle, industrialized: guard checks, validation triggers, an interceptable request, response classification, error display, and post-submission actions. Everything that follows describes that machine.

## The Same Schema, Mounted

Hand the schema to a form, add an `endpoint` and a submit button, and the cycle runs itself:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  plan: { type: 'select', label: 'Plan', items: ['free', 'pro'] },
  save: { type: 'button', text: 'Save', action: 'submit' },
})

const [MyForm] = useForm({ schema, endpoint: '/api/register' })
```

```vue [Template]
<VfForm endpoint="/api/register">
  <VfText name="email" label="Email" rules="required|email" />
  <VfSelect name="plan" label="Plan" :items="['free', 'pro']" />
  <VfButton name="save" text="Save" action="submit" />
</VfForm>
```

:::

Clicking **Save** now does what the manual version did, plus everything around it: the form validates first (scrolling to and focusing the first invalid element on failure), builds the payload, sends it as a `POST` request, classifies the response as success / invalid / fail, and fires the matching [events](#result-events). One prop and one button replace the hand-rolled flow — and every stage stays overridable.

## Triggering Submission

### With a Submit Button

The most common trigger is a button whose `action` prop is `'submit'`, as in the example above. Clicking it runs the full submission flow. (`action: 'reset'` is its counterpart for resetting; any other string is application-defined and handled via the button's `click` event.)

### Programmatically

The form context exposes `submit()` directly. Use it when the trigger lives outside the form — a confirmation dialog, a keyboard shortcut, an external toolbar:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
})

const [MyForm, form$] = useForm({ schema, endpoint: '/api/register' })

const handleClick = async () => {
  const result = await form$?.submit()
}
</script>

<template>
  <MyForm />
  <button @click="handleClick">Submit from outside</button>
</template>
```

```vue [Template]
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')

const handleClick = async () => {
  const result = await form$.value?.submit()
}
</script>

<template>
  <VfForm ref="form$" endpoint="/api/register">
    <VfText name="email" label="Email" rules="required|email" />
  </VfForm>

  <button @click="handleClick">Submit from outside</button>
</template>
```

:::

`submit()` performs exactly what a submit button does and resolves with a [`SubmitResult`](#submit-result) describing the outcome.

### Through an Attached Model

When a form [attaches](/guide/model#attaching-the-model) a `!useModel` instance, the instance gains `submit()` — it submits the attaching form:

```ts
const model = useModel(schema)
const [MyForm] = useForm({ schema, endpoint: '/api/register' }, model)

// after mount:
const result = await model.submit()
```

This is deliberate: the headless model never has an endpoint of its own. Submission — the endpoint, the request, the lifecycle — belongs to the form, and attachment is what connects the two. Calling `submit()` on an unattached instance logs a warning and does nothing.

## Submission Lifecycle

Every submission — button, `form$.submit()`, or `model.submit()` — follows the same sequence:

1. **Guard checks** — if the form is `loading`, `disabled`, or already `submitting`, the call short-circuits with a `cancelled` result. See [Submission Gates](#submission-gates).
2. **Validation** — always runs, regardless of `validateOn`: every element without a current passing result is validated (adding `'submit'` to `validateOn` forces a complete re-run instead — see [Validation on Submit](#validation-on-submit)). If the form ends up invalid, the call resolves with a client-side `invalid` result before any HTTP traffic, and Vueform scrolls to and focuses the first invalid element.
3. **`@submit` event** — fires with the prepared [payload](#the-payload). The handler can let the flow continue, cancel it, or replace the request entirely.
4. **Endpoint** — if the `@submit` handler didn't take over, the configured `endpoint` is called (string URL or function).
5. **Response classification** — the outcome is categorized as `success` (`2xx`), `invalid` (`422`), or `fail` (network error, timeout, abort, any other HTTP error).
6. **Result events** — `@response`, then `@success` / `@serverInvalid` / `@fail`, depending on the outcome.
7. **Post-submission actions** — on success, Vueform displays the success message, resets or clears the form, applies the response payload, scrolls to the top, and redirects — whichever of those you configured, in that order.

Each phase is detailed in the sections below.

## The Payload

The payload is the data a submission sends: the model minus elements whose [Conditions](/guide/conditions) aren't met and elements with `submit: false`. Submission doesn't build it — it's a live projection, readable at any time as `form$.payload` (or `model.payload` on a headless instance).

### Transforming the Payload

Use `transformPayload` to shape it:

::: code-group

```ts [Schema]
const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  transformPayload: (payload, context$) => ({
    ...payload,
    submittedAt: new Date().toISOString(),
  }),
})
```

```vue [Template]
<VfForm
  endpoint="/api/register"
  :transform-payload="
    (payload, context$) => ({
      ...payload,
      submittedAt: new Date().toISOString(),
    })
  "
/>
```

:::

The function receives the aggregated payload and the form's [Context](/guide/context), and must return the object to use. The transform is part of the payload itself, not a submission step — it applies everywhere the payload flows: `form$.payload` reads, the [`@submit`](#the-submit-event) event's argument, the [endpoint](#the-endpoint) request body, and [autosave](/guide/autosave) requests.

::: tip
The `payload` argument excludes elements whose [Conditions](/guide/conditions) aren't currently met and elements with `submit: false`. To submit the **full model** including those values, return `context$.model` instead:

```ts
transformPayload: (payload, context$) => context$.model
```

:::

::: info
[Autosave](/guide/autosave) requests send this same transformed payload. Use [`autosave.transform`](/guide/autosave#transforming-autosave-data) to shape autosaved data differently.
:::

## The Endpoint

The simplest submission setup is a string `endpoint`. Vueform sends the request through its built-in [HTTP module](/guide/http) and feeds the response into the lifecycle automatically.

::: code-group

```ts [Schema]
const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  method: 'POST',
})
```

```vue [Template]
<VfForm endpoint="/api/register" method="POST" />
```

:::

| Prop       | Description                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `endpoint` | A URL string, a [function](#endpoint-as-a-function), or an [Expression](/guide/expressions) (e.g. `/api/users/{id}`). |
| `method`   | The HTTP method. Defaults to `POST`.                                                                                  |

### Headers

Custom request headers can be added via the `headers` prop:

```vue
<VfForm endpoint="/api/register" :headers="{ 'X-Custom-Header': 'value' }" />
```

To apply headers to all HTTP requests globally, set them on the [HTTP module](/guide/http#configuring-defaults) instead — per-form `headers` are merged on top.

### Request Format

By default, the body is sent as `multipart/form-data` (built from a `FormData` instance). Most backends — Express, Laravel, Rails, etc. — accept this out of the box, and file uploads work without extra setup.

To send JSON instead, enable the `json` prop:

```vue
<VfForm endpoint="/api/register" json />
```

::: warning
Files can't be serialized as JSON. If your form contains file uploads and you still need a JSON body, enable the `base64` prop to convert files to base64 strings before submission:

```vue
<VfForm endpoint="/api/register" json base64 />
```

:::

To make JSON (or base64) the default for every form, set the props globally as [Defaults](/guide/defaults):

```ts
app.use(
  createVueform({
    defaults: {
      VfForm: {
        json: true,
        base64: true,
      },
    },
  })
)
```

Note that form submissions always set their request format explicitly, so the [`$http.requestType`](/guide/http#configuring-defaults) global applies to your own `useHttp()` calls, not to submissions — for forms, the `!VfForm` default above is the one that counts.

::: info
[Autosave](/guide/autosave) requests reuse the form's `headers`, `json`, and `base64` configuration, but run outside the submission lifecycle — no result events, no post-success actions.
:::

## Endpoint as a Function

When you need full control over the request — your own API client, an attached captcha token, branching on data before sending — pass a function as the `endpoint`. The function replaces the request but still participates in the result lifecycle: `@success`, `@serverInvalid`, and `@fail` all fire as usual.

::: code-group

```ts [Schema]
import { defineSchema, useForm, useHttp } from '@vueform/ui'

const $http = useHttp()

const [MyForm] = useForm({
  schema,
  endpoint: async (payload, context$) => {
    return await $http.post('/api/register', payload)
  },
})
```

```vue [Template]
<script setup lang="ts">
import { useHttp } from '@vueform/ui'

const $http = useHttp()

const handleEndpoint = async (payload, context$) => {
  return await $http.post('/api/register', payload)
}
</script>

<template>
  <VfForm :endpoint="handleEndpoint">
    <VfText name="email" label="Email" />
    <VfButton name="save" text="Save" action="submit" />
  </VfForm>
</template>
```

:::

The function's return value determines what happens next:

| Return value                                               | Effect                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `string`                                                   | Used as the endpoint URL — Vueform makes the request itself.                                                                                                                                                                                                           |
| [`HttpResponse`](/api/http#type-declarations.httpresponse) | Used directly as the response — `@success` / `@serverInvalid` / `@fail` fire based on its status. This is what the example above returns: `$http.post()` resolves with an `HttpResponse`, so `return await $http.post(…)` hands the outcome straight to the lifecycle. |
| `false`                                                    | Cancels submission with reason `'prevented'`.                                                                                                                                                                                                                          |
| `void`                                                     | The submission still happened — whatever your function did (including its own requests) is done — but Vueform received no response to classify: `submit()` resolves with `undefined` and no result events fire.                                                        |

Returning a string is convenient when only the URL needs computing:

```vue
<VfForm :endpoint="(payload, context$) => `/api/users/${payload.id}`" />
```

::: tip
An [Expression](/guide/expressions) does the same declaratively — `{id}` resolves from the model at submit time without involving a function:

```vue
<VfForm endpoint="/api/users/{id}" />
```

:::

::: tip
Use [`useHttp()`](/guide/http) for your requests so errors flow back into the form's pipeline. An `HttpError` thrown inside the endpoint function is caught and classified exactly like an error from a string endpoint — `422` becomes an `invalid` result, a network failure becomes `fail`, and so on.
:::

## The Submit Event

The `@submit` event fires after validation succeeds and before the endpoint request is made. It's the hook for last-mile interception — pre-checks, attached tokens, replacing the request, or just observing what's about to be sent.

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  // the second argument is the form's Context
  onSubmit: (payload, context$) => {
    console.log('About to submit:', payload)
  },
})
```

```vue [Template]
<script setup lang="ts">
// the second argument is the form's Context
const handleSubmit = (payload, context$) => {
  console.log('About to submit:', payload)
}
</script>

<template>
  <VfForm endpoint="/api/register" @submit="handleSubmit">
    <VfText name="email" label="Email" />
    <VfButton name="save" text="Save" action="submit" />
  </VfForm>
</template>
```

:::

The handler receives the prepared payload (after [`transformPayload`](#transforming-the-payload)) and the form's [Context](/guide/context). What it returns decides what Vueform does next.

### Cancelling Submission

Return `false` (sync or async — the handler is awaited) to cancel the flow. The endpoint is never called and `submit()` resolves with a `cancelled` result (reason: `'prevented'`).

```ts
onSubmit: async (payload, context$) => {
  const allowed = await checkRateLimit()
  if (!allowed) return false
}
```

### Handling the Request Yourself

If the handler returns an [`HttpResponse`](/api/http#type-declarations.httpresponse), the configured endpoint is **skipped** and the returned response feeds the result lifecycle directly. This makes `@submit` an alternative to [Endpoint as a Function](#endpoint-as-a-function): use the function endpoint when custom logic _is_ the submission mechanism, and the event when a string endpoint is the default and you only intercept conditionally:

```ts
const $http = useHttp()

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  onSubmit: async (payload, context$) => {
    if (payload.plan === 'enterprise') {
      // take over: `/api/register` is skipped, this response drives the result
      return await $http.post('/api/enterprise/register', payload)
    }
    // return nothing: every other plan continues to `/api/register`
  },
})
```

### Observing Only

If the handler returns nothing, the normal flow continues: a configured `endpoint` is called; without one, `submit()` resolves with `undefined` and no result events fire. The logging handler that opened this section is exactly this case — `@submit` as a fire-and-forget observer for analytics or logging, with the request left untouched.

## Aborting an In-Flight Request

The form context exposes `abort()`, which cancels the current HTTP request via an `AbortController`:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const [MyForm, form$] = useForm({ schema, endpoint: '/api/register' })

const handleCancel = () => form$?.abort()
</script>

<template>
  <MyForm />
  <button v-if="form$?.submitting" type="button" @click="handleCancel">
    Cancel
  </button>
</template>
```

```vue [Template]
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')

const handleCancel = () => form$.value?.abort()
</script>

<template>
  <VfForm ref="form$" endpoint="/api/register">
    <VfText name="email" label="Email" />
    <VfButton name="save" text="Save" action="submit" />
    <button v-if="form$?.submitting" type="button" @click="handleCancel">
      Cancel
    </button>
  </VfForm>
</template>
```

:::

When aborted, `submit()` resolves with a `fail` result whose `reason` is `'abort'`. Both examples gate the button with the reactive [`submitting`](#reactive-state) state, so the cancel control only appears while a request is actually in flight.

## Submit Result

`submit()` resolves with a discriminated union — `SubmitSuccess | SubmitInvalid | SubmitFail | SubmitCancelled` — or `undefined` when no result was produced. Branch on the `type` property:

```ts
const result = await form$?.submit()

switch (result?.type) {
  case 'success':   /* ... */ break
  case 'invalid':   /* ... */ break
  case 'fail':      /* ... */ break
  case 'cancelled': /* ... */ break
}
```

Every result carries `context$`, the form's [Context](/guide/context) — it appears in each shape below.

### Success

Returned when the request completes with a `2xx` status.

```ts
if (result?.type === 'success') {
  result.data     // response body
  result.status   // HTTP status code
  result.response // full HttpResponse
  result.context$ // the form's Context
}
```

### Invalid

Returned when validation fails — either client-side (before any request) or as a `422` from the server. The `source` property tells the two apart:

```ts
if (result?.type === 'invalid') {
  result.source   // 'client' | 'server'
  result.errors   // Record<string, string[]> keyed by element path
  result.issues   // [{ path, rule, message }] — structured counterpart
  result.context$ // the form's Context

  // Server-only:
  result.data     // response body
  result.response // full HttpResponse
}
```

For client-side failures, `errors` and `issues` are the form's own projections — the same objects as `form$.errors` and `form$.issues`. For server failures, `issues` is synthesized from the error map with `rule: 'server'`. For server failures, `errors` is the response's error map, shaped by [`transformServerInvalid`](#custom-error-format). See [Server Validation Errors](#server-validation-errors) for surfacing server errors on the elements automatically.

### Fail

Returned when the request fails for any reason other than `422` — network errors, timeouts, aborts, or any other non-`2xx` status.

```ts
if (result?.type === 'fail') {
  result.reason   // 'network' | 'timeout' | 'http' | 'abort' | 'unknown'
  result.status   // HTTP status code or null
  result.message  // human-readable message
  result.data     // response body or null
  result.response // HttpResponse or null
  result.context$ // the form's Context
}
```

### Cancelled

Returned when submission was stopped before any request was made.

```ts
if (result?.type === 'cancelled') {
  result.reason   // see table below
  result.context$ // the form's Context
}
```

| Reason       | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| `loading`    | The form was in a loading state.                           |
| `disabled`   | The form was disabled.                                     |
| `submitting` | A submission was already in progress.                      |
| `prevented`  | A `@submit` handler or endpoint function returned `false`. |
| `unknown`    | Catch-all for unexpected guard conditions.                 |

Note that a validation failure is **not** a cancellation — it produces an [`invalid`](#invalid) result with `source: 'client'`.

### Undefined

Without an endpoint and without a `@submit` handler returning a response, `submit()` resolves with `undefined` and no result events fire.

## Result Events

Instead of (or in addition to) inspecting the resolved result, listen for outcome events on the form. They receive the same result objects as their payload:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'
import type {
  HttpResponse,
  SubmitSuccess,
  SubmitServerInvalid,
  SubmitFail,
  SubmitCancelled,
} from '@vueform/ui'

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  onResponse: (response: HttpResponse) => {},
  onSuccess: (result: SubmitSuccess) => {},
  onServerInvalid: (result: SubmitServerInvalid) => {},
  onFail: (result: SubmitFail) => {},
  onCancelled: (result: SubmitCancelled) => {},
})
```

```vue [Template]
<VfForm
  endpoint="/api/register"
  @response="handleResponse"
  @success="handleSuccess"
  @server-invalid="handleServerInvalid"
  @fail="handleFail"
  @cancelled="handleCancelled"
/>
```

:::

| Event           | Fires when                                                                              | Argument                                                   |
| --------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `response`      | An HTTP response was received — success **or** error.                                   | [`HttpResponse`](/api/http#type-declarations.httpresponse) |
| `success`       | The request completed with `2xx`.                                                       | `SubmitSuccess`                                            |
| `serverInvalid` | The server responded with `422`.                                                        | `SubmitServerInvalid`                                      |
| `fail`          | The request errored (network, timeout, abort, other non-`2xx`).                         | `SubmitFail`                                               |
| `cancelled`     | Submission was cancelled by a [gate](#submission-gates) or a handler returning `false`. | `SubmitCancelled`                                          |

::: warning
The events cover the _server-facing_ outcomes. A **client-side** validation failure resolves `submit()` with an `invalid` result but fires no form-level event — the failing elements fire their own `invalid` [events](/guide/event-handlers), and errors render on the form. Similarly, `response` never fires for aborted requests or client-side failures, since no response was received.
:::

## Server Validation Errors

When the server responds with `422`, Vueform classifies the result as `invalid` with `source: 'server'`. The errors are available on the result object, but by default they are **not** displayed on the elements. There are three ways to handle them.

### Automatic Display with `set-invalid`

The simplest path: enable the `set-invalid` prop and Vueform appends each error to the matching element's [`messageBag`](/api/modules/messageBag), then scrolls to and focuses the first invalid element (per [`scroll-to-error` and `focus-error`](/guide/validation#scroll-and-focus)).

::: code-group

```ts [Schema]
const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  setInvalid: true,
})
```

```vue [Template]
<VfForm endpoint="/api/register" set-invalid>
  <VfText name="email" label="Email" />
  <VfText name="username" label="Username" />
  <VfButton name="save" text="Save" action="submit" />
</VfForm>
```

:::

If the server returns:

```json
{
  "errors": {
    "email": ["This email is already taken"],
    "username": ["Must be at least 3 characters"]
  }
}
```

each message appears on the corresponding element, just like a client-side rule failure. Keys are element data paths — `address.city` targets a nested element. By default Vueform reads the errors from the response body's `errors` key, falling back to treating the whole body as the error map.

### Custom Error Format

If your API uses a different shape, adapt it with `transform-server-invalid`:

::: code-group

```ts [Schema]
const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  setInvalid: true,
  transformServerInvalid: (data, context$) => data?.validationErrors || {},
})
```

```vue [Template]
<VfForm
  endpoint="/api/register"
  set-invalid
  :transform-server-invalid="(data, context$) => data?.validationErrors || {}"
/>
```

:::

The function receives the raw response body and must return an object keyed by element data paths with arrays of messages as values: `{ email: ['Already taken'], 'address.city': ['Required'] }`. Its output also becomes `result.errors` on the [`SubmitServerInvalid`](#invalid) result.

### Manual Handling

For full control — merging server errors with custom UI, dispatching them to a toast — listen to `@serverInvalid` and read `result.errors`:

```ts
onServerInvalid: (result) => {
  for (const [path, messages] of Object.entries(result.errors)) {
    showToast(`${path}: ${messages.join(', ')}`)
  }
}
```

This combines freely with `set-invalid` if you want the automatic display **and** custom handling. For appending errors to elements yourself, see [Manual Errors](/guide/validation#manual-errors).

## Applying the Response

After a successful submission, the server can send values back to be written into the form — the assigned ID after creating a record, normalized fields, computed values. Enable the `set-response` prop and Vueform reads the `payload` key of the response body and updates matching elements by data path.

::: code-group

```ts [Schema]
const schema = defineSchema({
  id: { type: 'hidden' },
  title: { type: 'text', label: 'Title' },
  slug: { type: 'text', label: 'Slug' },
  save: { type: 'button', text: 'Save', action: 'submit' },
})

const [MyForm] = useForm({
  schema,
  endpoint: '/api/posts',
  setResponse: true,
})
```

```vue [Template]
<VfForm endpoint="/api/posts" set-response>
  <VfHidden name="id" />
  <VfText name="title" label="Title" />
  <VfText name="slug" label="Slug" />
  <VfButton name="save" text="Save" action="submit" />
</VfForm>
```

:::

Given a response of:

```json
{
  "payload": {
    "id": 42,
    "slug": "my-post"
  }
}
```

`id` and `slug` are written back into the form. Subsequent submissions then include the server-assigned values — exactly what you want when the form keeps editing the record it just created.

::: tip
Response application runs **after** `reset-on-success` / `clear-on-success`, so server-assigned values survive the reset.
:::

### Custom Response Location

If your API returns the values under a different key, use `transform-response`:

```vue
<VfForm
  endpoint="/api/posts"
  set-response
  :transform-response="(data, context$) => data?.result?.fields || {}"
/>
```

The function receives the response body and must return an object keyed by element data paths: `{ id: 42, 'address.city': 'Berlin' }`.

## After a Successful Submission

Several props wire up actions that run automatically once the request succeeds, in this order:

1. `success-message`
2. `reset-on-success` / `clear-on-success`
3. `set-response`
4. `scroll-top-on` (for `'success'`)
5. `redirect`

### Success Message

Add a one-shot confirmation message to the form's [`messageBag`](/api/modules/messageBag):

```vue
<VfForm endpoint="/api/register" success-message="Registration complete!" />
```

The value is a [Dynamic Prop](/guide/dynamic-props) — a static string, a function with access to the form context, or an [Expression](/guide/expressions):

```vue
<!-- Function -->
<VfForm
  endpoint="/api/register"
  :success-message="(form$) => `Welcome, ${form$.model.name}!`"
/>

<!-- Expression -->
<VfForm endpoint="/api/register" success-message="Welcome, {name}!" />
```

### Reset or Clear

`reset-on-success` restores the form to its initial state — the values present when it mounted (or at the last `clean()` call). `clear-on-success` empties every value instead:

```vue
<!-- Back to initial values -->
<VfForm
  endpoint="/api/register"
  reset-on-success
  success-message="Registration complete!"
/>

<!-- Blank slate -->
<VfForm
  endpoint="/api/register"
  clear-on-success
  success-message="Submitted!"
/>
```

Use whichever answers "what state should the form be in afterwards?" — back to its starting values, or blank.

### Scroll to Top

Scroll back to the top of the form on success — useful in long forms where the success message would otherwise sit off-screen. The trigger is part of the general `scroll-top-on` prop:

```vue
<VfForm
  endpoint="/api/register"
  :scroll-top-on="['success']"
  success-message="Registration complete!"
/>
```

The array accepts `'success'`, `'error'` (a failed submit-time validation), `'next'` and `'back'` (step navigation in [multi-page forms](/guide/multi-page-forms)), and `'always'` — the default, covering all of them.

### Redirect

Send the user somewhere else after success:

```vue
<VfForm endpoint="/api/register" redirect="/thank-you" />
```

The redirect happens **after** `submit()` resolves with its `success` result, so event handlers and programmatic callers still see that result before navigation. Like `success-message`, `redirect` is a [Dynamic Prop](/guide/dynamic-props):

```vue
<!-- Function -->
<VfForm
  endpoint="/api/register"
  :redirect="(form$) => `/users/${form$.result?.data?.id}`"
/>

<!-- Expression -->
<VfForm endpoint="/api/register" redirect="/users/{id}" />
```

## Submission Gates

Submission is blocked — `submit()` returns a [`cancelled`](#cancelled) result and `@cancelled` fires — when any of the following is true:

| State        | Cancel reason  | Description                                                                                 |
| ------------ | -------------- | ------------------------------------------------------------------------------------------- |
| `loading`    | `'loading'`    | The `loading` prop is `true`, or the form is busy — an async rule is pending or debouncing. |
| `disabled`   | `'disabled'`   | The `disabled` prop (or its [conditional](/guide/conditions) form) resolves to `true`.      |
| `submitting` | `'submitting'` | A previous `submit()` call hasn't completed yet.                                            |

```vue
<VfForm :loading="fetchingInitialData" endpoint="/api/register">
  <!-- ... -->
</VfForm>
```

This is useful when bootstrapping a form with data from another request — keep `loading` set until the data arrives so the user can't submit incomplete state.

## Validation on Submit

Submission **always validates** — regardless of what `validateOn` contains, every element without a current passing result runs its rules before the request is made, so an untouched form can never submit unvalidated. On failure, `submit()` short-circuits with a client-side [`invalid`](#invalid) result — the request never reaches the network — and Vueform scrolls to and focuses the first invalid element.

Two dials adjust this behavior, both covered in [Submission](/guide/validation#submission) section under the Validation guide: adding `'submit'` to `validateOn` forces a complete re-run of every element on each attempt, and the programmatic `form$.disableValidation()` call — deliberately not a prop — skips submit-time validation entirely, leaving the server's [`422` handling](#server-validation-errors) as the only safety net.

Everything else validation-related — rules, triggers, messages, scroll and focus behavior — lives in [Validation](/guide/validation).

## Reactive State

The form context exposes reactive properties tracking submission progress. Read them in templates, watchers, or computed values:

| Property     | Type                        | Description                                                                                       |
| ------------ | --------------------------- | ------------------------------------------------------------------------------------------------- |
| `submits`    | `number`                    | How many times submission has been attempted.                                                     |
| `submitting` | `boolean`                   | `true` while an HTTP request is in flight.                                                        |
| `validating` | `boolean`                   | `true` while validation runs during a submit call.                                                |
| `loading`    | `boolean`                   | `true` when the `loading` prop is set or any element is busy (pending or debouncing async rules). |
| `result`     | `SubmitResult \| undefined` | The result of the last submission.                                                                |
| `response`   | `HttpResponse \| undefined` | The raw HTTP response of the last submission.                                                     |

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const [MyForm, form$] = useForm({ schema, endpoint: '/api/register' })
</script>

<template>
  <MyForm />
  <p v-if="form$?.submitting">Sending your data...</p>
</template>
```

```vue [Template]
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')
</script>

<template>
  <VfForm ref="form$" endpoint="/api/register">
    <VfText name="email" label="Email" />
    <VfButton name="save" text="Save" action="submit" />

    <p v-if="form$?.submitting">Sending your data...</p>
  </VfForm>
</template>
```

:::

An attached `!useModel` instance mirrors this state headlessly — `model.submits`, for example, reads the attaching form's counter — completing the loop this chapter started with: one submission engine, readable from either side.
