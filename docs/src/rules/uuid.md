# uuid

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.20 kB`<!-- /@size --> |

</div>

Validates that the value is a valid UUID.

## Usage

::: usage validate

```vue [Preview]
<VfText name="reference" label="Reference ID" rules="uuid" />
```

```ts [Schema]
{
  reference: {
    type: 'text',
    label: 'Reference ID',
    rules: 'uuid',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_uuid_error` | The {attribute} must be a valid UUID. |

<!-- @rule:related start -->

## Related Rules

[regex](/rules/regex)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/uuid.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/uuid.ts)
