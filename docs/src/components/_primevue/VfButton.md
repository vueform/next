<script setup>
import { ref } from 'vue'

const loading = ref(false)

const handleClick = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 1500)
}

const handleLoadingClick = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 1500)
}

const handleSubmitClick = (e, { form$ }) => alert(`Hello ${form$.model.name || 'there'}!`)
</script>

# VfButton

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

## Basic Usage

`VfButton` wraps PrimeVue's [Button](https://v4.primevue.org/button/) and forwards its entire API — original props, events, and slots all work as documented, apart from the few exceptions in the [PrimeVue Props](#props.props-primevue) table. On top of that, Vueform adds its own props, events, slots, and features — data binding, validation, conditions, and layout — which the examples on this page demonstrate. Props like `text`, `icon`, `severity`, and `badge` also gain extra capabilities covered in the sections below.

::: usage center nomodel

```vue [Preview]
<VfButton name="submit" text="Submit" icon="pi pi-check" severity="primary" />
```

```vue [Template]
<VfButton
  name="submit"
  text="Submit"
  icon="pi pi-check"
  severity="primary"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  submit: {
    type: 'button',
    text: 'Submit',
    icon: 'pi pi-check',
    severity: 'primary',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For the official PrimeVue examples, visit [Button](https://v4.primevue.org/button/).

## Text

The `text` prop sets the button label. It replaces PrimeVue's `label` and is a [Text Prop](/guide/dynamic-props):

::: usage center nomodel

```vue [Preview]
<VfButton name="button" text="Button" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  button: { type: 'button', text: 'Button' },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Icon

The `icon` prop sets the button's icon. It does not require the `pi pi-` prefix — just use the icon name (e.g. `check`). The resolved class format can be customized in [config](/guide/configuration#icon).

::: usage center nomodel

```vue [Preview]
<VfButton name="remove" icon="times" />
<VfButton name="submit" icon="check" text="Submit" />
<VfButton name="delete" icon="trash" text="Delete" icon-pos="right" />
```

```vue [Template]
<VfGroup name="icons" stacked>
  <VfButton name="remove" icon="times" />
  <VfButton name="submit" icon="check" text="Submit" />
  <VfButton name="delete" icon="trash" text="Delete" icon-pos="right" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  remove: { type: 'button', icon: 'times' },
  submit: { type: 'button', icon: 'check', text: 'Submit' },
  delete: { type: 'button', icon: 'track', text: 'Delete', iconPos: 'right' },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Tooltip

The `tooltip` prop adds a PrimeVue tooltip to the button via the `v-tooltip` directive. Control placement with `tooltipPos` — `'top'`, `'bottom'` (default), `'left'`, or `'right'`.

::: usage center nomodel

```vue [Preview]
<VfButton name="left" tooltip="Left" tooltip-pos="left" />
<VfButton name="top" tooltip="Top" tooltip-pos="top" />
<VfButton name="bottom" tooltip="Bottom" tooltip-pos="bottom" />
<VfButton name="right" tooltip="Right" tooltip-pos="right" />
```

```vue [Template]
<VfGroup name="tooltips" stacked>
  <VfButton
    name="left"
    text="Left"
    tooltip="Left"
    tooltip-pos="left"
  />
  <VfButton
    name="top"
    text="Top"
    tooltip="Top"
    tooltip-pos="top"
  />
  <VfButton
    name="bottom"
    text="Bottom"
    tooltip="Bottom"
  />
  <VfButton
    name="right"
    text="Right"
    tooltip="Right"
    tooltip-pos="right"
  />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  left: {
    type: 'button',
    text: 'Left',
    tooltip: 'Left',
    tooltipPos: 'left',
  },
  top: {
    type: 'button',
    text: 'Top',
    tooltip: 'Top',
    tooltipPos: 'top',
  },
  bottom: {
    type: 'button',
    text: 'Bottom',
    tooltip: 'Bottom',
  },
  right: {
    type: 'button',
    text: 'Right',
    tooltip: 'Right',
    tooltipPos: 'right',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Localized Props

The `text` and `tooltip` props can be localized by passing an object keyed by locale. The displayed value follows the form's active [locale](/guide/locales):

::: usage center nomodel

```vue [Preview]
<VfButton
  name="submit"
  :text="{
    en_US: 'Submit',
    de_DE: 'Absenden',
  }"
  :tooltip="{
    en_US: 'Click to submit',
    de_DE: 'Klicken um abzusenden',
  }"
/>
```

```vue [Template]
<VfButton
  name="submit"
  :text="{
    en_US: 'Submit',
    de_DE: 'Absenden',
  }"
  :tooltip="{
    en_US: 'Click to submit',
    de_DE: 'Klicken um abzusenden',
  }"
  tooltip-pos="top"
  fluid
/>
<VfSelect
  name="locale"
  :options="{
    en_US: '🇺🇸 &nbsp;English',
    de_DE: '🇩🇪 &nbsp;German',
  }"
  default-value="en_US"
  float-label="Locale"
  float="on"
  @change="(n, o, { $locale }) => $locale.set(n)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  submit: {
    type: 'button',
    text: {
      en_US: 'Submit',
      de_DE: 'Absenden',
    },
    tooltip: {
      en_US: 'Click to submit',
      de_DE: 'Klicken um abzusenden',
    },
    tooltipPos: 'top',
  },
  locale: {
    type: 'select',
    options: {
      en_US: '🇺🇸 \u00a0English',
      de_DE: '🇩🇪 \u00a0German',
    },
    defaultValue: 'en_US',
    floatLabel: 'Locale',
    float: 'on',
    onChange: (n, o, { $locale }) => $locale.set(n),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Dynamic Props

The `text`, `icon`, `tooltip`, `severity`, `badge`, and `badgeSeverity` [Text Props](/guide/dynamic-props) accept dynamic values via [expressions](/guide/expressions):

::: usage center

```vue [Preview]
<VfButton
  name="order"
  text="{qty ? 'Pay €' || (qty*19) : 'Add to cart'}"
  icon="{qty ? 'shopping-cart' : 'shop'}"
  severity="{qty ? 'primary' : 'secondary'}"
  badge="{qty ? qty : ''}"
  badge-severity="{qty >= 5 ? 'success' : 'contrast'}"
  tooltip="{qty ? 'Place order' : 'Set quantity'}"
/>
```

```vue [Template]
<VfForm>
  <VfInputNumber
    name="qty"
    label="Quantity"
    show-buttons
    :min="0"
    :max="10"
    :default-value="0"
  />
  <VfButton
    name="order"
    text="{qty ? 'Pay €' || (qty*19) : 'Add to cart'}"
    icon="{qty ? 'shopping-cart' : 'shop'}"
    severity="{qty ? 'primary' : 'secondary'}"
    badge="{qty ? qty : ''}"
    badge-severity="{qty >= 5 ? 'success' : 'contrast'}"
    tooltip="{qty ? 'Place order' : 'Set quantity'}"
    @click="(e, { form$ }) => form$.model.qty < 1 ? form$.set('qty', 1) : {}"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  qty: {
    type: 'input-number',
    label: 'Quantity',
    showButtons: true,
    min: 0,
    max: 10,
    defaultValue: 0,
  },
  order: {
    type: 'button',
    text: "{qty ? 'Pay €' || (qty*19) : 'Add to cart'}",
    icon: "{qty ? 'shopping-cart' : 'shop'}",
    severity: "{qty ? 'primary' : 'secondary'}",
    badge: "{qty ? qty : ''}",
    badgeSeverity: "{qty >= 5 ? 'success' : 'contrast'}",
    tooltip: "{qty ? 'Place order' : 'Set quantity'}",
    onClick: (e, { form$ }) => form$.model.qty < 1 ? form$.set('qty', 1) : {}
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Conditional Props

The `disabled` and `loading` [Conditional Props](/guide/conditions#conditional-props) accept [expressions](/guide/expressions):

::: usage center

```vue [Preview]
<VfButton
  name="order"
  text="{submitting ? 'Cancel order' : 'Place order'}"
  disabled="{NOT(agree)}"
  loading="{submitting}"
/>
```

```vue [Template]
<VfForm>
  <VfCheckbox
    name="agree"
    text="I agree to the terms"
  />
  <VfHidden name="submitting" :default-value="false" />
  <VfButton
    name="order"
    text="{submitting ? 'Cancel order' : 'Place order'}"
    disabled="{NOT(agree)}"
    loading="{submitting}"
    @click="(e, { form$ }) => form$.set('submitting', !form$.model.submitting)"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  agree: {
    type: 'checkbox',
    text: 'I agree to the terms',
  },
  submitting: {
    type: 'hidden',
    defaultValue: false,
  },
  order: {
    type: 'button',
    text: '{submitting ? 'Cancel order' : 'Place order'}',
    disabled: '{NOT(agree)}',
    loading: '{submitting}',
    onClick: (e, { form$ }) => form$.set('submitting', form$.model.submitting),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!--@include: @/components/_ui/VfButton.md#usage-actions-->
<!--@include: @/components/_ui/VfButton.md#usage-links-->
<!--@include: @/components/_ui/VfButton.md#usage-alignment-->

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
| [`type`](!code#props.type "string") | `'button'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Element {#props-button}

| Prop | Default | Description |
| --- | --- | --- |
| [`severity`](!code#props.severity "DProp<'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast', TContext>") | `'secondary'` | The color severity of the button. |
| [`badge`](!code#props.badge "TProp<string, TContext>") | — | Value of the badge displayed on the button. |
| [`badgeSeverity`](!code#props.badgeSeverity "DProp<'secondary' \| 'info' \| 'success' \| 'warn' \| 'danger' \| 'contrast', TContext>") | — | Severity type of the badge. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |
| [`fluid`](!code#props.fluid "boolean") | `false` | Whether the button spans the full width of its container. |
| [`text`](!code#props.text "TProp<string, TContext>") | — | The label text displayed on the button. |
| [`action`](!code#props.action "'submit' \| 'reset' \| (string & {})") | — | The action performed when the button is clicked. Use `'submit'` to submit the parent form or `'reset'` to reset it. Custom string values can be used for application-specific actions handled via the `click` event. |
| [`icon`](!code#props.icon "DProp<string, TContext>") | — | The icon to display inside the button. |
| [`href`](!code#props.href "TProp<string, TContext>") | — | When set the button renders as an `<a>` element instead of `<button>`. |
| [`target`](!code#props.target "string") | — | The `target` attribute for the anchor element. |
| [`rel`](!code#props.rel "string") | — | The `rel` attribute for the anchor element. |
| [`download`](!code#props.download "string \| boolean") | — | The `download` attribute for the anchor element. |
| [`to`](!code#props.to "TProp<string, TContext>") | — | Route location to navigate to when using `vue-router`. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |

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
| [`info`](!code#props.info "TProp") | — | Informational text displayed as a tooltip for the element. |
| [`infoPosition`](!code#props.infoPosition "InfoPositionProp") | — | Position of the info tooltip relative to the info icon. |
| [`tooltip`](!code#props.tooltip "TProp") | — | Tooltip text content for the element. |
| [`tooltipPos`](!code#props.tooltipPos "TooltipPosProp") | `'bottom'` | Position of the tooltip relative to the element. |
| [`loading`](!code#props.loading "ConditionalProp<TContext>") | — | Whether the element is in loading state. |
| [`align`](!code#props.align "'left' \| 'center' \| 'right'") | — | Horizontal alignment of the button within its container. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — |  |

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
| [`as`](!code#props.as "string \| Component \| undefined") | Use [`href`](#props.href) prop instead. |
| [`asChild`](!code#props.asChild "boolean \| undefined") | Use [`template`](#slots.Slots) slot instead. |
| [`fluid`](!code#props.fluid "boolean \| undefined") | Use [`columns`](#props.columns) prop instead. |
| [`label`](!code#props.label "string \| undefined") | Use [`text`](#props.text) prop instead. |
| [`link`](!code#props.link "boolean \| undefined") | Use `link` value for [`variant`](#props.variant) prop instead. |
| [`text`](!code#props.text "boolean \| undefined") | Use `text` value for [`variant`](#props.variant) prop instead. |
| [`type`](!code#props.type "'submit' \| 'reset' \| 'button' \| undefined") | Use [`inputType`](#props.inputType) prop instead. |

<!-- @endcollapsible -->

<!-- @collapsible closed -->

#### Unaffected PrimeVue Props {#props-unaffected}

PrimeVue props that work exactly the same — Vueform does not modify them.

| Prop | Description |
| --- | --- |
| [`badgeClass`](!code#props.badgeClass "string \| object \| undefined") | Style class of the badge. |
| [`dt`](!code#props.dt "DesignToken<any>") | It generates scoped CSS variables using design tokens for the component. |
| [`iconClass`](!code#props.iconClass "string \| object \| undefined") | Style class of the icon. |
| [`iconPos`](!code#props.iconPos "HintedString<'left' \| 'right' \| 'top' \| 'bottom'> \| undefined") | Position of the icon. |
| [`loadingIcon`](!code#props.loadingIcon "string \| undefined") | Icon to display in loading state. |
| [`pt`](!code#props.pt "PassThrough<ButtonPassThroughOptions<any>>") | Used to pass attributes to DOM elements inside the component. |
| [`ptOptions`](!code#props.ptOptions "PassThroughOptions") | Used to configure passthrough(pt) options of the component. |
| [`raised`](!code#props.raised "boolean \| undefined") | Add a shadow to indicate elevation. |
| [`rounded`](!code#props.rounded "boolean \| undefined") | Add a circular border radius to the button. |
| [`size`](!code#props.size "HintedString<'small' \| 'large'> \| undefined") | Defines the size of the button. |
| [`unstyled`](!code#props.unstyled "boolean") | When enabled, it removes component related styles in the core. |
| [`variant`](!code#props.variant "HintedString<'outlined' \| 'text' \| 'link'> \| undefined") | Specifies the variant of the component. |
| [`about`](!code#props.about "string \| undefined") |  |
| [`accesskey`](!code#props.accesskey "string \| undefined") |  |
| [`aria-activedescendant`](!code#props.aria-activedescendant "string \| undefined") | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| [`aria-atomic`](!code#props.aria-atomic "Booleanish \| undefined") | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| [`aria-autocomplete`](!code#props.aria-autocomplete "'none' \| 'inline' \| 'list' \| 'both' \| undefined") | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
| [`aria-busy`](!code#props.aria-busy "Booleanish \| undefined") | Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. |
| [`aria-checked`](!code#props.aria-checked "Booleanish \| 'mixed' \| undefined") | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| [`aria-colcount`](!code#props.aria-colcount "Numberish \| undefined") | Defines the total number of columns in a table, grid, or treegrid. |
| [`aria-colindex`](!code#props.aria-colindex "Numberish \| undefined") | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| [`aria-colspan`](!code#props.aria-colspan "Numberish \| undefined") | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| [`aria-controls`](!code#props.aria-controls "string \| undefined") | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| [`aria-current`](!code#props.aria-current "Booleanish \| 'page' \| 'step' \| 'location' \| 'date' \| 'time' \| undefined") | Indicates the element that represents the current item within a container or set of related elements. |
| [`aria-describedby`](!code#props.aria-describedby "string \| undefined") | Identifies the element (or elements) that describes the object. |
| [`aria-details`](!code#props.aria-details "string \| undefined") | Identifies the element that provides a detailed, extended description for the object. |
| [`aria-disabled`](!code#props.aria-disabled "Booleanish \| undefined") | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| [`aria-dropeffect`](!code#props.aria-dropeffect "'none' \| 'copy' \| 'execute' \| 'link' \| 'move' \| 'popup' \| undefined") | Indicates what functions can be performed when a dragged object is released on the drop target. |
| [`aria-errormessage`](!code#props.aria-errormessage "string \| undefined") | Identifies the element that provides an error message for the object. |
| [`aria-expanded`](!code#props.aria-expanded "Booleanish \| undefined") | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| [`aria-flowto`](!code#props.aria-flowto "string \| undefined") | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| [`aria-grabbed`](!code#props.aria-grabbed "Booleanish \| undefined") | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| [`aria-haspopup`](!code#props.aria-haspopup "Booleanish \| 'menu' \| 'listbox' \| 'tree' \| 'grid' \| 'dialog' \| undefined") | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| [`aria-hidden`](!code#props.aria-hidden "Booleanish \| undefined") | Indicates whether the element is exposed to an accessibility API. |
| [`aria-invalid`](!code#props.aria-invalid "Booleanish \| 'grammar' \| 'spelling' \| undefined") | Indicates the entered value does not conform to the format expected by the application. |
| [`aria-keyshortcuts`](!code#props.aria-keyshortcuts "string \| undefined") | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| [`aria-label`](!code#props.aria-label "string \| undefined") | Defines a string value that labels the current element. |
| [`aria-labelledby`](!code#props.aria-labelledby "string \| undefined") | Identifies the element (or elements) that labels the current element. |
| [`aria-level`](!code#props.aria-level "Numberish \| undefined") | Defines the hierarchical level of an element within a structure. |
| [`aria-live`](!code#props.aria-live "'off' \| 'assertive' \| 'polite' \| undefined") | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| [`aria-modal`](!code#props.aria-modal "Booleanish \| undefined") | Indicates whether an element is modal when displayed. |
| [`aria-multiline`](!code#props.aria-multiline "Booleanish \| undefined") | Indicates whether a text box accepts multiple lines of input or only a single line. |
| [`aria-multiselectable`](!code#props.aria-multiselectable "Booleanish \| undefined") | Indicates that the user may select more than one item from the current selectable descendants. |
| [`aria-orientation`](!code#props.aria-orientation "'horizontal' \| 'vertical' \| undefined") | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| [`aria-owns`](!code#props.aria-owns "string \| undefined") | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| [`aria-placeholder`](!code#props.aria-placeholder "string \| undefined") | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format. |
| [`aria-posinset`](!code#props.aria-posinset "Numberish \| undefined") | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| [`aria-pressed`](!code#props.aria-pressed "Booleanish \| 'mixed' \| undefined") | Indicates the current "pressed" state of toggle buttons. |
| [`aria-readonly`](!code#props.aria-readonly "Booleanish \| undefined") | Indicates that the element is not editable, but is otherwise operable. |
| [`aria-relevant`](!code#props.aria-relevant "'additions' \| 'additions removals' \| 'additions text' \| 'all' \| 'removals' \| 'removals additions' \| 'removals text' \| 'text' \| 'text additions' \| 'text removals' \| undefined") | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| [`aria-required`](!code#props.aria-required "Booleanish \| undefined") | Indicates that user input is required on the element before a form may be submitted. |
| [`aria-roledescription`](!code#props.aria-roledescription "string \| undefined") | Defines a human-readable, author-localized description for the role of an element. |
| [`aria-rowcount`](!code#props.aria-rowcount "Numberish \| undefined") | Defines the total number of rows in a table, grid, or treegrid. |
| [`aria-rowindex`](!code#props.aria-rowindex "Numberish \| undefined") | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| [`aria-rowspan`](!code#props.aria-rowspan "Numberish \| undefined") | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| [`aria-selected`](!code#props.aria-selected "Booleanish \| undefined") | Indicates the current "selected" state of various widgets. |
| [`aria-setsize`](!code#props.aria-setsize "Numberish \| undefined") | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| [`aria-sort`](!code#props.aria-sort "'none' \| 'ascending' \| 'descending' \| 'other' \| undefined") | Indicates if items in a table or grid are sorted in ascending or descending order. |
| [`aria-valuemax`](!code#props.aria-valuemax "Numberish \| undefined") | Defines the maximum allowed value for a range widget. |
| [`aria-valuemin`](!code#props.aria-valuemin "Numberish \| undefined") | Defines the minimum allowed value for a range widget. |
| [`aria-valuenow`](!code#props.aria-valuenow "Numberish \| undefined") | Defines the current value for a range widget. |
| [`aria-valuetext`](!code#props.aria-valuetext "string \| undefined") | Defines the human readable text alternative of aria-valuenow for a range widget. |
| [`autocapitalize`](!code#props.autocapitalize "string \| undefined") |  |
| [`autocorrect`](!code#props.autocorrect "string \| undefined") |  |
| [`autofocus`](!code#props.autofocus "Booleanish \| undefined") |  |
| [`autosave`](!code#props.autosave "string \| undefined") |  |
| [`color`](!code#props.color "string \| undefined") |  |
| [`contenteditable`](!code#props.contenteditable "Booleanish \| 'inherit' \| 'plaintext-only' \| undefined") |  |
| [`contextmenu`](!code#props.contextmenu "string \| undefined") |  |
| [`datatype`](!code#props.datatype "string \| undefined") |  |
| [`dir`](!code#props.dir "string \| undefined") |  |
| [`draggable`](!code#props.draggable "Booleanish \| undefined") |  |
| [`enterkeyhint`](!code#props.enterkeyhint "'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send' \| undefined") |  |
| [`enterKeyHint`](!code#props.enterKeyHint "HTMLAttributes['enterkeyhint']") |  |
| [`exportparts`](!code#props.exportparts "string") |  |
| [`form`](!code#props.form "string \| undefined") |  |
| [`formaction`](!code#props.formaction "string \| undefined") |  |
| [`formenctype`](!code#props.formenctype "string \| undefined") |  |
| [`formmethod`](!code#props.formmethod "string \| undefined") |  |
| [`formnovalidate`](!code#props.formnovalidate "Booleanish \| undefined") |  |
| [`formtarget`](!code#props.formtarget "string \| undefined") |  |
| [`hidden`](!code#props.hidden "Booleanish \| '' \| 'hidden' \| 'until-found' \| undefined") |  |
| [`inert`](!code#props.inert "Booleanish \| undefined") |  |
| [`inlist`](!code#props.inlist "any") |  |
| [`innerHTML`](!code#props.innerHTML "string \| undefined") |  |
| [`inputmode`](!code#props.inputmode "'none' \| 'text' \| 'tel' \| 'url' \| 'email' \| 'numeric' \| 'decimal' \| 'search' \| undefined") | Hints at the type of data that might be entered by the user while editing the element or its contents |
| [`is`](!code#props.is "string \| undefined") | Specify that a standard HTML element should behave like a defined custom built-in element |
| [`itemid`](!code#props.itemid "string \| undefined") |  |
| [`itemprop`](!code#props.itemprop "string \| undefined") |  |
| [`itemref`](!code#props.itemref "string \| undefined") |  |
| [`itemscope`](!code#props.itemscope "Booleanish \| undefined") |  |
| [`itemtype`](!code#props.itemtype "string \| undefined") |  |
| [`lang`](!code#props.lang "string \| undefined") |  |
| [`onAbort`](!code#props.onAbort "(payload: UIEvent) => void") |  |
| [`onAnimationcancel`](!code#props.onAnimationcancel "(payload: AnimationEvent) => void") |  |
| [`onAnimationend`](!code#props.onAnimationend "(payload: AnimationEvent) => void") |  |
| [`onAnimationiteration`](!code#props.onAnimationiteration "(payload: AnimationEvent) => void") |  |
| [`onAnimationstart`](!code#props.onAnimationstart "(payload: AnimationEvent) => void") |  |
| [`onAuxclick`](!code#props.onAuxclick "(payload: PointerEvent) => void") |  |
| [`onBeforeinput`](!code#props.onBeforeinput "(payload: InputEvent) => void") |  |
| [`onBeforetoggle`](!code#props.onBeforetoggle "(payload: ToggleEvent) => void") |  |
| [`onCanplay`](!code#props.onCanplay "(payload: Event) => void") |  |
| [`onCanplaythrough`](!code#props.onCanplaythrough "(payload: Event) => void") |  |
| [`onChange`](!code#props.onChange "(payload: Event) => void") |  |
| [`onCompositionend`](!code#props.onCompositionend "(payload: CompositionEvent) => void") |  |
| [`onCompositionstart`](!code#props.onCompositionstart "(payload: CompositionEvent) => void") |  |
| [`onCompositionupdate`](!code#props.onCompositionupdate "(payload: CompositionEvent) => void") |  |
| [`onContextmenu`](!code#props.onContextmenu "(payload: PointerEvent) => void") |  |
| [`onCopy`](!code#props.onCopy "(payload: ClipboardEvent) => void") |  |
| [`onCut`](!code#props.onCut "(payload: ClipboardEvent) => void") |  |
| [`onDblclick`](!code#props.onDblclick "(payload: MouseEvent) => void") |  |
| [`onDrag`](!code#props.onDrag "(payload: DragEvent) => void") |  |
| [`onDragend`](!code#props.onDragend "(payload: DragEvent) => void") |  |
| [`onDragenter`](!code#props.onDragenter "(payload: DragEvent) => void") |  |
| [`onDragexit`](!code#props.onDragexit "(payload: DragEvent) => void") |  |
| [`onDragleave`](!code#props.onDragleave "(payload: DragEvent) => void") |  |
| [`onDragover`](!code#props.onDragover "(payload: DragEvent) => void") |  |
| [`onDragstart`](!code#props.onDragstart "(payload: DragEvent) => void") |  |
| [`onDrop`](!code#props.onDrop "(payload: DragEvent) => void") |  |
| [`onDurationchange`](!code#props.onDurationchange "(payload: Event) => void") |  |
| [`onEmptied`](!code#props.onEmptied "(payload: Event) => void") |  |
| [`onEncrypted`](!code#props.onEncrypted "(payload: MediaEncryptedEvent) => void") |  |
| [`onEnded`](!code#props.onEnded "(payload: Event) => void") |  |
| [`onError`](!code#props.onError "(payload: Event) => void") |  |
| [`onFocusin`](!code#props.onFocusin "(payload: FocusEvent) => void") |  |
| [`onFocusout`](!code#props.onFocusout "(payload: FocusEvent) => void") |  |
| [`onFormdata`](!code#props.onFormdata "(payload: FormDataEvent) => void") |  |
| [`onFullscreenchange`](!code#props.onFullscreenchange "(payload: Event) => void") |  |
| [`onFullscreenerror`](!code#props.onFullscreenerror "(payload: Event) => void") |  |
| [`onGotpointercapture`](!code#props.onGotpointercapture "(payload: PointerEvent) => void") |  |
| [`onInput`](!code#props.onInput "(payload: InputEvent) => void") |  |
| [`onInvalid`](!code#props.onInvalid "(payload: Event) => void") |  |
| [`onKeydown`](!code#props.onKeydown "(payload: KeyboardEvent) => void") |  |
| [`onKeypress`](!code#props.onKeypress "(payload: KeyboardEvent) => void") |  |
| [`onKeyup`](!code#props.onKeyup "(payload: KeyboardEvent) => void") |  |
| [`onLoad`](!code#props.onLoad "(payload: Event) => void") |  |
| [`onLoadeddata`](!code#props.onLoadeddata "(payload: Event) => void") |  |
| [`onLoadedmetadata`](!code#props.onLoadedmetadata "(payload: Event) => void") |  |
| [`onLoadstart`](!code#props.onLoadstart "(payload: Event) => void") |  |
| [`onLostpointercapture`](!code#props.onLostpointercapture "(payload: PointerEvent) => void") |  |
| [`onMousedown`](!code#props.onMousedown "(payload: MouseEvent) => void") |  |
| [`onMouseenter`](!code#props.onMouseenter "(payload: MouseEvent) => void") |  |
| [`onMouseleave`](!code#props.onMouseleave "(payload: MouseEvent) => void") |  |
| [`onMousemove`](!code#props.onMousemove "(payload: MouseEvent) => void") |  |
| [`onMouseout`](!code#props.onMouseout "(payload: MouseEvent) => void") |  |
| [`onMouseover`](!code#props.onMouseover "(payload: MouseEvent) => void") |  |
| [`onMouseup`](!code#props.onMouseup "(payload: MouseEvent) => void") |  |
| [`onPaste`](!code#props.onPaste "(payload: ClipboardEvent) => void") |  |
| [`onPause`](!code#props.onPause "(payload: Event) => void") |  |
| [`onPlay`](!code#props.onPlay "(payload: Event) => void") |  |
| [`onPlaying`](!code#props.onPlaying "(payload: Event) => void") |  |
| [`onPointercancel`](!code#props.onPointercancel "(payload: PointerEvent) => void") |  |
| [`onPointerdown`](!code#props.onPointerdown "(payload: PointerEvent) => void") |  |
| [`onPointerenter`](!code#props.onPointerenter "(payload: PointerEvent) => void") |  |
| [`onPointerleave`](!code#props.onPointerleave "(payload: PointerEvent) => void") |  |
| [`onPointermove`](!code#props.onPointermove "(payload: PointerEvent) => void") |  |
| [`onPointerout`](!code#props.onPointerout "(payload: PointerEvent) => void") |  |
| [`onPointerover`](!code#props.onPointerover "(payload: PointerEvent) => void") |  |
| [`onPointerup`](!code#props.onPointerup "(payload: PointerEvent) => void") |  |
| [`onProgress`](!code#props.onProgress "(payload: ProgressEvent<EventTarget>) => void") |  |
| [`onRatechange`](!code#props.onRatechange "(payload: Event) => void") |  |
| [`onReset`](!code#props.onReset "(payload: Event) => void") |  |
| [`onScroll`](!code#props.onScroll "(payload: Event) => void") |  |
| [`onScrollend`](!code#props.onScrollend "(payload: Event) => void") |  |
| [`onSecuritypolicyviolation`](!code#props.onSecuritypolicyviolation "(payload: SecurityPolicyViolationEvent) => void") |  |
| [`onSeeked`](!code#props.onSeeked "(payload: Event) => void") |  |
| [`onSeeking`](!code#props.onSeeking "(payload: Event) => void") |  |
| [`onSelect`](!code#props.onSelect "(payload: Event) => void") |  |
| [`onStalled`](!code#props.onStalled "(payload: Event) => void") |  |
| [`onSubmit`](!code#props.onSubmit "(payload: SubmitEvent) => void") |  |
| [`onSuspend`](!code#props.onSuspend "(payload: Event) => void") |  |
| [`onTimeupdate`](!code#props.onTimeupdate "(payload: Event) => void") |  |
| [`onToggle`](!code#props.onToggle "(payload: ToggleEvent) => void") |  |
| [`onTouchcancel`](!code#props.onTouchcancel "(payload: TouchEvent) => void") |  |
| [`onTouchend`](!code#props.onTouchend "(payload: TouchEvent) => void") |  |
| [`onTouchmove`](!code#props.onTouchmove "(payload: TouchEvent) => void") |  |
| [`onTouchstart`](!code#props.onTouchstart "(payload: TouchEvent) => void") |  |
| [`onTransitioncancel`](!code#props.onTransitioncancel "(payload: TransitionEvent) => void") |  |
| [`onTransitionend`](!code#props.onTransitionend "(payload: TransitionEvent) => void") |  |
| [`onTransitionrun`](!code#props.onTransitionrun "(payload: TransitionEvent) => void") |  |
| [`onTransitionstart`](!code#props.onTransitionstart "(payload: TransitionEvent) => void") |  |
| [`onVolumechange`](!code#props.onVolumechange "(payload: Event) => void") |  |
| [`onWaiting`](!code#props.onWaiting "(payload: Event) => void") |  |
| [`onWheel`](!code#props.onWheel "(payload: WheelEvent) => void") |  |
| [`part`](!code#props.part "string") |  |
| [`placeholder`](!code#props.placeholder "string \| undefined") |  |
| [`prefix`](!code#props.prefix "string \| undefined") |  |
| [`property`](!code#props.property "string \| undefined") |  |
| [`radiogroup`](!code#props.radiogroup "string \| undefined") |  |
| [`resource`](!code#props.resource "string \| undefined") |  |
| [`results`](!code#props.results "Numberish \| undefined") |  |
| [`role`](!code#props.role "string \| undefined") |  |
| [`security`](!code#props.security "string \| undefined") |  |
| [`spellcheck`](!code#props.spellcheck "Booleanish \| undefined") |  |
| [`tabindex`](!code#props.tabindex "Numberish \| undefined") |  |
| [`title`](!code#props.title "string \| undefined") |  |
| [`translate`](!code#props.translate "'yes' \| 'no' \| undefined") |  |
| [`typeof`](!code#props.typeof "string \| undefined") |  |
| [`unselectable`](!code#props.unselectable "'on' \| 'off' \| undefined") |  |
| [`value`](!code#props.value "string \| ReadonlyArray<string> \| number \| undefined") |  |
| [`vocab`](!code#props.vocab "string \| undefined") |  |

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

### Button {#section-button}

| Name | Description |
| --- | --- |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`icon`](!code#context.icon "string \| undefined") | The resolved icon CSS class string. `$`-prefixed names are mapped through the config-level semantic `icons` map. |
| [`href`](!code#context.href "string \| (string & {}) \| undefined") | The resolved href for the button, supporting dynamic text props. |
| [`to`](!code#context.to "string \| (string & {}) \| undefined") | The resolved route location for the button, supporting dynamic text props. |
| [`severity`](!code#context.severity "string \| (string & {}) \| undefined") | The resolved severity of the button, supporting dynamic text props. |
| [`handleClick()`](!code#context.handleClick "(event: MouseEvent) => void") | Handles the click event, fires the click event through the event system, and performs the configured action (submit or reset) on the parent form. |
| [`as`](!code#context.as "\"a\" \| undefined") |  |
| [`badge`](!code#context.badge "string") | The resolved badge value of the button, supporting dynamic text props. |
| [`badgeSeverity`](!code#context.badgeSeverity "UnwrapDynamicProp<LooseRequired<TProps>[\"badgeSeverity\"]> \| undefined") | The resolved badge severity of the button, supporting dynamic text props. |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`visible`](!code#context.visible "boolean") | Whether the element is currently visible, based on availability, container visibility, and pager state. |
| [`available`](!code#context.available "boolean") | Whether the element is available (not hidden by conditional logic). |
| [`disabled`](!code#context.disabled "boolean") | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`loading`](!code#context.loading "boolean") | Whether the button is in a loading state. The `loading` prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`enable()`](!code#context.enable "() => void") | Programmatically enables the element. |
| [`disable()`](!code#context.disable "() => void") | Programmatically disables the element. |

### Validation {#section-validation}

| Name | Description |
| --- | --- |
| [`errors`](!code#context.errors "string[]") | The reactive list of validation error messages. |
| [`displayErrors`](!code#context.displayErrors "string[]") | The reactive list of validation error messages. |
| [`messages`](!code#context.messages "string[]") | The reactive list of informational messages. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for managing custom errors, messages, and prepended/appended messages. |
| [`genericName`](!code#context.genericName "string") | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`text`](!code#context.text "string \| (string & {}) \| undefined") | The resolved label text for the button. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`page`](!code#context.page "PageProp \| undefined") | Page metadata for stepped/tabbed forms. |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
| [`tokens`](!code#context.tokens "CSSProperties") | Reactive inline style object with resolved theme token CSS custom properties. |
| [`tokenClass`](!code#context.tokenClass "string") | A unique CSS class scoped to this button instance, used to target the injected token style rule. |
| [`tokenCss`](!code#context.tokenCss "string") | The CSS text for scoped token custom properties on this button instance. |
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
| `click` | [`event`](!code#events.click.event "MouseEvent"), [`context$`](!code#events.click.context$ "LooseContext") | Emitted when the button is clicked. |
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
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `icon` | [`class`](!code#slot.icon.class "string") | Custom icon template. |
| `default` | [`class`](!code#slot.default.class "string") [`a11yAttrs`](!code#slot.default.a11yAttrs "Record<string, unknown>") | Custom content such as icons, images and text can be placed inside the button via the default slot. Note that when slot is used, label, icon and badge properties are not included. |
| `loadingicon` | [`class`](!code#slot.loadingicon.class "string") | Custom loading icon template. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts
component="VfButton"
:examples="{
default: 'Default',
}"
:schema="{
text: 'Submit',
label: 'Actions',
info: 'Additional information about this action. This tooltip is helpful for users to understand what the button does.',
after: 'a',
help: 'Click to submit your form',
hint: 'All fields must be valid before submitting',
icon: 'check',
onMounted: ({ messageBag }) => {
messageBag.append('Form has validation errors', 'error')
messageBag.append('Form submitted successfully', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfButton
      name="default"
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
| **Element** | [`<TabPanel>`](https://primevue.org/tabpanel/) |
| **Classes** | `.vf-panel` |

### `root`

The element's root wrapper.

| | |
| --- | --- |
| **Element** | `<div>` `<fieldset>` |
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-button` `.vf-align-label?` |

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

### `button`

The PrimeVue Button component.

| | |
| --- | --- |
| **Element** | [`<Button>`](https://primevue.org/button/) |
| **Classes** | `.vf-left?` `.vf-right?` `.vf-center?` |

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
