# regex

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Pattern](/rules/#pattern)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.41 kB`<!-- /@size --> |

</div>

Validates that the value matches a regular expression.

## Usage

::: usage validate

```vue [Preview]
<VfText name="code" label="Code" rules="regex:/^[A-Z]{3}-\d{4}$/" />
```

```ts [Schema]
{
  code: {
    type: 'text',
    label: 'Code',
    rules: 'regex:/^[A-Z]{3}-\\d{4}$/',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `pattern` | The regular expression in `/pattern/flags` form. |

<!-- @rule:params end -->

## Behavior

A `pattern=` prefix is also supported and is optional:

```vue
<VfText name="code" rules="regex:pattern=/^[A-Z]{3}-\d{4}$/" />
```

The rule fails closed: when the pattern is missing or malformed, no value passes, and a warning is logged in development.

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_regex_error` | The {attribute} format is invalid. |

<!-- @rule:related start -->

## Related Rules

[not_regex](/rules/not_regex)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/regex.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/regex.ts)
