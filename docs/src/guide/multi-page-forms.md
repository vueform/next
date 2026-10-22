---
outline: [2,3]
---

# Multi-Page Forms

A long form doesn't have to be one long page. Vueform can split a form into multiple pages in two flavors: **tabs**, where the user moves freely between pages, and **steps**, a sequential wizard that validates each page before letting the user advance. Both run on the same underlying pager engine, so labels, conditions, events, and programmatic control work the same way in both — this chapter covers the two modes first, then everything they share.

## Tabbed Forms

Add the `tabbed` prop to `!VfForm` and its direct children become tabs. Each child's `page` prop sets the tab label:

::: usage

```vue [Preview]
<VfForm tabbed>
  <VfGroup name="general" page="General">
    <VfText name="name" label="Name" />
    <VfText name="email" label="Email" />
  </VfGroup>
  <VfGroup name="profile" page="Profile">
    <VfText name="bio" label="Bio" />
    <VfText name="website" label="Website" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  general: {
    type: 'group',
    page: 'General',
    schema: {
      name: { type: 'text', label: 'Name' },
      email: { type: 'text', label: 'Email' },
    },
  },
  profile: {
    type: 'group',
    page: 'Profile',
    schema: {
      bio: { type: 'text', label: 'Bio' },
      website: { type: 'text', label: 'Website' },
    },
  },
})

const [Form] = useForm({ schema, tabbed: true })
</script>

<template>
  <Form />
</template>
```

:::

Any tab can be clicked at any time — there is no sequential locking, and switching tabs doesn't validate anything. Tabs suit settings screens and edit forms where the user knows where they want to go.

## Stepped Forms

Add `stepped` instead and the form becomes a multi-step wizard: a progress indicator on top, Back / Next / Finish navigation below, and validation gating between steps:

::: usage

```vue [Preview]
<VfForm stepped hide-errors>
  <VfGroup name="personal" page="Personal">
    <VfText name="first_name" label="First name" />
    <VfText name="last_name" label="Last name" />
  </VfGroup>
  <VfGroup name="contact" page="Contact">
    <VfText name="email" label="Email" />
    <VfText name="phone" label="Phone" />
  </VfGroup>
  <VfGroup name="review" page="Review">
    <VfCheckbox name="terms" text="I agree" rules="accepted" />
  </VfGroup>
</VfForm>
```

```vue [Template]
<VfForm stepped>
  <VfGroup name="personal" page="Personal">
    <VfText name="first_name" label="First name" />
    <VfText name="last_name" label="Last name" />
  </VfGroup>
  <VfGroup name="contact" page="Contact">
    <VfText name="email" label="Email" />
    <VfText name="phone" label="Phone" />
  </VfGroup>
  <VfGroup name="review" page="Review">
    <VfCheckbox
      name="terms"
      text="I agree"
      rules="accepted"
    />
  </VfGroup>
</VfForm>
```

```vue [Live]
<VfForm stepped hide-errors>
  <VfGroup name="personal" page="Personal">
    <VfText name="first_name" label="First name" />
    <VfText name="last_name" label="Last name" />
  </VfGroup>
  <VfGroup name="contact" page="Contact">
    <VfText name="email" label="Email" />
    <VfText name="phone" label="Phone" />
  </VfGroup>
  <VfGroup name="review" page="Review">
    <VfCheckbox name="terms" text="I agree" rules="accepted" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  personal: {
    type: 'group',
    page: 'Personal',
    schema: {
      first_name: { type: 'text', label: 'First name' },
      last_name: { type: 'text', label: 'Last name' },
    },
  },
  contact: {
    type: 'group',
    page: 'Contact',
    schema: {
      email: { type: 'text', label: 'Email' },
      phone: { type: 'text', label: 'Phone' },
    },
  },
  review: {
    type: 'group',
    page: 'Review',
    schema: {
      terms: {
        type: 'checkbox',
        text: 'I agree',
        rules: 'accepted',
      },
    },
  },
})

const [Form] = useForm({ schema, stepped: true })
</script>

<template>
  <Form />
</template>
```

:::

Steps unlock **sequentially** — the user must advance through each step to reach the next one, and the Finish button on the last step validates everything before submitting.

## How Pages Work

When `tabbed` or `stepped` is enabled, the form creates a **pager** — a state machine that tracks which pages exist, which are available, enabled, completed, and selected. Every direct child of the form is one page; only the child belonging to the currently selected page is visible.

The two modes differ only in chrome and policy:

- A **tabbed** form renders a tab bar (`VfTabs`) above the elements. Every page is reachable at all times.
- A **stepped** form renders a progress indicator (`VfSteps`) above and a navigation bar (`VfNav`) with Back, Next, and Finish buttons below. Pages are enabled one at a time as the user progresses.

A page is usually a `VfGroup` holding a set of elements, but any element with a `page` prop works — a single `VfText` can be its own page.

## Page Labels

The `page` prop is a [TextProp](/guide/dynamic-props): a plain string as in the examples above, or a locale map, a ref, or a function for localized and dynamic labels.

### Page Metadata

To attach extra data to a page — an icon, a description, anything your custom tab or step rendering needs — wrap the value in a **tuple**. The `label` key becomes the tab/step text; the remaining keys are exposed as `page.meta` in [slot](#customizing-with-slots) scope:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  account: {
    type: 'text',
    label: 'Username',
    page: [{ label: 'Account', icon: 'user' }],
  },
  profile: {
    type: 'text',
    label: 'Bio',
    page: [{ label: 'Profile', icon: 'id-card' }],
  },
})

const [MyForm] = useForm({ schema, tabbed: true })
```

```vue [Template]
<VfForm tabbed>
  <VfText
    name="account"
    label="Username"
    :page="[{ label: 'Account', icon: 'user' }]"
  />
  <VfText
    name="profile"
    label="Bio"
    :page="[{ label: 'Profile', icon: 'id-card' }]"
  />
</VfForm>
```

:::

The default tab and step rendering shows only the label — metadata is there for your own `#tab` / `#step` slots to consume.

## Conditional Pages

Apply [Conditions](/guide/conditions) to a page's element and the whole page — header and contents — appears and disappears with them:

::: usage model

```vue [Preview]
<VfForm tabbed>
  <VfGroup name="general" page="General">
    <VfText name="name" label="Name" />
    <VfCheckbox name="show_advanced" text="Show advanced settings" />
  </VfGroup>
  <VfGroup
    name="advanced"
    page="Advanced"
    :conditions="[['general.show_advanced', '==', true]]"
  >
    <VfText name="config" label="Config" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  general: {
    type: 'group',
    page: 'General',
    schema: {
      name: { type: 'text', label: 'Name' },
      show_advanced: {
        type: 'checkbox',
        text: 'Show advanced settings',
      },
    },
  },
  advanced: {
    type: 'group',
    page: 'Advanced',
    conditions: [['general.show_advanced', '==', true]], // [!code highlight]
    schema: {
      config: { type: 'text', label: 'Config' },
    },
  },
})

const [Form] = useForm({ schema, tabbed: true })
</script>

<template>
  <Form />
</template>
```

:::

The _Advanced_ tab only exists while the checkbox is checked. The same works in stepped forms — unavailable steps are skipped in the wizard flow. See [Conditions on Tabs and Steps](/guide/conditions#conditions-on-tabs-and-steps) for more patterns.

## Validation

Stepped navigation is gated by [Validation](/guide/validation):

- **Next** validates the current step. If it's invalid, navigation is blocked and the errors are displayed.
- **Finish** validates all enabled steps. If any step is invalid, the form jumps to the first invalid one and displays its errors.

The gating comes from the form's `validateOn` prop, whose default is `['blur', 'next']`. Remove `'next'` to let users move forward freely and defer all validation to submit:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  // ...
})

const [MyForm] = useForm({
  schema,
  stepped: true,
  validateOn: ['blur', 'submit'],
})
```

```vue [Template]
<VfForm
  stepped
  :validate-on="['blur', 'submit']"
>
  <!-- ... -->
</VfForm>
```

:::

The trigger list also accepts `'back'` to validate when navigating backwards — off by default, since a user retreating from a half-filled step usually shouldn't be stopped by its errors. Submission itself always validates anything without a passing result, whether or not `'submit'` is listed — see [Validation](/guide/validation).

::: tip
Tabbed forms don't validate on tab switches. Tabs are free-form navigation; validation happens on submit.
:::

## Navigation

The stepped form's navigation bar (`VfNav`) renders three buttons:

- **Back** — returns to the previous step. Disabled on the first step.
- **Next** — validates the current step, then advances. Shown on every step except the last.
- **Finish** — replaces Next on the last step; validates all enabled steps, then submits the form.

### Custom Labels

Override the button labels with `nextLabel`, `backLabel`, and `finishLabel` — all `TextProp`s, so they can be localized:

::: code-group

```ts [Schema]
const [MyForm] = useForm({ schema, stepped: true,
  nextLabel: 'Continue',
  backLabel: 'Go back',
  finishLabel: 'Submit form',
})
```

```vue [Template]
<VfForm stepped
  next-label="Continue"
  back-label="Go back"
  finish-label="Submit form"
>
  <!-- ... -->
</VfForm>
```

:::

### Hiding Parts of the UI

Three boolean props remove parts of the stepped chrome:

| Prop       | Default | Set to `false` to                                                        |
| ---------- | ------- | ------------------------------------------------------------------------ |
| `back`     | `true`  | Hide the back button entirely instead of disabling it on the first step. |
| `progress` | `true`  | Hide the step progress indicator while keeping the navigation bar.       |
| `nav`      | `true`  | Hide the whole navigation bar — for fully custom navigation controls.    |

```vue
<VfForm stepped :back="false" :progress="false">
  <!-- ... -->
</VfForm>
```

### Positioning the Navigation

The `navPos` prop aligns the navigation bar: `'left'`, `'center'`, or `'right'` pack the buttons to that side, `'fluid'` stretches them across the full width, and the default `'auto'` keeps the theme's layout — back on the left, next/finish on the right.

```vue
<VfForm stepped nav-pos="right">
  <!-- ... -->
</VfForm>
```

## Programmatic Navigation

The form's [Context](/guide/context) exposes the active pager — steps or tabs, whichever mode is on — as `pager`:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  // ...
})

const [MyForm, form$] = useForm({
  schema,
  stepped: true,
})

const goToNext = () => form$?.pager.next()
const goBack = () => form$?.pager.back()
const goToStep = (name: string) => form$?.pager.select(name)
</script>

<template>
  <MyForm />
</template>
```

```vue [Template]
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')

const goToNext = () => form$.value?.pager.next()
const goBack = () => form$.value?.pager.back()
const goToStep = (name: string) => form$.value?.pager.select(name)
</script>

<template>
  <VfForm ref="form$" stepped>
    <!-- ... -->
  </VfForm>
</template>
```

:::

### Pager API

The pager's methods:

| Method                             | Description                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `select(name)`                     | Selects a page by name or index.                         |
| `next()`                           | Validates the current page and advances to the next one. |
| `back()`                           | Returns to the previous page.                            |
| `finish()`                         | Validates all enabled pages and submits the form.        |
| `reset()`                          | Resets to the first page and unvalidates all pages.      |
| `enableUntil(name)`                | Enables all pages up to the given name or index.         |
| `revertTo(name)`                   | Reverts to a page, unvalidating every page after it.     |
| `getPage(name)`                    | Returns the resolved page object for a name or index.    |
| `on(event, cb)` / `off(event, cb)` | Subscribes to / unsubscribes from pager events.          |

And its reactive properties:

| Property                    | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| `page`                      | The name of the currently selected page.                    |
| `oldPage`                   | The name of the previously selected page.                   |
| `index`                     | The zero-based index of the current page.                   |
| `active`                    | Whether the pager is active.                                |
| `pages`                     | Array of resolved page objects with state and methods.      |
| `currentPage`               | The currently selected page object.                         |
| `nextPage` / `previousPage` | The adjacent available pages, or `undefined`.               |
| `lastPage`                  | The name of the last available page.                        |
| `loading`                   | Whether any page is busy validating or processing an event. |
| `invalid`                   | Whether any page has validation errors.                     |

Each entry in `pages` is a **resolved page** carrying its `name`, `label`, `meta`, `index`, and state flags (`available`, `selected`, `enabled`, `completed`, `invalid`, `loading`), plus methods like `select()` and `validate()` — the same objects the [slots](#customizing-with-slots) receive.

## Scroll Behavior

Vueform handles scrolling and focus around navigation and validation automatically. Three props control it.

### Scroll to Error

When validation fails, `scrollToError` (default `true`) scrolls the browser to the first element with an error — selecting that element's page first if it's on a different one. The scroll fires only when validation actually runs for the triggering action: in stepped forms on `next`, `back`, and submit (Finish triggers submit); in tabbed forms on submit only.

```vue
<VfForm stepped :scroll-to-error="false">
  <!-- ... -->
</VfForm>
```

### Focus on Error

`focusError` (default `true`) goes one further: it scrolls to the first element with an error **and** focuses it — or its first focusable descendant. The trigger rules are the same as `scrollToError`'s, and when both are enabled, `focusError` wins (focusing already scrolls the target into view).

```vue
<VfForm stepped :focus-error="false">
  <!-- ... -->
</VfForm>
```

### Scroll to Top

`scrollTopOn` controls when the form scrolls back to its own top. It accepts an array of triggers:

| Value       | Scrolls to top when                    |
| ----------- | -------------------------------------- |
| `'always'`  | Any of the events below fires.         |
| `'next'`    | The user advances to the next step.    |
| `'back'`    | The user returns to the previous step. |
| `'success'` | The form is submitted successfully.    |
| `'error'`   | Submission fails validation.           |

The default is `['always']`.

```vue
<VfForm stepped :scroll-top-on="['success', 'error']">
  <!-- ... -->
</VfForm>
```

::: warning
When `scrollTopOn` includes `'error'` but `scrollToError` or `focusError` is also active, the error-element behavior takes priority — the form scrolls to (or focuses) the offending element instead of its own top. The `'error'` trigger only fires as a fallback when neither can locate an element with an error.
:::

All three behaviors share `scrollOptions`, which is forwarded to the underlying [`scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) call and defaults to `{ behavior: 'smooth' }`:

```vue
<VfForm
  stepped
  :scroll-options="{ behavior: 'auto', block: 'center' }"
>
  <!-- ... -->
</VfForm>
```

## Browser History

By default, step transitions don't touch the URL — the browser's back button leaves the page. Set the `history` prop and each transition pushes a history entry instead, so back and forward move between steps:

::: code-group

```ts [Schema]
const [MyForm] = useForm({ schema, stepped: true,
  history: true,
})
```

```vue [Template]
<VfForm stepped history>
  <!-- ... -->
</VfForm>
```

:::

Without a router, this uses `history.pushState` — the URL itself doesn't change, but navigation state does.

::: tip
History integration is a stepped-form feature. Tabbed forms don't use it.
:::

### Vue Router Integration

When the app uses [vue-router](https://router.vuejs.org/), Vueform detects it automatically and `history` upgrades to real routes: each step transition pushes the step's name as the **last path segment** (`/signup/personal` → `/signup/contact`), and navigating to such a URL — back button, forward button, or a direct link — selects the matching step.

To encode the step as a **query parameter** instead of a path segment, set `routerQueryParam` on the form (or `queryParam` in the global `$router` config):

```vue
<VfForm stepped history router-query-param="step">
  <!-- results in URLs like /signup?step=contact -->
</VfForm>
```

The integration can be tuned globally in `createVueform`:

```ts
createVueform({
  // pass a specific router instance, or `false` to opt out
  // of auto-detection and stay on plain pushState:
  router: false,

  $router: {
    // default query parameter for every stepped form:
    queryParam: 'step',
  },
})
```

## Events

Navigation fires events on the form. All of them receive the **new page**, the **old page** (both [resolved page](#pager-api) objects), the **pager**, and the form [Context](/guide/context) — and every `before*` event can cancel the action by returning `false` (or a promise resolving to `false`).

### Tab Events

| Event       | Fires when                                               |
| ----------- | -------------------------------------------------------- |
| `tab`       | The active tab changed.                                  |
| `beforeTab` | Before the active tab changes. Return `false` to cancel. |

::: code-group

```ts [Schema]
import { defineSchema, useForm, type Pager, type ResolvedPage, type FormContext } from '@vueform/ui'

const schema = defineSchema({
  // ...
})

const [MyForm] = useForm({
  schema,
  tabbed: true,
  onTab: (newPage: ResolvedPage, oldPage: ResolvedPage, pager: Pager, form$: FormContext) => {
    console.log(`Switched from ${oldPage.name} to ${newPage.name}`)
  },
  onBeforeTab: async (newPage: ResolvedPage) => {
    const allowed = await checkPermission(newPage.name)
    if (!allowed) return false
  },
})
```

```vue [Template]
<script setup lang="ts">
import { type Pager, type ResolvedPage, type FormContext } from '@vueform/ui'

const handleTab = (newPage: ResolvedPage, oldPage: ResolvedPage, pager: Pager, form$: FormContext) => {
  console.log(`Switched from ${oldPage.name} to ${newPage.name}`)
}

const handleBeforeTab = async (newPage: ResolvedPage) => {
  const allowed = await checkPermission(newPage.name)
  if (!allowed) return false
}
</script>

<template>
  <VfForm
    tabbed
    @tab="handleTab"
    @before-tab="handleBeforeTab"
  >
    <!-- ... -->
  </VfForm>
</template>
```

:::

Tabbed **groups** emit the same `tab` / `beforeTab` pair — see [Tabbed Groups](/guide/form-structure#tabbed-groups).

### Step Events

| Event        | Fires when                                                    |
| ------------ | ------------------------------------------------------------- |
| `step`       | The active step changed — by Next, Back, or direct selection. |
| `next`       | The user advanced to the next step.                           |
| `back`       | The user returned to the previous step.                       |
| `beforeStep` | Before the active step changes. Return `false` to cancel.     |
| `beforeNext` | Before advancing. Return `false` to cancel.                   |
| `beforeBack` | Before going back. Return `false` to cancel.                  |

::: code-group

```ts [Schema]
import { defineSchema, useForm, type Pager, type ResolvedPage, type FormContext } from '@vueform/ui'

const schema = defineSchema({
  // ...
})

const [MyForm] = useForm({
  schema,
  stepped: true,
  onNext: (newPage: ResolvedPage, oldPage: ResolvedPage, pager: Pager, form$: FormContext) => {
    console.log('Moved to step:', newPage.name)
  },
  onBeforeNext: async () => {
    if (!canProceed()) return false
  },
})
```

```vue [Template]
<script setup lang="ts">
import { type Pager, type ResolvedPage, type FormContext } from '@vueform/ui'

const handleNext = (newPage: ResolvedPage, oldPage: ResolvedPage, pager: Pager, form$: FormContext) => {
  console.log('Moved to step:', newPage.name)
}

const handleBeforeNext = async () => {
  if (!canProceed()) return false
}
</script>

<template>
  <VfForm
    stepped
    @next="handleNext"
    @before-next="handleBeforeNext"
  >
    <!-- ... -->
  </VfForm>
</template>
```

:::

The ordering matters for what you can rely on in each handler: `before*` events run **before** validation and before the page changes — cancelling prevents both. The plain `next` / `back` events fire only **after** the action succeeded, including its validation, and `step` fires alongside them on every page change.

Async `before*` handlers also lock the UI while they're pending: the pager enters a **loading state** — the current step's indicator shows it, the Next and Finish buttons are disabled, and clicks on the step or tab headers are ignored. The user stays put until the handler resolves, and the action can't be double-triggered — no extra spinner or guard needed on your side.

## Loading Data

When a stepped form starts out with data — via `v-model`, a bound [Model](/guide/model), or `modelValue` — Vueform enables steps up to the last one that has values and selects it. A user resuming a half-completed form continues where they left off instead of clicking through steps they already filled:

::: usage

```vue [Preview]
<VfForm
  stepped
  :model-value="{ name: 'John', email: 'john@example.com' }"
>
  <VfText name="name" label="Name" page="Personal" />
  <VfText name="email" label="Email" page="Contact" />
  <VfCheckbox name="terms" text="I agree" page="Review" />
</VfForm>
```

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'

const data = ref({
  name: 'John',
  email: 'john@example.com',
})
</script>

<template>
  <VfForm v-model="data" stepped>
    <VfText name="name" label="Name" page="Personal" />
    <VfText name="email" label="Email" page="Contact" />
    <VfCheckbox name="terms" text="I agree" page="Review" />
  </VfForm>
</template>
```

```vue [Live]
<VfForm stepped :model-value="{ name: 'John', email: 'john@example.com' }" :history="false">
  <VfText name="name" label="Name" page="Personal" />
  <VfText name="email" label="Email" page="Contact" />
  <VfCheckbox name="terms" text="I agree" page="Review" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm, useModel } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name', page: 'Personal' },
  email: { type: 'text', label: 'Email', page: 'Contact' },
  terms: { type: 'checkbox', text: 'I agree', page: 'Review' },
})

const model = useModel({ schema }, {
  name: 'John',
  email: 'john@example.com',
})

const [Form] = useForm({ schema, stepped: true }, model)
</script>

<template>
  <Form />
</template>
```

:::

The form loads on the _Contact_ step — the last one with data — with _Personal_ already enabled behind it.

This sync happens once, on mount, and is controlled by the `syncSteps` prop (default `true`). Set it to `false` for full manual control over the starting step:

```vue
<VfForm stepped :sync-steps="false">
  <!-- ... -->
</VfForm>
```

If data arrives **after** mount — loaded from an API, pushed into an attached model — call `syncSteps()` on the form context to re-run the sync on demand. It works with the prop disabled too:

```ts
const [MyForm, form$, formReady] = useForm({ schema, stepped: true }, model)

formReady(async (form$) => {
  form$.load(await fetchDraft())
  form$.syncSteps()
})
```

## Saving Progress

The natural counterpart to resuming: persisting the user's progress as they move between steps, instead of waiting for the final submit.

For declarative persistence, use the form's built-in **autosave** — one prop configuring an endpoint, with `on: ['step']` saving on every step change (and `local: true` keeping a browser-side draft). That whole feature has its own chapter: see [Autosaving Forms](/guide/autosave), and in particular [Saving on Page Navigation](/guide/autosave#saving-on-page-navigation).

For full manual control — custom requests, saving only part of the data, blocking navigation until the save succeeds — hook into the navigation events directly. The `step` event covers every navigation (Next, Back, and direct selection), so one handler is enough:

::: code-group

```ts [Schema]
import { defineSchema, useForm, useHttp, type Pager, type ResolvedPage, type FormContext } from '@vueform/ui'

const schema = defineSchema({
  // ...
})

const $http = useHttp()

const saveProgress = async (
  newPage: ResolvedPage,
  oldPage: ResolvedPage,
  pager: Pager,
  form$: FormContext,
) => {
  await $http.request({
    url: '/api/draft',
    method: 'POST',
    data: form$.payload,
  })
}

const [MyForm] = useForm({
  schema,
  stepped: true,
  onStep: saveProgress,
})
```

```vue [Template]
<script setup lang="ts">
import { useHttp, type Pager, type ResolvedPage, type FormContext } from '@vueform/ui'

const $http = useHttp()

const saveProgress = async (
  newPage: ResolvedPage,
  oldPage: ResolvedPage,
  pager: Pager,
  form$: FormContext,
) => {
  await $http.request({
    url: '/api/draft',
    method: 'POST',
    data: form$.payload,
  })
}
</script>

<template>
  <VfForm stepped @step="saveProgress">
    <!-- ... -->
  </VfForm>
</template>
```

:::

A few variations:

- **Only forward moves** — listen to `next` instead. It fires only after the step's validation passed, so you only ever save valid data. Don't combine it with `step` though: `step` fires on those navigations too, and the save would run twice.
- **Only the page being left** — read that page's data from its element context instead of the whole form:

  ```ts
  const saveLeftPage = (newPage: ResolvedPage, oldPage: ResolvedPage) => {
    return $http.request({
      url: '/api/draft',
      method: 'POST',
      data: {
        step: oldPage.name,
        data: oldPage.el$?.payload,
      },
    })
  }
  ```

- **Block navigation until the save succeeds** — use `beforeNext` / `beforeBack` and return `false` on failure. They run before the page changes, so a failed save keeps the user where they are:

  ```ts
  const onBeforeNext = async (
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    form$: FormContext,
  ) => {
    try {
      await $http.request({
        url: '/api/draft',
        method: 'POST',
        data: form$.payload,
      })
    } catch {
      return false
    }
  }
  ```

## Customizing with Slots

Every part of the paging UI is replaceable through [Slots](/guide/slots), at two levels of granularity — one slot swaps a whole region, a finer one customizes the pieces inside it while keeping the default wrapper and its accessibility wiring:

| Region         | Replace wholesale | Customize the pieces                                                                                   |
| -------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| Tab bar        | `#tabs`           | `#tab`                                                                                                 |
| Step indicator | `#steps`          | `#step`                                                                                                |
| Navigation bar | `#nav`            | `#back` / `#next` / `#finish` (whole buttons), `#back-text` / `#next-text` / `#finish-text` (labels only) |

The wholesale slots receive the `pager`, so a custom bar drives navigation through the [Pager API](#pager-api). The piece slots receive their resolved state: a tab or step gets `label`, `index`, `selected`, `invalid`, and `meta` from [Page Metadata](#page-metadata) (steps add `enabled` and `completed`), a button gets its `label`, `disabled`, `loading`, and its action to call (`next`, `back`, or `finish`). For example, numbering the steps and checking off completed ones:

<!--@include: @/components/VfForm.md#usage-custom-steps-example-->

The rest of the examples — custom tabs, replaced navigation bars, button overrides — live on the [VfForm](/components/VfForm) reference page, with each slot's exact props under its Slots tab. In schemas, slots are passed via the `slots` option using [`defineSlot`](/guide/slots#defineslot) — see [Slots](/guide/slots) for the mechanism.
