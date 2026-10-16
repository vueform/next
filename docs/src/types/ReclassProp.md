```ts
/**
 * Prop type for replacing a component's classes entirely, with the same shape
 * as `ClassesProp`. Functional class keys also accept a plain `ClassValue`.
 */
type ReclassProp<T, TContext = any> = LooseClasses<T, TContext> &
  Record<string, ClassValue>
```
