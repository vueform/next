# boolean

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Type](/rules/#type)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.19 kB`<!-- /@size --> |

</div>

Validates that the value is boolean-like: `true`, `false`, `0`, `1`, `'0'`, or `'1'`.

## Usage

::: usage validate

```vue [Preview]
<VfCheckbox name="subscribed" text="Subscribed" rules="boolean" />
```

```ts [Schema]
{
  subscribed: {
    type: 'checkbox',
    text: 'Subscribed',
    rules: 'boolean',
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_boolean_error` | The {attribute} field must be true or false. |

<!-- @rule:related start -->

## Related Rules

[accepted](/rules/accepted)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/boolean.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/boolean.ts)
