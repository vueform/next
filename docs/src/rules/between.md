# between

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Size](/rules/#size)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[min](/rules/min) · [max](/rules/max) · [size](/rules/size)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->229 B<!-- /@size --> |

</div>

Validates that the value's size is between a minimum and maximum (inclusive).

## Usage

::: usage validate

```vue [Preview]
<VfText name="age" label="Age" rules="numeric|between:18,65" />
```

```ts [Schema]
{
  age: {
    type: 'text',
    label: 'Age',
    rules: 'numeric|between:18,65',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `min` | The minimum size. |
| `max` | The maximum size. |

<!-- @rule:params end -->

## Behavior

How size is measured depends on the element type:

- **String** — the character count
- **Numeric** — the numeric value itself
- **Array** — the number of items
- **File** — the file size in kilobytes

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_between_string_error` | The {attribute} must be between {min} and {max} characters. |
| `rule_between_numeric_error` | The {attribute} must be between {min} and {max}. |
| `rule_between_array_error` | The {attribute} must have between {min} and {max} items. |
| `rule_between_file_error` | The {attribute} must be between {min} and {max} kilobytes. |

## Source

[packages/core/src/rules/between.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/between.ts)
