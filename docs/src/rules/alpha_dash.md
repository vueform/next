# alpha_dash

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[alpha](/rules/alpha) · [alpha_num](/rules/alpha_num)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->203 B<!-- /@size --> |

</div>

Validates that the value contains only Unicode letters, digits, dashes, and underscores.

## Usage

::: usage validate

```vue [Preview]
<VfText name="slug" label="Slug" rules="alpha_dash" />
```

```ts [Schema]
{
  slug: {
    type: 'text',
    label: 'Slug',
    rules: 'alpha_dash',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_alpha_dash_error` | The {attribute} may only contain letters, numbers, dashes and underscores. |

## Source

[packages/core/src/rules/alpha_dash.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/alpha_dash.ts)
