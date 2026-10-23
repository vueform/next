# lt

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Comparison](/rules/#comparison)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[lte](/rules/lte) · [gt](/rules/gt) · [gte](/rules/gte)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->290 B<!-- /@size --> |

</div>

Validates that the value's size is less than another element's size.

## Usage

::: usage validate

```vue [Preview]
<VfText name="budget" label="Budget" rules="numeric" />
<VfText name="spent" label="Spent" rules="numeric|lt:budget" />
```

```ts [Schema]
{
  budget: {
    type: 'text',
    label: 'Budget',
    rules: 'numeric',
  },
  spent: {
    type: 'text',
    label: 'Spent',
    rules: 'numeric|lt:budget',
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
| `rule_lt_string_error` | The {attribute} must be less than {value} characters. |
| `rule_lt_numeric_error` | The {attribute} must be less than {value}. |
| `rule_lt_array_error` | The {attribute} must have less than {value} items. |
| `rule_lt_file_error` | The {attribute} must be less than {value} kilobytes. |

## Source

[packages/core/src/rules/lt.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/lt.ts)
