# date_equals

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Date](/rules/#date)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.19 kB`<!-- /@size --> |

</div>

Validates that the value equals the given date. The comparison is a strict string match against the parameter.

## Usage

::: usage validate

```vue [Preview]
<VfText name="start_date" label="Start date" rules="date_equals:2026-12-31" />
```

```ts [Schema]
{
  start_date: {
    type: 'text',
    label: 'Start date',
    rules: 'date_equals:2026-12-31',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `date` | The date string the value must equal. |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_date_equals_error` | The {attribute} must be equal to {date}. |

<!-- @rule:related start -->

## Related Rules

[date_format](/rules/date_format) · [after](/rules/after) · [before](/rules/before)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/date_equals.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/date_equals.ts)
