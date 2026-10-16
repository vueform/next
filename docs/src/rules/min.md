# min

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Size](/rules/#size)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[max](/rules/max) · [between](/rules/between) · [size](/rules/size)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->212 B<!-- /@size --> |

</div>

Validates that the value's size is at least a minimum.

## Usage

::: usage validate

```vue [Preview]
<VfText name="username" label="Username" rules="required|min:3" />
```

```ts [Schema]
{
  username: {
    type: 'text',
    label: 'Username',
    rules: 'required|min:3',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `min` | The minimum size. |

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
| `rule_min_string_error` | The {attribute} must be at least {min} characters. |
| `rule_min_numeric_error` | The {attribute} must be at least {min}. |
| `rule_min_array_error` | The {attribute} must have at least {min} items. |
| `rule_min_file_error` | The {attribute} must be at least {min} kilobytes. |

## Source

[packages/core/src/rules/min.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/min.ts)
