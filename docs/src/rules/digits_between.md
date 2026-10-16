# digits_between

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Size](/rules/#size)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[digits](/rules/digits) · [between](/rules/between)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->228 B<!-- /@size --> |

</div>

Validates that the value is numeric with a digit count between a minimum and maximum.

## Usage

::: usage validate

```vue [Preview]
<VfText name="pin" label="PIN" rules="digits_between:4,6" />
```

```ts [Schema]
{
  pin: {
    type: 'text',
    label: 'PIN',
    rules: 'digits_between:4,6',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `min` | The minimum number of digits. |
| `max` | The maximum number of digits. |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_digits_between_error` | The {attribute} must be between {min} and {max} digits. |

## Source

[packages/core/src/rules/digits_between.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/digits_between.ts)
