# required

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Presence](/rules/#presence)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.18 kB`<!-- /@size --> |

</div>

Validates that the element has a non-empty value. What counts as empty depends on the element type — an empty string, `null`, or an empty array all fail the rule.

## Usage

::: usage validate

```vue [Preview]
<VfText name="username" label="Username" rules="required" />
```

```ts [Schema]
{
  username: {
    type: 'text',
    label: 'Username',
    rules: 'required',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_required_error` | The {attribute} field is required. |

<!-- @rule:related start -->

## Related Rules

[filled](/rules/filled) · [nullable](/rules/nullable) · [accepted](/rules/accepted)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/required.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/required.ts)
