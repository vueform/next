# gt

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Comparison](/rules/#comparison)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[gte](/rules/gte) · [lt](/rules/lt) · [lte](/rules/lte)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->291 B<!-- /@size --> |

</div>

Validates that the value's size is greater than another element's size.

## Usage

::: usage validate

```vue [Preview]
<VfText name="min_price" label="Min price" rules="numeric" />
<VfText name="max_price" label="Max price" rules="numeric|gt:min_price" />
```

```ts [Schema]
{
  min_price: {
    type: 'text',
    label: 'Min price',
    rules: 'numeric',
  },
  max_price: {
    type: 'text',
    label: 'Max price',
    rules: 'numeric|gt:min_price',
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
| `rule_gt_string_error` | The {attribute} must be greater than {value} characters. |
| `rule_gt_numeric_error` | The {attribute} must be greater than {value}. |
| `rule_gt_array_error` | The {attribute} must have more than {value} items. |
| `rule_gt_file_error` | The {attribute} must be greater than {value} kilobytes. |

## Source

[packages/core/src/rules/gt.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/gt.ts)
