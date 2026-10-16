# nullable

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Presence](/rules/#presence)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[filled](/rules/filled) · [required](/rules/required)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->176 B<!-- /@size --> |

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

## Source

[packages/core/src/rules/nullable.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/nullable.ts)
