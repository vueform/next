# Components

Vueform's components all carry the `Vf` prefix and each has its own reference page with usage examples and the full props, context, events, slots, and parts reference. Most elements wrap a PrimeVue widget and forward its entire API — the original props, events, and slots keep working as PrimeVue documents them, while Vueform adds data binding, validation, conditions, and layout on top. Elements work two ways — as components in an [inline form](/guide/rendering#inline-forms) or as entries in a [schema](/guide/rendering#schema-based-forms), where the `type` string resolves to the component name (`type: 'date-picker'` renders `VfDatePicker`). To bundle only the components you use, see [Code-Splitting](/guide/code-splitting#components).

## Text Inputs

Elements hold a value in the form's model and validate it, and each renders inside the shared [element layout](/guide/element-layout). The `Type` column is the `type` string that picks the component in a schema.

| Component | Type | Description |
| --- | --- | --- |
| [`VfInputText`](/components/VfInputText) | `input-text` | PrimeVue [InputText](https://v4.primevue.org/inputtext/) — single-line text input with float-label support. |
| [`VfTextarea`](/components/VfTextarea) | `textarea` | PrimeVue [Textarea](https://v4.primevue.org/textarea/) — multi-line text input. |
| [`VfInputMask`](/components/VfInputMask) | `input-mask` | PrimeVue [InputMask](https://v4.primevue.org/inputmask/) — text input constrained to a mask pattern. |
| [`VfInputOtp`](/components/VfInputOtp) | `input-otp` | PrimeVue [InputOtp](https://v4.primevue.org/inputotp/) — one-time-passcode input. |
| [`VfPassword`](/components/VfPassword) | `password` | PrimeVue [Password](https://v4.primevue.org/password/) — password input with strength meter. |
| [`VfAutoComplete`](/components/VfAutoComplete) | `auto-complete` | PrimeVue [AutoComplete](https://v4.primevue.org/autocomplete/) — text input with suggestions. |
| [`VfEditor`](/components/VfEditor) | `editor` | PrimeVue [Editor](https://v4.primevue.org/editor/) — Quill-powered rich-text editor. |

## Numeric

| Component | Type | Description |
| --- | --- | --- |
| [`VfInputNumber`](/components/VfInputNumber) | `input-number` | PrimeVue [InputNumber](https://v4.primevue.org/inputnumber/) — numeric input with formatting and spinner buttons. |
| [`VfSlider`](/components/VfSlider) | `slider` | PrimeVue [Slider](https://v4.primevue.org/slider/) — drag handle for a number or range. |
| [`VfKnob`](/components/VfKnob) | `knob` | PrimeVue [Knob](https://v4.primevue.org/knob/) — circular dial. |
| [`VfRating`](/components/VfRating) | `rating` | PrimeVue [Rating](https://v4.primevue.org/rating/) — star rating. |

## Selection

| Component | Type | Description |
| --- | --- | --- |
| [`VfSelect`](/components/VfSelect) | `select` | PrimeVue [Select](https://v4.primevue.org/select/) — dropdown single select. |
| [`VfMultiSelect`](/components/VfMultiSelect) | `multi-select` | PrimeVue [MultiSelect](https://v4.primevue.org/multiselect/) — dropdown multiple select. |
| [`VfListbox`](/components/VfListbox) | `listbox` | PrimeVue [Listbox](https://v4.primevue.org/listbox/) — always-visible option list. |
| [`VfCascadeSelect`](/components/VfCascadeSelect) | `cascade-select` | PrimeVue [CascadeSelect](https://v4.primevue.org/cascadeselect/) — dropdown over nested option groups. |
| [`VfTreeSelect`](/components/VfTreeSelect) | `tree-select` | PrimeVue [TreeSelect](https://v4.primevue.org/treeselect/) — dropdown over tree-structured options. |
| [`VfSelectButton`](/components/VfSelectButton) | `select-button` | PrimeVue [SelectButton](https://v4.primevue.org/selectbutton/) — button group for short visible option sets, single or multiple. |

## Toggles

| Component | Type | Description |
| --- | --- | --- |
| [`VfCheckbox`](/components/VfCheckbox) | `checkbox` | PrimeVue [Checkbox](https://v4.primevue.org/checkbox/) — single checkbox. |
| [`VfCheckboxGroup`](/components/VfCheckboxGroup) | `checkbox-group` | Group of checkboxes bound to a single array value. |
| [`VfRadioButton`](/components/VfRadioButton) | `radio-button` | PrimeVue [RadioButton](https://v4.primevue.org/radiobutton/) — standalone radio button. |
| [`VfRadioButtonGroup`](/components/VfRadioButtonGroup) | `radio-button-group` | Group of radio buttons bound to a single value. |
| [`VfToggleSwitch`](/components/VfToggleSwitch) | `toggle-switch` | PrimeVue [ToggleSwitch](https://v4.primevue.org/toggleswitch/) — on / off switch. |
| [`VfToggleButton`](/components/VfToggleButton) | `toggle-button` | PrimeVue [ToggleButton](https://v4.primevue.org/togglebutton/) — two-state button. |

## Pickers

| Component | Type | Description |
| --- | --- | --- |
| [`VfDatePicker`](/components/VfDatePicker) | `date-picker` | PrimeVue [DatePicker](https://v4.primevue.org/datepicker/) — calendar for dates, ranges, and times. |
| [`VfColorPicker`](/components/VfColorPicker) | `color-picker` | PrimeVue [ColorPicker](https://v4.primevue.org/colorpicker/) — color selection. |

## Other Elements

| Component | Type | Description |
| --- | --- | --- |
| [`VfFileUpload`](/components/VfFileUpload) | `file-upload` | PrimeVue [FileUpload](https://v4.primevue.org/fileupload/) — file selection with preview and upload. |
| [`VfButton`](/components/VfButton) | `button` | PrimeVue [Button](https://v4.primevue.org/button/) — submit, reset, custom actions, or links — holds no value. |
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

## Form Parts

These components render inside `VfForm` through its slots — override the matching slot to customize them.

| Component | Description |
| --- | --- |
| [`VfElements`](/components/VfElements) | Wrapper around the form's rendered elements — override the `elements` slot on `VfForm` to add markup around them. |
| [`VfNav`](/components/VfNav) | Back, Next, and Finish buttons of a stepped form (`nav` slot). |
