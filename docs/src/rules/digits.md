# digits

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Size](/rules/#size)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[digits_between](/rules/digits_between) · [numeric](/rules/numeric) · [integer](/rules/integer)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->205 B<!-- /@size --> |

</div>

Validates that the value is numeric and has an exact number of digits.

## Usage

::: usage validate

```vue [Preview]
<VfText name="pin" label="PIN" rules="digits:4" />
```

```ts [Schema]
{
  pin: {
    type: 'text',
    label: 'PIN',
    rules: 'digits:4',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `digits` | The exact number of digits. |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_digits_error` | The {attribute} must be {digits} digits. |

## Source

[packages/core/src/rules/digits.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/digits.ts)
