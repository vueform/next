# json

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.20 kB`<!-- /@size --> |

</div>

Validates that the value is a valid JSON string.

## Usage

::: usage validate

```vue [Preview]
<VfTextarea name="payload" label="Payload" rules="json" />
```

```ts [Schema]
{
  payload: {
    type: 'textarea',
    label: 'Payload',
    rules: 'json',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_json_error` | The {attribute} must be a valid JSON string. |

<!-- @rule:related start -->

## Related Rules

[string](/rules/string)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/json.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/json.ts)
