# not_in

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Membership](/rules/#membership)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[in](/rules/in)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->191 B<!-- /@size --> |

</div>

Validates that the value is not any of the listed values.

## Usage

::: usage validate

```vue [Preview]
<VfText name="username" label="Username" rules="not_in:admin,root" />
```

```ts [Schema]
{
  username: {
    type: 'text',
    label: 'Username',
    rules: 'not_in:admin,root',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `...values` | The forbidden values, as a comma-separated list. |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_not_in_error` | The selected {attribute} is invalid. |

## Source

[packages/core/src/rules/not_in.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/not_in.ts)
