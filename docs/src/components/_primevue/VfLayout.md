# VfLayout

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
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
| [`label`](!code#props.label "boolean") | `false` | Whether to render the element's label tag. |
| [`loading`](!code#props.loading "boolean") | `false` | Whether to render loading icon when available. |
| [`addons`](!code#props.addons "boolean") | `false` | Whether to render addons when available. |

### I18n {#props-i18n}

| Prop | Default | Description |
| --- | --- | --- |
| [`languages`](!code#props.languages "boolean") | `false` | Whether to render langauges selector when available. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`hideErrors`](!code#props.hideErrors "boolean") | `false` | Whether to hide validation error messages for this element. |

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
| [`useLabelTag`](!code#context.useLabelTag "boolean") | Whether to render a `<label>` tag for the element. Extends the base so it also returns `false` when a floating or IFTA label is active and the input wrapper's label is the only one with `for`. |
| [`tags`](!code#context.tags "object") | Merged translation tags from the active locale and the fallback locale. |
| [`elementSlots`](!code#context.elementSlots "any") | The host element's resolved outlets (`el$.outlets`). |
| [`pager`](!code#context.pager "any") | The pager of the element's container, if any.<br><br>Always a `Ref` (never `Ref \| undefined`) so `ContextOf` / `slotContext` unwrap agree — `UnwrapTopLevelRef` does not peel `Ref \| undefined`. |
| [`infoTooltipArg`](!code#context.infoTooltipArg "object") | Argument object for the PrimeVue tooltip directive on the info icon. |
| [`isLoading`](!code#context.isLoading "boolean") | Whether the element is currently in a loading state that should show a spinner (respects an explicit `loading: false` prop override). |
| [`hasIcons`](!code#context.hasIcons "boolean") | Whether the content needs an IconField wrapper (an icon on either side or a loading spinner). |
| [`hasLanguageAddon`](!code#context.hasLanguageAddon "any") | Whether a language addon should be rendered (translate mode or a custom language slot). |
| [`renderGroup`](!code#context.renderGroup "any") | Whether an InputGroup wrapper is rendered around the content. |
| [`hasFloat`](!code#context.hasFloat "boolean") | Whether a PrimeVue FloatLabel wrapper is active. |
| [`hasIfta`](!code#context.hasIfta "boolean") | Whether a PrimeVue IftaLabel wrapper is active. |
| [`hasLabelWrapper`](!code#context.hasLabelWrapper "boolean") | Whether either a FloatLabel or IftaLabel wrapper is rendered. |
| [`rootProps`](!code#context.rootProps "any") | Props for the passthrough root `<div>` rendered when the element has `layout: false`, or `undefined` when no root wrapper is needed. |
| [`languageOptions`](!code#context.languageOptions "object") | Options for the language Select rendered in the translate addon. |
| [`resolveAddonParts()`](!code#context.resolveAddonParts "(part: unknown, addon: any, i: string \| number) => any") | Resolves per-addon parts that may be defined as a function of the addon and its index. |
| [`setLanguage()`](!code#context.setLanguage "(val: string) => void") | Updates the element's active language. |
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
| `label` | [`label`](!code#slot.label.label "string") | Slot for customizing the element's label content. |
| `required` | — | Slot for customizing the required indicator. |
| `info` | [`info`](!code#slot.info.info "string") | Slot for customizing the info tooltip or helper content. |
| `ifta` | [`ifta`](!code#slot.ifta.ifta "string") | Slot for customizing the IFTA label content. |
| `tabs` | [`pager`](!code#slot.tabs.pager "Pager") [`class`](!code#slot.tabs.class "ClassValue") | Slot that replaces the tabs navigation bar. Receives the pager instance. |
| `tab` | [`page`](!code#slot.tab.page "ResolvedPage") [`class`](!code#slot.tab.class "ClassValue") | Slot that replaces each individual tab. |
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `default` | — | Slot for the element's default content. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `floatLabel` | [`floatLabel`](!code#slot.floatLabel.floatLabel "string") | Slot for customizing the floating label content. |
| `addonBefore` | [`addonBefore`](!code#slot.addonBefore.addonBefore "AddonProp \| undefined") | Slot that replaces the before-addons section. |
| `addonAfter` | [`addonAfter`](!code#slot.addonAfter.addonAfter "AddonProp \| undefined") | Slot that replaces the after-addons section. |
| `iconBefore` | [`iconBefore`](!code#slot.iconBefore.iconBefore "string \| undefined") | Slot that replaces the icon rendered before the input. |
| `iconAfter` | [`iconAfter`](!code#slot.iconAfter.iconAfter "string \| undefined") | Slot that replaces the icon rendered after the input. |
| `language` | [`language`](!code#slot.language.language "string") [`languages`](!code#slot.language.languages "LanguagesProp") | Slot that replaces the language selector rendering. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->
<VPParts component="VfLayout" :examples="{ default: 'Default' }">
  <template #example-default>
    Example
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
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` |

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

### `addonGroup`

The PrimeVue InputGroup wrapping addons and the input.

| | |
| --- | --- |
| **Element** | [`<InputGroup>`](https://primevue.org/inputgroup/) |

### `languageAddon`

The PrimeVue InputGroupAddon wrapping the language selector.

| | |
| --- | --- |
| **Element** | [`<InputGroupAddon>`](https://primevue.org/inputgroupaddon/) |

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

### `tabs`

Props forwarded to the nested TabList component.

| | |
| --- | --- |
| **Element** | [`<TabList>`](https://primevue.org/tablist/) |

### `tab`

Props forwarded to each nested Tab component.

| | |
| --- | --- |
| **Element** | [`<Tab>`](https://primevue.org/tab/) |

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

All the CSS variables that control this component's appearance with default values in the default theme. See [Themes & Tokens](/guide/themes-tokens#component-tokens) for details.

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
