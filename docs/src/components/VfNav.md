# VfNav

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

`VfNav` renders the Back, Next, and Finish buttons in a stepped form. Override the `nav` slot on `VfForm` to render `VfNav` with custom props or alongside additional content.

::: usage w-xl

```vue [Preview]
<VfForm stepped hide-errors>
  <template #nav="{ pager }">
    <VfNav
      :pager="pager"
      next="Continue"
      finish="Done"
    />
  </template>
  <VfGroup name="personal" page="Personal">
    <VfText name="name" label="Name" />
  </VfGroup>
  <VfGroup name="contact" page="Contact">
    <VfText name="email" label="Email" />
  </VfGroup>
  <VfGroup name="address" page="Address">
    <VfText name="city" label="City" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, defineSlot, useForm } from '@vueform/ui'
import { h, resolveComponent } from 'vue'

const schema = defineSchema({
  personal: {
    type: 'group',
    page: 'Personal',
    schema: {
      name: { type: 'text', label: 'Name' },
    },
  },
  contact: {
    type: 'group',
    page: 'Contact',
    schema: {
      email: { type: 'text', label: 'Email' },
    },
  },
  address: {
    type: 'group',
    page: 'Address',
    schema: {
      city: { type: 'text', label: 'City' },
    },
  },
})

const [MyForm] = useForm({
  schema,
  stepped: true,
  hideErrors: true,
  slots: {
    nav: defineSlot('VfForm.nav', {
      props: ['pager'],
      setup: (props) => () => {
        const VfNav = resolveComponent('VfNav')

        return h(VfNav, {
          pager: props.pager,
          next: 'Continue',
          finish: 'Done',
        })
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

### Component {#props-nav}

| Prop | Default | Description |
| --- | --- | --- |
| [`pager`](!code#props.pager "Pager") | — | **Required.** The pager instance managing step/tab navigation state. |
| [`back`](!code#props.back "TProp<string, TContext>") | — | The label text for the "back" navigation button. |
| [`next`](!code#props.next "TProp<string, TContext>") | — | The label text for the "next" navigation button. |
| [`finish`](!code#props.finish "TProp<string, TContext>") | — | The label text for the "finish" navigation button. |
| [`hideBack`](!code#props.hideBack "boolean") | `true` | Whether to hide the "back" navigation button. |
| [`position`](!code#props.position "NavPosProp") | `'auto'` | The alignment of the navigation buttons: `'left'`, `'center'`, `'right'`, `'fluid'` (stretched to full width), or `'auto'`. |

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

### Navigation {#section-nav}

| Name | Description |
| --- | --- |
| [`backLabel`](!code#context.backLabel "UnwrapDynamicProp<string \| NonNullable<TProps[\"back\"]>> \| undefined") | The resolved label text for the "back" button. |
| [`nextLabel`](!code#context.nextLabel "UnwrapDynamicProp<string \| NonNullable<TProps[\"next\"]>> \| undefined") | The resolved label text for the "next" button. |
| [`finishLabel`](!code#context.finishLabel "UnwrapDynamicProp<string \| NonNullable<TProps[\"finish\"]>> \| undefined") | The resolved label text for the "finish" button. |
| [`describedby`](!code#context.describedby "string \| undefined") | The `aria-describedby` value linking to the status element when on the last enabled page with errors or loading. |
| [`statusId`](!code#context.statusId "string") | The HTML `id` for the navigation status message element. |
| [`fluid`](!code#context.fluid "boolean") | Whether the navigation buttons are stretched to the full available width (`position: 'fluid'`). |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`loading`](!code#context.loading "boolean") | Whether the current page is in a loading state. |

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
| `back` | [`label`](!code#slot.back.label "TProp \| string \| undefined") [`pager`](!code#slot.back.pager "Pager") [`form$`](!code#slot.back.form$ "any") [`disabled`](!code#slot.back.disabled "boolean \| string \| ConditionalProp") [`fluid`](!code#slot.back.fluid "boolean") [`bindings`](!code#slot.back.bindings "VfNavBindings['back']") [`back`](!code#slot.back.back "() => Promise<void>") | Slot that replaces the back button. The payload is what VfNav provides — a fixed list, independent of the registered `VfButton`'s prop surface, since the slot may render anything. |
| `back-text` | [`label`](!code#slot.back-text.label "string \| undefined") [`pager`](!code#slot.back-text.pager "Pager") [`form$`](!code#slot.back-text.form$ "any") | Slot that replaces the back button's text label. |
| `next` | [`label`](!code#slot.next.label "TProp \| string \| undefined") [`pager`](!code#slot.next.pager "Pager") [`form$`](!code#slot.next.form$ "any") [`disabled`](!code#slot.next.disabled "boolean \| string \| ConditionalProp") [`loading`](!code#slot.next.loading "boolean \| ConditionalProp") [`fluid`](!code#slot.next.fluid "boolean") [`bindings`](!code#slot.next.bindings "VfNavBindings['next']") [`next`](!code#slot.next.next "() => Promise<void>") | Slot that replaces the next button. The payload is what VfNav provides — a fixed list, independent of the registered `VfButton`'s prop surface, since the slot may render anything. |
| `next-text` | [`label`](!code#slot.next-text.label "string \| undefined") [`pager`](!code#slot.next-text.pager "Pager") [`form$`](!code#slot.next-text.form$ "any") | Slot that replaces the next button's text label. |
| `finish` | [`label`](!code#slot.finish.label "TProp \| string \| undefined") [`pager`](!code#slot.finish.pager "Pager") [`form$`](!code#slot.finish.form$ "any") [`disabled`](!code#slot.finish.disabled "boolean \| string \| ConditionalProp") [`loading`](!code#slot.finish.loading "boolean \| ConditionalProp") [`fluid`](!code#slot.finish.fluid "boolean") [`bindings`](!code#slot.finish.bindings "VfNavBindings['finish']") [`finish`](!code#slot.finish.finish "() => Promise<void>") | Slot that replaces the finish button. The payload is what VfNav provides — a fixed list, independent of the registered `VfButton`'s prop surface, since the slot may render anything. |
| `finish-text` | [`label`](!code#slot.finish-text.label "string \| undefined") [`pager`](!code#slot.finish-text.pager "Pager") [`form$`](!code#slot.finish-text.form$ "any") | Slot that replaces the finish button's text label. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- @parts-start -->
### `root`

The root navigation element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-nav` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-position`](!code#parts.root.modifiers.data-position "NavPosProp") [`data-no-back`](!code#parts.root.modifiers.data-no-back "''") |

### `back`

The back button element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfButton>`](./VfButton.md) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-nav-back` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`aria-disabled`](!code#parts.back.a11y.aria-disabled "true") |

### `next`

The next button element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfButton>`](./VfButton.md) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-nav-next` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-loading`](!code#parts.next.modifiers.data-loading "''") |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`aria-busy`](!code#parts.next.a11y.aria-busy "true") [`aria-disabled`](!code#parts.next.a11y.aria-disabled "true") [`aria-describedby`](!code#parts.next.a11y.aria-describedby "string") |

### `finish`

The finish button element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfButton>`](./VfButton.md) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-nav-finish` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-loading`](!code#parts.finish.modifiers.data-loading "''") |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`aria-busy`](!code#parts.finish.a11y.aria-busy "true") [`aria-disabled`](!code#parts.finish.a11y.aria-disabled "true") [`aria-describedby`](!code#parts.finish.a11y.aria-describedby "string") |

### `srOnlyLoading`

The screen-reader-only loading indicator element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<span>` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`id`](!code#parts.srOnlyLoading.a11y.id "string") [`role`](!code#parts.srOnlyLoading.a11y.role "'status'") |
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
  --vf-nav-gutter: var(--vf-gutter);
  --vf-nav-justify: space-between;
  --vf-nav-margin: var(--vf-gutter) 0 0 0;
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Component tokens
   * -------------------------------------------------------------------------- */
  navGutter: '$gutter',
  navJustify: 'space-between',
  navMargin: '$gutter 0 0 0',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->
<!-- @endtab -->
<!-- @endtabs -->
