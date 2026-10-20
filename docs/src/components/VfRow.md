# VfRow

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!-- #region usage-basic -->

## Basic

`VfRow` defines a row inside a `VfGrid`. Each row contains one or more `VfCol` cells.

::: usage

```vue [Preview]
<VfGrid name="contacts">
  <VfRow>
    <VfCol>
      <VfText name="first_name" placeholder="First name" />
    </VfCol>
    <VfCol>
      <VfText name="last_name" placeholder="Last name" />
    </VfCol>
  </VfRow>
  <VfRow>
    <VfCol>
      <VfText name="email" placeholder="Email" />
    </VfCol>
    <VfCol>
      <VfText name="phone" placeholder="Phone" />
    </VfCol>
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
| [`align`](!code#props.align "AlignProp") | `'left'` | The horizontal alignment of content within the row. |
| [`valign`](!code#props.valign "ValignProp") | `'baseline'` | The vertical alignment of content within the row. |
| [`colspan`](!code#props.colspan "number \| string") | — | The number of grid columns this row spans. |
| [`rowspan`](!code#props.rowspan "number \| string") | — | The number of grid rows this row spans. |

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

### Row {#section-row}

| Name | Description |
| --- | --- |
| [`row`](!code#context.row "number") | The zero-based row index within the parent grid. |
| [`cols`](!code#context.cols "number[]") | The UIDs of the columns belonging to this row. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "number") | The unique internal identifier for this row instance. |
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
| `default` | — | Slot for the row's default content. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- @parts-start -->
### `root`

The root row element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
<!-- @parts-end -->
<!-- @endtab -->
<!-- @endtabs -->
