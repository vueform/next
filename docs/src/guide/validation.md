---
outline: [2,3]
---

<script setup lang="ts">
const rules = {
  rules: ['required', 'numeric', 'min:10'],
  $if: [['type', '==', 'premium']],
}
</script>

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

| Trigger | Validates |
| --- | --- |
| `change` | the element, on every change to its value |
| `blur` | the element, on its first blur |
| `next` | the current [page](/guide/multi-page-forms)'s elements, before stepping forward |
| `back` | the current [page](/guide/multi-page-forms)'s elements, before stepping back |
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
- elements that are currently **failing**. <!-- which gives async checks whose server-side answer may have changed a fresh chance on each attempt. -->

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
const model = useModel({ schema, validationSchema }, seed)
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

## Async Rules and Debouncing

A rule becomes asynchronous by making its check `async` — nothing else about the definition changes:

```ts
import { createRule } from '@vueform/ui'

const usernameAvailable = createRule('username_available', async (value) => {
  const response = await fetch(`/api/check-username?name=${value}`)
  const { available } = await response.json()
  return available || 'This username is taken.'
})
```

An async Standard Schema used as element rules — a Zod `refine` with an async function, for instance — behaves exactly the same way.

### In-flight State

While an async check is underway, the element reports it:

```ts
el$.pending     // true while an async rule is running
el$.debouncing  // true while a debounce timer is counting down
el$.busy        // either of the above
```

These flags **roll up** — containers aggregate their children's state, and `form$.busy` is `true` while any element is waiting. A busy form doesn't submit; the request waits for the outcome instead of racing it.

::: info
If the element's value changes while an async rule is still running, that run is **discarded** — only the check against the latest value ever lands. Stale responses can't overwrite fresh state, no matter how out of order they arrive.
:::

### Debouncing

An async rule firing on every keystroke means a request on every keystroke. A debounce delays the run until the input pauses for the given number of milliseconds, and it can be set at three levels:

```vue
<!-- on one rule, per use — only `email` is delayed, `required` runs immediately -->
<VfText name="email" rules="required|email:debounce=500" />

<!-- on the element — every one of its rules is delayed -->
<VfText name="username" :rules="[usernameAvailable]" :debounce="500" />
```

```ts
// on the rule definition — every use of the rule is delayed, no per-element setup
const usernameAvailable = createRule('username_available', check, {
  debounce: 500,
})
```

When more than one level is set, the **most specific defined value wins**:

1. The rule-level `debounce` parameter (`email:debounce=500`)
2. The rule definition's `debounce` option
3. The element's `debounce` prop
4. `0` — no debounce

Debouncing isn't reserved for async rules — any rule accepts it — but synchronous built-ins are instant and undebounced by default, so in practice the delay belongs to the rules that cost a round-trip.

## Conditional Rules

A rule can be tied to a condition — it only participates while `$if` is met. Wrap any rule in a `{ rules, $if }` object; the `$if` value uses the same syntax as element [conditions](/guide/conditions). Here `email` always runs, and `required` only activates while `subscribe` is checked:

::: code-group

```ts [Schema]
defineSchema({
  subscribe: { type: 'checkbox' },
  email: {
    type: 'text',
    rules: [
      'email',
      {
        rules: 'required',
        $if: [['subscribe', '==', true]],
      },
    ],
  },
})
```

```vue [Template]
<VfCheckbox name="subscribe" />
<VfText
  name="email"
  :rules="[
    'email',
    {
      rules: 'required',
      $if: [['subscribe', '==', true]],
    },
  ]"
/>
```

:::

`rules` inside the wrapper accepts everything the prop itself does — a string, an array, a custom rule definition, or a Standard Schema. When the only rule is conditional, the object can be the entire `rules` value; the array is just for mixing it with always-on rules.

Rules with different conditions go in separate wrappers:

```ts
defineSchema({
  type: { type: 'text' },
  amount: {
    type: 'text',
    rules: [
      'numeric',
      {
        rules: 'required',
        $if: [['type', '!=', 'free']],
      },
      {
        rules: 'min:10',
        $if: [['type', '==', 'premium']],
      },
    ],
  },
})
```

While a rule set shares one condition by passing the rules together:

```ts
defineSchema({
  type: { type: 'text' },
  amount: {
    type: 'text',
    rules: {
      rules: ['required', 'min:10'],
      $if: [['type', '==', 'premium']],
    },
  },
})
```

The transitions are handled for you — when a condition turns **on**, the rule validates immediately, and when it turns **off**, the rule's error is cleared.

## Multilingual Rules

On a [translatable element](/guide/multilingual-inputs), a single rule set validates every language. To validate languages differently, key the rules by language code:

```ts
defineSchema({
  bio: {
    type: 'text',
    translate: true,
    rules: {
      en_US: 'required|min:10',
      fr_FR: 'required|min:5',
    },
  },
})
```

Each language's entry takes the full `rules` spec — string, array, custom rule definition, Standard Schema, or a conditional `{ rules, $if }` wrapper — and each language validates **independently**, with its errors tagged by the language's label. `bail` also stops within one language's chain without affecting the others.

## Error Messages

Every built-in rule ships with a [localized](/guide/locales) default message that fills in the element's display name and the rule's parameters — `min:5` on a text element produces _"The Name must be at least 5 characters."_ Custom rules carry the message they were defined with. When the wording isn't right for a field or an app, override it per rule with `ruleMessages`.

### Element and Form Messages

The element-level `ruleMessages` prop replaces messages for that element's rules:

```ts
defineSchema({
  email: {
    type: 'text',
    rules: 'required|email',
    ruleMessages: {
      required: 'Please enter your email.',
      email: 'Not a valid email.',
    },
  },
})
```

The same prop on the form applies to every element in it, unless an element overrides the same rule:

```ts
const [MyForm] = useForm({
  schema,
  ruleMessages: {
    required: 'This field is required.',
  },
})
```

### Multilingual Messages

Anywhere a message is accepted, a [locale-keyed object](/guide/dynamic-props#locale-map) works in place of the string — in `ruleMessages`, in `!createRule`'s `message` option, and in a check's returned string:

```ts
defineSchema({
  email: {
    type: 'text',
    rules: 'required|email',
    ruleMessages: {
      required: {
        en_US: 'Please enter your email.',
        de_DE: 'Bitte E-Mail eingeben.',
      },
    },
  },
})
```

### The Resolution Order

With every surface in play, a failing rule resolves its message top-down and the first one defined wins:

1. The string returned by the check function
2. The rule's `message` option in `!createRule`
3. The element's `ruleMessages`
4. The form's `ruleMessages`
5. The rule's locale tag — e.g. `rule_required_error`
6. The fallback `rule_default_error` tag

At every step, the resolved value passes through the [Locale](/api/modules/locale) module, so any of them can also be a locale **tag** pointing at a key in the locale file. Resolution happens at **read time** — switching the locale re-renders every error in the new language without re-running a single check.

::: info
[Standard Schema](#validating-with-zod-and-standard-schema) failures carry their messages from the schema library itself and skip this chain entirely.
:::

### Locale Tags

Steps 5 and 6 are how the built-in messages work — each rule's default message lives in the locale file under a tag derived from the rule's name. The derivation is the `ruleMessageTag` config function:

```ts
// Default implementation
ruleMessageTag: (name, type) =>
  type ? `rule_${name}_${type}_error` : `rule_${name}_error`
```

Most rules get the plain form — `rule_required_error`. The size-measuring rules (`min`, `max`, `between`, `size`, `gt`, `gte`, `lt`, `lte`) get a **typed** form that discriminates by what the value is: `rule_min_string_error`, `rule_min_numeric_error`, `rule_min_array_error`, `rule_min_file_error`. The `type` is derived from the element's current value at validation time — the same category that decides how size rules measure — and a custom rule opts into typed tags with `!createRule`'s `typed: true` option.

Override the function globally to map rules onto an existing translation structure:

```ts
app.use(
  createVueform({
    ruleMessageTag: (name, type) =>
      type ? `validation.${name}.${type}` : `validation.${name}`,
  })
)
```

A custom rule can also point at a specific tag directly — pass the tag as its `message`, and the locale module looks it up (an unknown tag is used verbatim as the message):

```ts
const lowercase = createRule('lowercase', (value) => {
  return value === value.toLowerCase()
}, {
  message: 'custom_lowercase_validation',
})
```

### The Display Name

The `{attribute}` placeholder resolves to the element's `genericName` — an explicit `displayName` when set, otherwise whatever human-readable text the element already presents to the user, falling back to its `name`. Override it with the `displayName` prop:

```vue
<VfText name="email" rules="required" display-name="email address" />
```

This produces _"The **email address** field is required."_ instead of _"The **email** field is required."_

### Placeholders

Messages support placeholders replaced with live values:

- `{attribute}` — the element's display name
- `{min}`, `{max}`, `{size}`, `{other}`, `{date}`, … — the rule's own parameters, by name

The built-in `min` message for strings, for instance, is _"The {attribute} must be at least {min} characters."_ Custom rules add their own computed placeholders with `messageParams`, shown in [Writing Your Own Rules](#writing-your-own-rules).

## Controlling the Display

Errors render without setup — beneath each element, and in the form's own error block. Every part of that rendering is adjustable.

### Where Errors Render

The form-level `errorLevel` prop picks the surfaces:

| Value | Behavior |
| --- | --- |
| `'all'` | Errors show on both the elements and the form (default). |
| `'element'` | Errors show only beneath elements. |
| `'form'` | Errors show only in the form-level block. |
| `'none'` | Errors render nowhere — validation state is still fully tracked. |

```vue
<VfForm error-level="element">
  <VfText name="email" rules="required|email" />
</VfForm>
```

### How Many Errors Show

`maxErrors` caps how many errors an element **displays** — the counterpart of [`bail`](/guide/validation#how-many-rules-run), which capped how many rules ran. It defaults to `1`, so even an element collecting several failures shows one at a time. Set it to `-1` to show everything collected:

```vue
<VfText
  name="email"
  rules="required|email|min:5"
  :bail="false"
  :max-errors="-1"
/>
```

The two knobs are independent — `bail` decides what **runs**, `maxErrors` decides what's **shown**.

### Hiding Errors

The `hideErrors` prop suppresses an element's error display while validation keeps running underneath — the state is all still there to render elsewhere:

```vue
<VfText name="email" rules="required|email" hide-errors />
```

The same prop on `!VfForm` hides only the form-level error block.

### Hoisting Errors

The `hoist` prop pushes an element's errors up to its nearest ancestor element — the element itself displays and reports nothing, and the ancestor includes the messages in its own error display and in the form's errors:

```vue
<VfGroup name="address">
  <VfText name="zip" rules="required" hoist />
</VfGroup>
```

### Required Indicators

Elements with an active `required` rule mark themselves. The `showRequired` prop controls where the indicator appears — the default is `['label']`, and `false` turns it off. Set it on the form for every element, or per element.

The accepted places vary by element (a text input also offers `'placeholder'`, for instance), so check the prop's type on the element at hand, e.g. [VfText's](/components/VfText#props.showRequired).

### Scroll and Focus

When submission fails validation, Vueform **focuses** the first invalid element and **scrolls** it into view. Both are on by default and configurable on the form:

```vue
<VfForm
  :focus-error="false"
  :scroll-to-error="false"
  :scroll-options="{ behavior: 'smooth', block: 'center' }"
/>
```

`scrollOptions` is forwarded to the browser's [`scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView).

## Errors from Outside the Rules

Not every error comes from a rule — a server rejects a value, a business process flags a record, a wizard wants to pin a note on a field. Every element carries a [`messageBag`](/api/modules/messageBag) for exactly this, and its entries render alongside rule errors and count toward the element's error state.

### Adding and Removing

```ts
el$.messageBag.append('Not valid.', 'error')     // appended after rule errors
el$.messageBag.prepend('Server error.', 'error') // prepended before rule errors
```

The `'error'` argument is the default and can be omitted. Pass `'message'` instead for an informational note that renders without counting as an error:

```ts
el$.messageBag.append('Saved successfully.', 'message')
```

Both `append` and `prepend` take an optional third `keep` argument — when `true`, the entry survives `clear()` and the automatic clearing below.

Removing works by entry or wholesale:

```ts
el$.messageBag.remove('Not valid.', 'error')

el$.messageBag.clear('errors')   // only errors
el$.messageBag.clear('messages') // only messages
el$.messageBag.clear()           // both
```

### Auto-clearing on Value Change

Custom errors describe the value they were added for, so by default they clear as soon as the element's value changes. The form's `clearCustomErrors` prop turns that off:

```vue
<VfForm :clear-custom-errors="false">
  <!-- custom errors persist until cleared manually -->
</VfForm>
```

### Server Validation Errors

For a backend answering `422` with field errors, set the form's `setInvalid` prop and Vueform maps the response onto the matching elements automatically — `transformServerInvalid` adapts payload shapes that don't match out of the box. The full setup lives in [Server Validation Errors](/guide/submit#server-validation-errors).

To handle `422` errors yourself, append them in `onServerInvalid` — or in `onResponse` for responses that aren't `422` at all:

```ts
const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  onServerInvalid: ({ errors, context$ }) => {
    Object.entries(errors).forEach(([path, messages]) => {
      const el$ = context$.find(path)
      messages.forEach((msg) => el$?.messageBag.append(msg, 'error'))
    })
  },
})
```

## Validation State

Every element exposes the same validation state through its [context](/guide/context). Leaf elements derive it from their own rules; containers aggregate it from their children — and can combine that with rules of their own.

| Property | Type | Description |
| --- | --- | --- |
| `invalid` | `boolean` | At least one rule failed — own or any child's. |
| `pending` | `boolean` | An async rule is currently running — own or a child's. |
| `debouncing` | `boolean` | A debounce timer is active — own or a child's. |
| `busy` | `boolean` | `pending` or `debouncing` — blocks form submission. |
| `validated` | `boolean` | All rules (own and children's) have run **against the current value**. Changing a value through any path — typing, `update()`, `load()`, a server write-back — marks the affected results stale and flips it back to `false` until they re-run. |
| `completed` | `boolean` | Validated without errors, or no rules defined. |
| `success` | `boolean` | `completed` after the element has been touched. |
| `required` | `boolean` | An active `required` or `accepted` rule exists. |
| `dirty` | `boolean` | The current value differs from the initial value. |
| `empty` | `boolean` | The value is empty (for containers — every child is empty). |
| `touched` | `boolean` | The element has been blurred at least once. |
| `errors` | `string[]` | All error messages — rule errors plus `messageBag` errors, including hoisted children's. |
| `displayErrors` | `string[]` | The errors actually rendered, capped by `maxErrors`. |
| `ownErrors` | `string[]` | The element's own errors, excluding hoisted children's. |
| `hasError` | `boolean` | `errors` is non-empty. |

```ts
formReady((form$) => {
  const email$ = form$.find('email')

  email$.invalid       // false
  email$.errors        // []
  email$.validated     // true
  email$.dirty         // false
})
```

Elements also emit `@valid` and `@invalid` events as they cross the boundary in either direction.

### Form State

The form aggregates the same booleans — `invalid`, `pending`, `debouncing`, `busy`, `validated`, `completed`, `dirty`, `empty` — across all of its elements. Its error projections are keyed:

```ts
form$.errors
// { email: ['The Email field is required.'] }

form$.issues
// [{ path: 'email', rule: 'required', message: 'The Email field is required.' }]
```

`errors` maps element paths to their message arrays. [Validation Schema](#one-schema-for-the-whole-form) issues whose path matches no element appear under the root `''` key.

`issues` is the structured counterpart — one entry per failure:

| Field | Description |
| --- | --- |
| `path` | The element path the failure belongs to (`''` for root-level Validation Schema issues). |
| `language` | On translatable elements, the language the failure occurred in. |
| `rule` | The name of the failing rule. Standard Schema failures have no rule name — element-level schemas report `standard_schema`, the form-level Validation Schema reports `validation_schema`, so schema failures stay distinguishable when processing issues. |
| `message` | The resolved, localized message. |

## Driving Validation from Code

Every element, every container, the form, and a headless model instance expose the same validation methods:

| Method | Description |
| --- | --- |
| `validate()` | **Async.** Runs the rules and resolves `true` when everything passes. On containers and the form, children already passing against their current value are skipped — pass `{ force: true }` to re-run everything regardless (what submit does when `validateOn` includes `'submit'`). |
| `validateSelf()` | **Async.** Runs only the component's **own** rules — leaving children untouched. |
| `validateChildren()` | **Async.** Containers — validates the **children** only (the incomplete ones by default, all of them with `{ force: true }`) and resolves whether every child passes. |
| `validateCurrent()` | **Async.** Translatable elements only — validates just the active language. |
| `unvalidate()` | Resets validation state — clears rule errors and marks the rules as not having run. |
| `invalidate()` | Marks results as stale so the next validation re-runs them — adds no errors. |
| `clearErrors()` | Clears custom errors from this component's own `messageBag`. |
| `clearMessages()` | Clears custom messages from this component's own `messageBag`. |
| `clearMessageBag()` | Clears both. |
| `toStandardSchema()` | Exports the compiled rules as a Standard Schema — covered in the closing section of this chapter. |

```ts
formReady(async (form$) => {
  const isValid = await form$.find('email').validate()

  if (!isValid) {
    console.log(form$.find('email').errors)
  }
})
```

::: warning
The `clear*` methods act on the **calling component's own** `messageBag`. `form$.clearErrors()` clears the form-level bag — it does **not** cascade into elements. To clear element errors, call the method on each element.
:::

## Validation Without a Form

Everything this chapter covered runs without a mounted component. Hand the same schema to `!useModel` and the full cycle works headlessly — define, run, read:

```ts
import { defineSchema, useModel } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  age: { type: 'text', label: 'Age', rules: 'nullable|integer|min:18' },
})

const model = useModel({ schema }, { email: 'not-an-email' })

await model.validate() // resolves false — the email rule fails

model.invalid // true
model.errors  // { email: ['The Email must be a valid email address.'] }
model.issues  // [{ path: 'email', rule: 'email', message: '…' }]
```

No component was mounted. The rules, the Validation Schema, conditions, custom rules, localized messages — all of it behaves exactly as described in the previous sections, because a mounted form was never what ran them. Triggers and error display are the form's contribution; the validation itself lives with the data.

### One Validator, Two Views

A form that [attaches](/guide/model#attaching-the-model) a `!useModel` instance shares a single validator with it — the state you read on the instance is the same state the form renders:

```ts
const model = useModel({ schema })
const [MyForm] = useForm({ schema }, model)

// after mount, both views read identical validation state
model.invalid
```

### Exporting as a Standard Schema

Any form or model instance can expose its compiled rules — element rules, conditions, and the Validation Schema combined — as a spec-compliant `StandardSchemaV1`:

```ts
const model = useModel({ schema })
const validator = model.toStandardSchema()

const result = await validator['~standard'].validate({
  email: 'jane@example.com',
  age: 17,
})

result.issues // [{ path: ['age'], message: 'The Age must be at least 18.' }]
```

The exported validator is a **standalone checker**, fully detached from the instance it came from — it checks whatever value you pass in, never reads the instance's data, and writes no state back.

The passed value is a complete world of its own — cross-field rules find their referenced elements in it, `$if` conditions evaluate against it, and the issues come back with fully localized messages, phrased exactly as the form would phrase them. Interaction-dependent rules such as `captcha` are skipped. The method is available on `!useModel` instances and as `form$.toStandardSchema()`.

Because the result is itself a Standard Schema, anything that consumes the spec can run it — a server route validating the same payload before it hits the database, a test suite, another library entirely. Combined with [Validation Schemas](#one-schema-for-the-whole-form) flowing the other way, this is the intro's promise made concrete — one validation definition, enforced on both sides of the wire, whichever side you authored it on.

## Global Defaults

Every validation-related prop this chapter tuned per form or per element can be set once, app-wide, as a [Default](/guide/defaults):

```ts
import { createVueform } from '@vueform/ui'

app.use(
  createVueform({
    defaults: {
      VfForm: {
        validateOn: ['blur', 'next'],
        errorLevel: 'all',
        focusError: true,
        scrollToError: true,
        scrollOptions: { behavior: 'smooth' },
        clearCustomErrors: true,
      },
      '*element': {
        bail: true,
        maxErrors: 1,
      },
    },
    rules: {
      /* globally registered custom rules */
    },
    ruleMessageTag: (name, type) =>
      type ? `rule_${name}_${type}_error` : `rule_${name}_error`,
  })
)
```

`rules` and `ruleMessageTag` sit at the top level of the config rather than under `defaults` — they register behavior, not prop values. The full defaults system is covered in [Defaults](/guide/defaults).
