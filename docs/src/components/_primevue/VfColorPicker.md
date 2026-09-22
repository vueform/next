# VfColorPicker

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!-- #region usage-basic -->

## Basic Usage

`VfColorPicker` wraps PrimeVue's [ColorPicker](https://v4.primevue.org/colorpicker/) and forwards its entire API — original props, events, and slots all work as documented, apart from the few exceptions in the [PrimeVue Props](#props.props-primevue) table. On top of that, Vueform adds its own props, events, slots, and features — data binding, validation, conditions, and layout — which the examples on this page demonstrate.

::: usage

```vue [Preview]
<VfColorPicker name="color" format="hex" />
```

```vue [Template]
<VfColorPicker
  name="color"
  label="Color"
  format="hex"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  color: {
    type: 'color-picker',
    label: "Color",
    format: 'hex',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For the official PrimeVue examples, visit [ColorPicker](https://v4.primevue.org/colorpicker/).

<!-- #endregion usage-basic -->

<!-- #region usage-inline -->

## Inline

The `inlined` prop displays the color picker directly in the page instead of as an overlay popup. This replaces PrimeVue's `inline` prop, which is renamed to avoid conflict with Vueform's layout `inline` prop.

::: usage center

```vue [Preview]
<VfColorPicker name="color" inlined format="hex" />
```

```vue [Template]
<VfColorPicker
  name="color"
  label="Color: #{SELF('model')}"
  inlined
  format="hex"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  color: {
    type: 'color-picker',
    label: "Color: #{SELF('model')}",
    inlined: true,
    format: 'hex',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-inline -->

<!-- #region usage-addon -->

## As Addon

The color picker can be used as a `addonBefore` element addon on another input. Combined with an expression-based `default` and `readonly`, the text input displays the selected color value.

::: usage

```vue [Preview]
<VfInputText
  name="value"
  :addon-before="{
    name: 'color',
    type: 'color-picker',
    format: '{format}',
  }"
  :addon-after="{
    name: 'format',
    type: 'select',
    options: { hex: 'Hex', rgb: 'RGB', hsb: 'HSB' },
    defaultValue: 'hex',
  }"
  default-value="{...}"
  readonly
/>
```

```vue [Template]
<VfInputText
  name="value"
  :addon-before="{
    name: 'color',
    type: 'color-picker',
    format: '{format}',
  }"
  :addon-after="{
    name: 'format',
    type: 'select',
    options: {
      hex: 'Hex',
      rgb: 'RGB',
      hsb: 'HSB',
    },
    defaultValue: 'hex',
  }"
  :default-value="`{
    format == 'rgb' and NOT_EMPTY(color)
      ? CONCAT('rgb(', color.r, ', ', color.g, ', ', color.b, ')')
      : format == 'hsb' and NOT_EMPTY(color)
        ? CONCAT('HSB(', color.h, ', ', ROUND(color.s), '%, ', ROUND(color.b), '%)')
        : NOT_EMPTY(color)
          ? CONCAT('#', color)
          : ''
  }`"
  readonly
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  hex: {
    type: 'text',
    label: 'Selected Color',
    readonly: true,
    defaultValue: `{
      format == 'rgb' and NOT_EMPTY(color)
        ? CONCAT('rgb(', color.r, ', ', color.g, ', ', color.b, ')')
        : format == 'hsb' and NOT_EMPTY(color)
          ? CONCAT('HSB(', color.h, ', ', ROUND(color.s), '%, ', ROUND(color.b), '%)')
          : NOT_EMPTY(color)
            ? CONCAT('#', color)
            : ''
    }`,
    addonBefore: {
      name: 'color',
      type: 'color-picker',
      format: '{format}',
    },
    addonAfter: {
      name: 'format',
      type: 'select',
      options: {
        hex: 'Hex',
        rgb: 'RGB',
        hsb: 'HSB',
      },
      defaultValue: 'hex',
    }
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-addon -->

<!-- #region usage-hint-text -->

## Hint Text

The `hint` prop displays advisory text below the input, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Use it to provide contextual guidance to the user.

::: usage

```vue [Preview]
<VfColorPicker name="brand_color" hint="Choose your brand's primary color." />
```

```vue [Template]
<VfColorPicker
  name="brand_color"
  label="Color"
  hint="Choose your brand's primary color."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  brand_color: {
    type: 'color-picker',
    label: "Color",
    hint: 'Choose your brand\'s primary color.',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-hint-text -->

<!-- #region usage-help-text -->

## Help Text

The `help` prop displays advisory text below the label, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Unlike `hint` (which appears below the input), `help` is positioned directly under the label.

::: usage

```vue [Preview]
<VfColorPicker name="accent" help="Used for buttons and links." />
```

```vue [Template]
<VfColorPicker
  name="accent"
  label="Color"
  help="Used for buttons and links."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  accent: {
    type: 'color-picker',
    label: "Color",
    help: 'Used for buttons and links.',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-help-text -->

<!-- #region usage-info -->

## Info

The `info` prop displays an info icon next to the label that shows a tooltip on hover. The element must have a `label` for the info icon to appear. The `infoPosition` prop controls the tooltip placement.

::: usage

```vue [Preview]
<VfColorPicker
  name="background"
  info="This color will be used as the page background."
/>
```

```vue [Template]
<VfColorPicker
  name="background"
  label="Color"
  info="This color will be used as the page background."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  background: {
    type: 'color-picker',
    label: "Color",
    info: 'This color will be used as the page background.',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-info -->

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

| Prop                                             | Default          | Description                                                                                     |
| ------------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| [`name`](!code#props.name 'ElementName')         | —                | **Required.** The element's unique identifier and path in the current level of form data model. |
| [`type`](!code#props.type 'string')              | `'color-picker'` | The element type identifier.                                                                    |
| [`id`](!code#props.id 'TProp<string, TContext>') | —                | The HTML `id` attribute for the input element.                                                  |

### Input {#props-colorpicker}

| Prop                                                                         | Default                  | Description                                                                                                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`format`](!code#props.format 'DProp<ColorFormat>')                          | `'hex'`                  | Format to use in value binding, supported formats are `'hex'`, `'rgb'` and `'hsb'`.                                                                                                         |
| [`defaultColor`](!code#props.defaultColor 'any')                             | `'ff0000'`               | Initial color to display when value is not defined and the format is `hex`.                                                                                                                 |
| [`defaultRgb`](!code#props.defaultRgb '{ r: number; g: number; b: number }') | `{ r: 255, g: 0, b: 0 }` | Initial color to display when value is not defined and the format is `rgb`.                                                                                                                 |
| [`defaultHsb`](!code#props.defaultHsb '{ h: number; s: number; b: number }') | `{ h: 100, s: 0, b: 0 }` | Initial color to display when value is not defined and the format is `hsb`.                                                                                                                 |
| [`description`](!code#props.description 'TProp<string, TContext>')           | —                        | A description text displayed below the element.                                                                                                                                             |
| [`defaultValue`](!code#props.defaultValue 'T')                               | —                        | The default/initial value of the element.                                                                                                                                                   |
| [`sensitive`](!code#props.sensitive 'boolean')                               | `false`                  | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`disabled`](!code#props.disabled 'ConditionalProp<TContext>')               | —                        | Whether the element is disabled.                                                                                                                                                            |
| [`aligned`](!code#props.aligned 'boolean')                                   | `false`                  | Whether the element should vertically align with adjacent form controls.                                                                                                                    |

### Data {#props-data}

| Prop                                                                                                     | Default | Description                                                                                      |
| -------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| [`modelValue`](!code#props.modelValue 'T')                                                               | —       | The current value of the element (v-model).                                                      |
| [`submit`](!code#props.submit 'boolean')                                                                 | `true`  | Whether the element value is included in form submission data.                                   |
| [`untrackOn`](!code#props.untrackOn 'UntrackOnProp')                                                     | —       | Controls when the element stops tracking user changes.                                           |
| [`detached`](!code#props.detached 'boolean')                                                             | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload '(value: any, context$: VfColorPickerContext) => any') | —       | Transforms the element's value when submitting the form.                                         |

### Validation {#props-validation}

| Prop                                                                    | Default | Description                                                              |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| [`rules`](!code#props.rules 'RulesProp<TContext>')                      | —       | Validation rules to apply to the element.                                |
| [`validateOn`](!code#props.validateOn 'ElementValidateOnProp')          | —       | Controls when validation is triggered (e.g. on change, blur, or submit). |
| [`debounce`](!code#props.debounce 'number')                             | —       | Delay in milliseconds before processing input.                           |
| [`bail`](!code#props.bail 'boolean')                                    | `true`  | Whether to stop validation after the first failing rule.                 |
| [`ruleMessages`](!code#props.ruleMessages 'RuleMessagesProp<TContext>') | —       | Custom error messages keyed by validation rule name.                     |
| [`displayName`](!code#props.displayName 'TProp<string, TContext>')      | —       | The display name used in validation error messages.                      |
| [`maxErrors`](!code#props.maxErrors 'number')                           | `1`     | Maximum number of validation errors to display at once.                  |
| [`hideErrors`](!code#props.hideErrors 'boolean')                        | `false` | Whether to hide validation error messages.                               |
| [`showRequired`](!code#props.showRequired 'ShowRequiredProp')           | —       | Where to show required field indicators (e.g. label, placeholder).       |
| [`hoist`](!code#props.hoist 'boolean')                                  | `false` | Whether to push the element's errors to its nearest ancestor element.    |

### Conditions {#props-conditions}

| Prop                                                                                   | Default | Description                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`conditions`](!code#props.conditions 'ConditionalProp<TContext>')                     | —       | Conditions that control the element's visibility and availability.                                                                                                                                                                                                                                                                     |
| [`conditionsTrigger`](!code#props.conditionsTrigger 'ConditionsTriggerProp<TContext>') | —       | The source that triggers re-evaluation of this element's async conditional props (`conditions`, `disabled`, `readonly`, and validation rule conditions). Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, any change in the form model re-triggers evaluation. |
| [`conditionsDebounce`](!code#props.conditionsDebounce 'number')                        | —       | The debounce delay in milliseconds applied before re-evaluating this element's async conditional props when the trigger source changes. Overrides the global `$conditions.debounce` config (default `300`).                                                                                                                            |

### Layout {#props-layout}

| Prop                                                          | Default | Description                                                                                                                                                                                                   |
| ------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`columns`](!code#props.columns 'ColumnsProp<TContext>')      | —       | Responsive grid column sizing for the element's layout.                                                                                                                                                       |
| [`layout`](!code#props.layout 'ComponentProp \| boolean')      | `true`  | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout.                                                                     |
| [`label`](!code#props.label 'TProp<string, TContext>')        | —       | The label displayed alongside the element.                                                                                                                                                                    |
| [`hideLabel`](!code#props.hideLabel 'boolean')                | `false` | Whether to visually hide the element's label.                                                                                                                                                                 |
| [`page`](!code#props.page 'PageProp<TContext>')               | —       | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property.                                                                                     |
| [`help`](!code#props.help 'TProp<string, TContext>')          | —       | A help text displayed below the label.                                                                                                                                                                        |
| [`info`](!code#props.info 'TProp')                            | —       | Informational text displayed as a tooltip for the element.                                                                                                                                                    |
| [`infoPosition`](!code#props.infoPosition 'InfoPositionProp') | —       | Position of the info tooltip relative to the info icon.                                                                                                                                                       |
| [`spaceTop`](!code#props.spaceTop 'number')                   | —       | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, ....                                                                                   |
| [`spaceBottom`](!code#props.spaceBottom 'number')             | —       | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, ....                                                                                   |
| [`lineTop`](!code#props.lineTop 'boolean')                    | `false` | Renders a horizontal line (border) above the element.                                                                                                                                                         |
| [`lineBottom`](!code#props.lineBottom 'boolean')              | `false` | Renders a horizontal line (border) below the element.                                                                                                                                                         |
| [`expressions`](!code#props.expressions 'ExpressionsProp')    | —       | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Customization {#props-customization}

| Prop                                                      | Default | Description                                                                                                                         |
| --------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`parts`](!code#props.parts 'P')                          | —       | Custom DOM attribute overrides for the component's structural parts.                                                                |
| [`class`](!code#props.class 'ClassValue')                 | —       | CSS classes to apply to the component's root element.                                                                               |
| [`classes`](!code#props.classes 'C')                      | —       | Custom CSS class overrides for the component's structural parts.                                                                    |
| [`reclass`](!code#props.reclass 'C')                      | —       | CSS class overrides that replace (rather than merge with) default classes.                                                          |
| [`tokens`](!code#props.tokens 'ThemeTokens')              | —       | Token overrides applied to the element's CSS custom properties.                                                                     |
| [`slots`](!code#props.slots 'S')                          | —       | Custom Vue components to use for named slots. Every component resolves it through the standard outlets pipeline (see `useOutlets`). |
| [`presets`](!code#props.presets 'PresetsProp')            | —       | Named configuration presets to apply to the component.                                                                              |
| [`template`](!code#props.template 'ComponentProp \| null') | —       | A custom Vue component to use as the template instead of the default.                                                               |
| [`component`](!code#props.component 'ComponentProp')      | —       | A custom Vue component to render in the component's default slot.                                                                   |

### Accessibility {#props-accessibility}

| Prop                                  | Default | Description                        |
| ------------------------------------- | ------- | ---------------------------------- |
| [`aria`](!code#props.aria 'AriaProp') | —       | ARIA attributes for accessibility. |

<!-- @endcollapsible -->
<!-- @props-end -->

<!-- @props-adapter-start -->

### PrimeVue {#props-primevue}

<!-- @collapsible -->

#### Unavailable PrimeVue Props {#props-unavailable}

Props that are unavailable because Vueform covers them differently.

| Prop                                                                       | Description                                           |
| -------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`formControl`](!code#props.formControl 'Record<string, any> \| undefined') | Vueform manages form control registration internally. |
| [`inputId`](!code#props.inputId 'string \| undefined')                      | Use [`id`](#props.id) prop instead.                   |
| [`invalid`](!code#props.invalid 'boolean \| undefined')                     | Managed automatically by Vueform's validation system. |

<!-- @endcollapsible -->

<!-- @collapsible closed -->

#### Unaffected PrimeVue Props {#props-unaffected}

PrimeVue props that work exactly the same — Vueform does not modify them.

| Prop                                                                                         | Description                                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`appendTo`](!code#props.appendTo "HintedString<'body' | 'self'> | undefined | HTMLElement") | A valid query selector or an HTMLElement to specify where the overlay gets attached. Special keywords are 'body' for document body and 'self' for the element itself. |
| [`autoZIndex`](!code#props.autoZIndex 'boolean \| undefined')                                 | Whether to automatically manage layering.                                                                                                                             |
| [`baseZIndex`](!code#props.baseZIndex 'number \| undefined')                                  | Base zIndex value to use in layering.                                                                                                                                 |
| [`dt`](!code#props.dt 'DesignToken<any>')                                                    | It generates scoped CSS variables using design tokens for the component.                                                                                              |
| [`inline`](!code#props.inline 'boolean \| undefined')                                         | Whether to display as an overlay or not.                                                                                                                              |
| [`overlayClass`](!code#props.overlayClass 'any')                                             | Style class of the overlay panel.                                                                                                                                     |
| [`panelClass`](!code#props.panelClass 'any')                                                 | Style class of the overlay panel.                                                                                                                                     |
| [`pt`](!code#props.pt 'PassThrough<ColorPickerPassThroughOptions>')                          | Used to pass attributes to DOM elements inside the component.                                                                                                         |
| [`ptOptions`](!code#props.ptOptions 'PassThroughOptions')                                    | Used to configure passthrough(pt) options of the component.                                                                                                           |
| [`tabindex`](!code#props.tabindex 'string \| undefined')                                      | Index of the element in tabbing order.                                                                                                                                |
| [`unstyled`](!code#props.unstyled 'boolean')                                                 | When enabled, it removes component related styles in the core.                                                                                                        |

<!-- @endcollapsible -->
<!-- @props-adapter-end -->
<!-- @endtab -->

<!-- @tab Context -->

## Context

Reactive properties and methods accessible on the component's [Context](/guide/context) object.

<!-- @collapsible -->
<!-- @context-start -->

### General {#section-general}

| Name                                    | Description                                                        |
| --------------------------------------- | ------------------------------------------------------------------ |
| [`type`](!code#context.type 'string')   | The element's type identifier (e.g. "text", "checkbox", "select"). |
| [`name`](!code#context.name 'string')   | The element's name as a string ref.                                |
| [`props`](!code#context.props 'object') | The resolved component props with defaults applied.                |

### ColorPicker {#section-colorpicker}

| Name                                                                                       | Description                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`description`](!code#context.description 'string \| (string & {}) \| undefined')            | The resolved description text for the element.                                                                                                                                                                                                                                                                                                        |
| [`descriptionId`](!code#context.descriptionId 'string')                                    | The DOM id for the element's description text region.                                                                                                                                                                                                                                                                                                 |
| [`validation`](!code#context.validation 'ShallowReactive<Record<string, ValidationView>>') |                                                                                                                                                                                                                                                                                                                                                       |
| [`validator`](!code#context.validator 'Validator')                                         |                                                                                                                                                                                                                                                                                                                                                       |
| [`shouldValidate`](!code#context.shouldValidate 'boolean')                                 |                                                                                                                                                                                                                                                                                                                                                       |
| [`onUserInput()`](!code#context.onUserInput '() => void')                                  |                                                                                                                                                                                                                                                                                                                                                       |
| [`isFlatContainer`](!code#context.isFlatContainer 'boolean')                               | Whether the element's data is flattened into the parent container rather than nested under its own `name` key.                                                                                                                                                                                                                                        |
| [`containerModel`](!code#context.containerModel 'unknown')                                 | The model ref the element provides to its children via the container context. For flat containers this is the parent's model — children's data lives merged at the parent level, while the public `model` is a scoped projection. For every other element it is the element's own `model`.                                                            |
| [`handleModelUpdate()`](!code#context.handleModelUpdate '(data: Event) => void')           | Handles a native input event and updates the model from the event target. Text and select inputs use `target.value`. Checkboxes and radios use the `checked` state with `trueValue` / `falseValue` when available.                                                                                                                                    |
| [`initValidation()`](!code#context.initValidation '() => void')                            |                                                                                                                                                                                                                                                                                                                                                       |
| [`destroyValidation()`](!code#context.destroyValidation '() => void')                      |                                                                                                                                                                                                                                                                                                                                                       |
| [`rootModel`](!code#context.rootModel 'RootModel \| undefined')                             | The root model backing the form when this element operates as the form root (adopting a `useModel` instance from `modelValue` or creating an internal store), `undefined` for every other element.                                                                                                                                                    |
| [`sensitivePaths`](!code#context.sensitivePaths 'string[]')                                | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. A sensitive element marks its whole subtree; containers otherwise aggregate from children. Unavailable elements are included: their data may still linger in the model, and stripping an absent path is harmless. |
| [`setInputRef()`](!code#context.setInputRef '(el: any) => void')                           | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `input` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref.                                  |
| [`canonicalDomValue`](!code#context.canonicalDomValue 'boolean')                           | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value adoption and the DOM recovery listeners.                                                                                                                                                                    |
| [`inputBindings`](!code#context.inputBindings 'object')                                    | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners.                                                               |
| [`componentBindings`](!code#context.componentBindings 'object')                            | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur.                                                                                      |
| [`format`](!code#context.format 'ColorFormat')                                             | The resolved color format, supporting dynamic text props.                                                                                                                                                                                                                                                                                             |

### Data {#section-data}

| Name                                                                     | Description                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`model`](!code#context.model 'Record<string, any> \| any')               | The element's reactive model value within the form data tree.                                                                                                                                                                     |
| [`value`](!code#context.value 'any')                                     | The current language-aware value of the element. For translatable elements, returns the value for the active language.                                                                                                            |
| [`payload`](!code#context.payload 'object')                              | The element's submission payload. For isContainer.value containers, aggregates from children. For leaf elements, returns own value.                                                                                               |
| [`nullValue`](!code#context.nullValue 'any')                             | The value the element holds when it is considered empty. Determined by `nullValue` / `falseValue` props, element type (container, multiple), and translatable state. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel 'Record<string, any> \| any') | A snapshot of the model at initialization time, used for dirty checking and reset.                                                                                                                                                |
| [`dataPath`](!code#context.dataPath 'string')                            | The dot-notation path to this element's value within the form data object (e.g. `"address.city"`). Empty string for the root model. Flat containers inherit their parent's data path.                                             |
| [`tracking`](!code#context.tracking 'boolean')                           | Whether the element's `default` expression is currently tracked and auto-updating the value.                                                                                                                                      |
| [`update()`](!code#context.update '(data: any) => void')                 | Updates the element's model value. For isContainer.value containers, performs a deep merge. For leaf elements, sets the value directly and invalidates validation.                                                                |
| [`load()`](!code#context.load '(data: any) => void')                     | Loads data into the element and fires the `load` event, cascading to all children so expression tracking can be stopped per-element.                                                                                              |
| [`reset()`](!code#context.reset '() => void')                            | Resets the element to its initial model state and fires the `reset` event. For isContainer.value containers, delegates to children or resets the model directly for dynamic lists.                                                |
| [`clear()`](!code#context.clear '() => void')                            | Clears the element to its null value and fires the `clear` event. For isContainer.value containers, delegates to children or clears the model for dynamic lists.                                                                  |
| [`track()`](!code#context.track '() => void')                            | Resumes expression tracking after an untrack, immediately re-writing the resolved value.                                                                                                                                          |
| [`untrack()`](!code#context.untrack '() => void')                        | Stops expression tracking, leaving the current value in place.                                                                                                                                                                    |
| [`reinit()`](!code#context.reinit '() => void')                          | Reinitializes the element by rebuilding both its model registration and validation instances.                                                                                                                                     |

### State {#section-state}

| Name                                                     | Description                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`visible`](!code#context.visible 'boolean')             | Whether the element is currently visible, based on availability, container visibility, and pager state.                                                                                                                                                |
| [`available`](!code#context.available 'boolean')         | Whether the element is available (not hidden by conditional logic).                                                                                                                                                                                    |
| [`disabled`](!code#context.disabled 'boolean')           | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`focused`](!code#context.focused 'boolean')             | Whether the element is currently focused.                                                                                                                                                                                                              |
| [`touched`](!code#context.touched 'boolean')             | Whether the element has been touched (blurred) by the user.                                                                                                                                                                                            |
| [`visited`](!code#context.visited 'boolean')             | Whether the element has been visited (focused) by the user.                                                                                                                                                                                            |
| [`dirty`](!code#context.dirty 'boolean')                 | Whether the current model value differs from the initial model value.                                                                                                                                                                                  |
| [`empty`](!code#context.empty 'boolean')                 | Whether the element's current value is empty. For isContainer.value containers, checks whether all children are empty. For leaf elements, checks whether the value is blank or equals the falseValue.                                                  |
| [`busy`](!code#context.busy 'boolean')                   | Whether the element is busy, meaning it is either debouncing or has pending async validation.                                                                                                                                                          |
| [`hoisted`](!code#context.hoisted 'boolean \| undefined') | Whether this element pushes its errors to its nearest ancestor element instead of displaying and reporting them itself.                                                                                                                                |
| [`enable()`](!code#context.enable '() => void')          | Programmatically enables the element.                                                                                                                                                                                                                  |
| [`disable()`](!code#context.disable '() => void')        | Programmatically disables the element.                                                                                                                                                                                                                 |

### Validation {#section-validation}

| Name                                                                                                                                 | Description                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`invalid`](!code#context.invalid 'boolean')                                                                                         | Whether any of the element's validations (across all languages) are currently invalid, including children.                                                                                                                                                                                                                            |
| [`validated`](!code#context.validated 'boolean')                                                                                     | Whether all of the element's validations (across all languages) have been executed, including children.                                                                                                                                                                                                                               |
| [`completed`](!code#context.completed 'boolean')                                                                                     | Whether the element is completed, meaning it either has no rules or has been validated without errors.                                                                                                                                                                                                                                |
| [`success`](!code#context.success 'boolean')                                                                                         |                                                                                                                                                                                                                                                                                                                                       |
| [`pending`](!code#context.pending 'boolean')                                                                                         | Whether any of the element's validations are currently pending an async check, including children.                                                                                                                                                                                                                                    |
| [`debouncing`](!code#context.debouncing 'boolean')                                                                                   | Whether any of the element's validations are currently debouncing, including children.                                                                                                                                                                                                                                                |
| [`errors`](!code#context.errors 'any[]')                                                                                             | All error messages for this element: its own plus any pushed up by hoisted children.                                                                                                                                                                                                                                                  |
| [`hasError`](!code#context.hasError 'boolean')                                                                                       | Whether the element has any active error messages.                                                                                                                                                                                                                                                                                    |
| [`displayErrors`](!code#context.displayErrors 'any[]')                                                                               | The error messages rendered for this element. Empty when the element pushes its errors to its parent; otherwise errors capped by `maxErrors`.                                                                                                                                                                                         |
| [`ownErrors`](!code#context.ownErrors 'string[]')                                                                                    | The element's own error messages across all languages (validation rules plus custom message bag entries).                                                                                                                                                                                                                             |
| [`formErrors`](!code#context.formErrors 'object')                                                                                    | Error messages propagated to the form, keyed by element path. Empty when the element pushes its errors to its parent.                                                                                                                                                                                                                 |
| [`messages`](!code#context.messages 'string[]')                                                                                      | The list of custom messages from the message bag, including messages from hoisted children.                                                                                                                                                                                                                                           |
| [`messageBag`](!code#context.messageBag 'MessageBagInstance')                                                                        | The element's message bag for managing custom errors, messages, and prepended/appended messages.                                                                                                                                                                                                                                      |
| [`required`](!code#context.required 'boolean')                                                                                       |                                                                                                                                                                                                                                                                                                                                       |
| [`genericName`](!code#context.genericName 'string')                                                                                  | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop.                                                                                                                                                                                                                            |
| [`validate()`](!code#context.validate '(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>')                 | Runs validation on the element's own rules and all children, returning whether everything is valid. Elements already validated without errors against their current value are skipped unless `force: true` re-runs everything — for rules whose outcome can change without the value changing (async server checks, date boundaries). |
| [`validateSelf()`](!code#context.validateSelf '() => Promise<boolean>')                                                              |                                                                                                                                                                                                                                                                                                                                       |
| [`validateChildren()`](!code#context.validateChildren '(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>') | Validates stateful children, returning whether all are valid. By default only incomplete children run — never-validated, stale, or invalid ones; children validated without errors against their current value keep their result. `force: true` runs every child regardless of prior results.                                         |
| [`invalidate()`](!code#context.invalidate '() => void')                                                                              | Marks all validation instances as invalidated, requiring revalidation. For isContainer.value containers, also delegates to children.                                                                                                                                                                                                  |
| [`unvalidate()`](!code#context.unvalidate '() => void')                                                                              | Resets all validation state. For isContainer.value containers, also delegates to children.                                                                                                                                                                                                                                            |
| [`filled()`](!code#context.filled '(value: any) => boolean')                                                                         | Checks whether a value is considered filled. For isContainer.value containers, delegates to children. For leaf elements, checks the scalar value.                                                                                                                                                                                     |
| [`clean()`](!code#context.clean '() => void')                                                                                        | Marks the element as clean by updating the initial model snapshot. For isContainer.value containers, delegates to children.                                                                                                                                                                                                           |
| [`clearErrors()`](!code#context.clearErrors '() => void')                                                                            | Clears all error messages from the message bag.                                                                                                                                                                                                                                                                                       |
| [`clearMessages()`](!code#context.clearMessages '() => void')                                                                        | Clears all custom messages from the message bag.                                                                                                                                                                                                                                                                                      |
| [`clearMessageBag()`](!code#context.clearMessageBag '() => void')                                                                    | Clears the entire message bag, removing both errors and messages.                                                                                                                                                                                                                                                                     |

### Layout {#section-layout}

| Name                                                                                                                                  | Description                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input`](!code#context.input 'any')                                                                                                  | Ref to the underlying input element.                                                                                                          |
| [`id`](!code#context.id 'string')                                                                                                     | The resolved element id, using the id prop or falling back to the auto-generated uid.                                                         |
| [`label`](!code#context.label 'string \| undefined')                                                                                   | The resolved label text for the element.                                                                                                      |
| [`help`](!code#context.help 'string')                                                                                                 | The resolved help text for the element.                                                                                                       |
| [`page`](!code#context.page 'PageProp \| undefined')                                                                                   | Page metadata for stepped/tabbed forms.                                                                                                       |
| [`classes`](!code#context.classes 'object')                                                                                           | The resolved CSS class map for the component.                                                                                                 |
| [`parts`](!code#context.parts 'object')                                                                                               | The resolved DOM attribute overrides for internal elements.                                                                                   |
| [`viewLoaded`](!code#context.viewLoaded 'boolean')                                                                                    | Whether the element's view has been loaded (used for lazy rendering optimization).                                                            |
| [`$el`](!code#context.$el 'HTMLElement \| null')                                                                                       | Reference to the component's root DOM element.                                                                                                |
| [`resolvedColumns`](!code#context.resolvedColumns 'object')                                                                           | Resolved column sizes per breakpoint, normalized into container/label/wrapper/group values.                                                   |
| [`updateColumns()`](!code#context.updateColumns '(v: any) => any')                                                                    | Updates the column configuration programmatically.                                                                                            |
| [`scrollTo()`](!code#context.scrollTo '(options: ScrollIntoViewOptions \| undefined, force: boolean \| undefined) => Promise<boolean>') | Scrolls the window to this element. If the element belongs to a step or tab, that page is selected first before scrolling.                    |
| [`focus()`](!code#context.focus '(scroll: boolean \| undefined) => Promise<boolean>')                                                  | Focuses the first focusable HTML element (input, select, textarea, button, etc.) within the wrapper. Optionally scrolls to the element first. |

### Tree {#section-tree}

| Name                                                                                          | Description                                                                                  |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`form$`](!code#context.form$ 'VfFormContext<EntryProps<Record<string, any>>> \| undefined')   | The parent form's context, providing access to form-level state and methods.                 |
| [`path`](!code#context.path 'string')                                                         | The element's dot-notation path in the form tree (e.g. "user.name").                         |
| [`componentName`](!code#context.componentName 'keyof ComponentRegistry<Record<string, any>>') | The resolved Vue component name for this element.                                            |
| [`container`](!code#context.container 'ContainerContext \| undefined')                         | The container context providing path, model, and registration methods for child elements.    |
| [`children`](!code#context.children 'VueformChildren')                                        | The child element registry providing registration, unregistration, and reactive child lists. |

### Handlers {#section-handlers}

| Name                                                                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`handleInput()`](!code#context.handleInput '(payload: any, e: Event \| undefined) => void') | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it. Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends. The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only adopted while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
| [`handleBlur()`](!code#context.handleBlur '(e: Event) => void')                             | Fires the blur event on the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| [`handleFocus()`](!code#context.handleFocus '(e: Event) => void')                           | Handles focus by setting the focused state and firing the focus event.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### Accessibility {#section-a11y}

| Name                                        | Description                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`uid`](!code#context.uid 'string')         | A unique auto-generated identifier for the element.                                                                                         |
| [`aria`](!code#context.aria 'object')       | Computed ARIA attributes (describedby, labelledby, invalid, required, busy) derived from element state and props, keyed by aria attr names. |
| [`helpId`](!code#context.helpId 'string')   | The DOM id for the element's help text region.                                                                                              |
| [`errorId`](!code#context.errorId 'string') | The DOM id for the element's error message region.                                                                                          |
| [`labelId`](!code#context.labelId 'string') | The DOM id for the element's label region.                                                                                                  |

<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->

<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/event-handlers) for details.

<!-- @events-start -->

| Name                | Params                                                                                                                                                | Description                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `show`              | [`context$`](!code#events.show.context$ 'VfColorPickerContext')                                                                                       |                                                                                    |
| `hide`              | [`context$`](!code#events.hide.context$ 'VfColorPickerContext')                                                                                       |                                                                                    |
| `change`            | [`newValue`](!code#events.change.newValue 'T'), [`oldValue`](!code#events.change.oldValue 'T'), [`context$`](!code#events.change.context$ 'TContext') | Emitted when the element value changes.                                            |
| `valueChange`       | [`value`](!code#events.valueChange.value 'any'), [`context$`](!code#events.valueChange.context$ 'VfColorPickerContext')                               |                                                                                    |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value 'T')                                                                                                   | Emitted to update the v-model binding.                                             |
| `load`              | [`value`](!code#events.load.value 'T'), [`context$`](!code#events.load.context$ 'TContext')                                                           | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset`             | [`context$`](!code#events.reset.context$ 'TContext')                                                                                                  | Emitted when the element is reset to its default value.                            |
| `clear`             | [`context$`](!code#events.clear.context$ 'TContext')                                                                                                  | Emitted when the element's value is cleared.                                       |
| `invalid`           | [`context$`](!code#events.invalid.context$ 'TContext')                                                                                                | Emitted when the element becomes invalid.                                          |
| `valid`             | [`context$`](!code#events.valid.context$ 'TContext')                                                                                                  | Emitted when the element becomes valid after having been invalid.                  |
| `input`             | [`value`](!code#events.input.value 'V'), [`e`](!code#events.input.e 'Event \| undefined'), [`context$`](!code#events.input.context$ 'TContext')        | Emitted when the input value is changed via the UI by the user.                    |
| `focus`             | [`context$`](!code#events.focus.context$ 'TContext')                                                                                                  | Emitted when the element receives focus.                                           |
| `blur`              | [`context$`](!code#events.blur.context$ 'TContext')                                                                                                   | Emitted when the element loses focus.                                              |
| `beforeMount`       | [`context$`](!code#events.beforeMount.context$ 'TContext')                                                                                            | Emitted before the component is mounted.                                           |
| `mounted`           | [`context$`](!code#events.mounted.context$ 'TContext')                                                                                                | Emitted after the component is mounted.                                            |
| `beforeUnmount`     | [`context$`](!code#events.beforeUnmount.context$ 'TContext')                                                                                          | Emitted before the component is unmounted.                                         |
| `unmounted`         | [`context$`](!code#events.unmounted.context$ 'TContext')                                                                                              | Emitted after the component is unmounted.                                          |
| `updated`           | [`context$`](!code#events.updated.context$ 'TContext')                                                                                                | Emitted after the component is updated.                                            |

<!-- @events-end -->
<!-- @endtab -->

<!-- @tab Slots -->

## Slots

Named [Slots](/guide/slots) for replacing parts of the component's rendering.

<!-- @slots-start -->

| Name          | Scope                                                        | Description                                                                                                        |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `template`    | [`context`](!code#slot.template.context 'TContext')          | Slot that replaces the entire component rendering. Receives the full component context as a single `context` prop. |
| `label`       | [`label`](!code#slot.label.label 'string')                   | Slot for customizing the element's label content.                                                                  |
| `required`    | —                                                            | Slot for customizing the required indicator.                                                                       |
| `info`        | [`info`](!code#slot.info.info 'string')                      | Slot for customizing the info tooltip or helper content.                                                           |
| `help`        | [`help`](!code#slot.help.help 'string')                      | Slot for customizing the help text.                                                                                |
| `description` | [`description`](!code#slot.description.description 'string') | Slot for customizing the description text.                                                                         |
| `errors`      | [`errors`](!code#slot.errors.errors 'string[]')              | Slot for customizing the validation errors display.                                                                |
| `messages`    | [`messages`](!code#slot.messages.messages 'string[]')        | Slot for customizing the info messages display.                                                                    |

<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts component="VfColorPicker"
:examples="{
default: 'Default',
}"
:schema="{
label: 'Brand color',
help: 'Applied to buttons, links and highlights',
hint: 'This will be the primary color of your theme',
info: 'You can change this anytime in your theme settings',
rules: 'required',
showRequired: ['label'],
format: 'hex',
defaultValue: '10b981',
onMounted: ({ messageBag }) => {
messageBag.append('Contrast with white text is too low', 'error')
messageBag.append('Meets WCAG AA contrast requirements', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfColorPicker
      name="default"
      v-bind="schema"
    />
</template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->

### `panel`

The wrapper around `root` with `display: contents` when the element is a step or a tab.

|             |                                                |
| ----------- | ---------------------------------------------- |
| **Element** | [`<TabPanel>`](https://primevue.org/tabpanel/) |
| **Classes** | `.vf-panel`                                    |

### `root`

The element's root wrapper.

|             |                                                                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Element** | `<div>` `<fieldset>`                                                                                                                                                                                          |
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-color-picker` `.vf-aligned?` |

### `labelGroup`

The container holding the label and required indicator.

|             |                                                                               |
| ----------- | ----------------------------------------------------------------------------- |
| **Element** | `<div>` `<legend>`                                                            |
| **Classes** | `.vf-label-group` `.vf-h1?` `.vf-h2?` `.vf-h3?` `.vf-h4?` `.vf-h5?` `.vf-h6?` |

### `label`

The label element.

|             |                                                              |
| ----------- | ------------------------------------------------------------ |
| **Element** | `<label>` `<span>` `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` |
| **Classes** | `.vf-label`                                                  |

### `required`

The required indicator.

|             |                |
| ----------- | -------------- |
| **Element** | `<div>`        |
| **Classes** | `.vf-required` |

### `elementGroup`

The container wrapping the input and related UI.

|             |                                                          |
| ----------- | -------------------------------------------------------- |
| **Element** | `<div>` [`<TabsProps>`](https://primevue.org/tabsprops/) |
| **Classes** | `.vf-element-group`                                      |

### `elementWrapper`

The wrapper directly around the input control.

|             |                       |
| ----------- | --------------------- |
| **Element** | `<div>`               |
| **Classes** | `.vf-element-wrapper` |

### `help`

The help text area.

|             |                                              |
| ----------- | -------------------------------------------- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-help`                                   |

### `input`

The color picker element.

|             |                                                      |
| ----------- | ---------------------------------------------------- |
| **Element** | [`<ColorPicker>`](https://primevue.org/colorpicker/) |

### `info`

Info container.

|             |            |
| ----------- | ---------- |
| **Element** | `<div>`    |
| **Classes** | `.vf-info` |

### `infoIcon`

Icon for displaying info tooltip.

|             |                 |
| ----------- | --------------- |
| **Element** | `<span>`        |
| **Classes** | `.vf-info-icon` |

### `description`

The description text area.

|             |                                              |
| ----------- | -------------------------------------------- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-description`                            |

### `errors`

The validation errors container.

|             |                                              |
| ----------- | -------------------------------------------- |
| **Element** | [`<Message>`](https://primevue.org/message/) |
| **Classes** | `.vf-errors`                                 |

### `error`

An individual validation error.

|             |             |
| ----------- | ----------- |
| **Element** | `<div>`     |
| **Classes** | `.vf-error` |

### `messages`

The info messages container.

|             |                |
| ----------- | -------------- |
| **Element** | `<div>`        |
| **Classes** | `.vf-messages` |

### `message`

An individual info message.

|             |               |
| ----------- | ------------- |
| **Element** | `<div>`       |
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
