---
outline: [2,3]
---

# Submit

A form submission is an HTTP request wrapped in guarantees. The data is valid before it leaves, the response is classified when it comes back, and the form reacts to each outcome — errors appear, values update, the user moves on — without hand-written glue. Vueform ships this entire round trip, and every stage of it can be observed, reconfigured, or replaced.

## A Form That Submits

The smallest submitting form is a schema, an `endpoint`, and a button whose `action` is `'submit'`:

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

Clicking **Save** runs a complete submission, and three guarantees come with it:

- The form [validates](/guide/validation) first. An invalid form never reaches the network — instead, the first invalid element is scrolled into view and focused.
- The data is collected into a payload and sent to the endpoint as a `POST` request.
- The response is classified as success, invalid, or fail, and the matching event fires on the form.

The request method defaults to `POST` and can be changed with the `method` prop:

```vue
<VfForm endpoint="/api/users/1" method="PUT" />
```

Buttons know one other built-in action — `action: 'reset'` restores the form instead of submitting it. Every other `action` string is left to the application and surfaces through the button's `click` event.

## Other Ways to Trigger

### Programmatically

Not every trigger lives inside the form. A confirmation dialog, a keyboard shortcut, or an external toolbar can start the same submission by calling `submit()` on the form context:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
})

const [MyForm, form$] = useForm({ schema, endpoint: '/api/register' })

const handleClick = async () => {
  const result = await form$.submit()
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

`submit()` is the same code path a submit button runs — gates, validation, request, classification, all of it. On top of that it's awaitable, resolving with a [`SubmitResult`](#the-result) that describes how the attempt ended.

### Through a Model

A headless `!useModel` instance carries a submission engine of its own. Give it an `endpoint` and its `submit()` runs the same flow a form would, without any component mounted:

```ts
const model = useModel({
  schema,
  endpoint: '/api/register',
})

const result = await model.submit()
```

Everything this chapter covers — the props, the transforms, the result callbacks — applies to the instance's options the same way it applies to a form. Without an `endpoint`, there is simply nowhere to send the data, so `submit()` validates and resolves with `undefined` (or a client-side `invalid` result).

Once a form [attaches](/guide/model#attaching-the-model) the instance, nothing changes on the model's side — `model.submit()` keeps working and the submission state reads the same. The form simply becomes the engine, so its props configure the request:

```ts
const model = useModel({ schema })
const [MyForm, form$, formReady] = useForm(
  { schema, endpoint: '/api/register' },
  model
)
```

Besides `model`, the same `submit()` is now also reachable through the form's context — via `form$`, or via `formReady`, which waits for the form to mount before handing the context over:

```ts
// once the form has mounted, each of these runs
// the same submission through /api/register:
await model.submit()
await form$.submit()
await (await formReady()).submit()
```

When both sides define submission props — e.g. `endpoint` — the form's are in effect while it's attached. Delegation hands the entire submission to the form, and the `!useModel` instance's own submission options sit idle until the form releases it again.

## The Submission Lifecycle

Every trigger — a submit button, `form$.submit()`, `model.submit()` — funnels into one sequence:

1. **Gates** — a form that is loading, disabled, or already submitting doesn't start another attempt. The call resolves with a `canceled` result and goes no further. See [Gates](#gates).
2. **Validation** — the floor that always runs, no matter how the form otherwise validates. If the form comes out invalid, the call resolves with a client-side `invalid` result before any network traffic, and the first invalid element is scrolled into view and focused, unless [disabled](/guide/validation#scroll-and-focus). See [When Validation Fails](#when-validation-fails).
3. **The `@submit` event** — fires with the [payload](#what-gets-sent) about to be sent. A handler can observe it, cancel the attempt, or take the request over entirely. See [Owning the Request](#owning-the-request).
4. **The request** — unless a handler took over, the payload is sent to the `endpoint`. What's in the payload and how it's encoded have their own sections — [What Gets Sent](#what-gets-sent) and [Request Format](#request-format).
5. **Classification** — the outcome is categorized by the response: `2xx` is a `success`, `422` is a server-side `invalid`, and everything else — network error, timeout, abort, any other status — is a `fail`. See [The Result](#the-result).
6. **Result events** — `@response` fires with the raw response, then the outcome's own event follows. See [Result Events](#result-events).
7. **Post-success actions** — on `success`, the configured follow-ups run in a fixed order — message, reset or clear, response application, scroll, redirect. See [After Success](#after-success).

The four words naming the outcomes — `success`, `invalid`, `fail`, `canceled` — are the chapter's vocabulary. Every attempt that has somewhere to send the data ends in exactly one of them, readable from the resolved result, the result events, and the form's state alike.

## Submission State

Every attempt is tracked through a handful of reactive properties:

| Property | Type | Description |
| --- | --- | --- |
| `submitting` | `boolean` | `true` while the HTTP request is in flight. |
| `validating` | `boolean` | `true` while the submit-time validation runs. |
| `loading` | `boolean` | `true` while the `loading` prop is set or any element's async rules are pending or debouncing. |
| `submits` | `number` | The number of attempts so far. Every `submit()` call counts, including [gated](#gates) ones. |
| `result` | `SubmitResult \| undefined` | The last attempt's [result](#the-result). |
| `response` | `HttpResponse \| undefined` | The last attempt's raw HTTP response. |

Read them via the form context ([`form$` / `formReady`](/guide/context#form-context)) or, headlessly, via [`!useModel`](/guide/model#the-model-api).

## Gates

Three states stop a submission before it starts. Each resolves `submit()` with a [`canceled`](#the-result) result carrying the matching reason and fires the `@canceled` event — no validation, no request:

| State | Cancel reason | When |
| --- | --- | --- |
| `loading` | `'loading'` | The [`loading`](/components/VfForm#props.loading) prop is set, or an element's async rules are pending or debouncing. |
| `disabled` | `'disabled'` | The [`disabled`](/components/VfForm#props.disabled) prop resolves to `true`. |
| `submitting` | `'submitting'` | A previous attempt hasn't finished yet. This is the built-in double-submit protection. |

The `loading` gate doubles as a tool. When a form is populated from another request, keep `loading` set until the data lands, and a half-filled form can't be submitted:

```vue
<VfForm :loading="fetchingInitialData" endpoint="/api/register">
  <!-- … -->
</VfForm>
```

Two boundaries worth knowing. A failing validation is **not** a cancellation — it produces an [`invalid`](#the-result) result, covered next. And a standalone `!useModel` instance has no `loading` or `disabled` of its own, so headless submissions only gate on an attempt already being in flight.

## Aborting

Gates stop an attempt before it starts; `abort()` stops one already in progress. It cancels the in-flight HTTP request through an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), and the pending `submit()` resolves with a [`fail`](#the-result) result whose `reason` is `'abort'`:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  save: { type: 'button', text: 'Save', action: 'submit' },
})

const [MyForm, form$] = useForm({ schema, endpoint: '/api/register' })
</script>

<template>
  <MyForm />

  <button v-if="form$.submitting" type="button" @click="form$.abort()">
    Cancel
  </button>
</template>
```

```vue [Template]
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')
</script>

<template>
  <VfForm ref="form$" endpoint="/api/register">
    <VfText name="email" label="Email" rules="required|email" />
    <VfButton name="save" text="Save" action="submit" />

    <button v-if="form$?.submitting" type="button" @click="form$?.abort()">
      Cancel
    </button>
  </VfForm>
</template>
```

:::

Gating the cancel control with [`submitting`](#submission-state) keeps it visible only while there is actually a request to abort. The same method exists headlessly as `model.abort()`.

## When Validation Fails

Submission validates as a floor. No matter what [`validateOn`](/guide/validation#submission-trigger) is set to, every element without a current passing result runs its rules before anything is sent — an untouched form can never submit unvalidated.

When the form comes out invalid, the attempt ends there. `submit()` resolves with an [`invalid`](#the-result) result whose `source` is `'client'`, no request is made, and the first invalid element is scrolled into view and focused (both adjustable through [scroll and focus props](/guide/validation#scroll-and-focus)):

```ts
const result = await form$.submit()

if (result?.type === 'invalid' && result.source === 'client') {
  // the request never left the browser
}
```

Each failing attempt also fires the `@clientInvalid` [result event](#result-events) with the same result object. The form's `@invalid` event is a different thing — it fires when the form *becomes* invalid, a validity transition rather than a per-attempt signal, so it stays silent on a second failing attempt while the form is already invalid.

This baseline can be tightened or switched off entirely. Adding `'submit'` to `validateOn` forces a complete re-run of every element on each attempt instead of only the unvalidated ones — see [Submission Trigger](/guide/validation#submission-trigger). And `form$.disableValidation()` — deliberately a method, not a prop, as [Turning Validation Off](/guide/validation#turning-validation-off) explains — skips submit-time validation entirely, leaving the server's [`422` handling](#when-the-server-rejects) as the only safety net.

Everything else about validation — rules, triggers, messages — lives in the [Validation](/guide/validation) guide.

## When the Server Rejects

A `422` response means the server refused the data itself. The attempt resolves with an [`invalid`](#the-result) result whose `source` is `'server'` and fires the `@serverInvalid` event. The errors arrive on the result object — but they are **not** displayed on the elements by default. There are three ways to handle them.

### Automatic Display with `set-invalid`

Enable the `set-invalid` prop and each server error is appended to the matching element's [`messageBag`](/guide/validation#errors-from-outside-the-rules), then the first invalid element is scrolled into view and focused, just like a client-side failure:

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

A response of

```json
{
  "errors": {
    "email": ["This email is already taken"],
    "username": ["Must be at least 3 characters"]
  }
}
```

puts each message on its element, indistinguishable from a rule failure. The keys are element data paths, so `address.city` targets a nested element, and a plain string counts as a single message. By default Vueform reads the map from the body's `errors` key, falling back to treating the whole body as the error map. <!-- @todo: the errors key / path should be configurable -->

### Custom Error Format

If your API reports errors in a different shape, adapt it with `transform-server-invalid`:

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

The function receives the raw response body and the form's [context](/guide/context), and returns an object keyed by element data paths with a message or array of messages per path. Its output is also what lands on the result as `result.errors`.

### Manual Handling

For anything beyond displaying messages on elements — dispatching to a toast, merging with custom UI — listen to `@serverInvalid` and read the result:

```ts
onServerInvalid: (result: SubmitServerInvalid) => {
  for (const [path, messages] of Object.entries(result.errors)) {
    showToast(`${path}: ${messages.join(', ')}`)
  }
}
```

This combines freely with `set-invalid` when you want the automatic display *and* your own handling. For appending errors to elements yourself, see [Errors from Outside the Rules](/guide/validation#errors-from-outside-the-rules).

Headlessly, `set-invalid` has no elements to decorate — on a `!useModel` instance the errors land on the instance's own error surface instead, and clear on the next revalidation.

## The Result

Every `submit()` call resolves with a result object describing how the attempt ended — a `SubmitResult`, the discriminated union of `SubmitSuccess`, `SubmitInvalid`, `SubmitFail`, and `SubmitCanceled`. Branch on `type`:

```ts
const result = await form$.submit()

switch (result?.type) {
  case 'success':   /* 2xx */ break
  case 'invalid':   /* validation said no — client or server */ break
  case 'fail':      /* network, timeout, abort, other HTTP errors */ break
  case 'canceled': /* a gate or a handler stopped it */ break
}
```

All four shapes carry `context$`, the submitting form's [context](/guide/context) at the time of the attempt.

### `success`

The request completed with a `2xx` status (`SubmitSuccess`).

```ts
result.data     // the response body
result.status   // the HTTP status code
result.response // the full HttpResponse
```

### `invalid`

Validation rejected the data — [on the client](#when-validation-fails) before any request, or [on the server](#when-the-server-rejects) as a `422`. `SubmitInvalid` is itself a union of `SubmitClientInvalid` and `SubmitServerInvalid`, and the `source` property tells the two apart:

```ts
result.source   // 'client' | 'server'
result.errors   // Record<string, string[]>, keyed by element data path
result.issues   // { path, rule, message }[] — the structured counterpart

// server-sourced results also carry:
result.data     // the response body
result.response // the full HttpResponse
```

On a client failure, `errors` and `issues` are the form's own projections — the same objects as `form$.errors` and `form$.issues`. On a server failure, `errors` is the (possibly [transformed](#custom-error-format)) response error map, and `issues` is synthesized from it with `rule: 'server'`.

### `fail`

The request failed for any reason other than `422` (`SubmitFail`).

```ts
result.reason   // see the table below
result.status   // the HTTP status code, or null without a response
result.message  // a human-readable description
result.data     // the response body, or null
result.response // the HttpResponse, or null
```

| Reason | Meaning |
| --- | --- |
| `'network'` | The request got no response — connection refused, DNS failure, offline. |
| `'timeout'` | The request timed out. |
| `'http'` | The server responded with a non-`2xx` status other than `422`. |
| `'abort'` | [`abort()`](#aborting) canceled the in-flight request. |
| `'blocked'` | The target origin isn't allowed by [`allowOrigins`](/guide/security#request-origins). |
| `'ssr'` | The request was attempted during server-side rendering. |
| `'unknown'` | Anything that fits none of the above. |
<!-- @todo: unknown could be just a plain `undefined` -->

### `canceled`

A [gate](#gates) or a handler stopped the attempt before any request was made (`SubmitCanceled`).

```ts
result.reason // 'loading' | 'disabled' | 'submitting' | 'prevented' | 'unknown'
```

The first three reasons are the gates. `'prevented'` means a [`@submit` handler or endpoint function](#owning-the-request) returned `false`, and `'unknown'` is the catch-all for unexpected guard conditions.

### `undefined`

With no `endpoint` configured and no handler producing a response, there is nothing to classify — `submit()` resolves with `undefined` and no [result events](#result-events) fire. <!-- @todo: still, they should be added to elements by path -->

## Result Events

Awaiting `submit()` is one way to learn the outcome; the other is listening on the form. Each outcome fires an event carrying the same result object the promise resolves with:

| Event | Fires when | Argument |
| --- | --- | --- |
| `@response` | An HTTP response was received — on success **and** on error. | `HttpResponse` |
| `@success` | The request completed with `2xx`. | `SubmitSuccess` |
| `@clientInvalid` | Validation failed on the client — nothing was sent. | `SubmitClientInvalid` |
| `@serverInvalid` | The server responded with `422`. | `SubmitServerInvalid` |
| `@fail` | The request failed — network, timeout, abort, any other non-`2xx` status. | `SubmitFail` |
| `@canceled` | A [gate](#gates) blocked the attempt, or a handler returned `false`. | `SubmitCanceled` |

`@response` always precedes the outcome event, handing you the raw `HttpResponse` before any classification — and it only fires when a response was actually received, so never for aborted requests or client-side failures.

The listeners go on the form as `onXxx` options in a schema setup or `@xxx` bindings in a template — and the same callbacks work headlessly as `!useModel` options:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'
import type {
  HttpResponse,
  SubmitSuccess,
  SubmitClientInvalid,
  SubmitServerInvalid,
  SubmitFail,
  SubmitCanceled,
} from '@vueform/ui'

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  onResponse: (response: HttpResponse) => {},
  onSuccess: (result: SubmitSuccess) => {},
  onClientInvalid: (result: SubmitClientInvalid) => {},
  onServerInvalid: (result: SubmitServerInvalid) => {},
  onFail: (result: SubmitFail) => {},
  onCanceled: (result: SubmitCanceled) => {},
})
```

```vue [Template]
<VfForm
  endpoint="/api/register"
  @response="handleResponse"
  @success="handleSuccess"
  @client-invalid="handleClientInvalid"
  @server-invalid="handleServerInvalid"
  @fail="handleFail"
  @canceled="handleCanceled"
/>
```

:::

## What Gets Sent

The **payload** is what a submission sends. It's the model minus two kinds of elements — those whose [conditions](/guide/conditions) aren't met, and those with the element-level `submit: false` prop, an opt-out that keeps a value in the model but out of every request (a password-confirmation field, a UI-only toggle).

Nothing assembles the payload at submit time — it's a live projection of the model, readable at any moment as `form$.payload` (headlessly, `model.payload`).

### Transforming the Payload

To reshape what's sent, use `transformPayload`:

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

The function receives the aggregated payload and the form's [context](/guide/context), and whatever it returns is the payload from then on. It's baked into the projection itself rather than bolted onto submission — `form$.payload` reads, the [`@submit`](#owning-the-request) event's argument, the request body, and [autosave](/guide/autosave) requests all see the transformed data.

::: tip
The `payload` argument already excludes condition-hidden and `submit: false` values. To send the **full model** regardless, return `context$.model`:

```ts
transformPayload: (payload, context$) => context$.model
```

:::
## Request Format

By default the payload travels as `multipart/form-data`, built from a `FormData` instance. Common backends — Express, Laravel, Rails — parse it out of the box, and file uploads need no extra setup.

To send a JSON body instead, enable the `json` prop:

```vue
<VfForm endpoint="/api/register" json />
```

::: warning
Files can't be serialized into JSON. When the form contains uploads and the endpoint still needs a JSON body, add the `base64` prop to encode files as base64 strings:

```vue
<VfForm endpoint="/api/register" json base64 />
```

:::

Custom request headers go on the `headers` prop:

```vue
<VfForm endpoint="/api/register" :headers="{ 'X-Custom-Header': 'value' }" />
```

Headers meant for every request belong on the [HTTP module's defaults](/guide/http#configuring-defaults) instead — the per-form `headers` are merged on top of them.

To make JSON (or base64) the norm for every form in the app, set the props as [Defaults](/guide/defaults):

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

Note that submissions always set their request format explicitly, so the HTTP module's global [`requestType`](/guide/configuration#http) governs your own `!useHttp` calls, not form submissions — for forms, the `!VfForm` default above is the one that counts. <!-- @todo: maybe we should have form's to default to useHttp settings too unless explicitly defined? -->

## Owning the Request

The request doesn't have to be Vueform's own call to a string [`endpoint`](/guide/submit#a-form-that-submits) — your code can step in at two points. The `endpoint` prop also accepts a **function** that performs the send itself — for when the request isn't a plain HTTP call Vueform can make, such as going through your own API client or SDK. And whatever the endpoint is, the `@submit` event runs right before it, where a handler can observe the attempt, cancel it, or conditionally take it over.

### Endpoint as a Function

A function endpoint replaces the built-in request while keeping everything around it — validation still gates, and `@success` / `@serverInvalid` / `@fail` still fire based on what you return:

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

The function receives the [payload](#what-gets-sent) and the form's [context](/guide/context), and its return value steers the rest of the lifecycle:

| Return value | Effect |
| --- | --- |
| `HttpResponse` | Used as the response — classification and result events follow from its status. This is what the example returns: `$http.post()` resolves with one. |
| `string` | Used as the endpoint URL — Vueform makes the request itself. |
| `false` | Cancels the attempt with reason `'prevented'`. |
| `void` | Your function's work happened, but with nothing to classify, `submit()` resolves with `undefined` and no result events fire. |

::: tip
Make your requests with [`!useHttp`](/guide/http) so failures flow back into the pipeline — an `HttpError` thrown inside the function is caught and classified exactly like one from a string endpoint: a `422` becomes an [`invalid`](#the-result) result, a network failure becomes a `fail`.
:::

### Endpoint as an Expression

When only the URL needs computing, skip the function. A string endpoint may be an [expression](/guide/expressions), with placeholders resolved from the model at submit time:

```vue
<VfForm endpoint="/api/users/{id}" method="PUT" />
```

Expression resolution is a mounted-form feature — a headless `!useModel` instance uses its `endpoint` string as-is.

### Intercepting with `@submit`

The `@submit` event fires after [validation passes](#the-submission-lifecycle) and before the request goes out, carrying the prepared payload and the [context](/guide/context). The handler is awaited, and what it returns decides what happens next.

**Returning nothing** makes it a pure observer — the request proceeds untouched:

```ts
onSubmit: (payload, context$) => {
  analytics.track('form-submitted', payload)
}
```

**Returning `false`** cancels the attempt — the endpoint is never called and `submit()` resolves with a [`canceled`](#the-result) result (reason `'prevented'`):

```ts
onSubmit: async (payload, context$) => {
  const allowed = await checkRateLimit()
  if (!allowed) return false
}
```

**Returning an `HttpResponse`** takes the request over — the configured `endpoint` is skipped and the returned response drives [classification](#the-result):

```ts
const $http = useHttp()

const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  onSubmit: async (payload, context$) => {
    if (payload.plan === 'enterprise') {
      // takes over: `/api/register` is skipped
      return await $http.post('/api/enterprise/register', payload)
    }
    // all other plans continue to `/api/register`
  },
})
```

This makes `@submit` the conditional sibling of the function endpoint — reach for the function endpoint when custom logic *is* the submission mechanism, and for `@submit` when a string endpoint is the default and you only step in sometimes.

## After Success

Once an attempt classifies as [`success`](#success), the configured follow-ups run — always in the same order:

1. `success-message`
2. `reset-on-success` / `clear-on-success`
3. `set-response`
4. `scroll-top-on` (its `'success'` trigger)
5. `redirect`

### Success Message

`success-message` appends a one-shot confirmation to the form's [`messageBag`](/guide/validation#errors-from-outside-the-rules):

```vue
<VfForm endpoint="/api/register" success-message="Registration complete!" />
```

Like several props in this section, it's a [dynamic prop](/guide/dynamic-props) — a static string, a function receiving the form's [context](/guide/context), an [expression](/guide/expressions), or a [locale map](/guide/i18n#locale-maps):

```vue
<!-- Function -->
<VfForm
  endpoint="/api/register"
  :success-message="(form$) => `Welcome, ${form$.model.name}!`"
/>

<!-- Expression -->
<VfForm endpoint="/api/register" success-message="Welcome, {name}!" />

<!-- Locale map -->
<VfForm
  endpoint="/api/register"
  :success-message="{ en: 'Welcome, {name}!', de: 'Willkommen, {name}!' }"
/>
```

### Reset or Clear

Two props answer what state the form should be in afterwards. `reset-on-success` restores the initial values — those present at mount, or at the last `clean()` call. `clear-on-success` empties every value instead:

```vue
<!-- back to its starting values -->
<VfForm endpoint="/api/register" reset-on-success />

<!-- a blank slate -->
<VfForm endpoint="/api/register" clear-on-success />
```

### Applying the Response

A successful response from the server often carries values the form should adopt — the ID of the record it just created, or the slug the server generated from its title.

With the `set-response` prop, Vueform reads the `payload` key of the response body and writes its entries into the matching elements by data path:

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

A response of

```json
{
  "payload": {
    "id": 42,
    "slug": "my-post"
  }
}
```

writes `id` and `slug` back into the form — so the next submission already carries the server-assigned values, exactly what a form that keeps editing the record it just created needs.

If the values live under a different key, `transform-response` adapts the shape. It receives the response body and returns an object keyed by element data paths: <!-- @todo: the response key / path should be configurable -->

```vue
<VfForm
  endpoint="/api/posts"
  set-response
  :transform-response="(data, context$) => data?.result?.fields || {}"
/>
```

::: tip
Response application runs **after** `reset-on-success` / `clear-on-success` — server-assigned values survive the reset.
:::

### Scroll to Top

In a long form, the success message can land off-screen. The `scroll-top-on` prop names the moments the form scrolls back to its top, and `'success'` is one of them:

```vue
<VfForm
  endpoint="/api/register"
  :scroll-top-on="['success']"
  success-message="Registration complete!"
/>
```

The array also accepts `'error'` (a failed submit-time validation), `'next'` and `'back'` (step navigation in [multi-page forms](/guide/multi-page-forms)), and `'always'` — the default, covering all of them.

### Redirect

`redirect` sends the user elsewhere once everything above has run:

```vue
<VfForm endpoint="/api/register" redirect="/thank-you" />
```

The navigation happens **after** `submit()` resolves, so awaiting callers and event handlers still see the `success` result before the page goes away. It's a [dynamic prop](/guide/dynamic-props) like `success-message`:

```vue
<!-- Function -->
<VfForm
  endpoint="/api/register"
  :redirect="(form$) => `/users/${form$.result?.data?.id}`"
/>

<!-- Expression -->
<VfForm endpoint="/api/register" redirect="/users/{id}" />
```

Relative URLs always pass, and absolute ones must be `http` or `https` — a value with any other scheme is dropped, so a malicious `javascript:` URL can never become the destination.

## Under the Hood: Submission Without a Form <!-- @todo: this needs a review after useModel refactor is in -->

Strip away everything this chapter added — the gates, the events, the classification, the follow-ups — and what remains is three calls on a [`!useModel`](/guide/model) instance, composed by hand:

```ts
import { defineSchema, useModel, useHttp } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  plan: { type: 'select', label: 'Plan', items: ['free', 'pro'] },
})

const model = useModel({ schema })

if (await model.validate()) {
  await useHttp().post('/api/register', model.payload)
}
```

Validate, take the [payload](#what-gets-sent), send it — that is all a submission is. When the endpoint expects a specific request format, `model.toFormData()` and `model.toJSON()` serialize the same data as `FormData` or a JSON string.

Everything above this section is that cycle, industrialized. The form's `submit()` wraps the same three steps in [gates](#gates), [interception](#owning-the-request), [classification](#the-result), [error display](#when-the-server-rejects), and [post-success actions](#after-success) — and [`!useModel`'s own submission options](#through-a-model) run the identical machinery headlessly, which is why the chapter could keep saying "the same applies to a model." One engine, hand-rolled or fully wrapped, readable from either side.
