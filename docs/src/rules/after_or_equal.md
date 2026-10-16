# after_or_equal

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Date](/rules/#date)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[after](/rules/after) · [before](/rules/before) · [before_or_equal](/rules/before_or_equal)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->430 B<!-- /@size --> |

</div>

Validates that the date is after or equal to a given date or another element's date. Requires the [Date](/api/modules/date) module to be installed.

## Usage

::: usage validate

```vue [Preview]
<VfText name="start_date" label="Start date" rules="after_or_equal:today" />
```

```ts [Schema]
{
  start_date: {
    type: 'text',
    label: 'Start date',
    rules: 'after_or_equal:today',
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
| `rule_after_or_equal_error` | The {attribute} must be a date after or equal to {date}. |

## Source

[packages/core/src/rules/after_or_equal.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/after_or_equal.ts)
