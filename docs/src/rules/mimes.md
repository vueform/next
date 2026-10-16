# mimes

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[File](/rules/#file)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[mimetypes](/rules/mimetypes) · [file](/rules/file) · [image](/rules/image)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->274 B<!-- /@size --> |

</div>

Validates that the file's extension is one of the listed types.

## Usage

::: usage validate

```vue [Preview]
<VfFile name="document" label="Document" rules="mimes:pdf,docx" />
```

```ts [Schema]
{
  document: {
    type: 'file',
    label: 'Document',
    rules: 'mimes:pdf,docx',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `...extensions` | The allowed extensions, as a comma-separated list. |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_mimes_error` | The {attribute} must be a file of type: {values}. |

## Source

[packages/core/src/rules/mimes.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/mimes.ts)
