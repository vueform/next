# mimetypes

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[File](/rules/#file)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.26 kB`<!-- /@size --> |

</div>

Validates that the file's MIME type is one of the listed types.

## Usage

::: usage validate

```vue [Preview]
<VfFile name="document" label="Document" rules="mimetypes:application/pdf,image/jpeg" />
```

```ts [Schema]
{
  document: {
    type: 'file',
    label: 'Document',
    rules: 'mimetypes:application/pdf,image/jpeg',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `...types` | The allowed MIME types, as a comma-separated list. |

<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_mimetypes_error` | The {attribute} must be a file of type: {values}. |

<!-- @rule:related start -->

## Related Rules

[mimes](/rules/mimes) · [file](/rules/file) · [image](/rules/image)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/mimetypes.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/mimetypes.ts)
