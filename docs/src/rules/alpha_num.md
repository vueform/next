# alpha_num

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[alpha](/rules/alpha) · [alpha_dash](/rules/alpha_dash)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->199 B<!-- /@size --> |

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

## Source

[packages/core/src/rules/alpha_num.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/alpha_num.ts)
