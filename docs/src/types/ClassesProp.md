```ts
/**
 * Prop type for overriding a component's classes, accepting partial class
 * definitions plus arbitrary keys. Functional class keys also accept a plain
 * `ClassValue`.
 */
type ClassesProp<T, TContext = any> = LooseClasses<T, TContext> &
  Record<string, ClassValue | ((...args: any[]) => ClassValue)>
```
