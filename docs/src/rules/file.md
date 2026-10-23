# file

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[File](/rules/#file)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[image](/rules/image) · [mimes](/rules/mimes) · [mimetypes](/rules/mimetypes)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->232 B<!-- /@size --> |

</div>

Validates that the value is a file.

## Usage

::: usage validate

```vue [Preview]
<VfFile name="attachment" label="Attachment" rules="file" />
```

```ts [Schema]
{
  attachment: {
    type: 'file',
    label: 'Attachment',
    rules: 'file',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_file_error` | The {attribute} must be a file. |

## Source

[packages/core/src/rules/file.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/file.ts)
