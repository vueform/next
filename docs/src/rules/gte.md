# gte

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Comparison](/rules/#comparison)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[gt](/rules/gt) · [lt](/rules/lt) · [lte](/rules/lte)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->293 B<!-- /@size --> |

</div>

Validates that the value's size is greater than or equal to another element's size.

## Usage

::: usage validate

```vue [Preview]
<VfText name="min_guests" label="Min guests" rules="numeric" />
<VfText name="max_guests" label="Max guests" rules="numeric|gte:min_guests" />
```

```ts [Schema]
{
  min_guests: {
    type: 'text',
    label: 'Min guests',
    rules: 'numeric',
  },
  max_guests: {
    type: 'text',
    label: 'Max guests',
    rules: 'numeric|gte:min_guests',
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
| `rule_gte_string_error` | The {attribute} must be greater than or equal {value} characters. |
| `rule_gte_numeric_error` | The {attribute} must be greater than or equal {value}. |
| `rule_gte_array_error` | The {attribute} must have {value} items or more. |
| `rule_gte_file_error` | The {attribute} must be greater than or equal {value} kilobytes. |

## Source

[packages/core/src/rules/gte.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/gte.ts)
