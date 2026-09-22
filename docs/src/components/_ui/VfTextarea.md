# VfTextarea

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

A textarea input with placeholder text.

::: usage

```vue [Preview]
<VfTextarea name="bio" placeholder="Tell us about yourself" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  bio: {
    type: 'textarea',
    placeholder: 'Tell us about yourself',
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

<!-- #region usage-rows -->

## Rows

The `rows` prop controls the number of visible text rows.

::: usage

```vue [Preview]
<VfTextarea name="notes" :rows="2" />
<VfTextarea name="essay" :rows="8" />
```

```vue [Template]
<VfTextarea name="notes" placeholder="Notes" :rows="2" />
<VfTextarea name="essay" placeholder="Essay" :rows="8" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  notes: {
    type: 'textarea',
    placeholder: 'Notes',
    rows: 2,
  },
  essay: {
    type: 'textarea',
    placeholder: 'Essay',
    rows: 8,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-rows -->

<!-- #region usage-autogrow -->

## Autogrow

The `autogrow` prop makes the textarea automatically expand its height as content is added or removed. It is `true` by default. Set it to `false` to use a fixed height instead.

::: usage

```vue [Preview]
<VfTextarea name="growing" :autogrow="true" />
<VfTextarea name="fixed" :autogrow="false" />
```

```vue [Template]
<VfTextarea name="growing" placeholder="This grows as you type (default)" />
<VfTextarea name="fixed" placeholder="This stays fixed" :autogrow="false" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  growing: {
    type: 'textarea',
    placeholder: 'This grows as you type (default)',
  },
  fixed: {
    type: 'textarea',
    placeholder: 'This stays fixed',
    autogrow: false,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-autogrow -->

<!-- #region usage-resize -->

## Resize

The `resize` prop enables the native browser resize handle on the textarea. It is `false` by default.

::: usage

```vue [Preview]
<VfTextarea name="feedback" resize />
```

```vue [Template]
<VfTextarea name="feedback" placeholder="Drag to resize" resize />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  feedback: {
    type: 'textarea',
    placeholder: 'Drag to resize',
    resize: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-resize -->

<!-- #region usage-icons -->

## Icons

The `iconBefore` and `iconAfter` props display [icons](/guide/element-layout#icons) inside the textarea. The icon class format can be [configured](/guide/configuration#icon) globally.

::: usage

```vue [Preview]
<VfTextarea name="message" icon-before="comment" />
<VfTextarea name="notes" icon-after="lock" />
```

```vue [Template]
<VfTextarea name="message" placeholder="Write a message..." icon-before="comment" />
<VfTextarea name="notes" placeholder="Internal notes..." icon-after="lock" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  message: {
    type: 'textarea',
    placeholder: 'Write a message...',
    iconBefore: 'comment',
  },
  notes: {
    type: 'textarea',
    placeholder: 'Internal notes...',
    iconAfter: 'lock',
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

The `addonBefore` and `addonAfter` props render content alongside the textarea. When passed a string, it displays as a text addon. An array of strings renders multiple addons.

::: usage

```vue [Preview]
<VfTextarea name="code" addon-before="<>" />
<VfTextarea name="review" addon-after="✎" />
<VfTextarea name="log" :addon-before="['#', 'v1']" addon-after="📋" />
```

```vue [Template]
<VfTextarea name="code" placeholder="Enter code..." addon-before="<>" />
<VfTextarea name="review" placeholder="Write a review..." addon-after="✎" />
<VfTextarea name="log" placeholder="Log entry..." :addon-before="['#', 'v1']" addon-after="📋" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  code: {
    type: 'textarea',
    placeholder: 'Enter code...',
    addonBefore: '<>',
  },
  review: {
    type: 'textarea',
    placeholder: 'Write a review...',
    addonAfter: '✎',
  },
  log: {
    type: 'textarea',
    placeholder: 'Log entry...',
    addonBefore: ['#', 'v1'],
    addonAfter: '📋',
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

Addons can also be element schemas, allowing interactive controls like selects, buttons, checkboxes, or radios to be embedded alongside the textarea.

::: usage

```vue [Preview]
<VfTextarea name="post" :addon-before="{
  name: 'format',
  type: 'select',
  default: 'md',
  items: { md: 'Markdown', html: 'HTML', plain: 'Plain' },
}" />

<VfTextarea name="note" :addon-after="{
  name: 'submit',
  type: 'button',
  text: 'Send',
}" />

<VfTextarea name="terms" :addon-before="{
  name: 'agree',
  type: 'checkbox',
  text: 'I agree',
}" />

<VfTextarea name="feedback" :addon-after="[
  { name: 'positive', type: 'radio', text: '👍', radioName: 'sentiment' },
  { name: 'negative', type: 'radio', text: '👎', radioName: 'sentiment' },
]" />
```

```vue [Template]
<VfTextarea
  name="post"
  placeholder="Write your post..."
  :addon-before="{
    name: 'format',
    type: 'select',
    default: 'md',
    items: { md: 'Markdown', html: 'HTML', plain: 'Plain' },
  }"
/>
<VfTextarea
  name="note"
  placeholder="Add a note..."
  :addon-after="{ name: 'submit', type: 'button', text: 'Send' }"
/>
<VfTextarea
  name="terms"
  placeholder="Terms and conditions..."
  :addon-before="{ name: 'agree', type: 'checkbox', text: 'I agree' }"
/>
<VfTextarea
  name="feedback"
  placeholder="Your feedback..."
  :addon-after="[
    { name: 'positive', type: 'radio', text: '👍', radioName: 'sentiment' },
    { name: 'negative', type: 'radio', text: '👎', radioName: 'sentiment' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  post: {
    type: 'textarea',
    placeholder: 'Write your post...',
    addonBefore: {
      name: 'format',
      type: 'select',
      default: 'md',
      items: { md: 'Markdown', html: 'HTML', plain: 'Plain' },
    },
  },
  note: {
    type: 'textarea',
    placeholder: 'Add a note...',
    addonAfter: { name: 'submit', type: 'button', text: 'Send' },
  },
  terms: {
    type: 'textarea',
    placeholder: 'Terms and conditions...',
    addonBefore: { name: 'agree', type: 'checkbox', text: 'I agree' },
  },
  feedback: {
    type: 'textarea',
    placeholder: 'Your feedback...',
    addonAfter: [
      { name: 'positive', type: 'radio', text: '👍', radioName: 'sentiment' },
      { name: 'negative', type: 'radio', text: '👎', radioName: 'sentiment' },
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

When the form has multiple [languages](/guide/multilingual-inputs) configured, the textarea can hold per-language values. The default can be provided as a locale-keyed object.

::: usage model

```vue [Preview]
<VfTextarea
  name="description"
  translate
  :languages="{ en: 'English', de: 'German', fr: 'French' }"
/>
```

```vue [Template]
<VfTextarea
  name="description"
  translate
  :languages="{ en: 'English', de: 'German', fr: 'French' }"
  :default="{
    en: 'A short description.',
    de: 'Eine kurze Beschreibung.',
    fr: 'Une courte description.',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  description: {
    type: 'textarea',
    translate: true,
    languages: { en: 'English', de: 'German', fr: 'French' },
    default: {
      en: 'A short description.',
      de: 'Eine kurze Beschreibung.',
      fr: 'Une courte description.',
    },
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
<VfTextarea name="bio" hint="Keep it under 200 characters." />
```

```vue [Template]
<VfTextarea
  name="bio"
  label="Bio"
  placeholder="Tell us about yourself"
  hint="Keep it under 200 characters."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  bio: {
    type: 'textarea',
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    hint: 'Keep it under 200 characters.',
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
<VfTextarea name="notes" help="Markdown formatting is supported." />
```

```vue [Template]
<VfTextarea
  name="notes"
  label="Notes"
  placeholder="Add your notes..."
  help="Markdown formatting is supported."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  notes: {
    type: 'textarea',
    label: 'Notes',
    placeholder: 'Add your notes...',
    help: 'Markdown formatting is supported.',
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
<VfTextarea name="description" label="Description" :columns="{ label: 4 }" />
```

```vue [Template]
<VfTextarea
  name="description"
  label="Description"
  placeholder="Enter a description"
  :columns="{ label: 4 }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  description: {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter a description',
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

The `loading` prop displays a loading indicator on the textarea. It also accepts [conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfTextarea name="content" loading />
```

```vue [Template]
<VfTextarea name="content" placeholder="Loading content..." loading />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  content: {
    type: 'textarea',
    placeholder: 'Loading content...',
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

The `readonly` prop prevents editing while keeping the textarea focusable and its value visible. It also accepts [conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfTextarea name="terms" readonly />
```

```vue [Template]
<VfTextarea name="terms" default="These terms cannot be modified." readonly />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  terms: {
    type: 'textarea',
    default: 'These terms cannot be modified.',
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
<VfTextarea name="locked" disabled />
```

```vue [Template]
<VfTextarea name="locked" default="Cannot edit" disabled />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  locked: {
    type: 'textarea',
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

| Prop                                             | Default      | Description                                                                                     |
| ------------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| [`name`](!code#props.name 'ElementName')         | —            | **Required.** The element's unique identifier and path in the current level of form data model. |
| [`type`](!code#props.type 'string')              | `'textarea'` | The element type identifier.                                                                    |
| [`id`](!code#props.id 'TProp<string, TContext>') | —            | The HTML `id` attribute for the input element.                                                  |

### Input {#props-textarea}

| Prop                                                               | Default | Description                                                                                                                                                                                 |
| ------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`rows`](!code#props.rows 'number')                                | —       | The number of visible text rows for the textarea.                                                                                                                                           |
| [`autogrow`](!code#props.autogrow 'boolean')                       | `true`  | Whether the textarea automatically grows to fit its content. When true, the height adjusts as lines are added or removed.                                                                   |
| [`resize`](!code#props.resize 'boolean')                           | `false` | Whether the native browser resize handle is enabled on the textarea.                                                                                                                        |
| [`description`](!code#props.description 'TProp<string, TContext>') | —       | A description text displayed below the element.                                                                                                                                             |
| [`sensitive`](!code#props.sensitive 'boolean')                     | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`readonly`](!code#props.readonly 'ConditionalProp<TContext>')     | `false` | Whether the input is read-only.                                                                                                                                                             |
| [`disabled`](!code#props.disabled 'ConditionalProp<TContext>')     | `false` | Whether the element is disabled.                                                                                                                                                            |

### I18n {#props-i18n}

| Prop                                                        | Default | Description                                                          |
| ----------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| [`translate`](!code#props.translate 'TTranslate \| boolean') | `false` | Whether the element's value is translatable into multiple languages. |
| [`language`](!code#props.language 'string')                 | —       | The default selected language.                                       |
| [`languages`](!code#props.languages 'LanguagesProp')        | —       | The available languages for translatable content.                    |

### Data {#props-data}

| Prop                                                                                                                                           | Default | Description                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| [`modelValue`](!code#props.modelValue 'T')                                                                                                     | —       | The current value of the element (v-model).                                                      |
| [`default`](!code#props.default 'T')                                                                                                           | —       | The default/initial value of the element.                                                        |
| [`submit`](!code#props.submit 'boolean')                                                                                                       | `true`  | Whether the element value is included in form submission data.                                   |
| [`untrackOn`](!code#props.untrackOn 'UntrackOnProp')                                                                                           | —       | Controls when the element stops tracking user changes.                                           |
| [`detached`](!code#props.detached 'boolean')                                                                                                   | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload '(value: any, context$: VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>) => any') | —       | Transforms the element's value when submitting the form.                                         |

### Validation {#props-validation}

| Prop                                                                    | Default | Description                                                              |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| [`rules`](!code#props.rules 'TRulesProp<TContext>')                     | —       | Validation rules to apply to the textarea.                               |
| [`validateOn`](!code#props.validateOn 'ElementValidateOnProp')          | —       | Controls when validation is triggered (e.g. on change, blur, or submit). |
| [`debounce`](!code#props.debounce 'number')                             | —       | Delay in milliseconds before processing input.                           |
| [`bail`](!code#props.bail 'boolean')                                    | `true`  | Whether to stop validation after the first failing rule.                 |
| [`ruleMessages`](!code#props.ruleMessages 'RuleMessagesProp<TContext>') | —       | Custom error messages keyed by validation rule name.                     |
| [`displayName`](!code#props.displayName 'TProp<string, TContext>')      | —       | The display name used in validation error messages.                      |
| [`maxErrors`](!code#props.maxErrors 'number')                           | `1`     | Maximum number of validation errors to display at once.                  |
| [`hideErrors`](!code#props.hideErrors 'boolean')                        | `false` | Whether to hide validation error messages.                               |
| [`showRequired`](!code#props.showRequired 'ShowRequiredProp')           | —       | Where to show required field indicators (e.g. label, placeholder).       |
| [`hoist`](!code#props.hoist 'boolean')                                  | `false` | Whether to push the element's errors to its nearest ancestor element.    |

### Conditions {#props-conditions}

| Prop                                                                                   | Default | Description                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`conditions`](!code#props.conditions 'ConditionalProp<TContext>')                     | —       | Conditions that control the element's visibility and availability.                                                                                                                                                                                                                                                                     |
| [`conditionsTrigger`](!code#props.conditionsTrigger 'ConditionsTriggerProp<TContext>') | —       | The source that triggers re-evaluation of this element's async conditional props (`conditions`, `disabled`, `readonly`, and validation rule conditions). Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, any change in the form model re-triggers evaluation. |
| [`conditionsDebounce`](!code#props.conditionsDebounce 'number')                        | —       | The debounce delay in milliseconds applied before re-evaluating this element's async conditional props when the trigger source changes. Overrides the global `$conditions.debounce` config (default `300`).                                                                                                                            |

### Layout {#props-layout}

| Prop                                                               | Default | Description                                                                                                                                                                                                   |
| ------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`columns`](!code#props.columns 'ColumnsProp<TContext>')           | —       | Responsive grid column sizing for the element's layout.                                                                                                                                                       |
| [`layout`](!code#props.layout 'ComponentProp \| boolean')           | `true`  | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout.                                                                     |
| [`label`](!code#props.label 'TProp<string, TContext>')             | —       | The label displayed alongside the element.                                                                                                                                                                    |
| [`hideLabel`](!code#props.hideLabel 'boolean')                     | `false` | Whether to visually hide the element's label.                                                                                                                                                                 |
| [`page`](!code#props.page 'PageProp<TContext>')                    | —       | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property.                                                                                     |
| [`help`](!code#props.help 'TProp<string, TContext>')               | —       | A help text displayed below the label.                                                                                                                                                                        |
| [`placeholder`](!code#props.placeholder 'TProp<string, TContext>') | —       | The placeholder text displayed when the element is empty.                                                                                                                                                     |
| [`addonBefore`](!code#props.addonBefore 'AddonProp<TContext>')     | —       | Content or schema rendered as addons before the input.                                                                                                                                                        |
| [`addonAfter`](!code#props.addonAfter 'AddonProp<TContext>')       | —       | Content or schema rendered as addons after the input.                                                                                                                                                         |
| [`iconBefore`](!code#props.iconBefore 'DProp<string, TContext>')   | —       | Icon displayed before the input.                                                                                                                                                                              |
| [`iconAfter`](!code#props.iconAfter 'DProp<string, TContext>')     | —       | Icon displayed after the input.                                                                                                                                                                               |
| [`loading`](!code#props.loading 'ConditionalProp<TContext>')       | —       | Whether the element is in loading state.                                                                                                                                                                      |
| [`spaceTop`](!code#props.spaceTop 'number')                        | —       | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, ....                                                                                   |
| [`spaceBottom`](!code#props.spaceBottom 'number')                  | —       | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, ....                                                                                   |
| [`lineTop`](!code#props.lineTop 'boolean')                         | `false` | Renders a horizontal line (border) above the element.                                                                                                                                                         |
| [`lineBottom`](!code#props.lineBottom 'boolean')                   | `false` | Renders a horizontal line (border) below the element.                                                                                                                                                         |
| [`expressions`](!code#props.expressions 'ExpressionsProp')         | —       | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Customization {#props-customization}

| Prop                                                      | Default | Description                                                                                                                         |
| --------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`parts`](!code#props.parts 'P')                          | —       | Custom DOM attribute overrides for the component's structural parts.                                                                |
| [`class`](!code#props.class 'ClassValue')                 | —       | CSS classes to apply to the component's root element.                                                                               |
| [`classes`](!code#props.classes 'C')                      | —       | Custom CSS class overrides for the component's structural parts.                                                                    |
| [`reclass`](!code#props.reclass 'C')                      | —       | CSS class overrides that replace (rather than merge with) default classes.                                                          |
| [`tokens`](!code#props.tokens 'ThemeTokens')              | —       | Token overrides applied to the element's CSS custom properties.                                                                     |
| [`slots`](!code#props.slots 'S')                          | —       | Custom Vue components to use for named slots. Every component resolves it through the standard outlets pipeline (see `useOutlets`). |
| [`presets`](!code#props.presets 'PresetsProp')            | —       | Named configuration presets to apply to the component.                                                                              |
| [`template`](!code#props.template 'ComponentProp \| null') | —       | A custom Vue component to use as the template instead of the default.                                                               |
| [`component`](!code#props.component 'ComponentProp')      | —       | A custom Vue component to render in the component's default slot.                                                                   |

### Accessibility {#props-accessibility}

| Prop                                  | Default | Description                        |
| ------------------------------------- | ------- | ---------------------------------- |
| [`aria`](!code#props.aria 'AriaProp') | —       | ARIA attributes for accessibility. |

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

| Name                                    | Description                                                        |
| --------------------------------------- | ------------------------------------------------------------------ |
| [`type`](!code#context.type 'string')   | The element's type identifier (e.g. "text", "checkbox", "select"). |
| [`name`](!code#context.name 'string')   | The element's name as a string ref.                                |
| [`props`](!code#context.props 'object') | The resolved component props with defaults applied.                |

### Textarea {#section-textarea}

| Name                                                                                       | Description                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`description`](!code#context.description 'string \| (string & {}) \| undefined')            | The resolved description text for the element.                                                                                                                                                                                                                                                                                                        |
| [`descriptionId`](!code#context.descriptionId 'string')                                    | The DOM id for the element's description text region.                                                                                                                                                                                                                                                                                                 |
| [`translateAddon`](!code#context.translateAddon 'AddonSchema')                             | Schema for the language selector addon rendered in translatable mode.                                                                                                                                                                                                                                                                                 |
| [`validation`](!code#context.validation 'ShallowReactive<Record<string, ValidationView>>') |                                                                                                                                                                                                                                                                                                                                                       |
| [`currentValidation`](!code#context.currentValidation 'ValidationView')                    |                                                                                                                                                                                                                                                                                                                                                       |
| [`validator`](!code#context.validator 'Validator')                                         |                                                                                                                                                                                                                                                                                                                                                       |
| [`shouldValidate`](!code#context.shouldValidate 'boolean')                                 |                                                                                                                                                                                                                                                                                                                                                       |
| [`onUserInput()`](!code#context.onUserInput '() => void')                                  |                                                                                                                                                                                                                                                                                                                                                       |
| [`isFlatContainer`](!code#context.isFlatContainer 'boolean')                               | Whether the element's data is flattened into the parent container rather than nested under its own `name` key.                                                                                                                                                                                                                                        |
| [`containerModel`](!code#context.containerModel 'unknown')                                 | The model ref the element provides to its children via the container context. For flat containers this is the parent's model — children's data lives merged at the parent level, while the public `model` is a scoped projection. For every other element it is the element's own `model`.                                                            |
| [`handleModelUpdate()`](!code#context.handleModelUpdate '(data: Event) => void')           | Handles a native input event and updates the model from the event target. Text and select inputs use `target.value`. Checkboxes and radios use the `checked` state with `trueValue` / `falseValue` when available.                                                                                                                                    |
| [`initValidation()`](!code#context.initValidation '() => void')                            |                                                                                                                                                                                                                                                                                                                                                       |
| [`destroyValidation()`](!code#context.destroyValidation '() => void')                      |                                                                                                                                                                                                                                                                                                                                                       |
| [`rootModel`](!code#context.rootModel 'RootModel \| undefined')                             | The root model backing the form when this element operates as the form root (adopting a `useModel` instance from `modelValue` or creating an internal store), `undefined` for every other element.                                                                                                                                                    |
| [`sensitivePaths`](!code#context.sensitivePaths 'string[]')                                | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. A sensitive element marks its whole subtree; containers otherwise aggregate from children. Unavailable elements are included: their data may still linger in the model, and stripping an absent path is harmless. |
| [`setInputRef()`](!code#context.setInputRef '(el: any) => void')                           | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `input` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref.                                  |
| [`canonicalDomValue`](!code#context.canonicalDomValue 'boolean')                           | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value adoption and the DOM recovery listeners.                                                                                                                                                                    |
| [`inputBindings`](!code#context.inputBindings 'object')                                    | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners.                                                               |
| [`componentBindings`](!code#context.componentBindings 'object')                            | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur.                                                                                      |
| [`autosize()`](!code#context.autosize '() => void')                                        | Adjusts the textarea height to match its scroll height. Temporarily resets height to allow shrinking, then sets it to the content's scroll height.                                                                                                                                                                                                    |

### Data {#section-data}

| Name                                                                     | Description                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`model`](!code#context.model 'Record<string, any> \| any')               | The element's reactive model value within the form data tree.                                                                                                                                                                     |
| [`value`](!code#context.value 'any')                                     | The current language-aware value of the element. For translatable elements, returns the value for the active language.                                                                                                            |
| [`payload`](!code#context.payload 'object')                              | The element's submission payload. For isContainer.value containers, aggregates from children. For leaf elements, returns own value.                                                                                               |
| [`nullValue`](!code#context.nullValue 'any')                             | The value the element holds when it is considered empty. Determined by `nullValue` / `falseValue` props, element type (container, multiple), and translatable state. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel 'Record<string, any> \| any') | A snapshot of the model at initialization time, used for dirty checking and reset.                                                                                                                                                |
| [`dataPath`](!code#context.dataPath 'string')                            | The dot-notation path to this element's value within the form data object (e.g. `"address.city"`). Empty string for the root model. Flat containers inherit their parent's data path.                                             |
| [`tracking`](!code#context.tracking 'boolean')                           | Whether the element's `default` expression is currently tracked and auto-updating the value.                                                                                                                                      |
| [`update()`](!code#context.update '(data: any) => void')                 | Updates the element's model value. For isContainer.value containers, performs a deep merge. For leaf elements, sets the value directly and invalidates validation.                                                                |
| [`load()`](!code#context.load '(data: any) => void')                     | Loads data into the element and fires the `load` event, cascading to all children so expression tracking can be stopped per-element.                                                                                              |
| [`reset()`](!code#context.reset '() => void')                            | Resets the element to its initial model state and fires the `reset` event. For isContainer.value containers, delegates to children or resets the model directly for dynamic lists.                                                |
| [`clear()`](!code#context.clear '() => void')                            | Clears the element to its null value and fires the `clear` event. For isContainer.value containers, delegates to children or clears the model for dynamic lists.                                                                  |
| [`track()`](!code#context.track '() => void')                            | Resumes expression tracking after an untrack, immediately re-writing the resolved value.                                                                                                                                          |
| [`untrack()`](!code#context.untrack '() => void')                        | Stops expression tracking, leaving the current value in place.                                                                                                                                                                    |
| [`reinit()`](!code#context.reinit '() => void')                          | Reinitializes the element by rebuilding both its model registration and validation instances.                                                                                                                                     |

### State {#section-state}

| Name                                                     | Description                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`visible`](!code#context.visible 'boolean')             | Whether the element is currently visible, based on availability, container visibility, and pager state.                                                                                                                                                |
| [`available`](!code#context.available 'boolean')         | Whether the element is available (not hidden by conditional logic).                                                                                                                                                                                    |
| [`disabled`](!code#context.disabled 'boolean')           | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`readonly`](!code#context.readonly 'boolean')           | Whether the element is readonly, resolved from the prop, form-level setting, or conditional logic. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly.                                |
| [`focused`](!code#context.focused 'boolean')             | Whether the element is currently focused.                                                                                                                                                                                                              |
| [`touched`](!code#context.touched 'boolean')             | Whether the element has been touched (blurred) by the user.                                                                                                                                                                                            |
| [`visited`](!code#context.visited 'boolean')             | Whether the element has been visited (focused) by the user.                                                                                                                                                                                            |
| [`dirty`](!code#context.dirty 'boolean')                 | Whether the current model value differs from the initial model value.                                                                                                                                                                                  |
| [`loading`](!code#context.loading 'boolean')             | Whether the element is in a loading state, true when pending, explicitly set to loading, or resolved via conditions.                                                                                                                                   |
| [`empty`](!code#context.empty 'boolean')                 | Whether the element's current value is empty. For isContainer.value containers, checks whether all children are empty. For leaf elements, checks whether the value is blank or equals the falseValue.                                                  |
| [`busy`](!code#context.busy 'boolean')                   | Whether the element is busy, meaning it is either debouncing or has pending async validation.                                                                                                                                                          |
| [`hoisted`](!code#context.hoisted 'boolean \| undefined') | Whether this element pushes its errors to its nearest ancestor element instead of displaying and reporting them itself.                                                                                                                                |
| [`enable()`](!code#context.enable '() => void')          | Programmatically enables the element.                                                                                                                                                                                                                  |
| [`disable()`](!code#context.disable '() => void')        | Programmatically disables the element.                                                                                                                                                                                                                 |

### Validation {#section-validation}

| Name                                                                                                                                 | Description                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`invalid`](!code#context.invalid 'boolean')                                                                                         | Whether any of the element's validations (across all languages) are currently invalid, including children.                                                                                                                                                                                                                            |
| [`validated`](!code#context.validated 'boolean')                                                                                     | Whether all of the element's validations (across all languages) have been executed, including children.                                                                                                                                                                                                                               |
| [`completed`](!code#context.completed 'boolean')                                                                                     | Whether the element is completed, meaning it either has no rules or has been validated without errors.                                                                                                                                                                                                                                |
| [`success`](!code#context.success 'boolean')                                                                                         |                                                                                                                                                                                                                                                                                                                                       |
| [`pending`](!code#context.pending 'boolean')                                                                                         | Whether any of the element's validations are currently pending an async check, including children.                                                                                                                                                                                                                                    |
| [`debouncing`](!code#context.debouncing 'boolean')                                                                                   | Whether any of the element's validations are currently debouncing, including children.                                                                                                                                                                                                                                                |
| [`errors`](!code#context.errors 'any[]')                                                                                             | All error messages for this element: its own plus any pushed up by hoisted children.                                                                                                                                                                                                                                                  |
| [`hasError`](!code#context.hasError 'boolean')                                                                                       | Whether the element has any active error messages.                                                                                                                                                                                                                                                                                    |
| [`displayErrors`](!code#context.displayErrors 'any[]')                                                                               | The error messages rendered for this element. Empty when the element pushes its errors to its parent; otherwise errors capped by `maxErrors`.                                                                                                                                                                                         |
| [`ownErrors`](!code#context.ownErrors 'string[]')                                                                                    | The element's own error messages across all languages (validation rules plus custom message bag entries).                                                                                                                                                                                                                             |
| [`formErrors`](!code#context.formErrors 'object')                                                                                    | Error messages propagated to the form, keyed by element path. Empty when the element pushes its errors to its parent.                                                                                                                                                                                                                 |
| [`messages`](!code#context.messages 'string[]')                                                                                      | The list of custom messages from the message bag, including messages from hoisted children.                                                                                                                                                                                                                                           |
| [`messageBag`](!code#context.messageBag 'MessageBagInstance')                                                                        | The element's message bag for managing custom errors, messages, and prepended/appended messages.                                                                                                                                                                                                                                      |
| [`required`](!code#context.required 'boolean')                                                                                       |                                                                                                                                                                                                                                                                                                                                       |
| [`genericName`](!code#context.genericName 'string')                                                                                  | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop.                                                                                                                                                                                                                            |
| [`validate()`](!code#context.validate '(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>')                 | Runs validation on the element's own rules and all children, returning whether everything is valid. Elements already validated without errors against their current value are skipped unless `force: true` re-runs everything — for rules whose outcome can change without the value changing (async server checks, date boundaries). |
| [`validateSelf()`](!code#context.validateSelf '() => Promise<boolean>')                                                              |                                                                                                                                                                                                                                                                                                                                       |
| [`validateChildren()`](!code#context.validateChildren '(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>') | Validates stateful children, returning whether all are valid. By default only incomplete children run — never-validated, stale, or invalid ones; children validated without errors against their current value keep their result. `force: true` runs every child regardless of prior results.                                         |
| [`validateCurrent()`](!code#context.validateCurrent '() => Promise<boolean>')                                                        |                                                                                                                                                                                                                                                                                                                                       |
| [`invalidate()`](!code#context.invalidate '() => void')                                                                              | Marks all validation instances as invalidated, requiring revalidation. For isContainer.value containers, also delegates to children.                                                                                                                                                                                                  |
| [`unvalidate()`](!code#context.unvalidate '() => void')                                                                              | Resets all validation state. For isContainer.value containers, also delegates to children.                                                                                                                                                                                                                                            |
| [`filled()`](!code#context.filled '(value: any) => boolean')                                                                         | Checks whether a value is considered filled. For isContainer.value containers, delegates to children. For leaf elements, checks the scalar value.                                                                                                                                                                                     |
| [`clean()`](!code#context.clean '() => void')                                                                                        | Marks the element as clean by updating the initial model snapshot. For isContainer.value containers, delegates to children.                                                                                                                                                                                                           |
| [`clearErrors()`](!code#context.clearErrors '() => void')                                                                            | Clears all error messages from the message bag.                                                                                                                                                                                                                                                                                       |
| [`clearMessages()`](!code#context.clearMessages '() => void')                                                                        | Clears all custom messages from the message bag.                                                                                                                                                                                                                                                                                      |
| [`clearMessageBag()`](!code#context.clearMessageBag '() => void')                                                                    | Clears the entire message bag, removing both errors and messages.                                                                                                                                                                                                                                                                     |

### Layout {#section-layout}

| Name                                                                                                                                  | Description                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input`](!code#context.input 'any')                                                                                                  | Ref to the underlying input element.                                                                                                          |
| [`id`](!code#context.id 'string')                                                                                                     | The resolved element id, using the id prop or falling back to the auto-generated uid.                                                         |
| [`label`](!code#context.label 'string \| undefined')                                                                                   | The resolved label text for the element.                                                                                                      |
| [`help`](!code#context.help 'string')                                                                                                 | The resolved help text for the element.                                                                                                       |
| [`placeholder`](!code#context.placeholder 'string \| (string & {}) \| undefined')                                                       | The resolved placeholder text, supporting static strings and dynamic text props.                                                              |
| [`page`](!code#context.page 'PageProp \| undefined')                                                                                   | Page metadata for stepped/tabbed forms.                                                                                                       |
| [`addonable`](!code#context.addonable 'true')                                                                                         | Whether this element supports before/after addons.                                                                                            |
| [`addonsBefore`](!code#context.addonsBefore 'AddonItem[]')                                                                            | Array of resolved before-addons, each an individual `AddonItem` for `VfAddon`.                                                                |
| [`addonsAfter`](!code#context.addonsAfter 'AddonItem[]')                                                                              | Array of resolved after-addons, each an individual `AddonItem` for `VfAddon`.                                                                 |
| [`iconBefore`](!code#context.iconBefore 'string \| undefined')                                                                         | The resolved CSS class string for the icon displayed before the input.                                                                        |
| [`iconAfter`](!code#context.iconAfter 'string \| undefined')                                                                           | The resolved CSS class string for the icon displayed after the input.                                                                         |
| [`classes`](!code#context.classes 'object')                                                                                           | The resolved CSS class map for the component.                                                                                                 |
| [`parts`](!code#context.parts 'object')                                                                                               | The resolved DOM attribute overrides for internal elements.                                                                                   |
| [`viewLoaded`](!code#context.viewLoaded 'boolean')                                                                                    | Whether the element's view has been loaded (used for lazy rendering optimization).                                                            |
| [`$el`](!code#context.$el 'HTMLElement \| null')                                                                                       | Reference to the component's root DOM element.                                                                                                |
| [`resolvedColumns`](!code#context.resolvedColumns 'object')                                                                           | Resolved column sizes per breakpoint, normalized into container/label/wrapper/group values.                                                   |
| [`updateColumns()`](!code#context.updateColumns '(v: any) => any')                                                                    | Updates the column configuration programmatically.                                                                                            |
| [`scrollTo()`](!code#context.scrollTo '(options: ScrollIntoViewOptions \| undefined, force: boolean \| undefined) => Promise<boolean>') | Scrolls the window to this element. If the element belongs to a step or tab, that page is selected first before scrolling.                    |
| [`focus()`](!code#context.focus '(scroll: boolean \| undefined) => Promise<boolean>')                                                  | Focuses the first focusable HTML element (input, select, textarea, button, etc.) within the wrapper. Optionally scrolls to the element first. |

### Tree {#section-tree}

| Name                                                                                          | Description                                                                                  |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`form$`](!code#context.form$ 'VfFormContext<EntryProps<Record<string, any>>> \| undefined')   | The parent form's context, providing access to form-level state and methods.                 |
| [`path`](!code#context.path 'string')                                                         | The element's dot-notation path in the form tree (e.g. "user.name").                         |
| [`componentName`](!code#context.componentName 'keyof ComponentRegistry<Record<string, any>>') | The resolved Vue component name for this element.                                            |
| [`container`](!code#context.container 'ContainerContext \| undefined')                         | The container context providing path, model, and registration methods for child elements.    |
| [`children`](!code#context.children 'VueformChildren')                                        | The child element registry providing registration, unregistration, and reactive child lists. |

### Internationalization {#section-i18n}

| Name                                                           | Description                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| [`language`](!code#context.language 'string')                  | The currently active language for translatable elements.       |
| [`languages`](!code#context.languages 'ResolvedLanguagesProp') | Resolved map of available languages for translatable elements. |
| [`languageId`](!code#context.languageId 'string \| undefined')  | Unique DOM id for the language indicator element.              |
| [`translatable`](!code#context.translatable 'boolean')         | Whether the element is in translatable (multilingual) mode.    |

### Handlers {#section-handlers}

| Name                                                                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`handleInput()`](!code#context.handleInput '(payload: any, e: Event \| undefined) => void') | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it. Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends. The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only adopted while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
| [`handleKeydown()`](!code#context.handleKeydown '(e: Event) => any')                        | Fires the keydown event on the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| [`handleKeyup()`](!code#context.handleKeyup '(e: Event) => any')                            | Fires the keyup event on the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| [`handleKeypress()`](!code#context.handleKeypress '(e: Event) => any')                      | Fires the keypress event on the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| [`handleBlur()`](!code#context.handleBlur '(e: Event) => void')                             | Fires the blur event on the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| [`handleFocus()`](!code#context.handleFocus '(e: Event) => void')                           | Handles focus by setting the focused state and firing the focus event.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### Accessibility {#section-a11y}

| Name                                        | Description                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| [`uid`](!code#context.uid 'string')         | A unique auto-generated identifier for the element.                     |
| [`aria`](!code#context.aria 'object')       | Computed ARIA attributes including language-aware describedby and lang. |
| [`helpId`](!code#context.helpId 'string')   | The DOM id for the element's help text region.                          |
| [`errorId`](!code#context.errorId 'string') | The DOM id for the element's error message region.                      |
| [`labelId`](!code#context.labelId 'string') | The DOM id for the element's label region.                              |

<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->
<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/events) for details.

<!-- @events-start -->

| Name                | Params                                                                                                                                                | Description                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `change`            | [`newValue`](!code#events.change.newValue 'T'), [`oldValue`](!code#events.change.oldValue 'T'), [`context$`](!code#events.change.context$ 'TContext') | Emitted when the element value changes.                                            |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value 'T')                                                                                                   | Emitted to update the v-model binding.                                             |
| `load`              | [`value`](!code#events.load.value 'T'), [`context$`](!code#events.load.context$ 'TContext')                                                           | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset`             | [`context$`](!code#events.reset.context$ 'TContext')                                                                                                  | Emitted when the element is reset to its default value.                            |
| `clear`             | [`context$`](!code#events.clear.context$ 'TContext')                                                                                                  | Emitted when the element's value is cleared.                                       |
| `invalid`           | [`context$`](!code#events.invalid.context$ 'TContext')                                                                                                | Emitted when the element becomes invalid.                                          |
| `valid`             | [`context$`](!code#events.valid.context$ 'TContext')                                                                                                  | Emitted when the element becomes valid after having been invalid.                  |
| `input`             | [`value`](!code#events.input.value 'V'), [`e`](!code#events.input.e 'Event \| undefined'), [`context$`](!code#events.input.context$ 'TContext')        | Emitted when the input value is changed via the UI by the user.                    |
| `keydown`           | [`event`](!code#events.keydown.event 'Event'), [`context$`](!code#events.keydown.context$ 'TContext')                                                 | Emitted on keydown, passes the keyboard event and component context.               |
| `keyup`             | [`event`](!code#events.keyup.event 'Event'), [`context$`](!code#events.keyup.context$ 'TContext')                                                     | Emitted on keyup, passes the keyboard event and component context.                 |
| `keypress`          | [`event`](!code#events.keypress.event 'Event'), [`context$`](!code#events.keypress.context$ 'TContext')                                               | Emitted on keypress, passes the keyboard event and component context.              |
| `focus`             | [`context$`](!code#events.focus.context$ 'TContext')                                                                                                  | Emitted when the element receives focus.                                           |
| `blur`              | [`context$`](!code#events.blur.context$ 'TContext')                                                                                                   | Emitted when the element loses focus.                                              |
| `beforeMount`       | [`context$`](!code#events.beforeMount.context$ 'TContext')                                                                                            | Emitted before the component is mounted.                                           |
| `mounted`           | [`context$`](!code#events.mounted.context$ 'TContext')                                                                                                | Emitted after the component is mounted.                                            |
| `beforeUnmount`     | [`context$`](!code#events.beforeUnmount.context$ 'TContext')                                                                                          | Emitted before the component is unmounted.                                         |
| `unmounted`         | [`context$`](!code#events.unmounted.context$ 'TContext')                                                                                              | Emitted after the component is unmounted.                                          |
| `updated`           | [`context$`](!code#events.updated.context$ 'TContext')                                                                                                | Emitted after the component is updated.                                            |

<!-- @events-end -->

<!-- @endtab -->
<!-- @tab Slots -->

## Slots

Named [Slots](/guide/slots) for replacing parts of the component's rendering.

<!-- @slots-start -->

| Name          | Scope                                                                                                            | Description                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `template`    | [`context`](!code#slot.template.context 'TContext')                                                              | Slot that replaces the entire component rendering. Receives the full component context as a single `context` prop. |
| `label`       | [`label`](!code#slot.label.label 'string')                                                                       | Slot for customizing the element's label content.                                                                  |
| `required`    | —                                                                                                                | Slot for customizing the required indicator.                                                                       |
| `help`        | [`help`](!code#slot.help.help 'string')                                                                          | Slot for customizing the help text.                                                                                |
| `addonBefore` | [`addonBefore`](!code#slot.addonBefore.addonBefore 'AddonProp \| undefined')                                      | Slot that replaces the before-addons section.                                                                      |
| `addonAfter`  | [`addonAfter`](!code#slot.addonAfter.addonAfter 'AddonProp \| undefined')                                         | Slot that replaces the after-addons section.                                                                       |
| `iconBefore`  | [`iconBefore`](!code#slot.iconBefore.iconBefore 'string \| undefined')                                            | Slot that replaces the icon rendered before the input.                                                             |
| `iconAfter`   | [`iconAfter`](!code#slot.iconAfter.iconAfter 'string \| undefined')                                               | Slot that replaces the icon rendered after the input.                                                              |
| `language`    | [`language`](!code#slot.language.language 'string') [`languages`](!code#slot.language.languages 'LanguagesProp') | Slot that replaces the language selector rendering.                                                                |
| `description` | [`description`](!code#slot.description.description 'string')                                                     | Slot for customizing the description text.                                                                         |
| `errors`      | [`errors`](!code#slot.errors.errors 'string[]')                                                                  | Slot for customizing the validation errors display.                                                                |
| `messages`    | [`messages`](!code#slot.messages.messages 'string[]')                                                            | Slot for customizing the info messages display.                                                                    |

<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts
component="VfTextarea"
:examples="{
default: 'Default',
icons: 'With Icons',
addons: 'With Addons',
multilingual: 'Multilingual',
}"
:schema="{
label: 'Bio',
help: 'Markdown is supported',
hint: 'Tell others a bit about yourself',
rules: 'required',
showRequired: ['label'],
onMounted: ({ messageBag }) => {
messageBag.append('Bio must be at least 20 characters', 'error')
messageBag.append('Bio saved successfully', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfTextarea
      name="default"
      v-bind="schema"
    />
</template>
<template #example-icons="{ schema }">
<VfTextarea
      name="icons"
      v-bind="schema"
      icon-before="pencil"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfTextarea
      name="addons"
      v-bind="schema"
      addon-before="Note:"
      addon-after="*"
    />
</template>
<template #example-multilingual="{ schema }">
<VfTextarea
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

<!-- @parts-start -->

### `panel`

The wrapper around `root` with `display: contents` when the element is a step or a tab.

|             |             |
| ----------- | ----------- |
| **Element** | `<div>`     |
| **Classes** | `.vf-panel` |

### `root`

The element's root wrapper.

|             |                                                                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Element** | `<div>` `<fieldset>`                                                                                                                                                                                          |
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-textarea` `.vf-align-label?` |

### `labelGroup`

The container holding the label and required indicator.

|             |                                                                               |
| ----------- | ----------------------------------------------------------------------------- |
| **Element** | `<div>`                                                                       |
| **Classes** | `.vf-label-group` `.vf-h1?` `.vf-h2?` `.vf-h3?` `.vf-h4?` `.vf-h5?` `.vf-h6?` |

### `label`

The label element.

|             |                                                              |
| ----------- | ------------------------------------------------------------ |
| **Element** | `<label>` `<span>` `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` |
| **Classes** | `.vf-label`                                                  |

### `required`

The required indicator.

|             |                |
| ----------- | -------------- |
| **Element** | `<div>`        |
| **Classes** | `.vf-required` |

### `elementGroup`

The container wrapping the input and related UI.

|             |                     |
| ----------- | ------------------- |
| **Element** | `<div>`             |
| **Classes** | `.vf-element-group` |

### `elementWrapper`

The wrapper directly around the input control.

|             |                       |
| ----------- | --------------------- |
| **Element** | `<div>`               |
| **Classes** | `.vf-element-wrapper` |

### `help`

The help text area.

|             |            |
| ----------- | ---------- |
| **Element** | `<div>`    |
| **Classes** | `.vf-help` |

### `addonGroup`

The addon group wrapper element.

|             |                   |
| ----------- | ----------------- |
| **Element** | `<div>`           |
| **Classes** | `.vf-addon-group` |

### `input`

The textarea element.

|             |                                                                                 |
| ----------- | ------------------------------------------------------------------------------- |
| **Element** | `<textarea>`                                                                    |
| **Classes** | `.vf-input` `.vf-textarea-input` `.vf-resizable?` `.vf-autogrow?` `.vf-danger?` |

### `addonBefore`

An individual addon rendered before the input.

|             |                             |
| ----------- | --------------------------- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `addonAfter`

An individual addon rendered after the input.

|             |                             |
| ----------- | --------------------------- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `iconBefore`

The icon rendered before the input.

|             |                           |
| ----------- | ------------------------- |
| **Element** | [`<VfIcon>`](./VfIcon.md) |

### `iconAfter`

The icon rendered after the input.

|             |                           |
| ----------- | ------------------------- |
| **Element** | [`<VfIcon>`](./VfIcon.md) |

### `iconGroup`

The wrapper element grouping icons and the input.

|             |                  |
| ----------- | ---------------- |
| **Element** | `<div>`          |
| **Classes** | `.vf-icon-group` |

### `language`

The language selector addon rendered alongside the input.

|             |                             |
| ----------- | --------------------------- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `description`

The description text area.

|             |                   |
| ----------- | ----------------- |
| **Element** | `<div>`           |
| **Classes** | `.vf-description` |

### `errors`

The validation errors container.

|             |              |
| ----------- | ------------ |
| **Element** | `<div>`      |
| **Classes** | `.vf-errors` |

### `error`

An individual validation error.

|             |             |
| ----------- | ----------- |
| **Element** | `<div>`     |
| **Classes** | `.vf-error` |

### `messages`

The info messages container.

|             |                |
| ----------- | -------------- |
| **Element** | `<div>`        |
| **Classes** | `.vf-messages` |

### `message`

An individual info message.

|             |               |
| ----------- | ------------- |
| **Element** | `<div>`       |
| **Classes** | `.vf-message` |

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
   * Element tokens
   * -------------------------------------------------------------------------- */
  --vf-input-color: var(--vf-gray-800);
  --vf-input-color-danger: var(--vf-gray-800);
  --vf-input-color-disabled: var(--vf-text-disabled);

  --vf-input-ring-color: var(--vf-brand);
  --vf-input-ring-color-danger: var(--vf-brand);
  --vf-input-ring-offset: -1px;
  --vf-input-ring-shadow: none;
  --vf-input-ring-shadow-danger: none;
  --vf-input-ring-style: solid;
  --vf-input-ring-width: 1px;

  --vf-input-bg: var(--vf-white);
  --vf-input-bg-danger: var(--vf-white);
  --vf-input-bg-disabled: var(--vf-bg-disabled);

  --vf-input-border-color: var(--vf-gray-300);
  --vf-input-border-color-danger: var(--vf-gray-300);
  --vf-input-border-color-disabled: var(--vf-border-disabled);
  --vf-input-border-style: solid;
  --vf-input-border-width-b: var(--vf-border-width-b);
  --vf-input-border-width-l: var(--vf-border-width-l);
  --vf-input-border-width-r: var(--vf-border-width-r);
  --vf-input-border-width-t: var(--vf-border-width-t);
  --vf-input-radius: var(--vf-radius);

  --vf-input-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);

  --vf-input-pb: var(--vf-py);
  --vf-input-pl: var(--vf-px);
  --vf-input-pr: var(--vf-px);
  --vf-input-pt: var(--vf-py);

  --vf-icon-group-width: 2.5rem;

  /**
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  --vf-element-line-color: var(--vf-gray-300);

  --vf-label-font-size: 1rem;
  --vf-label-font-weight: 600;
  --vf-label-group-h-padding: calc(var(--vf-py) + var(--vf-border-width-t)) 0 0 0;
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
   * Element tokens
   * -------------------------------------------------------------------------- */
  inputColor: '$gray800',
  inputColorDanger: '$gray800',
  inputColorDisabled: '$textDisabled',

  inputRingColor: '$brand',
  inputRingColorDanger: '$brand',
  inputRingOffset: '-1px',
  inputRingShadow: 'none',
  inputRingShadowDanger: 'none',
  inputRingStyle: 'solid',
  inputRingWidth: '1px',

  inputBg: '$white',
  inputBgDanger: '$white',
  inputBgDisabled: '$bgDisabled',

  inputBorderColor: '$gray300',
  inputBorderColorDanger: '$gray300',
  inputBorderColorDisabled: '$borderDisabled',
  inputBorderStyle: 'solid',
  inputBorderWidthB: '$borderWidthB',
  inputBorderWidthL: '$borderWidthL',
  inputBorderWidthR: '$borderWidthR',
  inputBorderWidthT: '$borderWidthT',
  inputRadius: '$radius',

  inputShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',

  inputPb: '$py',
  inputPl: '$px',
  inputPr: '$px',
  inputPt: '$py',

  iconGroupWidth: '2.5rem',

  /**
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  elementLineColor: '$gray300',

  labelFontSize: '1rem',
  labelFontWeight: '600',
  labelGroupHPadding: 'calc($py + $borderWidthT) 0 0 0',
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
