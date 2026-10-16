# nullable

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Presence](/rules/#presence)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.17 kB`<!-- /@size --> |

</div>

Marks the element as nullable — when its value is empty, all other rules on the element are skipped.

## Usage

::: usage validate

```vue [Preview]
<VfText name="age" label="Age" rules="nullable|integer" />
```

```ts [Schema]
{
  age: {
    type: 'text',
    label: 'Age',
    rules: 'nullable|integer',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

::: warning
Combining `nullable` with [`required`](/rules/required) is a no-op. `nullable` causes validation to skip when the value is empty, so `required` will never fire.
:::

## Error Messages

`nullable` never fails validation, so it has no error message.

<!-- @rule:related start -->

## Related Rules

[filled](/rules/filled) · [required](/rules/required)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/nullable.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/nullable.ts)
