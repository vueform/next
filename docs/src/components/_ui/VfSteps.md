# VfSteps

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

`VfSteps` renders the progress indicator in a stepped form. Override the `steps` slot on `VfForm` to render `VfSteps` with custom props or alongside additional content.

::: usage w-xl

```vue [Preview]
<VfForm stepped hide-errors>
  <template #steps="{ pager }">
    <VfSteps :pager="pager" />
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
    steps: defineSlot('VfForm.steps', {
      props: ['pager'],
      setup: (props) => () => {
        const VfSteps = resolveComponent('VfSteps')

        return h(VfSteps, { pager: props.pager })
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

### Component {#props-steps}

| Prop | Default | Description |
| --- | --- | --- |
| [`pager`](!code#props.pager "Pager") | — | **Required.** The pager instance managing multi-step form navigation. |

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
| `wrapper` | [`index`](!code#slot.wrapper.index "number") [`label`](!code#slot.wrapper.label "string") [`meta`](!code#slot.wrapper.meta "Record<string, any>") [`selected`](!code#slot.wrapper.selected "boolean") [`invalid`](!code#slot.wrapper.invalid "boolean") [`loading`](!code#slot.wrapper.loading "boolean") [`enabled`](!code#slot.wrapper.enabled "boolean") [`completed`](!code#slot.wrapper.completed "boolean") [`el$`](!code#slot.wrapper.el$ "UnknownElement") [`page`](!code#slot.wrapper.page "ResolvedPage") | Slot that replaces each step wrapper element. Receives step state and page info. |
| `default` | [`index`](!code#slot.default.index "number") [`label`](!code#slot.default.label "string") [`meta`](!code#slot.default.meta "Record<string, any>") [`selected`](!code#slot.default.selected "boolean") [`invalid`](!code#slot.default.invalid "boolean") [`loading`](!code#slot.default.loading "boolean") [`enabled`](!code#slot.default.enabled "boolean") [`completed`](!code#slot.default.completed "boolean") [`el$`](!code#slot.default.el$ "UnknownElement") [`bindings`](!code#slot.default.bindings "PartBindings<'step', VfStepsParts, VfStepsModifiers, VfStepsA11y>") | Slot that replaces each step's inner content. Receives step state. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->
<VPParts component="VfSteps" :examples="{ default: 'Default' }">
  <template #example-default>
    Example
  </template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->
### `root`

The root steps container element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-steps` |

### `list`

The ordered list element containing all steps.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<ol>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-steps-wrapper` |

### `wrapper`

Each step wrapper. Receives the step's resolved page.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<li>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-step-wrapper` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-selected`](!code#parts.wrapper.modifiers.data-selected "''") [`data-enabled`](!code#parts.wrapper.modifiers.data-enabled "''") [`data-completed`](!code#parts.wrapper.modifiers.data-completed "''") [`data-invalid`](!code#parts.wrapper.modifiers.data-invalid "''") [`data-loading`](!code#parts.wrapper.modifiers.data-loading "''") |

### `step`

The step content element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<li>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-step` |
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
  --vf-steps-margin: 0 0 var(--vf-gutter) 0;

  --vf-steps-bg-danger: var(--vf-red);
  --vf-steps-bg-disabled: var(--vf-gray-200);
  --vf-steps-bg-enabled: var(--vf-brand);

  --vf-steps-color-danger: var(--vf-red);
  --vf-steps-color-disabled: var(--vf-gray-400);
  --vf-steps-color-enabled: inherit;
  --vf-steps-color-selected: inherit;
  --vf-steps-icon-color: var(--vf-white);

  --vf-steps-icon-completed: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' d='M2 8l4 5 8-10'/></svg>");
  --vf-steps-icon-danger: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect x='6' y='0' width='4' height='9' rx='2' fill='white'/><circle cx='8' cy='13' r='2' fill='white'/></svg>");
  --vf-steps-icon-selected: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><circle cx='4' cy='4' r='4' fill='white'/></svg>");

  --vf-steps-font-size: 1rem;
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Component tokens
   * -------------------------------------------------------------------------- */
  stepsMargin: '0 0 $gutter 0',

  stepsBgDanger: '$red',
  stepsBgDisabled: '$gray200',
  stepsBgEnabled: '$brand',

  stepsColorDanger: '$red',
  stepsColorDisabled: '$gray400',
  stepsColorEnabled: 'inherit',
  stepsColorSelected: 'inherit',
  stepsIconColor: '$white',

  stepsIconCompleted: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' d='M2 8l4 5 8-10'/></svg>\")",
  stepsIconDanger: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect x='6' y='0' width='4' height='9' rx='2' fill='white'/><circle cx='8' cy='13' r='2' fill='white'/></svg>\")",
  stepsIconSelected: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><circle cx='4' cy='4' r='4' fill='white'/></svg>\")",

  stepsFontSize: '1rem',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->
<!-- @endtab -->
<!-- @endtabs -->
