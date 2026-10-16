# in_array

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Cross-field](/rules/#cross-field)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[in](/rules/in) · [distinct](/rules/distinct)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->242 B<!-- /@size --> |

</div>

Validates that the value exists in another element's array value.

## Usage

::: usage validate

```vue [Preview]
<VfCheckboxes
  name="options"
  label="Options"
  :items="['Red', 'Green', 'Blue']"
/>
<VfText name="favorite" label="Favorite" rules="in_array:options" />
```

```ts [Schema]
{
  options: {
    type: 'checkboxes',
    label: 'Options',
    items: ['Red', 'Green', 'Blue'],
  },
  favorite: {
    type: 'text',
    label: 'Favorite',
    rules: 'in_array:options',
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

A trailing `.*` wildcard on the referenced path is accepted and stripped — `in_array:options.*` is equivalent to `in_array:options`.

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_in_array_error` | The {attribute} field does not exist in {other}. |

## Source

[packages/core/src/rules/in_array.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/in_array.ts)
