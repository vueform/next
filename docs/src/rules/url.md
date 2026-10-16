# url

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.45 kB`<!-- /@size --> |

</div>

Validates that the value is a valid URL (http, https, or ftp).

## Usage

::: usage validate

```vue [Preview]
<VfText name="website" label="Website" rules="url" />
```

```ts [Schema]
{
  website: {
    type: 'text',
    label: 'Website',
    rules: 'url',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_url_error` | The {attribute} format is invalid. |

<!-- @rule:related start -->

## Related Rules

[email](/rules/email) · [ip](/rules/ip)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/url.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/url.ts)
