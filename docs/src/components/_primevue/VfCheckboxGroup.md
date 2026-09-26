<script setup>
import { useHttp } from '@vueform/ui'
const $http = useHttp()
</script>

# VfCheckboxGroup

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

## Basic Usage

`VfCheckboxGroup` renders a group of `VfCheckbox` components — each wrapping PrimeVue's [Checkbox](https://v4.primevue.org/checkbox/) — and binds them to a single array value. The group itself is a Vueform element: options are defined via the `options` prop, which the examples on this page demonstrate in its various formats, along with validation, conditions, and layout.

In the simplest case `options` is a plain array, where each value is used as both the label and the submitted value.

::: usage model

```vue [Preview]
<VfCheckboxes
  name="fruits"
  label="Fruits"
  :options="['Apple', 'Banana', 'Cherry']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  fruits: {
    type: 'checkboxes',
    label: 'Fruits',
    options: ['Apple', 'Banana', 'Cherry'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!--@include: @/components/_ui/VfCheckboxes.md#usage-plain-object-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-object-array-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-async-function-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-endpoint-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-conditional-items-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-disabled-items-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-groups-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-conditional-groups-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-hint-text-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-help-text-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-stacked-->
<!--@include: @/components/_ui/VfCheckboxes.md#usage-disabled-->

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
| [`type`](!code#props.type "string") | `'checkbox-group'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Input {#props-checkboxgroup}

| Prop | Default | Description |
| --- | --- | --- |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`defaultValue`](!code#props.defaultValue "T") | — | The default/initial value of the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |
| [`headers`](!code#props.headers "Record<string, string>") | — | Custom HTTP headers to include when loading options from an endpoint. |
| [`method`](!code#props.method "string") | — | The HTTP method to use when loading options from an endpoint. Defaults to `'GET'`. |
| [`aligned`](!code#props.aligned "boolean") | `false` | Whether the element should vertically align with adjacent form controls. |

### Options {#props-options}

| Prop | Default | Description |
| --- | --- | --- |
| [`options`](!code#props.options "MaybeRef<TOptions>") | — | The option items for the element. |
| [`optionLabel`](!code#props.optionLabel "OptionKeyProp<TOptions, TGroupChildren, string>") | — | Resolves the label for an option. A string key for property lookup, or a function returning the label string. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionValue`](!code#props.optionValue "AllowsOptionKeyProps<TOptions> extends true ? \| (TOptionValueKey & AllowedOptionValueKey<TOptions, TGroupChildren>) \| AllowedOptionValueKey<TOptions, TGroupChildren> \| ((option: RawOptionOf<TOptions, TGroupChildren>) => TOptionValueReturn) : never") | — | Resolves the value for an option. A string key for property lookup, or a function returning the value. Not allowed for plain scalar arrays or plain object/record maps.<br><br>Typed as `(TOptionValueKey & AllowedOptionValueKey) \| AllowedOptionValueKey<br><br>\| ((option) => TOptionValueReturn)` so:<br><br>- string keys infer into `TOptionValueKey` through the intersection, which also rejects keys missing from the option shape (the generic itself is only bounded by the simple `OptionValueProp`, so validation must happen here) - keys remain assignable on the defaulted `ElementSchema` / `FormSchema` surface where `TOptionValueKey` is still `undefined` - mapper return types infer into `TOptionValueReturn` - the `option` parameter stays concrete and is contextually typed even for bare inline arrows (whose return type cannot drive generics under Vue's single-pass inference — annotate the param or use a named function for full model inference) |
| [`optionDisabled`](!code#props.optionDisabled "OptionKeyProp<TOptions, TGroupChildren, ConditionalProp<TContext> \| undefined>") | — | Determines whether an option is disabled. A string key for property lookup, or a function returning a `ConditionalProp`. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionConditions`](!code#props.optionConditions "OptionKeyProp<TOptions, TGroupChildren, ConditionalProp<TContext> \| undefined>") | — | Determines whether an option is available. A string key for property lookup, or a function returning a `ConditionalProp`. Options whose conditions are not met are omitted from the list. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionGroupLabel`](!code#props.optionGroupLabel "OptionGroupKeyProp<TOptions, string>") | — | Resolves the label for an option group. A string key for property lookup on the group object, or a function returning the label string. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionGroupChildren`](!code#props.optionGroupChildren "AllowsOptionKeyProps<TOptions> extends true ? \| (TGroupChildren & AllowedOptionGroupChildren<TOptions>) \| AllowedOptionGroupChildren<TOptions> : never") | — | Resolves the children items for an option group. A string key for property lookup on the group object, or a function returning a children array. Not allowed for plain scalar arrays or plain object/record maps.<br><br>Mapper returns are restricted to arrays to match PrimeVue's `optionGroupChildren` prop.<br><br>The intersection arm infers keys into `TGroupChildren` while rejecting keys missing from the group shape (the generic itself is only bounded by the simple `OptionGroupChildrenProp`). The bare `AllowedOptionGroupChildren` arm keeps keys assignable on the defaulted schema surface where `TGroupChildren` is still `undefined`. |
| [`optionGroupConditions`](!code#props.optionGroupConditions "OptionGroupKeyProp<TOptions, ConditionalProp<TContext> \| undefined>") | — | Determines whether an option group is available. A string key for property lookup on the group object, or a function returning a `ConditionalProp`. Groups whose conditions are not met are omitted entirely. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionsTrigger`](!code#props.optionsTrigger "ConditionsTriggerProp") | — | The source that triggers re-resolution of function-based options. Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, function-based options are only re-resolved when the `options` prop reference itself changes. |
| [`optionsDebounce`](!code#props.optionsDebounce "number") | — | The debounce delay in milliseconds applied before re-resolving function-based options when the `optionsTrigger` source changes. Defaults to no debounce (immediate re-resolution). |
| [`transformOptions`](!code#props.transformOptions "(data: any) => any[] \| Record<string, any>") | — | Transforms data received from an endpoint into the options format. When `options` is a string (endpoint URL), the HTTP response data is passed through this function before normalization. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfCheckboxGroupContext<VfCheckboxGroupProps<TOptions, TOptionValueKey, TGroupChildren, TModel, TOptionValueReturn>>) => any") | — | Transforms the element's value when submitting the form. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`rules`](!code#props.rules "RulesProp<TContext>") | — | Validation rules to apply to the element. |
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
| [`stacked`](!code#props.stacked "boolean") | `false` | Whether to render child elements in a stacked (wrapped row) layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`heading`](!code#props.heading "HeadingProp") | — | The heading level to render for the container's title. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`info`](!code#props.info "TProp") | — | Informational text displayed as a tooltip for the element. |
| [`infoPosition`](!code#props.infoPosition "InfoPositionProp") | — | Position of the info tooltip relative to the info icon. |
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
| [`type`](!code#context.type "string") | The element's type identifier (e.g. "text", "checkbox", "select"). |
| [`name`](!code#context.name "string") | The element's name as a string ref. |
| [`props`](!code#context.props "object") | The resolved component props with defaults applied. |

### CheckboxGroup {#section-checkboxgroup}

| Name | Description |
| --- | --- |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`validation`](!code#context.validation "ShallowReactive<Record<string, ValidationView>>") |  |
| [`validator`](!code#context.validator "Validator") |  |
| [`shouldValidate`](!code#context.shouldValidate "boolean") |  |
| [`onUserInput()`](!code#context.onUserInput "() => void") |  |
| [`isFlatContainer`](!code#context.isFlatContainer "boolean") | Whether the element's data is flattened into the parent container rather than nested under its own `name` key. |
| [`containerModel`](!code#context.containerModel "unknown") | The model ref the element provides to its children via the container context. For flat containers this is the parent's model — children's data lives merged at the parent level, while the public `model` is a scoped projection. For every other element it is the element's own `model`. |
| [`handleModelUpdate()`](!code#context.handleModelUpdate "(data: Event) => void") | Handles a native input event and updates the model from the event target. Text and select inputs use `target.value`. Checkboxes and radios use the `checked` state with `trueValue` / `falseValue` when available. |
| [`initValidation()`](!code#context.initValidation "() => void") |  |
| [`destroyValidation()`](!code#context.destroyValidation "() => void") |  |
| [`rootModel`](!code#context.rootModel "RootModel \| undefined") | The root model backing the form when this element operates as the form root (adopting a `useModel` instance from `modelValue` or creating an internal store), `undefined` for every other element. |
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. A sensitive element marks its whole subtree; containers otherwise aggregate from children. Unavailable elements are included: their data may still linger in the model, and stripping an absent path is harmless. |
| [`groups`](!code#context.groups "ResolvedGroup<any, Record<string, any>>[]") | Resolved option groups. Empty when not grouped — use `items` then. |
| [`rawItems`](!code#context.rawItems "any[]") | Library-friendly items for third-party components. Flat lists are the original raw objects (with `__disabled` injected when conditional disabled resolution is active). Grouped lists are the original group objects with children replaced by the filtered raw items. |
| [`resolvedItems`](!code#context.resolvedItems "ShallowRef<any[], any[]> \| ShallowRef<Record<string, any>, Record<string, any>>") | The raw items data before normalization (from props, endpoint, or function). |
| [`normalizedItems`](!code#context.normalizedItems "NormalizedItem[]") |  |
| [`selectedLabel`](!code#context.selectedLabel "string \| string[] \| undefined") | The resolved label(s) of the currently selected item(s). Returns a single string for single-select, or an array of strings for multi-select. Returns `undefined` (single) or `[]` (multiple) when nothing is selected. |
| [`itemLabel`](!code#context.itemLabel "ComputedRef<string \| ((item: any) => string) \| undefined>") | Label accessor to forward to third-party components. Falls back to `'label'` for synthetic items. |
| [`itemValue`](!code#context.itemValue "ComputedRef<string \| ((item: any) => any) \| undefined>") | Value accessor to forward to third-party components. Falls back to `'value'` for synthetic items. |
| [`itemDisabled`](!code#context.itemDisabled "ComputedRef<string \| ((item: any) => boolean) \| undefined>") | Disabled accessor to forward to third-party components. Points at `__disabled` when conditional resolution is required. |
| [`grouped`](!code#context.grouped "boolean") |  |
| [`resolving`](!code#context.resolving "ShallowRef<boolean, boolean>") | Whether the items are currently being loaded from an endpoint or an async function. |
| [`synthetic`](!code#context.synthetic "boolean") | Whether the resolved data uses synthetic `{ value, label }` items. True for plain object maps and arrays of primitives — cases where raw values are wrapped into `{ value, label }` objects. |
| [`resolveItems()`](!code#context.resolveItems "() => void") | Resolves the items source: fetches endpoint URLs, invokes functions (awaiting async results), and passes plain data through. |

### Data {#section-data}

| Name | Description |
| --- | --- |
| [`model`](!code#context.model "Record<string, any> \| any") | The element's reactive model value within the form data tree. |
| [`value`](!code#context.value "any") | The current language-aware value of the element. For translatable elements, returns the value for the active language. |
| [`payload`](!code#context.payload "object") | The element's submission payload. For isContainer.value containers, aggregates from children. For leaf elements, returns own value. |
| [`nullValue`](!code#context.nullValue "any") | The value the element holds when it is considered empty. Determined by `nullValue` / `falseValue` props, element type (container, multiple), and translatable state. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel "Record<string, any> \| any") | A snapshot of the model at initialization time, used for dirty checking and reset. |
| [`items`](!code#context.items "ResolvedItem<any, Record<string, any>>[]") | Resolved flat option items. Empty when grouped — use `groups` then. |
| [`dataPath`](!code#context.dataPath "string") | The dot-notation path to this element's value within the form data object (e.g. `"address.city"`). Empty string for the root model. Flat containers inherit their parent's data path. |
| [`tracking`](!code#context.tracking "boolean") | Whether the element's `default` expression is currently tracked and auto-updating the value. |
| [`update()`](!code#context.update "(data: any) => void") | Updates the element's model value. For isContainer.value containers, performs a deep merge. For leaf elements, sets the value directly and invalidates validation. |
| [`load()`](!code#context.load "(data: any) => void") | Loads data into the element and fires the `load` event, cascading to all children so expression tracking can be stopped per-element. |
| [`reset()`](!code#context.reset "() => void") | Resets the element to its initial model state and fires the `reset` event. For isContainer.value containers, delegates to children or resets the model directly for dynamic lists. |
| [`clear()`](!code#context.clear "() => void") | Clears the element to its null value and fires the `clear` event. For isContainer.value containers, delegates to children or clears the model for dynamic lists. |
| [`track()`](!code#context.track "() => void") | Resumes expression tracking after an untrack, immediately re-writing the resolved value. |
| [`untrack()`](!code#context.untrack "() => void") | Stops expression tracking, leaving the current value in place. |
| [`reinit()`](!code#context.reinit "() => void") | Reinitializes the element by rebuilding both its model registration and validation instances. |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`visible`](!code#context.visible "boolean") | Whether the element is currently visible, based on availability, container visibility, and pager state. |
| [`available`](!code#context.available "boolean") | Whether the element is available (not hidden by conditional logic). |
| [`disabled`](!code#context.disabled "boolean") | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`focused`](!code#context.focused "boolean") | Whether the element is currently focused. |
| [`touched`](!code#context.touched "boolean") | Whether the element has been touched (blurred) by the user. |
| [`visited`](!code#context.visited "boolean") | Whether the element has been visited (focused) by the user. |
| [`dirty`](!code#context.dirty "boolean") | Whether the current model value differs from the initial model value. |
| [`empty`](!code#context.empty "boolean") | Whether the element's current value is empty. For isContainer.value containers, checks whether all children are empty. For leaf elements, checks whether the value is blank or equals the falseValue. |
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
| [`success`](!code#context.success "boolean") |  |
| [`pending`](!code#context.pending "boolean") | Whether any of the element's validations are currently pending an async check, including children. |
| [`debouncing`](!code#context.debouncing "boolean") | Whether any of the element's validations are currently debouncing, including children. |
| [`errors`](!code#context.errors "any[]") | All error messages for this element: its own plus any pushed up by hoisted children. |
| [`hasError`](!code#context.hasError "boolean") | Whether the element has any active error messages. |
| [`displayErrors`](!code#context.displayErrors "any[]") | The error messages rendered for this element. Empty when the element pushes its errors to its parent; otherwise errors capped by `maxErrors`. |
| [`ownErrors`](!code#context.ownErrors "string[]") | The element's own error messages across all languages (validation rules plus custom message bag entries). |
| [`formErrors`](!code#context.formErrors "object") | Error messages propagated to the form, keyed by element path. Empty when the element pushes its errors to its parent. |
| [`messages`](!code#context.messages "string[]") | The list of custom messages from the message bag, including messages from hoisted children. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for managing custom errors, messages, and prepended/appended messages. |
| [`required`](!code#context.required "boolean") |  |
| [`genericName`](!code#context.genericName "string") | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop. |
| [`validate()`](!code#context.validate "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Runs validation on the element's own rules and all children, returning whether everything is valid. Elements already validated without errors against their current value are skipped unless `force: true` re-runs everything — for rules whose outcome can change without the value changing (async server checks, date boundaries). |
| [`validateSelf()`](!code#context.validateSelf "() => Promise<boolean>") |  |
| [`validateChildren()`](!code#context.validateChildren "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Validates stateful children, returning whether all are valid. By default only incomplete children run — never-validated, stale, or invalid ones; children validated without errors against their current value keep their result. `force: true` runs every child regardless of prior results. |
| [`invalidate()`](!code#context.invalidate "() => void") | Marks all validation instances as invalidated, requiring revalidation. For isContainer.value containers, also delegates to children. |
| [`unvalidate()`](!code#context.unvalidate "() => void") | Resets all validation state. For isContainer.value containers, also delegates to children. |
| [`filled()`](!code#context.filled "(value: any) => boolean") | Checks whether a value is considered filled. For isContainer.value containers, delegates to children. For leaf elements, checks the scalar value. |
| [`clean()`](!code#context.clean "() => void") | Marks the element as clean by updating the initial model snapshot. For isContainer.value containers, delegates to children. |
| [`clearErrors()`](!code#context.clearErrors "() => void") | Clears all error messages from the message bag. |
| [`clearMessages()`](!code#context.clearMessages "() => void") | Clears all custom messages from the message bag. |
| [`clearMessageBag()`](!code#context.clearMessageBag "() => void") | Clears the entire message bag, removing both errors and messages. |

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

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleBlur()`](!code#context.handleBlur "(e: Event) => void") | Fires the blur event on the element. |
| [`handleFocus()`](!code#context.handleFocus "(e: Event) => void") | Handles focus by setting the focused state and firing the focus event. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | A unique auto-generated identifier for the element. |
| [`checkboxAria`](!code#context.checkboxAria "object") | Computed ARIA attributes for the checkbox group (invalid, required, describedby). |
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
| `default` | [`checkboxName`](!code#slot.default.checkboxName "string") [`disabled`](!code#slot.default.disabled "boolean") [`label`](!code#slot.default.label "string \| undefined") [`items`](!code#slot.default.items "ResolvedOption<OptionValueOf<TOptions, TOptionValueKey, TGroupChildren, TOptionValueReturn>, RawOptionOf<TOptions, TGroupChildren>>[]") [`groups`](!code#slot.default.groups "ResolvedGroup<OptionValueOf<TOptions, TOptionValueKey, TGroupChildren, TOptionValueReturn>, RawOptionOf<TOptions, TGroupChildren>>[]") [`grouped`](!code#slot.default.grouped "boolean") | Slot that replaces the default checkboxes rendering. |
| `group` | [`checkboxName`](!code#slot.group.checkboxName "string") [`disabled`](!code#slot.group.disabled "boolean") [`label`](!code#slot.group.label "string \| undefined") [`group`](!code#slot.group.group "ResolvedGroup<OptionValueOf<TOptions, TOptionValueKey, TGroupChildren, TOptionValueReturn>, RawOptionOf<TOptions, TGroupChildren>>") | Slot that replaces each option group when items are grouped. |
| `item` | [`checkboxName`](!code#slot.item.checkboxName "string") [`disabled`](!code#slot.item.disabled "boolean") [`label`](!code#slot.item.label "string \| undefined") [`item`](!code#slot.item.item "ResolvedOption<OptionValueOf<TOptions, TOptionValueKey, TGroupChildren, TOptionValueReturn>, RawOptionOf<TOptions, TGroupChildren>>") | Slot that replaces each entire `VfCheckbox` child. |
| `checkbox` | [`model`](!code#slot.checkbox.model "TTrueValue \| TFalseValue") [`trueValue`](!code#slot.checkbox.trueValue "TTrueValue") [`falseValue`](!code#slot.checkbox.falseValue "TFalseValue") [`inputName`](!code#slot.checkbox.inputName "string") [`id`](!code#slot.checkbox.id "string") [`disabled`](!code#slot.checkbox.disabled "boolean") [`input`](!code#slot.checkbox.input "any") [`text`](!code#slot.checkbox.text "string \| undefined") [`aria`](!code#slot.checkbox.aria "AriaProp") [`handleBlur`](!code#slot.checkbox.handleBlur "(e: FocusEvent) => void") [`handleFocus`](!code#slot.checkbox.handleFocus "(e: FocusEvent) => void") [`handleInput`](!code#slot.checkbox.handleInput "(payload: any, e: Event \| undefined) => void") | Slot that replaces each individual checkbox input rendering.<br><br>Child checkboxes always use the default `true` / `false` values; the holder's item value is resolved by name, not passed as `trueValue`. |
| `text` | [`text`](!code#slot.text.text "string \| undefined") [`id`](!code#slot.text.id "string") [`genericName`](!code#slot.text.genericName "string") | Slot that replaces the text/label of each individual checkbox. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<VPParts
component="VfCheckboxGroup"
:examples="{
default: 'Default',
}"
:schema="{
label: 'Notifications',
info: 'Select the channels where you want to receive notifications. You can choose more than one option.',
help: 'Choose how you want to be notified',
hint: 'Select at least one channel',
rules: 'required',
items: ['Email', 'SMS', 'Push'],
showRequired: ['label'],
onMounted: ({ messageBag }) => {
messageBag.append('Select at least one option', 'error')
messageBag.append('Preferences saved', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfCheckboxes
      name="default"
      v-bind="schema"
    />
</template>
</VPParts>

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
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-checkbox-group` `.vf-choices` |

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

### `group`

The wrapper element containing all checkbox items.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-choices-group` `.vf-stacked?` `.vf-aligned?` |

### `fieldset`

The fieldset element wrapping each group when items are grouped.

| | |
| --- | --- |
| **Element** | `<fieldset>` |

### `legend`

The legend element displaying the group label.

| | |
| --- | --- |
| **Element** | `<legend>` |

### `item`

Props factory for each VfCheckbox child component, receiving the item data.

| | |
| --- | --- |
| **Element** | [`<VfCheckbox>`](./VfCheckbox.md) |

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
   * Element tokens
   * -------------------------------------------------------------------------- */
  --vf-choice-aligned-margin: calc((1lh - var(--p-checkbox-height, 1.25rem)) / 2 + var(--p-inputtext-padding-y)) 0 0 0;

  --vf-choices-direction: column;
  --vf-choices-gutter-x: 0.75rem;
  --vf-choices-gutter-y: 0.25rem;

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
   * Element tokens
   * -------------------------------------------------------------------------- */
  choiceAlignedMargin: 'calc((1lh - var(--p-checkbox-height, 1.25rem)) / 2 + var(--p-inputtext-padding-y)) 0 0 0',

  choicesDirection: 'column',
  choicesGutterX: '0.75rem',
  choicesGutterY: '0.25rem',

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
