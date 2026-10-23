# date

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Type](/rules/#type)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[date_format](/rules/date_format) · [after](/rules/after) · [before](/rules/before)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->232 B<!-- /@size --> |

</div>

Validates that the value is a valid date, parsed with the configured date adapter. Requires the [Date](/api/modules/date) module to be installed.

## Usage

::: usage validate

```vue [Preview]
<VfText name="birthday" label="Birthday" rules="date" />
```

```ts [Schema]
{
  birthday: {
    type: 'text',
    label: 'Birthday',
    rules: 'date',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_date_error` | The {attribute} is not a valid date. |

## Source

[packages/core/src/rules/date.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/date.ts)
