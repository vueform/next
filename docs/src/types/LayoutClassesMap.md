```ts
/**
 * The shared element class map the element layout installs (`root`, `label`,
 * `errors`, …). Functional class keys also accept a plain `ClassValue`.
 */
type LayoutClassesMap = LooseClasses<ElementRegistry[ElementNames]['classes']> &
  Record<string, any>
```
