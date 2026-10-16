# max

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Size](/rules/#size)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[min](/rules/min) · [between](/rules/between) · [size](/rules/size)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->213 B<!-- /@size --> |

</div>

Validates that the value's size does not exceed a maximum.

## Usage

::: usage validate

```vue [Preview]
<VfText name="username" label="Username" rules="max:16" />
```

```ts [Schema]
{
  username: {
    type: 'text',
    label: 'Username',
    rules: 'max:16',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
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
| `rule_max_string_error` | The {attribute} may not be greater than {max} characters. |
| `rule_max_numeric_error` | The {attribute} may not be greater than {max}. |
| `rule_max_array_error` | The {attribute} may not have more than {max} items. |
| `rule_max_file_error` | The {attribute} may not be greater than {max} kilobytes. |

## Source

[packages/core/src/rules/max.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/max.ts)
