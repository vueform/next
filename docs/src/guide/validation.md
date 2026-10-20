---
outline: [2,3]
---

# Validation

Vueform ships its own dependency-free validation system — 50+ built-in rules, custom rules, async checks, conditional activation, localized messages. It is also fully [Standard Schema](https://standardschema.dev) compatible — Zod, Valibot, or ArkType schemas plug straight in, and a form's rules export back out, so frontend and backend can share one validation definition.

Whether rules are declared in a schema or inline on components, validation runs with or without a mounted form — the same rules that power a rendered form can check a plain data model headlessly.

## Your First Rule

Rules are declared on an element with the `rules` prop:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
})

const [MyForm] = useForm({ schema, endpoint: '/api/subscribe' })
</script>

<template>
  <MyForm />
</template>
```

```vue [Template]
<template>
  <VfForm endpoint="/api/subscribe">
    <VfText name="email" label="Email" rules="required|email" />
  </VfForm>
</template>
```

:::

That one prop is a complete validation setup. With nothing else configured:

- The element **validates** on its first **blur**, and the failing rule's message renders beneath the input — localized, with the element's label filled in: _"The Email must be a valid email address."_
- Once a rule has **failed**, every subsequent edit **revalidates**, so the user gets immediate feedback exactly while they're correcting the value.
- **Submitting** validates everything that doesn't currently pass. A failure blocks the request, and Vueform scrolls to and focuses the first invalid element by default.

The rendered errors are projections of state you can also read in code, wherever an [element](/guide/context#element-context) or [form context](/guide/context#form-context) is available:

```ts
formReady(async (form$) => {
  const email$ = form$.find('email')

  await email$.validate() // runs required|email against the current value

  email$.invalid // true — the value is empty, so `required` fails
  email$.errors  // ['The Email field is required.']

  form$.errors   // { email: ['The Email field is required.'] }
  form$.issues   // [{ path: 'email', rule: 'required', message: '…' }]
})
```

`errors` carries the readable messages; `issues` is the structured counterpart with the path and the rule behind each one. The full validation API is documented in each [component](/components)'s context reference — see the validation section of [the form's context](/components/VfForm#context.section-validation) and of each element's, e.g. [VfText](/components/VfText#context.section-validation).

Declaring the rule is the entire job. When rules run, what the messages say, and where errors appear are defaults you can tune.

## When Rules Run

A mounted element validates when one of its triggers fires. The form's `validateOn` prop picks the triggers for every element in it:

```vue
<VfForm :validate-on="['change', 'blur']">
  <VfText name="email" rules="required|email" />
</VfForm>
```

| Trigger  | Validates                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------- |
| `change` | the element, on every change to its value                                                                |
| `blur`   | the element, on its first blur                                                                           |
| `next`   | the current [page](/guide/multi-page-forms)'s elements, before stepping forward                                                     |
| `back`   | the current [page](/guide/multi-page-forms)'s elements, before stepping back                                                        |
| `submit` | every element, from scratch, on **every** submit attempt |

The default is `['blur', 'next']` — an element stays quiet while the user types into it the first time and gets checked when they leave it, or when they move between form steps. The default can be changed app-wide as a `!VfForm` [default](/guide/defaults).

### Element Triggers

An element's own `validate-on` **overrides** the form's setting for that element. Only the input-driven triggers apply at this level — `change` and `blur`:

```vue
<VfText name="email" rules="required|email" :validate-on="['change']" />
```

Some elements can't be focused, so a blur never reaches them — those only support `'change'`.

### Submission Trigger

Submitting **always validates**, no matter what `validateOn` contains. Before the request goes out, every element without a **current passing** result runs its rules. That covers three groups:
- elements that **never validated**
- elements whose value **changed** since they last validated (through any path, be it typing, `update()`, `load()`, or a server write-back)
- elements that are currently **failing**, which gives async checks whose server-side answer may have changed a fresh chance on each attempt.

Elements already passing against their current value keep their result, so async checks aren't re-paid and debounce timers aren't re-waited.

Adding `'submit'` to `validateOn` upgrades this baseline to a full re-run — every element validates on **every attempt**, prior results ignored:

```vue
<VfForm :validate-on="['blur', 'next', 'submit']" endpoint="/api/register" />
```

Reach for the full re-run when a result can go stale without the value changing — time-based rules in long-lived forms, or rules reading external state the form can't observe. The price is paying every async rule's round-trip on each attempt.

### Live Feedback

Triggers describe a form nobody has interacted with yet. Interaction escalates the schedule:

1. After an element **fails** a rule, every subsequent change re-validates it until it passes again.
2. After an element's **first blur** (with the `blur` trigger active), every subsequent change validates it.
3. After the form's **first submit attempt**, every element validates on every change for the rest of the form's life — regardless of `validateOn`.

The result is a deliberate UX curve. Fresh input is never flagged mid-word, the first completed interaction gets checked, and from then on the user sees the error flip to resolved the moment their correction lands.

### Turning Validation Off

The form context's `disableValidation()` suppresses validation entirely, including the submit-time baseline:

```ts
form$.disableValidation() // submits now skip validation
form$.enableValidation()  // and now they check again
```

This is deliberately a method and not a prop. Switching validation off should be a conscious act at a specific point in code, not a template flag that quietly ships to production. While it's off, `submit()` sends whatever the model holds, and your backend's `422` handling ([Server Validation Errors](/guide/submit#server-validation-errors)) is the only remaining net.

## The Rule Language

Rules are named checks chained with pipes — the string syntax from the first example scales to any number of rules:

```vue
<VfText name="username" rules="required|alpha_num|min:3" />
```

The same list can be written as an **array**:

```vue
<VfText name="username" :rules="['required', 'alpha_num', 'min:3']" />
```

The two resolve identically. The array form becomes necessary once entries other than strings join the list — custom rule definitions, Standard Schemas, or conditional wrappers, each covered later in this chapter.

### Parameters

A rule takes parameters after a colon, comma-separated and matched by **position**:

```
min:5
between:1,10
digits_between:4,8
```

Parameters can also be passed by **name** using `=`:

```
dimensions:width=100,height=200
```

Most rules accept both styles; a few — `dimensions` among them — only take named parameters.

One parameter name is reserved on every rule — `debounce` delays that single rule's run by the given milliseconds (`email:debounce=500`). Debouncing has its own section later in the chapter.

### Referencing Other Elements

The comparison rules (`same`, `different`, `gt`, `gte`, `lt`, `lte`, `in_array`) and the date rules (`after`, `before`, …) accept an [element path](/guide/element-paths) in place of a literal value:

```
same:password
gt:min_price
after:start_date
```

Dot paths reach elements nested in [groups](/guide/form-structure#grouping-elements), and wildcard paths resolve siblings inside a list:

```
same:address.city
gt:billing.subtotal
same:users.*.email
```

Vueform **watches** the referenced element — whenever its value changes, the rule re-runs on its own, no extra wiring needed.

### How Many Rules Run

By default an element stops validating at its first failing rule — the `bail` prop is `true`:

```vue
<VfText name="email" rules="required|email|min:5" />
```

If `required` fails here, `email` and `min` never run. Set `bail` to `false` to run the full chain and collect every failure:

```vue
<VfText name="email" rules="required|email|min:5" :bail="false" />
```

`bail` only decides how many rules **run**. How many of the collected errors are **shown** is a display setting (`maxErrors`), covered with the rest of the display options later in the chapter.

### The Built-in Catalog

All 50+ built-in rules are registered out of the box and referenced by name — nothing to import. Each has its own page with parameters, behavior, and examples in the [Rules reference](/rules/). To ship only the rules you actually use, see [Code-Splitting](/guide/code-splitting).

## Validating with Zod and Standard Schema

[Standard Schema](https://standardschema.dev) is a shared, types-only contract implemented by Zod (3.24+), Valibot, ArkType, and a growing list of validation libraries. Vueform accepts any spec-compliant schema and vendors the interface itself — there is nothing to install, and core stays dependency-free.

### A Schema as an Element's Rules

A Standard Schema can be an element's entire `rules` value, or one entry in the array next to ordinary rules:

```ts
import { z } from 'zod'

defineSchema({
  email: {
    type: 'text',
    rules: z.string().email(),
  },
  username: {
    type: 'text',
    rules: ['required', z.string().min(3).regex(/^[a-z0-9_]+$/)],
  },
})
```

The schema validates the element's current value with the **same lifecycle** as any other rule — same triggers, same live feedback, same state. An async schema (a Zod `refine` with an async function, for instance) behaves like an async rule, including its pending state — async validation is covered later in the chapter.

Error messages come from the schema library itself — configure them where you define the schema, with Zod's `message` options for example.

### One Schema for the Whole Form

Element rules check one value at a time. A **Validation Schema** validates the whole model with a single Standard Schema. Its strongest case is a schema your backend already validates with — attach it to the form, and both sides enforce the same constraints from one definition:

```ts
import { z } from 'zod'
import { defineSchema, useForm } from '@vueform/ui'

// the same schema your server validates the payload with
const registration = z
  .object({
    password: z.string().min(8),
    password_confirmed: z.string(),
  })
  .refine((data) => data.password === data.password_confirmed, {
    message: "Passwords don't match.",
    path: ['password_confirmed'],
  })

const schema = defineSchema(
  {
    password: { type: 'text', inputType: 'password' },
    password_confirmed: { type: 'text', inputType: 'password' },
  },
  registration
)

const [MyForm] = useForm({ schema })
```

Note that no element declares `rules` here — the minimum length and the confirmation check both come from the Zod schema, which validates them interactively in the form exactly as it validates the payload on the server. Element rules and a Validation Schema also combine freely when you want both.

As `!defineSchema`'s second argument, the Validation Schema travels with the schema — every model and form built from it inherits it. It can also be attached to a single model or a single form instead:

```ts
const model = useModel(schema, seed, { validationSchema })
const [MyForm] = useForm({ schema, validationSchema })
```

When it's attached in more than one place, the narrowest scope wins and the others are ignored — form beats model beats form schema. The same goes for an inline `!VfForm` — its `validation-schema` prop overrides whatever the schema or model it receives already carries.

Vueform warns in development when a prop or instance option silently overrides an attached Validation Schema.

The Validation Schema runs ahead of the element rules whenever **anything** validates — a single element firing its trigger, a submit, a manual `validate()` call. Its result is cached against the model, so a run where no value changed costs nothing, and once it has run, any model change re-runs it to keep its messages live.

### Where Its Errors Appear

Every issue a Validation Schema produces carries a path, and Vueform maps those paths onto elements:

- A path matching an element (`password_confirmed` above) puts the message **on that element**, next to its own rule errors.
- A path matching nothing — a root-level `refine`, or a path outside the form — lands in the **root bucket**, shown at the form level and available under the `''` key of `form$.errors`.

### Type Safety

The Validation Schema is checked against the form schema at **compile time**. Every element type has a model type — `type: 'text'` models `string | number | null`, a checkbox models a boolean, a file element a `File` — and the Validation Schema's inferred input type is compared against that model shape, key by key:

```ts
// ✅ string fits the text model
defineSchema({ name: { type: 'text' } }, z.object({ name: z.string() }))

// ❌ type error: key `nam` doesn't exist in the model
defineSchema({ name: { type: 'text' } }, z.object({ nam: z.string() }))

// ❌ type error: `Date` is incompatible with the text model
defineSchema({ name: { type: 'text' } }, z.object({ name: z.date() }))
```

A mismatch surfaces right where you write the schema — as a diagnostic naming the offending keys — not at runtime. The check is structural and pragmatic:

- **Partial coverage is fine** — the schema may validate only some of the model's keys.
- **Narrower is fine** — `z.enum(['a', 'b'])` is accepted against a `string` model; only the model being narrower than the input is an error.
- **Nullability is tolerated** — `z.string()` and `z.string().nullable().optional()` both fit a `string | null` model.
- **Nesting is followed** — groups and lists compare structurally against their nested model shapes.

The strict check applies wherever the two schemas meet with full type information — `!defineSchema`, `!defineComputedSchema`, and `!useModel`'s option. `!useForm`'s `validationSchema` option is looser — a mismatch there falls back to the untyped overload instead of erroring, which is one more reason to prefer attaching via `!defineSchema`. <!-- @todo: after completing .temp/tasks/useform-refact.md, useForm should gain full consistency -->

## Writing Your Own Rules

A custom rule is a check function created with the `createRule` factory:

```ts
import { createRule } from '@vueform/ui'

const lowercase = createRule('lowercase', (value) => {
  return value === value.toLowerCase()
})
```

The definition goes straight into an element's `rules` array, next to any other rule:

```vue
<VfText name="username" :rules="['required', lowercase]" />
```

The check receives the current value and a rule **context** — the element ([`el$`](/guide/context#element-context)), the form ([`form$`](/guide/context#form-context)), declared `params`, and helpers. It returns `true` for valid, `false` for invalid, or a **string** for invalid with that string as the message.

::: info
`!createRule` is context-free — it's safe to call at module scope, even before `createVueform` runs, so rules can live in their own shared modules.
:::

### Error Message

A check that returns plain `false` falls back to the generic locale message (_"Invalid field"_ in `en_US`). Return a string for a one-off message, or set the `message` option to give the rule its message once, with placeholders available:

```ts
const lowercase = createRule('lowercase', (value) => {
  return value === value.toLowerCase()
}, {
  message: 'The {attribute} must be lowercase.',
})
```

`{attribute}` resolves to the element's display name — whatever human-readable text the element already presents to the user (each element decides which of its texts that is), falling back to its `name` — so a field presented as _Username_ reads _"The Username must be lowercase."_

Both the returned string and the `message` option also accept locale-keyed objects for multilingual messages, and can name a locale tag instead of literal text — covered with the rest of message handling later in the chapter.

### Parameters

Declare parameter names with the `params` option:

```ts
const minWords = createRule(
  'min_words',
  (value, { params }) => {
    const count = value.trim().split(/\s+/).length
    return count >= Number(params.min)
  },
  {
    params: ['min'],
    message: 'Must have at least {min} words.',
  }
)
```

The `params` object in the check is **typed from the declaration** — every declared name is a known key, so `params.min` autocompletes and a typo is a compile error.

Calling the definition returns a configured copy (the original is never mutated), with arguments passed by position or by name:

```vue
<!-- Positional -->
<VfText name="bio" :rules="['required', minWords(3)]" />

<!-- Named -->
<VfText name="bio" :rules="['required', minWords({ min: 3 })]" />
```

Once [registered globally](#registering-rules-globally), the same parameters travel in the rule string:

```vue
<VfText name="bio" rules="required|min_words:3" />
```

Append `?` to mark a parameter optional:

```ts
params: ['min', 'max?']
```

A left-out parameter never throws — the check simply receives `undefined` for it. The difference is that a missing **required** parameter logs a dev console warning naming the param, the rule, and the element, while an optional one stays silent. Declare a param optional only when the check genuinely handles its absence.

### Referencing Other Elements

Some rules compare against another element — "must match the password", "must be after the start date". Declare such a parameter with a `$` suffix and it takes an [element path](/guide/element-paths), which Vueform resolves to the element's [context](/guide/context#element-context) for you:

```ts
const matchField = createRule(
  'match_field',
  (value, { params }) => value === params.other$?.value,
  {
    params: ['other$'],
    message: 'The {attribute} must match {other}.',
    messageParams: ({ params }) => ({
      other: params.other$?.displayName,
    }),
  }
)
```

Used as `matchField('pwd')` (or `match_field:pwd` once registered), the single declaration yields two params:

- `params.other` — the path as passed (`'pwd'`)
- `params.other$` — the element context found at that path, typed `StatefulElement | undefined` since the path might not match any element

Vueform **watches** the element at the path, so the rule revalidates whenever `pwd` changes — the same automatic wiring the built-in comparison rules get.

In the message, `{other}` is the raw path by default — _"The Confirm Password must match pwd."_ The `messageParams` above swaps in the referenced element's label instead — _"The Confirm Password must match Password."_ Values resolving to `undefined` are ignored, so when no element exists at the path, the message falls back to the path.

Append `$?` instead of `$` to make the reference itself optional.

### Dependencies the Engine Can't See

Sometimes a check reads another element at a **fixed or derived** path — hard-coded inside the function rather than passed as a `$` param. Vueform can't see that dependency, so the rule wouldn't re-run when the other element changes. Declare the path with `deps` to get the same automatic revalidation:

```ts
const matchesOther = createRule(
  'matches_other',
  (value, { form$ }) => value === form$?.find('other')?.value,
  {
    deps: ['other'],
    message: 'Must match the other field.',
  }
)
```

When the path isn't static, `deps` can be a function — it receives the same context as the check and returns the paths. Here the rule compares against a `_confirmed` sibling derived from the element's own path, and `deps` derives the same path so that sibling is watched:

```ts
const confirmedBySibling = createRule(
  'confirmed_by_sibling',
  (value, { el$, form$ }) =>
    value === form$?.find(`${el$.path}_confirmed`)?.value,
  {
    deps: ({ el$ }) => [`${el$.path}_confirmed`],
    message: 'The {attribute} must be confirmed.',
  }
)
```

### Extra Message Placeholders

`messageParams` injects computed placeholders into the message — or overrides existing ones:

```ts
const maxFileSize = createRule(
  'max_file_size',
  (value, { params }) => {
    return value.size <= Number(params.max) * 1024
  },
  {
    params: ['max'],
    message: '{attribute} must be under {maxMB}.',
    messageParams: ({ params }) => ({
      maxMB: `${params.max}MB`,
    }),
  }
)
```

### Registering Rules Globally

Register custom rules in the app config to reference them by name in string and array syntax, like built-ins:

```ts
import { createVueform, createRule } from '@vueform/ui'

const phone = createRule('phone', (value) => /^\+?[\d\s-()]+$/.test(value), {
  message: 'Must be a valid phone number.',
})

app.use(
  createVueform({
    rules: {
      phone,
    },
  })
)
```

```vue
<VfText name="phone" rules="required|phone" />
```

For the registered names to autocomplete inside rule strings, augment the `CustomRules` interface:

```ts
declare module '@vueform/core' {
  interface CustomRules {
    phone: true
  }
}
```
