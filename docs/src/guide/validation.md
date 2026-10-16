---
outline: [2,3]
---

# Validation

Vueform ships with its own validation system — 50+ built-in rules, custom rules, async checks, conditional activation, and full localization, with no third-party library required. If you already use one, any [Standard Schema](https://standardschema.dev) library (Zod, Valibot, ArkType, …) plugs straight in, from a single field up to whole-form cross-field validation.

Like everything about the [Model](/guide/model), validation is a capability of the data engine, not of the rendered form: rules live in the schema, and they can run with or without a single mounted component.

## Validation Without a Form

Rules are declared on elements via the `rules` prop. Pass the schema to `!useModel` and the complete validation cycle works headlessly — define, run, read:

```ts
import { defineSchema, useModel } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  age: { type: 'text', label: 'Age', rules: 'nullable|integer|min:18' },
})

const model = useModel(schema, { email: 'not-an-email' })

await model.validate() // resolves `false` — the email rule fails

model.invalid // true
model.errors  // ['The Email must be a valid email address.']
model.issues  // [{ path: 'email', rule: 'email', message: '…' }]
```

No component was mounted. `validate()` runs every element's rules against the current data (plus the form-level [Validation Schema](#form-level-validation-schema), if any) and resolves with whether everything passed. `invalid` reflects the failing state, `errors` aggregates the localized messages, and `issues` is the structured counterpart with the path and rule behind each message.

This is the whole system in miniature. Everything that follows — rule formats, triggers, messages, display — builds on this same cycle.

## The Same Schema, Mounted

Hand the schema to a form and validation becomes interactive. The rules are the same; what changes is _when_ they run and _where_ the results appear:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  age: { type: 'text', label: 'Age', rules: 'nullable|integer|min:18' },
})

const [MyForm] = useForm({ schema, endpoint: '/api/register' })
</script>

<template>
  <MyForm />
</template>
```

```vue [Template]
<template>
  <VfForm endpoint="/api/register">
    <VfText name="email" label="Email" rules="required|email" />
    <VfText name="age" label="Age" rules="nullable|integer|min:18" />
  </VfForm>
</template>
```

:::

Mounted, each element validates on its [triggers](#when-validation-runs) (by default: first blur and step navigation, plus submission always validates anything without a current passing result), errors render under the inputs, and a failed validation blocks submission while Vueform scrolls to and focuses the first invalid element.

The two worlds aren't alternatives — they share one engine. When a form [adopts](/guide/model#adopting-the-model) a `!useModel` instance, they share a single validator: the state you read on the instance is the same state the form renders.

```ts
const model = useModel(schema)
const [MyForm] = useForm({ schema }, model)

// after mount, both views read identical validation state
model.invalid
```

## Ways to Define Rules

The `rules` prop accepts four formats, freely mixable within one array:

> _⚠️ maybe make these sub headers for better search / highlight (especially Standard Schema / Zod)_

```ts
// 1. Pipe-separated string
rules: 'required|email'

// 2. Array of rules
rules: ['required', 'email']

// 3. Custom rule definition (created with createRule)
rules: ['required', usernameAvailable]

// 4. Standard Schema (Zod, Valibot, ArkType, …)
rules: z.string().email()
```

Any of these can additionally be wrapped in a `{ rules, $if }` object to activate only under a [condition](#conditional-rules).

Each format has its own section below: [string and array syntax](#string-and-array-syntax), [custom rules](#custom-rules), and [Standard Schemas](#standard-schema-validation). Separately from element rules, a whole-form Standard Schema can be attached as a [Validation Schema](#form-level-validation-schema) for cross-field validation.

## When Validation Runs

Headlessly, validation runs when you call `validate()`. On a mounted form, the `validateOn` prop controls which interactions trigger it.

### Form-level Triggers

Form-level `validateOn` applies to every element in the form unless overridden per element:

| Trigger  | Behavior                                                                                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `change` | Validates each element on every input change.                                                                                                                                                                                                                                                    |
| `blur`   | Validates each element on its first blur.                                                                                                                                                                                                                                                        |
| `next`   | Validates the current page before moving to the next step.                                                                                                                                                                                                                                       |
| `back`   | Validates the current page before moving to the previous step.                                                                                                                                                                                                                                   |
| `submit` | **Optional upgrade** — submission always validates as a floor (every element without a current passing result) whether or not this trigger is present. Adding `'submit'` forces a complete re-validation of every element on each attempt, prior results ignored; see [Submission](#submission). |

```vue
<VfForm :validate-on="['change', 'blur']">
  <VfText name="email" rules="required|email" />
</VfForm>
```

The built-in default is `['blur', 'next']` — elements validate on first blur and when the user moves between steps. Submission is not in the list because it isn't an opt-in trigger: submit always validates whatever lacks a current passing result, and adding `'submit'` only upgrades that to a forced full re-run — see [Submission](#submission). Override the default globally as a [Default](/guide/defaults) for `!VfForm`:

```ts
app.use(
  createVueform({
    defaults: {
      VfForm: {
        validateOn: ['change', 'submit'],
      },
    },
  })
)
```

### Element-level Triggers

Individual elements only support the input-driven triggers — `change` and `blur` — and take precedence over the form-level value when set:

```vue
<VfText name="email" rules="required|email" :validate-on="['change']" />
```

::: info
Elements that aren't focusable — `VfList` and other container elements — only support `'change'` as a `validateOn` trigger, since they never receive a blur.
:::

### Submission

Submission **always validates** — regardless of what `validateOn` contains. Before the request is made, every element without a current passing result runs its rules: elements that never validated, elements whose value changed since they last validated (through any path — typing, `update()`, `load()`, a server write-back), and elements that are currently invalid (so async checks whose outcome may have changed server-side get a fresh chance on every attempt). Elements already validated without errors against their current value keep their result — no repeated async checks, no re-paid debounce. An untouched form can never submit unvalidated.

Adding `'submit'` to `validateOn` upgrades this to a **complete re-run**: every element validates on every attempt, prior results ignored.

```vue
<VfForm :validate-on="['blur', 'next', 'submit']" endpoint="/api/register" />
```

Reach for the full re-run when results can go stale without the value changing — time-based rules in long-lived forms, or rules reading external state the form can't observe. The trade-off is paying every async rule's round-trip on each attempt.

The only way to skip submit-time validation altogether is the form context's `disableValidation()` method:

```ts
form$.disableValidation() // submits skip validation from now on
form$.enableValidation()  // turn it back on
```

This is deliberately a programmatic call and not a prop: turning off validation should be an explicit act in code — a conscious decision at a specific point in a flow — not a template flag that quietly ships to production. With validation suppressed, `submit()` sends whatever the model holds; the server's `422` handling ([Server Validation Errors](/guide/submit#server-validation-errors)) becomes your only safety net.

How a failed validation plays into the submission lifecycle — the `invalid` result, scroll and focus — is covered in [Submitting Forms](/guide/submit#validation-on-submit).

### Live Mode

Once a form has been **submitted**, every element validates on every change for the rest of the form's lifetime — regardless of `validateOn`. Live validation also kicks in earlier, per element:

- After an element's first **blur** (with the `blur` trigger), every subsequent change triggers validation.
- After any rule **fails**, every subsequent change re-runs validation until it passes.

This produces a balanced UX:

1. Elements start **unvalidated** — no errors are shown while the user types a fresh value.
2. On the first blur (or at submit time), validation runs.
3. From then on, the user gets **immediate feedback** as they edit.

## String and Array Syntax

The most compact format is a **pipe-separated string**:

```vue
<VfText name="email" rules="required|email" />
```

The equivalent **array** format:

```vue
<VfText name="email" :rules="['required', 'email']" />
```

Both resolve the same way. Use the array format when mixing in [custom rule definitions](#inline-custom-rules), [Standard Schemas](#element-rules-as-standard-schemas), or [conditional rules](#conditional-rules) alongside string rules.

All [built-in rules](/rules/) are registered automatically and referenced by name. To ship only the ones you use, see [Code-Splitting](/guide/code-splitting).

### Positional Parameters

Rules accept parameters after a colon, separated by commas, passed by position:

```
min:5
between:1,10
digits_between:4,8
```

### Named Parameters

Parameters can also be passed by name using `=`:

```
dimensions:width=100,height=200
```

Some rules — like `dimensions` — only accept named parameters. Most others accept both.

### Element Reference Parameters

Some rules accept an element path that resolves to another element in the form. The comparison rules (`same`, `different`, `gt`, `gte`, `lt`, `lte`, `in_array`) and date rules (`after`, `before`, …) reference other elements by path:

```
same:password
gt:min_price
after:start_date
```

Dot paths reach elements nested inside groups:

```
same:address.city
gt:billing.subtotal
```

Wildcard paths (`*`) resolve siblings inside a `VfList`:

```
same:users.*.email
```

When an element reference is used, Vueform automatically watches the referenced element and revalidates whenever its value changes.

### Debounce Parameter

Any rule can be individually debounced via the reserved `debounce` named parameter:

```
email:debounce=500
```

This delays the rule's execution by the given number of milliseconds. See [Debouncing](#debouncing) for the full picture.

## Custom Rules

Define custom validation rules with the `!createRule` factory.

### Inline Custom Rules

The simplest approach is to pass a rule definition directly in the `rules` array:

```vue
<script setup lang="ts">
import { createRule } from '@vueform/ui'

const lowercase = createRule('lowercase', (value) => {
  return value === value.toLowerCase()
})
</script>

<template>
  <VfForm>
    <VfText name="username" :rules="[lowercase]" />
  </VfForm>
</template>
```

The check function receives the current value and a rule context (element, form, modules, helpers). It must return `true` for valid, `false` for invalid, or a `string` for invalid with a custom message.

::: info
`!createRule` is context-free — it's safe to call at module scope, even before `createVueform` runs, so rules can live in their own shared modules.
:::

### Error Messages

When the check returns `false` without a message of its own, Vueform looks for a locale tag named after the rule (`rule_{name}_error`) — and since none exists for a custom rule, it falls back to the generic `rule_default_error` tag (`"Invalid field"` in `en_US`). To make the message meaningful, return a string from the check function:

```ts
const lowercase = createRule('lowercase', (value) => {
  return value === value.toLowerCase() || 'Must be lowercase'
})
```

Or provide a `message` option:

```ts
const lowercase = createRule('lowercase', (value) => {
  return value === value.toLowerCase()
}, {
  message: 'The {attribute} must be lowercase.',
})
```

Both the inline return and the `message` option also accept an object for [Multilingual Messages](#multilingual-messages). See [Custom Error Messages](#custom-error-messages) for the full resolution order, locale tags, and placeholders.

### Rules With Parameters

Declare parameter names with the `params` option:

```ts
const minWords = createRule(
  'min_words',
  (value, { params }) => {
    const count = value.trim().split(/\s+/).length
    return count >= Number(params.min)
    //                               ^|*min@"(property) min: string"
  },
  {
    params: ['min'],
    message: 'Must have at least {min} words.',
  }
)
```

The `params` object in the check context is typed from the declaration: every declared name is a known key, so `params.min` autocompletes and a typo is a compile error.

When used inline, pass parameters by position or by name — calling a definition returns a configured copy, the original is never mutated:

```vue
<!-- Positional -->
<VfText name="bio" :rules="['required', minWords(3)]" />

<!-- Named -->
<VfText name="bio" :rules="['required', minWords({ min: 3 })]" />
```

When [registered globally](#registering-global-rules), parameters can also be passed inside the rule string:

```vue
<!-- Positional -->
<VfText name="bio" rules="required|min_words:3" />

<!-- Named -->
<VfText name="bio" rules="required|min_words:min=3" />
```

Mark a parameter as optional by appending `?`:

```ts
params: ['min', 'max?']
```

Leaving out a parameter doesn't throw either way — the check simply receives `undefined` for it. The difference is that a missing **required** parameter logs a console warning (naming the param, the rule, and the element), while an optional one is silently allowed. Declare a param optional only when the check genuinely handles its absence.

### Rules With Element References

Some rules compare against another element — "must match the password", "must be after the start date". Declare such a parameter with a `$` suffix and it takes an [element path](/guide/element-paths); Vueform resolves the element [Context](/guide/context) for you:

```ts
const matchField = createRule(
  'match_field',
  (value, { params }) => value === params.other$?.value,
  {
    params: ['other$'],
    message: 'The {attribute} must match {other}.',
    messageParams: ({ params }) => ({
      other: params.other$?.genericName,
    }),
  }
)
```

When used as `matchField('pwd')` (or `match_field:pwd` if [registered globally](#registering-global-rules)), the single declaration yields two params:

- `params.other` is the path as passed (`'pwd'`)
- `params.other$` is the element context [found](/guide/context#finding-elements) at the given path

```ts
const matchField = createRule(
  'match_field',
  (value, { params }) => params.other
  //                                 ^|*other@"(property) other: string"|other$@"(property) other$: StatefulElement | undefined"
)
```

`params.other$` is typed as `StatefulElement` — the shape every data-carrying element shares — or `undefined`, since the path might not match any element. Vueform also watches the element at that path, so the rule revalidates whenever `pwd` changes.

```ts
{
  message: 'The {attribute} must match {other}.',
  messageParams: ({ params }) => ({
    other: params.other$?.genericName,
  }),
}
```

In the message, `{other}` is the path by default — `"The Confirm Password must match pwd."` The `messageParams` above replaces it with the referenced element's label: `"The Confirm Password must match Password."` Values returned as `undefined` are ignored, so if no element is found at the path, the message falls back to the path again.

Append `$?` instead of `$` (`other$?`) to make the reference optional.

### Cross-field Dependencies

Sometimes a rule reads another element at a **fixed or derived path** — hard-coded in the check rather than passed as a `$` param. Vueform can't see that dependency, so the rule wouldn't re-run when the other element changes. Declare the path with `deps` to get the same automatic revalidation a `$` param provides:

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

When the path isn't static, `deps` can be a function instead — it receives the same context object as the check function's second argument (`el$`, `form$`, `params`, …) and returns the paths. Here the rule compares against a `_confirmed` sibling derived from the element's own path, and `deps` derives the same path so the sibling is watched:

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

### Custom Message Parameters

Use `messageParams` to inject extra placeholders into error messages or override existing ones:

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

### Async Rules

A custom rule becomes asynchronous simply by using an `async` check function:

```ts
import { createRule } from '@vueform/ui'

const usernameAvailable = createRule('username_available', async (value) => {
  const response = await fetch(`/api/check-username?name=${value}`)
  const { available } = await response.json()
  return available || 'This username is taken.'
})
```

While an async rule is running, the element exposes:

```ts
el$.pending     // true while async validation is in progress
el$.debouncing  // true while a debounce timer is active
el$.busy        // true if pending or debouncing — blocks form submission
```

These flags propagate up to containers and the form, so `form$.busy` is `true` while any element is awaiting an async check. `debouncing` becomes relevant once a delay is configured — see [Debouncing](#debouncing).

::: warning
If the element's value changes while an async rule is still running, the previous run is discarded — only the most recent check counts.
:::

### Default Debounce

Async rules pair naturally with debouncing, so a request isn't fired on every keystroke. The element's `debounce` prop delays all of its rules:

```vue
<VfText name="username" :rules="[usernameAvailable]" :debounce="500" />
```

Or bake the delay into the rule itself with the `debounce` option — then every use of the rule is debounced without per-element configuration:

```ts
const usernameAvailable = createRule('username_available', check, {
  debounce: 500,
})
```

See [Debouncing](#debouncing) for how the levels interact.

### Registering Global Rules

Custom rules can be registered globally so they can be referenced by name in string or array syntax:

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

Then use it by name on any element:

```vue
<VfText name="phone" rules="required|phone" />
```

For TypeScript autocomplete of your registered rule names inside rule strings, augment the `CustomRules` interface:

```ts
declare module '@vueform/core' {
  interface CustomRules {
    phone: true
  }
}
```

## Standard Schema Validation

> _⚠️ maybe rename this to "Zod / Standard Schema Validation"?_

[Standard Schema](https://standardschema.dev) is a shared, types-only contract implemented by Zod (3.24+), Valibot, ArkType, and a growing list of validation libraries. Vueform accepts any spec-compliant schema — the interface is vendored, so core stays dependency-free and there's nothing extra to install.

Standard Schemas participate at three levels:

1. [Element rules](#element-rules-as-standard-schemas) — a schema validates one element's value.
2. [Form-level Validation Schema](#form-level-validation-schema) — one schema validates the whole model, including cross-field constraints.
3. [Export](#exporting-as-a-standard-schema) — the form's compiled rules are themselves exposed _as_ a Standard Schema for reuse elsewhere.

### Element Rules as Standard Schemas

A Standard Schema can be the entire `rules` value or one entry in the array, mixed freely with the other formats:

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

The schema validates the element's current value whenever the element validates — same triggers, same lifecycle as any other rule. Async schemas (e.g. Zod's `refine` with an async function) behave like [async rules](#async-rules), including `pending` and `busy` state.

Error messages come from the schema library itself — configure them where you define the schema (e.g. Zod's `message` options), not via `ruleMessages`. In `issues`, these failures appear under the rule name `standard_schema`.

### Form-level Validation Schema

Element rules validate values in isolation. A **Validation Schema** validates the _whole model_ with a single Standard Schema — the natural home for cross-field constraints:

```ts
import { z } from 'zod'
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema(
  {
    password: { type: 'text', inputType: 'password', rules: 'required|min:8' },
    password_confirmed: { type: 'text', inputType: 'password' },
  },
  // ▼ the Validation Schema — defineSchema's second argument
  z
    .object({
      password: z.string(),
      password_confirmed: z.string(),
    })
    .refine((data) => data.password === data.password_confirmed, {
      message: "Passwords don't match.",
      path: ['password_confirmed'],
    })
)

const [MyForm] = useForm({ schema })
```

Passing it as `defineSchema`'s second argument attaches it to the schema object, so every form or model built from that schema picks it up automatically — no need to pass it again. Alternatively, provide it explicitly:

```ts
// as a prop / option — overrides one attached via defineSchema
const [MyForm] = useForm({ schema, validationSchema })
const model = useModel(schema, seed, { validationSchema })
```

```vue
<VfForm :schema="schema" :validation-schema="validationSchema" />
```

When several sources are present, exactly one wins — they don't merge. From highest priority to lowest:

1. `:validation-schema` passed on the rendered component (`<VfForm>` / `<MyForm>` in the template)
2. `validationSchema` in `!useForm`'s options (this and #1 are the same underlying form prop — a template-level value overrides it)
3. The adopted `!useModel` instance's `validationSchema` option
4. One attached to the schema via `!defineSchema`'s second argument

The more specific source always wins: schema definition < model instance < form usage. Vueform warns in development when a prop or instance option silently overrides an attached schema.

The Validation Schema runs on every `validate()` call — before element rules — and re-runs reactively as values change once its results are being displayed.

#### Where Its Errors Appear

Each issue the schema produces carries a path. Vueform maps issue paths onto elements:

- When the path matches an element (`password_confirmed` above), the message appears **on that element**, alongside its rule errors.
- When it doesn't match any element — a root-level `refine`, or a path outside the form — the message lands in the **root bucket** and is shown at the form level, under the `''` key of `form$.errors`.

In `issues`, these failures appear under the rule name `validation_schema`.

#### Type Safety

The Validation Schema is type-checked against the form schema at compile time. Every element type has a model type — `type: 'text'` models `string | number | null`, a checkbox models a boolean, a file element a `File`, and so on — and the Validation Schema's inferred **input type** is compared against that model shape, key by key:

```ts
// ✅ string fits the text model
defineSchema({ name: { type: 'text' } }, z.object({ name: z.string() }))

// ❌ type error: key `nam` doesn't exist in the model
defineSchema({ name: { type: 'text' } }, z.object({ nam: z.string() }))

// ❌ type error: `Date` is incompatible with the text model
defineSchema({ name: { type: 'text' } }, z.object({ name: z.date() }))
```

The mismatch surfaces where you write the schema — as a diagnostic naming the offending keys — not at runtime. The check is structural and pragmatic:

- **Partial coverage is fine** — the Zod object may validate only some of the model's keys.
- **Narrower is fine** — `z.enum(['a', 'b'])` is accepted against a `string` model; the model being narrower than the input is the error.
- **Nullability is tolerated** — `z.string()` and `z.string().nullable().optional()` both fit a `string | null` model.
- **Nesting is followed** — groups and lists compare structurally against their nested model shapes.

The strict check applies wherever the schema and the Validation Schema meet with full type information: `!defineSchema`, `!defineComputedSchema`, and `!useModel`'s option. `!useForm`'s `validationSchema` option is looser — a mismatch there makes the call fall back to the untyped overload instead of erroring — which is one more reason to prefer attaching via `!defineSchema`.

### Exporting as a Standard Schema

The integration runs in both directions. Any form or model instance can expose its compiled rules — element rules, conditions, and the Validation Schema combined — as a `StandardSchemaV1`:

> _⚠️ having a schema def here would make sense_

```ts
const model = useModel(schema)
const validator = model.toStandardSchema()

const result = await validator['~standard'].validate({
  email: 'jane@example.com',
  age: 17,
})

result.issues // [{ path: ['age'], message: 'The Age must be at least 18.' }]
```

`toStandardSchema()` — available as `form$.toStandardSchema()` and `instance.toStandardSchema()` — validates an **arbitrary value**, not the live model: cross-field `$` params and [conditions](#conditional-rules) read from the provided value. Interaction-dependent rules such as `captcha` are skipped.

Because the result is itself a spec-compliant schema, it can be handed to anything that consumes Standard Schemas — a server route validating the same payload, a testing utility, or another library entirely. Your form definition becomes the single source of truth for the validation logic.

## Conditional Rules

Rules can be made conditional — they only activate while `$if` is met. `$if` uses the same syntax as element [Conditions](/guide/conditions).

Wrap any rule (or rule set) in a `{ rules, $if }` object. Here `email` always runs and `required` only activates when `subscribe` is checked:

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

`rules` accepts a string, an array, a rule definition, or a Standard Schema. When the only rule is conditional, the object can be the entire `rules` value — an array is only needed when mixing with always-on rules.

Different `$if` values are separate objects:

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

Share one `$if` across several rules by passing them together:

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

The same object can wrap a Standard Schema:

```ts
import { z } from 'zod'

defineSchema({
  subscribe: { type: 'checkbox' },
  email: {
    type: 'text',
    rules: {
      rules: z.string().email(),
      $if: [['subscribe', '==', true]],
    },
  },
})
```

When a condition transitions from inactive to active, the rule revalidates immediately. When it transitions from active to inactive, the rule's error is cleared.

## Multilingual Rules

On a translatable element, a single rule set validates every language, or an object keyed by language code applies per-language rules:

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

Each language's value takes the full `rules` spec — string, array, custom rule definition, Standard Schema, or a conditional `{ rules, $if }` wrapper — and validates independently, with its errors tagged by the language's label. See [Multilingual Inputs](/guide/multilingual-inputs) for the full treatment.

## Debouncing

Debounce delays validation by a number of milliseconds — especially useful for async rules that make network requests.

### Element-level Debounce

The `debounce` prop delays every rule on the element:

```vue
<VfText name="email" rules="required|email" :debounce="500" />
```

### Rule-level Debounce

A delay can be set on an individual rule using the `debounce` named parameter:

```vue
<VfText name="email" rules="required|email:debounce=500" />
```

Only the `email` rule is debounced — `required` runs immediately.

### Resolution Order

When debounce is specified at multiple levels, the first defined value wins:

1. Rule-level `debounce` parameter (e.g. `email:debounce=500`)
2. The rule's own default (set in `!createRule`'s `debounce` option)
3. Element-level `debounce` prop
4. `0` (no debounce)

## Bail and Multiple Errors

By default, validation stops after the first failing rule. This is controlled by the `bail` prop, which defaults to `true`:

```vue
<VfText name="email" rules="required|email|min:5" />
```

If `required` fails, `email` and `min` are skipped. To run all rules regardless of failures, set `bail` to `false`:

```vue
<VfText name="email" rules="required|email|min:5" :bail="false" />
```

Now all three rules run and the element may collect multiple errors.

The `maxErrors` prop controls how many errors are **displayed**. It defaults to `1`, so even with `bail` disabled only one error appears at a time. Set `maxErrors` to `-1` to show all collected errors:

```vue
<VfText
  name="email"
  rules="required|email|min:5"
  :bail="false"
  :max-errors="-1"
/>
```

::: info
`bail` controls how many rules **run**; `maxErrors` controls how many errors are **shown**. Both can be set independently. On translatable elements, `bail` stops within each language's rule set separately.
:::

## Custom Error Messages

### Resolution Order

Error messages are resolved in this order, top-down:

1. Inline string returned from the check function (`return 'Custom message'`).
2. Rule's `message` option in `!createRule` — string, locale tag, or function.
3. Element-level `ruleMessages` prop.
4. Form-level `ruleMessages` prop.
5. Locale tag from `ruleMessageTag(name, type?)` — e.g. `rule_required_error` or `rule_min_string_error`.
6. The fallback `rule_default_error` tag from the locale file.

At every step the resolved string passes through the [Locale](/api/modules/locale) module, so any value — whether it's the `message` option, the `ruleMessages` prop, or the default tag — can be a locale tag pointing to a key in the locale file. Messages resolve at read time: switching the locale re-renders errors without re-running checks.

::: info
[Standard Schema](#standard-schema-validation) failures carry their messages from the schema library itself and are not routed through `ruleMessages`.
:::

### Element-level Messages

Override messages for specific rules with the `ruleMessages` prop:

::: code-group

```ts [Schema]
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

```vue [Template]
<VfText
  name="email"
  rules="required|email"
  :rule-messages="{
    required: 'Please enter your email.',
    email: 'Not a valid email.',
  }"
/>
```

:::

### Form-level Messages

Messages set at the form level apply to every element unless an element overrides them:

```ts
const [MyForm] = useForm({
  schema,
  ruleMessages: {
    required: 'This field is required.',
  },
})
```

### Multilingual Messages

The `ruleMessages` prop accepts locale-keyed objects for multilingual overrides on any rule, including built-in ones:

```vue
<VfText
  name="email"
  rules="required|email"
  :rule-messages="{
    required: {
      en_US: 'Please enter your email.',
      de_DE: 'Bitte E-Mail eingeben.',
    },
  }"
/>
```

Custom rules take the same shape — both `!createRule`'s `message` option and the check's inline return value accept a locale-keyed object:

```ts
const lowercase = createRule('lowercase', (value) => {
  return value === value.toLowerCase()
}, {
  message: {
    en_US: 'The {attribute} must be lowercase.',
    de_DE: '{attribute} muss kleingeschrieben sein.',
  },
})
```

See [Multilingual Inputs](/guide/multilingual-inputs) for more on multilingual support.

### Custom Locale Tag

If you want a custom rule to resolve a **different** locale tag instead of the default `rule_{ruleName}_error`, pass that tag as the `message`:

```ts
const lowercase = createRule('lowercase', (value) => {
  return value === value.toLowerCase()
}, {
  message: 'custom_lowercase_validation',
})
```

The locale module looks up `custom_lowercase_validation` in the locale file. If it isn't a known tag, the string is used verbatim.

### Customizing the Tag Pattern

The `ruleMessageTag` config function controls how the default locale tag is built:

```ts
// Default implementation
ruleMessageTag: (name, type) =>
  type ? `rule_${name}_${type}_error` : `rule_${name}_error`
```

- **Standard rules** — only the `name` is passed; the tag is `rule_{name}_error`.
- **Size-typed rules** (`min`, `max`, `between`, `size`, `gt`, `gte`, `lt`, `lte`) — the `type` is appended to discriminate between value categories: `rule_min_string_error`, `rule_min_numeric_error`, `rule_min_array_error`, `rule_min_file_error`.

A custom rule opts into size-typed tags with `!createRule`'s `typed: true` option. The `type` string is derived from the element's **current value** at validation time — an array value yields `array`, a `File` yields `file`, a number yields `numeric`, and anything else yields `string`. It's the same category that decides how [size rules](#size) measure a value, and check functions receive it as `type` in the rule context.

Override it via the global config:

```ts
app.use(
  createVueform({
    ruleMessageTag: (name, type) =>
      type ? `validation.${name}.${type}` : `validation.${name}`,
  })
)
```

### Display Name

The `{attribute}` placeholder in error messages defaults to the element's `genericName`, which resolves as `displayName` → _adapter text props_ → `name`. The middle of the chain depends on the adapter: whatever meaningful text props it provides (a label, a placeholder, a floating label, …) are tried before falling back to `name`.

Override it explicitly with the `displayName` prop, which accepts a [`TextProp`](#?):

```vue
<VfText name="email" rules="required" display-name="email address" />
```

This produces `"The email address field is required."` instead of `"The email field is required."`.

### Message Placeholders

Error messages support placeholders that are replaced with parameter values:

- `{attribute}` — the element's display name.
- `{min}`, `{max}`, `{size}`, `{other}`, `{date}`, etc. — rule-specific parameters.

For example, the built-in `min` rule for strings produces `"The {attribute} must be at least {min} characters."`.

## Validation State

Every element exposes the same validation state through its [Context](/guide/context). Leaf elements derive it from their own rules; containers (`VfGroup`, `VfGrid`, `VfList`) aggregate it from their children — and can combine that with rules of their own (e.g. `min:2` on a `VfList` to require at least two items).

| Property        | Type       | Description                                                                                                                                                                                                                                                                              |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `invalid`       | `boolean`  | At least one rule failed — own or any child's.                                                                                                                                                                                                                                           |
| `pending`       | `boolean`  | An async rule is currently running — own or a child's.                                                                                                                                                                                                                                   |
| `debouncing`    | `boolean`  | A debounce timer is active — own or a child's.                                                                                                                                                                                                                                           |
| `busy`          | `boolean`  | `pending` or `debouncing` — blocks form submission.                                                                                                                                                                                                                                      |
| `validated`     | `boolean`  | All rules (own and children's) have run **against the current value**. Staleness is tracked at the model store: changing a value through any path — typing, `update()`, `load()`, a server write-back — marks the affected results stale and flips it back to `false` until they re-run. |
| `completed`     | `boolean`  | Validated without errors, or no rules defined.                                                                                                                                                                                                                                           |
| `success`       | `boolean`  | `completed` after the element has been touched (blurred).                                                                                                                                                                                                                                |
| `required`      | `boolean`  | An active `required` or `accepted` rule exists.                                                                                                                                                                                                                                          |
| `dirty`         | `boolean`  | The current value differs from the initial value.                                                                                                                                                                                                                                        |
| `empty`         | `boolean`  | The value is empty (for containers: every child is empty).                                                                                                                                                                                                                               |
| `touched`       | `boolean`  | The element has been blurred at least once.                                                                                                                                                                                                                                              |
| `errors`        | `string[]` | All error messages — validation rules plus [manual errors](#manual-errors), including hoisted children's.                                                                                                                                                                                |
| `displayErrors` | `string[]` | The errors actually rendered, capped by `maxErrors`.                                                                                                                                                                                                                                     |
| `ownErrors`     | `string[]` | The element's own errors, excluding hoisted children's.                                                                                                                                                                                                                                  |
| `hasError`      | `boolean`  | `errors` is non-empty.                                                                                                                                                                                                                                                                   |

```ts
formReady((form$) => {
  const email$ = form$.find('email')

  email$.invalid       // false
  email$.errors        // []
  email$.displayErrors // []
  email$.validated     // true
  email$.dirty         // false
})
```

Elements also emit `valid` and `invalid` [events](/guide/event-handlers) as they cross the boundary in either direction.

### Form State

The form aggregates the same boolean state (`invalid`, `pending`, `debouncing`, `busy`, `validated`, `completed`, `dirty`, `empty`) across all elements. Its error projections are keyed:

```ts
form$.errors
// { email: ['The Email field is required.'] }

form$.issues
// [{ path: 'email', rule: 'required', message: 'The Email field is required.' }]
```

`errors` maps element paths to their error arrays; unmatched [Validation Schema](#form-level-validation-schema) issues appear under the root `''` key. `issues` is the structured counterpart: `{ path, language?, rule, message }[]`.

### Headless Model State

A `!useModel` instance exposes the same summary — `invalid`, `errors`, `issues` — backed by the shared validator, as shown in [Validation Without a Form](#validation-without-a-form).

## Programmatic Validation

Every element, container, and the form (as well as headless model instances) expose the same validation methods:

| Method               | Description                                                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validate()`         | **Async**. Runs all rules; resolves `true` if valid. On containers and the form, children already validated without errors against their current value are skipped — pass `{ force: true }` to re-run everything regardless (what submit does when `validateOn` includes `'submit'`). |
| `validateCurrent()`  | **Async**. Translatable elements only — validates only the active language.                                                                                                                                                                                                           |
| `unvalidate()`       | Resets validation state — clears rule errors and marks as not validated.                                                                                                                                                                                                              |
| `invalidate()`       | Marks validators as needing re-validation (does not add errors).                                                                                                                                                                                                                      |
| `clearErrors()`      | Clears custom errors from this component's messageBag.                                                                                                                                                                                                                                |
| `clearMessages()`    | Clears custom messages from this component's messageBag.                                                                                                                                                                                                                              |
| `clearMessageBag()`  | Clears both errors and messages from this component's messageBag.                                                                                                                                                                                                                     |
| `toStandardSchema()` | Returns a `StandardSchemaV1` snapshot — see [Exporting as a Standard Schema](#exporting-as-a-standard-schema).                                                                                                                                                                        |

```ts
formReady(async (form$) => {
  const isValid = await form$.find('email').validate()

  if (!isValid) {
    console.log(form$.find('email').errors)
  }
})
```

::: warning
`clearErrors()`, `clearMessages()`, and `clearMessageBag()` only clear the **calling component's own** messageBag. Calling `form$.clearErrors()` clears the form-level messageBag — it does **not** cascade into individual elements. To clear element errors, call the method on each element directly.
:::

## Manual Errors

Beyond rule-based validation, you can add and remove custom errors on any element using its [`messageBag`](/api/modules/messageBag).

### Adding Errors

```ts
el$.messageBag.append('Not valid.', 'error')     // appended after rule errors
el$.messageBag.prepend('Server error.', 'error') // prepended before rule errors
```

The `'error'` argument is the default and can be omitted. Pass `'message'` to add an informational message that doesn't count as an error:

```ts
el$.messageBag.append('Saved successfully.', 'message')
```

Both `append` and `prepend` accept an optional third `keep` argument. When `true`, the message survives `clear()` and automatic clearing on value change.

### Removing and Clearing

```ts
el$.messageBag.remove('Not valid.', 'error')

el$.messageBag.clear('errors')   // only errors
el$.messageBag.clear('messages') // only messages
el$.messageBag.clear()           // both
```

### Auto-clearing on Value Change

By default, custom errors added via `messageBag` are cleared whenever the element's value changes. This is controlled by the `clearCustomErrors` form prop (default: `true`):

```vue
<VfForm :clear-custom-errors="false">
  <!-- Custom errors persist until manually cleared -->
</VfForm>
```

### Server-side Validation

For 422 responses from your backend, set the `setInvalid` form prop and Vueform automatically maps server errors to the matching elements. The mapping is configurable via `transformServerInvalid`. See [Server Validation Errors](/guide/submit#server-validation-errors) for the full setup.

For one-off cases or non-422 responses, append errors manually inside `onInvalid` / `onResponse`:

```ts
const [MyForm] = useForm({
  schema,
  endpoint: '/api/register',
  onInvalid: ({ errors, context$ }) => {
    Object.entries(errors).forEach(([path, messages]) => {
      const el$ = context$.find(path)
      messages.forEach((msg) => el$?.messageBag.append(msg, 'error'))
    })
  },
})
```

## Error Display

### Where Errors Appear

The form-level `errorLevel` prop controls **where** errors are rendered:

| Value       | Behavior                                                        |
| ----------- | --------------------------------------------------------------- |
| `'all'`     | Show errors on both the form and individual elements (default). |
| `'element'` | Show errors only on elements.                                   |
| `'form'`    | Show errors only at the form level.                             |
| `'none'`    | Don't show errors anywhere.                                     |

```vue
<VfForm error-level="element">
  <VfText name="email" rules="required|email" />
</VfForm>
```

### Hiding Errors

The `hideErrors` prop on an element suppresses its error display while validation still runs in the background:

```vue
<VfText name="email" rules="required|email" hide-errors />
```

The same prop on `!VfForm` hides only the form-level error block.

### Hoisting Errors

The `hoist` element prop pushes the element's errors up to its nearest ancestor element: the element doesn't display or report errors itself — the ancestor includes them in its own error display and in the form's errors instead.

```vue
<VfGroup name="address">
  <VfText name="zip" rules="required" hoist />
</VfGroup>
```

### Required Indicators

The `showRequired` prop controls where elements with an active `required` rule display their indicator — `['label']` by default; `['label', 'placeholder']` or `false` are also accepted, on the form (for all elements) or per element.

### Scroll and Focus

When submission fails validation, Vueform focuses and scrolls to the first invalid element. Both behaviors are on by default and configurable:

```vue
<VfForm
  :focus-error="false"
  :scroll-to-error="false"
  :scroll-options="{ behavior: 'smooth', block: 'center' }"
/>
```

`scrollOptions` is forwarded to the browser's `scrollIntoView`.

### Maximum Errors

The `maxErrors` prop limits how many errors are displayed per element (default `1`, `-1` for all). See [Bail and Multiple Errors](#bail-and-multiple-errors).

## Global Configuration

Validation-related props can be configured globally as [Defaults](/guide/defaults) for `!VfForm` or for all elements:

```ts
import { createVueform } from '@vueform/ui'

app.use(
  createVueform({
    defaults: {
      VfForm: {
        validateOn: ['blur', 'next'],
        scrollToError: true,
        scrollOptions: { behavior: 'smooth' },
        clearCustomErrors: true,
        errorLevel: 'all',
        focusError: true,
      },
      '*element': {
        bail: true,
        maxErrors: 1,
      },
    },
    rules: {
      /* custom rules registered globally */
    },
    ruleMessageTag: (name, type) =>
      type ? `rule_${name}_${type}_error` : `rule_${name}_error`,
  })
)
```

`rules` and `ruleMessageTag` are top-level config options. See [Defaults](/guide/defaults) for the full defaults system.

## Built-in Rules Reference

All built-in rules are registered automatically and referenced by name in [string and array syntax](#string-and-array-syntax). Each rule has its own page with usage examples, parameters, behavior, and error messages — see the [Rules reference](/rules/). To include only the ones you use, see [Code-Splitting](/guide/code-splitting).
