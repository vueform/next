# VfElements

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

`VfElements` is the wrapper component that contains the form's rendered elements. Override the `elements` slot on `VfForm` to render `VfElements` with custom markup around it. The slot receives `resolvedSchema` which must be passed through to render the elements.

::: usage

```vue [Preview]
<VfForm :schema="{
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
}">
  <template #content="{ context }">
    <VfElements>
      <component
        v-for="el in context.resolvedSchema"
        :is="el.component"
        v-bind="el.props"
        :key="el.props.name"
      />
    </VfElements>
  </template>
</VfForm>
```

```vue [Template]
<VfForm :schema="{
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
}">
  <template #elements="{ resolvedSchema }">
    <VfElements>
      <component
        v-for="el in resolvedSchema"
        :is="el.component"
        v-bind="el.props"
        :key="el.props.name"
      />
    </VfElements>
  </template>
  <VfText name="name" label="Name" />
  <VfText name="email" label="Email" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, defineSlot, useForm } from '@vueform/ui'
import { h, resolveComponent } from 'vue'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: { type: 'text', label: 'Email' },
})

const [MyForm] = useForm({
  schema,
  slots: {
    template: defineSlot('VfForm.template', {
      props: ['context'],
      setup: ({ context }) => {
        return () => {
          const VfElements = resolveComponent('VfElements')
          return h('div', [
            h(VfElements, { resolvedSchema: context.resolvedSchema }, () =>
              context.resolvedSchema.map((el: any) =>
                h(
                  typeof el.component === 'string'
                    ? resolveComponent(el.component)
                    : el.component,
                  { ...el.props, key: el.props.name }
                )
              )
            ),
          ])
        }
      },
    }),
  },
})
</script>

<template>
  <MyForm />
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

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |

### Events {#section-events}

| Name | Description |
| --- | --- |
| [`fire()`](!code#context.fire "(e: string, ...args: any[]) => any") | Fires an event synchronously, invoking before, main, and after listeners in order. |
| [`fireAsync()`](!code#context.fireAsync "(e: string, ...args: any[]) => Promise<any>") | Fires an event asynchronously, awaiting each callback and short-circuiting when any returns `false`. |
| [`on()`](!code#context.on "(e: string, callback: (...args: any[]) => any) => void") | Subscribes a callback to a specific event. |
| [`off()`](!code#context.off "(e: string, callback: (...args: any[]) => any) => void") | Removes a previously registered event callback. |
| [`onBefore()`](!code#context.onBefore "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs before the main event listeners. |
| [`onAfter()`](!code#context.onAfter "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs after the main event listeners. |
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
| `default` | — | Slot for the default content of the elements container. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- @parts-start -->
### `root`

The root elements container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
<!-- @parts-end -->
<!-- @endtab -->
<!-- @endtabs -->
