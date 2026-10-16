# not_regex

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Pattern](/rules/#pattern)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.44 kB`<!-- /@size --> |

</div>

Validates that the value does not match a regular expression.

## Usage

::: usage validate

```vue [Preview]
<VfText name="username" label="Username" rules="not_regex:/\s/" />
```

```ts [Schema]
{
  username: {
    type: 'text',
    label: 'Username',
    rules: 'not_regex:/\\s/',
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

A `pattern=` prefix is also supported and is optional. The rule fails closed: when the pattern is missing or malformed, no value passes, and a warning is logged in development.

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_not_regex_error` | The {attribute} format is invalid. |

<!-- @rule:related start -->

## Related Rules

[regex](/rules/regex)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/not_regex.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/not_regex.ts)
