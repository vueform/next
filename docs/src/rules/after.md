# after

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Date](/rules/#date)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.41 kB`<!-- /@size --> |

</div>

Validates that the date is after a given date or another element's date. Requires the [Date](/api/modules/date) module to be installed.

## Usage

::: usage validate

```vue [Preview]
<VfText name="start_date" label="Start date" rules="after:today" />
<VfText name="end_date" label="End date" rules="after:start_date" />
```

```ts [Schema]
{
  start_date: {
    type: 'text',
    label: 'Start date',
    rules: 'after:today',
  },
  end_date: {
    type: 'text',
    label: 'End date',
    rules: 'after:start_date',
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
| `rule_after_error` | The {attribute} must be a date after {date}. |

<!-- @rule:related start -->

## Related Rules

[after_or_equal](/rules/after_or_equal) · [before](/rules/before) · [before_or_equal](/rules/before_or_equal)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/after.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/after.ts)
