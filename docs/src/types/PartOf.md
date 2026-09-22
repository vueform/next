```ts
/**
 * Extracts a partial props type for a given component, used for individual part
 * prop overrides.
 */
type PartOf<T extends ComponentNames> = Partial<PropsOf<T>>
```
