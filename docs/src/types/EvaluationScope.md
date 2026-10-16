```ts
type EvaluationScope = {
  model: MaybeRef<Record<string, any> | undefined>
  context$: any
  form$?: FormContext
  path?: string
  valueFormat?: string
  warnMissingForm: () => void
}
```
