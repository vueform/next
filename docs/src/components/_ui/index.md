# Components

Vueform's components all carry the `Vf` prefix and each has its own reference page with usage examples and the full props, context, events, slots, parts, and tokens reference. Elements work two ways — as components in an [inline form](/guide/rendering#inline-forms) or as entries in a [schema](/guide/rendering#schema-based-forms), where the `type` string resolves to the component name (`type: 'text'` renders `VfText`). To bundle only the components you use, see [Code-Splitting](/guide/code-splitting#components).

## Text Inputs

Elements hold a value in the form's model and validate it, and each renders inside the shared [element layout](/guide/element-layout). The `Type` column is the `type` string that picks the component in a schema.

| Component | Type | Description |
| --- | --- | --- |
| [`VfText`](/components/VfText) | `text` | Single-line text input — `inputType` switches it to email, password, number, or any other HTML input type. |
| [`VfTextarea`](/components/VfTextarea) | `textarea` | Multi-line text input with optional autogrow. |

## Selection

| Component | Type | Description |
| --- | --- | --- |
| [`VfSelect`](/components/VfSelect) | `select` | Select input with static, async, or endpoint-loaded items, groups, and multiple selection. |

## Toggles

| Component | Type | Description |
| --- | --- | --- |
| [`VfCheckbox`](/components/VfCheckbox) | `checkbox` | Single checkbox with configurable true / false values. |
| [`VfCheckboxes`](/components/VfCheckboxes) | `checkboxes` | Checkbox group bound to an array value. |
| [`VfRadio`](/components/VfRadio) | `radio` | Standalone radio button. |
| [`VfRadios`](/components/VfRadios) | `radios` | Radio group — one value picked from a list of items. |

## Other Elements

| Component | Type | Description |
| --- | --- | --- |
| [`VfFile`](/components/VfFile) | `file` | File input with single or multiple selection and accepted-type filtering. |
| [`VfButton`](/components/VfButton) | `button` | Button for submit, reset, custom actions, or links — holds no value. |
| [`VfContent`](/components/VfContent) | `content` | Static content between elements — text, expressions, HTML, or custom markup — holds no value. |
| [`VfField`](/components/VfField) | `field` | Headless element — wires a custom input into the model, validation, conditions, and layout through its default slot. |
| [`VfHidden`](/components/VfHidden) | `hidden` | Hidden input — submits a value without visible UI. |

## Containers

Containers nest other elements and shape the model — grids and groups are covered in [form structure](/guide/form-structure), lists and matrices in [repeaters](/guide/repeaters).

| Component | Type | Description |
| --- | --- | --- |
| [`VfForm`](/components/VfForm) | — | The form root — owns the model, validation, and submission, and renders the schema or its template children. |
| [`VfGroup`](/components/VfGroup) | `group` | Wraps related elements — flat by default, so children merge into the parent model. |
| [`VfList`](/components/VfList) | `list` | Repeatable items with add, remove, and sort controls — an array of values or objects. |
| [`VfMatrix`](/components/VfMatrix) | `matrix` | Rows and columns of inputs — radio, checkbox, or any input per cell depending on `mode`. |
| [`VfGrid`](/components/VfGrid) | `grid` | Grid of cells holding elements or plain content, defined via the `grid` prop or `VfRow` / `VfCol` children. |
| [`VfCol`](/components/VfCol) | — | A cell inside a `VfGrid` row — holds elements or plain text. |
| [`VfRow`](/components/VfRow) | — | A row inside `VfGrid`, containing one or more cells. |

## Element Parts

These components render inside an element's layout. Reach for them when overriding layout slots or writing your own markup — see [templates](/guide/templates).

| Component | Description |
| --- | --- |
| [`VfLayout`](/components/VfLayout) | The element layout — label, description, errors, icons, and addons around the control. Every element except `VfHidden` renders inside it. |
| [`VfAddon`](/components/VfAddon) | A single addon cell inside the input wrapper — used when overriding an element's `addonBefore` / `addonAfter` slots. |
| [`VfIcon`](/components/VfIcon) | A single icon — used when overriding an element's `iconBefore` / `iconAfter` slots. |

## Form Parts

These components render inside `VfForm` through its slots — override the matching slot to customize them. Stepped and tabbed forms are covered in [multi-page forms](/guide/multi-page-forms), the language switcher in [multilingual inputs](/guide/i18n#multilingual-inputs).

| Component | Description |
| --- | --- |
| [`VfElements`](/components/VfElements) | Wrapper around the form's rendered elements — override the `elements` slot on `VfForm` to add markup around them. |
| [`VfSteps`](/components/VfSteps) | Progress indicator of a stepped form (`steps` slot). |
| [`VfNav`](/components/VfNav) | Back, Next, and Finish buttons of a stepped form (`nav` slot). |
| [`VfTabs`](/components/VfTabs) | Tab bar of a tabbed form (`tabs` slot). |
| [`VfLanguages`](/components/VfLanguages) | Language switcher of a multilingual form (`languages` slot). |
