```ts
type StructuredCondition =
  | [string, 'empty' | 'not_empty' | 'today']
  | {
      [K in keyof ConditionRelativeOperands]: [
        string,
        K,
        ConditionRelativeOperands[K],
      ]
    }[keyof ConditionRelativeOperands]
```
