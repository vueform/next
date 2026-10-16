# email

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[url](/rules/url) · [regex](/rules/regex)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->295 B<!-- /@size --> |

</div>

Validates that the value is a valid email address.

## Usage

::: usage validate

```vue [Preview]
<VfText name="email" label="Email" rules="email" />
```

```ts [Schema]
{
  email: {
    type: 'text',
    label: 'Email',
    rules: 'email',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_email_error` | The {attribute} must be a valid email address. |

## Source

[packages/core/src/rules/email.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/email.ts)
