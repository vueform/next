```ts
/**
 * Prop type for replacing component slots with custom components, keyed by slot
 * name.
 */
type SlotsProp<T> = Partial<Record<keyof T, ComponentProp>> &
  Record<string, ComponentProp>
```
