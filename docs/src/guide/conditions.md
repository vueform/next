---
outline: [2,3]
---

# Conditions

Forms branch: a _Company_ field that only matters for business accounts, a _Settings_ tab reserved for admins, a `required` rule that only applies when a checkbox is ticked. Vueform expresses all of these with **conditions** — declarative rules that make an element's availability, props, items, or validation depend on other values in the form.

When an element's conditions aren't met, the element becomes **unavailable**: it isn't rendered, its validation is skipped, and its value is excluded from the submitted [payload](/guide/submit#the-payload) (the value itself stays in the model, so nothing is lost when the element comes back). Everything re-evaluates reactively — change the value a condition depends on and the form updates on the spot.

This chapter starts with the structured condition syntax and its operators, moves on to the other forms a condition can take — expressions, functions (including async ones), and booleans — and then tours all the places conditions plug in beyond the `conditions` prop itself.

## Basic Usage

The most common form is a **structured condition**: a tuple of `[elementPath, operator, value]` passed to the `conditions` prop. The path names the element whose value is checked — the same path you'd pass to `form$.find()`:

::: usage

```vue [Preview]
<VfForm>
  <VfRadios
    name="account_type"
    label="Account Type"
    :items="['Personal', 'Business']"
    default="Personal"
  />
  <VfText
    name="company"
    label="Company"
    :conditions="[['account_type', '==', 'Business']]"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  account_type: {
    type: 'radios',
    label: 'Account Type',
    items: ['Personal', 'Business'],
    default: 'Personal',
  },
  company: {
    type: 'text',
    label: 'Company',
    conditions: [['account_type', '==', 'Business']], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Select _Business_ and the _Company_ field appears; switch back and it disappears again.

Structured conditions reference elements by path, so they need `<VfForm>` around them — a [standalone element's](/guide/rendering#standalone-elements) structured conditions resolve as unmet (with a dev warning).

## Operators

### Operators with Values

| Operator  | Meaning                                        |
| --------- | ---------------------------------------------- |
| `==`      | Equality.                                      |
| `!=`      | Inequality.                                    |
| `>`       | Greater than.                                  |
| `>=`      | Greater than or equal.                         |
| `<`       | Lower than.                                    |
| `<=`      | Lower than or equal.                           |
| `between` | Between two numbers (exclusive): `[min, max]`. |
| `^`       | Value starts with.                             |
| `$`       | Value ends with.                               |
| `*`       | Value contains substring.                      |
| `in`      | Value is inside array.                         |
| `not_in`  | Value is not inside array.                     |
| `before`  | Value is before a given date or `today`.       |
| `after`   | Value is after a given date or `today`.        |

::: code-group

```ts [Schema]
defineSchema({
  age: { type: 'text', inputType: 'number', label: 'Age' },
  guardian: {
    type: 'text',
    label: 'Guardian',
    conditions: [['age', '<', 18]],
  },
})
```

```vue [Template]
<VfText name="age" label="Age" input-type="number" />
<VfText name="guardian" label="Guardian" :conditions="[['age', '<', 18]]" />
```

:::

### Operators without Values

| Operator    | Meaning                    |
| ----------- | -------------------------- |
| `empty`     | Value is empty.            |
| `not_empty` | Value is not empty.        |
| `today`     | Value equals today's date. |

::: code-group

```ts [Schema]
defineSchema({
  email: { type: 'text', label: 'Email' },
  preferences: {
    type: 'text',
    label: 'Notification Preferences',
    conditions: [['email', 'not_empty']],
  },
})
```

```vue [Template]
<VfText name="email" label="Email" />
<VfText
  name="preferences"
  label="Notification Preferences"
  :conditions="[['email', 'not_empty']]"
/>
```

:::

"Empty" adapts to the value's type: strings count as empty when `''`, `null`, or `undefined`; arrays when they have no items; objects when all of their values are empty (checked recursively); `File` and `Blob` values are never empty.

### Date Operators

`before`, `after`, and `today` compare dates. The expected value is a `YYYY-MM-DD` string or the keyword `today`:

::: code-group

```ts [Schema]
defineSchema({
  start_date: { type: 'text', inputType: 'date', label: 'Start Date' },
  early_bird: {
    type: 'text',
    label: 'Early Bird Discount',
    conditions: [['start_date', 'before', '2026-06-01']],
  },
  extension: {
    type: 'text',
    label: 'Extension Available',
    conditions: [['start_date', 'after', 'today']],
  },
})
```

```vue [Template]
<VfText name="start_date" label="Start Date" input-type="date" />
<VfText
  name="early_bird"
  label="Early Bird Discount"
  :conditions="[['start_date', 'before', '2026-06-01']]"
/>
<VfText
  name="extension"
  label="Extension Available"
  :conditions="[['start_date', 'after', 'today']]"
/>
```

:::

Comparisons are day-granular and invalid dates never match.

### Array Values

When the referenced element holds an **array** — a `VfCheckboxes`, a multi-select — the equality operators switch to membership logic:

- `['skills', '==', 'Frontend']` — true if `'Frontend'` is among the checked values.
- `['skills', '==', ['Backend', 'DevOps']]` — true if **any** checked value is in the expected array.
- `['skills', '!=', 'Frontend']` — true if `'Frontend'` is **not** among the checked values.
- `['skills', 'not_in', ['Backend', 'DevOps']]` — true if **none** of the checked values are in the expected array.

::: usage

```vue [Preview]
<VfCheckboxes
  name="skills"
  label="Skills"
  :items="['Frontend', 'Backend', 'DevOps']"
/>
<VfText
  name="framework"
  label="Preferred Framework"
  :conditions="[['skills', '==', 'Frontend']]"
/>
<VfText
  name="cloud_provider"
  label="Cloud Provider"
  :conditions="[['skills', '==', ['Backend', 'DevOps']]]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  skills: {
    type: 'checkboxes',
    label: 'Skills',
    items: ['Frontend', 'Backend', 'DevOps'],
  },
  framework: {
    type: 'text',
    label: 'Preferred Framework',
    conditions: [['skills', '==', 'Frontend']], // [!code highlight]
  },
  cloud_provider: {
    type: 'text',
    label: 'Cloud Provider',
    conditions: [['skills', '==', ['Backend', 'DevOps']]], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Combining Conditions

Multiple tuples in the `conditions` array are joined with **AND** — every one must pass:

::: code-group

```ts [Schema]
defineSchema({
  vat_number: {
    type: 'text',
    label: 'VAT Number',
    conditions: [
      ['account_type', '==', 'Business'], // AND
      ['region', '!=', 'US'],
    ],
  },
})
```

```vue [Template]
<VfText
  name="vat_number"
  label="VAT Number"
  :conditions="[
    ['account_type', '==', 'Business'],
    ['region', '!=', 'US'],
  ]"
/>
```

:::

### OR Groups

Wrap tuples in a nested array to join them with **OR** — the group passes when at least one member does:

::: code-group

```ts [Schema]
defineSchema({
  bonus_gift: {
    type: 'text',
    label: 'Bonus Gift',
    conditions: [
      [
        ['loyalty_tier', '==', 'Gold'], // OR
        ['coupon_code', 'not_empty'],
      ],
    ],
  },
})
```

```vue [Template]
<VfText
  name="bonus_gift"
  label="Bonus Gift"
  :conditions="[
    [
      ['loyalty_tier', '==', 'Gold'],
      ['coupon_code', 'not_empty'],
    ],
  ]"
/>
```

:::

OR groups mix freely with plain tuples in the same array — the array stays AND-joined, with each OR group counting as one member. Two things to know:

- When every branch tests the **same** path with `==`, prefer the `in` operator: `[['role', 'in', ['Developer', 'Designer']]]`.
- OR groups don't nest. For logic beyond one AND-of-ORs level, use an [expression](#expression-conditions) or a [function](#functional-conditions).

### Negation

Any condition — structured, expression, functional, or boolean — can be inverted by wrapping it in `{ not: ... }`:

::: code-group

```ts [Schema]
defineSchema({
  promo_code: { type: 'text', label: 'Promo Code' },
  standard_pricing: {
    type: 'text',
    label: 'Standard Pricing',
    conditions: {
      not: [['promo_code', '==', 'DISCOUNT50']], // [!code highlight]
    },
  },
})
```

```vue [Template]
<VfText name="promo_code" label="Promo Code" />
<VfText
  name="standard_pricing"
  label="Standard Pricing"
  :conditions="{
    not: [['promo_code', '==', 'DISCOUNT50']],
  }"
/>
```

:::

_Standard Pricing_ stays available as long as the promo code is **not** `DISCOUNT50`.

## Expression Conditions

When `conditions` is a **string**, it's evaluated as a logical [expression](/guide/expressions) against the form's data:

::: usage

```vue [Preview]
<VfRadios
  name="plan"
  label="Plan"
  :items="['Free', 'Pro']"
  default="Free"
/>
<VfRadios
  name="billing"
  label="Billing"
  :items="['Monthly', 'Annual']"
  default="Monthly"
/>
<VfText
  name="loyalty_points"
  label="Loyalty Points"
  conditions="plan == 'Pro' and billing == 'Annual'"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  plan: {
    type: 'radios',
    label: 'Plan',
    items: ['Free', 'Pro'],
    default: 'Free',
  },
  billing: {
    type: 'radios',
    label: 'Billing',
    items: ['Monthly', 'Annual'],
    default: 'Monthly',
  },
  loyalty_points: {
    type: 'text',
    label: 'Loyalty Points',
    conditions: "plan == 'Pro' and billing == 'Annual'", // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Write the expression as-is — the `{...}` wrapping used elsewhere is added automatically. The result must evaluate to a boolean; anything else counts as `false`.

Expressions shine when the logic outgrows tuples — nesting, arithmetic, functions — while staying serializable as plain strings:

```ts
conditions: "(plan == 'Pro' or coupon != '') and NOT_EMPTY(email)"
```

::: warning
Expression conditions with operators or functions require an expression engine — the [`@vueform/expr-eval`](/guide/expressions#installing-the-expression-engine) plugin. Without it they resolve as unmet.
:::

## Functional Conditions

For full programmatic control, pass a **function**. It receives the component's [Context](/guide/context) and returns a boolean:

::: code-group

```ts [Schema]
defineSchema({
  plan: { type: 'radios', label: 'Plan', items: ['Free', 'Pro'] },
  billing: {
    type: 'radios',
    label: 'Billing',
    items: ['Monthly', 'Annual'],
  },
  loyalty_points: {
    type: 'text',
    label: 'Loyalty Points',
    conditions: (el$) => {
      const model = el$.form$?.model

      return model?.plan === 'Pro' && model?.billing === 'Annual'
    },
  },
})
```

```vue [Template]
<script setup lang="ts">
const loyaltyConditions = (el$) => {
  const model = el$.form$?.model

  return model?.plan === 'Pro' && model?.billing === 'Annual'
}
</script>

<template>
  <VfRadios name="plan" label="Plan" :items="['Free', 'Pro']" />
  <VfRadios name="billing" label="Billing" :items="['Monthly', 'Annual']" />
  <VfText
    name="loyalty_points"
    label="Loyalty Points"
    :conditions="loyaltyConditions"
  />
</template>
```

:::

Through the context you can reach the form (`el$.form$`), other elements (`el$.form$.find(...)`), or anything else in scope — reach for a function when the logic depends on state a structured condition can't express.

## Async Conditions

The function may also return a **Promise** — for example to ask the server whether a feature is enabled:

::: code-group

```ts [Schema]
defineSchema({
  beta_features: {
    type: 'checkbox',
    text: 'Enable beta features',
    conditions: async (el$) => {
      const res = await fetch('/api/feature-flags/beta')

      return (await res.json()).enabled
    },
  },
})
```

```vue [Template]
<script setup lang="ts">
const betaEnabled = async (el$) => {
  const res = await fetch('/api/feature-flags/beta')

  return (await res.json()).enabled
}
</script>

<template>
  <VfCheckbox
    name="beta_features"
    text="Enable beta features"
    :conditions="betaEnabled"
  />
</template>
```

:::

While the promise is pending the condition counts as unmet; a rejected promise stays unmet (with a dev warning). Async conditions re-run when the model changes, **debounced** so a burst of keystrokes triggers one evaluation instead of dozens. Two props tune this:

- `conditionsTrigger` — replaces "any model change" as the re-evaluation trigger. Accepts an array of element paths to watch, a ref, or a watch-getter function.
- `conditionsDebounce` — the debounce delay in milliseconds. Defaults to the global `$conditions.debounce` config (`300`).

::: code-group

```ts [Schema]
defineSchema({
  username: { type: 'text', label: 'Username' },
  premium_badge: {
    type: 'checkbox',
    text: 'Show premium badge',
    conditions: async (el$) => await isPremium(el$.form$?.model.username),
    conditionsTrigger: ['username'], // [!code highlight]
    conditionsDebounce: 500, // [!code highlight]
  },
})
```

```vue [Template]
<script setup lang="ts">
const isPremiumUser = async (el$) => {
  return await isPremium(el$.form$?.model.username)
}
</script>

<template>
  <VfText name="username" label="Username" />
  <VfCheckbox
    name="premium_badge"
    text="Show premium badge"
    :conditions="isPremiumUser"
    :conditions-trigger="['username']"
    :conditions-debounce="500"
  />
</template>
```

:::

Both props cover **all** of the element's conditional props — `conditions`, `disabled`, `readonly`, and conditional validation rules. `!VfForm` accepts the same pair for its own conditional props.

## Boolean Conditions

The `conditions` prop also takes a plain `boolean` or a `Ref<boolean>` — handy when availability is driven by state outside the form:

::: code-group

```vue [Schema]
<script setup lang="ts">
import { ref } from 'vue'
import { defineSchema, useForm } from '@vueform/ui'

const showBilling = ref(true)

const schema = defineSchema({
  billing_address: {
    type: 'text',
    label: 'Billing Address',
    conditions: showBilling, // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'

const showBilling = ref(true)
</script>

<template>
  <VfForm>
    <VfText
      name="billing_address"
      label="Billing Address"
      :conditions="showBilling"
    />
  </VfForm>
</template>
```

:::

A static `conditions: false` excludes the element outright; a ref toggles availability as its value changes.

## Wildcard Paths

Inside a [`VfList`](/guide/repeaters), rows repeat — so a condition can't name a fixed path like `contacts.0.type`. The `*` wildcard stands in for the current row's index, letting each row reference its **own** sibling values:

::: usage

```vue [Preview]
<VfList
  name="contacts"
  label="Contacts"
  :schema="{
    type: {
      type: 'radios',
      items: { email: 'Email', phone: 'Phone' },
      default: 'email',
    },
    email: {
      type: 'text',
      placeholder: 'Email',
      conditions: [['contacts.*.type', '==', 'email']],
    },
    phone: {
      type: 'text',
      placeholder: 'Phone',
      conditions: [['contacts.*.type', '==', 'phone']],
    },
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contacts: {
    type: 'list',
    label: 'Contacts',
    schema: {
      type: {
        type: 'radios',
        items: { email: 'Email', phone: 'Phone' },
        default: 'email',
      },
      email: { type: 'text', placeholder: 'Email',
        conditions: [['contacts.*.type', '==', 'email']], // [!code highlight]
      },
      phone: { type: 'text', placeholder: 'Phone',
        conditions: [['contacts.*.type', '==', 'phone']], // [!code highlight]
      },
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

At evaluation time `contacts.*.type` becomes `contacts.0.type` for the first row, `contacts.1.type` for the second, and so on — each row switches independently. Nested lists take one `*` per level: `orders.*.items.*.type`.

## Conditions on Element Properties

By default a structured condition compares the target element's **value**. Appending `@propName` to the path compares a property of the element's [Context](/guide/context) instead — the same `path@prop` syntax as [Expressions](/guide/expressions#referencing-element-props):

```
[elementPath@propName, operator, value]
```

Any context property works, with dot paths drilling deeper. Some useful ones:

```ts
// Whether another element is currently available
conditions: [['settings@available', '==', true]]

// Another element's resolved label
conditions: [['email@label', '==', 'Work Email']]

// A nested value inside an object-valued element
conditions: [['address@model.country', '==', 'US']]

// Length of an array or string (native .length at the end of the path)
conditions: [['tags@model.length', '>', 0]]
```

Prop paths work with every operator, inside AND/OR groups, and under `{ not: ... }` — anywhere a structured tuple is accepted.

## Conditional Props

Availability isn't the only thing conditions can drive. The `disabled` and `readonly` props accept the **same syntax** as `conditions` — tuples, expressions, functions, booleans, refs, negation:

::: usage

```vue [Preview]
<VfCheckbox name="agree" text="I agree to the terms" />
<VfText
  name="email"
  label="Email"
  :disabled="[['agree', '!=', true]]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  agree: {
    type: 'checkbox',
    text: 'I agree to the terms',
  },
  email: {
    type: 'text',
    label: 'Email',
    disabled: [['agree', '!=', true]], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The difference from `conditions`: a disabled or readonly element stays **visible** and its value stays in the payload — only interaction is blocked. `!VfForm` itself takes conditional `disabled` and `readonly` too, affecting the whole form at once.

Other elements reuse the same conditional machinery for their own props — for example `VfList`'s `disabled` prop, or per-item `disabled` below.

## Conditions on Items

Items of a `VfSelect`, `VfCheckboxes`, or `VfRadios` can appear and disappear individually. Point the `itemConditions` prop at the property on your item objects that holds each item's conditions:

::: usage

```vue [Preview]
<VfRadios
  name="plan"
  label="Plan"
  :items="['Free', 'Pro']"
  default="Free"
/>
<VfCheckboxes
  name="features"
  label="Features"
  item-label="label"
  item-conditions="conditions"
  :items="[
    { value: 'basic', label: 'Basic' },
    {
      value: 'advanced',
      label: 'Advanced',
      conditions: [['plan', '==', 'Pro']],
    },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  plan: {
    type: 'radios',
    label: 'Plan',
    items: ['Free', 'Pro'],
    default: 'Free',
  },
  features: {
    type: 'checkboxes',
    label: 'Features',
    itemLabel: 'label',
    itemConditions: 'conditions', // [!code highlight]
    items: [
      { value: 'basic', label: 'Basic' },
      {
        value: 'advanced',
        label: 'Advanced',
        conditions: [['plan', '==', 'Pro']],
      },
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The _Advanced_ option only exists while the plan is _Pro_. `itemConditions` also accepts a function — `(item) => item.conditions` — and the property value takes any condition form, not just tuples.

Two related props follow the same pattern:

- `itemDisabled` — the property (or function) resolving whether an item is **disabled**: the item stays visible but can't be picked. Booleans and conditional values both work.
- `groupConditions` — for grouped items, the property (or function) resolving a whole group's availability; unavailable groups disappear with all their children.

::: code-group

```ts [Schema]
defineSchema({
  features: {
    type: 'checkboxes',
    itemLabel: 'label',
    itemDisabled: 'disabled', // [!code highlight]
    items: [
      { value: 'basic', label: 'Basic' },
      {
        value: 'advanced',
        label: 'Advanced',
        disabled: [['plan', '!=', 'Pro']],
      },
    ],
  },
})
```

```vue [Template]
<VfCheckboxes
  name="features"
  item-disabled="disabled"
  item-label="label"
  :items="[
    { value: 'basic', label: 'Basic' },
    {
      value: 'advanced',
      label: 'Advanced',
      disabled: [['plan', '!=', 'Pro']],
    },
  ]"
/>
```

:::

These props are only available for items defined as arrays of objects — plain string arrays and object maps have nowhere to put the conditions.

## Conditions on Tabs and Steps

In a [multi-page form](/guide/multi-page-forms), each tab or step belongs to a direct child element. Conditions on that element control the whole page — header and contents together:

::: usage

```vue [Preview]
<VfForm tabbed>
  <VfGroup name="profile" page="Profile">
    <VfText name="name" label="Name" />
    <VfCheckbox name="show_settings" text="Enable advanced settings" />
  </VfGroup>
  <VfGroup
    name="settings"
    page="Settings"
    :conditions="[['profile.show_settings', '==', true]]"
  >
    <VfText name="api_key" label="API Key" />
  </VfGroup>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  profile: {
    type: 'group',
    page: 'Profile',
    schema: {
      name: { type: 'text', label: 'Name' },
      show_settings: {
        type: 'checkbox',
        text: 'Enable advanced settings',
      },
    },
  },
  settings: {
    type: 'group',
    page: 'Settings',
    conditions: [['profile.show_settings', '==', true]], // [!code highlight]
    schema: {
      api_key: { type: 'text', label: 'API Key' },
    },
  },
})

const [Form] = useForm({ schema, tabbed: true })
</script>

<template>
  <Form />
</template>
```

:::

The _Settings_ tab only exists while the checkbox is checked. The same works with `stepped` forms — steps whose conditions aren't met are skipped in the wizard flow. See [Conditional Pages](/guide/multi-page-forms#conditional-pages).

## Conditions on Matrix Columns and Rows

`VfMatrix` accepts conditions on individual columns and rows when they're defined as arrays of objects — by default read from each object's `conditions` property:

::: usage

```vue [Preview]
<VfRadios
  name="plan"
  label="Plan"
  :items="['Free', 'Pro']"
  default="Free"
/>
<VfMatrix
  name="permissions"
  label="Permissions"
  :cols="[
    { value: 'read', label: 'Read' },
    {
      value: 'write',
      label: 'Write',
      conditions: [['plan', '==', 'Pro']],
    },
  ]"
  :rows="[
    { value: 'posts', label: 'Posts' },
    { value: 'comments', label: 'Comments' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  plan: {
    type: 'radios',
    label: 'Plan',
    items: ['Free', 'Pro'],
    default: 'Free',
  },
  permissions: {
    type: 'matrix',
    label: 'Permissions',
    cols: [
      { value: 'read', label: 'Read' },
      {
        value: 'write',
        label: 'Write',
        conditions: [['plan', '==', 'Pro']], // [!code highlight]
      },
    ],
    rows: [
      { value: 'posts', label: 'Posts' },
      { value: 'comments', label: 'Comments' },
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The _Write_ column only appears on the _Pro_ plan. If your row or column objects keep conditions under a different property, point `rowConditions` / `colConditions` at it — they work like `itemConditions` above.

## Conditional Validation Rules

Validation rules accept the same condition syntax through the `{ rules, $if }` wrapper — the rule only activates while `$if` is met:

::: code-group

```ts [Schema]
defineSchema({
  subscribe: {
    type: 'checkbox',
    text: 'Subscribe to newsletter',
  },
  email: {
    type: 'text',
    label: 'Email',
    rules: [
      'email',
      {
        rules: 'required',
        $if: [['subscribe', '==', true]], // [!code highlight]
      },
    ],
  },
})
```

```vue [Template]
<VfCheckbox name="subscribe" text="Subscribe to newsletter" />
<VfText
  name="email"
  label="Email"
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

Here `email` is always format-checked, but only **required** while the checkbox is ticked. See [Conditional Rules](/guide/validation#conditional-rules) for the full picture.

## Strict Comparisons

Numeric operators use loose JavaScript comparison by default, which has one surprising corner: an empty field satisfies `>= 0` because `'' >= 0` is `true`. The `$conditions.strict` config closes it — with strict mode on, `>=`, `<=`, and `<` treat `null`, `undefined`, and `''` as never matching:

```ts
app.use(
  createVueform({
    $conditions: {
      strict: true, // [!code highlight]
    },
  })
)
```

`>` isn't affected — empty values already never exceed a number. Turn this on when numeric comparisons shouldn't match unfilled fields.

## Circular References

Two elements may condition on each other — say, each of two checkboxes should disappear once the other is checked. Vueform detects the mutual reference and evaluates each side against the other's **value** without requiring the other to be available first, so the pair doesn't deadlock into both staying hidden:

::: usage

```vue [Preview]
<VfCheckbox
  name="enable_a"
  text="Enable A"
  :conditions="[['enable_b', '!=', true]]"
/>
<VfCheckbox
  name="enable_b"
  text="Enable B"
  :conditions="[['enable_a', '!=', true]]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  enable_a: {
    type: 'checkbox',
    text: 'Enable A',
    conditions: [['enable_b', '!=', true]], // [!code highlight]
  },
  enable_b: {
    type: 'checkbox',
    text: 'Enable B',
    conditions: [['enable_a', '!=', true]], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Check either box and the other disappears; uncheck it and the other returns.

No configuration needed — it's handled automatically for structured and expression conditions.
