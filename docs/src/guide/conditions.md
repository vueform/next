---
outline: [2,3]
---

# Conditions

Most real forms branch on their own data — an address block that only matters for home delivery, an admin-only settings tab, a `required` rule that applies once a checkbox is ticked.

In Vueform these branches are **conditions**, declarative rules that make an element's availability — or other aspect of its behavior — depend on other values in the form. Conditions re-evaluate reactively, so the form reshapes itself the moment a value they depend on changes.

## Showing and Hiding Elements

By far the most common case is one element appearing when another holds a given value. Pass a tuple of `[elementPath, operator, value]` to the `conditions` prop of the element you want to toggle:

::: usage

```vue [Preview]
<VfForm>
  <VfRadios
    name="delivery"
    label="Delivery Method"
    :items="['Pickup', 'Home delivery']"
    default="Pickup"
  />
  <VfText
    name="address"
    label="Shipping Address"
    :conditions="[['delivery', '==', 'Home delivery']]"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  delivery: {
    type: 'radios',
    label: 'Delivery Method',
    items: ['Pickup', 'Home delivery'],
    default: 'Pickup',
  },
  address: {
    type: 'text',
    label: 'Shipping Address',
    conditions: [['delivery', '==', 'Home delivery']], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Pick _Home delivery_ and the address field appears; switch back to _Pickup_ and it's gone. Since the tuple starts with a [path](/guide/element-paths), a condition can reference any element in the form, however deeply nested.

A hidden element isn't merely invisible — it's removed from the form entirely, with well-defined consequences for its value and validation covered in the [next section](#what-happens-to-hidden-elements).

## What Happens to Hidden Elements

An element whose conditions aren't met becomes **unavailable**, which guarantees four things:

- It isn't rendered — the element is removed from the DOM, not visually hidden.
- Its validation is skipped — a hidden `required` field can never block submission.
- Its value is excluded from the submitted [payload](/guide/submit#what-gets-sent).
- Its value is kept in the model — when the element comes back, it returns with the value it had, so nothing is lost by toggling it off and on.

Try it above — type an address, switch to _Pickup_, then back to _Home delivery_, and the address is still there, even though a submit in between wouldn't have included it.

Conditions are fully reactive. The moment a value they depend on changes, availability is re-evaluated and the form updates on the spot — there's no lifecycle hook to call or re-render to trigger.

## Operators

The middle part of a `[elementPath, operator, value]` condition decides how the referenced element's value is tested. Most operators compare it against the condition's `value` part, a few stand alone, and dates get dedicated treatment.

### Comparison Operators

These compare the referenced element's value against the condition's `value` part:

| Operator | Meaning |
| --- | --- |
| `==` | Equality. |
| `!=` | Inequality. |
| `>` | Greater than. |
| `>=` | Greater than or equal. |
| `<` | Lower than. |
| `<=` | Lower than or equal. |
| `between` | Between two numbers (exclusive): `[min, max]`. |
| `^` | Value starts with. |
| `$` | Value ends with. |
| `*` | Value contains substring. |
| `in` | Value is inside array. |
| `not_in` | Value is not inside array. |

```ts
conditions: [['quantity', '>=', 100]]
conditions: [['role', 'in', ['Admin', 'Editor']]]
conditions: [['coupon', '^', 'SAVE']]
```

### Presence Operators

Two operators check whether the element has a value at all and take no third part:

| Operator | Meaning |
| --- | --- |
| `empty` | Value is empty. |
| `not_empty` | Value is not empty. |

```ts
conditions: [['phone', 'not_empty']]
conditions: [['notes', 'empty']]
```

What counts as "empty" adapts to the value's type. Strings are empty when `''`, `null`, or `undefined`; arrays when they have no items; objects when all of their values are empty, checked recursively. Numbers are empty only while unset (`null` or `undefined`) — `0` is a value like any other. `File` and `Blob` values never count as empty.

### Date Operators

Three operators compare dates. `before` and `after` expect a `YYYY-MM-DD` string or the keyword `today` as the third part; `today` stands alone and matches when the value is today's date:

| Operator | Meaning |
| --- | --- |
| `before` | Value is before a given date or `today`. |
| `after` | Value is after a given date or `today`. |
| `today` | Value equals today's date. |

```ts
conditions: [['event_date', 'after', 'today']]
conditions: [['event_date', 'before', '2026-01-01']]
conditions: [['event_date', 'today']]
```

Comparisons are day-granular, and values that aren't valid dates never match.

### Multi-Value Elements

When the referenced element holds an **array** — checkboxes, a multiselect — the equality operators switch to membership logic:

- `['channels', '==', 'SMS']` — true if `'SMS'` is among the checked values.
- `['channels', '==', ['SMS', 'Push']]` — true if **any** checked value is in the expected array.
- `['channels', '!=', 'SMS']` — true if `'SMS'` is **not** among the checked values.
- `['channels', '!=', ['SMS', 'Push']]` — true if **none** of the checked values are in the expected array.

`in` and `not_in` behave exactly like `==` and `!=`, so use whichever reads better.

## Combining Conditions

The `conditions` array may hold any number of conditions, and they're joined with **AND** — the element is only available while every one of them passes:

```ts
conditions: [
  ['plan', '==', 'Pro'], // AND
  ['seats', '>=', 5],
]
```

### OR Groups

To join conditions with **OR** instead, wrap them in a nested array. The group passes when at least one of its members does:

```ts
conditions: [
  [
    ['tier', '==', 'Enterprise'], // OR
    ['urgent', 'not_empty'],
  ],
]
```

OR groups mix freely with plain conditions in the same array — the array stays AND-joined, and each group counts as one member:

```ts
conditions: [
  ['status', '==', 'active'], // AND
  [
    ['tier', '==', 'Enterprise'], // OR
    ['urgent', 'not_empty'],
  ],
]
```

OR groups don't nest. For logic deeper than one AND-of-ORs level, reach for an [expression](#expression-conditions) or a [function](#functional-conditions).

### Negation

Conditions can be inverted by wrapping them in `{ not: ... }`:

```ts
conditions: {
  not: [['status', '==', 'archived']],
}
```

The element stays available as long as the status is anything **but** `archived`.

## Expression Conditions

When `conditions` is a **string**, it's evaluated as a logical [expression](/guide/expressions) against the form's data. Expressions pack comparisons, boolean logic, arithmetic, and functions into one line — logic that would take nested arrays, or couldn't be written with them at all:

```ts
conditions: 'subtotal > 100 or member == true'
```

The result must evaluate to a boolean; anything else counts as `false`.

Since expressions nest freely and call functions, they're the serializable way past the one AND-of-ORs limit:

```ts
conditions: "(subtotal > 100 or member == true) and NOT_EMPTY(email)"
```

::: warning
Expression conditions with operators or functions require an expression engine — the [`@vueform/expr-eval`](/plugins/expr-eval) plugin. Without it they resolve as unmet.
:::

## Functional Conditions

For full programmatic control, pass a **function**. It receives the element's [context](/guide/context#element-context) and returns a boolean:

```ts
conditions: (context$) => {
  const model = context$.form$?.model

  return model?.quantity * model?.price > 500
}
```

Through the context the function can reach the form (`context$.form$`), other elements (`context$.form$.find(...)`), or anything else in scope — it's plain JavaScript, so nothing limits what the decision is based on. The trade-off is serializability — unlike arrays and expressions, a function can't be stored as JSON.

### Async Conditions

The function may also return a **Promise** — for example to ask the server:

```ts
conditions: async (context$) => {
  const res = await fetch('/api/features/priority-support')

  return (await res.json()).enabled
}
```

While the promise is pending the condition counts as unmet, and a rejected promise stays unmet (with a dev warning). Async conditions re-run with **every model change**, but they are **debounced** so a burst of keystrokes triggers one evaluation instead of dozens. Two props tune this:

- `conditionsTrigger` — replaces "any model change" as the re-evaluation trigger. Accepts an array of element [paths](/guide/elements-paths) to watch, a `ref`, or a function that receives the element's context and returns what to watch — a single value or an array, observed deeply, with re-evaluation running whenever it changes.
- `conditionsDebounce` — the debounce delay in milliseconds. Defaults to the global `$conditions.debounce` config (`300`).

```ts
coupon: { type: 'text', label: 'Coupon' },
free_gift: {
  type: 'checkbox',
  text: 'Add free gift',
  conditions: async ({ form$ }) => await isCouponValid(form$?.model.coupon),
  conditionsTrigger: ['coupon'], // [!code highlight]
  conditionsDebounce: 500, // [!code highlight]
},
```

Both props aren't specific to `conditions` — they cover every prop of the element that accepts conditions, as introduced [later in this chapter](#conditions-beyond-visibility). `!VfForm` accepts the same pair for its own conditional props (`disabled` and `readonly` for example).

## Boolean Conditions

The `conditions` prop also takes a plain `boolean` or a `Ref<boolean>` — handy when availability is driven by state outside the form:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isAdmin = ref(false)
</script>

<template>
  <VfForm>
    <VfText name="api_key" label="API Key" :conditions="isAdmin" />
  </VfForm>
</template>
```

A static `conditions: false` excludes the element outright; a ref toggles availability as its value changes.

## Conditions Beyond Visibility

Availability is only the most prominent thing conditions control. The same condition syntax — in all the forms covered above — is accepted by a handful of other props, each deciding a different aspect of an element's behavior.

### Disabled and Readonly

The `disabled` and `readonly` props take conditions directly:

::: usage

```vue [Preview]
<VfForm>
  <VfText name="email" label="Email" />
  <VfCheckbox
    name="newsletter"
    text="Subscribe to newsletter"
    :disabled="[['email', 'empty']]"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: {
    type: 'text',
    label: 'Email',
  },
  newsletter: {
    type: 'checkbox',
    text: 'Subscribe to newsletter',
    disabled: [['email', 'empty']],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The checkbox can't be ticked until an email is entered. The difference from `conditions`: a disabled or readonly element stays **visible** and its value stays in the payload — only interaction is blocked. `!VfForm` itself takes conditional `disabled` and `readonly` too, affecting the whole form at once.

### Conditional Validation

Validation rules accept conditions through the `{ rules, $if }` wrapper — the rule only applies while `$if` is met:

```ts
contact_method: {
  type: 'radios',
  label: 'Preferred Contact',
  items: ['Email', 'Phone'],
},
phone: {
  type: 'text',
  label: 'Phone',
  rules: [
    {
      rules: 'required',
      $if: [['contact_method', '==', 'Phone']], // [!code highlight]
    },
  ],
},
```

The phone number is only required while _Phone_ is the chosen contact method — with _Email_ selected it can stay blank. See [Conditional Rules](/guide/validation#conditional-rules) for the full picture.

### Conditional Items

Items of a `VfSelect`, `VfCheckboxes`, or `VfRadios` can appear and disappear individually. Point the `itemConditions` prop at the property of your item objects that holds each item's conditions:

::: usage model

```vue [Preview]
<VfForm>
  <VfSelect
    name="country"
    label="Country"
    :items="['US', 'International']"
    default="US"
  />
  <VfRadios
    name="shipping"
    label="Shipping"
    item-value="value"
    item-label="label"
    item-conditions="conditions"
    :items="[
      { value: 'standard', label: 'Standard' },
      {
        value: 'express',
        label: 'Express',
        conditions: [['country', '==', 'US']],
      },
    ]"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    items: ['US', 'International'],
    default: 'US',
  },
  shipping: {
    type: 'radios',
    label: 'Shipping',
    itemValue: 'value',
    itemLabel: 'label',
    itemConditions: 'conditions',
    items: [
      { value: 'standard', label: 'Standard' },
      {
        value: 'express',
        label: 'Express',
        conditions: [['country', '==', 'US']],
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

The _Express_ option only exists while the country is _US_. `itemConditions` also accepts a function — `(item) => item.conditions` — and the property's value takes any condition form, not just arrays.

When an **already selected** item becomes unavailable, its value is automatically cleared from the model — unlike a hidden element's value, a vanished option doesn't linger.

The `itemDisabled` prop follows the same pattern and resolves whether an item is **disabled** — the item stays visible but can't be picked.

These props only work with items defined as arrays of objects — plain string arrays and object maps have nowhere to hold the conditions.

### Conditional Matrix Rows and Columns

`VfMatrix` accepts conditions on individual columns and rows when they're defined as arrays of objects — by default read from each object's `conditions` property:

```ts
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
```

The _Write_ column only appears on the _Pro_ plan. If your row or column objects hold their conditions under a property named something other than `conditions`, point `rowConditions` / `colConditions` at it — they work like `itemConditions` above.

### Conditional Pages

In a [multi-page form](/guide/multi-page-forms), each tab or step belongs to a direct child element, and conditions on that element control the whole page — header and contents together:

```ts
settings: {
  type: 'group',
  page: 'Settings',
  conditions: [['profile.show_settings', '==', true]], // [!code highlight]
  schema: {
    api_key: { type: 'text', label: 'API Key' },
  },
},
```

In a tabbed form the _Settings_ tab only exists while the condition holds; in a stepped form the step is skipped in the wizard flow. This is also the way to gate many fields with one condition — a container's condition covers everything inside it. See [Conditional Pages](/guide/multi-page-forms#conditional-pages).

## Conditions in Repeated Rows

Inside a [`VfList`](/guide/repeaters), rows repeat — so a condition can't name a fixed path like `guests.0.meal`. The `*` wildcard stands in for the current row's index, letting each row reference its **own** sibling values:

::: usage

```vue [Preview]
<VfForm>
  <VfList
    name="guests"
    label="Guests"
    wrap
    :schema="{
      meal: {
        type: 'radios',
        items: ['Standard', 'Custom'],
        default: 'Standard',
      },
      custom_meal: {
        type: 'text',
        placeholder: 'Describe the custom meal',
        conditions: [['guests.*.meal', '==', 'Custom']],
      },
    }"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  guests: {
    type: 'list',
    label: 'Guests',
    wrap: true,
    schema: {
      meal: {
        type: 'radios',
        items: ['Standard', 'Custom'],
        default: 'Standard',
      },
      custom_meal: {
        type: 'text',
        placeholder: 'Describe the custom meal',
        conditions: [['guests.*.meal', '==', 'Custom']],
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

At evaluation time `guests.*.meal` becomes `guests.0.meal` for the first row, `guests.1.meal` for the second, and so on — each row switches independently. Nested lists take one `*` per level: `orders.*.items.*.type`.

## Referencing Element Properties

By default a condition compares the referenced element's **value**. Appending `@propName` to the path compares a property of that element's [context](/guide/context#element-context) instead:

```
[elementPath@propName, operator, value]
```

Props must be allowlisted in [`$security.safePropRefs`](/guide/configuration#security) before they can be referenced. A prop that isn't listed never resolves — the condition evaluates as unmet, with a dev warning naming the missing entry:

```ts
app.use(
  createVueform({
    $security: {
      safePropRefs: ['available', 'label', 'model.**'], // [!code highlight]
    },
  })
)
```

See [Prop References](/guide/security#prop-references) for the full pattern syntax `safePropRefs` accepts.

With that allowlist in place, conditions can read the listed properties, with dot paths drilling deeper into them:

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

Property paths aren't a special condition form — they work with every operator, inside AND/OR groups, and under `{ not: ... }`, anywhere a `[path, operator, value]` condition is accepted. The same `path@prop` syntax is available in [expressions](/guide/expressions), governed by the same allowlist.

## Evaluation Details

Condition evaluation has two corners worth knowing about — how loose comparison treats empty values, and what happens when two elements condition on each other.

### Strict Comparisons

Numeric operators use loose JavaScript comparison by default, which has one surprising consequence: an empty field satisfies `>= 0`, because `'' >= 0` is `true` in JavaScript. The `$conditions.strict` config closes this gap — with strict mode on, `>=`, `<=`, and `<` treat `null`, `undefined`, and `''` as never matching:

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

### Circular References

Two elements may condition on each other — say, each of two checkboxes should disappear once the other is checked. Normally a condition referencing an unavailable element resolves as unmet, which would deadlock the pair into both staying hidden. Vueform detects the mutual reference and evaluates each side against the other's **value** without requiring the other to be available first:

::: usage

```vue [Preview]
<VfForm>
  <VfCheckbox
    name="student_discount"
    text="Student discount"
    :conditions="[['senior_discount', '!=', true]]"
  />
  <VfCheckbox
    name="senior_discount"
    text="Senior discount"
    :conditions="[['student_discount', '!=', true]]"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  student_discount: {
    type: 'checkbox',
    text: 'Student discount',
    conditions: [['senior_discount', '!=', true]], // [!code highlight]
  },
  senior_discount: {
    type: 'checkbox',
    text: 'Senior discount',
    conditions: [['student_discount', '!=', true]], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Check either box and the other disappears; uncheck it and the other returns. No configuration needed — it's handled automatically for array and expression conditions.