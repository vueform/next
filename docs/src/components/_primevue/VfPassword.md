# VfPassword

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!-- #region usage-basic -->

## Basic Usage

`VfPassword` wraps PrimeVue's [Password](https://v4.primevue.org/password/) and forwards its entire API — original props, events, and slots all work as documented, apart from the few exceptions in the [PrimeVue Props](#props.props-primevue) table. On top of that, Vueform adds its own props, events, slots, and features — data binding, validation, conditions, and layout — which the examples on this page demonstrate.

::: usage

```vue [Preview]
<VfPassword name="password" toggle-mask feedback />
```

```vue [Template]
<VfPassword
  name="password"
  label="Password"
  placeholder="Enter your password"
  toggle-mask
  feedback
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  password: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    toggleMask: true,
    feedback: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For the official PrimeVue examples, visit [Password](https://v4.primevue.org/password/).

<!-- #endregion usage-basic -->

<!-- #region usage-float-label -->

## Float Label

The `floatLabel` prop displays a label that floats above the input when focused or filled, using PrimeVue's [FloatLabel](https://primevue.org/floatlabel/) component. The `float` prop controls the label behavior: omit it for the default "over" style, or set it to `'in'` or `'on'` for alternative placements.

::: usage center middle fit

```vue [Preview]
<VfPassword name="over" float-label="Over Label" />
<VfPassword name="in" float-label="In Label" float="in" />
<VfPassword name="on" float-label="On Label" float="on" />
```

```vue [Template]
<VfGroup name="floatLabels">
  <VfPassword name="over" float-label="Over Label" :columns="4" />
  <VfPassword
    name="in"
    float-label="In Label"
    float="in"
    :columns="4"
  />
  <VfPassword
    name="on"
    float-label="On Label"
    float="on"
    :columns="4"
  />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  over: {
    type: 'password',
    floatLabel: 'Over Label',
    columns: 4,
  },
  in: {
    type: 'password',
    floatLabel: 'In Label',
    float: 'in',
    columns: 4,
  },
  on: {
    type: 'password',
    floatLabel: 'On Label',
    float: 'on',
    columns: 4,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-float-label -->

<!-- #region usage-ifta-label -->

## IFTA Label

The `ifta` prop renders an in-field top-aligned label using PrimeVue's [IftaLabel](https://primevue.org/iftalabel/) component. The label stays visible at the top of the input at all times.

::: usage

```vue [Preview]
<VfPassword name="secret" ifta="Password" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  secret: {
    type: 'password',
    ifta: 'Password',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-ifta-label -->

<!-- #region usage-icons -->

## Icons

The `iconBefore` and `iconAfter` props display icons inside the input wrapper. The icon class format can be configured globally via the `icon` config option.

::: usage

```vue [Preview]
<VfPassword name="pwd_icon_before" icon-before="lock" />
<VfPassword name="pwd_icon_after" icon-after="shield" />
```

```vue [Template]
<VfPassword
  name="pwd_icon_before"
  placeholder="Password"
  icon-before="lock"
/>
<VfPassword
  name="pwd_icon_after"
  placeholder="Password"
  icon-after="shield"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  pwd_icon_before: {
    type: 'password',
    placeholder: 'Password',
    iconBefore: 'lock',
  },
  pwd_icon_after: {
    type: 'password',
    placeholder: 'Password',
    iconAfter: 'shield',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-icons -->

<!-- #region usage-text-addons -->

## Text Addons

The `addonBefore` and `addonAfter` props render text content alongside the input. Pass a string for a single addon or an array for multiple addons on the same side.

::: usage

```vue [Preview]
<VfPassword name="pwd_addon1" addon-before="Enter:" />
<VfPassword name="pwd_addon2" addon-before="New" addon-after="(8+ chars)" />
<VfPassword name="pwd_addon3" :addon-before="['Set', 'new:']" />
```

```vue [Template]
<VfPassword
  name="pwd_addon1"
  placeholder="Password"
  addon-before="Enter:"
/>
<VfPassword
  name="pwd_addon2"
  placeholder="Password"
  addon-before="New"
  addon-after="(8+ chars)"
/>
<VfPassword
  name="pwd_addon3"
  placeholder="Password"
  :addon-before="['Set', 'new:']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  pwd_addon1: {
    type: 'password',
    placeholder: 'Password',
    addonBefore: 'Enter:',
  },
  pwd_addon2: {
    type: 'password',
    placeholder: 'Password',
    addonBefore: 'New',
    addonAfter: '(8+ chars)',
  },
  pwd_addon3: {
    type: 'password',
    placeholder: 'Password',
    addonBefore: ['Set', 'new:'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-text-addons -->

<!-- #region usage-element-addons -->

## Element Addons

Addons can also be element schemas (objects), allowing interactive controls like selects or buttons to be embedded alongside the input.

::: usage model

```vue [Preview]
<VfPassword name="pwd_sel" :addon-before="{
  name: 'type',
  type: 'select',
  defaultValue: 'user',
  items: { user: 'User', admin: 'Admin' },
}" />

<VfPassword name="pwd_btn" :addon-after="{
  name: 'generate',
  type: 'button',
  text: 'Generate',
}" />

<VfPassword name="pwd_chk" :addon-before="{
  name: 'remember',
  type: 'checkbox',
  text: 'Save',
}" />

<VfPassword name="pwd_rad" :addon-after="[
  { name: 'simple', type: 'radio', text: 'Simple', radioName: 'strength' },
  { name: 'strong', type: 'radio', text: 'Strong', radioName: 'strength' },
]" />
```

```vue [Template]
<VfPassword
  name="pwd_sel"
  placeholder="Password"
  :addon-before="{
    name: 'type',
    type: 'select',
    defaultValue: 'user',
    items: { user: 'User', admin: 'Admin' },
  }"
/>

<VfPassword
  name="pwd_btn"
  placeholder="Password"
  :addon-after="{
    name: 'generate',
    type: 'button',
    text: 'Generate',
  }"
/>

<VfPassword
  name="pwd_chk"
  placeholder="Password"
  :addon-before="{
    name: 'remember',
    type: 'checkbox',
    text: 'Save',
  }"
/>

<VfPassword
  name="pwd_rad"
  placeholder="Password"
  :addon-after="[
    { name: 'simple', type: 'radio', text: 'Simple', radioName: 'strength' },
    { name: 'strong', type: 'radio', text: 'Strong', radioName: 'strength' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  pwd_sel: {
    type: 'password',
    placeholder: 'Password',
    addonBefore: {
      name: 'type',
      type: 'select',
      defaultValue: 'user',
      items: { user: 'User', admin: 'Admin' },
    },
  },
  pwd_btn: {
    type: 'password',
    placeholder: 'Password',
    addonAfter: {
      name: 'generate',
      type: 'button',
      text: 'Generate',
    },
  },
  pwd_chk: {
    type: 'password',
    placeholder: 'Password',
    addonBefore: {
      name: 'remember',
      type: 'checkbox',
      text: 'Save',
    },
  },
  pwd_rad: {
    type: 'password',
    placeholder: 'Password',
    addonAfter: [
      { name: 'simple', type: 'radio', text: 'Simple', radioName: 'strength' },
      { name: 'strong', type: 'radio', text: 'Strong', radioName: 'strength' },
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

<!-- #endregion usage-element-addons -->

<!-- #region usage-hint-text -->

## Hint Text

The `hint` prop displays advisory text below the input, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Use it to provide contextual guidance to the user.

::: usage

```vue [Preview]
<VfPassword
  name="password"
  hint="At least 8 characters with one uppercase letter."
/>
```

```vue [Template]
<VfPassword
  name="password"
  label="Password"
  placeholder="Enter your password"
  toggle-mask
  hint="At least 8 characters with one uppercase letter."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  password: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    toggleMask: true,
    hint: 'At least 8 characters with one uppercase letter.',
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
<VfPassword
  name="new_password"
  help="Choose a password you haven't used before."
/>
```

```vue [Template]
<VfPassword
  name="new_password"
  label="New Password"
  placeholder="New password"
  toggle-mask
  feedback
  help="Choose a password you haven't used before."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  new_password: {
    type: 'password',
    label: 'New Password',
    placeholder: 'New password',
    toggleMask: true,
    feedback: true,
    help: 'Choose a password you haven\'t used before.',
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
<VfPassword
  name="master_key"
  info="This password cannot be recovered if lost."
/>
```

```vue [Template]
<VfPassword
  name="master_key"
  label="Master Key"
  placeholder="Enter master key"
  toggle-mask
  info="This password cannot be recovered if lost."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  master_key: {
    type: 'password',
    label: 'Master Key',
    placeholder: 'Enter master key',
    toggleMask: true,
    info: 'This password cannot be recovered if lost.',
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

<!-- #region usage-horizontal-label -->

## Horizontal Label

The `columns` prop controls the responsive grid layout. Setting `columns.label` places the label and input side by side in a horizontal arrangement.

::: usage

```vue [Preview]
<VfPassword name="password" label="Password" :columns="{ label: 4 }" />
```

```vue [Template]
<VfPassword
  name="password"
  label="Password"
  placeholder="Enter password"
  toggle-mask
  :columns="{ label: 4 }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  password: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter password',
    toggleMask: true,
    columns: { label: 4 },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-horizontal-label -->

<!-- #region usage-invalid -->

## Invalid

When the `rules` prop is set and validation fails, the input displays an invalid state with error messages below.

::: usage validate

```vue [Preview]
<VfPassword name="password" rules="required" />
```

```vue [Template]
<VfPassword
  name="password"
  label="Password"
  placeholder="Enter your password"
  rules="required"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  password: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    rules: 'required',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-invalid -->

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
| [`type`](!code#props.type "string") | `'password'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Input {#props-password}

| Prop | Default | Description |
| --- | --- | --- |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`defaultValue`](!code#props.defaultValue "T") | — | The default/initial value of the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`readonly`](!code#props.readonly "ConditionalProp<TContext>") | — | Whether the input is read-only. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |

### I18n {#props-i18n}

| Prop | Default | Description |
| --- | --- | --- |
| [`translate`](!code#props.translate "TTranslate \| boolean") | `false` | Whether the element's value is translatable into multiple languages. |
| [`language`](!code#props.language "string") | — | The default selected language. |
| [`languages`](!code#props.languages "LanguagesProp") | — | The available languages for translatable content. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`untrackOn`](!code#props.untrackOn "UntrackOnProp") | — | Controls when the element stops tracking user changes. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfPasswordContext<VfPasswordProps<TTranslate, TLanguages>>) => any") | — | Transforms the element's value when submitting the form. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`rules`](!code#props.rules "TRulesProp<TContext>") | — | Validation rules to apply to the textarea. |
| [`validateOn`](!code#props.validateOn "ElementValidateOnProp") | — | Controls when validation is triggered (e.g. on change, blur, or submit). |
| [`debounce`](!code#props.debounce "number") | — | Delay in milliseconds before processing input. |
| [`bail`](!code#props.bail "boolean") | `true` | Whether to stop validation after the first failing rule. |
| [`ruleMessages`](!code#props.ruleMessages "RuleMessagesProp<TContext>") | — | Custom error messages keyed by validation rule name. |
| [`displayName`](!code#props.displayName "TProp<string, TContext>") | — | The display name used in validation error messages. |
| [`maxErrors`](!code#props.maxErrors "number") | `1` | Maximum number of validation errors to display at once. |
| [`hideErrors`](!code#props.hideErrors "boolean") | `false` | Whether to hide validation error messages. |
| [`showRequired`](!code#props.showRequired "ShowRequiredProp") | — | Where to show required field indicators (e.g. label, placeholder). |
| [`hoist`](!code#props.hoist "boolean") | `false` | Whether to push the element's errors to its nearest ancestor element. |

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
| [`placeholder`](!code#props.placeholder "TProp<string, TContext>") | — | The placeholder text displayed when the element is empty. |
| [`ifta`](!code#props.ifta "TProp") | — | The IFTA (in-field top-aligned) label text for the input. |
| [`floatLabel`](!code#props.floatLabel "TProp") | — | The floating label text displayed inside the input. |
| [`float`](!code#props.float "FloatProp") | — | Floating label behavior mode. |
| [`info`](!code#props.info "TProp") | — | Informational text displayed as a tooltip for the element. |
| [`infoPosition`](!code#props.infoPosition "InfoPositionProp") | — | Position of the info tooltip relative to the info icon. |
| [`tooltip`](!code#props.tooltip "TProp") | — | Tooltip text content for the element. |
| [`tooltipPos`](!code#props.tooltipPos "TooltipPosProp") | — | Position of the tooltip relative to the element. |
| [`addonBefore`](!code#props.addonBefore "AddonProp<TContext>") | — | Content or schema rendered as addons before the input. |
| [`addonAfter`](!code#props.addonAfter "AddonProp<TContext>") | — | Content or schema rendered as addons after the input. |
| [`iconBefore`](!code#props.iconBefore "DProp<string, TContext>") | — | Icon displayed before the input. |
| [`iconAfter`](!code#props.iconAfter "DProp<string, TContext>") | — | Icon displayed after the input. |
| [`loading`](!code#props.loading "ConditionalProp<TContext>") | — | Whether the element is in loading state. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

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

### Accessibility {#props-accessibility}

| Prop | Default | Description |
| --- | --- | --- |
| [`aria`](!code#props.aria "AriaProp") | — | ARIA attributes for accessibility. |

<!-- @endcollapsible -->
<!-- @props-end -->

<!-- @props-adapter-start -->
### PrimeVue {#props-primevue}

<!-- @collapsible -->

#### Unavailable PrimeVue Props {#props-unavailable}

Props that are unavailable because Vueform covers them differently.

| Prop | Description |
| --- | --- |
| [`fluid`](!code#props.fluid "boolean \| undefined") | Use [`columns`](#props.columns) prop instead. |
| [`formControl`](!code#props.formControl "Record<string, any> \| undefined") | Vueform manages form control registration internally. |
| [`invalid`](!code#props.invalid "boolean \| undefined") | Managed automatically by Vueform's validation system. |
| [`type`](!code#props.type "InputTypeHTMLAttribute \| undefined") | Use [`inputType`](#props.inputType) prop instead. |

<!-- @endcollapsible -->

<!-- @collapsible closed -->

#### Unaffected PrimeVue Props {#props-unaffected}

PrimeVue props that work exactly the same — Vueform does not modify them.

| Prop | Description |
| --- | --- |
| [`appendTo`](!code#props.appendTo "HintedString<'body' \| 'self'> \| undefined \| HTMLElement") | A valid query selector or an HTMLElement to specify where the overlay gets attached. |
| [`ariaLabel`](!code#props.ariaLabel "string \| undefined") | Establishes a string value that labels the component. |
| [`ariaLabelledby`](!code#props.ariaLabelledby "string \| undefined") | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| [`autofocus`](!code#props.autofocus "boolean \| undefined") | When present, it specifies that an input element should automatically get focus when the page loads. |
| [`dt`](!code#props.dt "DesignToken<any>") | It generates scoped CSS variables using design tokens for the component. |
| [`feedback`](!code#props.feedback "boolean \| undefined") | Whether to show the strength indicator or not. |
| [`inputClass`](!code#props.inputClass "string \| object \| undefined") | Style class of the input field. |
| [`inputId`](!code#props.inputId "string \| undefined") | Identifier of the underlying input element. |
| [`inputProps`](!code#props.inputProps "InputHTMLAttributes \| undefined") | Used to pass all properties of the HTMLInputElement to the focusable input element inside the component. |
| [`inputStyle`](!code#props.inputStyle "object \| undefined") | Inline style of the input field. |
| [`maskIcon`](!code#props.maskIcon "string \| undefined") | Icon to hide displaying the password as plain text. |
| [`mediumLabel`](!code#props.mediumLabel "string \| undefined") | Text for a medium password. Defaults to PrimeVue Locale configuration. |
| [`mediumRegex`](!code#props.mediumRegex "string \| RegExp \| undefined") | Regex for a medium level password. |
| [`overlayClass`](!code#props.overlayClass "string \| object \| undefined") | Style class of the overlay. |
| [`overlayId`](!code#props.overlayId "string \| undefined") | Identifier of the underlying overlay element. |
| [`overlayProps`](!code#props.overlayProps "HTMLAttributes \| undefined") | Used to pass all properties of the HTMLDivElement to the overlay inside the component. |
| [`overlayStyle`](!code#props.overlayStyle "object \| undefined") | Inline style of the overlay. |
| [`panelClass`](!code#props.panelClass "string \| object \| undefined") | Style class of the overlay panel. |
| [`panelId`](!code#props.panelId "string \| undefined") | Identifier of the underlying overlay panel element. |
| [`panelProps`](!code#props.panelProps "HTMLAttributes \| undefined") | Used to pass all properties of the HTMLDivElement to the overlay panel inside the component. |
| [`panelStyle`](!code#props.panelStyle "object \| undefined") | Inline style of the overlay panel. |
| [`promptLabel`](!code#props.promptLabel "string \| undefined") | Text to prompt password entry. Defaults to PrimeVue Locale configuration. |
| [`pt`](!code#props.pt "PassThrough<PasswordPassThroughOptions>") | Used to pass attributes to DOM elements inside the component. |
| [`ptOptions`](!code#props.ptOptions "PassThroughOptions") | Used to configure passthrough(pt) options of the component. |
| [`required`](!code#props.required "boolean \| undefined") | When present, it specifies that an input field must be filled out before submitting the form. |
| [`showClear`](!code#props.showClear "boolean \| undefined") | When enabled, a clear icon is displayed to clear the value. |
| [`size`](!code#props.size "HintedString<'small' \| 'large'> \| undefined") | Defines the size of the component. |
| [`strongLabel`](!code#props.strongLabel "string \| undefined") | Text for a strong password. Defaults to PrimeVue Locale configuration. |
| [`strongRegex`](!code#props.strongRegex "string \| RegExp \| undefined") | Regex for a strong level password. |
| [`toggleMask`](!code#props.toggleMask "boolean \| undefined") | Whether to show an icon to display the password as plain text. |
| [`unmaskIcon`](!code#props.unmaskIcon "string \| undefined") | Icon to show displaying the password as plain text. |
| [`unstyled`](!code#props.unstyled "boolean") | When enabled, it removes component related styles in the core. |
| [`variant`](!code#props.variant "HintedString<'outlined' \| 'filled'> \| undefined \| null") | Specifies the input variant of the component. |
| [`weakLabel`](!code#props.weakLabel "string \| undefined") | Text for a weak password. Defaults to PrimeVue Locale configuration. |
| [`about`](!code#props.about "string \| undefined") | RDFa: the resource the metadata is about. |
| [`accept`](!code#props.accept "string \| undefined") | A comma-separated list of content types that the server accepts.<br><br>**Usage note:** This attribute has been removed in HTML5 and should no longer be used. Instead, use the [`accept`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) attribute of the specific [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element. |
| [`accesskey`](!code#props.accesskey "string \| undefined") | Provides a hint for generating a keyboard shortcut for the current element. This attribute consists of a space-separated list of characters. The browser should use the first one that exists on the computer keyboard layout. |
| [`alt`](!code#props.alt "string \| undefined") | This attribute defines an alternative text description of the image.<br><br>**Note:** Browsers do not always display the image referenced by the element. This is the case for non-graphical browsers (including those used by people with visual impairments), if the user chooses not to display images, or if the browser cannot display the image because it is invalid or an [unsupported type](#Supported_image_formats). In these cases, the browser may replace the image with the text defined in this element's `alt` attribute. You should, for these reasons and others, provide a useful value for `alt` whenever possible.<br><br>**Note:** Omitting this attribute altogether indicates that the image is a key part of the content, and no textual equivalent is available. Setting this attribute to an empty string (`alt=""`) indicates that this image is _not_ a key part of the content (decorative), and that non-visual browsers may omit it from rendering. |
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
| [`autosave`](!code#props.autosave "string \| undefined") | Non-standard Safari attribute persisting a search field's value across page loads. |
| [`capture`](!code#props.capture "boolean \| 'user' \| 'environment' \| undefined") | Requests media capture (camera/microphone) for file uploads. |
| [`checked`](!code#props.checked "Booleanish \| any[] \| Set<any> \| undefined") | Whether the control is checked. |
| [`color`](!code#props.color "string \| undefined") | Sets the color of the rule through color name or hexadecimal value. |
| [`contenteditable`](!code#props.contenteditable "Booleanish \| 'inherit' \| 'plaintext-only' \| undefined") | An enumerated attribute indicating if the element should be editable by the user. If so, the browser modifies its widget to allow editing. The attribute must take one of the following values:<br><br>*   `true` or the _empty string_, which indicates that the element must be editable; *   `false`, which indicates that the element must not be editable. |
| [`contextmenu`](!code#props.contextmenu "string \| undefined") | The `[**id**](#attr-id)` of a [`<menu>`](https://developer.mozilla.org/docs/Web/HTML/Element/menu "The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.") to use as the contextual menu for this element. |
| [`crossorigin`](!code#props.crossorigin "string \| undefined") | This enumerated attribute indicates whether [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS "CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.") must be used when fetching the resource. [CORS-enabled images](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_Enabled_Image) can be reused in the [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas "Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.") element without being _tainted_. The allowed values are:<br><br>`anonymous`<br><br>A cross-origin request (i.e. with an [`Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin "The Origin request header indicates where a fetch originates from. It doesn't include any path information, but only the server name. It is sent with CORS requests, as well as with POST requests. It is similar to the Referer header, but, unlike this header, it doesn't disclose the whole path.") HTTP header) is performed, but no credential is sent (i.e. no cookie, X.509 certificate, or HTTP Basic authentication). If the server does not give credentials to the origin site (by not setting the [`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin "The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.") HTTP header) the image will be tainted and its usage restricted.<br><br>`use-credentials`<br><br>A cross-origin request (i.e. with an `Origin` HTTP header) is performed along with a credential sent (i.e. a cookie, certificate, and/or HTTP Basic authentication is performed). If the server does not give credentials to the origin site (through [`Access-Control-Allow-Credentials`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials "The Access-Control-Allow-Credentials response header tells browsers whether to expose the response to frontend JavaScript code when the request's credentials mode (Request.credentials) is "include".") HTTP header), the resource will be _tainted_ and its usage restricted.<br><br>If the attribute is not present, the resource is fetched without a [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS "CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.") request (i.e. without sending the `Origin` HTTP header), preventing its non-tainted usage. If invalid, it is handled as if the enumerated keyword **anonymous** was used. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for additional information. |
| [`datatype`](!code#props.datatype "string \| undefined") | RDFa: the datatype of the property's value. |
| [`dir`](!code#props.dir "string \| undefined") | An enumerated attribute indicating the directionality of the element's text. It can have the following values:<br><br>*   `ltr`, which means _left to right_ and is to be used for languages that are written from the left to the right (like English); *   `rtl`, which means _right to left_ and is to be used for languages that are written from the right to the left (like Arabic); *   `auto`, which lets the user agent decide. It uses a basic algorithm as it parses the characters inside the element until it finds a character with a strong directionality, then it applies that directionality to the whole element. |
| [`draggable`](!code#props.draggable "Booleanish \| undefined") | An enumerated attribute indicating whether the element can be dragged, using the [Drag and Drop API](https://developer.mozilla.org/docs/DragDrop/Drag_and_Drop). It can have the following values:<br><br>*   `true`, which indicates that the element may be dragged *   `false`, which indicates that the element may not be dragged. |
| [`enterkeyhint`](!code#props.enterkeyhint "'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send' \| undefined") | An enumerated attribute defining what action label (or icon) to present for the enter key on virtual keyboards. |
| [`enterKeyHint`](!code#props.enterKeyHint "HTMLAttributes['enterkeyhint']") | An enumerated attribute defining what action label (or icon) to present for the enter key on virtual keyboards. |
| [`exportparts`](!code#props.exportparts "string") | Used to transitively export shadow parts from a nested shadow tree into a containing light tree. |
| [`form`](!code#props.form "string \| undefined") | The form element, if any, that the object element is associated with (its _form owner_). The value of the attribute must be an ID of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element in the same document. |
| [`formaction`](!code#props.formaction "string \| undefined") | The URI of a program that processes the information submitted by the button. If specified, it overrides the [`action`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-action) attribute of the button's form owner. |
| [`formenctype`](!code#props.formenctype "string \| undefined") | If the button is a submit button, this attribute specifies the type of content that is used to submit the form to the server. Possible values are:<br><br>*   `application/x-www-form-urlencoded`: The default value if the attribute is not specified. *   `multipart/form-data`: Use this value if you are using an [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element with the [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type) attribute set to `file`. *   `text/plain`<br><br>If this attribute is specified, it overrides the [`enctype`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-enctype) attribute of the button's form owner. |
| [`formmethod`](!code#props.formmethod "string \| undefined") | If the button is a submit button, this attribute specifies the HTTP method that the browser uses to submit the form. Possible values are:<br><br>*   `post`: The data from the form are included in the body of the form and sent to the server. *   `get`: The data from the form are appended to the **form** attribute URI, with a '?' as a separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.<br><br>If specified, this attribute overrides the [`method`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-method) attribute of the button's form owner. |
| [`formnovalidate`](!code#props.formnovalidate "Booleanish \| undefined") | If the button is a submit button, this Boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the [`novalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-novalidate) attribute of the button's form owner. |
| [`formtarget`](!code#props.formtarget "string \| undefined") | If the button is a submit button, this attribute is a name or keyword indicating where to display the response that is received after submitting the form. This is a name of, or keyword for, a _browsing context_ (for example, tab, window, or inline frame). If this attribute is specified, it overrides the [`target`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-target) attribute of the button's form owner. The following keywords have special meanings:<br><br>*   `_self`: Load the response into the same browsing context as the current one. This value is the default if the attribute is not specified. *   `_blank`: Load the response into a new unnamed browsing context. *   `_parent`: Load the response into the parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`. *   `_top`: Load the response into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`. |
| [`height`](!code#props.height "Numberish \| undefined") | The intrinsic height of the image in pixels. |
| [`hidden`](!code#props.hidden "Booleanish \| '' \| 'hidden' \| 'until-found' \| undefined") | A Boolean attribute indicates that the element is not yet, or is no longer, _relevant_. For example, it can be used to hide elements of the page that can't be used until the login process has been completed. The browser won't render such elements. This attribute must not be used to hide content that could legitimately be shown. |
| [`indeterminate`](!code#props.indeterminate "boolean \| undefined") | Sets the checkbox's indeterminate visual state. |
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
| [`list`](!code#props.list "string \| undefined") | The id of a datalist element providing predefined options. |
| [`max`](!code#props.max "Numberish \| undefined") | This attribute describes how much work the task indicated by the `progress` element requires. The `max` attribute, if present, must have a value greater than zero and be a valid floating point number. The default value is 1. |
| [`maxlength`](!code#props.maxlength "Numberish \| undefined") | The maximum number of characters (unicode code points) that the user can enter. If this value isn't specified, the user can enter an unlimited number of characters. |
| [`min`](!code#props.min "Numberish \| undefined") | The lower numeric bound of the measured range. This must be less than the maximum value (`max` attribute), if specified. If unspecified, the minimum value is 0. |
| [`minlength`](!code#props.minlength "Numberish \| undefined") | The minimum number of characters (unicode code points) required that the user should enter. |
| [`multiple`](!code#props.multiple "Booleanish \| undefined") | This Boolean attribute indicates that multiple options can be selected in the list. If it is not specified, then only one option can be selected at a time. When `multiple` is specified, most browsers will show a scrolling list box instead of a single line dropdown. |
| [`onAbort`](!code#props.onAbort "(payload: UIEvent) => void") | The loading of a resource has been aborted. |
| [`onAnimationcancel`](!code#props.onAnimationcancel "(payload: AnimationEvent) => void") | Handler for the native `animationcancel` event. |
| [`onAnimationend`](!code#props.onAnimationend "(payload: AnimationEvent) => void") | Handler for the native `animationend` event. |
| [`onAnimationiteration`](!code#props.onAnimationiteration "(payload: AnimationEvent) => void") | Handler for the native `animationiteration` event. |
| [`onAnimationstart`](!code#props.onAnimationstart "(payload: AnimationEvent) => void") | Handler for the native `animationstart` event. |
| [`onAuxclick`](!code#props.onAuxclick "(payload: PointerEvent) => void") | Handler for the native `auxclick` event. |
| [`onBeforeinput`](!code#props.onBeforeinput "(payload: InputEvent) => void") | Handler for the native `beforeinput` event. |
| [`onBeforetoggle`](!code#props.onBeforetoggle "(payload: ToggleEvent) => void") | Handler for the native `beforetoggle` event. |
| [`onBlur`](!code#props.onBlur "(payload: FocusEvent) => void") | An element has lost focus (does not bubble). |
| [`onCancel`](!code#props.onCancel "(payload: Event) => void") | Handler for the native `cancel` event. |
| [`onCanplay`](!code#props.onCanplay "(payload: Event) => void") | The user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content. |
| [`onCanplaythrough`](!code#props.onCanplaythrough "(payload: Event) => void") | The user agent can play the media up to its end without having to stop for further buffering of content. |
| [`onChange`](!code#props.onChange "(payload: Event) => void") | The change event is fired for <input>, <select>, and <textarea> elements when a change to the element's value is committed by the user. |
| [`onClick`](!code#props.onClick "(payload: PointerEvent) => void") | A pointing device button has been pressed and released on an element. |
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
| [`onFocus`](!code#props.onFocus "(payload: FocusEvent) => void") | An element has received focus (does not bubble). |
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
| [`pattern`](!code#props.pattern "string \| undefined") | A regular expression the value must match to be valid. |
| [`prefix`](!code#props.prefix "string \| undefined") | RDFa: prefix mappings for CURIE terms. |
| [`property`](!code#props.property "string \| undefined") | RDFa: the property relating the subject to the value. |
| [`radiogroup`](!code#props.radiogroup "string \| undefined") | The radio group a command of type radio belongs to. |
| [`resource`](!code#props.resource "string \| undefined") | RDFa: the resource the property refers to. |
| [`results`](!code#props.results "Numberish \| undefined") | Non-standard Safari attribute limiting the number of recent-search entries shown in a search field. |
| [`role`](!code#props.role "string \| undefined") | The element's ARIA role, defining its purpose for assistive technologies. |
| [`security`](!code#props.security "string \| undefined") | Non-standard legacy attribute (Internet Explorer) controlling script security in a frame. |
| [`spellcheck`](!code#props.spellcheck "Booleanish \| undefined") | An enumerated attribute defines whether the element may be checked for spelling errors. It may have the following values:<br><br>*   `true`, which indicates that the element should be, if possible, checked for spelling errors; *   `false`, which indicates that the element should not be checked for spelling errors. |
| [`src`](!code#props.src "string \| undefined") | The image URL. This attribute is mandatory for the `<img>` element. On browsers supporting `srcset`, `src` is treated like a candidate image with a pixel density descriptor `1x` unless an image with this pixel density descriptor is already defined in `srcset,` or unless `srcset` contains '`w`' descriptors. |
| [`step`](!code#props.step "Numberish \| undefined") | The stepping interval for numeric and date-time values. |
| [`style`](!code#props.style "StyleValue \| undefined") | Contains [CSS](https://developer.mozilla.org/docs/Web/CSS) styling declarations to be applied to the element. Note that it is recommended for styles to be defined in a separate file or files. This attribute and the [`<style>`](https://developer.mozilla.org/docs/Web/HTML/Element/style "The HTML <style> element contains style information for a document, or part of a document.") element have mainly the purpose of allowing for quick styling, for example for testing purposes. |
| [`tabindex`](!code#props.tabindex "Numberish \| undefined") | An integer attribute indicating if the element can take input focus (is _focusable_), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values:<br><br>*   a _negative value_ means that the element should be focusable, but should not be reachable via sequential keyboard navigation; *   `0` means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention; *   a _positive value_ means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the [**tabindex**](#attr-tabindex). If several elements share the same tabindex, their relative order follows their relative positions in the document. |
| [`title`](!code#props.title "string \| undefined") | Contains a text representing advisory information related to the element it belongs to. Such information can typically, but not necessarily, be presented to the user as a tooltip. |
| [`typeof`](!code#props.typeof "string \| undefined") | RDFa: the RDF types of the subject. |
| [`unselectable`](!code#props.unselectable "'on' \| 'off' \| undefined") | Non-standard legacy attribute (Internet Explorer/Opera) preventing text selection. |
| [`value`](!code#props.value "any") | The value of the control. |
| [`vocab`](!code#props.vocab "string \| undefined") | RDFa: the default vocabulary for property and typeof terms. |
| [`width`](!code#props.width "Numberish \| undefined") | Sets the length of the rule on the page through a pixel or percentage value. |

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

### Password {#section-password}

| Name | Description |
| --- | --- |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`translateAddon`](!code#context.translateAddon "AddonSchema") | Schema for the language selector addon rendered in translatable mode. |
| [`validation`](!code#context.validation "ShallowReactive<Record<string, ValidationView>>") | Per-language validation views keyed by language (`default` for non-translatable elements). |
| [`currentValidation`](!code#context.currentValidation "ValidationView") | The validation view of the active language (`default` when the element is not translatable). |
| [`validator`](!code#context.validator "Validator") | The validator instance the element is registered with: the form's validator, a store-attached one, or a newly created one. |
| [`shouldValidate`](!code#context.shouldValidate "boolean") | Whether the element should validate live on user input, per the `validateOn` policy and the form's state. |
| [`onUserInput()`](!code#context.onUserInput "() => void") | Validates the element on user input when the live-validation policy allows it. |
| [`isFlatContainer`](!code#context.isFlatContainer "boolean") | Whether the element's data is flattened into the parent container rather than nested under its own `name` key. |
| [`containerModel`](!code#context.containerModel "unknown") | The model ref the element provides to its children via the container context: the parent's model for flat containers, the element's own `model` otherwise. |
| [`handleModelUpdate()`](!code#context.handleModelUpdate "(data: Event) => void") | Handles a native input event and updates the model from the event target. |
| [`initValidation()`](!code#context.initValidation "() => void") | Registers the element with the validator and compiles its rules. |
| [`destroyValidation()`](!code#context.destroyValidation "() => void") | Unregisters the element from the validator and clears its validation views. |
| [`rootModel`](!code#context.rootModel "RootModel \| undefined") | The root model backing the form when this element operates as the form root, `undefined` for every other element. |
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. |
| [`setInputRef()`](!code#context.setInputRef "(el: any) => void") | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `input` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref. |
| [`canonicalDomValue`](!code#context.canonicalDomValue "boolean") | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value adoption and the DOM recovery listeners. |
| [`inputBindings`](!code#context.inputBindings "object") | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners. |
| [`componentBindings`](!code#context.componentBindings "object") | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur. |

### Data {#section-data}

| Name | Description |
| --- | --- |
| [`model`](!code#context.model "Record<string, any> \| any") | The element's reactive model value within the form data tree. |
| [`value`](!code#context.value "any") | The current language-aware value of the element. For translatable elements, returns the value for the active language. |
| [`payload`](!code#context.payload "object") | The element's submission payload. Container elements aggregate from children; leaf elements return their own value. |
| [`nullValue`](!code#context.nullValue "any") | The value the element holds when it is considered empty. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel "Record<string, any> \| any") | A snapshot of the model at initialization time, used for dirty checking and reset. |
| [`dataPath`](!code#context.dataPath "string") | The dot-notation path to this element's value within the form data object (e.g. `"address.city"`). Empty string for the root model. Flat containers inherit their parent's data path. |
| [`tracking`](!code#context.tracking "boolean") | Whether the element's `default` expression is currently tracked and auto-updating the value. |
| [`update()`](!code#context.update "(data: any) => void") | Updates the element's model value. Container elements perform a deep merge; leaf elements set the value directly. |
| [`load()`](!code#context.load "(data: any) => void") | Loads data into the element and fires the `load` event, cascading to all children. |
| [`reset()`](!code#context.reset "() => void") | Resets the element to its initial model state and fires the `reset` event. |
| [`clear()`](!code#context.clear "() => void") | Clears the element to its null value and fires the `clear` event. |
| [`track()`](!code#context.track "() => void") | Resumes expression tracking after an untrack, immediately re-writing the resolved value. |
| [`untrack()`](!code#context.untrack "() => void") | Stops expression tracking, leaving the current value in place. |
| [`reinit()`](!code#context.reinit "() => void") | Reinitializes the element by rebuilding both its model registration and validation instances. |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`visible`](!code#context.visible "boolean") | Whether the element is currently visible, based on availability, container visibility, and pager state. |
| [`available`](!code#context.available "boolean") | Whether the element is available (not hidden by conditional logic). |
| [`disabled`](!code#context.disabled "boolean") | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`readonly`](!code#context.readonly "boolean") | Whether the element is readonly, resolved from the prop, form-level setting, or conditional logic. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`focused`](!code#context.focused "boolean") | Whether the element is currently focused. |
| [`touched`](!code#context.touched "boolean") | Whether the element has been touched (blurred) by the user. |
| [`visited`](!code#context.visited "boolean") | Whether the element has been visited (focused) by the user. |
| [`dirty`](!code#context.dirty "boolean") | Whether the current model value differs from the initial model value. |
| [`loading`](!code#context.loading "boolean") | Whether the element is in a loading state, true when pending, explicitly set to loading, or resolved via conditions. |
| [`empty`](!code#context.empty "boolean") | Whether the element's current value is empty. Container elements check whether all children are empty. |
| [`busy`](!code#context.busy "boolean") | Whether the element is busy, meaning it is either debouncing or has pending async validation. |
| [`hoisted`](!code#context.hoisted "boolean \| undefined") | Whether this element pushes its errors to its nearest ancestor element instead of displaying and reporting them itself. |
| [`enable()`](!code#context.enable "() => void") | Programmatically enables the element. |
| [`disable()`](!code#context.disable "() => void") | Programmatically disables the element. |

### Validation {#section-validation}

| Name | Description |
| --- | --- |
| [`invalid`](!code#context.invalid "boolean") | Whether any of the element's validations (across all languages) are currently invalid, including children. |
| [`validated`](!code#context.validated "boolean") | Whether all of the element's validations (across all languages) have been executed, including children. |
| [`completed`](!code#context.completed "boolean") | Whether the element is completed, meaning it either has no rules or has been validated without errors. |
| [`success`](!code#context.success "boolean") | Whether the element has been validated and passed (always `true` for elements without own rules), once touched. |
| [`pending`](!code#context.pending "boolean") | Whether any of the element's validations are currently pending an async check, including children. |
| [`debouncing`](!code#context.debouncing "boolean") | Whether any of the element's validations are currently debouncing, including children. |
| [`errors`](!code#context.errors "any[]") | All error messages for this element: its own plus any pushed up by hoisted children. |
| [`hasError`](!code#context.hasError "boolean") | Whether the element has any active error messages. |
| [`displayErrors`](!code#context.displayErrors "any[]") | The error messages rendered for this element. Empty when the element pushes its errors to its parent; otherwise errors capped by `maxErrors`. |
| [`ownErrors`](!code#context.ownErrors "string[]") | The element's own error messages (validation rules plus custom message bag entries). |
| [`formErrors`](!code#context.formErrors "object") | Error messages propagated to the form, keyed by element path. Empty when the element pushes its errors to its parent. |
| [`messages`](!code#context.messages "string[]") | The list of custom messages from the message bag, including messages from hoisted children. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for custom errors and messages. |
| [`required`](!code#context.required "boolean") | Whether the element is required by its current validation rules. |
| [`genericName`](!code#context.genericName "string") | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop. |
| [`validate()`](!code#context.validate "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Runs validation on the element's own rules and all children, returning whether everything is valid. |
| [`validateSelf()`](!code#context.validateSelf "() => Promise<boolean>") | Validates the element's own rules (without children), resolving with the result. |
| [`validateChildren()`](!code#context.validateChildren "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Validates stateful children, returning whether all are valid. By default only incomplete children run. |
| [`validateCurrent()`](!code#context.validateCurrent "() => Promise<boolean>") | Validates only the active language's value of the element. |
| [`invalidate()`](!code#context.invalidate "() => void") | Marks all validation instances as invalidated, requiring revalidation. |
| [`unvalidate()`](!code#context.unvalidate "() => void") | Resets all validation state, including children's. |
| [`filled()`](!code#context.filled "(value: any) => boolean") | Checks whether a value is considered filled. |
| [`clean()`](!code#context.clean "() => void") | Marks the element as clean by updating the initial model snapshot. |
| [`clearErrors()`](!code#context.clearErrors "() => void") | Clears all error messages from the message bag. |
| [`clearMessages()`](!code#context.clearMessages "() => void") | Clears all custom messages from the message bag. |
| [`clearMessageBag()`](!code#context.clearMessageBag "() => void") | Clears the entire message bag, removing both errors and messages. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`input`](!code#context.input "any") | Ref to the underlying input element. |
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`placeholder`](!code#context.placeholder "string \| (string & {}) \| undefined") | The resolved placeholder text, supporting static strings and dynamic text props. |
| [`page`](!code#context.page "PageProp \| undefined") | Page metadata for stepped/tabbed forms. |
| [`addonable`](!code#context.addonable "true") | Whether this element supports before/after addons. |
| [`addonsBefore`](!code#context.addonsBefore "AddonItem[]") | Array of resolved before-addons, each an individual `AddonItem` for `VfAddon`. |
| [`addonsAfter`](!code#context.addonsAfter "AddonItem[]") | Array of resolved after-addons, each an individual `AddonItem` for `VfAddon`. |
| [`iconBefore`](!code#context.iconBefore "string \| undefined") | The resolved CSS class string for the icon displayed before the input. |
| [`iconAfter`](!code#context.iconAfter "string \| undefined") | The resolved CSS class string for the icon displayed after the input. |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
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

### Internationalization {#section-i18n}

| Name | Description |
| --- | --- |
| [`language`](!code#context.language "string") | The currently active language for translatable elements. |
| [`languages`](!code#context.languages "ResolvedLanguagesProp") | Resolved map of available languages for translatable elements. |
| [`languageId`](!code#context.languageId "string \| undefined") | Unique DOM id for the language indicator element. |
| [`translatable`](!code#context.translatable "boolean") | Whether the element is in translatable (multilingual) mode. |

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleInput()`](!code#context.handleInput "(payload: any, e: Event \| undefined) => void") | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it.<br><br>Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends.<br><br>The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only adopted while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
| [`handleKeydown()`](!code#context.handleKeydown "(e: Event) => any") | Fires the keydown event on the element. |
| [`handleKeyup()`](!code#context.handleKeyup "(e: Event) => any") | Fires the keyup event on the element. |
| [`handleKeypress()`](!code#context.handleKeypress "(e: Event) => any") | Fires the keypress event on the element. |
| [`handleBlur()`](!code#context.handleBlur "(e: Event) => void") | Fires the blur event on the element. |
| [`handleFocus()`](!code#context.handleFocus "(e: Event) => void") | Handles focus by setting the focused state and firing the focus event. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | A unique auto-generated identifier for the element. |
| [`aria`](!code#context.aria "object") | Computed ARIA attributes including language-aware describedby and lang. |
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
| `change` | [`newValue`](!code#events.change.newValue "T"), [`oldValue`](!code#events.change.oldValue "T"), [`context$`](!code#events.change.context$ "TContext") | Emitted when the element value changes. |
| `valueChange` | [`value`](!code#events.valueChange.value "string"), [`context$`](!code#events.valueChange.context$ "VfPasswordContext<VfPasswordProps<TTranslate, TLanguages>>") | Emitted when the value changes in uncontrolled mode. |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "T") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "T"), [`context$`](!code#events.load.context$ "TContext") | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the element is reset to its default value. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the element's value is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the element becomes invalid. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the element becomes valid after having been invalid. |
| `input` | [`value`](!code#events.input.value "V"), [`e`](!code#events.input.e "Event \| undefined"), [`context$`](!code#events.input.context$ "TContext") | Emitted when the input value is changed via the UI by the user. |
| `keydown` | [`event`](!code#events.keydown.event "Event"), [`context$`](!code#events.keydown.context$ "TContext") | Emitted on keydown, passes the keyboard event and component context. |
| `keyup` | [`event`](!code#events.keyup.event "Event"), [`context$`](!code#events.keyup.context$ "TContext") | Emitted on keyup, passes the keyboard event and component context. |
| `keypress` | [`event`](!code#events.keypress.event "Event"), [`context$`](!code#events.keypress.context$ "TContext") | Emitted on keypress, passes the keyboard event and component context. |
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
| `ifta` | [`ifta`](!code#slot.ifta.ifta "string") | Slot for customizing the IFTA label content. |
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `floatLabel` | [`floatLabel`](!code#slot.floatLabel.floatLabel "string") | Slot for customizing the floating label content. |
| `addonBefore` | [`addonBefore`](!code#slot.addonBefore.addonBefore "AddonProp \| undefined") | Slot that replaces the before-addons section. |
| `addonAfter` | [`addonAfter`](!code#slot.addonAfter.addonAfter "AddonProp \| undefined") | Slot that replaces the after-addons section. |
| `iconBefore` | [`iconBefore`](!code#slot.iconBefore.iconBefore "string \| undefined") | Slot that replaces the icon rendered before the input. |
| `iconAfter` | [`iconAfter`](!code#slot.iconAfter.iconAfter "string \| undefined") | Slot that replaces the icon rendered after the input. |
| `language` | [`language`](!code#slot.language.language "string") [`languages`](!code#slot.language.languages "LanguagesProp") | Slot that replaces the language selector rendering. |
| `content` | — | Custom content template. |
| `header` | — | Custom header template. |
| `footer` | — | Custom footer template. |
| `clearicon` | [`clearCallback`](!code#slot.clearicon.clearCallback "(event: Event) => void") | Custom clear icon template. |
| `hideicon` | [`toggleCallback`](!code#slot.hideicon.toggleCallback "() => void") | Custom mask icon template. |
| `maskicon` | [`toggleCallback`](!code#slot.maskicon.toggleCallback "() => void") | Custom hide icon template. |
| `showicon` | [`toggleCallback`](!code#slot.showicon.toggleCallback "() => void") | Custom unmask icon template. |
| `unmaskicon` | [`toggleCallback`](!code#slot.unmaskicon.toggleCallback "() => void") | Custom unmask icon template. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts component="VfPassword"
:examples="{
default: 'Default',
float: 'Float Label',
ifta: 'Ifta',
icons: 'Icons',
addons: 'Addons',
mix: 'Mix',
}"
:schema="{
label: 'Password',
help: 'At least 8 characters with a number and a symbol',
hint: 'This will be used to sign in',
info: 'Stored encrypted, never in plain text',
rules: 'required',
showRequired: ['label'],
defaultValue: 'Tr0ub4dor&3',
onMounted: ({ messageBag }) => {
messageBag.append('This password appeared in a data breach', 'error')
messageBag.append('Strong password', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfPassword
      name="default"
      v-bind="schema"
    />
</template>
<template #example-float="{ schema }">
<VfPassword
      name="float"
      v-bind="schema"
      float-label="Password"
      float="on"
    />
</template>
<template #example-ifta="{ schema }">
<VfPassword
      name="ifta"
      v-bind="schema"
      ifta="Password"
    />
</template>
<template #example-icons="{ schema }">
<VfPassword
      name="icons"
      v-bind="schema"
      icon-before="lock"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfPassword
      name="addons"
      v-bind="schema"
      addon-before="New"
      addon-after="(8+ chars)"
    />
</template>
<template #example-mix="{ schema }">
<VfPassword
      name="mix"
      v-bind="schema"
      addon-before="New"
      icon-after="lock"
      float-label="Password"
      float="on"
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
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-password` `.vf-align-label?` |

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

### `input`

The password input element.

| | |
| --- | --- |
| **Element** | [`<Password>`](https://primevue.org/password/) |

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

### `addonBefore`

An individual addon rendered before the input.

| | |
| --- | --- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `addonAfter`

An individual addon rendered after the input.

| | |
| --- | --- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `addonGroup`

The addon group wrapper element.

| | |
| --- | --- |
| **Element** | `<div>` |

### `iconBefore`

The icon rendered before the input.

| | |
| --- | --- |
| **Element** | [`<VfIcon>`](./VfIcon.md) |

### `iconAfter`

The icon rendered after the input.

| | |
| --- | --- |
| **Element** | [`<VfIcon>`](./VfIcon.md) |

### `iconGroup`

The wrapper element grouping icons and the input.

| | |
| --- | --- |
| **Element** | `<div>` |

### `language`

The language selector addon rendered alongside the input.

| | |
| --- | --- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `floatWrapper`

The PrimeVue FloatLabel wrapper around the input.

| | |
| --- | --- |
| **Element** | [`<FloatLabel>`](https://primevue.org/floatlabel/) |

### `float`

The label tag inside PrimeVue FloatLabel.

| | |
| --- | --- |
| **Element** | `<label>` |

### `iftaWrapper`

The PrimeVue IftaLabel wrapper around the input.

| | |
| --- | --- |
| **Element** | [`<IftaLabel>`](https://primevue.org/iftalabel/) |

### `ifta`

The label tag inside PrimeVue IftaLabel.

| | |
| --- | --- |
| **Element** | `<label>` |

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
