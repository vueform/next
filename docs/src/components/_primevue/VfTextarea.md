# VfTextarea

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!--@include: @/components/_ui/VfTextarea.md#usage-basic-->
<!--@include: @/components/_ui/VfTextarea.md#usage-translatable-->
<!--@include: @/components/_ui/VfTextarea.md#usage-icons-->
<!--@include: @/components/_ui/VfTextarea.md#usage-text-addons-->
<!--@include: @/components/_ui/VfTextarea.md#usage-element-addons-->

<!-- #region usage-float-label -->

## Float Label

The `floatLabel` prop displays a label that floats above the textarea when focused or filled, using PrimeVue's [FloatLabel](https://primevue.org/floatlabel/) component. The `float` prop controls the label behavior: omit it for the default "over" style, or set it to `'in'` or `'on'` for alternative placements.

::: usage center middle fit

```vue [Preview]
<VfTextarea name="over" float-label="Over Label" />
<VfTextarea name="in" float-label="In Label" float="in" />
<VfTextarea name="on" float-label="On Label" float="on" />
```

```vue [Template]
<VfGroup name="floatLabels">
  <VfTextarea name="over" float-label="Over Label" :columns="4" />
  <VfTextarea name="in" float-label="In Label" float="in" :columns="4" />
  <VfTextarea name="on" float-label="On Label" float="on" :columns="4" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  over: {
    type: 'textarea',
    floatLabel: 'Over Label',
  },
  in: {
    type: 'textarea',
    floatLabel: 'In Label',
    float: 'in',
  },
  on: {
    type: 'textarea',
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
<VfTextarea name="bio" ifta="Biography" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  bio: {
    type: 'textarea',
    ifta: 'Biography',
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

<!-- #region usage-hint-text -->

## Hint Text

The `hint` prop displays advisory text below the input, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Use it to provide contextual guidance to the user.

::: usage

```vue [Preview]
<VfTextarea
  name="bio"
  hint="Keep it under 200 characters."
/>
```

```vue [Template]
<VfTextarea
  name="bio"
  label="Bio"
  hint="Keep it under 200 characters."
  rules="max:200"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  bio: {
    type: 'textarea',
    label: 'Bio',
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

The `help` prop displays advisory text below the label, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Unlike `hint` (which appears below the input), `help` is positioned directly under the label.

::: usage

```vue [Preview]
<VfTextarea
  name="notes"
  help="Markdown formatting is supported."
/>
```

```vue [Template]
<VfTextarea
  name="notes"
  label="Notes"
  help="Markdown formatting is supported."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  notes: {
    type: 'textarea',
    label: 'Notes',
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

<!-- #region usage-info -->

## Info

The `info` prop displays an info icon next to the label that shows a tooltip on hover. The element must have a `label` for the info icon to appear. The `infoPosition` prop controls the tooltip placement.

::: usage

```vue [Preview]
<VfTextarea
  name="description"
  info="Provide a detailed description to help reviewers understand your changes."
/>
```

```vue [Template]
<VfTextarea
  name="description"
  label="Description"
  info="Provide a detailed description to help reviewers understand your changes."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  description: {
    type: 'textarea',
    label: 'Description',
    info: 'Provide a detailed description to help reviewers understand your changes.',
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
<VfTextarea name="feedback" tooltip="This field is required" />
```

```vue [Template]
<VfTextarea
  name="feedback"
  placeholder="Leave your feedback"
  tooltip="This field is required"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  feedback: {
    type: 'textarea',
    placeholder: 'Leave your feedback',
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

<!--@include: @/components/_ui/VfTextarea.md#usage-loading-->

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
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  description: {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter a description',
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
<VfTextarea name="bio" rules="required" />
```

```vue [Template]
<VfTextarea
  name="bio"
  label="Bio"
  placeholder="Tell us about yourself"
  rules="required"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  bio: {
    type: 'textarea',
    label: 'Bio',
    placeholder: 'Tell us about yourself',
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

| Prop | Default | Description |
| --- | --- | --- |
| [`name`](!code#props.name "ElementName") | — | **Required.** The element's unique identifier and path in the current level of form data model. |
| [`type`](!code#props.type "string") | `'textarea'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Input {#props-textarea}

| Prop | Default | Description |
| --- | --- | --- |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`defaultValue`](!code#props.defaultValue "T") | — | The default/initial value of the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`readonly`](!code#props.readonly "ConditionalProp<TContext>") | — | Whether the input is read-only. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |

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
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`untrackOn`](!code#props.untrackOn "UntrackOnProp") | — | Controls when the element stops tracking user changes. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>) => any") | — | Transforms the element's value when submitting the form. |

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

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`placeholder`](!code#props.placeholder "TProp<string, TContext>") | — | The placeholder text displayed when the element is empty. |
| [`ifta`](!code#props.ifta "TProp") | — | The IFTA (in-field top-aligned) label text for the input. |
| [`floatLabel`](!code#props.floatLabel "TProp") | — | The floating label text displayed inside the input. |
| [`float`](!code#props.float "FloatProp") | — | Floating label behavior mode. |
| [`info`](!code#props.info "TProp") | — | Informational text displayed as a tooltip for the element. |
| [`infoPosition`](!code#props.infoPosition "InfoPositionProp") | — | Position of the info tooltip relative to the info icon. |
| [`tooltip`](!code#props.tooltip "TProp") | — | Tooltip text content for the element. |
| [`tooltipPos`](!code#props.tooltipPos "TooltipPosProp") | — | Position of the tooltip relative to the element. |
| [`addonBefore`](!code#props.addonBefore "AddonProp<TContext>") | — | Content or schema rendered as addons before the input. |
| [`addonAfter`](!code#props.addonAfter "AddonProp<TContext>") | — | Content or schema rendered as addons after the input. |
| [`iconBefore`](!code#props.iconBefore "DProp<string, TContext>") | — | Icon displayed before the input. |
| [`iconAfter`](!code#props.iconAfter "DProp<string, TContext>") | — | Icon displayed after the input. |
| [`loading`](!code#props.loading "ConditionalProp<TContext>") | — | Whether the element is in loading state. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

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

### Accessibility {#props-accessibility}

| Prop | Default | Description |
| --- | --- | --- |
| [`aria`](!code#props.aria "AriaProp") | — | ARIA attributes for accessibility. |

<!-- @endcollapsible -->
<!-- @props-end -->

<!-- @props-adapter-start -->
### PrimeVue {#props-primevue}

<!-- @collapsible -->

#### Unavailable PrimeVue Props {#props-unavailable}

Props that are unavailable because Vueform covers them differently.

| Prop | Description |
| --- | --- |
| [`fluid`](!code#props.fluid "boolean \| undefined") | Use [`columns`](#props.columns) prop instead. |
| [`formControl`](!code#props.formControl "Record<string, any> \| undefined") | Vueform manages form control registration internally. |
| [`invalid`](!code#props.invalid "boolean \| undefined") | Managed automatically by Vueform's validation system. |

<!-- @endcollapsible -->

<!-- @collapsible closed -->

#### Unaffected PrimeVue Props {#props-unaffected}

PrimeVue props that work exactly the same — Vueform does not modify them.

| Prop | Description |
| --- | --- |
| [`autoResize`](!code#props.autoResize "boolean \| undefined") | When present, height of textarea changes as being typed. |
| [`dt`](!code#props.dt "DesignToken<any>") | It generates scoped CSS variables using design tokens for the component. |
| [`pt`](!code#props.pt "PassThrough<TextareaPassThroughOptions>") | Used to pass attributes to DOM elements inside the component. |
| [`ptOptions`](!code#props.ptOptions "PassThroughOptions") | Used to configure passthrough(pt) options of the component. |
| [`size`](!code#props.size "HintedString<'small' \| 'large'> \| undefined") | Defines the size of the component. |
| [`unstyled`](!code#props.unstyled "boolean") | When enabled, it removes component related styles in the core. |
| [`variant`](!code#props.variant "HintedString<'outlined' \| 'filled'> \| undefined \| null") | Specifies the input variant of the component. |
| [`about`](!code#props.about "string \| undefined") | RDFa: the resource the metadata is about. |
| [`accesskey`](!code#props.accesskey "string \| undefined") | Provides a hint for generating a keyboard shortcut for the current element. This attribute consists of a space-separated list of characters. The browser should use the first one that exists on the computer keyboard layout. |
| [`aria-activedescendant`](!code#props.aria-activedescendant "string \| undefined") | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| [`aria-atomic`](!code#props.aria-atomic "Booleanish \| undefined") | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| [`aria-autocomplete`](!code#props.aria-autocomplete "'none' \| 'inline' \| 'list' \| 'both' \| undefined") | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
| [`aria-busy`](!code#props.aria-busy "Booleanish \| undefined") | Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. |
| [`aria-checked`](!code#props.aria-checked "Booleanish \| 'mixed' \| undefined") | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| [`aria-colcount`](!code#props.aria-colcount "Numberish \| undefined") | Defines the total number of columns in a table, grid, or treegrid. |
| [`aria-colindex`](!code#props.aria-colindex "Numberish \| undefined") | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| [`aria-colspan`](!code#props.aria-colspan "Numberish \| undefined") | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| [`aria-controls`](!code#props.aria-controls "string \| undefined") | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| [`aria-current`](!code#props.aria-current "Booleanish \| 'page' \| 'step' \| 'location' \| 'date' \| 'time' \| undefined") | Indicates the element that represents the current item within a container or set of related elements. |
| [`aria-describedby`](!code#props.aria-describedby "string \| undefined") | Identifies the element (or elements) that describes the object. |
| [`aria-details`](!code#props.aria-details "string \| undefined") | Identifies the element that provides a detailed, extended description for the object. |
| [`aria-disabled`](!code#props.aria-disabled "Booleanish \| undefined") | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| [`aria-dropeffect`](!code#props.aria-dropeffect "'none' \| 'copy' \| 'execute' \| 'link' \| 'move' \| 'popup' \| undefined") | Indicates what functions can be performed when a dragged object is released on the drop target. |
| [`aria-errormessage`](!code#props.aria-errormessage "string \| undefined") | Identifies the element that provides an error message for the object. |
| [`aria-expanded`](!code#props.aria-expanded "Booleanish \| undefined") | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| [`aria-flowto`](!code#props.aria-flowto "string \| undefined") | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| [`aria-grabbed`](!code#props.aria-grabbed "Booleanish \| undefined") | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| [`aria-haspopup`](!code#props.aria-haspopup "Booleanish \| 'menu' \| 'listbox' \| 'tree' \| 'grid' \| 'dialog' \| undefined") | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| [`aria-hidden`](!code#props.aria-hidden "Booleanish \| undefined") | Indicates whether the element is exposed to an accessibility API. |
| [`aria-invalid`](!code#props.aria-invalid "Booleanish \| 'grammar' \| 'spelling' \| undefined") | Indicates the entered value does not conform to the format expected by the application. |
| [`aria-keyshortcuts`](!code#props.aria-keyshortcuts "string \| undefined") | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| [`aria-label`](!code#props.aria-label "string \| undefined") | Defines a string value that labels the current element. |
| [`aria-labelledby`](!code#props.aria-labelledby "string \| undefined") | Identifies the element (or elements) that labels the current element. |
| [`aria-level`](!code#props.aria-level "Numberish \| undefined") | Defines the hierarchical level of an element within a structure. |
| [`aria-live`](!code#props.aria-live "'off' \| 'assertive' \| 'polite' \| undefined") | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| [`aria-modal`](!code#props.aria-modal "Booleanish \| undefined") | Indicates whether an element is modal when displayed. |
| [`aria-multiline`](!code#props.aria-multiline "Booleanish \| undefined") | Indicates whether a text box accepts multiple lines of input or only a single line. |
| [`aria-multiselectable`](!code#props.aria-multiselectable "Booleanish \| undefined") | Indicates that the user may select more than one item from the current selectable descendants. |
| [`aria-orientation`](!code#props.aria-orientation "'horizontal' \| 'vertical' \| undefined") | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| [`aria-owns`](!code#props.aria-owns "string \| undefined") | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| [`aria-placeholder`](!code#props.aria-placeholder "string \| undefined") | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format. |
| [`aria-posinset`](!code#props.aria-posinset "Numberish \| undefined") | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| [`aria-pressed`](!code#props.aria-pressed "Booleanish \| 'mixed' \| undefined") | Indicates the current "pressed" state of toggle buttons. |
| [`aria-readonly`](!code#props.aria-readonly "Booleanish \| undefined") | Indicates that the element is not editable, but is otherwise operable. |
| [`aria-relevant`](!code#props.aria-relevant "'additions' \| 'additions removals' \| 'additions text' \| 'all' \| 'removals' \| 'removals additions' \| 'removals text' \| 'text' \| 'text additions' \| 'text removals' \| undefined") | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| [`aria-required`](!code#props.aria-required "Booleanish \| undefined") | Indicates that user input is required on the element before a form may be submitted. |
| [`aria-roledescription`](!code#props.aria-roledescription "string \| undefined") | Defines a human-readable, author-localized description for the role of an element. |
| [`aria-rowcount`](!code#props.aria-rowcount "Numberish \| undefined") | Defines the total number of rows in a table, grid, or treegrid. |
| [`aria-rowindex`](!code#props.aria-rowindex "Numberish \| undefined") | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| [`aria-rowspan`](!code#props.aria-rowspan "Numberish \| undefined") | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| [`aria-selected`](!code#props.aria-selected "Booleanish \| undefined") | Indicates the current "selected" state of various widgets. |
| [`aria-setsize`](!code#props.aria-setsize "Numberish \| undefined") | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| [`aria-sort`](!code#props.aria-sort "'none' \| 'ascending' \| 'descending' \| 'other' \| undefined") | Indicates if items in a table or grid are sorted in ascending or descending order. |
| [`aria-valuemax`](!code#props.aria-valuemax "Numberish \| undefined") | Defines the maximum allowed value for a range widget. |
| [`aria-valuemin`](!code#props.aria-valuemin "Numberish \| undefined") | Defines the minimum allowed value for a range widget. |
| [`aria-valuenow`](!code#props.aria-valuenow "Numberish \| undefined") | Defines the current value for a range widget. |
| [`aria-valuetext`](!code#props.aria-valuetext "string \| undefined") | Defines the human readable text alternative of aria-valuenow for a range widget. |
| [`autocapitalize`](!code#props.autocapitalize "string \| undefined") | Controls whether and how text input is automatically capitalized as it is entered/edited by the user. It can have the following values:<br><br>*   `off` or `none`, no autocapitalization is applied (all letters default to lowercase) *   `on` or `sentences`, the first letter of each sentence defaults to a capital letter; all other letters default to lowercase *   `words`, the first letter of each word defaults to a capital letter; all other letters default to lowercase *   `characters`, all letters should default to uppercase |
| [`autocomplete`](!code#props.autocomplete "string \| undefined") | This attribute indicates whether the value of the control can be automatically completed by the browser. Possible values are:<br><br>*   `off`: The user must explicitly enter a value into this field for every use, or the document provides its own auto-completion method; the browser does not automatically complete the entry. *   `on`: The browser can automatically complete the value based on values that the user has entered during previous uses.<br><br>If the `autocomplete` attribute is not specified on a `<textarea>` element, then the browser uses the `autocomplete` attribute value of the `<textarea>` element's form owner. The form owner is either the [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element that this `<textarea>` element is a descendant of or the form element whose `id` is specified by the `form` attribute of the input element. For more information, see the [`autocomplete`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-autocomplete) attribute in [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server."). |
| [`autocorrect`](!code#props.autocorrect "string \| undefined") | Controls whether autocorrection of editable text is enabled for spelling and/or punctuation errors. |
| [`autofocus`](!code#props.autofocus "Booleanish \| undefined") | This Boolean attribute lets you specify that a form control should have input focus when the page loads. Only one form-associated element in a document can have this attribute specified. |
| [`autosave`](!code#props.autosave "string \| undefined") | Non-standard Safari attribute persisting a search field's value across page loads. |
| [`color`](!code#props.color "string \| undefined") | Sets the color of the rule through color name or hexadecimal value. |
| [`cols`](!code#props.cols "Numberish \| undefined") | The visible width of the text control, in average character widths. If it is specified, it must be a positive integer. If it is not specified, the default value is `20`. |
| [`contenteditable`](!code#props.contenteditable "Booleanish \| 'inherit' \| 'plaintext-only' \| undefined") | An enumerated attribute indicating if the element should be editable by the user. If so, the browser modifies its widget to allow editing. The attribute must take one of the following values:<br><br>*   `true` or the _empty string_, which indicates that the element must be editable; *   `false`, which indicates that the element must not be editable. |
| [`contextmenu`](!code#props.contextmenu "string \| undefined") | The `[**id**](#attr-id)` of a [`<menu>`](https://developer.mozilla.org/docs/Web/HTML/Element/menu "The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.") to use as the contextual menu for this element. |
| [`datatype`](!code#props.datatype "string \| undefined") | RDFa: the datatype of the property's value. |
| [`dir`](!code#props.dir "string \| undefined") | An enumerated attribute indicating the directionality of the element's text. It can have the following values:<br><br>*   `ltr`, which means _left to right_ and is to be used for languages that are written from the left to the right (like English); *   `rtl`, which means _right to left_ and is to be used for languages that are written from the right to the left (like Arabic); *   `auto`, which lets the user agent decide. It uses a basic algorithm as it parses the characters inside the element until it finds a character with a strong directionality, then it applies that directionality to the whole element. |
| [`dirname`](!code#props.dirname "string \| undefined") | Submits the element's text directionality with the form data. |
| [`draggable`](!code#props.draggable "Booleanish \| undefined") | An enumerated attribute indicating whether the element can be dragged, using the [Drag and Drop API](https://developer.mozilla.org/docs/DragDrop/Drag_and_Drop). It can have the following values:<br><br>*   `true`, which indicates that the element may be dragged *   `false`, which indicates that the element may not be dragged. |
| [`enterkeyhint`](!code#props.enterkeyhint "'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send' \| undefined") | An enumerated attribute defining what action label (or icon) to present for the enter key on virtual keyboards. |
| [`enterKeyHint`](!code#props.enterKeyHint "HTMLAttributes['enterkeyhint']") | An enumerated attribute defining what action label (or icon) to present for the enter key on virtual keyboards. |
| [`exportparts`](!code#props.exportparts "string") | Used to transitively export shadow parts from a nested shadow tree into a containing light tree. |
| [`form`](!code#props.form "string \| undefined") | The form element that the `<textarea>` element is associated with (its "form owner"). The value of the attribute must be the `id` of a form element in the same document. If this attribute is not specified, the `<textarea>` element must be a descendant of a form element. This attribute enables you to place `<textarea>` elements anywhere within a document, not just as descendants of form elements. |
| [`hidden`](!code#props.hidden "Booleanish \| '' \| 'hidden' \| 'until-found' \| undefined") | A Boolean attribute indicates that the element is not yet, or is no longer, _relevant_. For example, it can be used to hide elements of the page that can't be used until the login process has been completed. The browser won't render such elements. This attribute must not be used to hide content that could legitimately be shown. |
| [`inert`](!code#props.inert "Booleanish \| undefined") | Indicates that the element and all of its flat tree descendants become _inert_. Modal `<dialog>`s generated with [`showModal()`](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/showModal) escape inertness, meaning that they don't inherit inertness from their ancestors, but can only be made inert by having the `inert` attribute explicitly set on themselves. |
| [`inlist`](!code#props.inlist "any") | RDFa: marks the property value as a member of a list. |
| [`innerHTML`](!code#props.innerHTML "string \| undefined") | The element's content, set as raw HTML. |
| [`inputmode`](!code#props.inputmode "'none' \| 'text' \| 'tel' \| 'url' \| 'email' \| 'numeric' \| 'decimal' \| 'search' \| undefined") | Hints at the type of data that might be entered by the user while editing the element or its contents |
| [`is`](!code#props.is "string \| undefined") | Specify that a standard HTML element should behave like a defined custom built-in element |
| [`itemid`](!code#props.itemid "string \| undefined") | The unique, global identifier of an item. |
| [`itemprop`](!code#props.itemprop "string \| undefined") | Used to add properties to an item. Every HTML element may have an `itemprop` attribute specified, where an `itemprop` consists of a name and value pair. |
| [`itemref`](!code#props.itemref "string \| undefined") | Properties that are not descendants of an element with the `itemscope` attribute can be associated with the item using an `itemref`. It provides a list of element ids (not `itemid`s) with additional properties elsewhere in the document. |
| [`itemscope`](!code#props.itemscope "Booleanish \| undefined") | `itemscope` (usually) works along with `[itemtype](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-itemtype)` to specify that the HTML contained in a block is about a particular item. `itemscope` creates the Item and defines the scope of the `itemtype` associated with it. `itemtype` is a valid URL of a vocabulary (such as [schema.org](https://schema.org/)) that describes the item and its properties context. |
| [`itemtype`](!code#props.itemtype "string \| undefined") | Specifies the URL of the vocabulary that will be used to define `itemprop`s (item properties) in the data structure. `[itemscope](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-itemscope)` is used to set the scope of where in the data structure the vocabulary set by `itemtype` will be active. |
| [`lang`](!code#props.lang "string \| undefined") | Helps define the language of an element: the language that non-editable elements are in, or the language that editable elements should be written in by the user. The attribute contains one “language tag” (made of hyphen-separated “language subtags”) in the format defined in [_Tags for Identifying Languages (BCP47)_](https://www.ietf.org/rfc/bcp/bcp47.txt). [**xml:lang**](#attr-xml:lang) has priority over it. |
| [`maxlength`](!code#props.maxlength "Numberish \| undefined") | The maximum number of characters (unicode code points) that the user can enter. If this value isn't specified, the user can enter an unlimited number of characters. |
| [`minlength`](!code#props.minlength "Numberish \| undefined") | The minimum number of characters (unicode code points) required that the user should enter. |
| [`onAbort`](!code#props.onAbort "(payload: UIEvent) => void") | The loading of a resource has been aborted. |
| [`onAnimationcancel`](!code#props.onAnimationcancel "(payload: AnimationEvent) => void") | Handler for the native `animationcancel` event. |
| [`onAnimationend`](!code#props.onAnimationend "(payload: AnimationEvent) => void") | Handler for the native `animationend` event. |
| [`onAnimationiteration`](!code#props.onAnimationiteration "(payload: AnimationEvent) => void") | Handler for the native `animationiteration` event. |
| [`onAnimationstart`](!code#props.onAnimationstart "(payload: AnimationEvent) => void") | Handler for the native `animationstart` event. |
| [`onAuxclick`](!code#props.onAuxclick "(payload: PointerEvent) => void") | Handler for the native `auxclick` event. |
| [`onBeforeinput`](!code#props.onBeforeinput "(payload: InputEvent) => void") | Handler for the native `beforeinput` event. |
| [`onBeforetoggle`](!code#props.onBeforetoggle "(payload: ToggleEvent) => void") | Handler for the native `beforetoggle` event. |
| [`onBlur`](!code#props.onBlur "(payload: FocusEvent) => void") | An element has lost focus (does not bubble). |
| [`onCanplay`](!code#props.onCanplay "(payload: Event) => void") | The user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content. |
| [`onCanplaythrough`](!code#props.onCanplaythrough "(payload: Event) => void") | The user agent can play the media up to its end without having to stop for further buffering of content. |
| [`onChange`](!code#props.onChange "(payload: Event) => void") | The change event is fired for <input>, <select>, and <textarea> elements when a change to the element's value is committed by the user. |
| [`onClick`](!code#props.onClick "(payload: PointerEvent) => void") | A pointing device button has been pressed and released on an element. |
| [`onCompositionend`](!code#props.onCompositionend "(payload: CompositionEvent) => void") | Handler for the native `compositionend` event. |
| [`onCompositionstart`](!code#props.onCompositionstart "(payload: CompositionEvent) => void") | Handler for the native `compositionstart` event. |
| [`onCompositionupdate`](!code#props.onCompositionupdate "(payload: CompositionEvent) => void") | Handler for the native `compositionupdate` event. |
| [`onContextmenu`](!code#props.onContextmenu "(payload: PointerEvent) => void") | The right button of the mouse is clicked (before the context menu is displayed). |
| [`onCopy`](!code#props.onCopy "(payload: ClipboardEvent) => void") | Handler for the native `copy` event. |
| [`onCut`](!code#props.onCut "(payload: ClipboardEvent) => void") | Handler for the native `cut` event. |
| [`onDblclick`](!code#props.onDblclick "(payload: MouseEvent) => void") | A pointing device button is clicked twice on an element. |
| [`onDrag`](!code#props.onDrag "(payload: DragEvent) => void") | An element or text selection is being dragged (every 350ms). |
| [`onDragend`](!code#props.onDragend "(payload: DragEvent) => void") | A drag operation is being ended (by releasing a mouse button or hitting the escape key). |
| [`onDragenter`](!code#props.onDragenter "(payload: DragEvent) => void") | A dragged element or text selection enters a valid drop target. |
| [`onDragexit`](!code#props.onDragexit "(payload: DragEvent) => void") | Handler for the native `dragexit` event. |
| [`onDragleave`](!code#props.onDragleave "(payload: DragEvent) => void") | A dragged element or text selection leaves a valid drop target. |
| [`onDragover`](!code#props.onDragover "(payload: DragEvent) => void") | An element or text selection is being dragged over a valid drop target (every 350ms). |
| [`onDragstart`](!code#props.onDragstart "(payload: DragEvent) => void") | The user starts dragging an element or text selection. |
| [`onDrop`](!code#props.onDrop "(payload: DragEvent) => void") | An element is dropped on a valid drop target. |
| [`onDurationchange`](!code#props.onDurationchange "(payload: Event) => void") | The duration attribute has been updated. |
| [`onEmptied`](!code#props.onEmptied "(payload: Event) => void") | The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it. |
| [`onEncrypted`](!code#props.onEncrypted "(payload: MediaEncryptedEvent) => void") | Handler for the native `encrypted` event. |
| [`onEnded`](!code#props.onEnded "(payload: Event) => void") | Playback has stopped because the end of the media was reached. |
| [`onError`](!code#props.onError "(payload: Event) => void") | A resource failed to load. |
| [`onFocus`](!code#props.onFocus "(payload: FocusEvent) => void") | An element has received focus (does not bubble). |
| [`onFocusin`](!code#props.onFocusin "(payload: FocusEvent) => void") | Handler for the native `focusin` event. |
| [`onFocusout`](!code#props.onFocusout "(payload: FocusEvent) => void") | Handler for the native `focusout` event. |
| [`onFormdata`](!code#props.onFormdata "(payload: FormDataEvent) => void") | Handler for the native `formdata` event. |
| [`onFullscreenchange`](!code#props.onFullscreenchange "(payload: Event) => void") | Handler for the native `fullscreenchange` event. |
| [`onFullscreenerror`](!code#props.onFullscreenerror "(payload: Event) => void") | Handler for the native `fullscreenerror` event. |
| [`onGotpointercapture`](!code#props.onGotpointercapture "(payload: PointerEvent) => void") | Handler for the native `gotpointercapture` event. |
| [`onInput`](!code#props.onInput "(payload: InputEvent) => void") | The value of an element changes or the content of an element with the attribute contenteditable is modified. |
| [`onInvalid`](!code#props.onInvalid "(payload: Event) => void") | A submittable element has been checked and doesn't satisfy its constraints. |
| [`onKeydown`](!code#props.onKeydown "(payload: KeyboardEvent) => void") | A key is pressed down. |
| [`onKeypress`](!code#props.onKeypress "(payload: KeyboardEvent) => void") | A key is pressed down and that key normally produces a character value (use input instead). |
| [`onKeyup`](!code#props.onKeyup "(payload: KeyboardEvent) => void") | A key is released. |
| [`onLoad`](!code#props.onLoad "(payload: Event) => void") | A resource and its dependent resources have finished loading. |
| [`onLoadeddata`](!code#props.onLoadeddata "(payload: Event) => void") | The first frame of the media has finished loading. |
| [`onLoadedmetadata`](!code#props.onLoadedmetadata "(payload: Event) => void") | The metadata has been loaded. |
| [`onLoadstart`](!code#props.onLoadstart "(payload: Event) => void") | Progress has begun. |
| [`onLostpointercapture`](!code#props.onLostpointercapture "(payload: PointerEvent) => void") | Handler for the native `lostpointercapture` event. |
| [`onMousedown`](!code#props.onMousedown "(payload: MouseEvent) => void") | A pointing device button (usually a mouse) is pressed on an element. |
| [`onMouseenter`](!code#props.onMouseenter "(payload: MouseEvent) => void") | A pointing device is moved onto the element that has the listener attached. |
| [`onMouseleave`](!code#props.onMouseleave "(payload: MouseEvent) => void") | A pointing device is moved off the element that has the listener attached. |
| [`onMousemove`](!code#props.onMousemove "(payload: MouseEvent) => void") | A pointing device is moved over an element. |
| [`onMouseout`](!code#props.onMouseout "(payload: MouseEvent) => void") | A pointing device is moved off the element that has the listener attached or off one of its children. |
| [`onMouseover`](!code#props.onMouseover "(payload: MouseEvent) => void") | A pointing device is moved onto the element that has the listener attached or onto one of its children. |
| [`onMouseup`](!code#props.onMouseup "(payload: MouseEvent) => void") | A pointing device button is released over an element. |
| [`onPaste`](!code#props.onPaste "(payload: ClipboardEvent) => void") | Handler for the native `paste` event. |
| [`onPause`](!code#props.onPause "(payload: Event) => void") | Playback has been paused. |
| [`onPlay`](!code#props.onPlay "(payload: Event) => void") | Playback has begun. |
| [`onPlaying`](!code#props.onPlaying "(payload: Event) => void") | Playback is ready to start after having been paused or delayed due to lack of data. |
| [`onPointercancel`](!code#props.onPointercancel "(payload: PointerEvent) => void") | The pointer is unlikely to produce any more events. |
| [`onPointerdown`](!code#props.onPointerdown "(payload: PointerEvent) => void") | The pointer enters the active buttons state. |
| [`onPointerenter`](!code#props.onPointerenter "(payload: PointerEvent) => void") | Pointing device is moved inside the hit-testing boundary. |
| [`onPointerleave`](!code#props.onPointerleave "(payload: PointerEvent) => void") | Pointing device is moved out of the hit-testing boundary. |
| [`onPointermove`](!code#props.onPointermove "(payload: PointerEvent) => void") | The pointer changed coordinates. |
| [`onPointerout`](!code#props.onPointerout "(payload: PointerEvent) => void") | The pointing device moved out of hit-testing boundary or leaves detectable hover range. |
| [`onPointerover`](!code#props.onPointerover "(payload: PointerEvent) => void") | The pointing device is moved into the hit-testing boundary. |
| [`onPointerup`](!code#props.onPointerup "(payload: PointerEvent) => void") | The pointer leaves the active buttons state. |
| [`onProgress`](!code#props.onProgress "(payload: ProgressEvent<EventTarget>) => void") | In progress. |
| [`onRatechange`](!code#props.onRatechange "(payload: Event) => void") | The playback rate has changed. |
| [`onReset`](!code#props.onReset "(payload: Event) => void") | A form is reset. |
| [`onScroll`](!code#props.onScroll "(payload: Event) => void") | The document view or an element has been scrolled. |
| [`onScrollend`](!code#props.onScrollend "(payload: Event) => void") | Handler for the native `scrollend` event. |
| [`onSecuritypolicyviolation`](!code#props.onSecuritypolicyviolation "(payload: SecurityPolicyViolationEvent) => void") | Handler for the native `securitypolicyviolation` event. |
| [`onSeeked`](!code#props.onSeeked "(payload: Event) => void") | A seek operation completed. |
| [`onSeeking`](!code#props.onSeeking "(payload: Event) => void") | A seek operation began. |
| [`onSelect`](!code#props.onSelect "(payload: Event) => void") | Some text is being selected. |
| [`onStalled`](!code#props.onStalled "(payload: Event) => void") | The user agent is trying to fetch media data, but data is unexpectedly not forthcoming. |
| [`onSubmit`](!code#props.onSubmit "(payload: SubmitEvent) => void") | A form is submitted. |
| [`onSuspend`](!code#props.onSuspend "(payload: Event) => void") | Media data loading has been suspended. |
| [`onTimeupdate`](!code#props.onTimeupdate "(payload: Event) => void") | The time indicated by the currentTime attribute has been updated. |
| [`onToggle`](!code#props.onToggle "(payload: ToggleEvent) => void") | Handler for the native `toggle` event. |
| [`onTouchcancel`](!code#props.onTouchcancel "(payload: TouchEvent) => void") | Handler for the native `touchcancel` event. |
| [`onTouchend`](!code#props.onTouchend "(payload: TouchEvent) => void") | Handler for the native `touchend` event. |
| [`onTouchmove`](!code#props.onTouchmove "(payload: TouchEvent) => void") | Handler for the native `touchmove` event. |
| [`onTouchstart`](!code#props.onTouchstart "(payload: TouchEvent) => void") | Handler for the native `touchstart` event. |
| [`onTransitioncancel`](!code#props.onTransitioncancel "(payload: TransitionEvent) => void") | Handler for the native `transitioncancel` event. |
| [`onTransitionend`](!code#props.onTransitionend "(payload: TransitionEvent) => void") | Handler for the native `transitionend` event. |
| [`onTransitionrun`](!code#props.onTransitionrun "(payload: TransitionEvent) => void") | Handler for the native `transitionrun` event. |
| [`onTransitionstart`](!code#props.onTransitionstart "(payload: TransitionEvent) => void") | Handler for the native `transitionstart` event. |
| [`onVolumechange`](!code#props.onVolumechange "(payload: Event) => void") | The volume has changed. |
| [`onWaiting`](!code#props.onWaiting "(payload: Event) => void") | Playback has stopped because of a temporary lack of data. |
| [`onWheel`](!code#props.onWheel "(payload: WheelEvent) => void") | Handler for the native `wheel` event. |
| [`part`](!code#props.part "string") | A space-separated list of the part names of the element. Part names allows CSS to select and style specific elements in a shadow tree via the [`::part`](https://developer.mozilla.org/docs/Web/CSS/::part "The ::part CSS pseudo-element represents any element within a shadow tree that has a matching part attribute.") pseudo-element. |
| [`prefix`](!code#props.prefix "string \| undefined") | RDFa: prefix mappings for CURIE terms. |
| [`property`](!code#props.property "string \| undefined") | RDFa: the property relating the subject to the value. |
| [`radiogroup`](!code#props.radiogroup "string \| undefined") | The radio group a command of type radio belongs to. |
| [`required`](!code#props.required "Booleanish \| undefined") | This attribute specifies that the user must fill in a value before submitting a form. |
| [`resource`](!code#props.resource "string \| undefined") | RDFa: the resource the property refers to. |
| [`results`](!code#props.results "Numberish \| undefined") | Non-standard Safari attribute limiting the number of recent-search entries shown in a search field. |
| [`role`](!code#props.role "string \| undefined") | The element's ARIA role, defining its purpose for assistive technologies. |
| [`rows`](!code#props.rows "Numberish \| undefined") | The number of visible text lines for the control. |
| [`security`](!code#props.security "string \| undefined") | Non-standard legacy attribute (Internet Explorer) controlling script security in a frame. |
| [`spellcheck`](!code#props.spellcheck "Booleanish \| undefined") | An enumerated attribute defines whether the element may be checked for spelling errors. It may have the following values:<br><br>*   `true`, which indicates that the element should be, if possible, checked for spelling errors; *   `false`, which indicates that the element should not be checked for spelling errors. |
| [`style`](!code#props.style "StyleValue \| undefined") | Contains [CSS](https://developer.mozilla.org/docs/Web/CSS) styling declarations to be applied to the element. Note that it is recommended for styles to be defined in a separate file or files. This attribute and the [`<style>`](https://developer.mozilla.org/docs/Web/HTML/Element/style "The HTML <style> element contains style information for a document, or part of a document.") element have mainly the purpose of allowing for quick styling, for example for testing purposes. |
| [`tabindex`](!code#props.tabindex "Numberish \| undefined") | An integer attribute indicating if the element can take input focus (is _focusable_), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values:<br><br>*   a _negative value_ means that the element should be focusable, but should not be reachable via sequential keyboard navigation; *   `0` means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention; *   a _positive value_ means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the [**tabindex**](#attr-tabindex). If several elements share the same tabindex, their relative order follows their relative positions in the document. |
| [`title`](!code#props.title "string \| undefined") | Contains a text representing advisory information related to the element it belongs to. Such information can typically, but not necessarily, be presented to the user as a tooltip. |
| [`typeof`](!code#props.typeof "string \| undefined") | RDFa: the RDF types of the subject. |
| [`unselectable`](!code#props.unselectable "'on' \| 'off' \| undefined") | Non-standard legacy attribute (Internet Explorer/Opera) preventing text selection. |
| [`value`](!code#props.value "string \| ReadonlyArray<string> \| number \| null \| undefined") | The value of the control. |
| [`vocab`](!code#props.vocab "string \| undefined") | RDFa: the default vocabulary for property and typeof terms. |
| [`wrap`](!code#props.wrap "string \| undefined") | Indicates how the control wraps text. Possible values are:<br><br>*   `hard`: The browser automatically inserts line breaks (CR+LF) so that each line has no more than the width of the control; the `cols` attribute must also be specified for this to take effect. *   `soft`: The browser ensures that all line breaks in the value consist of a CR+LF pair, but does not insert any additional line breaks. *   `off` : Like `soft` but changes appearance to `white-space: pre` so line segments exceeding `cols` are not wrapped and the `<textarea>` becomes horizontally scrollable.<br><br>If this attribute is not specified, `soft` is its default value. |

<!-- @endcollapsible -->
<!-- @props-adapter-end -->
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

### Textarea {#section-textarea}

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
| [`containerModel`](!code#context.containerModel "unknown") | The model ref the element provides to its children via the container context. For flat containers this is the parent's model — children's data lives merged at the parent level, while the public `model` is a scoped projection. For every other element it is the element's own `model`. |
| [`handleModelUpdate()`](!code#context.handleModelUpdate "(data: Event) => void") | Handles a native input event and updates the model from the event target. Text and select inputs use `target.value`. Checkboxes and radios use the `checked` state with `trueValue` / `falseValue` when available. |
| [`initValidation()`](!code#context.initValidation "() => void") | Registers the element with the validator and compiles its rules. |
| [`destroyValidation()`](!code#context.destroyValidation "() => void") | Unregisters the element from the validator and clears its validation views. |
| [`rootModel`](!code#context.rootModel "RootModel \| undefined") | The root model backing the form when this element operates as the form root (adopting a `useModel` instance from `modelValue` or creating an internal store), `undefined` for every other element. |
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. A sensitive element marks its whole subtree; containers otherwise aggregate from children. Unavailable elements are included: their data may still linger in the model, and stripping an absent path is harmless. |
| [`setInputRef()`](!code#context.setInputRef "(el: any) => void") | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `input` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref. |
| [`canonicalDomValue`](!code#context.canonicalDomValue "boolean") | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value adoption and the DOM recovery listeners. |
| [`inputBindings`](!code#context.inputBindings "object") | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners. |
| [`componentBindings`](!code#context.componentBindings "object") | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur. |
| [`autosize()`](!code#context.autosize "() => void") | Adjusts the textarea height to match its scroll height. Temporarily resets height to allow shrinking, then sets it to the content's scroll height. |

### Data {#section-data}

| Name | Description |
| --- | --- |
| [`model`](!code#context.model "Record<string, any> \| any") | The element's reactive model value within the form data tree. |
| [`value`](!code#context.value "any") | The current language-aware value of the element. For translatable elements, returns the value for the active language. |
| [`payload`](!code#context.payload "object") | The element's submission payload. For isContainer.value containers, aggregates from children. For leaf elements, returns own value. |
| [`nullValue`](!code#context.nullValue "any") | The value the element holds when it is considered empty. Determined by `nullValue` / `falseValue` props, element type (container, multiple), and translatable state. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel "Record<string, any> \| any") | A snapshot of the model at initialization time, used for dirty checking and reset. |
| [`dataPath`](!code#context.dataPath "string") | The dot-notation path to this element's value within the form data object (e.g. `"address.city"`). Empty string for the root model. Flat containers inherit their parent's data path. |
| [`tracking`](!code#context.tracking "boolean") | Whether the element's `default` expression is currently tracked and auto-updating the value. |
| [`update()`](!code#context.update "(data: any) => void") | Updates the element's model value. For isContainer.value containers, performs a deep merge. For leaf elements, sets the value directly and invalidates validation. |
| [`load()`](!code#context.load "(data: any) => void") | Loads data into the element and fires the `load` event, cascading to all children so expression tracking can be stopped per-element. |
| [`reset()`](!code#context.reset "() => void") | Resets the element to its initial model state and fires the `reset` event. For isContainer.value containers, delegates to children or resets the model directly for dynamic lists. |
| [`clear()`](!code#context.clear "() => void") | Clears the element to its null value and fires the `clear` event. For isContainer.value containers, delegates to children or clears the model for dynamic lists. |
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
| [`empty`](!code#context.empty "boolean") | Whether the element's current value is empty. For isContainer.value containers, checks whether all children are empty. For leaf elements, checks whether the value is blank or equals the falseValue. |
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
| [`ownErrors`](!code#context.ownErrors "string[]") | The element's own error messages across all languages (validation rules plus custom message bag entries). |
| [`formErrors`](!code#context.formErrors "object") | Error messages propagated to the form, keyed by element path. Empty when the element pushes its errors to its parent. |
| [`messages`](!code#context.messages "string[]") | The list of custom messages from the message bag, including messages from hoisted children. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for managing custom errors, messages, and prepended/appended messages. |
| [`required`](!code#context.required "boolean") | Whether the element is required by its current validation rules. |
| [`genericName`](!code#context.genericName "string") | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop. |
| [`validate()`](!code#context.validate "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Runs validation on the element's own rules and all children, returning whether everything is valid. Elements already validated without errors against their current value are skipped unless `force: true` re-runs everything — for rules whose outcome can change without the value changing (async server checks, date boundaries). |
| [`validateSelf()`](!code#context.validateSelf "() => Promise<boolean>") | Validates the element's own rules (without children), resolving with the result. |
| [`validateChildren()`](!code#context.validateChildren "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Validates stateful children, returning whether all are valid. By default only incomplete children run — never-validated, stale, or invalid ones; children validated without errors against their current value keep their result. `force: true` runs every child regardless of prior results. |
| [`validateCurrent()`](!code#context.validateCurrent "() => Promise<boolean>") | Validates only the active language's value of the element. |
| [`invalidate()`](!code#context.invalidate "() => void") | Marks all validation instances as invalidated, requiring revalidation. For isContainer.value containers, also delegates to children. |
| [`unvalidate()`](!code#context.unvalidate "() => void") | Resets all validation state. For isContainer.value containers, also delegates to children. |
| [`filled()`](!code#context.filled "(value: any) => boolean") | Checks whether a value is considered filled. For isContainer.value containers, delegates to children. For leaf elements, checks the scalar value. |
| [`clean()`](!code#context.clean "() => void") | Marks the element as clean by updating the initial model snapshot. For isContainer.value containers, delegates to children. |
| [`clearErrors()`](!code#context.clearErrors "() => void") | Clears all error messages from the message bag. |
| [`clearMessages()`](!code#context.clearMessages "() => void") | Clears all custom messages from the message bag. |
| [`clearMessageBag()`](!code#context.clearMessageBag "() => void") | Clears the entire message bag, removing both errors and messages. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`input`](!code#context.input "any") | Ref to the underlying input element. |
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
| [`handleInput()`](!code#context.handleInput "(payload: any, e: Event \| undefined) => void") | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it.<br><br>Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends.<br><br>The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only adopted while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
| [`handleKeydown()`](!code#context.handleKeydown "(e: Event) => any") | Fires the keydown event on the element. |
| [`handleKeyup()`](!code#context.handleKeyup "(e: Event) => any") | Fires the keyup event on the element. |
| [`handleKeypress()`](!code#context.handleKeypress "(e: Event) => any") | Fires the keypress event on the element. |
| [`handleBlur()`](!code#context.handleBlur "(e: Event) => void") | Fires the blur event on the element. |
| [`handleFocus()`](!code#context.handleFocus "(e: Event) => void") | Handles focus by setting the focused state and firing the focus event. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | A unique auto-generated identifier for the element. |
| [`aria`](!code#context.aria "object") | Computed ARIA attributes including language-aware describedby and lang. |
| [`helpId`](!code#context.helpId "string") | The DOM id for the element's help text region. |
| [`errorId`](!code#context.errorId "string") | The DOM id for the element's error message region. |
| [`labelId`](!code#context.labelId "string") | The DOM id for the element's label region. |
<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->

<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/event-handlers) for details.

<!-- @events-start -->
| Name | Params | Description |
| --- | --- | --- |
| `change` | [`newValue`](!code#events.change.newValue "T"), [`oldValue`](!code#events.change.oldValue "T"), [`context$`](!code#events.change.context$ "TContext") | Emitted when the element value changes. |
| `valueChange` | [`value`](!code#events.valueChange.value "string"), [`context$`](!code#events.valueChange.context$ "VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>") | Emitted when the value changes in uncontrolled mode. |
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
| `info` | [`info`](!code#slot.info.info "string") | Slot for customizing the info tooltip or helper content. |
| `ifta` | [`ifta`](!code#slot.ifta.ifta "string") | Slot for customizing the IFTA label content. |
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `floatLabel` | [`floatLabel`](!code#slot.floatLabel.floatLabel "string") | Slot for customizing the floating label content. |
| `addonBefore` | [`addonBefore`](!code#slot.addonBefore.addonBefore "AddonProp \| undefined") | Slot that replaces the before-addons section. |
| `addonAfter` | [`addonAfter`](!code#slot.addonAfter.addonAfter "AddonProp \| undefined") | Slot that replaces the after-addons section. |
| `iconBefore` | [`iconBefore`](!code#slot.iconBefore.iconBefore "string \| undefined") | Slot that replaces the icon rendered before the input. |
| `iconAfter` | [`iconAfter`](!code#slot.iconAfter.iconAfter "string \| undefined") | Slot that replaces the icon rendered after the input. |
| `language` | [`language`](!code#slot.language.language "string") [`languages`](!code#slot.language.languages "LanguagesProp") | Slot that replaces the language selector rendering. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts component="VfTextarea"
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
label: 'Bio',
help: 'Markdown is supported',
hint: 'Tell others a bit about yourself',
info: 'Shown publicly on your profile',
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
<template #example-float="{ schema }">
<VfTextarea
      name="float"
      v-bind="schema"
      float-label="Bio"
      float="on"
      default-value="Frontend developer. Coffee enthusiast."
    />
</template>
<template #example-ifta="{ schema }">
<VfTextarea
      name="ifta"
      v-bind="schema"
      ifta="Bio"
      default-value="Frontend developer. Coffee enthusiast."
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
<template #example-mix="{ schema }">
<VfTextarea
      name="mix"
      v-bind="schema"
      addon-before="Note:"
      icon-after="check"
      float-label="Bio"
      float="on"
      default-value="Frontend developer. Coffee enthusiast."
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

| | |
| --- | --- |
| **Element** | [`<TabPanel>`](https://primevue.org/tabpanel/) |
| **Classes** | `.vf-panel` |

### `root`

The element's root wrapper.

| | |
| --- | --- |
| **Element** | `<div>` `<fieldset>` |
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-textarea` `.vf-align-label?` |

### `labelGroup`

The container holding the label and required indicator.

| | |
| --- | --- |
| **Element** | `<div>` `<legend>` |
| **Classes** | `.vf-label-group` `.vf-h1?` `.vf-h2?` `.vf-h3?` `.vf-h4?` `.vf-h5?` `.vf-h6?` |

### `label`

The label element.

| | |
| --- | --- |
| **Element** | `<label>` `<span>` `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` |
| **Classes** | `.vf-label` |

### `required`

The required indicator.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-required` |

### `elementGroup`

The container wrapping the input and related UI.

| | |
| --- | --- |
| **Element** | `<div>` [`<TabsProps>`](https://primevue.org/tabsprops/) |
| **Classes** | `.vf-element-group` |

### `elementWrapper`

The wrapper directly around the input control.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-element-wrapper` |

### `help`

The help text area.

| | |
| --- | --- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-help` |

### `input`

The textarea input element.

| | |
| --- | --- |
| **Element** | [`<Textarea>`](https://primevue.org/textarea/) |

### `info`

Info container.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-info` |

### `infoIcon`

Icon for displaying info tooltip.

| | |
| --- | --- |
| **Element** | `<span>` |
| **Classes** | `.vf-info-icon` |

### `description`

The description text area.

| | |
| --- | --- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-description` |

### `addonBefore`

An individual addon rendered before the input.

| | |
| --- | --- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `addonAfter`

An individual addon rendered after the input.

| | |
| --- | --- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `addonGroup`

The addon group wrapper element.

| | |
| --- | --- |
| **Element** | `<div>` |

### `iconBefore`

The icon rendered before the input.

| | |
| --- | --- |
| **Element** | [`<VfIcon>`](./VfIcon.md) |

### `iconAfter`

The icon rendered after the input.

| | |
| --- | --- |
| **Element** | [`<VfIcon>`](./VfIcon.md) |

### `iconGroup`

The wrapper element grouping icons and the input.

| | |
| --- | --- |
| **Element** | `<div>` |

### `language`

The language selector addon rendered alongside the input.

| | |
| --- | --- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `floatWrapper`

The PrimeVue FloatLabel wrapper around the input.

| | |
| --- | --- |
| **Element** | [`<FloatLabel>`](https://primevue.org/floatlabel/) |

### `float`

The label tag inside PrimeVue FloatLabel.

| | |
| --- | --- |
| **Element** | `<label>` |

### `iftaWrapper`

The PrimeVue IftaLabel wrapper around the input.

| | |
| --- | --- |
| **Element** | [`<IftaLabel>`](https://primevue.org/iftalabel/) |

### `ifta`

The label tag inside PrimeVue IftaLabel.

| | |
| --- | --- |
| **Element** | `<label>` |

### `errors`

The validation errors container.

| | |
| --- | --- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-errors` |

### `error`

An individual validation error.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-error` |

### `messages`

The info messages container.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-messages` |

### `message`

An individual info message.

| | |
| --- | --- |
| **Element** | `<div>` |
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
