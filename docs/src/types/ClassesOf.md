```ts
/**
 * Extracts the classes definition type for a given component.
 */
type ClassesOf<T extends ComponentNames> = ComponentRegistry[T]['classes']
```
