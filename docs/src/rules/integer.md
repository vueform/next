# integer

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Type](/rules/#type)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[numeric](/rules/numeric) · [digits](/rules/digits)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->196 B<!-- /@size --> |

</div>

Validates that the value is an integer.

## Usage

::: usage validate

```vue [Preview]
<VfText name="quantity" label="Quantity" rules="integer" />
```

```ts [Schema]
{
  quantity: {
    type: 'text',
    label: 'Quantity',
    rules: 'integer',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_integer_error` | The {attribute} must be an integer. |

## Source

[packages/core/src/rules/integer.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/integer.ts)
