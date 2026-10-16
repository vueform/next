# distinct

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Array](/rules/#array)<!-- /@rule:category --> |
| **Bundle size** | <!-- @size:rule -->`0.21 kB`<!-- /@size --> |

</div>

Validates that all items in the array are unique. Items are compared by value, so objects with equal contents count as duplicates.

## Usage

::: usage validate

```vue [Preview]
<VfList name="emails" label="Emails" rules="distinct">
  <template #default="{ index }">
    <VfText :name="index" placeholder="email@example.com" />
  </template>
</VfList>
```

```ts [Schema]
{
  emails: {
    type: 'list',
    label: 'Emails',
    rules: 'distinct',
    flat: true,
    schema: {
      email: {
        type: 'text',
        placeholder: 'email@example.com',
      },
    },
  },
}
```

:::

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_distinct_error` | The {attribute} field has a duplicate value. |

<!-- @rule:related start -->

## Related Rules

[array](/rules/array) · [in_array](/rules/in_array)

<!-- @rule:related end -->

## Source

[packages/core/src/rules/distinct.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/distinct.ts)
