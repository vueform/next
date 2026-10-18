---
outline: [2,3]
---

# Accessibility

Vueform UI renders native HTML inputs and handles the surrounding accessibility wiring — label association, ARIA state reflection, live error announcements, keyboard navigation, and focus management — so the defaults work with screen readers, keyboard-only workflows, and other assistive technologies out of the box. This chapter explains what's provided automatically and how to influence it when you need to.

## Labels

Every input element gets a programmatic label, even when you don't set one yourself.

When you pass a `label` prop, `VfLayout` renders a `<label>` element with a `for` attribute pointing to the input's `id`. The browser's native label association takes care of the rest — clicking the label focuses the input, and screen readers announce it:

```vue
<VfText name="email" label="Email" />
```

```html
<label for="vf-email" id="vf-email__label">Email</label>
<input id="vf-email" type="text" … />
```

When there's **no label** — no `label`, no `floating`, no `placeholder` — Vueform still creates one, but hides it visually. A screen-reader-only `<label>` with `class="sr-only"` is rendered, using the element's resolved `genericName` as its text. The `genericName` is derived from the first available value in this order: `displayName`, `label`, `floating`, `floatLabel`, `ifta`, `placeholder`, `name`. So even a bare `<VfText name="email" />` still announces "email" to assistive technologies.

To control what screen readers announce for a labelless input, set `displayName`:

```vue
<VfText name="q" display-name="Search query" />
```

### Container Labels

Container elements (`VfGroup`, `VfList`, `VfGrid`, `VfMatrix`) behave differently. When a container has a `label`, `VfLayout` renders it as a `<fieldset>` instead of a `<div>`. The label text is linked via `aria-labelledby` to group the children under a common heading. When no label is set, the fieldset gets an `aria-label` with the container's `genericName`, so the group boundary is still announced.

### Choice Group Labels

`VfRadios` and `VfCheckboxes` mark their options container with `role="radiogroup"` / `role="group"`. With a `label`, the group is linked to it via `aria-labelledby` (the label renders as a `<span>` — a `<label for>` would have nothing to point at, since the group has many inputs); without one, the group carries an `aria-label` with the element's `genericName`. Group-level state (`aria-required`, `aria-invalid`, `aria-describedby` to the error region) lives on the group container, while each option keeps its own `<label for>` association.

## ARIA Attributes

Every input element computes a set of ARIA attributes automatically based on its current state. These are bound to the native control (`<input>`, `<select>`, `<textarea>`) and kept in sync as the element's state changes:

| Attribute          | Derived from                                                      | Example value                      |
| ------------------ | ----------------------------------------------------------------- | ---------------------------------- |
| `aria-describedby` | Help, hint, and error region IDs (only those currently rendered). | `"vf-email__help vf-email__error"` |
| `aria-invalid`     | Whether the element has a validation error.                       | `true`                             |
| `aria-required`    | Whether the element has a `required` rule.                        | `true`                             |
| `aria-busy`        | Whether the element is running an async validation check.         | `true`                             |

The `aria-describedby` chain is the key piece. It dynamically points to whichever support regions exist at any given moment. When an element has help text, a hint, **and** a validation error, the input's `aria-describedby` references all three IDs. When only a hint is shown, it references just the hint. When nothing is rendered, the attribute is omitted entirely. This means a screen reader always announces exactly the context that's visible to sighted users — no more, no less.

For translatable elements, the active language indicator is included in the `aria-describedby` chain as well, so screen readers announce which language variant the user is editing.

### ARIA vs. Styling Attributes

ARIA attributes serve assistive technology; styling hooks are a separate aspect served by `data-*` [modifier attributes](/guide/parts#modifiers). When one state projects into both worlds, both attributes are emitted from the same source: an invalid input carries `aria-invalid` **and** `data-invalid`, a loading button carries `aria-busy` **and** `data-loading`. The duplication is deliberate — CSS keys on the `data-*` side, so removing or customizing a styling hook never silently changes what screen readers announce, and vice versa. The one exception is the native `disabled` attribute, which serves both aspects at once wherever the element supports it natively; only controls without a native attribute (a `VfButton` rendering an anchor via `href`/`to`) split it into `aria-disabled` plus `data-disabled`.

### Overriding ARIA Attributes

Computed ARIA attributes are regular attributes on the element's DOM parts, so overrides go through [Parts](/guide/parts) — the parts bindings are applied after the computed bindings, so your value wins:

::: code-group

```ts [Schema]
defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    'part:input': {
      'aria-describedby': 'my-custom-description',
    },
  },
})
```

```vue [Template]
<VfText
  name="email"
  label="Email"
  :part:input="{ 'aria-describedby': 'my-custom-description' }"
/>
```

:::

Attributes you don't override still resolve automatically.

### Autofill and Input Modes

Text-like elements support the `autocomplete` and `inputmode` attributes. When `autocomplete` isn't set and the element's `name` is a valid HTML autofill token (`email`, `tel`, `postal-code`, …), the name is used automatically — fields collecting user data get autofill and WCAG 1.3.5 (Identify Input Purpose) support out of the box. Any other name renders no `autocomplete` at all, since browsers ignore invalid tokens.

## Error Announcements

Validation errors are announced at two levels, both using ARIA live regions so screen readers pick them up without requiring the user to navigate to them.

### Element Errors

Each element's error container is rendered with `role="alert"`. When validation fails and errors appear in the DOM, assistive technologies announce them immediately:

```html
<div id="vf-email__error" role="alert" class="vf-errors">
  <div class="vf-error">
    The email field must be a valid email address.
  </div>
</div>
```

The error region's `id` is referenced by the input's `aria-describedby`, so a screen reader user who re-reads the input also hears the error in context.

### Form Errors

`!VfForm` renders a form-level error summary with `role="alert"`, `aria-live="assertive"`, and `aria-atomic="true"`. When `showErrors` is enabled and validation fails, the summary is announced as a whole. When no errors are present, the container collapses to `sr-only` — it stays in the DOM so the live region is registered, but nothing is visible or announced.

Form-level messages (success confirmations, informational notices) use a separate container with `role="status"` and `aria-live="polite"`, so they're announced at the next convenient pause rather than interrupting the user.

## Keyboard Navigation

### Tabs and Steps

Tabbed and stepped forms implement the [WAI-ARIA Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). The rendered markup uses the correct roles and states:

| Part                | Role / attribute                                              |
| ------------------- | ------------------------------------------------------------- |
| Tab/step list       | `role="tablist"`                                              |
| Individual tab/step | `role="tab"`, `aria-selected`, `aria-controls`                |
| List item wrapper   | `role="none"` (strips semantics from the `<li>`)              |
| Page panel          | `role="tabpanel"`, `aria-labelledby` pointing back to the tab |

Keyboard behavior follows the roving-tabindex pattern:

- **Tab** moves focus into the tab list, landing on the selected tab.
- **Arrow Right / Arrow Down** moves to the next tab.
- **Arrow Left / Arrow Up** moves to the previous tab.
- **Home** moves to the first tab; **End** moves to the last.
- Arrow keys wrap around — pressing Right on the last tab focuses the first.

Only the focused (or selected) tab has `tabindex="0"`; all others have `tabindex="-1"`. This keeps a single tab stop in the tab list so keyboard users can move past it efficiently.

For stepped forms, `VfSteps` also reflects `aria-disabled` on steps the user hasn't unlocked yet, preventing confusion about which steps are reachable.

### Step Navigation

`VfNav` (the back / next / finish navigation bar) reflects loading and error state through ARIA attributes on its buttons:

- `aria-busy` and `aria-disabled` are set to `true` while the form is loading or validating.
- `aria-describedby` points to a `role="status"` screen-reader-only region that announces whether the step has errors or is loading. This region only appears when relevant and is read by assistive technologies without visual clutter.

## Focus Management

Every input element exposes `focus()` and `blur()` methods on its [context](/guide/context). Elements that support blur-based validation (`validateOn: 'blur'`) trigger validation automatically when the input loses focus — no extra wiring needed.

The pager system manages focus across pages: each resolved page exposes `focus()`, `blur()`, and `keydown()` handlers. When arrow keys move the selection in the tab list, the corresponding tab button receives DOM focus so keyboard and ARIA state stay in sync.

## Checkboxes and Radios

`VfCheckbox` and `VfRadio` always have a label associated with their input — either the visible `text` prop rendered as a `<label>` with a `for` attribute, or a screen-reader-only `<label>` with the `genericName` when no `text` is provided:

```html
<!-- With text -->
<input type="checkbox" id="vf-terms" … />
<label for="vf-terms">I agree to the terms</label>

<!-- Without text -->
<input type="checkbox" id="vf-terms" … />
<label for="vf-terms" class="sr-only">terms</label>
```

Both types set `aria-describedby`, `aria-invalid`, and `aria-required` on the native `<input>`, following the same state-driven logic as text inputs.

## Required Indicator

When an element has a `label` and a `required` validation rule, Vueform appends a `*` indicator to the label. This indicator is marked with `aria-hidden="true"` so screen readers don't announce the raw asterisk — they already know the field is required from `aria-required="true"` on the input.

## Hidden and Decorative Elements

A few elements produce content that isn't meaningful to assistive technologies:

- `VfHidden` renders an `<input type="hidden">` (or nothing at all with `meta: true`). Hidden inputs are ignored by screen readers by design.
- Placeholder labels used for horizontal layout alignment are marked `aria-hidden="true"` so they don't confuse screen reader navigation.
- The file input in `VfFile` is styled as `sr-only` — visually hidden but still keyboard-focusable, so the native file picker works as expected.

## Custom Templates

When you [rewire a template](/guide/templates), you take on responsibility for the ARIA attributes that template previously rendered. The element's `a11yBindings` computed is available on the [context](/guide/context) (and is passed to replacement slots directly). It is always keyed by part — each key holds a ready-to-spread bag of attributes for that DOM part, so one `v-bind` carries everything:

```vue
<!-- MyTextTemplate.vue -->
<script setup lang="ts">
import type { ContextOf } from '@vueform/ui'

defineProps<{ context: ContextOf<'VfText'> }>()
</script>

<template>
  <VfLayout>
    <input
      :name="context.name"
      :id="context.id"
      :value="context.value"
      v-bind="{ ...context.a11yBindings.input, ...context.parts.input }"
      @input="context.handleInput"
    />
  </VfLayout>
</template>
```

Besides `input`, the bags cover the layout-rendered parts too — `label`, `help`, `description`, and `error` each carry the `id` (and `role` for the error region) that the input's `aria-describedby` points at. If your template replaces one of those regions, spread the matching bag onto your replacement so the id relationships stay intact. If you skip the bindings, the input loses its connection to those regions and screen readers won't announce errors, help text, or the required state.
