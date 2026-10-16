# string

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Type](/rules/#type)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[numeric](/rules/numeric) · [alpha](/rules/alpha)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->175 B<!-- /@size --> |

</div>

Validates that the value is a string.

## Usage

::: usage validate

```vue [Preview]
<VfText name="comment" label="Comment" rules="string" />
```

```ts [Schema]
{
  comment: {
    type: 'text',
    label: 'Comment',
    rules: 'string',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_string_error` | The {attribute} must be a string. |

## Source

[packages/core/src/rules/string.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/string.ts)
