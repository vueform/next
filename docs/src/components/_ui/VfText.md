# VfText

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!-- #region usage-basic -->

## Basic

A text input with placeholder text.

::: usage

```vue [Preview]
<VfText name="name" placeholder="Enter your name" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: {
    type: 'text',
    placeholder: 'Enter your name',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-basic -->

<!-- #region usage-input-type -->

## Input Type

The `inputType` prop sets the HTML input type. Common values include `'email'`, `'password'`, `'number'`, `'url'`, `'tel'`, and `'date'`.

::: usage

```vue [Preview]
<VfText name="email" input-type="email" />
<VfText name="password" input-type="password" />
<VfText name="age" input-type="number" />
```

```vue [Template]
<VfText name="email" placeholder="Email" input-type="email" />
<VfText name="password" placeholder="Password" input-type="password" />
<VfText name="age" placeholder="Age" input-type="number" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    placeholder: 'Email',
    inputType: 'email',
  },
  password: {
    type: 'text',
    placeholder: 'Password',
    inputType: 'password',
  },
  age: {
    type: 'text',
    placeholder: 'Age',
    inputType: 'number',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-input-type -->

<!-- #region usage-icons -->

## Icons

The `iconBefore` and `iconAfter` props display [icons](/guide/element-layout#icons) inside the input. The icon class format can be [configured](/guide/configuration#icon) globally.

::: usage

```vue [Preview]
<VfText name="search" icon-before="search" />
<VfText name="email" icon-after="envelope" />
```

```vue [Template]
<VfText name="search" placeholder="Search..." icon-before="search" />
<VfText name="email" placeholder="Email" icon-after="envelope" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  search: {
    type: 'text',
    placeholder: 'Search...',
    iconBefore: 'search',
  },
  email: {
    type: 'text',
    placeholder: 'Email',
    iconAfter: 'mail',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-icons -->

<!-- #region usage-text-addons -->

## Text Addons

The `addonBefore` and `addonAfter` props render content alongside the input. When passed a string, it displays as a text addon.

::: usage

```vue [Preview]
<VfText name="url" addon-before="https://" addon-after=".com" />
<VfText name="price" placeholder="0.00" addon-before="$" />
<VfText name="size" :addon-before="['W', 'x']" addon-after="px" />
```

```vue [Template]
<VfText
  name="url"
  placeholder="example"
  addon-before="https://"
  addon-after=".com"
/>
<VfText
  name="price"
  placeholder="0.00"
  addon-before="$"
/>
<VfText
  name="size"
  placeholder="Width"
  :addon-before="['W', 'x']"
  addon-after="px"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  url: {
    type: 'text',
    placeholder: 'example',
    addonBefore: 'https://',
    addonAfter: '.com',
  },
  price: {
    type: 'text',
    placeholder: '0.00',
    addonBefore: '$',
  },
  size: {
    type: 'text',
    placeholder: 'Width',
    addonBefore: ['W', 'x'],
    addonAfter: 'px',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-text-addons -->

<!-- #region usage-element-addons -->

## Element Addons

Addons can also be element schemas, allowing interactive controls like selects, buttons, checkboxes, or radios to be embedded alongside the input.

::: usage model

```vue [Preview]
<VfText name="amount" :addon-before="{
  name: 'currency',
  type: 'select',
  default: 'usd',
  items: { usd: '$', eur: '€', gbp: '£' },
}" />

<VfText name="query" :addon-after="{
  name: 'go',
  type: 'button',
  text: 'Go',
}" />

<VfText name="domain" :addon-before="{
  name: 'www',
  type: 'checkbox',
  text: 'www.',
}" />

<VfText name="sort" :addon-after="[
  { name: 'up', type: 'radio', text: '▲', radioName: 'direction' },
  { name: 'down', type: 'radio', text: '▼', radioName: 'direction' },
]" />
```

```vue [Template]
<VfText
  name="amount"
  placeholder="0.00"
  :addon-before="{
    name: 'currency',
    type: 'select',
    default: 'usd',
    items: { usd: '$', eur: '€', gbp: '£' },
  }"
/>
<VfText
  name="query"
  placeholder="Search..."
  :addon-after="{ name: 'go', type: 'button', text: 'Go' }"
/>
<VfText
  name="domain"
  placeholder="example.com"
  :addon-before="{ name: 'www', type: 'checkbox', text: 'www.' }"
/>
<VfText
  name="sort"
  placeholder="Sort by"
  :addon-after="[
    { name: 'up', type: 'radio', text: '▲', radioName: 'direction' },
    { name: 'down', type: 'radio', text: '▼', radioName: 'direction' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  amount: {
    type: 'text',
    placeholder: '0.00',
    addonBefore: {
      name: 'currency',
      type: 'select',
      default: 'usd',
      items: { usd: '$', eur: '€', gbp: '£' },
    },
  },
  query: {
    type: 'text',
    placeholder: 'Search...',
    addonAfter: { name: 'go', type: 'button', text: 'Go' },
  },
  domain: {
    type: 'text',
    placeholder: 'example.com',
    addonBefore: { name: 'www', type: 'checkbox', text: 'www.' },
  },
  sort: {
    type: 'text',
    placeholder: 'Sort by',
    addonAfter: [
      { name: 'up', type: 'radio', text: '▲', radioName: 'direction' },
      { name: 'down', type: 'radio', text: '▼', radioName: 'direction' },
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-element-addons -->

<!-- #region usage-translatable -->

## Translatable

When the form has multiple [languages](/guide/multilingual-inputs) configured, the text input can hold per-language values. The default can be provided as a locale-keyed object.

::: usage model

```vue [Preview]
<VfText name="title" translate :languages="{
  en: 'English',
  de: 'German',
  fr: 'French',
}"
/>
```

```vue [Template]
<VfText
  name="title"
  translate
  :languages="{ en: 'English', de: 'German', fr: 'French' }"
  :default="{ en: 'Hello', de: 'Hallo', fr: 'Bonjour' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  title: {
    type: 'text',
    translate: true,
    languages: { en: 'English', de: 'German', fr: 'French' },
    default: { en: 'Hello', de: 'Hallo', fr: 'Bonjour' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-translatable -->

<!-- #region usage-hint-text -->

## Hint Text

The `hint` prop displays advisory text below the input. Use it to provide contextual guidance to the user.

::: usage

```vue [Preview]
<VfText name="username" hint="Letters, numbers and underscores only." />
```

```vue [Template]
<VfText
  name="username"
  label="Username"
  placeholder="Choose a username"
  hint="Letters, numbers and underscores only."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    placeholder: 'Choose a username',
    hint: 'Letters, numbers and underscores only.',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-hint-text -->

<!-- #region usage-help-text -->

## Help Text

The `help` prop displays advisory text below the label. Unlike `hint` (which appears below the input), `help` is positioned directly under the label.

::: usage

```vue [Preview]
<VfText name="email" help="We'll never share your email with anyone." />
```

```vue [Template]
<VfText
  name="email"
  label="Email"
  placeholder="you@example.com"
  help="We'll never share your email with anyone."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    placeholder: 'you@example.com',
    help: "We'll never share your email with anyone.",
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-help-text -->

<!-- #region usage-horizontal-label -->

## Horizontal Label

The `columns` prop controls the responsive grid layout. Setting `columns.label` places the label and input side by side in a horizontal arrangement.

::: usage

```vue [Preview]
<VfText name="username" label="Username" :columns="{ label: 4 }" />
```

```vue [Template]
<VfText
  name="username"
  label="Username"
  placeholder="Enter your username"
  :columns="{ label: 4 }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    placeholder: 'Enter your username',
    columns: { label: 4 },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-horizontal-label -->

<!-- #region usage-loading -->

## Loading

The `loading` prop displays a loading indicator on the input. It also accepts [conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfText name="search" loading />
```

```vue [Template]
<VfText name="search" placeholder="Searching..." loading />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  search: {
    type: 'text',
    placeholder: 'Searching...',
    loading: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-loading -->

<!-- #region usage-readonly -->

## Readonly

The `readonly` prop prevents editing while keeping the input focusable and its value visible. It also accepts [conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfText name="code" default="ABC-123" readonly />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  code: {
    type: 'text',
    default: 'ABC-123',
    readonly: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-readonly -->

<!-- #region usage-disabled -->

## Disabled

The `disabled` prop prevents all interaction. It also accepts [conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfText name="locked" default="Cannot edit" disabled />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  locked: {
    type: 'text',
    default: 'Cannot edit',
    disabled: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-disabled -->

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
| [`name`](!code#props.name "ElementName") | — | **Required.** The element's unique identifier and path in the current level of form data model. |
| [`type`](!code#props.type "string") | `'text'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`placeholder`](!code#props.placeholder "TProp<string, TContext>") | — | The placeholder text displayed when the element is empty. |
| [`addonBefore`](!code#props.addonBefore "AddonProp<TContext>") | — | Content or schema rendered as addons before the input. |
| [`addonAfter`](!code#props.addonAfter "AddonProp<TContext>") | — | Content or schema rendered as addons after the input. |
| [`iconBefore`](!code#props.iconBefore "DProp<string, TContext>") | — | Icon displayed before the input. |
| [`iconAfter`](!code#props.iconAfter "DProp<string, TContext>") | — | Icon displayed after the input. |
| [`loading`](!code#props.loading "ConditionalProp<TContext>") | — | Whether the element is in loading state. |
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |

### Input {#props-text}

| Prop | Default | Description |
| --- | --- | --- |
| [`inputType`](!code#props.inputType "InputTypeProp") | `'text'` | The HTML input type (e.g. text, email, password). |
| [`inputmode`](!code#props.inputmode "InputModeProp") | — | The HTML `inputmode` attribute hinting which virtual keyboard mobile browsers should show. |
| [`autocomplete`](!code#props.autocomplete "string") | — | The HTML `autocomplete` attribute value for the input. When omitted, the element's name is used if it is a valid autofill token (e.g. `email`, `tel`, `postal-code`). |
| [`string`](!code#props.string "boolean") | `false` | Whether the value is always cast to a string. |
| [`noExpressions`](!code#props.noExpressions "boolean") | `false` | Disables expression resolution for this element. Applies to the element itself only (container elements don't cascade it to their children), and a form-level `noExpressions` cannot be overridden by setting it to `false` here. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored drafts. On a container, the whole subtree is excluded. |
| [`readonly`](!code#props.readonly "ConditionalProp<TContext>") | `false` | Whether the input is read-only. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | `false` | Whether the element is disabled. |

### I18n {#props-i18n}

| Prop | Default | Description |
| --- | --- | --- |
| [`translate`](!code#props.translate "TTranslate \| boolean") | `false` | Whether the element's value is translatable into multiple languages. |
| [`language`](!code#props.language "string") | — | The default selected language. |
| [`languages`](!code#props.languages "LanguagesProp") | — | The available languages for translatable content. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`default`](!code#props.default "T \| ExpressionString") | — | The default/initial value of the element. Being expressionable, a `{...}` expression string is accepted alongside the model type. |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`untrackOn`](!code#props.untrackOn "UntrackOnProp") | — | Controls when the element stops tracking user changes. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfTextContext<VfTextProps<TTranslate, TLanguages>>) => any") | — | Transforms the element's value when submitting the form. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`rules`](!code#props.rules "TRulesProp<TContext>") | — | Validation rules to apply to the textarea. |
| [`validateOn`](!code#props.validateOn "ElementValidateOnProp") | — | Controls when validation is triggered (e.g. on change, blur, or submit). |
| [`debounce`](!code#props.debounce "number") | — | Delay in milliseconds before processing input. |
| [`bail`](!code#props.bail "boolean") | `true` | Whether to stop validation after the first failing rule. |
| [`ruleMessages`](!code#props.ruleMessages "RuleMessagesProp<TContext>") | — | Custom error messages keyed by validation rule name. |
| [`displayName`](!code#props.displayName "TProp<string, TContext>") | — | The display name used in validation error messages. |
| [`maxErrors`](!code#props.maxErrors "number") | `1` | Maximum number of validation errors to display at once. |
| [`hideErrors`](!code#props.hideErrors "boolean") | `false` | Whether to hide validation error messages. |
| [`showRequired`](!code#props.showRequired "ShowRequiredProp") | — | Where to show required field indicators (e.g. label, placeholder). |
| [`hoist`](!code#props.hoist "boolean") | `false` | Whether to push the element's errors to its nearest ancestor element. |

### Conditions {#props-conditions}

| Prop | Default | Description |
| --- | --- | --- |
| [`conditions`](!code#props.conditions "ConditionalProp<TContext>") | — | Conditions that control the element's visibility and availability. |
| [`conditionsTrigger`](!code#props.conditionsTrigger "ConditionsTriggerProp<TContext>") | — | The source that triggers re-evaluation of this element's async conditional props (`conditions`, `disabled`, `readonly`, and validation rule conditions). Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, any change in the form model re-triggers evaluation. |
| [`conditionsDebounce`](!code#props.conditionsDebounce "number") | — | The debounce delay in milliseconds applied before re-evaluating this element's async conditional props when the trigger source changes. Overrides the global `$conditions.debounce` config (default `300`). |

### Customization {#props-customization}

| Prop | Default | Description |
| --- | --- | --- |
| [`parts`](!code#props.parts "P") | — | Custom DOM attribute overrides for the component's structural parts. |
| [`class`](!code#props.class "ClassValue") | — | CSS classes to apply to the component's root element. |
| [`classes`](!code#props.classes "C") | — | Custom CSS class overrides for the component's structural parts. |
| [`reclass`](!code#props.reclass "C") | — | CSS class overrides that replace (rather than merge with) default classes. |
| [`tokens`](!code#props.tokens "ThemeTokens") | — | Token overrides applied to the element's CSS custom properties. |
| [`slots`](!code#props.slots "S") | — | Custom Vue components to use for named slots. Every component resolves it through the standard outlets pipeline (see `useOutlets`). |
| [`presets`](!code#props.presets "PresetsProp") | — | Named configuration presets to apply to the component. |
| [`template`](!code#props.template "ComponentProp \| null") | — | A custom Vue component to use as the template instead of the default. |
| [`component`](!code#props.component "ComponentProp") | — | A custom Vue component to render in the component's default slot. |

<!-- @endcollapsible -->
<!-- @props-end -->

<!-- @props-adapter-start --><!-- @props-adapter-end -->

<!-- @endtab -->
<!-- @tab Context -->

## Context

Reactive properties and methods accessible on the component's [Context](/guide/context) object.

<!-- @collapsible -->
<!-- @context-start -->
### General {#section-general}

| Name | Description |
| --- | --- |
| [`type`](!code#context.type "string") | The element's type identifier (e.g. "text", "checkbox", "select"). |
| [`name`](!code#context.name "string") | The element's name as a string ref. |
| [`props`](!code#context.props "object") | The resolved component props with defaults applied. |

### Text {#section-text}

| Name | Description |
| --- | --- |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`translateAddon`](!code#context.translateAddon "AddonSchema") | Schema for the language selector addon rendered in translatable mode. |
| [`validation`](!code#context.validation "ShallowReactive<Record<string, ValidationView>>") | Per-language validation views keyed by language (`default` for non-translatable elements). |
| [`currentValidation`](!code#context.currentValidation "ValidationView") | The validation view of the active language (`default` when the element is not translatable). |
| [`validator`](!code#context.validator "Validator") | The validator instance the element is registered with: the form's validator, a store-attached one, or a newly created one. |
| [`shouldValidate`](!code#context.shouldValidate "boolean") | Whether the element should validate live on user input, per the `validateOn` policy and the form's state. |
| [`onUserInput()`](!code#context.onUserInput "() => void") | Validates the element on user input when the live-validation policy allows it. |
| [`isFlatContainer`](!code#context.isFlatContainer "boolean") | Whether the element's data is flattened into the parent container rather than nested under its own `name` key. |
| [`containerModel`](!code#context.containerModel "unknown") | The model ref the element provides to its children via the container context: the parent's model for flat containers, the element's own `model` otherwise. |
| [`handleModelUpdate()`](!code#context.handleModelUpdate "(data: Event) => void") | Handles a native input event and updates the model from the event target. |
| [`initValidation()`](!code#context.initValidation "() => void") | Registers the element with the validator and compiles its rules. |
| [`destroyValidation()`](!code#context.destroyValidation "() => void") | Unregisters the element from the validator and clears its validation views. |
| [`rootModel`](!code#context.rootModel "RootModel \| undefined") | The root model backing the form when this element operates as the form root, `undefined` for every other element. |
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored drafts. |
| [`setInputRef()`](!code#context.setInputRef "(el: any) => void") | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `inputRef` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref. |
| [`canonicalDomValue`](!code#context.canonicalDomValue "boolean") | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value pickup and the DOM recovery listeners. |
| [`inputBindings`](!code#context.inputBindings "object") | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners. |
| [`componentBindings`](!code#context.componentBindings "object") | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur. |
| [`autocomplete`](!code#context.autocomplete "string \| undefined") | The resolved `autocomplete` attribute value, or `undefined` when no prop is given and the element's name is not a valid autofill token. |

### Data {#section-data}

| Name | Description |
| --- | --- |
| [`model`](!code#context.model "Record<string, any> \| any") | The element's reactive model value within the form data tree. |
| [`value`](!code#context.value "any") | The current language-aware value of the element. For translatable elements, returns the value for the active language. |
| [`payload`](!code#context.payload "object") | The element's submission payload. Container elements aggregate from children; leaf elements return their own value. |
| [`nullValue`](!code#context.nullValue "any") | The value the element holds when it is considered empty. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel "Record<string, any> \| any") | A snapshot of the model at initialization time, used for dirty checking and reset. |
| [`dataPath`](!code#context.dataPath "string") | The dot-notation path to this element's value within the form data object (e.g. `"address.city"`). Empty string for the root model. Flat containers inherit their parent's data path. |
| [`tracking`](!code#context.tracking "boolean") | Whether the element's `default` expression is currently tracked and auto-updating the value. |
| [`update()`](!code#context.update "(data: any) => void") | Updates the element's model value. Container elements perform a deep merge; leaf elements set the value directly. |
| [`load()`](!code#context.load "(data: any) => void") | Loads data into the element and fires the `load` event, cascading to all children. |
| [`reset()`](!code#context.reset "() => void") | Resets the element to its initial model state and fires the `reset` event. |
| [`clear()`](!code#context.clear "() => void") | Clears the element to its null value and fires the `clear` event. |
| [`track()`](!code#context.track "() => void") | Resumes expression tracking after an untrack, immediately re-writing the resolved value. |
| [`untrack()`](!code#context.untrack "() => void") | Stops expression tracking, leaving the current value in place. |
| [`reinit()`](!code#context.reinit "() => void") | Reinitializes the element by rebuilding both its model registration and validation instances. |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`visible`](!code#context.visible "boolean") | Whether the element is currently visible, based on availability, container visibility, and pager state. |
| [`available`](!code#context.available "boolean") | Whether the element is available (not hidden by conditional logic). |
| [`disabled`](!code#context.disabled "boolean") | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`readonly`](!code#context.readonly "boolean") | Whether the element is readonly, resolved from the prop, form-level setting, or conditional logic. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`focused`](!code#context.focused "boolean") | Whether the element is currently focused. |
| [`touched`](!code#context.touched "boolean") | Whether the element has been touched (blurred) by the user. |
| [`visited`](!code#context.visited "boolean") | Whether the element has been visited (focused) by the user. |
| [`dirty`](!code#context.dirty "boolean") | Whether the current model value differs from the initial model value. |
| [`loading`](!code#context.loading "boolean") | Whether the element is in a loading state, true when pending, explicitly set to loading, or resolved via conditions. |
| [`empty`](!code#context.empty "boolean") | Whether the element's current value is empty. Container elements check whether all children are empty. |
| [`busy`](!code#context.busy "boolean") | Whether the element is busy, meaning it is either debouncing or has pending async validation. |
| [`hoisted`](!code#context.hoisted "boolean \| undefined") | Whether this element pushes its errors to its nearest ancestor element instead of displaying and reporting them itself. |
| [`enable()`](!code#context.enable "() => void") | Programmatically enables the element. |
| [`disable()`](!code#context.disable "() => void") | Programmatically disables the element. |

### Validation {#section-validation}

| Name | Description |
| --- | --- |
| [`invalid`](!code#context.invalid "boolean") | Whether any of the element's validations (across all languages) are currently invalid, including children. |
| [`validated`](!code#context.validated "boolean") | Whether all of the element's validations (across all languages) have been executed, including children. |
| [`completed`](!code#context.completed "boolean") | Whether the element is completed, meaning it either has no rules or has been validated without errors. |
| [`success`](!code#context.success "boolean") | Whether the element has been validated and passed (always `true` for elements without own rules), once touched. |
| [`pending`](!code#context.pending "boolean") | Whether any of the element's validations are currently pending an async check, including children. |
| [`debouncing`](!code#context.debouncing "boolean") | Whether any of the element's validations are currently debouncing, including children. |
| [`errors`](!code#context.errors "any[]") | All error messages for this element: its own plus any pushed up by hoisted children. |
| [`hasError`](!code#context.hasError "boolean") | Whether the element has any active error messages. |
| [`displayErrors`](!code#context.displayErrors "any[]") | The error messages rendered for this element. Empty when the element pushes its errors to its parent; otherwise errors capped by `maxErrors`. |
| [`ownErrors`](!code#context.ownErrors "string[]") | The element's own error messages (validation rules plus custom message bag entries). |
| [`formErrors`](!code#context.formErrors "object") | Error messages propagated to the form, keyed by element path. Empty when the element pushes its errors to its parent. |
| [`messages`](!code#context.messages "string[]") | The list of custom messages from the message bag, including messages from hoisted children. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for custom errors and messages. |
| [`required`](!code#context.required "boolean") | Whether the element is required by its current validation rules. |
| [`genericName`](!code#context.genericName "string") | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop. |
| [`validate()`](!code#context.validate "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Runs validation on the element's own rules and all children, returning whether everything is valid. |
| [`validateSelf()`](!code#context.validateSelf "() => Promise<boolean>") | Validates the element's own rules (without children), resolving with the result. |
| [`validateChildren()`](!code#context.validateChildren "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Validates stateful children, returning whether all are valid. By default only incomplete children run. |
| [`validateCurrent()`](!code#context.validateCurrent "() => Promise<boolean>") | Validates only the active language's value of the element. |
| [`invalidate()`](!code#context.invalidate "() => void") | Marks all validation instances as invalidated, requiring revalidation. |
| [`unvalidate()`](!code#context.unvalidate "() => void") | Resets all validation state, including children's. |
| [`filled()`](!code#context.filled "(value: any) => boolean") | Checks whether a value is considered filled. |
| [`clean()`](!code#context.clean "() => void") | Marks the element as clean by updating the initial model snapshot. |
| [`clearErrors()`](!code#context.clearErrors "() => void") | Clears all error messages from the message bag. |
| [`clearMessages()`](!code#context.clearMessages "() => void") | Clears all custom messages from the message bag. |
| [`clearMessageBag()`](!code#context.clearMessageBag "() => void") | Clears the entire message bag, removing both errors and messages. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`inputRef`](!code#context.inputRef "any") | Ref to the underlying input element. |
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`placeholder`](!code#context.placeholder "string \| (string & {}) \| undefined") | The resolved placeholder text, supporting static strings and dynamic text props. |
| [`page`](!code#context.page "PageProp \| undefined") | Page metadata for stepped/tabbed forms. |
| [`addonable`](!code#context.addonable "true") | Whether this element supports before/after addons. |
| [`addonsBefore`](!code#context.addonsBefore "AddonItem[]") | Array of resolved before-addons, each an individual `AddonItem` for `VfAddon`. |
| [`addonsAfter`](!code#context.addonsAfter "AddonItem[]") | Array of resolved after-addons, each an individual `AddonItem` for `VfAddon`. |
| [`iconBefore`](!code#context.iconBefore "string \| undefined") | The resolved CSS class string for the icon displayed before the input. |
| [`iconAfter`](!code#context.iconAfter "string \| undefined") | The resolved CSS class string for the icon displayed after the input. |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
| [`viewLoaded`](!code#context.viewLoaded "boolean") | Whether the element's view has been loaded (used for lazy rendering optimization). |
| [`$el`](!code#context.$el "HTMLElement \| null") | Reference to the component's root DOM element. |
| [`resolvedColumns`](!code#context.resolvedColumns "object") | Resolved column sizes per breakpoint, normalized into container/label/wrapper/group values. |
| [`updateColumns()`](!code#context.updateColumns "(v: any) => any") | Updates the column configuration programmatically. |
| [`scrollTo()`](!code#context.scrollTo "(options: ScrollIntoViewOptions \| undefined, force: boolean \| undefined) => Promise<boolean>") | Scrolls the window to this element. If the element belongs to a step or tab, that page is selected first before scrolling. |
| [`focus()`](!code#context.focus "(scroll: boolean \| undefined) => Promise<boolean>") | Focuses the first focusable HTML element (input, select, textarea, button, etc.) within the wrapper. Optionally scrolls to the element first. |

### Tree {#section-tree}

| Name | Description |
| --- | --- |
| [`form$`](!code#context.form$ "VfFormContext<EntryProps<Record<string, any>>> \| undefined") | The parent form's context, providing access to form-level state and methods. |
| [`path`](!code#context.path "string") | The element's dot-notation path in the form tree (e.g. "user.name"). |
| [`componentName`](!code#context.componentName "keyof ComponentRegistry<Record<string, any>>") | The resolved Vue component name for this element. |
| [`container`](!code#context.container "ContainerContext \| undefined") | The container context providing path, model, and registration methods for child elements. |
| [`children`](!code#context.children "VueformChildren") | The child element registry providing registration, unregistration, and reactive child lists. |

### Events {#section-events}

| Name | Description |
| --- | --- |
| [`fire()`](!code#context.fire "(e: string, ...args: any[]) => any") | Fires an event synchronously, invoking before, main, and after listeners in order. |
| [`fireAsync()`](!code#context.fireAsync "(e: string, ...args: any[]) => Promise<any>") | Fires an event asynchronously, awaiting each callback and short-circuiting when any returns `false`. |
| [`on()`](!code#context.on "(e: string, callback: (...args: any[]) => any) => void") | Subscribes a callback to a specific event. |
| [`off()`](!code#context.off "(e: string, callback: (...args: any[]) => any) => void") | Removes a previously registered event callback. |
| [`onBefore()`](!code#context.onBefore "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs before the main event listeners. |
| [`onAfter()`](!code#context.onAfter "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs after the main event listeners. |

### Internationalization {#section-i18n}

| Name | Description |
| --- | --- |
| [`language`](!code#context.language "string") | The currently active language for translatable elements. |
| [`languages`](!code#context.languages "ResolvedLanguagesProp") | Resolved map of available languages for translatable elements. |
| [`languageId`](!code#context.languageId "string \| undefined") | Unique DOM id for the language indicator element. |
| [`translatable`](!code#context.translatable "boolean") | Whether the element is in translatable (multilingual) mode. |

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleInput()`](!code#context.handleInput "(payload: any, e: Event \| undefined) => void") | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it.<br><br>Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends.<br><br>The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only picked up while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
| [`handleKeydown()`](!code#context.handleKeydown "(e: Event) => any") | Fires the keydown event on the element. |
| [`handleKeyup()`](!code#context.handleKeyup "(e: Event) => any") | Fires the keyup event on the element. |
| [`handleKeypress()`](!code#context.handleKeypress "(e: Event) => any") | Fires the keypress event on the element. |
| [`handleBlur()`](!code#context.handleBlur "(e: Event) => void") | Fires the blur event on the element. |
| [`handleFocus()`](!code#context.handleFocus "(e: Event) => void") | Handles focus by setting the focused state and firing the focus event. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | A unique auto-generated identifier for the element. |
| [`helpId`](!code#context.helpId "string") | The DOM id for the element's help text region. |
| [`errorId`](!code#context.errorId "string") | The DOM id for the element's error message region. |
| [`labelId`](!code#context.labelId "string") | The DOM id for the element's label region. |
<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->
<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/events) for details.

<!-- @events-start -->
| Name | Params | Description |
| --- | --- | --- |
| `change` | [`newValue`](!code#events.change.newValue "T"), [`oldValue`](!code#events.change.oldValue "T"), [`context$`](!code#events.change.context$ "TContext") | Emitted when the element value changes. |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "T") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "T"), [`context$`](!code#events.load.context$ "TContext") | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the element is reset to its default value. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the element's value is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the element becomes invalid. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the element becomes valid after having been invalid. |
| `input` | [`value`](!code#events.input.value "V"), [`e`](!code#events.input.e "Event \| undefined"), [`context$`](!code#events.input.context$ "TContext") | Emitted when the input value is changed via the UI by the user. |
| `keydown` | [`event`](!code#events.keydown.event "Event"), [`context$`](!code#events.keydown.context$ "TContext") | Emitted on keydown, passes the keyboard event and component context. |
| `keyup` | [`event`](!code#events.keyup.event "Event"), [`context$`](!code#events.keyup.context$ "TContext") | Emitted on keyup, passes the keyboard event and component context. |
| `keypress` | [`event`](!code#events.keypress.event "Event"), [`context$`](!code#events.keypress.context$ "TContext") | Emitted on keypress, passes the keyboard event and component context. |
| `focus` | [`context$`](!code#events.focus.context$ "TContext") | Emitted when the element receives focus. |
| `blur` | [`context$`](!code#events.blur.context$ "TContext") | Emitted when the element loses focus. |
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
| `label` | [`label`](!code#slot.label.label "string") | Slot for customizing the element's label content. |
| `required` | — | Slot for customizing the required indicator. |
| `addon-before` | [`addonBefore`](!code#slot.addon-before.addonBefore "AddonProp \| undefined") | Slot that replaces the before-addons section. |
| `addon-after` | [`addonAfter`](!code#slot.addon-after.addonAfter "AddonProp \| undefined") | Slot that replaces the after-addons section. |
| `icon-before` | [`iconBefore`](!code#slot.icon-before.iconBefore "string \| undefined") | Slot that replaces the icon rendered before the input. |
| `icon-after` | [`iconAfter`](!code#slot.icon-after.iconAfter "string \| undefined") | Slot that replaces the icon rendered after the input. |
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `language` | [`language`](!code#slot.language.language "string") [`languages`](!code#slot.language.languages "LanguagesProp") | Slot that replaces the language selector rendering. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region parts-live -->

<!-- #region viewer -->

<VPParts
component="VfText"
:examples="{
default: 'Default',
icons: 'With Icons',
addons: 'With Addons',
multilingual: 'Multilingual',
}"
:schema="{
label: 'Username',
help: 'Letters, numbers and underscores only',
hint: 'This will be your public display name',
rules: 'required',
showRequired: ['label'],
onMounted: ({ messageBag }) => {
messageBag.append('Username is already taken', 'error')
messageBag.append('Username is available', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfText
      name="default"
      v-bind="schema"
    />
</template>
<template #example-icons="{ schema }">
<VfText
      name="icons"
      v-bind="schema"
      icon-before="user"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfText
      name="addons"
      v-bind="schema"
      addon-before="https://"
      addon-after=".com"
    />
</template>
<template #example-multilingual="{ schema }">
<VfText
      name="multilingual"
      v-bind="schema"
      :languages="{
        en: 'English',
      }"
      translate
    />
</template>
</VPParts>
<!-- #endregion viewer -->

<!-- #endregion parts-live -->

<!-- @parts-start -->
### `panel`

The wrapper around `root` with `display: contents` when the element is a step or a tab.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-panel` |

### `root`

The element's root wrapper.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` `<fieldset>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` |

### `labelGroup`

The container holding the label and required indicator.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-label-group` |

### `label`

The label element, associated with the control via `for`.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` `<span>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-label` |

### `required`

The required indicator.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-required` |

### `elementGroup`

The container wrapping the input and related UI.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element-group` |

### `elementWrapper`

The wrapper directly around the input control.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element-wrapper` |

### `help`

The help text area.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-help` |

### `input`

The text input element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<input>` |

### `addonBefore`

An individual addon rendered before the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfAddon>`](./VfAddon.md) |

### `addonAfter`

An individual addon rendered after the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfAddon>`](./VfAddon.md) |

### `addonGroup`

The addon group wrapper element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-addon-group` |

### `iconBefore`

The icon rendered before the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfIcon>`](./VfIcon.md) |

### `iconAfter`

The icon rendered after the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfIcon>`](./VfIcon.md) |

### `iconGroup`

The wrapper element grouping icons and the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-icon-group` |

### `language`

The language selector addon rendered alongside the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfAddon>`](./VfAddon.md) |

### `description`

The description text area.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-description` |

### `errors`

The validation errors container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-errors` |

### `error`

An individual validation error.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-error` |

### `messages`

The info messages container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-messages` |

### `message`

An individual info message.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-message` |
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
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  --vf-element-line-color: var(--vf-gray-300);

  --vf-label-group-v-padding: 0 0 0.375rem 0;

  --vf-required-bg: transparent;
  --vf-required-color: inherit;
  --vf-required-content: '*';
  --vf-required-h: auto;
  --vf-required-icon: none;
  --vf-required-w: auto;

  --vf-help-bg: transparent;
  --vf-help-border-color: transparent;
  --vf-help-border-style: solid;
  --vf-help-border-width: 0;
  --vf-help-color: var(--vf-text-soft);
  --vf-help-font-size: 0.875rem;
  --vf-help-padding: 0;
  --vf-help-radius: var(--vf-radius);

  --vf-description-bg: transparent;
  --vf-description-border-color: transparent;
  --vf-description-border-style: solid;
  --vf-description-border-width: 0;
  --vf-description-color: var(--vf-text-soft);
  --vf-description-font-size: 0.875rem;
  --vf-description-padding: 0;
  --vf-description-radius: var(--vf-radius);

  --vf-errors-bg: transparent;
  --vf-errors-border-color: transparent;
  --vf-errors-border-style: solid;
  --vf-errors-border-width: 0;
  --vf-errors-color: var(--vf-red);
  --vf-errors-font-size: 0.875rem;
  --vf-errors-padding: 0;
  --vf-errors-radius: var(--vf-radius);

  --vf-messages-bg: transparent;
  --vf-messages-border-color: var(--vf-border-success);
  --vf-messages-border-style: solid;
  --vf-messages-border-width: 0;
  --vf-messages-color: var(--vf-green);
  --vf-messages-font-size: 0.875rem;
  --vf-messages-padding: 0;
  --vf-messages-radius: var(--vf-radius);

  --vf-element-group-gutter-x: 0;
  --vf-element-group-gutter-y: 0.25rem;
  --vf-element-wrapper-padding: 0;

  /**
   * Primitives tokens
   * -------------------------------------------------------------------------- */
  --vf-space-1: 1rem;
  --vf-space-2: 2rem;
  --vf-space-3: 3rem;
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  elementLineColor: '$gray300',

  labelGroupVPadding: '0 0 0.375rem 0',

  requiredBg: 'transparent',
  requiredColor: 'inherit',
  requiredContent: "'*'",
  requiredH: 'auto',
  requiredIcon: 'none',
  requiredW: 'auto',

  helpBg: 'transparent',
  helpBorderColor: 'transparent',
  helpBorderStyle: 'solid',
  helpBorderWidth: '0',
  helpColor: '$textSoft',
  helpFontSize: '0.875rem',
  helpPadding: '0',
  helpRadius: '$radius',

  descriptionBg: 'transparent',
  descriptionBorderColor: 'transparent',
  descriptionBorderStyle: 'solid',
  descriptionBorderWidth: '0',
  descriptionColor: '$textSoft',
  descriptionFontSize: '0.875rem',
  descriptionPadding: '0',
  descriptionRadius: '$radius',

  errorsBg: 'transparent',
  errorsBorderColor: 'transparent',
  errorsBorderStyle: 'solid',
  errorsBorderWidth: '0',
  errorsColor: '$red',
  errorsFontSize: '0.875rem',
  errorsPadding: '0',
  errorsRadius: '$radius',

  messagesBg: 'transparent',
  messagesBorderColor: '$borderSuccess',
  messagesBorderStyle: 'solid',
  messagesBorderWidth: '0',
  messagesColor: '$green',
  messagesFontSize: '0.875rem',
  messagesPadding: '0',
  messagesRadius: '$radius',

  elementGroupGutterX: '0',
  elementGroupGutterY: '0.25rem',
  elementWrapperPadding: '0',

  /**
   * Primitives tokens
   * -------------------------------------------------------------------------- */
  space1: '1rem',
  space2: '2rem',
  space3: '3rem',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->

<!-- @endtab -->
<!-- @endtabs -->
