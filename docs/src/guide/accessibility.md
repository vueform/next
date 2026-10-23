---
outline: [2,3]
---

# Accessibility

Vueform renders native controls and wires everything assistive technology needs around them — accessible names, descriptions, ARIA state, live error announcements, and keyboard patterns — without being asked. What's left to you is small. Give elements meaningful names, and keep the wiring intact when you replace markup.

## Labels

Every control gets a programmatic name. When an element has a `label`, the layout renders it as a `<label>` with a `for` attribute pointing at the control's `id`, so clicking it focuses the input and screen readers announce it.

When no label group renders — there is no `label`, or `hideLabel` is set — a screen-reader-only `<label for>` is rendered instead, carrying the element's **`genericName`**. This happens regardless of `placeholder` or `floating`, so even a bare `<VfText name="email" />` announces "email". The `genericName` resolves to the first available of `displayName`, `label`, `floating`, `floatLabel`, `ifta`, `placeholder`, and `name`.

Set `displayName` to control what's announced for a labelless control:

```vue
<VfText name="q" display-name="Search query" />
```

Its second job — the `{attribute}` placeholder in error messages — is covered in [the display name](/guide/validation#the-display-name).

`!VfCheckbox` and `!VfRadio` follow the same rule with their `text` prop — visible text renders as a `<label for>`, and without it a screen-reader-only label carries the `genericName`. An icon-only `!VfButton` — an `icon` and no `text` — gets an `aria-label` from its `genericName`.

### Groups

Containers — `!VfGroup`, `!VfList`, `!VfGrid`, `!VfMatrix` — with a `label` render their root as a `<fieldset>` named by the label through `aria-labelledby`; with `hideLabel` the fieldset carries the `genericName` as `aria-label` instead. A container **without** a label renders a plain `<div>` with no group semantics, so set a label — hidden if needed — to get the group boundary announced. The fieldset also carries `aria-describedby` pointing at the container's help, description, and error regions, and `!VfList` additionally marks its rows as a `role="list"` of `listitem`s. Container labels can render as heading tags — see [headings](/guide/element-layout#headings).

`!VfRadios` and `!VfCheckboxes` put `role="radiogroup"` / `role="group"` on their options wrapper. The group is named by its label — rendered as a `<span>`, since there is no single input a `<label for>` could point at — or by an `aria-label` carrying the `genericName`. Group-level `aria-describedby` (help, description, errors), `aria-invalid`, and `aria-required` sit on the wrapper, while each option keeps its own `<label for>` association. When the items are grouped, each group renders as a `<fieldset>` with a `<legend>`.

`!VfMatrix` cells are named by their row and column headers — each cell's input carries `aria-labelledby="<rowId> <colId>"` — and get a `displayName` of `"<row> / <column>"`, so error messages name the cell. Headers hidden from view still render as screen-reader-only text, keeping the naming intact.

## ARIA Attributes

The native control carries state attributes computed from the element and kept in sync:

| Attribute | Meaning |
| --- | --- |
| `aria-describedby` | The ids of the help, description, and error regions currently rendered. Omitted when none render, and when the element has `layout: false`. |
| `aria-invalid` | The element has an error. |
| `aria-required` | An active `required` or `accepted` rule applies — a [conditional rule](/guide/validation#conditional-rules) toggles it. |
| `aria-busy` | An async rule is [pending or debouncing](/guide/validation#in-flight-state). |

The `aria-describedby` chain tracks what's visible, so a screen reader hears exactly the context a sighted user sees — never a stale or hidden region. Help lives in the label group, so it joins the chain only while the label renders.

Translatable inputs additionally get `lang` set to the language being edited, and their chain starts with a screen-reader-only polite live region announcing the editing language — see [multilingual inputs](/guide/multilingual-inputs).

The required indicator next to the label is `aria-hidden` — `aria-required` already conveys the requirement. Where the indicator appears is governed by [required indicators](/guide/validation#required-indicators).

`!VfText` and `!VfTextarea` default `autocomplete` to the element's `name` whenever it spells a valid HTML autofill token — in kebab, snake, camel, or Pascal case, so `given_name` and `givenName` both resolve to `given-name` — giving autofill and WCAG 1.3.5 (Identify Input Purpose) support for free. Any other name renders no `autocomplete` at all, since browsers ignore invalid tokens. `inputmode` is available as a plain prop.

### ARIA vs Styling Attributes

ARIA attributes serve assistive technology, while `data-*` [state attributes](/guide/parts#state-attributes) serve CSS — one state projecting into both worlds emits both from the same source, like `aria-invalid` alongside `data-invalid`, or `aria-busy` alongside `data-loading`. Native `disabled` serves both at once; only a `!VfButton` rendered as an anchor (`href` or `to`) splits it into `aria-disabled` plus `data-disabled`.

### Overriding ARIA Attributes

Computed ARIA attributes are ordinary part attributes. Part overrides merge after the computed values, so your value wins while every attribute you don't touch keeps resolving — the mechanics live in [parts](/guide/parts):

```ts
{
  email: {
    type: 'text',
    label: 'Email',
    'part:input': { 'aria-describedby': 'signup-terms' },
  },
}
```

## Announcements

Element errors render in a `role="alert"` region, so they're announced the moment they appear — and since the control's `aria-describedby` references the region's id, a user who returns to the field hears the error again in context.

The form-level error summary has `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"`, and `tabindex="-1"`. It exists whenever the form shows form-level errors — an `errorLevel` of `'form'` or `'all'` without `hideErrors`, see [where errors render](/guide/validation#where-errors-render) — and collapses to screen-reader-only while empty, so the live region is registered before the first error arrives. Form messages use `role="status"` with `aria-live="polite"` instead, announced at the next pause rather than interrupting.

A repeater's empty-state `placeholder` is a `role="status"` region the add button's `aria-describedby` points at — see [empty state](/guide/repeaters#empty-state).

### Screen-Reader Text

Every string Vueform announces without a visible counterpart is a locale tag:

| Tag | English value |
| --- | --- |
| `sr_editing_language` | Editing language |
| `sr_step_error` | Please fix errors to move to the next step |
| `sr_step_loading` | Processing data, please wait... |
| `sr_list_add` | Add item |
| `sr_list_remove` | Remove item {index} |
| `sr_list_sort` | Reorder item {index} |
| `sr_matrix_add` | Add row |
| `sr_matrix_remove` | Remove row {index} |
| `sr_matrix_sort` | Reorder row {index} |
| `sr_file_remove` | Remove file {index} |

`{index}` is 1-based. Translate or reword these like any other tag — see [writing a locale](/guide/locales#writing-a-locale). The list and matrix add / remove tags apply only while no visible `addLabel` / `removeLabel` text is set ([labels and icons](/guide/repeaters#labels-and-icons)); sort handles and the file remove button always use theirs.

## Keyboard Navigation

### Tabs and Steps

`!VfTabs` and `!VfSteps` implement the [WAI-ARIA Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):

| Part | Markup |
| --- | --- |
| Tab list | `role="tablist"` |
| List item | `role="none"` |
| Tab button | `role="tab"`, `aria-selected`, `aria-controls` |
| Page panel | `role="tabpanel"`, `aria-labelledby`, `tabindex="0"`, `hidden` while inactive |

The tab list keeps a single tab stop — a roving tabindex landing on the selected tab. Arrow Right / Down moves to the next tab and Arrow Left / Up to the previous one, both wrapping around the ends; Home and End jump to the first and last. The arrows move **focus** only — Enter (or Space, natively on the button) **selects** the focused page, the pattern's manual activation mode. Pages hidden by [conditions](/guide/conditions) are skipped.

Steps the user hasn't reached yet carry `aria-disabled`, and in a sequential stepper selecting them does nothing — see [multi-page forms](/guide/multi-page-forms) for how steps unlock.

### Step Navigation

On `!VfNav`, the back button carries `aria-disabled` on the first page, and next / finish carry `aria-busy` and `aria-disabled` while the current page is loading — its elements are validating, or a step event is in progress. A screen-reader-only `role="status"` region announces the processing or fix-errors message meanwhile, and on the last reached page next / finish point at it with `aria-describedby`.

The form-level language selector (`!VfLanguages`) renders plain buttons with `aria-current` on the active language and `aria-invalid` on languages holding errors — deliberately without a tablist keyboard contract.

## Focus

Every element with a layout exposes `focus(scroll?)` on its [context](/guide/context). It focuses the first focusable node inside the element, optionally scrolling to it first, and resolves `true` when something received focus. There is no `blur()` counterpart.

On a failed submit the form focuses the first invalid element, and a blocked step does the same — the props controlling it live at [scroll and focus](/guide/validation#scroll-and-focus) and [scrolling and focus](/guide/multi-page-forms#scrolling-and-focus).

Decorative content is kept out of the way:

- Icons (`!VfIcon`) and the loading spinner are `aria-hidden`, and so is the empty label column kept for horizontal alignment.
- `!VfFile`'s native input is visually hidden but keyboard-focusable, so the file picker stays operable.
- `!VfHidden` renders an `<input type="hidden">`, or nothing at all with `meta`.

## Custom Markup

Replacing a component's markup through a [template](/guide/templates) or a [slot](/guide/slots) hands you the ARIA wiring the original rendered. All of it rides in each part's `bindings` resolver on the context — call the part's key and spread the result, and the computed attributes keep flowing into your markup. Classes are not part of the bag; bind `context.classes.input` separately. The full surface a template binds is covered in [bindings](/guide/templates#bindings).

The `label`, `help`, `description`, and `errors` bags carry the ids — and the errors region's `role="alert"` — that `aria-describedby` and `aria-labelledby` point at. A replaced region must spread its bag or the relationship breaks; slot replacements receive the resolved bag as their `bindings` prop.

```vue
<!-- MyTextTemplate.vue -->
<script setup lang="ts">
import type { ContextOf } from '@vueform/ui'

defineProps<{ context: ContextOf<'VfText'> }>()
</script>

<template>
  <VfLayout>
    <input
      :id="context.id"
      :value="context.value"
      :class="context.classes.input"
      v-bind="context.bindings.input()"
      @input="context.handleInput"
      @focus="context.handleFocus"
      @blur="context.handleBlur"
    />
  </VfLayout>
</template>
```

Ids derive from the `uid` generator — the element's own id, plus `__label`, `__help`, `__description`, and `__error` suffixes for its regions. For deterministic ids in audits and snapshots, see [uid](/guide/configuration#uid).
