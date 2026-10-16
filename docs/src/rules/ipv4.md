# ipv4

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.25 kB`<!-- /@size --> |

</div>

Validates that the value is a valid IPv4 address.

## Usage

::: usage validate

```vue [Preview]
<VfText name="server" label="Server address" rules="ipv4" />
```

```ts [Schema]
{
  server: {
    type: 'text',
    label: 'Server address',
    rules: 'ipv4',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_ipv4_error` | The {attribute} must be a valid IPv4 address. |

<!-- @rule:related start -->

## Related Rules

[ip](/rules/ip) · [ipv6](/rules/ipv6)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/ipv4.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/ipv4.ts)
