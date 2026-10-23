# filled

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Presence](/rules/#presence)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[required](/rules/required) · [nullable](/rules/nullable)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->182 B<!-- /@size --> |

</div>

Validates that the value is not empty when the element is present.

## Usage

::: usage validate

```vue [Preview]
<VfText name="nickname" label="Nickname" rules="filled" />
```

```ts [Schema]
{
  nickname: {
    type: 'text',
    label: 'Nickname',
    rules: 'filled',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_filled_error` | The {attribute} field must have a value. |

## Source

[packages/core/src/rules/filled.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/filled.ts)
