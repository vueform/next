# alpha

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[alpha_num](/rules/alpha_num) · [alpha_dash](/rules/alpha_dash)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->191 B<!-- /@size --> |

</div>

Validates that the value contains only Unicode letters.

## Usage

::: usage validate

```vue [Preview]
<VfText name="first_name" label="First name" rules="alpha" />
```

```ts [Schema]
{
  first_name: {
    type: 'text',
    label: 'First name',
    rules: 'alpha',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_alpha_error` | The {attribute} may only contain letters. |

## Source

[packages/core/src/rules/alpha.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/alpha.ts)
