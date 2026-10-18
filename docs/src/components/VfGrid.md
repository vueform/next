# VfGrid

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

The `grid` prop defines the cell layout as a 2D array. Each cell contains an element schema with at least `type` and `name`.

::: usage model

```vue [Preview]
<VfGrid
  name="contacts"
  :grid="[
    [
      { type: 'text', name: 'first_name', placeholder: 'First name' },
      { type: 'text', name: 'last_name', placeholder: 'Last name' },
    ],
    [
      { type: 'text', name: 'email', placeholder: 'Email' },
      { type: 'text', name: 'phone', placeholder: 'Phone' },
    ],
  ]"
/>
```

```vue [Template]
<VfGrid name="contacts">
  <VfRow>
    <VfCol><VfText name="first_name" placeholder="First name" /></VfCol>
    <VfCol><VfText name="last_name" placeholder="Last name" /></VfCol>
  </VfRow>
  <VfRow>
    <VfCol><VfText name="email" placeholder="Email" /></VfCol>
    <VfCol><VfText name="phone" placeholder="Phone" /></VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contacts: {
    type: 'grid',
    grid: [
      [
        { type: 'text', name: 'first_name', placeholder: 'First name' },
        { type: 'text', name: 'last_name', placeholder: 'Last name' },
      ],
      [
        { type: 'text', name: 'email', placeholder: 'Email' },
        { type: 'text', name: 'phone', placeholder: 'Phone' },
      ],
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

<!-- #endregion usage-basic -->

<!-- #region usage-content-cells -->

## Content Cells

Cells in the `grid` array can be `null` for empty space, a string for static text, `{ content: '...' }` for a content object, or an element schema for a form input.

::: usage

```vue [Preview]
<VfGrid
  name="info"
  :grid="[
    ['Name:', { type: 'text', name: 'name' }],
    ['Email:', { type: 'text', name: 'email' }],
    [null, { type: 'checkbox', name: 'subscribe', text: 'Subscribe' }],
  ]"
/>
```

```vue [Template]
<VfGrid name="info" valign="middle">
  <VfRow>
    <VfCol>Name:</VfCol>
    <VfCol><VfText name="name" /></VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Email:</VfCol>
    <VfCol><VfText name="email" /></VfCol>
  </VfRow>
  <VfRow>
    <VfCol />
    <VfCol><VfCheckbox name="subscribe" text="Subscribe" /></VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  info: {
    type: 'grid',
    valign: 'middle',
    grid: [
      [
        'Name:',
        { type: 'text', name: 'name' },
      ],
      [
        'Email:',
        { type: 'text', name: 'email' },
      ],
      [
        null,
        { type: 'checkbox', name: 'subscribe', text: 'Subscribe' },
      ],
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

<!-- #endregion usage-content-cells -->

<!-- #region usage-cell-spans -->

## Cell Spans

The `colspan` and `rowspan` properties make a cell span multiple columns or rows.

::: usage

```vue [Preview]
<VfGrid
  name="layout"
  :grid="[
    [
      {
        type: 'text',
        name: 'full_name',
        placeholder: 'Full name',
        colspan: 2,
      },
    ],
    [
      {
        type: 'textarea',
        name: 'bio',
        placeholder: 'Bio',
        rowspan: 2,
      },
      { type: 'text', name: 'city', placeholder: 'City' },
    ],
    [
      { type: 'text', name: 'zip', placeholder: 'ZIP' },
    ],
  ]"
/>
```

```vue [Template]
<VfGrid name="layout">
  <VfRow>
    <VfCol :colspan="2">
      <VfText name="full_name" placeholder="Full name" />
    </VfCol>
  </VfRow>
  <VfRow>
    <VfCol :rowspan="2">
      <VfTextarea name="bio" placeholder="Bio" />
    </VfCol>
    <VfCol><VfText name="city" placeholder="City" /></VfCol>
  </VfRow>
  <VfRow>
    <VfCol><VfText name="zip" placeholder="ZIP" /></VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  layout: {
    type: 'grid',
    grid: [
      [
        {
          type: 'text',
          name: 'full_name',
          placeholder: 'Full name',
          colspan: 2,
        },
      ],
      [
        {
          type: 'textarea',
          name: 'bio',
          placeholder: 'Bio',
          rowspan: 2,
        },
        { type: 'text', name: 'city', placeholder: 'City' },
      ],
      [
        { type: 'text', name: 'zip', placeholder: 'ZIP' },
      ],
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

<!-- #endregion usage-cell-spans -->

<!-- #region usage-column-widths -->

## Column Widths

The `widths` prop sets custom widths for each column using CSS values such as `px` or `fr`.

::: usage

```vue [Preview]
<VfGrid name="profile" :widths="['120px', '1fr', '1fr']" />
```

```vue [Template]
<VfGrid name="profile" :widths="['120px', '1fr', '1fr']" valign="middle">
  <VfRow>
    <VfCol>Name:</VfCol>
    <VfCol><VfText name="first_name" placeholder="First" /></VfCol>
    <VfCol><VfText name="last_name" placeholder="Last" /></VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Email:</VfCol>
    <VfCol :colspan="2">
      <VfText name="email" placeholder="Email" />
    </VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  profile: {
    type: 'grid',
    widths: ['120px', '1fr', '1fr'],
    valign: 'middle',
    grid: [
      [
        'Name:',
        { type: 'text', name: 'first_name', placeholder: 'First' },
        { type: 'text', name: 'last_name', placeholder: 'Last' },
      ],
      [
        'Email:',
        { colspan: 2, type: 'text', name: 'email', placeholder: 'Email' },
      ],
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

<!-- #endregion usage-column-widths -->

<!-- #region usage-headers -->

## Headers

The `colHeaders` prop treats the first row as styled column headers. The `rowHeaders` prop treats the first column as styled row headers.

::: usage nomodel

```vue [Preview]
<VfGrid name="schedule" col-headers row-headers />
```

```vue [Template]
<VfGrid name="schedule" col-headers row-headers>
  <VfRow>
    <VfCol />
    <VfCol>Morning</VfCol>
    <VfCol>Afternoon</VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Monday</VfCol>
    <VfCol>Math</VfCol>
    <VfCol>English</VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Tuesday</VfCol>
    <VfCol>Science</VfCol>
    <VfCol>History</VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  schedule: {
    type: 'grid',
    colHeaders: true,
    rowHeaders: true,
    grid: [
      [null, 'Morning', 'Afternoon'],
      ['Monday', 'Math', 'English'],
      ['Tuesday', 'Science', 'History'],
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

<!-- #endregion usage-headers -->

<!-- #region usage-tabular -->

## Tabular

The `tabular` prop applies bordered table styling with structured cells. Combine it with `colHeaders` for a traditional table layout.

::: usage nomodel

```vue [Preview]
<VfGrid name="pricing" tabular col-headers />
```

```vue [Template]
<VfGrid name="pricing" tabular col-headers>
  <VfRow>
    <VfCol>Plan</VfCol>
    <VfCol>Price</VfCol>
    <VfCol>Storage</VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Basic</VfCol>
    <VfCol>$9/mo</VfCol>
    <VfCol>10 GB</VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Pro</VfCol>
    <VfCol>$29/mo</VfCol>
    <VfCol>100 GB</VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Enterprise</VfCol>
    <VfCol>$99/mo</VfCol>
    <VfCol>1 TB</VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  pricing: {
    type: 'grid',
    tabular: true,
    colHeaders: true,
    grid: [
      ['Plan', 'Price', 'Storage'],
      ['Basic', '$9/mo', '10 GB'],
      ['Pro', '$29/mo', '100 GB'],
      ['Enterprise', '$99/mo', '1 TB'],
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

<!-- #endregion usage-tabular -->

<!-- #region usage-alignment -->

## Alignment

The `align` prop controls horizontal alignment of cell content (`left`, `center`, `right`). The `valign` prop controls vertical alignment (`top`, `middle`, `bottom`). Individual cells can override the grid-level alignment by setting `align` or `valign` in the cell object.

::: usage nomodel

```vue [Preview]
<VfGrid
  name="aligned"
  align="center"
  :grid="[
    ['Item', 'Qty', 'Price'],
    ['Widget', '10', { content: '$5.00', align: 'right' }],
    ['Gadget', '3', { content: '$12.50', align: 'right' }],
  ]"
/>
```

```vue [Template]
<VfGrid name="aligned" align="center" tabular col-headers>
  <VfRow>
    <VfCol>Item</VfCol>
    <VfCol>Qty</VfCol>
    <VfCol>Price</VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Widget</VfCol>
    <VfCol>10</VfCol>
    <VfCol align="right">$5.00</VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Gadget</VfCol>
    <VfCol>3</VfCol>
    <VfCol align="right">$12.50</VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  aligned: {
    type: 'grid',
    align: 'center',
    tabular: true,
    colHeaders: true,
    grid: [
      ['Item', 'Qty', 'Price'],
      ['Widget', '10', { content: '$5.00', align: 'right' }],
      ['Gadget', '3', { content: '$12.50', align: 'right' }],
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

<!-- #endregion usage-alignment -->

<!-- #region usage-scrollable -->

## Scrollable

The `scrollable` prop enables horizontal scrolling when the grid overflows its container. Use `minWidth` to set the minimum content width.

::: usage

```vue [Preview]
<VfGrid name="wide" scrollable />
```

```vue [Template]
<VfGrid name="wide" scrollable min-width="800px">
  <VfRow>
    <VfCol><VfText name="col1" placeholder="Column 1" /></VfCol>
    <VfCol><VfText name="col2" placeholder="Column 2" /></VfCol>
    <VfCol><VfText name="col3" placeholder="Column 3" /></VfCol>
    <VfCol><VfText name="col4" placeholder="Column 4" /></VfCol>
    <VfCol><VfText name="col5" placeholder="Column 5" /></VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  wide: {
    type: 'grid',
    scrollable: true,
    minWidth: '800px',
    grid: [
      [
        { type: 'text', name: 'col1', placeholder: 'Column 1' },
        { type: 'text', name: 'col2', placeholder: 'Column 2' },
        { type: 'text', name: 'col3', placeholder: 'Column 3' },
        { type: 'text', name: 'col4', placeholder: 'Column 4' },
        { type: 'text', name: 'col5', placeholder: 'Column 5' },
      ],
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

<!-- #endregion usage-scrollable -->

<!-- #region usage-nested -->

## Nested

The `nested` prop nests all grid element data under the grid's own key in the form model instead of flattening them into the parent level.

::: usage model

```vue [Preview]
<VfGrid
  name="address"
  nested
  :grid="[
    [
      { type: 'text', name: 'city', placeholder: 'City' },
      { type: 'text', name: 'zip', placeholder: 'ZIP' },
    ],
  ]"
/>
```

```vue [Template]
<VfGrid name="address" nested>
  <VfRow>
    <VfCol><VfText name="city" placeholder="City" /></VfCol>
    <VfCol><VfText name="zip" placeholder="ZIP" /></VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  address: {
    type: 'grid',
    nested: true,
    grid: [
      [
        { type: 'text', name: 'city', placeholder: 'City' },
        { type: 'text', name: 'zip', placeholder: 'ZIP' },
      ],
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

<!-- #endregion usage-nested -->

<!-- #region usage-disabled -->

## Disabled

The `disabled` prop disables all child elements in the grid. It also accepts [Conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfGrid name="locked" disabled />
```

```vue [Template]
<VfGrid name="locked" disabled>
  <VfRow>
    <VfCol><VfText name="first_name" placeholder="First name" /></VfCol>
    <VfCol><VfText name="last_name" placeholder="Last name" /></VfCol>
  </VfRow>
  <VfRow>
    <VfCol><VfText name="email" placeholder="Email" /></VfCol>
    <VfCol><VfText name="phone" placeholder="Phone" /></VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  locked: {
    type: 'grid',
    disabled: true,
    grid: [
      [
        { type: 'text', name: 'first_name', placeholder: 'First name' },
        { type: 'text', name: 'last_name', placeholder: 'Last name' },
      ],
      [
        { type: 'text', name: 'email', placeholder: 'Email' },
        { type: 'text', name: 'phone', placeholder: 'Phone' },
      ],
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
| [`type`](!code#props.type "string") | `'grid'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`heading`](!code#props.heading "HeadingProp") | — | The heading level to render for the container's title. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`align`](!code#props.align "AlignProp") | `'left'` | Horizontal alignment of grid cell content. |
| [`valign`](!code#props.valign "ValignProp") | `'baseline'` | Vertical alignment of grid cell content. |
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Input {#props-grid}

| Prop | Default | Description |
| --- | --- | --- |
| [`grid`](!code#props.grid "GridSchema") | — | The grid schema defining cell contents and layout. |
| [`nested`](!code#props.nested "boolean") | `false` | Whether the grid nests its data under its own key in the form model. |
| [`cols`](!code#props.cols "number") | `2` | The number of columns in the grid. |
| [`rows`](!code#props.rows "number") | `2` | The number of rows in the grid. |
| [`widths`](!code#props.widths "(null \| string \| number)[]") | — | Custom widths for each grid column. |
| [`minWidth`](!code#props.minWidth "string \| number") | `0` | Minimum width of the grid before it becomes scrollable. |
| [`maxWidth`](!code#props.maxWidth "string \| number") | `-1` | Maximum width of the grid. |
| [`scrollable`](!code#props.scrollable "boolean") | `false` | Whether the grid is horizontally scrollable when content overflows. |
| [`colHeaders`](!code#props.colHeaders "boolean") | `false` | Whether to display column headers. |
| [`rowHeaders`](!code#props.rowHeaders "boolean") | `false` | Whether to display row headers. |
| [`tabular`](!code#props.tabular "boolean") | `false` | Whether the grid uses a tabular visual style with borders and headers. |
| [`wrapColHeaders`](!code#props.wrapColHeaders "boolean") | `false` | Whether column header text can wrap. |
| [`wrapRowHeaders`](!code#props.wrapRowHeaders "boolean") | `false` | Whether row header text can wrap. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | `false` | Whether the element is disabled. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfGridContext<VfGridProps>) => any") | — | Transforms the element's value when submitting the form. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`rules`](!code#props.rules "RulesProp<TContext>") | — | Validation rules to apply to the element. |
| [`validateOn`](!code#props.validateOn "ElementValidateOnProp") | — | Controls when validation is triggered (e.g. on change, blur, or submit). |
| [`debounce`](!code#props.debounce "number") | — | Delay in milliseconds before processing input. |
| [`bail`](!code#props.bail "boolean") | `false` | Whether to stop validation after the first failing rule. |
| [`ruleMessages`](!code#props.ruleMessages "RuleMessagesProp<TContext>") | — | Custom error messages keyed by validation rule name. |
| [`displayName`](!code#props.displayName "TProp<string, TContext>") | — | The display name used in validation error messages. |
| [`maxErrors`](!code#props.maxErrors "number") | — | Maximum number of validation errors to display at once. |
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

### Grid {#section-grid}

| Name | Description |
| --- | --- |
| [`cells`](!code#context.cells "GridCell[]") | Resolved grid cells with their positions, spans, and grid-area styles. |
| [`fitWidth`](!code#context.fitWidth "boolean") | Whether all column widths are fixed (non-fractional), allowing the grid to shrink-wrap. |
| [`resolvedGrid`](!code#context.resolvedGrid "ResolvedGrid") | The fully resolved grid structure with each cell's content, spans, alignment, and attributes. |
| [`grid`](!code#context.grid "GridSchema") | The grid schema, derived from the grid prop, inline grid, or default rows/cols dimensions. |
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
| [`colHeaders`](!code#context.colHeaders "boolean") | Whether the first row of the grid uses header styling. |
| [`rowHeaders`](!code#context.rowHeaders "boolean") | Whether the first column of the grid uses header styling. |
| [`gridClass`](!code#context.gridClass "string") | A unique CSS class scoped to this grid instance, used to target the injected grid style rule. |
| [`gridCss`](!code#context.gridCss "string") | The full CSS text for the grid layout including template columns, rows, container sizing, and spanned cell grid-area rules. |

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
| [`dirty`](!code#context.dirty "boolean") | Whether the current model value differs from the initial model value. |
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
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`page`](!code#context.page "PageProp \| undefined") | Page metadata for stepped/tabbed forms. |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
| [`nonce`](!code#context.nonce "string \| undefined") | Unique security nonce for injecting scoped styles. |
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
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "T") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "T"), [`context$`](!code#events.load.context$ "TContext") | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the element is reset to its default value. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the element's value is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the element becomes invalid. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the element becomes valid after having been invalid. |
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
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `default` | [`cells`](!code#slot.default.cells "GridCell[]") | Slot that replaces the default grid content. Receives the resolved grid cells. |
| `cell` | [`cell`](!code#slot.cell.cell "GridCell") | Slot that replaces each individual grid cell rendering. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts
component="VfGrid"
:examples="{
default: 'Default',
}"
:schema="{
label: 'Contact details',
info: 'Visible only to our support team',
help: 'How we can reach you about your order',
hint: 'This will be used for delivery updates',
valign: 'middle',
rules: 'required',
grid: [
[
{
type: 'input-text',
name: 'first_name',
placeholder: 'First name',
default: 'John',
},
{
type: 'input-text',
name: 'last_name',
placeholder: 'Last name',
default: 'Doe',
},
],
[
{
type: 'input-text',
name: 'email',
placeholder: 'Email',
default: 'john@example.com',
},
{
type: 'input-text',
name: 'phone',
placeholder: 'Phone',
default: '(555) 012-3456',
},
],
],
showRequired: ['label'],
onMounted: ({ messageBag }) => {
messageBag.append('Email could not be verified', 'error')
messageBag.append('A confirmation was sent to your email', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfGrid
      name="fields"
      v-bind="schema"
    />
</template>
</VPParts>
<!-- #endregion viewer -->

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
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-grid` `.vf-tabular?` `.vf-wrap-col-headers?` `.vf-wrap-row-headers?` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-align-label`](!code#parts.root.modifiers.data-align-label "''") |

### `labelGroup`

The container holding the label and required indicator.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-label-group` |

### `label`

The label element; renders as the corresponding heading when the container's `heading` prop is set.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<span>` `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` |
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

### `grid`

The grid layout element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-grid-grid` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-fit`](!code#parts.grid.modifiers.data-fit "''") |

### `cell`

Each cell element. Receives alignment, schema, and header options.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-grid-cell` `.vf-grid-col-header?` `.vf-grid-row-header?` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-align`](!code#parts.cell.modifiers.data-align "AlignProp") [`data-valign`](!code#parts.cell.modifiers.data-valign "ValignProp") |

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
   * Element tokens
   * -------------------------------------------------------------------------- */
  --vf-grid-gutter-x: var(--vf-gutter);
  --vf-grid-gutter-y: var(--vf-gutter);

  --vf-grid-col-header-color: inherit;
  --vf-grid-header-font-size: 1rem;
  --vf-grid-row-header-color: inherit;

  --vf-tabular-bg: var(--vf-white);

  --vf-tabular-border-color: var(--vf-gray-300);
  --vf-tabular-border-style: solid;
  --vf-tabular-border-width: 1px;
  --vf-tabular-radius: var(--vf-radius);

  --vf-tabular-col-header-bg: var(--vf-gray-100);
  --vf-tabular-col-header-border-color: var(--vf-gray-300);
  --vf-tabular-col-header-color: inherit;
  --vf-tabular-header-font-size: 1rem;
  --vf-tabular-header-font-weight: 700;
  --vf-tabular-header-padding: var(--vf-py) var(--vf-px);
  --vf-tabular-row-header-bg: var(--vf-gray-100);
  --vf-tabular-row-header-border-color: var(--vf-gray-300);
  --vf-tabular-row-header-color: inherit;

  --vf-tabular-cell-min-height: calc(1lh + var(--vf-input-pt) + var(--vf-input-pb) + var(--vf-input-border-width-t) + var(--vf-input-border-width-b));
  --vf-tabular-text-cell-padding: var(--vf-py) var(--vf-px);

  --vf-tabular-color: var(--vf-gray-800);

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
   * Element tokens
   * -------------------------------------------------------------------------- */
  gridGutterX: '$gutter',
  gridGutterY: '$gutter',

  gridColHeaderColor: 'inherit',
  gridHeaderFontSize: '1rem',
  gridRowHeaderColor: 'inherit',

  tabularBg: '$white',

  tabularBorderColor: '$gray300',
  tabularBorderStyle: 'solid',
  tabularBorderWidth: '1px',
  tabularRadius: '$radius',

  tabularColHeaderBg: '$gray100',
  tabularColHeaderBorderColor: '$gray300',
  tabularColHeaderColor: 'inherit',
  tabularHeaderFontSize: '1rem',
  tabularHeaderFontWeight: '700',
  tabularHeaderPadding: '$py $px',
  tabularRowHeaderBg: '$gray100',
  tabularRowHeaderBorderColor: '$gray300',
  tabularRowHeaderColor: 'inherit',

  tabularCellMinHeight: 'calc(1lh + var(--vf-input-pt) + var(--vf-input-pb) + var(--vf-input-border-width-t) + var(--vf-input-border-width-b))',
  tabularTextCellPadding: '$py $px',

  tabularColor: '$gray800',

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
