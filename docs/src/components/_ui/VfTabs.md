# VfTabs

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

`VfTabs` renders the tab bar in a tabbed form. Override the `tabs` slot on `VfForm` to render `VfTabs` with custom props or alongside additional content.

::: usage

```vue [Preview]
<VfForm tabbed>
  <template #tabs="{ pager }">
    <VfTabs :pager="pager" />
  </template>
  <VfGroup name="general" page="General">
    <VfText name="name" label="Name" />
  </VfGroup>
  <VfGroup name="profile" page="Profile">
    <VfText name="bio" label="Bio" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, defineSlot, useForm } from '@vueform/ui'
import { h, resolveComponent } from 'vue'

const schema = defineSchema({
  general: {
    type: 'group',
    page: 'General',
    schema: {
      name: { type: 'text', label: 'Name' },
    },
  },
  profile: {
    type: 'group',
    page: 'Profile',
    schema: {
      bio: { type: 'text', label: 'Bio' },
    },
  },
})

const [MyForm] = useForm({
  schema,
  tabbed: true,
  slots: {
    tabs: defineSlot('VfForm.tabs', {
      props: ['pager'],
      setup: (props) => () => {
        const VfTabs = resolveComponent('VfTabs')

        return h(VfTabs, { pager: props.pager })
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

### Component {#props-tabs}

| Prop | Default | Description |
| --- | --- | --- |
| [`pager`](!code#props.pager "Pager") | — | **Required.** The pager instance managing tab navigation. |

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
| `wrapper` | [`class`](!code#slot.wrapper.class "ClassValue") [`index`](!code#slot.wrapper.index "number") [`label`](!code#slot.wrapper.label "string") [`meta`](!code#slot.wrapper.meta "Record<string, any>") [`selected`](!code#slot.wrapper.selected "boolean") [`invalid`](!code#slot.wrapper.invalid "boolean") [`loading`](!code#slot.wrapper.loading "boolean") [`el$`](!code#slot.wrapper.el$ "UnknownElement") [`page`](!code#slot.wrapper.page "ResolvedPage") | Slot that replaces each tab wrapper element. Receives tab state and page info. |
| `default` | [`index`](!code#slot.default.index "number") [`label`](!code#slot.default.label "string") [`meta`](!code#slot.default.meta "Record<string, any>") [`selected`](!code#slot.default.selected "boolean") [`invalid`](!code#slot.default.invalid "boolean") [`loading`](!code#slot.default.loading "boolean") [`el$`](!code#slot.default.el$ "UnknownElement") | Slot that replaces each tab's inner content. Receives tab state. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->
<VPParts component="VfTabs" :examples="{ default: 'Default' }">
  <template #example-default>
    Example
  </template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->
### `root`

The root tabs container element.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-tabs` |

### `list`

The tab list element.

| | |
| --- | --- |
| **Element** | `<ul>` |
| **Classes** | `.vf-tabs-wrapper` |

### `wrapper`

Each tab wrapper. Receives the resolved page data.

| | |
| --- | --- |
| **Element** | `<li>` |
| **Classes** | `.vf-tab-wrapper` `.vf-selected?` `.vf-invalid?` |

### `tab`

The tab button element.

| | |
| --- | --- |
| **Element** | `<button>` |
| **Classes** | `.vf-tab` |
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
  --vf-tab-padding: 0 1rem 0.5rem 1rem;
  --vf-tabs-gutter-x: 0;
  --vf-tabs-gutter-y: 0;
  --vf-tabs-margin: 0 0 var(--vf-gutter) 0;

  --vf-tab-color: inherit;
  --vf-tab-color-danger: var(--vf-red);
  --vf-tab-color-selected: inherit;
  --vf-tab-color-selected-danger: var(--vf-red);

  --vf-tab-bg: transparent;
  --vf-tab-bg-danger: transparent;
  --vf-tab-bg-selected: transparent;
  --vf-tab-bg-selected-danger: transparent;

  --vf-tab-border-color: transparent;
  --vf-tab-border-color-danger: transparent;
  --vf-tab-border-color-selected: var(--vf-brand);
  --vf-tab-border-color-selected-danger: var(--vf-red);
  --vf-tab-border-width: 0 0 2px 0;
  --vf-tab-radius: 0px;

  --vf-tabs-font-size: 1rem;
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Component tokens
   * -------------------------------------------------------------------------- */
  tabPadding: '0 1rem 0.5rem 1rem',
  tabsGutterX: '0',
  tabsGutterY: '0',
  tabsMargin: '0 0 $gutter 0',

  tabColor: 'inherit',
  tabColorDanger: '$red',
  tabColorSelected: 'inherit',
  tabColorSelectedDanger: '$red',

  tabBg: 'transparent',
  tabBgDanger: 'transparent',
  tabBgSelected: 'transparent',
  tabBgSelectedDanger: 'transparent',

  tabBorderColor: 'transparent',
  tabBorderColorDanger: 'transparent',
  tabBorderColorSelected: '$brand',
  tabBorderColorSelectedDanger: '$red',
  tabBorderWidth: '0 0 2px 0',
  tabRadius: '0px',

  tabsFontSize: '1rem',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->
<!-- @endtab -->
<!-- @endtabs -->
