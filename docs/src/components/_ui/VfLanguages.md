# VfLanguages

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

`VfLanguages` renders the language switcher in a multilingual form. Override the `languages` slot on `VfForm` to render `VfLanguages` with custom props or alongside additional content.

::: usage

```vue [Preview]
<VfForm
  multilingual
  :languages="{ en_US: 'English', fr_FR: 'Français' }"
>
  <template
    #languages="{ languages, language, invalidLanguages, select }"
  >
    <VfLanguages
      :languages="languages"
      :language="language"
      :invalid-languages="invalidLanguages"
      @select="select"
    />
  </template>
  <VfText name="title" label="Title" translate />
  <VfTextarea name="body" label="Body" translate />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, defineSlot, useForm } from '@vueform/ui'
import { h, resolveComponent } from 'vue'

const schema = defineSchema({
  title: { type: 'text', label: 'Title', translate: true },
  body: { type: 'textarea', label: 'Body', translate: true },
})

const [MyForm] = useForm({
  schema,
  multilingual: true,
  languages: { en_US: 'English', fr_FR: 'Français' },
  slots: {
    languages: defineSlot('VfForm.languages', {
      props: [
        'languages',
        'language',
        'invalidLanguages',
        'select',
      ],
      setup: (props) => () => {
        const VfLanguages = resolveComponent('VfLanguages')

        return h(VfLanguages, {
          languages: props.languages,
          language: props.language,
          invalidLanguages: props.invalidLanguages,
          onSelect: props.select,
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

### Component {#props-languages}

| Prop | Default | Description |
| --- | --- | --- |
| [`invalidLanguages`](!code#props.invalidLanguages "Set<string>") | — | Set of language codes that currently have validation errors. |
| [`select`](!code#props.select "(language: string) => void") | — | **Required.** Select a language. |

### I18n {#props-i18n}

| Prop | Default | Description |
| --- | --- | --- |
| [`language`](!code#props.language "string") | — | **Required.** The currently active language code. |
| [`languages`](!code#props.languages "ResolvedLanguagesProp") | — | **Required.** The available languages as a map of language codes to display names. |

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

### Events {#section-events}

| Name | Description |
| --- | --- |
| [`fire()`](!code#context.fire "(e: string, ...args: any[]) => any") | Fires an event synchronously, invoking before, main, and after listeners in order. |
| [`fireAsync()`](!code#context.fireAsync "(e: string, ...args: any[]) => Promise<any>") | Fires an event asynchronously, awaiting each callback and short-circuiting when any returns `false`. |
| [`on()`](!code#context.on "(e: string, callback: (...args: any[]) => any) => void") | Subscribes a callback to a specific event. |
| [`off()`](!code#context.off "(e: string, callback: (...args: any[]) => any) => void") | Removes a previously registered event callback. |
| [`onBefore()`](!code#context.onBefore "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs before the main event listeners. |
| [`onAfter()`](!code#context.onAfter "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs after the main event listeners. |

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleSelect()`](!code#context.handleSelect "(language: string) => void") | Handles language selection by firing the `select` event. |
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
| `default` | [`language`](!code#slot.default.language "string") [`languages`](!code#slot.default.languages "ResolvedLanguagesProp") [`value`](!code#slot.default.value "string") [`label`](!code#slot.default.label "string") | Slot that replaces each individual language option rendering. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->
<VPParts component="VfLanguages" :examples="{ default: 'Default' }">
  <template #example-default>
    Example
  </template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->
### `root`

The root language selector element.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |

### `list`

The language list element.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<ul>` |

### `wrapper`

Each language wrapper. Receives whether this option is currently selected and whether this language has validation errors.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<li>` |

### `language`

The language button element.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<button>` |
<!-- @parts-end -->
<!-- @endtab -->
<!-- @endtabs -->
