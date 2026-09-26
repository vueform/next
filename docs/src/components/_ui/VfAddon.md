# VfAddon

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

`VfAddon` renders a single addon cell inside an element's input wrapper. It is used when overriding the `addonBefore` or `addonAfter` slot of an element to provide custom addon content.

::: usage

```vue [Preview]
<VfText name="website" label="Website">
  <template #addon-before>
    <VfAddon>https://</VfAddon>
  </template>
</VfText>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, defineSlot, useForm } from '@vueform/ui'
import { h, resolveComponent } from 'vue'

const schema = defineSchema({
  website: {
    type: 'text',
    label: 'Website',
    slots: {
      addonBefore: defineSlot('VfText.addonBefore', {
        setup: () => () => {
          const VfAddon = resolveComponent('VfAddon')
          return h(VfAddon, null, () => 'https://')
        },
      }),
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

### Component {#props-addon}

| Prop | Default | Description |
| --- | --- | --- |
| [`addon`](!code#props.addon "AddonItem") | — | The addon content — a text value or an element schema tuple. |

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
| [`props`](!code#context.props "object") | The resolved component props with defaults applied. |

### Addon {#section-addon}

| Name | Description |
| --- | --- |
| [`resolved`](!code#context.resolved "ResolvedAddon") | Resolves the addon prop into a sanitized text string or a dynamic component descriptor (`{ component, props }`) for rendering. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->
<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/events) for details.

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
| `default` | — | Default slot for addon content. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->
<VPParts component="VfAddon" :examples="{ default: 'Default' }">
  <template #example-default>
    Example
  </template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->
### `root`

The root wrapper element.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-addon` |
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
  --vf-addon-bg: var(--vf-white);
  --vf-addon-bg-danger: var(--vf-white);

  --vf-addon-color: inherit;
  --vf-addon-color-danger: inherit;

  --vf-addon-border-color: var(--vf-gray-300);
  --vf-addon-border-color-danger: var(--vf-gray-300);
  --vf-addon-border-style: solid;
  --vf-addon-border-width: 1px;
  --vf-addon-radius: calc(var(--vf-radius) - var(--vf-border-width-t));

  --vf-addon-after-padding: 0 var(--vf-px);
  --vf-addon-before-margin: 0;
  --vf-addon-before-padding: 0 var(--vf-px);
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Component tokens
   * -------------------------------------------------------------------------- */
  addonBg: '$white',
  addonBgDanger: '$white',

  addonColor: 'inherit',
  addonColorDanger: 'inherit',

  addonBorderColor: '$gray300',
  addonBorderColorDanger: '$gray300',
  addonBorderStyle: 'solid',
  addonBorderWidth: '1px',
  addonRadius: 'calc($radius - $borderWidthT)',

  addonAfterPadding: '0 $px',
  addonBeforeMargin: '0',
  addonBeforePadding: '0 $px',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->
<!-- @endtab -->
<!-- @endtabs -->
