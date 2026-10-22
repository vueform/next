---
outline: [2,3]
---

# Dynamic Props

Hardly any prop in Vueform is locked to a static value. A label can be driven by a ref, computed from element state, or carry its own translations; an icon, a numeric boundary, or a date limit can follow the form's data the same way. Component prop tables mark this flexibility with two types:

- **`DProp<T>`** — a _dynamic prop_. Besides its plain value it accepts an [expression](/guide/expressions) string, a Vue ref, or a function of the owning component's [Context](/guide/context).
- **`TProp<T>`** — a _text prop_. Everything a `DProp` accepts, plus a **locale map** — an object carrying one entry per locale. Every user-facing string (labels, placeholders, help texts, button captions, success messages) is a `TProp`.

Trimmed to the essentials, the two unions look like this:

```ts
type DProp<T = string> =
  | T                            // the plain value
  | string                       // expression: 'Hello {name}'
  | Ref<T | string>              // external reactive state
  | ((context$: any) => T)       // computed from component state

type TProp<T = string> =
  | DProp<T>
  | Record<string, T>            // locale map: { en_US: '…', de_DE: '…' }
```

One simplification above: `context$` is really the owning component's [Context](/guide/context) — `el$` for an element, `form$` for the form. Component props type it precisely, so handlers written in templates get a fully typed context; in schemas it stays `any` on purpose — resolving the exact element context for every schema entry would slow type checking down more than the typing is worth.

Whatever shape you pass, it flows through one resolution pipeline — unwrapping, [localization](/guide/translating-props), [expression](/guide/expressions) resolution, and coercion to the prop's real type. This chapter walks through the shapes first, then where each type shows up, and finally the pipeline underneath.

## Plain Value

The everyday form — the value itself, used as-is:

::: code-group

```vue [Template]
<VfText name="email" label="Email address" />
```

```ts [Schema]
defineSchema({
  email: { type: 'text', label: 'Email address' },
})
```

:::

Even a plain string is dynamic in one way: it can contain [expression](/guide/expressions) blocks. `{...}` references resolve against the form's data on every change:

::: usage

```vue [Preview]
<VfText name="first_name" label="First name" default="John" />
<VfText name="greeting" label="Hello {first_name}!" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  first_name: { type: 'text', label: 'First name', default: 'John' },
  greeting: { type: 'text', label: 'Hello {first_name}!' }, // [!code highlight]
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Plain `{path}` interpolation works out of the box; operators and functions need the [expression engine](/guide/expressions#installing-the-expression-engine). See [Expressions](/guide/expressions) for the full syntax and how to [restrict resolution](/guide/expressions#restricting-expression-resolution) per prop.

Because a `DProp` accepts a string alongside its declared type, expressions aren't limited to text: a prop typed `DProp<number>` takes `6` _or_ an expression that computes it — the resolved string is [coerced](#typed-props-and-coercion) back to a number at the end of the pipeline.

## Locale Map

An object keyed by locale code carries every translation in one value — the active locale's entry is selected automatically. Switch the locale below and watch the label and placeholder re-resolve:

::: usage nomodel

```vue [Preview]
<VfText
  name="email"
  :label="{
    en_US: 'Email',
    de_DE: 'E-Mail-Adresse',
  }"
  :placeholder="{
    en_US: 'you@example.com',
    de_DE: 'z. B. name@beispiel.de',
  }"
/>
```

```vue [Template]
<VfText
  name="email"
  :label="{
    en_US: 'Email',
    de_DE: 'E-Mail-Adresse',
  }"
  :placeholder="{
    en_US: 'you@example.com',
    de_DE: 'z. B. name@beispiel.de',
  }"
/>
<VfSelect
  name="locale"
  :items="{
    en_US: '🇺🇸  English',
    de_DE: '🇩🇪  German',
  }"
  default="en_US"
  @change="(value, old, { $locale }) => $locale.set(value)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: {
      en_US: 'Email',
      de_DE: 'E-Mail-Adresse',
    },
    placeholder: {
      en_US: 'you@example.com',
      de_DE: 'z. B. name@beispiel.de',
    },
  },
  locale: {
    type: 'select',
    items: {
      en_US: '🇺🇸  English',
      de_DE: '🇩🇪  German',
    },
    default: 'en_US',
    onChange: (value, old, { $locale }) => $locale.set(value),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

When the active locale isn't in the map, the fallback locale is tried, then the map's first key. See [Locales](/guide/locales) for configuring locales and [Translating Props](/guide/translating-props) for the full localization story.

Each entry is a regular string, so translations can interpolate live form values — the `{...}` blocks resolve **after** the locale entry is picked:

::: usage nomodel

```vue [Preview]
<VfText name="name" label="Name" default="John" />
<VfText
  name="greeting"
  :label="{
    en_US: 'Hello {name}!',
    de_DE: 'Hallo {name}!',
  }"
/>
```

```vue [Template]
<VfText name="name" label="Name" default="John" />
<VfText
  name="greeting"
  :label="{
    en_US: 'Hello {name}!',
    de_DE: 'Hallo {name}!',
  }"
/>
<VfSelect
  name="locale"
  :items="{
    en_US: '🇺🇸  English',
    de_DE: '🇩🇪  German',
  }"
  default="en_US"
  @change="(value, old, { $locale }) => $locale.set(value)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name', default: 'John' },
  greeting: {
    type: 'text',
    label: {
      en_US: 'Hello {name}!',
      de_DE: 'Hallo {name}!',
    },
  },
  locale: {
    type: 'select',
    items: {
      en_US: '🇺🇸  English',
      de_DE: '🇩🇪  German',
    },
    default: 'en_US',
    onChange: (value, old, { $locale }) => $locale.set(value),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The locale map is what separates `TProp` from `DProp`: props the _user_ reads take maps, props the _machine_ reads (icons, numeric bounds, severities) don't — there's nothing to translate.

## Ref

Pass a Vue `ref` (or `computed`) to drive the value from state outside the form:

::: code-group

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'

const label = ref('Email')
</script>

<template>
  <VfText name="email" :label="label" />
</template>
```

```ts [Schema]
import { ref } from 'vue'
import { defineSchema } from '@vueform/ui'

const label = ref('Email')

defineSchema({
  email: { type: 'text', label },
})
```

:::

Updating `label.value` re-renders the prop without re-mounting the element. The ref form works on any dynamic prop — a `Ref<string>` can just as well feed an icon or, holding an expression string, a numeric bound.

## Function

The function form receives the owning component's [Context](/guide/context) and returns the value. Reach for it when the prop depends on runtime state — element state, validation, pager position, anything computable from the context:

::: usage validate

```vue [Preview]
<VfText
  name="password"
  label="Password"
  rules="required|min:8"
  :help="(el$) =>
    el$.touched
      ? `${el$.errors.length} issue(s) to fix.`
      : 'Use at least 8 characters.'"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  password: {
    type: 'text',
    label: 'Password',
    rules: 'required|min:8',
    help: (el$) => // [!code highlight]
      el$.touched // [!code highlight]
        ? `${el$.errors.length} issue(s) to fix.` // [!code highlight]
        : 'Use at least 8 characters.', // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The function runs inside a `computed`, so it re-evaluates whenever the reactive values it reads change. Its return value enters the same pipeline as a directly passed one — a returned string still resolves `{...}` expressions, and for typed props it's coerced to the prop's real type.

## Where Each Type Appears

The rule of thumb: **if a person reads it, it's a `TProp`; if the framework consumes it, it's a `DProp`.** Anything carrying either type in a component's prop table behaves as this chapter describes — check the references under [Components](/components/VfForm).

**Text props (`TProp`)** — localizable, expression-aware strings:

- **Element identity and description** — `label`, `help`, `description`, `displayName`.
- **Input affordances** — `placeholder`, the `text` next to checkboxes and radios, integration extras like PrimeVue's `floatLabel` and `info`.
- **Action and navigation captions** — button `text`, `addLabel` / `removeLabel` on [repeaters](/guide/repeaters), `next` / `back` / `finish` on [multi-page forms](/guide/multi-page-forms).
- **Content** — the `content` of display-only elements, list `placeholder` texts.
- **Submission strings** — the form's `successMessage` and `redirect`.
- **Validation messages** — the values of the `messages` prop ([custom messages](/guide/validation)).

**Dynamic props (`DProp<T>`)** — typed values with the same flexibility, minus the locale map:

- **Icons** — `iconBefore` / `iconAfter` on inputs, `icon` on buttons, `addIcon` / `removeIcon` / `sortIcon` on repeaters: `DProp<string>` resolved as an [icon name](#icons).
- **Numeric bounds** — a slider's `min` / `max` / `step`, a file upload's `maxFileSize` / `fileLimit`: `DProp<number>`.
- **Date bounds** — a date picker's `minDate` / `maxDate`: `DProp<string | Date>`.
- **Variants** — a button's `severity` and similar keyword props: `DProp<'primary' | 'secondary' | …>`.

## Typed Props and Coercion

For a `DProp<T>` where `T` isn't a string, the extra string member of the union is what makes expressions work: the expression resolves to a string, and the pipeline's last step coerces it to the prop's real type.

- **Numbers** pass through `Number()` — `max: '{income}'` on a slider keeps its upper bound in sync with another field.
- **Dates** pass through `new Date()` — `minDate: '{start_date}'` on a date picker prevents picking an end before the start.

```ts
defineSchema({
  start_date: { type: 'date-picker', label: 'Start' },
  end_date: {
    type: 'date-picker',
    label: 'End',
    minDate: '{start_date}', // [!code highlight]
  },
})
```

An empty resolution (the referenced field is empty, the function returns `undefined`) falls back to the prop's default.

### Icons

Icon props resolve their string through the config's icon resolver instead. `$`-prefixed names are **semantic**: `$add`, `$remove`, `$sort` map through the [`icons`](/guide/configuration#icons) entry of the configuration to whatever the installed theme provides, so schemas stay portable across themes. Any other string is passed to the theme's `icon` resolver as-is — with the default themes, a concrete icon CSS class:

```vue
<!-- semantic name — the default: the config maps it (e.g. $add → vf-icon-add) -->
<VfList name="items" add-icon="$add" />

<!-- concrete class, used directly -->
<VfList name="items" add-icon="vf-icon-remove" />
```

Being `DProp`s, icons take refs and context functions too — an icon that switches with validation state is one function away.

### Columns

The `columns` prop follows the same spirit with its own type: besides a number or per-section object it accepts an expression string or a context function, so layout can follow form state:

::: code-group

```vue [Template]
<VfText name="cols" label="Columns (1–12)" :default="6" />
<VfText
  name="email"
  label="Email"
  columns="cols >= 1 and cols <= 12 ? cols : 12"
/>
```

```ts [Schema]
defineSchema({
  cols: { type: 'text', label: 'Columns (1–12)', default: 6 },
  email: {
    type: 'text',
    label: 'Email',
    columns: 'cols >= 1 and cols <= 12 ? cols : 12', // [!code highlight]
  },
})
```

:::

See [Dynamic Column Widths](/guide/form-structure#dynamic-column-widths) for the layout use case.

## Resolution Pipeline

Whatever shape you pass, the value resolves through the same steps, in order:

1. **Unwrap** — a ref is read; a function is called with the component's context.
2. **Localize** — on text props, an object result selects the active locale's entry (falling back to the fallback locale, then the map's first key).
3. **Resolve expressions** — if the prop key [allows it](/guide/expressions#restricting-expression-resolution), `{...}` blocks are evaluated against the form model.
4. **Sanitize** — on props that can render as HTML (`VfContent`'s `content`), the resolved string passes through the [Security](/guide/security) module's sanitizer — but only when it actually contains markup.
5. **Coerce** — the result is converted to the prop's declared type: text props to strings, numeric props via `Number()`, date props via `new Date()`, icon props through the icon resolver. Empty results fall back to the prop's default.

The result is a `ComputedRef` — a change at any step re-renders the consuming component, and only that component.

## HTML Sanitization

Dynamic props aren't meant to carry HTML by default. Labels, hints, and captions render through Vue's text interpolation, so markup shows up escaped, verbatim. Strings render **as HTML** only in the three [`$security.allowHtml`](/guide/security#html-sanitization) areas — `VfContent`'s `content`, string [`slots`](/guide/slots#string-content) entries, and grid string [cells](/guide/form-structure#cells) — and only when the area is listed.

That's where sanitization matters: when HTML-rendered content is fed **dynamic, user-supplied input** (a comment, a database field — anything untrusted, including whatever an expression interpolates). Install the [DOMPurify plugin](/plugins/dompurify) and enable the area:

```ts
import { createVueform } from '@vueform/ui/origin'
import dompurify from '@vueform/dompurify'

createVueform({
  plugins: [dompurify()], // [!code highlight]
  $security: { allowHtml: ['content'] }, // [!code highlight]
})
```

::: warning
Without an installed sanitizer, an allowed area renders its HTML raw with a dev warning in development and **empty in production** — install an engine, or consciously opt out with an identity `sanitizer`. If you write a custom template that puts a resolved prop through `v-html` yourself, you are responsible for sanitizing it. See [Security](/guide/security) for the full picture.
:::

## Choosing a Shape

| Use… | When… |
| --- | --- |
| Plain value | The value is static — and for text, single-language. |
| Expression (`{...}`) | The value derives from form data — static text mixed with field values, or a bound computed from another field. |
| Locale map | The text needs translations in place (text props only). |
| Ref | The value comes from external state (a store, a composable, an API). |
| Function | The value depends on element or form state beyond what `{...}` covers. |

The shapes are interchangeable — every dynamic prop accepts all of them (locale maps on text props). Pick whichever keeps the call site simplest.
