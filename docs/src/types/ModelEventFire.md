```ts
type ModelEventFire = {
  (e: 'change', newValue: any, oldValue: any, context$: any): any
  (e: 'update:modelValue', value: any): any
}
```
