# date_format

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Date](/rules/#date)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.25 kB`<!-- /@size --> |

</div>

Validates that the value matches a given date format. Requires the [Date](/api/modules/date) module to be installed.

## Usage

::: usage validate

```vue [Preview]
<VfText name="start_date" label="Start date" rules="date_format:YYYY-MM-DD" />
```

```ts [Schema]
{
  start_date: {
    type: 'text',
    label: 'Start date',
    rules: 'date_format:YYYY-MM-DD',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `format` | The date format the value must match. |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_date_format_error` | The {attribute} does not match the format {format}. |

<!-- @rule:related start -->

## Related Rules

[date](/rules/date) · [date_equals](/rules/date_equals)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/date_format.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/date_format.ts)
