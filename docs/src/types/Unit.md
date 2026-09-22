```ts
type Unit = {
  id: string
  // `'field'` runs against the owner's value; `'model'` against the whole form
  kind: 'field' | 'model'
  owner: ValidationOwner
  language: string
  name: string
  check: RuleChecker<any>
  options?: RuleOptions
  attributes: RuleAttribute[]
  debounce: number
  deps: string[]
  conditions?: ConditionalProp
  schema?: StandardSchemaV1
}
```
