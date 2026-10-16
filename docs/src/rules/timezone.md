# timezone

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[in](/rules/in)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->216 B<!-- /@size --> |

</div>

Validates that the value is a valid IANA timezone identifier (e.g. `America/New_York`), checked against the runtime's `Intl` API.

## Usage

::: usage validate

```vue [Preview]
<VfText name="timezone" label="Timezone" rules="timezone" />
```

```ts [Schema]
{
  timezone: {
    type: 'text',
    label: 'Timezone',
    rules: 'timezone',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_timezone_error` | The {attribute} must be a valid zone. |

## Source

[packages/core/src/rules/timezone.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/timezone.ts)
