```ts
interface ConditionRelativeOperands {
  '>': string | number
  '>=': string | number
  '<': string | number
  '<=': string | number
  '==':
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean | undefined | null>
  '!=':
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean | undefined | null>
  between: [string | number, string | number]
  in: Array<string | number>
  not_in: Array<string | number>
  before: 'today' | string
  after: 'today' | string
  '^': string | number
  $: string | number
  '*': string | number
}
```
