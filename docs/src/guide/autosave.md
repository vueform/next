---
outline: [2,3]
---

# Autosave

An accidental reload shouldn't cost the user their progress. Autosave protects the user's progress in two directions — **local**, mirroring the form into browser storage so a reload restores the draft, and **remote**, sending the data to an endpoint shortly after it changes. Both live under the single `autosave` prop, they combine freely, and each comes with the lifecycle that fits its destination.

## Local Drafts

The simplest autosave is one flag. Set `local` and the form mirrors itself into `localStorage` — reload the page and the draft comes back:

```ts
const [Form] = useForm({
  schema,
  name: 'draft', // the storage key derives from the form's name
  autosave: {
    local: true, // [!code highlight]
  },
})
```

The draft is stored under the key `vueform:{name}`, which is why `local` requires the form to have a `name` — without one (or an explicit [`key`](#options)), local autosave is disabled with a dev warning.

The mirror's saving behavior is fixed — there's nothing to schedule:

- **It saves on every action.** Page navigations save immediately. Changes save on a fixed one-second debounce.
- **It saves regardless of validity.** A half-filled, invalid form is exactly what a draft is.
- **It stores the raw model, not the payload.** Loading a draft reproduces the form's full state, including values behind unmet [conditions](/guide/conditions).

### Loading the Draft

When a stored draft exists, it's loaded back into the form on mount. The cancelable `@autosave-restore` event fires first with the stored data — return `false` to skip the load (the draft stays in storage), or use it to show a "draft restored" notice:

```ts
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

To take over the timing yourself, disable the automatic load with `load: false` and call `loadAutosaved()` when _you_ decide. It loads the stored draft — no pre-hook, the explicit call is the consent — and resolves whether one was found:

```vue
<script setup lang="ts">
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

A custom `key` is namespaced like a derived one — without the `vueform:` prefix it gets it added, so a schema-supplied key can never address a foreign storage entry. `storage` accepts anything with the [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) shape — `sessionStorage`, or a custom `{ getItem, setItem, removeItem }` adapter over IndexedDB or a native bridge.

### Sensitive Values

Not every value belongs on disk. Mark an element `sensitive` and its value is stripped before the draft is written, so restoring a draft leaves the element untouched:

```ts
defineSchema({
  email: { type: 'text', label: 'Email' },
  password: {
    type: 'text',
    inputType: 'password',
    label: 'Password',
    sensitive: true, // [!code highlight]
  },
})
```

On a container the flag covers the entire subtree — a `sensitive` group or object excludes every element inside it. Only local drafts are affected; [remote saves](#remote-saves) and submission carry the value like any other element's. `File` values can't be serialized, so they're stripped from drafts too, with a dev warning.

::: warning
Local drafts persist form data — potentially personal data — to the user's disk. Mark passwords, payment details, and similar fields `sensitive` so they never reach storage.
:::

### Encrypting Drafts

Drafts are written as plaintext until the app configures the `$security` ciphers, and every form persisting plaintext drafts warns in dev — storing unencrypted must be a conscious choice, not a silent default. There's deliberately no built-in cipher, and [draft encryption](/guide/security#draft-encryption) explains why — real encryption needs a key the device alone doesn't have, typically delivered per user after login and held only in memory.

Bring that key and plug the cipher pair into the app-level config — one mechanism, every form's drafts encrypted:

```ts
import { createVueform } from '@vueform/ui'

let key: CryptoKey // import after login; memory only, never storage

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

The autosave-side mechanics:

- Both ciphers may be async — the Web Crypto example above just works. Because `decrypt` may be async, `loadAutosaved()` resolves its boolean as a Promise.
- A `decrypt` that **throws** — no key yet, a rotated session, someone else's draft — marks the draft unreadable. It's discarded like a corrupt one, and nothing loads.
- Drafts call the ciphers with the purpose tag `'autosave:local'`, so one implementation can serve every feature that encrypts, branching per purpose if it ever needs to.
- Encryption is app-wide. Opt a single harmless form out with `local: { encrypt: false }` ([Options](#options)) — its draft is written and read as plaintext. Flipping the flag later leaves the old draft unreadable, which counts as no draft.
- To knowingly skip encryption everywhere, register identity ciphers (`$security: { encrypt: (v) => v, decrypt: (v) => v }`). Either that or the per-form opt-out records the decision and silences the plaintext warning.
- In a [modular setup](/guide/code-splitting#modular-setup) that configured ciphers but didn't register the `security` module, drafts fall back to plaintext with a dev warning — misconfiguration never fails silently.

Know what encryption buys — protection for data **at rest**, against stolen hardware, disk backups, and storage scraped outside your app. Code running on your origin can use the in-memory key just like your app does, so [`sensitive`](#sensitive-values) remains the answer for values that shouldn't be persisted at all.

### Rolling Your Own

If the fixed behaviors don't fit — a different trigger set, per-user keys, drafts synced to your own store — the local mirror isn't doing anything you can't do yourself. It's a convenience over the form's own [events](/guide/event-handlers). Subscribe to `@change` to save and `@mounted` to restore, and the policy in between is entirely yours:

```ts
const [Form] = useForm({
  schema,
  onChange: (data, oldData, form$) => {
    sessionStorage.setItem(`draft:${userId}`, JSON.stringify(data))
  },
  onMounted: (form$) => {
    const draft = sessionStorage.getItem(`draft:${userId}`)

    if (draft) form$.load(JSON.parse(draft))
  },
})
```

## Remote Saves

Point `endpoint` at a URL and the form saves to the server shortly after its data changes — about a second after the user stops typing — holding the save back while the form has validation errors:

```ts
const [Form] = useForm({
  schema,
  autosave: {
    endpoint: '/api/drafts', // [!code highlight]
  },
})
```

On the wire, an autosave is a `POST` request — changeable with `method` — sent through the [HTTP module](/guide/http), so any base URL, global headers, or interceptors you've configured apply automatically. The form's `headers`, `json`, and `base64` props shape autosave requests exactly as they shape submissions ([Wire Format](/guide/submit#wire-format)). What's sent is the same [payload](/guide/submit#what-gets-sent) a submission would send, `transformPayload` included — optionally shaped further by [`transform`](#transforming-autosave-data).

Otherwise autosave runs independently of `submit()`. The form's `endpoint`, `method`, success messages, redirects — none of them apply to autosave requests, which fire their own [events](#observing-saves) instead.

### Saving on Change

`'change'` in `on` — the default — saves whenever the form's data changes, debounced by `delay` (default `1000` ms). The save fires once the user pauses, and the timer restarts on every new change within the window:

```ts
autosave: {
  endpoint: '/api/drafts',
  on: ['change'], // the default, spelled out
  delay: 2000, // [!code highlight]
},
```

To turn change-driven saving off, set `on` to a list without `'change'` — [navigation events](#saving-on-page-navigation) only, or `on: []` when nothing but the [interval](#interval-saves) should save.

### Saving on Page Navigation

In a [multi-page form](/guide/multi-page-forms), navigation events make natural save points:

| Trigger | Fires on |
| --- | --- |
| `'next'` | A stepped form moves forward (after the current step validated). |
| `'back'` | A stepped form moves backward. |
| `'step'` | The active step changes — covers `next`, `back`, and direct selection. |
| `'tab'` | The active tab changes in a tabbed form. |

```ts
autosave: {
  endpoint: '/api/drafts',
  on: ['step'], // [!code highlight]
},
```

Setting `on` replaces the default, so include `'change'` if edits should keep saving too. Don't combine `'step'` with `'next'` or `'back'` — `'step'` already covers both, so the request would fire twice. In fact, any form event name works as a trigger — `on` subscribes to whatever events you list, with only `'change'` getting the debounce treatment.

Note what a navigation save is — fire-and-forget. The page turns whether or not the request succeeds, and every save sends the whole form's data. If a step must not advance until its data is safely stored, or each page should send only its own fields, handle the navigation events yourself, as shown in [Saving Progress](/guide/multi-page-forms#saving-progress).

### Interval Saves

`interval` adds a periodic timer in milliseconds — off by default — for saving on a fixed schedule instead of, or on top of, event-driven saves:

```ts
autosave: {
  endpoint: '/api/drafts',
  interval: 30000, // also save every 30s
},
```

A failed attempt doesn't affect the timer — it's simply retried at the next tick. To surface the failure to the user, subscribe to [`@autosave-fail`](#observing-saves).

### Combining Triggers

The mechanisms are independent and compose freely:

```ts
autosave: {
  endpoint: '/api/drafts',
  interval: 30000,
  on: ['change', 'next'],
  delay: 2000,
},
```

This form saves every 30 seconds, two seconds after the user stops typing, and immediately on every forward step.

### The Validity Gate

While the form is invalid, every remote save is held back — interval ticks, change saves, and navigation saves alike. The gate is on by default, so out of the box no invalid data ever leaves the form.

Held back, not dropped. A save blocked by the gate is **deferred** and runs as soon as the form becomes valid again — fix the one failing field and it fires immediately on its own, no manual retrigger needed. A save the server rejected with **`422`** joins the same queue — the data was the problem, so it retries when the form becomes valid.

To save regardless of validation state — say, the backend accepts partial drafts — set `invalid`:

```ts
autosave: {
  endpoint: '/api/drafts',
  invalid: true, // [!code highlight]
},
```

## Local + Remote

The two targets combine naturally — local catches every keystroke while remote syncs on its own schedule, each with the behavior that fits its destination:

```ts
const [Form] = useForm({
  schema,
  name: 'checkout',
  autosave: {
    local: true,             // every action, ungated, instant
    endpoint: '/api/drafts', // debounced on change, gated, POST
  },
})
```

## Saving Manually

The form context exposes `autosave()` to trigger a save on demand — a "Save draft" button, a `beforeunload` handler:

```ts
await form$.autosave()
```

It saves **both** targets immediately. The local draft is written and the remote save runs, with the [validity gate](#the-validity-gate) applying as configured — a gated call while the form is invalid still writes the draft and defers the remote save. To decide about invalid data for just this call, pass `invalid` — it overrides the config's `invalid` prop either way:

```ts
await form$.autosave({ invalid: true }) // send even while the form is invalid
```

The returned promise resolves when everything settles, with the usual [events](#observing-saves) firing along the way.

## Transforming Autosave Data

Remote saves send the form's payload — the same data submission would send, [`transformPayload`](/guide/submit#transforming-the-payload) included. `transform` shapes that data further, for autosave requests only:

```ts
const [Form] = useForm({
  schema,
  autosave: {
    endpoint: '/api/drafts',
    transform: (payload, form$) => ({
      title: payload.title, // autosave sends only these fields
      body: payload.body,
    }),
  },
})
```

Whatever it returns is what the remote save sends — submission never sees it. [Local drafts](#local-drafts) aren't affected either, since they store the untransformed model so loading is lossless.

## Owning the Save

The request doesn't have to be Vueform's own `POST` to a fixed URL — the same levers submission has ([Owning the Request](/guide/submit#owning-the-request)) exist for autosave.

### Endpoint as an Expression

When only the URL depends on form data, a string `endpoint` may be an [expression](/guide/expressions) — its `{...}` placeholders resolve from the model at save time:

```ts
autosave: {
  endpoint: '/api/users/{user_id}', // [!code highlight]
},
```

It's still the built-in request — method, wire format, and [events](#observing-saves) as usual.

### Endpoint as a Function

A function `endpoint` can take the save over entirely — its own method per state, an attached token, your own API client. Here new drafts are `POST`-ed and existing ones `PUT` to their own URL, via `!useHttp`:

```ts
import { useForm, useHttp } from '@vueform/ui'

const $http = useHttp()

const [Form] = useForm({
  schema,
  autosave: {
    endpoint: async (data, form$) => {
      return await $http.request({
        url: data.id ? `/api/drafts/${data.id}` : '/api/drafts',
        method: data.id ? 'PUT' : 'POST',
        data,
      })
    },
  },
})
```

The function receives the autosave data ([`transform`](#transforming-autosave-data) result or payload) and the form's [context](/guide/context). Its return value decides what happens next:

| Return value | Effect |
| --- | --- |
| `string` | Used as the endpoint URL — Vueform performs the built-in request against it. |
| `HttpResponse` | `@autosave-success` fires with this response. |
| `void` / `undefined` | The save completes silently — no event fires. |
| `false` | The save is treated as skipped — no event fires. |

Because the example returns the `HttpResponse`, `@autosave-success` fires as usual and downstream listeners — a saved-at indicator, a toast — work unchanged. There doesn't have to be a request at all — persistence is whatever the function does. For browser storage, though, [`local`](#local-drafts) already covers it, loading included.

### Intercepting with `@autosave`

The `@autosave` event fires before every remote save — URL and function endpoints alike — with the data about to be sent. Return `false` to cancel the save, a `string` to redirect the built-in request to that URL, or an `HttpResponse` to replace the request entirely:

```ts
const [Form] = useForm({
  schema,
  autosave: { endpoint: '/api/drafts' },
  onAutosave: (data, form$) => {
    if (!data.title) return false // nothing worth saving yet
  },
})
```

This makes `@autosave` the conditional sibling of the function endpoint — reach for the function when custom logic _is_ the save mechanism, and for the event when a URL endpoint is the default and you only step in sometimes.

## Observing Saves

Autosave fires four form events. Two are the pre-hooks covered earlier; two report outcomes:

| Event | Fires | Arguments |
| --- | --- | --- |
| `@autosave` | Before a remote save runs — cancel or take it over ([Intercepting](#intercepting-with-autosave)). | data, context |
| `@autosave-restore` | Before a local draft loads on mount — cancel to skip ([Loading the Draft](#loading-the-draft)). | stored data, context |
| `@autosave-success` | After a successful remote save. | `HttpResponse`, context |
| `@autosave-fail` | When the remote request fails — network error, timeout, non-2xx response. | `HttpError`, context |

`@autosave-success` is the hook for a saved-at indicator, or for storing the ID the server returned:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@vueform/ui'

const savedAt = ref<Date>()

const [Form] = useForm({
  schema,
  autosave: { endpoint: '/api/drafts' },
  onAutosaveSuccess: (response, form$) => {
    savedAt.value = new Date()
  },
})
</script>

<template>
  <Form />
  <p v-if="savedAt">Last saved at {{ savedAt.toLocaleTimeString() }}</p>
</template>
```

`@autosave-fail` is where a warning banner or your own retry queue goes — though some recovery is built in. An [interval](#interval-saves) reattempts failures on schedule, and a gated save rejected with `422` is [retried when the form becomes valid](#the-validity-gate). A failed autosave doesn't affect the form otherwise — no errors appear on elements.

## Disabling Autosave

Autosave is off whenever `autosave` is `undefined`, which makes a conditional config the natural on/off switch:

```ts
const autosave = computed(() =>
  isDraft.value ? { endpoint: '/api/drafts' } : undefined
)

const [Form] = useForm({ schema, autosave })
```

To pause saving temporarily while keeping the config in place, an `@autosave` handler returning `false` does the job.
