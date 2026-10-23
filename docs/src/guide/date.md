---
outline: [2,3]
---

# Dates

Dates show up all over a form — a condition that compares against _today_, a rule that demands a birth date in the past, an [expression](/guide/expressions) that computes a deadline. All of it runs through one **date layer**, a small adapter-based module with a consistent date API. The built-in native adapter handles standard formats with zero dependencies; when you need custom format parsing and formatting, a date plugin ([Day.js](/plugins/dayjs), [date-fns](/plugins/date-fns), or [Luxon](/plugins/luxon)) swaps in underneath and everything on top keeps working.

## The Date Adapter

The module itself is thin — a `make(value, format?)` factory that parses a value into a `DateInstance`. The parsing and math behind it come from the configured [**adapter**](/guide/configuration#date), and the default entry wires in the dependency-free native adapter based on [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) by default. It understands:

- `Date` objects and timestamps
- `YYYY-MM-DD` strings (parsed as local dates)
- `YYYY-MM-DD HH:mm` and `YYYY-MM-DD HH:mm:ss` strings (parsed as local time)
- anything else `new Date()` accepts (ISO strings with timezones, …)

What it deliberately _doesn't_ do is format tokens. `format('DD/MM/YYYY')` and format-aware parsing (`make('31/12/2026', 'DD/MM/YYYY')`) warn and fall back to ISO output. Standard-format apps never notice; custom-format apps install a plugin.

### Format Plugins

The format-capable adapters ship as plugins wrapping the library you already use — [Day.js](/plugins/dayjs), [date-fns](/plugins/date-fns), or [Luxon](/plugins/luxon):

```ts
import { createVueform } from '@vueform/ui/origin'
import dayjs from '@vueform/date-dayjs'

createVueform({
  plugins: [dayjs()], // [!code highlight]
})
```

With one registered, everything format-related lights up: the [`date_format`](#in-validation-rules) rule, custom formats in [`DATE_ADD` / `FORMAT_DATE`](#in-expressions) expressions, and format-aware `useDate(value, format)` parsing — using the format tokens of the underlying library.

## Where Dates Are Used

Each spot below notes whether the built-in native adapter is enough. The short version — **standard formats** (`YYYY-MM-DD`, `YYYY-MM-DD HH:mm[:ss]`, `Date` objects, timestamps) **never need a plugin; custom format tokens always do**.

### In Conditions

The `before`, `after`, and `today` [condition operators](/guide/conditions#date-operators) compare an element's value against a date — a `YYYY-MM-DD` string or the `today` keyword — at day granularity:

```ts
{
  start_date: { type: 'text', inputType: 'date', label: 'Start Date' },
  early_bird: {
    type: 'text',
    label: 'Early Bird Discount',
    conditions: [['start_date', 'before', '2026-06-01']],
  },
}
```

**Plugin needed? No.** The operator's parameter is always a standard date or `today`, and element values in standard formats — what native date inputs produce — parse with the built-in adapter. The one exception is an element whose model holds a custom-formatted string (declared with the `valueFormat` prop, e.g. `'DD/MM/YYYY'`) — parsing that value needs a [format plugin](#format-plugins).

### In Validation Rules

The date-aware [rules](/guide/validation) parse and compare through the same adapter. The comparison rules all take the same `date` parameter, which accepts three forms: a fixed date (`after:2026-01-01`), the keywords `today` / `tomorrow` / `yesterday` (`before:today`), or **another element's path** (`after:start_date`):

| Rule | Validates that the value… | Format plugin? |
| --- | --- | --- |
| `date` | …is a valid date. | Not needed for standard formats. |
| `date_format:FORMAT` | …matches the given format exactly. | **Always required.** |
| `date_equals:date` | …falls on the given date. | Only if a compared value is custom-formatted*. |
| `before:date` / `before_or_equal:date` | …is before (or on) the given date. | Only if a compared value is custom-formatted*. |
| `after:date` / `after_or_equal:date` | …is after (or on) the given date. | Only if a compared value is custom-formatted*. |

_\* "Custom-formatted" means an element that stores its value in a format declared by its `valueFormat` prop. Each side of a comparison is parsed with its own element's format — so with a path parameter like `after:start_date`, a custom format on **either** element requires the plugin._

The path form gives the classic date-range pair:

```ts
{
  start_date: { type: 'text', inputType: 'date', rules: 'required|date' },
  end_date: {
    type: 'text',
    inputType: 'date',
    rules: 'required|after:start_date', // [!code highlight]
  },
}
```

See [Referencing Other Elements](/guide/validation#referencing-other-elements) for how path parameters resolve.

### In Expressions

The [expression functions](/guide/expressions#built-in-functions) `TODAY()`, `NOW()`, `AGE()`, `DATE_ADD()`, and `FORMAT_DATE()` resolve their dates through the adapter:

```ts
{
  dob: { type: 'text', inputType: 'date', label: 'Date of Birth' },
  age: { type: 'text', label: 'Age', default: '{AGE(dob)}' },
  deadline: {
    type: 'text',
    label: 'Deadline',
    default: "{DATE_ADD(TODAY(), 30, 'day')}",
  },
}
```

**Plugin needed? Only for `FORMAT_DATE()`** — it exists to apply format tokens, so it always requires a [format plugin](#format-plugins). The rest work with the built-in adapter on standard-format values; `DATE_ADD()` given a non-standard string warns and falls back to `YYYY-MM-DD` output.

## `!useDate`

For your own date work — event handlers, custom rules, functional conditions — `useDate` parses any value through the configured adapter and returns a `DateInstance`. Called with no arguments it returns the current date:

```ts
import { useDate } from '@vueform/ui'

const today = useDate()
const dob = useDate('1990-05-15')
const custom = useDate('31/12/2026', 'DD/MM/YYYY') // requires a format plugin

dob.isValid()                  // true
today.diff(dob, 'year')        // the age in whole years
dob.add(30, 'day').toISODate() // '1990-06-14'
```

In component setup it finds the app's adapter by itself. Outside a setup context the same function is available on the Vueform instance as `!vueform.$date`, already bound to that instance's adapter. Custom rules and expression functions receive the instance in their context as `vueform`:

```ts
import { createRule } from '@vueform/ui'

const workday = createRule('workday', (value, { vueform }) => {
  const day = vueform.$date(value).day()

  return day !== 0 && day !== 6
})
```

In a store, a route guard or a plain script, use the instance returned by `createVueform`:

```ts
// vueform.ts
import { createVueform } from '@vueform/ui/origin'

export const vueform = createVueform({
  // your configuration
})

// stores/orders.ts
import { vueform } from '@/vueform'

const deadline = vueform.$date(order.deadline)
```

Keeping a reference to the instance for exactly this purpose is covered in [outside a setup context](/guide/vueform-instance#outside-a-setup-context).

The instance is immutable — every manipulation returns a new instance — and exposes a [dayjs-compatible API](https://day.js.org/docs/en/installation/installation) regardless of which adapter is behind it:

| Group | Members |
| --- | --- |
| Validity | `isValid()` |
| Getters | `year()`, `month()` (1–12), `date()`, `day()` (0 = Sunday), `hour()`, `minute()`, `second()`, `millisecond()` |
| Manipulation | `add(amount, unit)`, `subtract(amount, unit)`, `startOf(unit)`, `endOf(unit)`, `set(unit, value)` |
| Comparison | `isBefore()`, `isAfter()`, `isSame()`, `isSameOrBefore()`, `isSameOrAfter()`, `isBetween()`, `diff(other, unit?)` — each accepting an optional unit granularity |
| Output | `toDate()`, `toISOString()`, `toISODate()`, `valueOf()`, `unix()`, `format(tokens)` (plugin), `clone()` |

Units accept singular and plural forms (`'day'` / `'days'`, `'month'` / `'months'`, …).

## Custom Adapters

An adapter is a factory returning the `make` function — take a value (and optional format), return Vueform's `DateInstance`. Wire your own under [`$date.adapter`](/guide/configuration#date) to route all date handling through an in-house implementation:

```ts
import { createVueform, type DateAdapter, type DateInstance } from '@vueform/ui/origin'

const myAdapter: DateAdapter = (options) => {
  return (value, format): DateInstance => {
    // return an object implementing the DateInstance interface
  }
}

createVueform({
  $date: { adapter: myAdapter }, // [!code highlight]
})
```

The returned object must implement the full `DateInstance` surface from the table above — the `nativeDateAdapter` [source](https://github.com/vueform/next/blob/main/packages/core/src/modules/date/nativeDateAdapter.ts) is the reference implementation to crib from. Once installed, conditions, rules, expressions, and `useDate` all run through it, unchanged.
