# ip

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[String Format](/rules/#string-format)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[ipv4](/rules/ipv4) · [ipv6](/rules/ipv6)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->467 B<!-- /@size --> |

</div>

Validates that the value is a valid IPv4 or IPv6 address.

## Usage

::: usage validate

```vue [Preview]
<VfText name="server" label="Server address" rules="ip" />
```

```ts [Schema]
{
  server: {
    type: 'text',
    label: 'Server address',
    rules: 'ip',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_ip_error` | The {attribute} must be a valid IP address. |

## Source

[packages/core/src/rules/ip.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/ip.ts)
