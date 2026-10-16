```ts
/**
 * Maps every key of a classes definition so that functional class keys also
 * accept a plain `ClassValue`.
 */
type LooseClasses<T, TContext = any> = {
  [K in keyof T]?: ClassInput<T[K], TContext>
}
```
