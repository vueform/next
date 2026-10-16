# email

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.29 kB`<!-- /@size --> |

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

<!-- @rule:related start -->

## Related Rules

[url](/rules/url) · [regex](/rules/regex)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/email.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/email.ts)
