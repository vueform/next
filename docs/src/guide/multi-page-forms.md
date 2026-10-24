---
outline: [2,3]
---

# Multi-Page Forms

A long form reads better in pages, and Vueform offers two kinds — **tabs** the user moves between freely, and **steps**, a wizard that validates each page before letting the user advance. Either mode is one prop on the form. Every direct child becomes a page, and one pager engine drives both modes, so labels, conditions, events, and programmatic control work the same whichever you pick.

## Tabbed Forms

Set `tabbed` on `!VfForm` and each direct child becomes a tab, labeled by its `page` prop:

::: usage w-xl

```vue [Preview]
<VfForm tabbed>
  <VfGroup name="profile" page="Profile">
    <VfText name="name" label="Name" />
  </VfGroup>
  <VfGroup name="billing" page="Billing">
    <VfText name="company" label="Company" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  profile: {
    type: 'group',
    page: 'Profile', // [!code highlight]
    schema: {
      name: { type: 'text', label: 'Name' },
    },
  },
  billing: {
    type: 'group',
    page: 'Billing', // [!code highlight]
    schema: {
      company: { type: 'text', label: 'Company' },
    },
  },
})

const [Form] = useForm({ schema, tabbed: true }) // [!code highlight]
</script>

<template>
  <Form />
</template>
```

:::

Any tab can be selected at any time, and switching never validates — tabs suit settings screens and edit forms, where the user jumps to whatever they came to change. A `!VfGroup` takes `tabbed` too, for tabs inside a form; see [tabbed groups](/guide/form-structure#tabbed-groups).

## Stepped Forms

Set `stepped` instead and the form becomes a wizard — a progress indicator (`!VfSteps`) appears above the pages and a navigation bar (`!VfNav`) with Back, Next, and Finish below them:

::: usage w-xl

```vue [Preview]
<VfForm stepped endpoint="/api/signup">
  <VfGroup name="account" page="Account">
    <VfText name="email" label="Email" rules="required|email" />
  </VfGroup>
  <VfGroup name="address" page="Address">
    <VfText name="city" label="City" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  account: {
    type: 'group',
    page: 'Account',
    schema: {
      email: { type: 'text', label: 'Email', rules: 'required|email' },
    },
  },
  address: {
    type: 'group',
    page: 'Address',
    schema: {
      city: { type: 'text', label: 'City' },
    },
  },
})

const [Form] = useForm({ schema, stepped: true, endpoint: '/api/signup' }) // [!code highlight]
</script>

<template>
  <Form />
</template>
```

```vue [Live]
<VfForm stepped hide-errors>
  <VfGroup name="account" page="Account">
    <VfText name="email" label="Email" rules="required|email" />
  </VfGroup>
  <VfGroup name="address" page="Address">
    <VfText name="city" label="City" />
  </VfGroup>
</VfForm>
```

:::

Steps unlock in order. Next unlocks the following step, and the indicator lets the user click back to any step already reached — but never ahead. On the last available step Finish replaces Next and submits the form, with the full [submission](/guide/submit) lifecycle, endpoint and result events included.

## How Pages Work

Every direct child of the form is one page — a schema entry or an inline child — and only the selected page is visible. Elements nested deeper are never pages.

A page is usually a `!VfGroup`, but any element works; a single `!VfText` can be its own page. Static elements count too, so a button placed at the form's root becomes a page of its own rather than a shared footer — keep anything that should appear on every page out of the form's direct children.

The page's **name** is its element's `name` — the key navigation methods and events identify pages by. The visible text comes from the `page` prop.

Pages that aren't selected keep their values and validation state — the form owns all of them, the pager only decides what's on screen. Off-screen pages also render lazily, which is what makes paging the biggest performance lever for large forms; see [performance](/guide/performance#split-large-forms-into-pages). Resetting the form — `form$.reset()` or `resetOnSuccess` — also returns it to the first page and clears step progress.

In a [Modular Setup](/guide/code-splitting#modular-setup) the paging components must be registered — `!VfTabs` for tabs, `!VfSteps` and `!VfNav` for steps.

### Page Labels

`page` accepts a string, a locale map, a ref, or a function receiving the element's [context](/guide/context), and the label resolves like any text prop — [expressions](/guide/expressions) and translation included; see [dynamic props](/guide/dynamic-props).

### Page Metadata

To attach extra data to a page, pass a one-item tuple instead of a plain label. Every key of the object — `label` included — surfaces as the page's `meta`, both on the [resolved page](#pager-api) and in the [`#tab` / `#step` slot](#customizing-with-slots) scope:

```ts
account: {
  type: 'group',
  page: [{ label: 'Account', icon: 'icon-user' }],
  schema: {
    email: { type: 'text', label: 'Email' },
  },
},
```

A string `icon` key is resolved like any icon prop — `$`-prefixed semantic names map through the [`icons`](/guide/configuration#icons) config, anything else reaches the icon resolver as-is. The default tab and step rendering shows only the label; metadata exists for your own slots.

## Conditional Pages

[Conditions](/guide/conditions) on a page's element remove the whole page — header and content together. The syntax and a working example live in [conditional pages](/guide/conditions#conditional-pages); what's specific to paging is the consequences. Next and Back skip unavailable steps, Finish appears on the last **available** step, and a hidden page's fields drop out of validation and the payload like any [hidden element's](/guide/conditions#what-happens-to-hidden-elements) do.

## Navigating Steps

What makes steps a wizard is the gate between pages — Next validates before it advances, and the step indicator only unlocks as far as the user has legitimately gotten.

### Next, Back, and Finish

**Next** fires `beforeNext`, then validates the current page **and every page before it**. If any of them fails, the user stays where they are and the first error is focused — when it sits on an earlier page, the form switches to that page first. Otherwise the next available step becomes selected and unlocked.

**Back** returns to the previous available step without validating.

**Finish** submits the form. Submission validates the whole form as always ([when validation fails](/guide/submit#when-validation-fails)), and on failure the form switches to the page holding the first error. Finish does nothing while a page is [loading](#events).

Clicking an already-reached step in the indicator jumps there without validating and without the Next/Back events — only `beforeStep` and `step` fire ([events](#events)).

### Validation Gating

The gate on Next is the `next` trigger of the form's `validateOn`, on by default (`['blur', 'next']`) — trigger semantics live in [when rules run](/guide/validation#when-rules-run). Drop `'next'` to let users move forward freely and leave validation to Finish:

```ts
const [Form] = useForm({
  schema,
  stepped: true,
  validateOn: ['blur'], // Next no longer blocks — Finish still validates
})
```

Adding `'back'` blocks retreating from an invalid step as well.

Tabs never validate on switch — a failed submit simply opens the tab holding the first error. In both modes the headers keep the user oriented. Tab and step headers flag pages with errors, and steps additionally mark completed ones — the default themes style both.

### Navigation Bar Options

`nextLabel`, `backLabel`, and `finishLabel` set the button captions. They're text props whose defaults come from the locale (`steps_next`, `steps_back`, `steps_finish`), so translations belong in the [locale](/guide/i18n#writing-a-locale) file rather than on every form. The rest of the bar's chrome is three booleans and a position:

| Prop | Default | Effect |
| --- | --- | --- |
| `back` | `true` | `false` hides the Back button on the **first** step instead of showing it disabled. |
| `progress` | `true` | `false` hides the step indicator. |
| `nav` | `true` | `false` hides the whole navigation bar — for fully custom controls. |
| `navPos` | `'auto'` | `'left'` / `'center'` / `'right'` pack the buttons to one side, `'fluid'` stretches them; `'auto'` follows the theme's `navJustify` token (`space-between` by default). |

Here Back is hidden on the first step and the buttons pack to the right:

::: usage nomodel w-xl

```vue [Preview]
<VfForm stepped :back="false" nav-pos="right">
  <VfGroup name="details" page="Details">
    <VfText name="title" label="Title" />
  </VfGroup>
  <VfGroup name="summary" page="Summary">
    <VfText name="notes" label="Notes" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  details: {
    type: 'group',
    page: 'Details',
    schema: {
      title: { type: 'text', label: 'Title' },
    },
  },
  summary: {
    type: 'group',
    page: 'Summary',
    schema: {
      notes: { type: 'text', label: 'Notes' },
    },
  },
})

const [Form] = useForm({
  schema,
  stepped: true,
  back: false, // [!code highlight]
  navPos: 'right', // [!code highlight]
})
</script>

<template>
  <Form />
</template>
```

:::

### Scrolling and Focus

A blocked Next or Back focuses and scrolls to the first error under the same `focusError` / `scrollToError` / `scrollOptions` props submission uses — see [scroll and focus](/guide/validation#scroll-and-focus). Independently of errors, `scrollTopOn`'s `'next'` and `'back'` triggers — both covered by the default `'always'` — scroll the form back to its top on every step change; see [scroll to top](/guide/submit#scroll-to-top).

## Programmatic Navigation

The form [context](/guide/context#form-context) exposes the active pager as `pager`, plus `steps` and `tabs` for each mode explicitly. Pagers are mounted members — `undefined` until the form mounts, and `pager` stays `undefined` when neither mode is on — so reach them through `formReady` or optional chaining:

```ts
formReady((form$) => {
  form$.pager?.next()           // same as the Next button
  form$.pager?.select('review') // jump straight to a page
})
```

`next()`, `back()`, and `finish()` behave exactly like the buttons, validation and events included. `select()` is the escape hatch — it jumps to any available page by name or index, **ignoring the step lock** and enabling every step up to it, without validating.

### Pager API

| Method | Effect |
| --- | --- |
| `select(page)` | Selects a page by name or index — bypasses the step lock and enables every step up to it. |
| `next()` / `back()` | Same as the buttons, validation and events included. |
| `finish()` | Submits the form from the last available step. |
| `reset()` | Returns to the first page, with later steps disabled and unvalidated. |
| `revertTo(page)` | Selects the page, disables every step after it, and clears validation from that page onward. |
| `enableUntil(page)` | Unlocks steps up to the page without moving. |
| `getPage(page)` | Returns the resolved page for a name or index. |
| `on(event, cb)` / `off(event, cb)` | Pager-level event subscription. |

Alongside the methods, the pager holds the paging state:

| Property | Holds |
| --- | --- |
| `page` / `oldPage` | The names of the selected and the previously selected page. |
| `index` | The selected page's zero-based index. |
| `pages` | Every resolved page, in order. |
| `currentPage` / `nextPage` / `previousPage` | Resolved pages around the current one — `nextPage` and `previousPage` skip unavailable pages. |
| `lastPage` | The name of the last available page. |
| `lastEnabled` | The index of the furthest unlocked step. |
| `active` | Whether the pager's mode is on. |
| `sequential` | `true` for steps, where pages unlock in order. |
| `loading` | Whether any page is loading. |
| `invalid` | Whether any page has validation errors. |

Most of these deal in **resolved pages** — the same objects events and slots receive. A resolved page carries the page's `name`, `label`, `meta`, and `index`, its element's context as `el$`, the state flags (`available`, `selected`, `enabled`, `completed`, `invalid`, `loading`), and its own `select()`, `validate()`, and `unvalidate()` methods. Unlike `pager.select()`, a page's own `select()` **respects** the step lock.

## Events

The form reports navigation through four event pairs:

| Event | Fires when |
| --- | --- |
| `tab` / `beforeTab` | The active tab changes / is about to change. |
| `step` / `beforeStep` | The active step changes / is about to change — on **every** path: buttons, indicator clicks, browser history, `select()`, the initial step sync. |
| `next` / `beforeNext` | Next advanced the form / is about to. |
| `back` / `beforeBack` | Back retreated / is about to. |

All of them receive `newPage` and `oldPage` as resolved pages, the `pager`, and the form context. Any `before*` event cancels its action by returning `false` — the mechanism, async handlers included, is covered in [cancelable events](/guide/event-handlers#cancelable-events).

On a Next click the order is `beforeNext` → validation → `beforeStep` → page change, with `step` and `next` reporting afterwards. `beforeNext` and `beforeBack` therefore guard only the buttons and run before validation, while `beforeStep` guards leaving a page by any route and runs after it.

While an async `before*` handler is pending — or an async rule on the current page is pending or debouncing — the page counts as **loading**. Next and Finish are disabled, the step indicator shows the state, and while a handler is pending, step-header clicks are ignored too, so an async guard needs no extra locking:

```ts
const [Form] = useForm({
  schema,
  stepped: true,
  onBeforeNext: async (newPage, oldPage, pager, form$) => {
    if (!(await reserveSeats(form$.data.seats))) return false // stay on the page
  },
})
```

[Tabbed groups](/guide/form-structure#tabbed-groups) emit `tab` and `beforeTab` too.

## Resuming Progress

On mount, a stepped form that already has data — a `v-model`, an attached [model](/guide/model), a restored [draft](/guide/autosave#drafts) — unlocks every step up to the last one holding data and selects it, so a returning user lands where they left off. "Holding data" means any non-empty value in the page; default values count, an unchecked checkbox doesn't. Set `syncSteps: false` to always start on the first step.

The sync runs once, on mount. For data arriving later, call `form$.syncSteps()` yourself — it works with the prop off too:

```ts
formReady(async (form$) => {
  form$.load(await fetchSavedProgress())
  form$.syncSteps()
})
```

## Saving Progress

The declarative route is [autosave](/guide/autosave) — both `draft` and `autosave` accept the `'step'` (or `'next'` / `'back'`) and `'tab'` [triggers](/guide/autosave#event-triggers), saving the whole form's data fire-and-forget on every page turn. For anything beyond that, a `step` handler covers every navigation:

```ts
import { useForm, useHttp } from '@vueform/ui'

const $http = useHttp()

const [Form] = useForm({
  schema,
  stepped: true,
  onStep: (newPage, oldPage, pager, form$) => {
    $http.post('/api/draft', form$.payload)
  },
})
```

- To save only forward moves, use `next` instead — it fires once validation has passed. Don't pair it with `step`, which fires for the same moves.
- To send only the page being left, post `oldPage.el$.payload` instead of the whole payload.
- To block navigation until the save succeeds, save in `beforeNext` and return `false` on failure.

## Browser History

Set `history` and each step change pushes a browser history entry, so the browser's back and forward buttons move between steps. This is for stepped forms only — tabs never touch history:

```vue
<VfForm stepped history>
  <!-- pages -->
</VfForm>
```

History navigation fires `beforeStep` and `step` but doesn't validate. The feature needs the `router` [module](/guide/modules) — without it `history` has no effect beyond a dev warning. And without vue-router on the app, entries go through `history.pushState`, so the URL itself doesn't change.

### Vue Router Integration

With vue-router installed on the app, the step's name becomes the URL's **last path segment**, and the URL drives selection both ways — pushes update it, and navigating to it selects the step. The segment is replaced rather than appended, so the form's route must end in a step segment (`/signup/:step`). A direct link to a step selects it and unlocks the steps before it without validating them — Finish still validates everything on submit.

`routerQueryParam` encodes the step as a query parameter instead (`/signup?step=contact`):

```vue
<VfForm stepped history router-query-param="step">
  <!-- pages -->
</VfForm>
```

App-wide defaults (`$router.queryParam`), pinning or disabling the router instance, and a custom `adapter` live in [configuration](/guide/configuration#router). A query parameter without vue-router warns in development.

## Customizing with Slots

Every paging region has a slot pair — one replacing the region wholesale, one replacing just the repeated piece inside it:

| Region | Whole region | Pieces |
| --- | --- | --- |
| Tab bar | `#tabs` | `#tab` |
| Step indicator | `#steps` | `#step` |
| Navigation bar | `#nav` | `#back` / `#next` / `#finish`, plus `#back-text` / `#next-text` / `#finish-text` for the labels only |

The whole-region slots receive the `pager` (and `bindings`), so a fully custom bar drives navigation through the [pager API](#pager-api). `#tab` and `#step` receive the complete resolved page — `meta` included — and render inside the default tab button, keeping its ARIA wiring. The button slots receive their `label`, `disabled` (plus `loading` on Next and Finish), `fluid`, `bindings`, and their action as a function (`next`, `back`, or `finish`); the `-text` slots swap only the caption. Numbering steps and checking off completed ones takes one `#step` slot:

<!--@include: @/components/VfForm.md#usage-custom-steps-example-->

Further examples and the exact slot scopes are on the [VfForm](/components/VfForm) reference page, and [`defineSlot`](/guide/slots#defineSlot) passes any of these slots from a schema. Keyboard behavior and the ARIA roles of tabs, steps, and the navigation bar are covered in [accessibility](/guide/accessibility#tabs-and-steps).
