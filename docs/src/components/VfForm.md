# VfForm

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

A form with a few elements and a submit button.

::: usage

```vue [Preview]
<VfForm>
  <VfText name="name" label="Name" />
  <VfText name="email" label="Email" />
  <VfButton name="submit" text="Submit" action="submit" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
  submit: { type: 'button', text: 'Submit', action: 'submit' },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-basic -->

<!-- #region usage-stepped -->

## Stepped

The `stepped` prop turns the form into a multi-step wizard with a progress indicator and navigation buttons. Each direct child with a `page` prop becomes a step. The `progress`, `nav`, and `back` props control the visibility of the progress bar, navigation buttons, and back button respectively. Use `nextLabel`, `backLabel`, and `finishLabel` to customize button text. See [Multi-Page Forms](/guide/multi-page-forms) for details.

::: usage w-xl

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
    <VfCheckbox name="terms" text="I accept the terms" />
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
        text: 'I accept the terms',
      },
    },
  },
})

const [MyForm] = useForm({
  schema,
  stepped: true,
  hideErrors: true,
})
</script>

<template>
  <MyForm />
</template>
```

:::

<!-- #endregion usage-stepped -->

<!-- #region usage-tabbed -->

## Tabbed

The `tabbed` prop renders direct children as freely navigable tabs. Each child's `page` prop sets the tab label. Unlike stepped forms, any tab can be selected at any time. See [Multi-Page Forms](/guide/multi-page-forms) for details.

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

const [MyForm] = useForm({ schema, tabbed: true })
</script>

<template>
  <MyForm />
</template>
```

:::

<!-- #endregion usage-tabbed -->

<!-- #region usage-custom-tabs -->

## Custom Tabs

The `#tab` slot customizes each tab's content while keeping the default tab bar, buttons, and accessibility wiring. It receives the resolved page's state — `label`, `index`, `selected`, `invalid`, `loading`, and `meta` from the `page` prop's tuple form.

::: usage

```vue [Preview]
<VfForm tabbed>
  <template #tab="{ label, index }">
    {{ index + 1 }}. {{ label }}
  </template>
  <VfGroup name="general" page="General">
    <VfText name="name" label="Name" />
  </VfGroup>
  <VfGroup name="profile" page="Profile">
    <VfText name="bio" label="Bio" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const schema = defineSchema({
  general: {
    type: 'group',
    page: 'General',
    schema: {
      name: { type: 'text', label: 'Name' },
    },
  },
  profile: {
    type: 'group',
    page: 'Profile',
    schema: {
      bio: { type: 'text', label: 'Bio' },
    },
  },
})

const [MyForm] = useForm({
  schema,
  tabbed: true,
  slots: {
    tab: defineSlot('VfForm.tab', {
      props: ['label', 'index'],
      setup: (props) => () => `${props.index + 1}. ${props.label}`,
    }),
  },
})
</script>

<template>
  <MyForm />
</template>
```

:::

To replace the entire tab bar, use the `#tabs` slot instead. It receives the `pager` — render anything and drive navigation through its pages:

::: usage nolive

```vue [Preview]
<VfForm tabbed>
  <template #tabs="{ pager }">
    <div class="custom-tabs">
      <button
        v-for="page in pager.pages"
        :key="page.name"
        :class="{ active: page.selected }"
        @click="page.select()"
      >
        {{ page.label }}
      </button>
    </div>
  </template>
  <VfGroup name="general" page="General">
    <VfText name="name" label="Name" />
  </VfGroup>
  <VfGroup name="profile" page="Profile">
    <VfText name="bio" label="Bio" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const schema = defineSchema({
  general: {
    type: 'group',
    page: 'General',
    schema: {
      name: { type: 'text', label: 'Name' },
    },
  },
  profile: {
    type: 'group',
    page: 'Profile',
    schema: {
      bio: { type: 'text', label: 'Bio' },
    },
  },
})

const [MyForm] = useForm({
  schema,
  tabbed: true,
  slots: {
    tabs: defineSlot('VfForm.tabs', {
      props: ['pager'],
      setup: (props) => () =>
        h('div', { class: 'custom-tabs' },
          props.pager.pages.map((page) =>
            h('button', {
              key: page.name,
              class: { active: page.selected },
              onClick: () => page.select(),
            }, page.label)
          )
        ),
    }),
  },
})
</script>

<template>
  <MyForm />
</template>
```

:::

<!-- #endregion usage-custom-tabs -->

<!-- #region usage-custom-steps -->

## Custom Steps

The stepped counterparts work the same way: `#step` customizes each indicator inside the default `VfSteps` wrapper, `#steps` replaces the whole progress bar (receiving the `pager`). On top of the tab slot props, `#step` also receives `enabled` and `completed` — here numbering the steps and checking off completed ones:

<!-- #region usage-custom-steps-example -->

::: usage w-xl

```vue [Preview]
<VfForm stepped hide-errors>
  <template #step="{ label, index, completed }">
    {{ completed ? '✓' : index + 1 }}. {{ label }}
  </template>
  <VfGroup name="personal" page="Personal">
    <VfText name="first_name" label="First name" />
  </VfGroup>
  <VfGroup name="contact" page="Contact">
    <VfText name="email" label="Email" />
  </VfGroup>
  <VfGroup name="review" page="Review">
    <VfCheckbox name="terms" text="I accept the terms" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const schema = defineSchema({
  personal: {
    type: 'group',
    page: 'Personal',
    schema: {
      first_name: { type: 'text', label: 'First name' },
    },
  },
  contact: {
    type: 'group',
    page: 'Contact',
    schema: {
      email: { type: 'text', label: 'Email' },
    },
  },
  review: {
    type: 'group',
    page: 'Review',
    schema: {
      terms: { type: 'checkbox', text: 'I accept the terms' },
    },
  },
})

const [MyForm] = useForm({
  schema,
  stepped: true,
  hideErrors: true,
  slots: {
    step: defineSlot('VfForm.step', {
      props: ['label', 'index', 'completed'],
      setup: (props) => () =>
        `${props.completed ? '✓' : props.index + 1}. ${props.label}`,
    }),
  },
})
</script>

<template>
  <MyForm />
</template>
```

:::

<!-- #endregion usage-custom-steps-example -->

<!-- #endregion usage-custom-steps -->

<!-- #region usage-custom-nav -->

## Custom Navigation

Each navigation button has a pair of slots: `#back` / `#next` / `#finish` replace the whole button, while `#backText` / `#nextText` / `#finishText` swap only the label inside the default button — keeping its styling, disabled, and loading behavior:

::: usage w-xl

```vue [Preview]
<VfForm stepped hide-errors>
  <template #nextText="{ pager }">
    Continue ({{ pager.index + 1 }}/{{ pager.pages.length }})
  </template>
  <template #finishText>
    Complete
  </template>
  <VfGroup name="personal" page="Personal">
    <VfText name="first_name" label="First name" />
  </VfGroup>
  <VfGroup name="contact" page="Contact">
    <VfText name="email" label="Email" />
  </VfGroup>
  <VfGroup name="review" page="Review">
    <VfCheckbox name="terms" text="I accept the terms" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const schema = defineSchema({
  personal: {
    type: 'group',
    page: 'Personal',
    schema: {
      first_name: { type: 'text', label: 'First name' },
    },
  },
  contact: {
    type: 'group',
    page: 'Contact',
    schema: {
      email: { type: 'text', label: 'Email' },
    },
  },
  review: {
    type: 'group',
    page: 'Review',
    schema: {
      terms: { type: 'checkbox', text: 'I accept the terms' },
    },
  },
})

const [MyForm] = useForm({
  schema,
  stepped: true,
  hideErrors: true,
  slots: {
    nextText: defineSlot('VfForm.nextText', {
      props: ['pager'],
      setup: (props) => () =>
        `Continue (${props.pager.index + 1}/${props.pager.pages.length})`,
    }),
    finishText: defineSlot('VfForm.finishText', {
      setup: () => () => 'Complete',
    }),
  },
})
</script>

<template>
  <MyForm />
</template>
```

:::

To replace the entire navigation bar, use the `#nav` slot — it receives the `pager` plus the resolved button labels and visibility props:

::: usage nolive

```vue [Preview]
<VfForm stepped>
  <template #nav="{ pager }">
    <div class="custom-nav">
      <button @click="pager.back()">Back</button>
      <button
        v-if="pager.nextPage"
        @click="pager.next()"
      >
        Next
      </button>
      <button v-else @click="pager.finish()">
        Submit
      </button>
    </div>
  </template>
  <VfGroup name="personal" page="Personal">
    <VfText name="first_name" label="First name" />
  </VfGroup>
  <VfGroup name="contact" page="Contact">
    <VfText name="email" label="Email" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const schema = defineSchema({
  personal: {
    type: 'group',
    page: 'Personal',
    schema: {
      first_name: { type: 'text', label: 'First name' },
    },
  },
  contact: {
    type: 'group',
    page: 'Contact',
    schema: {
      email: { type: 'text', label: 'Email' },
    },
  },
})

const [MyForm] = useForm({
  schema,
  stepped: true,
  slots: {
    nav: defineSlot('VfForm.nav', {
      props: ['pager'],
      setup: (props) => () =>
        h('div', { class: 'custom-nav' }, [
          h('button', { onClick: () => props.pager.back() }, 'Back'),
          props.pager.nextPage
            ? h('button', { onClick: () => props.pager.next() }, 'Next')
            : h('button', { onClick: () => props.pager.finish() }, 'Submit'),
        ]),
    }),
  },
})
</script>

<template>
  <MyForm />
</template>
```

:::

<!-- #endregion usage-custom-nav -->

<!-- #region usage-multilingual -->

## Multilingual

The `multilingual` prop renders a language switcher above the form. The `languages` prop defines the available languages as a `{ code: label }` map. Elements with `translate` store per-language values in the model. See [Multilingual Inputs](/guide/multilingual-inputs) for details.

::: usage model

```vue [Preview]
<VfForm
  multilingual
  :languages="{ en_US: 'English', fr_FR: 'Français' }"
>
  <VfText name="title" label="Title" translate />
  <VfTextarea name="body" label="Body" translate />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  title: {
    type: 'text',
    label: 'Title',
    translate: true,
  },
  body: {
    type: 'textarea',
    label: 'Body',
    translate: true,
  },
})

const [MyForm] = useForm({
  schema,
  multilingual: true,
  languages: { en_US: 'English', fr_FR: 'Français' },
})
</script>

<template>
  <MyForm />
</template>
```

:::

<!-- #endregion usage-multilingual -->
<!-- #endregion usage -->
<!-- @endtab -->

<!-- @tab Props -->

## Props

<!-- @props-intro-start -->

Configure the component's behavior and appearance with these props.
<!-- @props-intro-end -->

<!-- @props-start -->
<!-- @collapsible -->

### General {#props-general}

| Prop | Default | Description |
| --- | --- | --- |
| [`name`](!code#props.name "string") | — | Optional name identifying this form instance in DevTools and debugging. |
| [`schema`](!code#props.schema "MaybeRef<TSchema>") | — | The schema defining the form's elements and structure. |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`loading`](!code#props.loading "boolean") | `false` | Whether the form is in a loading state. |
| [`stacked`](!code#props.stacked "boolean") | `false` | Whether to render child elements in a stacked (wrapped row) layout. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Component {#props-form}

| Prop | Default | Description |
| --- | --- | --- |
| [`multilingual`](!code#props.multilingual "boolean") | `false` | Whether the form supports multilingual content. |
| [`validationSchema`](!code#props.validationSchema "StandardSchemaV1") | — | A Standard Schema (Zod, Valibot, ArkType, …) validated against the whole form data for form-level (cross-field) validation. Issues are bucketed by path onto the matching element's validation state; unmatched / pathless issues surface as the form's root-level errors. Overrides a Standard Schema attached via `defineSchema`'s second argument. |
| [`clearCustomErrors`](!code#props.clearCustomErrors "boolean") | `true` | Whether to clear custom/server errors on revalidation. |
| [`errorLevel`](!code#props.errorLevel "ErrorLevelProp") | `'all'` | Controls where validation errors are displayed (element-level, form-level, or both). |
| [`stepped`](!code#props.stepped "boolean") | `false` | Whether the form uses a multi-step wizard layout. |
| [`progress`](!code#props.progress "boolean") | `true` | Whether to show a progress bar in stepped forms. |
| [`nav`](!code#props.nav "boolean") | `true` | Whether to show step navigation in stepped forms. |
| [`navPos`](!code#props.navPos "NavPosProp") | `'auto'` | The alignment of the step navigation buttons: `'left'`, `'center'`, `'right'`, `'fluid'` (stretched to full width), or `'auto'`. |
| [`syncSteps`](!code#props.syncSteps "boolean") | `true` | Whether to automatically sync step state when data is loaded or the form mounts with pre-filled data. When enabled, steps are enabled up to the last step that has data and that step is selected. |
| [`history`](!code#props.history "boolean") | `false` | Whether to enable browser history for stepped forms. |
| [`routerQueryParam`](!code#props.routerQueryParam "string") | — | Overrides the global `config.routerQueryParam` for this form. When set, step names are encoded as a query parameter instead of a path segment. |
| [`back`](!code#props.back "boolean") | `true` | Whether to show the back button in stepped forms. |
| [`nextLabel`](!code#props.nextLabel "TProp<string, TContext>") | — | The label for the next step button. |
| [`backLabel`](!code#props.backLabel "TProp<string, TContext>") | — | The label for the back step button. |
| [`finishLabel`](!code#props.finishLabel "TProp<string, TContext>") | — | The label for the finish/submit button in stepped forms. |
| [`scrollTopOn`](!code#props.scrollTopOn "ScrollTopOnProp") | `['always']` | Events that trigger scrolling to the top of the form. |
| [`scrollToError`](!code#props.scrollToError "boolean") | `true` | Whether to scroll to the first element with an error on validation failure. |
| [`scrollOptions`](!code#props.scrollOptions "ScrollIntoViewOptions") | `{ behavior: 'smooth' }` | Options passed to `scrollIntoView` when scrolling. |
| [`focusError`](!code#props.focusError "boolean") | `true` | Whether to focus the first element with an error on validation failure. |
| [`autosave`](!code#props.autosave "AutosaveProp") | — | The autosave configuration object: a remote `endpoint` (URL or handler function) with its scheduling options (`on`, `interval`, `delay`, `invalid`, `method`, `transform`), and/or a `local` draft mirror that saves the model to storage on every action, restores it on mount, and clears it on successful submit. |
| [`submits`](!code#props.submits "boolean") | `false` | Whether the form should display a default submit button |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the form is disabled. Accepts a boolean, a ref, or a conditional prop. |
| [`readonly`](!code#props.readonly "ConditionalProp<TContext>") | — | Whether the form is in read-only mode. Accepts a boolean, a ref, or a conditional prop. |
| [`method`](!code#props.method "RequestMethod") | `'POST'` | The HTTP method for form submission (e.g. POST, PUT). |
| [`endpoint`](!code#props.endpoint "EndpointProp") | — | The URL or async function handling form submission. |
| [`redirect`](!code#props.redirect "TProp<string, TContext>") | — | URL to redirect to after successful submission. |
| [`successMessage`](!code#props.successMessage "TProp<string, TContext>") | — | Message displayed after successful form submission. |
| [`resetOnSuccess`](!code#props.resetOnSuccess "boolean") | `false` | Whether to reset the form after successful submission. |
| [`clearOnSuccess`](!code#props.clearOnSuccess "boolean") | `false` | Whether to clear the form after successful submission. |
| [`setInvalid`](!code#props.setInvalid "boolean") | `false` | Whether to set validation errors on elements from a 422 server response. |
| [`setResponse`](!code#props.setResponse "boolean") | `false` | Whether to update form data with the server response data. |
| [`json`](!code#props.json "boolean") | `false` | Whether to send form data as JSON instead of FormData. |
| [`base64`](!code#props.base64 "boolean") | `false` | Whether to encode file uploads as base64. |
| [`headers`](!code#props.headers "Record<string, string>") | — | Custom HTTP headers to include in the submission request. |
| [`consts`](!code#props.consts "Record<string, TProp>") | — | Form-level expression constants. Each value is a TProp that is resolved and merged into the expression evaluation scope. Names already registered in `config.$expression.consts` keep the config value — the form-level entry is ignored. |
| [`dark`](!code#props.dark "boolean") | — | Forces the form into dark or light mode regardless of the environment.<br><br>**Requires `build.scopedDarkMode: true` in the `createVueform` config.** |
| [`transformServerInvalid`](!code#props.transformServerInvalid "(data: Record<string, any>, context$: any) => Record<string, any>") | — | Transforms the server's validation error response. |
| [`transformResponse`](!code#props.transformResponse "(data: any, context$: any) => Record<string, any>") | — | Transforms the server response data when `setResponse` is enabled. |
| [`tabbed`](!code#props.tabbed "boolean") | `false` | Whether to render the form in a tabbed layout. |

### I18n {#props-i18n}

| Prop | Default | Description |
| --- | --- | --- |
| [`language`](!code#props.language "string") | — | The default selected language. |
| [`languages`](!code#props.languages "LanguagesProp") | — | Available languages for multilingual forms. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "Record<string, any> \| ModelInstance<any>") | — | The form data object (v-model), or a `useModel` instance whose store the form adopts (shared data, no cloning or v-model sync). |
| [`transformPayload`](!code#props.transformPayload "(payload: Record<string, any>, context$: any) => Record<string, any>") | — | Transforms form data before submission. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`validateOn`](!code#props.validateOn "ValidateOnProp") | `['blur', 'next']` | Events that trigger form validation (e.g. blur, change, submit). |
| [`ruleMessages`](!code#props.ruleMessages "RuleMessagesProp") | — | Custom validation error messages keyed by rule name. |
| [`hideErrors`](!code#props.hideErrors "boolean") | `false` | Whether to hide form-level validation error messages. |
| [`showRequired`](!code#props.showRequired "ShowRequiredProp") | `['label']` | Where to show required field indicators (e.g. label, placeholder). |

### Conditions {#props-conditions}

| Prop | Default | Description |
| --- | --- | --- |
| [`conditionsTrigger`](!code#props.conditionsTrigger "ConditionsTriggerProp") | — | The source that triggers re-evaluation of the form's async conditional props. Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, any change in the form model re-triggers evaluation. |
| [`conditionsDebounce`](!code#props.conditionsDebounce "number") | — | The debounce delay in milliseconds applied before re-evaluating the form's async conditional props when the trigger source changes. Overrides the global `$conditions.debounce` config (default `300`). |

### Customization {#props-customization}

| Prop | Default | Description |
| --- | --- | --- |
| [`parts`](!code#props.parts "P") | — | Custom DOM attribute overrides for the component's structural parts. |
| [`class`](!code#props.class "ClassValue") | — | CSS classes to apply to the component's root element. |
| [`classes`](!code#props.classes "C") | — | Custom CSS class overrides for the component's structural parts. |
| [`reclass`](!code#props.reclass "C") | — | CSS class overrides that replace (rather than merge with) default classes. |
| [`tokens`](!code#props.tokens "ThemeTokens") | — | Token overrides applied to the form's CSS custom properties. |
| [`slots`](!code#props.slots "S") | — | Custom Vue components to use for named slots. Every component resolves it through the standard outlets pipeline (see `useOutlets`). |
| [`presets`](!code#props.presets "PresetsProp") | — | Named configuration presets to apply to the component. |
| [`template`](!code#props.template "ComponentProp \| null") | — | A custom Vue component to use as the template instead of the default. |
| [`component`](!code#props.component "ComponentProp") | — | A custom Vue component to render in the component's default slot. |

<!-- @endcollapsible -->
<!-- @props-end -->

<!-- @endtab -->
<!-- @tab Context -->

## Context

Reactive properties and methods accessible on the component's [Context](/guide/context) object.

<!-- @collapsible -->
<!-- @context-start -->
### General {#section-general}

| Name | Description |
| --- | --- |
| [`name`](!code#context.name "string \| undefined") | Optional name identifying this form instance in DevTools and debugging. |
| [`props`](!code#context.props "object") | The resolved component props with defaults applied. |

### Form {#section-form}

| Name | Description |
| --- | --- |
| [`errorsId`](!code#context.errorsId "string") | The DOM id for the form's error container element. |
| [`messagesId`](!code#context.messagesId "string") | The DOM id for the form's messages container element. |
| [`tabs`](!code#context.tabs "Pager") | Pager instance managing tab-based navigation and state. |
| [`steps`](!code#context.steps "Pager") | Pager instance managing multi-step wizard navigation and state. |
| [`submits`](!code#context.submits "number") | The number of times the form has been submitted. |
| [`pager`](!code#context.pager "Pager \| undefined") | The currently active pager (steps or tabs), or undefined if neither is active. |
| [`result`](!code#context.result "SubmitResult \| undefined") | The result object from the most recent submission attempt. |
| [`response`](!code#context.response "HttpResponse<any> \| undefined") | The HTTP response from the most recent submission. |
| [`submit()`](!code#context.submit "() => Promise<SubmitResult \| undefined>") | Validates and submits the form, returning a result describing the outcome. |
| [`abort()`](!code#context.abort "() => void") | Aborts the current in-flight submission request. |
| [`handleSubmit()`](!code#context.handleSubmit "() => Promise<SubmitResult \| undefined>") | Handles form submission triggered from the UI. |
| [`config`](!code#context.config "VueformConfig") | The resolved global configuration object. |
| [`validationDisabled`](!code#context.validationDisabled "boolean") | Whether submit-time validation is currently disabled (see `disableValidation` / `enableValidation`). |
| [`disableValidation()`](!code#context.disableValidation "() => void") | Turns off the form's built-in submit-time validation entirely — the floor that otherwise always runs regardless of `validateOn`. Deliberately a programmatic call rather than a prop: opting out of validation should be an explicit act in code, not a template flag. `enableValidation` turns it back on. |
| [`enableValidation()`](!code#context.enableValidation "() => void") | Re-enables the form's submit-time validation after `disableValidation`. |
| [`index`](!code#context.index "SchemaIndex") | The schema index describing every data-carrying element: the adopted instance's index, or an empty one for internally created stores. |
| [`resolvedConsts`](!code#context.resolvedConsts "Record<string, any> \| undefined") | Resolved form-level expression constants. Each TProp value is resolved to a primitive and made available to the expression evaluation scope. |
| [`validator`](!code#context.validator "Validator") | The validator instance the element is registered with: the form's validator, a store-attached one, or a newly created one. |
| [`issues`](!code#context.issues "Issue[]") | The form's current validation issues as reported by the validator. |
| [`toStandardSchema()`](!code#context.toStandardSchema "() => StandardSchemaV1<unknown, unknown>") | Exports the form's resolved validation as a Standard Schema. |
| [`syncSteps()`](!code#context.syncSteps "() => void") | Synchronizes step states based on which steps contain data, enabling steps up to the last one with values. |
| [`autosave()`](!code#context.autosave "(options: { invalid?: boolean \| undefined; } \| undefined) => Promise<void>") | Performs an autosave immediately: writes the local draft (when `local` is configured) and runs the remote save (when `endpoint` is configured). The validity gate applies as configured; pass `invalid` to override the config's `invalid` prop for this one call — `true` sends even while the form is invalid, `false` enforces the gate. A gated call while the form is invalid still writes the local draft and defers the remote save. |
| [`clearAutosaved()`](!code#context.clearAutosaved "() => void") | Removes the locally stored draft, if any. |
| [`loadAutosaved()`](!code#context.loadAutosaved "() => Promise<boolean>") | Loads the stored draft into the form, resolving whether a draft was found and loaded (async because a configured `$security.decrypt` may be). Unlike the automatic load on mount, a manual call fires no `autosaveRestore` pre-hook — calling it _is_ the consent. |
| [`toJSON()`](!code#context.toJSON "() => string") | Serializes the current model value to a JSON string. |
| [`toFormData()`](!code#context.toFormData "() => FormData") | Serializes the current model value to a `FormData` instance. |
| [`hasAdoptedModel`](!code#context.hasAdoptedModel "boolean") | Whether the form adopted a `useModel` instance's store (passed via `v-model` / the `modelValue` prop). |
| [`scrollToTop()`](!code#context.scrollToTop "() => void") | Scrolls the viewport to the top of the form element. |
| [`scrollToFirstError()`](!code#context.scrollToFirstError "() => Promise<any>") | Scrolls the viewport to the first element that has a validation error. |
| [`focusFirstError()`](!code#context.focusFirstError "(scroll: boolean \| undefined) => Promise<any>") | Focuses the first element that has a validation error and optionally scrolls to it. |

### Data {#section-data}

| Name | Description |
| --- | --- |
| [`model`](!code#context.model "object") | The reactive model object holding all element values. |
| [`data`](!code#context.data "object") | The full model data — an alias of `model`. |
| [`payload`](!code#context.payload "object") | The element's submission payload. Container elements aggregate from children; leaf elements return their own value. |
| [`initialModel`](!code#context.initialModel "object") | A snapshot of the model at creation time (re-snapshotted by `clean()`), used for dirty checking and reset. |
| [`update()`](!code#context.update "(data: any) => void") | Updates the element's model value. Container elements perform a deep merge; leaf elements set the value directly. |
| [`load()`](!code#context.load "(data: any) => void") | Loads data into the element and fires the `load` event, cascading to all children. |
| [`reset()`](!code#context.reset "() => void") | Resets the element to its initial model state and fires the `reset` event. |
| [`clear()`](!code#context.clear "() => void") | Clears the element to its null value and fires the `clear` event. |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`disabled`](!code#context.disabled "boolean") | Whether the form is disabled, resolved from a boolean, ref, or conditional function prop. |
| [`readonly`](!code#context.readonly "boolean") | Whether the form is in read-only mode. |
| [`dirty`](!code#context.dirty "boolean") | Whether the current model value differs from the initial model value. |
| [`submitting`](!code#context.submitting "boolean") | Whether the form is currently being submitted. |
| [`loading`](!code#context.loading "boolean") | Whether the form is in a loading state (explicit prop or busy children). |
| [`empty`](!code#context.empty "boolean") | Whether the element's current value is empty. Container elements check whether all children are empty. |
| [`busy`](!code#context.busy "boolean") | Whether the element is busy, meaning it is either debouncing or has pending async validation. |

### Validation {#section-validation}

| Name | Description |
| --- | --- |
| [`invalid`](!code#context.invalid "boolean") | Whether any of the element's validations (across all languages) are currently invalid, including children. |
| [`invalidLanguages`](!code#context.invalidLanguages "Set<string>") | Set of language codes that have validation errors across any translatable element in the form. |
| [`validated`](!code#context.validated "boolean") | Whether all of the element's validations (across all languages) have been executed, including children. |
| [`validating`](!code#context.validating "boolean") | Whether the form is currently being validated. |
| [`completed`](!code#context.completed "boolean") | Whether the element is completed, meaning it either has no rules or has been validated without errors. |
| [`pending`](!code#context.pending "boolean") | Whether any of the element's validations are currently pending an async check, including children. |
| [`debouncing`](!code#context.debouncing "boolean") | Whether any of the element's validations are currently debouncing, including children. |
| [`errors`](!code#context.errors "object") | Validation errors for all elements, keyed by element path, plus the form's own root-level errors under the `''` key (e.g. unmatched Standard Schema issues). |
| [`hasError`](!code#context.hasError "boolean") | Whether the element has any active error messages. |
| [`ruleMessages`](!code#context.ruleMessages "RuleMessagesProp \| undefined") | Custom validation error messages keyed by rule name. |
| [`messages`](!code#context.messages "string[]") | The list of custom messages from the message bag, including messages from hoisted children. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for custom errors and messages. |
| [`validate()`](!code#context.validate "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Runs validation on the element's own rules and all children, returning whether everything is valid. |
| [`invalidate()`](!code#context.invalidate "() => void") | Marks all validation instances as invalidated, requiring revalidation. |
| [`unvalidate()`](!code#context.unvalidate "() => void") | Resets all validation state, including children's. |
| [`clean()`](!code#context.clean "() => void") | Marks the element as clean by updating the initial model snapshot. |
| [`clearErrors()`](!code#context.clearErrors "() => void") | Clears all error messages from the message bag. |
| [`clearMessages()`](!code#context.clearMessages "() => void") | Clears all custom messages from the message bag. |
| [`clearMessageBag()`](!code#context.clearMessageBag "() => void") | Clears the entire message bag, removing both errors and messages. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
| [`tokens`](!code#context.tokens "CSSProperties") | Reactive inline style object with resolved theme token CSS custom properties. |
| [`tokenClass`](!code#context.tokenClass "string") | A unique CSS class scoped to this component instance, used to target the injected token style rule. |
| [`tokenCss`](!code#context.tokenCss "string") | The CSS text for scoped token custom properties on this component instance. |
| [`nonce`](!code#context.nonce "string \| undefined") | Unique security nonce for injecting scoped styles. |
| [`showErrors`](!code#context.showErrors "boolean") | Whether form-level validation errors should be displayed. |

### Tree {#section-tree}

| Name | Description |
| --- | --- |
| [`elements$`](!code#context.elements$ "ShallowReactive<Map<string, any>>") | Map of all registered form elements keyed by their path. |
| [`children$`](!code#context.children$ "ShallowReactive<Map<ElementName, any>>") | Map of all registered child components keyed by their path. |
| [`children`](!code#context.children "VueformChildren") | Registry tracking all child components of the form. `flat: true` also maintains `elements$` — every descendant keyed by full path. |
| [`resolvedSchema`](!code#context.resolvedSchema "object") | The resolved and normalized schema used to render child elements. |
| [`registerChild()`](!code#context.registerChild "(context$: any, path: string, dataPath: string \| undefined, initialModel: any) => void") | Registers a child element with the form, setting up its model and data path tracking. |
| [`unregisterChild()`](!code#context.unregisterChild "(path: string, dataPath: string \| undefined, instance: any) => void") | Unregisters a child element from the form, cleaning up its model and data path tracking. |
| [`updateChild()`](!code#context.updateChild "(dataPath: string, value: any) => void") | Updates a child element's value in the root model by its data path. |
| [`find()`](!code#context.find "(path: string) => any") | Finds a registered element by its path or data path. When the form adopted a `useModel` instance, unmounted schema elements resolve to their virtual contexts as a last resort. |
| [`findByDataPath()`](!code#context.findByDataPath "(dataPath: string) => any") | Finds a registered element by its data path. |
| [`findSiblings()`](!code#context.findSiblings "(path: string) => any[]") | Returns all sibling elements that share the same parent path. |
| [`get()`](!code#context.get "(path: string) => any") | Gets the value of an element by path, falling back to the raw model value. When the path contains a `@` separator (e.g. `name@label` or `name@nested.prop`), returns the specified property from the element context instead of its model value. |
| [`set()`](!code#context.set "(path: string, value: any) => void") | Sets the value of an element by path, or updates the raw model if the element is not found. |

### Events {#section-events}

| Name | Description |
| --- | --- |
| [`fire()`](!code#context.fire "(e: E, args: TypeEmitsToOptions<FormEmits<any>>[E]) => void") | Fires an event synchronously, invoking before, listener, and after callbacks in order and emitting a native Vue event. |
| [`fireAsync()`](!code#context.fireAsync "(e: E, args: TypeEmitsToOptions<FormEmits<any>>[E]) => Promise<any>") | Fires an event asynchronously, awaiting each callback and short-circuiting when any returns `false`. |
| [`on()`](!code#context.on "(e: E, callback: (...args: TypeEmitsToOptions<FormEmits<any>>[E]) => any) => void") | Subscribes a callback to a specific event. |
| [`off()`](!code#context.off "(e: E, callback: (...args: TypeEmitsToOptions<FormEmits<any>>[E]) => any) => void") | Removes a previously registered event callback. |

### Internationalization {#section-i18n}

| Name | Description |
| --- | --- |
| [`language`](!code#context.language "string") | The currently active language in multilingual forms. |
| [`languages`](!code#context.languages "object") | The localized map of available languages for multilingual forms. |
| [`selectLanguage()`](!code#context.selectLanguage "(lang: string) => string") | Sets the active language for multilingual forms. |

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleLanguageSelect()`](!code#context.handleLanguageSelect "(lang: string \| number) => string") | Handles language selection from the UI. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | Unique identifier for this form instance, used for accessibility attributes. |
<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->
<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/event-handlers) for details.

<!-- @events-start -->
| Name | Params | Description |
| --- | --- | --- |
| `step` | [`newPage`](!code#events.step.newPage "ResolvedPage"), [`oldPage`](!code#events.step.oldPage "ResolvedPage"), [`pager`](!code#events.step.pager "Pager"), [`context$`](!code#events.step.context$ "TContext") | Emitted when the active step changes. |
| `back` | [`newPage`](!code#events.back.newPage "ResolvedPage"), [`oldPage`](!code#events.back.oldPage "ResolvedPage"), [`pager`](!code#events.back.pager "Pager"), [`context$`](!code#events.back.context$ "TContext") | Emitted when navigating to the previous step. |
| `next` | [`newPage`](!code#events.next.newPage "ResolvedPage"), [`oldPage`](!code#events.next.oldPage "ResolvedPage"), [`pager`](!code#events.next.pager "Pager"), [`context$`](!code#events.next.context$ "TContext") | Emitted when navigating to the next step. |
| `beforeStep` | [`newPage`](!code#events.beforeStep.newPage "ResolvedPage"), [`oldPage`](!code#events.beforeStep.oldPage "ResolvedPage"), [`pager`](!code#events.beforeStep.pager "Pager"), [`context$`](!code#events.beforeStep.context$ "TContext") | Emitted before the active step changes, allowing cancellation. |
| `beforeBack` | [`newPage`](!code#events.beforeBack.newPage "ResolvedPage"), [`oldPage`](!code#events.beforeBack.oldPage "ResolvedPage"), [`pager`](!code#events.beforeBack.pager "Pager"), [`context$`](!code#events.beforeBack.context$ "TContext") | Emitted before navigating to the previous step, allowing cancellation. |
| `beforeNext` | [`newPage`](!code#events.beforeNext.newPage "ResolvedPage"), [`oldPage`](!code#events.beforeNext.oldPage "ResolvedPage"), [`pager`](!code#events.beforeNext.pager "Pager"), [`context$`](!code#events.beforeNext.context$ "TContext") | Emitted before navigating to the next step, allowing cancellation. |
| `beforeFinish` | [`pager`](!code#events.beforeFinish.pager "Pager"), [`context$`](!code#events.beforeFinish.context$ "TContext") | Emitted before the form finishes (submits from the last step), allowing cancellation. |
| `autosave` | [`payload`](!code#events.autosave.payload "Record<string, any>"), [`context$`](!code#events.autosave.context$ "TContext") | Emitted before the autosave request is sent. Return `false` to cancel, a `string` to use as the endpoint URL, or an `HttpResponse` to use as the result without making a request. |
| `autosaveRestore` | [`data`](!code#events.autosaveRestore.data "Record<string, any>"), [`context$`](!code#events.autosaveRestore.context$ "TContext") | Emitted before a locally stored autosave draft is restored into the form on mount. Return `false` to skip the restore (the stored draft is kept). |
| `autosaveSuccess` | [`response`](!code#events.autosaveSuccess.response "HttpResponse"), [`context$`](!code#events.autosaveSuccess.context$ "TContext") | Emitted after a successful autosave operation. |
| `autosaveFail` | [`error`](!code#events.autosaveFail.error "HttpError"), [`context$`](!code#events.autosaveFail.context$ "TContext") | Emitted when an autosave request fails due to a network or server error. |
| `submit` | [`payload`](!code#events.submit.payload "FormData \| Record<string, any>"), [`context$`](!code#events.submit.context$ "TContext") | Emitted when the form is submitted, before the HTTP request is sent. |
| `response` | [`response`](!code#events.response.response "HttpResponse") | Emitted when an HTTP response is received from the server. |
| `fail` | [`result`](!code#events.fail.result "SubmitFail") | Emitted when form submission fails due to a network or server error. |
| `serverInvalid` | [`result`](!code#events.serverInvalid.result "SubmitServerInvalid") | Emitted when form submission fails due to validation errors. |
| `success` | [`result`](!code#events.success.result "SubmitSuccess") | Emitted when form submission succeeds. |
| `cancelled` | [`result`](!code#events.cancelled.result "SubmitCancelled") | Emitted when form submission is cancelled before sending a request (e.g. the form is invalid, loading, disabled, already submitting, or a `submit` handler / `endpoint` function returned `false`). |
| `tab` | [`newPage`](!code#events.tab.newPage "ResolvedPage"), [`oldPage`](!code#events.tab.oldPage "ResolvedPage"), [`pager`](!code#events.tab.pager "Pager"), [`context$`](!code#events.tab.context$ "any") | Emitted when the active tab changes. |
| `beforeTab` | [`newPage`](!code#events.beforeTab.newPage "ResolvedPage"), [`oldPage`](!code#events.beforeTab.oldPage "ResolvedPage"), [`pager`](!code#events.beforeTab.pager "Pager"), [`context$`](!code#events.beforeTab.context$ "any") | Emitted before the active tab changes, allowing cancellation. |
| `change` | [`newValue`](!code#events.change.newValue "Record<string, any>"), [`oldValue`](!code#events.change.oldValue "Record<string, any>"), [`context$`](!code#events.change.context$ "TContext") | Emitted when any form element's value changes, with the new and previous values. |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "Record<string, any>") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "any"), [`context$`](!code#events.load.context$ "TContext") | Emitted when form data is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the form is reset to its default values. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the form is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the form becomes invalid due to client-side validation errors. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the form passes validation. |
| `beforeMount` | [`context$`](!code#events.beforeMount.context$ "TContext") | Emitted before the component is mounted. |
| `mounted` | [`context$`](!code#events.mounted.context$ "TContext") | Emitted after the component is mounted. |
| `beforeUnmount` | [`context$`](!code#events.beforeUnmount.context$ "TContext") | Emitted before the component is unmounted. |
| `unmounted` | [`context$`](!code#events.unmounted.context$ "TContext") | Emitted after the component is unmounted. |
| `updated` | [`context$`](!code#events.updated.context$ "TContext") | Emitted after the component is updated. |
<!-- @events-end -->

<!-- @endtab -->
<!-- @tab Slots -->

## Slots

Named [Slots](/guide/slots) for replacing parts of the component's rendering.

<!-- @slots-start -->
| Name | Scope | Description |
| --- | --- | --- |
| `template` | [`context`](!code#slot.template.context "TContext") | Slot that replaces the entire component rendering. Receives the full component context as a single `context` prop. |
| `tabs` | [`pager`](!code#slot.tabs.pager "Pager") [`bindings`](!code#slot.tabs.bindings "VfFormBindings['tabs']") | Slot that replaces the tabs navigation bar. Receives the pager instance. |
| `tab` | [`index`](!code#slot.tab.index "number") [`label`](!code#slot.tab.label "string") [`meta`](!code#slot.tab.meta "Record<string, any>") [`selected`](!code#slot.tab.selected "boolean") [`invalid`](!code#slot.tab.invalid "boolean") [`loading`](!code#slot.tab.loading "boolean") [`el$`](!code#slot.tab.el$ "UnknownElement") [`bindings`](!code#slot.tab.bindings "PartBindings<'tab', VfTabsParts, VfTabsModifiers, VfTabsA11y>") | Slot that replaces each individual tab. |
| `content` | [`Context`](#context "Full context available. Click to see") | Slot that replaces the entire form content area. Receives the form's context as a single `context` prop, like the `template` slot. |
| `languages` | [`invalidLanguages`](!code#slot.languages.invalidLanguages "Set<string>") [`languages`](!code#slot.languages.languages "LanguagesProp") [`language`](!code#slot.languages.language "string") [`select`](!code#slot.languages.select "(language: string) => void") [`bindings`](!code#slot.languages.bindings "VfFormBindings['languages']") | Slot that replaces the language selector. Receives available languages and select handler. |
| `language` | [`language`](!code#slot.language.language "string") [`languages`](!code#slot.language.languages "ResolvedLanguagesProp") [`value`](!code#slot.language.value "string") [`label`](!code#slot.language.label "string") | Slot that replaces each individual language option. |
| `steps` | [`pager`](!code#slot.steps.pager "Pager") [`bindings`](!code#slot.steps.bindings "VfFormBindings['steps']") | Slot that replaces the steps navigation bar. Receives the pager instance. |
| `step` | [`index`](!code#slot.step.index "number") [`label`](!code#slot.step.label "string") [`meta`](!code#slot.step.meta "Record<string, any>") [`selected`](!code#slot.step.selected "boolean") [`invalid`](!code#slot.step.invalid "boolean") [`loading`](!code#slot.step.loading "boolean") [`enabled`](!code#slot.step.enabled "boolean") [`completed`](!code#slot.step.completed "boolean") [`el$`](!code#slot.step.el$ "UnknownElement") [`bindings`](!code#slot.step.bindings "PartBindings<'step', VfStepsParts, VfStepsModifiers, VfStepsA11y>") | Slot that replaces each individual step indicator. |
| `error` | [`error`](!code#slot.error.error "string") [`path`](!code#slot.error.path "string") | Slot that replaces each individual error message. |
| `message` | [`message`](!code#slot.message.message "string") | Slot that replaces each individual message. |
| `elements` | [`resolvedSchema`](!code#slot.elements.resolvedSchema "ResolvedSchema") | Slot that replaces the form elements area. Receives the resolved schema. |
| `default` | [`resolvedSchema`](!code#slot.default.resolvedSchema "ResolvedSchema") | Slot for the default form body content. Receives the resolved schema. |
| `nav` | [`pager`](!code#slot.nav.pager "Pager") [`next`](!code#slot.nav.next "TProp") [`back`](!code#slot.nav.back "TProp") [`finish`](!code#slot.nav.finish "TProp") [`hideBack`](!code#slot.nav.hideBack "boolean") [`position`](!code#slot.nav.position "NavPosProp") | Slot that replaces the navigation bar. Receives pager, button labels, and visibility. |
| `back` | [`label`](!code#slot.back.label "TProp \| string \| undefined") [`pager`](!code#slot.back.pager "Pager") [`form$`](!code#slot.back.form$ "any") [`disabled`](!code#slot.back.disabled "boolean \| string \| ConditionalProp") [`fluid`](!code#slot.back.fluid "boolean") [`bindings`](!code#slot.back.bindings "VfNavBindings['back']") [`back`](!code#slot.back.back "() => Promise<void>") | Slot that replaces the back button in the navigation bar. |
| `backText` | [`label`](!code#slot.backText.label "string \| undefined") [`pager`](!code#slot.backText.pager "Pager") [`form$`](!code#slot.backText.form$ "any") | Slot that replaces the back button's text label. |
| `next` | [`label`](!code#slot.next.label "TProp \| string \| undefined") [`pager`](!code#slot.next.pager "Pager") [`form$`](!code#slot.next.form$ "any") [`disabled`](!code#slot.next.disabled "boolean \| string \| ConditionalProp") [`loading`](!code#slot.next.loading "boolean \| ConditionalProp") [`fluid`](!code#slot.next.fluid "boolean") [`bindings`](!code#slot.next.bindings "VfNavBindings['next']") [`next`](!code#slot.next.next "() => Promise<void>") | Slot that replaces the next button in the navigation bar. |
| `nextText` | [`label`](!code#slot.nextText.label "string \| undefined") [`pager`](!code#slot.nextText.pager "Pager") [`form$`](!code#slot.nextText.form$ "any") | Slot that replaces the next button's text label. |
| `finish` | [`label`](!code#slot.finish.label "TProp \| string \| undefined") [`pager`](!code#slot.finish.pager "Pager") [`form$`](!code#slot.finish.form$ "any") [`disabled`](!code#slot.finish.disabled "boolean \| string \| ConditionalProp") [`loading`](!code#slot.finish.loading "boolean \| ConditionalProp") [`fluid`](!code#slot.finish.fluid "boolean") [`bindings`](!code#slot.finish.bindings "VfNavBindings['finish']") [`finish`](!code#slot.finish.finish "() => Promise<void>") | Slot that replaces the finish button in the navigation bar. |
| `finishText` | [`label`](!code#slot.finishText.label "string \| undefined") [`pager`](!code#slot.finishText.pager "Pager") [`form$`](!code#slot.finishText.form$ "any") | Slot that replaces the finish button's text label. |
| `errors` | [`errors`](!code#slot.errors.errors "Record<string, string[]>") [`id`](!code#slot.errors.id "string") [`bindings`](!code#slot.errors.bindings "VfFormBindings['errors']") | Slot that replaces the form-level errors container. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") [`id`](!code#slot.messages.id "string") [`bindings`](!code#slot.messages.bindings "VfFormBindings['messages']") | Slot that replaces the form-level messages container. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- @parts-start -->
### `root`

The root form element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-form` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-stacked`](!code#parts.root.modifiers.data-stacked "''") |

### `languages`

Props forwarded to the nested VfLanguages component.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfLanguages>`](./VfLanguages.md) |

### `tabs`

Props forwarded to the nested VfTabs component.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfTabs>`](./VfTabs.md) |

### `steps`

Props forwarded to the nested VfSteps component.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfSteps>`](./VfSteps.md) |

### `elements`

Props forwarded to the nested VfElements component.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfElements>`](./VfElements.md) |

### `errorList`

The error list element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<ul>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-form-errors` |

### `messageList`

The message list element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<ul>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-form-messages` |

### `nav`

Props forwarded to the nested VfNav component.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfNav>`](./VfNav.md) |

### `errors`

The errors container element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-form-errors-wrapper` `.sr-only?` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`id`](!code#parts.errors.a11y.id "string") [`role`](!code#parts.errors.a11y.role "'alert'") [`aria-live`](!code#parts.errors.a11y.aria-live "'assertive'") [`aria-atomic`](!code#parts.errors.a11y.aria-atomic "'true'") [`tabindex`](!code#parts.errors.a11y.tabindex "-1") |

### `error`

Each error item element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<li>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-form-error` |

### `messages`

The messages container element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-form-messages-wrapper` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`id`](!code#parts.messages.a11y.id "string") [`role`](!code#parts.messages.a11y.role "'status'") [`aria-live`](!code#parts.messages.a11y.aria-live "'polite'") [`aria-atomic`](!code#parts.messages.a11y.aria-atomic "'true'") [`tabindex`](!code#parts.messages.a11y.tabindex "-1") |

### `message`

Each message item element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<li>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-form-message` |
<!-- @parts-end -->
<!-- @endtab -->
<!-- @tab Tokens -->

## Tokens

All the CSS variables that control this component's appearance with default values in the default theme. See [Theming Guide](/guide/theming-guide#vueform-s-token-system) for details.

<!-- @tokens-start -->
<!-- @subtabs -->
<!-- @subtab CSS -->

```css
:root {
  /**
   * Component tokens
   * -------------------------------------------------------------------------- */
  --vf-form-errors-bg: color-mix(in srgb, var(--vf-red) 10%, transparent);
  --vf-form-errors-border-color: var(--vf-red);
  --vf-form-errors-border-style: solid;
  --vf-form-errors-border-width: 1px;
  --vf-form-errors-color: var(--vf-red);
  --vf-form-errors-margin: 0 0 var(--vf-gutter) 0;
  --vf-form-errors-padding: 0.5rem 0.75rem;
  --vf-form-errors-radius: var(--vf-radius);

  --vf-form-messages-bg: color-mix(in srgb, var(--vf-green) 10%, transparent);
  --vf-form-messages-border-color: var(--vf-green);
  --vf-form-messages-border-style: solid;
  --vf-form-messages-border-width: 1px;
  --vf-form-messages-color: var(--vf-green);
  --vf-form-messages-margin: 0 0 var(--vf-gutter) 0;
  --vf-form-messages-padding: 0.5rem 0.75rem;
  --vf-form-messages-radius: var(--vf-radius);
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Component tokens
   * -------------------------------------------------------------------------- */
  formErrorsBg: 'color-mix(in srgb, $red 10%, transparent)',
  formErrorsBorderColor: '$red',
  formErrorsBorderStyle: 'solid',
  formErrorsBorderWidth: '1px',
  formErrorsColor: '$red',
  formErrorsMargin: '0 0 $gutter 0',
  formErrorsPadding: '0.5rem 0.75rem',
  formErrorsRadius: '$radius',

  formMessagesBg: 'color-mix(in srgb, $green 10%, transparent)',
  formMessagesBorderColor: '$green',
  formMessagesBorderStyle: 'solid',
  formMessagesBorderWidth: '1px',
  formMessagesColor: '$green',
  formMessagesMargin: '0 0 $gutter 0',
  formMessagesPadding: '0.5rem 0.75rem',
  formMessagesRadius: '$radius',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->
<!-- @endtab -->
<!-- @endtabs -->
