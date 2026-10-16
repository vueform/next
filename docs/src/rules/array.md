# array

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Type](/rules/#type)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.17 kB`<!-- /@size --> |

</div>

Validates that the value is an array.

## Usage

::: usage validate

```vue [Preview]
<VfCheckboxes
  name="interests"
  label="Interests"
  :items="['Design', 'Development', 'Marketing']"
  rules="array"
/>
```

```ts [Schema]
{
  interests: {
    type: 'checkboxes',
    label: 'Interests',
    items: ['Design', 'Development', 'Marketing'],
    rules: 'array',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_array_error` | The {attribute} must be an array. |

<!-- @rule:related start -->

## Related Rules

[distinct](/rules/distinct) · [in_array](/rules/in_array)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/array.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/array.ts)
