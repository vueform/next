# numeric

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Type](/rules/#type)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.22 kB`<!-- /@size --> |

</div>

Validates that the value is numeric.

## Usage

::: usage validate

```vue [Preview]
<VfText name="price" label="Price" rules="numeric" />
```

```ts [Schema]
{
  price: {
    type: 'text',
    label: 'Price',
    rules: 'numeric',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_numeric_error` | The {attribute} must be a number. |

<!-- @rule:related start -->

## Related Rules

[integer](/rules/integer) · [digits](/rules/digits)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/numeric.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/numeric.ts)
