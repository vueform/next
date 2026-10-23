---
outline: [2,3]
---

# Autosave

An accidental reload shouldn't cost the user their progress. Vueform protects it in two directions — the `draft` prop mirrors the form into browser storage so a reload restores it, and the `autosave` prop sends the data to an endpoint shortly after it changes. The two props are independent, combine freely, and each comes with the lifecycle that fits its destination.

## Drafts

The simplest protection is one flag. Set `draft` and the form mirrors itself into `localStorage` — reload the page and the draft comes back:

```ts
const [Form] = useForm({
  schema,
  name: 'checkout', // the storage key derives from the form's name
  draft: true, // [!code highlight]
})
```

The draft is stored under the key `vueform:{name}`, which is why drafts require the form to have a `name` — without one (or an explicit [`key`](#draft-options)), drafts are disabled with a dev warning.

The mirror runs on its own — there's nothing to schedule:

- **It saves on change.** Every edit writes the draft on a short debounce, and navigation events can join the [triggers](#saving-triggers).
- **It saves regardless of validity.** A half-filled, invalid form is exactly what a draft is.
- **It stores the raw model, not the payload.** Restoring a draft reproduces the form's full state, including values behind unmet [conditions](/guide/conditions).
- **It skips what shouldn't persist.** [Sensitive values](#sensitive-values) and `File` values are stripped before the draft is written.

Each of these behaviors is tunable — in place of `true`, `draft` accepts a `DraftConfig` object, whose keys the rest of this section walks through and [Draft Options](#draft-options) collects in one place.

### Saving Triggers

The `on` option lists the events that save the draft, defaulting to `['change']` — the draft is written after the form's data changes:

| Trigger | Fires on |
| --- | --- |
| `'change'` | The form's data changes. |
| `'tab'` | The active tab changes in a tabbed form. |
| `'step'` | The active step changes in a stepped form. To save in only one direction, use `'next'` or `'back'` instead. |

In a [multi-page form](/guide/multi-page-forms), adding the navigation triggers makes the draft catch every action:

```ts
draft: {
  on: ['change', 'step', 'tab'], // also save on step and tab navigation
},
```

`'change'` is the only debounced trigger — the draft is written once the user pauses for [`debounce`](#draft-options) (default one second), so a burst of changes — typing, a slider drag — doesn't hammer storage with a write per value. The same value caps staleness, so continuous typing still flushes a save at least that often. Every other trigger saves immediately.

An empty list (`on: []`) turns automatic saving **off** entirely, leaving writes to the manual [`saveDraft()`](#saving-manually) — restore-on-mount and discard-on-success aren't affected.

### Restoring the Draft

When a stored draft exists, it's restored into the form on mount. The [cancelable](/guide/event-handlers#cancelable-events) `@restore-draft` event fires first with the stored data — return `false` to skip the restore (the draft stays in storage), or use it to show a "draft restored" notice:

```ts
const [Form] = useForm({
  schema,
  name: 'checkout',
  draft: true,
  onRestoreDraft: (data, form$) => {
    if (!confirmRestore()) return false

    showToast('Draft restored')
  },
})
```

To take over the timing yourself, disable the automatic restore with `restore: false` and call `restoreDraft()` when _you_ decide. It restores the stored draft — no pre-hook, the explicit call is the consent — and resolves whether one was found:

```vue
<script setup lang="ts">
const [Form, form$] = useForm({
  schema,
  name: 'checkout',
  draft: { restore: false }, // [!code highlight]
})

const restore = async () => {
  if (await form$?.restoreDraft()) {
    showToast('Draft restored')
  }
}
</script>

<template>
  <Form />
  <button @click="restore">Restore draft</button>
</template>
```

To peek at the stored data without touching the form — a "resume where you left off?" banner — `getDraft()` resolves the draft, or `undefined` when there's none:

```ts
const draft = await form$.getDraft()
```

### Discarding the Draft

A successful [submit](/guide/submit) discards the draft — the data reached its real destination, the safety copy has done its job. To keep it anyway there are two levers — the [cancelable](/guide/event-handlers#cancelable-events) `@discard-draft` event fires before each automatic discard, so returning `false` keeps the draft case by case, while `discardOnSuccess: false` turns the automatic discard off altogether:

```ts
draft: { discardOnSuccess: false }
```

To discard manually — a "discard draft" button, a logout handler — call `discardDraft()`. Like the manual restore it fires no pre-hook, and both paths fire `@draft-discarded` once the draft is gone:

```ts
form$.discardDraft()
```

### Draft Options

`draft: true` uses the defaults; an object customizes them via `DraftConfig`:

```ts
draft: {
  key: 'checkout-v2',      // storage key (bump it to invalidate old drafts)
  storage: sessionStorage, // any getItem/setItem/removeItem implementation
  on: ['change', 'step'],  // saving triggers (default ['change'])
  debounce: 3000,          // debounce for change-triggered saves
  restore: false,          // no automatic restore on mount (use restoreDraft())
  discardOnSuccess: false, // keep the draft after successful submit
  encrypt: false,          // skip the app-level cipher for this form's draft
  sensitive: true,         // store sensitive element values too
},
```

- A custom `key` is namespaced like a derived one — without the `vueform:` prefix it gets it added, so a schema-supplied key can never address a foreign storage entry.
- `storage` accepts anything with the [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) shape — `sessionStorage`, or a custom `{ getItem, setItem, removeItem }` adapter over IndexedDB or a native bridge — and the app-wide default comes from [`$autosave.storage`](/guide/configuration#autosave), so one line of config can move every form's drafts off `localStorage`.

### Encrypting Drafts

Drafts are stored as plaintext until the app configures the `$security` ciphers, so every form persisting them warns in dev:

_`!Drafts are being stored in plaintext — no '$security' ciphers are configured. Provide real ones via 'createVueform({ $security: { encrypt, decrypt } })'', or consciously opt out by registering identity functions ('encrypt: (v) => v, decrypt: (v) => v') or setting 'draft.encrypt: false' on this form.`_

Storing unencrypted must be a conscious choice, not a silent default. During development the quickest way to acknowledge it is the app-wide opt-out — identity ciphers that store values as they are:

```ts
createVueform({
  $security: {
    encrypt: (value) => value,
    decrypt: (value) => value,
  },
})
```

Before going to production, replace the stubs with a real cipher pair — [draft encryption](/guide/security#draft-encryption) walks you through the complete setup.

What the ciphers mean for drafts:

- Because `decrypt` may be async, `restoreDraft()` and `getDraft()` resolve as Promises.
- A `decrypt` that **throws** — no key yet, a rotated session, someone else's draft — marks the draft unreadable. It's discarded like a corrupt one, and nothing loads.
- Opt a single harmless form out with `draft: { encrypt: false }` ([Options](#draft-options)) — its draft is written and read as plaintext, warning-free. Flipping the flag later leaves the old draft unreadable, which counts as no draft.

Encryption protects the draft **at rest** — values that should never be persisted at all belong under [`sensitive`](#sensitive-values).

### Rolling Your Own

If the built-in draft saving doesn't fit — a different trigger set, per-user keys, drafts synced to your own store — it isn't doing anything you can't do yourself. It's a convenience over the form's own events.

Subscribe to `@change` to save and `@mounted` to restore, and the policy in between is entirely yours:

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

Point `autosave` at a URL and the form saves to the server shortly after its data changes — about a second after the user stops typing — holding the save back while the form has validation errors:

```ts
const [Form] = useForm({
  schema,
  autosave: '/api/drafts', // [!code highlight]
})
```

Each autosave is a `POST` request sent through the [HTTP module](/guide/http), so any base URL, global headers, or interceptors you've configured apply automatically. The form's `headers`, `json`, and `base64` props shape autosave requests exactly as they [shape](/guide/submit#request-format) submissions. What's sent is the same [payload](/guide/submit#what-gets-sent) a submission would send, [`transformPayload`](/guide/submit#transforming-the-payload) included, minus [sensitive values](#sensitive-values) — optionally shaped further by [`transform`](#transforming-autosave-data).

Otherwise autosave runs independently of `submit()`. The form's `endpoint`, `method`, success messages, redirects — none of them apply to autosave requests, which fire their own [events](#observing-saves) instead.

Saves don't pile up either. Starting a new save aborts the request still in flight, so on a slow connection a stale response can never land — or report — after a newer save's.

The `autosave: '…'` string is shorthand for `AutosaveConfig` object with only `endpoint` set. The object form takes further options — the next sections cover them one by one, and [Autosave Options](#autosave-options) lists them all.

### Event Triggers

Remote saves use the same `on` vocabulary as [draft saving triggers](#saving-triggers) — the same event names and the same `['change']` default — with its own `debounce` for change-triggered saves (default `1000` ms):

```ts
autosave: {
  endpoint: '/api/drafts',
  on: ['change', 'step'], // also save when the active step changes
  debounce: 2000, // [!code highlight]
},
```

Setting `on` replaces the default, so include `'change'` if edits should keep saving too. To turn event-driven saving off, set `on: []` — saving is then left to the [interval](#interval-saves) or the manual [`autosave()`](#saving-manually).

In a [multi-page form](/guide/multi-page-forms) the navigation triggers make natural save points. Note what a navigation save is though — fire-and-forget. The page turns whether or not the request succeeds, and every save sends the whole form's data. If a step must not advance until its data is safely stored, or each page should send only its own fields, handle the navigation events yourself, as shown in [Saving Progress](/guide/multi-page-forms#saving-progress).

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
  debounce: 2000,
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

### Autosave Options

The `autosave: '…'` string uses the defaults; an object customizes them via `AutosaveConfig`:

```ts
autosave: {
  endpoint: '/api/drafts',         // the remote target — a URL or a function
  method: 'PUT',                   // request method (default 'POST')
  on: ['change', 'step'],          // event triggers (default ['change'])
  debounce: 2000,                  // debounce for change-triggered saves
  interval: 30000,                 // periodic saves in ms (default off)
  invalid: true,                   // save even while the form is invalid
  sensitive: true,                 // send sensitive element values too
  transform: (payload) => payload, // reshape what a save sends
},
```

A few keys reach beyond this section — `sensitive` and `transform` are covered in [Sensitive Values](#sensitive-values) and [Transforming Autosave Data](#transforming-autosave-data), and a function `endpoint` in [Owning the Save](#owning-the-save).

## Drafts + Remote

The two props combine naturally — the draft keeps an ungated local safety copy while remote saves sync the server once the data is valid, each with the behavior that fits its destination:

```ts
const [Form] = useForm({
  schema,
  name: 'checkout',
  draft: true,             // local mirror, saves regardless of validity
  autosave: '/api/drafts', // remote sync, gated on validity, POST
})
```

## Sensitive Values

Not every value belongs in a draft. Mark an element `sensitive` and its value is stripped from both kinds of autosave — the stored draft and the remote payload — while a real submission still carries it like any other element's:

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

On a container the flag covers the entire subtree — a `sensitive` [group](/guide/form-structure#grouping-elements) excludes every element inside it. Restoring a draft leaves stripped elements untouched. `File` values can't be serialized, so they're stripped from drafts too, with a dev warning.

Each prop can opt back in with its own `sensitive: true` — `draft: { sensitive: true }` stores the values, `autosave: { sensitive: true }` sends them. Submission is unaffected either way and always carries the full payload.

::: warning
Drafts persist form data — potentially personal data — to the user's disk. Mark passwords, payment details, and similar fields `sensitive` so they never reach storage.
:::

## Saving Manually

Both kinds of saving have an on-demand method — a "Save now" button, a `beforeunload` handler:

```ts
await form$.saveDraft() // draft write
await form$.autosave()  // remote save
```

`saveDraft()` writes the current model snapshot to storage immediately, skipping the [`debounce`](#draft-options), and resolves whether a draft was written — `false` when drafts are inactive, or when the write failed or was superseded by a newer save or discard. Everything an automatic write does still applies — [sensitive](#sensitive-values) and `File` values are stripped, the [cipher](#encrypting-drafts) runs. Like the other manual draft methods it fires no `@save-draft` pre-hook, while `@draft-saved` still reports the landed write.

`autosave()` is remote-only and a no-op when no `endpoint` is configured. The [validity gate](#the-validity-gate) applies as configured — a gated call while the form is invalid defers the save, which then runs as soon as the form becomes valid. To decide about invalid data for just this call, pass `invalid` — it overrides the config's `invalid` option either way:

```ts
await form$.autosave({ invalid: true }) // send even while the form is invalid
```

The returned promise resolves when everything settles, with the usual [events](#observing-saves) firing along the way.

The remote side also has a brake. `abortAutosave()` cancels whatever save is underway or queued — the in-flight request, a running change debounce, a deferred gated save — and everything settles silently, firing no fail event, just like a request superseded by a newer save. Autosaving itself stays on, with the triggers and the [interval](#interval-saves) arming future saves as usual:

```ts
form$.abortAutosave()
```

To make manual saving the only saving, empty the triggers on either side:

```ts
const [Form, form$] = useForm({
  schema,
  name: 'checkout',
  draft: { on: [] },                             // drafts write only via saveDraft()
  autosave: { endpoint: '/api/drafts', on: [] }, // remote saves only via autosave()
})
```

`draft: { on: [] }` stops automatic draft writes while restore-on-mount and discard-on-success keep working, and with no [`interval`](#interval-saves) configured, `on: []` leaves `autosave()` as the only remote trigger.

## Transforming Autosave Data

Remote saves send the form's [payload](/guide/submit#what-gets-sent) — the same data submission would send, [`transformPayload`](/guide/submit#transforming-the-payload) included, minus [sensitive values](#sensitive-values). `transform` shapes that data further, for autosave requests only:

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

Whatever it returns is what the remote save sends — submission never sees it. [Drafts](#drafts) aren't affected either, since they store the untransformed model so restoring is lossless.

## Owning the Save

The request doesn't have to be Vueform's own `POST` to a fixed URL — the same levers submission has ([Owning the Request](/guide/submit#owning-the-request)) exist for autosave.

### Endpoint as an Expression

When only the URL depends on form data, a string `endpoint` may be an [expression](/guide/expressions) — its `{...}` placeholders resolve from the model at save time:

```ts
autosave: {
  endpoint: '/api/users/{user_id}', // [!code highlight]
},
```

It's still the built-in request — method, request format, and [events](#observing-saves) as usual.

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
| `HttpResponse` | Used as the result and judged by status like any response — `@autosave-success` fires on a 2xx, `@autosave-fail` on anything else. |
| `void` / `undefined` | The save settles silently — no event fires. Return the response when listeners should hear about the save. |
| `false` | The save is canceled — no event fires. |

Because the example returns the `HttpResponse`, `@autosave-success` fires as usual and downstream listeners — a saved-at indicator, a toast — work unchanged. There doesn't have to be a request at all — persistence is whatever the function does. For browser storage, though, [`draft`](#drafts) already covers it, restoring included.

### Intercepting with `@autosave`

The `@autosave` event fires before every remote save — URL and function endpoints alike — with the data about to be sent. Return `false` to cancel the save, a `string` to redirect the built-in request to that URL, or an `HttpResponse` to replace the request entirely:

```ts
const [Form] = useForm({
  schema,
  autosave: '/api/drafts',
  onAutosave: (data, form$) => {
    if (!data.title) return false // nothing worth saving yet
  },
})
```

This makes `@autosave` the conditional sibling of the function endpoint — reach for the function when custom logic _is_ the save mechanism, and for the event when a URL endpoint is the default and you only step in sometimes.

## Observing Saves

Drafts and remote saves fire their own form events — [cancelable](/guide/event-handlers#cancelable-events) pre-hooks before each action, outcome reports after. The draft lifecycle:

| Event | Fires | Arguments |
| --- | --- | --- |
| `@save-draft` | Before each automatic draft write — return `false` to skip the write. | draft data, context |
| `@draft-saved` | After a draft write landed in storage. | draft data, context |
| `@restore-draft` | Before the automatic restore on mount — return `false` to skip ([Restoring the Draft](#restoring-the-draft)). | stored data, context |
| `@draft-restored` | After a stored draft was restored into the form, automatically or manually. | restored data, context |
| `@discard-draft` | Before the automatic discard on successful submit — return `false` to keep the draft. | context |
| `@draft-discarded` | After the stored draft was removed, automatically or manually. | context |

The pattern to remember — verb-first events are cancelable pre-hooks on the automatic flows, past-tense events report completed actions, and the manual methods (`saveDraft()`, `restoreDraft()`, `discardDraft()`) skip the pre-hooks because calling them _is_ the consent. The remote lifecycle:

| Event | Fires | Arguments |
| --- | --- | --- |
| `@autosave` | Before a remote save runs — cancel or take it over ([Intercepting](#intercepting-with-autosave)). | payload, context |
| `@autosave-response` | Whenever a save receives an HTTP response — success and error statuses alike. | `HttpResponse`, context |
| `@autosave-success` | When a save's response came back with a 2xx status. | `AutosaveSuccess` result, context |
| `@autosave-fail` | When a save fails — a request error, or a response with any other status. | `AutosaveFail` result, context |

The outcomes carry the same result shapes submission's events do — `data`, `status`, and the full `response` on success; `reason`, `status`, `message`, `data`, and `response` on failure. On a successful save the order is `@autosave` → HTTP request → `@autosave-response` → `@autosave-success`. On a failed one it's `@autosave` → HTTP request → `@autosave-response` → `@autosave-fail`, with `@autosave-response` skipped when there's no response at all, as in a network failure. An [aborted](#saving-manually) save fires nothing.

`@autosave-success` is the hook for a saved-at indicator, or for storing the ID the server returned:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@vueform/ui'

const savedAt = ref<Date>()

const [Form] = useForm({
  schema,
  autosave: '/api/drafts',
  onAutosaveSuccess: (result, form$) => {
    savedAt.value = new Date()
  },
})
</script>

<template>
  <Form />
  <p v-if="savedAt">Last saved at {{ savedAt.toLocaleTimeString() }}</p>
</template>
```

`@autosave-fail` is where a warning banner or your own retry queue goes, with the result's `reason` telling the categories apart — `'network'`, `'timeout'`, `'http'`, `'invalid'` for a `422`, and so on. Some recovery is built in, though. An [interval](#interval-saves) reattempts failures on schedule, and a gated save rejected as `'invalid'` is [retried when the form becomes valid](#the-validity-gate). A failed autosave doesn't affect the form otherwise — no errors appear on elements.

## Disabling Autosave

Either prop is off when `undefined`, which makes a conditional config the natural on/off switch:

```ts
const autosave = computed(() =>
  isDraft.value ? '/api/drafts' : undefined
)

const [Form] = useForm({ schema, autosave })
```

To pause saving temporarily while keeping the config in place, a pre-hook returning `false` does the job — `@autosave` for remote saves, `@save-draft` for draft writes.
