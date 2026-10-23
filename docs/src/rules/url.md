# url

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[email](/rules/email) · [ip](/rules/ip)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->460 B<!-- /@size --> |

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

## Source

[packages/core/src/rules/url.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/url.ts)
