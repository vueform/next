---
outline: [2,3]
---

# Autosave

Nobody enjoys losing a half-filled form. Vueform's autosave protects the user's progress in two directions: **local** — mirroring the form into browser storage so a reload restores the draft — and **remote** — sending the data to an endpoint shortly after it changes. Both live under one prop: `autosave` takes a configuration object, and every option sits next to the target it configures.

This chapter starts with the local draft mirror and its load/clear lifecycle, then covers the remote endpoint with its triggers and validity gate, manual saving, data shaping, and the autosave events.

## Local Drafts

The simplest autosave is one flag. Set `local` and the form mirrors itself into `localStorage` — reload the page and the draft comes back:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  title: { type: 'text', label: 'Title' },
  body: { type: 'textarea', label: 'Body' },
})

const [Form] = useForm({
  schema,
  name: 'draft', // the storage key derives from the form's name
  autosave: {
    local: true, // [!code highlight]
  },
})
```

```vue [Template]
<VfForm name="draft" :autosave="{ local: true }">
  <VfText name="title" label="Title" />
  <VfTextarea name="body" label="Body" />
</VfForm>
```

:::

The local mirror is deliberately opinionated — its saving behavior is fixed:

- **Saves on every action** — page navigations immediately; changes on a built-in ~100 ms debounce that keeps rapid typing smooth, with a 1 s upper bound so continuous typing can't postpone the draft. Not configurable — there's nothing to schedule.
- **Saves regardless of validity** — a half-filled, invalid form is exactly what a draft is.
- **Stores the raw model** — not the payload, so loading a draft reproduces the form's full state, including values behind unmet [conditions](/guide/conditions).

The storage key is `vueform:{name}`, which is why `local` requires the form to have a `name` — without one (or an explicit `key`), local autosave is disabled with a dev warning.

### Loading the Draft

When a stored draft exists, it's loaded back into the form on mount. The cancelable `@autosave-restore` event fires first with the stored data — return `false` to skip the load (the draft stays in storage), or use it to show a "draft restored" notice:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  name: 'draft',
  autosave: { local: true },
  onAutosaveRestore: (data, form$) => {
    if (!confirmRestore()) return false

    showToast('Draft restored')
  },
})
```

```vue [Template]
<script setup lang="ts">
const handleRestore = (data, form$) => {
  if (!confirmRestore()) return false

  showToast('Draft restored')
}
</script>

<template>
  <VfForm
    name="draft"
    :autosave="{ local: true }"
    @autosave-restore="handleRestore"
  />
</template>
```

:::

To take over the timing yourself, disable the automatic load with `load: false` and call `loadAutosaved()` when _you_ decide — it loads the stored draft (no pre-hook; the explicit call is the consent) and resolves whether one was found:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { useForm } from '@vueform/ui'

const [Form, form$] = useForm({
  schema,
  name: 'draft',
  autosave: { local: { load: false } }, // [!code highlight]
})

const restoreDraft = async () => {
  if (await form$?.loadAutosaved()) {
    showToast('Draft restored')
  }
}
</script>

<template>
  <Form />
  <button @click="restoreDraft">Restore draft</button>
</template>
```

```vue [Template]
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')

const restoreDraft = async () => {
  if (await form$.value?.loadAutosaved()) {
    showToast('Draft restored')
  }
}
</script>

<template>
  <VfForm
    ref="form$"
    name="draft"
    :autosave="{ local: { load: false } }"
  />
  <button @click="restoreDraft">Restore draft</button>
</template>
```

:::

### Clearing the Draft

A successful submit removes the draft — the data reached its real destination, the safety copy has done its job. Set `clear: false` to keep it anyway:

```ts
autosave: { local: { clear: false } }
```

To clear manually — a "discard draft" button, a logout handler — call `clearAutosaved()` on the form context:

```ts
form$.clearAutosaved()
```

### Options

`local: true` uses the defaults; an object customizes them:

```ts
autosave: {
  local: {
    key: 'checkout-v2',      // storage key (bump it to invalidate old drafts)
    storage: sessionStorage, // any getItem/setItem/removeItem implementation
    load: false,             // no automatic load on mount (use loadAutosaved())
    clear: false,            // keep the draft after successful submit
    encrypt: false,          // skip the app-level cipher for this form's draft
  },
},
```

`storage` accepts anything with the Web Storage shape — `sessionStorage`, or a custom `{ getItem, setItem, removeItem }` adapter over IndexedDB or a native bridge.

### Sensitive Elements

Not every value belongs on disk. Mark an element `sensitive` and its value is left out of the draft — stripped before the draft is written, so restoring one leaves the element untouched:

::: code-group

```ts [Schema]
const schema = defineSchema({
  email: { type: 'text', label: 'Email' },
  password: {
    type: 'text',
    inputType: 'password',
    label: 'Password',
    sensitive: true, // [!code highlight]
  },
})
```

```vue [Template]
<VfText name="email" label="Email" />
<VfText name="password" input-type="password" label="Password" sensitive />
```

:::

On a container the flag covers the entire subtree — a `sensitive` group or object excludes every element inside it. Only local drafts are affected: [remote saves](#remote-saves) and submission carry the value like any other element's.

::: warning
Local drafts persist form data — potentially personal data — to the user's disk. Mark passwords, payment details, and similar fields [`sensitive`](#sensitive-elements) so they never reach storage. `File` values can't be serialized and are stripped from drafts (with a dev warning).
:::

### Encrypting Drafts

Storing drafts unencrypted is a decision local autosave won't make for you: until the app configures `$security` ciphers, every form persisting drafts warns in dev that they're plaintext. There's deliberately no built-in cipher to fall back on — any key Vueform could generate on the device would sit right next to the ciphertext, readable by exactly the attackers it claims to stop. Real encryption needs a key the device alone doesn't have — typically delivered per user after login and held **only in memory**, so a stolen disk, a backup, or a logged-out shared computer holds nothing but noise.

Bring that key and plug your cipher into the app-level [`$security`](/guide/configuration#security) config — one mechanism, every form's drafts encrypted:

```ts
import { createVueform } from '@vueform/ui'

let key: CryptoKey // import after login; memory only, never storage

export async function initDraftKey(raw: ArrayBuffer) {
  key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
}

createVueform({
  $security: {
    encrypt: async (value) => {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const data = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(value)
      )

      return btoa(String.fromCharCode(...iv, ...new Uint8Array(data)))
    },
    decrypt: async (value) => {
      const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0))
      const data = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: bytes.slice(0, 12) },
        key,
        bytes.slice(12)
      )

      return new TextDecoder().decode(data)
    },
  },
})
```

The mechanics:

- Both functions may be sync or async — the Web Crypto example above just works. Because `decrypt` may be async, `loadAutosaved()` resolves its boolean as a Promise.
- A `decrypt` that **throws** — no key yet, a rotated session, someone else's draft — marks the draft unreadable: it's discarded like a corrupt one, and nothing loads.
- Each function receives a second **purpose** argument identifying the call site (local drafts pass `'autosave:local'`), so one implementation can serve every current and future feature that encrypts, branching per purpose if it ever needs to.
- The ciphers run through the `security` **module**. Misconfigurations don't fail silently: defining only half the pair warns at startup (values couldn't round-trip), and in a [modular setup](/guide/code-splitting#modular-setup) that configured ciphers but didn't register the module, drafts fall back to plaintext with a dev warning.
- Encryption is app-wide: every form's draft runs through the cipher. Opt a single harmless form out with `local: { encrypt: false }` ([Options](#options)) — its draft is written and read as plaintext. Flipping the flag later leaves the old draft unreadable, which counts as no draft.
- Plaintext is opt-in, not a silent default: local autosave without configured ciphers warns in dev. To knowingly skip encryption, register identity ciphers (`$security: { encrypt: (v) => v, decrypt: (v) => v }`) app-wide, or set `local: { encrypt: false }` on the form — either records the decision and silences the warning.

Know what encryption buys: protection for data **at rest** — stolen hardware, disk backups, storage scraped outside your app. Code running on your origin can use the in-memory key just like your app does, so [`sensitive`](#sensitive-elements) remains the answer for values that shouldn't be persisted at all.

And if the fixed behaviors don't fit — a different trigger set, per-user keys, drafts synced to your own store — the local mirror isn't doing anything you can't do yourself. It's a convenience over the form's own [events](/guide/event-handlers): subscribe to `@change` to save, `@mounted` to restore, and the policy in between is entirely yours:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  onChange: (data, oldData, form$) => {
    sessionStorage.setItem(`draft:${userId}`, encrypt(form$.toJSON()))
  },
  onMounted: (form$) => {
    const draft = sessionStorage.getItem(`draft:${userId}`)

    if (draft) form$.load(JSON.parse(decrypt(draft)))
  },
})
```

```vue [Template]
<script setup lang="ts">
const handleChange = (data, oldData, form$) => {
  sessionStorage.setItem(`draft:${userId}`, encrypt(form$.toJSON()))
}

const handleMounted = (form$) => {
  const draft = sessionStorage.getItem(`draft:${userId}`)

  if (draft) form$.load(JSON.parse(decrypt(draft)))
}
</script>

<template>
  <VfForm @change="handleChange" @mounted="handleMounted" />
</template>
```

:::

## Remote Saves

Point `endpoint` at a URL and the form saves to the server shortly after its data changes — about a second after the user stops typing — holding the save back while the form has validation errors:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  autosave: {
    endpoint: '/api/drafts', // [!code highlight]
  },
})
```

```vue [Template]
<VfForm :autosave="{ endpoint: '/api/drafts' }" />
```

:::

That's the whole setup for the common case. Everything below is about adjusting it: [what triggers a save](#saving-on-change) and on what timing, and [when a save is held back](#the-validity-gate).

On the wire, an autosave is a `POST` request (change it with `method`) sent through Vueform's [HTTP module](/guide/http) — any base URL, global headers, or interceptors you've configured apply automatically. The form's [`headers`](/guide/submit#headers), [`json`, and `base64`](/guide/submit#request-format) props — the ones that shape the submission request — shape autosave requests the same way.

::: tip
Autosave runs **independently** of `submit()`. The form's `endpoint`, `method`, success messages, redirects — none of those apply to autosave requests. The data sent is the same [payload](/guide/submit#the-payload) submission would send — [`transformPayload`](/guide/submit#transforming-the-payload) included — optionally shaped further by [`autosave.transform`](#transforming-autosave-data).
:::

### Saving on Change

`'change'` in `on` — the default — saves whenever the form's data changes. Changes are debounced by `delay` (default `1000` ms): the save fires once the user pauses, and the timer restarts on every new change within the window:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  autosave: {
    endpoint: '/api/drafts',
    on: ['change'], // the default, spelled out
    delay: 2000, // [!code highlight]
  },
})
```

```vue [Template]
<VfForm
  :autosave="{
    endpoint: '/api/drafts',
    on: ['change'],
    delay: 2000,
  }"
/>
```

:::

To turn change-driven saving off, set `on` to a list without `'change'` — such as [navigation events](#saving-on-page-navigation) only, or `on: []` when nothing but the [interval](#interval-saves) should save.

### Saving on Page Navigation

In a [multi-page form](/guide/multi-page-forms), navigation events make natural save points:

| Trigger  | Fires on                                                               |
| -------- | ---------------------------------------------------------------------- |
| `'next'` | A stepped form moves forward (after the current step validated).       |
| `'back'` | A stepped form moves backward.                                         |
| `'step'` | The active step changes — covers `next`, `back`, and direct selection. |
| `'tab'`  | The active tab changes in a tabbed form.                               |

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  stepped: true,
  autosave: {
    endpoint: '/api/drafts',
    on: ['step'], // [!code highlight]
  },
})
```

```vue [Template]
<VfForm stepped :autosave="{ endpoint: '/api/drafts', on: ['step'] }" />
```

:::

Setting `on` replaces the default, so include `'change'` if edits should keep saving too. Use `['next']` to persist only forward progress, or `['next', 'back']` if clicking a step in the nav shouldn't save. Don't combine `'step'` with `'next'` or `'back'` — `'step'` already covers both, so the request would fire twice.

In fact, any form event name works as a trigger — `on` subscribes to whatever events you list, with only `'change'` getting the debounce treatment.

::: tip
Note what a navigation save **is**: fire-and-forget. The page turns whether or not the request succeeds, and every save sends the whole form's data. If a step must not advance until its data is safely stored, or each page should send only its own fields, that's beyond autosave — handle the navigation events yourself, as shown in [Saving Progress](/guide/multi-page-forms#saving-progress).
:::

### Interval Saves

`interval` adds a periodic timer in milliseconds — off by default. Reach for it when the form should also save on a fixed schedule, instead of (or on top of) event-driven saves. Failed attempts don't affect the timer — a failed save is simply retried at the next interval. To surface the failure to the user, subscribe to [`@autosave-fail`](#autosave-fail):

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  autosave: {
    endpoint: '/api/drafts',
    interval: 30000, // also save every 30s
  },
})
```

```vue [Template]
<VfForm :autosave="{ endpoint: '/api/drafts', interval: 30000 }" />
```

:::

### The Validity Gate

While the form is invalid, every remote save is held back — interval ticks, change saves, and navigation saves alike. This gate is on by default, so out of the box no invalid data ever leaves the form.

Held back, not dropped: a save blocked by the gate is **deferred** and runs as soon as the form becomes valid again. Fix the one failing field and it fires again immediately on its own — no manual retrigger needed.

One kind of failure joins the same queue: a save the server rejected with **`422`** — the data was the problem, so it retries when the form becomes valid.

To save regardless of validation state — say, the backend accepts partial drafts — set `invalid`:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  autosave: {
    endpoint: '/api/drafts',
    invalid: true, // [!code highlight]
  },
})
```

```vue [Template]
<VfForm :autosave="{ endpoint: '/api/drafts', invalid: true }" />
```

:::

### Combining Triggers

The mechanisms are independent and compose freely:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  stepped: true,
  autosave: {
    endpoint: '/api/drafts',
    interval: 30000,
    on: ['change', 'next'],
    delay: 2000,
  },
})
```

```vue [Template]
<VfForm
  stepped
  :autosave="{
    endpoint: '/api/drafts',
    interval: 30000,
    on: ['change', 'next'],
    delay: 2000,
  }"
/>
```

:::

Here the form saves every 30 seconds, two seconds after the user stops typing, and immediately on every forward step — and, by default, all three are deferred while the form is invalid.

## Local + Remote

The two targets combine naturally — local catches every keystroke while remote syncs on its own schedule, each with the behavior that fits its destination:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  name: 'checkout',
  autosave: {
    local: true,             // every action, ungated, instant
    endpoint: '/api/drafts', // debounced on change, gated, POST
  },
})
```

```vue [Template]
<VfForm
  name="checkout"
  :autosave="{
    local: true,
    endpoint: '/api/drafts',
  }"
/>
```

:::

## Saving Manually

The form context exposes `autosave()` to trigger a save on demand — a "Save draft" button, a `beforeunload` handler:

```ts
await form$.autosave()
```

It saves **both** targets immediately: the local draft is written and the remote save runs, with the [validity gate](#the-validity-gate) applying as configured — a gated call while the form is invalid still writes the draft and defers the remote save. To decide about invalid data for just this call, pass `invalid` — it overrides the config's `invalid` prop either way:

```ts
await form$.autosave({ invalid: true }) // send even while the form is invalid
```

The returned promise resolves when everything settles (the usual [events](#events) fire along the way).

## Dynamic Endpoints

When the endpoint depends on form data, pass a function as `endpoint` and return the **URL** — Vueform performs the built-in request against it:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  autosave: {
    endpoint: (data, form$) => `/api/users/${data.user_id}`, // [!code highlight]
  },
})
```

```vue [Template]
<VfForm
  :autosave="{
    endpoint: (data, form$) => `/api/users/${data.user_id}`,
  }"
/>
```

:::

An [Expression](/guide/expressions) does the same declaratively — the `endpoint` string resolves `{...}` from the model at save time, no function involved:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  autosave: {
    endpoint: '/api/users/{user_id}', // [!code highlight]
  },
})
```

```vue [Template]
<VfForm :autosave="{ endpoint: '/api/users/{user_id}' }" />
```

:::

Either way it's still the built-in request — `POST`, shaped by the form's `headers`, `json`, and `base64` props, with `@autosave-success` / `@autosave-fail` firing as usual.

## Manual Handling

The `endpoint` function can also take over the save **entirely** — its own method per state, an attached token, your own API client. Here new drafts are `POST`-ed and existing ones `PUT` to their own URL, via [`useHttp`](/guide/http):

::: code-group

```ts [Schema]
import { useForm, useHttp, type FormContext } from '@vueform/ui'

const $http = useHttp()

const [Form] = useForm({
  schema,
  autosave: {
    endpoint: async (data: Record<string, any>, form$: FormContext) => {
      return await $http.request({
        url: data.id ? `/api/drafts/${data.id}` : '/api/drafts',
        method: data.id ? 'PUT' : 'POST',
        data,
      })
    },
  },
})
```

```vue [Template]
<script setup lang="ts">
import { useHttp, type FormContext } from '@vueform/ui'

const $http = useHttp()

const handleAutosave = async (
  data: Record<string, any>,
  form$: FormContext,
) => {
  return await $http.request({
    url: data.id ? `/api/drafts/${data.id}` : '/api/drafts',
    method: data.id ? 'PUT' : 'POST',
    data,
  })
}
</script>

<template>
  <VfForm :autosave="{ endpoint: handleAutosave }" />
</template>
```

:::

Because the handler returns the `HttpResponse`, `@autosave-success` fires as usual and downstream listeners — a saved-at indicator, a toast — work without changes.

The function receives the autosave data ([`transform`](#transforming-autosave-data) result or payload) and the form's [Context](/guide/context). Its return value decides what happens next:

| Return value         | Effect                                                                       |
| -------------------- | ---------------------------------------------------------------------------- |
| `string`             | Used as the endpoint URL — Vueform performs the built-in request against it. |
| `HttpResponse`       | `@autosave-success` fires with this response.                                |
| `void` / `undefined` | The save completes silently — no event fires.                                |
| `false`              | The save is treated as skipped — no event fires.                             |

There doesn't have to be a request at all — persistence is whatever the function does. (Though for browser storage, [`local`](#local-drafts) already covers it, loading included.)

## Transforming Autosave Data

Remote saves send the form's **payload** — the same data submission would send, [`transformPayload`](/guide/submit#transforming-the-payload) included. `transform` shapes that data further, for autosave requests only:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  // Both submission and autosave data carry a timestamp…
  transformPayload: (payload, form$) => ({
    ...payload,
    savedAt: new Date().toISOString(),
  }),
  autosave: {
    endpoint: '/api/drafts',
    // …but autosave sends only these fields of it
    transform: (payload, form$) => ({
      title: payload.title,
      body: payload.body,
      savedAt: payload.savedAt,
    }),
  },
})
```

```vue [Template]
<script setup lang="ts">
const transformPayload = (payload, form$) => ({
  ...payload,
  savedAt: new Date().toISOString(),
})

const transformAutosave = (payload, form$) => ({
  title: payload.title,
  body: payload.body,
  savedAt: payload.savedAt,
})
</script>

<template>
  <VfForm
    :transform-payload="transformPayload"
    :autosave="{
      endpoint: '/api/drafts',
      transform: transformAutosave,
    }"
  />
</template>
```

:::

`transform` receives the transformed payload and whatever it returns is what the remote save sends — submission never sees it. [Local drafts](#local-drafts) aren't affected either: they always store the untransformed model so loading is lossless.

## Events

Autosave fires four form events across its lifecycle.

### `@autosave` — Pre-hook

Fires **before** a remote save runs — for both URL and function endpoints. Return `false` to cancel the save, a `string` to redirect the built-in request to that URL, or an `HttpResponse` to replace the request entirely:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  autosave: { endpoint: '/api/drafts' },
  onAutosave: (data: Record<string, any>, form$: FormContext) => {
    if (!data.title) return false // nothing worth saving yet
  },
})
```

```vue [Template]
<script setup lang="ts">
import { type FormContext } from '@vueform/ui'

const handleAutosave = (
  data: Record<string, any>,
  form$: FormContext,
) => {
  if (!data.title) return false // nothing worth saving yet
}
</script>

<template>
  <VfForm
    :autosave="{ endpoint: '/api/drafts' }"
    @autosave="handleAutosave"
  />
</template>
```

:::

::: tip
Returning an `HttpResponse` from `@autosave` makes it an alternative to the `endpoint` function. Prefer the function when custom logic **is** the save mechanism; use the event to keep a URL endpoint as the default and only intercept conditionally.
:::

### `@autosave-restore` — Load Pre-hook

Fires before a [local draft](#loading-the-draft) is loaded back into the form on mount, with the stored data and the form context. Return `false` to skip the load.

### `@autosave-success`

Fires after a successful remote save with the `HttpResponse` and the form context — refresh a saved-at indicator, store the ID the server returned:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { ref } from 'vue'
import {
  defineSchema,
  useForm,
  type FormContext,
  type HttpResponse,
} from '@vueform/ui'

const savedAt = ref<Date>()

const [Form] = useForm({
  schema: defineSchema({
    title: { type: 'text', label: 'Title' },
    body: { type: 'textarea', label: 'Body' },
  }),
  autosave: { endpoint: '/api/drafts' },
  onAutosaveSuccess: (response: HttpResponse, form$: FormContext) => {
    savedAt.value = new Date()
  },
})
</script>

<template>
  <Form />
  <p v-if="savedAt">Last saved at {{ savedAt.toLocaleTimeString() }}</p>
</template>
```

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'
import { type FormContext, type HttpResponse } from '@vueform/ui'

const savedAt = ref<Date>()

const handleSuccess = (
  response: HttpResponse,
  form$: FormContext,
) => {
  savedAt.value = new Date()
}
</script>

<template>
  <VfForm
    :autosave="{ endpoint: '/api/drafts' }"
    @autosave-success="handleSuccess"
  >
    <VfText name="title" label="Title" />
    <VfTextarea name="body" label="Body" />
  </VfForm>
  <p v-if="savedAt">Last saved at {{ savedAt.toLocaleTimeString() }}</p>
</template>
```

:::

### `@autosave-fail`

Fires when the remote request fails — network error, timeout, non-2xx response — with the `HttpError` and the form context:

::: code-group

```ts [Schema]
const [Form] = useForm({
  schema,
  autosave: { endpoint: '/api/drafts' },
  onAutosaveFail: (error: HttpError, form$: FormContext) => {
    console.warn('Autosave failed:', error.message)
  },
})
```

```vue [Template]
<script setup lang="ts">
import { type FormContext, type HttpError } from '@vueform/ui'

const handleFail = (error: HttpError, form$: FormContext) => {
  console.warn('Autosave failed:', error.message)
}
</script>

<template>
  <VfForm
    :autosave="{ endpoint: '/api/drafts' }"
    @autosave-fail="handleFail"
  />
</template>
```

:::

Use it for a warning banner or queueing the write for later — though some recovery is built in: an [interval](#interval-saves) reattempts failures on schedule, and a gated save rejected with `422` is [retried when the form becomes valid](#the-validity-gate). A failed autosave doesn't affect the form otherwise — no errors appear on elements.

## Disabling Autosave

Autosave is off whenever `autosave` is `undefined` — which makes a conditional config the natural on/off switch:

::: code-group

```ts [Schema]
import { computed } from 'vue'
import { useForm } from '@vueform/ui'

const autosave = computed(() =>
  isDraft.value ? { endpoint: '/api/drafts' } : undefined,
)

const [Form] = useForm({
  schema,
  autosave,
})
```

```vue [Template]
<script setup lang="ts">
import { computed } from 'vue'

const autosave = computed(() =>
  isDraft.value ? { endpoint: '/api/drafts' } : undefined,
)
</script>

<template>
  <VfForm :autosave />
</template>
```

:::

To pause saving temporarily while keeping the config in place, an `@autosave` handler returning `false` does the job.
