```ts
type StructuredCondition =
  | readonly [string, 'empty' | 'not_empty' | 'today']
  | {
      [K in keyof ConditionRelativeOperands]: readonly [
        string,
        K,
        ConditionRelativeOperands[K],
      ]
    }[keyof ConditionRelativeOperands]
```
