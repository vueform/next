# accepted

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Presence](/rules/#presence)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.20 kB`<!-- /@size --> |

</div>

Validates that the value is accepted: `'yes'`, `'on'`, `'1'`, `1`, `true`, or `'true'`. Typically used for checkboxes that must be checked, like accepting terms.

## Usage

::: usage validate

```vue [Preview]
<VfCheckbox name="terms" text="I accept the terms" rules="accepted" />
```

```ts [Schema]
{
  terms: {
    type: 'checkbox',
    text: 'I accept the terms',
    rules: 'accepted',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_accepted_error` | The {attribute} must be accepted. |

<!-- @rule:related start -->

## Related Rules

[required](/rules/required) · [boolean](/rules/boolean) · [in](/rules/in)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/accepted.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/accepted.ts)
