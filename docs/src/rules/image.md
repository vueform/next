# image

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[File](/rules/#file)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[file](/rules/file) · [dimensions](/rules/dimensions) · [mimes](/rules/mimes)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->292 B<!-- /@size --> |

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

## Source

[packages/core/src/rules/image.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/image.ts)
