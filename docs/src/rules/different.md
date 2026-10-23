# different

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | <!-- @rule:category -->[Cross-field](/rules/#cross-field)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->[same](/rules/same)<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->253 B<!-- /@size --> |

</div>

Validates that the value is different from another element's value.

## Usage

::: usage validate

```vue [Preview]
<VfText name="username" label="Username" />
<VfText name="display_name" label="Display name" rules="different:username" />
```

```ts [Schema]
{
  username: {
    type: 'text',
    label: 'Username',
  },
  display_name: {
    type: 'text',
    label: 'Display name',
    rules: 'different:username',
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
| `rule_different_error` | The {attribute} and {other} must be different. |

## Source

[packages/core/src/rules/different.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/different.ts)
