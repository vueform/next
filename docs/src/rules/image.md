# image

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[File](/rules/#file)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.29 kB`<!-- /@size --> |

</div>

Validates that the file is an image: `jpg`, `jpeg`, `png`, `gif`, `bmp`, `svg`, or `webp`.

## Usage

::: usage validate

```vue [Preview]
<VfFile name="avatar" label="Avatar" rules="image" />
```

```ts [Schema]
{
  avatar: {
    type: 'file',
    label: 'Avatar',
    rules: 'image',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_image_error` | The {attribute} must be an image. |

<!-- @rule:related start -->

## Related Rules

[file](/rules/file) · [dimensions](/rules/dimensions) · [mimes](/rules/mimes)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/image.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/image.ts)
