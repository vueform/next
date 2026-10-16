# alpha_num

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.19 kB`<!-- /@size --> |

</div>

Validates that the value contains only Unicode letters and digits.

## Usage

::: usage validate

```vue [Preview]
<VfText name="username" label="Username" rules="alpha_num" />
```

```ts [Schema]
{
  username: {
    type: 'text',
    label: 'Username',
    rules: 'alpha_num',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_alpha_num_error` | The {attribute} may only contain letters and numbers. |

<!-- @rule:related start -->

## Related Rules

[alpha](/rules/alpha) · [alpha_dash](/rules/alpha_dash)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/alpha_num.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/alpha_num.ts)
