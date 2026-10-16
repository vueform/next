# filled

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Presence](/rules/#presence)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.18 kB`<!-- /@size --> |

</div>

Validates that the value is not empty when the element is present.

## Usage

::: usage validate

```vue [Preview]
<VfText name="nickname" label="Nickname" rules="filled" />
```

```ts [Schema]
{
  nickname: {
    type: 'text',
    label: 'Nickname',
    rules: 'filled',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_filled_error` | The {attribute} field must have a value. |

<!-- @rule:related start -->

## Related Rules

[required](/rules/required) · [nullable](/rules/nullable)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/filled.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/filled.ts)
