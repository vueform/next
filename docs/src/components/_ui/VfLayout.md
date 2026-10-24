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
| [`label`](!code#props.label "boolean") | — | Whether to render the element's label tag. |
| [`loading`](!code#props.loading "boolean") | — | Whether to render loading icon when available. |
| [`addons`](!code#props.addons "boolean") | — | Whether to render addons when available. |

### I18n {#props-i18n}

| Prop | Default | Description |
| --- | --- | --- |
| [`languages`](!code#props.languages "boolean") | — | Whether to render langauges selector when available. |

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
| [`tokens`](!code#context.tokens "CSSProperties") | Reactive inline style object with resolved theme token CSS custom properties. |
| [`tokenClass`](!code#context.tokenClass "string") | A unique CSS class scoped to this component instance, used to target the injected token style rule. |
| [`tokenCss`](!code#context.tokenCss "string") | The CSS text for scoped token custom properties on this component instance — a base rule plus a browser-resolved dark-mode block, so the text is identical between server and client renders. |
| [`nonce`](!code#context.nonce "string \| undefined") | Unique security nonce for injecting scoped styles. |
| [`showErrors`](!code#context.showErrors "boolean") | Whether to display validation error messages for this element. |
| [`el$`](!code#context.el$ "any") | The parent element's component context. |
| [`outlets`](!code#context.outlets "object") | Outlets with `template` resolved from the element's `layout` prop when set, otherwise from the standard template/config resolution. A string `layout` is a registered component name and goes through `$security.allowComponents` like any other name string; a rejected one falls back to the standard resolution. |
| [`isContainer`](!code#context.isContainer "boolean") | Whether the element is a container-type element (e.g. group, list). |
| [`isFieldset`](!code#context.isFieldset "boolean") | Whether the element should render as a `<fieldset>` with a legend. |
| [`hasPager`](!code#context.hasPager "any") | Whether the element's container has an active pager for pagination. |
| [`showLabel`](!code#context.showLabel "boolean") | Whether the element's label is visible. |
| [`showSrLabel`](!code#context.showSrLabel "boolean") | Whether to render a screen-reader-only label for the element. |
| [`showPhLabel`](!code#context.showPhLabel "boolean") | Whether to render a placeholder label for horizontal layout alignment. |
| [`showRequired`](!code#context.showRequired "any") | Whether to display the required indicator alongside the label. |
| [`columnClasses`](!code#context.columnClasses "object") | The resolved responsive CSS classes for each column section (container, label, group, wrapper). |
| [`useLabelTag`](!code#context.useLabelTag "boolean") | Whether to render a `<label>` tag for the element. |
| [`headingTag`](!code#context.headingTag "`h${any}` \| undefined") | The tag to use for the label when a heading level is set on a container element (e.g. `'h1'`–`'h6'`), or `undefined` when no heading is active. |
| [`showHelp`](!code#context.showHelp "boolean") | Whether the element's help text is visible. |
| [`showDescription`](!code#context.showDescription "boolean") | Whether the element's description text is visible. |
| [`withDefaultProps()`](!code#context.withDefaultProps "(target: string, base: Record<string, any> \| undefined) => any") | Merges element-level default props into a target sub-component's props. |
| [`helperClasses()`](!code#context.helperClasses "(key: string) => string \| null") | Returns the CSS helper class for a given key, if class helpers are enabled. |

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
| `tabs` | [`pager`](!code#slot.tabs.pager "Pager") [`bindings`](!code#slot.tabs.bindings "PartBindings<'tabs', TabbedParts>") | Slot for customizing the tab navigation bar. |
| `tab` | [`index`](!code#slot.tab.index "number") [`label`](!code#slot.tab.label "string") [`meta`](!code#slot.tab.meta "Record<string, any>") [`selected`](!code#slot.tab.selected "boolean") [`invalid`](!code#slot.tab.invalid "boolean") [`loading`](!code#slot.tab.loading "boolean") [`el$`](!code#slot.tab.el$ "UnknownElement") [`bindings`](!code#slot.tab.bindings "PartBindings<'tab', VfTabsParts, VfTabsBindings>") | Slot for customizing an individual tab button. |
| `default` | — | Slot for the element's default content. |
<!-- @slots-end -->
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
   * Element tokens
   * -------------------------------------------------------------------------- */
  --vf-label-font-size: 1rem;
  --vf-label-font-weight: 600;
  --vf-label-group-h-padding: calc(var(--vf-py) + var(--vf-border-width-t)) 0 0 0;

  --vf-input-border-width-l: var(--vf-border-width-l);

  --vf-icon-font-size: 0.875rem;
  --vf-icon-group-color: inherit;
  --vf-icon-group-color-danger: var(--vf-color-danger);
  --vf-icon-group-width: 2.5rem;

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
   * Semantic tokens
   * -------------------------------------------------------------------------- */
  --vf-icon-height: 0.75rem;
  --vf-icon-width: 0.75rem;

  /**
   * Primitives tokens
   * -------------------------------------------------------------------------- */
  --vf-space-1: 1rem;
  --vf-space-2: 2rem;
  --vf-space-3: 3rem;

  --vf-icon-loading: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6.5' fill='none' stroke='currentColor' stroke-width='1.5' stroke-dasharray='30.6 10.2' stroke-linecap='round'/%3E%3C/svg%3E");
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Element tokens
   * -------------------------------------------------------------------------- */
  labelFontSize: '1rem',
  labelFontWeight: '600',
  labelGroupHPadding: 'calc($py + $borderWidthT) 0 0 0',

  inputBorderWidthL: '$borderWidthL',

  iconFontSize: '0.875rem',
  iconGroupColor: 'inherit',
  iconGroupColorDanger: '$colorDanger',
  iconGroupWidth: '2.5rem',

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
   * Semantic tokens
   * -------------------------------------------------------------------------- */
  iconHeight: '0.75rem',
  iconWidth: '0.75rem',

  /**
   * Primitives tokens
   * -------------------------------------------------------------------------- */
  space1: '1rem',
  space2: '2rem',
  space3: '3rem',

  iconLoading: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6.5' fill='none' stroke='currentColor' stroke-width='1.5' stroke-dasharray='30.6 10.2' stroke-linecap='round'/%3E%3C/svg%3E\")",
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->
<!-- @endtab -->
<!-- @endtabs -->
