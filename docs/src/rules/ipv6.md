# ipv6

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[ip](/rules/ip) · [ipv4](/rules/ipv4)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->405 B<!-- /@size --> |

</div>

Validates that the value is a valid IPv6 address.

## Usage

::: usage validate

```vue [Preview]
<VfText name="server" label="Server address" rules="ipv6" />
```

```ts [Schema]
{
  server: {
    type: 'text',
    label: 'Server address',
    rules: 'ipv6',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_ipv6_error` | The {attribute} must be a valid IPv6 address. |

## Source

[packages/core/src/rules/ipv6.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/ipv6.ts)
