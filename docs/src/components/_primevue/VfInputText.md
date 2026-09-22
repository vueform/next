# VfInputText

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!--@include: @/components/_ui/VfText.md#usage-basic-->

<!-- #region usage-float-label -->

## Float Label

The `floatLabel` prop displays a label that floats above the input when focused or filled, using PrimeVue's [FloatLabel](https://primevue.org/floatlabel/) component. The `float` prop controls the label behavior: omit it for the default "over" style, or set it to `'in'` or `'on'` for alternative placements.

::: usage center middle fit

```vue [Preview]
<VfText name="over" float-label="Over Label" />
<VfText name="in" float-label="In Label" float="in" />
<VfText name="on" float-label="On Label" float="on" />
```

```vue [Template]
<VfGroup name="floatLabels">
  <VfText name="over" float-label="Over Label" :columns="4" />
  <VfText name="in" float-label="In Label" float="in" :columns="4" />
  <VfText name="on" float-label="On Label" float="on" :columns="4" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  over: {
    type: 'text',
    floatLabel: 'Over Label',
  },
  in: {
    type: 'text',
    floatLabel: 'In Label',
    float: 'in',
  },
  on: {
    type: 'text',
    floatLabel: 'On Label',
    float: 'on',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-float-label -->

<!-- #region usage-ifta-label -->

## IFTA Label

The `ifta` prop renders an in-field top-aligned label using PrimeVue's [IftaLabel](https://primevue.org/iftalabel/) component. The label stays visible at the top of the input at all times.

::: usage

```vue [Preview]
<VfText name="username" ifta="Username" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  username: {
    type: 'text',
    ifta: 'Username',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-ifta-label -->

<!--@include: @/components/_ui/VfText.md#usage-icons-->
<!--@include: @/components/_ui/VfText.md#usage-text-addons-->
<!--@include: @/components/_ui/VfText.md#usage-element-addons-->
<!--@include: @/components/_ui/VfText.md#usage-translatable-->

<!-- #region usage-hint-text -->

## Hint Text

The `hint` prop displays advisory text below the input, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Use it to provide contextual guidance to the user.

::: usage

```vue [Preview]
<VfText
  name="username"
  hint="Enter your username to reset your password."
/>
```

```vue [Template]
<VfText
  name="username"
  label="Username"
  hint="Enter your username to reset your password."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    hint: 'Enter your username to reset your password.',
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

The `help` prop displays advisory text below the label, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Unlike `hint` (which appears below the input), `help` is positioned directly under the label.

::: usage

```vue [Preview]
<VfText
  name="username"
  help="Letters, numbers and underscores only."
/>
```

```vue [Template]
<VfText
  name="username"
  label="Username"
  help="Letters, numbers and underscores only."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    help: 'Letters, numbers and underscores only.',
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

<!-- #region usage-info -->

## Info

The `info` prop displays an info icon next to the label that shows a tooltip on hover. The element must have a `label` for the info icon to appear. The `infoPosition` prop controls the tooltip placement.

::: usage

```vue [Preview]
<VfText
  name="username"
  info="Your username must be unique and cannot be changed later."
/>
```

```vue [Template]
<VfText
  name="username"
  label="Username"
  info="Your username must be unique and cannot be changed later."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    info: 'Your username must be unique and cannot be changed later.',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-info -->

<!-- #region usage-tooltip -->

## Tooltip

The `tooltip` prop adds a PrimeVue [Tooltip](https://primevue.org/tooltip/) directly on the input element. The `tooltipPos` prop controls the placement (`'top'`, `'bottom'`, `'left'`, or `'right'`).

::: usage

```vue [Preview]
<VfText name="tooltip" tooltip="This field is required" />
```

```vue [Template]
<VfText
  name="tooltip"
  placeholder="Focus me"
  tooltip="This field is required"
/>
```

```vue [Template]
<VfText
  name="tooltip"
  placeholder="Focus me"
  tooltip="This field is required"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  tooltip: {
    type: 'text',
    placeholder: 'Focus me',
    tooltip: 'This field is required',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-tooltip -->

<!--@include: @/components/_ui/VfText.md#usage-loading-->

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
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    placeholder: 'Enter your username',
    columns: { label: 3 },
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

<!-- #region usage-invalid -->

## Invalid

When the `rules` prop is set and validation fails, the input displays an invalid state with error messages below.

::: usage validate

```vue [Preview]
<VfText name="first_name" rules="required" />
<VfText name="last_name" rules="required" />
```

```vue [Template]
<VfGroup name="name">
  <VfText name="first_name" placeholder="First name" rules="required" hoist :columns="6" />
  <VfText name="last_name" placeholder="Last name" rules="required" hoist :columns="6" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  username: {
    type: 'text',
    label: 'Username',
    rules: 'required',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-invalid -->

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

| Prop                                             | Default        | Description                                                                                     |
| ------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------- |
| [`name`](!code#props.name 'ElementName')         | —              | **Required.** The element's unique identifier and path in the current level of form data model. |
| [`type`](!code#props.type 'string')              | `'input-text'` | The element type identifier.                                                                    |
| [`id`](!code#props.id 'TProp<string, TContext>') | —              | The HTML `id` attribute for the input element.                                                  |

### Input {#props-inputtext}

| Prop                                                               | Default  | Description                                                                                                                                                                                 |
| ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`inputType`](!code#props.inputType 'InputTypeProp')               | `'text'` | The HTML input type (e.g. text, email, password).                                                                                                                                           |
| [`autocomplete`](!code#props.autocomplete 'string')                | —        | The HTML `autocomplete` attribute value for the input.                                                                                                                                      |
| [`description`](!code#props.description 'TProp<string, TContext>') | —        | A description text displayed below the element.                                                                                                                                             |
| [`defaultValue`](!code#props.defaultValue 'T')                     | —        | The default/initial value of the element.                                                                                                                                                   |
| [`sensitive`](!code#props.sensitive 'boolean')                     | `false`  | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`readonly`](!code#props.readonly 'ConditionalProp<TContext>')     | —        | Whether the input is read-only.                                                                                                                                                             |
| [`disabled`](!code#props.disabled 'ConditionalProp<TContext>')     | —        | Whether the element is disabled.                                                                                                                                                            |

### I18n {#props-i18n}

| Prop                                                        | Default | Description                                                          |
| ----------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| [`translate`](!code#props.translate 'TTranslate \| boolean') | `false` | Whether the element's value is translatable into multiple languages. |
| [`language`](!code#props.language 'string')                 | —       | The default selected language.                                       |
| [`languages`](!code#props.languages 'LanguagesProp')        | —       | The available languages for translatable content.                    |

### Data {#props-data}

| Prop                                                                                                                                             | Default | Description                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------ |
| [`modelValue`](!code#props.modelValue 'T')                                                                                                       | —       | The current value of the element (v-model).                                                      |
| [`submit`](!code#props.submit 'boolean')                                                                                                         | `true`  | Whether the element value is included in form submission data.                                   |
| [`untrackOn`](!code#props.untrackOn 'UntrackOnProp')                                                                                             | —       | Controls when the element stops tracking user changes.                                           |
| [`detached`](!code#props.detached 'boolean')                                                                                                     | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload '(value: any, context$: VfInputTextContext<VfInputTextProps<TTranslate, TLanguages>>) => any') | —       | Transforms the element's value when submitting the form.                                         |

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
| [`ifta`](!code#props.ifta 'TProp')                                 | —       | The IFTA (in-field top-aligned) label text for the input.                                                                                                                                                     |
| [`floatLabel`](!code#props.floatLabel 'TProp')                     | —       | The floating label text displayed inside the input.                                                                                                                                                           |
| [`float`](!code#props.float 'FloatProp')                           | —       | Floating label behavior mode.                                                                                                                                                                                 |
| [`info`](!code#props.info 'TProp')                                 | —       | Informational text displayed as a tooltip for the element.                                                                                                                                                    |
| [`infoPosition`](!code#props.infoPosition 'InfoPositionProp')      | —       | Position of the info tooltip relative to the info icon.                                                                                                                                                       |
| [`tooltip`](!code#props.tooltip 'TProp')                           | —       | Tooltip text content for the element.                                                                                                                                                                         |
| [`tooltipPos`](!code#props.tooltipPos 'TooltipPosProp')            | —       | Position of the tooltip relative to the element.                                                                                                                                                              |
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

<!-- @props-adapter-start -->

### PrimeVue {#props-primevue}

<!-- @collapsible -->

#### Unavailable PrimeVue Props {#props-unavailable}

Props that are unavailable because Vueform covers them differently.

| Prop                                                                       | Description                                           |
| -------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`fluid`](!code#props.fluid 'boolean \| undefined \| null')                  | Use [`columns`](#props.columns) prop instead.         |
| [`formControl`](!code#props.formControl 'Record<string, any> \| undefined') | Vueform manages form control registration internally. |
| [`invalid`](!code#props.invalid 'boolean \| undefined \| null')              | Managed automatically by Vueform's validation system. |
| [`type`](!code#props.type 'InputTypeHTMLAttribute \| undefined')            | Use [`inputType`](#props.inputType) prop instead.     |

<!-- @endcollapsible -->

<!-- @collapsible closed -->

#### Unaffected PrimeVue Props {#props-unaffected}

PrimeVue props that work exactly the same — Vueform does not modify them.

| Prop                                                                                                                                                                                                                         | Description                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`dt`](!code#props.dt 'DesignToken<any>')                                                                                                                                                                                    | It generates scoped CSS variables using design tokens for the component.                                                                                                                                             |
| [`pt`](!code#props.pt 'PassThrough<InputTextPassThroughOptions>')                                                                                                                                                            | Used to pass attributes to DOM elements inside the component.                                                                                                                                                        |
| [`ptOptions`](!code#props.ptOptions 'PassThroughOptions')                                                                                                                                                                    | Used to configure passthrough(pt) options of the component.                                                                                                                                                          |
| [`size`](!code#props.size "HintedString<'small' | 'large'> | undefined | null")                                                                                                                                              | Defines the size of the component.                                                                                                                                                                                   |
| [`unstyled`](!code#props.unstyled 'boolean')                                                                                                                                                                                 | When enabled, it removes component related styles in the core.                                                                                                                                                       |
| [`variant`](!code#props.variant "HintedString<'outlined' | 'filled'> | undefined | null")                                                                                                                                    | Specifies the input variant of the component.                                                                                                                                                                        |
| [`about`](!code#props.about 'string \| undefined')                                                                                                                                                                            |                                                                                                                                                                                                                      |
| [`accept`](!code#props.accept 'string \| undefined')                                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`accesskey`](!code#props.accesskey 'string \| undefined')                                                                                                                                                                    |                                                                                                                                                                                                                      |
| [`alt`](!code#props.alt 'string \| undefined')                                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`aria-activedescendant`](!code#props.aria-activedescendant 'string \| undefined')                                                                                                                                            | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application.                                                                                                     |
| [`aria-atomic`](!code#props.aria-atomic 'Booleanish \| undefined')                                                                                                                                                            | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute.                                            |
| [`aria-autocomplete`](!code#props.aria-autocomplete "'none' | 'inline' | 'list' | 'both' | undefined")                                                                                                                       | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made.                       |
| [`aria-busy`](!code#props.aria-busy 'Booleanish \| undefined')                                                                                                                                                                | Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user.                                                       |
| [`aria-checked`](!code#props.aria-checked "Booleanish | 'mixed' | undefined")                                                                                                                                                | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.                                                                                                                               |
| [`aria-colcount`](!code#props.aria-colcount 'Numberish \| undefined')                                                                                                                                                         | Defines the total number of columns in a table, grid, or treegrid.                                                                                                                                                   |
| [`aria-colindex`](!code#props.aria-colindex 'Numberish \| undefined')                                                                                                                                                         | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.                                                                                         |
| [`aria-colspan`](!code#props.aria-colspan 'Numberish \| undefined')                                                                                                                                                           | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.                                                                                                                       |
| [`aria-controls`](!code#props.aria-controls 'string \| undefined')                                                                                                                                                            | Identifies the element (or elements) whose contents or presence are controlled by the current element.                                                                                                               |
| [`aria-current`](!code#props.aria-current "Booleanish | 'page' | 'step' | 'location' | 'date' | 'time' | undefined")                                                                                                         | Indicates the element that represents the current item within a container or set of related elements.                                                                                                                |
| [`aria-describedby`](!code#props.aria-describedby 'string \| undefined')                                                                                                                                                      | Identifies the element (or elements) that describes the object.                                                                                                                                                      |
| [`aria-details`](!code#props.aria-details 'string \| undefined')                                                                                                                                                              | Identifies the element that provides a detailed, extended description for the object.                                                                                                                                |
| [`aria-disabled`](!code#props.aria-disabled 'Booleanish \| undefined')                                                                                                                                                        | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.                                                                                                                 |
| [`aria-dropeffect`](!code#props.aria-dropeffect "'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined")                                                                                                       | Indicates what functions can be performed when a dragged object is released on the drop target.                                                                                                                      |
| [`aria-errormessage`](!code#props.aria-errormessage 'string \| undefined')                                                                                                                                                    | Identifies the element that provides an error message for the object.                                                                                                                                                |
| [`aria-expanded`](!code#props.aria-expanded 'Booleanish \| undefined')                                                                                                                                                        | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed.                                                                                                          |
| [`aria-flowto`](!code#props.aria-flowto 'string \| undefined')                                                                                                                                                                | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| [`aria-grabbed`](!code#props.aria-grabbed 'Booleanish \| undefined')                                                                                                                                                          | Indicates an element's "grabbed" state in a drag-and-drop operation.                                                                                                                                                 |
| [`aria-haspopup`](!code#props.aria-haspopup "Booleanish | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined")                                                                                                      | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element.                                                                                       |
| [`aria-hidden`](!code#props.aria-hidden 'Booleanish \| undefined')                                                                                                                                                            | Indicates whether the element is exposed to an accessibility API.                                                                                                                                                    |
| [`aria-invalid`](!code#props.aria-invalid "Booleanish | 'grammar' | 'spelling' | undefined")                                                                                                                                 | Indicates the entered value does not conform to the format expected by the application.                                                                                                                              |
| [`aria-keyshortcuts`](!code#props.aria-keyshortcuts 'string \| undefined')                                                                                                                                                    | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element.                                                                                                                 |
| [`aria-label`](!code#props.aria-label 'string \| undefined')                                                                                                                                                                  | Defines a string value that labels the current element.                                                                                                                                                              |
| [`aria-labelledby`](!code#props.aria-labelledby 'string \| undefined')                                                                                                                                                        | Identifies the element (or elements) that labels the current element.                                                                                                                                                |
| [`aria-level`](!code#props.aria-level 'Numberish \| undefined')                                                                                                                                                               | Defines the hierarchical level of an element within a structure.                                                                                                                                                     |
| [`aria-live`](!code#props.aria-live "'off' | 'assertive' | 'polite' | undefined")                                                                                                                                            | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region.                                                     |
| [`aria-modal`](!code#props.aria-modal 'Booleanish \| undefined')                                                                                                                                                              | Indicates whether an element is modal when displayed.                                                                                                                                                                |
| [`aria-multiline`](!code#props.aria-multiline 'Booleanish \| undefined')                                                                                                                                                      | Indicates whether a text box accepts multiple lines of input or only a single line.                                                                                                                                  |
| [`aria-multiselectable`](!code#props.aria-multiselectable 'Booleanish \| undefined')                                                                                                                                          | Indicates that the user may select more than one item from the current selectable descendants.                                                                                                                       |
| [`aria-orientation`](!code#props.aria-orientation "'horizontal' | 'vertical' | undefined")                                                                                                                                   | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous.                                                                                                                           |
| [`aria-owns`](!code#props.aria-owns 'string \| undefined')                                                                                                                                                                    | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship.      |
| [`aria-placeholder`](!code#props.aria-placeholder 'string \| undefined')                                                                                                                                                      | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format.                  |
| [`aria-posinset`](!code#props.aria-posinset 'Numberish \| undefined')                                                                                                                                                         | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.                                                                |
| [`aria-pressed`](!code#props.aria-pressed "Booleanish | 'mixed' | undefined")                                                                                                                                                | Indicates the current "pressed" state of toggle buttons.                                                                                                                                                             |
| [`aria-readonly`](!code#props.aria-readonly 'Booleanish \| undefined')                                                                                                                                                        | Indicates that the element is not editable, but is otherwise operable.                                                                                                                                               |
| [`aria-relevant`](!code#props.aria-relevant "'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals' | undefined") | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.                                                                                               |
| [`aria-required`](!code#props.aria-required 'Booleanish \| undefined')                                                                                                                                                        | Indicates that user input is required on the element before a form may be submitted.                                                                                                                                 |
| [`aria-roledescription`](!code#props.aria-roledescription 'string \| undefined')                                                                                                                                              | Defines a human-readable, author-localized description for the role of an element.                                                                                                                                   |
| [`aria-rowcount`](!code#props.aria-rowcount 'Numberish \| undefined')                                                                                                                                                         | Defines the total number of rows in a table, grid, or treegrid.                                                                                                                                                      |
| [`aria-rowindex`](!code#props.aria-rowindex 'Numberish \| undefined')                                                                                                                                                         | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.                                                                                               |
| [`aria-rowspan`](!code#props.aria-rowspan 'Numberish \| undefined')                                                                                                                                                           | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.                                                                                                                          |
| [`aria-selected`](!code#props.aria-selected 'Booleanish \| undefined')                                                                                                                                                        | Indicates the current "selected" state of various widgets.                                                                                                                                                           |
| [`aria-setsize`](!code#props.aria-setsize 'Numberish \| undefined')                                                                                                                                                           | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.                                                                            |
| [`aria-sort`](!code#props.aria-sort "'none' | 'ascending' | 'descending' | 'other' | undefined")                                                                                                                             | Indicates if items in a table or grid are sorted in ascending or descending order.                                                                                                                                   |
| [`aria-valuemax`](!code#props.aria-valuemax 'Numberish \| undefined')                                                                                                                                                         | Defines the maximum allowed value for a range widget.                                                                                                                                                                |
| [`aria-valuemin`](!code#props.aria-valuemin 'Numberish \| undefined')                                                                                                                                                         | Defines the minimum allowed value for a range widget.                                                                                                                                                                |
| [`aria-valuenow`](!code#props.aria-valuenow 'Numberish \| undefined')                                                                                                                                                         | Defines the current value for a range widget.                                                                                                                                                                        |
| [`aria-valuetext`](!code#props.aria-valuetext 'string \| undefined')                                                                                                                                                          | Defines the human readable text alternative of aria-valuenow for a range widget.                                                                                                                                     |
| [`autocapitalize`](!code#props.autocapitalize 'string \| undefined')                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`autocorrect`](!code#props.autocorrect 'string \| undefined')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`autofocus`](!code#props.autofocus 'Booleanish \| undefined')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`autosave`](!code#props.autosave 'string \| undefined')                                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`capture`](!code#props.capture "boolean | 'user' | 'environment' | undefined")                                                                                                                                              |                                                                                                                                                                                                                      |
| [`checked`](!code#props.checked 'Booleanish \| any[] \| Set<any> \| undefined')                                                                                                                                                 |                                                                                                                                                                                                                      |
| [`color`](!code#props.color 'string \| undefined')                                                                                                                                                                            |                                                                                                                                                                                                                      |
| [`contenteditable`](!code#props.contenteditable "Booleanish | 'inherit' | 'plaintext-only' | undefined")                                                                                                                     |                                                                                                                                                                                                                      |
| [`contextmenu`](!code#props.contextmenu 'string \| undefined')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`crossorigin`](!code#props.crossorigin 'string \| undefined')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`datatype`](!code#props.datatype 'string \| undefined')                                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`dir`](!code#props.dir 'string \| undefined')                                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`draggable`](!code#props.draggable 'Booleanish \| undefined')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`enterkeyhint`](!code#props.enterkeyhint "'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | undefined")                                                                                                   |                                                                                                                                                                                                                      |
| [`enterKeyHint`](!code#props.enterKeyHint "HTMLAttributes['enterkeyhint']")                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`exportparts`](!code#props.exportparts 'string')                                                                                                                                                                            |                                                                                                                                                                                                                      |
| [`form`](!code#props.form 'string \| undefined')                                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`formaction`](!code#props.formaction 'string \| undefined')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`formenctype`](!code#props.formenctype 'string \| undefined')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`formmethod`](!code#props.formmethod 'string \| undefined')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`formnovalidate`](!code#props.formnovalidate 'Booleanish \| undefined')                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`formtarget`](!code#props.formtarget 'string \| undefined')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`height`](!code#props.height 'Numberish \| undefined')                                                                                                                                                                       |                                                                                                                                                                                                                      |
| [`hidden`](!code#props.hidden "Booleanish | '' | 'hidden' | 'until-found' | undefined")                                                                                                                                      |                                                                                                                                                                                                                      |
| [`indeterminate`](!code#props.indeterminate 'boolean \| undefined')                                                                                                                                                           |                                                                                                                                                                                                                      |
| [`inert`](!code#props.inert 'Booleanish \| undefined')                                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`inlist`](!code#props.inlist 'any')                                                                                                                                                                                         |                                                                                                                                                                                                                      |
| [`innerHTML`](!code#props.innerHTML 'string \| undefined')                                                                                                                                                                    |                                                                                                                                                                                                                      |
| [`inputmode`](!code#props.inputmode "'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined")                                                                                              | Hints at the type of data that might be entered by the user while editing the element or its contents                                                                                                                |
| [`is`](!code#props.is 'string \| undefined')                                                                                                                                                                                  | Specify that a standard HTML element should behave like a defined custom built-in element                                                                                                                            |
| [`itemid`](!code#props.itemid 'string \| undefined')                                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`itemprop`](!code#props.itemprop 'string \| undefined')                                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`itemref`](!code#props.itemref 'string \| undefined')                                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`itemscope`](!code#props.itemscope 'Booleanish \| undefined')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`itemtype`](!code#props.itemtype 'string \| undefined')                                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`lang`](!code#props.lang 'string \| undefined')                                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`list`](!code#props.list 'string \| undefined')                                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`max`](!code#props.max 'Numberish \| undefined')                                                                                                                                                                             |                                                                                                                                                                                                                      |
| [`maxlength`](!code#props.maxlength 'Numberish \| undefined')                                                                                                                                                                 |                                                                                                                                                                                                                      |
| [`min`](!code#props.min 'Numberish \| undefined')                                                                                                                                                                             |                                                                                                                                                                                                                      |
| [`minlength`](!code#props.minlength 'Numberish \| undefined')                                                                                                                                                                 |                                                                                                                                                                                                                      |
| [`multiple`](!code#props.multiple 'Booleanish \| undefined')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`onAbort`](!code#props.onAbort '(payload: UIEvent) => void')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onAnimationcancel`](!code#props.onAnimationcancel '(payload: AnimationEvent) => void')                                                                                                                                     |                                                                                                                                                                                                                      |
| [`onAnimationend`](!code#props.onAnimationend '(payload: AnimationEvent) => void')                                                                                                                                           |                                                                                                                                                                                                                      |
| [`onAnimationiteration`](!code#props.onAnimationiteration '(payload: AnimationEvent) => void')                                                                                                                               |                                                                                                                                                                                                                      |
| [`onAnimationstart`](!code#props.onAnimationstart '(payload: AnimationEvent) => void')                                                                                                                                       |                                                                                                                                                                                                                      |
| [`onAuxclick`](!code#props.onAuxclick '(payload: PointerEvent) => void')                                                                                                                                                     |                                                                                                                                                                                                                      |
| [`onBeforeinput`](!code#props.onBeforeinput '(payload: InputEvent) => void')                                                                                                                                                 |                                                                                                                                                                                                                      |
| [`onBeforetoggle`](!code#props.onBeforetoggle '(payload: ToggleEvent) => void')                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onBlur`](!code#props.onBlur '(payload: FocusEvent) => void')                                                                                                                                                               |                                                                                                                                                                                                                      |
| [`onCancel`](!code#props.onCancel '(payload: Event) => void')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onCanplay`](!code#props.onCanplay '(payload: Event) => void')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onCanplaythrough`](!code#props.onCanplaythrough '(payload: Event) => void')                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onChange`](!code#props.onChange '(payload: Event) => void')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onClick`](!code#props.onClick '(payload: PointerEvent) => void')                                                                                                                                                           |                                                                                                                                                                                                                      |
| [`onCompositionend`](!code#props.onCompositionend '(payload: CompositionEvent) => void')                                                                                                                                     |                                                                                                                                                                                                                      |
| [`onCompositionstart`](!code#props.onCompositionstart '(payload: CompositionEvent) => void')                                                                                                                                 |                                                                                                                                                                                                                      |
| [`onCompositionupdate`](!code#props.onCompositionupdate '(payload: CompositionEvent) => void')                                                                                                                               |                                                                                                                                                                                                                      |
| [`onContextmenu`](!code#props.onContextmenu '(payload: PointerEvent) => void')                                                                                                                                               |                                                                                                                                                                                                                      |
| [`onCopy`](!code#props.onCopy '(payload: ClipboardEvent) => void')                                                                                                                                                           |                                                                                                                                                                                                                      |
| [`onCut`](!code#props.onCut '(payload: ClipboardEvent) => void')                                                                                                                                                             |                                                                                                                                                                                                                      |
| [`onDblclick`](!code#props.onDblclick '(payload: MouseEvent) => void')                                                                                                                                                       |                                                                                                                                                                                                                      |
| [`onDrag`](!code#props.onDrag '(payload: DragEvent) => void')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onDragend`](!code#props.onDragend '(payload: DragEvent) => void')                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`onDragenter`](!code#props.onDragenter '(payload: DragEvent) => void')                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`onDragexit`](!code#props.onDragexit '(payload: DragEvent) => void')                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`onDragleave`](!code#props.onDragleave '(payload: DragEvent) => void')                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`onDragover`](!code#props.onDragover '(payload: DragEvent) => void')                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`onDragstart`](!code#props.onDragstart '(payload: DragEvent) => void')                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`onDrop`](!code#props.onDrop '(payload: DragEvent) => void')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onDurationchange`](!code#props.onDurationchange '(payload: Event) => void')                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onEmptied`](!code#props.onEmptied '(payload: Event) => void')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onEncrypted`](!code#props.onEncrypted '(payload: MediaEncryptedEvent) => void')                                                                                                                                            |                                                                                                                                                                                                                      |
| [`onEnded`](!code#props.onEnded '(payload: Event) => void')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`onError`](!code#props.onError '(payload: Event) => void')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`onFocus`](!code#props.onFocus '(payload: FocusEvent) => void')                                                                                                                                                             |                                                                                                                                                                                                                      |
| [`onFocusin`](!code#props.onFocusin '(payload: FocusEvent) => void')                                                                                                                                                         |                                                                                                                                                                                                                      |
| [`onFocusout`](!code#props.onFocusout '(payload: FocusEvent) => void')                                                                                                                                                       |                                                                                                                                                                                                                      |
| [`onFormdata`](!code#props.onFormdata '(payload: FormDataEvent) => void')                                                                                                                                                    |                                                                                                                                                                                                                      |
| [`onFullscreenchange`](!code#props.onFullscreenchange '(payload: Event) => void')                                                                                                                                            |                                                                                                                                                                                                                      |
| [`onFullscreenerror`](!code#props.onFullscreenerror '(payload: Event) => void')                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onGotpointercapture`](!code#props.onGotpointercapture '(payload: PointerEvent) => void')                                                                                                                                   |                                                                                                                                                                                                                      |
| [`onInput`](!code#props.onInput '(payload: InputEvent) => void')                                                                                                                                                             |                                                                                                                                                                                                                      |
| [`onInvalid`](!code#props.onInvalid '(payload: Event) => void')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onKeydown`](!code#props.onKeydown '(payload: KeyboardEvent) => void')                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`onKeypress`](!code#props.onKeypress '(payload: KeyboardEvent) => void')                                                                                                                                                    |                                                                                                                                                                                                                      |
| [`onKeyup`](!code#props.onKeyup '(payload: KeyboardEvent) => void')                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`onLoad`](!code#props.onLoad '(payload: Event) => void')                                                                                                                                                                    |                                                                                                                                                                                                                      |
| [`onLoadeddata`](!code#props.onLoadeddata '(payload: Event) => void')                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`onLoadedmetadata`](!code#props.onLoadedmetadata '(payload: Event) => void')                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onLoadstart`](!code#props.onLoadstart '(payload: Event) => void')                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`onLostpointercapture`](!code#props.onLostpointercapture '(payload: PointerEvent) => void')                                                                                                                                 |                                                                                                                                                                                                                      |
| [`onMousedown`](!code#props.onMousedown '(payload: MouseEvent) => void')                                                                                                                                                     |                                                                                                                                                                                                                      |
| [`onMouseenter`](!code#props.onMouseenter '(payload: MouseEvent) => void')                                                                                                                                                   |                                                                                                                                                                                                                      |
| [`onMouseleave`](!code#props.onMouseleave '(payload: MouseEvent) => void')                                                                                                                                                   |                                                                                                                                                                                                                      |
| [`onMousemove`](!code#props.onMousemove '(payload: MouseEvent) => void')                                                                                                                                                     |                                                                                                                                                                                                                      |
| [`onMouseout`](!code#props.onMouseout '(payload: MouseEvent) => void')                                                                                                                                                       |                                                                                                                                                                                                                      |
| [`onMouseover`](!code#props.onMouseover '(payload: MouseEvent) => void')                                                                                                                                                     |                                                                                                                                                                                                                      |
| [`onMouseup`](!code#props.onMouseup '(payload: MouseEvent) => void')                                                                                                                                                         |                                                                                                                                                                                                                      |
| [`onPaste`](!code#props.onPaste '(payload: ClipboardEvent) => void')                                                                                                                                                         |                                                                                                                                                                                                                      |
| [`onPause`](!code#props.onPause '(payload: Event) => void')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`onPlay`](!code#props.onPlay '(payload: Event) => void')                                                                                                                                                                    |                                                                                                                                                                                                                      |
| [`onPlaying`](!code#props.onPlaying '(payload: Event) => void')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onPointercancel`](!code#props.onPointercancel '(payload: PointerEvent) => void')                                                                                                                                           |                                                                                                                                                                                                                      |
| [`onPointerdown`](!code#props.onPointerdown '(payload: PointerEvent) => void')                                                                                                                                               |                                                                                                                                                                                                                      |
| [`onPointerenter`](!code#props.onPointerenter '(payload: PointerEvent) => void')                                                                                                                                             |                                                                                                                                                                                                                      |
| [`onPointerleave`](!code#props.onPointerleave '(payload: PointerEvent) => void')                                                                                                                                             |                                                                                                                                                                                                                      |
| [`onPointermove`](!code#props.onPointermove '(payload: PointerEvent) => void')                                                                                                                                               |                                                                                                                                                                                                                      |
| [`onPointerout`](!code#props.onPointerout '(payload: PointerEvent) => void')                                                                                                                                                 |                                                                                                                                                                                                                      |
| [`onPointerover`](!code#props.onPointerover '(payload: PointerEvent) => void')                                                                                                                                               |                                                                                                                                                                                                                      |
| [`onPointerup`](!code#props.onPointerup '(payload: PointerEvent) => void')                                                                                                                                                   |                                                                                                                                                                                                                      |
| [`onProgress`](!code#props.onProgress '(payload: ProgressEvent<EventTarget>) => void')                                                                                                                                       |                                                                                                                                                                                                                      |
| [`onRatechange`](!code#props.onRatechange '(payload: Event) => void')                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`onReset`](!code#props.onReset '(payload: Event) => void')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`onScroll`](!code#props.onScroll '(payload: Event) => void')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onScrollend`](!code#props.onScrollend '(payload: Event) => void')                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`onSecuritypolicyviolation`](!code#props.onSecuritypolicyviolation '(payload: SecurityPolicyViolationEvent) => void')                                                                                                       |                                                                                                                                                                                                                      |
| [`onSeeked`](!code#props.onSeeked '(payload: Event) => void')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onSeeking`](!code#props.onSeeking '(payload: Event) => void')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onSelect`](!code#props.onSelect '(payload: Event) => void')                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`onStalled`](!code#props.onStalled '(payload: Event) => void')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onSubmit`](!code#props.onSubmit '(payload: SubmitEvent) => void')                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`onSuspend`](!code#props.onSuspend '(payload: Event) => void')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onTimeupdate`](!code#props.onTimeupdate '(payload: Event) => void')                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`onToggle`](!code#props.onToggle '(payload: ToggleEvent) => void')                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`onTouchcancel`](!code#props.onTouchcancel '(payload: TouchEvent) => void')                                                                                                                                                 |                                                                                                                                                                                                                      |
| [`onTouchend`](!code#props.onTouchend '(payload: TouchEvent) => void')                                                                                                                                                       |                                                                                                                                                                                                                      |
| [`onTouchmove`](!code#props.onTouchmove '(payload: TouchEvent) => void')                                                                                                                                                     |                                                                                                                                                                                                                      |
| [`onTouchstart`](!code#props.onTouchstart '(payload: TouchEvent) => void')                                                                                                                                                   |                                                                                                                                                                                                                      |
| [`onTransitioncancel`](!code#props.onTransitioncancel '(payload: TransitionEvent) => void')                                                                                                                                  |                                                                                                                                                                                                                      |
| [`onTransitionend`](!code#props.onTransitionend '(payload: TransitionEvent) => void')                                                                                                                                        |                                                                                                                                                                                                                      |
| [`onTransitionrun`](!code#props.onTransitionrun '(payload: TransitionEvent) => void')                                                                                                                                        |                                                                                                                                                                                                                      |
| [`onTransitionstart`](!code#props.onTransitionstart '(payload: TransitionEvent) => void')                                                                                                                                    |                                                                                                                                                                                                                      |
| [`onVolumechange`](!code#props.onVolumechange '(payload: Event) => void')                                                                                                                                                    |                                                                                                                                                                                                                      |
| [`onWaiting`](!code#props.onWaiting '(payload: Event) => void')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`onWheel`](!code#props.onWheel '(payload: WheelEvent) => void')                                                                                                                                                             |                                                                                                                                                                                                                      |
| [`part`](!code#props.part 'string')                                                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`pattern`](!code#props.pattern 'string \| undefined')                                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`prefix`](!code#props.prefix 'string \| undefined')                                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`property`](!code#props.property 'string \| undefined')                                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`radiogroup`](!code#props.radiogroup 'string \| undefined')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`required`](!code#props.required 'Booleanish \| undefined')                                                                                                                                                                  |                                                                                                                                                                                                                      |
| [`resource`](!code#props.resource 'string \| undefined')                                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`results`](!code#props.results 'Numberish \| undefined')                                                                                                                                                                     |                                                                                                                                                                                                                      |
| [`role`](!code#props.role 'string \| undefined')                                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`security`](!code#props.security 'string \| undefined')                                                                                                                                                                      |                                                                                                                                                                                                                      |
| [`spellcheck`](!code#props.spellcheck 'Booleanish \| undefined')                                                                                                                                                              |                                                                                                                                                                                                                      |
| [`src`](!code#props.src 'string \| undefined')                                                                                                                                                                                |                                                                                                                                                                                                                      |
| [`step`](!code#props.step 'Numberish \| undefined')                                                                                                                                                                           |                                                                                                                                                                                                                      |
| [`style`](!code#props.style 'StyleValue \| undefined')                                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`tabindex`](!code#props.tabindex 'Numberish \| undefined')                                                                                                                                                                   |                                                                                                                                                                                                                      |
| [`title`](!code#props.title 'string \| undefined')                                                                                                                                                                            |                                                                                                                                                                                                                      |
| [`typeof`](!code#props.typeof 'string \| undefined')                                                                                                                                                                          |                                                                                                                                                                                                                      |
| [`unselectable`](!code#props.unselectable "'on' | 'off' | undefined")                                                                                                                                                        |                                                                                                                                                                                                                      |
| [`value`](!code#props.value 'any')                                                                                                                                                                                           |                                                                                                                                                                                                                      |
| [`vocab`](!code#props.vocab 'string \| undefined')                                                                                                                                                                            |                                                                                                                                                                                                                      |
| [`width`](!code#props.width 'Numberish \| undefined')                                                                                                                                                                         |                                                                                                                                                                                                                      |

<!-- @endcollapsible -->
<!-- @props-adapter-end -->

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

### InputText {#section-inputtext}

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

Events emitted by the component. See [Events](/guide/event-handlers) for details.

<!-- @events-start -->

| Name                | Params                                                                                                                                                                         | Description                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `change`            | [`newValue`](!code#events.change.newValue 'T'), [`oldValue`](!code#events.change.oldValue 'T'), [`context$`](!code#events.change.context$ 'TContext')                          | Emitted when the element value changes.                                            |
| `valueChange`       | [`value`](!code#events.valueChange.value 'string \| undefined'), [`context$`](!code#events.valueChange.context$ 'VfInputTextContext<VfInputTextProps<TTranslate, TLanguages>>') |                                                                                    |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value 'T')                                                                                                                            | Emitted to update the v-model binding.                                             |
| `load`              | [`value`](!code#events.load.value 'T'), [`context$`](!code#events.load.context$ 'TContext')                                                                                    | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset`             | [`context$`](!code#events.reset.context$ 'TContext')                                                                                                                           | Emitted when the element is reset to its default value.                            |
| `clear`             | [`context$`](!code#events.clear.context$ 'TContext')                                                                                                                           | Emitted when the element's value is cleared.                                       |
| `invalid`           | [`context$`](!code#events.invalid.context$ 'TContext')                                                                                                                         | Emitted when the element becomes invalid.                                          |
| `valid`             | [`context$`](!code#events.valid.context$ 'TContext')                                                                                                                           | Emitted when the element becomes valid after having been invalid.                  |
| `input`             | [`value`](!code#events.input.value 'V'), [`e`](!code#events.input.e 'Event \| undefined'), [`context$`](!code#events.input.context$ 'TContext')                                 | Emitted when the input value is changed via the UI by the user.                    |
| `keydown`           | [`event`](!code#events.keydown.event 'Event'), [`context$`](!code#events.keydown.context$ 'TContext')                                                                          | Emitted on keydown, passes the keyboard event and component context.               |
| `keyup`             | [`event`](!code#events.keyup.event 'Event'), [`context$`](!code#events.keyup.context$ 'TContext')                                                                              | Emitted on keyup, passes the keyboard event and component context.                 |
| `keypress`          | [`event`](!code#events.keypress.event 'Event'), [`context$`](!code#events.keypress.context$ 'TContext')                                                                        | Emitted on keypress, passes the keyboard event and component context.              |
| `focus`             | [`context$`](!code#events.focus.context$ 'TContext')                                                                                                                           | Emitted when the element receives focus.                                           |
| `blur`              | [`context$`](!code#events.blur.context$ 'TContext')                                                                                                                            | Emitted when the element loses focus.                                              |
| `beforeMount`       | [`context$`](!code#events.beforeMount.context$ 'TContext')                                                                                                                     | Emitted before the component is mounted.                                           |
| `mounted`           | [`context$`](!code#events.mounted.context$ 'TContext')                                                                                                                         | Emitted after the component is mounted.                                            |
| `beforeUnmount`     | [`context$`](!code#events.beforeUnmount.context$ 'TContext')                                                                                                                   | Emitted before the component is unmounted.                                         |
| `unmounted`         | [`context$`](!code#events.unmounted.context$ 'TContext')                                                                                                                       | Emitted after the component is unmounted.                                          |
| `updated`           | [`context$`](!code#events.updated.context$ 'TContext')                                                                                                                         | Emitted after the component is updated.                                            |

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
| `info`        | [`info`](!code#slot.info.info 'string')                                                                          | Slot for customizing the info tooltip or helper content.                                                           |
| `ifta`        | [`ifta`](!code#slot.ifta.ifta 'string')                                                                          | Slot for customizing the IFTA label content.                                                                       |
| `help`        | [`help`](!code#slot.help.help 'string')                                                                          | Slot for customizing the help text.                                                                                |
| `description` | [`description`](!code#slot.description.description 'string')                                                     | Slot for customizing the description text.                                                                         |
| `floatLabel`  | [`floatLabel`](!code#slot.floatLabel.floatLabel 'string')                                                        | Slot for customizing the floating label content.                                                                   |
| `addonBefore` | [`addonBefore`](!code#slot.addonBefore.addonBefore 'AddonProp \| undefined')                                      | Slot that replaces the before-addons section.                                                                      |
| `addonAfter`  | [`addonAfter`](!code#slot.addonAfter.addonAfter 'AddonProp \| undefined')                                         | Slot that replaces the after-addons section.                                                                       |
| `iconBefore`  | [`iconBefore`](!code#slot.iconBefore.iconBefore 'string \| undefined')                                            | Slot that replaces the icon rendered before the input.                                                             |
| `iconAfter`   | [`iconAfter`](!code#slot.iconAfter.iconAfter 'string \| undefined')                                               | Slot that replaces the icon rendered after the input.                                                              |
| `language`    | [`language`](!code#slot.language.language 'string') [`languages`](!code#slot.language.languages 'LanguagesProp') | Slot that replaces the language selector rendering.                                                                |
| `errors`      | [`errors`](!code#slot.errors.errors 'string[]')                                                                  | Slot for customizing the validation errors display.                                                                |
| `messages`    | [`messages`](!code#slot.messages.messages 'string[]')                                                            | Slot for customizing the info messages display.                                                                    |

<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts
component="VfInputText"
:examples="{
default: 'Default',
float: 'Float Label',
ifta: 'Ifta',
icons: 'Icons',
addons: 'Addons',
mix: 'Mix',
multilingual: 'Multilingual',
}"
:schema="{
label: 'Username',
help: 'Letters, numbers and underscores only',
hint: 'This will be your public display name',
info: '...',
rules: 'required',
showRequired: ['label'],
onMounted: ({ messageBag }) => {
messageBag.append('Username is already taken', 'error')
messageBag.append('Username is available', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfInputText
      name="default"
      v-bind="schema"
    />
</template>
<template #example-float="{ schema }">
<VfInputText
      name="float"
      v-bind="schema"
      float-label="Username"
      float="on"
      default-value="V0idRush"
    />
</template>
<template #example-ifta="{ schema }">
<VfInputText
      name="float"
      v-bind="schema"
      ifta="Username"
      default-value="V0idRush"
    />
</template>
<template #example-icons="{ schema }">
<VfInputText
      name="icons"
      v-bind="schema"
      icon-before="user"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfInputText
      name="addons"
      v-bind="schema"
      addon-before="https://"
      addon-after=".com"
    />
</template>
<template #example-mix="{ schema }">
<VfInputText
      name="mix"
      v-bind="schema"
      addon-before="https://"
      icon-after="lock"
      float-label="Username"
      float="on"
      default-value="V0idRush"
    />
</template>
<template #example-multilingual="{ schema }">
<VfInputText
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

|             |                                                |
| ----------- | ---------------------------------------------- |
| **Element** | [`<TabPanel>`](https://primevue.org/tabpanel/) |
| **Classes** | `.vf-panel`                                    |

### `root`

The element's root wrapper.

|             |                                                                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Element** | `<div>` `<fieldset>`                                                                                                                                                                                            |
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-input-text` `.vf-align-label?` |

### `labelGroup`

The container holding the label and required indicator.

|             |                                                                               |
| ----------- | ----------------------------------------------------------------------------- |
| **Element** | `<div>` `<legend>`                                                            |
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

|             |                                                          |
| ----------- | -------------------------------------------------------- |
| **Element** | `<div>` [`<TabsProps>`](https://primevue.org/tabsprops/) |
| **Classes** | `.vf-element-group`                                      |

### `elementWrapper`

The wrapper directly around the input control.

|             |                       |
| ----------- | --------------------- |
| **Element** | `<div>`               |
| **Classes** | `.vf-element-wrapper` |

### `help`

The help text area.

|             |                                              |
| ----------- | -------------------------------------------- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-help`                                   |

### `input`

The text input element.

|             |                                                  |
| ----------- | ------------------------------------------------ |
| **Element** | [`<InputText>`](https://primevue.org/inputtext/) |

### `info`

Info container.

|             |            |
| ----------- | ---------- |
| **Element** | `<div>`    |
| **Classes** | `.vf-info` |

### `infoIcon`

Icon for displaying info tooltip.

|             |                 |
| ----------- | --------------- |
| **Element** | `<span>`        |
| **Classes** | `.vf-info-icon` |

### `description`

The description text area.

|             |                                              |
| ----------- | -------------------------------------------- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-description`                            |

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

### `addonGroup`

The addon group wrapper element.

|             |         |
| ----------- | ------- |
| **Element** | `<div>` |

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

|             |         |
| ----------- | ------- |
| **Element** | `<div>` |

### `language`

The language selector addon rendered alongside the input.

|             |                             |
| ----------- | --------------------------- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `floatWrapper`

The PrimeVue FloatLabel wrapper around the input.

|             |                                                    |
| ----------- | -------------------------------------------------- |
| **Element** | [`<FloatLabel>`](https://primevue.org/floatlabel/) |

### `float`

The label tag inside PrimeVue FloatLabel.

|             |           |
| ----------- | --------- |
| **Element** | `<label>` |

### `iftaWrapper`

The PrimeVue IftaLabel wrapper around the input.

|             |                                                  |
| ----------- | ------------------------------------------------ |
| **Element** | [`<IftaLabel>`](https://primevue.org/iftalabel/) |

### `ifta`

The label tag inside PrimeVue IftaLabel.

|             |           |
| ----------- | --------- |
| **Element** | `<label>` |

### `errors`

The validation errors container.

|             |                                              |
| ----------- | -------------------------------------------- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-errors`                                 |

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
