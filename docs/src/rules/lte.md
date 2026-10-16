# lte

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Comparison](/rules/#comparison)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.29 kB`<!-- /@size --> |

</div>

Validates that the value's size is less than or equal to another element's size.

## Usage

::: usage validate

```vue [Preview]
<VfText name="capacity" label="Capacity" rules="numeric" />
<VfText name="attendees" label="Attendees" rules="numeric|lte:capacity" />
```

```ts [Schema]
{
  capacity: {
    type: 'text',
    label: 'Capacity',
    rules: 'numeric',
  },
  attendees: {
    type: 'text',
    label: 'Attendees',
    rules: 'numeric|lte:capacity',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `other` | The path of the element to compare against — see [Element Reference Parameters](/guide/validation#element-reference-parameters). |

<!-- @rule:params end -->

## Behavior

How size is measured depends on the element type:

- **String** — the character count
- **Numeric** — the numeric value itself
- **Array** — the number of items
- **File** — the file size in kilobytes

While the referenced element is empty and not yet validated, the rule passes — the comparison only kicks in once the other element has been validated or the form is submitted.

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_lte_string_error` | The {attribute} must be less than or equal {value} characters. |
| `rule_lte_numeric_error` | The {attribute} must be less than or equal {value}. |
| `rule_lte_array_error` | The {attribute} must not have more than {value} items. |
| `rule_lte_file_error` | The {attribute} must be less than or equal {value} kilobytes. |

<!-- @rule:related start -->

## Related Rules

[lt](/rules/lt) · [gt](/rules/gt) · [gte](/rules/gte)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/lte.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/lte.ts)
