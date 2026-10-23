# confirmed

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Cross-field](/rules/#cross-field)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[same](/rules/same)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->202 B<!-- /@size --> |

</div>

Validates that the value matches a sibling element named `{name}_confirmed`.

## Usage

::: usage validate

```vue [Preview]
<VfText name="password" label="Password" rules="required|confirmed" />
<VfText name="password_confirmed" label="Confirm password" />
```

```ts [Schema]
{
  password: {
    type: 'text',
    label: 'Password',
    rules: 'required|confirmed',
  },
  password_confirmed: {
    type: 'text',
    label: 'Confirm password',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Behavior

The confirmation element is looked up automatically by appending `_confirmed` to the element's own path. This is equivalent to using [`same`](/rules/same) explicitly on the confirmation element (`same:password`).

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_confirmed_error` | The {attribute} confirmation does not match. |

## Source

[packages/core/src/rules/confirmed.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/confirmed.ts)
