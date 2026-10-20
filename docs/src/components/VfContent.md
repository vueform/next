# VfContent

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic Usage

`VfContent` renders static content inside the form — plain text, dynamic [Expressions](/guide/expressions), raw HTML, or custom markup via its default slot — as the examples on this page demonstrate. It's a display-only element: it holds no value and adds nothing to the form data.

::: usage center nomodel

```vue [Preview]
<VfContent name="intro" content="Please fill out the form below." />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  intro: {
    type: 'content',
    content: 'Please fill out the form below.',
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

<!-- #region usage-dynamic-content -->

## Dynamic Content

The `content` prop supports [expressions](/guide/expressions). Wrap element names or calculations in `{...}` to create dynamic text that updates reactively.

::: usage nomodel

```vue [Preview]
<VfText name="name" label="Name" default="World" />
<VfContent name="greeting" content="Hello, {name}!" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: {
    type: 'text',
    label: 'Name',
    default: 'World',
  },
  greeting: {
    type: 'content',
    content: 'Hello, {name}!',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-dynamic-content -->

<!-- #region usage-html-content -->

## HTML Content

Content containing markup renders as HTML when the app lists the `content` area in [`$security.allowHtml`](/guide/security#html-sanitization) — the decision belongs to the app config, not to the schema, so a schema from an untrusted source can't turn HTML rendering on for itself. Without that area the markup renders as escaped text, and with it the content is sanitized before rendering (an installed sanitizer is required — see [the sanitize step](/guide/security#the-sanitize-step)).

::: usage center nomodel

```vue [Preview]
<VfContent
  name="notice"
  content="This is &lt;b&gt;bold&lt;/b&gt; and &lt;em&gt;italic&lt;/em&gt; text."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  notice: {
    type: 'content',
    content: 'This is <b>bold</b> and <em>italic</em> text.',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-html-content -->

<!-- #region usage-slot -->

## Slot

Use the default slot to render custom content instead of the `content` prop.

::: usage center nomodel fit

```vue [Preview]
<VfContent name="notice">
  <template #default>
    <p>Please read our <a href="#">terms and conditions</a> before submitting.</p>
  </template>
</VfContent>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, defineSlot, useForm } from '@vueform/ui'
import { h } from 'vue'

const schema = defineSchema({
  notice: {
    type: 'content',
    slots: {
      default: defineSlot('VfContent.default', {
        setup() {
          return () => h('p', [
            'Please read our ',
            h('a', { href: '#' }, 'terms and conditions'),
            ' before submitting.',
          ])
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

<!-- #endregion usage-slot -->
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
| [`type`](!code#props.type "string") | `'content'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`content`](!code#props.content "TProp<string, TContext>") | — | The text content rendered inside the element. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`align`](!code#props.align "AlignProp") | — | Horizontal alignment of the element within its layout container. |
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Element {#props-content}

| Prop | Default | Description |
| --- | --- | --- |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`aligned`](!code#props.aligned "boolean") | `false` | Whether the element should vertically align with adjacent form controls. |

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

### Content {#section-content}

| Name | Description |
| --- | --- |
| [`isStatic`](!code#context.isStatic "true") | Whether the element is a static (non-data) element. |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`content`](!code#context.content "UnwrapDynamicProp<LooseRequired<TProps>[\"content\"]> \| undefined") | The resolved text content for the element — sanitized in the resolution pipeline after localization and expressions, and only when the resolved string actually contains markup, so plain text never enters the engine. |
| [`isHtml`](!code#context.isHtml "boolean") | Whether the content renders as HTML.<br><br>`$security.allowHtml: ['content']` must list the area, so no schema entry can grant itself HTML rendering. When refused, the markup renders as escaped text instead. Markup-free content never consults the gate — it renders identically either way. |
| [`tag`](!code#context.tag "string") | The HTML tag used to render the content wrapper. |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`visible`](!code#context.visible "boolean") | Whether the element is currently visible, based on availability, container visibility, and pager state. |
| [`available`](!code#context.available "boolean") | Whether the element is available (not hidden by conditional logic). |

### Validation {#section-validation}

| Name | Description |
| --- | --- |
| [`errors`](!code#context.errors "string[]") | The reactive list of validation error messages. |
| [`displayErrors`](!code#context.displayErrors "string[]") | The reactive list of validation error messages. |
| [`messages`](!code#context.messages "string[]") | The reactive list of informational messages. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag holding user-facing error and message strings. |
| [`genericName`](!code#context.genericName "string") | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`page`](!code#context.page "PageProp \| undefined") | Page metadata for stepped/tabbed forms. |
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
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `default` | [`Context`](#context "Full context available. Click to see") | Default slot that replaces the content. Receives the full component context. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->
<VPParts component="VfContent" :examples="{ default: 'Default' }">
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-help` |

### `description`

The description text area.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-description` |

### `errors`

The validation errors container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
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
