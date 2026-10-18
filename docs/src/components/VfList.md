# VfList

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

A dynamic list of repeatable inputs. The `flat` prop keeps the data model as a flat array of values instead of an array of objects.

::: usage model

```vue [Preview]
<VfList name="domains" label="Domains">
  <template #default="{ index }">
    <VfText :name="index" placeholder="Domain" />
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  domains: {
    type: 'list',
    label: 'Domains',
    flat: true,
    schema: {
      domain: {
        type: 'text',
        placeholder: 'Domain',
      },
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

<!-- #endregion usage-basic -->

<!-- #region usage-multiple-elements -->

## Multiple Elements

When each row contains more than one element, wrap them in a `VfGroup` with the `nested` prop. The group receives the `index` as its name. The `wrap` prop renders each list item inside a bordered container.

::: usage model

```vue [Preview]
<VfList name="contacts" label="Contacts" wrap>
  <template #default="{ index }">
    <VfGroup :name="index" nested>
      <VfText name="first_name" placeholder="First name" />
      <VfText name="last_name" placeholder="Last name" />
    </VfGroup>
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contacts: {
    type: 'list',
    label: 'Contacts',
    wrap: true,
    schema: {
      first_name: {
        type: 'text',
        placeholder: 'First name',
      },
      last_name: {
        type: 'text',
        placeholder: 'Last name',
      },
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

<!-- #endregion usage-multiple-elements -->

<!-- #region usage-sorting -->

## Sorting

The `sort` prop enables drag-and-drop reordering of list items.

::: usage

```vue [Preview]
<VfList name="priorities" label="Priorities" sort>
  <template #default="{ index }">
    <VfText :name="index" placeholder="Item" />
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  priorities: {
    type: 'list',
    label: 'Priorities',
    sort: true,
    schema: {
      item: {
        type: 'text',
        placeholder: 'Item',
      },
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

<!-- #endregion usage-sorting -->

<!-- #region usage-initial-count -->

## Initial Count

The `initial` prop sets the number of rows rendered on mount.

::: usage

```vue [Preview]
<VfList name="tasks" label="Tasks" :initial="3">
  <template #default="{ index }">
    <VfText :name="index" placeholder="Task" />
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  tasks: {
    type: 'list',
    label: 'Tasks',
    initial: 3,
    schema: {
      task: {
        type: 'text',
        placeholder: 'Task',
      },
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

<!-- #endregion usage-initial-count -->

<!-- #region usage-item-limits -->

## Item Limits

The `min` and `max` props control the allowed number of items. The add button is hidden when `max` is reached and the remove button is hidden when `min` is reached.

::: usage

```vue [Preview]
<VfList name="emails" :min="1" :max="3" />
```

```vue [Template]
<VfList name="emails" label="Emails" :min="1" :max="3">
  <template #default="{ index }">
    <VfText :name="index" placeholder="Email" />
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  emails: {
    type: 'list',
    label: 'Emails',
    min: 1,
    max: 3,
    initial: 1,
    schema: {
      email: {
        type: 'text',
        placeholder: 'Email',
      },
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

<!-- #endregion usage-item-limits -->

<!-- #region usage-placeholder -->

## Placeholder

The `placeholder` prop defines text shown when the list has no items.

::: usage

```vue [Preview]
<VfList name="tags" :initial="0" placeholder="No tags added yet" />
```

```vue [Template]
<VfList
  name="tags"
  label="Tags"
  :initial="0"
  placeholder="No tags added yet"
>
  <template #default="{ index }">
    <VfText :name="index" placeholder="Tag" />
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  tags: {
    type: 'list',
    label: 'Tags',
    initial: 0,
    placeholder: 'No tags added yet',
    schema: {
      tag: {
        type: 'text',
        placeholder: 'Tag',
      },
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

<!-- #endregion usage-placeholder -->

<!-- #region usage-custom-labels -->

## Custom Labels

The `addLabel` and `removeLabel` props customize the text on the add and remove buttons.

::: usage

```vue [Preview]
<VfList name="links" add-label="New link" remove-label="Delete" />
```

```vue [Template]
<VfList
  name="links"
  label="Links"
  add-label="New link"
  remove-label="Delete"
>
  <template #default="{ index }">
    <VfText :name="index" placeholder="URL" />
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  links: {
    type: 'list',
    label: 'Links',
    addLabel: 'New link',
    removeLabel: 'Delete',
    schema: {
      url: {
        type: 'text',
        placeholder: 'URL',
      },
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

<!-- #endregion usage-custom-labels -->

<!-- #region usage-disabled -->

## Disabled

The `disabled` prop prevents adding, removing, and sorting items. It also accepts [Conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfList name="locked" disabled />
```

```vue [Template]
<VfList
  name="locked"
  label="Locked list"
  disabled
>
  <template #default="{ index }">
    <VfText :name="index" placeholder="Item" />
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  locked: {
    type: 'list',
    label: 'Locked list',
    disabled: true,
    schema: {
      item: {
        type: 'text',
        placeholder: 'Item',
      },
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

<!-- #endregion usage-disabled -->
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
| [`type`](!code#props.type "string") | `'list'` | The element type identifier. |
| [`schema`](!code#props.schema "FormSchema") | — | The form schema definition for each row in the list. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`heading`](!code#props.heading "HeadingProp") | — | The heading level to render for the container's title. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`placeholder`](!code#props.placeholder "TProp<string, TContext>") | — | The placeholder text displayed when the list has no items. |
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Input {#props-list}

| Prop | Default | Description |
| --- | --- | --- |
| [`initial`](!code#props.initial "string \| number") | `1` | The initial number of rows to render. |
| [`flat`](!code#props.flat "boolean") | `false` | Whether to flat list values into a single-level array. |
| [`add`](!code#props.add "boolean") | `true` | Whether adding new items is enabled. When `false`, the add button is not rendered. |
| [`remove`](!code#props.remove "boolean") | `true` | Whether removing items is enabled. When `false`, remove buttons are not rendered. |
| [`min`](!code#props.min "number") | — | The minimum number of items the list must contain. When reached, the remove button is hidden. |
| [`max`](!code#props.max "number") | — | The maximum number of items the list can contain. When reached, the add button is hidden. |
| [`sort`](!code#props.sort "boolean") | `false` | Whether to enable drag-and-drop sorting of list items. |
| [`addLabel`](!code#props.addLabel "TProp<string, TContext>") | — | The label text for the "add row" button. |
| [`removeLabel`](!code#props.removeLabel "TProp<string, TContext>") | — | The label text for the "remove row" button. |
| [`addIcon`](!code#props.addIcon "DProp<string, TContext>") | `'$add'` | The icon identifier for the "add row" button. |
| [`removeIcon`](!code#props.removeIcon "DProp<string, TContext>") | `'$remove'` | The icon identifier for the "remove row" button. |
| [`sortIcon`](!code#props.sortIcon "DProp<string, TContext>") | `'$sort'` | The icon identifier for the sort handle button. |
| [`wrap`](!code#props.wrap "boolean") | `false` | Whether to render list items in a wrapped layout. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | `false` | Whether the element is disabled. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfListContext<VfListProps>) => any") | — | Transforms the element's value when submitting the form. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`rules`](!code#props.rules "RulesProp<TContext>") | — | Validation rules to apply to the element. |
| [`validateOn`](!code#props.validateOn "'change'[]") | — | Controls when validation is triggered. |
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

### List {#section-list}

| Name | Description |
| --- | --- |
| [`list`](!code#context.list "any") | Ref to the container's root DOM element, used for drag-and-drop bounds detection. |
| [`prototype`](!code#context.prototype "object") | The resolved schema prototype used to create new list items. |
| [`prototypeComponent`](!code#context.prototypeComponent "string \| Component \| undefined") | The Vue component name for the list item prototype. |
| [`dragIndex`](!code#context.dragIndex "any") | The data index of the item currently being dragged in a sortable list. |
| [`dropIndex`](!code#context.dropIndex "any") | The data index where the dragged item will be dropped. |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`validation`](!code#context.validation "ShallowReactive<Record<string, ValidationView>>") | Per-language validation views keyed by language (`default` for non-translatable elements). |
| [`validator`](!code#context.validator "Validator") | The validator instance the element is registered with: the form's validator, a store-attached one, or a newly created one. |
| [`shouldValidate`](!code#context.shouldValidate "boolean") | Whether the element should validate live on user input, per the `validateOn` policy and the form's state. |
| [`onUserInput()`](!code#context.onUserInput "() => void") | Validates the element on user input when the live-validation policy allows it. |
| [`isFlatContainer`](!code#context.isFlatContainer "boolean") | Whether the element's data is flattened into the parent container rather than nested under its own `name` key. |
| [`containerModel`](!code#context.containerModel "unknown") | The model ref the element provides to its children via the container context: the parent's model for flat containers, the element's own `model` otherwise. |
| [`handleModelUpdate()`](!code#context.handleModelUpdate "(data: Event) => void") | Handles a native input event and updates the model from the event target. |
| [`add()`](!code#context.add "(count: number) => Promise<void>") | Adds one or more items to a dynamic list. |
| [`remove()`](!code#context.remove "(index: number \| undefined) => void") | Removes an item from a dynamic list by index. |
| [`sort()`](!code#context.sort "(fromIndex: number, toIndex: number) => Promise<void>") | Sorts a dynamic list by moving an item from one data index to another. |
| [`initValidation()`](!code#context.initValidation "() => void") | Registers the element with the validator and compiles its rules. |
| [`destroyValidation()`](!code#context.destroyValidation "() => void") | Unregisters the element from the validator and clears its validation views. |
| [`rootModel`](!code#context.rootModel "RootModel \| undefined") | The root model backing the form when this element operates as the form root, `undefined` for every other element. |
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. |
| [`canSort`](!code#context.canSort "boolean") | Whether the sort handle should be rendered. Returns `false` when the element is disabled or the optional sortable guard is falsy. |
| [`dropTarget`](!code#context.dropTarget "any") | The stable id rendered at the current drop position (in the live display order), or `undefined` when not hovering over a valid target. The list template compares this against each row's id to flag the drop target. |
| [`addLabel`](!code#context.addLabel "UnwrapDynamicProp<LooseRequired<TProps>[\"addLabel\"]> \| undefined") | The resolved label text for the "add" button. |
| [`removeLabel`](!code#context.removeLabel "UnwrapDynamicProp<LooseRequired<TProps>[\"removeLabel\"]> \| undefined") | The resolved label text for the "remove" button. |
| [`placeholderId`](!code#context.placeholderId "string") | Unique DOM id for the placeholder element, used for `aria-describedby` on the add button. |
| [`addIcon`](!code#context.addIcon "string \| undefined") | The resolved icon identifier for the "add" button. |
| [`removeIcon`](!code#context.removeIcon "string \| undefined") | The resolved icon identifier for the "remove" button. |
| [`sortIcon`](!code#context.sortIcon "string \| undefined") | The resolved icon identifier for the sort handle button. |
| [`canAdd`](!code#context.canAdd "boolean") | Whether the add button should be rendered. Returns `false` when adding is disabled, the element is disabled, or the maximum item count is reached. |
| [`canRemove`](!code#context.canRemove "boolean") | Whether remove buttons should be rendered. Returns `false` when removing is disabled, the element is disabled, or the minimum item count is reached. |

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
| [`dirty`](!code#context.dirty "boolean") | Whether the current model value differs from the initial model value. |
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
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`placeholder`](!code#context.placeholder "UnwrapDynamicProp<LooseRequired<TProps>[\"placeholder\"]> \| undefined") | The resolved placeholder text displayed when the list is empty. |
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

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleAdd()`](!code#context.handleAdd "() => Promise<void>") | Adds a new item to the list. |
| [`handleRemove()`](!code#context.handleRemove "(index: number) => void") | Removes the item at the given index from the list. |
| [`handleDragStart()`](!code#context.handleDragStart "(e: DragEvent, index: number) => void") | Initiates drag-and-drop reordering for the item at the given data index. |
| [`handleDragEnter()`](!code#context.handleDragEnter "(_e: DragEvent, index: number) => void") | Updates the current drop target during drag-and-drop. `index` is the hovered row's live display position; the dragged item moves straight to it (its origin position included, so it can be dropped back home). `dragIndex` stays the canonical data index that feeds `move`/`sort` as the source. |
| [`handleDrop()`](!code#context.handleDrop "(_e: DragEvent) => void") | Completes the drag-and-drop operation by sorting the dragged item to the drop position. |
| [`handleDragEnd()`](!code#context.handleDragEnd "() => void") | Cleans up drag-and-drop state after the operation ends. |
| [`handleWrapperDragOver()`](!code#context.handleWrapperDragOver "(e: DragEvent) => void") | Prevents default dragover behavior on the container to allow drops. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | A unique auto-generated identifier for the element. |
| [`a11yBindings`](!code#context.a11yBindings "ListA11y") | Part-keyed accessibility bindings: ready-to-spread attribute bags for the list structure (items container, item wrappers), the empty-state placeholder status region, and the add/sort/remove controls — applied to the built-in markup and passed to the matching slots. Per-item bags (`sort`, `remove`) are functions of the item index, resolved at the call site like functional parts. |
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
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "T") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "T"), [`context$`](!code#events.load.context$ "TContext") | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the element is reset to its default value. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the element's value is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the element becomes invalid. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the element becomes valid after having been invalid. |
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
| `item` | [`index`](!code#slot.item.index "number") [`beingDragged`](!code#slot.item.beingDragged "boolean") [`isDropTarget`](!code#slot.item.isDropTarget "boolean") [`classes`](!code#slot.item.classes "VfListClasses") [`parts`](!code#slot.item.parts "Partial<VfListParts>") [`a11yBindings`](!code#slot.item.a11yBindings "VfListA11y") [`modifiers`](!code#slot.item.modifiers "VfListModifiers") [`handleDragEnter`](!code#slot.item.handleDragEnter "($event: DragEvent) => void") [`handleDragStart`](!code#slot.item.handleDragStart "($event: DragEvent) => void") [`handleDragEnd`](!code#slot.item.handleDragEnd "() => void") [`handleRemove`](!code#slot.item.handleRemove "() => void") | Slot that replaces each list item wrapper. Receives drag state and event handlers. |
| `sort` | [`classes`](!code#slot.sort.classes "ClassValue") [`part`](!code#slot.sort.part "PartOf<'VfButton'> \| undefined") [`a11yBindings`](!code#slot.sort.a11yBindings "ReturnType<VfListA11y['sort']>") [`handleDragStart`](!code#slot.sort.handleDragStart "($event: DragEvent) => void") [`handleDragEnd`](!code#slot.sort.handleDragEnd "() => void") | Slot that replaces the drag handle. Receives classes, part, and drag event handlers. |
| `default` | [`component`](!code#slot.default.component "string \| Component") [`props`](!code#slot.default.props "Record<string, any>") [`index`](!code#slot.default.index "ElementName") | Slot that replaces the default element content within each list item. |
| `remove` | [`classes`](!code#slot.remove.classes "ClassValue") [`part`](!code#slot.remove.part "PartOf<'VfButton'> \| undefined") [`a11yBindings`](!code#slot.remove.a11yBindings "ReturnType<VfListA11y['remove']>") [`handleRemove`](!code#slot.remove.handleRemove "() => void") | Slot that replaces the remove button. Receives classes, part, and remove handler. |
| `placeholder` | [`classes`](!code#slot.placeholder.classes "ClassValue") [`part`](!code#slot.placeholder.part "DomAttrsOf<'div'> \| undefined") [`a11yBindings`](!code#slot.placeholder.a11yBindings "VfListA11y['placeholder']") | Slot that replaces the placeholder element when the list is empty. |
| `add` | [`label`](!code#slot.add.label "any") [`classes`](!code#slot.add.classes "ClassValue") [`part`](!code#slot.add.part "PartOf<'VfButton'> \| undefined") [`a11yBindings`](!code#slot.add.a11yBindings "VfListA11y['add']") [`handleAdd`](!code#slot.add.handleAdd "() => void") | Slot that replaces the add button. Receives classes, part, add handler, and label. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts
component="VfList"
:examples="{
default: 'Default',
multiple: 'Multiple',
}"
:schema="{
label: 'Attendees',
info: 'You can invite up to 10 people',
help: 'Add one row per person',
hint: 'This will be used for the guest list',
rules: 'required',
'part:errors': { 'pt:transition:appear': false },
showRequired: ['label'],
onMounted: ({ messageBag }) => {
messageBag.append('Jane Doe is already on the list', 'error')
messageBag.append('2 invitations will be sent', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfList
      name="default"
      :schema="{ name: { type: 'input-text', placeholder: 'Full name' } }"
      :wrap="false"
      :default-value="['John Doe', 'Jane Doe']"
      v-bind="schema"
    />
</template>
<template #example-multiple="{ schema }">
<VfList
      name="multiple"
      :schema="{
        name: { type: 'input-text', placeholder: 'Full name' },
        email: { type: 'input-text', placeholder: 'Email' },
      }"
      wrap
      :default-value="[
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Doe', email: 'jane@example.com' },
      ]"
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
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-panel` |

### `root`

The element's root wrapper.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` `<fieldset>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-align-label`](!code#parts.root.modifiers.data-align-label "''") |

### `labelGroup`

The container holding the label and required indicator.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-label-group` |

### `label`

The label element; renders as the corresponding heading when the container's `heading` prop is set.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<span>` `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` |
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

### `items`

The items container element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-list-items` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`role`](!code#parts.items.a11y.role "'list'") |

### `item`

Each list item wrapper. Receives drag state.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-list-item` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-wrapped`](!code#parts.item.modifiers.data-wrapped "''") [`data-dragging`](!code#parts.item.modifiers.data-dragging "''") [`data-drop-target`](!code#parts.item.modifiers.data-drop-target "''") |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`role`](!code#parts.item.a11y.role "'listitem'") |

### `element`

The element wrapper within each list item.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-list-element` |

### `sort`

The drag handle element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfButton>`](./VfButton.md) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-list-sort` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`aria-label`](!code#parts.sort.a11y.aria-label "string") |

### `remove`

The remove action element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfButton>`](./VfButton.md) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-list-remove` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`aria-label`](!code#parts.remove.a11y.aria-label "string") |

### `placeholder`

The placeholder element displayed when the list is empty.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-list-placeholder` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`id`](!code#parts.placeholder.a11y.id "string") [`role`](!code#parts.placeholder.a11y.role "'status'") |

### `add`

The add action element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfButton>`](./VfButton.md) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-list-add` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`aria-label`](!code#parts.add.a11y.aria-label "string") [`aria-describedby`](!code#parts.add.a11y.aria-describedby "string") |

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
   * Element tokens
   * -------------------------------------------------------------------------- */
  --vf-group-wrapped-bg: transparent;
  --vf-group-wrapped-border-color: var(--vf-gray-300);
  --vf-group-wrapped-border-style: solid;
  --vf-group-wrapped-border-width: 1px;
  --vf-group-wrapped-padding: 1.5rem;
  --vf-group-wrapped-radius: var(--vf-radius);

  --vf-list-gutter-x: var(--vf-gutter);
  --vf-list-gutter-y: var(--vf-gutter);
  --vf-list-item-align: center;
  --vf-list-item-gutter-x: var(--vf-gutter);
  --vf-list-item-gutter-y: 0;

  --vf-list-dragging-opacity: 0.6;

  --vf-list-placeholder-align: left;
  --vf-list-placeholder-bg: transparent;
  --vf-list-placeholder-border-color: transparent;
  --vf-list-placeholder-border-style: solid;
  --vf-list-placeholder-border-width: 0;
  --vf-list-placeholder-color: var(--vf-gray-500);
  --vf-list-placeholder-font-style: italic;
  --vf-list-placeholder-padding: calc(var(--vf-py) + var(--vf-border-width-t) + var(--vf-border-width-b)) 0;
  --vf-list-placeholder-radius: var(--vf-radius);

  --vf-list-add-margin: calc(var(--vf-gutter) * 0.66) 0 0 0;

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
   * Element tokens
   * -------------------------------------------------------------------------- */
  groupWrappedBg: 'transparent',
  groupWrappedBorderColor: '$gray300',
  groupWrappedBorderStyle: 'solid',
  groupWrappedBorderWidth: '1px',
  groupWrappedPadding: '1.5rem',
  groupWrappedRadius: '$radius',

  listGutterX: '$gutter',
  listGutterY: '$gutter',
  listItemAlign: 'center',
  listItemGutterX: '$gutter',
  listItemGutterY: '0',

  listDraggingOpacity: '0.6',

  listPlaceholderAlign: 'left',
  listPlaceholderBg: 'transparent',
  listPlaceholderBorderColor: 'transparent',
  listPlaceholderBorderStyle: 'solid',
  listPlaceholderBorderWidth: '0',
  listPlaceholderColor: '$gray500',
  listPlaceholderFontStyle: 'italic',
  listPlaceholderPadding: 'calc($py + $borderWidthT + $borderWidthB) 0',
  listPlaceholderRadius: '$radius',

  listAddMargin: 'calc($gutter * 0.66) 0 0 0',

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
