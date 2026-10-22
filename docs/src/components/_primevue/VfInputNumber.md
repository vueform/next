# VfInputNumber

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!-- #region usage-basic -->

## Basic Usage

`VfInputNumber` wraps PrimeVue's [InputNumber](https://v4.primevue.org/inputnumber/) and forwards its entire API — original props, events, and slots all work as documented, apart from the few exceptions in the [PrimeVue Props](#props.props-primevue) table. On top of that, Vueform adds its own props, events, slots, and features — data binding, validation, conditions, and layout — which the examples on this page demonstrate.

::: usage

```vue [Preview]
<VfInputNumber name="quantity" :min="0" :max="100" show-buttons />
```

```vue [Template]
<VfInputNumber
  name="quantity"
  label="Quantity"
  placeholder="Enter quantity"
  :min="0"
  :max="100"
  show-buttons
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  quantity: {
    type: 'input-number',
    label: 'Quantity',
    placeholder: 'Enter quantity',
    min: 0,
    max: 100,
    showButtons: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For the official PrimeVue examples, visit [InputNumber](https://v4.primevue.org/inputnumber/).

<!-- #endregion usage-basic -->

<!-- #region usage-dynamic-props -->

## Dynamic Props

The `min`, `max`, and `step` props accept expression strings, allowing their values to be derived from other form fields dynamically.

::: usage

```vue [Preview]
<VfInputNumber name="value" min="{min}" max="{max}" step="{step}" />
```

```vue [Template]
<VfInputNumber
  name="value"
  label="Value"
  min="{min}"
  max="{max}"
  step="{step}"
  line-bottom
  :space-bottom="1"
  show-buttons
  :default-value="50"
/>
<VfInputNumber
  name="min"
  label="Min"
  :default-value="50"
  :columns="4"
  icon-after="cog"
/>
<VfInputNumber
  name="max"
  label="Max"
  :default-value="100"
  :columns="4"
  icon-after="cog"
/>
<VfInputNumber
  name="step"
  label="Step"
  :default-value="5"
  :columns="4"
  icon-after="cog"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  value: {
    type: 'input-number',
    label: 'Value',
    min: '{min}',
    max: '{max}',
    step: '{step}',
    spaceBottom: 1,
    lineBottom: true,
    showButtons: true,
    defaultValue: 50,
  },
  min: {
    type: 'input-number',
    label: 'Min',
    defaultValue: 50,
    columns: 4,
    iconAfter: 'cog',
  },
  max: {
    type: 'input-number',
    label: 'Max',
    defaultValue: 100,
    columns: 4,
    iconAfter: 'cog',
  },
  step: {
    type: 'input-number',
    label: 'Step',
    defaultValue: 5,
    columns: 4,
    iconAfter: 'cog',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-dynamic-props -->

<!-- #region usage-currency -->

## Currency

The `mode` prop set to `'currency'` and the `currency` prop enable currency formatting. The `currency` prop accepts an expression, allowing the displayed currency to change based on another field.

::: usage

```vue [Preview]
<VfInputNumber name="price" mode="currency" currency="{currency}" />
```

```vue [Template]
<VfInputNumber
  name="price"
  label="Price"
  mode="currency"
  currency="{currency}"
  :default-value="99.99"
/>
<VfSelect
  name="currency"
  label="Currency"
  default-value="USD"
  :items="{ USD: 'USD', EUR: 'EUR', GBP: 'GBP', JPY: 'JPY' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  price: {
    type: 'input-number',
    label: 'Price',
    mode: 'currency',
    currency: '{currency}',
    defaultValue: 99.99,
  },
  currency: {
    type: 'select',
    label: 'Currency',
    defaultValue: 'USD',
    items: { USD: 'USD', EUR: 'EUR', GBP: 'GBP', JPY: 'JPY' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-currency -->

<!-- #region usage-locale -->

## Locale

The `locale` prop controls the number formatting locale (e.g. decimal separators, grouping). It accepts an expression, allowing the format to adapt based on another field.

::: usage

```vue [Preview]
<VfInputNumber name="amount" locale="{region}" />
```

```vue [Template]
<VfInputNumber
  name="amount"
  label="Amount"
  mode="decimal"
  locale="{region}"
  :min-fraction-digits="2"
  :max-fraction-digits="2"
  :default-value="1234.56"
/>
<VfSelect
  name="region"
  label="Region"
  default-value="en-US"
  :items="{
    'en-US': 'English (US)',
    'de-DE': 'German',
    'fr-FR': 'French',
    'ja-JP': 'Japanese',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  amount: {
    type: 'input-number',
    label: 'Amount',
    mode: 'decimal',
    locale: '{region}',
    minFractionDigits: 2,
    maxFractionDigits: 2,
    defaultValue: 1234.56,
  },
  region: {
    type: 'select',
    label: 'Region',
    defaultValue: 'en-US',
    items: {
      'en-US': 'English (US)',
      'de-DE': 'German',
      'fr-FR': 'French',
      'ja-JP': 'Japanese',
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

<!-- #endregion usage-locale -->

<!-- #region usage-prefix-suffix -->

## Prefix & Suffix

The `prefix` and `suffix` props display text before or after the number. They accept expressions, allowing the displayed text to change dynamically based on other fields.

::: usage

```vue [Preview]
<VfInputNumber name="weight" suffix=" {unit}" />
```

```vue [Template]
<VfInputNumber
  name="weight"
  label="Weight"
  suffix=" {unit}"
  :min="0"
  :default-value="75"
/>
<VfSelect
  name="unit"
  label="Unit"
  default-value="kg"
  :items="{ kg: 'Kilograms', lb: 'Pounds', oz: 'Ounces' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  weight: {
    type: 'input-number',
    label: 'Weight',
    suffix: ' {unit}',
    min: 0,
    defaultValue: 75,
  },
  unit: {
    type: 'select',
    label: 'Unit',
    defaultValue: 'kg',
    items: { kg: 'Kilograms', lb: 'Pounds', oz: 'Ounces' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-prefix-suffix -->

<!-- #region usage-icons -->

## Icons

The `iconBefore` and `iconAfter` props display icons inside the input wrapper. The icon class format can be configured globally via the `icon` config option.

::: usage

```vue [Preview]
<VfInputNumber name="amount" icon-before="dollar" />
<VfInputNumber name="weight" icon-after="hashtag" />
```

```vue [Template]
<VfInputNumber
  name="amount"
  placeholder="Amount"
  icon-before="dollar"
/>
<VfInputNumber
  name="weight"
  placeholder="Weight (kg)"
  icon-after="hashtag"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  amount: {
    type: 'input-number',
    placeholder: 'Amount',
    iconBefore: 'dollar',
  },
  weight: {
    type: 'input-number',
    placeholder: 'Weight (kg)',
    iconAfter: 'hashtag',
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
<VfInputNumber name="price" addon-before="$" />
<VfInputNumber name="discount" addon-before="Save" addon-after="%" />
<VfInputNumber name="interval" :addon-before="['Run', 'every']" />
```

```vue [Template]
<VfInputNumber
  name="price"
  placeholder="0.00"
  addon-before="$"
/>
<VfInputNumber
  name="discount"
  placeholder="0"
  addon-before="Save"
  addon-after="%"
/>
<VfInputNumber
  name="interval"
  placeholder="30"
  :addon-before="['Run', 'every']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  price: {
    type: 'input-number',
    placeholder: '0.00',
    addonBefore: '$',
  },
  discount: {
    type: 'input-number',
    placeholder: '0',
    addonBefore: 'Save',
    addonAfter: '%',
  },
  interval: {
    type: 'input-number',
    placeholder: '30',
    addonBefore: ['Run', 'every'],
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
<VfInputNumber name="amount" :addon-before="{
  name: 'currency',
  type: 'select',
  defaultValue: 'usd',
  items: { usd: 'USD', eur: 'EUR', gbp: 'GBP' },
}" />

<VfInputNumber name="bid" :addon-after="{
  name: 'place',
  type: 'button',
  text: 'Place',
}" />

<VfInputNumber name="tax" :addon-before="{
  name: 'inclusive',
  type: 'checkbox',
  text: 'Incl.',
}" />

<VfInputNumber name="duration" :addon-after="[
  { name: 'min', type: 'radio', text: 'min', radioName: 'unit' },
  { name: 'hr', type: 'radio', text: 'hr', radioName: 'unit' },
]" />
```

```vue [Template]
<VfInputNumber
  name="amount"
  placeholder="0.00"
  :addon-before="{
    name: 'currency',
    type: 'select',
    defaultValue: 'usd',
    items: { usd: 'USD', eur: 'EUR', gbp: 'GBP' },
  }"
/>

<VfInputNumber
  name="bid"
  placeholder="0"
  :addon-after="{
    name: 'place',
    type: 'button',
    text: 'Place',
  }"
/>

<VfInputNumber
  name="tax"
  placeholder="0"
  :addon-before="{
    name: 'inclusive',
    type: 'checkbox',
    text: 'Incl.',
  }"
/>

<VfInputNumber
  name="duration"
  placeholder="0"
  :addon-after="[
    { name: 'min', type: 'radio', text: 'min', radioName: 'unit' },
    { name: 'hr', type: 'radio', text: 'hr', radioName: 'unit' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  amount: {
    type: 'input-number',
    placeholder: '0.00',
    addonBefore: {
      name: 'currency',
      type: 'select',
      defaultValue: 'usd',
      items: { usd: 'USD', eur: 'EUR', gbp: 'GBP' },
    },
  },
  bid: {
    type: 'input-number',
    placeholder: '0',
    addonAfter: {
      name: 'place',
      type: 'button',
      text: 'Place',
    },
  },
  tax: {
    type: 'input-number',
    placeholder: '0',
    addonBefore: {
      name: 'inclusive',
      type: 'checkbox',
      text: 'Incl.',
    },
  },
  duration: {
    type: 'input-number',
    placeholder: '0',
    addonAfter: [
      { name: 'min', type: 'radio', text: 'min', radioName: 'unit' },
      { name: 'hr', type: 'radio', text: 'hr', radioName: 'unit' },
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
<VfInputNumber name="over" float-label="Over Label" />
<VfInputNumber name="in" float-label="In Label" float="in" />
<VfInputNumber name="on" float-label="On Label" float="on" />
```

```vue [Template]
<VfGroup name="floatLabels">
  <VfInputNumber name="over" float-label="Over Label" :columns="4" />
  <VfInputNumber
    name="in"
    float-label="In Label"
    float="in"
    :columns="4"
  />
  <VfInputNumber
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
    type: 'input-number',
    floatLabel: 'Over Label',
    columns: 4,
  },
  in: {
    type: 'input-number',
    floatLabel: 'In Label',
    float: 'in',
    columns: 4,
  },
  on: {
    type: 'input-number',
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
<VfInputNumber name="price" ifta="Price" mode="currency" currency="USD" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  price: {
    type: 'input-number',
    ifta: 'Price',
    mode: 'currency',
    currency: 'USD',
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
<VfInputNumber
  name="age"
  hint="Must be between 18 and 120."
/>
```

```vue [Template]
<VfInputNumber
  name="age"
  label="Age"
  placeholder="Enter your age"
  :min="18"
  :max="120"
  hint="Must be between 18 and 120."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  age: {
    type: 'input-number',
    label: 'Age',
    placeholder: 'Enter your age',
    min: 18,
    max: 120,
    hint: 'Must be between 18 and 120.',
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
<VfInputNumber
  name="salary"
  help="Annual gross salary before tax."
/>
```

```vue [Template]
<VfInputNumber
  name="salary"
  label="Salary"
  placeholder="0"
  mode="currency"
  currency="USD"
  help="Annual gross salary before tax."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  salary: {
    type: 'input-number',
    label: 'Salary',
    placeholder: '0',
    mode: 'currency',
    currency: 'USD',
    help: 'Annual gross salary before tax.',
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
<VfInputNumber
  name="inventory"
  info="The current number of items available in stock."
/>
```

```vue [Template]
<VfInputNumber
  name="inventory"
  label="Stock"
  placeholder="0"
  :min="0"
  info="The current number of items available in stock."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  inventory: {
    type: 'input-number',
    label: 'Stock',
    placeholder: '0',
    min: 0,
    info: 'The current number of items available in stock.',
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
<VfInputNumber
  name="quantity"
  label="Quantity"
  :columns="{ label: 4 }"
/>
```

```vue [Template]
<VfInputNumber
  name="quantity"
  label="Quantity"
  placeholder="0"
  :min="1"
  show-buttons
  :columns="{ label: 4 }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  quantity: {
    type: 'input-number',
    label: 'Quantity',
    placeholder: '0',
    min: 1,
    showButtons: true,
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
<VfInputNumber name="amount" rules="required" />
```

```vue [Template]
<VfInputNumber
  name="amount"
  label="Amount"
  placeholder="Enter an amount"
  rules="required"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  amount: {
    type: 'input-number',
    label: 'Amount',
    placeholder: 'Enter an amount',
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
| [`type`](!code#props.type "string") | `'input-number'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
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
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |

### Input {#props-inputnumber}

| Prop | Default | Description |
| --- | --- | --- |
| [`currency`](!code#props.currency "DProp") | — | The currency to use in currency formatting. Accepts expressions. |
| [`locale`](!code#props.locale "DProp") | — | Locale to be used in formatting. Accepts expressions. |
| [`prefix`](!code#props.prefix "DProp") | — | Text to display before the value. Accepts expressions. |
| [`suffix`](!code#props.suffix "DProp") | — | Text to display after the value. Accepts expressions. |
| [`mode`](!code#props.mode "any") | — | Defines the behavior of the component. |
| [`noExpressions`](!code#props.noExpressions "boolean") | `false` | Disables expression resolution for this element. Applies to the element itself only (container elements don't cascade it to their children), and a form-level `noExpressions` cannot be overridden by setting it to `false` here. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`defaultValue`](!code#props.defaultValue "T") | — | The default/initial value of the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored drafts. On a container, the whole subtree is excluded. |
| [`readonly`](!code#props.readonly "ConditionalProp<TContext>") | — | Whether the input is read-only. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |
| [`min`](!code#props.min "DProp<number>") | — | Minimum boundary value. Accepts expressions. |
| [`max`](!code#props.max "DProp<number>") | — | Maximum boundary value. Accepts expressions. |
| [`step`](!code#props.step "DProp<number>") | — | Step factor to increment/decrement the value. Accepts expressions. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`untrackOn`](!code#props.untrackOn "UntrackOnProp") | — | Controls when the element stops tracking user changes. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfInputNumberContext) => any") | — | Transforms the element's value when submitting the form. |

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

<!-- @props-adapter-start -->
### PrimeVue {#props-primevue}

<!-- @collapsible -->

#### Unavailable PrimeVue Props {#props-unavailable}

Props that are unavailable because Vueform covers them differently.

| Prop | Description |
| --- | --- |
| [`fluid`](!code#props.fluid "boolean \| undefined") | Use [`columns`](#props.columns) prop instead. |
| [`formControl`](!code#props.formControl "Record<string, any> \| undefined") | Vueform manages form control registration internally. |
| [`inputId`](!code#props.inputId "string \| undefined") | Use [`id`](#props.id) prop instead. |
| [`invalid`](!code#props.invalid "boolean \| undefined") | Managed automatically by Vueform's validation system. |

<!-- @endcollapsible -->

<!-- @collapsible closed -->

#### Unaffected PrimeVue Props {#props-unaffected}

PrimeVue props that work exactly the same — Vueform does not modify them.

| Prop | Description |
| --- | --- |
| [`allowEmpty`](!code#props.allowEmpty "boolean \| undefined") | Determines whether the input field is empty. |
| [`ariaLabel`](!code#props.ariaLabel "string \| undefined") | Establishes a string value that labels the component. |
| [`ariaLabelledby`](!code#props.ariaLabelledby "string \| undefined") | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| [`buttonLayout`](!code#props.buttonLayout "HintedString<'stacked' \| 'horizontal' \| 'vertical'> \| undefined") | Layout of the buttons. |
| [`currencyDisplay`](!code#props.currencyDisplay "string \| undefined") | How to display the currency in currency formatting. Possible values are 'symbol' to use a localized currency symbol such as €, 'code' to use the ISO currency code, 'name' to use a localized currency name such as 'dollar'. |
| [`decrementButtonClass`](!code#props.decrementButtonClass "string \| undefined") | Style class of the decrement button. |
| [`decrementButtonIcon`](!code#props.decrementButtonIcon "string \| undefined") | Style class of the decrement icon. |
| [`decrementIcon`](!code#props.decrementIcon "string \| undefined") | Style class of the decrement icon. |
| [`dt`](!code#props.dt "DesignToken<any>") | It generates scoped CSS variables using design tokens for the component. |
| [`format`](!code#props.format "boolean \| undefined") | Whether to format the value. |
| [`highlightOnFocus`](!code#props.highlightOnFocus "boolean \| undefined") | Highlights automatically the input value. |
| [`incrementButtonClass`](!code#props.incrementButtonClass "string \| undefined") | Style class of the increment button. |
| [`incrementButtonIcon`](!code#props.incrementButtonIcon "string \| undefined") | Style class of the increment icon. |
| [`incrementIcon`](!code#props.incrementIcon "string \| undefined") | Style class of the increment icon. |
| [`inputClass`](!code#props.inputClass "string \| object \| undefined") | Style class of the input field. |
| [`inputStyle`](!code#props.inputStyle "object \| undefined") | Inline style of the input field. |
| [`localeMatcher`](!code#props.localeMatcher "HintedString<'lookup' \| 'best fit'> \| undefined") | The locale matching algorithm to use. Possible values are 'lookup' and 'best fit'; the default is 'best fit'. See [Locale Negotation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_negotiation) for details. |
| [`maxFractionDigits`](!code#props.maxFractionDigits "number \| undefined") | The maximum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number formatting is the larger of minimumFractionDigits and 3; the default for currency formatting is the larger of minimumFractionDigits and the number of minor unit digits provided by the [ISO 4217 currency code](https://www.six-group.com/en/products-services/financial-information/data-standards.html#scrollTo=maintenance-agency) list (2 if the list doesn't provide that information). |
| [`minFractionDigits`](!code#props.minFractionDigits "number \| undefined") | The minimum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number and percent formatting is 0; the default for currency formatting is the number of minor unit digits provided by the [ISO 4217 currency code](https://www.six-group.com/en/products-services/financial-information/data-standards.html#scrollTo=maintenance-agency) list (2 if the list doesn't provide that information). |
| [`pt`](!code#props.pt "PassThrough<InputNumberPassThroughOptions>") | Used to pass attributes to DOM elements inside the component. |
| [`ptOptions`](!code#props.ptOptions "PassThroughOptions") | Used to configure passthrough(pt) options of the component. |
| [`roundingMode`](!code#props.roundingMode "RoundingMode") | How decimals should be rounded. The default value is `"halfExpand"`, [further information](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#roundingmode). |
| [`showButtons`](!code#props.showButtons "boolean \| undefined") | Displays spinner buttons. |
| [`showClear`](!code#props.showClear "boolean \| undefined") | When enabled, a clear icon is displayed to clear the value. |
| [`size`](!code#props.size "HintedString<'small' \| 'large'> \| undefined") | Defines the size of the component. |
| [`unstyled`](!code#props.unstyled "boolean") | When enabled, it removes component related styles in the core. |
| [`useGrouping`](!code#props.useGrouping "boolean \| undefined") | Whether to use grouping separators, such as thousands separators or thousand/lakh/crore separators. |
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

### InputNumber {#section-inputnumber}

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
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored drafts. |
| [`setInputRef()`](!code#context.setInputRef "(el: any) => void") | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `inputRef` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref. |
| [`canonicalDomValue`](!code#context.canonicalDomValue "boolean") | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value pickup and the DOM recovery listeners. |
| [`inputBindings`](!code#context.inputBindings "object") | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners. |
| [`componentBindings`](!code#context.componentBindings "object") | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur. |
| [`getFormatter()`](!code#context.getFormatter "() => NumberFormat \| undefined") | Returns the Intl.NumberFormat object used by the underlying InputNumber. |
| [`currency`](!code#context.currency "UnwrapDynamicProp<LooseRequired<TProps>[\"currency\"]> \| undefined") | The resolved currency code for currency formatting. |
| [`locale`](!code#context.locale "UnwrapDynamicProp<LooseRequired<TProps>[\"locale\"]> \| undefined") | The resolved locale for number formatting. |
| [`prefix`](!code#context.prefix "UnwrapDynamicProp<LooseRequired<TProps>[\"prefix\"]> \| undefined") | The resolved text displayed before the value. |
| [`suffix`](!code#context.suffix "UnwrapDynamicProp<LooseRequired<TProps>[\"suffix\"]> \| undefined") | The resolved text displayed after the value. |
| [`mode`](!code#context.mode "\"decimal\" \| TProps[\"mode\"]") | Resolved PrimeVue InputNumber mode (falls back to decimal without currency). |

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

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleInput()`](!code#context.handleInput "(payload: any, e: Event \| undefined) => void") | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it.<br><br>Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends.<br><br>The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only picked up while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
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

Events emitted by the component. See [Events](/guide/event-handlers) for details.

<!-- @events-start -->
| Name | Params | Description |
| --- | --- | --- |
| `change` | [`newValue`](!code#events.change.newValue "T"), [`oldValue`](!code#events.change.oldValue "T"), [`context$`](!code#events.change.context$ "TContext") | Emitted when the element value changes. |
| `valueChange` | [`value`](!code#events.valueChange.value "number"), [`context$`](!code#events.valueChange.context$ "VfInputNumberContext") | Emitted when the value changes in uncontrolled mode. |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "T") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "T"), [`context$`](!code#events.load.context$ "TContext") | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the element is reset to its default value. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the element's value is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the element becomes invalid. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the element becomes valid after having been invalid. |
| `input` | [`value`](!code#events.input.value "V"), [`e`](!code#events.input.e "Event \| undefined"), [`context$`](!code#events.input.context$ "TContext") | Emitted when the input value is changed via the UI by the user. |
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
| `float-label` | [`floatLabel`](!code#slot.float-label.floatLabel "string") | Slot for customizing the floating label content. |
| `addon-before` | [`addonBefore`](!code#slot.addon-before.addonBefore "AddonProp \| undefined") | Slot that replaces the before-addons section. |
| `addon-after` | [`addonAfter`](!code#slot.addon-after.addonAfter "AddonProp \| undefined") | Slot that replaces the after-addons section. |
| `icon-before` | [`iconBefore`](!code#slot.icon-before.iconBefore "string \| undefined") | Slot that replaces the icon rendered before the input. |
| `icon-after` | [`iconAfter`](!code#slot.icon-after.iconAfter "string \| undefined") | Slot that replaces the icon rendered after the input. |
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `clearicon` | [`clearCallback`](!code#slot.clearicon.clearCallback "(event: Event) => void") | Custom clear icon template. |
| `incrementicon` | — | Custom increment icon template. |
| `decrementicon` | — | Custom decrement icon template. |
| `incrementbutton` | [`listeners`](!code#slot.incrementbutton.listeners "InputNumberButtonListeners") | Custom increment button template. |
| `decrementbutton` | [`listeners`](!code#slot.decrementbutton.listeners "InputNumberButtonListeners") | Custom decrement button template. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts component="VfInputNumber"
:examples="{
default: 'Default',
float: 'Float Label',
ifta: 'Ifta',
icons: 'Icons',
addons: 'Addons',
mix: 'Mix',
}"
:schema="{
label: 'Budget',
help: 'Whole dollars, no cents',
hint: 'This will be your monthly spending limit',
info: 'You can adjust your budget anytime',
rules: 'required',
showRequired: ['label'],
defaultValue: 2500,
onMounted: ({ messageBag }) => {
messageBag.append('Budget exceeds your plan limit', 'error')
messageBag.append('Budget is within your plan limit', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfInputNumber
      name="default"
      v-bind="schema"
    />
</template>
<template #example-float="{ schema }">
<VfInputNumber
      name="float"
      v-bind="schema"
      float-label="Budget"
      float="on"
    />
</template>
<template #example-ifta="{ schema }">
<VfInputNumber
      name="ifta"
      v-bind="schema"
      ifta="Budget"
    />
</template>
<template #example-icons="{ schema }">
<VfInputNumber
      name="icons"
      v-bind="schema"
      icon-before="dollar"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfInputNumber
      name="addons"
      v-bind="schema"
      addon-before="$"
      addon-after="/ month"
    />
</template>
<template #example-mix="{ schema }">
<VfInputNumber
      name="mix"
      v-bind="schema"
      addon-before="$"
      icon-after="check"
      float-label="Budget"
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<TabPanel>`](https://primevue.org/tabpanel/) |
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` `<legend>` |
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` [`<TabsProps>`](https://primevue.org/tabsprops/) |
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-help` |

### `input`

The number input element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<InputNumber>`](https://primevue.org/inputnumber/) |

### `info`

Info container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-info` |

### `infoIcon`

Icon for displaying info tooltip.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<span>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-info-icon` |

### `description`

The description text area.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-description` |

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

### `floatWrapper`

The PrimeVue FloatLabel wrapper around the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<FloatLabel>`](https://primevue.org/floatlabel/) |

### `float`

The label tag inside PrimeVue FloatLabel.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` |

### `iftaWrapper`

The PrimeVue IftaLabel wrapper around the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<IftaLabel>`](https://primevue.org/iftalabel/) |

### `ifta`

The label tag inside PrimeVue IftaLabel.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` |

### `errors`

The validation errors container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
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
