# same

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Cross-field](/rules/#cross-field)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[different](/rules/different) · [confirmed](/rules/confirmed)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->247 B<!-- /@size --> |

</div>

Validates that the value is the same as another element's value.

## Usage

::: usage validate

```vue [Preview]
<VfText name="email" label="Email" rules="email" />
<VfText name="email_repeat" label="Repeat email" rules="same:email" />
```

```ts [Schema]
{
  email: {
    type: 'text',
    label: 'Email',
    rules: 'email',
  },
  email_repeat: {
    type: 'text',
    label: 'Repeat email',
    rules: 'same:email',
  },
}
```

:::

<!-- @rule:params start -->

## Parameters

| Parameter | Description |
| --- | --- |
| `other` | The path of the element to compare against — see [Element Reference Parameters](/guide/validation#element-reference-parameters). |

<!-- @rule:params end -->

## Behavior

While the referenced element is empty and not yet validated, the rule passes — the comparison only kicks in once the other element has been validated or the form is submitted.

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_same_error` | The {attribute} and {other} must match. |

## Source

[packages/core/src/rules/same.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/same.ts)
