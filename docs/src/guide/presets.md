---
outline: [2,3]
---

# Presets

A **preset** is a named bundle of prop values that a component opts into through its `presets` prop. Where a [default](/guide/defaults) reconfigures every instance of a component app-wide, a preset applies only where it's attached — and with a target, a single preset hung on a form or group reaches every matching component inside it, configuring a whole subtree from one place.

## Applying a Preset

Presets are registered under the `presets` key of the `createVueform` config:

```ts
createVueform({
  presets: {
    age: {
      label: 'Age',
      help: 'Must be 18 or older',
      rules: 'required|integer|min:18',
    },
  },
})
```

Any component then applies one by name:

```ts
{
  age: { type: 'text', presets: ['age'] },
}
```

In a template the prop takes the same array — `<VfText name="age" :presets="['age']" />`.

A preset's keys are the target's prop names, written exactly as in a schema entry. Keys that aren't props of the component are ignored, with one exception. Namespaced keys such as `part:input` resolve the same way props do — see [the `part:` shorthand](/guide/parts#the-part-shorthand).

Presets stack. Listing several applies them in order, and when two set the same prop, the later one wins. An unknown name logs a development warning and is skipped, and a name that reaches a component twice — say, from a default and from the prop — applies once. The prop is also reactive, so changing the array re-resolves the affected props.

## Targeting with `$apply`

On its own, a preset applies only to the component carrying it — the **host**. The `$apply` directive names which components the preset targets instead, and the preset then applies to every match among the host and its descendants:

```ts
createVueform({
  presets: {
    placeholder: {
      $apply: 'VfText',
      placeholder: 'Type here…',
    },
  },
})
```

```ts
const [Form] = useForm({
  schema: {
    full_name: { type: 'text', label: 'Full Name' },
    terms: { type: 'checkbox', text: 'I agree' },
  },
  presets: ['placeholder'],
})
```

The form itself doesn't match `VfText`, the text element gets the placeholder, and the checkbox is untouched.

`$apply` takes several shapes:

| `$apply` | Targets |
| --- | --- |
| `'this'` / omitted | Only the host. |
| `'VfText'` | Every component with that name. |
| `['VfGroup', 'VfText']` | Every component with one of the listed names. |
| `'*'` | Every component. |
| `'*element'` | Every component flagged as an element — see [wildcard targets](/guide/defaults#wildcard-targets). |
| Function | Every component the predicate returns `true` for. |

`'this'` mixes into arrays — `['this', 'VfText']` reaches the host plus every text element below it. When the preset passes down, `'this'` is stripped, so a descendant never matches it as its own host.

### Custom Predicate

A function `$apply` receives each candidate's component definition — a `ComponentOptions` object with `name`, `element`, `props`, and `emits` — and returns whether the preset applies:

```ts
createVueform({
  presets: {
    compact: {
      $apply: (component) => component.element === true,
      columns: 6,
    },
  },
})
```

## Controlling Cascade with `$cascade`

`$apply` does two jobs. It filters which components receive the preset, and it passes the preset down the subtree so descendants get a chance to match. The `$cascade` directive controls the second job on its own, and its defaults follow from `$apply`:

- With no `$apply`, or an `$apply` that is only `'this'`, `$cascade` defaults to `false` — nothing passes down.
- Any other `$apply` defaults `$cascade` to `true`.
- An explicit `$cascade: true` with no `$apply` implies `$apply: '*'` — the host and everything below it.

Setting `$cascade: false` next to a target turns the preset into a guard. It can be attached anywhere, only a host matching the target picks it up, and nothing below it ever sees the preset:

```ts
createVueform({
  presets: {
    half: { $apply: 'VfGroup', $cascade: false, columns: 6 },
  },
})
```

```ts
{
  address: {
    type: 'group',
    presets: ['half'],
    schema: {
      street: { type: 'text', label: 'Street' },
      coordinates: {
        type: 'group',
        schema: {
          lat: { type: 'text', label: 'Latitude' },
        },
      },
    },
  },
}
```

The outer group matches and goes half-width. The nested group would match `VfGroup` too, but with the cascade off it never receives the preset.

## Which Preset Wins

Presets sit between config defaults and local props in the prop [resolution order](/guide/defaults#resolution-order) — a default never beats a preset, and a prop set directly on the component beats them all.

Among presets themselves, **closer wins**. Inherited presets apply first, outermost ancestor before nearer ones, followed by the component's own — those attached through [defaults](/guide/defaults#merging-presets) before the ones in the `presets` prop, each in listed order. For the same prop, the last one applied wins:

```ts
createVueform({
  presets: {
    base: { $apply: '*', label: 'Answer', help: 'Required' },
    fullName: { label: 'Full Name' },
  },
})
```

```ts
const [Form] = useForm({
  schema: {
    name: { type: 'text', presets: ['fullName'] },
  },
  presets: ['base'],
})
```

The element's own preset is closer, so its `label` wins, while the form-level `help` still applies — the element resolves to `label: 'Full Name'` and `help: 'Required'`.

## Merging with `$merge`

When a preset sets a prop to a plain object, the object shallow-merges with whatever sits beneath it — built-in defaults, config defaults, earlier presets. Primitives and arrays replace instead. `null` counts as a real value and overrides, while `undefined` is skipped entirely:

```ts
createVueform({
  defaults: {
    VfText: {
      ruleMessages: { required: 'This field is required' },
    },
  },
  presets: {
    messages: {
      ruleMessages: { email: 'Enter a valid email address' },
    },
  },
})
```

A text element applying `messages` resolves `ruleMessages` with both keys — the default's `required` and the preset's `email`. Setting `$merge: false` makes the preset's values replace what's beneath instead:

```ts
messages: {
  $merge: false, // [!code highlight]
  ruleMessages: { email: 'Enter a valid email address' },
},
```

Now the same element resolves `ruleMessages` to `{ email: … }` alone. `$merge: false` covers every key the preset sets, `classes` included — it replaces `classes` coming from defaults and earlier presets. The component's built-in classes are unaffected, since they aren't part of the prop.

A plain-object prop set directly on the component merges on top of the resolved result, unless [`mergeObjectProps`](/guide/configuration#mergeObjectProps) is `false`. How `class`, `classes`, and `reclass` from presets combine with every other class source is covered in [override priority](/guide/classes#override-priority).

## Multi-Rule Presets

A preset entry can also be an **array of rules**, each carrying its own `$apply`, `$cascade`, and `$merge` — one name configuring several component types at once:

```ts
createVueform({
  presets: {
    survey: [
      { $apply: 'VfForm', successMessage: 'Thanks for your feedback!' },
      { $apply: 'VfText', autocomplete: 'off' },
    ],
  },
})
```

A form with `presets: ['survey']` applies both rules — the first configures the form itself, the second every text element inside it.

## Inline Presets

The `presets` prop also takes preset objects — and arrays of rules — directly, with no registration. This suits one-offs and prototyping:

```ts
{
  address: {
    type: 'group',
    presets: [{ $apply: 'VfText', columns: 6 }],
    schema: {
      city: { type: 'text', label: 'City' },
      zip: { type: 'text', label: 'ZIP' },
    },
  },
}
```

Both fields go half-width, and nothing is registered or leaks outside the group.

## TypeScript

Presets registered in `createVueform` are loosely typed. `$apply` autocompletes the registered component names, but the values are `Record<string, any>` — prop keys and value types aren't checked there, and names in a `presets` prop are plain strings.

`!definePreset` adds the checking. When `$apply` is a component name, an array of names, or `'*element'`, the preset's keys are validated against the target's props:

```ts
import { definePreset } from '@vueform/ui'

const compact = definePreset({
  $apply: '*element',
  columns: 6,
})

createVueform({
  presets: { compact },
})
```

Predicates, `'*'`, host-only presets, and multi-rule arrays fall through to the untyped `PresetDefinition` overload — see [definePreset](/api/helpers/definePreset).

## Limitations

A preset carries prop values and nothing else.

Event handlers aren't props, so an `onChange`-style key in a preset is ignored — see [event handlers](/guide/event-handlers) for where handlers belong.

A `presets` key inside a preset is ignored too, so presets don't chain. To compose behaviors, list several names in the `presets` prop instead.
