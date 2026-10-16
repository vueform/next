# dimensions

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[File](/rules/#file)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[image](/rules/image) · [file](/rules/file)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->616 B<!-- /@size --> |

</div>

Validates that an image file matches the given dimension constraints, using [Named Parameters](/guide/validation#named-parameters). The rule is asynchronous — it loads the image to measure it.

## Usage

::: usage validate

```vue [Preview]
<VfFile name="avatar" label="Avatar" rules="image|dimensions:width=200,height=200" />
```

```ts [Schema]
{
  avatar: {
    type: 'file',
    label: 'Avatar',
    rules: 'image|dimensions:width=200,height=200',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `width` | The exact width in pixels. |
| `height` | The exact height in pixels. |
| `min_width` | The minimum width in pixels. |
| `min_height` | The minimum height in pixels. |
| `max_width` | The maximum width in pixels. |
| `max_height` | The maximum height in pixels. |
| `ratio` | The width/height ratio, as a fraction (`ratio=3/2`) or a number (`ratio=1.5`). |

<!-- @rule:params end -->

## Behavior

All parameters are optional and can be combined — the rule only checks the constraints you pass.

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_dimensions_error` | The {attribute} has invalid image dimensions. |

## Source

[packages/core/src/rules/dimensions.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/dimensions.ts)
