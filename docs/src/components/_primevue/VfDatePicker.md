<script setup lang="ts">
</script>

# VfDatePicker

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!-- #region usage-basic -->

## Basic Usage

`VfDatePicker` wraps PrimeVue's [DatePicker](https://v4.primevue.org/datepicker/) and forwards its entire API — original props, events, and slots all work as documented, apart from the few exceptions in the [PrimeVue Props](#props.props-primevue) table. On top of that, Vueform adds its own props, events, slots, and features — data binding, validation, conditions, and layout — which the examples on this page demonstrate.

::: usage

```vue [Preview]
<VfDatePicker
  name="date"
  label="Date"
  placeholder="Select a date..."
  date-format="dd/mm/yy"
  show-icon
  show-button-bar
/>
```

```vue [Template]
<VfDatePicker
  name="date"
  label="Date"
  placeholder="Select a date..."
  date-format="dd/mm/yy"
  show-icon
  show-button-bar
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  date: {
    type: 'date-picker',
    label: 'Date',
    placeholder: 'Select a date...',
    dateFormat: 'dd/mm/yy',
    showIcon: true,
    showButtonBar: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For the official PrimeVue examples, visit [DatePicker](https://v4.primevue.org/datepicker/).

<!-- #endregion usage-basic -->

<!-- #region usage-min-max -->

## Min & Max

The `minDate` and `maxDate` props accept date strings or [expressions](/guide/expressions). Use `{elementName}` syntax to reference other element values, creating dynamic constraints — for example, ensuring a start date is always before an end date.

::: usage

```vue [Preview]
<VfDatePicker name="start_date" max-date="{end_date}" />
<VfDatePicker name="end_date" min-date="{start_date}" />
```

```vue [Template]
<VfDatePicker
  name="start_date"
  label="Start Date"
  placeholder="Select start"
  max-date="{end_date}"
/>
<VfDatePicker
  name="end_date"
  label="End Date"
  placeholder="Select end"
  min-date="{start_date}"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  start_date: {
    type: 'date-picker',
    label: 'Start Date',
    placeholder: 'Select start',
    maxDate: '{end_date}',
  },
  end_date: {
    type: 'date-picker',
    label: 'End Date',
    placeholder: 'Select end',
    minDate: '{start_date}',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-min-max -->

<!-- #region usage-selection-mode -->

## Selection Mode

The `selectionMode` prop accepts [expressions](/guide/expressions), allowing the selection mode to change dynamically based on another element's value.

::: usage model

```vue [Preview]
<VfSelect
  name="mode"
  :items="{ single: 'Single', multiple: 'Multiple', range: 'Range' }"
/>
<VfDatePicker
  name="date"
  selection-mode="{mode}"
  show-icon
/>
```

```vue [Template]
<VfSelect
  name="mode"
  :default-value="'single'"
  icon-before="cog"
  :items="{
    single: 'Single',
    multiple: 'Multiple',
    range: 'Range',
  }"
/>
<VfDatePicker
  name="date"
  label="Date"
  placeholder="Select date(s)"
  selection-mode="{mode}"
  show-icon
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  mode: {
    type: 'select',
    defaultValue: 'single',
    iconBefore: 'cog',
    items: {
      single: 'Single',
      multiple: 'Multiple',
      range: 'Range',
    },
  },
  date: {
    type: 'date-picker',
    label: 'Date',
    placeholder: 'Select date(s)',
    selectionMode: '{mode}',
    showIcon: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-selection-mode -->

<!-- #region usage-icons -->

## Icons

The `iconBefore` and `iconAfter` props display icons inside the input wrapper. The icon class format can be configured globally via the `icon` config option.

::: usage

```vue [Preview]
<VfDatePicker name="start" icon-before="calendar" />
<VfDatePicker name="end" icon-after="clock" />
```

```vue [Template]
<VfDatePicker
  name="start"
  placeholder="Start date"
  icon-before="calendar"
/>
<VfDatePicker
  name="end"
  placeholder="End date"
  icon-after="clock"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  start: {
    type: 'date-picker',
    placeholder: 'Start date',
    iconBefore: 'calendar',
  },
  end: {
    type: 'date-picker',
    placeholder: 'End date',
    iconAfter: 'clock',
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

The `addonBefore` and `addonAfter` props render text content alongside the input. Pass a string for a single addon or an array for multiple addons on the same side.

::: usage

```vue [Preview]
<VfDatePicker name="check_in" addon-before="From" />
<VfDatePicker name="check_out" addon-before="To" />
<VfDatePicker name="deadline" :addon-after="['at', '5pm']" />
```

```vue [Template]
<VfDatePicker
  name="check_in"
  placeholder="Check-in"
  addon-before="From"
/>
<VfDatePicker
  name="check_out"
  placeholder="Check-out"
  addon-before="To"
/>
<VfDatePicker
  name="deadline"
  placeholder="Deadline"
  :addon-after="['at', '5pm']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  check_in: {
    type: 'date-picker',
    placeholder: 'Check-in',
    addonBefore: 'From',
  },
  check_out: {
    type: 'date-picker',
    placeholder: 'Check-out',
    addonBefore: 'To',
  },
  deadline: {
    type: 'date-picker',
    placeholder: 'Deadline',
    addonAfter: ['at', '5pm'],
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

Addons can also be element schemas (objects), allowing interactive controls like selects or buttons to be embedded alongside the input.

::: usage model

```vue [Preview]
<VfDatePicker name="event_date" :addon-before="{
  name: 'type',
  type: 'select',
  defaultValue: 'start',
  items: { start: 'Start', end: 'End' },
}" />

<VfDatePicker name="reminder" :addon-after="{
  name: 'set',
  type: 'button',
  text: 'Set',
}" />

<VfDatePicker name="recurring" :addon-before="{
  name: 'repeat',
  type: 'checkbox',
  text: 'Repeat',
}" />

<VfDatePicker name="schedule" show-time :addon-after="[
  { name: 'am', type: 'radio', text: 'AM', radioName: 'period' },
  { name: 'pm', type: 'radio', text: 'PM', radioName: 'period' },
]" />
```

```vue [Template]
<VfDatePicker
  name="event_date"
  placeholder="Event date"
  :addon-before="{
    name: 'type',
    type: 'select',
    defaultValue: 'start',
    items: { start: 'Start', end: 'End' },
  }"
/>

<VfDatePicker
  name="reminder"
  placeholder="Reminder date"
  :addon-after="{
    name: 'set',
    type: 'button',
    text: 'Set',
  }"
/>

<VfDatePicker
  name="recurring"
  placeholder="Recurring date"
  :addon-before="{
    name: 'repeat',
    type: 'checkbox',
    text: 'Repeat',
  }"
/>

<VfDatePicker
  name="schedule"
  placeholder="Schedule date"
  show-time
  :addon-after="[
    { name: 'am', type: 'radio', text: 'AM', radioName: 'period' },
    { name: 'pm', type: 'radio', text: 'PM', radioName: 'period' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  event_date: {
    type: 'date-picker',
    placeholder: 'Event date',
    addonBefore: {
      name: 'type',
      type: 'select',
      defaultValue: 'start',
      items: { start: 'Start', end: 'End' },
    },
  },
  reminder: {
    type: 'date-picker',
    placeholder: 'Reminder date',
    addonAfter: {
      name: 'set',
      type: 'button',
      text: 'Set',
    },
  },
  recurring: {
    type: 'date-picker',
    placeholder: 'Recurring date',
    addonBefore: {
      name: 'repeat',
      type: 'checkbox',
      text: 'Repeat',
    },
  },
  schedule: {
    type: 'date-picker',
    placeholder: 'Schedule date',
    showTime: true,
    addonAfter: [
      { name: 'am', type: 'radio', text: 'AM', radioName: 'period' },
      { name: 'pm', type: 'radio', text: 'PM', radioName: 'period' },
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

<!-- #region usage-float-label -->

## Float Label

The `floatLabel` prop displays a label that floats above the input when focused or filled, using PrimeVue's [FloatLabel](https://primevue.org/floatlabel/) component. The `float` prop controls the label behavior: omit it for the default "over" style, or set it to `'in'` or `'on'` for alternative placements.

::: usage center middle fit

```vue [Preview]
<VfDatePicker name="over" float-label="Over Label" />
<VfDatePicker name="in" float-label="In Label" float="in" />
<VfDatePicker name="on" float-label="On Label" float="on" />
```

```vue [Template]
<VfGroup name="floatLabels">
  <VfDatePicker name="over" float-label="Over Label" :columns="4" />
  <VfDatePicker
    name="in"
    float-label="In Label"
    float="in"
    :columns="4"
  />
  <VfDatePicker
    name="on"
    float-label="On Label"
    float="on"
    :columns="4"
  />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  over: {
    type: 'date-picker',
    floatLabel: 'Over Label',
    columns: 4,
  },
  in: {
    type: 'date-picker',
    floatLabel: 'In Label',
    float: 'in',
    columns: 4,
  },
  on: {
    type: 'date-picker',
    floatLabel: 'On Label',
    float: 'on',
    columns: 4,
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
<VfDatePicker name="birthday" ifta="Birthday" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  birthday: {
    type: 'date-picker',
    ifta: 'Birthday',
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
<VfDatePicker
  name="departure"
  hint="Select your preferred departure date."
/>
```

```vue [Template]
<VfDatePicker
  name="departure"
  label="Departure"
  placeholder="Select a date"
  hint="Select your preferred departure date."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  departure: {
    type: 'date-picker',
    label: 'Departure',
    placeholder: 'Select a date',
    hint: 'Select your preferred departure date.',
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
<VfDatePicker
  name="dob"
  help="Must be at least 18 years old."
/>
```

```vue [Template]
<VfDatePicker
  name="dob"
  label="Date of Birth"
  placeholder="Select your birthday"
  help="Must be at least 18 years old."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  dob: {
    type: 'date-picker',
    label: 'Date of Birth',
    placeholder: 'Select your birthday',
    help: 'Must be at least 18 years old.',
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
<VfDatePicker
  name="expiry"
  info="The date when the contract becomes void."
/>
```

```vue [Template]
<VfDatePicker
  name="expiry"
  label="Expiry Date"
  placeholder="Select date"
  info="The date when the contract becomes void."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  expiry: {
    type: 'date-picker',
    label: 'Expiry Date',
    placeholder: 'Select date',
    info: 'The date when the contract becomes void.',
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

<!-- #region usage-horizontal-label -->

## Horizontal Label

The `columns` prop controls the responsive grid layout. Setting `columns.label` places the label and input side by side in a horizontal arrangement.

::: usage

```vue [Preview]
<VfDatePicker name="start_date" label="Start Date" :columns="{ label: 4 }" />
```

```vue [Template]
<VfDatePicker
  name="start_date"
  label="Start Date"
  placeholder="Select a date"
  :columns="{ label: 4 }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  start_date: {
    type: 'date-picker',
    label: 'Start Date',
    placeholder: 'Select a date',
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

<!-- #region usage-invalid -->

## Invalid

When the `rules` prop is set and validation fails, the input displays an invalid state with error messages below.

::: usage validate

```vue [Preview]
<VfDatePicker name="appointment" rules="required" />
```

```vue [Template]
<VfDatePicker
  name="appointment"
  label="Appointment"
  placeholder="Select a date"
  rules="required"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  appointment: {
    type: 'date-picker',
    label: 'Appointment',
    placeholder: 'Select a date',
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
| [`type`](!code#props.type "string") | `'date-picker'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Input {#props-datepicker}

| Prop | Default | Description |
| --- | --- | --- |
| [`selectionMode`](!code#props.selectionMode "TSelectionMode \| 'single' \| 'multiple' \| 'range'") | — | **This replaces the original PrimeVue `selectionMode` prop.** Defines the quantity of the selection and controls the model value shape:<br><br>- unset / `'single'` → `string \| null` - `'multiple'` / `'range'` → `string[]` |
| [`minDate`](!code#props.minDate "DProp<string \| Date, TContext>") | — | **This replaces the original PrimeVue `minDate` prop.** The minimum selectable date as a date string. |
| [`maxDate`](!code#props.maxDate "DProp<string \| Date, TContext>") | — | **This replaces the original PrimeVue `maxDate` prop.** The maximum selectable date as a date string. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`defaultValue`](!code#props.defaultValue "T") | — | The default/initial value of the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |
| [`readonly`](!code#props.readonly "ConditionalProp<TContext>") | — | Whether the input is read-only. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`untrackOn`](!code#props.untrackOn "UntrackOnProp") | — | Controls when the element stops tracking user changes. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfDatePickerContext<VfDatePickerProps<TSelectionMode>>) => any") | — | Transforms the element's value when submitting the form. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`rules`](!code#props.rules "RulesProp<TContext>") | — | Validation rules to apply to the element. |
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

<!-- @collapsible -->

#### Modified PrimeVue Props {#props-modified}

Props that are defined by PrimeVue and Vueform as well, and might work differently with Vueform.

| Prop | Description |
| --- | --- |
| [`view`](!code#props.view "HintedString<'date' \| 'month' \| 'year'> \| undefined") | Replaced by `display` to avoid conflict with Vueform's template `view` prop. |

<!-- @endcollapsible -->

<!-- @collapsible closed -->

#### Unaffected PrimeVue Props {#props-unaffected}

PrimeVue props that work exactly the same — Vueform does not modify them.

| Prop | Description |
| --- | --- |
| [`appendTo`](!code#props.appendTo "HintedString<'body' \| 'self'> \| undefined \| HTMLElement") | A valid query selector or an HTMLElement to specify where the overlay gets attached. |
| [`ariaLabel`](!code#props.ariaLabel "string \| undefined") | Establishes a string value that labels the component. |
| [`ariaLabelledby`](!code#props.ariaLabelledby "string \| undefined") | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| [`autoZIndex`](!code#props.autoZIndex "boolean \| undefined") | Whether to automatically manage layering. |
| [`baseZIndex`](!code#props.baseZIndex "number \| undefined") | Base zIndex value to use in layering. |
| [`breakpoint`](!code#props.breakpoint "string \| undefined") | The breakpoint to define the maximum width boundary for datepicker panel. |
| [`clearButtonProps`](!code#props.clearButtonProps "object \| undefined") | Used to pass all properties of the ButtonProps to the clear button component. |
| [`dateFormat`](!code#props.dateFormat "string \| undefined") | Format of the date. Defaults to PrimeVue Locale configuration. |
| [`decrementIcon`](!code#props.decrementIcon "string \| undefined") | Icon to show in each of the decrement buttons. |
| [`disabledDates`](!code#props.disabledDates "Date[] \| undefined") | Array with dates to disable. |
| [`disabledDays`](!code#props.disabledDays "number[] \| undefined") | Array with disabled weekday numbers. |
| [`dt`](!code#props.dt "DesignToken<any>") | It generates scoped CSS variables using design tokens for the component. |
| [`hideOnDateTimeSelect`](!code#props.hideOnDateTimeSelect "boolean \| undefined") | Whether to hide the overlay on date selection when showTime is enabled. |
| [`hideOnRangeSelection`](!code#props.hideOnRangeSelection "boolean \| undefined") | Whether to hide the overlay on date selection is completed when selectionMode is range. |
| [`hourFormat`](!code#props.hourFormat "HintedString<'12' \| '24'> \| undefined") | Specifies hour format. |
| [`icon`](!code#props.icon "string \| undefined") | Icon of the datepicker button. |
| [`iconDisplay`](!code#props.iconDisplay "HintedString<'button' \| 'input'> \| undefined") | Icon position of the component. This only applies if the showIcon option is set to true. |
| [`incrementIcon`](!code#props.incrementIcon "string \| undefined") | Icon to show in each of the increment buttons. |
| [`inline`](!code#props.inline "boolean \| undefined") | When enabled, displays the datepicker as inline instead of an overlay. |
| [`inputClass`](!code#props.inputClass "string \| object \| undefined") | Style class of the input field. |
| [`inputId`](!code#props.inputId "string \| undefined") | Identifier of the underlying input element. |
| [`inputStyle`](!code#props.inputStyle "object \| undefined") | Inline style of the input field. |
| [`manualInput`](!code#props.manualInput "boolean \| undefined") | Whether to allow entering the date manually via typing. |
| [`maxDateCount`](!code#props.maxDateCount "number \| undefined") | Maximum number of selectable dates in multiple mode. |
| [`navigatorButtonProps`](!code#props.navigatorButtonProps "object \| undefined") | Used to pass all properties of the ButtonProps to the navigator button component. |
| [`nextIcon`](!code#props.nextIcon "string \| undefined") | Icon to show in the next button. |
| [`numberOfMonths`](!code#props.numberOfMonths "number \| undefined") | Number of months to display. |
| [`panelClass`](!code#props.panelClass "string \| object \| undefined") | Style class of the overlay panel. |
| [`panelStyle`](!code#props.panelStyle "object \| undefined") | Inline style of the overlay panel. |
| [`prevIcon`](!code#props.prevIcon "string \| undefined") | Icon to show in the previous button. |
| [`pt`](!code#props.pt "PassThrough<DatePickerPassThroughOptions>") | Used to pass attributes to DOM elements inside the component. |
| [`ptOptions`](!code#props.ptOptions "PassThroughOptions") | Used to configure passthrough(pt) options of the component. |
| [`required`](!code#props.required "boolean \| undefined") | When present, it specifies that the component is a required field. |
| [`responsiveOptions`](!code#props.responsiveOptions "DatePickerResponsiveOptions[]") | An array of options for responsive design. |
| [`selectOtherMonths`](!code#props.selectOtherMonths "boolean \| undefined") | Whether days in other months shown before or after the current month are selectable. This only applies if the showOtherMonths option is set to true. |
| [`shortYearCutoff`](!code#props.shortYearCutoff "string \| undefined") | The cutoff year for determining the century for a date. |
| [`showButtonBar`](!code#props.showButtonBar "boolean \| undefined") | Whether to display today and clear buttons at the footer. |
| [`showClear`](!code#props.showClear "boolean \| undefined") | When enabled, a clear icon is displayed to clear the value. |
| [`showIcon`](!code#props.showIcon "boolean \| undefined") | When enabled, displays a button with icon next to input. |
| [`showOnFocus`](!code#props.showOnFocus "boolean \| undefined") | When disabled, datepicker will not be visible with input focus. |
| [`showOtherMonths`](!code#props.showOtherMonths "boolean \| undefined") | Whether to display dates in other months (non-selectable) at the start or end of the current month. To make these days selectable use the selectOtherMonths option. |
| [`showSeconds`](!code#props.showSeconds "boolean \| undefined") | Whether to show the seconds in time picker. |
| [`showTime`](!code#props.showTime "boolean \| undefined") | Whether to display timepicker. |
| [`showWeek`](!code#props.showWeek "boolean \| undefined") | When enabled, datepicker will show week numbers. |
| [`size`](!code#props.size "HintedString<'small' \| 'large'> \| undefined") | Defines the size of the component. |
| [`stepHour`](!code#props.stepHour "number \| undefined") | Hours to change per step. |
| [`stepMinute`](!code#props.stepMinute "number \| undefined") | Minutes to change per step. |
| [`stepSecond`](!code#props.stepSecond "number \| undefined") | Seconds to change per step. |
| [`timeOnly`](!code#props.timeOnly "boolean \| undefined") | Whether to display timepicker only. |
| [`timepickerButtonProps`](!code#props.timepickerButtonProps "object \| undefined") | Used to pass all properties of the ButtonProps to the timepicker button component. |
| [`timeSeparator`](!code#props.timeSeparator "string \| undefined") | Separator of time selector. |
| [`todayButtonProps`](!code#props.todayButtonProps "object \| undefined") | Used to pass all properties of the ButtonProps to the today button component. |
| [`unstyled`](!code#props.unstyled "boolean") | When enabled, it removes component related styles in the core. |
| [`updateModelType`](!code#props.updateModelType "HintedString<'date' \| 'string'> \| undefined") | Type of the value to write back to modelValue. |
| [`variant`](!code#props.variant "HintedString<'outlined' \| 'filled'> \| undefined \| null") | Specifies the input variant of the component. |

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

### DatePicker {#section-datepicker}

| Name | Description |
| --- | --- |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`validation`](!code#context.validation "ShallowReactive<Record<string, ValidationView>>") | Per-language validation views keyed by language (`default` for non-translatable elements). |
| [`validator`](!code#context.validator "Validator") | The validator instance the element is registered with: the form's validator, a store-attached one, or a newly created one. |
| [`shouldValidate`](!code#context.shouldValidate "boolean") | Whether the element should validate live on user input, per the `validateOn` policy and the form's state. |
| [`onUserInput()`](!code#context.onUserInput "() => void") | Validates the element on user input when the live-validation policy allows it. |
| [`isFlatContainer`](!code#context.isFlatContainer "boolean") | Whether the element's data is flattened into the parent container rather than nested under its own `name` key. |
| [`containerModel`](!code#context.containerModel "unknown") | The model ref the element provides to its children via the container context: the parent's model for flat containers, the element's own `model` otherwise. |
| [`handleModelUpdate()`](!code#context.handleModelUpdate "(data: Event) => void") | Handles a native input event and updates the model from the event target. |
| [`initValidation()`](!code#context.initValidation "() => void") | Registers the element with the validator and compiles its rules. |
| [`destroyValidation()`](!code#context.destroyValidation "() => void") | Unregisters the element from the validator and clears its validation views. |
| [`rootModel`](!code#context.rootModel "RootModel \| undefined") | The root model backing the form when this element operates as the form root, `undefined` for every other element. |
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. |
| [`setInputRef()`](!code#context.setInputRef "(el: any) => void") | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `input` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref. |
| [`canonicalDomValue`](!code#context.canonicalDomValue "boolean") | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value adoption and the DOM recovery listeners. |
| [`inputBindings`](!code#context.inputBindings "object") | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners. |
| [`componentBindings`](!code#context.componentBindings "object") | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur. |
| [`selectionMode`](!code#context.selectionMode "DatePickerSelectionModeProp") | The resolved selection mode. Explicit `V` so `useDynamicProp` does not unwrap the `TSelectionMode` generic as if it were a `Ref` (that path infers `unknown` and poisons the exposed context). |
| [`minDate`](!code#context.minDate "Date \| undefined") | The resolved minimum selectable date. |
| [`maxDate`](!code#context.maxDate "Date \| undefined") | The resolved maximum selectable date. |

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

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleInput()`](!code#context.handleInput "(payload: any, e: Event \| undefined) => void") | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it.<br><br>Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends.<br><br>The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only adopted while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
| [`handleBlur()`](!code#context.handleBlur "(e: Event) => void") | Fires the blur event on the element. |
| [`handleFocus()`](!code#context.handleFocus "(e: Event) => void") | Handles focus by setting the focused state and firing the focus event. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | A unique auto-generated identifier for the element. |
| [`aria`](!code#context.aria "object") | Computed ARIA attributes (describedby, labelledby, invalid, required, busy) derived from element state and props, keyed by aria attr names. |
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
| `dateSelect` | [`value`](!code#events.dateSelect.value "Date"), [`context$`](!code#events.dateSelect.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Callback to invoke when a date is selected. |
| `todayClick` | [`date`](!code#events.todayClick.date "Date"), [`context$`](!code#events.todayClick.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Callback to invoke when today button is clicked. |
| `clearClick` | [`event`](!code#events.clearClick.event "Event"), [`context$`](!code#events.clearClick.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Callback to invoke when clear button is clicked. |
| `show` | [`context$`](!code#events.show.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Callback to invoke when datepicker panel is shown. |
| `hide` | [`context$`](!code#events.hide.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Callback to invoke when datepicker panel is hidden. |
| `change` | [`newValue`](!code#events.change.newValue "T"), [`oldValue`](!code#events.change.oldValue "T"), [`context$`](!code#events.change.context$ "TContext") | Emitted when the element value changes. |
| `valueChange` | [`value`](!code#events.valueChange.value "Date \| Date[] \| (Date \| null)[] \| null \| undefined"), [`context$`](!code#events.valueChange.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Emitted when the value changes in uncontrolled mode. |
| `monthChange` | [`event`](!code#events.monthChange.event "DatePickerMonthChangeEvent"), [`context$`](!code#events.monthChange.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Callback to invoke when a month is changed using the navigators. |
| `yearChange` | [`event`](!code#events.yearChange.event "DatePickerYearChangeEvent"), [`context$`](!code#events.yearChange.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Callback to invoke when a year is changed using the navigators. |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "T") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "T"), [`context$`](!code#events.load.context$ "TContext") | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the element is reset to its default value. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the element's value is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the element becomes invalid. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the element becomes valid after having been invalid. |
| `input` | [`value`](!code#events.input.value "V"), [`e`](!code#events.input.e "Event \| undefined"), [`context$`](!code#events.input.context$ "TContext") | Emitted when the input value is changed via the UI by the user. |
| `keydown` | [`event`](!code#events.keydown.event "Event"), [`context$`](!code#events.keydown.context$ "VfDatePickerContext<VfDatePickerProps<TSelectionMode>>") | Callback to invoke when a key is pressed. |
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
| `header` | — | Custom header template of panel. |
| `footer` | — | Custom footer template of panel. |
| `dropdownicon` | [`class`](!code#slot.dropdownicon.class "any") | Custom dropdown icon template. |
| `clearicon` | [`clearCallback`](!code#slot.clearicon.clearCallback "(event: Event) => void") | Custom clear icon template. |
| `prevbutton` | [`actionCallback`](!code#slot.prevbutton.actionCallback "(event: Event) => void") [`keydownCallback`](!code#slot.prevbutton.keydownCallback "(event: Event) => void") | Custom prev button template |
| `nextbutton` | [`actionCallback`](!code#slot.nextbutton.actionCallback "(event: Event) => void") [`keydownCallback`](!code#slot.nextbutton.keydownCallback "(event: Event) => void") | Custom next button template |
| `buttonbar` | [`todayCallback`](!code#slot.buttonbar.todayCallback "(event: Event) => void") [`clearCallback`](!code#slot.buttonbar.clearCallback "(event: Event) => void") | Custom buttonbar template |
| `todaybutton` | [`actionCallback`](!code#slot.todaybutton.actionCallback "(event: Event) => void") [`keydownCallback`](!code#slot.todaybutton.keydownCallback "(event: Event) => void") | Custom today button template |
| `clearbutton` | [`actionCallback`](!code#slot.clearbutton.actionCallback "(event: Event) => void") [`keydownCallback`](!code#slot.clearbutton.keydownCallback "(event: Event) => void") | Custom clear button template |
| `hourincrementbutton` | [`callbacks`](!code#slot.hourincrementbutton.callbacks "object") | Custom increment hour button template |
| `hourdecrementbutton` | [`callbacks`](!code#slot.hourdecrementbutton.callbacks "object") | Custom decrement hour button template |
| `minuteincrementbutton` | [`callbacks`](!code#slot.minuteincrementbutton.callbacks "object") | Custom increment minute button template |
| `minutedecrementbutton` | [`callbacks`](!code#slot.minutedecrementbutton.callbacks "object") | Custom decrement minute button template |
| `secondincrementbutton` | [`callbacks`](!code#slot.secondincrementbutton.callbacks "object") | Custom increment second button template |
| `seconddecrementbutton` | [`callbacks`](!code#slot.seconddecrementbutton.callbacks "object") | Custom decrement second button template |
| `ampmincrementbutton` | [`toggleCallback`](!code#slot.ampmincrementbutton.toggleCallback "(event: Event) => void") [`keydownCallback`](!code#slot.ampmincrementbutton.keydownCallback "(event: Event) => void") | Custom ampm toggle increment button template |
| `ampmdecrementbutton` | [`toggleCallback`](!code#slot.ampmdecrementbutton.toggleCallback "(event: Event) => void") [`keydownCallback`](!code#slot.ampmdecrementbutton.keydownCallback "(event: Event) => void") | Custom ampm toggle decrement button template |
| `date` | [`date`](!code#slot.date.date "DatePickerDateSlotOptions") | Custom date template. |
| `decade` | [`years`](!code#slot.decade.years "string[] \| undefined") | Custom decade template. |
| `weekheaderlabel` | — | Custom week header label template. |
| `weeklabel` | [`weekNumber`](!code#slot.weeklabel.weekNumber "number") | Custom week label template. |
| `inputicon` | [`class`](!code#slot.inputicon.class "any") [`clickCallback`](!code#slot.inputicon.clickCallback "() => void") | Custom input icon template. |
| `previcon` | [`class`](!code#slot.previcon.class "any") | Custom previous icon template. |
| `nexticon` | [`class`](!code#slot.nexticon.class "any") | Custom next icon template. |
| `incrementicon` | [`class`](!code#slot.incrementicon.class "any") | Custom increment icon template. |
| `decrementicon` | [`class`](!code#slot.decrementicon.class "any") | Custom decrement icon template. |
| `dropdownbutton` | [`toggleCallback`](!code#slot.dropdownbutton.toggleCallback "(event: Event) => void") | Custom dropdown button template. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts component="VfDatePicker"
:examples="{
default: 'Default',
float: 'Float Label',
ifta: 'Ifta',
icons: 'Icons',
addons: 'Addons',
mix: 'Mix',
}"
:schema="{
label: 'Check-in',
help: 'Select your arrival date',
hint: 'This will be the first night of your stay',
info: 'Free cancellation until 24 hours before check-in',
rules: 'required',
showRequired: ['label'],
defaultValue: new Date(),
onMounted: ({ messageBag }) => {
messageBag.append('No rooms available on this date', 'error')
messageBag.append('Rooms available on this date', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfDatePicker
      name="default"
      v-bind="schema"
    />
</template>
<template #example-float="{ schema }">
<VfDatePicker
      name="float"
      v-bind="schema"
      float-label="Check-in"
      float="on"
    />
</template>
<template #example-ifta="{ schema }">
<VfDatePicker
      name="ifta"
      v-bind="schema"
      ifta="Check-in"
    />
</template>
<template #example-icons="{ schema }">
<VfDatePicker
      name="icons"
      v-bind="schema"
      icon-before="calendar"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfDatePicker
      name="addons"
      v-bind="schema"
      addon-before="From"
      addon-after="at 2 PM"
    />
</template>
<template #example-mix="{ schema }">
<VfDatePicker
      name="mix"
      v-bind="schema"
      addon-before="From"
      icon-after="calendar"
      float-label="Check-in"
      float="on"
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
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-date-picker` `.vf-align-label?` |

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

The date picker input element.

| | |
| --- | --- |
| **Element** | [`<DatePicker>`](https://primevue.org/datepicker/) |

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
