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

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
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
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |

### Element {#props-button}

| Prop | Default | Description |
| --- | --- | --- |
| [`severity`](!code#props.severity "DProp<'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast', TContext>") | `'secondary'` | The color severity of the button. |
| [`badge`](!code#props.badge "TProp<string, TContext>") | — | Value of the badge displayed on the button. |
| [`badgeSeverity`](!code#props.badgeSeverity "DProp<'secondary' \| 'info' \| 'success' \| 'warn' \| 'danger' \| 'contrast', TContext>") | — | Severity type of the badge. |
| [`noExpressions`](!code#props.noExpressions "boolean") | `false` | Disables expression resolution for this element. Applies to the element itself only (container elements don't cascade it to their children), and a form-level `noExpressions` cannot be overridden by setting it to `false` here. |
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
| [`about`](!code#props.about "string \| undefined") | RDFa: the resource the metadata is about. |
| [`accesskey`](!code#props.accesskey "string \| undefined") | Provides a hint for generating a keyboard shortcut for the current element. This attribute consists of a space-separated list of characters. The browser should use the first one that exists on the computer keyboard layout. |
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
| [`autocapitalize`](!code#props.autocapitalize "string \| undefined") | Controls whether and how text input is automatically capitalized as it is entered/edited by the user. It can have the following values:<br><br>*   `off` or `none`, no autocapitalization is applied (all letters default to lowercase) *   `on` or `sentences`, the first letter of each sentence defaults to a capital letter; all other letters default to lowercase *   `words`, the first letter of each word defaults to a capital letter; all other letters default to lowercase *   `characters`, all letters should default to uppercase |
| [`autocorrect`](!code#props.autocorrect "string \| undefined") | Controls whether autocorrection of editable text is enabled for spelling and/or punctuation errors. |
| [`autofocus`](!code#props.autofocus "Booleanish \| undefined") | This Boolean attribute lets you specify that the button should have input focus when the page loads, unless the user overrides it, for example by typing in a different control. Only one form-associated element in a document can have this attribute specified. |
| [`autosave`](!code#props.autosave "string \| undefined") | Non-standard Safari attribute persisting a search field's value across page loads. |
| [`color`](!code#props.color "string \| undefined") | Sets the color of the rule through color name or hexadecimal value. |
| [`contenteditable`](!code#props.contenteditable "Booleanish \| 'inherit' \| 'plaintext-only' \| undefined") | An enumerated attribute indicating if the element should be editable by the user. If so, the browser modifies its widget to allow editing. The attribute must take one of the following values:<br><br>*   `true` or the _empty string_, which indicates that the element must be editable; *   `false`, which indicates that the element must not be editable. |
| [`contextmenu`](!code#props.contextmenu "string \| undefined") | The `[**id**](#attr-id)` of a [`<menu>`](https://developer.mozilla.org/docs/Web/HTML/Element/menu "The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.") to use as the contextual menu for this element. |
| [`datatype`](!code#props.datatype "string \| undefined") | RDFa: the datatype of the property's value. |
| [`dir`](!code#props.dir "string \| undefined") | An enumerated attribute indicating the directionality of the element's text. It can have the following values:<br><br>*   `ltr`, which means _left to right_ and is to be used for languages that are written from the left to the right (like English); *   `rtl`, which means _right to left_ and is to be used for languages that are written from the right to the left (like Arabic); *   `auto`, which lets the user agent decide. It uses a basic algorithm as it parses the characters inside the element until it finds a character with a strong directionality, then it applies that directionality to the whole element. |
| [`draggable`](!code#props.draggable "Booleanish \| undefined") | An enumerated attribute indicating whether the element can be dragged, using the [Drag and Drop API](https://developer.mozilla.org/docs/DragDrop/Drag_and_Drop). It can have the following values:<br><br>*   `true`, which indicates that the element may be dragged *   `false`, which indicates that the element may not be dragged. |
| [`enterkeyhint`](!code#props.enterkeyhint "'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send' \| undefined") | An enumerated attribute defining what action label (or icon) to present for the enter key on virtual keyboards. |
| [`enterKeyHint`](!code#props.enterKeyHint "HTMLAttributes['enterkeyhint']") | An enumerated attribute defining what action label (or icon) to present for the enter key on virtual keyboards. |
| [`exportparts`](!code#props.exportparts "string") | Used to transitively export shadow parts from a nested shadow tree into a containing light tree. |
| [`form`](!code#props.form "string \| undefined") | The form element that the button is associated with (its _form owner_). The value of the attribute must be the **id** attribute of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element in the same document. If this attribute is not specified, the `<button>` element will be associated to an ancestor [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element, if one exists. This attribute enables you to associate `<button>` elements to [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") elements anywhere within a document, not just as descendants of [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") elements. |
| [`formaction`](!code#props.formaction "string \| undefined") | The URI of a program that processes the information submitted by the button. If specified, it overrides the [`action`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-action) attribute of the button's form owner. |
| [`formenctype`](!code#props.formenctype "string \| undefined") | If the button is a submit button, this attribute specifies the type of content that is used to submit the form to the server. Possible values are:<br><br>*   `application/x-www-form-urlencoded`: The default value if the attribute is not specified. *   `multipart/form-data`: Use this value if you are using an [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element with the [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type) attribute set to `file`. *   `text/plain`<br><br>If this attribute is specified, it overrides the [`enctype`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-enctype) attribute of the button's form owner. |
| [`formmethod`](!code#props.formmethod "string \| undefined") | If the button is a submit button, this attribute specifies the HTTP method that the browser uses to submit the form. Possible values are:<br><br>*   `post`: The data from the form are included in the body of the form and sent to the server. *   `get`: The data from the form are appended to the **form** attribute URI, with a '?' as a separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.<br><br>If specified, this attribute overrides the [`method`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-method) attribute of the button's form owner. |
| [`formnovalidate`](!code#props.formnovalidate "Booleanish \| undefined") | If the button is a submit button, this Boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the [`novalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-novalidate) attribute of the button's form owner. |
| [`formtarget`](!code#props.formtarget "string \| undefined") | If the button is a submit button, this attribute is a name or keyword indicating where to display the response that is received after submitting the form. This is a name of, or keyword for, a _browsing context_ (for example, tab, window, or inline frame). If this attribute is specified, it overrides the [`target`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-target) attribute of the button's form owner. The following keywords have special meanings:<br><br>*   `_self`: Load the response into the same browsing context as the current one. This value is the default if the attribute is not specified. *   `_blank`: Load the response into a new unnamed browsing context. *   `_parent`: Load the response into the parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`. *   `_top`: Load the response into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`. |
| [`hidden`](!code#props.hidden "Booleanish \| '' \| 'hidden' \| 'until-found' \| undefined") | A Boolean attribute indicates that the element is not yet, or is no longer, _relevant_. For example, it can be used to hide elements of the page that can't be used until the login process has been completed. The browser won't render such elements. This attribute must not be used to hide content that could legitimately be shown. |
| [`inert`](!code#props.inert "Booleanish \| undefined") | Indicates that the element and all of its flat tree descendants become _inert_. Modal `<dialog>`s generated with [`showModal()`](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/showModal) escape inertness, meaning that they don't inherit inertness from their ancestors, but can only be made inert by having the `inert` attribute explicitly set on themselves. |
| [`inlist`](!code#props.inlist "any") | RDFa: marks the property value as a member of a list. |
| [`innerHTML`](!code#props.innerHTML "string \| undefined") | The element's content, set as raw HTML. |
| [`inputmode`](!code#props.inputmode "'none' \| 'text' \| 'tel' \| 'url' \| 'email' \| 'numeric' \| 'decimal' \| 'search' \| undefined") | Hints at the type of data that might be entered by the user while editing the element or its contents |
| [`is`](!code#props.is "string \| undefined") | Specify that a standard HTML element should behave like a defined custom built-in element |
| [`itemid`](!code#props.itemid "string \| undefined") | The unique, global identifier of an item. |
| [`itemprop`](!code#props.itemprop "string \| undefined") | Used to add properties to an item. Every HTML element may have an `itemprop` attribute specified, where an `itemprop` consists of a name and value pair. |
| [`itemref`](!code#props.itemref "string \| undefined") | Properties that are not descendants of an element with the `itemscope` attribute can be associated with the item using an `itemref`. It provides a list of element ids (not `itemid`s) with additional properties elsewhere in the document. |
| [`itemscope`](!code#props.itemscope "Booleanish \| undefined") | `itemscope` (usually) works along with `[itemtype](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-itemtype)` to specify that the HTML contained in a block is about a particular item. `itemscope` creates the Item and defines the scope of the `itemtype` associated with it. `itemtype` is a valid URL of a vocabulary (such as [schema.org](https://schema.org/)) that describes the item and its properties context. |
| [`itemtype`](!code#props.itemtype "string \| undefined") | Specifies the URL of the vocabulary that will be used to define `itemprop`s (item properties) in the data structure. `[itemscope](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-itemscope)` is used to set the scope of where in the data structure the vocabulary set by `itemtype` will be active. |
| [`lang`](!code#props.lang "string \| undefined") | Helps define the language of an element: the language that non-editable elements are in, or the language that editable elements should be written in by the user. The attribute contains one “language tag” (made of hyphen-separated “language subtags”) in the format defined in [_Tags for Identifying Languages (BCP47)_](https://www.ietf.org/rfc/bcp/bcp47.txt). [**xml:lang**](#attr-xml:lang) has priority over it. |
| [`onAbort`](!code#props.onAbort "(payload: UIEvent) => void") | The loading of a resource has been aborted. |
| [`onAnimationcancel`](!code#props.onAnimationcancel "(payload: AnimationEvent) => void") | Handler for the native `animationcancel` event. |
| [`onAnimationend`](!code#props.onAnimationend "(payload: AnimationEvent) => void") | Handler for the native `animationend` event. |
| [`onAnimationiteration`](!code#props.onAnimationiteration "(payload: AnimationEvent) => void") | Handler for the native `animationiteration` event. |
| [`onAnimationstart`](!code#props.onAnimationstart "(payload: AnimationEvent) => void") | Handler for the native `animationstart` event. |
| [`onAuxclick`](!code#props.onAuxclick "(payload: PointerEvent) => void") | Handler for the native `auxclick` event. |
| [`onBeforeinput`](!code#props.onBeforeinput "(payload: InputEvent) => void") | Handler for the native `beforeinput` event. |
| [`onBeforetoggle`](!code#props.onBeforetoggle "(payload: ToggleEvent) => void") | Handler for the native `beforetoggle` event. |
| [`onCanplay`](!code#props.onCanplay "(payload: Event) => void") | The user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content. |
| [`onCanplaythrough`](!code#props.onCanplaythrough "(payload: Event) => void") | The user agent can play the media up to its end without having to stop for further buffering of content. |
| [`onChange`](!code#props.onChange "(payload: Event) => void") | The change event is fired for <input>, <select>, and <textarea> elements when a change to the element's value is committed by the user. |
| [`onCompositionend`](!code#props.onCompositionend "(payload: CompositionEvent) => void") | Handler for the native `compositionend` event. |
| [`onCompositionstart`](!code#props.onCompositionstart "(payload: CompositionEvent) => void") | Handler for the native `compositionstart` event. |
| [`onCompositionupdate`](!code#props.onCompositionupdate "(payload: CompositionEvent) => void") | Handler for the native `compositionupdate` event. |
| [`onContextmenu`](!code#props.onContextmenu "(payload: PointerEvent) => void") | The right button of the mouse is clicked (before the context menu is displayed). |
| [`onCopy`](!code#props.onCopy "(payload: ClipboardEvent) => void") | Handler for the native `copy` event. |
| [`onCut`](!code#props.onCut "(payload: ClipboardEvent) => void") | Handler for the native `cut` event. |
| [`onDblclick`](!code#props.onDblclick "(payload: MouseEvent) => void") | A pointing device button is clicked twice on an element. |
| [`onDrag`](!code#props.onDrag "(payload: DragEvent) => void") | An element or text selection is being dragged (every 350ms). |
| [`onDragend`](!code#props.onDragend "(payload: DragEvent) => void") | A drag operation is being ended (by releasing a mouse button or hitting the escape key). |
| [`onDragenter`](!code#props.onDragenter "(payload: DragEvent) => void") | A dragged element or text selection enters a valid drop target. |
| [`onDragexit`](!code#props.onDragexit "(payload: DragEvent) => void") | Handler for the native `dragexit` event. |
| [`onDragleave`](!code#props.onDragleave "(payload: DragEvent) => void") | A dragged element or text selection leaves a valid drop target. |
| [`onDragover`](!code#props.onDragover "(payload: DragEvent) => void") | An element or text selection is being dragged over a valid drop target (every 350ms). |
| [`onDragstart`](!code#props.onDragstart "(payload: DragEvent) => void") | The user starts dragging an element or text selection. |
| [`onDrop`](!code#props.onDrop "(payload: DragEvent) => void") | An element is dropped on a valid drop target. |
| [`onDurationchange`](!code#props.onDurationchange "(payload: Event) => void") | The duration attribute has been updated. |
| [`onEmptied`](!code#props.onEmptied "(payload: Event) => void") | The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it. |
| [`onEncrypted`](!code#props.onEncrypted "(payload: MediaEncryptedEvent) => void") | Handler for the native `encrypted` event. |
| [`onEnded`](!code#props.onEnded "(payload: Event) => void") | Playback has stopped because the end of the media was reached. |
| [`onError`](!code#props.onError "(payload: Event) => void") | A resource failed to load. |
| [`onFocusin`](!code#props.onFocusin "(payload: FocusEvent) => void") | Handler for the native `focusin` event. |
| [`onFocusout`](!code#props.onFocusout "(payload: FocusEvent) => void") | Handler for the native `focusout` event. |
| [`onFormdata`](!code#props.onFormdata "(payload: FormDataEvent) => void") | Handler for the native `formdata` event. |
| [`onFullscreenchange`](!code#props.onFullscreenchange "(payload: Event) => void") | Handler for the native `fullscreenchange` event. |
| [`onFullscreenerror`](!code#props.onFullscreenerror "(payload: Event) => void") | Handler for the native `fullscreenerror` event. |
| [`onGotpointercapture`](!code#props.onGotpointercapture "(payload: PointerEvent) => void") | Handler for the native `gotpointercapture` event. |
| [`onInput`](!code#props.onInput "(payload: InputEvent) => void") | The value of an element changes or the content of an element with the attribute contenteditable is modified. |
| [`onInvalid`](!code#props.onInvalid "(payload: Event) => void") | A submittable element has been checked and doesn't satisfy its constraints. |
| [`onKeydown`](!code#props.onKeydown "(payload: KeyboardEvent) => void") | A key is pressed down. |
| [`onKeypress`](!code#props.onKeypress "(payload: KeyboardEvent) => void") | A key is pressed down and that key normally produces a character value (use input instead). |
| [`onKeyup`](!code#props.onKeyup "(payload: KeyboardEvent) => void") | A key is released. |
| [`onLoad`](!code#props.onLoad "(payload: Event) => void") | A resource and its dependent resources have finished loading. |
| [`onLoadeddata`](!code#props.onLoadeddata "(payload: Event) => void") | The first frame of the media has finished loading. |
| [`onLoadedmetadata`](!code#props.onLoadedmetadata "(payload: Event) => void") | The metadata has been loaded. |
| [`onLoadstart`](!code#props.onLoadstart "(payload: Event) => void") | Progress has begun. |
| [`onLostpointercapture`](!code#props.onLostpointercapture "(payload: PointerEvent) => void") | Handler for the native `lostpointercapture` event. |
| [`onMousedown`](!code#props.onMousedown "(payload: MouseEvent) => void") | A pointing device button (usually a mouse) is pressed on an element. |
| [`onMouseenter`](!code#props.onMouseenter "(payload: MouseEvent) => void") | A pointing device is moved onto the element that has the listener attached. |
| [`onMouseleave`](!code#props.onMouseleave "(payload: MouseEvent) => void") | A pointing device is moved off the element that has the listener attached. |
| [`onMousemove`](!code#props.onMousemove "(payload: MouseEvent) => void") | A pointing device is moved over an element. |
| [`onMouseout`](!code#props.onMouseout "(payload: MouseEvent) => void") | A pointing device is moved off the element that has the listener attached or off one of its children. |
| [`onMouseover`](!code#props.onMouseover "(payload: MouseEvent) => void") | A pointing device is moved onto the element that has the listener attached or onto one of its children. |
| [`onMouseup`](!code#props.onMouseup "(payload: MouseEvent) => void") | A pointing device button is released over an element. |
| [`onPaste`](!code#props.onPaste "(payload: ClipboardEvent) => void") | Handler for the native `paste` event. |
| [`onPause`](!code#props.onPause "(payload: Event) => void") | Playback has been paused. |
| [`onPlay`](!code#props.onPlay "(payload: Event) => void") | Playback has begun. |
| [`onPlaying`](!code#props.onPlaying "(payload: Event) => void") | Playback is ready to start after having been paused or delayed due to lack of data. |
| [`onPointercancel`](!code#props.onPointercancel "(payload: PointerEvent) => void") | The pointer is unlikely to produce any more events. |
| [`onPointerdown`](!code#props.onPointerdown "(payload: PointerEvent) => void") | The pointer enters the active buttons state. |
| [`onPointerenter`](!code#props.onPointerenter "(payload: PointerEvent) => void") | Pointing device is moved inside the hit-testing boundary. |
| [`onPointerleave`](!code#props.onPointerleave "(payload: PointerEvent) => void") | Pointing device is moved out of the hit-testing boundary. |
| [`onPointermove`](!code#props.onPointermove "(payload: PointerEvent) => void") | The pointer changed coordinates. |
| [`onPointerout`](!code#props.onPointerout "(payload: PointerEvent) => void") | The pointing device moved out of hit-testing boundary or leaves detectable hover range. |
| [`onPointerover`](!code#props.onPointerover "(payload: PointerEvent) => void") | The pointing device is moved into the hit-testing boundary. |
| [`onPointerup`](!code#props.onPointerup "(payload: PointerEvent) => void") | The pointer leaves the active buttons state. |
| [`onProgress`](!code#props.onProgress "(payload: ProgressEvent<EventTarget>) => void") | In progress. |
| [`onRatechange`](!code#props.onRatechange "(payload: Event) => void") | The playback rate has changed. |
| [`onReset`](!code#props.onReset "(payload: Event) => void") | A form is reset. |
| [`onScroll`](!code#props.onScroll "(payload: Event) => void") | The document view or an element has been scrolled. |
| [`onScrollend`](!code#props.onScrollend "(payload: Event) => void") | Handler for the native `scrollend` event. |
| [`onSecuritypolicyviolation`](!code#props.onSecuritypolicyviolation "(payload: SecurityPolicyViolationEvent) => void") | Handler for the native `securitypolicyviolation` event. |
| [`onSeeked`](!code#props.onSeeked "(payload: Event) => void") | A seek operation completed. |
| [`onSeeking`](!code#props.onSeeking "(payload: Event) => void") | A seek operation began. |
| [`onSelect`](!code#props.onSelect "(payload: Event) => void") | Some text is being selected. |
| [`onStalled`](!code#props.onStalled "(payload: Event) => void") | The user agent is trying to fetch media data, but data is unexpectedly not forthcoming. |
| [`onSubmit`](!code#props.onSubmit "(payload: SubmitEvent) => void") | A form is submitted. |
| [`onSuspend`](!code#props.onSuspend "(payload: Event) => void") | Media data loading has been suspended. |
| [`onTimeupdate`](!code#props.onTimeupdate "(payload: Event) => void") | The time indicated by the currentTime attribute has been updated. |
| [`onToggle`](!code#props.onToggle "(payload: ToggleEvent) => void") | Handler for the native `toggle` event. |
| [`onTouchcancel`](!code#props.onTouchcancel "(payload: TouchEvent) => void") | Handler for the native `touchcancel` event. |
| [`onTouchend`](!code#props.onTouchend "(payload: TouchEvent) => void") | Handler for the native `touchend` event. |
| [`onTouchmove`](!code#props.onTouchmove "(payload: TouchEvent) => void") | Handler for the native `touchmove` event. |
| [`onTouchstart`](!code#props.onTouchstart "(payload: TouchEvent) => void") | Handler for the native `touchstart` event. |
| [`onTransitioncancel`](!code#props.onTransitioncancel "(payload: TransitionEvent) => void") | Handler for the native `transitioncancel` event. |
| [`onTransitionend`](!code#props.onTransitionend "(payload: TransitionEvent) => void") | Handler for the native `transitionend` event. |
| [`onTransitionrun`](!code#props.onTransitionrun "(payload: TransitionEvent) => void") | Handler for the native `transitionrun` event. |
| [`onTransitionstart`](!code#props.onTransitionstart "(payload: TransitionEvent) => void") | Handler for the native `transitionstart` event. |
| [`onVolumechange`](!code#props.onVolumechange "(payload: Event) => void") | The volume has changed. |
| [`onWaiting`](!code#props.onWaiting "(payload: Event) => void") | Playback has stopped because of a temporary lack of data. |
| [`onWheel`](!code#props.onWheel "(payload: WheelEvent) => void") | Handler for the native `wheel` event. |
| [`part`](!code#props.part "string") | A space-separated list of the part names of the element. Part names allows CSS to select and style specific elements in a shadow tree via the [`::part`](https://developer.mozilla.org/docs/Web/CSS/::part "The ::part CSS pseudo-element represents any element within a shadow tree that has a matching part attribute.") pseudo-element. |
| [`placeholder`](!code#props.placeholder "string \| undefined") | A hint to the user of what can be entered in the control. Carriage returns or line-feeds within the placeholder text must be treated as line breaks when rendering the hint.<br><br>**Note:** Placeholders should only be used to show an example of the type of data that should be entered into a form; they are _not_ a substitute for a proper [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label "The HTML <label> element represents a caption for an item in a user interface.") element tied to the input. See [Labels and placeholders](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Labels_and_placeholders "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") in [<input>: The Input (Form Input) element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") for a full explanation. |
| [`prefix`](!code#props.prefix "string \| undefined") | RDFa: prefix mappings for CURIE terms. |
| [`property`](!code#props.property "string \| undefined") | RDFa: the property relating the subject to the value. |
| [`radiogroup`](!code#props.radiogroup "string \| undefined") | The radio group a command of type radio belongs to. |
| [`resource`](!code#props.resource "string \| undefined") | RDFa: the resource the property refers to. |
| [`results`](!code#props.results "Numberish \| undefined") | Non-standard Safari attribute limiting the number of recent-search entries shown in a search field. |
| [`role`](!code#props.role "string \| undefined") | The element's ARIA role, defining its purpose for assistive technologies. |
| [`security`](!code#props.security "string \| undefined") | Non-standard legacy attribute (Internet Explorer) controlling script security in a frame. |
| [`spellcheck`](!code#props.spellcheck "Booleanish \| undefined") | An enumerated attribute defines whether the element may be checked for spelling errors. It may have the following values:<br><br>*   `true`, which indicates that the element should be, if possible, checked for spelling errors; *   `false`, which indicates that the element should not be checked for spelling errors. |
| [`tabindex`](!code#props.tabindex "Numberish \| undefined") | An integer attribute indicating if the element can take input focus (is _focusable_), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values:<br><br>*   a _negative value_ means that the element should be focusable, but should not be reachable via sequential keyboard navigation; *   `0` means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention; *   a _positive value_ means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the [**tabindex**](#attr-tabindex). If several elements share the same tabindex, their relative order follows their relative positions in the document. |
| [`title`](!code#props.title "string \| undefined") | Contains a text representing advisory information related to the element it belongs to. Such information can typically, but not necessarily, be presented to the user as a tooltip. |
| [`translate`](!code#props.translate "'yes' \| 'no' \| undefined") | An enumerated attribute that is used to specify whether an element's attribute values and the values of its [`Text`](https://developer.mozilla.org/docs/Web/API/Text "The Text interface represents the textual content of Element or Attr. If an element has no markup within its content, it has a single child implementing Text that contains the element's text. However, if the element contains markup, it is parsed into information items and Text nodes that form its children.") node children are to be translated when the page is localized, or whether to leave them unchanged. It can have the following values:<br><br>*   empty string and `yes`, which indicates that the element will be translated. *   `no`, which indicates that the element will not be translated. |
| [`typeof`](!code#props.typeof "string \| undefined") | RDFa: the RDF types of the subject. |
| [`unselectable`](!code#props.unselectable "'on' \| 'off' \| undefined") | Non-standard legacy attribute (Internet Explorer/Opera) preventing text selection. |
| [`value`](!code#props.value "string \| ReadonlyArray<string> \| number \| undefined") | The initial value of the button. It defines the value associated with the button which is submitted with the form data. This value is passed to the server in params when the form is submitted. |
| [`vocab`](!code#props.vocab "string \| undefined") | RDFa: the default vocabulary for property and typeof terms. |

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
| [`isStatic`](!code#context.isStatic "true") | Whether the element is a static (non-data) element. |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`icon`](!code#context.icon "string \| undefined") | The resolved icon CSS class string. `$`-prefixed names are mapped through the config-level semantic `icons` map. |
| [`href`](!code#context.href "string \| (string & {}) \| undefined") | The resolved href for the button, supporting dynamic text props. |
| [`to`](!code#context.to "string \| (string & {}) \| undefined") | The resolved route location for the button, supporting dynamic text props. |
| [`severity`](!code#context.severity "string \| (string & {}) \| undefined") | The resolved severity of the button, supporting dynamic text props. |
| [`handleClick()`](!code#context.handleClick "(event: MouseEvent) => void") | Handles the click event, fires the click event through the event system, and performs the configured action (submit or reset) on the parent form. |
| [`as`](!code#context.as "\"a\" \| undefined") | The element the button renders as — an anchor (`a`) when `href` is set, the default button element otherwise. |
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
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for custom errors and messages. |
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
| [`tokenClass`](!code#context.tokenClass "string") | A unique CSS class scoped to this component instance, used to target the injected token style rule. |
| [`tokenCss`](!code#context.tokenCss "string") | The CSS text for scoped token custom properties on this component instance — a base rule plus a browser-resolved dark-mode block, so the text is identical between server and client renders. |
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

### `button`

The PrimeVue Button component.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Button>`](https://primevue.org/button/) |

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
