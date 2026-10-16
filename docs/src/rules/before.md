# before

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Date](/rules/#date)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.41 kB`<!-- /@size --> |

</div>

Validates that the date is before a given date or another element's date. Requires the [Date](/api/modules/date) module to be installed.

## Usage

::: usage validate

```vue [Preview]
<VfText name="birthday" label="Birthday" rules="before:today" />
```

```ts [Schema]
{
  birthday: {
    type: 'text',
    label: 'Birthday',
    rules: 'before:today',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `date` | A date string, the keywords `today`, `tomorrow`, `yesterday`, or another element's path — see [Element Reference Parameters](/guide/validation#element-reference-parameters). |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_before_error` | The {attribute} must be a date before {date}. |

<!-- @rule:related start -->

## Related Rules

[before_or_equal](/rules/before_or_equal) · [after](/rules/after) · [after_or_equal](/rules/after_or_equal)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/before.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/before.ts)
