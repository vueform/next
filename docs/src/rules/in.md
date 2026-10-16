# in

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Membership](/rules/#membership)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[not_in](/rules/not_in) · [in_array](/rules/in_array)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->198 B<!-- /@size --> |

</div>

Validates that the value is one of the listed values.

## Usage

::: usage validate

```vue [Preview]
<VfText name="role" label="Role" rules="in:admin,editor,viewer" />
```

```ts [Schema]
{
  role: {
    type: 'text',
    label: 'Role',
    rules: 'in:admin,editor,viewer',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `...values` | The allowed values, as a comma-separated list. |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_in_error` | The selected {attribute} is invalid. |

## Source

[packages/core/src/rules/in.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/in.ts)
