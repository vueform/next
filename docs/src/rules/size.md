# size

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Size](/rules/#size)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[min](/rules/min) · [max](/rules/max) · [between](/rules/between) · [digits](/rules/digits)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->208 B<!-- /@size --> |

</div>

Validates that the value's size exactly equals a given value.

## Usage

::: usage validate

```vue [Preview]
<VfText name="code" label="Invite code" rules="size:6" />
```

```ts [Schema]
{
  code: {
    type: 'text',
    label: 'Invite code',
    rules: 'size:6',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `size` | The exact size. |

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
| `rule_size_string_error` | The {attribute} must be {size} characters. |
| `rule_size_numeric_error` | The {attribute} must be {size}. |
| `rule_size_array_error` | The {attribute} must contain {size} items. |
| `rule_size_file_error` | The {attribute} must be {size} kilobytes. |

## Source

[packages/core/src/rules/size.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/size.ts)
