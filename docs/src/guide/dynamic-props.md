---
outline: [2,3]
---

# Dynamic Props

A dynamic prop resolves its value while the form runs, not when you write it. The same `label` can be a plain string in one form, an expression mixing in another field's value in the next, a ref driven from a store, or a function of the element's live state. Component reference tables mark these props with two types — the **dynamic prop** (`DProp`) and its translatable **text prop** variant (`TProp`) — and whatever shape you pass runs through one reactive pipeline and lands on the component's context as a plain resolved value.

## The Two Types

Trimmed to their essence, the two unions look like this:

```ts
type DProp<T, TContext> =
  | T
  | string // (string & {}) in source, so T's literal autocomplete survives
  | Ref<T | string>
  | ((context$: TContext) => T | string)

type TProp<T, TContext> =
  | DProp<T, TContext>
  | Record<string, T | string> // locale map
```

A plain value is used as-is. A string may carry `{...}` blocks that resolve against the form's data — the syntax, the engine behind it, and how to switch resolution off are covered by [expressions](/guide/expressions).

The separate `string` member is why typed props take expressions too. A `DProp<number>` accepts `6` or a string that resolves to a number, and the pipeline [converts it back](#coercion) to the declared type.

`TProp` adds one more shape, the [locale map](/guide/translating-props#locale-maps) — an object keyed by locale code from which the active locale picks its entry. The shape, its fallback chain, and examples live in [translating props](/guide/translating-props#locale-maps).

The rule of thumb separating the two is simple. Text a person reads is a `TProp`, while values the framework consumes — icons, numeric bounds, severities — are `DProp`s, because there's nothing to translate. Reference tables show the exact type per prop, e.g. `TProp<string, TContext>` on [`!VfForm`'s `successMessage`](/components/VfForm#props.successMessage), and both types are importable from `@vueform/ui` for your own prop interfaces.

## Refs

Reach for a ref when the value comes from state outside the form — a store, a composable, an API response. It drops straight into a schema entry, keeping the prop live where the definition would otherwise read as static data:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { defineSchema, useForm } from '@vueform/ui'

const label = ref('Email')

const schema = defineSchema({
  email: { type: 'text', label },
})

const [MyForm] = useForm({ schema })
</script>

<template>
  <MyForm />
</template>
```

A `computed` works the same, since it's a ref. Writing to the ref re-resolves the prop in place, with no re-mount. The ref's value then goes through the rest of the [pipeline](#resolution-pipeline) — a ref holding `'{first_name}'` still interpolates, and on typed props the result is still coerced.

## Functions

Reach for a function when the value needs logic that `{...}` can't carry — arbitrary JavaScript beyond the expression language's operator set, calls into your own or a library's code, or values captured from the surrounding scope (an import, a component-local variable) that no path or `@prop` reference can address. The function receives the owning component's [context](/guide/context#context-from-argument) as its argument.

```ts
{
  password: {
    type: 'text',
    inputType: 'password',
    label: 'Password',
    help: (el$) =>
      el$.touched
        ? `${el$.errors.length} issue(s) to fix.`
        : 'Use at least 8 characters.',
  },
}
```

The function runs inside a `computed`, so it re-runs whenever a reactive value it reads changes, and only then. Its return value continues down the [pipeline](#resolution-pipeline) — a returned string still resolves `{...}` blocks, and on typed props it's still coerced.

The context parameter is typed per component, in templates and in schemas alike — inside a `defineSchema` text entry, the `el$` above is a `VfTextContext`. The `any` default of `TContext` applies only when you use the bare `DProp<T>` / `TProp<T>` in your own types.

For dynamic text, choosing between a function and an expression is also a performance call — see [performance](/guide/performance#prefer-structured-conditions-for-logic).

## Resolution Pipeline

Every shape resolves through the same ordered steps inside one `computed`, and the result is exposed on the component's context under the prop's own name — `el$.label` is the resolved string, while `el$.props.label` holds the raw input.

1. **Unwrap.** A ref is read. If the prop is `undefined`, the component's own default (if any) takes over and nothing else runs — step buttons, for example, fall back to the `steps_next` / `steps_back` / `steps_finish` locale tags.
2. **Call.** A function is called with the [context](/guide/context).
3. **Localize** (`TProp` only). An object picks its locale entry through the [resolution chain](/guide/translating-props#the-resolution-chain), and plain strings pass through.
4. **Resolve expressions.** A string containing `{` is resolved against the form's data — unless the element or form sets `noExpressions`, or the [`$expression.whitelist`](/guide/configuration#expression) excludes the prop. The whitelist key is the prop's **kebab-case** name (`success-message`, `icon-before`). See [restriction levels](/guide/expressions#restriction-levels).
5. **Sanitize** (`!VfContent`'s `content` only). A resolved string containing markup goes through the security module's sanitizer — see [HTML sanitization](/guide/security#html-sanitization).
6. **Check URLs.** `redirect` accepts `http` / `https`, and a button's `href` / `to` accept `http` / `https` / `mailto` / `tel`. Relative URLs pass, while any other scheme resolves to `undefined` with a dev warning — see [always-on guards](/guide/security#always-on-guards).
7. **Fall back.** A result of `''` — an expression whose referenced field is empty, an empty locale entry — falls back to the component's default, just like an `undefined` prop in step 1.
8. **Coerce.** The value is converted to the prop's declared type, covered next.

The steps are lazy and fine-grained — a change at any of them, be it a ref write, a locale switch, or an edit in a referenced field, re-resolves only that one prop.

### Coercion

Each prop declares its target, so the last step differs per prop:

- **Numbers** go through `Number()`.
- **Dates** turn strings into `new Date(...)`, while a `Date` passes through untouched.
- **Icons** go through the icon resolver, [below](#icons).
- **Props that render as a string** — `label`, `help`, `successMessage`, `redirect`, page labels, rule messages — are stringified.
- **Everything else** is normalized, so canonical numeric strings become numbers (`'5'` → `5`, while `'5.0'` and `'007'` stay strings).

Coercion is what closes the expression round trip on typed props — on a `DProp<number>`, the string `'{income}'` resolves against the referenced field and comes back as a number.

Only an `undefined` prop — raw or held in a ref — and a `''` resolution fall back to the default. A function that returns `undefined` skips the fallback, so string props resolve to `''` and the rest to `undefined`.

### Icons

Icon props are `DProp<string>`. A `$`-prefixed name (`$add`, `$remove`, `$sort`) maps through the [`icons` config](/guide/configuration#icons) before reaching the `icon` resolver, while any other string goes to the resolver as-is — and with the default resolver, that string is the CSS class. Built-in list, matrix, and file buttons default to these semantic names. Per-element usage lives in [element layout](/guide/element-layout#icons).

## Where Each Type Appears

Which props are dynamic varies per component, and there is no list to memorize — each component's reference page marks them. A prop typed `DProp` or `TProp` in its **Props** tab resolves through the pipeline above, and everything else is a plain prop. [`!VfText`'s props](/components/VfText#props), for example, mark `label` and `placeholder` as `TProp`s and `iconBefore` as a `DProp<string>` among others.

### Props With Their Own Shapes

A few props carry neither type yet accept similar shapes through their own mechanism, so they don't follow the pipeline above:

- `columns` takes a number, a breakpoint object, a function, or a bare expression, but no ref — see [dynamic column widths](/guide/form-structure#dynamic-column-widths).
- `conditions`, and conditional `disabled` / `readonly`, follow the condition formats — see [conditions](/guide/conditions#disabled-and-readonly).
- `default` with an expression becomes a tracked computed value, not a resolved prop — see [computed defaults](/guide/expressions#computed-defaults).
- `addonBefore` / `addonAfter` take strings, locale maps, schemas, or functions through the addon system — see [functional addons](/guide/element-layout#functional-addons).
- The form's `consts` resolve through their own logic — see [constants](/guide/expressions#constants).
