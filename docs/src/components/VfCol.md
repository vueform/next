# VfCol

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

`VfCol` defines a cell inside a `VfGrid` row. Place elements or plain text inside it.

::: usage

```vue [Preview]
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

<!-- #region usage-text-content -->

## Text Content

Cells can contain plain text or HTML content instead of form elements.

::: usage nomodel

```vue [Preview]
<VfGrid name="info" :widths="['120px', '1fr']">
  <VfRow>
    <VfCol>Name:</VfCol>
    <VfCol><VfText name="name" /></VfCol>
  </VfRow>
  <VfRow>
    <VfCol>Email:</VfCol>
    <VfCol><VfText name="email" /></VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  info: {
    type: 'grid',
    widths: ['120px', '1fr'],
    grid: [
      ['Name:', { type: 'text', name: 'name' }],
      ['Email:', { type: 'text', name: 'email' }],
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

<!-- #endregion usage-text-content -->

<!-- #region usage-colspan-and-rowspan -->

## Colspan and Rowspan

The `colspan` prop makes a cell span multiple columns. The `rowspan` prop makes it span multiple rows.

::: usage

```vue [Preview]
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
      [{ type: 'text', name: 'zip', placeholder: 'ZIP' }],
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

<!-- #endregion usage-colspan-and-rowspan -->

<!-- #region usage-alignment -->

## Alignment

The `align` prop controls horizontal alignment (`left`, `center`, `right`). The `valign` prop controls vertical alignment (`top`, `middle`, `bottom`). These override the grid-level alignment for individual cells.

::: usage nomodel

```vue [Preview]
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
<!-- #endregion usage -->
<!-- @endtab -->

<!-- @tab Props -->

## Props

<!-- @props-intro-start -->

Configure the component's behavior and appearance with these props.
<!-- @props-intro-end -->

<!-- @props-start -->
<!-- @collapsible -->

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`header`](!code#props.header "boolean") | `false` | Whether this column cell should be styled as a header. Automatically resolves to column header, row header, or both based on position. |
| [`align`](!code#props.align "AlignProp") | — | Horizontal alignment of the cell content. |
| [`valign`](!code#props.valign "ValignProp") | — | Vertical alignment of the cell content. |
| [`colspan`](!code#props.colspan "number \| string") | — | The number of grid columns this cell spans. |
| [`rowspan`](!code#props.rowspan "number \| string") | — | The number of grid rows this cell spans. |

### Customization {#props-customization}

| Prop | Default | Description |
| --- | --- | --- |
| [`parts`](!code#props.parts "P") | — | Custom DOM attribute overrides for the component's structural parts. |
| [`class`](!code#props.class "ClassValue") | — | CSS classes to apply to the component's root element. |
| [`classes`](!code#props.classes "C") | — | Custom CSS class overrides for the component's structural parts. |
| [`reclass`](!code#props.reclass "C") | — | CSS class overrides that replace (rather than merge with) default classes. |
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
| [`props`](!code#context.props "object") | The resolved component props with defaults applied. |

### Col {#section-col}

| Name | Description |
| --- | --- |
| [`align`](!code#context.align "AlignProp \| NonNullable<TProps[\"align\"]>") | The resolved horizontal alignment, falling back to the grid's align prop. |
| [`valign`](!code#context.valign "ValignProp \| NonNullable<TProps[\"valign\"]>") | The resolved vertical alignment, falling back to the grid's valign prop. |
| [`cell`](!code#context.cell "GridCell \| undefined") | The grid cell data for this column at the current row position. |
| [`cellCss`](!code#context.cellCss "string") | The CSS text for the cell's grid-area when it spans multiple columns or rows. |
| [`colspan`](!code#context.colspan "number") | The number of columns the cell spans. |
| [`rowspan`](!code#context.rowspan "number") | The number of rows the cell spans. |
| [`colHeader`](!code#context.colHeader "boolean") | Whether this cell should be styled as a column header, resolved from the header prop and position or the parent grid's colHeaders setting. |
| [`rowHeader`](!code#context.rowHeader "boolean") | Whether this cell should be styled as a row header, resolved from the header prop and position or the parent grid's rowHeaders setting. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
| [`nonce`](!code#context.nonce "string \| undefined") | Unique security nonce for injecting scoped styles. |

### Events {#section-events}

| Name | Description |
| --- | --- |
| [`fire()`](!code#context.fire "(e: string, ...args: any[]) => any") | Fires an event synchronously, invoking before, main, and after listeners in order. |
| [`fireAsync()`](!code#context.fireAsync "(e: string, ...args: any[]) => Promise<any>") | Fires an event asynchronously, awaiting each callback and short-circuiting when any returns `false`. |
| [`on()`](!code#context.on "(e: string, callback: (...args: any[]) => any) => void") | Subscribes a callback to a specific event. |
| [`off()`](!code#context.off "(e: string, callback: (...args: any[]) => any) => void") | Removes a previously registered event callback. |
| [`onBefore()`](!code#context.onBefore "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs before the main event listeners. |
| [`onAfter()`](!code#context.onAfter "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs after the main event listeners. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "number") | The unique identifier of the component instance, used to key the cell within the parent row. |
<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->
<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/event-handlers) for details.

<!-- @events-start -->
| Name | Params | Description |
| --- | --- | --- |
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
| `default` | — | Slot for the column's default content. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- @parts-start -->
### `root`

The root column element.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
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
  --vf-grid-col-header-color: inherit;
  --vf-grid-header-font-size: 1rem;
  --vf-grid-row-header-color: inherit;
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Component tokens
   * -------------------------------------------------------------------------- */
  gridColHeaderColor: 'inherit',
  gridHeaderFontSize: '1rem',
  gridRowHeaderColor: 'inherit',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->
<!-- @endtab -->
<!-- @endtabs -->
